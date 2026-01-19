/**
 * BAEL Countdown Component - Lord Of All Time
 *
 * Countdown timer:
 * - Target date countdown
 * - Duration countdown
 * - Flip card animation
 * - Circular progress
 * - Custom formats
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // COUNTDOWN CLASS
  // ============================================================

  class BaelCountdown {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-countdown-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-countdown-styles";
      styles.textContent = `
                .bael-countdown {
                    display: inline-flex;
                    gap: 16px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .bael-countdown-unit {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }

                .bael-countdown-value {
                    min-width: 64px;
                    padding: 16px 20px;
                    background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 12px;
                    font-size: 32px;
                    font-weight: 700;
                    color: white;
                    text-align: center;
                    font-variant-numeric: tabular-nums;
                }

                .bael-countdown-label {
                    font-size: 12px;
                    color: #888;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .bael-countdown-separator {
                    display: flex;
                    align-items: center;
                    font-size: 32px;
                    font-weight: 700;
                    color: rgba(255,255,255,0.3);
                    padding-bottom: 28px;
                }

                /* Flip variant */
                .bael-countdown.flip .bael-countdown-value {
                    position: relative;
                    perspective: 300px;
                    padding: 0;
                    background: none;
                    border: none;
                    overflow: hidden;
                }

                .bael-countdown-flip-card {
                    position: relative;
                    width: 64px;
                    height: 80px;
                }

                .bael-countdown-flip-face {
                    position: absolute;
                    width: 100%;
                    height: 50%;
                    overflow: hidden;
                    background: linear-gradient(180deg, #333, #222);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .bael-countdown-flip-face.top {
                    top: 0;
                    border-radius: 8px 8px 0 0;
                    align-items: flex-end;
                    border-bottom: 1px solid rgba(0,0,0,0.3);
                }

                .bael-countdown-flip-face.bottom {
                    bottom: 0;
                    border-radius: 0 0 8px 8px;
                    align-items: flex-start;
                }

                .bael-countdown-flip-face span {
                    position: absolute;
                    font-size: 48px;
                    font-weight: 700;
                    color: white;
                }

                .bael-countdown-flip-face.top span {
                    top: 50%;
                }

                .bael-countdown-flip-face.bottom span {
                    bottom: 50%;
                }

                .bael-countdown-flip-card.flip .bael-countdown-flip-top {
                    animation: bael-flip-top 0.6s ease-in forwards;
                }

                .bael-countdown-flip-card.flip .bael-countdown-flip-bottom {
                    animation: bael-flip-bottom 0.6s ease-out 0.3s forwards;
                }

                @keyframes bael-flip-top {
                    0% { transform: rotateX(0deg); }
                    100% { transform: rotateX(-90deg); }
                }

                @keyframes bael-flip-bottom {
                    0% { transform: rotateX(90deg); }
                    100% { transform: rotateX(0deg); }
                }

                /* Circular variant */
                .bael-countdown.circular .bael-countdown-value {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    padding: 0;
                    background: none;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .bael-countdown-circle {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                }

                .bael-countdown-circle-bg {
                    fill: none;
                    stroke: rgba(255,255,255,0.1);
                    stroke-width: 4;
                }

                .bael-countdown-circle-progress {
                    fill: none;
                    stroke: #3b82f6;
                    stroke-width: 4;
                    stroke-linecap: round;
                    transform: rotate(-90deg);
                    transform-origin: center;
                    transition: stroke-dashoffset 0.5s ease;
                }

                .bael-countdown-circle-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: white;
                    z-index: 1;
                }

                /* Minimal variant */
                .bael-countdown.minimal {
                    gap: 8px;
                }

                .bael-countdown.minimal .bael-countdown-unit {
                    flex-direction: row;
                    gap: 4px;
                }

                .bael-countdown.minimal .bael-countdown-value {
                    min-width: auto;
                    padding: 8px 12px;
                    font-size: 20px;
                    background: none;
                    border: none;
                }

                .bael-countdown.minimal .bael-countdown-label {
                    font-size: 10px;
                    padding-top: 2px;
                }

                .bael-countdown.minimal .bael-countdown-separator {
                    font-size: 20px;
                    padding-bottom: 0;
                }

                /* Compact variant */
                .bael-countdown.compact .bael-countdown-value {
                    min-width: 48px;
                    padding: 10px 14px;
                    font-size: 24px;
                    border-radius: 8px;
                }

                .bael-countdown.compact .bael-countdown-separator {
                    font-size: 24px;
                    padding-bottom: 24px;
                }

                /* Urgency colors */
                .bael-countdown.urgent .bael-countdown-value {
                    color: #ef4444;
                    border-color: rgba(239, 68, 68, 0.3);
                    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05));
                }

                .bael-countdown.urgent.circular .bael-countdown-circle-progress {
                    stroke: #ef4444;
                }

                /* Expired state */
                .bael-countdown.expired .bael-countdown-value {
                    opacity: 0.5;
                }

                .bael-countdown-expired-text {
                    font-size: 18px;
                    font-weight: 600;
                    color: #888;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE COUNTDOWN
    // ============================================================

    /**
     * Create countdown timer
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Countdown container not found");
        return null;
      }

      const id = `bael-countdown-${++this.idCounter}`;
      const config = {
        target: null, // Date object or timestamp
        duration: null, // Duration in seconds (alternative to target)
        units: ["days", "hours", "minutes", "seconds"],
        variant: "default", // default, flip, circular, minimal, compact
        showLabels: true,
        showSeparators: true,
        urgentThreshold: 60, // seconds
        expiredText: "Expired",
        onTick: null,
        onComplete: null,
        labels: {
          days: "Days",
          hours: "Hours",
          minutes: "Minutes",
          seconds: "Seconds",
        },
        ...options,
      };

      const el = document.createElement("div");
      el.className = `bael-countdown${config.variant !== "default" ? ` ${config.variant}` : ""}`;
      el.id = id;

      // Calculate end time
      let endTime;
      if (config.target) {
        endTime =
          config.target instanceof Date
            ? config.target.getTime()
            : config.target;
      } else if (config.duration) {
        endTime = Date.now() + config.duration * 1000;
      } else {
        endTime = Date.now() + 3600000; // Default: 1 hour
      }

      const state = {
        id,
        element: el,
        container,
        config,
        endTime,
        interval: null,
        lastValues: {},
      };

      this._render(state);
      container.appendChild(el);

      // Start ticking
      this._tick(state);
      state.interval = setInterval(() => this._tick(state), 1000);

      this.instances.set(id, state);

      return {
        id,
        getRemaining: () => this._getRemaining(state),
        setTarget: (target) => this._setTarget(state, target),
        pause: () => this._pause(state),
        resume: () => this._resume(state),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render countdown
     */
    _render(state) {
      const { element, config } = state;

      element.innerHTML = "";
      state.unitElements = {};

      config.units.forEach((unit, index) => {
        if (
          index > 0 &&
          config.showSeparators &&
          config.variant !== "minimal"
        ) {
          const sep = document.createElement("div");
          sep.className = "bael-countdown-separator";
          sep.textContent = ":";
          element.appendChild(sep);
        }

        const unitEl = document.createElement("div");
        unitEl.className = "bael-countdown-unit";

        const valueEl = document.createElement("div");
        valueEl.className = "bael-countdown-value";

        if (config.variant === "circular") {
          valueEl.innerHTML = `
                        <svg class="bael-countdown-circle" viewBox="0 0 80 80">
                            <circle class="bael-countdown-circle-bg" cx="40" cy="40" r="36"/>
                            <circle class="bael-countdown-circle-progress" cx="40" cy="40" r="36"
                                stroke-dasharray="226.2" stroke-dashoffset="0"/>
                        </svg>
                        <span class="bael-countdown-circle-value">00</span>
                    `;
        } else if (config.variant === "flip") {
          valueEl.innerHTML = `
                        <div class="bael-countdown-flip-card">
                            <div class="bael-countdown-flip-face top"><span>00</span></div>
                            <div class="bael-countdown-flip-face bottom"><span>00</span></div>
                        </div>
                    `;
        } else {
          valueEl.textContent = "00";
        }

        unitEl.appendChild(valueEl);

        if (config.showLabels) {
          const labelEl = document.createElement("div");
          labelEl.className = "bael-countdown-label";
          labelEl.textContent = config.labels[unit] || unit;
          unitEl.appendChild(labelEl);
        }

        element.appendChild(unitEl);
        state.unitElements[unit] = valueEl;
      });
    }

    /**
     * Tick countdown
     */
    _tick(state) {
      const { element, config, endTime, unitElements } = state;
      const remaining = this._getRemaining(state);

      // Check if expired
      if (remaining.total <= 0) {
        element.classList.add("expired");
        if (config.expiredText) {
          element.innerHTML = `<div class="bael-countdown-expired-text">${config.expiredText}</div>`;
        }
        clearInterval(state.interval);
        if (config.onComplete) config.onComplete();
        return;
      }

      // Check urgency
      if (remaining.total <= config.urgentThreshold * 1000) {
        element.classList.add("urgent");
      } else {
        element.classList.remove("urgent");
      }

      // Update units
      config.units.forEach((unit) => {
        const value = remaining[unit];
        const valueStr = String(value).padStart(2, "0");
        const valueEl = unitElements[unit];

        if (!valueEl) return;

        const lastValue = state.lastValues[unit];

        if (config.variant === "circular") {
          const numEl = valueEl.querySelector(".bael-countdown-circle-value");
          const progressEl = valueEl.querySelector(
            ".bael-countdown-circle-progress",
          );

          if (numEl) numEl.textContent = valueStr;

          if (progressEl) {
            const max = this._getMaxForUnit(unit);
            const progress = (value / max) * 226.2; // Circumference
            progressEl.style.strokeDashoffset = 226.2 - progress;
          }
        } else if (config.variant === "flip") {
          if (lastValue !== valueStr) {
            const card = valueEl.querySelector(".bael-countdown-flip-card");
            const topSpan = valueEl.querySelector(".top span");
            const bottomSpan = valueEl.querySelector(".bottom span");

            if (topSpan) topSpan.textContent = valueStr;
            if (bottomSpan) bottomSpan.textContent = valueStr;

            if (card && lastValue !== undefined) {
              card.classList.remove("flip");
              void card.offsetWidth; // Force reflow
              card.classList.add("flip");
            }
          }
        } else {
          valueEl.textContent = valueStr;
        }

        state.lastValues[unit] = valueStr;
      });

      if (config.onTick) config.onTick(remaining);
    }

    /**
     * Get remaining time
     */
    _getRemaining(state) {
      const total = Math.max(0, state.endTime - Date.now());

      const days = Math.floor(total / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((total % (1000 * 60)) / 1000);

      return { total, days, hours, minutes, seconds };
    }

    /**
     * Get max value for unit (for circular progress)
     */
    _getMaxForUnit(unit) {
      switch (unit) {
        case "days":
          return 30;
        case "hours":
          return 24;
        case "minutes":
          return 60;
        case "seconds":
          return 60;
        default:
          return 60;
      }
    }

    /**
     * Set new target
     */
    _setTarget(state, target) {
      state.endTime = target instanceof Date ? target.getTime() : target;
      state.element.classList.remove("expired", "urgent");
      this._render(state);

      if (!state.interval) {
        state.interval = setInterval(() => this._tick(state), 1000);
      }

      this._tick(state);
    }

    /**
     * Pause countdown
     */
    _pause(state) {
      if (state.interval) {
        state.pausedAt = Date.now();
        state.remainingAtPause = state.endTime - Date.now();
        clearInterval(state.interval);
        state.interval = null;
      }
    }

    /**
     * Resume countdown
     */
    _resume(state) {
      if (!state.interval && state.remainingAtPause) {
        state.endTime = Date.now() + state.remainingAtPause;
        state.interval = setInterval(() => this._tick(state), 1000);
        this._tick(state);
      }
    }

    /**
     * Destroy countdown
     */
    destroy(id) {
      const state = this.instances.get(id);
      if (!state) return;

      if (state.interval) {
        clearInterval(state.interval);
      }
      state.element.remove();
      this.instances.delete(id);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelCountdown();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$countdown = (container, options) => bael.create(container, options);
  window.$timer = window.$countdown;

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelCountdown = bael;

  console.log("⏱️ BAEL Countdown Timer Component loaded");
})();
