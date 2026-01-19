/**
 * BAEL - LORD OF ALL
 * Network Inspector - Monitor WebSocket connections and network activity
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelNetworkInspector {
    constructor() {
      this.isVisible = false;
      this.connections = [];
      this.messages = [];
      this.maxMessages = 200;
      this.selectedTab = "websocket";
      this.filters = {
        direction: "all", // all, sent, received
        type: "all", // all, json, text
      };
      this.init();
    }

    init() {
      this.interceptWebSocket();
      this.createUI();
      this.bindEvents();
      console.log("🌐 Bael Network Inspector initialized");
    }

    interceptWebSocket() {
      const self = this;
      const OriginalWebSocket = window.WebSocket;

      window.WebSocket = function (url, protocols) {
        const ws = protocols
          ? new OriginalWebSocket(url, protocols)
          : new OriginalWebSocket(url);

        const connectionId = `ws-${Date.now()}`;
        self.connections.push({
          id: connectionId,
          url,
          status: "connecting",
          createdAt: Date.now(),
          messageCount: 0,
        });

        ws.addEventListener("open", () => {
          const conn = self.connections.find((c) => c.id === connectionId);
          if (conn) conn.status = "open";
          self.refreshConnectionList();
        });

        ws.addEventListener("close", () => {
          const conn = self.connections.find((c) => c.id === connectionId);
          if (conn) conn.status = "closed";
          self.refreshConnectionList();
        });

        ws.addEventListener("error", () => {
          const conn = self.connections.find((c) => c.id === connectionId);
          if (conn) conn.status = "error";
          self.refreshConnectionList();
        });

        ws.addEventListener("message", (event) => {
          self.addMessage({
            connectionId,
            direction: "received",
            data: event.data,
            timestamp: Date.now(),
          });
          const conn = self.connections.find((c) => c.id === connectionId);
          if (conn) conn.messageCount++;
        });

        // Intercept send
        const originalSend = ws.send.bind(ws);
        ws.send = function (data) {
          self.addMessage({
            connectionId,
            direction: "sent",
            data,
            timestamp: Date.now(),
          });
          const conn = self.connections.find((c) => c.id === connectionId);
          if (conn) conn.messageCount++;
          return originalSend(data);
        };

        return ws;
      };

      // Copy static properties
      Object.keys(OriginalWebSocket).forEach((key) => {
        window.WebSocket[key] = OriginalWebSocket[key];
      });
    }

    addMessage(msg) {
      // Parse data
      let parsed = msg.data;
      let type = "text";
      try {
        parsed = JSON.parse(msg.data);
        type = "json";
      } catch {}

      this.messages.push({
        ...msg,
        parsed,
        type,
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      });

      if (this.messages.length > this.maxMessages) {
        this.messages.shift();
      }

      if (this.isVisible) {
        this.refreshMessageList();
      }
    }

    createUI() {
      const styles = document.createElement("style");
      styles.id = "bael-network-styles";
      styles.textContent = `
                .bael-network-panel {
                    position: fixed;
                    bottom: 60px;
                    left: 20px;
                    width: 500px;
                    height: 450px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 14px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                    z-index: 8000;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    transform: translateX(-540px);
                    opacity: 0;
                    transition: all 0.3s ease;
                }

                .bael-network-panel.visible {
                    transform: translateX(0);
                    opacity: 1;
                }

                .bael-network-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-network-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bael-network-actions {
                    display: flex;
                    gap: 8px;
                }

                .bael-network-btn {
                    width: 28px;
                    height: 28px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    font-size: 12px;
                }

                .bael-network-btn:hover {
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                    border-color: var(--bael-accent, #ff3366);
                }

                .bael-network-tabs {
                    display: flex;
                    padding: 0 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-network-tab {
                    padding: 10px 16px;
                    background: transparent;
                    border: none;
                    border-bottom: 2px solid transparent;
                    color: var(--bael-text-muted, #888);
                    font-size: 12px;
                    cursor: pointer;
                }

                .bael-network-tab:hover {
                    color: var(--bael-text-primary, #fff);
                }

                .bael-network-tab.active {
                    color: var(--bael-accent, #ff3366);
                    border-bottom-color: var(--bael-accent, #ff3366);
                }

                .bael-network-filters {
                    display: flex;
                    gap: 8px;
                    padding: 10px 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-network-filter {
                    padding: 4px 10px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    color: var(--bael-text-muted, #888);
                    font-size: 10px;
                    cursor: pointer;
                }

                .bael-network-filter.active {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .bael-network-content {
                    flex: 1;
                    overflow-y: auto;
                }

                /* Connections tab */
                .bael-network-conn-list {
                    padding: 12px;
                }

                .bael-network-conn {
                    padding: 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    margin-bottom: 8px;
                }

                .bael-network-conn-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 8px;
                }

                .bael-network-conn-status {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }

                .bael-network-conn-status.open { background: #22c55e; }
                .bael-network-conn-status.connecting { background: #eab308; animation: bael-pulse 1s infinite; }
                .bael-network-conn-status.closed { background: #666; }
                .bael-network-conn-status.error { background: #ef4444; }

                .bael-network-conn-url {
                    flex: 1;
                    font-family: monospace;
                    font-size: 11px;
                    color: var(--bael-text-primary, #fff);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .bael-network-conn-badge {
                    padding: 2px 8px;
                    background: rgba(255, 51, 102, 0.2);
                    border-radius: 8px;
                    font-size: 10px;
                    color: var(--bael-accent, #ff3366);
                }

                /* Messages tab */
                .bael-network-msg-list {
                    font-family: 'Fira Code', monospace;
                    font-size: 11px;
                }

                .bael-network-msg {
                    padding: 8px 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    cursor: pointer;
                }

                .bael-network-msg:hover {
                    background: rgba(255, 255, 255, 0.02);
                }

                .bael-network-msg-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 4px;
                }

                .bael-network-msg-dir {
                    font-size: 12px;
                }

                .bael-network-msg-dir.sent { color: #22c55e; }
                .bael-network-msg-dir.received { color: #3b82f6; }

                .bael-network-msg-time {
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                }

                .bael-network-msg-type {
                    padding: 1px 6px;
                    background: rgba(139, 92, 246, 0.2);
                    border-radius: 6px;
                    font-size: 9px;
                    color: #8b5cf6;
                }

                .bael-network-msg-preview {
                    color: var(--bael-text-muted, #888);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .bael-network-msg-detail {
                    display: none;
                    margin-top: 8px;
                    padding: 10px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-radius: 6px;
                    white-space: pre-wrap;
                    word-break: break-all;
                    color: var(--bael-text-primary, #fff);
                    max-height: 150px;
                    overflow-y: auto;
                }

                .bael-network-msg.expanded .bael-network-msg-detail {
                    display: block;
                }

                .bael-network-empty {
                    text-align: center;
                    padding: 40px;
                    color: var(--bael-text-muted, #666);
                }

                .bael-network-trigger {
                    position: fixed;
                    bottom: 120px;
                    left: 20px;
                    width: 44px;
                    height: 44px;
                    background: linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%);
                    border: none;
                    border-radius: 12px;
                    color: #fff;
                    font-size: 18px;
                    cursor: pointer;
                    box-shadow: 0 4px 16px rgba(6, 182, 212, 0.4);
                    z-index: 7999;
                    transition: all 0.3s ease;
                }

                .bael-network-trigger:hover {
                    transform: scale(1.08);
                }

                .bael-network-trigger .live-dot {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 12px;
                    height: 12px;
                    background: #22c55e;
                    border-radius: 50%;
                    border: 2px solid var(--bael-bg-primary, #0a0a0f);
                    animation: bael-pulse 2s infinite;
                }

                @keyframes bael-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `;
      document.head.appendChild(styles);

      // Panel
      this.panel = document.createElement("div");
      this.panel.className = "bael-network-panel";
      this.panel.innerHTML = this.renderPanel();
      document.body.appendChild(this.panel);

      // Trigger
      this.trigger = document.createElement("button");
      this.trigger.className = "bael-network-trigger";
      this.trigger.innerHTML = '🌐<span class="live-dot"></span>';
      this.trigger.title = "Network Inspector";
      document.body.appendChild(this.trigger);
    }

    renderPanel() {
      return `
                <div class="bael-network-header">
                    <div class="bael-network-title">
                        <span>🌐</span>
                        <span>Network Inspector</span>
                    </div>
                    <div class="bael-network-actions">
                        <button class="bael-network-btn" id="network-clear" title="Clear">🗑️</button>
                        <button class="bael-network-btn" id="network-close" title="Close">✕</button>
                    </div>
                </div>
                <div class="bael-network-tabs">
                    <button class="bael-network-tab active" data-tab="websocket">WebSocket</button>
                    <button class="bael-network-tab" data-tab="connections">Connections</button>
                </div>
                <div class="bael-network-filters" id="ws-filters">
                    <button class="bael-network-filter active" data-filter="all">All</button>
                    <button class="bael-network-filter" data-filter="sent">↑ Sent</button>
                    <button class="bael-network-filter" data-filter="received">↓ Received</button>
                    <button class="bael-network-filter" data-filter="json">JSON</button>
                </div>
                <div class="bael-network-content">
                    <div class="bael-network-msg-list" id="message-list">
                        ${this.renderMessageList()}
                    </div>
                    <div class="bael-network-conn-list" id="connection-list" style="display: none;">
                        ${this.renderConnectionList()}
                    </div>
                </div>
            `;
    }

    renderMessageList() {
      let filtered = this.messages;

      if (this.filters.direction !== "all") {
        filtered = filtered.filter(
          (m) => m.direction === this.filters.direction,
        );
      }
      if (this.filters.type === "json") {
        filtered = filtered.filter((m) => m.type === "json");
      }

      if (filtered.length === 0) {
        return `<div class="bael-network-empty">No messages yet</div>`;
      }

      return filtered
        .reverse()
        .map(
          (msg) => `
                <div class="bael-network-msg" data-id="${msg.id}">
                    <div class="bael-network-msg-header">
                        <span class="bael-network-msg-dir ${msg.direction}">${msg.direction === "sent" ? "↑" : "↓"}</span>
                        <span class="bael-network-msg-time">${this.formatTime(msg.timestamp)}</span>
                        <span class="bael-network-msg-type">${msg.type}</span>
                    </div>
                    <div class="bael-network-msg-preview">${this.getPreview(msg)}</div>
                    <div class="bael-network-msg-detail">${this.formatData(msg)}</div>
                </div>
            `,
        )
        .join("");
    }

    renderConnectionList() {
      if (this.connections.length === 0) {
        return `<div class="bael-network-empty">No WebSocket connections</div>`;
      }

      return this.connections
        .map(
          (conn) => `
                <div class="bael-network-conn">
                    <div class="bael-network-conn-header">
                        <span class="bael-network-conn-status ${conn.status}"></span>
                        <span class="bael-network-conn-url">${conn.url}</span>
                        <span class="bael-network-conn-badge">${conn.messageCount} msgs</span>
                    </div>
                </div>
            `,
        )
        .join("");
    }

    bindEvents() {
      this.trigger.addEventListener("click", () => this.toggle());
      this.panel
        .querySelector("#network-close")
        .addEventListener("click", () => this.hide());
      this.panel
        .querySelector("#network-clear")
        .addEventListener("click", () => {
          this.messages = [];
          this.refreshMessageList();
        });

      // Tabs
      this.panel
        .querySelector(".bael-network-tabs")
        .addEventListener("click", (e) => {
          if (e.target.classList.contains("bael-network-tab")) {
            this.panel
              .querySelectorAll(".bael-network-tab")
              .forEach((t) => t.classList.remove("active"));
            e.target.classList.add("active");
            this.selectedTab = e.target.dataset.tab;

            const msgList = this.panel.querySelector("#message-list");
            const connList = this.panel.querySelector("#connection-list");
            const filters = this.panel.querySelector("#ws-filters");

            if (this.selectedTab === "websocket") {
              msgList.style.display = "block";
              connList.style.display = "none";
              filters.style.display = "flex";
            } else {
              msgList.style.display = "none";
              connList.style.display = "block";
              filters.style.display = "none";
              this.refreshConnectionList();
            }
          }
        });

      // Filters
      this.panel.querySelector("#ws-filters").addEventListener("click", (e) => {
        if (e.target.classList.contains("bael-network-filter")) {
          const filter = e.target.dataset.filter;

          if (filter === "sent" || filter === "received") {
            if (this.filters.direction === filter) {
              this.filters.direction = "all";
              e.target.classList.remove("active");
            } else {
              this.filters.direction = filter;
              this.panel
                .querySelectorAll(
                  '[data-filter="sent"], [data-filter="received"]',
                )
                .forEach((f) => f.classList.remove("active"));
              e.target.classList.add("active");
            }
          } else if (filter === "json") {
            if (this.filters.type === "json") {
              this.filters.type = "all";
              e.target.classList.remove("active");
            } else {
              this.filters.type = "json";
              e.target.classList.add("active");
            }
          } else if (filter === "all") {
            this.filters.direction = "all";
            this.filters.type = "all";
            this.panel
              .querySelectorAll(".bael-network-filter")
              .forEach((f) => f.classList.remove("active"));
            e.target.classList.add("active");
          }

          this.refreshMessageList();
        }
      });

      // Expand message
      this.panel
        .querySelector("#message-list")
        .addEventListener("click", (e) => {
          const msg = e.target.closest(".bael-network-msg");
          if (msg) {
            msg.classList.toggle("expanded");
          }
        });
    }

    refreshMessageList() {
      this.panel.querySelector("#message-list").innerHTML =
        this.renderMessageList();
    }

    refreshConnectionList() {
      this.panel.querySelector("#connection-list").innerHTML =
        this.renderConnectionList();
    }

    toggle() {
      if (this.isVisible) this.hide();
      else this.show();
    }

    show() {
      this.isVisible = true;
      this.panel.classList.add("visible");
      this.refreshMessageList();
    }

    hide() {
      this.isVisible = false;
      this.panel.classList.remove("visible");
    }

    getPreview(msg) {
      const str =
        typeof msg.data === "string" ? msg.data : JSON.stringify(msg.data);
      return str.substring(0, 80) + (str.length > 80 ? "..." : "");
    }

    formatData(msg) {
      if (msg.type === "json") {
        return JSON.stringify(msg.parsed, null, 2);
      }
      return msg.data;
    }

    formatTime(timestamp) {
      const d = new Date(timestamp);
      return (
        d.toLocaleTimeString("en-US", { hour12: false }) +
        "." +
        String(d.getMilliseconds()).padStart(3, "0")
      );
    }
  }

  window.BaelNetworkInspector = new BaelNetworkInspector();
})();
