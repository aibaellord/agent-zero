/**
 * BAEL Intersection - Intersection Observer System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete intersection system:
 * - Viewport detection
 * - Lazy loading
 * - Infinite scroll
 * - Scroll animations
 * - Sticky detection
 */

(function () {
  "use strict";

  class BaelIntersection {
    constructor() {
      this.observers = new Map();
      this.callbacks = new WeakMap();
      console.log("👁️ Bael Intersection initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // BASIC OBSERVATION
    // ═══════════════════════════════════════════════════════════

    observe(element, callback, options = {}) {
      const el = this._getElement(element);

      const observerOptions = {
        root: options.root || null,
        rootMargin: options.rootMargin || "0px",
        threshold: options.threshold || 0,
      };

      const observerKey = this._getObserverKey(observerOptions);
      let observer = this.observers.get(observerKey);

      if (!observer) {
        observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            const cb = this.callbacks.get(entry.target);
            if (cb) {
              cb(entry.isIntersecting, entry);
            }
          });
        }, observerOptions);

        this.observers.set(observerKey, observer);
      }

      this.callbacks.set(el, callback);
      observer.observe(el);

      return () => this.unobserve(el, observerKey);
    }

    unobserve(element, observerKey) {
      const el = this._getElement(element);

      for (const [key, observer] of this.observers) {
        if (!observerKey || key === observerKey) {
          observer.unobserve(el);
        }
      }

      this.callbacks.delete(el);
    }

    // ═══════════════════════════════════════════════════════════
    // VISIBILITY DETECTION
    // ═══════════════════════════════════════════════════════════

    inView(element, options = {}) {
      return new Promise((resolve) => {
        const unobserve = this.observe(
          element,
          (isVisible, entry) => {
            if (isVisible) {
              unobserve();
              resolve(entry);
            }
          },
          options,
        );
      });
    }

    onEnter(element, callback, options = {}) {
      return this.observe(
        element,
        (isVisible, entry) => {
          if (isVisible) {
            callback(entry);
            if (options.once) {
              this.unobserve(element);
            }
          }
        },
        options,
      );
    }

    onLeave(element, callback, options = {}) {
      let wasVisible = false;

      return this.observe(
        element,
        (isVisible, entry) => {
          if (wasVisible && !isVisible) {
            callback(entry);
          }
          wasVisible = isVisible;
        },
        options,
      );
    }

    onEnterOnce(element, callback, options = {}) {
      return this.onEnter(element, callback, { ...options, once: true });
    }

    // ═══════════════════════════════════════════════════════════
    // LAZY LOADING
    // ═══════════════════════════════════════════════════════════

    lazyLoad(selector, options = {}) {
      const elements = document.querySelectorAll(selector);
      const loaded = [];

      elements.forEach((el) => {
        const unobserve = this.onEnterOnce(
          el,
          () => {
            this._loadElement(el, options);
            loaded.push(el);
          },
          {
            rootMargin: options.rootMargin || "100px",
            threshold: options.threshold || 0,
          },
        );
      });

      return {
        elements,
        loaded,
        destroy: () => elements.forEach((el) => this.unobserve(el)),
      };
    }

    _loadElement(el, options = {}) {
      // Images
      if (el.tagName === "IMG") {
        if (el.dataset.src) {
          el.src = el.dataset.src;
          el.removeAttribute("data-src");
        }
        if (el.dataset.srcset) {
          el.srcset = el.dataset.srcset;
          el.removeAttribute("data-srcset");
        }
      }

      // Background images
      if (el.dataset.bg) {
        el.style.backgroundImage = `url(${el.dataset.bg})`;
        el.removeAttribute("data-bg");
      }

      // Iframes
      if (el.tagName === "IFRAME" && el.dataset.src) {
        el.src = el.dataset.src;
        el.removeAttribute("data-src");
      }

      // Video
      if (el.tagName === "VIDEO" && el.dataset.src) {
        el.src = el.dataset.src;
        el.removeAttribute("data-src");
        if (options.autoplay) {
          el.play();
        }
      }

      // Custom load handler
      if (options.onLoad) {
        options.onLoad(el);
      }

      // Add loaded class
      el.classList.add(options.loadedClass || "loaded");
    }

    // ═══════════════════════════════════════════════════════════
    // SCROLL ANIMATIONS
    // ═══════════════════════════════════════════════════════════

    animate(selector, options = {}) {
      const elements = document.querySelectorAll(selector);
      const unobservers = [];

      elements.forEach((el, index) => {
        // Set initial hidden state
        el.style.opacity = "0";
        el.style.transition = `all ${options.duration || 600}ms ${options.easing || "ease-out"}`;

        if (options.transform) {
          el.style.transform = options.transform;
        }

        const unobserve = this.onEnter(
          el,
          () => {
            // Apply stagger delay
            const delay = (options.stagger || 0) * index;

            setTimeout(() => {
              el.style.opacity = "1";
              el.style.transform = "none";

              if (options.onAnimate) {
                options.onAnimate(el, index);
              }
            }, delay);

            if (!options.repeat) {
              this.unobserve(el);
            }
          },
          {
            rootMargin: options.rootMargin || "-50px",
            threshold: options.threshold || 0.1,
          },
        );

        unobservers.push(unobserve);
      });

      return {
        elements,
        destroy: () => unobservers.forEach((fn) => fn()),
      };
    }

    fadeIn(selector, options = {}) {
      return this.animate(selector, {
        ...options,
        transform: "translateY(20px)",
      });
    }

    slideIn(selector, direction = "up", options = {}) {
      const transforms = {
        up: "translateY(30px)",
        down: "translateY(-30px)",
        left: "translateX(30px)",
        right: "translateX(-30px)",
      };

      return this.animate(selector, {
        ...options,
        transform: transforms[direction] || transforms.up,
      });
    }

    scaleIn(selector, options = {}) {
      return this.animate(selector, {
        ...options,
        transform: "scale(0.9)",
      });
    }

    // ═══════════════════════════════════════════════════════════
    // INFINITE SCROLL
    // ═══════════════════════════════════════════════════════════

    infiniteScroll(sentinel, loadMore, options = {}) {
      const el = this._getElement(sentinel);
      let loading = false;
      let disabled = false;

      const unobserve = this.observe(
        el,
        async (isVisible) => {
          if (isVisible && !loading && !disabled) {
            loading = true;

            try {
              const result = await loadMore();

              // Check if more items available
              if (result === false || result?.done) {
                disabled = true;
                unobserve();

                if (options.onComplete) {
                  options.onComplete();
                }
              }
            } catch (error) {
              if (options.onError) {
                options.onError(error);
              }
            } finally {
              loading = false;
            }
          }
        },
        {
          rootMargin: options.rootMargin || "200px",
          threshold: 0,
        },
      );

      return {
        enable: () => {
          disabled = false;
        },
        disable: () => {
          disabled = true;
        },
        isLoading: () => loading,
        destroy: unobserve,
      };
    }

    // ═══════════════════════════════════════════════════════════
    // STICKY DETECTION
    // ═══════════════════════════════════════════════════════════

    onStick(element, callback, options = {}) {
      const el = this._getElement(element);
      const offset = options.offset || 0;

      // Create sentinel element
      const sentinel = document.createElement("div");
      sentinel.style.cssText = `
                position: absolute;
                top: ${-offset - 1}px;
                height: 1px;
                width: 100%;
                pointer-events: none;
            `;

      // Ensure parent is positioned
      if (getComputedStyle(el.parentElement).position === "static") {
        el.parentElement.style.position = "relative";
      }

      el.parentElement.insertBefore(sentinel, el);

      return this.observe(
        sentinel,
        (isVisible) => {
          const isSticky = !isVisible;
          callback(isSticky);

          if (options.class) {
            el.classList.toggle(options.class, isSticky);
          }
        },
        {
          threshold: 0,
          rootMargin: `${offset}px 0px 0px 0px`,
        },
      );
    }

    // ═══════════════════════════════════════════════════════════
    // PROGRESS TRACKING
    // ═══════════════════════════════════════════════════════════

    trackProgress(element, callback, options = {}) {
      const el = this._getElement(element);

      // Create multiple thresholds for progress tracking
      const steps = options.steps || 20;
      const threshold = Array.from({ length: steps + 1 }, (_, i) => i / steps);

      return this.observe(
        el,
        (isVisible, entry) => {
          callback({
            isVisible,
            progress: entry.intersectionRatio,
            entry,
          });
        },
        {
          ...options,
          threshold,
        },
      );
    }

    // ═══════════════════════════════════════════════════════════
    // PARALLAX
    // ═══════════════════════════════════════════════════════════

    parallax(element, options = {}) {
      const el = this._getElement(element);
      const speed = options.speed || 0.5;
      let isInView = false;
      let rafId = null;

      const update = () => {
        if (!isInView) return;

        const rect = el.getBoundingClientRect();
        const scrolled = window.innerHeight - rect.top;
        const offset = scrolled * speed;

        el.style.transform = `translateY(${offset}px)`;

        rafId = requestAnimationFrame(update);
      };

      const unobserve = this.observe(
        el,
        (visible) => {
          isInView = visible;

          if (visible) {
            update();
          } else if (rafId) {
            cancelAnimationFrame(rafId);
          }
        },
        {
          rootMargin: "100px",
          threshold: 0,
        },
      );

      return () => {
        unobserve();
        if (rafId) cancelAnimationFrame(rafId);
      };
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    _getElement(el) {
      return typeof el === "string" ? document.querySelector(el) : el;
    }

    _getObserverKey(options) {
      return JSON.stringify({
        root: options.root,
        rootMargin: options.rootMargin,
        threshold: options.threshold,
      });
    }

    isInViewport(element) {
      const el = this._getElement(element);
      const rect = el.getBoundingClientRect();

      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      );
    }

    getVisibilityRatio(element) {
      const el = this._getElement(element);
      const rect = el.getBoundingClientRect();

      const visibleHeight =
        Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      const visibleWidth =
        Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0);

      if (visibleHeight <= 0 || visibleWidth <= 0) return 0;

      const visibleArea = visibleHeight * visibleWidth;
      const totalArea = rect.width * rect.height;

      return visibleArea / totalArea;
    }

    destroyAll() {
      for (const observer of this.observers.values()) {
        observer.disconnect();
      }
      this.observers.clear();
    }
  }

  // Initialize
  window.BaelIntersection = new BaelIntersection();

  // Global shortcuts
  window.$intersection = window.BaelIntersection;
  window.$inView = (el, opts) => window.BaelIntersection.inView(el, opts);
  window.$lazyLoad = (sel, opts) => window.BaelIntersection.lazyLoad(sel, opts);

  console.log("👁️ Bael Intersection ready");
})();
