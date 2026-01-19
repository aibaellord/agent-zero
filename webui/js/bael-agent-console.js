/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   ██████╗ ██████╗ ███╗   ██╗███████╗ ██████╗ ██╗     ███████╗            █
 * █  ██╔════╝██╔═══██╗████╗  ██║██╔════╝██╔═══██╗██║     ██╔════╝            █
 * █  ██║     ██║   ██║██╔██╗ ██║███████╗██║   ██║██║     █████╗              █
 * █  ██║     ██║   ██║██║╚██╗██║╚════██║██║   ██║██║     ██╔══╝              █
 * █  ╚██████╗╚██████╔╝██║ ╚████║███████║╚██████╔╝███████╗███████╗            █
 * █   ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚══════╝╚══════╝            █
 * █                                                                          █
 * █   BAEL AGENT CONSOLE - Real-time Agent Monitoring & Debugging           █
 * █   Health metrics, context tracking, tool execution, performance          █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelAgentConsole {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;

      // Real-time data
      this.health = { status: "unknown", uptime: 0 };
      this.metrics = {
        tokens: { used: 0, limit: 0 },
        latency: { avg: 0, p95: 0 },
        calls: { total: 0, errors: 0 },
        cache: { hits: 0, misses: 0 },
      };
      this.context = { used: 0, max: 0, messages: 0 };
      this.tools = [];
      this.extensions = [];
      this.logs = [];

      // Update interval
      this.updateInterval = null;
      this.updateFrequency = 2000;
    }

    async initialize() {
      console.log("🖥️ Bael Agent Console initializing...");

      this.createContainer();
      this.setupShortcuts();

      this.initialized = true;
      console.log("✅ BAEL AGENT CONSOLE READY");

      return this;
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-agent-console";
      this.container.className = "bael-console";
      this.container.style.cssText = `
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 10001;
                background: var(--bg-primary, #0a0a0f);
                color: var(--text-primary, #e0e0e0);
                font-family: 'SF Mono', 'Fira Code', monospace;
                font-size: 13px;
            `;

      this.container.innerHTML = this.getTemplate();
      document.body.appendChild(this.container);
      this.bindEvents();
    }

    getTemplate() {
      return `
                <div class="console-layout">
                    <div class="console-header">
                        <div class="header-left">
                            <h1>🖥️ Agent Console</h1>
                            <div class="status-indicator" id="agent-status">
                                <span class="status-dot"></span>
                                <span class="status-text">Connecting...</span>
                            </div>
                        </div>
                        <div class="header-controls">
                            <button class="console-btn" id="console-refresh" title="Refresh">⟳</button>
                            <button class="console-btn" id="console-pause" title="Pause Updates">⏸</button>
                            <button class="console-btn" id="console-clear" title="Clear Logs">🗑️</button>
                            <button class="console-btn btn-close" id="console-close" title="Close">✕</button>
                        </div>
                    </div>

                    <div class="console-grid">
                        <!-- Health Panel -->
                        <div class="console-panel" id="panel-health">
                            <div class="panel-header">
                                <span class="panel-icon">💓</span>
                                <span class="panel-title">Health</span>
                            </div>
                            <div class="panel-content">
                                <div class="metric-row">
                                    <span class="metric-label">Status</span>
                                    <span class="metric-value" id="health-status">-</span>
                                </div>
                                <div class="metric-row">
                                    <span class="metric-label">Uptime</span>
                                    <span class="metric-value" id="health-uptime">-</span>
                                </div>
                                <div class="metric-row">
                                    <span class="metric-label">Memory</span>
                                    <span class="metric-value" id="health-memory">-</span>
                                </div>
                                <div class="metric-row">
                                    <span class="metric-label">CPU</span>
                                    <span class="metric-value" id="health-cpu">-</span>
                                </div>
                            </div>
                        </div>

                        <!-- Context Window Panel -->
                        <div class="console-panel" id="panel-context">
                            <div class="panel-header">
                                <span class="panel-icon">📊</span>
                                <span class="panel-title">Context Window</span>
                            </div>
                            <div class="panel-content">
                                <div class="context-bar">
                                    <div class="context-fill" id="context-fill"></div>
                                </div>
                                <div class="context-stats">
                                    <span id="context-used">0</span> / <span id="context-max">0</span> tokens
                                </div>
                                <div class="metric-row">
                                    <span class="metric-label">Messages</span>
                                    <span class="metric-value" id="context-messages">0</span>
                                </div>
                                <div class="metric-row">
                                    <span class="metric-label">System</span>
                                    <span class="metric-value" id="context-system">0</span>
                                </div>
                            </div>
                        </div>

                        <!-- Performance Panel -->
                        <div class="console-panel" id="panel-performance">
                            <div class="panel-header">
                                <span class="panel-icon">⚡</span>
                                <span class="panel-title">Performance</span>
                            </div>
                            <div class="panel-content">
                                <div class="metric-row">
                                    <span class="metric-label">Avg Latency</span>
                                    <span class="metric-value" id="perf-latency">- ms</span>
                                </div>
                                <div class="metric-row">
                                    <span class="metric-label">API Calls</span>
                                    <span class="metric-value" id="perf-calls">0</span>
                                </div>
                                <div class="metric-row">
                                    <span class="metric-label">Cache Hits</span>
                                    <span class="metric-value" id="perf-cache">0%</span>
                                </div>
                                <div class="metric-row">
                                    <span class="metric-label">Error Rate</span>
                                    <span class="metric-value" id="perf-errors">0%</span>
                                </div>
                            </div>
                        </div>

                        <!-- Tools Panel -->
                        <div class="console-panel" id="panel-tools">
                            <div class="panel-header">
                                <span class="panel-icon">🔧</span>
                                <span class="panel-title">Active Tools</span>
                            </div>
                            <div class="panel-content scrollable" id="tools-list">
                                <div class="empty-list">No tools active</div>
                            </div>
                        </div>

                        <!-- Extensions Panel -->
                        <div class="console-panel" id="panel-extensions">
                            <div class="panel-header">
                                <span class="panel-icon">🔌</span>
                                <span class="panel-title">Extensions</span>
                            </div>
                            <div class="panel-content scrollable" id="extensions-list">
                                <div class="empty-list">Loading...</div>
                            </div>
                        </div>

                        <!-- Heisenberg Panel -->
                        <div class="console-panel wide" id="panel-heisenberg">
                            <div class="panel-header">
                                <span class="panel-icon">⚛️</span>
                                <span class="panel-title">Heisenberg Singularity</span>
                            </div>
                            <div class="panel-content">
                                <div class="heisenberg-grid">
                                    <div class="heisenberg-stat">
                                        <span class="stat-value" id="heis-quantum">-</span>
                                        <span class="stat-label">Quantum States</span>
                                    </div>
                                    <div class="heisenberg-stat">
                                        <span class="stat-value" id="heis-reasoning">-</span>
                                        <span class="stat-label">Reasoning Depth</span>
                                    </div>
                                    <div class="heisenberg-stat">
                                        <span class="stat-value" id="heis-patterns">-</span>
                                        <span class="stat-label">Patterns Detected</span>
                                    </div>
                                    <div class="heisenberg-stat">
                                        <span class="stat-value" id="heis-confidence">-</span>
                                        <span class="stat-label">Confidence</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Log Panel -->
                    <div class="console-logs">
                        <div class="logs-header">
                            <span>📜 Event Log</span>
                            <div class="log-filters">
                                <button class="filter-btn active" data-filter="all">All</button>
                                <button class="filter-btn" data-filter="info">Info</button>
                                <button class="filter-btn" data-filter="tool">Tools</button>
                                <button class="filter-btn" data-filter="error">Errors</button>
                            </div>
                        </div>
                        <div class="logs-content" id="logs-content">
                            <div class="log-entry info">
                                <span class="log-time">${this.formatTime()}</span>
                                <span class="log-type">INFO</span>
                                <span class="log-message">Agent Console initialized</span>
                            </div>
                        </div>
                    </div>
                </div>

                <style>
                    .console-layout {
                        display: flex;
                        flex-direction: column;
                        height: 100%;
                    }

                    .console-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 12px 20px;
                        background: #12121a;
                        border-bottom: 1px solid #2a2a3a;
                    }

                    .console-header h1 {
                        margin: 0;
                        font-size: 18px;
                        font-weight: 600;
                    }

                    .header-left {
                        display: flex;
                        align-items: center;
                        gap: 24px;
                    }

                    .status-indicator {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }

                    .status-dot {
                        width: 10px;
                        height: 10px;
                        border-radius: 50%;
                        background: #666;
                        animation: pulse 2s infinite;
                    }

                    .status-indicator.online .status-dot { background: #22c55e; }
                    .status-indicator.offline .status-dot { background: #ef4444; }
                    .status-indicator.busy .status-dot { background: #eab308; }

                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }

                    .header-controls {
                        display: flex;
                        gap: 8px;
                    }

                    .console-btn {
                        padding: 8px 12px;
                        border: none;
                        border-radius: 6px;
                        background: #1a1a2e;
                        color: #e0e0e0;
                        cursor: pointer;
                        font-size: 14px;
                        transition: all 0.2s;
                    }

                    .console-btn:hover { background: #252538; }
                    .console-btn.btn-close:hover { background: #ef4444; }

                    .console-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 16px;
                        padding: 16px 20px;
                        flex: 1;
                        overflow-y: auto;
                    }

                    .console-panel {
                        background: #12121a;
                        border-radius: 8px;
                        border: 1px solid #2a2a3a;
                        overflow: hidden;
                    }

                    .console-panel.wide {
                        grid-column: span 3;
                    }

                    .panel-header {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 12px 16px;
                        background: #1a1a2e;
                        border-bottom: 1px solid #2a2a3a;
                        font-weight: 600;
                    }

                    .panel-content {
                        padding: 16px;
                    }

                    .panel-content.scrollable {
                        max-height: 200px;
                        overflow-y: auto;
                    }

                    .metric-row {
                        display: flex;
                        justify-content: space-between;
                        padding: 8px 0;
                        border-bottom: 1px solid #1a1a2e;
                    }

                    .metric-row:last-child { border-bottom: none; }

                    .metric-label { opacity: 0.7; }

                    .metric-value {
                        font-weight: 600;
                        color: #6366f1;
                    }

                    .context-bar {
                        height: 8px;
                        background: #1a1a2e;
                        border-radius: 4px;
                        overflow: hidden;
                        margin-bottom: 8px;
                    }

                    .context-fill {
                        height: 100%;
                        background: linear-gradient(90deg, #22c55e, #6366f1, #ef4444);
                        background-size: 200% 100%;
                        transition: width 0.3s;
                        width: 0%;
                    }

                    .context-stats {
                        text-align: center;
                        margin-bottom: 16px;
                        font-size: 14px;
                    }

                    .heisenberg-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 24px;
                    }

                    .heisenberg-stat {
                        text-align: center;
                    }

                    .heisenberg-stat .stat-value {
                        font-size: 28px;
                        font-weight: 700;
                        color: #a855f7;
                        display: block;
                    }

                    .heisenberg-stat .stat-label {
                        font-size: 11px;
                        text-transform: uppercase;
                        opacity: 0.6;
                    }

                    .tool-item, .extension-item {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        padding: 8px;
                        border-radius: 4px;
                        margin-bottom: 4px;
                        background: #1a1a2e;
                    }

                    .tool-status {
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        background: #22c55e;
                    }

                    .tool-status.inactive { background: #666; }
                    .tool-status.running { background: #eab308; }

                    .empty-list {
                        text-align: center;
                        opacity: 0.5;
                        padding: 20px;
                    }

                    .console-logs {
                        background: #12121a;
                        border-top: 1px solid #2a2a3a;
                        height: 200px;
                        display: flex;
                        flex-direction: column;
                    }

                    .logs-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 8px 16px;
                        background: #1a1a2e;
                        border-bottom: 1px solid #2a2a3a;
                    }

                    .log-filters {
                        display: flex;
                        gap: 4px;
                    }

                    .filter-btn {
                        padding: 4px 12px;
                        border: none;
                        border-radius: 4px;
                        background: transparent;
                        color: #888;
                        cursor: pointer;
                        font-size: 12px;
                    }

                    .filter-btn:hover { color: #e0e0e0; }
                    .filter-btn.active { background: #6366f1; color: white; }

                    .logs-content {
                        flex: 1;
                        overflow-y: auto;
                        padding: 8px 16px;
                        font-family: 'SF Mono', 'Fira Code', monospace;
                        font-size: 12px;
                    }

                    .log-entry {
                        display: flex;
                        gap: 12px;
                        padding: 4px 0;
                        border-bottom: 1px solid #1a1a2e;
                    }

                    .log-time {
                        color: #666;
                        flex-shrink: 0;
                    }

                    .log-type {
                        width: 50px;
                        font-weight: 600;
                        flex-shrink: 0;
                    }

                    .log-entry.info .log-type { color: #60a5fa; }
                    .log-entry.success .log-type { color: #22c55e; }
                    .log-entry.warning .log-type { color: #eab308; }
                    .log-entry.error .log-type { color: #ef4444; }
                    .log-entry.tool .log-type { color: #a855f7; }

                    .log-message {
                        flex: 1;
                        word-break: break-word;
                    }
                </style>
            `;
    }

    bindEvents() {
      this.container
        .querySelector("#console-close")
        .addEventListener("click", () => this.hide());
      this.container
        .querySelector("#console-refresh")
        .addEventListener("click", () => this.refresh());
      this.container
        .querySelector("#console-clear")
        .addEventListener("click", () => this.clearLogs());

      const pauseBtn = this.container.querySelector("#console-pause");
      pauseBtn.addEventListener("click", () => {
        if (this.updateInterval) {
          this.stopUpdates();
          pauseBtn.textContent = "▶";
        } else {
          this.startUpdates();
          pauseBtn.textContent = "⏸";
        }
      });

      // Log filters
      this.container.querySelectorAll(".filter-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.container
            .querySelectorAll(".filter-btn")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          this.filterLogs(btn.dataset.filter);
        });
      });
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
          e.preventDefault();
          this.toggle();
        }

        if (this.visible && e.key === "Escape") {
          this.hide();
        }
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // DATA FETCHING
    // ═══════════════════════════════════════════════════════════════════════

    async refresh() {
      await Promise.all([
        this.fetchHealth(),
        this.fetchContext(),
        this.fetchPerformance(),
        this.fetchHeisenberg(),
      ]);
    }

    async fetchHealth() {
      try {
        const result = await window.BaelHeisenberg?.health?.();
        if (result && !result.error) {
          this.health = result;
          this.updateHealthUI();
        }
      } catch (e) {
        this.addLog("error", "Failed to fetch health data");
      }
    }

    async fetchContext() {
      try {
        const result = await window.BaelChat?.getContext?.();
        if (result && !result.error) {
          this.context = {
            used: result.total_tokens || 0,
            max: result.max_tokens || 128000,
            messages: result.message_count || 0,
            system: result.system_tokens || 0,
          };
          this.updateContextUI();
        }
      } catch (e) {
        // Context may not be available
      }
    }

    async fetchPerformance() {
      // Get metrics from BaelAPI if available
      if (window.BaelAPI?.getMetrics) {
        const metrics = window.BaelAPI.getMetrics();
        this.metrics = {
          ...this.metrics,
          calls: { total: metrics.apiCalls || 0, errors: metrics.errors || 0 },
          latency: { avg: metrics.totalLatency / (metrics.apiCalls || 1) },
          cache: {
            hits: metrics.cacheHits || 0,
            misses: metrics.cacheMisses || 0,
          },
        };
        this.updatePerformanceUI();
      }

      // Get from BaelExploit if available
      if (window.BaelExploit?.cacheExploit?.getEfficiency) {
        const efficiency = window.BaelExploit.cacheExploit.getEfficiency();
        this.metrics.cache = {
          hits: efficiency.hits || 0,
          misses: efficiency.misses || 0,
        };
      }
    }

    async fetchHeisenberg() {
      try {
        const result = await window.BaelHeisenberg?.dashboard?.();
        if (result && !result.error) {
          this.updateHeisenbergUI(result);
        }
      } catch (e) {
        // Heisenberg may not be available
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // UI UPDATES
    // ═══════════════════════════════════════════════════════════════════════

    updateHealthUI() {
      const indicator = this.container.querySelector("#agent-status");
      indicator.className =
        "status-indicator " + (this.health.status || "unknown");
      indicator.querySelector(".status-text").textContent =
        this.health.status === "online"
          ? "Connected"
          : this.health.status === "busy"
            ? "Processing"
            : this.health.status === "offline"
              ? "Offline"
              : "Unknown";

      this.updateValue("health-status", this.health.status || "-");
      this.updateValue("health-uptime", this.formatUptime(this.health.uptime));
      this.updateValue(
        "health-memory",
        this.formatBytes(this.health.memory_used || 0),
      );
      this.updateValue(
        "health-cpu",
        (this.health.cpu_percent || 0).toFixed(1) + "%",
      );
    }

    updateContextUI() {
      const fill = this.container.querySelector("#context-fill");
      const percent = (this.context.used / this.context.max) * 100;
      fill.style.width = Math.min(percent, 100) + "%";

      // Color based on usage
      if (percent > 80) {
        fill.style.background = "#ef4444";
      } else if (percent > 60) {
        fill.style.background = "#eab308";
      } else {
        fill.style.background = "#22c55e";
      }

      this.updateValue("context-used", this.context.used.toLocaleString());
      this.updateValue("context-max", this.context.max.toLocaleString());
      this.updateValue("context-messages", this.context.messages);
      this.updateValue("context-system", this.context.system.toLocaleString());
    }

    updatePerformanceUI() {
      const totalCalls = this.metrics.calls.total || 1;
      const cacheTotal =
        this.metrics.cache.hits + this.metrics.cache.misses || 1;

      this.updateValue(
        "perf-latency",
        (this.metrics.latency.avg || 0).toFixed(0) + " ms",
      );
      this.updateValue("perf-calls", this.metrics.calls.total.toLocaleString());
      this.updateValue(
        "perf-cache",
        ((this.metrics.cache.hits / cacheTotal) * 100).toFixed(1) + "%",
      );
      this.updateValue(
        "perf-errors",
        ((this.metrics.calls.errors / totalCalls) * 100).toFixed(1) + "%",
      );
    }

    updateHeisenbergUI(data) {
      this.updateValue("heis-quantum", data.quantum_states || "-");
      this.updateValue("heis-reasoning", data.reasoning_depth || "-");
      this.updateValue("heis-patterns", data.patterns_detected || "-");
      this.updateValue(
        "heis-confidence",
        data.confidence ? (data.confidence * 100).toFixed(0) + "%" : "-",
      );
    }

    updateValue(id, value) {
      const el = this.container.querySelector("#" + id);
      if (el) el.textContent = value;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // LOGGING
    // ═══════════════════════════════════════════════════════════════════════

    addLog(type, message) {
      const entry = {
        time: this.formatTime(),
        type: type.toUpperCase(),
        message,
        className: type,
      };

      this.logs.push(entry);
      if (this.logs.length > 500) this.logs.shift();

      const logsContent = this.container.querySelector("#logs-content");
      logsContent.innerHTML += `
                <div class="log-entry ${entry.className}">
                    <span class="log-time">${entry.time}</span>
                    <span class="log-type">${entry.type}</span>
                    <span class="log-message">${this.escapeHtml(entry.message)}</span>
                </div>
            `;

      // Auto-scroll
      logsContent.scrollTop = logsContent.scrollHeight;
    }

    clearLogs() {
      this.logs = [];
      this.container.querySelector("#logs-content").innerHTML = "";
      this.addLog("info", "Logs cleared");
    }

    filterLogs(filter) {
      const entries = this.container.querySelectorAll(".log-entry");
      entries.forEach((entry) => {
        if (filter === "all") {
          entry.style.display = "";
        } else {
          entry.style.display = entry.classList.contains(filter) ? "" : "none";
        }
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════

    formatTime() {
      const now = new Date();
      return now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }

    formatUptime(seconds) {
      if (!seconds) return "-";
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = Math.floor(seconds % 60);
      return `${h}h ${m}m ${s}s`;
    }

    formatBytes(bytes) {
      if (!bytes) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VISIBILITY & UPDATES
    // ═══════════════════════════════════════════════════════════════════════

    show() {
      this.container.style.display = "block";
      this.visible = true;
      this.refresh();
      this.startUpdates();
      this.addLog("info", "Console opened");
    }

    hide() {
      this.container.style.display = "none";
      this.visible = false;
      this.stopUpdates();
    }

    toggle() {
      if (this.visible) this.hide();
      else this.show();
    }

    startUpdates() {
      if (this.updateInterval) return;
      this.updateInterval = setInterval(
        () => this.refresh(),
        this.updateFrequency,
      );
    }

    stopUpdates() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelAgentConsole = new BaelAgentConsole();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelAgentConsole.initialize();
    });
  } else {
    window.BaelAgentConsole.initialize();
  }

  // Hook into Bael events for logging
  window.addEventListener("bael:api:error", (e) => {
    window.BaelAgentConsole?.addLog(
      "error",
      `API Error: ${e.detail?.error || "Unknown"}`,
    );
  });

  console.log("🖥️ Bael Agent Console loaded");
})();
