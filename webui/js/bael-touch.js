/**
 * BAEL Touch Component - Lord Of All Gestures
 *
 * Touch gesture handling:
 * - Swipe detection
 * - Pinch to zoom
 * - Long press
 * - Double tap
 * - Drag/Pan
 * - Multi-touch
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // TOUCH CLASS
  // ============================================================

  class BaelTouch {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
    }

    // ============================================================
    // GESTURE DETECTION
    // ============================================================

    /**
     * Create gesture handler for element
     */
    create(element, options = {}) {
      if (typeof element === "string") {
        element = document.querySelector(element);
      }
      if (!element) return null;

      const id = `bael-touch-${++this.idCounter}`;

      const state = {
        id,
        element,
        startX: 0,
        startY: 0,
        startTime: 0,
        lastTap: 0,
        touchCount: 0,
        initialDistance: 0,
        initialAngle: 0,
        longPressTimer: null,
        handlers: new Map(),
        config: {
          swipeThreshold: options.swipeThreshold || 50,
          swipeTimeout: options.swipeTimeout || 300,
          longPressDelay: options.longPressDelay || 500,
          doubleTapDelay: options.doubleTapDelay || 300,
          preventScroll: options.preventScroll || false,
        },
      };

      this._bindEvents(state);
      this.instances.set(id, state);

      return {
        id,
        on: (event, handler) => this._addHandler(state, event, handler),
        off: (event) => this._removeHandler(state, event),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Bind touch events
     */
    _bindEvents(state) {
      const { element } = state;

      const touchStartHandler = (e) => this._handleTouchStart(state, e);
      const touchMoveHandler = (e) => this._handleTouchMove(state, e);
      const touchEndHandler = (e) => this._handleTouchEnd(state, e);

      element.addEventListener("touchstart", touchStartHandler, {
        passive: !state.config.preventScroll,
      });
      element.addEventListener("touchmove", touchMoveHandler, {
        passive: !state.config.preventScroll,
      });
      element.addEventListener("touchend", touchEndHandler);
      element.addEventListener("touchcancel", touchEndHandler);

      state._cleanup = () => {
        element.removeEventListener("touchstart", touchStartHandler);
        element.removeEventListener("touchmove", touchMoveHandler);
        element.removeEventListener("touchend", touchEndHandler);
        element.removeEventListener("touchcancel", touchEndHandler);
      };
    }

    /**
     * Add event handler
     */
    _addHandler(state, event, handler) {
      if (!state.handlers.has(event)) {
        state.handlers.set(event, new Set());
      }
      state.handlers.get(event).add(handler);
    }

    /**
     * Remove event handler
     */
    _removeHandler(state, event) {
      state.handlers.delete(event);
    }

    /**
     * Emit event
     */
    _emit(state, event, data) {
      const handlers = state.handlers.get(event);
      if (handlers) {
        handlers.forEach((handler) => handler(data));
      }
    }

    /**
     * Handle touch start
     */
    _handleTouchStart(state, e) {
      const touch = e.touches[0];

      state.startX = touch.clientX;
      state.startY = touch.clientY;
      state.startTime = Date.now();
      state.touchCount = e.touches.length;
      state.moved = false;

      // Long press detection
      state.longPressTimer = setTimeout(() => {
        if (!state.moved) {
          this._emit(state, "longpress", {
            x: state.startX,
            y: state.startY,
            element: state.element,
            originalEvent: e,
          });
        }
      }, state.config.longPressDelay);

      // Multi-touch (pinch) setup
      if (e.touches.length === 2) {
        state.initialDistance = this._getDistance(e.touches[0], e.touches[1]);
        state.initialAngle = this._getAngle(e.touches[0], e.touches[1]);
      }

      this._emit(state, "start", {
        x: touch.clientX,
        y: touch.clientY,
        touches: e.touches.length,
        originalEvent: e,
      });
    }

    /**
     * Handle touch move
     */
    _handleTouchMove(state, e) {
      if (state.config.preventScroll) {
        e.preventDefault();
      }

      const touch = e.touches[0];
      const deltaX = touch.clientX - state.startX;
      const deltaY = touch.clientY - state.startY;

      // Mark as moved to cancel long press
      if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
        state.moved = true;
        clearTimeout(state.longPressTimer);
      }

      // Emit move event
      this._emit(state, "move", {
        x: touch.clientX,
        y: touch.clientY,
        deltaX,
        deltaY,
        originalEvent: e,
      });

      // Pan/drag
      this._emit(state, "pan", {
        x: touch.clientX,
        y: touch.clientY,
        deltaX,
        deltaY,
        originalEvent: e,
      });

      // Pinch/zoom detection
      if (e.touches.length === 2) {
        const currentDistance = this._getDistance(e.touches[0], e.touches[1]);
        const currentAngle = this._getAngle(e.touches[0], e.touches[1]);
        const scale = currentDistance / state.initialDistance;
        const rotation = currentAngle - state.initialAngle;

        this._emit(state, "pinch", {
          scale,
          rotation,
          centerX: (e.touches[0].clientX + e.touches[1].clientX) / 2,
          centerY: (e.touches[0].clientY + e.touches[1].clientY) / 2,
          originalEvent: e,
        });
      }
    }

    /**
     * Handle touch end
     */
    _handleTouchEnd(state, e) {
      clearTimeout(state.longPressTimer);

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - state.startX;
      const deltaY = touch.clientY - state.startY;
      const deltaTime = Date.now() - state.startTime;

      // Emit end event
      this._emit(state, "end", {
        x: touch.clientX,
        y: touch.clientY,
        deltaX,
        deltaY,
        deltaTime,
        originalEvent: e,
      });

      // Swipe detection
      if (deltaTime < state.config.swipeTimeout) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        if (
          absX > state.config.swipeThreshold ||
          absY > state.config.swipeThreshold
        ) {
          let direction;

          if (absX > absY) {
            direction = deltaX > 0 ? "right" : "left";
          } else {
            direction = deltaY > 0 ? "down" : "up";
          }

          this._emit(state, "swipe", {
            direction,
            deltaX,
            deltaY,
            velocity: Math.max(absX, absY) / deltaTime,
            originalEvent: e,
          });

          this._emit(state, `swipe${direction}`, {
            delta:
              direction === "left" || direction === "right" ? deltaX : deltaY,
            velocity: Math.max(absX, absY) / deltaTime,
            originalEvent: e,
          });
        }
      }

      // Tap detection
      if (!state.moved && deltaTime < 200) {
        const now = Date.now();

        // Double tap
        if (now - state.lastTap < state.config.doubleTapDelay) {
          this._emit(state, "doubletap", {
            x: touch.clientX,
            y: touch.clientY,
            originalEvent: e,
          });
          state.lastTap = 0;
        } else {
          // Single tap (with delay to check for double tap)
          state.lastTap = now;

          setTimeout(() => {
            if (state.lastTap === now) {
              this._emit(state, "tap", {
                x: touch.clientX,
                y: touch.clientY,
                originalEvent: e,
              });
            }
          }, state.config.doubleTapDelay);
        }
      }
    }

    /**
     * Get distance between two touch points
     */
    _getDistance(touch1, touch2) {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Get angle between two touch points
     */
    _getAngle(touch1, touch2) {
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      return (Math.atan2(dy, dx) * 180) / Math.PI;
    }

    // ============================================================
    // SWIPE HELPER
    // ============================================================

    /**
     * Simple swipe detection
     */
    onSwipe(element, callback, options = {}) {
      const handler = this.create(element, options);
      handler.on("swipe", callback);
      return handler;
    }

    /**
     * Left swipe
     */
    onSwipeLeft(element, callback, options = {}) {
      const handler = this.create(element, options);
      handler.on("swipeleft", callback);
      return handler;
    }

    /**
     * Right swipe
     */
    onSwipeRight(element, callback, options = {}) {
      const handler = this.create(element, options);
      handler.on("swiperight", callback);
      return handler;
    }

    /**
     * Up swipe
     */
    onSwipeUp(element, callback, options = {}) {
      const handler = this.create(element, options);
      handler.on("swipeup", callback);
      return handler;
    }

    /**
     * Down swipe
     */
    onSwipeDown(element, callback, options = {}) {
      const handler = this.create(element, options);
      handler.on("swipedown", callback);
      return handler;
    }

    // ============================================================
    // TAP HELPERS
    // ============================================================

    /**
     * Tap detection
     */
    onTap(element, callback, options = {}) {
      const handler = this.create(element, options);
      handler.on("tap", callback);
      return handler;
    }

    /**
     * Double tap
     */
    onDoubleTap(element, callback, options = {}) {
      const handler = this.create(element, options);
      handler.on("doubletap", callback);
      return handler;
    }

    /**
     * Long press
     */
    onLongPress(element, callback, options = {}) {
      const handler = this.create(element, options);
      handler.on("longpress", callback);
      return handler;
    }

    // ============================================================
    // PINCH HELPERS
    // ============================================================

    /**
     * Pinch to zoom
     */
    onPinch(element, callback, options = {}) {
      const handler = this.create(element, { ...options, preventScroll: true });
      handler.on("pinch", callback);
      return handler;
    }

    // ============================================================
    // PAN HELPERS
    // ============================================================

    /**
     * Pan/drag
     */
    onPan(element, callback, options = {}) {
      const handler = this.create(element, options);
      handler.on("pan", callback);
      return handler;
    }

    /**
     * Create draggable element
     */
    makeDraggable(element, options = {}) {
      if (typeof element === "string") {
        element = document.querySelector(element);
      }
      if (!element) return null;

      const config = {
        bounds: options.bounds || null, // 'parent', element, or {top,left,right,bottom}
        axis: options.axis || "both", // 'x', 'y', 'both'
        onStart: options.onStart,
        onDrag: options.onDrag,
        onEnd: options.onEnd,
      };

      let offsetX = 0,
        offsetY = 0;
      let startLeft = 0,
        startTop = 0;

      const handler = this.create(element, { preventScroll: true });

      handler.on("start", (e) => {
        const rect = element.getBoundingClientRect();
        offsetX = e.x - rect.left;
        offsetY = e.y - rect.top;
        startLeft = rect.left;
        startTop = rect.top;

        element.style.position = "fixed";
        element.style.zIndex = "10000";
        element.style.cursor = "grabbing";

        if (config.onStart) {
          config.onStart({ x: e.x, y: e.y, element });
        }
      });

      handler.on("pan", (e) => {
        let newX = e.x - offsetX;
        let newY = e.y - offsetY;

        // Apply axis constraints
        if (config.axis === "x") {
          newY = startTop;
        } else if (config.axis === "y") {
          newX = startLeft;
        }

        // Apply bounds
        if (config.bounds) {
          const bounds = this._getBounds(element, config.bounds);
          newX = Math.max(
            bounds.left,
            Math.min(newX, bounds.right - element.offsetWidth),
          );
          newY = Math.max(
            bounds.top,
            Math.min(newY, bounds.bottom - element.offsetHeight),
          );
        }

        element.style.left = newX + "px";
        element.style.top = newY + "px";

        if (config.onDrag) {
          config.onDrag({ x: newX, y: newY, element });
        }
      });

      handler.on("end", (e) => {
        element.style.cursor = "grab";

        if (config.onEnd) {
          config.onEnd({
            x: parseInt(element.style.left),
            y: parseInt(element.style.top),
            element,
          });
        }
      });

      element.style.cursor = "grab";
      element.style.touchAction = "none";

      return handler;
    }

    /**
     * Get bounds rectangle
     */
    _getBounds(element, bounds) {
      if (bounds === "parent") {
        const parent = element.parentElement.getBoundingClientRect();
        return parent;
      } else if (bounds instanceof HTMLElement) {
        return bounds.getBoundingClientRect();
      } else if (typeof bounds === "object") {
        return bounds;
      }
      return {
        top: 0,
        left: 0,
        right: window.innerWidth,
        bottom: window.innerHeight,
      };
    }

    // ============================================================
    // DESTROY
    // ============================================================

    /**
     * Destroy instance
     */
    destroy(id) {
      const state = this.instances.get(id);
      if (state) {
        if (state._cleanup) {
          state._cleanup();
        }
        this.instances.delete(id);
      }
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelTouch();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$touch = (el, opts) => bael.create(el, opts);
  window.$swipe = (el, cb, opts) => bael.onSwipe(el, cb, opts);
  window.$swipeLeft = (el, cb, opts) => bael.onSwipeLeft(el, cb, opts);
  window.$swipeRight = (el, cb, opts) => bael.onSwipeRight(el, cb, opts);
  window.$tap = (el, cb, opts) => bael.onTap(el, cb, opts);
  window.$doubleTap = (el, cb, opts) => bael.onDoubleTap(el, cb, opts);
  window.$longPress = (el, cb, opts) => bael.onLongPress(el, cb, opts);
  window.$pinch = (el, cb, opts) => bael.onPinch(el, cb, opts);
  window.$pan = (el, cb, opts) => bael.onPan(el, cb, opts);
  window.$draggable = (el, opts) => bael.makeDraggable(el, opts);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelTouch = bael;

  console.log("👆 BAEL Touch loaded");
})();
