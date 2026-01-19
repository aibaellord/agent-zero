/**
 * BAEL Slider/Range Component - Lord Of All Ranges
 *
 * Comprehensive range slider with:
 * - Single/dual handles
 * - Vertical/horizontal orientation
 * - Custom min/max/step
 * - Tick marks and labels
 * - Tooltips
 * - Color ranges
 * - Touch support
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // SLIDER CLASS
  // ============================================================

  class BaelSlider {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-slider-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-slider-styles";
      styles.textContent = `
                .bael-slider {
                    --slider-track-bg: #e5e7eb;
                    --slider-track-fill: #4f46e5;
                    --slider-thumb-size: 20px;
                    --slider-thumb-bg: white;
                    --slider-thumb-border: 2px solid #4f46e5;
                    --slider-track-height: 6px;

                    position: relative;
                    width: 100%;
                    padding: 10px 0;
                    user-select: none;
                    touch-action: none;
                }

                .bael-slider-track {
                    position: relative;
                    width: 100%;
                    height: var(--slider-track-height);
                    background: var(--slider-track-bg);
                    border-radius: 9999px;
                }

                .bael-slider-fill {
                    position: absolute;
                    height: 100%;
                    background: var(--slider-track-fill);
                    border-radius: 9999px;
                    pointer-events: none;
                }

                .bael-slider-thumb {
                    position: absolute;
                    width: var(--slider-thumb-size);
                    height: var(--slider-thumb-size);
                    background: var(--slider-thumb-bg);
                    border: var(--slider-thumb-border);
                    border-radius: 50%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                    cursor: grab;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                    transition: box-shadow 0.15s, transform 0.15s;
                    z-index: 2;
                }

                .bael-slider-thumb:hover {
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                }

                .bael-slider-thumb:active,
                .bael-slider-thumb.dragging {
                    cursor: grabbing;
                    transform: translate(-50%, -50%) scale(1.1);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                }

                .bael-slider-thumb:focus {
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.3);
                }

                /* Tooltip */
                .bael-slider-tooltip {
                    position: absolute;
                    bottom: calc(100% + 8px);
                    left: 50%;
                    transform: translateX(-50%);
                    background: #1f2937;
                    color: white;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    white-space: nowrap;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.15s, visibility 0.15s;
                    z-index: 10;
                }

                .bael-slider-tooltip::after {
                    content: '';
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    border: 4px solid transparent;
                    border-top-color: #1f2937;
                }

                .bael-slider-thumb:hover .bael-slider-tooltip,
                .bael-slider-thumb.dragging .bael-slider-tooltip,
                .bael-slider.tooltip-always .bael-slider-tooltip {
                    opacity: 1;
                    visibility: visible;
                }

                /* Ticks */
                .bael-slider-ticks {
                    position: absolute;
                    width: 100%;
                    top: calc(100% + 5px);
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.75rem;
                    color: #6b7280;
                }

                .bael-slider-tick {
                    position: relative;
                    text-align: center;
                }

                .bael-slider-tick::before {
                    content: '';
                    position: absolute;
                    bottom: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 2px;
                    height: 8px;
                    background: #d1d5db;
                    margin-bottom: 2px;
                }

                /* Vertical */
                .bael-slider-vertical {
                    width: auto;
                    height: 200px;
                    padding: 0 10px;
                }

                .bael-slider-vertical .bael-slider-track {
                    width: var(--slider-track-height);
                    height: 100%;
                }

                .bael-slider-vertical .bael-slider-fill {
                    width: 100%;
                    height: auto;
                    bottom: 0;
                }

                .bael-slider-vertical .bael-slider-thumb {
                    left: 50%;
                    top: auto;
                    transform: translate(-50%, 50%);
                }

                .bael-slider-vertical .bael-slider-thumb:active,
                .bael-slider-vertical .bael-slider-thumb.dragging {
                    transform: translate(-50%, 50%) scale(1.1);
                }

                .bael-slider-vertical .bael-slider-ticks {
                    width: auto;
                    height: 100%;
                    flex-direction: column;
                    top: 0;
                    left: calc(100% + 10px);
                }

                .bael-slider-vertical .bael-slider-tick::before {
                    left: auto;
                    right: 100%;
                    bottom: auto;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 8px;
                    height: 2px;
                    margin-bottom: 0;
                    margin-right: 2px;
                }

                /* Colors */
                .bael-slider-primary { --slider-track-fill: #4f46e5; }
                .bael-slider-success { --slider-track-fill: #10b981; }
                .bael-slider-warning { --slider-track-fill: #f59e0b; }
                .bael-slider-danger { --slider-track-fill: #ef4444; }
                .bael-slider-info { --slider-track-fill: #06b6d4; }

                /* Sizes */
                .bael-slider-sm { --slider-thumb-size: 14px; --slider-track-height: 4px; }
                .bael-slider-md { --slider-thumb-size: 20px; --slider-track-height: 6px; }
                .bael-slider-lg { --slider-thumb-size: 28px; --slider-track-height: 8px; }

                /* Disabled */
                .bael-slider-disabled {
                    opacity: 0.5;
                    pointer-events: none;
                }

                /* Wrapper with labels */
                .bael-slider-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .bael-slider-labels {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .bael-slider-label { font-size: 0.875rem; color: #374151; }
                .bael-slider-value { font-size: 0.875rem; color: #4f46e5; font-weight: 600; }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE SLIDER
    // ============================================================

    /**
     * Create a slider
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Slider container not found");
        return null;
      }

      const id = `bael-slider-${++this.idCounter}`;
      const config = {
        value: 0,
        min: 0,
        max: 100,
        step: 1,
        range: false,
        valueStart: 0,
        valueEnd: 100,
        vertical: false,
        color: "primary",
        size: "md",
        disabled: false,
        showTooltip: true,
        tooltipAlways: false,
        showTicks: false,
        tickCount: 5,
        tickLabels: null,
        showLabels: false,
        label: "",
        formatValue: (val) => val,
        onChange: null,
        onDragStart: null,
        onDragEnd: null,
        ...options,
      };

      // Validate range values
      if (config.range) {
        config.valueStart = Math.max(
          config.min,
          Math.min(config.valueStart, config.max),
        );
        config.valueEnd = Math.max(
          config.min,
          Math.min(config.valueEnd, config.max),
        );
      } else {
        config.value = Math.max(config.min, Math.min(config.value, config.max));
      }

      const state = {
        id,
        container,
        config,
        dragging: null,
      };

      // Create structure
      this._createStructure(state);
      this._setupEvents(state);
      this._updateUI(state);

      this.instances.set(id, state);

      return {
        id,
        getValue: () => this.getValue(id),
        setValue: (value, endValue) => this.setValue(id, value, endValue),
        setMin: (min) => this.setMin(id, min),
        setMax: (max) => this.setMax(id, max),
        setDisabled: (disabled) => this.setDisabled(id, disabled),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Create slider structure
     */
    _createStructure(state) {
      const { config, container } = state;

      // Wrapper
      const wrapper = document.createElement("div");
      wrapper.className = "bael-slider-wrapper";
      wrapper.id = state.id;

      // Labels
      if (config.showLabels) {
        const labels = document.createElement("div");
        labels.className = "bael-slider-labels";

        const label = document.createElement("span");
        label.className = "bael-slider-label";
        label.textContent = config.label;
        labels.appendChild(label);

        const valueDisplay = document.createElement("span");
        valueDisplay.className = "bael-slider-value";
        labels.appendChild(valueDisplay);
        state.valueDisplay = valueDisplay;

        wrapper.appendChild(labels);
      }

      // Slider
      const slider = document.createElement("div");
      slider.className = `bael-slider bael-slider-${config.color} bael-slider-${config.size}`;

      if (config.vertical) slider.classList.add("bael-slider-vertical");
      if (config.disabled) slider.classList.add("bael-slider-disabled");
      if (config.tooltipAlways) slider.classList.add("tooltip-always");

      // Track
      const track = document.createElement("div");
      track.className = "bael-slider-track";

      // Fill
      const fill = document.createElement("div");
      fill.className = "bael-slider-fill";
      track.appendChild(fill);

      // Thumbs
      if (config.range) {
        // Start thumb
        const thumbStart = this._createThumb(state, "start");
        track.appendChild(thumbStart);
        state.thumbStart = thumbStart;

        // End thumb
        const thumbEnd = this._createThumb(state, "end");
        track.appendChild(thumbEnd);
        state.thumbEnd = thumbEnd;
      } else {
        const thumb = this._createThumb(state, "single");
        track.appendChild(thumb);
        state.thumb = thumb;
      }

      slider.appendChild(track);

      // Ticks
      if (config.showTicks) {
        const ticks = document.createElement("div");
        ticks.className = "bael-slider-ticks";

        const tickCount = config.tickLabels
          ? config.tickLabels.length
          : config.tickCount;
        for (let i = 0; i < tickCount; i++) {
          const tick = document.createElement("span");
          tick.className = "bael-slider-tick";

          if (config.tickLabels) {
            tick.textContent = config.tickLabels[i];
          } else {
            const val =
              config.min + ((config.max - config.min) / (tickCount - 1)) * i;
            tick.textContent = config.formatValue(Math.round(val));
          }

          ticks.appendChild(tick);
        }

        slider.appendChild(ticks);
      }

      wrapper.appendChild(slider);
      container.appendChild(wrapper);

      state.wrapper = wrapper;
      state.slider = slider;
      state.track = track;
      state.fill = fill;
    }

    /**
     * Create thumb element
     */
    _createThumb(state, type) {
      const { config } = state;

      const thumb = document.createElement("div");
      thumb.className = "bael-slider-thumb";
      thumb.setAttribute("role", "slider");
      thumb.setAttribute("tabindex", config.disabled ? -1 : 0);
      thumb.setAttribute("aria-valuemin", config.min);
      thumb.setAttribute("aria-valuemax", config.max);
      thumb.dataset.type = type;

      if (config.showTooltip) {
        const tooltip = document.createElement("span");
        tooltip.className = "bael-slider-tooltip";
        thumb.appendChild(tooltip);
      }

      return thumb;
    }

    /**
     * Setup event listeners
     */
    _setupEvents(state) {
      const { config, track } = state;

      // Track click
      track.addEventListener("click", (e) => {
        if (config.disabled) return;
        if (e.target.classList.contains("bael-slider-thumb")) return;

        const value = this._getValueFromPosition(state, e);
        this._handleTrackClick(state, value);
      });

      // Thumb events
      const thumbs = state.thumb
        ? [state.thumb]
        : [state.thumbStart, state.thumbEnd];

      thumbs.forEach((thumb) => {
        // Mouse
        thumb.addEventListener("mousedown", (e) =>
          this._startDrag(state, thumb, e),
        );

        // Touch
        thumb.addEventListener(
          "touchstart",
          (e) => this._startDrag(state, thumb, e),
          { passive: true },
        );

        // Keyboard
        thumb.addEventListener("keydown", (e) =>
          this._handleKeyboard(state, thumb, e),
        );
      });

      // Global mouse/touch events
      document.addEventListener("mousemove", (e) => this._handleDrag(e));
      document.addEventListener("mouseup", (e) => this._endDrag(e));
      document.addEventListener("touchmove", (e) => this._handleDrag(e), {
        passive: false,
      });
      document.addEventListener("touchend", (e) => this._endDrag(e));
    }

    // ============================================================
    // DRAG HANDLING
    // ============================================================

    /**
     * Start dragging
     */
    _startDrag(state, thumb, e) {
      if (state.config.disabled) return;

      state.dragging = {
        thumb,
        type: thumb.dataset.type,
      };

      thumb.classList.add("dragging");

      if (state.config.onDragStart) {
        state.config.onDragStart(this.getValue(state.id));
      }

      e.preventDefault();
    }

    /**
     * Handle drag
     */
    _handleDrag(e) {
      let draggingState = null;

      this.instances.forEach((state) => {
        if (state.dragging) {
          draggingState = state;
        }
      });

      if (!draggingState) return;

      const value = this._getValueFromEvent(draggingState, e);
      this._setValueForThumb(draggingState, draggingState.dragging.type, value);

      e.preventDefault();
    }

    /**
     * End drag
     */
    _endDrag(e) {
      this.instances.forEach((state) => {
        if (state.dragging) {
          state.dragging.thumb.classList.remove("dragging");

          if (state.config.onDragEnd) {
            state.config.onDragEnd(this.getValue(state.id));
          }

          state.dragging = null;
        }
      });
    }

    /**
     * Get value from event
     */
    _getValueFromEvent(state, e) {
      const event = e.touches ? e.touches[0] : e;
      return this._getValueFromPosition(state, event);
    }

    /**
     * Get value from position
     */
    _getValueFromPosition(state, e) {
      const { config, track } = state;
      const rect = track.getBoundingClientRect();

      let percent;
      if (config.vertical) {
        percent = 1 - (e.clientY - rect.top) / rect.height;
      } else {
        percent = (e.clientX - rect.left) / rect.width;
      }

      percent = Math.max(0, Math.min(1, percent));

      const range = config.max - config.min;
      let value = config.min + range * percent;

      // Apply step
      value = Math.round(value / config.step) * config.step;
      value = Math.max(config.min, Math.min(config.max, value));

      return value;
    }

    /**
     * Handle track click
     */
    _handleTrackClick(state, value) {
      const { config } = state;

      if (config.range) {
        const distToStart = Math.abs(value - config.valueStart);
        const distToEnd = Math.abs(value - config.valueEnd);

        if (distToStart < distToEnd) {
          this._setValueForThumb(state, "start", value);
        } else {
          this._setValueForThumb(state, "end", value);
        }
      } else {
        this._setValueForThumb(state, "single", value);
      }
    }

    // ============================================================
    // KEYBOARD
    // ============================================================

    /**
     * Handle keyboard navigation
     */
    _handleKeyboard(state, thumb, e) {
      const { config } = state;
      const type = thumb.dataset.type;
      const currentValue =
        type === "start"
          ? config.valueStart
          : type === "end"
            ? config.valueEnd
            : config.value;

      let newValue = currentValue;
      const bigStep = config.step * 10;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          newValue = currentValue + config.step;
          break;
        case "ArrowLeft":
        case "ArrowDown":
          newValue = currentValue - config.step;
          break;
        case "PageUp":
          newValue = currentValue + bigStep;
          break;
        case "PageDown":
          newValue = currentValue - bigStep;
          break;
        case "Home":
          newValue = config.min;
          break;
        case "End":
          newValue = config.max;
          break;
        default:
          return;
      }

      e.preventDefault();
      this._setValueForThumb(state, type, newValue);
    }

    // ============================================================
    // VALUE MANAGEMENT
    // ============================================================

    /**
     * Set value for specific thumb
     */
    _setValueForThumb(state, type, value) {
      const { config } = state;

      value = Math.max(config.min, Math.min(config.max, value));
      value = Math.round(value / config.step) * config.step;

      if (config.range) {
        if (type === "start") {
          value = Math.min(value, config.valueEnd);
          config.valueStart = value;
        } else if (type === "end") {
          value = Math.max(value, config.valueStart);
          config.valueEnd = value;
        }
      } else {
        config.value = value;
      }

      this._updateUI(state);

      if (config.onChange) {
        config.onChange(this.getValue(state.id));
      }
    }

    /**
     * Get current value
     */
    getValue(sliderId) {
      const state = this.instances.get(sliderId);
      if (!state) return null;

      if (state.config.range) {
        return {
          start: state.config.valueStart,
          end: state.config.valueEnd,
        };
      }
      return state.config.value;
    }

    /**
     * Set value
     */
    setValue(sliderId, value, endValue) {
      const state = this.instances.get(sliderId);
      if (!state) return;

      if (state.config.range) {
        if (typeof value === "object") {
          state.config.valueStart = value.start;
          state.config.valueEnd = value.end;
        } else {
          state.config.valueStart = value;
          if (endValue !== undefined) {
            state.config.valueEnd = endValue;
          }
        }
      } else {
        state.config.value = value;
      }

      this._updateUI(state);
    }

    /**
     * Update UI
     */
    _updateUI(state) {
      const { config, fill, vertical } = state;
      const range = config.max - config.min;

      if (config.range) {
        const startPercent = ((config.valueStart - config.min) / range) * 100;
        const endPercent = ((config.valueEnd - config.min) / range) * 100;

        if (config.vertical) {
          fill.style.bottom = `${startPercent}%`;
          fill.style.height = `${endPercent - startPercent}%`;
          state.thumbStart.style.bottom = `${startPercent}%`;
          state.thumbEnd.style.bottom = `${endPercent}%`;
        } else {
          fill.style.left = `${startPercent}%`;
          fill.style.width = `${endPercent - startPercent}%`;
          state.thumbStart.style.left = `${startPercent}%`;
          state.thumbEnd.style.left = `${endPercent}%`;
        }

        // Update tooltips
        this._updateTooltip(state.thumbStart, config.valueStart, config);
        this._updateTooltip(state.thumbEnd, config.valueEnd, config);

        // ARIA
        state.thumbStart.setAttribute("aria-valuenow", config.valueStart);
        state.thumbEnd.setAttribute("aria-valuenow", config.valueEnd);
      } else {
        const percent = ((config.value - config.min) / range) * 100;

        if (config.vertical) {
          fill.style.height = `${percent}%`;
          state.thumb.style.bottom = `${percent}%`;
        } else {
          fill.style.width = `${percent}%`;
          state.thumb.style.left = `${percent}%`;
        }

        // Update tooltip
        this._updateTooltip(state.thumb, config.value, config);

        // ARIA
        state.thumb.setAttribute("aria-valuenow", config.value);
      }

      // Update value display
      if (state.valueDisplay) {
        if (config.range) {
          state.valueDisplay.textContent = `${config.formatValue(config.valueStart)} - ${config.formatValue(config.valueEnd)}`;
        } else {
          state.valueDisplay.textContent = config.formatValue(config.value);
        }
      }
    }

    /**
     * Update tooltip
     */
    _updateTooltip(thumb, value, config) {
      const tooltip = thumb.querySelector(".bael-slider-tooltip");
      if (tooltip) {
        tooltip.textContent = config.formatValue(value);
      }
    }

    // ============================================================
    // CONFIG UPDATES
    // ============================================================

    /**
     * Set min value
     */
    setMin(sliderId, min) {
      const state = this.instances.get(sliderId);
      if (!state) return;

      state.config.min = min;
      this._updateUI(state);
    }

    /**
     * Set max value
     */
    setMax(sliderId, max) {
      const state = this.instances.get(sliderId);
      if (!state) return;

      state.config.max = max;
      this._updateUI(state);
    }

    /**
     * Set disabled state
     */
    setDisabled(sliderId, disabled) {
      const state = this.instances.get(sliderId);
      if (!state) return;

      state.config.disabled = disabled;

      if (disabled) {
        state.slider.classList.add("bael-slider-disabled");
      } else {
        state.slider.classList.remove("bael-slider-disabled");
      }
    }

    // ============================================================
    // DESTROY
    // ============================================================

    /**
     * Destroy slider
     */
    destroy(sliderId) {
      const state = this.instances.get(sliderId);
      if (!state) return;

      state.wrapper.remove();
      this.instances.delete(sliderId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelSlider();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$slider = (container, options) => bael.create(container, options);
  window.$range = (container, options) =>
    bael.create(container, { ...options, range: true });

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelSlider = bael;

  console.log("🎚️ BAEL Slider Component loaded");
})();
