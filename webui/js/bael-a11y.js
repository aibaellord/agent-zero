/**
 * BAEL A11y Utilities - Accessibility Library
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete accessibility system:
 * - ARIA management
 * - Focus management
 * - Screen reader announcements
 * - Keyboard navigation
 * - Color contrast
 * - Motion preferences
 */

(function () {
  "use strict";

  class BaelA11y {
    constructor() {
      this.announcer = null;
      this.focusTrapStack = [];
      this.skipLinks = [];
      this.prefersReducedMotion = false;
      this.highContrast = false;

      this.init();
      console.log("♿ Bael A11y initialized");
    }

    init() {
      this.createAnnouncer();
      this.detectPreferences();
      this.setupListeners();
    }

    // ═══════════════════════════════════════════════════════════
    // ANNOUNCER (SCREEN READER)
    // ═══════════════════════════════════════════════════════════

    createAnnouncer() {
      // Polite announcer
      this.announcer = document.createElement("div");
      this.announcer.setAttribute("aria-live", "polite");
      this.announcer.setAttribute("aria-atomic", "true");
      this.announcer.className = "sr-only bael-announcer";
      this.announcer.style.cssText = `
                position: absolute !important;
                width: 1px !important;
                height: 1px !important;
                padding: 0 !important;
                margin: -1px !important;
                overflow: hidden !important;
                clip: rect(0, 0, 0, 0) !important;
                white-space: nowrap !important;
                border: 0 !important;
            `;
      document.body.appendChild(this.announcer);

      // Assertive announcer
      this.assertiveAnnouncer = document.createElement("div");
      this.assertiveAnnouncer.setAttribute("aria-live", "assertive");
      this.assertiveAnnouncer.setAttribute("aria-atomic", "true");
      this.assertiveAnnouncer.className = "sr-only bael-announcer-assertive";
      this.assertiveAnnouncer.style.cssText = this.announcer.style.cssText;
      document.body.appendChild(this.assertiveAnnouncer);
    }

    // Announce to screen readers
    announce(message, options = {}) {
      const { priority = "polite", delay = 100 } = options;
      const announcer =
        priority === "assertive" ? this.assertiveAnnouncer : this.announcer;

      // Clear and re-announce
      announcer.textContent = "";

      setTimeout(() => {
        announcer.textContent = message;
      }, delay);
    }

    // Clear announcements
    clearAnnouncements() {
      this.announcer.textContent = "";
      this.assertiveAnnouncer.textContent = "";
    }

    // ═══════════════════════════════════════════════════════════
    // FOCUS MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    // Get all focusable elements
    getFocusable(container = document) {
      const selector = [
        "a[href]",
        "button:not([disabled])",
        'input:not([disabled]):not([type="hidden"])',
        "select:not([disabled])",
        "textarea:not([disabled])",
        '[tabindex]:not([tabindex="-1"])',
        '[contenteditable="true"]',
      ].join(", ");

      return Array.from(container.querySelectorAll(selector)).filter((el) =>
        this.isVisible(el),
      );
    }

    // Check if element is visible
    isVisible(element) {
      if (!element) return false;

      const style = getComputedStyle(element);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        element.offsetParent !== null
      );
    }

    // Trap focus within container
    trapFocus(container) {
      const focusableElements = this.getFocusable(container);
      if (focusableElements.length === 0) return null;

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      // Store previous focus
      const previousFocus = document.activeElement;

      // Focus first element
      firstFocusable.focus();

      // Trap handler
      const trapHandler = (e) => {
        if (e.key !== "Tab") return;

        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      };

      container.addEventListener("keydown", trapHandler);

      const trap = {
        container,
        trapHandler,
        previousFocus,
        release: () => {
          container.removeEventListener("keydown", trapHandler);
          if (previousFocus && previousFocus.focus) {
            previousFocus.focus();
          }
          const index = this.focusTrapStack.indexOf(trap);
          if (index > -1) this.focusTrapStack.splice(index, 1);
        },
      };

      this.focusTrapStack.push(trap);
      return trap;
    }

    // Release current focus trap
    releaseFocusTrap() {
      const trap = this.focusTrapStack.pop();
      if (trap) {
        trap.release();
      }
    }

    // Focus first element in container
    focusFirst(container) {
      const focusable = this.getFocusable(container);
      if (focusable.length > 0) {
        focusable[0].focus();
        return focusable[0];
      }
      return null;
    }

    // Focus last element in container
    focusLast(container) {
      const focusable = this.getFocusable(container);
      if (focusable.length > 0) {
        focusable[focusable.length - 1].focus();
        return focusable[focusable.length - 1];
      }
      return null;
    }

    // Save and restore focus
    saveFocus() {
      return document.activeElement;
    }

    restoreFocus(element) {
      if (element && element.focus) {
        element.focus();
      }
    }

    // ═══════════════════════════════════════════════════════════
    // ARIA UTILITIES
    // ═══════════════════════════════════════════════════════════

    // Set ARIA attribute
    setAria(element, attribute, value) {
      element.setAttribute(`aria-${attribute}`, value);
      return this;
    }

    // Remove ARIA attribute
    removeAria(element, attribute) {
      element.removeAttribute(`aria-${attribute}`);
      return this;
    }

    // Toggle ARIA boolean
    toggleAria(element, attribute) {
      const current = element.getAttribute(`aria-${attribute}`);
      element.setAttribute(`aria-${attribute}`, current !== "true");
      return this;
    }

    // Set role
    setRole(element, role) {
      element.setAttribute("role", role);
      return this;
    }

    // Setup expandable
    setupExpandable(trigger, content) {
      const id = content.id || `expandable-${Date.now()}`;
      content.id = id;

      trigger.setAttribute("aria-controls", id);
      trigger.setAttribute("aria-expanded", "false");
      content.setAttribute("aria-hidden", "true");

      return {
        expand: () => {
          trigger.setAttribute("aria-expanded", "true");
          content.setAttribute("aria-hidden", "false");
        },
        collapse: () => {
          trigger.setAttribute("aria-expanded", "false");
          content.setAttribute("aria-hidden", "true");
        },
        toggle: () => {
          const expanded = trigger.getAttribute("aria-expanded") === "true";
          if (expanded) {
            this.setupExpandable(trigger, content).collapse();
          } else {
            this.setupExpandable(trigger, content).expand();
          }
        },
      };
    }

    // Setup tab panel
    setupTabs(tablist, options = {}) {
      const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
      const panels = tabs.map((tab) => {
        const panelId = tab.getAttribute("aria-controls");
        return document.getElementById(panelId);
      });

      tablist.setAttribute("role", "tablist");

      tabs.forEach((tab, index) => {
        tab.setAttribute("tabindex", index === 0 ? "0" : "-1");
        tab.setAttribute("aria-selected", index === 0 ? "true" : "false");
      });

      panels.forEach((panel, index) => {
        if (panel) {
          panel.setAttribute("role", "tabpanel");
          panel.setAttribute("aria-hidden", index !== 0 ? "true" : "false");
          panel.setAttribute("tabindex", "0");
        }
      });

      // Keyboard navigation
      tablist.addEventListener("keydown", (e) => {
        const currentIndex = tabs.indexOf(document.activeElement);
        let newIndex = currentIndex;

        switch (e.key) {
          case "ArrowLeft":
          case "ArrowUp":
            newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
            break;
          case "ArrowRight":
          case "ArrowDown":
            newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
            break;
          case "Home":
            newIndex = 0;
            break;
          case "End":
            newIndex = tabs.length - 1;
            break;
          default:
            return;
        }

        e.preventDefault();
        this.activateTab(tabs, panels, newIndex);
      });

      // Click handler
      tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => {
          this.activateTab(tabs, panels, index);
        });
      });

      return {
        activate: (index) => this.activateTab(tabs, panels, index),
        tabs,
        panels,
      };
    }

    activateTab(tabs, panels, index) {
      tabs.forEach((tab, i) => {
        tab.setAttribute("aria-selected", i === index ? "true" : "false");
        tab.setAttribute("tabindex", i === index ? "0" : "-1");
      });

      panels.forEach((panel, i) => {
        if (panel) {
          panel.setAttribute("aria-hidden", i !== index ? "true" : "false");
        }
      });

      tabs[index].focus();
    }

    // ═══════════════════════════════════════════════════════════
    // SKIP LINKS
    // ═══════════════════════════════════════════════════════════

    // Create skip link
    createSkipLink(targetId, text = "Skip to main content") {
      const link = document.createElement("a");
      link.href = `#${targetId}`;
      link.className = "bael-skip-link";
      link.textContent = text;
      link.style.cssText = `
                position: absolute;
                top: -40px;
                left: 0;
                background: #000;
                color: #fff;
                padding: 8px 16px;
                z-index: 100000;
                text-decoration: none;
                transition: top 0.2s;
            `;

      link.addEventListener("focus", () => {
        link.style.top = "0";
      });

      link.addEventListener("blur", () => {
        link.style.top = "-40px";
      });

      document.body.insertBefore(link, document.body.firstChild);
      this.skipLinks.push(link);

      return link;
    }

    // ═══════════════════════════════════════════════════════════
    // PREFERENCES
    // ═══════════════════════════════════════════════════════════

    detectPreferences() {
      // Reduced motion
      this.prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      // High contrast
      this.highContrast =
        window.matchMedia("(prefers-contrast: more)").matches ||
        window.matchMedia("(-ms-high-contrast: active)").matches;
    }

    setupListeners() {
      // Listen for preference changes
      window
        .matchMedia("(prefers-reduced-motion: reduce)")
        .addEventListener("change", (e) => {
          this.prefersReducedMotion = e.matches;
          document.body.classList.toggle("reduce-motion", e.matches);
        });

      window
        .matchMedia("(prefers-contrast: more)")
        .addEventListener("change", (e) => {
          this.highContrast = e.matches;
          document.body.classList.toggle("high-contrast", e.matches);
        });

      // Set initial classes
      document.body.classList.toggle(
        "reduce-motion",
        this.prefersReducedMotion,
      );
      document.body.classList.toggle("high-contrast", this.highContrast);
    }

    // Check reduced motion preference
    shouldReduceMotion() {
      return this.prefersReducedMotion;
    }

    // ═══════════════════════════════════════════════════════════
    // COLOR CONTRAST
    // ═══════════════════════════════════════════════════════════

    // Calculate relative luminance
    getLuminance(r, g, b) {
      const [rs, gs, bs] = [r, g, b].map((c) => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    // Calculate contrast ratio
    getContrastRatio(color1, color2) {
      const l1 = this.getLuminance(...color1);
      const l2 = this.getLuminance(...color2);
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    // Check WCAG compliance
    meetsWCAG(foreground, background, level = "AA", size = "normal") {
      const ratio = this.getContrastRatio(foreground, background);

      if (level === "AAA") {
        return size === "large" ? ratio >= 4.5 : ratio >= 7;
      }
      return size === "large" ? ratio >= 3 : ratio >= 4.5;
    }

    // Parse color to RGB
    parseColor(color) {
      if (Array.isArray(color)) return color;

      // Create temp element
      const temp = document.createElement("div");
      temp.style.color = color;
      document.body.appendChild(temp);
      const computed = getComputedStyle(temp).color;
      document.body.removeChild(temp);

      const match = computed.match(/\d+/g);
      return match ? match.slice(0, 3).map(Number) : [0, 0, 0];
    }

    // Suggest accessible color
    suggestAccessibleColor(foreground, background, level = "AA") {
      const bg = this.parseColor(background);
      const fg = this.parseColor(foreground);

      if (this.meetsWCAG(fg, bg, level)) {
        return foreground;
      }

      // Adjust foreground
      const bgLum = this.getLuminance(...bg);

      if (bgLum > 0.5) {
        // Light background, darken foreground
        return "#000000";
      } else {
        // Dark background, lighten foreground
        return "#ffffff";
      }
    }

    // ═══════════════════════════════════════════════════════════
    // KEYBOARD NAVIGATION
    // ═══════════════════════════════════════════════════════════

    // Setup roving tabindex
    setupRovingTabindex(container, selector) {
      const items = Array.from(container.querySelectorAll(selector));

      items.forEach((item, index) => {
        item.setAttribute("tabindex", index === 0 ? "0" : "-1");
      });

      container.addEventListener("keydown", (e) => {
        const currentIndex = items.indexOf(document.activeElement);
        let newIndex = currentIndex;

        switch (e.key) {
          case "ArrowUp":
          case "ArrowLeft":
            newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
            break;
          case "ArrowDown":
          case "ArrowRight":
            newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
            break;
          case "Home":
            newIndex = 0;
            break;
          case "End":
            newIndex = items.length - 1;
            break;
          default:
            return;
        }

        e.preventDefault();
        items[currentIndex]?.setAttribute("tabindex", "-1");
        items[newIndex].setAttribute("tabindex", "0");
        items[newIndex].focus();
      });

      return items;
    }

    // Add keyboard hint
    addKeyboardHint(element, key, description) {
      element.setAttribute("aria-keyshortcuts", key);
      element.title = `${element.title || ""} (${key}: ${description})`.trim();
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    // Generate unique ID
    generateId(prefix = "bael") {
      return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Ensure element has ID
    ensureId(element, prefix = "bael") {
      if (!element.id) {
        element.id = this.generateId(prefix);
      }
      return element.id;
    }

    // Associate label with input
    associateLabel(input, label) {
      const id = this.ensureId(input);
      label.setAttribute("for", id);
    }

    // Setup live region
    createLiveRegion(politeness = "polite") {
      const region = document.createElement("div");
      region.setAttribute("aria-live", politeness);
      region.setAttribute("aria-atomic", "true");
      region.className = "sr-only";
      region.style.cssText = this.announcer.style.cssText;
      document.body.appendChild(region);
      return region;
    }
  }

  // Initialize
  window.BaelA11y = new BaelA11y();

  // Global shortcuts
  window.$a11y = window.BaelA11y;
  window.$announce = (msg, opts) => window.BaelA11y.announce(msg, opts);
  window.$trapFocus = (container) => window.BaelA11y.trapFocus(container);
})();
