/**
 * BAEL Time Picker Component - Lord Of All Hours
 *
 * Time selection with:
 * - Hour/minute/second
 * - 12/24 hour format
 * - AM/PM toggle
 * - Scroll wheels
 * - Keyboard input
 * - Time range
 * - Presets
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // TIME PICKER CLASS
  // ============================================================

  class BaelTimePicker {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-timepicker-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-timepicker-styles";
      styles.textContent = `
                .bael-timepicker {
                    font-family: system-ui, -apple-system, sans-serif;
                    display: inline-block;
                    position: relative;
                }

                /* Input trigger */
                .bael-timepicker-input {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    background: white;
                    cursor: pointer;
                    min-width: 140px;
                    transition: all 0.2s;
                }

                .bael-timepicker-input:hover {
                    border-color: #4f46e5;
                }

                .bael-timepicker-input:focus-within {
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                }

                .bael-timepicker-input input {
                    border: none;
                    outline: none;
                    flex: 1;
                    font-size: 14px;
                    color: #374151;
                    background: transparent;
                    font-family: monospace;
                }

                .bael-timepicker-input input::placeholder {
                    color: #9ca3af;
                }

                .bael-timepicker-icon {
                    width: 18px;
                    height: 18px;
                    color: #9ca3af;
                }

                /* Dropdown */
                .bael-timepicker-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    margin-top: 8px;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                    padding: 16px;
                    z-index: 1000;
                    display: none;
                }

                .bael-timepicker-dropdown.open {
                    display: block;
                    animation: baelTimePickerFadeIn 0.2s ease-out;
                }

                @keyframes baelTimePickerFadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Wheels container */
                .bael-timepicker-wheels {
                    display: flex;
                    gap: 8px;
                    align-items: center;
                }

                /* Wheel */
                .bael-timepicker-wheel {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    width: 48px;
                }

                .bael-timepicker-wheel-btn {
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: none;
                    cursor: pointer;
                    color: #9ca3af;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    transition: all 0.15s;
                }

                .bael-timepicker-wheel-btn:hover {
                    background: #f3f4f6;
                    color: #4f46e5;
                }

                .bael-timepicker-wheel-value {
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    font-weight: 600;
                    font-family: monospace;
                    color: #374151;
                    background: #f9fafb;
                    border-radius: 8px;
                }

                .bael-timepicker-wheel-label {
                    font-size: 11px;
                    color: #9ca3af;
                    text-transform: uppercase;
                    margin-top: 4px;
                }

                /* Separator */
                .bael-timepicker-separator {
                    font-size: 24px;
                    font-weight: 600;
                    color: #9ca3af;
                    padding: 0 4px;
                }

                /* AM/PM toggle */
                .bael-timepicker-ampm {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    margin-left: 12px;
                }

                .bael-timepicker-ampm-btn {
                    padding: 8px 12px;
                    border: 1px solid #e5e7eb;
                    background: white;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .bael-timepicker-ampm-btn:hover {
                    border-color: #4f46e5;
                }

                .bael-timepicker-ampm-btn.active {
                    background: #4f46e5;
                    border-color: #4f46e5;
                    color: white;
                }

                /* Presets */
                .bael-timepicker-presets {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid #e5e7eb;
                }

                .bael-timepicker-preset {
                    padding: 6px 12px;
                    border: 1px solid #e5e7eb;
                    background: white;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .bael-timepicker-preset:hover {
                    border-color: #4f46e5;
                    background: #eef2ff;
                }

                /* Actions */
                .bael-timepicker-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid #e5e7eb;
                }

                .bael-timepicker-btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .bael-timepicker-btn.primary {
                    background: #4f46e5;
                    color: white;
                }

                .bael-timepicker-btn.primary:hover {
                    background: #4338ca;
                }

                .bael-timepicker-btn.secondary {
                    background: #f3f4f6;
                    color: #374151;
                }

                .bael-timepicker-btn.secondary:hover {
                    background: #e5e7eb;
                }
            `;
      document.head.appendChild(styles);
    }

    /**
     * Pad number with leading zero
     */
    _pad(num) {
      return num.toString().padStart(2, "0");
    }

    /**
     * Parse time string
     */
    _parseTime(timeStr, is24Hour = true) {
      const match = timeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
      if (!match) return { hours: 0, minutes: 0, seconds: 0, isPM: false };

      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const seconds = match[3] ? parseInt(match[3], 10) : 0;
      const period = match[4];

      let isPM = false;
      if (period) {
        isPM = period.toUpperCase() === "PM";
        if (!is24Hour) {
          if (isPM && hours < 12) hours += 12;
          if (!isPM && hours === 12) hours = 0;
        }
      }

      return { hours, minutes, seconds, isPM: hours >= 12 };
    }

    /**
     * Format time
     */
    _formatTime(hours, minutes, seconds, is24Hour, showSeconds) {
      let h = hours;
      let period = "";

      if (!is24Hour) {
        period = hours >= 12 ? " PM" : " AM";
        h = hours % 12 || 12;
      }

      let time = `${this._pad(h)}:${this._pad(minutes)}`;
      if (showSeconds) {
        time += `:${this._pad(seconds)}`;
      }

      return time + period;
    }

    // ============================================================
    // CREATE TIME PICKER
    // ============================================================

    /**
     * Create a time picker
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Time picker container not found");
        return null;
      }

      const id = `bael-timepicker-${++this.idCounter}`;
      const config = {
        value: null, // initial time (Date or string "HH:MM:SS")
        format24: true, // 24-hour format
        showSeconds: false,
        step: 1, // minute step
        min: null, // min time
        max: null, // max time
        placeholder: "Select time",
        presets: null, // ['09:00', '12:00', '17:00']
        showActions: true,
        onChange: null,
        ...options,
      };

      const el = document.createElement("div");
      el.className = "bael-timepicker";
      el.id = id;

      // Parse initial value
      let initialTime = { hours: 0, minutes: 0, seconds: 0, isPM: false };
      if (config.value) {
        if (config.value instanceof Date) {
          initialTime = {
            hours: config.value.getHours(),
            minutes: config.value.getMinutes(),
            seconds: config.value.getSeconds(),
            isPM: config.value.getHours() >= 12,
          };
        } else {
          initialTime = this._parseTime(config.value, config.format24);
        }
      }

      const state = {
        id,
        element: el,
        container,
        config,
        hours: initialTime.hours,
        minutes: initialTime.minutes,
        seconds: initialTime.seconds,
        isPM: initialTime.isPM,
        open: false,
      };

      this._render(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        getValue: () => this.getValue(id),
        setValue: (value) => this.setValue(id, value),
        open: () => this._openDropdown(state),
        close: () => this._closeDropdown(state),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render time picker
     */
    _render(state) {
      const { element, config } = state;

      element.innerHTML = "";

      // Input trigger
      const inputWrap = document.createElement("div");
      inputWrap.className = "bael-timepicker-input";

      const icon = document.createElement("span");
      icon.className = "bael-timepicker-icon";
      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
      inputWrap.appendChild(icon);

      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = config.placeholder;
      input.readOnly = true;
      inputWrap.appendChild(input);

      element.appendChild(inputWrap);
      state.input = input;

      // Update input value
      this._updateInputValue(state);

      // Dropdown
      const dropdown = document.createElement("div");
      dropdown.className = "bael-timepicker-dropdown";

      // Wheels
      const wheels = document.createElement("div");
      wheels.className = "bael-timepicker-wheels";

      // Hours wheel
      wheels.appendChild(
        this._createWheel(
          state,
          "hours",
          config.format24 ? 23 : 12,
          config.format24 ? 0 : 1,
        ),
      );

      // Separator
      const sep1 = document.createElement("span");
      sep1.className = "bael-timepicker-separator";
      sep1.textContent = ":";
      wheels.appendChild(sep1);

      // Minutes wheel
      wheels.appendChild(this._createWheel(state, "minutes", 59, 0));

      // Seconds wheel (optional)
      if (config.showSeconds) {
        const sep2 = document.createElement("span");
        sep2.className = "bael-timepicker-separator";
        sep2.textContent = ":";
        wheels.appendChild(sep2);
        wheels.appendChild(this._createWheel(state, "seconds", 59, 0));
      }

      // AM/PM toggle (for 12-hour format)
      if (!config.format24) {
        const ampm = document.createElement("div");
        ampm.className = "bael-timepicker-ampm";

        const amBtn = document.createElement("button");
        amBtn.className = `bael-timepicker-ampm-btn ${!state.isPM ? "active" : ""}`;
        amBtn.type = "button";
        amBtn.textContent = "AM";
        amBtn.addEventListener("click", () => {
          state.isPM = false;
          amBtn.classList.add("active");
          pmBtn.classList.remove("active");
          this._updateInputValue(state);
        });

        const pmBtn = document.createElement("button");
        pmBtn.className = `bael-timepicker-ampm-btn ${state.isPM ? "active" : ""}`;
        pmBtn.type = "button";
        pmBtn.textContent = "PM";
        pmBtn.addEventListener("click", () => {
          state.isPM = true;
          pmBtn.classList.add("active");
          amBtn.classList.remove("active");
          this._updateInputValue(state);
        });

        ampm.appendChild(amBtn);
        ampm.appendChild(pmBtn);
        wheels.appendChild(ampm);

        state.amBtn = amBtn;
        state.pmBtn = pmBtn;
      }

      dropdown.appendChild(wheels);

      // Presets
      if (config.presets && config.presets.length > 0) {
        const presets = document.createElement("div");
        presets.className = "bael-timepicker-presets";

        config.presets.forEach((preset) => {
          const btn = document.createElement("button");
          btn.className = "bael-timepicker-preset";
          btn.type = "button";
          btn.textContent = preset;
          btn.addEventListener("click", () => {
            this.setValue(state.id, preset);
            this._closeDropdown(state);
          });
          presets.appendChild(btn);
        });

        dropdown.appendChild(presets);
      }

      // Actions
      if (config.showActions) {
        const actions = document.createElement("div");
        actions.className = "bael-timepicker-actions";

        const nowBtn = document.createElement("button");
        nowBtn.className = "bael-timepicker-btn secondary";
        nowBtn.type = "button";
        nowBtn.textContent = "Now";
        nowBtn.addEventListener("click", () => {
          const now = new Date();
          state.hours = now.getHours();
          state.minutes = now.getMinutes();
          state.seconds = now.getSeconds();
          state.isPM = now.getHours() >= 12;
          this._updateWheels(state);
          this._updateInputValue(state);
        });

        const clearBtn = document.createElement("button");
        clearBtn.className = "bael-timepicker-btn secondary";
        clearBtn.type = "button";
        clearBtn.textContent = "Clear";
        clearBtn.addEventListener("click", () => {
          state.hours = 0;
          state.minutes = 0;
          state.seconds = 0;
          state.isPM = false;
          this._updateWheels(state);
          state.input.value = "";
          this._closeDropdown(state);
        });

        const okBtn = document.createElement("button");
        okBtn.className = "bael-timepicker-btn primary";
        okBtn.type = "button";
        okBtn.textContent = "OK";
        okBtn.addEventListener("click", () => {
          this._closeDropdown(state);
          if (config.onChange) {
            config.onChange(this.getValue(state.id));
          }
        });

        actions.appendChild(nowBtn);
        actions.appendChild(clearBtn);
        actions.appendChild(okBtn);
        dropdown.appendChild(actions);
      }

      element.appendChild(dropdown);
      state.dropdown = dropdown;

      // Events
      inputWrap.addEventListener("click", () => {
        this._toggleDropdown(state);
      });

      document.addEventListener("click", (e) => {
        if (!element.contains(e.target)) {
          this._closeDropdown(state);
        }
      });
    }

    /**
     * Create wheel control
     */
    _createWheel(state, type, max, min = 0) {
      const wheel = document.createElement("div");
      wheel.className = "bael-timepicker-wheel";

      // Up button
      const upBtn = document.createElement("button");
      upBtn.className = "bael-timepicker-wheel-btn";
      upBtn.type = "button";
      upBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg>`;
      upBtn.addEventListener("click", () => {
        this._incrementValue(state, type, 1, min, max);
      });

      // Value display
      const value = document.createElement("div");
      value.className = "bael-timepicker-wheel-value";
      value.textContent = this._pad(state[type]);
      state[`${type}Display`] = value;

      // Down button
      const downBtn = document.createElement("button");
      downBtn.className = "bael-timepicker-wheel-btn";
      downBtn.type = "button";
      downBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>`;
      downBtn.addEventListener("click", () => {
        this._incrementValue(state, type, -1, min, max);
      });

      // Label
      const label = document.createElement("div");
      label.className = "bael-timepicker-wheel-label";
      label.textContent = type.charAt(0).toUpperCase();

      wheel.appendChild(upBtn);
      wheel.appendChild(value);
      wheel.appendChild(downBtn);
      wheel.appendChild(label);

      return wheel;
    }

    /**
     * Increment value
     */
    _incrementValue(state, type, delta, min, max) {
      let value = state[type] + delta;

      if (value > max) value = min;
      if (value < min) value = max;

      state[type] = value;
      state[`${type}Display`].textContent = this._pad(value);
      this._updateInputValue(state);
    }

    /**
     * Update wheel displays
     */
    _updateWheels(state) {
      if (state.hoursDisplay) {
        let h = state.hours;
        if (!state.config.format24) {
          h = state.hours % 12 || 12;
        }
        state.hoursDisplay.textContent = this._pad(h);
      }
      if (state.minutesDisplay) {
        state.minutesDisplay.textContent = this._pad(state.minutes);
      }
      if (state.secondsDisplay) {
        state.secondsDisplay.textContent = this._pad(state.seconds);
      }
      if (state.amBtn && state.pmBtn) {
        state.amBtn.classList.toggle("active", !state.isPM);
        state.pmBtn.classList.toggle("active", state.isPM);
      }
    }

    /**
     * Update input value
     */
    _updateInputValue(state) {
      const { config, input } = state;
      let hours = state.hours;

      // Convert to 12-hour if needed
      if (!config.format24) {
        hours = state.isPM
          ? state.hours < 12
            ? state.hours + 12
            : state.hours
          : state.hours === 12
            ? 0
            : state.hours;
      }

      input.value = this._formatTime(
        config.format24 ? state.hours : hours,
        state.minutes,
        state.seconds,
        config.format24,
        config.showSeconds,
      );
    }

    /**
     * Toggle dropdown
     */
    _toggleDropdown(state) {
      if (state.open) {
        this._closeDropdown(state);
      } else {
        this._openDropdown(state);
      }
    }

    /**
     * Open dropdown
     */
    _openDropdown(state) {
      state.open = true;
      state.dropdown.classList.add("open");
    }

    /**
     * Close dropdown
     */
    _closeDropdown(state) {
      state.open = false;
      state.dropdown.classList.remove("open");
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    /**
     * Get current time value
     */
    getValue(pickerId) {
      const state = this.instances.get(pickerId);
      if (!state) return null;

      return {
        hours: state.hours,
        minutes: state.minutes,
        seconds: state.seconds,
        formatted: state.input.value,
      };
    }

    /**
     * Set time value
     */
    setValue(pickerId, value) {
      const state = this.instances.get(pickerId);
      if (!state) return;

      let time;
      if (value instanceof Date) {
        time = {
          hours: value.getHours(),
          minutes: value.getMinutes(),
          seconds: value.getSeconds(),
          isPM: value.getHours() >= 12,
        };
      } else {
        time = this._parseTime(value, state.config.format24);
      }

      state.hours = time.hours;
      state.minutes = time.minutes;
      state.seconds = time.seconds;
      state.isPM = time.isPM;

      this._updateWheels(state);
      this._updateInputValue(state);
    }

    /**
     * Destroy time picker
     */
    destroy(pickerId) {
      const state = this.instances.get(pickerId);
      if (!state) return;

      state.element.remove();
      this.instances.delete(pickerId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelTimePicker();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$timePicker = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelTimePicker = bael;

  console.log("🕐 BAEL Time Picker Component loaded");
})();
