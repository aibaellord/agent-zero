/**
 * BAEL Progress Component - Lord Of All Progress Indicators
 *
 * Comprehensive progress display with:
 * - Linear progress bars
 * - Circular/radial progress
 * - Indeterminate states
 * - Multiple colors/themes
 * - Animations and transitions
 * - Striped/animated variants
 * - Stacked progress
 * - Labels and percentages
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // PROGRESS CLASS
  // ============================================================

  class BaelProgress {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-progress-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-progress-styles";
      styles.textContent = `
                .bael-progress {
                    --progress-height: 20px;
                    --progress-bg: #e9ecef;
                    --progress-color: #4f46e5;
                    --progress-radius: 4px;
                    --progress-transition: width 0.3s ease;

                    width: 100%;
                    height: var(--progress-height);
                    background: var(--progress-bg);
                    border-radius: var(--progress-radius);
                    overflow: hidden;
                    position: relative;
                }

                .bael-progress-bar {
                    height: 100%;
                    background: var(--progress-color);
                    transition: var(--progress-transition);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 600;
                    white-space: nowrap;
                }

                /* Sizes */
                .bael-progress-xs { --progress-height: 4px; }
                .bael-progress-sm { --progress-height: 10px; }
                .bael-progress-md { --progress-height: 20px; }
                .bael-progress-lg { --progress-height: 30px; }
                .bael-progress-xl { --progress-height: 40px; }

                /* Colors */
                .bael-progress-primary { --progress-color: #4f46e5; }
                .bael-progress-success { --progress-color: #10b981; }
                .bael-progress-warning { --progress-color: #f59e0b; }
                .bael-progress-danger { --progress-color: #ef4444; }
                .bael-progress-info { --progress-color: #06b6d4; }
                .bael-progress-dark { --progress-color: #1f2937; }

                /* Gradient */
                .bael-progress-gradient .bael-progress-bar {
                    background: linear-gradient(90deg, #4f46e5, #7c3aed, #db2777);
                }

                /* Striped */
                .bael-progress-striped .bael-progress-bar {
                    background-image: linear-gradient(
                        45deg,
                        rgba(255,255,255,0.15) 25%,
                        transparent 25%,
                        transparent 50%,
                        rgba(255,255,255,0.15) 50%,
                        rgba(255,255,255,0.15) 75%,
                        transparent 75%,
                        transparent
                    );
                    background-size: 1rem 1rem;
                }

                /* Animated striped */
                .bael-progress-animated .bael-progress-bar {
                    animation: bael-progress-stripes 1s linear infinite;
                }

                @keyframes bael-progress-stripes {
                    0% { background-position: 1rem 0; }
                    100% { background-position: 0 0; }
                }

                /* Indeterminate */
                .bael-progress-indeterminate .bael-progress-bar {
                    width: 30% !important;
                    animation: bael-progress-indeterminate 1.5s ease-in-out infinite;
                }

                @keyframes bael-progress-indeterminate {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(400%); }
                }

                /* Label outside */
                .bael-progress-wrapper {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .bael-progress-labels {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.875rem;
                }

                .bael-progress-label { color: #374151; }
                .bael-progress-value { color: #6b7280; }

                /* Circular progress */
                .bael-progress-circular {
                    --circle-size: 80px;
                    --circle-stroke: 8px;
                    --circle-color: #4f46e5;
                    --circle-bg: #e5e7eb;

                    width: var(--circle-size);
                    height: var(--circle-size);
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }

                .bael-progress-circular svg {
                    transform: rotate(-90deg);
                    width: 100%;
                    height: 100%;
                }

                .bael-progress-circular-bg {
                    fill: none;
                    stroke: var(--circle-bg);
                    stroke-width: var(--circle-stroke);
                }

                .bael-progress-circular-bar {
                    fill: none;
                    stroke: var(--circle-color);
                    stroke-width: var(--circle-stroke);
                    stroke-linecap: round;
                    transition: stroke-dashoffset 0.3s ease;
                }

                .bael-progress-circular-value {
                    position: absolute;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #374151;
                }

                /* Circular sizes */
                .bael-progress-circular-sm { --circle-size: 50px; --circle-stroke: 5px; }
                .bael-progress-circular-md { --circle-size: 80px; --circle-stroke: 8px; }
                .bael-progress-circular-lg { --circle-size: 120px; --circle-stroke: 10px; }
                .bael-progress-circular-xl { --circle-size: 160px; --circle-stroke: 12px; }

                /* Circular indeterminate */
                .bael-progress-circular-indeterminate svg {
                    animation: bael-circular-rotate 2s linear infinite;
                }

                .bael-progress-circular-indeterminate .bael-progress-circular-bar {
                    animation: bael-circular-dash 1.5s ease-in-out infinite;
                    stroke-dasharray: 90, 200;
                    stroke-dashoffset: 0;
                }

                @keyframes bael-circular-rotate {
                    100% { transform: rotate(270deg); }
                }

                @keyframes bael-circular-dash {
                    0% { stroke-dasharray: 1, 200; stroke-dashoffset: 0; }
                    50% { stroke-dasharray: 100, 200; stroke-dashoffset: -15; }
                    100% { stroke-dasharray: 100, 200; stroke-dashoffset: -125; }
                }

                /* Stacked */
                .bael-progress-stacked {
                    display: flex;
                }

                .bael-progress-stacked .bael-progress-bar {
                    flex: none;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // LINEAR PROGRESS
    // ============================================================

    /**
     * Create linear progress bar
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Progress container not found");
        return null;
      }

      const id = `bael-progress-${++this.idCounter}`;
      const config = {
        value: 0,
        min: 0,
        max: 100,
        size: "md",
        color: "primary",
        striped: false,
        animated: false,
        indeterminate: false,
        showLabel: false,
        showValue: true,
        labelInside: false,
        label: "",
        format: (val, max) => `${Math.round((val / max) * 100)}%`,
        gradient: false,
        ...options,
      };

      // Create wrapper
      const wrapper = document.createElement("div");
      wrapper.className = "bael-progress-wrapper";
      wrapper.id = id;

      // Labels outside
      let labelsEl = null;
      let labelEl = null;
      let valueEl = null;

      if ((config.showLabel || config.showValue) && !config.labelInside) {
        labelsEl = document.createElement("div");
        labelsEl.className = "bael-progress-labels";

        labelEl = document.createElement("span");
        labelEl.className = "bael-progress-label";
        labelEl.textContent = config.label;
        labelsEl.appendChild(labelEl);

        valueEl = document.createElement("span");
        valueEl.className = "bael-progress-value";
        labelsEl.appendChild(valueEl);

        wrapper.appendChild(labelsEl);
      }

      // Progress container
      const progress = document.createElement("div");
      progress.className = `bael-progress bael-progress-${config.size} bael-progress-${config.color}`;

      if (config.striped) progress.classList.add("bael-progress-striped");
      if (config.animated) progress.classList.add("bael-progress-animated");
      if (config.indeterminate)
        progress.classList.add("bael-progress-indeterminate");
      if (config.gradient) progress.classList.add("bael-progress-gradient");

      progress.setAttribute("role", "progressbar");
      progress.setAttribute("aria-valuemin", config.min);
      progress.setAttribute("aria-valuemax", config.max);

      // Progress bar
      const bar = document.createElement("div");
      bar.className = "bael-progress-bar";
      progress.appendChild(bar);

      wrapper.appendChild(progress);
      container.appendChild(wrapper);

      const state = {
        id,
        config,
        wrapper,
        progress,
        bar,
        labelsEl,
        labelEl,
        valueEl,
      };

      this.instances.set(id, state);

      // Set initial value
      this.setValue(id, config.value);

      return {
        id,
        setValue: (value) => this.setValue(id, value),
        getValue: () => state.config.value,
        setLabel: (label) => this.setLabel(id, label),
        setIndeterminate: (indeterminate) =>
          this.setIndeterminate(id, indeterminate),
        increment: (amount = 1) =>
          this.setValue(id, state.config.value + amount),
        decrement: (amount = 1) =>
          this.setValue(id, state.config.value - amount),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Set progress value
     */
    setValue(progressId, value) {
      const state = this.instances.get(progressId);
      if (!state) return;

      const { config, progress, bar, valueEl } = state;

      value = Math.max(config.min, Math.min(value, config.max));
      config.value = value;

      const percent = ((value - config.min) / (config.max - config.min)) * 100;

      if (!config.indeterminate) {
        bar.style.width = `${percent}%`;
      }

      progress.setAttribute("aria-valuenow", value);

      // Update value display
      const formattedValue = config.format(value, config.max);

      if (config.labelInside) {
        bar.textContent = formattedValue;
      } else if (valueEl) {
        valueEl.textContent = formattedValue;
      }
    }

    /**
     * Set label
     */
    setLabel(progressId, label) {
      const state = this.instances.get(progressId);
      if (!state || !state.labelEl) return;

      state.labelEl.textContent = label;
      state.config.label = label;
    }

    /**
     * Set indeterminate state
     */
    setIndeterminate(progressId, indeterminate) {
      const state = this.instances.get(progressId);
      if (!state) return;

      state.config.indeterminate = indeterminate;

      if (indeterminate) {
        state.progress.classList.add("bael-progress-indeterminate");
      } else {
        state.progress.classList.remove("bael-progress-indeterminate");
        this.setValue(progressId, state.config.value);
      }
    }

    // ============================================================
    // CIRCULAR PROGRESS
    // ============================================================

    /**
     * Create circular progress
     */
    createCircular(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Circular progress container not found");
        return null;
      }

      const id = `bael-progress-circular-${++this.idCounter}`;
      const config = {
        value: 0,
        min: 0,
        max: 100,
        size: "md",
        color: "primary",
        strokeWidth: null,
        indeterminate: false,
        showValue: true,
        format: (val, max) => `${Math.round((val / max) * 100)}%`,
        ...options,
      };

      // Create container
      const wrapper = document.createElement("div");
      wrapper.className = `bael-progress-circular bael-progress-circular-${config.size}`;
      wrapper.id = id;

      if (config.indeterminate) {
        wrapper.classList.add("bael-progress-circular-indeterminate");
      }

      // SVG
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 100 100");

      // Background circle
      const bgCircle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      bgCircle.setAttribute("cx", "50");
      bgCircle.setAttribute("cy", "50");
      bgCircle.setAttribute("r", "45");
      bgCircle.classList.add("bael-progress-circular-bg");
      svg.appendChild(bgCircle);

      // Progress circle
      const progressCircle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      progressCircle.setAttribute("cx", "50");
      progressCircle.setAttribute("cy", "50");
      progressCircle.setAttribute("r", "45");
      progressCircle.classList.add("bael-progress-circular-bar");

      const circumference = 2 * Math.PI * 45;
      progressCircle.style.strokeDasharray = circumference;
      progressCircle.style.strokeDashoffset = circumference;

      if (config.color) {
        const colors = {
          primary: "#4f46e5",
          success: "#10b981",
          warning: "#f59e0b",
          danger: "#ef4444",
          info: "#06b6d4",
          dark: "#1f2937",
        };
        progressCircle.style.stroke = colors[config.color] || config.color;
      }

      svg.appendChild(progressCircle);
      wrapper.appendChild(svg);

      // Value display
      let valueEl = null;
      if (config.showValue) {
        valueEl = document.createElement("span");
        valueEl.className = "bael-progress-circular-value";
        wrapper.appendChild(valueEl);
      }

      container.appendChild(wrapper);

      const state = {
        id,
        config,
        wrapper,
        svg,
        progressCircle,
        valueEl,
        circumference,
      };

      this.instances.set(id, state);

      // Set initial value
      this.setCircularValue(id, config.value);

      return {
        id,
        setValue: (value) => this.setCircularValue(id, value),
        getValue: () => state.config.value,
        setIndeterminate: (indeterminate) =>
          this.setCircularIndeterminate(id, indeterminate),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Set circular progress value
     */
    setCircularValue(progressId, value) {
      const state = this.instances.get(progressId);
      if (!state || !state.circumference) return;

      const { config, progressCircle, valueEl, circumference } = state;

      value = Math.max(config.min, Math.min(value, config.max));
      config.value = value;

      const percent = (value - config.min) / (config.max - config.min);
      const offset = circumference * (1 - percent);

      if (!config.indeterminate) {
        progressCircle.style.strokeDashoffset = offset;
      }

      if (valueEl) {
        valueEl.textContent = config.format(value, config.max);
      }
    }

    /**
     * Set circular indeterminate
     */
    setCircularIndeterminate(progressId, indeterminate) {
      const state = this.instances.get(progressId);
      if (!state) return;

      state.config.indeterminate = indeterminate;

      if (indeterminate) {
        state.wrapper.classList.add("bael-progress-circular-indeterminate");
      } else {
        state.wrapper.classList.remove("bael-progress-circular-indeterminate");
        this.setCircularValue(progressId, state.config.value);
      }
    }

    // ============================================================
    // STACKED PROGRESS
    // ============================================================

    /**
     * Create stacked progress bar
     */
    createStacked(container, segments = [], options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Stacked progress container not found");
        return null;
      }

      const id = `bael-progress-stacked-${++this.idCounter}`;
      const config = {
        size: "md",
        ...options,
      };

      const progress = document.createElement("div");
      progress.className = `bael-progress bael-progress-${config.size} bael-progress-stacked`;
      progress.id = id;
      progress.setAttribute("role", "progressbar");

      const bars = [];

      segments.forEach((segment, index) => {
        const bar = document.createElement("div");
        bar.className = `bael-progress-bar`;
        bar.style.width = `${segment.value}%`;

        if (segment.color) {
          const colors = {
            primary: "#4f46e5",
            success: "#10b981",
            warning: "#f59e0b",
            danger: "#ef4444",
            info: "#06b6d4",
            dark: "#1f2937",
          };
          bar.style.background = colors[segment.color] || segment.color;
        }

        if (segment.label) {
          bar.textContent = segment.label;
        }

        if (segment.striped) {
          bar.style.backgroundImage = `linear-gradient(
                        45deg,
                        rgba(255,255,255,0.15) 25%,
                        transparent 25%,
                        transparent 50%,
                        rgba(255,255,255,0.15) 50%,
                        rgba(255,255,255,0.15) 75%,
                        transparent 75%,
                        transparent
                    )`;
          bar.style.backgroundSize = "1rem 1rem";
        }

        progress.appendChild(bar);
        bars.push({ bar, segment });
      });

      container.appendChild(progress);

      const state = {
        id,
        config,
        progress,
        bars,
      };

      this.instances.set(id, state);

      return {
        id,
        updateSegment: (index, value, label) => {
          if (bars[index]) {
            bars[index].bar.style.width = `${value}%`;
            if (label) bars[index].bar.textContent = label;
          }
        },
        destroy: () => this.destroy(id),
      };
    }

    // ============================================================
    // DESTROY
    // ============================================================

    /**
     * Destroy progress instance
     */
    destroy(progressId) {
      const state = this.instances.get(progressId);
      if (!state) return;

      if (state.wrapper) {
        state.wrapper.remove();
      } else if (state.progress) {
        state.progress.remove();
      }

      this.instances.delete(progressId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelProgress();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$progress = (container, options) => bael.create(container, options);
  window.$circularProgress = (container, options) =>
    bael.createCircular(container, options);
  window.$stackedProgress = (container, segments, options) =>
    bael.createStacked(container, segments, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelProgress = bael;

  console.log("📊 BAEL Progress Component loaded");
})();
