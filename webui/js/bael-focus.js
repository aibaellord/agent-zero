/**
 * BAEL Focus - Focus Management System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete focus system:
 * - Focus trapping
 * - Focus restoration
 * - Focus indicators
 * - Keyboard navigation
 * - Skip links
 */

(function () {
  "use strict";

  class BaelFocus {
    constructor() {
      this.traps = [];
      this.focusHistory = [];
      this.config = {
        focusableSelector: [
          "a[href]",
          "button:not([disabled])",
          "input:not([disabled])",
          "select:not([disabled])",
          "textarea:not([disabled])",
          '[tabindex]:not([tabindex="-1"])',
          '[contenteditable="true"]',
        ].join(", "),
        autoFocus: true,
        returnFocus: true,
      };

      this._init();
      console.log("🎯 Bael Focus initialized");
    }

    _init() {
      // Track focus for history
      document.addEventListener("focusin", (e) => {
        this._trackFocus(e.target);
      });

      // Handle tab key for focus traps
      document.addEventListener("keydown", (e) => {
        if (e.key === "Tab" && this.traps.length > 0) {
          this._handleTrapTab(e);
        }
      });
    }

    // ═══════════════════════════════════════════════════════════
    // FOCUS TRAPPING
    // ═══════════════════════════════════════════════════════════

    trap(container, options = {}) {
      const el = this._getElement(container);

      const trap = {
        container: el,
        previousFocus: document.activeElement,
        options: {
          autoFocus: options.autoFocus ?? this.config.autoFocus,
          returnFocus: options.returnFocus ?? this.config.returnFocus,
          initialFocus: options.initialFocus || null,
          allowOutside: options.allowOutside || false,
        },
      };

      this.traps.push(trap);

      // Focus first element or specified element
      if (trap.options.autoFocus) {
        const initial = trap.options.initialFocus
          ? this._getElement(trap.options.initialFocus)
          : this.getFirstFocusable(el);

        if (initial) {
          initial.focus();
        }
      }

      return {
        release: () => this.release(el),
      };
    }

    release(container) {
      const el = container ? this._getElement(container) : null;

      // Find and remove trap
      const index = el
        ? this.traps.findIndex((t) => t.container === el)
        : this.traps.length - 1;

      if (index === -1) return;

      const trap = this.traps.splice(index, 1)[0];

      // Restore focus
      if (trap.options.returnFocus && trap.previousFocus) {
        trap.previousFocus.focus();
      }
    }

    releaseAll() {
      while (this.traps.length > 0) {
        this.release();
      }
    }

    _handleTrapTab(e) {
      const trap = this.traps[this.traps.length - 1];
      if (!trap) return;

      const focusables = this.getFocusableElements(trap.container);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }

      // Keep focus inside trap
      if (
        !trap.options.allowOutside &&
        !trap.container.contains(document.activeElement)
      ) {
        e.preventDefault();
        first.focus();
      }
    }

    isTrapped() {
      return this.traps.length > 0;
    }

    getCurrentTrap() {
      return this.traps[this.traps.length - 1]?.container || null;
    }

    // ═══════════════════════════════════════════════════════════
    // FOCUSABLE ELEMENTS
    // ═══════════════════════════════════════════════════════════

    getFocusableElements(container) {
      const el = container ? this._getElement(container) : document;
      const elements = el.querySelectorAll(this.config.focusableSelector);

      return [...elements].filter((e) => {
        return (
          e.offsetParent !== null &&
          !e.hasAttribute("disabled") &&
          e.tabIndex !== -1
        );
      });
    }

    getFirstFocusable(container) {
      const focusables = this.getFocusableElements(container);
      return focusables[0] || null;
    }

    getLastFocusable(container) {
      const focusables = this.getFocusableElements(container);
      return focusables[focusables.length - 1] || null;
    }

    isFocusable(element) {
      const el = this._getElement(element);
      return (
        el.matches(this.config.focusableSelector) &&
        el.offsetParent !== null &&
        !el.hasAttribute("disabled") &&
        el.tabIndex !== -1
      );
    }

    // ═══════════════════════════════════════════════════════════
    // FOCUS NAVIGATION
    // ═══════════════════════════════════════════════════════════

    focusFirst(container) {
      const el = this.getFirstFocusable(container);
      if (el) el.focus();
      return el;
    }

    focusLast(container) {
      const el = this.getLastFocusable(container);
      if (el) el.focus();
      return el;
    }

    focusNext(wrap = true) {
      const focusables = this.getFocusableElements();
      const current = document.activeElement;
      const index = focusables.indexOf(current);

      if (index === -1) {
        if (focusables[0]) focusables[0].focus();
        return;
      }

      const next = index + 1;
      if (next < focusables.length) {
        focusables[next].focus();
      } else if (wrap) {
        focusables[0].focus();
      }
    }

    focusPrevious(wrap = true) {
      const focusables = this.getFocusableElements();
      const current = document.activeElement;
      const index = focusables.indexOf(current);

      if (index === -1) {
        if (focusables[0]) focusables[0].focus();
        return;
      }

      const prev = index - 1;
      if (prev >= 0) {
        focusables[prev].focus();
      } else if (wrap) {
        focusables[focusables.length - 1].focus();
      }
    }

    moveFocus(element) {
      const el = this._getElement(element);
      if (el && this.isFocusable(el)) {
        el.focus();
        return true;
      }
      return false;
    }

    // ═══════════════════════════════════════════════════════════
    // FOCUS HISTORY
    // ═══════════════════════════════════════════════════════════

    _trackFocus(element) {
      // Avoid duplicates
      if (this.focusHistory[this.focusHistory.length - 1] === element) {
        return;
      }

      this.focusHistory.push(element);

      // Limit history size
      if (this.focusHistory.length > 50) {
        this.focusHistory.shift();
      }
    }

    getPreviousFocus() {
      // Get second to last (current is last)
      return this.focusHistory[this.focusHistory.length - 2] || null;
    }

    restoreFocus() {
      const previous = this.getPreviousFocus();
      if (previous && document.body.contains(previous)) {
        previous.focus();
        return true;
      }
      return false;
    }

    saveFocus() {
      return document.activeElement;
    }

    restoreToSaved(saved) {
      if (saved && document.body.contains(saved)) {
        saved.focus();
        return true;
      }
      return false;
    }

    clearHistory() {
      this.focusHistory = [];
    }

    // ═══════════════════════════════════════════════════════════
    // FOCUS INDICATORS
    // ═══════════════════════════════════════════════════════════

    showFocusRing(element, options = {}) {
      const el = this._getElement(element);

      const ring = document.createElement("div");
      ring.className = "bael-focus-ring";

      const rect = el.getBoundingClientRect();
      const offset = options.offset || 3;

      Object.assign(ring.style, {
        position: "fixed",
        top: `${rect.top - offset}px`,
        left: `${rect.left - offset}px`,
        width: `${rect.width + offset * 2}px`,
        height: `${rect.height + offset * 2}px`,
        border: options.border || "2px solid #007bff",
        borderRadius: options.borderRadius || "4px",
        pointerEvents: "none",
        zIndex: "9999",
        boxSizing: "border-box",
      });

      document.body.appendChild(ring);

      return () => ring.remove();
    }

    setFocusVisible(enable = true) {
      if (enable) {
        document.body.classList.add("bael-focus-visible");
      } else {
        document.body.classList.remove("bael-focus-visible");
      }
    }

    // ═══════════════════════════════════════════════════════════
    // SKIP LINKS
    // ═══════════════════════════════════════════════════════════

    createSkipLink(targetId, text = "Skip to main content") {
      const link = document.createElement("a");
      link.href = `#${targetId}`;
      link.textContent = text;
      link.className = "bael-skip-link";

      Object.assign(link.style, {
        position: "fixed",
        top: "-100px",
        left: "0",
        padding: "8px 16px",
        background: "#000",
        color: "#fff",
        zIndex: "99999",
        transition: "top 0.2s",
      });

      link.addEventListener("focus", () => {
        link.style.top = "0";
      });

      link.addEventListener("blur", () => {
        link.style.top = "-100px";
      });

      link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
          target.tabIndex = -1;
          target.focus();
          target.scrollIntoView();
        }
      });

      document.body.insertBefore(link, document.body.firstChild);

      return link;
    }

    // ═══════════════════════════════════════════════════════════
    // ROVING TABINDEX
    // ═══════════════════════════════════════════════════════════

    createRovingTabindex(container, options = {}) {
      const el = this._getElement(container);
      const selector =
        options.selector || '[role="option"], [role="menuitem"], [role="tab"]';

      return new RovingTabindex(el, {
        selector,
        orientation: options.orientation || "both",
        wrap: options.wrap ?? true,
        onFocus: options.onFocus,
      });
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    _getElement(el) {
      return typeof el === "string" ? document.querySelector(el) : el;
    }

    blur() {
      if (document.activeElement && document.activeElement !== document.body) {
        document.activeElement.blur();
      }
    }

    hasFocus(element) {
      const el = this._getElement(element);
      return (
        document.activeElement === el || el.contains(document.activeElement)
      );
    }

    isWithin(container) {
      const el = this._getElement(container);
      return el.contains(document.activeElement);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // ROVING TABINDEX
  // ═══════════════════════════════════════════════════════════════════

  class RovingTabindex {
    constructor(container, options) {
      this.container = container;
      this.options = options;
      this.items = [];
      this.currentIndex = 0;

      this._init();
    }

    _init() {
      this.items = [...this.container.querySelectorAll(this.options.selector)];

      // Set initial tabindex
      this.items.forEach((item, i) => {
        item.tabIndex = i === 0 ? 0 : -1;
      });

      // Handle keyboard navigation
      this.container.addEventListener(
        "keydown",
        this._handleKeydown.bind(this),
      );

      // Track focus
      this.container.addEventListener("focusin", (e) => {
        const index = this.items.indexOf(e.target);
        if (index !== -1) {
          this.setActive(index);
        }
      });
    }

    _handleKeydown(e) {
      const { orientation, wrap } = this.options;
      let newIndex = this.currentIndex;

      const keys = {
        horizontal: { prev: "ArrowLeft", next: "ArrowRight" },
        vertical: { prev: "ArrowUp", next: "ArrowDown" },
        both: {
          prev: ["ArrowLeft", "ArrowUp"],
          next: ["ArrowRight", "ArrowDown"],
        },
      };

      const config = keys[orientation];
      const isPrev = Array.isArray(config.prev)
        ? config.prev.includes(e.key)
        : e.key === config.prev;
      const isNext = Array.isArray(config.next)
        ? config.next.includes(e.key)
        : e.key === config.next;

      if (isPrev) {
        e.preventDefault();
        newIndex = this.currentIndex - 1;
        if (newIndex < 0) {
          newIndex = wrap ? this.items.length - 1 : 0;
        }
      } else if (isNext) {
        e.preventDefault();
        newIndex = this.currentIndex + 1;
        if (newIndex >= this.items.length) {
          newIndex = wrap ? 0 : this.items.length - 1;
        }
      } else if (e.key === "Home") {
        e.preventDefault();
        newIndex = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        newIndex = this.items.length - 1;
      }

      if (newIndex !== this.currentIndex) {
        this.setActive(newIndex, true);
      }
    }

    setActive(index, focus = false) {
      // Remove tabindex from current
      if (this.items[this.currentIndex]) {
        this.items[this.currentIndex].tabIndex = -1;
      }

      // Set new active
      this.currentIndex = index;
      this.items[this.currentIndex].tabIndex = 0;

      if (focus) {
        this.items[this.currentIndex].focus();
      }

      this.options.onFocus?.(this.items[this.currentIndex], index);
    }

    refresh() {
      this.items = [...this.container.querySelectorAll(this.options.selector)];
      this.setActive(Math.min(this.currentIndex, this.items.length - 1));
    }

    destroy() {
      this.items.forEach((item) => {
        item.removeAttribute("tabindex");
      });
    }
  }

  // Initialize
  window.BaelFocus = new BaelFocus();

  // Global shortcuts
  window.$focus = window.BaelFocus;
  window.$trap = (el, opts) => window.BaelFocus.trap(el, opts);
  window.$untrap = (el) => window.BaelFocus.release(el);

  console.log("🎯 Bael Focus ready");
})();
