/**
 * BAEL Form Component - Lord Of All Forms
 *
 * Comprehensive form management with:
 * - Validation
 * - Field types
 * - Error display
 * - Submit handling
 * - Field dependencies
 * - Dynamic fields
 * - Auto-save
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // FORM CLASS
  // ============================================================

  class BaelForm {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();

      // Built-in validators
      this.validators = {
        required: (value) => {
          if (Array.isArray(value)) return value.length > 0;
          return value !== "" && value !== null && value !== undefined;
        },
        email: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        url: (value) => !value || /^https?:\/\/.+/.test(value),
        minLength: (value, min) => !value || value.length >= min,
        maxLength: (value, max) => !value || value.length <= max,
        min: (value, min) => !value || Number(value) >= min,
        max: (value, max) => !value || Number(value) <= max,
        pattern: (value, pattern) => !value || new RegExp(pattern).test(value),
        match: (value, fieldName, form) => {
          const otherValue = form.getValue(fieldName);
          return value === otherValue;
        },
      };

      // Default messages
      this.messages = {
        required: "This field is required",
        email: "Please enter a valid email address",
        url: "Please enter a valid URL",
        minLength: "Must be at least {min} characters",
        maxLength: "Must be no more than {max} characters",
        min: "Must be at least {min}",
        max: "Must be no more than {max}",
        pattern: "Invalid format",
        match: "Fields do not match",
      };
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-form-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-form-styles";
      styles.textContent = `
                .bael-form {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .bael-form-field {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .bael-form-label {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #374151;
                }

                .bael-form-label-required::after {
                    content: ' *';
                    color: #ef4444;
                }

                .bael-form-input,
                .bael-form-textarea,
                .bael-form-select {
                    padding: 10px 14px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 0.9375rem;
                    transition: border-color 0.15s, box-shadow 0.15s;
                    background: white;
                }

                .bael-form-input:focus,
                .bael-form-textarea:focus,
                .bael-form-select:focus {
                    outline: none;
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                }

                .bael-form-input-error,
                .bael-form-textarea-error,
                .bael-form-select-error {
                    border-color: #ef4444;
                }

                .bael-form-input-error:focus,
                .bael-form-textarea-error:focus,
                .bael-form-select-error:focus {
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
                }

                .bael-form-textarea {
                    resize: vertical;
                    min-height: 100px;
                }

                .bael-form-hint {
                    font-size: 0.8125rem;
                    color: #6b7280;
                }

                .bael-form-error {
                    font-size: 0.8125rem;
                    color: #ef4444;
                }

                /* Checkbox/Radio group */
                .bael-form-options {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .bael-form-options-inline {
                    flex-direction: row;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .bael-form-option {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                }

                .bael-form-option input {
                    width: 18px;
                    height: 18px;
                    accent-color: #4f46e5;
                }

                .bael-form-option-label {
                    font-size: 0.9375rem;
                    color: #374151;
                }

                /* File input */
                .bael-form-file {
                    position: relative;
                }

                .bael-form-file-input {
                    position: absolute;
                    opacity: 0;
                    width: 100%;
                    height: 100%;
                    cursor: pointer;
                }

                .bael-form-file-label {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 20px;
                    border: 2px dashed #d1d5db;
                    border-radius: 8px;
                    color: #6b7280;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .bael-form-file-label:hover {
                    border-color: #4f46e5;
                    color: #4f46e5;
                }

                .bael-form-file-list {
                    margin-top: 8px;
                    font-size: 0.875rem;
                    color: #374151;
                }

                /* Inline layout */
                .bael-form-inline {
                    flex-direction: row;
                    flex-wrap: wrap;
                    align-items: flex-end;
                }

                .bael-form-inline .bael-form-field {
                    flex: 1;
                    min-width: 200px;
                }

                /* Row layout */
                .bael-form-row {
                    display: flex;
                    gap: 16px;
                }

                .bael-form-row .bael-form-field {
                    flex: 1;
                }

                /* Actions */
                .bael-form-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 8px;
                }

                .bael-form-btn {
                    padding: 10px 24px;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.9375rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .bael-form-btn-primary {
                    background: #4f46e5;
                    color: white;
                }

                .bael-form-btn-primary:hover {
                    background: #4338ca;
                }

                .bael-form-btn-primary:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .bael-form-btn-secondary {
                    background: #f3f4f6;
                    color: #374151;
                }

                .bael-form-btn-secondary:hover {
                    background: #e5e7eb;
                }

                /* Field disabled */
                .bael-form-field-disabled {
                    opacity: 0.6;
                    pointer-events: none;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE FORM
    // ============================================================

    /**
     * Create a form
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Form container not found");
        return null;
      }

      const id = `bael-form-${++this.idCounter}`;
      const config = {
        fields: [],
        initialValues: {},
        layout: "vertical",
        validateOnChange: true,
        validateOnBlur: true,
        showErrorsOnSubmit: true,
        autoSave: false,
        autoSaveDelay: 1000,
        onSubmit: null,
        onChange: null,
        onValidate: null,
        onAutoSave: null,
        submitText: "Submit",
        resetText: "Reset",
        showReset: true,
        ...options,
      };

      const state = {
        id,
        container,
        config,
        values: { ...config.initialValues },
        errors: {},
        touched: {},
        dirty: false,
        submitting: false,
        autoSaveTimer: null,
        fieldElements: {},
      };

      // Create form
      this._createStructure(state);
      this._setupEvents(state);

      this.instances.set(id, state);

      return {
        id,
        getValue: (name) => this.getValue(id, name),
        getValues: () => this.getValues(id),
        setValue: (name, value) => this.setValue(id, name, value),
        setValues: (values) => this.setValues(id, values),
        getErrors: () => ({ ...state.errors }),
        validate: () => this.validate(id),
        validateField: (name) => this.validateField(id, name),
        reset: () => this.reset(id),
        submit: () => this.submit(id),
        setFieldDisabled: (name, disabled) =>
          this.setFieldDisabled(id, name, disabled),
        setFieldVisible: (name, visible) =>
          this.setFieldVisible(id, name, visible),
        addField: (field, index) => this.addField(id, field, index),
        removeField: (name) => this.removeField(id, name),
        isDirty: () => state.dirty,
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Create form structure
     */
    _createStructure(state) {
      const { config, container } = state;

      const form = document.createElement("form");
      form.id = state.id;
      form.className = `bael-form bael-form-${config.layout}`;
      form.noValidate = true;

      // Render fields
      config.fields.forEach((field) => {
        const fieldEl = this._createField(state, field);
        form.appendChild(fieldEl);
      });

      // Actions
      const actions = document.createElement("div");
      actions.className = "bael-form-actions";

      const submitBtn = document.createElement("button");
      submitBtn.type = "submit";
      submitBtn.className = "bael-form-btn bael-form-btn-primary";
      submitBtn.textContent = config.submitText;
      actions.appendChild(submitBtn);
      state.submitBtn = submitBtn;

      if (config.showReset) {
        const resetBtn = document.createElement("button");
        resetBtn.type = "button";
        resetBtn.className = "bael-form-btn bael-form-btn-secondary";
        resetBtn.textContent = config.resetText;
        resetBtn.onclick = () => this.reset(state.id);
        actions.appendChild(resetBtn);
      }

      form.appendChild(actions);
      container.appendChild(form);
      state.form = form;
    }

    /**
     * Create a field
     */
    _createField(state, field) {
      const wrapper = document.createElement("div");
      wrapper.className = "bael-form-field";
      wrapper.dataset.field = field.name;

      // Label
      if (field.label) {
        const label = document.createElement("label");
        label.className = "bael-form-label";
        label.htmlFor = `${state.id}-${field.name}`;
        label.textContent = field.label;

        if (field.required) {
          label.classList.add("bael-form-label-required");
        }

        wrapper.appendChild(label);
      }

      // Input element
      let input;
      const inputId = `${state.id}-${field.name}`;

      switch (field.type) {
        case "textarea":
          input = document.createElement("textarea");
          input.className = "bael-form-textarea";
          input.rows = field.rows || 4;
          break;

        case "select":
          input = document.createElement("select");
          input.className = "bael-form-select";

          if (field.placeholder) {
            const placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.textContent = field.placeholder;
            placeholder.disabled = true;
            placeholder.selected = true;
            input.appendChild(placeholder);
          }

          (field.options || []).forEach((opt) => {
            const option = document.createElement("option");
            option.value = opt.value;
            option.textContent = opt.label;
            input.appendChild(option);
          });
          break;

        case "checkbox":
        case "radio":
          const optionsWrapper = document.createElement("div");
          optionsWrapper.className = `bael-form-options ${field.inline ? "bael-form-options-inline" : ""}`;

          (field.options || []).forEach((opt, idx) => {
            const optionLabel = document.createElement("label");
            optionLabel.className = "bael-form-option";

            const optionInput = document.createElement("input");
            optionInput.type = field.type;
            optionInput.name = field.name;
            optionInput.value = opt.value;
            optionInput.id = `${inputId}-${idx}`;

            const optionText = document.createElement("span");
            optionText.className = "bael-form-option-label";
            optionText.textContent = opt.label;

            optionLabel.appendChild(optionInput);
            optionLabel.appendChild(optionText);
            optionsWrapper.appendChild(optionLabel);
          });

          wrapper.appendChild(optionsWrapper);
          state.fieldElements[field.name] = optionsWrapper;
          input = null;
          break;

        case "file":
          const fileWrapper = document.createElement("div");
          fileWrapper.className = "bael-form-file";

          input = document.createElement("input");
          input.type = "file";
          input.className = "bael-form-file-input";
          input.multiple = field.multiple || false;
          input.accept = field.accept || "";

          const fileLabel = document.createElement("div");
          fileLabel.className = "bael-form-file-label";
          fileLabel.innerHTML =
            field.placeholder || "📁 Click or drag files here";

          const fileList = document.createElement("div");
          fileList.className = "bael-form-file-list";

          fileWrapper.appendChild(input);
          fileWrapper.appendChild(fileLabel);
          fileWrapper.appendChild(fileList);
          wrapper.appendChild(fileWrapper);

          state.fieldElements[field.name] = { input, fileList };
          input.id = inputId;
          break;

        default:
          input = document.createElement("input");
          input.type = field.type || "text";
          input.className = "bael-form-input";
          break;
      }

      if (input && field.type !== "file") {
        input.id = inputId;
        input.name = field.name;
        input.placeholder = field.placeholder || "";

        if (field.disabled) input.disabled = true;
        if (field.readonly) input.readOnly = true;
        if (field.autocomplete) input.autocomplete = field.autocomplete;

        // Set initial value
        const initialValue =
          state.values[field.name] ?? field.defaultValue ?? "";
        input.value = initialValue;
        state.values[field.name] = initialValue;

        wrapper.appendChild(input);
        state.fieldElements[field.name] = input;
      }

      // Hint
      if (field.hint) {
        const hint = document.createElement("span");
        hint.className = "bael-form-hint";
        hint.textContent = field.hint;
        wrapper.appendChild(hint);
      }

      // Error placeholder
      const error = document.createElement("span");
      error.className = "bael-form-error";
      error.style.display = "none";
      wrapper.appendChild(error);

      return wrapper;
    }

    /**
     * Setup events
     */
    _setupEvents(state) {
      const { form, config } = state;

      // Submit
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        this.submit(state.id);
      });

      // Field events
      config.fields.forEach((field) => {
        const el = state.fieldElements[field.name];
        if (!el) return;

        if (field.type === "checkbox" || field.type === "radio") {
          el.querySelectorAll("input").forEach((input) => {
            input.addEventListener("change", () => {
              this._handleChange(state, field);
            });
          });
        } else if (field.type === "file") {
          el.input.addEventListener("change", () => {
            this._handleFileChange(state, field, el);
          });
        } else {
          el.addEventListener("input", () => {
            this._handleChange(state, field);
          });

          el.addEventListener("blur", () => {
            state.touched[field.name] = true;
            if (config.validateOnBlur) {
              this.validateField(state.id, field.name);
            }
          });
        }
      });
    }

    /**
     * Handle field change
     */
    _handleChange(state, field) {
      const el = state.fieldElements[field.name];

      if (field.type === "checkbox") {
        const checked = Array.from(el.querySelectorAll("input:checked")).map(
          (i) => i.value,
        );
        state.values[field.name] = checked;
      } else if (field.type === "radio") {
        const checked = el.querySelector("input:checked");
        state.values[field.name] = checked ? checked.value : "";
      } else {
        state.values[field.name] = el.value;
      }

      state.dirty = true;

      if (state.config.validateOnChange) {
        this.validateField(state.id, field.name);
      }

      if (state.config.onChange) {
        state.config.onChange(
          field.name,
          state.values[field.name],
          state.values,
        );
      }

      // Auto-save
      if (state.config.autoSave) {
        clearTimeout(state.autoSaveTimer);
        state.autoSaveTimer = setTimeout(() => {
          if (state.config.onAutoSave) {
            state.config.onAutoSave(state.values);
          }
        }, state.config.autoSaveDelay);
      }
    }

    /**
     * Handle file change
     */
    _handleFileChange(state, field, el) {
      const files = Array.from(el.input.files);
      state.values[field.name] = files;

      el.fileList.innerHTML = files
        .map((f) => `<div>${f.name} (${this._formatFileSize(f.size)})</div>`)
        .join("");

      if (state.config.onChange) {
        state.config.onChange(field.name, files, state.values);
      }
    }

    /**
     * Format file size
     */
    _formatFileSize(bytes) {
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }

    // ============================================================
    // VALIDATION
    // ============================================================

    /**
     * Validate entire form
     */
    validate(formId) {
      const state = this.instances.get(formId);
      if (!state) return false;

      let isValid = true;
      state.errors = {};

      state.config.fields.forEach((field) => {
        const fieldValid = this.validateField(formId, field.name);
        if (!fieldValid) isValid = false;
      });

      if (state.config.onValidate) {
        const customErrors = state.config.onValidate(state.values);
        if (customErrors) {
          Object.assign(state.errors, customErrors);
          Object.keys(customErrors).forEach((name) => {
            this._showError(state, name, customErrors[name]);
          });
          isValid = false;
        }
      }

      return isValid;
    }

    /**
     * Validate single field
     */
    validateField(formId, name) {
      const state = this.instances.get(formId);
      if (!state) return true;

      const field = state.config.fields.find((f) => f.name === name);
      if (!field) return true;

      const value = state.values[name];
      let error = null;

      // Required
      if (field.required && !this.validators.required(value)) {
        error = field.messages?.required || this.messages.required;
      }

      // Validators
      if (!error && field.validators) {
        for (const validator of field.validators) {
          let validatorFn, params, message;

          if (typeof validator === "string") {
            validatorFn = this.validators[validator];
            message = this.messages[validator];
          } else if (typeof validator === "object") {
            validatorFn = this.validators[validator.name] || validator.validate;
            params = validator.params;
            message = validator.message || this.messages[validator.name];
          } else if (typeof validator === "function") {
            validatorFn = validator;
          }

          if (validatorFn) {
            const result = validatorFn(value, params, {
              getValue: (n) => state.values[n],
            });

            if (!result) {
              error = message || "Invalid value";
              if (params && typeof error === "string") {
                error = error.replace(/\{(\w+)\}/g, (_, key) =>
                  typeof params === "object" ? params[key] : params,
                );
              }
              break;
            }
          }
        }
      }

      if (error) {
        state.errors[name] = error;
        this._showError(state, name, error);
        return false;
      } else {
        delete state.errors[name];
        this._hideError(state, name);
        return true;
      }
    }

    /**
     * Show field error
     */
    _showError(state, name, message) {
      const wrapper = state.form.querySelector(`[data-field="${name}"]`);
      if (!wrapper) return;

      const errorEl = wrapper.querySelector(".bael-form-error");
      const input = state.fieldElements[name];

      if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = "block";
      }

      if (input && input.classList) {
        input.classList.add("bael-form-input-error");
      }
    }

    /**
     * Hide field error
     */
    _hideError(state, name) {
      const wrapper = state.form.querySelector(`[data-field="${name}"]`);
      if (!wrapper) return;

      const errorEl = wrapper.querySelector(".bael-form-error");
      const input = state.fieldElements[name];

      if (errorEl) {
        errorEl.style.display = "none";
      }

      if (input && input.classList) {
        input.classList.remove("bael-form-input-error");
      }
    }

    // ============================================================
    // VALUES
    // ============================================================

    /**
     * Get single value
     */
    getValue(formId, name) {
      const state = this.instances.get(formId);
      return state ? state.values[name] : undefined;
    }

    /**
     * Get all values
     */
    getValues(formId) {
      const state = this.instances.get(formId);
      return state ? { ...state.values } : {};
    }

    /**
     * Set single value
     */
    setValue(formId, name, value) {
      const state = this.instances.get(formId);
      if (!state) return;

      state.values[name] = value;
      const el = state.fieldElements[name];

      if (el) {
        if (el.type === "checkbox" || el.tagName === "DIV") {
          el.querySelectorAll("input").forEach((input) => {
            input.checked = Array.isArray(value)
              ? value.includes(input.value)
              : input.value === value;
          });
        } else {
          el.value = value;
        }
      }
    }

    /**
     * Set multiple values
     */
    setValues(formId, values) {
      Object.entries(values).forEach(([name, value]) => {
        this.setValue(formId, name, value);
      });
    }

    // ============================================================
    // ACTIONS
    // ============================================================

    /**
     * Submit form
     */
    async submit(formId) {
      const state = this.instances.get(formId);
      if (!state || state.submitting) return;

      // Mark all as touched
      state.config.fields.forEach((f) => {
        state.touched[f.name] = true;
      });

      const isValid = this.validate(formId);

      if (!isValid) {
        if (state.config.showErrorsOnSubmit) {
          // Scroll to first error
          const firstError = state.form.querySelector(
            '.bael-form-error[style*="block"]',
          );
          if (firstError) {
            firstError.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
        return;
      }

      if (state.config.onSubmit) {
        state.submitting = true;
        state.submitBtn.disabled = true;

        try {
          await state.config.onSubmit(state.values);
        } finally {
          state.submitting = false;
          state.submitBtn.disabled = false;
        }
      }
    }

    /**
     * Reset form
     */
    reset(formId) {
      const state = this.instances.get(formId);
      if (!state) return;

      state.values = { ...state.config.initialValues };
      state.errors = {};
      state.touched = {};
      state.dirty = false;

      // Reset field elements
      state.config.fields.forEach((field) => {
        const value = state.values[field.name] ?? field.defaultValue ?? "";
        this.setValue(formId, field.name, value);
        this._hideError(state, field.name);
      });
    }

    // ============================================================
    // FIELD MANAGEMENT
    // ============================================================

    /**
     * Set field disabled
     */
    setFieldDisabled(formId, name, disabled) {
      const state = this.instances.get(formId);
      if (!state) return;

      const wrapper = state.form.querySelector(`[data-field="${name}"]`);
      if (wrapper) {
        wrapper.classList.toggle("bael-form-field-disabled", disabled);
      }

      const el = state.fieldElements[name];
      if (el) {
        if (el.querySelectorAll) {
          el.querySelectorAll("input").forEach((i) => (i.disabled = disabled));
        } else {
          el.disabled = disabled;
        }
      }
    }

    /**
     * Set field visible
     */
    setFieldVisible(formId, name, visible) {
      const state = this.instances.get(formId);
      if (!state) return;

      const wrapper = state.form.querySelector(`[data-field="${name}"]`);
      if (wrapper) {
        wrapper.style.display = visible ? "" : "none";
      }
    }

    // ============================================================
    // DESTROY
    // ============================================================

    /**
     * Destroy form
     */
    destroy(formId) {
      const state = this.instances.get(formId);
      if (!state) return;

      clearTimeout(state.autoSaveTimer);
      state.form.remove();
      this.instances.delete(formId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelForm();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$form = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelForm = bael;

  console.log("📝 BAEL Form Component loaded");
})();
