/**
 * BAEL Animation Component - Lord Of All Motion
 *
 * Animation utilities and effects:
 * - Entrance animations
 * - Exit animations
 * - Attention seekers
 * - Scroll animations
 * - Stagger effects
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // ANIMATION CLASS
  // ============================================================

  class BaelAnimation {
    constructor() {
      this.observers = new Map();
      this._injectStyles();
    }

    /**
     * Inject animation styles
     */
    _injectStyles() {
      if (document.getElementById("bael-animation-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-animation-styles";
      styles.textContent = `
                /* Animation defaults */
                [data-bael-animate] {
                    --anim-duration: 0.5s;
                    --anim-delay: 0s;
                    --anim-easing: cubic-bezier(0.4, 0, 0.2, 1);
                }

                /* ====================== */
                /* ENTRANCE ANIMATIONS    */
                /* ====================== */

                @keyframes bael-fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes bael-fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes bael-fadeInDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                @keyframes bael-fadeInLeft {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                @keyframes bael-fadeInRight {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                @keyframes bael-zoomIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }

                @keyframes bael-zoomInBig {
                    from { opacity: 0; transform: scale(0.5); }
                    to { opacity: 1; transform: scale(1); }
                }

                @keyframes bael-slideInUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }

                @keyframes bael-slideInDown {
                    from { transform: translateY(-100%); }
                    to { transform: translateY(0); }
                }

                @keyframes bael-slideInLeft {
                    from { transform: translateX(-100%); }
                    to { transform: translateX(0); }
                }

                @keyframes bael-slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }

                @keyframes bael-flipInX {
                    from { opacity: 0; transform: perspective(400px) rotateX(-90deg); }
                    to { opacity: 1; transform: perspective(400px) rotateX(0); }
                }

                @keyframes bael-flipInY {
                    from { opacity: 0; transform: perspective(400px) rotateY(-90deg); }
                    to { opacity: 1; transform: perspective(400px) rotateY(0); }
                }

                @keyframes bael-bounceIn {
                    0% { opacity: 0; transform: scale(0.3); }
                    50% { transform: scale(1.05); }
                    70% { transform: scale(0.9); }
                    100% { opacity: 1; transform: scale(1); }
                }

                /* ====================== */
                /* EXIT ANIMATIONS        */
                /* ====================== */

                @keyframes bael-fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }

                @keyframes bael-fadeOutUp {
                    from { opacity: 1; transform: translateY(0); }
                    to { opacity: 0; transform: translateY(-20px); }
                }

                @keyframes bael-fadeOutDown {
                    from { opacity: 1; transform: translateY(0); }
                    to { opacity: 0; transform: translateY(20px); }
                }

                @keyframes bael-zoomOut {
                    from { opacity: 1; transform: scale(1); }
                    to { opacity: 0; transform: scale(0.9); }
                }

                @keyframes bael-slideOutUp {
                    from { transform: translateY(0); }
                    to { transform: translateY(-100%); }
                }

                @keyframes bael-slideOutDown {
                    from { transform: translateY(0); }
                    to { transform: translateY(100%); }
                }

                /* ====================== */
                /* ATTENTION SEEKERS      */
                /* ====================== */

                @keyframes bael-pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }

                @keyframes bael-bounce {
                    0%, 20%, 53%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-15px); }
                    60% { transform: translateY(-7px); }
                }

                @keyframes bael-shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }

                @keyframes bael-wobble {
                    0%, 100% { transform: translateX(0) rotate(0); }
                    15% { transform: translateX(-10px) rotate(-5deg); }
                    30% { transform: translateX(8px) rotate(3deg); }
                    45% { transform: translateX(-6px) rotate(-3deg); }
                    60% { transform: translateX(4px) rotate(2deg); }
                    75% { transform: translateX(-2px) rotate(-1deg); }
                }

                @keyframes bael-swing {
                    0%, 100% { transform: rotate(0); }
                    20% { transform: rotate(15deg); }
                    40% { transform: rotate(-10deg); }
                    60% { transform: rotate(5deg); }
                    80% { transform: rotate(-5deg); }
                }

                @keyframes bael-tada {
                    0%, 100% { transform: scale(1) rotate(0); }
                    10%, 20% { transform: scale(0.9) rotate(-3deg); }
                    30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
                    40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
                }

                @keyframes bael-jello {
                    0%, 100% { transform: skewX(0) skewY(0); }
                    25% { transform: skewX(-12.5deg) skewY(-12.5deg); }
                    50% { transform: skewX(6.25deg) skewY(6.25deg); }
                    75% { transform: skewX(-3.125deg) skewY(-3.125deg); }
                }

                @keyframes bael-heartBeat {
                    0%, 100% { transform: scale(1); }
                    14% { transform: scale(1.3); }
                    28% { transform: scale(1); }
                    42% { transform: scale(1.3); }
                    70% { transform: scale(1); }
                }

                @keyframes bael-flash {
                    0%, 50%, 100% { opacity: 1; }
                    25%, 75% { opacity: 0; }
                }

                @keyframes bael-rubberBand {
                    0%, 100% { transform: scaleX(1); }
                    30% { transform: scaleX(1.25) scaleY(0.75); }
                    40% { transform: scaleX(0.75) scaleY(1.25); }
                    50% { transform: scaleX(1.15) scaleY(0.85); }
                    65% { transform: scaleX(0.95) scaleY(1.05); }
                    75% { transform: scaleX(1.05) scaleY(0.95); }
                }

                /* ====================== */
                /* UTILITY ANIMATIONS     */
                /* ====================== */

                @keyframes bael-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                @keyframes bael-ping {
                    0% { transform: scale(1); opacity: 1; }
                    75%, 100% { transform: scale(2); opacity: 0; }
                }

                @keyframes bael-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }

                @keyframes bael-glow {
                    0%, 100% { box-shadow: 0 0 5px var(--primary, #6a9fe2); }
                    50% { box-shadow: 0 0 20px var(--primary, #6a9fe2), 0 0 30px var(--primary, #6a9fe2); }
                }

                @keyframes bael-shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }

                /* ====================== */
                /* ANIMATION CLASSES      */
                /* ====================== */

                /* Entrance */
                .bael-animate-fadeIn { animation: bael-fadeIn var(--anim-duration) var(--anim-easing) var(--anim-delay) forwards; }
                .bael-animate-fadeInUp { animation: bael-fadeInUp var(--anim-duration) var(--anim-easing) var(--anim-delay) forwards; }
                .bael-animate-fadeInDown { animation: bael-fadeInDown var(--anim-duration) var(--anim-easing) var(--anim-delay) forwards; }
                .bael-animate-fadeInLeft { animation: bael-fadeInLeft var(--anim-duration) var(--anim-easing) var(--anim-delay) forwards; }
                .bael-animate-fadeInRight { animation: bael-fadeInRight var(--anim-duration) var(--anim-easing) var(--anim-delay) forwards; }
                .bael-animate-zoomIn { animation: bael-zoomIn var(--anim-duration) var(--anim-easing) var(--anim-delay) forwards; }
                .bael-animate-zoomInBig { animation: bael-zoomInBig var(--anim-duration) var(--anim-easing) var(--anim-delay) forwards; }
                .bael-animate-slideInUp { animation: bael-slideInUp var(--anim-duration) var(--anim-easing) var(--anim-delay) forwards; }
                .bael-animate-slideInDown { animation: bael-slideInDown var(--anim-duration) var(--anim-easing) var(--anim-delay) forwards; }
                .bael-animate-slideInLeft { animation: bael-slideInLeft var(--anim-duration) var(--anim-easing) var(--anim-delay) forwards; }
                .bael-animate-slideInRight { animation: bael-slideInRight var(--anim-duration) var(--anim-easing) var(--anim-delay) forwards; }
                .bael-animate-flipInX { animation: bael-flipInX var(--anim-duration) var(--anim-easing) var(--anim-delay) forwards; }
                .bael-animate-flipInY { animation: bael-flipInY var(--anim-duration) var(--anim-easing) var(--anim-delay) forwards; }
                .bael-animate-bounceIn { animation: bael-bounceIn var(--anim-duration) var(--anim-easing) var(--anim-delay) forwards; }

                /* Exit */
                .bael-animate-fadeOut { animation: bael-fadeOut var(--anim-duration) var(--anim-easing) var(--anim-delay) forwards; }
                .bael-animate-fadeOutUp { animation: bael-fadeOutUp var(--anim-duration) var(--anim-easing) var(--anim-delay) forwards; }
                .bael-animate-fadeOutDown { animation: bael-fadeOutDown var(--anim-duration) var(--anim-easing) var(--anim-delay) forwards; }
                .bael-animate-zoomOut { animation: bael-zoomOut var(--anim-duration) var(--anim-easing) var(--anim-delay) forwards; }
                .bael-animate-slideOutUp { animation: bael-slideOutUp var(--anim-duration) var(--anim-easing) var(--anim-delay) forwards; }
                .bael-animate-slideOutDown { animation: bael-slideOutDown var(--anim-duration) var(--anim-easing) var(--anim-delay) forwards; }

                /* Attention */
                .bael-animate-pulse { animation: bael-pulse 1s var(--anim-easing) infinite; }
                .bael-animate-bounce { animation: bael-bounce 1s var(--anim-easing) infinite; }
                .bael-animate-shake { animation: bael-shake 0.5s var(--anim-easing); }
                .bael-animate-wobble { animation: bael-wobble 1s var(--anim-easing); }
                .bael-animate-swing { animation: bael-swing 1s var(--anim-easing); }
                .bael-animate-tada { animation: bael-tada 1s var(--anim-easing); }
                .bael-animate-jello { animation: bael-jello 1s var(--anim-easing); }
                .bael-animate-heartBeat { animation: bael-heartBeat 1.5s var(--anim-easing) infinite; }
                .bael-animate-flash { animation: bael-flash 1s var(--anim-easing); }
                .bael-animate-rubberBand { animation: bael-rubberBand 1s var(--anim-easing); }

                /* Utility */
                .bael-animate-spin { animation: bael-spin 1s linear infinite; }
                .bael-animate-ping { animation: bael-ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; }
                .bael-animate-float { animation: bael-float 3s ease-in-out infinite; }
                .bael-animate-glow { animation: bael-glow 2s ease-in-out infinite; }

                .bael-animate-shimmer {
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
                    background-size: 200% 100%;
                    animation: bael-shimmer 2s infinite;
                }

                /* Scroll animation states */
                .bael-scroll-hidden {
                    opacity: 0;
                    transform: translateY(30px);
                }

                .bael-scroll-visible {
                    opacity: 1;
                    transform: translateY(0);
                    transition: opacity 0.6s ease, transform 0.6s ease;
                }

                /* Duration modifiers */
                .bael-animate-faster { --anim-duration: 0.3s; }
                .bael-animate-fast { --anim-duration: 0.4s; }
                .bael-animate-slow { --anim-duration: 0.8s; }
                .bael-animate-slower { --anim-duration: 1.2s; }

                /* Delay modifiers */
                .bael-animate-delay-100 { --anim-delay: 0.1s; }
                .bael-animate-delay-200 { --anim-delay: 0.2s; }
                .bael-animate-delay-300 { --anim-delay: 0.3s; }
                .bael-animate-delay-500 { --anim-delay: 0.5s; }
                .bael-animate-delay-700 { --anim-delay: 0.7s; }
                .bael-animate-delay-1000 { --anim-delay: 1s; }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // ANIMATION METHODS
    // ============================================================

    /**
     * Apply animation to element
     */
    animate(element, animation, options = {}) {
      if (typeof element === "string") {
        element = document.querySelector(element);
      }
      if (!element) return null;

      const config = {
        duration: options.duration || 500,
        delay: options.delay || 0,
        easing: options.easing || "ease",
        fill: options.fill || "forwards",
        onComplete: options.onComplete || null,
      };

      // Set CSS variables
      element.style.setProperty("--anim-duration", `${config.duration}ms`);
      element.style.setProperty("--anim-delay", `${config.delay}ms`);

      // Add animation class
      element.classList.add(`bael-animate-${animation}`);

      // Handle completion
      if (config.onComplete) {
        const handler = () => {
          config.onComplete(element);
          element.removeEventListener("animationend", handler);
        };
        element.addEventListener("animationend", handler);
      }

      return {
        stop: () => {
          element.classList.remove(`bael-animate-${animation}`);
          element.style.animation = "none";
        },
        restart: () => {
          element.classList.remove(`bael-animate-${animation}`);
          void element.offsetWidth; // Trigger reflow
          element.classList.add(`bael-animate-${animation}`);
        },
      };
    }

    /**
     * Stagger animation for multiple elements
     */
    stagger(elements, animation, options = {}) {
      const config = {
        staggerDelay: options.staggerDelay || 100,
        ...options,
      };

      if (typeof elements === "string") {
        elements = document.querySelectorAll(elements);
      }

      Array.from(elements).forEach((el, index) => {
        const delay = (config.delay || 0) + index * config.staggerDelay;
        this.animate(el, animation, { ...config, delay });
      });
    }

    /**
     * Setup scroll-triggered animations
     */
    scrollAnimate(elements, options = {}) {
      if (typeof elements === "string") {
        elements = document.querySelectorAll(elements);
      }

      const config = {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || "0px",
        animation: options.animation || null,
        once: options.once !== false,
      };

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.remove("bael-scroll-hidden");
              entry.target.classList.add("bael-scroll-visible");

              if (config.animation) {
                this.animate(entry.target, config.animation);
              }

              if (config.once) {
                observer.unobserve(entry.target);
              }
            } else if (!config.once) {
              entry.target.classList.remove("bael-scroll-visible");
              entry.target.classList.add("bael-scroll-hidden");
            }
          });
        },
        {
          threshold: config.threshold,
          rootMargin: config.rootMargin,
        },
      );

      Array.from(elements).forEach((el) => {
        el.classList.add("bael-scroll-hidden");
        observer.observe(el);
      });

      const id = Date.now();
      this.observers.set(id, observer);

      return {
        id,
        disconnect: () => {
          observer.disconnect();
          this.observers.delete(id);
        },
      };
    }

    /**
     * Typewriter effect
     */
    typewriter(element, text, options = {}) {
      if (typeof element === "string") {
        element = document.querySelector(element);
      }
      if (!element) return null;

      const config = {
        speed: options.speed || 50,
        delay: options.delay || 0,
        cursor: options.cursor !== false,
        onComplete: options.onComplete || null,
      };

      element.textContent = "";

      if (config.cursor) {
        element.style.borderRight = "2px solid currentColor";
      }

      let index = 0;
      const chars = text.split("");

      const type = () => {
        if (index < chars.length) {
          element.textContent += chars[index];
          index++;
          setTimeout(type, config.speed);
        } else {
          if (config.cursor) {
            element.style.borderRight = "none";
          }
          if (config.onComplete) {
            config.onComplete(element);
          }
        }
      };

      setTimeout(type, config.delay);

      return {
        stop: () => {
          index = chars.length;
        },
      };
    }

    /**
     * Counter animation
     */
    counter(element, end, options = {}) {
      if (typeof element === "string") {
        element = document.querySelector(element);
      }
      if (!element) return null;

      const config = {
        start: options.start || 0,
        duration: options.duration || 2000,
        prefix: options.prefix || "",
        suffix: options.suffix || "",
        decimals: options.decimals || 0,
        easing: options.easing || "easeOutExpo",
        onComplete: options.onComplete || null,
      };

      const easings = {
        linear: (t) => t,
        easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
        easeOutQuart: (t) => 1 - Math.pow(1 - t, 4),
        easeInOutQuad: (t) =>
          t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
      };

      const ease = easings[config.easing] || easings.linear;
      const range = end - config.start;
      const startTime = performance.now();

      const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / config.duration, 1);
        const current = config.start + range * ease(progress);

        element.textContent =
          config.prefix + current.toFixed(config.decimals) + config.suffix;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else if (config.onComplete) {
          config.onComplete(element);
        }
      };

      requestAnimationFrame(update);
    }

    /**
     * Remove all animations from element
     */
    reset(element) {
      if (typeof element === "string") {
        element = document.querySelector(element);
      }
      if (!element) return;

      // Remove all animation classes
      const classes = Array.from(element.classList);
      classes.forEach((cls) => {
        if (cls.startsWith("bael-animate-") || cls.startsWith("bael-scroll-")) {
          element.classList.remove(cls);
        }
      });

      // Reset inline styles
      element.style.animation = "";
      element.style.removeProperty("--anim-duration");
      element.style.removeProperty("--anim-delay");
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelAnimation();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$animate = (el, anim, opts) => bael.animate(el, anim, opts);
  window.$stagger = (els, anim, opts) => bael.stagger(els, anim, opts);
  window.$scrollAnimate = (els, opts) => bael.scrollAnimate(els, opts);
  window.$typewriter = (el, text, opts) => bael.typewriter(el, text, opts);
  window.$counter = (el, end, opts) => bael.counter(el, end, opts);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelAnimation = bael;

  console.log("✨ BAEL Animation loaded");
})();
