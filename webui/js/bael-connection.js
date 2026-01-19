/**
 * BAEL - LORD OF ALL
 * Connection Status - Real-time connectivity indicator
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelConnection {
    constructor() {
      this.status = "checking";
      this.lastPing = null;
      this.pingInterval = 10000; // 10 seconds
      this.indicator = null;
      this.history = [];
      this.maxHistory = 60;
      this.init();
    }

    init() {
      this.addStyles();
      this.createIndicator();
      this.bindEvents();
      this.startMonitoring();
      console.log("🔌 Bael Connection initialized");
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-connection-styles";
      styles.textContent = `
                /* Connection Indicator */
                .bael-connection-indicator {
                    position: fixed;
                    top: 16px;
                    right: 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 6px 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 20px;
                    font-size: 12px;
                    z-index: 100007;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .bael-connection-indicator:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .connection-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    transition: background 0.3s ease;
                }

                .connection-dot.connected {
                    background: #4ade80;
                    box-shadow: 0 0 8px rgba(74, 222, 128, 0.5);
                }

                .connection-dot.disconnected {
                    background: #f87171;
                    box-shadow: 0 0 8px rgba(248, 113, 113, 0.5);
                    animation: pulse 1.5s infinite;
                }

                .connection-dot.checking {
                    background: #fbbf24;
                    animation: pulse 1s infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                .connection-text {
                    color: var(--bael-text-muted, #666);
                    font-weight: 500;
                }

                .connection-text.connected {
                    color: #4ade80;
                }

                .connection-text.disconnected {
                    color: #f87171;
                }

                .connection-latency {
                    font-size: 10px;
                    color: var(--bael-text-muted, #555);
                    margin-left: 4px;
                }

                /* Details Panel */
                .bael-connection-panel {
                    position: fixed;
                    top: 55px;
                    right: 16px;
                    width: 300px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    z-index: 100020;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                }

                .bael-connection-panel.visible {
                    display: flex;
                    animation: panelAppear 0.2s ease;
                }

                @keyframes panelAppear {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .panel-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .panel-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .panel-close {
                    width: 24px;
                    height: 24px;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    font-size: 14px;
                    border-radius: 4px;
                }

                .panel-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                .panel-content {
                    padding: 14px;
                }

                .connection-stats {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 14px;
                }

                .stat-box {
                    padding: 10px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-radius: 8px;
                    text-align: center;
                }

                .stat-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--bael-text-primary, #fff);
                }

                .stat-label {
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                    margin-top: 2px;
                    text-transform: uppercase;
                }

                /* Latency Graph */
                .latency-graph {
                    margin-top: 14px;
                }

                .graph-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }

                .graph-label {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .graph-container {
                    height: 60px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-radius: 8px;
                    padding: 8px;
                    display: flex;
                    align-items: flex-end;
                    gap: 2px;
                }

                .graph-bar {
                    flex: 1;
                    background: var(--bael-accent, #ff3366);
                    border-radius: 2px 2px 0 0;
                    min-height: 2px;
                    transition: height 0.3s ease;
                }

                .graph-bar.good {
                    background: #4ade80;
                }

                .graph-bar.medium {
                    background: #fbbf24;
                }

                .graph-bar.poor {
                    background: #f87171;
                }

                /* Connection Details */
                .connection-details {
                    margin-top: 14px;
                    font-size: 11px;
                }

                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 6px 0;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .detail-row:last-child {
                    border-bottom: none;
                }

                .detail-label {
                    color: var(--bael-text-muted, #666);
                }

                .detail-value {
                    color: var(--bael-text-primary, #fff);
                    font-weight: 500;
                }

                /* Offline Banner */
                .bael-offline-banner {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(90deg, #f87171, #dc2626);
                    color: white;
                    padding: 10px 20px;
                    text-align: center;
                    font-size: 13px;
                    font-weight: 500;
                    z-index: 100050;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                }

                .bael-offline-banner.visible {
                    display: flex;
                    animation: bannerSlide 0.3s ease;
                }

                @keyframes bannerSlide {
                    from { transform: translateY(-100%); }
                    to { transform: translateY(0); }
                }

                .offline-icon {
                    font-size: 16px;
                }

                .retry-btn {
                    padding: 4px 12px;
                    background: rgba(255, 255, 255, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 4px;
                    color: white;
                    font-size: 11px;
                    cursor: pointer;
                    margin-left: 10px;
                }

                .retry-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            `;
      document.head.appendChild(styles);
    }

    createIndicator() {
      // Main indicator
      const indicator = document.createElement("div");
      indicator.className = "bael-connection-indicator";
      indicator.innerHTML = `
                <span class="connection-dot checking"></span>
                <span class="connection-text">Checking...</span>
                <span class="connection-latency"></span>
            `;
      document.body.appendChild(indicator);
      this.indicator = indicator;

      // Details panel
      const panel = document.createElement("div");
      panel.className = "bael-connection-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;

      // Offline banner
      const banner = document.createElement("div");
      banner.className = "bael-offline-banner";
      banner.innerHTML = `
                <span class="offline-icon">⚠️</span>
                <span>Connection lost. Attempting to reconnect...</span>
                <button class="retry-btn" id="retry-connection">Retry Now</button>
            `;
      document.body.appendChild(banner);
      this.banner = banner;

      this.bindIndicatorEvents();
    }

    renderPanel() {
      const avgLatency = this.getAverageLatency();
      const uptime = this.getUptime();
      const successRate = this.getSuccessRate();

      return `
                <div class="panel-header">
                    <span class="panel-title">🔌 Connection Status</span>
                    <button class="panel-close">×</button>
                </div>
                <div class="panel-content">
                    <div class="connection-stats">
                        <div class="stat-box">
                            <div class="stat-value">${this.status === "connected" ? "✓" : "✗"}</div>
                            <div class="stat-label">Status</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${avgLatency}ms</div>
                            <div class="stat-label">Avg Latency</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${uptime}</div>
                            <div class="stat-label">Uptime</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-value">${successRate}%</div>
                            <div class="stat-label">Success Rate</div>
                        </div>
                    </div>

                    <div class="latency-graph">
                        <div class="graph-header">
                            <span class="graph-label">Latency History (last 60 pings)</span>
                        </div>
                        <div class="graph-container">
                            ${this.renderGraph()}
                        </div>
                    </div>

                    <div class="connection-details">
                        <div class="detail-row">
                            <span class="detail-label">Server</span>
                            <span class="detail-value">${window.location.host}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Protocol</span>
                            <span class="detail-value">${window.location.protocol.replace(":", "")}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Last Ping</span>
                            <span class="detail-value">${this.lastPing ? new Date(this.lastPing).toLocaleTimeString() : "N/A"}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Browser</span>
                            <span class="detail-value">${navigator.onLine ? "Online" : "Offline"}</span>
                        </div>
                    </div>
                </div>
            `;
    }

    renderGraph() {
      if (this.history.length === 0) {
        return '<div style="color: var(--bael-text-muted); font-size: 11px; width: 100%; text-align: center;">No data yet</div>';
      }

      const maxLatency = Math.max(
        ...this.history.map((h) => h.latency || 0),
        100,
      );
      return this.history
        .slice(-30)
        .map((h) => {
          const height = h.latency
            ? Math.max((h.latency / maxLatency) * 100, 5)
            : 5;
          const quality = this.getLatencyQuality(h.latency);
          return `<div class="graph-bar ${quality}" style="height: ${height}%;" title="${h.latency || 0}ms"></div>`;
        })
        .join("");
    }

    getLatencyQuality(latency) {
      if (!latency) return "poor";
      if (latency < 100) return "good";
      if (latency < 300) return "medium";
      return "poor";
    }

    getAverageLatency() {
      const validPings = this.history.filter((h) => h.latency);
      if (validPings.length === 0) return "-";
      const avg =
        validPings.reduce((sum, h) => sum + h.latency, 0) / validPings.length;
      return Math.round(avg);
    }

    getUptime() {
      const successful = this.history.filter((h) => h.success).length;
      const total = this.history.length;
      if (total === 0) return "-";
      const minutes = Math.round((total * this.pingInterval) / 60000);
      return minutes < 60 ? `${minutes}m` : `${Math.round(minutes / 60)}h`;
    }

    getSuccessRate() {
      if (this.history.length === 0) return "-";
      const successful = this.history.filter((h) => h.success).length;
      return Math.round((successful / this.history.length) * 100);
    }

    bindIndicatorEvents() {
      this.indicator.addEventListener("click", () => this.togglePanel());
      this.panel
        .querySelector(".panel-close")
        .addEventListener("click", () => this.hidePanel());
      this.banner
        .querySelector("#retry-connection")
        .addEventListener("click", () => this.checkConnection());
    }

    bindEvents() {
      // Browser online/offline events
      window.addEventListener("online", () => {
        this.checkConnection();
      });

      window.addEventListener("offline", () => {
        this.setStatus("disconnected");
      });

      // Click outside panel to close
      document.addEventListener("click", (e) => {
        if (
          !this.panel.contains(e.target) &&
          !this.indicator.contains(e.target)
        ) {
          this.hidePanel();
        }
      });
    }

    startMonitoring() {
      // Initial check
      this.checkConnection();

      // Periodic checks
      setInterval(() => this.checkConnection(), this.pingInterval);
    }

    async checkConnection() {
      const start = Date.now();
      this.setStatus("checking");

      try {
        // Try to ping the server
        const response = await fetch("/api/status", {
          method: "GET",
          cache: "no-store",
          signal: AbortSignal.timeout(5000),
        });

        const latency = Date.now() - start;
        this.lastPing = Date.now();

        if (response.ok) {
          this.setStatus("connected", latency);
          this.recordPing(true, latency);
        } else {
          this.setStatus("disconnected");
          this.recordPing(false);
        }
      } catch (error) {
        // Try a simple HEAD request as fallback
        try {
          const fallbackResponse = await fetch("/", {
            method: "HEAD",
            cache: "no-store",
            signal: AbortSignal.timeout(5000),
          });

          const latency = Date.now() - start;
          this.lastPing = Date.now();

          if (fallbackResponse.ok) {
            this.setStatus("connected", latency);
            this.recordPing(true, latency);
          } else {
            this.setStatus("disconnected");
            this.recordPing(false);
          }
        } catch (e) {
          this.setStatus("disconnected");
          this.recordPing(false);
        }
      }
    }

    recordPing(success, latency = null) {
      this.history.push({
        timestamp: Date.now(),
        success: success,
        latency: latency,
      });

      // Keep only last maxHistory entries
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }
    }

    setStatus(status, latency = null) {
      this.status = status;

      const dot = this.indicator.querySelector(".connection-dot");
      const text = this.indicator.querySelector(".connection-text");
      const latencyEl = this.indicator.querySelector(".connection-latency");

      // Update dot
      dot.className = "connection-dot " + status;

      // Update text
      text.className = "connection-text " + status;
      switch (status) {
        case "connected":
          text.textContent = "Connected";
          break;
        case "disconnected":
          text.textContent = "Disconnected";
          break;
        case "checking":
          text.textContent = "Checking...";
          break;
      }

      // Update latency
      if (latency !== null && status === "connected") {
        latencyEl.textContent = `${latency}ms`;
      } else {
        latencyEl.textContent = "";
      }

      // Show/hide offline banner
      this.banner.classList.toggle("visible", status === "disconnected");

      // Update panel if visible
      if (this.panel.classList.contains("visible")) {
        this.panel.innerHTML = this.renderPanel();
        this.panel
          .querySelector(".panel-close")
          .addEventListener("click", () => this.hidePanel());
      }

      // Dispatch event
      window.dispatchEvent(
        new CustomEvent("bael-connection-change", {
          detail: { status, latency },
        }),
      );
    }

    togglePanel() {
      this.panel.classList.toggle("visible");
      if (this.panel.classList.contains("visible")) {
        this.panel.innerHTML = this.renderPanel();
        this.panel
          .querySelector(".panel-close")
          .addEventListener("click", () => this.hidePanel());
      }
    }

    hidePanel() {
      this.panel.classList.remove("visible");
    }
  }

  // Initialize
  window.BaelConnection = new BaelConnection();
})();
