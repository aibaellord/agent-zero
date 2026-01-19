/**
 * BAEL OTP Input Component - Lord Of All Verification
 *
 * One-time password/code input:
 * - Auto-focus next input
 * - Paste support
 * - Configurable length
 * - Auto-submit
 * - Masked/visible modes
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // OTP INPUT CLASS
  // ============================================================

  class BaelOTP {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-otp-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-otp-styles";
      styles.textContent = `
                .bael-otp {
                    font-family: system-ui, -apple-system, sans-serif;
                }

                .bael-otp-inputs {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }

                .bael-otp-input {
                    width: 48px;
                    height: 56px;
                    text-align: center;
                    font-size: 24px;
                    font-weight: 600;
                    border: 2px solid #e5e7eb;
                    border-radius: 10px;
                    outline: none;
                    transition: all 0.15s;
                    color: #111827;
                    background: white;
                }

                .bael-otp-input:focus {
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
                }

                .bael-otp-input.filled {
                    border-color: #22c55e;
                    background: #f0fdf4;
                }

                .bael-otp-input.error {
                    border-color: #ef4444;
                    background: #fef2f2;
                    animation: bael-otp-shake 0.5s ease-in-out;
                }

                @keyframes bael-otp-shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
                    20%, 40%, 60%, 80% { transform: translateX(4px); }
                }

                .bael-otp-input::placeholder {
                    color: #d1d5db;
                }

                .bael-otp-input:disabled {
                    background: #f3f4f6;
                    color: #9ca3af;
                    cursor: not-allowed;
                }

                /* Separator */
                .bael-otp-separator {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 16px;
                    font-size: 24px;
                    color: #d1d5db;
                }

                /* Message */
                .bael-otp-message {
                    text-align: center;
                    margin-top: 12px;
                    font-size: 14px;
                }

                .bael-otp-message.error {
                    color: #ef4444;
                }

                .bael-otp-message.success {
                    color: #22c55e;
                }

                /* Resend */
                .bael-otp-resend {
                    text-align: center;
                    margin-top: 16px;
                }

                .bael-otp-resend-btn {
                    border: none;
                    background: none;
                    color: #4f46e5;
                    font-size: 14px;
                    cursor: pointer;
                    padding: 0;
                    text-decoration: underline;
                }

                .bael-otp-resend-btn:disabled {
                    color: #9ca3af;
                    cursor: not-allowed;
                    text-decoration: none;
                }

                .bael-otp-countdown {
                    color: #6b7280;
                    font-size: 14px;
                }

                /* Variants */
                .bael-otp.compact .bael-otp-input {
                    width: 40px;
                    height: 48px;
                    font-size: 20px;
                }

                .bael-otp.compact .bael-otp-inputs {
                    gap: 8px;
                }

                .bael-otp.large .bael-otp-input {
                    width: 56px;
                    height: 64px;
                    font-size: 28px;
                }

                .bael-otp.underline .bael-otp-input {
                    border: none;
                    border-bottom: 3px solid #e5e7eb;
                    border-radius: 0;
                    background: transparent;
                }

                .bael-otp.underline .bael-otp-input:focus {
                    border-bottom-color: #4f46e5;
                    box-shadow: none;
                }

                .bael-otp.underline .bael-otp-input.filled {
                    border-bottom-color: #22c55e;
                    background: transparent;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE OTP INPUT
    // ============================================================

    /**
     * Create OTP input
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("OTP container not found");
        return null;
      }

      const id = `bael-otp-${++this.idCounter}`;
      const config = {
        length: 6,
        separator: null, // Position to add separator (e.g., 3 for XXX-XXX)
        separatorChar: "-",
        type: "text", // text, number
        mask: false, // Show dots instead of characters
        placeholder: "",
        autoSubmit: true, // Auto-submit when complete
        disabled: false,
        variant: "default", // default, compact, large, underline
        showResend: false,
        resendDelay: 60, // Seconds before can resend
        onComplete: null,
        onChange: null,
        onResend: null,
        ...options,
      };

      const el = document.createElement("div");
      el.className = `bael-otp${config.variant !== "default" ? " " + config.variant : ""}`;
      el.id = id;

      const state = {
        id,
        element: el,
        container,
        config,
        inputs: [],
        value: "",
        countdownTimer: null,
        countdownValue: 0,
      };

      this._render(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        getValue: () => this._getValue(state),
        setValue: (value) => this._setValue(state, value),
        clear: () => this._clear(state),
        focus: () => state.inputs[0]?.focus(),
        setError: (msg) => this._setError(state, msg),
        setSuccess: (msg) => this._setSuccess(state, msg),
        setDisabled: (disabled) => this._setDisabled(state, disabled),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render OTP input
     */
    _render(state) {
      const { element, config } = state;

      element.innerHTML = "";

      // Inputs container
      const inputsContainer = document.createElement("div");
      inputsContainer.className = "bael-otp-inputs";

      state.inputs = [];

      for (let i = 0; i < config.length; i++) {
        // Add separator
        if (config.separator && i === config.separator) {
          const sep = document.createElement("span");
          sep.className = "bael-otp-separator";
          sep.textContent = config.separatorChar;
          inputsContainer.appendChild(sep);
        }

        const input = document.createElement("input");
        input.type = config.mask
          ? "password"
          : config.type === "number"
            ? "tel"
            : "text";
        input.inputMode = config.type === "number" ? "numeric" : "text";
        input.pattern = config.type === "number" ? "[0-9]*" : undefined;
        input.className = "bael-otp-input";
        input.maxLength = 1;
        input.placeholder = config.placeholder;
        input.disabled = config.disabled;
        input.autocomplete = "one-time-code";
        input.dataset.index = i;

        input.addEventListener("input", (e) => this._handleInput(state, e, i));
        input.addEventListener("keydown", (e) =>
          this._handleKeyDown(state, e, i),
        );
        input.addEventListener("paste", (e) => this._handlePaste(state, e));
        input.addEventListener("focus", () => input.select());

        state.inputs.push(input);
        inputsContainer.appendChild(input);
      }

      element.appendChild(inputsContainer);

      // Message area
      const message = document.createElement("div");
      message.className = "bael-otp-message";
      message.style.display = "none";
      state.messageEl = message;
      element.appendChild(message);

      // Resend button
      if (config.showResend) {
        const resend = document.createElement("div");
        resend.className = "bael-otp-resend";

        const resendBtn = document.createElement("button");
        resendBtn.type = "button";
        resendBtn.className = "bael-otp-resend-btn";
        resendBtn.textContent = "Resend code";
        resendBtn.addEventListener("click", () => this._handleResend(state));
        state.resendBtn = resendBtn;

        const countdown = document.createElement("span");
        countdown.className = "bael-otp-countdown";
        countdown.style.display = "none";
        state.countdownEl = countdown;

        resend.appendChild(resendBtn);
        resend.appendChild(countdown);
        element.appendChild(resend);

        // Start initial countdown
        this._startCountdown(state);
      }
    }

    /**
     * Handle input
     */
    _handleInput(state, e, index) {
      const { inputs, config } = state;
      const input = inputs[index];
      let value = input.value;

      // Filter for number type
      if (config.type === "number") {
        value = value.replace(/\D/g, "");
      }

      // Take only first character
      input.value = value.charAt(0);

      // Update filled class
      input.classList.toggle("filled", input.value !== "");
      input.classList.remove("error");

      // Move to next input
      if (input.value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }

      // Check if complete
      this._checkComplete(state);

      if (config.onChange) {
        config.onChange(this._getValue(state));
      }
    }

    /**
     * Handle keydown
     */
    _handleKeyDown(state, e, index) {
      const { inputs } = state;
      const input = inputs[index];

      switch (e.key) {
        case "Backspace":
          if (!input.value && index > 0) {
            inputs[index - 1].focus();
            inputs[index - 1].value = "";
            inputs[index - 1].classList.remove("filled");
          }
          input.classList.remove("error");
          break;

        case "ArrowLeft":
          if (index > 0) {
            e.preventDefault();
            inputs[index - 1].focus();
          }
          break;

        case "ArrowRight":
          if (index < inputs.length - 1) {
            e.preventDefault();
            inputs[index + 1].focus();
          }
          break;

        case "Delete":
          input.value = "";
          input.classList.remove("filled", "error");
          break;
      }
    }

    /**
     * Handle paste
     */
    _handlePaste(state, e) {
      e.preventDefault();
      const { inputs, config } = state;
      let pastedData = (e.clipboardData || window.clipboardData).getData(
        "text",
      );

      // Filter for number type
      if (config.type === "number") {
        pastedData = pastedData.replace(/\D/g, "");
      }

      // Fill inputs with pasted characters
      const chars = pastedData.split("").slice(0, config.length);
      chars.forEach((char, i) => {
        if (inputs[i]) {
          inputs[i].value = char;
          inputs[i].classList.add("filled");
          inputs[i].classList.remove("error");
        }
      });

      // Focus appropriate input
      const nextEmpty = inputs.findIndex((input) => !input.value);
      if (nextEmpty !== -1) {
        inputs[nextEmpty].focus();
      } else if (chars.length > 0) {
        inputs[Math.min(chars.length - 1, inputs.length - 1)].focus();
      }

      // Check if complete
      this._checkComplete(state);
    }

    /**
     * Check if complete
     */
    _checkComplete(state) {
      const { inputs, config } = state;
      const value = this._getValue(state);

      if (value.length === config.length) {
        if (config.autoSubmit && config.onComplete) {
          config.onComplete(value);
        }
      }
    }

    /**
     * Get value
     */
    _getValue(state) {
      return state.inputs.map((input) => input.value).join("");
    }

    /**
     * Set value
     */
    _setValue(state, value) {
      const { inputs, config } = state;
      const chars = String(value).split("").slice(0, config.length);

      inputs.forEach((input, i) => {
        input.value = chars[i] || "";
        input.classList.toggle("filled", !!input.value);
        input.classList.remove("error");
      });
    }

    /**
     * Clear inputs
     */
    _clear(state) {
      state.inputs.forEach((input) => {
        input.value = "";
        input.classList.remove("filled", "error");
      });
      state.inputs[0]?.focus();
      this._clearMessage(state);
    }

    /**
     * Set error state
     */
    _setError(state, message) {
      state.inputs.forEach((input) => {
        input.classList.add("error");
      });

      if (message) {
        state.messageEl.textContent = message;
        state.messageEl.className = "bael-otp-message error";
        state.messageEl.style.display = "block";
      }
    }

    /**
     * Set success state
     */
    _setSuccess(state, message) {
      state.inputs.forEach((input) => {
        input.classList.remove("error");
        input.classList.add("filled");
      });

      if (message) {
        state.messageEl.textContent = message;
        state.messageEl.className = "bael-otp-message success";
        state.messageEl.style.display = "block";
      }
    }

    /**
     * Clear message
     */
    _clearMessage(state) {
      state.messageEl.style.display = "none";
      state.messageEl.textContent = "";
    }

    /**
     * Set disabled state
     */
    _setDisabled(state, disabled) {
      state.inputs.forEach((input) => {
        input.disabled = disabled;
      });
    }

    /**
     * Handle resend
     */
    _handleResend(state) {
      const { config } = state;

      if (config.onResend) {
        config.onResend();
      }

      this._clear(state);
      this._startCountdown(state);
    }

    /**
     * Start countdown
     */
    _startCountdown(state) {
      const { config, resendBtn, countdownEl } = state;

      if (!config.showResend) return;

      state.countdownValue = config.resendDelay;
      resendBtn.style.display = "none";
      countdownEl.style.display = "inline";
      countdownEl.textContent = `Resend in ${state.countdownValue}s`;

      clearInterval(state.countdownTimer);
      state.countdownTimer = setInterval(() => {
        state.countdownValue--;

        if (state.countdownValue <= 0) {
          clearInterval(state.countdownTimer);
          resendBtn.style.display = "inline";
          countdownEl.style.display = "none";
        } else {
          countdownEl.textContent = `Resend in ${state.countdownValue}s`;
        }
      }, 1000);
    }

    /**
     * Destroy OTP input
     */
    destroy(inputId) {
      const state = this.instances.get(inputId);
      if (!state) return;

      clearInterval(state.countdownTimer);
      state.element.remove();
      this.instances.delete(inputId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelOTP();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$otp = (container, options) => bael.create(container, options);
  window.$otpInput = window.$otp;

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelOTP = bael;

  console.log("🔢 BAEL OTP Input Component loaded");
})();
