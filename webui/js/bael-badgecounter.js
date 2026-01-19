/**
 * BAEL Badge Counter Component - Lord Of All Notifications
 *
 * Badge / Counter / Dot indicator:
 * - Number badges
 * - Dot indicators
 * - Pulse animation
 * - Position options
 * - Color variants
 * - Max value display
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // BADGE CLASS
  // ============================================================

  class BaelBadge {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-badgecounter-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-badgecounter-styles";
      styles.textContent = `
                .bael-badge-wrapper {
                    position: relative;
                    display: inline-flex;
                }

                .bael-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 18px;
                    height: 18px;
                    padding: 0 5px;
                    background: #ef4444;
                    border-radius: 999px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    font-size: 11px;
                    font-weight: 600;
                    color: white;
                    line-height: 1;
                    white-space: nowrap;
                }

                /* Positioned badge */
                .bael-badge-wrapper .bael-badge {
                    position: absolute;
                }

                .bael-badge-wrapper .bael-badge.top-right {
                    top: -6px;
                    right: -6px;
                }

                .bael-badge-wrapper .bael-badge.top-left {
                    top: -6px;
                    left: -6px;
                }

                .bael-badge-wrapper .bael-badge.bottom-right {
                    bottom: -6px;
                    right: -6px;
                }

                .bael-badge-wrapper .bael-badge.bottom-left {
                    bottom: -6px;
                    left: -6px;
                }

                /* Dot variant */
                .bael-badge.dot {
                    min-width: 8px;
                    width: 8px;
                    height: 8px;
                    padding: 0;
                }

                .bael-badge.dot.medium {
                    width: 10px;
                    height: 10px;
                    min-width: 10px;
                }

                .bael-badge.dot.large {
                    width: 12px;
                    height: 12px;
                    min-width: 12px;
                }

                /* Sizes */
                .bael-badge.small {
                    min-width: 14px;
                    height: 14px;
                    padding: 0 3px;
                    font-size: 9px;
                }

                .bael-badge.large {
                    min-width: 22px;
                    height: 22px;
                    padding: 0 6px;
                    font-size: 13px;
                }

                /* Colors */
                .bael-badge.blue { background: #3b82f6; }
                .bael-badge.green { background: #22c55e; }
                .bael-badge.yellow { background: #eab308; color: #1a1a1a; }
                .bael-badge.orange { background: #f97316; }
                .bael-badge.purple { background: #8b5cf6; }
                .bael-badge.pink { background: #ec4899; }
                .bael-badge.gray { background: #6b7280; }

                /* Outlined variant */
                .bael-badge.outlined {
                    background: transparent;
                    border: 2px solid currentColor;
                }

                .bael-badge.outlined.red { color: #ef4444; }
                .bael-badge.outlined.blue { color: #3b82f6; }
                .bael-badge.outlined.green { color: #22c55e; }
                .bael-badge.outlined.yellow { color: #eab308; }
                .bael-badge.outlined.orange { color: #f97316; }
                .bael-badge.outlined.purple { color: #8b5cf6; }

                /* Pulse animation */
                .bael-badge.pulse {
                    animation: bael-badge-pulse 1.5s ease infinite;
                }

                @keyframes bael-badge-pulse {
                    0%, 100% {
                        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5);
                    }
                    50% {
                        box-shadow: 0 0 0 6px rgba(239, 68, 68, 0);
                    }
                }

                .bael-badge.pulse.blue {
                    animation-name: bael-badge-pulse-blue;
                }

                @keyframes bael-badge-pulse-blue {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.5); }
                    50% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0); }
                }

                .bael-badge.pulse.green {
                    animation-name: bael-badge-pulse-green;
                }

                @keyframes bael-badge-pulse-green {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.5); }
                    50% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
                }

                /* With border */
                .bael-badge.bordered {
                    border: 2px solid #1a1a1a;
                }

                /* Inline badge */
                .bael-badge.inline {
                    vertical-align: middle;
                    margin-left: 6px;
                }

                /* Label badges (status) */
                .bael-badge.label {
                    padding: 3px 8px;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-radius: 4px;
                }

                /* Icon badge */
                .bael-badge-icon {
                    display: flex;
                    align-items: center;
                    margin-right: 4px;
                }

                .bael-badge-icon svg {
                    width: 12px;
                    height: 12px;
                }

                /* Hidden when zero */
                .bael-badge.hidden {
                    display: none;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE BADGE
    // ============================================================

    /**
     * Create badge
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Badge container not found");
        return null;
      }

      const id = `bael-badge-${++this.idCounter}`;
      const config = {
        value: 0, // Number or text
        max: 99, // Max display value (shows 99+ if exceeded)
        dot: false, // Dot only (no number)
        size: "default", // small, default, large
        color: "red", // red, blue, green, yellow, orange, purple, pink, gray
        variant: "default", // default, outlined, label
        position: "top-right", // top-right, top-left, bottom-right, bottom-left
        pulse: false, // Pulse animation
        bordered: false, // Add border
        showZero: false, // Show when value is 0
        icon: null, // Icon SVG (for label variant)
        ...options,
      };

      // Determine if we need a wrapper
      const hasChildren = container.children.length > 0;

      let wrapper = container;
      if (hasChildren) {
        // Wrap existing content
        wrapper = document.createElement("div");
        wrapper.className = "bael-badge-wrapper";
        wrapper.id = id;

        // Move existing children into wrapper
        while (container.firstChild) {
          wrapper.appendChild(container.firstChild);
        }
        container.appendChild(wrapper);
      }

      const badge = document.createElement("span");
      badge.className = "bael-badge";
      if (config.dot) badge.classList.add("dot");
      if (config.size !== "default") badge.classList.add(config.size);
      badge.classList.add(config.color);
      if (config.variant !== "default") badge.classList.add(config.variant);
      if (hasChildren) badge.classList.add(config.position);
      if (config.pulse) badge.classList.add("pulse");
      if (config.bordered) badge.classList.add("bordered");
      if (!hasChildren) badge.classList.add("inline");

      if (!hasChildren) {
        badge.id = id;
      }

      const state = {
        id,
        badge,
        wrapper: hasChildren ? wrapper : null,
        container,
        config,
      };

      this._updateBadge(state);
      wrapper.appendChild(badge);

      this.instances.set(id, state);

      return {
        id,
        getValue: () => state.config.value,
        setValue: (v) => this._setValue(state, v),
        increment: (n = 1) => this._setValue(state, state.config.value + n),
        decrement: (n = 1) =>
          this._setValue(state, Math.max(0, state.config.value - n)),
        setColor: (c) => this._setColor(state, c),
        setPulse: (p) => this._setPulse(state, p),
        show: () => state.badge.classList.remove("hidden"),
        hide: () => state.badge.classList.add("hidden"),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Update badge content
     */
    _updateBadge(state) {
      const { badge, config } = state;

      badge.innerHTML = "";

      // Icon for label variant
      if (config.icon && config.variant === "label") {
        const iconEl = document.createElement("span");
        iconEl.className = "bael-badge-icon";
        iconEl.innerHTML = config.icon;
        badge.appendChild(iconEl);
      }

      // Value display
      if (!config.dot) {
        let displayValue = config.value;

        if (typeof config.value === "number") {
          if (config.value > config.max) {
            displayValue = `${config.max}+`;
          }
        }

        const textNode = document.createTextNode(displayValue);
        badge.appendChild(textNode);
      }

      // Show/hide based on value
      if (config.value === 0 && !config.showZero && !config.dot) {
        badge.classList.add("hidden");
      } else {
        badge.classList.remove("hidden");
      }
    }

    /**
     * Set value
     */
    _setValue(state, value) {
      state.config.value = value;
      this._updateBadge(state);
    }

    /**
     * Set color
     */
    _setColor(state, color) {
      const { badge, config } = state;

      // Remove old color
      badge.classList.remove(config.color);

      // Add new color
      config.color = color;
      badge.classList.add(color);
    }

    /**
     * Set pulse
     */
    _setPulse(state, pulse) {
      state.config.pulse = pulse;
      state.badge.classList.toggle("pulse", pulse);
    }

    /**
     * Destroy instance
     */
    destroy(id) {
      const state = this.instances.get(id);
      if (!state) return;

      if (state.wrapper) {
        // Unwrap children back to container
        while (state.wrapper.firstChild) {
          if (state.wrapper.firstChild !== state.badge) {
            state.container.appendChild(state.wrapper.firstChild);
          } else {
            state.wrapper.removeChild(state.wrapper.firstChild);
          }
        }
        state.wrapper.remove();
      } else {
        state.badge.remove();
      }

      this.instances.delete(id);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelBadge();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$badge = (container, options) => bael.create(container, options);
  window.$counter = (container, options) => bael.create(container, options);
  window.$notification = (container, options) =>
    bael.create(container, { ...options, dot: true });

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelBadge = bael;

  console.log("🔴 BAEL Badge Counter loaded");
})();
