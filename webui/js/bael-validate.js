/**
 * BAEL Validation Utilities - Comprehensive Data Validation
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete validation system:
 * - Type validation
 * - String validation
 * - Number validation
 * - Date validation
 * - Object validation
 * - Custom validators
 * - Schema validation
 */

(function () {
  "use strict";

  class BaelValidate {
    constructor() {
      this.validators = new Map();
      this.messages = this.defaultMessages();
      this.registerBuiltInValidators();
      console.log("✓ Bael Validate initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // DEFAULT MESSAGES
    // ═══════════════════════════════════════════════════════════

    defaultMessages() {
      return {
        required: "This field is required",
        string: "Must be a string",
        number: "Must be a number",
        boolean: "Must be a boolean",
        array: "Must be an array",
        object: "Must be an object",
        email: "Must be a valid email address",
        url: "Must be a valid URL",
        phone: "Must be a valid phone number",
        creditCard: "Must be a valid credit card number",
        min: "Must be at least {min}",
        max: "Must be at most {max}",
        minLength: "Must be at least {min} characters",
        maxLength: "Must be at most {max} characters",
        length: "Must be exactly {length} characters",
        pattern: "Invalid format",
        alpha: "Must contain only letters",
        alphanumeric: "Must contain only letters and numbers",
        numeric: "Must contain only numbers",
        integer: "Must be an integer",
        positive: "Must be positive",
        negative: "Must be negative",
        date: "Must be a valid date",
        before: "Must be before {date}",
        after: "Must be after {date}",
        in: "Must be one of: {values}",
        notIn: "Must not be one of: {values}",
        equals: "Must equal {value}",
        notEquals: "Must not equal {value}",
        uuid: "Must be a valid UUID",
        json: "Must be valid JSON",
        hex: "Must be a valid hex value",
        ip: "Must be a valid IP address",
        slug: "Must be a valid slug",
        password:
          "Password must be at least 8 characters with uppercase, lowercase, and number",
      };
    }

    // Set custom messages
    setMessages(messages) {
      Object.assign(this.messages, messages);
      return this;
    }

    // Format message
    formatMessage(key, params = {}) {
      let message = this.messages[key] || key;
      for (const [k, v] of Object.entries(params)) {
        message = message.replace(`{${k}}`, v);
      }
      return message;
    }

    // ═══════════════════════════════════════════════════════════
    // BUILT-IN VALIDATORS
    // ═══════════════════════════════════════════════════════════

    registerBuiltInValidators() {
      // Type validators
      this.register("required", (value) => {
        return value !== undefined && value !== null && value !== "";
      });

      this.register("string", (value) => typeof value === "string");
      this.register(
        "number",
        (value) => typeof value === "number" && !isNaN(value),
      );
      this.register("boolean", (value) => typeof value === "boolean");
      this.register("array", (value) => Array.isArray(value));
      this.register(
        "object",
        (value) =>
          typeof value === "object" && value !== null && !Array.isArray(value),
      );
      this.register("function", (value) => typeof value === "function");

      // String validators
      this.register("email", (value) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !value || regex.test(value);
      });

      this.register("url", (value) => {
        try {
          new URL(value);
          return true;
        } catch {
          return !value;
        }
      });

      this.register("phone", (value) => {
        const regex = /^[\d\s\-\+\(\)]+$/;
        return (
          !value || (regex.test(value) && value.replace(/\D/g, "").length >= 10)
        );
      });

      this.register("creditCard", (value) => {
        if (!value) return true;
        const cleaned = value.replace(/\D/g, "");
        return this.luhn(cleaned);
      });

      this.register("alpha", (value) => /^[a-zA-Z]*$/.test(value));
      this.register("alphanumeric", (value) => /^[a-zA-Z0-9]*$/.test(value));
      this.register("numeric", (value) => /^[0-9]*$/.test(value));

      this.register("uuid", (value) => {
        const regex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return !value || regex.test(value);
      });

      this.register("hex", (value) => /^[0-9a-fA-F]*$/.test(value));

      this.register("ip", (value) => {
        const ipv4 =
          /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        const ipv6 = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
        return !value || ipv4.test(value) || ipv6.test(value);
      });

      this.register("slug", (value) =>
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
      );

      this.register("json", (value) => {
        if (!value) return true;
        try {
          JSON.parse(value);
          return true;
        } catch {
          return false;
        }
      });

      // Number validators
      this.register("integer", (value) => Number.isInteger(value));
      this.register(
        "positive",
        (value) => typeof value === "number" && value > 0,
      );
      this.register(
        "negative",
        (value) => typeof value === "number" && value < 0,
      );

      // Date validators
      this.register("date", (value) => {
        if (!value) return true;
        const date = new Date(value);
        return !isNaN(date.getTime());
      });

      // Password strength
      this.register("password", (value) => {
        if (!value) return true;
        return (
          value.length >= 8 &&
          /[a-z]/.test(value) &&
          /[A-Z]/.test(value) &&
          /[0-9]/.test(value)
        );
      });

      this.register("strongPassword", (value) => {
        if (!value) return true;
        return (
          value.length >= 12 &&
          /[a-z]/.test(value) &&
          /[A-Z]/.test(value) &&
          /[0-9]/.test(value) &&
          /[^a-zA-Z0-9]/.test(value)
        );
      });
    }

    // ═══════════════════════════════════════════════════════════
    // VALIDATOR REGISTRATION
    // ═══════════════════════════════════════════════════════════

    register(name, validator, message) {
      this.validators.set(name, validator);
      if (message) {
        this.messages[name] = message;
      }
      return this;
    }

    // ═══════════════════════════════════════════════════════════
    // VALIDATION METHODS
    // ═══════════════════════════════════════════════════════════

    // Validate single value
    validate(value, rules) {
      const errors = [];

      for (const rule of this.parseRules(rules)) {
        const result = this.runRule(value, rule);
        if (!result.valid) {
          errors.push(result.message);
        }
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    }

    // Validate object against schema
    validateSchema(data, schema) {
      const errors = {};
      let valid = true;

      for (const [field, rules] of Object.entries(schema)) {
        const value = this.getNestedValue(data, field);
        const result = this.validate(value, rules);

        if (!result.valid) {
          valid = false;
          errors[field] = result.errors;
        }
      }

      return { valid, errors };
    }

    // Parse rules
    parseRules(rules) {
      if (typeof rules === "string") {
        return rules.split("|").map((rule) => {
          const [name, params] = rule.split(":");
          return {
            name,
            params: params ? params.split(",") : [],
          };
        });
      }

      if (Array.isArray(rules)) {
        return rules.map((rule) => {
          if (typeof rule === "string") {
            const [name, params] = rule.split(":");
            return {
              name,
              params: params ? params.split(",") : [],
            };
          }
          return rule;
        });
      }

      return [rules];
    }

    // Run single rule
    runRule(value, rule) {
      const { name, params = [] } = rule;

      // Built-in validators with params
      switch (name) {
        case "min":
          return {
            valid:
              typeof value === "number" ? value >= Number(params[0]) : true,
            message: this.formatMessage("min", { min: params[0] }),
          };

        case "max":
          return {
            valid:
              typeof value === "number" ? value <= Number(params[0]) : true,
            message: this.formatMessage("max", { max: params[0] }),
          };

        case "minLength":
          return {
            valid: !value || String(value).length >= Number(params[0]),
            message: this.formatMessage("minLength", { min: params[0] }),
          };

        case "maxLength":
          return {
            valid: !value || String(value).length <= Number(params[0]),
            message: this.formatMessage("maxLength", { max: params[0] }),
          };

        case "length":
          return {
            valid: !value || String(value).length === Number(params[0]),
            message: this.formatMessage("length", { length: params[0] }),
          };

        case "pattern":
          return {
            valid: !value || new RegExp(params[0]).test(value),
            message: this.formatMessage("pattern"),
          };

        case "in":
          return {
            valid: params.includes(String(value)),
            message: this.formatMessage("in", { values: params.join(", ") }),
          };

        case "notIn":
          return {
            valid: !params.includes(String(value)),
            message: this.formatMessage("notIn", { values: params.join(", ") }),
          };

        case "equals":
          return {
            valid: String(value) === params[0],
            message: this.formatMessage("equals", { value: params[0] }),
          };

        case "before":
          return {
            valid: !value || new Date(value) < new Date(params[0]),
            message: this.formatMessage("before", { date: params[0] }),
          };

        case "after":
          return {
            valid: !value || new Date(value) > new Date(params[0]),
            message: this.formatMessage("after", { date: params[0] }),
          };

        case "between":
          return {
            valid:
              typeof value === "number" &&
              value >= Number(params[0]) &&
              value <= Number(params[1]),
            message: `Must be between ${params[0]} and ${params[1]}`,
          };

        case "size":
          if (Array.isArray(value)) {
            return {
              valid: value.length === Number(params[0]),
              message: `Array must have exactly ${params[0]} items`,
            };
          }
          return {
            valid: String(value).length === Number(params[0]),
            message: this.formatMessage("length", { length: params[0] }),
          };

        default:
          // Check registered validators
          if (this.validators.has(name)) {
            const validator = this.validators.get(name);
            return {
              valid: validator(value, ...params),
              message: this.formatMessage(name),
            };
          }

          // Custom function
          if (typeof name === "function") {
            return {
              valid: name(value, ...params),
              message: params[0] || "Validation failed",
            };
          }

          return { valid: true, message: "" };
      }
    }

    // ═══════════════════════════════════════════════════════════
    // QUICK VALIDATORS
    // ═══════════════════════════════════════════════════════════

    isEmail(value) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    isUrl(value) {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }

    isPhone(value) {
      return (
        /^[\d\s\-\+\(\)]+$/.test(value) && value.replace(/\D/g, "").length >= 10
      );
    }

    isUuid(value) {
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
      );
    }

    isIp(value) {
      const ipv4 =
        /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      return ipv4.test(value);
    }

    isCreditCard(value) {
      return this.luhn(value.replace(/\D/g, ""));
    }

    isHexColor(value) {
      return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);
    }

    isSlug(value) {
      return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
    }

    isJson(value) {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    }

    isEmpty(value) {
      if (value === null || value === undefined) return true;
      if (typeof value === "string") return value.trim() === "";
      if (Array.isArray(value)) return value.length === 0;
      if (typeof value === "object") return Object.keys(value).length === 0;
      return false;
    }

    isNotEmpty(value) {
      return !this.isEmpty(value);
    }

    // ═══════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════

    // Luhn algorithm for credit cards
    luhn(num) {
      if (!num || !/^\d+$/.test(num)) return false;

      let sum = 0;
      let isEven = false;

      for (let i = num.length - 1; i >= 0; i--) {
        let digit = parseInt(num[i], 10);

        if (isEven) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }

        sum += digit;
        isEven = !isEven;
      }

      return sum % 10 === 0;
    }

    // Get nested value
    getNestedValue(obj, path) {
      return path.split(".").reduce((o, p) => o && o[p], obj);
    }

    // ═══════════════════════════════════════════════════════════
    // FORM INTEGRATION
    // ═══════════════════════════════════════════════════════════

    // Create form validator
    createFormValidator(schema, options = {}) {
      const self = this;

      return {
        schema,
        options: {
          validateOnInput: true,
          validateOnBlur: true,
          showErrors: true,
          ...options,
        },

        // Validate form element
        validateForm(form) {
          const data = this.getFormData(form);
          return self.validateSchema(data, this.schema);
        },

        // Get form data
        getFormData(form) {
          const formData = new FormData(form);
          const data = {};

          for (const [key, value] of formData.entries()) {
            data[key] = value;
          }

          return data;
        },

        // Attach to form
        attach(form) {
          const fields = form.querySelectorAll("input, select, textarea");

          fields.forEach((field) => {
            if (this.options.validateOnInput) {
              field.addEventListener("input", () => {
                this.validateField(form, field);
              });
            }

            if (this.options.validateOnBlur) {
              field.addEventListener("blur", () => {
                this.validateField(form, field);
              });
            }
          });

          form.addEventListener("submit", (e) => {
            const result = this.validateForm(form);

            if (!result.valid) {
              e.preventDefault();
              this.showAllErrors(form, result.errors);
            }
          });

          return this;
        },

        // Validate single field
        validateField(form, field) {
          const name = field.name;
          if (!name || !this.schema[name]) return { valid: true };

          const result = self.validate(field.value, this.schema[name]);

          if (this.options.showErrors) {
            this.showFieldError(field, result);
          }

          return result;
        },

        // Show field error
        showFieldError(field, result) {
          const container = field.closest(".form-group") || field.parentElement;
          let errorEl = container.querySelector(".validation-error");

          if (!result.valid) {
            if (!errorEl) {
              errorEl = document.createElement("div");
              errorEl.className = "validation-error";
              container.appendChild(errorEl);
            }
            errorEl.textContent = result.errors[0];
            field.classList.add("invalid");
            field.classList.remove("valid");
          } else {
            if (errorEl) errorEl.remove();
            field.classList.remove("invalid");
            if (field.value) field.classList.add("valid");
          }
        },

        // Show all errors
        showAllErrors(form, errors) {
          for (const [field, msgs] of Object.entries(errors)) {
            const el = form.querySelector(`[name="${field}"]`);
            if (el) {
              this.showFieldError(el, { valid: false, errors: msgs });
            }
          }
        },
      };
    }

    // ═══════════════════════════════════════════════════════════
    // SANITIZATION
    // ═══════════════════════════════════════════════════════════

    // Sanitize HTML
    sanitizeHtml(html) {
      const temp = document.createElement("div");
      temp.textContent = html;
      return temp.innerHTML;
    }

    // Strip tags
    stripTags(html) {
      const temp = document.createElement("div");
      temp.innerHTML = html;
      return temp.textContent || temp.innerText || "";
    }

    // Trim
    trim(value) {
      return typeof value === "string" ? value.trim() : value;
    }

    // Normalize email
    normalizeEmail(email) {
      return email ? email.toLowerCase().trim() : "";
    }

    // Escape regex
    escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
  }

  // Initialize
  window.BaelValidate = new BaelValidate();

  // Global shortcuts
  window.$validate = (value, rules) =>
    window.BaelValidate.validate(value, rules);
  window.$isEmail = (value) => window.BaelValidate.isEmail(value);
  window.$isUrl = (value) => window.BaelValidate.isUrl(value);
  window.$isEmpty = (value) => window.BaelValidate.isEmpty(value);
})();
