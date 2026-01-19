/**
 * BAEL Transition - Animation Transitions System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete transition system:
 * - Enter/Leave transitions
 * - CSS transitions
 * - JavaScript animations
 * - Staggered animations
 * - List transitions
 */

(function () {
  "use strict";

  class BaelTransition {
    constructor() {
      this.presets = new Map();
      this._registerPresets();
      console.log("✨ Bael Transition initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // PRESETS
    // ═══════════════════════════════════════════════════════════

    _registerPresets() {
      this.presets.set("fade", {
        enter: { opacity: 0 },
        enterActive: { opacity: 1 },
        leave: { opacity: 1 },
        leaveActive: { opacity: 0 },
        duration: 300,
      });

      this.presets.set("slide-up", {
        enter: { opacity: 0, transform: "translateY(20px)" },
        enterActive: { opacity: 1, transform: "translateY(0)" },
        leave: { opacity: 1, transform: "translateY(0)" },
        leaveActive: { opacity: 0, transform: "translateY(-20px)" },
        duration: 300,
      });

      this.presets.set("slide-down", {
        enter: { opacity: 0, transform: "translateY(-20px)" },
        enterActive: { opacity: 1, transform: "translateY(0)" },
        leave: { opacity: 1, transform: "translateY(0)" },
        leaveActive: { opacity: 0, transform: "translateY(20px)" },
        duration: 300,
      });

      this.presets.set("slide-left", {
        enter: { opacity: 0, transform: "translateX(20px)" },
        enterActive: { opacity: 1, transform: "translateX(0)" },
        leave: { opacity: 1, transform: "translateX(0)" },
        leaveActive: { opacity: 0, transform: "translateX(-20px)" },
        duration: 300,
      });

      this.presets.set("slide-right", {
        enter: { opacity: 0, transform: "translateX(-20px)" },
        enterActive: { opacity: 1, transform: "translateX(0)" },
        leave: { opacity: 1, transform: "translateX(0)" },
        leaveActive: { opacity: 0, transform: "translateX(20px)" },
        duration: 300,
      });

      this.presets.set("scale", {
        enter: { opacity: 0, transform: "scale(0.9)" },
        enterActive: { opacity: 1, transform: "scale(1)" },
        leave: { opacity: 1, transform: "scale(1)" },
        leaveActive: { opacity: 0, transform: "scale(0.9)" },
        duration: 300,
      });

      this.presets.set("scale-up", {
        enter: { opacity: 0, transform: "scale(0.5)" },
        enterActive: { opacity: 1, transform: "scale(1)" },
        leave: { opacity: 1, transform: "scale(1)" },
        leaveActive: { opacity: 0, transform: "scale(1.5)" },
        duration: 400,
      });

      this.presets.set("flip", {
        enter: { opacity: 0, transform: "rotateY(90deg)" },
        enterActive: { opacity: 1, transform: "rotateY(0)" },
        leave: { opacity: 1, transform: "rotateY(0)" },
        leaveActive: { opacity: 0, transform: "rotateY(-90deg)" },
        duration: 400,
      });

      this.presets.set("zoom", {
        enter: { opacity: 0, transform: "scale(0)" },
        enterActive: { opacity: 1, transform: "scale(1)" },
        leave: { opacity: 1, transform: "scale(1)" },
        leaveActive: { opacity: 0, transform: "scale(0)" },
        duration: 300,
      });

      this.presets.set("bounce", {
        enter: { opacity: 0, transform: "scale(0.3)" },
        enterActive: { opacity: 1, transform: "scale(1)" },
        leave: { opacity: 1, transform: "scale(1)" },
        leaveActive: { opacity: 0, transform: "scale(0.3)" },
        duration: 400,
        easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      });
    }

    registerPreset(name, config) {
      this.presets.set(name, config);
      return this;
    }

    getPreset(name) {
      return this.presets.get(name);
    }

    // ═══════════════════════════════════════════════════════════
    // ENTER TRANSITION
    // ═══════════════════════════════════════════════════════════

    async enter(element, config = {}) {
      const el = this._getElement(element);
      const preset =
        typeof config === "string" ? this.presets.get(config) : null;
      const options = preset ? { ...preset, ...config } : config;

      const {
        enter = { opacity: 0 },
        enterActive = { opacity: 1 },
        duration = 300,
        easing = "ease-out",
        onStart,
        onEnd,
      } = options;

      // Initial state
      Object.assign(el.style, enter);
      el.style.transition = "none";

      // Force reflow
      el.offsetHeight;

      onStart?.();

      // Set transition
      el.style.transition = `all ${duration}ms ${easing}`;

      // Apply active state
      Object.assign(el.style, enterActive);

      // Wait for completion
      await this._waitForTransition(el, duration);

      // Cleanup
      el.style.transition = "";

      onEnd?.();

      return el;
    }

    // ═══════════════════════════════════════════════════════════
    // LEAVE TRANSITION
    // ═══════════════════════════════════════════════════════════

    async leave(element, config = {}) {
      const el = this._getElement(element);
      const preset =
        typeof config === "string" ? this.presets.get(config) : null;
      const options = preset ? { ...preset, ...config } : config;

      const {
        leave = { opacity: 1 },
        leaveActive = { opacity: 0 },
        duration = 300,
        easing = "ease-in",
        onStart,
        onEnd,
        remove = false,
      } = options;

      // Initial state
      Object.assign(el.style, leave);
      el.style.transition = "none";

      // Force reflow
      el.offsetHeight;

      onStart?.();

      // Set transition
      el.style.transition = `all ${duration}ms ${easing}`;

      // Apply active state
      Object.assign(el.style, leaveActive);

      // Wait for completion
      await this._waitForTransition(el, duration);

      // Cleanup
      el.style.transition = "";

      if (remove) {
        el.remove();
      }

      onEnd?.();

      return el;
    }

    // ═══════════════════════════════════════════════════════════
    // TOGGLE
    // ═══════════════════════════════════════════════════════════

    async toggle(element, show, config = {}) {
      return show ? this.enter(element, config) : this.leave(element, config);
    }

    async show(element, config = "fade") {
      const el = this._getElement(element);
      el.style.display = "";
      return this.enter(el, config);
    }

    async hide(element, config = "fade") {
      const el = this._getElement(element);
      await this.leave(el, config);
      el.style.display = "none";
      return el;
    }

    // ═══════════════════════════════════════════════════════════
    // STAGGERED ANIMATIONS
    // ═══════════════════════════════════════════════════════════

    async staggerEnter(elements, config = {}) {
      const els = this._getElements(elements);
      const preset =
        typeof config === "string" ? this.presets.get(config) : null;
      const options = preset ? { ...preset, ...config } : config;

      const { stagger = 50, onStart, onEnd } = options;

      onStart?.();

      const promises = els.map((el, i) =>
        this._delay(i * stagger).then(() => this.enter(el, options)),
      );

      await Promise.all(promises);

      onEnd?.();

      return els;
    }

    async staggerLeave(elements, config = {}) {
      const els = this._getElements(elements);
      const preset =
        typeof config === "string" ? this.presets.get(config) : null;
      const options = preset ? { ...preset, ...config } : config;

      const { stagger = 50, onStart, onEnd } = options;

      onStart?.();

      const promises = els.map((el, i) =>
        this._delay(i * stagger).then(() => this.leave(el, options)),
      );

      await Promise.all(promises);

      onEnd?.();

      return els;
    }

    // ═══════════════════════════════════════════════════════════
    // LIST TRANSITIONS
    // ═══════════════════════════════════════════════════════════

    createListTransition(container, config = {}) {
      return new ListTransition(this, container, config);
    }

    // ═══════════════════════════════════════════════════════════
    // CSS CLASS TRANSITIONS
    // ═══════════════════════════════════════════════════════════

    async addClass(element, className, duration) {
      const el = this._getElement(element);
      el.classList.add(className);

      if (duration) {
        await this._delay(duration);
      }

      return el;
    }

    async removeClass(element, className, duration) {
      const el = this._getElement(element);
      el.classList.remove(className);

      if (duration) {
        await this._delay(duration);
      }

      return el;
    }

    async toggleClass(element, className, force, duration) {
      const el = this._getElement(element);
      el.classList.toggle(className, force);

      if (duration) {
        await this._delay(duration);
      }

      return el;
    }

    // ═══════════════════════════════════════════════════════════
    // HEIGHT TRANSITIONS
    // ═══════════════════════════════════════════════════════════

    async expandHeight(element, config = {}) {
      const el = this._getElement(element);
      const { duration = 300, easing = "ease-out" } = config;

      // Get natural height
      el.style.height = "auto";
      el.style.overflow = "hidden";
      const targetHeight = el.scrollHeight;

      // Start from 0
      el.style.height = "0";
      el.offsetHeight; // Force reflow

      // Animate
      el.style.transition = `height ${duration}ms ${easing}`;
      el.style.height = `${targetHeight}px`;

      await this._waitForTransition(el, duration);

      // Cleanup
      el.style.height = "";
      el.style.overflow = "";
      el.style.transition = "";

      return el;
    }

    async collapseHeight(element, config = {}) {
      const el = this._getElement(element);
      const { duration = 300, easing = "ease-in" } = config;

      // Get current height
      el.style.height = `${el.scrollHeight}px`;
      el.style.overflow = "hidden";
      el.offsetHeight; // Force reflow

      // Animate to 0
      el.style.transition = `height ${duration}ms ${easing}`;
      el.style.height = "0";

      await this._waitForTransition(el, duration);

      // Cleanup
      el.style.transition = "";

      return el;
    }

    async toggleHeight(element, show, config = {}) {
      return show
        ? this.expandHeight(element, config)
        : this.collapseHeight(element, config);
    }

    // ═══════════════════════════════════════════════════════════
    // CROSSFADE
    // ═══════════════════════════════════════════════════════════

    async crossfade(outElement, inElement, config = {}) {
      const outEl = this._getElement(outElement);
      const inEl = this._getElement(inElement);
      const { duration = 300, easing = "ease" } = config;

      // Position in element
      inEl.style.position = "absolute";
      inEl.style.top = "0";
      inEl.style.left = "0";
      inEl.style.opacity = "0";

      // Animate both
      outEl.style.transition = `opacity ${duration}ms ${easing}`;
      inEl.style.transition = `opacity ${duration}ms ${easing}`;

      outEl.offsetHeight; // Force reflow

      outEl.style.opacity = "0";
      inEl.style.opacity = "1";

      await this._delay(duration);

      // Cleanup
      outEl.style.transition = "";
      outEl.style.display = "none";

      inEl.style.transition = "";
      inEl.style.position = "";
      inEl.style.top = "";
      inEl.style.left = "";

      return inEl;
    }

    // ═══════════════════════════════════════════════════════════
    // FLIP (First, Last, Invert, Play)
    // ═══════════════════════════════════════════════════════════

    flip(elements, updateFn, config = {}) {
      const els = this._getElements(elements);
      const { duration = 300, easing = "ease-out" } = config;

      // First: Record initial positions
      const firstRects = els.map((el) => el.getBoundingClientRect());

      // Update the DOM
      updateFn();

      // Last: Record new positions
      const lastRects = els.map((el) => el.getBoundingClientRect());

      // Invert & Play
      els.forEach((el, i) => {
        const first = firstRects[i];
        const last = lastRects[i];

        const deltaX = first.left - last.left;
        const deltaY = first.top - last.top;
        const deltaW = first.width / last.width;
        const deltaH = first.height / last.height;

        el.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`;
        el.style.transformOrigin = "top left";

        requestAnimationFrame(() => {
          el.style.transition = `transform ${duration}ms ${easing}`;
          el.style.transform = "";
        });
      });

      // Cleanup after animation
      setTimeout(() => {
        els.forEach((el) => {
          el.style.transition = "";
          el.style.transformOrigin = "";
        });
      }, duration);

      return els;
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    _getElement(el) {
      return typeof el === "string" ? document.querySelector(el) : el;
    }

    _getElements(els) {
      if (typeof els === "string") {
        return [...document.querySelectorAll(els)];
      }
      if (els instanceof NodeList || els instanceof HTMLCollection) {
        return [...els];
      }
      return Array.isArray(els) ? els : [els];
    }

    _delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    _waitForTransition(el, duration) {
      return new Promise((resolve) => {
        const onEnd = () => {
          el.removeEventListener("transitionend", onEnd);
          resolve();
        };

        el.addEventListener("transitionend", onEnd);

        // Fallback timeout
        setTimeout(resolve, duration + 50);
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // LIST TRANSITION
  // ═══════════════════════════════════════════════════════════════════

  class ListTransition {
    constructor(transition, container, config) {
      this.transition = transition;
      this.container = transition._getElement(container);
      this.config = {
        preset: "fade",
        stagger: 30,
        duration: 300,
        ...config,
      };
    }

    async add(element, position = "end") {
      const el = this.transition._getElement(element);

      // Set initial state
      el.style.opacity = "0";

      // Insert element
      if (position === "start") {
        this.container.prepend(el);
      } else if (typeof position === "number") {
        const children = this.container.children;
        if (position < children.length) {
          this.container.insertBefore(el, children[position]);
        } else {
          this.container.appendChild(el);
        }
      } else {
        this.container.appendChild(el);
      }

      // Animate entry
      await this.transition.enter(el, this.config.preset);

      return el;
    }

    async remove(element) {
      const el = this.transition._getElement(element);
      await this.transition.leave(el, { ...this.config, remove: true });
      return el;
    }

    async move(element, newPosition) {
      const el = this.transition._getElement(element);
      const children = [...this.container.children];

      this.transition.flip(
        children,
        () => {
          if (newPosition < children.length) {
            this.container.insertBefore(el, children[newPosition]);
          } else {
            this.container.appendChild(el);
          }
        },
        { duration: this.config.duration },
      );

      return el;
    }

    async clear() {
      const children = [...this.container.children];
      await this.transition.staggerLeave(children, {
        ...this.config,
        remove: true,
      });
    }
  }

  // Initialize
  window.BaelTransition = new BaelTransition();

  // Global shortcuts
  window.$transition = window.BaelTransition;
  window.$enter = (el, cfg) => window.BaelTransition.enter(el, cfg);
  window.$leave = (el, cfg) => window.BaelTransition.leave(el, cfg);

  console.log("✨ Bael Transition ready");
})();
