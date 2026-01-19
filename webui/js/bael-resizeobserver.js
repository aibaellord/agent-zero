/**
 * BAEL Resize Observer Component - Lord Of All Dimensions
 *
 * Element resize observation:
 * - Element size tracking
 * - Responsive callbacks
 * - Container queries (polyfill)
 * - Breakpoint detection
 * - Aspect ratio monitoring
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // RESIZE OBSERVER CLASS
  // ============================================================

  class BaelResizeObserver {
    constructor() {
      this.observers = new Map();
      this.idCounter = 0;
      this.breakpoints = {
        xs: 0,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
        xxl: 1400,
      };
    }

    // ============================================================
    // OBSERVE METHODS
    // ============================================================

    /**
     * Observe element resize
     */
    observe(element, callback, options = {}) {
      if (typeof element === "string") {
        element = document.querySelector(element);
      }
      if (!element) return null;

      const id = `bael-resize-${++this.idCounter}`;

      const config = {
        debounce: options.debounce || 0,
        throttle: options.throttle || 0,
        box: options.box || "content-box", // 'content-box', 'border-box'
        breakpoints: options.breakpoints || null,
      };

      let timeoutId = null;
      let lastCall = 0;
      let lastBreakpoint = null;

      const handler = (entries) => {
        const entry = entries[0];
        const { width, height } = entry.contentRect;

        const data = {
          width,
          height,
          element,
          aspectRatio: width / height,
          isPortrait: height > width,
          isLandscape: width > height,
          isSquare: Math.abs(width - height) < 10,
        };

        // Add breakpoint info
        if (config.breakpoints) {
          data.breakpoint = this._getBreakpoint(width, config.breakpoints);
          data.breakpointChanged = data.breakpoint !== lastBreakpoint;
          lastBreakpoint = data.breakpoint;
        }

        // Debounce
        if (config.debounce > 0) {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => callback(data), config.debounce);
          return;
        }

        // Throttle
        if (config.throttle > 0) {
          const now = Date.now();
          if (now - lastCall < config.throttle) return;
          lastCall = now;
        }

        callback(data);
      };

      const observer = new ResizeObserver(handler);
      observer.observe(element, { box: config.box });

      const state = { id, observer, element, config };
      this.observers.set(id, state);

      return {
        id,
        disconnect: () => this.disconnect(id),
        getSize: () => this._getSize(element),
      };
    }

    /**
     * Observe multiple elements
     */
    observeAll(elements, callback, options = {}) {
      if (typeof elements === "string") {
        elements = document.querySelectorAll(elements);
      }

      const observers = Array.from(elements).map((el) =>
        this.observe(el, callback, options),
      );

      return {
        observers,
        disconnectAll: () => observers.forEach((o) => o.disconnect()),
      };
    }

    /**
     * Get element size
     */
    _getSize(element) {
      const rect = element.getBoundingClientRect();
      return {
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
        bottom: rect.bottom,
        right: rect.right,
      };
    }

    /**
     * Get breakpoint for width
     */
    _getBreakpoint(width, customBreakpoints) {
      const bp = customBreakpoints || this.breakpoints;
      const entries = Object.entries(bp).sort((a, b) => b[1] - a[1]);

      for (const [name, minWidth] of entries) {
        if (width >= minWidth) {
          return name;
        }
      }

      return entries[entries.length - 1][0];
    }

    /**
     * Disconnect observer
     */
    disconnect(id) {
      const state = this.observers.get(id);
      if (state) {
        state.observer.disconnect();
        this.observers.delete(id);
      }
    }

    /**
     * Disconnect all observers
     */
    disconnectAll() {
      for (const [id] of this.observers) {
        this.disconnect(id);
      }
    }

    // ============================================================
    // CONTAINER QUERIES (POLYFILL)
    // ============================================================

    /**
     * Container query - apply classes based on container width
     */
    containerQuery(element, queries, options = {}) {
      if (typeof element === "string") {
        element = document.querySelector(element);
      }
      if (!element) return null;

      const observer = this.observe(
        element,
        (data) => {
          const { width } = data;

          // Remove all query classes first
          Object.values(queries).forEach((classes) => {
            if (typeof classes === "string") {
              element.classList.remove(...classes.split(" "));
            }
          });

          // Apply matching classes
          Object.entries(queries).forEach(([query, classes]) => {
            const match = this._matchQuery(query, width);
            if (match && typeof classes === "string") {
              element.classList.add(...classes.split(" "));
            }
          });
        },
        options,
      );

      return observer;
    }

    /**
     * Match query string
     */
    _matchQuery(query, width) {
      // Parse query like "min-width: 500px" or ">= 500" or "500-800"

      // Range format: "500-800"
      const rangeMatch = query.match(/^(\d+)\s*-\s*(\d+)$/);
      if (rangeMatch) {
        const min = parseInt(rangeMatch[1]);
        const max = parseInt(rangeMatch[2]);
        return width >= min && width <= max;
      }

      // Min-width format: "min-width: 500px" or ">= 500"
      const minMatch = query.match(/(?:min-width:\s*(\d+)|>=?\s*(\d+))/i);
      if (minMatch) {
        const min = parseInt(minMatch[1] || minMatch[2]);
        return width >= min;
      }

      // Max-width format: "max-width: 500px" or "<= 500"
      const maxMatch = query.match(/(?:max-width:\s*(\d+)|<=?\s*(\d+))/i);
      if (maxMatch) {
        const max = parseInt(maxMatch[1] || maxMatch[2]);
        return width <= max;
      }

      // Breakpoint name
      if (this.breakpoints[query] !== undefined) {
        return width >= this.breakpoints[query];
      }

      return false;
    }

    // ============================================================
    // ASPECT RATIO MONITORING
    // ============================================================

    /**
     * Monitor aspect ratio changes
     */
    aspectRatio(element, callback, options = {}) {
      if (typeof element === "string") {
        element = document.querySelector(element);
      }
      if (!element) return null;

      const config = {
        thresholds: options.thresholds || [0.5, 1, 1.5, 2], // Aspect ratios to detect
        ...options,
      };

      let lastRatio = null;
      let lastCategory = null;

      return this.observe(
        element,
        (data) => {
          const { aspectRatio } = data;

          // Determine aspect ratio category
          let category = "normal";
          if (aspectRatio < 0.5) category = "very-tall";
          else if (aspectRatio < 0.75) category = "tall";
          else if (aspectRatio < 1.25) category = "square";
          else if (aspectRatio < 1.5) category = "wide";
          else if (aspectRatio < 2) category = "very-wide";
          else category = "ultra-wide";

          const ratioChanged = Math.abs((lastRatio || 0) - aspectRatio) > 0.1;
          const categoryChanged = category !== lastCategory;

          if (ratioChanged || categoryChanged) {
            callback({
              ...data,
              category,
              categoryChanged,
              previousCategory: lastCategory,
              previousRatio: lastRatio,
            });

            lastRatio = aspectRatio;
            lastCategory = category;
          }
        },
        options,
      );
    }

    // ============================================================
    // RESPONSIVE UTILITIES
    // ============================================================

    /**
     * Watch window resize with breakpoints
     */
    watchBreakpoints(callback, customBreakpoints) {
      const bp = customBreakpoints || this.breakpoints;
      let lastBreakpoint = this._getBreakpoint(window.innerWidth, bp);

      const handler = () => {
        const width = window.innerWidth;
        const current = this._getBreakpoint(width, bp);

        if (current !== lastBreakpoint) {
          callback({
            breakpoint: current,
            previousBreakpoint: lastBreakpoint,
            width,
            height: window.innerHeight,
          });
          lastBreakpoint = current;
        }
      };

      window.addEventListener("resize", handler);

      // Initial call
      callback({
        breakpoint: lastBreakpoint,
        previousBreakpoint: null,
        width: window.innerWidth,
        height: window.innerHeight,
      });

      return {
        getBreakpoint: () => this._getBreakpoint(window.innerWidth, bp),
        destroy: () => window.removeEventListener("resize", handler),
      };
    }

    /**
     * Media query listener
     */
    matchMedia(query, callback) {
      const mql = window.matchMedia(query);

      const handler = (e) => {
        callback({
          matches: e.matches,
          media: e.media,
        });
      };

      // Modern browsers
      if (mql.addEventListener) {
        mql.addEventListener("change", handler);
      } else {
        // Legacy
        mql.addListener(handler);
      }

      // Initial call
      callback({
        matches: mql.matches,
        media: mql.media,
      });

      return {
        matches: () => mql.matches,
        destroy: () => {
          if (mql.removeEventListener) {
            mql.removeEventListener("change", handler);
          } else {
            mql.removeListener(handler);
          }
        },
      };
    }

    /**
     * Get current breakpoint
     */
    getCurrentBreakpoint(customBreakpoints) {
      return this._getBreakpoint(window.innerWidth, customBreakpoints);
    }

    /**
     * Check if above breakpoint
     */
    isAbove(breakpoint, customBreakpoints) {
      const bp = customBreakpoints || this.breakpoints;
      return window.innerWidth >= (bp[breakpoint] || 0);
    }

    /**
     * Check if below breakpoint
     */
    isBelow(breakpoint, customBreakpoints) {
      const bp = customBreakpoints || this.breakpoints;
      return window.innerWidth < (bp[breakpoint] || 0);
    }

    /**
     * Check if between breakpoints
     */
    isBetween(minBp, maxBp, customBreakpoints) {
      const bp = customBreakpoints || this.breakpoints;
      const width = window.innerWidth;
      return width >= (bp[minBp] || 0) && width < (bp[maxBp] || Infinity);
    }

    // ============================================================
    // INTERSECTION OBSERVER
    // ============================================================

    /**
     * Observe element visibility
     */
    observeVisibility(element, callback, options = {}) {
      if (typeof element === "string") {
        element = document.querySelector(element);
      }
      if (!element) return null;

      const config = {
        threshold: options.threshold || 0,
        rootMargin: options.rootMargin || "0px",
        root: options.root || null,
        once: options.once || false,
      };

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            callback({
              isIntersecting: entry.isIntersecting,
              intersectionRatio: entry.intersectionRatio,
              boundingClientRect: entry.boundingClientRect,
              element: entry.target,
            });

            if (config.once && entry.isIntersecting) {
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: config.threshold,
          rootMargin: config.rootMargin,
          root: config.root,
        },
      );

      observer.observe(element);

      return {
        disconnect: () => observer.disconnect(),
        unobserve: () => observer.unobserve(element),
      };
    }

    /**
     * Check if element is in viewport
     */
    isInViewport(element, partial = true) {
      if (typeof element === "string") {
        element = document.querySelector(element);
      }
      if (!element) return false;

      const rect = element.getBoundingClientRect();

      if (partial) {
        return (
          rect.bottom >= 0 &&
          rect.right >= 0 &&
          rect.top <= window.innerHeight &&
          rect.left <= window.innerWidth
        );
      }

      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      );
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelResizeObserver();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$onResize = (el, cb, opts) => bael.observe(el, cb, opts);
  window.$containerQuery = (el, queries, opts) =>
    bael.containerQuery(el, queries, opts);
  window.$watchBreakpoints = (cb, bp) => bael.watchBreakpoints(cb, bp);
  window.$matchMedia = (query, cb) => bael.matchMedia(query, cb);
  window.$getBreakpoint = () => bael.getCurrentBreakpoint();
  window.$isAbove = (bp) => bael.isAbove(bp);
  window.$isBelow = (bp) => bael.isBelow(bp);
  window.$onVisible = (el, cb, opts) => bael.observeVisibility(el, cb, opts);
  window.$isInViewport = (el, partial) => bael.isInViewport(el, partial);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelResizeObserver = bael;

  console.log("📐 BAEL Resize Observer loaded");
})();
