/**
 * BAEL Animation Engine - Smooth Motion Library
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete animation system:
 * - CSS transitions
 * - Keyframe animations
 * - Spring physics
 * - Scroll animations
 * - Stagger effects
 * - Animation timeline
 */

(function () {
  "use strict";

  class BaelAnimate {
    constructor() {
      this.animations = new Map();
      this.springs = [];
      this.scrollTriggers = [];
      this.rafId = null;
      this.easings = this.createEasings();
      this.init();
    }

    init() {
      this.observeScrollTriggers();
      this.addStyles();
      console.log("✨ Bael Animation Engine initialized");
    }

    // Create easing functions
    createEasings() {
      return {
        linear: (t) => t,
        easeIn: (t) => t * t,
        easeOut: (t) => t * (2 - t),
        easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
        easeInCubic: (t) => t * t * t,
        easeOutCubic: (t) => --t * t * t + 1,
        easeInOutCubic: (t) =>
          t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        easeInQuart: (t) => t * t * t * t,
        easeOutQuart: (t) => 1 - --t * t * t * t,
        easeInOutQuart: (t) =>
          t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t,
        easeInExpo: (t) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
        easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
        easeInOutExpo: (t) => {
          if (t === 0 || t === 1) return t;
          return t < 0.5
            ? Math.pow(2, 10 * (2 * t - 1)) / 2
            : (2 - Math.pow(2, -10 * (2 * t - 1))) / 2;
        },
        easeInElastic: (t) => {
          if (t === 0 || t === 1) return t;
          return -Math.pow(2, 10 * (t - 1)) * Math.sin((t - 1.1) * 5 * Math.PI);
        },
        easeOutElastic: (t) => {
          if (t === 0 || t === 1) return t;
          return Math.pow(2, -10 * t) * Math.sin((t - 0.1) * 5 * Math.PI) + 1;
        },
        easeInBack: (t) => t * t * (2.70158 * t - 1.70158),
        easeOutBack: (t) => 1 - --t * t * (-2.70158 * t - 1.70158),
        easeInOutBack: (t) => {
          const c = 1.70158 * 1.525;
          return t < 0.5
            ? ((2 * t) ** 2 * ((c + 1) * 2 * t - c)) / 2
            : ((2 * t - 2) ** 2 * ((c + 1) * (2 * t - 2) + c) + 2) / 2;
        },
        easeOutBounce: (t) => {
          if (t < 1 / 2.75) return 7.5625 * t * t;
          if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
          if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
          return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        },
      };
    }

    // Animate an element
    animate(element, properties, options = {}) {
      return new Promise((resolve) => {
        const el =
          typeof element === "string"
            ? document.querySelector(element)
            : element;
        if (!el) {
          resolve(null);
          return;
        }

        const {
          duration = 300,
          delay = 0,
          easing = "easeOut",
          fill = "forwards",
        } = options;

        const id = this.generateId();
        const easeFn =
          typeof easing === "function"
            ? easing
            : this.easings[easing] || this.easings.easeOut;
        const startTime = performance.now() + delay;
        const startValues = {};
        const changes = {};

        // Get starting values
        const computed = getComputedStyle(el);
        for (const [prop, value] of Object.entries(properties)) {
          const current = parseFloat(computed[prop]) || 0;
          startValues[prop] = current;
          changes[prop] =
            (typeof value === "number" ? value : parseFloat(value)) - current;
        }

        const tick = (now) => {
          if (now < startTime) {
            requestAnimationFrame(tick);
            return;
          }

          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = easeFn(progress);

          for (const [prop, change] of Object.entries(changes)) {
            const current = startValues[prop] + change * eased;
            const unit =
              this.getUnit(properties[prop]) || this.getDefaultUnit(prop);
            el.style[prop] = `${current}${unit}`;
          }

          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            this.animations.delete(id);
            options.onComplete?.();
            resolve(el);
          }
        };

        this.animations.set(id, {
          element: el,
          cancel: () => this.animations.delete(id),
        });
        requestAnimationFrame(tick);
      });
    }

    // Quick animation presets
    fadeIn(element, duration = 300) {
      const el =
        typeof element === "string" ? document.querySelector(element) : element;
      if (!el) return Promise.resolve(null);

      el.style.opacity = "0";
      el.style.display = "";
      return this.animate(el, { opacity: 1 }, { duration });
    }

    fadeOut(element, duration = 300) {
      return this.animate(element, { opacity: 0 }, { duration }).then((el) => {
        if (el) el.style.display = "none";
        return el;
      });
    }

    slideDown(element, duration = 300) {
      const el =
        typeof element === "string" ? document.querySelector(element) : element;
      if (!el) return Promise.resolve(null);

      el.style.height = "auto";
      el.style.overflow = "hidden";
      const height = el.offsetHeight;
      el.style.height = "0";
      el.style.display = "";

      return this.animate(el, { height }, { duration }).then(() => {
        el.style.height = "";
        el.style.overflow = "";
        return el;
      });
    }

    slideUp(element, duration = 300) {
      const el =
        typeof element === "string" ? document.querySelector(element) : element;
      if (!el) return Promise.resolve(null);

      el.style.overflow = "hidden";
      return this.animate(el, { height: 0 }, { duration }).then(() => {
        el.style.display = "none";
        el.style.height = "";
        el.style.overflow = "";
        return el;
      });
    }

    scale(element, scale, duration = 300) {
      const el =
        typeof element === "string" ? document.querySelector(element) : element;
      if (!el) return Promise.resolve(null);

      el.style.transform = `scale(${scale === 1 ? 0 : 1})`;
      el.style.transition = `transform ${duration}ms ease`;

      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          el.style.transform = `scale(${scale})`;
          setTimeout(() => {
            el.style.transition = "";
            resolve(el);
          }, duration);
        });
      });
    }

    // Spring physics animation
    spring(element, properties, options = {}) {
      return new Promise((resolve) => {
        const el =
          typeof element === "string"
            ? document.querySelector(element)
            : element;
        if (!el) {
          resolve(null);
          return;
        }

        const { stiffness = 100, damping = 10, mass = 1 } = options;

        const springs = [];
        const computed = getComputedStyle(el);

        for (const [prop, target] of Object.entries(properties)) {
          const current = parseFloat(computed[prop]) || 0;
          springs.push({
            prop,
            target: typeof target === "number" ? target : parseFloat(target),
            current,
            velocity: 0,
            unit: this.getUnit(target) || this.getDefaultUnit(prop),
          });
        }

        const tick = () => {
          let allSettled = true;

          for (const spring of springs) {
            const distance = spring.target - spring.current;
            const springForce = stiffness * distance;
            const dampingForce = damping * spring.velocity;
            const acceleration = (springForce - dampingForce) / mass;

            spring.velocity += acceleration * 0.016; // ~60fps
            spring.current += spring.velocity * 0.016;

            el.style[spring.prop] = `${spring.current}${spring.unit}`;

            if (Math.abs(distance) > 0.01 || Math.abs(spring.velocity) > 0.01) {
              allSettled = false;
            }
          }

          if (!allSettled) {
            requestAnimationFrame(tick);
          } else {
            // Snap to final values
            for (const spring of springs) {
              el.style[spring.prop] = `${spring.target}${spring.unit}`;
            }
            resolve(el);
          }
        };

        requestAnimationFrame(tick);
      });
    }

    // Stagger animation for multiple elements
    stagger(elements, properties, options = {}) {
      const {
        delay = 50,
        from = "start", // 'start', 'end', 'center', 'random'
        ...animOptions
      } = options;

      const els =
        typeof elements === "string"
          ? Array.from(document.querySelectorAll(elements))
          : Array.from(elements);

      if (els.length === 0) return Promise.resolve([]);

      let indices = els.map((_, i) => i);

      switch (from) {
        case "end":
          indices = indices.reverse();
          break;
        case "center":
          const center = Math.floor(els.length / 2);
          indices = indices.sort(
            (a, b) => Math.abs(a - center) - Math.abs(b - center),
          );
          break;
        case "random":
          indices = indices.sort(() => Math.random() - 0.5);
          break;
      }

      return Promise.all(
        indices.map((originalIndex, staggerIndex) =>
          this.animate(els[originalIndex], properties, {
            ...animOptions,
            delay: (animOptions.delay || 0) + staggerIndex * delay,
          }),
        ),
      );
    }

    // Timeline for sequenced animations
    timeline() {
      const steps = [];
      let currentOffset = 0;

      const timeline = {
        add: (target, properties, options = {}) => {
          const offset = options.offset ?? currentOffset;
          steps.push({
            target,
            properties,
            options: { ...options, delay: offset },
          });
          currentOffset = offset + (options.duration || 300);
          return timeline;
        },
        parallel: (target, properties, options = {}) => {
          steps.push({
            target,
            properties,
            options: { ...options, delay: currentOffset },
          });
          return timeline;
        },
        wait: (duration) => {
          currentOffset += duration;
          return timeline;
        },
        play: async () => {
          const promises = steps.map((step) =>
            this.animate(step.target, step.properties, step.options),
          );
          return Promise.all(promises);
        },
      };

      return timeline;
    }

    // Scroll-triggered animations
    scrollTrigger(element, options = {}) {
      const el =
        typeof element === "string" ? document.querySelector(element) : element;
      if (!el) return null;

      const config = {
        element: el,
        threshold: options.threshold || 0.1,
        once: options.once !== false,
        animation: options.animation || "fadeIn",
        duration: options.duration || 500,
        delay: options.delay || 0,
        onEnter: options.onEnter,
        onLeave: options.onLeave,
        triggered: false,
      };

      // Add initial hidden state
      if (config.animation === "fadeIn") {
        el.style.opacity = "0";
      } else if (config.animation === "slideUp") {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
      } else if (config.animation === "slideLeft") {
        el.style.opacity = "0";
        el.style.transform = "translateX(30px)";
      } else if (config.animation === "scale") {
        el.style.opacity = "0";
        el.style.transform = "scale(0.9)";
      }

      this.scrollTriggers.push(config);
      return config;
    }

    // Observe scroll triggers
    observeScrollTriggers() {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const config = this.scrollTriggers.find(
              (t) => t.element === entry.target,
            );
            if (!config) return;

            if (entry.isIntersecting && (!config.once || !config.triggered)) {
              config.triggered = true;

              setTimeout(() => {
                this.runScrollAnimation(config);
                config.onEnter?.(config.element);
              }, config.delay);
            } else if (!entry.isIntersecting) {
              config.onLeave?.(config.element);

              if (!config.once) {
                this.resetScrollAnimation(config);
                config.triggered = false;
              }
            }
          });
        },
        { threshold: 0.1 },
      );

      // Auto-observe elements with data-animate attribute
      document.querySelectorAll("[data-animate]").forEach((el) => {
        this.scrollTrigger(el, {
          animation: el.dataset.animate,
          duration: parseInt(el.dataset.animateDuration) || 500,
          delay: parseInt(el.dataset.animateDelay) || 0,
          once: el.dataset.animateOnce !== "false",
        });
      });

      // Re-observe
      this.scrollTriggers.forEach((config) => observer.observe(config.element));

      // Store observer for new triggers
      this.scrollObserver = observer;
    }

    // Run scroll animation
    runScrollAnimation(config) {
      const el = config.element;
      el.style.transition = `opacity ${config.duration}ms ease, transform ${config.duration}ms ease`;

      requestAnimationFrame(() => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    }

    // Reset scroll animation
    resetScrollAnimation(config) {
      const el = config.element;

      if (config.animation === "fadeIn") {
        el.style.opacity = "0";
      } else if (config.animation === "slideUp") {
        el.style.opacity = "0";
        el.style.transform = "translateY(30px)";
      } else if (config.animation === "slideLeft") {
        el.style.opacity = "0";
        el.style.transform = "translateX(30px)";
      } else if (config.animation === "scale") {
        el.style.opacity = "0";
        el.style.transform = "scale(0.9)";
      }
    }

    // Keyframe animation
    keyframes(element, keyframes, options = {}) {
      const el =
        typeof element === "string" ? document.querySelector(element) : element;
      if (!el) return Promise.resolve(null);

      const animation = el.animate(keyframes, {
        duration: options.duration || 300,
        easing: options.easing || "ease",
        fill: options.fill || "forwards",
        iterations: options.iterations || 1,
        delay: options.delay || 0,
      });

      return animation.finished.then(() => el);
    }

    // Predefined keyframe animations
    bounce(element, duration = 500) {
      return this.keyframes(
        element,
        [
          { transform: "scale(1)", offset: 0 },
          { transform: "scale(1.2)", offset: 0.3 },
          { transform: "scale(0.9)", offset: 0.5 },
          { transform: "scale(1.1)", offset: 0.7 },
          { transform: "scale(1)", offset: 1 },
        ],
        { duration, easing: "ease-out" },
      );
    }

    shake(element, duration = 500) {
      return this.keyframes(
        element,
        [
          { transform: "translateX(0)" },
          { transform: "translateX(-10px)" },
          { transform: "translateX(10px)" },
          { transform: "translateX(-10px)" },
          { transform: "translateX(10px)" },
          { transform: "translateX(0)" },
        ],
        { duration, easing: "ease-in-out" },
      );
    }

    pulse(element, duration = 500) {
      return this.keyframes(
        element,
        [
          { transform: "scale(1)", opacity: 1 },
          { transform: "scale(1.05)", opacity: 0.9 },
          { transform: "scale(1)", opacity: 1 },
        ],
        { duration, easing: "ease-in-out" },
      );
    }

    flip(element, duration = 500) {
      return this.keyframes(
        element,
        [
          { transform: "perspective(400px) rotateY(0)" },
          { transform: "perspective(400px) rotateY(-180deg)" },
        ],
        { duration, easing: "ease-in-out" },
      );
    }

    // Get unit from value
    getUnit(value) {
      if (typeof value !== "string") return "";
      const match = value.match(/[a-z%]+$/i);
      return match ? match[0] : "";
    }

    // Get default unit for property
    getDefaultUnit(prop) {
      const pxProps = [
        "width",
        "height",
        "top",
        "left",
        "right",
        "bottom",
        "margin",
        "padding",
        "fontSize",
      ];
      return pxProps.some((p) => prop.toLowerCase().includes(p.toLowerCase()))
        ? "px"
        : "";
    }

    // Generate unique ID
    generateId() {
      return "anim_" + Math.random().toString(36).substr(2, 9);
    }

    // Cancel all animations on element
    cancel(element) {
      this.animations.forEach((anim, id) => {
        if (anim.element === element) {
          anim.cancel();
        }
      });
    }

    // Add styles
    addStyles() {
      const style = document.createElement("style");
      style.textContent = `
                [data-animate] {
                    will-change: opacity, transform;
                }

                @keyframes bael-fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes bael-fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }

                @keyframes bael-slideInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes bael-slideInDown {
                    from { opacity: 0; transform: translateY(-30px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes bael-slideInLeft {
                    from { opacity: 0; transform: translateX(-30px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                @keyframes bael-slideInRight {
                    from { opacity: 0; transform: translateX(30px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                @keyframes bael-scaleIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }

                @keyframes bael-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes bael-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                @keyframes bael-bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                .animate-fadeIn { animation: bael-fadeIn 0.3s ease forwards; }
                .animate-fadeOut { animation: bael-fadeOut 0.3s ease forwards; }
                .animate-slideInUp { animation: bael-slideInUp 0.3s ease forwards; }
                .animate-slideInDown { animation: bael-slideInDown 0.3s ease forwards; }
                .animate-slideInLeft { animation: bael-slideInLeft 0.3s ease forwards; }
                .animate-slideInRight { animation: bael-slideInRight 0.3s ease forwards; }
                .animate-scaleIn { animation: bael-scaleIn 0.3s ease forwards; }
                .animate-spin { animation: bael-spin 1s linear infinite; }
                .animate-pulse { animation: bael-pulse 2s ease-in-out infinite; }
                .animate-bounce { animation: bael-bounce 1s ease infinite; }
            `;
      document.head.appendChild(style);
    }
  }

  // Initialize
  window.BaelAnimate = new BaelAnimate();

  // Global shortcut
  window.$animate = (element, properties, options) =>
    window.BaelAnimate.animate(element, properties, options);
})();
