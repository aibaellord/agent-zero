/**
 * BAEL - LORD OF ALL
 * Timeline Visualizer - Visual timeline of agent actions and decisions
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelTimelineVisualizer {
    constructor() {
      this.events = [];
      this.panel = null;
      this.isRecording = true;
      this.filters = { all: true };
      this.maxEvents = 500;
      this.init();
    }

    init() {
      this.addStyles();
      this.createUI();
      this.bindEvents();
      this.hookIntoSystem();
      console.log("⏱️ Bael Timeline Visualizer initialized");
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-timeline-styles";
      styles.textContent = `
                /* Toggle Button */
                .bael-timeline-toggle {
                    position: fixed;
                    bottom: 200px;
                    right: 20px;
                    width: 44px;
                    height: 44px;
                    background: linear-gradient(135deg, #f97316, #ea580c);
                    border: none;
                    border-radius: 12px;
                    color: white;
                    font-size: 18px;
                    cursor: pointer;
                    z-index: 100020;
                    box-shadow: 0 4px 20px rgba(249, 115, 22, 0.4);
                    transition: all 0.3s ease;
                }

                .bael-timeline-toggle:hover {
                    transform: scale(1.1);
                }

                .bael-timeline-toggle .event-count {
                    position: absolute;
                    top: -5px;
                    right: -5px;
                    min-width: 20px;
                    height: 20px;
                    background: var(--bael-accent, #ff3366);
                    border-radius: 10px;
                    font-size: 10px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 5px;
                }

                /* Timeline Panel */
                .bael-timeline-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 800px;
                    height: 600px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100050;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
                    overflow: hidden;
                }

                .bael-timeline-panel.visible {
                    display: flex;
                    animation: timelinePanelIn 0.3s ease;
                }

                @keyframes timelinePanelIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                /* Header */
                .tl-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 18px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .tl-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .tl-title-icon {
                    width: 32px;
                    height: 32px;
                    background: linear-gradient(135deg, #f97316, #ea580c);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                }

                .tl-controls {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .tl-control-btn {
                    padding: 8px 12px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    font-size: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s ease;
                }

                .tl-control-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                .tl-control-btn.recording {
                    border-color: #ef4444;
                    color: #ef4444;
                }

                .tl-control-btn.recording::before {
                    content: '';
                    width: 8px;
                    height: 8px;
                    background: #ef4444;
                    border-radius: 50%;
                    animation: recordPulse 1s infinite;
                }

                @keyframes recordPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }

                .tl-close-btn {
                    width: 32px;
                    height: 32px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    transition: all 0.2s ease;
                }

                .tl-close-btn:hover {
                    border-color: #ef4444;
                    color: #ef4444;
                }

                /* Filters */
                .tl-filters {
                    display: flex;
                    gap: 6px;
                    padding: 12px 18px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    flex-wrap: wrap;
                }

                .tl-filter {
                    padding: 6px 12px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 15px;
                    font-size: 11px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: var(--bael-text-muted, #666);
                    transition: all 0.2s ease;
                }

                .tl-filter:hover {
                    border-color: var(--filter-color, #666);
                    color: var(--filter-color, #fff);
                }

                .tl-filter.active {
                    background: var(--filter-color, #ff3366);
                    border-color: var(--filter-color, #ff3366);
                    color: #fff;
                }

                .tl-filter-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: var(--filter-color, #666);
                }

                /* Timeline Content */
                .tl-content {
                    flex: 1;
                    display: flex;
                    overflow: hidden;
                }

                /* Timeline Track */
                .tl-track {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    position: relative;
                }

                .tl-track::before {
                    content: '';
                    position: absolute;
                    left: 35px;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: var(--bael-border, #2a2a3a);
                }

                /* Event Item */
                .tl-event {
                    position: relative;
                    padding-left: 50px;
                    margin-bottom: 20px;
                    animation: eventIn 0.3s ease;
                }

                @keyframes eventIn {
                    from { opacity: 0; transform: translateX(-10px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                .tl-event-dot {
                    position: absolute;
                    left: 27px;
                    top: 5px;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: var(--event-color, #ff3366);
                    border: 3px solid var(--bael-bg-primary, #0a0a0f);
                    z-index: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 8px;
                }

                .tl-event-card {
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    padding: 12px 14px;
                    transition: all 0.2s ease;
                }

                .tl-event-card:hover {
                    border-color: var(--event-color, #ff3366);
                }

                .tl-event-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 6px;
                }

                .tl-event-type {
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    color: var(--event-color, #ff3366);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .tl-event-time {
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                }

                .tl-event-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 4px;
                }

                .tl-event-desc {
                    font-size: 12px;
                    color: var(--bael-text-muted, #888);
                    line-height: 1.5;
                }

                .tl-event-details {
                    margin-top: 8px;
                    padding-top: 8px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    font-family: 'Monaco', 'Menlo', monospace;
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                    background: var(--bael-bg-tertiary, #181820);
                    border-radius: 6px;
                    padding: 8px;
                    max-height: 100px;
                    overflow-y: auto;
                    white-space: pre-wrap;
                    word-break: break-all;
                }

                /* Stats Sidebar */
                .tl-stats {
                    width: 200px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-left: 1px solid var(--bael-border, #2a2a3a);
                    padding: 14px;
                    overflow-y: auto;
                }

                .tl-stats-title {
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    color: var(--bael-text-muted, #666);
                    margin-bottom: 12px;
                }

                .tl-stat-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    margin-bottom: 8px;
                }

                .tl-stat-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    color: var(--bael-text-muted, #888);
                }

                .tl-stat-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                .tl-stat-value {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--bael-text-primary, #fff);
                }

                /* Empty State */
                .tl-empty {
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--bael-text-muted, #666);
                }

                .tl-empty-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                    opacity: 0.5;
                }

                .tl-empty-text {
                    font-size: 14px;
                }
            `;
      document.head.appendChild(styles);
    }

    createUI() {
      // Toggle button
      const toggle = document.createElement("button");
      toggle.className = "bael-timeline-toggle";
      toggle.innerHTML = '⏱️<span class="event-count">0</span>';
      toggle.title = "Timeline Visualizer (Ctrl+Shift+T)";
      toggle.addEventListener("click", () => this.toggle());
      document.body.appendChild(toggle);
      this.toggleBtn = toggle;

      // Panel
      const panel = document.createElement("div");
      panel.className = "bael-timeline-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;

      this.bindPanelEvents();
    }

    renderPanel() {
      return `
                <div class="tl-header">
                    <div class="tl-title">
                        <div class="tl-title-icon">⏱️</div>
                        <span>Timeline Visualizer</span>
                    </div>
                    <div class="tl-controls">
                        <button class="tl-control-btn ${this.isRecording ? "recording" : ""}" id="tl-record">
                            ${this.isRecording ? "Recording" : "Paused"}
                        </button>
                        <button class="tl-control-btn" id="tl-clear">Clear</button>
                        <button class="tl-control-btn" id="tl-export">Export</button>
                        <button class="tl-close-btn" id="tl-close">✕</button>
                    </div>
                </div>

                <div class="tl-filters">
                    ${this.renderFilters()}
                </div>

                <div class="tl-content">
                    <div class="tl-track" id="tl-track">
                        ${this.renderTimeline()}
                    </div>
                    <div class="tl-stats">
                        ${this.renderStats()}
                    </div>
                </div>
            `;
    }

    renderFilters() {
      const types = [
        { id: "all", name: "All", color: "#888" },
        { id: "message", name: "Messages", color: "#6366f1" },
        { id: "tool", name: "Tools", color: "#4ade80" },
        { id: "thinking", name: "Thinking", color: "#fbbf24" },
        { id: "error", name: "Errors", color: "#ef4444" },
        { id: "system", name: "System", color: "#8b5cf6" },
      ];

      return types
        .map(
          (t) => `
                <button class="tl-filter ${this.filters[t.id] || this.filters.all ? "active" : ""}"
                        data-type="${t.id}"
                        style="--filter-color: ${t.color}">
                    <span class="tl-filter-dot"></span>
                    ${t.name}
                </button>
            `,
        )
        .join("");
    }

    renderTimeline() {
      if (this.events.length === 0) {
        return `
                    <div class="tl-empty">
                        <div class="tl-empty-icon">⏱️</div>
                        <div class="tl-empty-text">No events recorded yet.<br>Start interacting with Bael!</div>
                    </div>
                `;
      }

      let filteredEvents = this.events;

      if (!this.filters.all) {
        filteredEvents = this.events.filter((e) => this.filters[e.type]);
      }

      return filteredEvents
        .slice()
        .reverse()
        .map((e) => this.renderEvent(e))
        .join("");
    }

    renderEvent(event) {
      const colors = {
        message: "#6366f1",
        tool: "#4ade80",
        thinking: "#fbbf24",
        error: "#ef4444",
        system: "#8b5cf6",
        response: "#22d3d8",
      };

      const icons = {
        message: "💬",
        tool: "🔧",
        thinking: "🤔",
        error: "❌",
        system: "⚙️",
        response: "📤",
      };

      const color = colors[event.type] || "#ff3366";
      const icon = icons[event.type] || "📍";

      return `
                <div class="tl-event" style="--event-color: ${color}">
                    <div class="tl-event-dot">${icon}</div>
                    <div class="tl-event-card">
                        <div class="tl-event-header">
                            <span class="tl-event-type">${event.type.toUpperCase()}</span>
                            <span class="tl-event-time">${this.formatTime(event.timestamp)}</span>
                        </div>
                        <div class="tl-event-title">${this.escapeHtml(event.title)}</div>
                        ${event.description ? `<div class="tl-event-desc">${this.escapeHtml(event.description)}</div>` : ""}
                        ${event.details ? `<div class="tl-event-details">${this.escapeHtml(event.details)}</div>` : ""}
                    </div>
                </div>
            `;
    }

    renderStats() {
      const stats = {
        total: this.events.length,
        messages: this.events.filter((e) => e.type === "message").length,
        tools: this.events.filter((e) => e.type === "tool").length,
        thinking: this.events.filter((e) => e.type === "thinking").length,
        errors: this.events.filter((e) => e.type === "error").length,
        system: this.events.filter((e) => e.type === "system").length,
      };

      return `
                <div class="tl-stats-title">Statistics</div>
                <div class="tl-stat-item">
                    <span class="tl-stat-label"><span class="tl-stat-dot" style="background: #888"></span> Total</span>
                    <span class="tl-stat-value">${stats.total}</span>
                </div>
                <div class="tl-stat-item">
                    <span class="tl-stat-label"><span class="tl-stat-dot" style="background: #6366f1"></span> Messages</span>
                    <span class="tl-stat-value">${stats.messages}</span>
                </div>
                <div class="tl-stat-item">
                    <span class="tl-stat-label"><span class="tl-stat-dot" style="background: #4ade80"></span> Tools</span>
                    <span class="tl-stat-value">${stats.tools}</span>
                </div>
                <div class="tl-stat-item">
                    <span class="tl-stat-label"><span class="tl-stat-dot" style="background: #fbbf24"></span> Thinking</span>
                    <span class="tl-stat-value">${stats.thinking}</span>
                </div>
                <div class="tl-stat-item">
                    <span class="tl-stat-label"><span class="tl-stat-dot" style="background: #ef4444"></span> Errors</span>
                    <span class="tl-stat-value">${stats.errors}</span>
                </div>
                <div class="tl-stat-item">
                    <span class="tl-stat-label"><span class="tl-stat-dot" style="background: #8b5cf6"></span> System</span>
                    <span class="tl-stat-value">${stats.system}</span>
                </div>
            `;
    }

    bindPanelEvents() {
      // Record toggle
      this.panel.querySelector("#tl-record").addEventListener("click", () => {
        this.isRecording = !this.isRecording;
        const btn = this.panel.querySelector("#tl-record");
        btn.className = `tl-control-btn ${this.isRecording ? "recording" : ""}`;
        btn.textContent = this.isRecording ? "Recording" : "Paused";
      });

      // Clear
      this.panel.querySelector("#tl-clear").addEventListener("click", () => {
        if (confirm("Clear all timeline events?")) {
          this.events = [];
          this.refresh();
          this.updateBadge();
        }
      });

      // Export
      this.panel
        .querySelector("#tl-export")
        .addEventListener("click", () => this.exportTimeline());

      // Close
      this.panel
        .querySelector("#tl-close")
        .addEventListener("click", () => this.close());

      // Filters
      this.panel.querySelector(".tl-filters").addEventListener("click", (e) => {
        const filter = e.target.closest(".tl-filter");
        if (!filter) return;

        const type = filter.dataset.type;

        if (type === "all") {
          this.filters = { all: true };
        } else {
          this.filters.all = false;
          this.filters[type] = !this.filters[type];

          // Check if no filters active
          const activeFilters = Object.entries(this.filters).filter(
            ([k, v]) => k !== "all" && v,
          );
          if (activeFilters.length === 0) {
            this.filters = { all: true };
          }
        }

        this.refreshFilters();
        this.refreshTimeline();
      });
    }

    bindEvents() {
      // Keyboard shortcuts
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "T") {
          e.preventDefault();
          this.toggle();
        }
      });

      // Click outside
      document.addEventListener("click", (e) => {
        if (
          this.panel.classList.contains("visible") &&
          !this.panel.contains(e.target) &&
          !this.toggleBtn.contains(e.target)
        ) {
          this.close();
        }
      });
    }

    hookIntoSystem() {
      // Record system start
      this.addEvent({
        type: "system",
        title: "Timeline Started",
        description: "Bael Timeline Visualizer is now recording events",
      });

      // Hook into form submissions
      document.addEventListener(
        "submit",
        (e) => {
          if (!this.isRecording) return;

          const form = e.target;
          const input = form.querySelector('textarea, input[type="text"]');
          if (input && input.value.trim()) {
            this.addEvent({
              type: "message",
              title: "User Message",
              description:
                input.value.substring(0, 100) +
                (input.value.length > 100 ? "..." : ""),
            });
          }
        },
        true,
      );

      // Hook into fetch for API calls
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const [url, options] = args;

        if (this.isRecording && typeof url === "string") {
          if (url.includes("/message") || url.includes("/chat")) {
            this.addEvent({
              type: "system",
              title: "API Request",
              description: `POST ${url}`,
              details: options?.body
                ? typeof options.body === "string"
                  ? options.body.substring(0, 200)
                  : "FormData"
                : "",
            });
          }
        }

        try {
          const response = await originalFetch.apply(window, args);
          return response;
        } catch (error) {
          if (this.isRecording) {
            this.addEvent({
              type: "error",
              title: "Network Error",
              description: error.message,
            });
          }
          throw error;
        }
      };

      // Hook into console errors
      const originalError = console.error;
      console.error = (...args) => {
        if (this.isRecording) {
          this.addEvent({
            type: "error",
            title: "Console Error",
            details: args
              .map((a) =>
                typeof a === "object" ? JSON.stringify(a) : String(a),
              )
              .join(" "),
          });
        }
        originalError.apply(console, args);
      };

      // Listen for custom events
      document.addEventListener("bael-tool-used", (e) => {
        if (!this.isRecording) return;
        this.addEvent({
          type: "tool",
          title: `Tool: ${e.detail?.tool || "Unknown"}`,
          description: e.detail?.description || "",
          details: e.detail?.args ? JSON.stringify(e.detail.args, null, 2) : "",
        });
      });

      document.addEventListener("bael-thinking", (e) => {
        if (!this.isRecording) return;
        this.addEvent({
          type: "thinking",
          title: "Agent Thinking",
          description: e.detail?.thought || "Processing...",
        });
      });
    }

    addEvent(event) {
      const fullEvent = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        timestamp: Date.now(),
        ...event,
      };

      this.events.push(fullEvent);

      // Trim to max events
      if (this.events.length > this.maxEvents) {
        this.events = this.events.slice(-this.maxEvents);
      }

      this.updateBadge();

      if (this.panel.classList.contains("visible")) {
        this.refresh();
      }
    }

    updateBadge() {
      const badge = this.toggleBtn.querySelector(".event-count");
      badge.textContent = this.events.length;
    }

    refresh() {
      this.refreshFilters();
      this.refreshTimeline();
      this.refreshStats();
    }

    refreshFilters() {
      this.panel.querySelector(".tl-filters").innerHTML = this.renderFilters();
    }

    refreshTimeline() {
      this.panel.querySelector("#tl-track").innerHTML = this.renderTimeline();
    }

    refreshStats() {
      this.panel.querySelector(".tl-stats").innerHTML = this.renderStats();
    }

    exportTimeline() {
      const data = {
        events: this.events,
        exportedAt: new Date().toISOString(),
        totalEvents: this.events.length,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bael-timeline-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      if (window.BaelNotifications) {
        window.BaelNotifications.success("Timeline exported!");
      }
    }

    formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }

    toggle() {
      this.panel.classList.toggle("visible");
      if (this.panel.classList.contains("visible")) {
        this.refresh();
      }
    }

    close() {
      this.panel.classList.remove("visible");
    }

    escapeHtml(text) {
      if (!text) return "";
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Initialize
  window.BaelTimelineVisualizer = new BaelTimelineVisualizer();
})();
