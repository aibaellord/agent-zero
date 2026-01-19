/**
 * BAEL Rating Component - Lord Of All Stars
 *
 * Advanced rating input:
 * - Star/heart/emoji icons
 * - Half ratings
 * - Readonly display
 * - Custom icon count
 * - Hover preview
 * - Clear on re-click
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // RATING INPUT CLASS
  // ============================================================

  class BaelRatingInput {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-ratinginput-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-ratinginput-styles";
      styles.textContent = `
                .bael-ratinginput {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .bael-ratinginput-item {
                    position: relative;
                    cursor: pointer;
                    transition: transform 0.1s;
                }

                .bael-ratinginput-item:hover {
                    transform: scale(1.15);
                }

                .bael-ratinginput.readonly .bael-ratinginput-item {
                    cursor: default;
                }

                .bael-ratinginput.readonly .bael-ratinginput-item:hover {
                    transform: none;
                }

                .bael-ratinginput-icon {
                    display: block;
                    width: 24px;
                    height: 24px;
                    color: rgba(255,255,255,0.15);
                    transition: color 0.15s;
                }

                .bael-ratinginput-icon.filled {
                    color: #fbbf24;
                }

                .bael-ratinginput-icon.half {
                    position: relative;
                }

                .bael-ratinginput-icon.half::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 50%;
                    height: 100%;
                    overflow: hidden;
                }

                /* Half star using clip-path */
                .bael-ratinginput-half-wrapper {
                    position: relative;
                    display: inline-block;
                }

                .bael-ratinginput-half-bg {
                    color: rgba(255,255,255,0.15);
                }

                .bael-ratinginput-half-fill {
                    position: absolute;
                    top: 0;
                    left: 0;
                    color: #fbbf24;
                    clip-path: inset(0 50% 0 0);
                }

                /* Size variants */
                .bael-ratinginput.small .bael-ratinginput-icon {
                    width: 16px;
                    height: 16px;
                }

                .bael-ratinginput.large .bael-ratinginput-icon {
                    width: 32px;
                    height: 32px;
                }

                .bael-ratinginput.xlarge .bael-ratinginput-icon {
                    width: 40px;
                    height: 40px;
                }

                /* Colors */
                .bael-ratinginput.red .bael-ratinginput-icon.filled,
                .bael-ratinginput.red .bael-ratinginput-half-fill {
                    color: #ef4444;
                }

                .bael-ratinginput.blue .bael-ratinginput-icon.filled,
                .bael-ratinginput.blue .bael-ratinginput-half-fill {
                    color: #3b82f6;
                }

                .bael-ratinginput.green .bael-ratinginput-icon.filled,
                .bael-ratinginput.green .bael-ratinginput-half-fill {
                    color: #22c55e;
                }

                .bael-ratinginput.purple .bael-ratinginput-icon.filled,
                .bael-ratinginput.purple .bael-ratinginput-half-fill {
                    color: #a855f7;
                }

                /* Value display */
                .bael-ratinginput-value {
                    margin-left: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    color: #888;
                }

                /* Disabled */
                .bael-ratinginput.disabled {
                    opacity: 0.5;
                    pointer-events: none;
                }

                /* Animation */
                @keyframes bael-rating-pop {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.3); }
                    100% { transform: scale(1); }
                }

                .bael-ratinginput-item.pop {
                    animation: bael-rating-pop 0.2s ease-out;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // ICONS
    // ============================================================

    _icons = {
      star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>',
      heart:
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
      thumb:
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM4 10H2v11h2V10z"/></svg>',
      circle:
        '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>',
    };

    // ============================================================
    // CREATE RATING INPUT
    // ============================================================

    /**
     * Create rating input component
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("RatingInput container not found");
        return null;
      }

      const id = `bael-ratinginput-${++this.idCounter}`;
      const config = {
        value: 0,
        max: 5,
        step: 1, // 1 or 0.5 for half ratings
        icon: "star", // star, heart, thumb, circle
        size: "default", // small, default, large, xlarge
        color: "default", // default (yellow), red, blue, green, purple
        readonly: false,
        disabled: false,
        showValue: false,
        clearable: true, // Click same value to clear
        onChange: null,
        onHover: null,
        ...options,
      };

      const el = document.createElement("div");
      el.className = `bael-ratinginput`;
      if (config.size !== "default") el.classList.add(config.size);
      if (config.color !== "default") el.classList.add(config.color);
      if (config.readonly) el.classList.add("readonly");
      if (config.disabled) el.classList.add("disabled");
      el.id = id;

      const state = {
        id,
        element: el,
        container,
        config,
        value: config.value,
        hoverValue: null,
      };

      this._render(state);
      this._bindEvents(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        getValue: () => state.value,
        setValue: (v) => this._setValue(state, v),
        setReadonly: (r) => {
          state.config.readonly = r;
          el.classList.toggle("readonly", r);
        },
        setDisabled: (d) => {
          state.config.disabled = d;
          el.classList.toggle("disabled", d);
        },
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render rating
     */
    _render(state) {
      const { element, config } = state;

      for (let i = 1; i <= config.max; i++) {
        const item = document.createElement("div");
        item.className = "bael-ratinginput-item";
        item.dataset.value = i;

        if (config.step === 0.5) {
          // Half rating support
          item.innerHTML = `
                        <div class="bael-ratinginput-half-wrapper">
                            <div class="bael-ratinginput-icon bael-ratinginput-half-bg">${this._icons[config.icon]}</div>
                            <div class="bael-ratinginput-icon bael-ratinginput-half-fill">${this._icons[config.icon]}</div>
                        </div>
                    `;
        } else {
          item.innerHTML = `<div class="bael-ratinginput-icon">${this._icons[config.icon]}</div>`;
        }

        element.appendChild(item);
      }

      // Value display
      if (config.showValue) {
        const valueEl = document.createElement("span");
        valueEl.className = "bael-ratinginput-value";
        state.valueEl = valueEl;
        element.appendChild(valueEl);
      }

      this._updateUI(state);
    }

    /**
     * Bind events
     */
    _bindEvents(state) {
      const { element, config } = state;

      if (config.readonly || config.disabled) return;

      element.querySelectorAll(".bael-ratinginput-item").forEach((item) => {
        const value = parseInt(item.dataset.value);

        // Hover
        item.addEventListener("mouseenter", (e) => {
          if (config.step === 0.5) {
            const rect = item.getBoundingClientRect();
            const isHalf = e.clientX - rect.left < rect.width / 2;
            state.hoverValue = isHalf ? value - 0.5 : value;
          } else {
            state.hoverValue = value;
          }
          this._updateUI(state);

          if (config.onHover) config.onHover(state.hoverValue);
        });

        item.addEventListener("mousemove", (e) => {
          if (config.step === 0.5) {
            const rect = item.getBoundingClientRect();
            const isHalf = e.clientX - rect.left < rect.width / 2;
            const newHover = isHalf ? value - 0.5 : value;
            if (newHover !== state.hoverValue) {
              state.hoverValue = newHover;
              this._updateUI(state);
              if (config.onHover) config.onHover(state.hoverValue);
            }
          }
        });

        // Click
        item.addEventListener("click", (e) => {
          let newValue;

          if (config.step === 0.5) {
            const rect = item.getBoundingClientRect();
            const isHalf = e.clientX - rect.left < rect.width / 2;
            newValue = isHalf ? value - 0.5 : value;
          } else {
            newValue = value;
          }

          // Clear on re-click
          if (config.clearable && newValue === state.value) {
            newValue = 0;
          }

          this._setValue(state, newValue);

          // Pop animation
          item.classList.add("pop");
          setTimeout(() => item.classList.remove("pop"), 200);
        });
      });

      // Mouse leave
      element.addEventListener("mouseleave", () => {
        state.hoverValue = null;
        this._updateUI(state);
      });
    }

    /**
     * Update UI
     */
    _updateUI(state) {
      const { element, config, value, hoverValue } = state;
      const displayValue = hoverValue !== null ? hoverValue : value;

      element.querySelectorAll(".bael-ratinginput-item").forEach((item) => {
        const itemValue = parseInt(item.dataset.value);

        if (config.step === 0.5) {
          const halfFill = item.querySelector(".bael-ratinginput-half-fill");
          const halfBg = item.querySelector(".bael-ratinginput-half-bg");

          if (itemValue <= displayValue) {
            halfFill.style.clipPath = "none";
            halfBg.classList.add("filled");
          } else if (itemValue - 0.5 === displayValue) {
            halfFill.style.clipPath = "inset(0 50% 0 0)";
            halfBg.classList.remove("filled");
          } else {
            halfFill.style.clipPath = "inset(0 100% 0 0)";
            halfBg.classList.remove("filled");
          }
        } else {
          const icon = item.querySelector(".bael-ratinginput-icon");
          icon.classList.toggle("filled", itemValue <= displayValue);
        }
      });

      // Update value display
      if (state.valueEl) {
        state.valueEl.textContent = `${value}/${config.max}`;
      }
    }

    /**
     * Set value
     */
    _setValue(state, value) {
      value = Math.max(0, Math.min(value, state.config.max));

      if (state.config.step === 1) {
        value = Math.round(value);
      }

      if (value !== state.value) {
        state.value = value;
        this._updateUI(state);

        if (state.config.onChange) {
          state.config.onChange(value);
        }
      }
    }

    /**
     * Destroy rating
     */
    destroy(id) {
      const state = this.instances.get(id);
      if (!state) return;
      state.element.remove();
      this.instances.delete(id);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelRatingInput();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$ratingInput = (container, options) => bael.create(container, options);
  window.$stars = window.$ratingInput;

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelRatingInput = bael;

  console.log("⭐ BAEL Rating Input Component loaded");
})();
