/**
 * BAEL Input Component - Lord Of All Fields
 *
 * Enhanced input fields with:
 * - All HTML5 input types
 * - Validation
 * - Icons (prefix/suffix)
 * - Clear button
 * - Password toggle
 * - Character counter
 * - Auto-grow textarea
 * - Masked input
 * - Floating labels
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // INPUT CLASS
  // ============================================================

  class BaelInput {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-input-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-input-styles";
      styles.textContent = `
                .bael-input-wrapper {
                    --input-primary: #4f46e5;
                    --input-border: #d1d5db;
                    --input-bg: #ffffff;
                    --input-text: #111827;
                    --input-placeholder: #9ca3af;
                    --input-error: #ef4444;
                    --input-success: #10b981;

                    position: relative;
                    width: 100%;
                }

                /* Label */
                .bael-input-label {
                    display: block;
                    margin-bottom: 6px;
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: var(--input-text);
                }

                .bael-input-label.required::after {
                    content: ' *';
                    color: var(--input-error);
                }

                /* Container */
                .bael-input-container {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                /* Input */
                .bael-input {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid var(--input-border);
                    border-radius: 8px;
                    font-size: 0.875rem;
                    color: var(--input-text);
                    background: var(--input-bg);
                    transition: all 0.15s;
                }

                .bael-input::placeholder {
                    color: var(--input-placeholder);
                }

                .bael-input:focus {
                    outline: none;
                    border-color: var(--input-primary);
                    box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
                }

                .bael-input:disabled {
                    background: #f9fafb;
                    cursor: not-allowed;
                    opacity: 0.7;
                }

                .bael-input.has-prefix {
                    padding-left: 40px;
                }

                .bael-input.has-suffix {
                    padding-right: 40px;
                }

                .bael-input.has-clear {
                    padding-right: 36px;
                }

                .bael-input.has-suffix.has-clear {
                    padding-right: 68px;
                }

                /* Icons */
                .bael-input-prefix,
                .bael-input-suffix {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    color: var(--input-placeholder);
                    pointer-events: none;
                }

                .bael-input-prefix {
                    left: 4px;
                }

                .bael-input-suffix {
                    right: 4px;
                }

                .bael-input-suffix.clickable {
                    pointer-events: auto;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: color 0.15s;
                }

                .bael-input-suffix.clickable:hover {
                    color: var(--input-text);
                }

                /* Clear button */
                .bael-input-clear {
                    position: absolute;
                    right: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: none;
                    background: none;
                    color: var(--input-placeholder);
                    cursor: pointer;
                    border-radius: 4px;
                    transition: all 0.15s;
                }

                .bael-input-clear:hover {
                    background: #f3f4f6;
                    color: var(--input-text);
                }

                .bael-input.has-suffix ~ .bael-input-clear {
                    right: 40px;
                }

                /* States */
                .bael-input-wrapper.error .bael-input {
                    border-color: var(--input-error);
                }

                .bael-input-wrapper.error .bael-input:focus {
                    box-shadow: 0 0 0 3px rgba(239,68,68,0.1);
                }

                .bael-input-wrapper.success .bael-input {
                    border-color: var(--input-success);
                }

                .bael-input-wrapper.success .bael-input:focus {
                    box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
                }

                /* Helper text */
                .bael-input-helper {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 6px;
                    font-size: 0.75rem;
                }

                .bael-input-error-text {
                    color: var(--input-error);
                }

                .bael-input-hint {
                    color: #6b7280;
                }

                .bael-input-counter {
                    color: #6b7280;
                    margin-left: auto;
                }

                /* Floating label */
                .bael-input-floating {
                    position: relative;
                }

                .bael-input-floating .bael-input {
                    padding-top: 20px;
                    padding-bottom: 6px;
                }

                .bael-input-floating .bael-input-float-label {
                    position: absolute;
                    left: 13px;
                    top: 50%;
                    transform: translateY(-50%);
                    font-size: 0.875rem;
                    color: var(--input-placeholder);
                    pointer-events: none;
                    transition: all 0.15s;
                    background: var(--input-bg);
                    padding: 0 4px;
                }

                .bael-input-floating .bael-input:focus ~ .bael-input-float-label,
                .bael-input-floating .bael-input:not(:placeholder-shown) ~ .bael-input-float-label {
                    top: 8px;
                    transform: translateY(0);
                    font-size: 0.7rem;
                    color: var(--input-primary);
                }

                .bael-input-floating.has-prefix .bael-input-float-label {
                    left: 40px;
                }

                /* Textarea */
                .bael-input-wrapper textarea.bael-input {
                    min-height: 80px;
                    resize: vertical;
                }

                .bael-input-wrapper textarea.bael-input.auto-grow {
                    resize: none;
                    overflow: hidden;
                }

                /* Sizes */
                .bael-input-wrapper.sm .bael-input {
                    padding: 6px 10px;
                    font-size: 0.8rem;
                }

                .bael-input-wrapper.lg .bael-input {
                    padding: 14px 16px;
                    font-size: 1rem;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE INPUT
    // ============================================================

    /**
     * Create an enhanced input
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Input container not found");
        return null;
      }

      const id = `bael-input-${++this.idCounter}`;
      const config = {
        type: "text",
        name: "",
        value: "",
        placeholder: "",
        label: "",
        hint: "",
        error: "",
        required: false,
        disabled: false,
        readonly: false,
        size: "md", // sm, md, lg
        prefix: null, // icon or text
        suffix: null, // icon or text
        clearable: false,
        showPasswordToggle: true,
        showCounter: false,
        maxLength: null,
        minLength: null,
        pattern: null,
        autoGrow: false, // for textarea
        floatingLabel: false,
        mask: null, // input mask pattern
        validators: [], // custom validators
        validateOnChange: true,
        validateOnBlur: true,
        onChange: null,
        onFocus: null,
        onBlur: null,
        onValidate: null,
        ...options,
      };

      const state = {
        id,
        container,
        config,
        value: config.value,
        isValid: true,
        isTouched: false,
        isDirty: false,
        showPassword: false,
        errors: [],
      };

      // Create structure
      this._createStructure(state);
      this._setupEvents(state);
      this._updateUI(state);

      this.instances.set(id, state);

      return {
        id,
        getValue: () => state.value,
        setValue: (value) => this.setValue(id, value),
        getInput: () => state.input,
        focus: () => state.input.focus(),
        blur: () => state.input.blur(),
        clear: () => this.clear(id),
        validate: () => this.validate(id),
        setError: (error) => this.setError(id, error),
        clearError: () => this.clearError(id),
        enable: () => this.setDisabled(id, false),
        disable: () => this.setDisabled(id, true),
        isValid: () => state.isValid,
        isDirty: () => state.isDirty,
        isTouched: () => state.isTouched,
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Create input structure
     */
    _createStructure(state) {
      const { config, id } = state;

      const wrapper = document.createElement("div");
      wrapper.className = `bael-input-wrapper ${config.size}`;
      wrapper.id = id;

      let html = "";

      // Label
      if (config.label && !config.floatingLabel) {
        html += `
                    <label class="bael-input-label ${config.required ? "required" : ""}">
                        ${config.label}
                    </label>
                `;
      }

      // Container
      html += `<div class="bael-input-container ${config.floatingLabel ? "bael-input-floating" : ""}">`;

      // Prefix
      if (config.prefix) {
        html += `<span class="bael-input-prefix">${config.prefix}</span>`;
      }

      // Input classes
      const inputClasses = ["bael-input"];
      if (config.prefix) inputClasses.push("has-prefix");
      if (
        config.suffix ||
        (config.type === "password" && config.showPasswordToggle)
      ) {
        inputClasses.push("has-suffix");
      }
      if (config.clearable) inputClasses.push("has-clear");
      if (config.autoGrow) inputClasses.push("auto-grow");

      // Input element
      if (config.type === "textarea") {
        html += `
                    <textarea
                        class="${inputClasses.join(" ")}"
                        name="${config.name}"
                        placeholder="${config.floatingLabel ? " " : config.placeholder}"
                        ${config.required ? "required" : ""}
                        ${config.disabled ? "disabled" : ""}
                        ${config.readonly ? "readonly" : ""}
                        ${config.maxLength ? `maxlength="${config.maxLength}"` : ""}
                    >${config.value}</textarea>
                `;
      } else {
        const inputType =
          config.type === "password" && state.showPassword
            ? "text"
            : config.type;
        html += `
                    <input
                        type="${inputType}"
                        class="${inputClasses.join(" ")}"
                        name="${config.name}"
                        value="${config.value}"
                        placeholder="${config.floatingLabel ? " " : config.placeholder}"
                        ${config.required ? "required" : ""}
                        ${config.disabled ? "disabled" : ""}
                        ${config.readonly ? "readonly" : ""}
                        ${config.maxLength ? `maxlength="${config.maxLength}"` : ""}
                        ${config.pattern ? `pattern="${config.pattern}"` : ""}
                    >
                `;
      }

      // Floating label
      if (config.floatingLabel && config.label) {
        html += `<span class="bael-input-float-label">${config.label}</span>`;
      }

      // Clear button
      if (config.clearable) {
        html += `<button type="button" class="bael-input-clear" style="display: none;">✕</button>`;
      }

      // Suffix or password toggle
      if (config.type === "password" && config.showPasswordToggle) {
        html += `<span class="bael-input-suffix clickable" data-toggle="password">👁</span>`;
      } else if (config.suffix) {
        html += `<span class="bael-input-suffix">${config.suffix}</span>`;
      }

      html += "</div>";

      // Helper text
      html += `
                <div class="bael-input-helper">
                    <span class="bael-input-error-text"></span>
                    <span class="bael-input-hint">${config.hint}</span>
                    ${config.showCounter ? '<span class="bael-input-counter"></span>' : ""}
                </div>
            `;

      wrapper.innerHTML = html;
      state.container.appendChild(wrapper);

      state.wrapper = wrapper;
      state.input = wrapper.querySelector(".bael-input");
      state.clearBtn = wrapper.querySelector(".bael-input-clear");
      state.passwordToggle = wrapper.querySelector('[data-toggle="password"]');
      state.errorEl = wrapper.querySelector(".bael-input-error-text");
      state.counterEl = wrapper.querySelector(".bael-input-counter");
    }

    /**
     * Setup event listeners
     */
    _setupEvents(state) {
      const { input, config, clearBtn, passwordToggle } = state;

      // Input events
      input.addEventListener("input", (e) => {
        let value = e.target.value;

        // Apply mask
        if (config.mask) {
          value = this._applyMask(value, config.mask);
          input.value = value;
        }

        state.value = value;
        state.isDirty = true;

        // Auto-grow textarea
        if (config.autoGrow && config.type === "textarea") {
          this._autoGrow(input);
        }

        // Validate on change
        if (config.validateOnChange && state.isTouched) {
          this.validate(state.id);
        }

        this._updateUI(state);

        if (config.onChange) {
          config.onChange(value, state);
        }
      });

      input.addEventListener("focus", () => {
        if (config.onFocus) {
          config.onFocus(state);
        }
      });

      input.addEventListener("blur", () => {
        state.isTouched = true;

        if (config.validateOnBlur) {
          this.validate(state.id);
        }

        if (config.onBlur) {
          config.onBlur(state);
        }
      });

      // Clear button
      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          this.clear(state.id);
          input.focus();
        });
      }

      // Password toggle
      if (passwordToggle) {
        passwordToggle.addEventListener("click", () => {
          state.showPassword = !state.showPassword;
          input.type = state.showPassword ? "text" : "password";
          passwordToggle.textContent = state.showPassword ? "🙈" : "👁";
        });
      }
    }

    /**
     * Update UI based on state
     */
    _updateUI(state) {
      const { wrapper, input, config, clearBtn, counterEl, value } = state;

      // Clear button visibility
      if (clearBtn) {
        clearBtn.style.display = value ? "flex" : "none";
      }

      // Counter
      if (counterEl && config.showCounter) {
        const current = value.length;
        const max = config.maxLength || "∞";
        counterEl.textContent = `${current}/${max}`;
      }

      // Error state
      if (state.errors.length > 0) {
        wrapper.classList.add("error");
        wrapper.classList.remove("success");
        state.errorEl.textContent = state.errors[0];
      } else if (state.isDirty && state.isValid) {
        wrapper.classList.remove("error");
        wrapper.classList.add("success");
        state.errorEl.textContent = "";
      } else {
        wrapper.classList.remove("error", "success");
        state.errorEl.textContent = "";
      }
    }

    /**
     * Auto-grow textarea
     */
    _autoGrow(textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }

    /**
     * Apply input mask
     */
    _applyMask(value, mask) {
      // Simple mask implementation
      // # = digit, A = letter, * = any
      const maskChars = mask.split("");
      const valueChars = value.replace(/[^a-zA-Z0-9]/g, "").split("");
      let result = "";
      let valueIndex = 0;

      for (
        let i = 0;
        i < maskChars.length && valueIndex < valueChars.length;
        i++
      ) {
        const maskChar = maskChars[i];
        const valueChar = valueChars[valueIndex];

        if (maskChar === "#") {
          if (/\d/.test(valueChar)) {
            result += valueChar;
            valueIndex++;
          } else {
            valueIndex++;
            i--;
          }
        } else if (maskChar === "A") {
          if (/[a-zA-Z]/.test(valueChar)) {
            result += valueChar;
            valueIndex++;
          } else {
            valueIndex++;
            i--;
          }
        } else if (maskChar === "*") {
          result += valueChar;
          valueIndex++;
        } else {
          result += maskChar;
        }
      }

      return result;
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    /**
     * Set value
     */
    setValue(inputId, value) {
      const state = this.instances.get(inputId);
      if (!state) return;

      state.value = value;
      state.input.value = value;
      state.isDirty = true;
      this._updateUI(state);
    }

    /**
     * Clear input
     */
    clear(inputId) {
      const state = this.instances.get(inputId);
      if (!state) return;

      state.value = "";
      state.input.value = "";
      state.isDirty = true;
      this.clearError(inputId);
      this._updateUI(state);

      if (state.config.onChange) {
        state.config.onChange("", state);
      }
    }

    /**
     * Validate input
     */
    validate(inputId) {
      const state = this.instances.get(inputId);
      if (!state) return false;

      const { config, value } = state;
      const errors = [];

      // Required
      if (config.required && !value.trim()) {
        errors.push("This field is required");
      }

      // Min length
      if (config.minLength && value.length < config.minLength) {
        errors.push(`Minimum ${config.minLength} characters`);
      }

      // Max length
      if (config.maxLength && value.length > config.maxLength) {
        errors.push(`Maximum ${config.maxLength} characters`);
      }

      // Pattern
      if (config.pattern && value) {
        const regex = new RegExp(config.pattern);
        if (!regex.test(value)) {
          errors.push("Invalid format");
        }
      }

      // Email
      if (config.type === "email" && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push("Invalid email address");
        }
      }

      // URL
      if (config.type === "url" && value) {
        try {
          new URL(value);
        } catch {
          errors.push("Invalid URL");
        }
      }

      // Custom validators
      for (const validator of config.validators) {
        const result = validator(value, state);
        if (result !== true) {
          errors.push(result || "Invalid value");
        }
      }

      state.errors = errors;
      state.isValid = errors.length === 0;

      this._updateUI(state);

      if (config.onValidate) {
        config.onValidate(state.isValid, errors);
      }

      return state.isValid;
    }

    /**
     * Set error manually
     */
    setError(inputId, error) {
      const state = this.instances.get(inputId);
      if (!state) return;

      state.errors = [error];
      state.isValid = false;
      this._updateUI(state);
    }

    /**
     * Clear error
     */
    clearError(inputId) {
      const state = this.instances.get(inputId);
      if (!state) return;

      state.errors = [];
      state.isValid = true;
      this._updateUI(state);
    }

    /**
     * Set disabled state
     */
    setDisabled(inputId, disabled) {
      const state = this.instances.get(inputId);
      if (!state) return;

      state.config.disabled = disabled;
      state.input.disabled = disabled;
    }

    /**
     * Destroy input
     */
    destroy(inputId) {
      const state = this.instances.get(inputId);
      if (!state) return;

      state.wrapper.remove();
      this.instances.delete(inputId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelInput();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$input = (container, options) => bael.create(container, options);
  window.$textInput = (container, options) =>
    bael.create(container, { type: "text", ...options });
  window.$emailInput = (container, options) =>
    bael.create(container, { type: "email", ...options });
  window.$passwordInput = (container, options) =>
    bael.create(container, { type: "password", ...options });
  window.$textarea = (container, options) =>
    bael.create(container, { type: "textarea", ...options });

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelInput = bael;

  console.log("📝 BAEL Input Component loaded");
})();
