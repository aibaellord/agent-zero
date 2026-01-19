/**
 * BAEL Marquee Component - Lord Of All Scrolling
 *
 * Animated scrolling text:
 * - Horizontal/vertical scrolling
 * - Speed control
 * - Pause on hover
 * - Seamless loop
 * - Multiple items
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // MARQUEE CLASS
  // ============================================================

  class BaelMarquee {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-marquee-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-marquee-styles";
      styles.textContent = `
                .bael-marquee {
                    overflow: hidden;
                    position: relative;
                    font-family: system-ui, -apple-system, sans-serif;
                }

                .bael-marquee-track {
                    display: flex;
                    width: max-content;
                    animation: bael-marquee-scroll var(--duration, 20s) linear infinite;
                }

                .bael-marquee.paused .bael-marquee-track {
                    animation-play-state: paused;
                }

                .bael-marquee.vertical .bael-marquee-track {
                    flex-direction: column;
                    animation-name: bael-marquee-scroll-vertical;
                }

                .bael-marquee.reverse .bael-marquee-track {
                    animation-direction: reverse;
                }

                @keyframes bael-marquee-scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }

                @keyframes bael-marquee-scroll-vertical {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                }

                .bael-marquee-content {
                    display: flex;
                    align-items: center;
                    flex-shrink: 0;
                }

                .bael-marquee.vertical .bael-marquee-content {
                    flex-direction: column;
                }

                .bael-marquee-item {
                    padding: 0 24px;
                    white-space: nowrap;
                }

                .bael-marquee.vertical .bael-marquee-item {
                    padding: 12px 0;
                }

                /* Gradient masks */
                .bael-marquee.fade::before,
                .bael-marquee.fade::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    width: 100px;
                    z-index: 1;
                    pointer-events: none;
                }

                .bael-marquee.fade::before {
                    left: 0;
                    background: linear-gradient(to right, white, transparent);
                }

                .bael-marquee.fade::after {
                    right: 0;
                    background: linear-gradient(to left, white, transparent);
                }

                .bael-marquee.vertical.fade::before,
                .bael-marquee.vertical.fade::after {
                    left: 0;
                    right: 0;
                    width: auto;
                    height: 60px;
                }

                .bael-marquee.vertical.fade::before {
                    top: 0;
                    bottom: auto;
                    background: linear-gradient(to bottom, white, transparent);
                }

                .bael-marquee.vertical.fade::after {
                    bottom: 0;
                    top: auto;
                    background: linear-gradient(to top, white, transparent);
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE MARQUEE
    // ============================================================

    /**
     * Create marquee
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Marquee container not found");
        return null;
      }

      const id = `bael-marquee-${++this.idCounter}`;
      const config = {
        items: [], // Array of strings or HTML
        speed: 20, // Seconds for one complete loop
        direction: "left", // left, right, up, down
        pauseOnHover: true,
        fade: true,
        gap: 48, // Gap between items in px
        ...options,
      };

      const el = document.createElement("div");
      el.className = "bael-marquee";
      el.id = id;

      if (config.fade) el.classList.add("fade");
      if (config.direction === "up" || config.direction === "down") {
        el.classList.add("vertical");
      }
      if (config.direction === "right" || config.direction === "down") {
        el.classList.add("reverse");
      }

      const state = {
        id,
        element: el,
        container,
        config,
      };

      this._render(state);
      container.appendChild(el);

      // Pause on hover
      if (config.pauseOnHover) {
        el.addEventListener("mouseenter", () => el.classList.add("paused"));
        el.addEventListener("mouseleave", () => el.classList.remove("paused"));
      }

      this.instances.set(id, state);

      return {
        id,
        pause: () => el.classList.add("paused"),
        resume: () => el.classList.remove("paused"),
        setSpeed: (speed) => this._setSpeed(state, speed),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render marquee
     */
    _render(state) {
      const { element, config } = state;

      element.innerHTML = "";
      element.style.setProperty("--duration", `${config.speed}s`);

      const track = document.createElement("div");
      track.className = "bael-marquee-track";

      // Create content twice for seamless loop
      for (let i = 0; i < 2; i++) {
        const content = document.createElement("div");
        content.className = "bael-marquee-content";
        content.style.gap = `${config.gap}px`;

        config.items.forEach((item) => {
          const itemEl = document.createElement("div");
          itemEl.className = "bael-marquee-item";
          itemEl.innerHTML = item;
          content.appendChild(itemEl);
        });

        track.appendChild(content);
      }

      element.appendChild(track);
    }

    /**
     * Set speed
     */
    _setSpeed(state, speed) {
      state.config.speed = speed;
      state.element.style.setProperty("--duration", `${speed}s`);
    }

    /**
     * Destroy marquee
     */
    destroy(marqueeId) {
      const state = this.instances.get(marqueeId);
      if (!state) return;

      state.element.remove();
      this.instances.delete(marqueeId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelMarquee();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$marquee = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelMarquee = bael;

  console.log("📜 BAEL Marquee Component loaded");
})();
