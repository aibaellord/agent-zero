/**
 * Bael Agent Status - Real-time agent activity & status monitor
 * Keyboard: Ctrl+Shift+A to toggle
 */
(function () {
  "use strict";

  class BaelAgentStatus {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.storageKey = "bael-agent-status";
      this.agents = new Map();
      this.activityLog = [];
      this.stats = {
        totalAgents: 0,
        activeAgents: 0,
        completedTasks: 0,
        failedTasks: 0,
      };
    }

    async initialize() {
      this.loadFromStorage();
      this.injectStyles();
      this.createElements();
      this.setupShortcuts();
      this.startMonitoring();
      this.initialized = true;
      console.log("🤖 Bael Agent Status initialized");
    }

    injectStyles() {
      if (document.getElementById("bael-agent-status-styles")) return;

      const css = `
                .bael-status-fab {
                    position: fixed;
                    bottom: 480px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    color: white;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
                    z-index: 9999;
                    transition: all 0.3s ease;
                }

                .bael-status-fab:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
                }

                .bael-status-indicator {
                    position: absolute;
                    top: 6px;
                    right: 6px;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: #10b981;
                    border: 2px solid white;
                }

                .bael-status-indicator.busy {
                    background: #f59e0b;
                    animation: bael-status-pulse 1s infinite;
                }

                @keyframes bael-status-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                .bael-status-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.9);
                    width: 600px;
                    max-width: 95vw;
                    max-height: 80vh;
                    background: linear-gradient(135deg, #1e1e2e, #2a2a3e);
                    border-radius: 20px;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
                    z-index: 10001;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                    border: 1px solid rgba(59, 130, 246, 0.3);
                }

                .bael-status-panel.visible {
                    opacity: 1;
                    visibility: visible;
                    transform: translate(-50%, -50%) scale(1);
                }

                .bael-status-header {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    padding: 18px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .bael-status-title {
                    color: white;
                    font-size: 18px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .bael-status-close {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 18px;
                    transition: background 0.2s;
                }

                .bael-status-close:hover {
                    background: rgba(255,255,255,0.3);
                }

                .bael-status-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    padding: 16px 20px;
                    background: rgba(0,0,0,0.2);
                }

                .bael-status-stat {
                    text-align: center;
                    padding: 12px;
                    background: rgba(255,255,255,0.03);
                    border-radius: 10px;
                }

                .bael-status-stat-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #3b82f6;
                }

                .bael-status-stat-label {
                    font-size: 11px;
                    color: #888;
                    text-transform: uppercase;
                    margin-top: 4px;
                }

                .bael-status-tabs {
                    display: flex;
                    padding: 0 20px;
                    gap: 8px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                .bael-status-tab {
                    padding: 12px 20px;
                    background: transparent;
                    border: none;
                    color: #888;
                    font-size: 13px;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                }

                .bael-status-tab.active {
                    color: #3b82f6;
                    border-bottom-color: #3b82f6;
                }

                .bael-status-tab:hover:not(.active) {
                    color: #ccc;
                }

                .bael-status-body {
                    padding: 20px;
                    max-height: calc(80vh - 200px);
                    overflow-y: auto;
                }

                .bael-status-view {
                    display: none;
                }

                .bael-status-view.active {
                    display: block;
                }

                .bael-agent-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .bael-agent-card {
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .bael-agent-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    flex-shrink: 0;
                }

                .bael-agent-info {
                    flex: 1;
                }

                .bael-agent-name {
                    color: white;
                    font-size: 15px;
                    font-weight: 600;
                    margin-bottom: 4px;
                }

                .bael-agent-task {
                    color: #888;
                    font-size: 13px;
                }

                .bael-agent-badge {
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 500;
                }

                .bael-agent-badge.active {
                    background: rgba(16, 185, 129, 0.2);
                    color: #10b981;
                }

                .bael-agent-badge.idle {
                    background: rgba(156, 163, 175, 0.2);
                    color: #9ca3af;
                }

                .bael-agent-badge.processing {
                    background: rgba(245, 158, 11, 0.2);
                    color: #f59e0b;
                }

                .bael-activity-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .bael-activity-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 12px;
                    background: rgba(255,255,255,0.02);
                    border-radius: 8px;
                }

                .bael-activity-icon {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    flex-shrink: 0;
                }

                .bael-activity-icon.message {
                    background: rgba(59, 130, 246, 0.2);
                }

                .bael-activity-icon.tool {
                    background: rgba(139, 92, 246, 0.2);
                }

                .bael-activity-icon.response {
                    background: rgba(16, 185, 129, 0.2);
                }

                .bael-activity-icon.error {
                    background: rgba(239, 68, 68, 0.2);
                }

                .bael-activity-content {
                    flex: 1;
                }

                .bael-activity-text {
                    color: #ccc;
                    font-size: 13px;
                    margin-bottom: 4px;
                }

                .bael-activity-time {
                    color: #666;
                    font-size: 11px;
                }

                .bael-status-empty {
                    text-align: center;
                    padding: 40px;
                    color: #666;
                }

                .bael-status-empty-icon {
                    font-size: 48px;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }
            `;

      const style = document.createElement("style");
      style.id = "bael-agent-status-styles";
      style.textContent = css;
      document.head.appendChild(style);
    }

    createElements() {
      // FAB Button
      this.fab = document.createElement("button");
      this.fab.className = "bael-status-fab";
      this.fab.innerHTML = '🤖<div class="bael-status-indicator"></div>';
      this.fab.title = "Agent Status (Ctrl+Shift+A)";
      this.fab.addEventListener("click", () => this.toggle());
      document.body.appendChild(this.fab);

      // Panel
      this.panel = document.createElement("div");
      this.panel.className = "bael-status-panel";
      this.panel.innerHTML = `
                <div class="bael-status-header">
                    <div class="bael-status-title">
                        <span>🤖</span>
                        <span>Agent Status</span>
                    </div>
                    <button class="bael-status-close">×</button>
                </div>
                <div class="bael-status-stats">
                    <div class="bael-status-stat">
                        <div class="bael-status-stat-value" id="bael-stat-total">0</div>
                        <div class="bael-status-stat-label">Total Agents</div>
                    </div>
                    <div class="bael-status-stat">
                        <div class="bael-status-stat-value" id="bael-stat-active">0</div>
                        <div class="bael-status-stat-label">Active</div>
                    </div>
                    <div class="bael-status-stat">
                        <div class="bael-status-stat-value" id="bael-stat-completed">0</div>
                        <div class="bael-status-stat-label">Completed</div>
                    </div>
                    <div class="bael-status-stat">
                        <div class="bael-status-stat-value" id="bael-stat-failed">0</div>
                        <div class="bael-status-stat-label">Failed</div>
                    </div>
                </div>
                <div class="bael-status-tabs">
                    <button class="bael-status-tab active" data-view="agents">Agents</button>
                    <button class="bael-status-tab" data-view="activity">Activity Log</button>
                </div>
                <div class="bael-status-body">
                    <div class="bael-status-view active" id="bael-view-agents">
                        <div class="bael-agent-list" id="bael-agent-list"></div>
                    </div>
                    <div class="bael-status-view" id="bael-view-activity">
                        <div class="bael-activity-list" id="bael-activity-list"></div>
                    </div>
                </div>
            `;
      document.body.appendChild(this.panel);

      // Events
      this.panel
        .querySelector(".bael-status-close")
        .addEventListener("click", () => this.hide());

      this.panel.querySelectorAll(".bael-status-tab").forEach((tab) => {
        tab.addEventListener("click", () => this.switchView(tab.dataset.view));
      });
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "A") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape" && this.visible) {
          this.hide();
        }
      });
    }

    startMonitoring() {
      // Monitor DOM for agent activity
      const observer = new MutationObserver((mutations) => {
        this.detectAgentActivity(mutations);
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      // Simulate initial agent
      this.registerAgent("Agent 0", "Main Agent", "idle");

      // Update display periodically
      setInterval(() => {
        if (this.visible) {
          this.updateDisplay();
        }
      }, 1000);
    }

    detectAgentActivity(mutations) {
      mutations.forEach((mutation) => {
        // Detect message additions
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              if (
                node.classList?.contains("message") ||
                node.querySelector?.('[class*="message"]')
              ) {
                this.logActivity("message", "New message received");
                this.updateAgentStatus("Agent 0", "processing");
              }

              // Detect tool usage
              if (
                node.textContent?.includes("tool_name") ||
                node.textContent?.includes("code_execution")
              ) {
                this.logActivity("tool", "Tool executed");
                this.stats.completedTasks++;
              }

              // Detect errors
              if (node.textContent?.toLowerCase().includes("error")) {
                this.logActivity("error", "Error detected");
                this.stats.failedTasks++;
              }
            }
          });
        }
      });
    }

    registerAgent(id, name, status = "idle") {
      this.agents.set(id, {
        id,
        name,
        status,
        currentTask: "Waiting for input",
        lastActive: Date.now(),
      });
      this.stats.totalAgents = this.agents.size;
      this.updateDisplay();
    }

    updateAgentStatus(id, status, task = null) {
      const agent = this.agents.get(id);
      if (agent) {
        agent.status = status;
        if (task) agent.currentTask = task;
        agent.lastActive = Date.now();

        // Update active count
        this.stats.activeAgents = [...this.agents.values()].filter(
          (a) => a.status !== "idle",
        ).length;

        // Update indicator
        const indicator = this.fab.querySelector(".bael-status-indicator");
        if (indicator) {
          indicator.classList.toggle("busy", this.stats.activeAgents > 0);
        }

        this.updateDisplay();
      }
    }

    logActivity(type, message) {
      this.activityLog.unshift({
        type,
        message,
        timestamp: Date.now(),
      });

      // Keep last 100 entries
      if (this.activityLog.length > 100) {
        this.activityLog.pop();
      }

      this.saveToStorage();
    }

    switchView(view) {
      this.panel.querySelectorAll(".bael-status-tab").forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.view === view);
      });

      this.panel.querySelectorAll(".bael-status-view").forEach((v) => {
        v.classList.toggle("active", v.id === `bael-view-${view}`);
      });
    }

    updateDisplay() {
      // Update stats
      this.panel.querySelector("#bael-stat-total").textContent =
        this.stats.totalAgents;
      this.panel.querySelector("#bael-stat-active").textContent =
        this.stats.activeAgents;
      this.panel.querySelector("#bael-stat-completed").textContent =
        this.stats.completedTasks;
      this.panel.querySelector("#bael-stat-failed").textContent =
        this.stats.failedTasks;

      // Update agent list
      this.renderAgents();

      // Update activity log
      this.renderActivity();
    }

    renderAgents() {
      const container = this.panel.querySelector("#bael-agent-list");

      if (this.agents.size === 0) {
        container.innerHTML = `
                    <div class="bael-status-empty">
                        <div class="bael-status-empty-icon">🤖</div>
                        <div>No agents detected</div>
                    </div>
                `;
        return;
      }

      container.innerHTML = [...this.agents.values()]
        .map(
          (agent) => `
                <div class="bael-agent-card">
                    <div class="bael-agent-avatar">🤖</div>
                    <div class="bael-agent-info">
                        <div class="bael-agent-name">${agent.name}</div>
                        <div class="bael-agent-task">${agent.currentTask}</div>
                    </div>
                    <div class="bael-agent-badge ${agent.status}">${agent.status}</div>
                </div>
            `,
        )
        .join("");
    }

    renderActivity() {
      const container = this.panel.querySelector("#bael-activity-list");

      if (this.activityLog.length === 0) {
        container.innerHTML = `
                    <div class="bael-status-empty">
                        <div class="bael-status-empty-icon">📋</div>
                        <div>No activity recorded</div>
                    </div>
                `;
        return;
      }

      const icons = {
        message: "💬",
        tool: "🔧",
        response: "✅",
        error: "❌",
      };

      container.innerHTML = this.activityLog
        .slice(0, 50)
        .map(
          (item) => `
                <div class="bael-activity-item">
                    <div class="bael-activity-icon ${item.type}">${icons[item.type] || "📋"}</div>
                    <div class="bael-activity-content">
                        <div class="bael-activity-text">${item.message}</div>
                        <div class="bael-activity-time">${this.formatTime(item.timestamp)}</div>
                    </div>
                </div>
            `,
        )
        .join("");
    }

    formatTime(timestamp) {
      const diff = Date.now() - timestamp;
      if (diff < 60000) return "Just now";
      if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
      return new Date(timestamp).toLocaleTimeString();
    }

    toggle() {
      this.visible ? this.hide() : this.show();
    }

    show() {
      this.updateDisplay();
      this.panel.classList.add("visible");
      this.visible = true;
    }

    hide() {
      this.panel.classList.remove("visible");
      this.visible = false;
    }

    loadFromStorage() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const data = JSON.parse(saved);
          this.activityLog = data.activityLog || [];
          this.stats = { ...this.stats, ...data.stats };
        }
      } catch (e) {}
    }

    saveToStorage() {
      try {
        localStorage.setItem(
          this.storageKey,
          JSON.stringify({
            activityLog: this.activityLog.slice(0, 100),
            stats: this.stats,
          }),
        );
      } catch (e) {}
    }
  }

  window.BaelAgentStatus = new BaelAgentStatus();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelAgentStatus.initialize();
    });
  } else {
    window.BaelAgentStatus.initialize();
  }
})();
