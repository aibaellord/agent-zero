/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ██████╗  █████╗ ████████╗ █████╗     ██╗   ██╗██╗███████╗               █
 * █  ██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗    ██║   ██║██║╚══███╔╝               █
 * █  ██║  ██║███████║   ██║   ███████║    ██║   ██║██║  ███╔╝                █
 * █  ██║  ██║██╔══██║   ██║   ██╔══██║    ╚██╗ ██╔╝██║ ███╔╝                 █
 * █  ██████╔╝██║  ██║   ██║   ██║  ██║     ╚████╔╝ ██║███████╗               █
 * █  ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝      ╚═══╝  ╚═╝╚══════╝               █
 * █                                                                          █
 * █   BAEL DATA VISUALIZER - Advanced Data Visualization & Charts           █
 * █   Interactive charts, graphs, and data displays (Ctrl+Shift+G)          █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelDataVisualizer {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;

      this.datasets = new Map();
      this.currentView = "overview";
      this.colors = [
        "#6366f1",
        "#8b5cf6",
        "#ec4899",
        "#ef4444",
        "#f59e0b",
        "#22c55e",
        "#06b6d4",
        "#3b82f6",
      ];
    }

    async initialize() {
      console.log("📊 Bael Data Visualizer initializing...");

      this.loadDatasets();
      this.injectStyles();
      this.createContainer();
      this.setupShortcuts();
      this.collectSystemData();

      this.initialized = true;
      console.log("✅ BAEL DATA VISUALIZER READY");

      return this;
    }

    loadDatasets() {
      try {
        const saved = localStorage.getItem("bael-viz-datasets");
        if (saved) {
          const data = JSON.parse(saved);
          this.datasets = new Map(data);
        }
      } catch (e) {}
    }

    saveDatasets() {
      try {
        localStorage.setItem(
          "bael-viz-datasets",
          JSON.stringify([...this.datasets]),
        );
      } catch (e) {}
    }

    collectSystemData() {
      // Collect usage data for visualization
      const now = new Date();
      const today = now.toISOString().split("T")[0];

      // Messages per day
      const msgData = this.datasets.get("messages") || {
        labels: [],
        values: [],
      };
      const todayIdx = msgData.labels.indexOf(today);
      if (todayIdx === -1) {
        msgData.labels.push(today);
        msgData.values.push(1);
        if (msgData.labels.length > 30) {
          msgData.labels.shift();
          msgData.values.shift();
        }
      }
      this.datasets.set("messages", msgData);

      // Module usage tracking
      window.addEventListener("bael:module-used", (e) => {
        const moduleData = this.datasets.get("modules") || {};
        const moduleName = e.detail?.module || "unknown";
        moduleData[moduleName] = (moduleData[moduleName] || 0) + 1;
        this.datasets.set("modules", moduleData);
        this.saveDatasets();
      });
    }

    injectStyles() {
      if (document.getElementById("bael-viz-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-viz-styles";
      styles.textContent = `
                .bael-viz-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(10px);
                    z-index: 9800;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    pointer-events: none;
                }

                .bael-viz-overlay.visible {
                    opacity: 1;
                    pointer-events: auto;
                }

                .bael-viz-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.95);
                    width: 90vw;
                    max-width: 1200px;
                    height: 85vh;
                    max-height: 800px;
                    background: #12121a;
                    border-radius: 20px;
                    box-shadow: 0 40px 120px rgba(0, 0, 0, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    z-index: 9801;
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .bael-viz-overlay.visible .bael-viz-modal {
                    transform: translate(-50%, -50%) scale(1);
                }

                .viz-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 28px;
                    background: rgba(255, 255, 255, 0.03);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .viz-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .viz-title h2 {
                    margin: 0;
                    font-size: 22px;
                    font-weight: 600;
                    color: #fff;
                }

                .viz-tabs {
                    display: flex;
                    gap: 4px;
                    background: rgba(255, 255, 255, 0.05);
                    padding: 4px;
                    border-radius: 10px;
                }

                .viz-tab {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .viz-tab:hover {
                    color: #fff;
                }

                .viz-tab.active {
                    background: #6366f1;
                    color: #fff;
                }

                .viz-close {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    border: none;
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    font-size: 20px;
                    transition: all 0.2s;
                }

                .viz-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .viz-content {
                    flex: 1;
                    padding: 24px 28px;
                    overflow-y: auto;
                }

                .viz-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                    gap: 20px;
                }

                .viz-card {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    overflow: hidden;
                }

                .viz-card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                }

                .viz-card-title {
                    font-size: 15px;
                    font-weight: 600;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .viz-card-body {
                    padding: 20px;
                    min-height: 200px;
                }

                /* Chart Container */
                .chart-container {
                    width: 100%;
                    height: 200px;
                    position: relative;
                }

                /* Bar Chart */
                .bar-chart {
                    display: flex;
                    align-items: flex-end;
                    justify-content: space-around;
                    height: 100%;
                    gap: 8px;
                    padding: 10px 0;
                }

                .bar-item {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    flex: 1;
                    max-width: 60px;
                }

                .bar {
                    width: 100%;
                    background: linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%);
                    border-radius: 6px 6px 0 0;
                    min-height: 4px;
                    transition: height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .bar-label {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.4);
                    white-space: nowrap;
                }

                .bar-value {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.7);
                    font-weight: 600;
                }

                /* Pie Chart */
                .pie-chart {
                    width: 180px;
                    height: 180px;
                    border-radius: 50%;
                    margin: 0 auto;
                    position: relative;
                    background: conic-gradient(from 0deg, var(--segments));
                }

                .pie-center {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 100px;
                    height: 100px;
                    background: #12121a;
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }

                .pie-total {
                    font-size: 24px;
                    font-weight: 700;
                    color: #fff;
                }

                .pie-label {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                }

                .pie-legend {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    justify-content: center;
                    margin-top: 16px;
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.6);
                }

                .legend-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 3px;
                }

                /* Line Chart */
                .line-chart {
                    width: 100%;
                    height: 100%;
                    position: relative;
                }

                .line-chart svg {
                    width: 100%;
                    height: 100%;
                }

                .line-path {
                    fill: none;
                    stroke: #6366f1;
                    stroke-width: 3;
                    stroke-linecap: round;
                    stroke-linejoin: round;
                }

                .line-area {
                    fill: url(#lineGradient);
                    opacity: 0.3;
                }

                .line-dot {
                    fill: #6366f1;
                    stroke: #fff;
                    stroke-width: 2;
                }

                /* Stats */
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                }

                .stat-item {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 12px;
                    padding: 16px;
                    text-align: center;
                }

                .stat-value {
                    font-size: 28px;
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 4px;
                }

                .stat-label {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                }

                .stat-change {
                    font-size: 11px;
                    margin-top: 6px;
                }

                .stat-change.positive {
                    color: #22c55e;
                }

                .stat-change.negative {
                    color: #ef4444;
                }

                /* Heatmap */
                .heatmap {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 4px;
                }

                .heatmap-cell {
                    aspect-ratio: 1;
                    border-radius: 4px;
                    background: rgba(99, 102, 241, var(--intensity));
                    transition: all 0.2s;
                }

                .heatmap-cell:hover {
                    transform: scale(1.1);
                }

                /* Progress Ring */
                .progress-ring {
                    width: 120px;
                    height: 120px;
                    margin: 0 auto;
                }

                .progress-ring svg {
                    transform: rotate(-90deg);
                }

                .progress-ring-bg {
                    fill: none;
                    stroke: rgba(255, 255, 255, 0.1);
                    stroke-width: 12;
                }

                .progress-ring-fill {
                    fill: none;
                    stroke: #6366f1;
                    stroke-width: 12;
                    stroke-linecap: round;
                    transition: stroke-dashoffset 0.5s ease;
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-data-visualizer";
      this.container.className = "bael-viz-overlay";
      document.body.appendChild(this.container);

      this.container.addEventListener("click", (e) => {
        if (e.target === this.container) {
          this.hide();
        }
      });
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Ctrl+Shift+G for data visualizer
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "G") {
          e.preventDefault();
          if (this.visible) {
            this.hide();
          } else {
            this.show();
          }
        }

        // Escape to close
        if (e.key === "Escape" && this.visible) {
          this.hide();
        }
      });
    }

    show() {
      this.visible = true;
      this.render();
      this.container.classList.add("visible");
    }

    hide() {
      this.visible = false;
      this.container.classList.remove("visible");
    }

    setView(view) {
      this.currentView = view;
      this.render();
    }

    render() {
      this.container.innerHTML = `
                <div class="bael-viz-modal">
                    <div class="viz-header">
                        <div class="viz-title">
                            <span style="font-size: 28px;">📊</span>
                            <h2>Data Visualizer</h2>
                        </div>
                        <div class="viz-tabs">
                            <button class="viz-tab ${this.currentView === "overview" ? "active" : ""}"
                                    onclick="BaelDataVisualizer.setView('overview')">Overview</button>
                            <button class="viz-tab ${this.currentView === "activity" ? "active" : ""}"
                                    onclick="BaelDataVisualizer.setView('activity')">Activity</button>
                            <button class="viz-tab ${this.currentView === "modules" ? "active" : ""}"
                                    onclick="BaelDataVisualizer.setView('modules')">Modules</button>
                            <button class="viz-tab ${this.currentView === "custom" ? "active" : ""}"
                                    onclick="BaelDataVisualizer.setView('custom')">Custom</button>
                        </div>
                        <button class="viz-close" onclick="BaelDataVisualizer.hide()">✕</button>
                    </div>
                    <div class="viz-content">
                        ${this.renderContent()}
                    </div>
                </div>
            `;
    }

    renderContent() {
      switch (this.currentView) {
        case "overview":
          return this.renderOverview();
        case "activity":
          return this.renderActivity();
        case "modules":
          return this.renderModules();
        case "custom":
          return this.renderCustom();
        default:
          return this.renderOverview();
      }
    }

    renderOverview() {
      const moduleCount = Object.keys(window).filter((k) =>
        k.startsWith("Bael"),
      ).length;
      const storageUsed = this.getStorageUsage();

      return `
                <div class="viz-grid">
                    <div class="viz-card">
                        <div class="viz-card-header">
                            <div class="viz-card-title">
                                <span>📈</span> Quick Stats
                            </div>
                        </div>
                        <div class="viz-card-body">
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <div class="stat-value">${moduleCount}</div>
                                    <div class="stat-label">Active Modules</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${storageUsed}</div>
                                    <div class="stat-label">Storage Used</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${this.getSessionDuration()}</div>
                                    <div class="stat-label">Session Time</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-value">${this.getMessageCount()}</div>
                                    <div class="stat-label">Messages Today</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="viz-card">
                        <div class="viz-card-header">
                            <div class="viz-card-title">
                                <span>📊</span> Weekly Activity
                            </div>
                        </div>
                        <div class="viz-card-body">
                            <div class="chart-container">
                                ${this.renderBarChart(this.getWeeklyData())}
                            </div>
                        </div>
                    </div>

                    <div class="viz-card">
                        <div class="viz-card-header">
                            <div class="viz-card-title">
                                <span>🎯</span> Module Usage
                            </div>
                        </div>
                        <div class="viz-card-body">
                            ${this.renderPieChart(this.getModuleUsage())}
                        </div>
                    </div>

                    <div class="viz-card">
                        <div class="viz-card-header">
                            <div class="viz-card-title">
                                <span>🔥</span> Activity Heatmap
                            </div>
                        </div>
                        <div class="viz-card-body">
                            ${this.renderHeatmap()}
                        </div>
                    </div>
                </div>
            `;
    }

    renderActivity() {
      return `
                <div class="viz-grid">
                    <div class="viz-card" style="grid-column: 1 / -1;">
                        <div class="viz-card-header">
                            <div class="viz-card-title">
                                <span>📈</span> Activity Timeline
                            </div>
                        </div>
                        <div class="viz-card-body" style="height: 300px;">
                            <div class="line-chart">
                                ${this.renderLineChart(this.getActivityTimeline())}
                            </div>
                        </div>
                    </div>

                    <div class="viz-card">
                        <div class="viz-card-header">
                            <div class="viz-card-title">
                                <span>⏱️</span> Hourly Distribution
                            </div>
                        </div>
                        <div class="viz-card-body">
                            ${this.renderBarChart(this.getHourlyData())}
                        </div>
                    </div>

                    <div class="viz-card">
                        <div class="viz-card-header">
                            <div class="viz-card-title">
                                <span>📅</span> Daily Average
                            </div>
                        </div>
                        <div class="viz-card-body">
                            ${this.renderProgressRing(this.getDailyProgress())}
                        </div>
                    </div>
                </div>
            `;
    }

    renderModules() {
      const modules = this.getModuleUsage();
      return `
                <div class="viz-grid">
                    <div class="viz-card" style="grid-column: 1 / -1;">
                        <div class="viz-card-header">
                            <div class="viz-card-title">
                                <span>📦</span> Module Usage Breakdown
                            </div>
                        </div>
                        <div class="viz-card-body">
                            <div class="chart-container" style="height: 300px;">
                                ${this.renderBarChart(modules)}
                            </div>
                        </div>
                    </div>

                    <div class="viz-card">
                        <div class="viz-card-header">
                            <div class="viz-card-title">
                                <span>🎯</span> Usage Distribution
                            </div>
                        </div>
                        <div class="viz-card-body">
                            ${this.renderPieChart(modules)}
                        </div>
                    </div>
                </div>
            `;
    }

    renderCustom() {
      return `
                <div class="viz-grid">
                    <div class="viz-card" style="grid-column: 1 / -1;">
                        <div class="viz-card-header">
                            <div class="viz-card-title">
                                <span>🔧</span> Custom Visualizations
                            </div>
                        </div>
                        <div class="viz-card-body" style="text-align: center; color: rgba(255,255,255,0.5);">
                            <p style="font-size: 48px; margin-bottom: 16px;">🚧</p>
                            <p>Custom visualization builder coming soon!</p>
                            <p style="font-size: 12px; margin-top: 8px;">
                                Upload JSON data or connect to APIs to create custom charts.
                            </p>
                        </div>
                    </div>
                </div>
            `;
    }

    // Data collection methods
    getStorageUsage() {
      let total = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length * 2; // UTF-16
        }
      }
      if (total < 1024) return total + " B";
      if (total < 1024 * 1024) return (total / 1024).toFixed(1) + " KB";
      return (total / (1024 * 1024)).toFixed(2) + " MB";
    }

    getSessionDuration() {
      const start = parseInt(
        sessionStorage.getItem("bael-session-start") || Date.now(),
      );
      if (!sessionStorage.getItem("bael-session-start")) {
        sessionStorage.setItem("bael-session-start", Date.now().toString());
      }
      const duration = Date.now() - start;
      const minutes = Math.floor(duration / 60000);
      if (minutes < 60) return minutes + "m";
      return Math.floor(minutes / 60) + "h " + (minutes % 60) + "m";
    }

    getMessageCount() {
      return localStorage.getItem("bael-messages-today") || "0";
    }

    getWeeklyData() {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return {
        labels: days,
        values: days.map(() => Math.floor(Math.random() * 50) + 10), // Demo data
      };
    }

    getHourlyData() {
      return {
        labels: Array.from({ length: 24 }, (_, i) => i + "h"),
        values: Array.from({ length: 24 }, () =>
          Math.floor(Math.random() * 30),
        ),
      };
    }

    getModuleUsage() {
      // Demo module usage data
      return {
        labels: ["Chat", "Notes", "Search", "Code", "Settings"],
        values: [45, 23, 18, 32, 12],
      };
    }

    getActivityTimeline() {
      return {
        labels: Array.from({ length: 30 }, (_, i) => i + 1),
        values: Array.from(
          { length: 30 },
          () => Math.floor(Math.random() * 100) + 20,
        ),
      };
    }

    getDailyProgress() {
      return { current: 67, max: 100, label: "Daily Goal" };
    }

    // Chart rendering methods
    renderBarChart(data) {
      const maxVal = Math.max(...data.values, 1);

      return `
                <div class="bar-chart">
                    ${data.labels
                      .slice(0, 10)
                      .map(
                        (label, i) => `
                        <div class="bar-item">
                            <div class="bar-value">${data.values[i]}</div>
                            <div class="bar" style="height: ${(data.values[i] / maxVal) * 150}px; background: ${this.colors[i % this.colors.length]}"></div>
                            <div class="bar-label">${label}</div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            `;
    }

    renderPieChart(data) {
      const total = data.values.reduce((a, b) => a + b, 0);
      let currentAngle = 0;
      const segments = [];

      data.values.forEach((val, i) => {
        const angle = (val / total) * 360;
        segments.push(
          `${this.colors[i % this.colors.length]} ${currentAngle}deg ${currentAngle + angle}deg`,
        );
        currentAngle += angle;
      });

      return `
                <div class="pie-chart" style="--segments: ${segments.join(", ")}">
                    <div class="pie-center">
                        <div class="pie-total">${total}</div>
                        <div class="pie-label">Total</div>
                    </div>
                </div>
                <div class="pie-legend">
                    ${data.labels
                      .map(
                        (label, i) => `
                        <div class="legend-item">
                            <div class="legend-dot" style="background: ${this.colors[i % this.colors.length]}"></div>
                            ${label}
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            `;
    }

    renderLineChart(data) {
      const width = 100;
      const height = 100;
      const maxVal = Math.max(...data.values);
      const points = data.values.map((val, i) => {
        const x = (i / (data.values.length - 1)) * width;
        const y = height - (val / maxVal) * height;
        return `${x},${y}`;
      });

      const pathD = "M " + points.join(" L ");
      const areaD = pathD + ` L ${width},${height} L 0,${height} Z`;

      return `
                <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="#6366f1" stop-opacity="0.3"/>
                            <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
                        </linearGradient>
                    </defs>
                    <path class="line-area" d="${areaD}"/>
                    <path class="line-path" d="${pathD}"/>
                    ${data.values
                      .map((val, i) => {
                        const x = (i / (data.values.length - 1)) * width;
                        const y = height - (val / maxVal) * height;
                        return `<circle class="line-dot" cx="${x}" cy="${y}" r="2"/>`;
                      })
                      .join("")}
                </svg>
            `;
    }

    renderHeatmap() {
      const cells = Array.from({ length: 35 }, () => Math.random());
      return `
                <div class="heatmap">
                    ${cells
                      .map(
                        (intensity) => `
                        <div class="heatmap-cell" style="--intensity: ${intensity.toFixed(2)}" title="${Math.floor(intensity * 100)}%"></div>
                    `,
                      )
                      .join("")}
                </div>
            `;
    }

    renderProgressRing(data) {
      const radius = 45;
      const circumference = 2 * Math.PI * radius;
      const offset = circumference - (data.current / data.max) * circumference;

      return `
                <div class="progress-ring">
                    <svg viewBox="0 0 120 120">
                        <circle class="progress-ring-bg" cx="60" cy="60" r="${radius}"/>
                        <circle class="progress-ring-fill" cx="60" cy="60" r="${radius}"
                                stroke-dasharray="${circumference}"
                                stroke-dashoffset="${offset}"/>
                    </svg>
                </div>
                <div style="text-align: center; margin-top: 16px;">
                    <div style="font-size: 24px; font-weight: 700; color: #fff;">${data.current}%</div>
                    <div style="font-size: 12px; color: rgba(255,255,255,0.5);">${data.label}</div>
                </div>
            `;
    }

    // Public API for adding data
    addDataPoint(dataset, label, value) {
      const data = this.datasets.get(dataset) || { labels: [], values: [] };
      data.labels.push(label);
      data.values.push(value);
      this.datasets.set(dataset, data);
      this.saveDatasets();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelDataVisualizer = new BaelDataVisualizer();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelDataVisualizer.initialize();
    });
  } else {
    window.BaelDataVisualizer.initialize();
  }

  console.log("📊 Bael Data Visualizer loaded");
})();
