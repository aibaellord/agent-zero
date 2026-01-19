/**
 * BAEL Form Validator - Comprehensive Form Validation
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete validation system with:
 * - Built-in validators
 * - Custom validation rules
 * - Async validation
 * - Field dependencies
 * - Error messages
 * - Real-time validation
 */

(function () {
  "use strict";

  class BaelFormValidator {
    constructor() {
      this.validators = new Map();
      this.forms = new Map();
      this.messages = {
        required: "This field is required",
        email: "Please enter a valid email",
        url: "Please enter a valid URL",
        number: "Please enter a valid number",
        min: "Value must be at least {min}",
        max: "Value must be at most {max}",
        minLength: "Must be at least {minLength} characters",
        maxLength: "Must be at most {maxLength} characters",
        pattern: "Invalid format",
        match: "Fields do not match",
        custom: "Invalid value",
      };
      this.init();
    }

    init() {
      this.registerBuiltInValidators();
      this.observeForms();
      console.log("✓ Bael Form Validator initialized");
    }

    // Register built-in validators
    registerBuiltInValidators() {
      this.register("required", (value) => {
        if (value === null || value === undefined) return false;
        if (typeof value === "string") return value.trim().length > 0;
        if (Array.isArray(value)) return value.length > 0;
        return true;
      });

      this.register("email", (value) => {
        if (!value) return true; // Let required handle empty
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      });

      this.register("url", (value) => {
        if (!value) return true;
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      });

      this.register("number", (value) => {
        if (!value && value !== 0) return true;
        return !isNaN(parseFloat(value)) && isFinite(value);
      });

      this.register("integer", (value) => {
        if (!value && value !== 0) return true;
        return Number.isInteger(parseFloat(value));
      });

      this.register("min", (value, { min }) => {
        if (!value && value !== 0) return true;
        return parseFloat(value) >= min;
      });

      this.register("max", (value, { max }) => {
        if (!value && value !== 0) return true;
        return parseFloat(value) <= max;
      });

      this.register("minLength", (value, { minLength }) => {
        if (!value) return true;
        return String(value).length >= minLength;
      });

      this.register("maxLength", (value, { maxLength }) => {
        if (!value) return true;
        return String(value).length <= maxLength;
      });

      this.register("pattern", (value, { pattern }) => {
        if (!value) return true;
        const regex =
          typeof pattern === "string" ? new RegExp(pattern) : pattern;
        return regex.test(value);
      });

      this.register("match", (value, { match }, formData) => {
        return value === formData[match];
      });

      this.register("alphanumeric", (value) => {
        if (!value) return true;
        return /^[a-zA-Z0-9]+$/.test(value);
      });

      this.register("alpha", (value) => {
        if (!value) return true;
        return /^[a-zA-Z]+$/.test(value);
      });

      this.register("phone", (value) => {
        if (!value) return true;
        return (
          /^[\d\s\-+()]+$/.test(value) && value.replace(/\D/g, "").length >= 10
        );
      });

      this.register("date", (value) => {
        if (!value) return true;
        const date = new Date(value);
        return !isNaN(date.getTime());
      });

      this.register("json", (value) => {
        if (!value) return true;
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      });

      this.register("creditCard", (value) => {
        if (!value) return true;
        const digits = value.replace(/\D/g, "");
        if (digits.length < 13 || digits.length > 19) return false;

        // Luhn algorithm
        let sum = 0;
        let isEven = false;
        for (let i = digits.length - 1; i >= 0; i--) {
          let digit = parseInt(digits[i], 10);
          if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
          }
          sum += digit;
          isEven = !isEven;
        }
        return sum % 10 === 0;
      });
    }

    // Register a custom validator
    register(name, validator) {
      this.validators.set(name, validator);
      return this;
    }

    // Set custom messages
    setMessages(messages) {
      this.messages = { ...this.messages, ...messages };
      return this;
    }

    // Create form validation
    createForm(formEl, schema, options = {}) {
      const form =
        typeof formEl === "string" ? document.querySelector(formEl) : formEl;
      if (!form) return null;

      const formId = form.id || `form_${Date.now()}`;
      form.id = formId;

      const formState = {
        element: form,
        schema,
        options: {
          validateOnBlur: true,
          validateOnChange: true,
          validateOnSubmit: true,
          showErrors: true,
          errorClass: "bael-error",
          validClass: "bael-valid",
          ...options,
        },
        errors: {},
        touched: {},
        dirty: {},
        isValid: false,
        isSubmitting: false,
      };

      this.forms.set(formId, formState);
      this.attachFormListeners(formState);

      return {
        validate: () => this.validateForm(formId),
        validateField: (name) => this.validateField(formId, name),
        getErrors: () => ({ ...formState.errors }),
        getData: () => this.getFormData(form),
        reset: () => this.resetForm(formId),
        isValid: () => formState.isValid,
        onSubmit: (handler) => {
          formState.submitHandler = handler;
        },
      };
    }

    // Attach form listeners
    attachFormListeners(formState) {
      const { element: form, options, schema } = formState;

      // Blur validation
      if (options.validateOnBlur) {
        form.addEventListener(
          "blur",
          (e) => {
            const name = e.target.name;
            if (name && schema[name]) {
              formState.touched[name] = true;
              this.validateField(form.id, name);
            }
          },
          true,
        );
      }

      // Change validation
      if (options.validateOnChange) {
        form.addEventListener("input", (e) => {
          const name = e.target.name;
          if (name && schema[name]) {
            formState.dirty[name] = true;
            if (formState.touched[name]) {
              this.validateField(form.id, name);
            }
          }
        });
      }

      // Submit validation
      if (options.validateOnSubmit) {
        form.addEventListener("submit", async (e) => {
          e.preventDefault();

          formState.isSubmitting = true;
          const isValid = await this.validateForm(form.id);

          if (isValid && formState.submitHandler) {
            try {
              await formState.submitHandler(this.getFormData(form));
            } catch (error) {
              console.error("Form submit error:", error);
            }
          }

          formState.isSubmitting = false;
        });
      }
    }

    // Validate entire form
    async validateForm(formId) {
      const formState = this.forms.get(formId);
      if (!formState) return false;

      const { element: form, schema } = formState;
      const formData = this.getFormData(form);
      let isValid = true;

      for (const fieldName of Object.keys(schema)) {
        const fieldValid = await this.validateFieldInternal(
          formState,
          fieldName,
          formData,
        );
        if (!fieldValid) isValid = false;
      }

      formState.isValid = isValid;
      this.updateFormUI(formState);

      return isValid;
    }

    // Validate single field
    async validateField(formId, fieldName) {
      const formState = this.forms.get(formId);
      if (!formState) return false;

      const formData = this.getFormData(formState.element);
      const isValid = await this.validateFieldInternal(
        formState,
        fieldName,
        formData,
      );

      this.updateFieldUI(formState, fieldName);

      return isValid;
    }

    // Internal field validation
    async validateFieldInternal(formState, fieldName, formData) {
      const { schema } = formState;
      const rules = schema[fieldName];
      const value = formData[fieldName];

      delete formState.errors[fieldName];

      for (const [ruleName, ruleConfig] of Object.entries(rules)) {
        const validator = this.validators.get(ruleName);
        if (!validator) continue;

        let isValid;
        const params =
          typeof ruleConfig === "object" &&
          ruleConfig !== null &&
          !Array.isArray(ruleConfig)
            ? ruleConfig
            : { [ruleName]: ruleConfig };

        try {
          isValid = await validator(value, params, formData);
        } catch (error) {
          isValid = false;
        }

        if (!isValid) {
          const message =
            params.message || this.messages[ruleName] || this.messages.custom;
          formState.errors[fieldName] = this.interpolateMessage(
            message,
            params,
          );
          return false;
        }
      }

      return true;
    }

    // Interpolate message with params
    interpolateMessage(message, params) {
      return message.replace(/{(\w+)}/g, (match, key) => {
        return params[key] !== undefined ? params[key] : match;
      });
    }

    // Get form data
    getFormData(form) {
      const formData = new FormData(form);
      const data = {};

      formData.forEach((value, key) => {
        // Handle multiple values (checkboxes, etc.)
        if (data[key]) {
          if (!Array.isArray(data[key])) {
            data[key] = [data[key]];
          }
          data[key].push(value);
        } else {
          data[key] = value;
        }
      });

      return data;
    }

    // Update form UI
    updateFormUI(formState) {
      Object.keys(formState.schema).forEach((fieldName) => {
        this.updateFieldUI(formState, fieldName);
      });
    }

    // Update field UI
    updateFieldUI(formState, fieldName) {
      const { element: form, options, errors } = formState;
      const field = form.querySelector(`[name="${fieldName}"]`);
      if (!field) return;

      const hasError = !!errors[fieldName];
      const container = field.closest(".form-field") || field.parentElement;

      // Update classes
      field.classList.toggle(options.errorClass, hasError);
      field.classList.toggle(
        options.validClass,
        !hasError && formState.touched[fieldName],
      );

      // Update error message
      if (options.showErrors) {
        let errorEl = container.querySelector(".bael-field-error");

        if (hasError) {
          if (!errorEl) {
            errorEl = document.createElement("div");
            errorEl.className = "bael-field-error";
            container.appendChild(errorEl);
          }
          errorEl.textContent = errors[fieldName];
        } else if (errorEl) {
          errorEl.remove();
        }
      }
    }

    // Reset form
    resetForm(formId) {
      const formState = this.forms.get(formId);
      if (!formState) return;

      formState.element.reset();
      formState.errors = {};
      formState.touched = {};
      formState.dirty = {};
      formState.isValid = false;

      // Clear UI
      formState.element
        .querySelectorAll(".bael-error, .bael-valid")
        .forEach((el) => {
          el.classList.remove("bael-error", "bael-valid");
        });
      formState.element.querySelectorAll(".bael-field-error").forEach((el) => {
        el.remove();
      });
    }

    // Observe forms with data-validate attribute
    observeForms() {
      document.querySelectorAll("form[data-validate]").forEach((form) => {
        const schemaAttr = form.dataset.validate;
        if (schemaAttr && window[schemaAttr]) {
          this.createForm(form, window[schemaAttr]);
        }
      });

      // Watch for new forms
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              const forms =
                node.tagName === "FORM"
                  ? [node]
                  : node.querySelectorAll?.("form[data-validate]") || [];

              forms.forEach((form) => {
                if (form.dataset?.validate) {
                  const schema = window[form.dataset.validate];
                  if (schema) this.createForm(form, schema);
                }
              });
            }
          });
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }

    // Validate standalone value
    async validate(value, rules) {
      for (const [ruleName, ruleConfig] of Object.entries(rules)) {
        const validator = this.validators.get(ruleName);
        if (!validator) continue;

        const params =
          typeof ruleConfig === "object"
            ? ruleConfig
            : { [ruleName]: ruleConfig };

        try {
          const isValid = await validator(value, params, {});
          if (!isValid) {
            const message =
              params.message || this.messages[ruleName] || this.messages.custom;
            return {
              valid: false,
              error: this.interpolateMessage(message, params),
            };
          }
        } catch (error) {
          return { valid: false, error: error.message };
        }
      }

      return { valid: true };
    }

    // Add validation styles
    addStyles() {
      if (document.getElementById("bael-validator-styles")) return;

      const style = document.createElement("style");
      style.id = "bael-validator-styles";
      style.textContent = `
                .bael-error {
                    border-color: #e74c3c !important;
                }

                .bael-valid {
                    border-color: #2ecc71 !important;
                }

                .bael-field-error {
                    color: #e74c3c;
                    font-size: 12px;
                    margin-top: 4px;
                }
            `;
      document.head.appendChild(style);
    }
  }

  // Initialize
  window.BaelValidator = new BaelFormValidator();
  window.BaelValidator.addStyles();
})();
