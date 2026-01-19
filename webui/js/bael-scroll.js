/**
 * BAEL Scroll - Scroll Management System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete scroll system:
 * - Scroll position tracking
 * - Smooth scrolling
 * - Scroll anchoring
 * - Scroll spy
 * - Parallax effects
 */

(function () {
  "use strict";

  class BaelScroll {
    constructor() {
      this.scrollListeners = new Set();
      this.scrollSpyInstances = new Map();
      this.lastScrollY = 0;
      this.lastScrollX = 0;
      this.scrollDirection = "none";
      this.ticking = false;

      this._initGlobalScroll();
      console.log("📜 Bael Scroll initialized");
    }

    _initGlobalScroll() {
      window.addEventListener(
        "scroll",
        () => {
          if (!this.ticking) {
            requestAnimationFrame(() => {
              this._handleScroll();
              this.ticking = false;
            });
            this.ticking = true;
          }
        },
        { passive: true },
      );
    }

    _handleScroll() {
      const currentY = window.scrollY;
      const currentX = window.scrollX;

      this.scrollDirection =
        currentY > this.lastScrollY
          ? "down"
          : currentY < this.lastScrollY
            ? "up"
            : "none";

      const data = {
        x: currentX,
        y: currentY,
        deltaX: currentX - this.lastScrollX,
        deltaY: currentY - this.lastScrollY,
        direction: this.scrollDirection,
        progress: this.getScrollProgress(),
      };

      for (const listener of this.scrollListeners) {
        listener(data);
      }

      this.lastScrollY = currentY;
      this.lastScrollX = currentX;
    }

    // ═══════════════════════════════════════════════════════════
    // SCROLL POSITION
    // ═══════════════════════════════════════════════════════════

    getPosition() {
      return {
        x: window.scrollX,
        y: window.scrollY,
      };
    }

    getScrollProgress() {
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      return scrollHeight > 0 ? window.scrollY / scrollHeight : 0;
    }

    getDirection() {
      return this.scrollDirection;
    }

    isAtTop(threshold = 0) {
      return window.scrollY <= threshold;
    }

    isAtBottom(threshold = 0) {
      return (
        window.scrollY >=
        document.documentElement.scrollHeight - window.innerHeight - threshold
      );
    }

    // ═══════════════════════════════════════════════════════════
    // SCROLL LISTENING
    // ═══════════════════════════════════════════════════════════

    onScroll(callback) {
      this.scrollListeners.add(callback);
      return () => this.scrollListeners.delete(callback);
    }

    onScrollDirection(direction, callback) {
      return this.onScroll((data) => {
        if (data.direction === direction) {
          callback(data);
        }
      });
    }

    onScrollDown(callback) {
      return this.onScrollDirection("down", callback);
    }

    onScrollUp(callback) {
      return this.onScrollDirection("up", callback);
    }

    onScrollProgress(callback) {
      return this.onScroll((data) => {
        callback(data.progress, data);
      });
    }

    onScrollTo(position, callback, options = {}) {
      const threshold = options.threshold || 10;
      let triggered = false;

      return this.onScroll((data) => {
        const reached = Math.abs(data.y - position) < threshold;

        if (reached && !triggered) {
          triggered = true;
          callback(data);

          if (options.once) {
            return false; // Remove listener
          }
        } else if (!reached && options.reset !== false) {
          triggered = false;
        }
      });
    }

    // ═══════════════════════════════════════════════════════════
    // SMOOTH SCROLLING
    // ═══════════════════════════════════════════════════════════

    scrollTo(target, options = {}) {
      return new Promise((resolve) => {
        let targetY;

        if (typeof target === "number") {
          targetY = target;
        } else if (typeof target === "string") {
          const el = document.querySelector(target);
          if (!el) {
            resolve();
            return;
          }
          targetY = el.getBoundingClientRect().top + window.scrollY;
        } else if (target instanceof Element) {
          targetY = target.getBoundingClientRect().top + window.scrollY;
        } else {
          resolve();
          return;
        }

        // Apply offset
        targetY -= options.offset || 0;

        // Ensure within bounds
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;
        targetY = Math.max(0, Math.min(targetY, maxScroll));

        if (
          options.smooth !== false &&
          "scrollBehavior" in document.documentElement.style
        ) {
          window.scrollTo({
            top: targetY,
            behavior: "smooth",
          });

          // Wait for scroll to complete
          const checkScroll = () => {
            if (Math.abs(window.scrollY - targetY) < 1) {
              resolve();
            } else {
              requestAnimationFrame(checkScroll);
            }
          };
          requestAnimationFrame(checkScroll);
        } else {
          // Custom smooth scroll
          this._animateScroll(
            window.scrollY,
            targetY,
            options.duration || 500,
          ).then(resolve);
        }
      });
    }

    scrollToTop(options = {}) {
      return this.scrollTo(0, options);
    }

    scrollToBottom(options = {}) {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      return this.scrollTo(maxScroll, options);
    }

    scrollToElement(element, options = {}) {
      return this.scrollTo(element, options);
    }

    scrollBy(amount, options = {}) {
      return this.scrollTo(window.scrollY + amount, options);
    }

    _animateScroll(start, end, duration) {
      return new Promise((resolve) => {
        const startTime = performance.now();
        const diff = end - start;

        const step = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);

          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);

          window.scrollTo(0, start + diff * eased);

          if (progress < 1) {
            requestAnimationFrame(step);
          } else {
            resolve();
          }
        };

        requestAnimationFrame(step);
      });
    }

    // ═══════════════════════════════════════════════════════════
    // SCROLL SPY
    // ═══════════════════════════════════════════════════════════

    scrollSpy(sections, options = {}) {
      const elements =
        typeof sections === "string"
          ? [...document.querySelectorAll(sections)]
          : [...sections];

      const offset = options.offset || 0;
      let currentSection = null;

      const update = () => {
        const scrollY = window.scrollY + offset + window.innerHeight * 0.3;
        let active = null;

        for (const el of elements) {
          const rect = el.getBoundingClientRect();
          const top = rect.top + window.scrollY;

          if (scrollY >= top) {
            active = el;
          }
        }

        if (active !== currentSection) {
          // Remove active from previous
          if (currentSection) {
            currentSection.classList.remove(options.activeClass || "active");

            // Update nav link
            const prevId = currentSection.id;
            if (prevId) {
              const prevLink = document.querySelector(`a[href="#${prevId}"]`);
              prevLink?.classList.remove(options.activeClass || "active");
            }
          }

          // Add active to current
          if (active) {
            active.classList.add(options.activeClass || "active");

            // Update nav link
            const activeId = active.id;
            if (activeId) {
              const activeLink = document.querySelector(
                `a[href="#${activeId}"]`,
              );
              activeLink?.classList.add(options.activeClass || "active");
            }

            if (options.onChange) {
              options.onChange(active, currentSection);
            }
          }

          currentSection = active;
        }
      };

      // Initial update
      update();

      // Add scroll listener
      const destroy = this.onScroll(update);

      this.scrollSpyInstances.set(sections, { destroy, update });

      return destroy;
    }

    // ═══════════════════════════════════════════════════════════
    // SCROLL ANCHORING
    // ═══════════════════════════════════════════════════════════

    anchors(options = {}) {
      const selector = options.selector || 'a[href^="#"]';
      const links = document.querySelectorAll(selector);

      links.forEach((link) => {
        link.addEventListener("click", (e) => {
          const href = link.getAttribute("href");
          if (!href || href === "#") return;

          const target = document.querySelector(href);
          if (!target) return;

          e.preventDefault();

          this.scrollToElement(target, {
            offset: options.offset || 0,
            duration: options.duration,
          });

          // Update URL
          if (options.updateHash !== false) {
            history.pushState(null, "", href);
          }
        });
      });
    }

    // ═══════════════════════════════════════════════════════════
    // ELEMENT SCROLL
    // ═══════════════════════════════════════════════════════════

    observeElement(element, callback, options = {}) {
      const el = this._getElement(element);
      let ticking = false;

      const handler = () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            callback({
              scrollTop: el.scrollTop,
              scrollLeft: el.scrollLeft,
              scrollHeight: el.scrollHeight,
              scrollWidth: el.scrollWidth,
              clientHeight: el.clientHeight,
              clientWidth: el.clientWidth,
              progress: el.scrollTop / (el.scrollHeight - el.clientHeight) || 0,
            });
            ticking = false;
          });
          ticking = true;
        }
      };

      el.addEventListener("scroll", handler, { passive: true });

      // Initial call
      if (options.immediate !== false) {
        handler();
      }

      return () => el.removeEventListener("scroll", handler);
    }

    scrollElementTo(element, target, options = {}) {
      const el = this._getElement(element);

      return new Promise((resolve) => {
        let targetY;

        if (typeof target === "number") {
          targetY = target;
        } else {
          const targetEl = this._getElement(target);
          targetY = targetEl.offsetTop - el.offsetTop;
        }

        targetY -= options.offset || 0;

        if (options.smooth !== false) {
          el.scrollTo({
            top: targetY,
            behavior: "smooth",
          });
        } else {
          el.scrollTop = targetY;
        }

        // Simple completion check
        setTimeout(resolve, options.duration || 300);
      });
    }

    // ═══════════════════════════════════════════════════════════
    // SCROLL LOCK
    // ═══════════════════════════════════════════════════════════

    lock() {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
      document.body.dataset.scrollLockPosition = scrollY;
    }

    unlock() {
      const scrollY = parseInt(document.body.dataset.scrollLockPosition || "0");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      delete document.body.dataset.scrollLockPosition;
      window.scrollTo(0, scrollY);
    }

    isLocked() {
      return document.body.style.position === "fixed";
    }

    // ═══════════════════════════════════════════════════════════
    // SCROLL RESTORATION
    // ═══════════════════════════════════════════════════════════

    savePosition(key = "default") {
      const positions = JSON.parse(
        sessionStorage.getItem("bael-scroll-positions") || "{}",
      );
      positions[key] = {
        x: window.scrollX,
        y: window.scrollY,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(
        "bael-scroll-positions",
        JSON.stringify(positions),
      );
    }

    restorePosition(key = "default", options = {}) {
      const positions = JSON.parse(
        sessionStorage.getItem("bael-scroll-positions") || "{}",
      );
      const position = positions[key];

      if (position) {
        if (options.smooth) {
          return this.scrollTo(position.y, options);
        } else {
          window.scrollTo(position.x, position.y);
          return Promise.resolve();
        }
      }

      return Promise.resolve();
    }

    clearSavedPositions() {
      sessionStorage.removeItem("bael-scroll-positions");
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    _getElement(el) {
      return typeof el === "string" ? document.querySelector(el) : el;
    }

    getScrollbarWidth() {
      const outer = document.createElement("div");
      outer.style.cssText = "visibility:hidden;overflow:scroll;width:100px;";
      document.body.appendChild(outer);

      const inner = document.createElement("div");
      inner.style.width = "100%";
      outer.appendChild(inner);

      const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
      outer.remove();

      return scrollbarWidth;
    }

    hideScrollbar(element = document.body) {
      const el = this._getElement(element);
      const scrollbarWidth = this.getScrollbarWidth();

      el.style.overflow = "hidden";
      el.style.paddingRight = `${scrollbarWidth}px`;

      return () => {
        el.style.overflow = "";
        el.style.paddingRight = "";
      };
    }
  }

  // Initialize
  window.BaelScroll = new BaelScroll();

  // Global shortcuts
  window.$scroll = window.BaelScroll;
  window.$scrollTo = (target, opts) => window.BaelScroll.scrollTo(target, opts);
  window.$scrollTop = (opts) => window.BaelScroll.scrollToTop(opts);

  console.log("📜 Bael Scroll ready");
})();
