/**
 * BAEL Password Strength Component - Lord Of All Passwords
 *
 * Password validation & strength:
 * - Real-time strength meter
 * - Requirement checklist
 * - Show/hide toggle
 * - Visual feedback
 * - Customizable rules
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // PASSWORD STRENGTH CLASS
  // ============================================================

  class BaelPasswordStrength {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-password-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-password-styles";
      styles.textContent = `
                .bael-password {
                    font-family: system-ui, -apple-system, sans-serif;
                }

                .bael-password-input-wrapper {
                    position: relative;
                }

                .bael-password-input {
                    width: 100%;
                    padding: 12px 48px 12px 16px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.15s, box-shadow 0.15s;
                }

                .bael-password-input:focus {
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                }

                .bael-password-toggle {
                    position: absolute;
                    right: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    border: none;
                    background: transparent;
                    color: #9ca3af;
                    cursor: pointer;
                    padding: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: color 0.15s;
                }

                .bael-password-toggle:hover {
                    color: #6b7280;
                }

                .bael-password-toggle svg {
                    width: 20px;
                    height: 20px;
                }

                .bael-password-strength {
                    margin-top: 8px;
                }

                .bael-password-meter {
                    height: 4px;
                    background: #e5e7eb;
                    border-radius: 2px;
                    overflow: hidden;
                }

                .bael-password-meter-fill {
                    height: 100%;
                    width: 0%;
                    transition: width 0.3s, background-color 0.3s;
                    border-radius: 2px;
                }

                .bael-password-meter-fill.weak { background: #ef4444; width: 25%; }
                .bael-password-meter-fill.fair { background: #f59e0b; width: 50%; }
                .bael-password-meter-fill.good { background: #84cc16; width: 75%; }
                .bael-password-meter-fill.strong { background: #22c55e; width: 100%; }

                .bael-password-label {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 6px;
                    font-size: 12px;
                }

                .bael-password-label-text {
                    font-weight: 500;
                }

                .bael-password-label-text.weak { color: #ef4444; }
                .bael-password-label-text.fair { color: #f59e0b; }
                .bael-password-label-text.good { color: #84cc16; }
                .bael-password-label-text.strong { color: #22c55e; }

                .bael-password-score {
                    color: #9ca3af;
                }

                .bael-password-requirements {
                    margin-top: 12px;
                    padding: 12px;
                    background: #f9fafb;
                    border-radius: 8px;
                }

                .bael-password-requirements-title {
                    font-size: 12px;
                    font-weight: 600;
                    color: #6b7280;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .bael-password-req {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 4px 0;
                    font-size: 13px;
                    color: #6b7280;
                    transition: color 0.15s;
                }

                .bael-password-req.met {
                    color: #22c55e;
                }

                .bael-password-req-icon {
                    width: 16px;
                    height: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .bael-password-req-icon svg {
                    width: 16px;
                    height: 16px;
                }

                /* Generate button */
                .bael-password-generate {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    border: 1px solid #e5e7eb;
                    background: white;
                    border-radius: 6px;
                    font-size: 12px;
                    color: #6b7280;
                    cursor: pointer;
                    transition: all 0.15s;
                    margin-top: 8px;
                }

                .bael-password-generate:hover {
                    border-color: #4f46e5;
                    color: #4f46e5;
                }

                .bael-password-generate svg {
                    width: 14px;
                    height: 14px;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE PASSWORD INPUT
    // ============================================================

    /**
     * Create password strength input
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Password container not found");
        return null;
      }

      const id = `bael-password-${++this.idCounter}`;
      const config = {
        placeholder: "Enter password",
        showToggle: true,
        showMeter: true,
        showRequirements: true,
        showGenerate: false,
        minLength: 8,
        requirements: [
          {
            id: "length",
            label: "At least 8 characters",
            test: (p) => p.length >= 8,
          },
          {
            id: "lowercase",
            label: "Contains lowercase letter",
            test: (p) => /[a-z]/.test(p),
          },
          {
            id: "uppercase",
            label: "Contains uppercase letter",
            test: (p) => /[A-Z]/.test(p),
          },
          {
            id: "number",
            label: "Contains a number",
            test: (p) => /\d/.test(p),
          },
          {
            id: "special",
            label: "Contains special character",
            test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
          },
        ],
        onChange: null,
        onStrengthChange: null,
        ...options,
      };

      const el = document.createElement("div");
      el.className = "bael-password";
      el.id = id;

      const state = {
        id,
        element: el,
        container,
        config,
        visible: false,
        strength: 0,
        label: "",
      };

      this._render(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        getValue: () => state.input.value,
        setValue: (value) => this._setValue(state, value),
        getStrength: () => state.strength,
        isValid: () => this._isValid(state),
        focus: () => state.input.focus(),
        generate: () => this._generatePassword(state),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render password input
     */
    _render(state) {
      const { element, config } = state;

      element.innerHTML = "";

      // Input wrapper
      const wrapper = document.createElement("div");
      wrapper.className = "bael-password-input-wrapper";

      // Input
      const input = document.createElement("input");
      input.type = "password";
      input.className = "bael-password-input";
      input.placeholder = config.placeholder;
      input.addEventListener("input", () => this._handleInput(state));
      state.input = input;
      wrapper.appendChild(input);

      // Toggle visibility
      if (config.showToggle) {
        const toggle = document.createElement("button");
        toggle.type = "button";
        toggle.className = "bael-password-toggle";
        toggle.innerHTML = this._getEyeIcon(false);
        toggle.addEventListener("click", () => this._toggleVisibility(state));
        state.toggle = toggle;
        wrapper.appendChild(toggle);
      }

      element.appendChild(wrapper);

      // Strength meter
      if (config.showMeter) {
        const strength = document.createElement("div");
        strength.className = "bael-password-strength";

        const meter = document.createElement("div");
        meter.className = "bael-password-meter";

        const fill = document.createElement("div");
        fill.className = "bael-password-meter-fill";
        state.meterFill = fill;
        meter.appendChild(fill);
        strength.appendChild(meter);

        const label = document.createElement("div");
        label.className = "bael-password-label";
        label.innerHTML = `
                    <span class="bael-password-label-text"></span>
                    <span class="bael-password-score"></span>
                `;
        state.labelEl = label;
        strength.appendChild(label);

        element.appendChild(strength);
      }

      // Requirements
      if (config.showRequirements) {
        const reqs = document.createElement("div");
        reqs.className = "bael-password-requirements";

        const title = document.createElement("div");
        title.className = "bael-password-requirements-title";
        title.textContent = "Password Requirements";
        reqs.appendChild(title);

        config.requirements.forEach((req) => {
          const reqEl = document.createElement("div");
          reqEl.className = "bael-password-req";
          reqEl.id = `${state.id}-req-${req.id}`;
          reqEl.innerHTML = `
                        <span class="bael-password-req-icon">${this._getCircleIcon()}</span>
                        <span>${req.label}</span>
                    `;
          reqs.appendChild(reqEl);
        });

        element.appendChild(reqs);
      }

      // Generate button
      if (config.showGenerate) {
        const generate = document.createElement("button");
        generate.type = "button";
        generate.className = "bael-password-generate";
        generate.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                        <path d="M3 3v5h5"/>
                        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                        <path d="M16 21h5v-5"/>
                    </svg>
                    Generate Strong Password
                `;
        generate.addEventListener("click", () => this._generatePassword(state));
        element.appendChild(generate);
      }
    }

    /**
     * Handle input
     */
    _handleInput(state) {
      const password = state.input.value;
      this._updateStrength(state, password);
      this._updateRequirements(state, password);

      if (state.config.onChange) {
        state.config.onChange(password, state.strength);
      }
    }

    /**
     * Update strength meter
     */
    _updateStrength(state, password) {
      const { config, meterFill, labelEl } = state;

      if (!password) {
        state.strength = 0;
        state.label = "";
        if (meterFill) meterFill.className = "bael-password-meter-fill";
        if (labelEl) {
          labelEl.querySelector(".bael-password-label-text").textContent = "";
          labelEl.querySelector(".bael-password-label-text").className =
            "bael-password-label-text";
          labelEl.querySelector(".bael-password-score").textContent = "";
        }
        return;
      }

      // Calculate strength score
      let score = 0;

      // Length
      if (password.length >= 8) score += 1;
      if (password.length >= 12) score += 1;
      if (password.length >= 16) score += 1;

      // Character variety
      if (/[a-z]/.test(password)) score += 1;
      if (/[A-Z]/.test(password)) score += 1;
      if (/\d/.test(password)) score += 1;
      if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 2;

      // Complexity
      if (
        password.length >= 8 &&
        /[a-z]/.test(password) &&
        /[A-Z]/.test(password) &&
        /\d/.test(password)
      ) {
        score += 1;
      }

      // Determine strength level
      let level, label;
      if (score < 3) {
        level = "weak";
        label = "Weak";
        state.strength = 1;
      } else if (score < 5) {
        level = "fair";
        label = "Fair";
        state.strength = 2;
      } else if (score < 7) {
        level = "good";
        label = "Good";
        state.strength = 3;
      } else {
        level = "strong";
        label = "Strong";
        state.strength = 4;
      }

      state.label = label;

      if (meterFill) {
        meterFill.className = `bael-password-meter-fill ${level}`;
      }

      if (labelEl) {
        const textEl = labelEl.querySelector(".bael-password-label-text");
        textEl.textContent = label;
        textEl.className = `bael-password-label-text ${level}`;

        const scoreEl = labelEl.querySelector(".bael-password-score");
        scoreEl.textContent = `Score: ${score}/10`;
      }

      if (state.config.onStrengthChange) {
        state.config.onStrengthChange(state.strength, label);
      }
    }

    /**
     * Update requirements checklist
     */
    _updateRequirements(state, password) {
      const { config, element } = state;

      if (!config.showRequirements) return;

      config.requirements.forEach((req) => {
        const reqEl = element.querySelector(`#${state.id}-req-${req.id}`);
        if (!reqEl) return;

        const met = req.test(password);
        reqEl.classList.toggle("met", met);

        const icon = reqEl.querySelector(".bael-password-req-icon");
        icon.innerHTML = met ? this._getCheckIcon() : this._getCircleIcon();
      });
    }

    /**
     * Toggle password visibility
     */
    _toggleVisibility(state) {
      state.visible = !state.visible;
      state.input.type = state.visible ? "text" : "password";
      state.toggle.innerHTML = this._getEyeIcon(state.visible);
    }

    /**
     * Set value programmatically
     */
    _setValue(state, value) {
      state.input.value = value;
      this._handleInput(state);
    }

    /**
     * Check if password is valid
     */
    _isValid(state) {
      const password = state.input.value;
      return state.config.requirements.every((req) => req.test(password));
    }

    /**
     * Generate strong password
     */
    _generatePassword(state) {
      const length = 16;
      const lowercase = "abcdefghijklmnopqrstuvwxyz";
      const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const numbers = "0123456789";
      const special = "!@#$%^&*()_+-=[]{}|;:,.<>?";
      const all = lowercase + uppercase + numbers + special;

      let password = "";

      // Ensure at least one of each type
      password += lowercase[Math.floor(Math.random() * lowercase.length)];
      password += uppercase[Math.floor(Math.random() * uppercase.length)];
      password += numbers[Math.floor(Math.random() * numbers.length)];
      password += special[Math.floor(Math.random() * special.length)];

      // Fill the rest
      for (let i = password.length; i < length; i++) {
        password += all[Math.floor(Math.random() * all.length)];
      }

      // Shuffle
      password = password
        .split("")
        .sort(() => Math.random() - 0.5)
        .join("");

      this._setValue(state, password);

      // Show password
      if (!state.visible && state.config.showToggle) {
        this._toggleVisibility(state);
      }

      return password;
    }

    // ============================================================
    // ICONS
    // ============================================================

    _getEyeIcon(visible) {
      if (visible) {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>`;
      }
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
            </svg>`;
    }

    _getCheckIcon() {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>`;
    }

    _getCircleIcon() {
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
            </svg>`;
    }

    /**
     * Destroy password input
     */
    destroy(inputId) {
      const state = this.instances.get(inputId);
      if (!state) return;

      state.element.remove();
      this.instances.delete(inputId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelPasswordStrength();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$passwordStrength = (container, options) =>
    bael.create(container, options);
  window.$password = window.$passwordStrength;

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelPasswordStrength = bael;

  console.log("🔐 BAEL Password Strength Component loaded");
})();
