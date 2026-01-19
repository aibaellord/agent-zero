/**
 * BAEL Resize - Resize Observer System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete resize system:
 * - Element resize detection
 * - Container queries
 * - Responsive utilities
 * - Aspect ratio handling
 * - Breakpoint management
 */

(function () {
  "use strict";

  class BaelResize {
    constructor() {
      this.observers = new Map();
      this.callbacks = new WeakMap();
      this.breakpoints = new Map([
        ["xs", 0],
        ["sm", 640],
        ["md", 768],
        ["lg", 1024],
        ["xl", 1280],
        ["2xl", 1536],
      ]);
      this.currentBreakpoint = null;
      this.breakpointCallbacks = new Set();

      this._initBreakpointWatcher();
      console.log("📐 Bael Resize initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // BASIC OBSERVATION
    // ═══════════════════════════════════════════════════════════

    observe(element, callback, options = {}) {
      const el = this._getElement(element);

      if (!el) {
        console.warn("Element not found:", element);
        return () => {};
      }

      let observer = this.observers.get("main");

      if (!observer) {
        observer = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const cb = this.callbacks.get(entry.target);
            if (cb) {
              cb(this._parseEntry(entry), entry);
            }
          }
        });
        this.observers.set("main", observer);
      }

      this.callbacks.set(el, callback);
      observer.observe(el, options);

      // Initial callback with current size
      if (options.immediate !== false) {
        const rect = el.getBoundingClientRect();
        callback({
          width: rect.width,
          height: rect.height,
          inlineSize: rect.width,
          blockSize: rect.height,
        });
      }

      return () => this.unobserve(el);
    }

    unobserve(element) {
      const el = this._getElement(element);
      const observer = this.observers.get("main");

      if (observer && el) {
        observer.unobserve(el);
        this.callbacks.delete(el);
      }
    }

    _parseEntry(entry) {
      const borderBox = entry.borderBoxSize?.[0] || entry.borderBoxSize;
      const contentBox = entry.contentBoxSize?.[0] || entry.contentBoxSize;

      return {
        width: entry.contentRect.width,
        height: entry.contentRect.height,
        inlineSize: contentBox?.inlineSize || entry.contentRect.width,
        blockSize: contentBox?.blockSize || entry.contentRect.height,
        borderInlineSize: borderBox?.inlineSize,
        borderBlockSize: borderBox?.blockSize,
      };
    }

    // ═══════════════════════════════════════════════════════════
    // SIZE TRACKING
    // ═══════════════════════════════════════════════════════════

    trackSize(element, options = {}) {
      const el = this._getElement(element);

      const state = {
        width: 0,
        height: 0,
        previousWidth: 0,
        previousHeight: 0,
      };

      const destroy = this.observe(el, (size) => {
        state.previousWidth = state.width;
        state.previousHeight = state.height;
        state.width = size.width;
        state.height = size.height;

        if (options.onChange) {
          options.onChange(state);
        }

        // Direction callbacks
        if (state.width > state.previousWidth && options.onWidthGrow) {
          options.onWidthGrow(state);
        }
        if (state.width < state.previousWidth && options.onWidthShrink) {
          options.onWidthShrink(state);
        }
        if (state.height > state.previousHeight && options.onHeightGrow) {
          options.onHeightGrow(state);
        }
        if (state.height < state.previousHeight && options.onHeightShrink) {
          options.onHeightShrink(state);
        }
      });

      return {
        getSize: () => ({ width: state.width, height: state.height }),
        getPreviousSize: () => ({
          width: state.previousWidth,
          height: state.previousHeight,
        }),
        destroy,
      };
    }

    // ═══════════════════════════════════════════════════════════
    // CONTAINER QUERIES (POLYFILL-LIKE)
    // ═══════════════════════════════════════════════════════════

    containerQuery(element, queries, options = {}) {
      const el = this._getElement(element);
      const baseClass = options.baseClass || "container";

      const destroy = this.observe(el, (size) => {
        // Remove all query classes
        for (const query of queries) {
          if (query.class) {
            el.classList.remove(query.class);
          }
        }

        // Apply matching query classes
        for (const query of queries) {
          let matches = true;

          if (query.minWidth !== undefined && size.width < query.minWidth) {
            matches = false;
          }
          if (query.maxWidth !== undefined && size.width > query.maxWidth) {
            matches = false;
          }
          if (query.minHeight !== undefined && size.height < query.minHeight) {
            matches = false;
          }
          if (query.maxHeight !== undefined && size.height > query.maxHeight) {
            matches = false;
          }

          if (matches) {
            if (query.class) {
              el.classList.add(query.class);
            }
            if (query.callback) {
              query.callback(size);
            }
          }
        }
      });

      return destroy;
    }

    // Size classes (sm, md, lg, etc.) based on container width
    containerSizeClasses(element, options = {}) {
      const el = this._getElement(element);
      const prefix = options.prefix || "c";
      const breakpoints = options.breakpoints || {
        sm: 320,
        md: 480,
        lg: 640,
        xl: 800,
      };

      const sizeClasses = Object.keys(breakpoints).map(
        (name) => `${prefix}-${name}`,
      );

      return this.observe(el, (size) => {
        // Remove all size classes
        el.classList.remove(...sizeClasses);

        // Add appropriate classes
        for (const [name, minWidth] of Object.entries(breakpoints)) {
          if (size.width >= minWidth) {
            el.classList.add(`${prefix}-${name}`);
          }
        }
      });
    }

    // ═══════════════════════════════════════════════════════════
    // ASPECT RATIO
    // ═══════════════════════════════════════════════════════════

    maintainAspectRatio(element, ratio = 16 / 9, options = {}) {
      const el = this._getElement(element);
      const dimension = options.dimension || "height"; // or 'width'

      return this.observe(el, (size) => {
        if (dimension === "height") {
          el.style.height = `${size.width / ratio}px`;
        } else {
          el.style.width = `${size.height * ratio}px`;
        }
      });
    }

    onAspectRatioChange(element, callback, options = {}) {
      const el = this._getElement(element);
      let lastRatio = null;
      const threshold = options.threshold || 0.01;

      return this.observe(el, (size) => {
        const currentRatio = size.width / size.height;

        if (
          lastRatio === null ||
          Math.abs(currentRatio - lastRatio) > threshold
        ) {
          const orientation =
            currentRatio > 1
              ? "landscape"
              : currentRatio < 1
                ? "portrait"
                : "square";

          callback({
            ratio: currentRatio,
            orientation,
            previousRatio: lastRatio,
            size,
          });

          lastRatio = currentRatio;
        }
      });
    }

    // ═══════════════════════════════════════════════════════════
    // RESPONSIVE UTILITIES
    // ═══════════════════════════════════════════════════════════

    fitContent(element, options = {}) {
      const el = this._getElement(element);
      const target = options.target || el.firstElementChild;

      if (!target) return () => {};

      return this.observe(el, (containerSize) => {
        const targetRect = target.getBoundingClientRect();
        const scaleX = containerSize.width / targetRect.width;
        const scaleY = containerSize.height / targetRect.height;

        let scale;
        if (options.mode === "cover") {
          scale = Math.max(scaleX, scaleY);
        } else {
          scale = Math.min(scaleX, scaleY);
        }

        if (options.maxScale) {
          scale = Math.min(scale, options.maxScale);
        }

        target.style.transform = `scale(${scale})`;
        target.style.transformOrigin = options.origin || "center";
      });
    }

    matchHeight(elements, options = {}) {
      const els =
        typeof elements === "string"
          ? [...document.querySelectorAll(elements)]
          : [...elements];

      if (els.length === 0) return () => {};

      const update = () => {
        // Reset heights
        els.forEach((el) => (el.style.height = "auto"));

        // Find max height
        const maxHeight = Math.max(...els.map((el) => el.offsetHeight));

        // Apply max height
        els.forEach((el) => (el.style.height = `${maxHeight}px`));

        if (options.onChange) {
          options.onChange(maxHeight);
        }
      };

      // Observe all elements
      const destroyers = els.map((el) =>
        this.observe(el, update, { immediate: false }),
      );

      // Initial update
      update();

      return () => destroyers.forEach((d) => d());
    }

    // ═══════════════════════════════════════════════════════════
    // BREAKPOINT MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    _initBreakpointWatcher() {
      this._updateBreakpoint();

      window.addEventListener("resize", () => {
        this._updateBreakpoint();
      });
    }

    _updateBreakpoint() {
      const width = window.innerWidth;
      let newBreakpoint = "xs";

      for (const [name, minWidth] of this.breakpoints) {
        if (width >= minWidth) {
          newBreakpoint = name;
        }
      }

      if (newBreakpoint !== this.currentBreakpoint) {
        const previous = this.currentBreakpoint;
        this.currentBreakpoint = newBreakpoint;

        for (const callback of this.breakpointCallbacks) {
          callback(newBreakpoint, previous);
        }
      }
    }

    setBreakpoints(breakpoints) {
      this.breakpoints = new Map(
        Object.entries(breakpoints).sort((a, b) => a[1] - b[1]),
      );
      this._updateBreakpoint();
    }

    onBreakpointChange(callback) {
      this.breakpointCallbacks.add(callback);

      // Immediate call
      callback(this.currentBreakpoint, null);

      return () => this.breakpointCallbacks.delete(callback);
    }

    getBreakpoint() {
      return this.currentBreakpoint;
    }

    isBreakpoint(name) {
      return this.currentBreakpoint === name;
    }

    isBreakpointUp(name) {
      const current = this.breakpoints.get(this.currentBreakpoint) || 0;
      const target = this.breakpoints.get(name) || 0;
      return current >= target;
    }

    isBreakpointDown(name) {
      const current = this.breakpoints.get(this.currentBreakpoint) || 0;
      const target = this.breakpoints.get(name) || 0;
      return current <= target;
    }

    // ═══════════════════════════════════════════════════════════
    // MEDIA QUERY HELPERS
    // ═══════════════════════════════════════════════════════════

    matchMedia(query, callback) {
      const mql = window.matchMedia(query);

      const handler = (e) => callback(e.matches, e);

      mql.addEventListener("change", handler);
      handler(mql);

      return () => mql.removeEventListener("change", handler);
    }

    onMobile(callback) {
      return this.matchMedia("(max-width: 767px)", callback);
    }

    onTablet(callback) {
      return this.matchMedia(
        "(min-width: 768px) and (max-width: 1023px)",
        callback,
      );
    }

    onDesktop(callback) {
      return this.matchMedia("(min-width: 1024px)", callback);
    }

    onDarkMode(callback) {
      return this.matchMedia("(prefers-color-scheme: dark)", callback);
    }

    onReducedMotion(callback) {
      return this.matchMedia("(prefers-reduced-motion: reduce)", callback);
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    _getElement(el) {
      return typeof el === "string" ? document.querySelector(el) : el;
    }

    getSize(element) {
      const el = this._getElement(element);
      const rect = el.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right,
      };
    }

    getViewportSize() {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
      };
    }

    onViewportResize(callback) {
      const handler = () => callback(this.getViewportSize());

      window.addEventListener("resize", handler);
      handler();

      return () => window.removeEventListener("resize", handler);
    }

    debounce(element, callback, delay = 100) {
      let timeoutId = null;

      return this.observe(element, (size, entry) => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
          callback(size, entry);
          timeoutId = null;
        }, delay);
      });
    }

    destroyAll() {
      for (const observer of this.observers.values()) {
        observer.disconnect();
      }
      this.observers.clear();
      this.callbacks = new WeakMap();
    }
  }

  // Initialize
  window.BaelResize = new BaelResize();

  // Global shortcuts
  window.$resize = window.BaelResize;
  window.$onResize = (el, cb, opts) => window.BaelResize.observe(el, cb, opts);
  window.$breakpoint = () => window.BaelResize.getBreakpoint();

  console.log("📐 Bael Resize ready");
})();
