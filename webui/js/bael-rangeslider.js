/**
 * BAEL Slider/Range Input - Lord Of All Values
 *
 * Advanced range slider component:
 * - Single or dual handles (range)
 * - Tooltips showing values
 * - Custom marks/steps
 * - Vertical orientation
 * - Disabled segments
 * - Color gradients
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // RANGE SLIDER CLASS
  // ============================================================

  class BaelRangeSlider {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-rangeslider-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-rangeslider-styles";
      styles.textContent = `
                .bael-rangeslider {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    position: relative;
                    padding: 16px 0;
                }

                /* Track */
                .bael-rangeslider-track {
                    position: relative;
                    height: 6px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 3px;
                    cursor: pointer;
                }

                /* Filled portion */
                .bael-rangeslider-fill {
                    position: absolute;
                    height: 100%;
                    background: #3b82f6;
                    border-radius: 3px;
                    pointer-events: none;
                }

                /* Handle */
                .bael-rangeslider-handle {
                    position: absolute;
                    top: 50%;
                    width: 20px;
                    height: 20px;
                    background: #fff;
                    border: 2px solid #3b82f6;
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    cursor: grab;
                    z-index: 2;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    transition: transform 0.1s, box-shadow 0.1s;
                }

                .bael-rangeslider-handle:hover {
                    transform: translate(-50%, -50%) scale(1.1);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                }

                .bael-rangeslider-handle:active,
                .bael-rangeslider-handle.dragging {
                    cursor: grabbing;
                    transform: translate(-50%, -50%) scale(1.15);
                }

                .bael-rangeslider-handle:focus {
                    outline: none;
                    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3), 0 2px 8px rgba(0,0,0,0.3);
                }

                /* Tooltip */
                .bael-rangeslider-tooltip {
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    margin-bottom: 8px;
                    padding: 4px 8px;
                    background: #1e1e1e;
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 4px;
                    font-size: 12px;
                    font-weight: 500;
                    color: #fff;
                    white-space: nowrap;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.15s, visibility 0.15s;
                }

                .bael-rangeslider-tooltip::after {
                    content: '';
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    border: 5px solid transparent;
                    border-top-color: #1e1e1e;
                }

                .bael-rangeslider-handle:hover .bael-rangeslider-tooltip,
                .bael-rangeslider-handle.dragging .bael-rangeslider-tooltip {
                    opacity: 1;
                    visibility: visible;
                }

                .bael-rangeslider.always-tooltip .bael-rangeslider-tooltip {
                    opacity: 1;
                    visibility: visible;
                }

                /* Marks */
                .bael-rangeslider-marks {
                    position: relative;
                    margin-top: 12px;
                }

                .bael-rangeslider-mark {
                    position: absolute;
                    transform: translateX(-50%);
                    font-size: 11px;
                    color: #666;
                }

                .bael-rangeslider-mark-active {
                    color: #3b82f6;
                }

                /* Tick marks on track */
                .bael-rangeslider-ticks {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                }

                .bael-rangeslider-tick {
                    position: absolute;
                    top: 50%;
                    width: 2px;
                    height: 10px;
                    background: rgba(255,255,255,0.2);
                    transform: translate(-50%, -50%);
                    border-radius: 1px;
                }

                /* Value display */
                .bael-rangeslider-values {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 8px;
                    font-size: 12px;
                    color: #888;
                }

                /* Disabled state */
                .bael-rangeslider.disabled {
                    opacity: 0.5;
                    pointer-events: none;
                }

                .bael-rangeslider.disabled .bael-rangeslider-handle {
                    cursor: not-allowed;
                }

                /* Vertical orientation */
                .bael-rangeslider.vertical {
                    width: 40px;
                    height: 200px;
                    padding: 0 16px;
                }

                .bael-rangeslider.vertical .bael-rangeslider-track {
                    width: 6px;
                    height: 100%;
                }

                .bael-rangeslider.vertical .bael-rangeslider-fill {
                    width: 100%;
                    height: auto;
                    left: 0;
                    right: 0;
                }

                .bael-rangeslider.vertical .bael-rangeslider-handle {
                    left: 50%;
                    top: auto;
                }

                .bael-rangeslider.vertical .bael-rangeslider-tooltip {
                    bottom: auto;
                    left: 100%;
                    top: 50%;
                    transform: translateY(-50%);
                    margin-bottom: 0;
                    margin-left: 12px;
                }

                .bael-rangeslider.vertical .bael-rangeslider-tooltip::after {
                    top: 50%;
                    left: -10px;
                    transform: translateY(-50%);
                    border: 5px solid transparent;
                    border-right-color: #1e1e1e;
                }

                /* Gradient fill */
                .bael-rangeslider.gradient .bael-rangeslider-fill {
                    background: linear-gradient(to right, #3b82f6, #8b5cf6);
                }

                /* Size variants */
                .bael-rangeslider.small .bael-rangeslider-track {
                    height: 4px;
                }

                .bael-rangeslider.small .bael-rangeslider-handle {
                    width: 14px;
                    height: 14px;
                }

                .bael-rangeslider.large .bael-rangeslider-track {
                    height: 8px;
                }

                .bael-rangeslider.large .bael-rangeslider-handle {
                    width: 24px;
                    height: 24px;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE RANGE SLIDER
    // ============================================================

    /**
     * Create range slider component
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("RangeSlider container not found");
        return null;
      }

      const id = `bael-rangeslider-${++this.idCounter}`;
      const config = {
        min: 0,
        max: 100,
        step: 1,
        value: 50, // For single handle
        range: null, // [min, max] for dual handles
        showTooltip: true,
        alwaysTooltip: false,
        showMarks: false,
        marks: null, // { 0: '0%', 50: '50%', 100: '100%' }
        showTicks: false,
        tickInterval: 10,
        showValues: false,
        orientation: "horizontal", // horizontal, vertical
        size: "default", // small, default, large
        gradient: false,
        disabled: false,
        formatValue: (v) => v,
        onChange: null,
        onDragStart: null,
        onDragEnd: null,
        ...options,
      };

      const el = document.createElement("div");
      el.className = `bael-rangeslider`;
      if (config.alwaysTooltip) el.classList.add("always-tooltip");
      if (config.orientation === "vertical") el.classList.add("vertical");
      if (config.size !== "default") el.classList.add(config.size);
      if (config.gradient) el.classList.add("gradient");
      if (config.disabled) el.classList.add("disabled");
      el.id = id;

      const state = {
        id,
        element: el,
        container,
        config,
        value: config.range ? [...config.range] : config.value,
        dragging: null,
      };

      this._render(state);
      this._bindEvents(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        getValue: () => state.value,
        setValue: (v) => this._setValue(state, v),
        setDisabled: (d) => {
          state.config.disabled = d;
          el.classList.toggle("disabled", d);
        },
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render slider
     */
    _render(state) {
      const { element, config } = state;
      const isRange = config.range !== null;
      const isVertical = config.orientation === "vertical";

      // Track
      const track = document.createElement("div");
      track.className = "bael-rangeslider-track";
      state.track = track;

      // Ticks
      if (config.showTicks) {
        const ticks = document.createElement("div");
        ticks.className = "bael-rangeslider-ticks";

        for (let v = config.min; v <= config.max; v += config.tickInterval) {
          const percent = this._valueToPercent(state, v);
          const tick = document.createElement("div");
          tick.className = "bael-rangeslider-tick";
          tick.style[isVertical ? "bottom" : "left"] = `${percent}%`;
          ticks.appendChild(tick);
        }
        track.appendChild(ticks);
      }

      // Fill
      const fill = document.createElement("div");
      fill.className = "bael-rangeslider-fill";
      state.fill = fill;
      track.appendChild(fill);

      // Handles
      if (isRange) {
        const handle1 = this._createHandle(state, 0);
        const handle2 = this._createHandle(state, 1);
        state.handles = [handle1, handle2];
        track.appendChild(handle1);
        track.appendChild(handle2);
      } else {
        const handle = this._createHandle(state, 0);
        state.handles = [handle];
        track.appendChild(handle);
      }

      element.appendChild(track);

      // Marks
      if (config.showMarks && config.marks) {
        const marks = document.createElement("div");
        marks.className = "bael-rangeslider-marks";

        Object.entries(config.marks).forEach(([val, label]) => {
          const percent = this._valueToPercent(state, parseFloat(val));
          const mark = document.createElement("div");
          mark.className = "bael-rangeslider-mark";
          mark.style[isVertical ? "bottom" : "left"] = `${percent}%`;
          mark.textContent = label;
          marks.appendChild(mark);
        });

        state.marksEl = marks;
        element.appendChild(marks);
      }

      // Values display
      if (config.showValues) {
        const values = document.createElement("div");
        values.className = "bael-rangeslider-values";
        values.innerHTML = `
                    <span>${config.formatValue(config.min)}</span>
                    <span>${config.formatValue(config.max)}</span>
                `;
        element.appendChild(values);
      }

      this._updateUI(state);
    }

    /**
     * Create handle element
     */
    _createHandle(state, index) {
      const handle = document.createElement("div");
      handle.className = "bael-rangeslider-handle";
      handle.tabIndex = 0;
      handle.dataset.index = index;

      if (state.config.showTooltip) {
        const tooltip = document.createElement("div");
        tooltip.className = "bael-rangeslider-tooltip";
        handle.appendChild(tooltip);
      }

      return handle;
    }

    /**
     * Bind events
     */
    _bindEvents(state) {
      const { track, handles, config } = state;
      const isVertical = config.orientation === "vertical";

      // Click on track
      track.addEventListener("mousedown", (e) => {
        if (config.disabled) return;
        if (e.target.classList.contains("bael-rangeslider-handle")) return;

        const rect = track.getBoundingClientRect();
        const percent = isVertical
          ? 100 - ((e.clientY - rect.top) / rect.height) * 100
          : ((e.clientX - rect.left) / rect.width) * 100;
        const value = this._percentToValue(state, percent);

        // Find closest handle
        if (Array.isArray(state.value)) {
          const mid = (state.value[0] + state.value[1]) / 2;
          const index = value < mid ? 0 : 1;
          state.value[index] = this._clampValue(state, value, index);
        } else {
          state.value = this._clampValue(state, value, 0);
        }

        this._updateUI(state);
        this._emitChange(state);
      });

      // Handle drag
      handles.forEach((handle, index) => {
        handle.addEventListener("mousedown", (e) => {
          if (config.disabled) return;
          e.stopPropagation();
          state.dragging = index;
          handle.classList.add("dragging");

          if (config.onDragStart) config.onDragStart(state.value);
        });

        // Keyboard
        handle.addEventListener("keydown", (e) => {
          if (config.disabled) return;

          let delta = 0;
          if (e.key === "ArrowLeft" || e.key === "ArrowDown")
            delta = -config.step;
          if (e.key === "ArrowRight" || e.key === "ArrowUp")
            delta = config.step;
          if (e.key === "PageDown") delta = -config.step * 10;
          if (e.key === "PageUp") delta = config.step * 10;
          if (e.key === "Home") {
            if (Array.isArray(state.value)) {
              state.value[index] = index === 0 ? config.min : state.value[0];
            } else {
              state.value = config.min;
            }
            this._updateUI(state);
            this._emitChange(state);
            return;
          }
          if (e.key === "End") {
            if (Array.isArray(state.value)) {
              state.value[index] = index === 1 ? config.max : state.value[1];
            } else {
              state.value = config.max;
            }
            this._updateUI(state);
            this._emitChange(state);
            return;
          }

          if (delta !== 0) {
            e.preventDefault();
            if (Array.isArray(state.value)) {
              state.value[index] = this._clampValue(
                state,
                state.value[index] + delta,
                index,
              );
            } else {
              state.value = this._clampValue(state, state.value + delta, 0);
            }
            this._updateUI(state);
            this._emitChange(state);
          }
        });
      });

      // Global mouse move/up
      document.addEventListener("mousemove", (e) => {
        if (state.dragging === null) return;

        const rect = track.getBoundingClientRect();
        const percent = isVertical
          ? 100 - ((e.clientY - rect.top) / rect.height) * 100
          : ((e.clientX - rect.left) / rect.width) * 100;
        const value = this._percentToValue(state, percent);

        if (Array.isArray(state.value)) {
          state.value[state.dragging] = this._clampValue(
            state,
            value,
            state.dragging,
          );
        } else {
          state.value = this._clampValue(state, value, 0);
        }

        this._updateUI(state);
        this._emitChange(state);
      });

      document.addEventListener("mouseup", () => {
        if (state.dragging !== null) {
          handles[state.dragging].classList.remove("dragging");
          if (config.onDragEnd) config.onDragEnd(state.value);
          state.dragging = null;
        }
      });
    }

    /**
     * Update UI
     */
    _updateUI(state) {
      const { fill, handles, config } = state;
      const isVertical = config.orientation === "vertical";
      const isRange = Array.isArray(state.value);

      if (isRange) {
        const percent1 = this._valueToPercent(state, state.value[0]);
        const percent2 = this._valueToPercent(state, state.value[1]);

        if (isVertical) {
          fill.style.bottom = `${percent1}%`;
          fill.style.top = `${100 - percent2}%`;
          handles[0].style.bottom = `${percent1}%`;
          handles[1].style.bottom = `${percent2}%`;
        } else {
          fill.style.left = `${percent1}%`;
          fill.style.right = `${100 - percent2}%`;
          handles[0].style.left = `${percent1}%`;
          handles[1].style.left = `${percent2}%`;
        }

        // Update tooltips
        if (config.showTooltip) {
          const tooltip1 = handles[0].querySelector(
            ".bael-rangeslider-tooltip",
          );
          const tooltip2 = handles[1].querySelector(
            ".bael-rangeslider-tooltip",
          );
          if (tooltip1)
            tooltip1.textContent = config.formatValue(state.value[0]);
          if (tooltip2)
            tooltip2.textContent = config.formatValue(state.value[1]);
        }
      } else {
        const percent = this._valueToPercent(state, state.value);

        if (isVertical) {
          fill.style.bottom = "0";
          fill.style.height = `${percent}%`;
          handles[0].style.bottom = `${percent}%`;
        } else {
          fill.style.left = "0";
          fill.style.width = `${percent}%`;
          handles[0].style.left = `${percent}%`;
        }

        // Update tooltip
        if (config.showTooltip) {
          const tooltip = handles[0].querySelector(".bael-rangeslider-tooltip");
          if (tooltip) tooltip.textContent = config.formatValue(state.value);
        }
      }

      // Update active marks
      if (state.marksEl) {
        state.marksEl
          .querySelectorAll(".bael-rangeslider-mark")
          .forEach((mark) => {
            const percent = parseFloat(mark.style.left || mark.style.bottom);
            const markValue = this._percentToValue(state, percent);

            let isActive;
            if (isRange) {
              isActive =
                markValue >= state.value[0] && markValue <= state.value[1];
            } else {
              isActive = markValue <= state.value;
            }

            mark.classList.toggle("bael-rangeslider-mark-active", isActive);
          });
      }
    }

    /**
     * Value to percent
     */
    _valueToPercent(state, value) {
      const { min, max } = state.config;
      return ((value - min) / (max - min)) * 100;
    }

    /**
     * Percent to value
     */
    _percentToValue(state, percent) {
      const { min, max, step } = state.config;
      const raw = min + (percent / 100) * (max - min);
      return Math.round(raw / step) * step;
    }

    /**
     * Clamp value
     */
    _clampValue(state, value, handleIndex) {
      const { min, max } = state.config;
      const isRange = Array.isArray(state.value);

      let clampedMin = min;
      let clampedMax = max;

      // For range sliders, prevent handles from crossing
      if (isRange) {
        if (handleIndex === 0) {
          clampedMax = state.value[1];
        } else {
          clampedMin = state.value[0];
        }
      }

      return Math.min(Math.max(value, clampedMin), clampedMax);
    }

    /**
     * Set value
     */
    _setValue(state, value) {
      if (Array.isArray(value)) {
        state.value = [
          this._clampValue(state, value[0], 0),
          this._clampValue(state, value[1], 1),
        ];
      } else {
        state.value = this._clampValue(state, value, 0);
      }
      this._updateUI(state);
    }

    /**
     * Emit change
     */
    _emitChange(state) {
      if (state.config.onChange) {
        state.config.onChange(state.value);
      }
    }

    /**
     * Destroy slider
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

  const bael = new BaelRangeSlider();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$rangeSlider = (container, options) => bael.create(container, options);
  window.$range = window.$rangeSlider;

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelRangeSlider = bael;

  console.log("🎚️ BAEL Range Slider Component loaded");
})();
