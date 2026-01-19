/**
 * BAEL Stat Card Component - Lord Of All Metrics
 *
 * Statistics display cards:
 * - Value with label
 * - Trend indicator
 * - Progress bar
 * - Comparison
 * - Sparkline chart
 * - Icon support
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // STAT CARD CLASS
  // ============================================================

  class BaelStatCard {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-statcard-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-statcard-styles";
      styles.textContent = `
                .bael-statcard {
                    display: flex;
                    flex-direction: column;
                    padding: 20px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 14px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    transition: all 0.2s;
                }

                .bael-statcard:hover {
                    background: rgba(255,255,255,0.05);
                    border-color: rgba(255,255,255,0.12);
                }

                .bael-statcard.clickable {
                    cursor: pointer;
                }

                .bael-statcard.clickable:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
                }

                /* Header */
                .bael-statcard-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 12px;
                    margin-bottom: 12px;
                }

                .bael-statcard-label {
                    font-size: 13px;
                    font-weight: 500;
                    color: #888;
                    line-height: 1.3;
                }

                .bael-statcard-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    background: rgba(59, 130, 246, 0.15);
                    border-radius: 10px;
                    color: #3b82f6;
                    flex-shrink: 0;
                }

                .bael-statcard-icon svg {
                    width: 20px;
                    height: 20px;
                }

                .bael-statcard-icon.green { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
                .bael-statcard-icon.purple { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
                .bael-statcard-icon.orange { background: rgba(249, 115, 22, 0.15); color: #f97316; }
                .bael-statcard-icon.red { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
                .bael-statcard-icon.pink { background: rgba(236, 72, 153, 0.15); color: #ec4899; }
                .bael-statcard-icon.teal { background: rgba(20, 184, 166, 0.15); color: #14b8a6; }

                /* Value */
                .bael-statcard-value-row {
                    display: flex;
                    align-items: baseline;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .bael-statcard-value {
                    font-size: 32px;
                    font-weight: 700;
                    color: #fff;
                    letter-spacing: -0.5px;
                    line-height: 1.1;
                }

                .bael-statcard-value.colored.blue { color: #3b82f6; }
                .bael-statcard-value.colored.green { color: #22c55e; }
                .bael-statcard-value.colored.purple { color: #8b5cf6; }
                .bael-statcard-value.colored.orange { color: #f97316; }
                .bael-statcard-value.colored.red { color: #ef4444; }

                .bael-statcard-unit {
                    font-size: 14px;
                    font-weight: 500;
                    color: #666;
                }

                /* Trend */
                .bael-statcard-trend {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 3px 8px;
                    background: rgba(34, 197, 94, 0.15);
                    border-radius: 999px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #22c55e;
                }

                .bael-statcard-trend.down {
                    background: rgba(239, 68, 68, 0.15);
                    color: #ef4444;
                }

                .bael-statcard-trend.neutral {
                    background: rgba(107, 114, 128, 0.15);
                    color: #6b7280;
                }

                .bael-statcard-trend svg {
                    width: 12px;
                    height: 12px;
                }

                /* Description / Compare */
                .bael-statcard-desc {
                    font-size: 12px;
                    color: #666;
                    margin-top: 8px;
                }

                .bael-statcard-compare {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-top: 10px;
                    font-size: 12px;
                    color: #666;
                }

                .bael-statcard-compare-value {
                    font-weight: 500;
                    color: #888;
                }

                /* Progress bar */
                .bael-statcard-progress {
                    margin-top: 14px;
                }

                .bael-statcard-progress-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 6px;
                    font-size: 11px;
                    color: #666;
                }

                .bael-statcard-progress-bar {
                    height: 6px;
                    background: rgba(255,255,255,0.08);
                    border-radius: 3px;
                    overflow: hidden;
                }

                .bael-statcard-progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
                    border-radius: 3px;
                    transition: width 0.5s ease;
                }

                .bael-statcard-progress-fill.green { background: linear-gradient(90deg, #22c55e, #10b981); }
                .bael-statcard-progress-fill.purple { background: linear-gradient(90deg, #8b5cf6, #a855f7); }
                .bael-statcard-progress-fill.orange { background: linear-gradient(90deg, #f97316, #fb923c); }
                .bael-statcard-progress-fill.red { background: linear-gradient(90deg, #ef4444, #f87171); }

                /* Sparkline */
                .bael-statcard-sparkline {
                    margin-top: 12px;
                    height: 40px;
                }

                .bael-statcard-sparkline svg {
                    width: 100%;
                    height: 100%;
                }

                .bael-statcard-sparkline path.line {
                    fill: none;
                    stroke: #3b82f6;
                    stroke-width: 2;
                }

                .bael-statcard-sparkline path.area {
                    fill: url(#bael-sparkline-gradient);
                }

                /* Size variants */
                .bael-statcard.compact {
                    padding: 14px 16px;
                }

                .bael-statcard.compact .bael-statcard-value {
                    font-size: 24px;
                }

                .bael-statcard.compact .bael-statcard-icon {
                    width: 32px;
                    height: 32px;
                }

                .bael-statcard.compact .bael-statcard-icon svg {
                    width: 16px;
                    height: 16px;
                }

                .bael-statcard.large {
                    padding: 28px;
                }

                .bael-statcard.large .bael-statcard-value {
                    font-size: 42px;
                }

                .bael-statcard.large .bael-statcard-icon {
                    width: 52px;
                    height: 52px;
                }

                .bael-statcard.large .bael-statcard-icon svg {
                    width: 26px;
                    height: 26px;
                }

                /* Horizontal layout */
                .bael-statcard.horizontal {
                    flex-direction: row;
                    align-items: center;
                    gap: 16px;
                }

                .bael-statcard.horizontal .bael-statcard-header {
                    order: 2;
                    margin: 0;
                }

                .bael-statcard.horizontal .bael-statcard-icon {
                    order: 1;
                }

                .bael-statcard.horizontal .bael-statcard-content {
                    flex: 1;
                    order: 3;
                }

                /* Loading state */
                .bael-statcard.loading .bael-statcard-value,
                .bael-statcard.loading .bael-statcard-label {
                    background: rgba(255,255,255,0.1);
                    color: transparent;
                    border-radius: 4px;
                    animation: bael-stat-pulse 1.5s ease infinite;
                }

                @keyframes bael-stat-pulse {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.8; }
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // ICONS
    // ============================================================

    _trendUp =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>';
    _trendDown =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
    _neutral =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>';

    // ============================================================
    // CREATE STAT CARD
    // ============================================================

    /**
     * Create stat card
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Stat card container not found");
        return null;
      }

      const id = `bael-statcard-${++this.idCounter}`;
      const config = {
        label: "",
        value: 0,
        unit: "", // e.g., '%', 'ms', 'users'
        prefix: "", // e.g., '$'
        icon: null, // Icon SVG
        iconColor: "blue", // blue, green, purple, orange, red, pink, teal
        trend: null, // { value: '+5%', direction: 'up'|'down'|'neutral' }
        description: "",
        compare: null, // { value: '1,234', label: 'vs last month' }
        progress: null, // { value: 75, max: 100, color: 'blue' }
        sparkline: null, // Array of numbers
        size: "default", // compact, default, large
        layout: "default", // default, horizontal
        colorValue: false, // Color the value
        valueColor: "blue",
        loading: false,
        onClick: null,
        ...options,
      };

      const el = document.createElement("div");
      el.className = "bael-statcard";
      if (config.size !== "default") el.classList.add(config.size);
      if (config.layout !== "default") el.classList.add(config.layout);
      if (config.loading) el.classList.add("loading");
      if (config.onClick) el.classList.add("clickable");
      el.id = id;

      const state = {
        id,
        element: el,
        container,
        config,
      };

      this._render(state);
      this._bindEvents(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        setValue: (v) => this._updateValue(state, v),
        setTrend: (t) => this._updateTrend(state, t),
        setProgress: (p) => this._updateProgress(state, p),
        setLoading: (l) => this._setLoading(state, l),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render stat card
     */
    _render(state) {
      const { element, config } = state;

      // Header (label + icon)
      const header = document.createElement("div");
      header.className = "bael-statcard-header";

      const label = document.createElement("div");
      label.className = "bael-statcard-label";
      label.textContent = config.label;
      header.appendChild(label);

      if (config.icon) {
        const icon = document.createElement("div");
        icon.className = `bael-statcard-icon ${config.iconColor}`;
        icon.innerHTML = config.icon;
        header.appendChild(icon);
      }

      element.appendChild(header);

      // Value row
      const valueRow = document.createElement("div");
      valueRow.className = "bael-statcard-value-row";

      const value = document.createElement("div");
      value.className = "bael-statcard-value";
      if (config.colorValue) value.classList.add("colored", config.valueColor);
      state.valueEl = value;
      this._formatValue(state, config.value);
      valueRow.appendChild(value);

      if (config.unit) {
        const unit = document.createElement("span");
        unit.className = "bael-statcard-unit";
        unit.textContent = config.unit;
        valueRow.appendChild(unit);
      }

      // Trend
      if (config.trend) {
        const trend = document.createElement("span");
        trend.className = `bael-statcard-trend ${config.trend.direction || "up"}`;

        let trendIcon = this._trendUp;
        if (config.trend.direction === "down") trendIcon = this._trendDown;
        else if (config.trend.direction === "neutral")
          trendIcon = this._neutral;

        trend.innerHTML = trendIcon;
        trend.appendChild(document.createTextNode(config.trend.value));
        state.trendEl = trend;
        valueRow.appendChild(trend);
      }

      element.appendChild(valueRow);

      // Description
      if (config.description) {
        const desc = document.createElement("div");
        desc.className = "bael-statcard-desc";
        desc.textContent = config.description;
        element.appendChild(desc);
      }

      // Compare
      if (config.compare) {
        const compare = document.createElement("div");
        compare.className = "bael-statcard-compare";
        compare.innerHTML = `
                    <span class="bael-statcard-compare-value">${config.compare.value}</span>
                    <span>${config.compare.label}</span>
                `;
        element.appendChild(compare);
      }

      // Progress
      if (config.progress) {
        const progress = document.createElement("div");
        progress.className = "bael-statcard-progress";

        const progressHeader = document.createElement("div");
        progressHeader.className = "bael-statcard-progress-header";
        progressHeader.innerHTML = `
                    <span>Progress</span>
                    <span>${config.progress.value}%</span>
                `;
        progress.appendChild(progressHeader);

        const progressBar = document.createElement("div");
        progressBar.className = "bael-statcard-progress-bar";

        const progressFill = document.createElement("div");
        progressFill.className = `bael-statcard-progress-fill ${config.progress.color || "blue"}`;
        progressFill.style.width = `${config.progress.value}%`;
        state.progressFill = progressFill;
        progressBar.appendChild(progressFill);

        progress.appendChild(progressBar);
        element.appendChild(progress);
      }

      // Sparkline
      if (config.sparkline && config.sparkline.length > 0) {
        const sparkline = document.createElement("div");
        sparkline.className = "bael-statcard-sparkline";
        sparkline.appendChild(this._createSparkline(config.sparkline));
        element.appendChild(sparkline);
      }
    }

    /**
     * Format value display
     */
    _formatValue(state, value) {
      const { config, valueEl } = state;

      let displayValue = value;

      // Format numbers
      if (typeof value === "number") {
        displayValue = value.toLocaleString();
      }

      // Add prefix
      if (config.prefix) {
        displayValue = config.prefix + displayValue;
      }

      valueEl.textContent = displayValue;
    }

    /**
     * Create sparkline SVG
     */
    _createSparkline(data) {
      const width = 200;
      const height = 40;
      const padding = 2;

      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = max - min || 1;

      const points = data.map((v, i) => ({
        x: padding + (i / (data.length - 1)) * (width - padding * 2),
        y: height - padding - ((v - min) / range) * (height - padding * 2),
      }));

      const linePath = points
        .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
        .join(" ");

      const areaPath =
        linePath +
        ` L ${points[points.length - 1].x} ${height - padding}` +
        ` L ${points[0].x} ${height - padding} Z`;

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      svg.setAttribute("preserveAspectRatio", "none");

      // Gradient definition
      const defs = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "defs",
      );
      const gradient = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "linearGradient",
      );
      gradient.id = "bael-sparkline-gradient";
      gradient.setAttribute("x1", "0%");
      gradient.setAttribute("y1", "0%");
      gradient.setAttribute("x2", "0%");
      gradient.setAttribute("y2", "100%");

      const stop1 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "stop",
      );
      stop1.setAttribute("offset", "0%");
      stop1.setAttribute("stop-color", "rgba(59, 130, 246, 0.3)");
      gradient.appendChild(stop1);

      const stop2 = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "stop",
      );
      stop2.setAttribute("offset", "100%");
      stop2.setAttribute("stop-color", "rgba(59, 130, 246, 0)");
      gradient.appendChild(stop2);

      defs.appendChild(gradient);
      svg.appendChild(defs);

      // Area fill
      const area = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      area.classList.add("area");
      area.setAttribute("d", areaPath);
      svg.appendChild(area);

      // Line
      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      line.classList.add("line");
      line.setAttribute("d", linePath);
      svg.appendChild(line);

      return svg;
    }

    /**
     * Update value
     */
    _updateValue(state, value) {
      state.config.value = value;
      this._formatValue(state, value);
    }

    /**
     * Update trend
     */
    _updateTrend(state, trend) {
      if (!state.trendEl) return;

      state.config.trend = trend;
      state.trendEl.className = `bael-statcard-trend ${trend.direction || "up"}`;

      let trendIcon = this._trendUp;
      if (trend.direction === "down") trendIcon = this._trendDown;
      else if (trend.direction === "neutral") trendIcon = this._neutral;

      state.trendEl.innerHTML = trendIcon;
      state.trendEl.appendChild(document.createTextNode(trend.value));
    }

    /**
     * Update progress
     */
    _updateProgress(state, value) {
      if (!state.progressFill) return;
      state.progressFill.style.width = `${value}%`;
    }

    /**
     * Set loading state
     */
    _setLoading(state, loading) {
      state.config.loading = loading;
      state.element.classList.toggle("loading", loading);
    }

    /**
     * Bind events
     */
    _bindEvents(state) {
      if (state.config.onClick) {
        state.element.addEventListener("click", state.config.onClick);
      }
    }

    /**
     * Destroy instance
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

  const bael = new BaelStatCard();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$statCard = (container, options) => bael.create(container, options);
  window.$stat = (container, options) => bael.create(container, options);
  window.$metric = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelStatCard = bael;

  console.log("📊 BAEL Stat Card loaded");
})();
