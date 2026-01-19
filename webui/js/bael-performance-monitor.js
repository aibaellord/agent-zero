/**
 * BAEL Performance Monitor - Real-time Performance Tracking
 * Phase 7: Testing, Documentation & Performance
 *
 * Comprehensive performance monitoring with:
 * - Real-time FPS tracking
 * - Memory usage monitoring
 * - Network request analysis
 * - Long task detection
 * - Layout shift tracking
 * - Performance scoring
 * - Historical data visualization
 */

(function () {
  "use strict";

  class BaelPerformanceMonitor {
    constructor() {
      this.isMonitoring = false;
      this.metrics = {
        fps: [],
        memory: [],
        network: [],
        longTasks: [],
        layoutShifts: [],
        interactions: [],
      };
      this.config = {
        sampleRate: 1000,
        maxSamples: 300,
        fpsThreshold: 30,
        memoryThreshold: 100,
        longTaskThreshold: 50,
      };
      this.observers = {};
      this.frameCount = 0;
      this.lastFrameTime = 0;
      this.animationId = null;
      this.init();
    }

    init() {
      this.loadConfig();
      this.createUI();
      this.addStyles();
      this.bindEvents();
      this.setupObservers();
      console.log("📊 Bael Performance Monitor initialized");
    }

    loadConfig() {
      const saved = localStorage.getItem("bael_perf_config");
      if (saved) {
        try {
          Object.assign(this.config, JSON.parse(saved));
        } catch (e) {
          console.warn("Failed to load performance config");
        }
      }
    }

    saveConfig() {
      localStorage.setItem("bael_perf_config", JSON.stringify(this.config));
    }

    // Performance Observers
    setupObservers() {
      // Long Task Observer
      if ("PerformanceObserver" in window) {
        try {
          this.observers.longTask = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              this.metrics.longTasks.push({
                timestamp: Date.now(),
                duration: entry.duration,
                name: entry.name,
              });
              this.trimMetrics("longTasks");
            }
          });
          this.observers.longTask.observe({ entryTypes: ["longtask"] });
        } catch (e) {
          console.warn("Long task observer not supported");
        }

        // Layout Shift Observer
        try {
          this.observers.layoutShift = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                this.metrics.layoutShifts.push({
                  timestamp: Date.now(),
                  value: entry.value,
                  sources: entry.sources?.map((s) => s.node?.tagName) || [],
                });
                this.trimMetrics("layoutShifts");
              }
            }
          });
          this.observers.layoutShift.observe({ entryTypes: ["layout-shift"] });
        } catch (e) {
          console.warn("Layout shift observer not supported");
        }

        // Resource Timing
        try {
          this.observers.resource = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              this.metrics.network.push({
                timestamp: Date.now(),
                name: entry.name,
                type: entry.initiatorType,
                duration: entry.duration,
                size: entry.transferSize || 0,
              });
              this.trimMetrics("network");
            }
          });
          this.observers.resource.observe({ entryTypes: ["resource"] });
        } catch (e) {
          console.warn("Resource timing observer not supported");
        }

        // First Input Delay
        try {
          this.observers.fid = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              this.metrics.interactions.push({
                timestamp: Date.now(),
                name: entry.name,
                duration: entry.processingStart - entry.startTime,
              });
              this.trimMetrics("interactions");
            }
          });
          this.observers.fid.observe({ entryTypes: ["first-input"] });
        } catch (e) {
          console.warn("First input delay observer not supported");
        }
      }
    }

    // FPS Monitoring
    startFPSMonitoring() {
      this.frameCount = 0;
      this.lastFrameTime = performance.now();

      const measureFPS = (currentTime) => {
        this.frameCount++;

        if (currentTime - this.lastFrameTime >= 1000) {
          const fps = Math.round(
            (this.frameCount * 1000) / (currentTime - this.lastFrameTime),
          );
          this.metrics.fps.push({
            timestamp: Date.now(),
            value: fps,
          });
          this.trimMetrics("fps");
          this.frameCount = 0;
          this.lastFrameTime = currentTime;

          if (this.isMonitoring) {
            this.updateFPSDisplay(fps);
          }
        }

        if (this.isMonitoring) {
          this.animationId = requestAnimationFrame(measureFPS);
        }
      };

      this.animationId = requestAnimationFrame(measureFPS);
    }

    stopFPSMonitoring() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    }

    // Memory Monitoring
    startMemoryMonitoring() {
      if (!performance.memory) {
        console.warn("Memory API not available");
        return;
      }

      this.memoryInterval = setInterval(() => {
        const memory = performance.memory;
        this.metrics.memory.push({
          timestamp: Date.now(),
          usedJSHeapSize: memory.usedJSHeapSize / 1048576,
          totalJSHeapSize: memory.totalJSHeapSize / 1048576,
          jsHeapSizeLimit: memory.jsHeapSizeLimit / 1048576,
        });
        this.trimMetrics("memory");

        if (this.isMonitoring) {
          this.updateMemoryDisplay(memory);
        }
      }, this.config.sampleRate);
    }

    stopMemoryMonitoring() {
      if (this.memoryInterval) {
        clearInterval(this.memoryInterval);
        this.memoryInterval = null;
      }
    }

    trimMetrics(key) {
      while (this.metrics[key].length > this.config.maxSamples) {
        this.metrics[key].shift();
      }
    }

    // Calculate Performance Score
    calculateScore() {
      let score = 100;
      const weights = {
        fps: 30,
        memory: 25,
        longTasks: 25,
        layoutShifts: 20,
      };

      // FPS Score
      if (this.metrics.fps.length > 0) {
        const avgFPS =
          this.metrics.fps.reduce((a, b) => a + b.value, 0) /
          this.metrics.fps.length;
        const fpsScore = Math.min(100, (avgFPS / 60) * 100);
        score -= (100 - fpsScore) * (weights.fps / 100);
      }

      // Memory Score
      if (this.metrics.memory.length > 0 && performance.memory) {
        const lastMemory = this.metrics.memory[this.metrics.memory.length - 1];
        const usagePercent =
          (lastMemory.usedJSHeapSize / lastMemory.jsHeapSizeLimit) * 100;
        const memoryScore = Math.max(0, 100 - usagePercent);
        score -= (100 - memoryScore) * (weights.memory / 100);
      }

      // Long Tasks Score
      const recentLongTasks = this.metrics.longTasks.filter(
        (t) => t.timestamp > Date.now() - 60000,
      );
      const longTaskScore = Math.max(0, 100 - recentLongTasks.length * 10);
      score -= (100 - longTaskScore) * (weights.longTasks / 100);

      // Layout Shift Score
      const totalCLS = this.metrics.layoutShifts.reduce(
        (a, b) => a + b.value,
        0,
      );
      const clsScore = Math.max(0, 100 - totalCLS * 1000);
      score -= (100 - clsScore) * (weights.layoutShifts / 100);

      return Math.round(Math.max(0, Math.min(100, score)));
    }

    getScoreGrade(score) {
      if (score >= 90) return { grade: "A", color: "#4caf50" };
      if (score >= 75) return { grade: "B", color: "#8bc34a" };
      if (score >= 50) return { grade: "C", color: "#ff9800" };
      if (score >= 25) return { grade: "D", color: "#ff5722" };
      return { grade: "F", color: "#f44336" };
    }

    // UI Creation
    createUI() {
      // Mini Monitor (floating)
      this.miniMonitor = document.createElement("div");
      this.miniMonitor.id = "bael-perf-mini";
      this.miniMonitor.innerHTML = `
                <div class="perf-mini-content">
                    <div class="perf-fps">
                        <span class="label">FPS</span>
                        <span class="value">--</span>
                    </div>
                    <div class="perf-mem">
                        <span class="label">MEM</span>
                        <span class="value">--</span>
                    </div>
                    <div class="perf-score">
                        <span class="label">SCORE</span>
                        <span class="value">--</span>
                    </div>
                </div>
                <button class="expand-btn" title="Expand">📊</button>
            `;
      document.body.appendChild(this.miniMonitor);

      // Full Panel
      this.panel = document.createElement("div");
      this.panel.id = "bael-perf-panel";
      this.panel.innerHTML = `
                <div class="bael-perf-header">
                    <h3>📊 Performance Monitor</h3>
                    <div class="perf-controls">
                        <button class="start-btn" title="Start Monitoring">▶️ Start</button>
                        <button class="stop-btn" title="Stop Monitoring" disabled>⏹️ Stop</button>
                        <button class="clear-btn" title="Clear Data">🗑️ Clear</button>
                        <button class="close-btn" title="Close">✕</button>
                    </div>
                </div>

                <div class="bael-perf-tabs">
                    <button class="tab-btn active" data-tab="overview">Overview</button>
                    <button class="tab-btn" data-tab="fps">FPS</button>
                    <button class="tab-btn" data-tab="memory">Memory</button>
                    <button class="tab-btn" data-tab="network">Network</button>
                    <button class="tab-btn" data-tab="issues">Issues</button>
                </div>

                <div class="bael-perf-content">
                    <div class="tab-content active" id="overview-tab">
                        <div class="score-section">
                            <div class="score-circle">
                                <svg viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="45" class="score-bg"/>
                                    <circle cx="50" cy="50" r="45" class="score-fill"/>
                                </svg>
                                <div class="score-text">
                                    <span class="score-value">--</span>
                                    <span class="score-grade">-</span>
                                </div>
                            </div>
                            <div class="score-breakdown">
                                <div class="breakdown-item">
                                    <span class="breakdown-label">FPS</span>
                                    <div class="breakdown-bar"><div class="bar-fill" data-metric="fps"></div></div>
                                    <span class="breakdown-value" data-metric="fps">--</span>
                                </div>
                                <div class="breakdown-item">
                                    <span class="breakdown-label">Memory</span>
                                    <div class="breakdown-bar"><div class="bar-fill" data-metric="memory"></div></div>
                                    <span class="breakdown-value" data-metric="memory">--</span>
                                </div>
                                <div class="breakdown-item">
                                    <span class="breakdown-label">Stability</span>
                                    <div class="breakdown-bar"><div class="bar-fill" data-metric="stability"></div></div>
                                    <span class="breakdown-value" data-metric="stability">--</span>
                                </div>
                            </div>
                        </div>
                        <div class="quick-stats">
                            <div class="stat-card">
                                <span class="stat-value" id="avg-fps">--</span>
                                <span class="stat-label">Avg FPS</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-value" id="peak-memory">--</span>
                                <span class="stat-label">Peak Memory</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-value" id="long-tasks">--</span>
                                <span class="stat-label">Long Tasks</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-value" id="cls-score">--</span>
                                <span class="stat-label">CLS</span>
                            </div>
                        </div>
                    </div>

                    <div class="tab-content" id="fps-tab">
                        <div class="chart-container">
                            <canvas id="fps-chart"></canvas>
                        </div>
                        <div class="fps-stats">
                            <div class="stat-row">
                                <span>Current:</span>
                                <span id="current-fps">--</span>
                            </div>
                            <div class="stat-row">
                                <span>Average:</span>
                                <span id="average-fps">--</span>
                            </div>
                            <div class="stat-row">
                                <span>Min:</span>
                                <span id="min-fps">--</span>
                            </div>
                            <div class="stat-row">
                                <span>Max:</span>
                                <span id="max-fps">--</span>
                            </div>
                            <div class="stat-row">
                                <span>Drops (&lt;30):</span>
                                <span id="fps-drops">--</span>
                            </div>
                        </div>
                    </div>

                    <div class="tab-content" id="memory-tab">
                        <div class="chart-container">
                            <canvas id="memory-chart"></canvas>
                        </div>
                        <div class="memory-stats">
                            <div class="stat-row">
                                <span>Used Heap:</span>
                                <span id="used-heap">--</span>
                            </div>
                            <div class="stat-row">
                                <span>Total Heap:</span>
                                <span id="total-heap">--</span>
                            </div>
                            <div class="stat-row">
                                <span>Heap Limit:</span>
                                <span id="heap-limit">--</span>
                            </div>
                            <div class="stat-row">
                                <span>Usage:</span>
                                <span id="heap-usage">--</span>
                            </div>
                        </div>
                    </div>

                    <div class="tab-content" id="network-tab">
                        <div class="network-summary">
                            <div class="stat-card">
                                <span class="stat-value" id="total-requests">0</span>
                                <span class="stat-label">Requests</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-value" id="total-transferred">0 KB</span>
                                <span class="stat-label">Transferred</span>
                            </div>
                            <div class="stat-card">
                                <span class="stat-value" id="avg-latency">0 ms</span>
                                <span class="stat-label">Avg Latency</span>
                            </div>
                        </div>
                        <div class="network-list">
                            <div class="network-header">
                                <span>Resource</span>
                                <span>Type</span>
                                <span>Size</span>
                                <span>Duration</span>
                            </div>
                            <div class="network-items"></div>
                        </div>
                    </div>

                    <div class="tab-content" id="issues-tab">
                        <div class="issues-list">
                            <div class="no-issues">No performance issues detected</div>
                        </div>
                    </div>
                </div>
            `;
      document.body.appendChild(this.panel);

      // Initialize charts
      this.initCharts();
    }

    initCharts() {
      // FPS Chart
      this.fpsCanvas = this.panel.querySelector("#fps-chart");
      this.fpsCtx = this.fpsCanvas.getContext("2d");

      // Memory Chart
      this.memoryCanvas = this.panel.querySelector("#memory-chart");
      this.memoryCtx = this.memoryCanvas.getContext("2d");

      // Resize canvases
      this.resizeCharts();
      window.addEventListener("resize", () => this.resizeCharts());
    }

    resizeCharts() {
      [this.fpsCanvas, this.memoryCanvas].forEach((canvas) => {
        if (canvas) {
          const container = canvas.parentElement;
          canvas.width = container.clientWidth;
          canvas.height = container.clientHeight;
        }
      });
    }

    addStyles() {
      const style = document.createElement("style");
      style.textContent = `
                /* Mini Monitor */
                #bael-perf-mini {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    background: rgba(20, 20, 20, 0.9);
                    backdrop-filter: blur(10px);
                    border: 1px solid var(--bael-border, #333);
                    border-radius: 8px;
                    padding: 8px 12px;
                    z-index: 99998;
                    display: none;
                    align-items: center;
                    gap: 12px;
                    font-size: 11px;
                    font-family: monospace;
                }

                #bael-perf-mini.visible {
                    display: flex;
                }

                .perf-mini-content {
                    display: flex;
                    gap: 16px;
                }

                .perf-mini-content > div {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .perf-mini-content .label {
                    color: var(--bael-text-dim, #888);
                    font-size: 9px;
                }

                .perf-mini-content .value {
                    color: var(--bael-text, #fff);
                    font-weight: bold;
                }

                .perf-fps .value { color: #4caf50; }
                .perf-mem .value { color: #2196f3; }
                .perf-score .value { color: #ff9800; }

                #bael-perf-mini .expand-btn {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    font-size: 14px;
                    padding: 4px;
                }

                /* Full Panel */
                #bael-perf-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.9);
                    width: 800px;
                    max-width: 95vw;
                    max-height: 85vh;
                    background: var(--bael-surface, #1e1e1e);
                    border: 1px solid var(--bael-border, #333);
                    border-radius: 12px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                    z-index: 100001;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    opacity: 0;
                    transition: opacity 0.3s, transform 0.3s;
                }

                #bael-perf-panel.visible {
                    display: flex;
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }

                .bael-perf-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background: var(--bael-bg-dark, #151515);
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .bael-perf-header h3 {
                    margin: 0;
                    font-size: 16px;
                    color: var(--bael-text, #fff);
                }

                .perf-controls {
                    display: flex;
                    gap: 8px;
                }

                .perf-controls button {
                    background: var(--bael-surface, #252525);
                    border: 1px solid var(--bael-border, #333);
                    color: var(--bael-text, #fff);
                    padding: 6px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.2s;
                }

                .perf-controls button:hover:not(:disabled) {
                    background: var(--bael-primary, #646cff);
                }

                .perf-controls button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .perf-controls .close-btn {
                    background: transparent;
                    border: none;
                }

                .bael-perf-tabs {
                    display: flex;
                    gap: 0;
                    border-bottom: 1px solid var(--bael-border, #333);
                    background: var(--bael-bg-dark, #151515);
                }

                .bael-perf-tabs .tab-btn {
                    background: transparent;
                    border: none;
                    color: var(--bael-text-dim, #888);
                    padding: 12px 20px;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s;
                    border-bottom: 2px solid transparent;
                }

                .bael-perf-tabs .tab-btn:hover {
                    color: var(--bael-text, #fff);
                }

                .bael-perf-tabs .tab-btn.active {
                    color: var(--bael-primary, #646cff);
                    border-bottom-color: var(--bael-primary, #646cff);
                }

                .bael-perf-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                }

                .tab-content {
                    display: none;
                }

                .tab-content.active {
                    display: block;
                }

                /* Score Section */
                .score-section {
                    display: flex;
                    gap: 40px;
                    margin-bottom: 24px;
                }

                .score-circle {
                    position: relative;
                    width: 150px;
                    height: 150px;
                }

                .score-circle svg {
                    transform: rotate(-90deg);
                }

                .score-circle .score-bg {
                    fill: none;
                    stroke: var(--bael-bg-dark, #151515);
                    stroke-width: 8;
                }

                .score-circle .score-fill {
                    fill: none;
                    stroke: var(--bael-primary, #646cff);
                    stroke-width: 8;
                    stroke-linecap: round;
                    stroke-dasharray: 283;
                    stroke-dashoffset: 283;
                    transition: stroke-dashoffset 0.5s, stroke 0.3s;
                }

                .score-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    text-align: center;
                }

                .score-text .score-value {
                    display: block;
                    font-size: 36px;
                    font-weight: bold;
                    color: var(--bael-text, #fff);
                }

                .score-text .score-grade {
                    display: block;
                    font-size: 14px;
                    color: var(--bael-primary, #646cff);
                }

                .score-breakdown {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    justify-content: center;
                }

                .breakdown-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .breakdown-label {
                    width: 80px;
                    color: var(--bael-text-dim, #888);
                    font-size: 13px;
                }

                .breakdown-bar {
                    flex: 1;
                    height: 8px;
                    background: var(--bael-bg-dark, #151515);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .breakdown-bar .bar-fill {
                    height: 100%;
                    background: var(--bael-primary, #646cff);
                    border-radius: 4px;
                    width: 0;
                    transition: width 0.3s, background 0.3s;
                }

                .breakdown-value {
                    width: 50px;
                    text-align: right;
                    color: var(--bael-text, #fff);
                    font-size: 13px;
                    font-weight: 600;
                }

                /* Quick Stats */
                .quick-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                }

                .stat-card {
                    background: var(--bael-bg-dark, #151515);
                    padding: 16px;
                    border-radius: 8px;
                    text-align: center;
                }

                .stat-card .stat-value {
                    display: block;
                    font-size: 24px;
                    font-weight: bold;
                    color: var(--bael-text, #fff);
                    margin-bottom: 4px;
                }

                .stat-card .stat-label {
                    font-size: 11px;
                    color: var(--bael-text-dim, #888);
                    text-transform: uppercase;
                }

                /* Chart Container */
                .chart-container {
                    background: var(--bael-bg-dark, #151515);
                    border-radius: 8px;
                    height: 200px;
                    margin-bottom: 16px;
                }

                .chart-container canvas {
                    width: 100%;
                    height: 100%;
                }

                /* Stats */
                .fps-stats, .memory-stats {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }

                .stat-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 12px;
                    background: var(--bael-bg-dark, #151515);
                    border-radius: 6px;
                    font-size: 13px;
                }

                .stat-row span:first-child {
                    color: var(--bael-text-dim, #888);
                }

                .stat-row span:last-child {
                    color: var(--bael-text, #fff);
                    font-weight: 600;
                }

                /* Network */
                .network-summary {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    margin-bottom: 16px;
                }

                .network-list {
                    background: var(--bael-bg-dark, #151515);
                    border-radius: 8px;
                    overflow: hidden;
                }

                .network-header {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr;
                    gap: 8px;
                    padding: 12px;
                    background: rgba(0,0,0,0.3);
                    font-size: 11px;
                    color: var(--bael-text-dim, #888);
                    text-transform: uppercase;
                }

                .network-items {
                    max-height: 200px;
                    overflow-y: auto;
                }

                .network-item {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr;
                    gap: 8px;
                    padding: 10px 12px;
                    font-size: 12px;
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .network-item:last-child {
                    border-bottom: none;
                }

                .network-item span {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .network-item span:first-child {
                    color: var(--bael-text, #fff);
                }

                /* Issues */
                .issues-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .no-issues {
                    text-align: center;
                    color: var(--bael-text-dim, #888);
                    padding: 40px;
                }

                .issue-item {
                    display: flex;
                    gap: 12px;
                    padding: 12px;
                    background: var(--bael-bg-dark, #151515);
                    border-radius: 8px;
                    border-left: 3px solid #f44336;
                }

                .issue-item.warning {
                    border-left-color: #ff9800;
                }

                .issue-icon {
                    font-size: 20px;
                }

                .issue-info {
                    flex: 1;
                }

                .issue-title {
                    color: var(--bael-text, #fff);
                    font-weight: 600;
                    margin-bottom: 4px;
                }

                .issue-desc {
                    color: var(--bael-text-dim, #888);
                    font-size: 12px;
                }
            `;
      document.head.appendChild(style);
    }

    bindEvents() {
      // Tab switching
      this.panel.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.panel
            .querySelectorAll(".tab-btn")
            .forEach((b) => b.classList.remove("active"));
          this.panel
            .querySelectorAll(".tab-content")
            .forEach((c) => c.classList.remove("active"));
          btn.classList.add("active");
          const tabId = btn.dataset.tab + "-tab";
          this.panel.querySelector(`#${tabId}`).classList.add("active");
        });
      });

      // Start button
      this.panel.querySelector(".start-btn").addEventListener("click", () => {
        this.startMonitoring();
      });

      // Stop button
      this.panel.querySelector(".stop-btn").addEventListener("click", () => {
        this.stopMonitoring();
      });

      // Clear button
      this.panel.querySelector(".clear-btn").addEventListener("click", () => {
        this.clearData();
      });

      // Close button
      this.panel.querySelector(".close-btn").addEventListener("click", () => {
        this.closePanel();
      });

      // Expand from mini
      this.miniMonitor
        .querySelector(".expand-btn")
        .addEventListener("click", () => {
          this.openPanel();
        });

      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "P") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    // Monitoring Control
    startMonitoring() {
      if (this.isMonitoring) return;

      this.isMonitoring = true;
      this.startFPSMonitoring();
      this.startMemoryMonitoring();

      this.panel.querySelector(".start-btn").disabled = true;
      this.panel.querySelector(".stop-btn").disabled = false;

      this.miniMonitor.classList.add("visible");

      // Update loop
      this.updateInterval = setInterval(() => {
        this.updateOverview();
        this.updateCharts();
        this.updateNetworkTab();
        this.checkIssues();
      }, 1000);
    }

    stopMonitoring() {
      if (!this.isMonitoring) return;

      this.isMonitoring = false;
      this.stopFPSMonitoring();
      this.stopMemoryMonitoring();

      this.panel.querySelector(".start-btn").disabled = false;
      this.panel.querySelector(".stop-btn").disabled = true;

      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
    }

    clearData() {
      this.metrics = {
        fps: [],
        memory: [],
        network: [],
        longTasks: [],
        layoutShifts: [],
        interactions: [],
      };
      this.updateOverview();
      this.updateCharts();
      this.updateNetworkTab();
      this.panel.querySelector(".issues-list").innerHTML =
        '<div class="no-issues">No performance issues detected</div>';
    }

    // Display Updates
    updateFPSDisplay(fps) {
      this.miniMonitor.querySelector(".perf-fps .value").textContent = fps;
      const fpsEl = this.miniMonitor.querySelector(".perf-fps .value");
      fpsEl.style.color =
        fps >= 50 ? "#4caf50" : fps >= 30 ? "#ff9800" : "#f44336";
    }

    updateMemoryDisplay(memory) {
      const usedMB = (memory.usedJSHeapSize / 1048576).toFixed(0);
      this.miniMonitor.querySelector(".perf-mem .value").textContent =
        `${usedMB}MB`;
    }

    updateOverview() {
      const score = this.calculateScore();
      const { grade, color } = this.getScoreGrade(score);

      // Update score circle
      this.panel.querySelector(".score-value").textContent = score;
      this.panel.querySelector(".score-grade").textContent = grade;
      this.panel.querySelector(".score-grade").style.color = color;

      const circle = this.panel.querySelector(".score-fill");
      const offset = 283 - (283 * score) / 100;
      circle.style.strokeDashoffset = offset;
      circle.style.stroke = color;

      // Update mini score
      this.miniMonitor.querySelector(".perf-score .value").textContent = score;
      this.miniMonitor.querySelector(".perf-score .value").style.color = color;

      // Update breakdown bars
      if (this.metrics.fps.length > 0) {
        const avgFPS =
          this.metrics.fps.reduce((a, b) => a + b.value, 0) /
          this.metrics.fps.length;
        const fpsPercent = Math.min(100, (avgFPS / 60) * 100);
        this.panel.querySelector('.bar-fill[data-metric="fps"]').style.width =
          `${fpsPercent}%`;
        this.panel.querySelector(
          '.breakdown-value[data-metric="fps"]',
        ).textContent = `${avgFPS.toFixed(0)} fps`;
      }

      if (this.metrics.memory.length > 0) {
        const lastMem = this.metrics.memory[this.metrics.memory.length - 1];
        const memPercent =
          100 - (lastMem.usedJSHeapSize / lastMem.jsHeapSizeLimit) * 100;
        this.panel.querySelector(
          '.bar-fill[data-metric="memory"]',
        ).style.width = `${memPercent}%`;
        this.panel.querySelector(
          '.breakdown-value[data-metric="memory"]',
        ).textContent = `${lastMem.usedJSHeapSize.toFixed(0)}MB`;
      }

      const stability = Math.max(0, 100 - this.metrics.longTasks.length * 5);
      this.panel.querySelector(
        '.bar-fill[data-metric="stability"]',
      ).style.width = `${stability}%`;
      this.panel.querySelector(
        '.breakdown-value[data-metric="stability"]',
      ).textContent = `${stability}%`;

      // Quick stats
      if (this.metrics.fps.length > 0) {
        const avgFPS =
          this.metrics.fps.reduce((a, b) => a + b.value, 0) /
          this.metrics.fps.length;
        this.panel.querySelector("#avg-fps").textContent = avgFPS.toFixed(0);
      }

      if (this.metrics.memory.length > 0) {
        const peak = Math.max(
          ...this.metrics.memory.map((m) => m.usedJSHeapSize),
        );
        this.panel.querySelector("#peak-memory").textContent =
          `${peak.toFixed(0)}MB`;
      }

      this.panel.querySelector("#long-tasks").textContent =
        this.metrics.longTasks.length;

      const cls = this.metrics.layoutShifts.reduce((a, b) => a + b.value, 0);
      this.panel.querySelector("#cls-score").textContent = cls.toFixed(3);
    }

    updateCharts() {
      this.drawFPSChart();
      this.drawMemoryChart();
      this.updateFPSStats();
      this.updateMemoryStats();
    }

    drawFPSChart() {
      const ctx = this.fpsCtx;
      const canvas = this.fpsCanvas;
      if (!ctx || !canvas.width) return;

      const data = this.metrics.fps;
      if (data.length < 2) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const padding = 20;
      const chartWidth = canvas.width - padding * 2;
      const chartHeight = canvas.height - padding * 2;

      // Draw grid
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
      }

      // Draw line
      ctx.strokeStyle = "#4caf50";
      ctx.lineWidth = 2;
      ctx.beginPath();

      const step = chartWidth / (data.length - 1);
      data.forEach((point, i) => {
        const x = padding + step * i;
        const y = padding + chartHeight - (point.value / 60) * chartHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.stroke();

      // Fill area
      ctx.lineTo(padding + chartWidth, padding + chartHeight);
      ctx.lineTo(padding, padding + chartHeight);
      ctx.closePath();
      ctx.fillStyle = "rgba(76, 175, 80, 0.2)";
      ctx.fill();
    }

    drawMemoryChart() {
      const ctx = this.memoryCtx;
      const canvas = this.memoryCanvas;
      if (!ctx || !canvas.width) return;

      const data = this.metrics.memory;
      if (data.length < 2) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const padding = 20;
      const chartWidth = canvas.width - padding * 2;
      const chartHeight = canvas.height - padding * 2;
      const maxMem = Math.max(...data.map((d) => d.usedJSHeapSize), 100);

      // Draw grid
      ctx.strokeStyle = "rgba(255,255,255,0.1)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padding + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
      }

      // Draw line
      ctx.strokeStyle = "#2196f3";
      ctx.lineWidth = 2;
      ctx.beginPath();

      const step = chartWidth / (data.length - 1);
      data.forEach((point, i) => {
        const x = padding + step * i;
        const y =
          padding + chartHeight - (point.usedJSHeapSize / maxMem) * chartHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.stroke();

      // Fill area
      ctx.lineTo(padding + chartWidth, padding + chartHeight);
      ctx.lineTo(padding, padding + chartHeight);
      ctx.closePath();
      ctx.fillStyle = "rgba(33, 150, 243, 0.2)";
      ctx.fill();
    }

    updateFPSStats() {
      const data = this.metrics.fps;
      if (data.length === 0) return;

      const values = data.map((d) => d.value);
      this.panel.querySelector("#current-fps").textContent =
        values[values.length - 1];
      this.panel.querySelector("#average-fps").textContent = (
        values.reduce((a, b) => a + b, 0) / values.length
      ).toFixed(1);
      this.panel.querySelector("#min-fps").textContent = Math.min(...values);
      this.panel.querySelector("#max-fps").textContent = Math.max(...values);
      this.panel.querySelector("#fps-drops").textContent = values.filter(
        (v) => v < 30,
      ).length;
    }

    updateMemoryStats() {
      const data = this.metrics.memory;
      if (data.length === 0) return;

      const last = data[data.length - 1];
      this.panel.querySelector("#used-heap").textContent =
        `${last.usedJSHeapSize.toFixed(1)} MB`;
      this.panel.querySelector("#total-heap").textContent =
        `${last.totalJSHeapSize.toFixed(1)} MB`;
      this.panel.querySelector("#heap-limit").textContent =
        `${last.jsHeapSizeLimit.toFixed(1)} MB`;
      this.panel.querySelector("#heap-usage").textContent =
        `${((last.usedJSHeapSize / last.jsHeapSizeLimit) * 100).toFixed(1)}%`;
    }

    updateNetworkTab() {
      const data = this.metrics.network;

      this.panel.querySelector("#total-requests").textContent = data.length;

      const totalSize = data.reduce((a, b) => a + b.size, 0);
      this.panel.querySelector("#total-transferred").textContent =
        `${(totalSize / 1024).toFixed(1)} KB`;

      if (data.length > 0) {
        const avgLatency =
          data.reduce((a, b) => a + b.duration, 0) / data.length;
        this.panel.querySelector("#avg-latency").textContent =
          `${avgLatency.toFixed(0)} ms`;
      }

      const list = this.panel.querySelector(".network-items");
      list.innerHTML = data
        .slice(-50)
        .reverse()
        .map(
          (item) => `
                <div class="network-item">
                    <span title="${item.name}">${item.name.split("/").pop()}</span>
                    <span>${item.type}</span>
                    <span>${(item.size / 1024).toFixed(1)} KB</span>
                    <span>${item.duration.toFixed(0)} ms</span>
                </div>
            `,
        )
        .join("");
    }

    checkIssues() {
      const issues = [];

      // Check FPS
      if (this.metrics.fps.length > 0) {
        const avgFPS =
          this.metrics.fps.reduce((a, b) => a + b.value, 0) /
          this.metrics.fps.length;
        if (avgFPS < 30) {
          issues.push({
            type: "error",
            title: "Low Frame Rate",
            desc: `Average FPS is ${avgFPS.toFixed(0)}, which may cause janky animations`,
          });
        } else if (avgFPS < 50) {
          issues.push({
            type: "warning",
            title: "Suboptimal Frame Rate",
            desc: `Average FPS is ${avgFPS.toFixed(0)}, consider optimizing animations`,
          });
        }
      }

      // Check memory
      if (this.metrics.memory.length > 0) {
        const last = this.metrics.memory[this.metrics.memory.length - 1];
        const usage = (last.usedJSHeapSize / last.jsHeapSizeLimit) * 100;
        if (usage > 80) {
          issues.push({
            type: "error",
            title: "High Memory Usage",
            desc: `Memory usage is at ${usage.toFixed(0)}%, risk of out-of-memory errors`,
          });
        } else if (usage > 60) {
          issues.push({
            type: "warning",
            title: "Elevated Memory Usage",
            desc: `Memory usage is at ${usage.toFixed(0)}%`,
          });
        }
      }

      // Check long tasks
      const recentLongTasks = this.metrics.longTasks.filter(
        (t) => t.timestamp > Date.now() - 60000,
      );
      if (recentLongTasks.length > 5) {
        issues.push({
          type: "error",
          title: "Too Many Long Tasks",
          desc: `${recentLongTasks.length} long tasks in the last minute, causing UI unresponsiveness`,
        });
      }

      // Check CLS
      const cls = this.metrics.layoutShifts.reduce((a, b) => a + b.value, 0);
      if (cls > 0.25) {
        issues.push({
          type: "error",
          title: "Poor Cumulative Layout Shift",
          desc: `CLS score is ${cls.toFixed(3)}, content is shifting unexpectedly`,
        });
      } else if (cls > 0.1) {
        issues.push({
          type: "warning",
          title: "Moderate Layout Shift",
          desc: `CLS score is ${cls.toFixed(3)}, some layout shifts detected`,
        });
      }

      // Update issues list
      const list = this.panel.querySelector(".issues-list");
      if (issues.length === 0) {
        list.innerHTML =
          '<div class="no-issues">No performance issues detected ✓</div>';
      } else {
        list.innerHTML = issues
          .map(
            (issue) => `
                    <div class="issue-item ${issue.type}">
                        <span class="issue-icon">${issue.type === "error" ? "❌" : "⚠️"}</span>
                        <div class="issue-info">
                            <div class="issue-title">${issue.title}</div>
                            <div class="issue-desc">${issue.desc}</div>
                        </div>
                    </div>
                `,
          )
          .join("");
      }
    }

    // Public API
    openPanel() {
      this.panel.classList.add("visible");
      this.resizeCharts();
    }

    closePanel() {
      this.panel.classList.remove("visible");
    }

    toggle() {
      if (this.panel.classList.contains("visible")) {
        this.closePanel();
      } else {
        this.openPanel();
      }
    }

    showMini() {
      this.miniMonitor.classList.add("visible");
    }

    hideMini() {
      this.miniMonitor.classList.remove("visible");
    }
  }

  // Initialize
  window.BaelPerformanceMonitor = new BaelPerformanceMonitor();
})();
