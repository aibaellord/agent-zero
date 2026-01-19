/**
 * BAEL Gesture - Touch Gesture Recognition System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete gesture system:
 * - Swipe detection
 * - Pinch/Zoom
 * - Rotate
 * - Long press
 * - Pan/Drag
 */

(function () {
  "use strict";

  class BaelGesture {
    constructor() {
      this.activeGestures = new Map();
      console.log("👆 Bael Gesture initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // GESTURE RECOGNIZER
    // ═══════════════════════════════════════════════════════════

    recognize(element, callbacks, options = {}) {
      const el = this._getElement(element);
      const state = this._createState(options);

      const handlers = {
        touchstart: (e) => this._handleTouchStart(e, state, callbacks, options),
        touchmove: (e) => this._handleTouchMove(e, state, callbacks, options),
        touchend: (e) => this._handleTouchEnd(e, state, callbacks, options),
        touchcancel: (e) => this._handleTouchEnd(e, state, callbacks, options),
      };

      el.addEventListener("touchstart", handlers.touchstart, {
        passive: !options.preventDefault,
      });
      el.addEventListener("touchmove", handlers.touchmove, {
        passive: !options.preventDefault,
      });
      el.addEventListener("touchend", handlers.touchend);
      el.addEventListener("touchcancel", handlers.touchcancel);

      this.activeGestures.set(el, { handlers, state });

      return () => this.destroy(el);
    }

    _createState(options) {
      return {
        startTime: 0,
        startTouches: [],
        lastTouches: [],
        currentTouches: [],
        velocityX: 0,
        velocityY: 0,
        deltaX: 0,
        deltaY: 0,
        scale: 1,
        rotation: 0,
        initialDistance: 0,
        initialAngle: 0,
        isLongPress: false,
        longPressTimer: null,
        isTapping: true,
      };
    }

    _handleTouchStart(e, state, callbacks, options) {
      if (options.preventDefault) e.preventDefault();

      const touches = this._normalizeTouches(e);

      state.startTime = Date.now();
      state.startTouches = touches;
      state.lastTouches = touches;
      state.currentTouches = touches;
      state.deltaX = 0;
      state.deltaY = 0;
      state.velocityX = 0;
      state.velocityY = 0;
      state.isTapping = true;

      // Long press detection
      if (callbacks.onLongPress) {
        state.longPressTimer = setTimeout(() => {
          state.isLongPress = true;
          callbacks.onLongPress({
            x: touches[0].x,
            y: touches[0].y,
            target: e.target,
          });
        }, options.longPressDelay || 500);
      }

      // Multi-touch initialization
      if (touches.length === 2) {
        state.initialDistance = this._getDistance(touches[0], touches[1]);
        state.initialAngle = this._getAngle(touches[0], touches[1]);
        state.scale = 1;
        state.rotation = 0;
      }

      if (callbacks.onStart) {
        callbacks.onStart({
          touches,
          x: touches[0].x,
          y: touches[0].y,
          count: touches.length,
          target: e.target,
        });
      }
    }

    _handleTouchMove(e, state, callbacks, options) {
      if (options.preventDefault) e.preventDefault();

      const touches = this._normalizeTouches(e);
      const now = Date.now();
      const dt = now - state.startTime || 1;

      // Cancel long press on move
      if (state.longPressTimer) {
        const dx = Math.abs(touches[0].x - state.startTouches[0].x);
        const dy = Math.abs(touches[0].y - state.startTouches[0].y);

        if (dx > 10 || dy > 10) {
          clearTimeout(state.longPressTimer);
          state.longPressTimer = null;
          state.isTapping = false;
        }
      }

      // Calculate deltas
      state.deltaX = touches[0].x - state.startTouches[0].x;
      state.deltaY = touches[0].y - state.startTouches[0].y;

      // Calculate velocity
      const lastTouch = state.lastTouches[0];
      state.velocityX = ((touches[0].x - lastTouch.x) / dt) * 1000;
      state.velocityY = ((touches[0].y - lastTouch.y) / dt) * 1000;

      // Pan gesture
      if (callbacks.onPan && touches.length === 1) {
        callbacks.onPan({
          deltaX: state.deltaX,
          deltaY: state.deltaY,
          velocityX: state.velocityX,
          velocityY: state.velocityY,
          x: touches[0].x,
          y: touches[0].y,
          target: e.target,
        });
      }

      // Pinch/Zoom gesture
      if (touches.length === 2) {
        const currentDistance = this._getDistance(touches[0], touches[1]);
        const currentAngle = this._getAngle(touches[0], touches[1]);

        state.scale = currentDistance / state.initialDistance;
        state.rotation = currentAngle - state.initialAngle;

        if (callbacks.onPinch) {
          callbacks.onPinch({
            scale: state.scale,
            center: this._getCenter(touches[0], touches[1]),
            target: e.target,
          });
        }

        if (callbacks.onRotate) {
          callbacks.onRotate({
            rotation: state.rotation,
            center: this._getCenter(touches[0], touches[1]),
            target: e.target,
          });
        }
      }

      state.lastTouches = touches;
      state.currentTouches = touches;
    }

    _handleTouchEnd(e, state, callbacks, options) {
      const now = Date.now();
      const duration = now - state.startTime;
      const touches = state.currentTouches;

      // Clear long press timer
      if (state.longPressTimer) {
        clearTimeout(state.longPressTimer);
        state.longPressTimer = null;
      }

      // Tap detection
      if (state.isTapping && duration < (options.tapTimeout || 300)) {
        const dx = Math.abs(state.deltaX);
        const dy = Math.abs(state.deltaY);

        if (dx < 10 && dy < 10) {
          if (callbacks.onTap) {
            callbacks.onTap({
              x: touches[0].x,
              y: touches[0].y,
              target: e.target,
            });
          }
        }
      }

      // Swipe detection
      const velocity = Math.sqrt(
        state.velocityX * state.velocityX + state.velocityY * state.velocityY,
      );

      const distance = Math.sqrt(
        state.deltaX * state.deltaX + state.deltaY * state.deltaY,
      );

      const minDistance = options.swipeThreshold || 50;
      const minVelocity = options.swipeVelocity || 300;

      if (distance > minDistance || velocity > minVelocity) {
        const direction = this._getSwipeDirection(state.deltaX, state.deltaY);

        if (callbacks.onSwipe) {
          callbacks.onSwipe({
            direction,
            deltaX: state.deltaX,
            deltaY: state.deltaY,
            velocityX: state.velocityX,
            velocityY: state.velocityY,
            distance,
            velocity,
            duration,
            target: e.target,
          });
        }

        // Directional callbacks
        const directionCallback =
          callbacks[
            `onSwipe${direction.charAt(0).toUpperCase() + direction.slice(1)}`
          ];
        if (directionCallback) {
          directionCallback({
            deltaX: state.deltaX,
            deltaY: state.deltaY,
            velocity,
            target: e.target,
          });
        }
      }

      // End callback
      if (callbacks.onEnd) {
        callbacks.onEnd({
          deltaX: state.deltaX,
          deltaY: state.deltaY,
          duration,
          target: e.target,
        });
      }
    }

    // ═══════════════════════════════════════════════════════════
    // SPECIFIC GESTURES
    // ═══════════════════════════════════════════════════════════

    onSwipe(element, callback, options = {}) {
      return this.recognize(
        element,
        {
          onSwipe: callback,
        },
        options,
      );
    }

    onSwipeLeft(element, callback, options = {}) {
      return this.recognize(
        element,
        {
          onSwipe: (e) => {
            if (e.direction === "left") callback(e);
          },
        },
        options,
      );
    }

    onSwipeRight(element, callback, options = {}) {
      return this.recognize(
        element,
        {
          onSwipe: (e) => {
            if (e.direction === "right") callback(e);
          },
        },
        options,
      );
    }

    onSwipeUp(element, callback, options = {}) {
      return this.recognize(
        element,
        {
          onSwipe: (e) => {
            if (e.direction === "up") callback(e);
          },
        },
        options,
      );
    }

    onSwipeDown(element, callback, options = {}) {
      return this.recognize(
        element,
        {
          onSwipe: (e) => {
            if (e.direction === "down") callback(e);
          },
        },
        options,
      );
    }

    onPinch(element, callback, options = {}) {
      return this.recognize(
        element,
        {
          onPinch: callback,
        },
        { ...options, preventDefault: true },
      );
    }

    onRotate(element, callback, options = {}) {
      return this.recognize(
        element,
        {
          onRotate: callback,
        },
        { ...options, preventDefault: true },
      );
    }

    onTap(element, callback, options = {}) {
      return this.recognize(
        element,
        {
          onTap: callback,
        },
        options,
      );
    }

    onDoubleTap(element, callback, options = {}) {
      const el = this._getElement(element);
      let lastTap = 0;
      const delay = options.delay || 300;

      const handler = (e) => {
        const touch = e.changedTouches?.[0] || e;
        const now = Date.now();

        if (now - lastTap < delay) {
          callback({
            x: touch.clientX,
            y: touch.clientY,
            target: e.target,
          });
          lastTap = 0;
        } else {
          lastTap = now;
        }
      };

      el.addEventListener("touchend", handler);
      el.addEventListener("click", handler);

      return () => {
        el.removeEventListener("touchend", handler);
        el.removeEventListener("click", handler);
      };
    }

    onLongPress(element, callback, options = {}) {
      return this.recognize(
        element,
        {
          onLongPress: callback,
        },
        options,
      );
    }

    onPan(element, callback, options = {}) {
      return this.recognize(
        element,
        {
          onPan: callback,
        },
        { ...options, preventDefault: true },
      );
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    _getElement(el) {
      return typeof el === "string" ? document.querySelector(el) : el;
    }

    _normalizeTouches(e) {
      return [...e.touches].map((t) => ({
        x: t.clientX,
        y: t.clientY,
        id: t.identifier,
      }));
    }

    _getDistance(p1, p2) {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      return Math.sqrt(dx * dx + dy * dy);
    }

    _getAngle(p1, p2) {
      return (Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180) / Math.PI;
    }

    _getCenter(p1, p2) {
      return {
        x: (p1.x + p2.x) / 2,
        y: (p1.y + p2.y) / 2,
      };
    }

    _getSwipeDirection(dx, dy) {
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx > absDy) {
        return dx > 0 ? "right" : "left";
      } else {
        return dy > 0 ? "down" : "up";
      }
    }

    destroy(element) {
      const el = this._getElement(element);
      const data = this.activeGestures.get(el);

      if (data) {
        el.removeEventListener("touchstart", data.handlers.touchstart);
        el.removeEventListener("touchmove", data.handlers.touchmove);
        el.removeEventListener("touchend", data.handlers.touchend);
        el.removeEventListener("touchcancel", data.handlers.touchcancel);

        if (data.state.longPressTimer) {
          clearTimeout(data.state.longPressTimer);
        }

        this.activeGestures.delete(el);
      }
    }

    destroyAll() {
      for (const el of this.activeGestures.keys()) {
        this.destroy(el);
      }
    }

    isTouchDevice() {
      return "ontouchstart" in window || navigator.maxTouchPoints > 0;
    }
  }

  // Initialize
  window.BaelGesture = new BaelGesture();

  // Global shortcuts
  window.$gesture = window.BaelGesture;
  window.$swipe = (el, cb, opts) => window.BaelGesture.onSwipe(el, cb, opts);
  window.$pinch = (el, cb, opts) => window.BaelGesture.onPinch(el, cb, opts);
  window.$longPress = (el, cb, opts) =>
    window.BaelGesture.onLongPress(el, cb, opts);

  console.log("👆 Bael Gesture ready");
})();
