/**
 * BAEL Chart Component - Lord Of All Data Visualization
 *
 * Lightweight charting:
 * - Line charts
 * - Bar charts
 * - Pie/donut charts
 * - Area charts
 * - Responsive
 * - Tooltips
 * - Legends
 * - Animations
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // CHART CLASS
  // ============================================================

  class BaelChart {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();

      // Default colors
      this.colors = [
        "#4f46e5",
        "#06b6d4",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#ec4899",
        "#6366f1",
      ];
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-chart-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-chart-styles";
      styles.textContent = `
                .bael-chart {
                    font-family: system-ui, -apple-system, sans-serif;
                    position: relative;
                }

                .bael-chart-container {
                    position: relative;
                }

                .bael-chart svg {
                    display: block;
                    overflow: visible;
                }

                /* Tooltip */
                .bael-chart-tooltip {
                    position: absolute;
                    background: #1f2937;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    pointer-events: none;
                    z-index: 100;
                    white-space: nowrap;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
                    opacity: 0;
                    transition: opacity 0.15s;
                }

                .bael-chart-tooltip.visible {
                    opacity: 1;
                }

                .bael-chart-tooltip-title {
                    font-weight: 600;
                    margin-bottom: 4px;
                }

                .bael-chart-tooltip-value {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bael-chart-tooltip-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                /* Legend */
                .bael-chart-legend {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                    margin-top: 16px;
                    justify-content: center;
                }

                .bael-chart-legend-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: #6b7280;
                    cursor: pointer;
                    transition: opacity 0.2s;
                }

                .bael-chart-legend-item.disabled {
                    opacity: 0.4;
                }

                .bael-chart-legend-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }

                /* Axis */
                .bael-chart-axis text {
                    font-size: 11px;
                    fill: #9ca3af;
                }

                .bael-chart-axis line {
                    stroke: #e5e7eb;
                }

                .bael-chart-grid line {
                    stroke: #f3f4f6;
                }

                /* Bar */
                .bael-chart-bar {
                    transition: opacity 0.2s;
                }

                .bael-chart-bar:hover {
                    opacity: 0.8;
                }

                /* Line */
                .bael-chart-line {
                    fill: none;
                    stroke-width: 2;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                }

                .bael-chart-dot {
                    transition: r 0.15s;
                }

                .bael-chart-dot:hover {
                    r: 6;
                }

                /* Pie */
                .bael-chart-slice {
                    transition: transform 0.2s;
                    transform-origin: center;
                }

                .bael-chart-slice:hover {
                    transform: scale(1.03);
                }

                /* Area */
                .bael-chart-area {
                    opacity: 0.2;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // UTILITY METHODS
    // ============================================================

    /**
     * Get min/max from datasets
     */
    _getDataRange(datasets) {
      let min = Infinity;
      let max = -Infinity;

      datasets.forEach((ds) => {
        ds.data.forEach((val) => {
          if (val < min) min = val;
          if (val > max) max = val;
        });
      });

      return { min: Math.min(0, min), max };
    }

    /**
     * Generate nice axis ticks
     */
    _generateTicks(min, max, count = 5) {
      const range = max - min;
      const step = range / (count - 1);
      const ticks = [];

      for (let i = 0; i < count; i++) {
        ticks.push(min + step * i);
      }

      return ticks;
    }

    /**
     * Format number for display
     */
    _formatNumber(num) {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
      if (num >= 1000) return (num / 1000).toFixed(1) + "K";
      return num.toFixed(0);
    }

    // ============================================================
    // CREATE CHART
    // ============================================================

    /**
     * Create a chart
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Chart container not found");
        return null;
      }

      const id = `bael-chart-${++this.idCounter}`;
      const config = {
        type: "line", // line, bar, pie, donut, area
        data: {
          labels: [],
          datasets: [],
        },
        width: container.offsetWidth || 400,
        height: 300,
        padding: { top: 20, right: 20, bottom: 40, left: 50 },
        showGrid: true,
        showLegend: true,
        showTooltip: true,
        animate: true,
        colors: this.colors,
        ...options,
      };

      const el = document.createElement("div");
      el.className = "bael-chart";
      el.id = id;

      const state = {
        id,
        element: el,
        container,
        config,
        disabledDatasets: new Set(),
      };

      this._render(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        update: (data) => this.update(id, data),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render chart
     */
    _render(state) {
      const { element, config } = state;
      element.innerHTML = "";

      // Container
      const chartContainer = document.createElement("div");
      chartContainer.className = "bael-chart-container";
      element.appendChild(chartContainer);

      // Tooltip
      if (config.showTooltip) {
        const tooltip = document.createElement("div");
        tooltip.className = "bael-chart-tooltip";
        chartContainer.appendChild(tooltip);
        state.tooltip = tooltip;
      }

      // Render based on type
      switch (config.type) {
        case "bar":
          this._renderBarChart(state, chartContainer);
          break;
        case "pie":
        case "donut":
          this._renderPieChart(state, chartContainer);
          break;
        case "area":
          this._renderAreaChart(state, chartContainer);
          break;
        case "line":
        default:
          this._renderLineChart(state, chartContainer);
      }

      // Legend
      if (config.showLegend && config.data.datasets.length > 0) {
        this._renderLegend(state);
      }
    }

    /**
     * Render line chart
     */
    _renderLineChart(state, container) {
      const { config, disabledDatasets } = state;
      const { width, height, padding, data, colors } = config;

      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      // Filter active datasets
      const activeDatasets = data.datasets.filter(
        (_, i) => !disabledDatasets.has(i),
      );
      if (activeDatasets.length === 0) return;

      const { min, max } = this._getDataRange(activeDatasets);
      const yTicks = this._generateTicks(min, max);

      // SVG
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", width);
      svg.setAttribute("height", height);

      // Grid
      if (config.showGrid) {
        const grid = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "g",
        );
        grid.setAttribute("class", "bael-chart-grid");

        yTicks.forEach((tick) => {
          const y =
            padding.top +
            chartHeight -
            (chartHeight * (tick - min)) / (max - min);
          const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line",
          );
          line.setAttribute("x1", padding.left);
          line.setAttribute("x2", width - padding.right);
          line.setAttribute("y1", y);
          line.setAttribute("y2", y);
          grid.appendChild(line);
        });

        svg.appendChild(grid);
      }

      // Y Axis
      const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "g");
      yAxis.setAttribute("class", "bael-chart-axis");

      yTicks.forEach((tick) => {
        const y =
          padding.top +
          chartHeight -
          (chartHeight * (tick - min)) / (max - min);
        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        text.setAttribute("x", padding.left - 10);
        text.setAttribute("y", y + 4);
        text.setAttribute("text-anchor", "end");
        text.textContent = this._formatNumber(tick);
        yAxis.appendChild(text);
      });

      svg.appendChild(yAxis);

      // X Axis
      const xAxis = document.createElementNS("http://www.w3.org/2000/svg", "g");
      xAxis.setAttribute("class", "bael-chart-axis");

      const xStep = chartWidth / (data.labels.length - 1);
      data.labels.forEach((label, i) => {
        const x = padding.left + i * xStep;
        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        text.setAttribute("x", x);
        text.setAttribute("y", height - 10);
        text.setAttribute("text-anchor", "middle");
        text.textContent = label;
        xAxis.appendChild(text);
      });

      svg.appendChild(xAxis);

      // Lines
      data.datasets.forEach((dataset, dsIndex) => {
        if (disabledDatasets.has(dsIndex)) return;

        const color = colors[dsIndex % colors.length];
        const points = dataset.data.map((val, i) => {
          const x = padding.left + i * xStep;
          const y =
            padding.top +
            chartHeight -
            (chartHeight * (val - min)) / (max - min);
          return { x, y, val };
        });

        // Path
        const pathData = points
          .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
          .join(" ");
        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        path.setAttribute("class", "bael-chart-line");
        path.setAttribute("d", pathData);
        path.setAttribute("stroke", color);
        svg.appendChild(path);

        // Dots
        points.forEach((p, i) => {
          const circle = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle",
          );
          circle.setAttribute("class", "bael-chart-dot");
          circle.setAttribute("cx", p.x);
          circle.setAttribute("cy", p.y);
          circle.setAttribute("r", 4);
          circle.setAttribute("fill", color);

          if (config.showTooltip) {
            circle.addEventListener("mouseenter", (e) => {
              this._showTooltip(
                state,
                e,
                data.labels[i],
                dataset.label,
                p.val,
                color,
              );
            });
            circle.addEventListener("mouseleave", () => {
              this._hideTooltip(state);
            });
          }

          svg.appendChild(circle);
        });
      });

      container.appendChild(svg);
    }

    /**
     * Render bar chart
     */
    _renderBarChart(state, container) {
      const { config, disabledDatasets } = state;
      const { width, height, padding, data, colors } = config;

      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      const activeDatasets = data.datasets.filter(
        (_, i) => !disabledDatasets.has(i),
      );
      if (activeDatasets.length === 0) return;

      const { min, max } = this._getDataRange(activeDatasets);
      const yTicks = this._generateTicks(min, max);

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", width);
      svg.setAttribute("height", height);

      // Grid
      if (config.showGrid) {
        const grid = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "g",
        );
        grid.setAttribute("class", "bael-chart-grid");

        yTicks.forEach((tick) => {
          const y =
            padding.top +
            chartHeight -
            (chartHeight * (tick - min)) / (max - min);
          const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line",
          );
          line.setAttribute("x1", padding.left);
          line.setAttribute("x2", width - padding.right);
          line.setAttribute("y1", y);
          line.setAttribute("y2", y);
          grid.appendChild(line);
        });

        svg.appendChild(grid);
      }

      // Y Axis
      const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "g");
      yAxis.setAttribute("class", "bael-chart-axis");

      yTicks.forEach((tick) => {
        const y =
          padding.top +
          chartHeight -
          (chartHeight * (tick - min)) / (max - min);
        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        text.setAttribute("x", padding.left - 10);
        text.setAttribute("y", y + 4);
        text.setAttribute("text-anchor", "end");
        text.textContent = this._formatNumber(tick);
        yAxis.appendChild(text);
      });

      svg.appendChild(yAxis);

      // Bars
      const groupWidth = chartWidth / data.labels.length;
      const barWidth = (groupWidth - 20) / activeDatasets.length;

      data.labels.forEach((label, labelIndex) => {
        // X Axis label
        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        text.setAttribute("class", "bael-chart-axis");
        text.setAttribute(
          "x",
          padding.left + groupWidth * labelIndex + groupWidth / 2,
        );
        text.setAttribute("y", height - 10);
        text.setAttribute("text-anchor", "middle");
        text.textContent = label;
        svg.appendChild(text);

        // Bars for each dataset
        let activeIndex = 0;
        data.datasets.forEach((dataset, dsIndex) => {
          if (disabledDatasets.has(dsIndex)) return;

          const val = dataset.data[labelIndex];
          const color = colors[dsIndex % colors.length];
          const barHeight = (chartHeight * (val - min)) / (max - min);
          const x =
            padding.left +
            groupWidth * labelIndex +
            10 +
            barWidth * activeIndex;
          const y = padding.top + chartHeight - barHeight;

          const rect = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect",
          );
          rect.setAttribute("class", "bael-chart-bar");
          rect.setAttribute("x", x);
          rect.setAttribute("y", y);
          rect.setAttribute("width", barWidth - 4);
          rect.setAttribute("height", barHeight);
          rect.setAttribute("fill", color);
          rect.setAttribute("rx", 4);

          if (config.showTooltip) {
            rect.addEventListener("mouseenter", (e) => {
              this._showTooltip(state, e, label, dataset.label, val, color);
            });
            rect.addEventListener("mouseleave", () => {
              this._hideTooltip(state);
            });
          }

          svg.appendChild(rect);
          activeIndex++;
        });
      });

      container.appendChild(svg);
    }

    /**
     * Render pie/donut chart
     */
    _renderPieChart(state, container) {
      const { config, disabledDatasets } = state;
      const { width, height, data, colors, type } = config;

      const dataset = data.datasets[0];
      if (!dataset) return;

      const total = dataset.data.reduce(
        (sum, val, i) => (disabledDatasets.has(i) ? sum : sum + val),
        0,
      );

      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 20;
      const innerRadius = type === "donut" ? radius * 0.6 : 0;

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", width);
      svg.setAttribute("height", height);

      let startAngle = -Math.PI / 2;

      dataset.data.forEach((val, i) => {
        if (disabledDatasets.has(i)) return;

        const angle = (val / total) * 2 * Math.PI;
        const endAngle = startAngle + angle;
        const color = colors[i % colors.length];

        // Arc path
        const x1 = centerX + radius * Math.cos(startAngle);
        const y1 = centerY + radius * Math.sin(startAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = centerY + radius * Math.sin(endAngle);

        const largeArc = angle > Math.PI ? 1 : 0;

        let pathData;
        if (innerRadius > 0) {
          const ix1 = centerX + innerRadius * Math.cos(startAngle);
          const iy1 = centerY + innerRadius * Math.sin(startAngle);
          const ix2 = centerX + innerRadius * Math.cos(endAngle);
          const iy2 = centerY + innerRadius * Math.sin(endAngle);

          pathData = `M ${ix1} ${iy1} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${ix1} ${iy1}`;
        } else {
          pathData = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
        }

        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        path.setAttribute("class", "bael-chart-slice");
        path.setAttribute("d", pathData);
        path.setAttribute("fill", color);

        if (config.showTooltip) {
          path.addEventListener("mouseenter", (e) => {
            const percent = ((val / total) * 100).toFixed(1);
            this._showTooltip(
              state,
              e,
              data.labels[i],
              null,
              `${val} (${percent}%)`,
              color,
            );
          });
          path.addEventListener("mouseleave", () => {
            this._hideTooltip(state);
          });
        }

        svg.appendChild(path);
        startAngle = endAngle;
      });

      container.appendChild(svg);
    }

    /**
     * Render area chart
     */
    _renderAreaChart(state, container) {
      const { config, disabledDatasets } = state;
      const { width, height, padding, data, colors } = config;

      const chartWidth = width - padding.left - padding.right;
      const chartHeight = height - padding.top - padding.bottom;

      const activeDatasets = data.datasets.filter(
        (_, i) => !disabledDatasets.has(i),
      );
      if (activeDatasets.length === 0) return;

      const { min, max } = this._getDataRange(activeDatasets);
      const yTicks = this._generateTicks(min, max);

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", width);
      svg.setAttribute("height", height);

      // Grid
      if (config.showGrid) {
        const grid = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "g",
        );
        grid.setAttribute("class", "bael-chart-grid");

        yTicks.forEach((tick) => {
          const y =
            padding.top +
            chartHeight -
            (chartHeight * (tick - min)) / (max - min);
          const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line",
          );
          line.setAttribute("x1", padding.left);
          line.setAttribute("x2", width - padding.right);
          line.setAttribute("y1", y);
          line.setAttribute("y2", y);
          grid.appendChild(line);
        });

        svg.appendChild(grid);
      }

      // Y Axis
      const yAxis = document.createElementNS("http://www.w3.org/2000/svg", "g");
      yAxis.setAttribute("class", "bael-chart-axis");

      yTicks.forEach((tick) => {
        const y =
          padding.top +
          chartHeight -
          (chartHeight * (tick - min)) / (max - min);
        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        text.setAttribute("x", padding.left - 10);
        text.setAttribute("y", y + 4);
        text.setAttribute("text-anchor", "end");
        text.textContent = this._formatNumber(tick);
        yAxis.appendChild(text);
      });

      svg.appendChild(yAxis);

      // X Axis
      const xStep = chartWidth / (data.labels.length - 1);
      data.labels.forEach((label, i) => {
        const x = padding.left + i * xStep;
        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text",
        );
        text.setAttribute("class", "bael-chart-axis");
        text.setAttribute("x", x);
        text.setAttribute("y", height - 10);
        text.setAttribute("text-anchor", "middle");
        text.textContent = label;
        svg.appendChild(text);
      });

      // Areas and lines
      data.datasets.forEach((dataset, dsIndex) => {
        if (disabledDatasets.has(dsIndex)) return;

        const color = colors[dsIndex % colors.length];
        const points = dataset.data.map((val, i) => {
          const x = padding.left + i * xStep;
          const y =
            padding.top +
            chartHeight -
            (chartHeight * (val - min)) / (max - min);
          return { x, y, val };
        });

        // Area
        const baseY = padding.top + chartHeight;
        const areaData =
          `M ${points[0].x} ${baseY} ` +
          points.map((p) => `L ${p.x} ${p.y}`).join(" ") +
          ` L ${points[points.length - 1].x} ${baseY} Z`;

        const area = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        area.setAttribute("class", "bael-chart-area");
        area.setAttribute("d", areaData);
        area.setAttribute("fill", color);
        svg.appendChild(area);

        // Line
        const pathData = points
          .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
          .join(" ");
        const path = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "path",
        );
        path.setAttribute("class", "bael-chart-line");
        path.setAttribute("d", pathData);
        path.setAttribute("stroke", color);
        svg.appendChild(path);

        // Dots
        points.forEach((p, i) => {
          const circle = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "circle",
          );
          circle.setAttribute("class", "bael-chart-dot");
          circle.setAttribute("cx", p.x);
          circle.setAttribute("cy", p.y);
          circle.setAttribute("r", 4);
          circle.setAttribute("fill", color);

          if (config.showTooltip) {
            circle.addEventListener("mouseenter", (e) => {
              this._showTooltip(
                state,
                e,
                data.labels[i],
                dataset.label,
                p.val,
                color,
              );
            });
            circle.addEventListener("mouseleave", () => {
              this._hideTooltip(state);
            });
          }

          svg.appendChild(circle);
        });
      });

      container.appendChild(svg);
    }

    /**
     * Render legend
     */
    _renderLegend(state) {
      const { element, config, disabledDatasets } = state;
      const { data, colors, type } = config;

      const legend = document.createElement("div");
      legend.className = "bael-chart-legend";

      const items =
        type === "pie" || type === "donut"
          ? data.labels
          : data.datasets.map((ds) => ds.label);

      items.forEach((label, i) => {
        const item = document.createElement("div");
        item.className = `bael-chart-legend-item${disabledDatasets.has(i) ? " disabled" : ""}`;

        const dot = document.createElement("div");
        dot.className = "bael-chart-legend-dot";
        dot.style.backgroundColor = colors[i % colors.length];
        item.appendChild(dot);

        const text = document.createElement("span");
        text.textContent = label;
        item.appendChild(text);

        item.addEventListener("click", () => {
          if (disabledDatasets.has(i)) {
            disabledDatasets.delete(i);
          } else {
            disabledDatasets.add(i);
          }
          this._render(state);
        });

        legend.appendChild(item);
      });

      element.appendChild(legend);
    }

    /**
     * Show tooltip
     */
    _showTooltip(state, event, label, series, value, color) {
      const { tooltip, element } = state;
      if (!tooltip) return;

      tooltip.innerHTML = "";

      const title = document.createElement("div");
      title.className = "bael-chart-tooltip-title";
      title.textContent = label;
      tooltip.appendChild(title);

      const valueRow = document.createElement("div");
      valueRow.className = "bael-chart-tooltip-value";

      const dot = document.createElement("span");
      dot.className = "bael-chart-tooltip-dot";
      dot.style.backgroundColor = color;
      valueRow.appendChild(dot);

      const text = document.createElement("span");
      text.textContent = series ? `${series}: ${value}` : value;
      valueRow.appendChild(text);

      tooltip.appendChild(valueRow);

      // Position
      const rect = element.getBoundingClientRect();
      const x = event.clientX - rect.left + 10;
      const y = event.clientY - rect.top - 10;

      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
      tooltip.classList.add("visible");
    }

    /**
     * Hide tooltip
     */
    _hideTooltip(state) {
      if (state.tooltip) {
        state.tooltip.classList.remove("visible");
      }
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    /**
     * Update chart data
     */
    update(chartId, data) {
      const state = this.instances.get(chartId);
      if (!state) return;

      state.config.data = data;
      state.disabledDatasets.clear();
      this._render(state);
    }

    /**
     * Destroy chart
     */
    destroy(chartId) {
      const state = this.instances.get(chartId);
      if (!state) return;

      state.element.remove();
      this.instances.delete(chartId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelChart();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$chart = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelChart = bael;

  console.log("📊 BAEL Chart Component loaded");
})();
