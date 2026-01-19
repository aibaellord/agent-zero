/**
 * BAEL - LORD OF ALL
 * Agent Monitor - Real-time visualization of agent thinking and actions
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelAgentMonitor {
    constructor() {
      this.panel = null;
      this.events = [];
      this.maxEvents = 100;
      this.isMonitoring = true;
      this.filters = {
        thoughts: true,
        tools: true,
        memory: true,
        code: true,
        errors: true,
      };
      this.init();
    }

    init() {
      this.addStyles();
      this.createUI();
      this.bindEvents();
      this.hookIntoAgent();
      console.log("🔍 Bael Agent Monitor initialized");
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-agent-monitor-styles";
      styles.textContent = `
                /* Monitor Panel */
                .bael-agent-monitor {
                    position: fixed;
                    top: 60px;
                    right: 20px;
                    width: 400px;
                    max-height: calc(100vh - 100px);
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100025;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                }

                .bael-agent-monitor.visible {
                    display: flex;
                    animation: monitorAppear 0.2s ease;
                }

                @keyframes monitorAppear {
                    from { opacity: 0; transform: translateX(10px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                /* Header */
                .monitor-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .monitor-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .monitor-status {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #4ade80;
                    animation: pulse 2s infinite;
                }

                .status-dot.paused {
                    background: #fbbf24;
                    animation: none;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                .monitor-controls {
                    display: flex;
                    gap: 6px;
                }

                .monitor-btn {
                    width: 28px;
                    height: 28px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .monitor-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-accent, #ff3366);
                }

                .monitor-btn.active {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: white;
                }

                .monitor-close {
                    background: transparent;
                    border: none;
                }

                /* Filters */
                .monitor-filters {
                    display: flex;
                    gap: 6px;
                    padding: 10px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    overflow-x: auto;
                }

                .filter-chip {
                    padding: 4px 10px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s ease;
                }

                .filter-chip:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .filter-chip.active {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: white;
                }

                /* Events List */
                .monitor-events {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px;
                }

                .event-item {
                    display: flex;
                    gap: 10px;
                    padding: 10px 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    margin-bottom: 8px;
                    animation: eventAppear 0.3s ease;
                }

                @keyframes eventAppear {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .event-icon {
                    width: 28px;
                    height: 28px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    flex-shrink: 0;
                }

                .event-icon.thought { background: rgba(99, 102, 241, 0.2); }
                .event-icon.tool { background: rgba(74, 222, 128, 0.2); }
                .event-icon.memory { background: rgba(251, 191, 36, 0.2); }
                .event-icon.code { background: rgba(139, 92, 246, 0.2); }
                .event-icon.error { background: rgba(248, 113, 113, 0.2); }

                .event-content {
                    flex: 1;
                    min-width: 0;
                }

                .event-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 4px;
                }

                .event-type {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .event-time {
                    font-size: 10px;
                    color: var(--bael-text-muted, #555);
                }

                .event-text {
                    font-size: 12px;
                    color: var(--bael-text-muted, #888);
                    line-height: 1.4;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }

                .event-expand {
                    font-size: 10px;
                    color: var(--bael-accent, #ff3366);
                    cursor: pointer;
                    margin-top: 4px;
                }

                .event-text.expanded {
                    -webkit-line-clamp: unset;
                }

                /* Empty state */
                .monitor-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    color: var(--bael-text-muted, #666);
                }

                .empty-icon {
                    font-size: 36px;
                    margin-bottom: 12px;
                }

                /* Footer */
                .monitor-footer {
                    padding: 10px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .monitor-stats {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .monitor-clear {
                    padding: 5px 10px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    font-size: 10px;
                    cursor: pointer;
                }

                .monitor-clear:hover {
                    border-color: #f87171;
                    color: #f87171;
                }

                /* Floating button */
                .bael-monitor-btn {
                    position: fixed;
                    bottom: 305px;
                    right: 20px;
                    width: 44px;
                    height: 44px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    z-index: 100005;
                    transition: all 0.3s ease;
                }

                .bael-monitor-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.1);
                }

                .monitor-badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    background: var(--bael-accent, #ff3366);
                    color: white;
                    font-size: 10px;
                    font-weight: 600;
                    padding: 2px 6px;
                    border-radius: 10px;
                    display: none;
                }

                .monitor-badge.visible {
                    display: block;
                    animation: badgePop 0.3s ease;
                }

                @keyframes badgePop {
                    0% { transform: scale(0); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                }
            `;
      document.head.appendChild(styles);
    }

    createUI() {
      // Floating button
      const button = document.createElement("button");
      button.className = "bael-monitor-btn";
      button.innerHTML = `
                🔍
                <span class="monitor-badge" id="monitor-badge">0</span>
            `;
      button.title = "Agent Monitor (Ctrl+Shift+L)";
      button.addEventListener("click", () => this.togglePanel());
      document.body.appendChild(button);
      this.button = button;

      // Main panel
      const panel = document.createElement("div");
      panel.className = "bael-agent-monitor";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;

      this.bindPanelEvents();
    }

    renderPanel() {
      return `
                <div class="monitor-header">
                    <div class="monitor-title">
                        <div class="monitor-status">
                            <span class="status-dot ${this.isMonitoring ? "" : "paused"}"></span>
                        </div>
                        <span>🔍 Agent Monitor</span>
                    </div>
                    <div class="monitor-controls">
                        <button class="monitor-btn ${this.isMonitoring ? "active" : ""}" id="toggle-monitor" title="Pause/Resume">
                            ${this.isMonitoring ? "⏸" : "▶"}
                        </button>
                        <button class="monitor-btn monitor-close">×</button>
                    </div>
                </div>

                <div class="monitor-filters">
                    ${Object.entries(this.filters)
                      .map(
                        ([key, active]) => `
                        <div class="filter-chip ${active ? "active" : ""}" data-filter="${key}">
                            ${this.getFilterIcon(key)} ${key}
                        </div>
                    `,
                      )
                      .join("")}
                </div>

                <div class="monitor-events" id="monitor-events">
                    ${this.renderEvents()}
                </div>

                <div class="monitor-footer">
                    <div class="monitor-stats">${this.events.length} event${this.events.length !== 1 ? "s" : ""}</div>
                    <button class="monitor-clear" id="clear-events">Clear</button>
                </div>
            `;
    }

    renderEvents() {
      const filteredEvents = this.events.filter((e) => this.filters[e.type]);

      if (filteredEvents.length === 0) {
        return `
                    <div class="monitor-empty">
                        <div class="empty-icon">🔍</div>
                        <div>No events yet</div>
                    </div>
                `;
      }

      return filteredEvents
        .map(
          (event) => `
                <div class="event-item">
                    <div class="event-icon ${event.type}">${this.getEventIcon(event.type)}</div>
                    <div class="event-content">
                        <div class="event-header">
                            <span class="event-type">${this.capitalizeFirst(event.type)}</span>
                            <span class="event-time">${this.formatTime(event.timestamp)}</span>
                        </div>
                        <div class="event-text">${this.escapeHtml(event.text)}</div>
                        ${event.text.length > 100 ? '<div class="event-expand">Show more</div>' : ""}
                    </div>
                </div>
            `,
        )
        .join("");
    }

    getFilterIcon(type) {
      const icons = {
        thoughts: "💭",
        tools: "🔧",
        memory: "🧠",
        code: "💻",
        errors: "❌",
      };
      return icons[type] || "📝";
    }

    getEventIcon(type) {
      const icons = {
        thought: "💭",
        tool: "🔧",
        memory: "🧠",
        code: "💻",
        error: "❌",
      };
      return icons[type] || "📝";
    }

    bindPanelEvents() {
      this.panel
        .querySelector(".monitor-close")
        .addEventListener("click", () => this.closePanel());
      this.panel
        .querySelector("#toggle-monitor")
        .addEventListener("click", () => this.toggleMonitoring());
      this.panel
        .querySelector("#clear-events")
        .addEventListener("click", () => this.clearEvents());

      // Filters
      this.panel.querySelectorAll(".filter-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          const filter = chip.dataset.filter;
          this.filters[filter] = !this.filters[filter];
          chip.classList.toggle("active");
          this.refreshEvents();
        });
      });

      // Expand events
      this.panel.querySelectorAll(".event-expand").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const text = e.target.previousElementSibling;
          text.classList.toggle("expanded");
          e.target.textContent = text.classList.contains("expanded")
            ? "Show less"
            : "Show more";
        });
      });
    }

    bindEvents() {
      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "L") {
          e.preventDefault();
          this.togglePanel();
        }
      });
    }

    hookIntoAgent() {
      // Listen for agent events
      window.addEventListener("bael-agent-event", (e) => {
        if (this.isMonitoring) {
          this.addEvent(e.detail);
        }
      });

      // Simulate some events for demo
      this.simulateEvents();
    }

    simulateEvents() {
      // Add some demo events
      const demoEvents = [
        {
          type: "thought",
          text: "Analyzing user request and determining best approach...",
        },
        {
          type: "tool",
          text: "Invoking code_execution_tool with Python script",
        },
        {
          type: "memory",
          text: "Retrieved relevant context from memory: project structure, recent changes",
        },
        {
          type: "code",
          text: "Executing: python analyze.py --input data.json",
        },
      ];

      demoEvents.forEach((event, i) => {
        setTimeout(() => {
          if (this.isMonitoring) {
            this.addEvent(event);
          }
        }, i * 1000);
      });
    }

    addEvent(event) {
      this.events.unshift({
        ...event,
        timestamp: Date.now(),
      });

      // Limit events
      if (this.events.length > this.maxEvents) {
        this.events.pop();
      }

      this.updateBadge();
      this.refreshEvents();
    }

    refreshEvents() {
      const eventsContainer = this.panel.querySelector("#monitor-events");
      eventsContainer.innerHTML = this.renderEvents();

      // Re-bind expand listeners
      eventsContainer.querySelectorAll(".event-expand").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const text = e.target.previousElementSibling;
          text.classList.toggle("expanded");
          e.target.textContent = text.classList.contains("expanded")
            ? "Show less"
            : "Show more";
        });
      });

      // Update stats
      this.panel.querySelector(".monitor-stats").textContent =
        `${this.events.length} event${this.events.length !== 1 ? "s" : ""}`;
    }

    updateBadge() {
      const badge = this.button.querySelector(".monitor-badge");
      const count = this.events.length;
      badge.textContent = count > 99 ? "99+" : count;
      badge.classList.toggle(
        "visible",
        count > 0 && !this.panel.classList.contains("visible"),
      );
    }

    toggleMonitoring() {
      this.isMonitoring = !this.isMonitoring;
      const btn = this.panel.querySelector("#toggle-monitor");
      const dot = this.panel.querySelector(".status-dot");

      btn.innerHTML = this.isMonitoring ? "⏸" : "▶";
      btn.classList.toggle("active", this.isMonitoring);
      dot.classList.toggle("paused", !this.isMonitoring);
    }

    clearEvents() {
      this.events = [];
      this.updateBadge();
      this.refreshEvents();
    }

    togglePanel() {
      this.panel.classList.toggle("visible");
      if (this.panel.classList.contains("visible")) {
        this.button.querySelector(".monitor-badge").classList.remove("visible");
      }
    }

    closePanel() {
      this.panel.classList.remove("visible");
    }

    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString();
    }

    capitalizeFirst(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    // Public API
    log(type, text) {
      this.addEvent({ type, text });
    }
  }

  // Initialize
  window.BaelAgentMonitor = new BaelAgentMonitor();
})();
