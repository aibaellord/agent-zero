/**
 * BAEL Toggle Switch - Lord Of All States
 *
 * Modern toggle/switch component:
 * - Smooth animations
 * - Custom colors
 * - Labels (on/off)
 * - Size variants
 * - Icon support
 * - Disabled state
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // TOGGLE SWITCH CLASS
  // ============================================================

  class BaelToggle {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-toggle-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-toggle-styles";
      styles.textContent = `
                .bael-toggle {
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    cursor: pointer;
                    user-select: none;
                }

                .bael-toggle.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Track */
                .bael-toggle-track {
                    position: relative;
                    width: 44px;
                    height: 24px;
                    background: rgba(255,255,255,0.15);
                    border-radius: 12px;
                    transition: background 0.2s;
                }

                .bael-toggle.checked .bael-toggle-track {
                    background: #3b82f6;
                }

                /* Thumb */
                .bael-toggle-thumb {
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 20px;
                    height: 20px;
                    background: white;
                    border-radius: 50%;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                    transition: transform 0.2s, background 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .bael-toggle.checked .bael-toggle-thumb {
                    transform: translateX(20px);
                }

                .bael-toggle-thumb svg {
                    width: 12px;
                    height: 12px;
                    color: #666;
                    opacity: 0;
                    transition: opacity 0.15s;
                }

                .bael-toggle.checked .bael-toggle-thumb svg {
                    opacity: 1;
                    color: #3b82f6;
                }

                /* Labels */
                .bael-toggle-label {
                    font-size: 14px;
                    color: #ddd;
                }

                .bael-toggle-labels {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 6px;
                    font-size: 9px;
                    font-weight: 600;
                    text-transform: uppercase;
                    pointer-events: none;
                }

                .bael-toggle-label-on {
                    color: white;
                    opacity: 0;
                    transition: opacity 0.15s;
                }

                .bael-toggle-label-off {
                    color: rgba(255,255,255,0.5);
                    transition: opacity 0.15s;
                }

                .bael-toggle.checked .bael-toggle-label-on {
                    opacity: 1;
                }

                .bael-toggle.checked .bael-toggle-label-off {
                    opacity: 0;
                }

                /* Size: small */
                .bael-toggle.small .bael-toggle-track {
                    width: 32px;
                    height: 18px;
                    border-radius: 9px;
                }

                .bael-toggle.small .bael-toggle-thumb {
                    width: 14px;
                    height: 14px;
                }

                .bael-toggle.small.checked .bael-toggle-thumb {
                    transform: translateX(14px);
                }

                .bael-toggle.small .bael-toggle-thumb svg {
                    width: 8px;
                    height: 8px;
                }

                /* Size: large */
                .bael-toggle.large .bael-toggle-track {
                    width: 56px;
                    height: 30px;
                    border-radius: 15px;
                }

                .bael-toggle.large .bael-toggle-thumb {
                    width: 26px;
                    height: 26px;
                }

                .bael-toggle.large.checked .bael-toggle-thumb {
                    transform: translateX(26px);
                }

                .bael-toggle.large .bael-toggle-thumb svg {
                    width: 14px;
                    height: 14px;
                }

                /* Color variants */
                .bael-toggle.green.checked .bael-toggle-track {
                    background: #22c55e;
                }

                .bael-toggle.green.checked .bael-toggle-thumb svg {
                    color: #22c55e;
                }

                .bael-toggle.red.checked .bael-toggle-track {
                    background: #ef4444;
                }

                .bael-toggle.red.checked .bael-toggle-thumb svg {
                    color: #ef4444;
                }

                .bael-toggle.purple.checked .bael-toggle-track {
                    background: #a855f7;
                }

                .bael-toggle.purple.checked .bael-toggle-thumb svg {
                    color: #a855f7;
                }

                .bael-toggle.orange.checked .bael-toggle-track {
                    background: #f97316;
                }

                .bael-toggle.orange.checked .bael-toggle-thumb svg {
                    color: #f97316;
                }

                /* Focus ring */
                .bael-toggle:focus-visible .bael-toggle-track {
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
                }

                /* Hidden input */
                .bael-toggle input {
                    position: absolute;
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                /* Hover effect */
                .bael-toggle:not(.disabled):hover .bael-toggle-thumb {
                    box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                }

                /* Loading state */
                .bael-toggle.loading .bael-toggle-thumb::after {
                    content: '';
                    width: 10px;
                    height: 10px;
                    border: 2px solid transparent;
                    border-top-color: #3b82f6;
                    border-radius: 50%;
                    animation: bael-toggle-spin 0.6s linear infinite;
                }

                @keyframes bael-toggle-spin {
                    to { transform: rotate(360deg); }
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE TOGGLE
    // ============================================================

    /**
     * Create toggle component
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Toggle container not found");
        return null;
      }

      const id = `bael-toggle-${++this.idCounter}`;
      const config = {
        checked: false,
        label: "",
        labelPosition: "right", // left, right
        onLabel: "", // Text on track when on
        offLabel: "", // Text on track when off
        showIcon: false, // Show check icon in thumb
        size: "default", // small, default, large
        color: "blue", // blue, green, red, purple, orange
        disabled: false,
        name: "",
        value: "",
        onChange: null,
        ...options,
      };

      const el = document.createElement("label");
      el.className = `bael-toggle`;
      if (config.size !== "default") el.classList.add(config.size);
      if (config.color !== "blue") el.classList.add(config.color);
      if (config.checked) el.classList.add("checked");
      if (config.disabled) el.classList.add("disabled");
      el.id = id;
      el.tabIndex = config.disabled ? -1 : 0;

      const state = {
        id,
        element: el,
        container,
        config,
        checked: config.checked,
      };

      this._render(state);
      this._bindEvents(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        isChecked: () => state.checked,
        setChecked: (v) => this._setChecked(state, v),
        toggle: () => this._toggle(state),
        setDisabled: (d) => this._setDisabled(state, d),
        setLoading: (l) => el.classList.toggle("loading", l),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render toggle
     */
    _render(state) {
      const { element, config } = state;

      // Hidden input
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = config.checked;
      if (config.name) input.name = config.name;
      if (config.value) input.value = config.value;
      state.input = input;
      element.appendChild(input);

      // Label (left)
      if (config.label && config.labelPosition === "left") {
        const label = document.createElement("span");
        label.className = "bael-toggle-label";
        label.textContent = config.label;
        element.appendChild(label);
      }

      // Track
      const track = document.createElement("div");
      track.className = "bael-toggle-track";

      // Inner labels
      if (config.onLabel || config.offLabel) {
        const labels = document.createElement("div");
        labels.className = "bael-toggle-labels";
        labels.innerHTML = `
                    <span class="bael-toggle-label-on">${config.onLabel}</span>
                    <span class="bael-toggle-label-off">${config.offLabel}</span>
                `;
        track.appendChild(labels);
      }

      // Thumb
      const thumb = document.createElement("div");
      thumb.className = "bael-toggle-thumb";

      if (config.showIcon) {
        thumb.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                `;
      }

      track.appendChild(thumb);
      element.appendChild(track);

      // Label (right)
      if (config.label && config.labelPosition === "right") {
        const label = document.createElement("span");
        label.className = "bael-toggle-label";
        label.textContent = config.label;
        element.appendChild(label);
      }
    }

    /**
     * Bind events
     */
    _bindEvents(state) {
      const { element, input, config } = state;

      // Click/tap
      element.addEventListener("click", (e) => {
        if (config.disabled) return;
        e.preventDefault();
        this._toggle(state);
      });

      // Keyboard
      element.addEventListener("keydown", (e) => {
        if (config.disabled) return;
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          this._toggle(state);
        }
      });

      // Sync with native input
      input.addEventListener("change", () => {
        this._setChecked(state, input.checked);
      });
    }

    /**
     * Toggle state
     */
    _toggle(state) {
      this._setChecked(state, !state.checked);
    }

    /**
     * Set checked state
     */
    _setChecked(state, checked) {
      if (state.checked === checked) return;

      state.checked = checked;
      state.input.checked = checked;
      state.element.classList.toggle("checked", checked);

      if (state.config.onChange) {
        state.config.onChange(checked);
      }
    }

    /**
     * Set disabled state
     */
    _setDisabled(state, disabled) {
      state.config.disabled = disabled;
      state.element.classList.toggle("disabled", disabled);
      state.element.tabIndex = disabled ? -1 : 0;
      state.input.disabled = disabled;
    }

    /**
     * Destroy toggle
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

  const bael = new BaelToggle();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$toggle = (container, options) => bael.create(container, options);
  window.$switch = window.$toggle;

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelToggle = bael;

  console.log("🔘 BAEL Toggle Switch Component loaded");
})();
