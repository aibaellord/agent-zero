/**
 * BAEL - LORD OF ALL
 * API Monitor - Real-time API requests, responses, and latency tracking
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelAPIMonitor {
    constructor() {
      this.isVisible = false;
      this.requests = [];
      this.maxRequests = 100;
      this.filters = {
        type: "all", // all, success, error, pending
        endpoint: "",
      };
      this.stats = {
        total: 0,
        success: 0,
        errors: 0,
        avgLatency: 0,
        totalLatency: 0,
      };
      this.init();
    }

    init() {
      this.createUI();
      this.interceptFetch();
      this.interceptXHR();
      this.bindEvents();
      console.log("🔌 Bael API Monitor initialized");
    }

    createUI() {
      const styles = document.createElement("style");
      styles.id = "bael-api-monitor-styles";
      styles.textContent = `
                .bael-api-panel {
                    position: fixed;
                    bottom: 60px;
                    right: 20px;
                    width: 450px;
                    height: 500px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 14px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                    z-index: 8000;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    transform: translateY(20px);
                    opacity: 0;
                    pointer-events: none;
                    transition: all 0.3s ease;
                }

                .bael-api-panel.visible {
                    transform: translateY(0);
                    opacity: 1;
                    pointer-events: all;
                }

                .bael-api-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-api-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bael-api-actions {
                    display: flex;
                    gap: 8px;
                }

                .bael-api-btn {
                    width: 28px;
                    height: 28px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.2s ease;
                }

                .bael-api-btn:hover {
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                    border-color: var(--bael-accent, #ff3366);
                }

                .bael-api-stats {
                    display: flex;
                    gap: 16px;
                    padding: 12px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-api-stat {
                    flex: 1;
                    text-align: center;
                }

                .bael-api-stat-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--bael-text-primary, #fff);
                }

                .bael-api-stat-label {
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .bael-api-stat.success .bael-api-stat-value { color: #22c55e; }
                .bael-api-stat.error .bael-api-stat-value { color: #ef4444; }
                .bael-api-stat.latency .bael-api-stat-value { color: #eab308; }

                .bael-api-filters {
                    display: flex;
                    gap: 8px;
                    padding: 10px 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-api-filter-btn {
                    padding: 5px 10px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    color: var(--bael-text-muted, #888);
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-api-filter-btn.active {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .bael-api-search {
                    flex: 1;
                    padding: 5px 10px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 11px;
                }

                .bael-api-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px;
                }

                .bael-api-item {
                    padding: 10px 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    margin-bottom: 6px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-api-item:hover {
                    border-color: rgba(255, 51, 102, 0.3);
                }

                .bael-api-item.expanded {
                    border-color: var(--bael-accent, #ff3366);
                }

                .bael-api-item-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .bael-api-method {
                    padding: 3px 6px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                }

                .bael-api-method.get { background: #3b82f6; color: #fff; }
                .bael-api-method.post { background: #22c55e; color: #fff; }
                .bael-api-method.put { background: #f97316; color: #fff; }
                .bael-api-method.delete { background: #ef4444; color: #fff; }
                .bael-api-method.patch { background: #8b5cf6; color: #fff; }

                .bael-api-endpoint {
                    flex: 1;
                    font-size: 12px;
                    font-family: monospace;
                    color: var(--bael-text-primary, #fff);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .bael-api-status {
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 10px;
                    font-weight: 600;
                }

                .bael-api-status.success { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
                .bael-api-status.error { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
                .bael-api-status.pending { background: rgba(234, 179, 8, 0.2); color: #eab308; }

                .bael-api-latency {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                    min-width: 50px;
                    text-align: right;
                }

                .bael-api-item-time {
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                    margin-top: 6px;
                }

                .bael-api-item-details {
                    display: none;
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-api-item.expanded .bael-api-item-details {
                    display: block;
                }

                .bael-api-detail-section {
                    margin-bottom: 10px;
                }

                .bael-api-detail-label {
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                }

                .bael-api-detail-content {
                    background: var(--bael-bg-primary, #0a0a0f);
                    border-radius: 6px;
                    padding: 8px;
                    font-family: monospace;
                    font-size: 11px;
                    color: var(--bael-text-primary, #fff);
                    max-height: 100px;
                    overflow-y: auto;
                    word-break: break-all;
                }

                .bael-api-trigger {
                    position: fixed;
                    bottom: 180px;
                    right: 20px;
                    width: 44px;
                    height: 44px;
                    background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
                    border: none;
                    border-radius: 12px;
                    color: #fff;
                    font-size: 18px;
                    cursor: pointer;
                    box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
                    z-index: 7999;
                    transition: all 0.3s ease;
                }

                .bael-api-trigger:hover {
                    transform: scale(1.08);
                }

                .bael-api-trigger.hidden {
                    opacity: 0;
                    pointer-events: none;
                }

                .bael-api-trigger .activity {
                    position: absolute;
                    top: -3px;
                    right: -3px;
                    width: 12px;
                    height: 12px;
                    background: #22c55e;
                    border-radius: 50%;
                    animation: bael-api-pulse 2s infinite;
                }

                @keyframes bael-api-pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.2); }
                }

                .bael-api-empty {
                    text-align: center;
                    padding: 40px;
                    color: var(--bael-text-muted, #666);
                }

                .bael-api-empty-icon {
                    font-size: 40px;
                    margin-bottom: 10px;
                    opacity: 0.5;
                }
            `;
      document.head.appendChild(styles);

      // Panel
      this.panel = document.createElement("div");
      this.panel.className = "bael-api-panel";
      this.panel.innerHTML = this.renderPanel();
      document.body.appendChild(this.panel);

      // Trigger
      this.trigger = document.createElement("button");
      this.trigger.className = "bael-api-trigger";
      this.trigger.innerHTML = '🔌<span class="activity"></span>';
      this.trigger.title = "API Monitor (Ctrl+Shift+A)";
      document.body.appendChild(this.trigger);
    }

    renderPanel() {
      return `
                <div class="bael-api-header">
                    <div class="bael-api-title">
                        <span>🔌</span>
                        <span>API Monitor</span>
                    </div>
                    <div class="bael-api-actions">
                        <button class="bael-api-btn" id="api-clear" title="Clear">🗑️</button>
                        <button class="bael-api-btn" id="api-close" title="Close">✕</button>
                    </div>
                </div>
                <div class="bael-api-stats">
                    <div class="bael-api-stat">
                        <div class="bael-api-stat-value" id="stat-total">0</div>
                        <div class="bael-api-stat-label">Total</div>
                    </div>
                    <div class="bael-api-stat success">
                        <div class="bael-api-stat-value" id="stat-success">0</div>
                        <div class="bael-api-stat-label">Success</div>
                    </div>
                    <div class="bael-api-stat error">
                        <div class="bael-api-stat-value" id="stat-errors">0</div>
                        <div class="bael-api-stat-label">Errors</div>
                    </div>
                    <div class="bael-api-stat latency">
                        <div class="bael-api-stat-value" id="stat-latency">0ms</div>
                        <div class="bael-api-stat-label">Avg Latency</div>
                    </div>
                </div>
                <div class="bael-api-filters">
                    <button class="bael-api-filter-btn active" data-filter="all">All</button>
                    <button class="bael-api-filter-btn" data-filter="success">✓ Success</button>
                    <button class="bael-api-filter-btn" data-filter="error">✗ Error</button>
                    <button class="bael-api-filter-btn" data-filter="pending">⏳ Pending</button>
                    <input type="text" class="bael-api-search" placeholder="Filter endpoints..." id="api-endpoint-filter">
                </div>
                <div class="bael-api-list" id="api-list">
                    ${this.renderEmptyState()}
                </div>
            `;
    }

    renderEmptyState() {
      return `
                <div class="bael-api-empty">
                    <div class="bael-api-empty-icon">🔌</div>
                    <div>No API requests yet</div>
                    <div style="font-size: 11px; margin-top: 4px;">Requests will appear here automatically</div>
                </div>
            `;
    }

    renderRequestList() {
      let filtered = this.requests.filter((req) => {
        if (this.filters.type === "success" && req.status !== "success")
          return false;
        if (this.filters.type === "error" && req.status !== "error")
          return false;
        if (this.filters.type === "pending" && req.status !== "pending")
          return false;
        if (
          this.filters.endpoint &&
          !req.url.toLowerCase().includes(this.filters.endpoint.toLowerCase())
        )
          return false;
        return true;
      });

      if (filtered.length === 0) {
        return this.renderEmptyState();
      }

      return filtered
        .reverse()
        .map(
          (req) => `
                <div class="bael-api-item" data-id="${req.id}">
                    <div class="bael-api-item-header">
                        <span class="bael-api-method ${req.method.toLowerCase()}">${req.method}</span>
                        <span class="bael-api-endpoint">${this.shortenUrl(req.url)}</span>
                        <span class="bael-api-status ${req.status}">${req.statusCode || req.status}</span>
                        <span class="bael-api-latency">${req.latency ? req.latency + "ms" : "..."}</span>
                    </div>
                    <div class="bael-api-item-time">${this.formatTime(req.timestamp)}</div>
                    <div class="bael-api-item-details">
                        ${
                          req.requestBody
                            ? `
                        <div class="bael-api-detail-section">
                            <div class="bael-api-detail-label">Request Body</div>
                            <div class="bael-api-detail-content">${this.formatJSON(req.requestBody)}</div>
                        </div>
                        `
                            : ""
                        }
                        ${
                          req.responseBody
                            ? `
                        <div class="bael-api-detail-section">
                            <div class="bael-api-detail-label">Response</div>
                            <div class="bael-api-detail-content">${this.formatJSON(req.responseBody)}</div>
                        </div>
                        `
                            : ""
                        }
                    </div>
                </div>
            `,
        )
        .join("");
    }

    bindEvents() {
      this.trigger.addEventListener("click", () => this.toggle());
      this.panel
        .querySelector("#api-close")
        .addEventListener("click", () => this.hide());
      this.panel
        .querySelector("#api-clear")
        .addEventListener("click", () => this.clearRequests());

      // Filters
      this.panel
        .querySelector(".bael-api-filters")
        .addEventListener("click", (e) => {
          if (e.target.classList.contains("bael-api-filter-btn")) {
            this.panel
              .querySelectorAll(".bael-api-filter-btn")
              .forEach((btn) => btn.classList.remove("active"));
            e.target.classList.add("active");
            this.filters.type = e.target.dataset.filter;
            this.refreshList();
          }
        });

      this.panel
        .querySelector("#api-endpoint-filter")
        .addEventListener("input", (e) => {
          this.filters.endpoint = e.target.value;
          this.refreshList();
        });

      // Expand/collapse items
      this.panel.querySelector("#api-list").addEventListener("click", (e) => {
        const item = e.target.closest(".bael-api-item");
        if (item) {
          item.classList.toggle("expanded");
        }
      });

      // Keyboard
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "A") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    interceptFetch() {
      const originalFetch = window.fetch;
      const monitor = this;

      window.fetch = async function (...args) {
        const [url, options = {}] = args;
        const method = options.method || "GET";
        const startTime = Date.now();
        const requestId = monitor.addRequest(url, method, options.body);

        try {
          const response = await originalFetch.apply(this, args);
          const latency = Date.now() - startTime;

          // Clone response to read body
          const clone = response.clone();
          let responseBody = null;
          try {
            responseBody = await clone.text();
          } catch (e) {}

          monitor.updateRequest(requestId, {
            status: response.ok ? "success" : "error",
            statusCode: response.status,
            latency,
            responseBody,
          });

          return response;
        } catch (error) {
          const latency = Date.now() - startTime;
          monitor.updateRequest(requestId, {
            status: "error",
            statusCode: "ERR",
            latency,
            responseBody: error.message,
          });
          throw error;
        }
      };
    }

    interceptXHR() {
      const monitor = this;
      const originalOpen = XMLHttpRequest.prototype.open;
      const originalSend = XMLHttpRequest.prototype.send;

      XMLHttpRequest.prototype.open = function (method, url, ...rest) {
        this._baelMethod = method;
        this._baelUrl = url;
        return originalOpen.apply(this, [method, url, ...rest]);
      };

      XMLHttpRequest.prototype.send = function (body) {
        const startTime = Date.now();
        const requestId = monitor.addRequest(
          this._baelUrl,
          this._baelMethod,
          body,
        );

        this.addEventListener("load", function () {
          const latency = Date.now() - startTime;
          monitor.updateRequest(requestId, {
            status:
              this.status >= 200 && this.status < 300 ? "success" : "error",
            statusCode: this.status,
            latency,
            responseBody: this.responseText,
          });
        });

        this.addEventListener("error", function () {
          const latency = Date.now() - startTime;
          monitor.updateRequest(requestId, {
            status: "error",
            statusCode: "ERR",
            latency,
            responseBody: "Network Error",
          });
        });

        return originalSend.apply(this, [body]);
      };
    }

    addRequest(url, method, body) {
      const id = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const request = {
        id,
        url: url.toString(),
        method,
        requestBody: body,
        status: "pending",
        statusCode: null,
        latency: null,
        responseBody: null,
        timestamp: Date.now(),
      };

      this.requests.push(request);
      if (this.requests.length > this.maxRequests) {
        this.requests.shift();
      }

      this.stats.total++;
      this.updateStats();
      this.refreshList();

      return id;
    }

    updateRequest(id, updates) {
      const request = this.requests.find((r) => r.id === id);
      if (request) {
        Object.assign(request, updates);

        if (updates.status === "success") {
          this.stats.success++;
        } else if (updates.status === "error") {
          this.stats.errors++;
        }

        if (updates.latency) {
          this.stats.totalLatency += updates.latency;
          this.stats.avgLatency = Math.round(
            this.stats.totalLatency / (this.stats.success + this.stats.errors),
          );
        }

        this.updateStats();
        this.refreshList();
      }
    }

    updateStats() {
      const panel = this.panel;
      panel.querySelector("#stat-total").textContent = this.stats.total;
      panel.querySelector("#stat-success").textContent = this.stats.success;
      panel.querySelector("#stat-errors").textContent = this.stats.errors;
      panel.querySelector("#stat-latency").textContent =
        this.stats.avgLatency + "ms";
    }

    refreshList() {
      this.panel.querySelector("#api-list").innerHTML =
        this.renderRequestList();
    }

    clearRequests() {
      this.requests = [];
      this.stats = {
        total: 0,
        success: 0,
        errors: 0,
        avgLatency: 0,
        totalLatency: 0,
      };
      this.updateStats();
      this.refreshList();
    }

    toggle() {
      if (this.isVisible) this.hide();
      else this.show();
    }

    show() {
      this.isVisible = true;
      this.panel.classList.add("visible");
      this.trigger.classList.add("hidden");
    }

    hide() {
      this.isVisible = false;
      this.panel.classList.remove("visible");
      this.trigger.classList.remove("hidden");
    }

    shortenUrl(url) {
      try {
        const u = new URL(url, window.location.origin);
        return u.pathname + u.search;
      } catch {
        return url;
      }
    }

    formatTime(timestamp) {
      const d = new Date(timestamp);
      return d.toLocaleTimeString();
    }

    formatJSON(data) {
      if (!data) return "";
      try {
        const parsed = typeof data === "string" ? JSON.parse(data) : data;
        return JSON.stringify(parsed, null, 2).substring(0, 500);
      } catch {
        return String(data).substring(0, 500);
      }
    }
  }

  window.BaelAPIMonitor = new BaelAPIMonitor();
})();
