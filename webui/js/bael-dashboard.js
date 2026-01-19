/**
 * BAEL - LORD OF ALL
 * Dashboard Widgets - Customizable dashboard with draggable widgets
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelDashboard {
    constructor() {
      this.container = null;
      this.isVisible = false;
      this.widgets = [];
      this.layout = [];
      this.gridSize = { cols: 12, rows: 8 };
      this.draggedWidget = null;
      this.init();
    }

    init() {
      this.loadLayout();
      this.createContainer();
      this.addStyles();
      this.bindEvents();
      this.registerDefaultWidgets();
      console.log("📊 Bael Dashboard initialized");
    }

    loadLayout() {
      try {
        this.layout = JSON.parse(
          localStorage.getItem("bael_dashboard_layout") || "[]",
        );
      } catch (e) {
        this.layout = [];
      }
    }

    saveLayout() {
      localStorage.setItem(
        "bael_dashboard_layout",
        JSON.stringify(this.layout),
      );
    }

    registerDefaultWidgets() {
      // System Status Widget
      this.registerWidget({
        id: "system-status",
        name: "System Status",
        icon: "🖥️",
        minWidth: 2,
        minHeight: 2,
        render: (container) => {
          container.innerHTML = `
                        <div class="widget-metric">
                            <span class="metric-label">Memory</span>
                            <div class="metric-bar"><div class="metric-fill" style="width: ${Math.random() * 100}%"></div></div>
                        </div>
                        <div class="widget-metric">
                            <span class="metric-label">CPU</span>
                            <div class="metric-bar"><div class="metric-fill" style="width: ${Math.random() * 100}%"></div></div>
                        </div>
                        <div class="widget-metric">
                            <span class="metric-label">Network</span>
                            <span class="metric-value">Active</span>
                        </div>
                    `;
        },
      });

      // Quick Actions Widget
      this.registerWidget({
        id: "quick-actions",
        name: "Quick Actions",
        icon: "⚡",
        minWidth: 2,
        minHeight: 2,
        render: (container) => {
          container.innerHTML = `
                        <div class="widget-actions">
                            <button class="action-btn" onclick="window.BaelPlayground?.open()">
                                <span>💻</span> Code
                            </button>
                            <button class="action-btn" onclick="window.BaelTimeline?.open()">
                                <span>📜</span> Timeline
                            </button>
                            <button class="action-btn" onclick="window.BaelNotes?.show()">
                                <span>📝</span> Notes
                            </button>
                            <button class="action-btn" onclick="window.BaelPromptLibrary?.open()">
                                <span>📚</span> Prompts
                            </button>
                        </div>
                    `;
        },
      });

      // Recent Chats Widget
      this.registerWidget({
        id: "recent-chats",
        name: "Recent Chats",
        icon: "💬",
        minWidth: 3,
        minHeight: 2,
        render: (container) => {
          const chats = JSON.parse(
            localStorage.getItem("bael_recent_chats") || "[]",
          ).slice(0, 5);
          container.innerHTML = chats.length
            ? chats
                .map(
                  (chat) => `
                        <div class="widget-list-item">
                            <span class="item-icon">💬</span>
                            <span class="item-text">${chat.title || "Untitled Chat"}</span>
                            <span class="item-time">${this.formatTime(chat.timestamp)}</span>
                        </div>
                    `,
                )
                .join("")
            : '<div class="widget-empty">No recent chats</div>';
        },
      });

      // Token Usage Widget
      this.registerWidget({
        id: "token-usage",
        name: "Token Usage",
        icon: "🎯",
        minWidth: 2,
        minHeight: 2,
        render: (container) => {
          const usage = parseInt(
            sessionStorage.getItem("bael_total_tokens") || "0",
          );
          const limit = 100000;
          const percent = ((usage / limit) * 100).toFixed(1);
          container.innerHTML = `
                        <div class="token-display">
                            <div class="token-circle">
                                <svg viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="16" fill="none" stroke="#2a2a3a" stroke-width="3"/>
                                    <circle cx="18" cy="18" r="16" fill="none" stroke="var(--bael-accent)" stroke-width="3"
                                        stroke-dasharray="${percent} 100" transform="rotate(-90 18 18)"/>
                                </svg>
                                <span class="token-percent">${percent}%</span>
                            </div>
                            <div class="token-info">
                                <span class="token-used">${usage.toLocaleString()}</span>
                                <span class="token-label">tokens used</span>
                            </div>
                        </div>
                    `;
        },
      });

      // Clock Widget
      this.registerWidget({
        id: "clock",
        name: "Clock",
        icon: "🕐",
        minWidth: 2,
        minHeight: 1,
        render: (container) => {
          const updateClock = () => {
            const now = new Date();
            container.innerHTML = `
                            <div class="clock-display">
                                <span class="clock-time">${now.toLocaleTimeString()}</span>
                                <span class="clock-date">${now.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</span>
                            </div>
                        `;
          };
          updateClock();
          setInterval(updateClock, 1000);
        },
      });

      // Weather Widget (placeholder)
      this.registerWidget({
        id: "weather",
        name: "Weather",
        icon: "🌤️",
        minWidth: 2,
        minHeight: 2,
        render: (container) => {
          container.innerHTML = `
                        <div class="weather-display">
                            <span class="weather-icon">☀️</span>
                            <span class="weather-temp">72°F</span>
                            <span class="weather-desc">Sunny</span>
                        </div>
                    `;
        },
      });

      // Notes Preview Widget
      this.registerWidget({
        id: "notes-preview",
        name: "Quick Notes",
        icon: "📝",
        minWidth: 3,
        minHeight: 2,
        render: (container) => {
          const notes = localStorage.getItem("bael_notes") || "";
          container.innerHTML = `
                        <div class="notes-preview-content">${notes.substring(0, 200) || "No notes yet..."}</div>
                        <button class="notes-preview-btn" onclick="window.BaelNotes?.show()">Open Notes</button>
                    `;
        },
      });

      // Model Status Widget
      this.registerWidget({
        id: "model-status",
        name: "AI Model",
        icon: "🤖",
        minWidth: 2,
        minHeight: 1,
        render: (container) => {
          const model = localStorage.getItem("bael_current_model") || "GPT-4";
          container.innerHTML = `
                        <div class="model-status-display">
                            <span class="model-badge">${model}</span>
                            <span class="model-status online">Ready</span>
                        </div>
                    `;
        },
      });
    }

    registerWidget(config) {
      this.widgets.push(config);
    }

    createContainer() {
      const container = document.createElement("div");
      container.id = "bael-dashboard";
      container.className = "bael-dashboard";
      container.innerHTML = `
                <div class="dashboard-header">
                    <div class="dashboard-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="7"/>
                            <rect x="14" y="3" width="7" height="7"/>
                            <rect x="14" y="14" width="7" height="7"/>
                            <rect x="3" y="14" width="7" height="7"/>
                        </svg>
                        <span>Dashboard</span>
                    </div>
                    <div class="dashboard-controls">
                        <button class="dash-btn" id="dash-add-widget">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                            Add Widget
                        </button>
                        <button class="dash-btn" id="dash-reset">Reset</button>
                    </div>
                    <button class="dashboard-close" id="dashboard-close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <div class="dashboard-grid" id="dashboard-grid">
                    <!-- Widgets rendered here -->
                </div>

                <div class="widget-picker" id="widget-picker">
                    <div class="picker-header">
                        <span>Add Widget</span>
                        <button class="picker-close" id="picker-close">×</button>
                    </div>
                    <div class="picker-grid" id="picker-grid"></div>
                </div>
            `;
      document.body.appendChild(container);
      this.container = container;

      // Create backdrop
      const backdrop = document.createElement("div");
      backdrop.className = "bael-dashboard-backdrop";
      backdrop.addEventListener("click", () => this.close());
      document.body.appendChild(backdrop);
      this.backdrop = backdrop;

      this.createTrigger();
      this.renderDashboard();
    }

    createTrigger() {
      const trigger = document.createElement("button");
      trigger.id = "bael-dashboard-trigger";
      trigger.className = "bael-dashboard-trigger";
      trigger.title = "Dashboard (Ctrl+Shift+D)";
      trigger.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="7" height="7"/>
                    <rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                </svg>
            `;
      document.body.appendChild(trigger);
      trigger.addEventListener("click", () => this.toggle());
    }

    addStyles() {
      if (document.getElementById("bael-dashboard-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-dashboard-styles";
      styles.textContent = `
                .bael-dashboard {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 1100px;
                    max-width: 95vw;
                    height: 750px;
                    max-height: 90vh;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100021;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
                    overflow: hidden;
                }

                .bael-dashboard.visible {
                    display: flex;
                    animation: dashboardZoom 0.3s ease;
                }

                @keyframes dashboardZoom {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .dashboard-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .dashboard-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .dashboard-title svg {
                    width: 22px;
                    height: 22px;
                    color: var(--bael-accent, #ff3366);
                }

                .dashboard-controls {
                    display: flex;
                    gap: 8px;
                    margin-left: auto;
                }

                .dash-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .dash-btn:hover {
                    background: rgba(255, 51, 102, 0.1);
                    border-color: var(--bael-accent, #ff3366);
                }

                .dash-btn svg {
                    width: 14px;
                    height: 14px;
                }

                .dashboard-close {
                    width: 36px;
                    height: 36px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-left: 12px;
                }

                .dashboard-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                .dashboard-close svg {
                    width: 20px;
                    height: 20px;
                }

                .dashboard-grid {
                    flex: 1;
                    padding: 20px;
                    display: grid;
                    grid-template-columns: repeat(12, 1fr);
                    grid-auto-rows: 80px;
                    gap: 16px;
                    overflow: auto;
                }

                .dashboard-widget {
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    transition: all 0.2s ease;
                }

                .dashboard-widget:hover {
                    border-color: var(--bael-accent, #ff3366);
                    box-shadow: 0 4px 20px rgba(255, 51, 102, 0.1);
                }

                .widget-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 14px;
                    background: rgba(0, 0, 0, 0.2);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    cursor: move;
                }

                .widget-icon {
                    font-size: 14px;
                }

                .widget-name {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    flex: 1;
                }

                .widget-remove {
                    width: 20px;
                    height: 20px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: all 0.2s ease;
                }

                .dashboard-widget:hover .widget-remove {
                    opacity: 1;
                }

                .widget-remove:hover {
                    background: rgba(255, 0, 0, 0.2);
                    color: #f44336;
                }

                .widget-content {
                    flex: 1;
                    padding: 12px;
                    overflow: auto;
                }

                /* Widget-specific styles */
                .widget-metric {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 8px;
                }

                .metric-label {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                    min-width: 60px;
                }

                .metric-bar {
                    flex: 1;
                    height: 8px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .metric-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--bael-accent, #ff3366), #ff6699);
                    border-radius: 4px;
                    transition: width 0.5s ease;
                }

                .metric-value {
                    font-size: 11px;
                    color: #4caf50;
                    font-weight: 600;
                }

                .widget-actions {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }

                .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 10px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .action-btn:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                }

                .widget-list-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-radius: 6px;
                    margin-bottom: 6px;
                }

                .item-icon {
                    font-size: 12px;
                }

                .item-text {
                    flex: 1;
                    font-size: 12px;
                    color: var(--bael-text-primary, #fff);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .item-time {
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                }

                .widget-empty {
                    text-align: center;
                    padding: 20px;
                    color: var(--bael-text-muted, #666);
                    font-size: 12px;
                }

                .token-display {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .token-circle {
                    position: relative;
                    width: 60px;
                    height: 60px;
                }

                .token-circle svg {
                    width: 100%;
                    height: 100%;
                }

                .token-percent {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 12px;
                    font-weight: 700;
                    color: var(--bael-text-primary, #fff);
                }

                .token-info {
                    display: flex;
                    flex-direction: column;
                }

                .token-used {
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--bael-text-primary, #fff);
                }

                .token-label {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .clock-display {
                    text-align: center;
                }

                .clock-time {
                    display: block;
                    font-size: 28px;
                    font-weight: 700;
                    color: var(--bael-text-primary, #fff);
                }

                .clock-date {
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                }

                .weather-display {
                    text-align: center;
                }

                .weather-icon {
                    font-size: 36px;
                    display: block;
                }

                .weather-temp {
                    font-size: 24px;
                    font-weight: 700;
                    color: var(--bael-text-primary, #fff);
                    display: block;
                }

                .weather-desc {
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                }

                .notes-preview-content {
                    font-size: 12px;
                    color: var(--bael-text-secondary, #aaa);
                    line-height: 1.5;
                    overflow: hidden;
                    max-height: 60px;
                }

                .notes-preview-btn {
                    margin-top: 8px;
                    padding: 6px 12px;
                    background: var(--bael-accent, #ff3366);
                    border: none;
                    border-radius: 4px;
                    color: #fff;
                    font-size: 11px;
                    cursor: pointer;
                }

                .model-status-display {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .model-badge {
                    padding: 4px 12px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .model-status {
                    font-size: 11px;
                    font-weight: 600;
                }

                .model-status.online {
                    color: #4caf50;
                }

                /* Widget Picker */
                .widget-picker {
                    position: absolute;
                    top: 80px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 400px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                    z-index: 10;
                    display: none;
                }

                .widget-picker.visible {
                    display: block;
                    animation: fadeIn 0.2s ease;
                }

                .picker-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 14px 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .picker-close {
                    width: 24px;
                    height: 24px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    font-size: 18px;
                    cursor: pointer;
                }

                .picker-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    padding: 16px;
                    max-height: 300px;
                    overflow-y: auto;
                }

                .picker-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .picker-item:hover {
                    border-color: var(--bael-accent, #ff3366);
                    background: rgba(255, 51, 102, 0.1);
                }

                .picker-item span:first-child {
                    font-size: 18px;
                }

                .picker-item span:last-child {
                    font-size: 12px;
                    color: var(--bael-text-primary, #fff);
                }

                /* Trigger */
                .bael-dashboard-trigger {
                    position: fixed;
                    bottom: 210px;
                    right: 20px;
                    width: 48px;
                    height: 48px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9987;
                    transition: all 0.3s ease;
                }

                .bael-dashboard-trigger:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.1);
                }

                .bael-dashboard-trigger svg {
                    width: 22px;
                    height: 22px;
                    color: var(--bael-text-primary, #fff);
                }

                /* Backdrop */
                .bael-dashboard-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    z-index: 100020;
                    display: none;
                }

                .bael-dashboard-backdrop.visible {
                    display: block;
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `;
      document.head.appendChild(styles);
    }

    bindEvents() {
      // Close
      this.container
        .querySelector("#dashboard-close")
        .addEventListener("click", () => this.close());

      // Add widget
      this.container
        .querySelector("#dash-add-widget")
        .addEventListener("click", () => {
          this.toggleWidgetPicker();
        });

      // Reset
      this.container
        .querySelector("#dash-reset")
        .addEventListener("click", () => {
          if (confirm("Reset dashboard to default layout?")) {
            this.layout = [];
            this.saveLayout();
            this.renderDashboard();
          }
        });

      // Picker close
      this.container
        .querySelector("#picker-close")
        .addEventListener("click", () => {
          this.toggleWidgetPicker(false);
        });

      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "D") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape" && this.isVisible) {
          this.close();
        }
      });
    }

    renderDashboard() {
      const grid = this.container.querySelector("#dashboard-grid");

      // If no layout, create default
      if (this.layout.length === 0) {
        this.layout = [
          { widgetId: "clock", col: 1, row: 1, width: 3, height: 1 },
          { widgetId: "system-status", col: 4, row: 1, width: 3, height: 2 },
          { widgetId: "quick-actions", col: 7, row: 1, width: 3, height: 2 },
          { widgetId: "token-usage", col: 10, row: 1, width: 3, height: 2 },
          { widgetId: "model-status", col: 1, row: 2, width: 3, height: 1 },
          { widgetId: "recent-chats", col: 1, row: 3, width: 4, height: 2 },
          { widgetId: "notes-preview", col: 5, row: 3, width: 4, height: 2 },
          { widgetId: "weather", col: 9, row: 3, width: 4, height: 2 },
        ];
        this.saveLayout();
      }

      grid.innerHTML = "";

      this.layout.forEach((item, index) => {
        const widget = this.widgets.find((w) => w.id === item.widgetId);
        if (!widget) return;

        const el = document.createElement("div");
        el.className = "dashboard-widget";
        el.style.gridColumn = `${item.col} / span ${item.width}`;
        el.style.gridRow = `${item.row} / span ${item.height}`;
        el.dataset.index = index;

        el.innerHTML = `
                    <div class="widget-header">
                        <span class="widget-icon">${widget.icon}</span>
                        <span class="widget-name">${widget.name}</span>
                        <button class="widget-remove">×</button>
                    </div>
                    <div class="widget-content"></div>
                `;

        // Render widget content
        const content = el.querySelector(".widget-content");
        widget.render(content);

        // Remove button
        el.querySelector(".widget-remove").addEventListener("click", () => {
          this.removeWidget(index);
        });

        // Drag functionality
        this.setupDrag(el, index);

        grid.appendChild(el);
      });

      this.renderWidgetPicker();
    }

    setupDrag(element, index) {
      const header = element.querySelector(".widget-header");
      let isDragging = false;
      let startX, startY;

      header.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        element.style.opacity = "0.7";
        element.style.zIndex = "100";
      });

      document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        // Simple drag indication
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        element.style.transform = `translate(${dx}px, ${dy}px)`;
      });

      document.addEventListener("mouseup", () => {
        if (!isDragging) return;
        isDragging = false;
        element.style.opacity = "";
        element.style.zIndex = "";
        element.style.transform = "";
      });
    }

    removeWidget(index) {
      this.layout.splice(index, 1);
      this.saveLayout();
      this.renderDashboard();
    }

    toggleWidgetPicker(show = undefined) {
      const picker = this.container.querySelector("#widget-picker");
      if (show === undefined) {
        picker.classList.toggle("visible");
      } else {
        picker.classList.toggle("visible", show);
      }
    }

    renderWidgetPicker() {
      const grid = this.container.querySelector("#picker-grid");
      const placedIds = this.layout.map((l) => l.widgetId);

      grid.innerHTML = this.widgets
        .filter((w) => !placedIds.includes(w.id))
        .map(
          (w) => `
                    <div class="picker-item" data-id="${w.id}">
                        <span>${w.icon}</span>
                        <span>${w.name}</span>
                    </div>
                `,
        )
        .join("");

      grid.querySelectorAll(".picker-item").forEach((item) => {
        item.addEventListener("click", () => {
          this.addWidget(item.dataset.id);
        });
      });
    }

    addWidget(widgetId) {
      const widget = this.widgets.find((w) => w.id === widgetId);
      if (!widget) return;

      // Find next available position
      let col = 1,
        row = 1;
      const maxRow = Math.max(...this.layout.map((l) => l.row + l.height), 1);
      row = maxRow;

      this.layout.push({
        widgetId,
        col,
        row,
        width: widget.minWidth || 2,
        height: widget.minHeight || 2,
      });

      this.saveLayout();
      this.renderDashboard();
      this.toggleWidgetPicker(false);
    }

    formatTime(timestamp) {
      if (!timestamp) return "";
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      return date.toLocaleDateString();
    }

    // Public API
    open() {
      this.isVisible = true;
      this.container.classList.add("visible");
      this.backdrop.classList.add("visible");
      this.renderDashboard();
    }

    close() {
      this.isVisible = false;
      this.container.classList.remove("visible");
      this.backdrop.classList.remove("visible");
      this.toggleWidgetPicker(false);
    }

    toggle() {
      if (this.isVisible) {
        this.close();
      } else {
        this.open();
      }
    }
  }

  // Initialize
  window.BaelDashboard = new BaelDashboard();
})();
