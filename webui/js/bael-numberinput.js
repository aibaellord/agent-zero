/**
 * BAEL Number Input Component - Lord Of All Numbers
 *
 * Numeric input with increment/decrement controls:
 * - Plus/minus buttons
 * - Keyboard navigation
 * - Min/max bounds
 * - Step values
 * - Decimal precision
 * - Size variants
 * - Prefix/suffix
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // NUMBER INPUT CLASS
  // ============================================================

  class BaelNumberInput {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-numberinput-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-numberinput-styles";
      styles.textContent = `
                .bael-numberinput {
                    display: inline-flex;
                    align-items: center;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 8px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    transition: border-color 0.15s;
                }

                .bael-numberinput:focus-within {
                    border-color: rgba(59, 130, 246, 0.5);
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .bael-numberinput.disabled {
                    opacity: 0.5;
                    pointer-events: none;
                }

                /* Buttons */
                .bael-numberinput-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    background: none;
                    border: none;
                    color: #888;
                    cursor: pointer;
                    transition: all 0.15s;
                    flex-shrink: 0;
                }

                .bael-numberinput-btn:hover {
                    color: #fff;
                    background: rgba(255,255,255,0.05);
                }

                .bael-numberinput-btn:active {
                    background: rgba(255,255,255,0.1);
                }

                .bael-numberinput-btn.disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .bael-numberinput-btn.disabled:hover {
                    color: #888;
                    background: none;
                }

                .bael-numberinput-btn svg {
                    width: 16px;
                    height: 16px;
                }

                .bael-numberinput-btn.minus {
                    border-radius: 7px 0 0 7px;
                }

                .bael-numberinput-btn.plus {
                    border-radius: 0 7px 7px 0;
                }

                /* Input wrapper */
                .bael-numberinput-wrapper {
                    display: flex;
                    align-items: center;
                    flex: 1;
                    min-width: 0;
                    border-left: 1px solid rgba(255,255,255,0.08);
                    border-right: 1px solid rgba(255,255,255,0.08);
                }

                /* Prefix/Suffix */
                .bael-numberinput-prefix,
                .bael-numberinput-suffix {
                    padding: 0 8px;
                    font-size: 13px;
                    color: #666;
                    white-space: nowrap;
                }

                .bael-numberinput-prefix {
                    padding-right: 0;
                }

                .bael-numberinput-suffix {
                    padding-left: 0;
                }

                /* Input */
                .bael-numberinput-input {
                    width: 80px;
                    padding: 8px 12px;
                    background: none;
                    border: none;
                    outline: none;
                    font-size: 14px;
                    font-family: inherit;
                    color: #fff;
                    text-align: center;
                    -moz-appearance: textfield;
                }

                .bael-numberinput-input::-webkit-outer-spin-button,
                .bael-numberinput-input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }

                .bael-numberinput-input::placeholder {
                    color: #555;
                }

                /* Size: Small */
                .bael-numberinput.small .bael-numberinput-btn {
                    width: 28px;
                    height: 28px;
                }

                .bael-numberinput.small .bael-numberinput-btn svg {
                    width: 14px;
                    height: 14px;
                }

                .bael-numberinput.small .bael-numberinput-input {
                    width: 60px;
                    padding: 4px 8px;
                    font-size: 12px;
                }

                .bael-numberinput.small .bael-numberinput-prefix,
                .bael-numberinput.small .bael-numberinput-suffix {
                    font-size: 11px;
                }

                /* Size: Large */
                .bael-numberinput.large .bael-numberinput-btn {
                    width: 44px;
                    height: 44px;
                }

                .bael-numberinput.large .bael-numberinput-btn svg {
                    width: 20px;
                    height: 20px;
                }

                .bael-numberinput.large .bael-numberinput-input {
                    width: 100px;
                    padding: 10px 16px;
                    font-size: 16px;
                }

                .bael-numberinput.large .bael-numberinput-prefix,
                .bael-numberinput.large .bael-numberinput-suffix {
                    font-size: 15px;
                }

                /* Vertical variant */
                .bael-numberinput.vertical {
                    flex-direction: column;
                    width: auto;
                }

                .bael-numberinput.vertical .bael-numberinput-btn {
                    width: 100%;
                    height: 24px;
                }

                .bael-numberinput.vertical .bael-numberinput-btn.plus {
                    order: -1;
                    border-radius: 7px 7px 0 0;
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                }

                .bael-numberinput.vertical .bael-numberinput-btn.minus {
                    border-radius: 0 0 7px 7px;
                    border-top: 1px solid rgba(255,255,255,0.08);
                }

                .bael-numberinput.vertical .bael-numberinput-wrapper {
                    border: none;
                }

                /* Borderless variant */
                .bael-numberinput.borderless {
                    background: none;
                    border: none;
                }

                .bael-numberinput.borderless:focus-within {
                    box-shadow: none;
                }

                .bael-numberinput.borderless .bael-numberinput-wrapper {
                    border: none;
                }

                /* Full width */
                .bael-numberinput.full-width {
                    width: 100%;
                }

                .bael-numberinput.full-width .bael-numberinput-input {
                    flex: 1;
                    width: auto;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE NUMBER INPUT
    // ============================================================

    /**
     * Create number input component
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Number input container not found");
        return null;
      }

      const id = `bael-numberinput-${++this.idCounter}`;
      const config = {
        value: 0,
        min: -Infinity,
        max: Infinity,
        step: 1,
        precision: null, // Auto-detect from step
        prefix: "",
        suffix: "",
        placeholder: "",
        disabled: false,
        readonly: false,
        size: "default", // small, default, large
        variant: "default", // default, borderless, vertical
        fullWidth: false,
        allowEmpty: false,
        onChange: null,
        onBlur: null,
        ...options,
      };

      // Auto-detect precision from step
      if (config.precision === null) {
        const stepStr = String(config.step);
        const decimalIdx = stepStr.indexOf(".");
        config.precision =
          decimalIdx >= 0 ? stepStr.length - decimalIdx - 1 : 0;
      }

      const el = document.createElement("div");
      el.className = "bael-numberinput";
      if (config.size !== "default") el.classList.add(config.size);
      if (config.variant === "vertical") el.classList.add("vertical");
      if (config.variant === "borderless") el.classList.add("borderless");
      if (config.fullWidth) el.classList.add("full-width");
      if (config.disabled) el.classList.add("disabled");
      el.id = id;

      const state = {
        id,
        element: el,
        container,
        config,
        value: config.value,
        input: null,
        minusBtn: null,
        plusBtn: null,
      };

      this._render(state);
      this._bindEvents(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        getValue: () => state.value,
        setValue: (v) => this._setValue(state, v),
        increment: () => this._step(state, 1),
        decrement: () => this._step(state, -1),
        setDisabled: (d) => this._setDisabled(state, d),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render number input
     */
    _render(state) {
      const { element, config, value } = state;

      // Minus button
      const minusBtn = document.createElement("button");
      minusBtn.type = "button";
      minusBtn.className = "bael-numberinput-btn minus";
      minusBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
            `;
      state.minusBtn = minusBtn;
      element.appendChild(minusBtn);

      // Input wrapper
      const wrapper = document.createElement("div");
      wrapper.className = "bael-numberinput-wrapper";

      // Prefix
      if (config.prefix) {
        const prefix = document.createElement("span");
        prefix.className = "bael-numberinput-prefix";
        prefix.textContent = config.prefix;
        wrapper.appendChild(prefix);
      }

      // Input
      const input = document.createElement("input");
      input.type = "text";
      input.className = "bael-numberinput-input";
      input.value = this._formatValue(state, value);
      input.placeholder = config.placeholder;
      input.readOnly = config.readonly;
      input.disabled = config.disabled;
      state.input = input;
      wrapper.appendChild(input);

      // Suffix
      if (config.suffix) {
        const suffix = document.createElement("span");
        suffix.className = "bael-numberinput-suffix";
        suffix.textContent = config.suffix;
        wrapper.appendChild(suffix);
      }

      element.appendChild(wrapper);

      // Plus button
      const plusBtn = document.createElement("button");
      plusBtn.type = "button";
      plusBtn.className = "bael-numberinput-btn plus";
      plusBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
            `;
      state.plusBtn = plusBtn;
      element.appendChild(plusBtn);

      this._updateButtonStates(state);
    }

    /**
     * Format value with precision
     */
    _formatValue(state, value) {
      if (value === "" || value === null) return "";
      return Number(value).toFixed(state.config.precision);
    }

    /**
     * Clamp value within bounds
     */
    _clampValue(state, value) {
      const { min, max } = state.config;
      return Math.min(max, Math.max(min, value));
    }

    /**
     * Set value
     */
    _setValue(state, value, fromInput = false) {
      const { config, input } = state;

      // Parse value
      let parsed = parseFloat(value);

      // Handle empty
      if (isNaN(parsed)) {
        if (config.allowEmpty) {
          state.value = "";
          if (!fromInput) input.value = "";
          if (config.onChange) config.onChange("");
          this._updateButtonStates(state);
          return;
        } else {
          parsed = 0;
        }
      }

      // Clamp and round
      parsed = this._clampValue(state, parsed);
      parsed = Math.round(parsed / config.step) * config.step;
      parsed = Number(parsed.toFixed(config.precision));

      const changed = state.value !== parsed;
      state.value = parsed;

      if (!fromInput) {
        input.value = this._formatValue(state, parsed);
      }

      this._updateButtonStates(state);

      if (changed && config.onChange) {
        config.onChange(parsed);
      }
    }

    /**
     * Step value up or down
     */
    _step(state, direction) {
      const { config } = state;
      const currentValue = state.value === "" ? 0 : state.value;
      const newValue = currentValue + config.step * direction;
      this._setValue(state, newValue);
    }

    /**
     * Update button disabled states
     */
    _updateButtonStates(state) {
      const { config, value, minusBtn, plusBtn } = state;

      const atMin = value <= config.min;
      const atMax = value >= config.max;

      minusBtn.classList.toggle("disabled", atMin);
      plusBtn.classList.toggle("disabled", atMax);
    }

    /**
     * Set disabled state
     */
    _setDisabled(state, disabled) {
      state.config.disabled = disabled;
      state.element.classList.toggle("disabled", disabled);
      state.input.disabled = disabled;
    }

    /**
     * Bind events
     */
    _bindEvents(state) {
      const { minusBtn, plusBtn, input, config } = state;

      // Button clicks
      minusBtn.addEventListener("click", () => {
        if (!minusBtn.classList.contains("disabled")) {
          this._step(state, -1);
        }
      });

      plusBtn.addEventListener("click", () => {
        if (!plusBtn.classList.contains("disabled")) {
          this._step(state, 1);
        }
      });

      // Input events
      input.addEventListener("input", () => {
        // Allow typing, validate on blur
      });

      input.addEventListener("blur", () => {
        this._setValue(state, input.value, false);
        if (config.onBlur) config.onBlur(state.value);
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          this._step(state, 1);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          this._step(state, -1);
        } else if (e.key === "Enter") {
          this._setValue(state, input.value, false);
          input.blur();
        }
      });

      // Wheel scroll
      input.addEventListener("wheel", (e) => {
        if (document.activeElement === input) {
          e.preventDefault();
          this._step(state, e.deltaY > 0 ? -1 : 1);
        }
      });
    }

    /**
     * Destroy instance
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

  const bael = new BaelNumberInput();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$numberInput = (container, options) => bael.create(container, options);
  window.$stepper = (container, options) => bael.create(container, options);
  window.$spinner = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelNumberInput = bael;

  console.log("🔢 BAEL Number Input loaded");
})();
