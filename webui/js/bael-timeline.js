/**
 * BAEL - LORD OF ALL
 * Agent Timeline - Visual history of agent actions and decisions
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelTimeline {
    constructor() {
      this.container = null;
      this.isVisible = false;
      this.events = [];
      this.filters = {
        message: true,
        tool: true,
        thought: true,
        error: true,
        system: true,
      };
      this.selectedEvent = null;
      this.isRecording = true;
      this.init();
    }

    init() {
      this.loadEvents();
      this.createContainer();
      this.addStyles();
      this.bindEvents();
      this.hookIntoSystem();
      console.log("📜 Bael Timeline initialized");
    }

    loadEvents() {
      try {
        this.events = JSON.parse(
          sessionStorage.getItem("bael_timeline") || "[]",
        );
      } catch (e) {
        this.events = [];
      }
    }

    saveEvents() {
      try {
        // Keep last 500 events
        const toSave = this.events.slice(-500);
        sessionStorage.setItem("bael_timeline", JSON.stringify(toSave));
      } catch (e) {}
    }

    hookIntoSystem() {
      // Hook into message events
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const [url, options] = args;

        if (typeof url === "string" && url.includes("/message")) {
          this.addEvent({
            type: "message",
            direction: "outgoing",
            content: "User message sent",
            details: options?.body ? JSON.parse(options.body) : null,
          });
        }

        try {
          const response = await originalFetch.apply(window, args);
          return response;
        } catch (error) {
          this.addEvent({
            type: "error",
            content: `Network error: ${error.message}`,
            details: { url, error: error.toString() },
          });
          throw error;
        }
      };

      // Listen for custom events
      window.addEventListener("bael-tool-call", (e) => {
        this.addEvent({
          type: "tool",
          content: `Tool: ${e.detail.name}`,
          details: e.detail,
        });
      });

      window.addEventListener("bael-thought", (e) => {
        this.addEvent({
          type: "thought",
          content: e.detail.thought,
          details: e.detail,
        });
      });

      window.addEventListener("bael-agent-response", (e) => {
        this.addEvent({
          type: "message",
          direction: "incoming",
          content: "Agent response received",
          details: e.detail,
        });
      });
    }

    addEvent(event) {
      if (!this.isRecording) return;

      const fullEvent = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        ...event,
      };

      this.events.push(fullEvent);
      this.saveEvents();

      if (this.isVisible) {
        this.renderEvents();
      }

      // Update badge
      this.updateBadge();
    }

    updateBadge() {
      const badge = document.querySelector("#timeline-badge");
      if (badge) {
        const count = this.events.length;
        badge.textContent = count > 99 ? "99+" : count;
        badge.style.display = count > 0 ? "flex" : "none";
      }
    }

    createContainer() {
      const container = document.createElement("div");
      container.id = "bael-timeline";
      container.className = "bael-timeline";
      container.innerHTML = `
                <div class="timeline-header">
                    <div class="timeline-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span>Agent Timeline</span>
                        <span class="timeline-badge" id="timeline-badge">0</span>
                    </div>
                    <div class="timeline-controls">
                        <button class="timeline-ctrl ${this.isRecording ? "active" : ""}" id="timeline-record" title="Toggle Recording">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="12" r="6"/>
                            </svg>
                        </button>
                        <button class="timeline-ctrl" id="timeline-clear" title="Clear Timeline">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                            </svg>
                        </button>
                        <button class="timeline-ctrl" id="timeline-export" title="Export Timeline">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                        </button>
                    </div>
                    <button class="timeline-close" id="timeline-close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <div class="timeline-filters">
                    <label class="timeline-filter">
                        <input type="checkbox" data-type="message" checked>
                        <span class="filter-icon message">💬</span>
                        Messages
                    </label>
                    <label class="timeline-filter">
                        <input type="checkbox" data-type="tool" checked>
                        <span class="filter-icon tool">🔧</span>
                        Tools
                    </label>
                    <label class="timeline-filter">
                        <input type="checkbox" data-type="thought" checked>
                        <span class="filter-icon thought">💭</span>
                        Thoughts
                    </label>
                    <label class="timeline-filter">
                        <input type="checkbox" data-type="error" checked>
                        <span class="filter-icon error">❌</span>
                        Errors
                    </label>
                    <label class="timeline-filter">
                        <input type="checkbox" data-type="system" checked>
                        <span class="filter-icon system">⚙️</span>
                        System
                    </label>
                </div>

                <div class="timeline-search">
                    <input type="text" id="timeline-search" placeholder="Search events...">
                </div>

                <div class="timeline-content" id="timeline-content">
                    <div class="timeline-track"></div>
                    <div class="timeline-events" id="timeline-events"></div>
                </div>

                <div class="timeline-detail" id="timeline-detail">
                    <div class="detail-header">
                        <span class="detail-type"></span>
                        <span class="detail-time"></span>
                    </div>
                    <div class="detail-content"></div>
                    <pre class="detail-json"></pre>
                </div>
            `;
      document.body.appendChild(container);
      this.container = container;

      // Create trigger button
      this.createTrigger();
    }

    createTrigger() {
      const trigger = document.createElement("button");
      trigger.id = "bael-timeline-trigger";
      trigger.className = "bael-timeline-trigger";
      trigger.title = "Agent Timeline (Ctrl+Shift+T)";
      trigger.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span class="trigger-badge" id="timeline-badge">0</span>
            `;
      document.body.appendChild(trigger);

      trigger.addEventListener("click", () => this.toggle());
    }

    addStyles() {
      if (document.getElementById("bael-timeline-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-timeline-styles";
      styles.textContent = `
                .bael-timeline {
                    position: fixed;
                    top: 0;
                    right: 0;
                    width: 420px;
                    height: 100vh;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border-left: 1px solid var(--bael-border, #2a2a3a);
                    z-index: 100018;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: -10px 0 40px rgba(0, 0, 0, 0.5);
                }

                .bael-timeline.visible {
                    display: flex;
                    animation: timelineSlideIn 0.3s ease;
                }

                @keyframes timelineSlideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }

                .timeline-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .timeline-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex: 1;
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .timeline-title svg {
                    width: 20px;
                    height: 20px;
                    color: var(--bael-accent, #ff3366);
                }

                .timeline-badge {
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                    font-size: 10px;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 10px;
                    min-width: 18px;
                    text-align: center;
                }

                .timeline-controls {
                    display: flex;
                    gap: 4px;
                }

                .timeline-ctrl {
                    width: 32px;
                    height: 32px;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .timeline-ctrl:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--bael-text-primary, #fff);
                }

                .timeline-ctrl.active {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .timeline-ctrl svg {
                    width: 16px;
                    height: 16px;
                }

                .timeline-close {
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .timeline-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                .timeline-close svg {
                    width: 18px;
                    height: 18px;
                }

                .timeline-filters {
                    display: flex;
                    gap: 8px;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    overflow-x: auto;
                }

                .timeline-filter {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 10px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    font-size: 11px;
                    color: var(--bael-text-secondary, #aaa);
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s ease;
                }

                .timeline-filter:has(input:checked) {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                .timeline-filter input {
                    display: none;
                }

                .filter-icon {
                    font-size: 12px;
                }

                .timeline-search {
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .timeline-search input {
                    width: 100%;
                    padding: 10px 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 13px;
                    outline: none;
                }

                .timeline-search input:focus {
                    border-color: var(--bael-accent, #ff3366);
                }

                .timeline-content {
                    flex: 1;
                    overflow-y: auto;
                    position: relative;
                    padding: 16px;
                }

                .timeline-track {
                    position: absolute;
                    left: 28px;
                    top: 0;
                    bottom: 0;
                    width: 2px;
                    background: var(--bael-border, #2a2a3a);
                }

                .timeline-events {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .timeline-event {
                    display: flex;
                    gap: 16px;
                    padding-left: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .timeline-event:hover {
                    transform: translateX(4px);
                }

                .timeline-event.selected {
                    background: rgba(255, 51, 102, 0.1);
                    border-radius: 8px;
                    margin: -8px;
                    padding: 8px 8px 8px 16px;
                }

                .event-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 3px solid var(--bael-accent, #ff3366);
                    flex-shrink: 0;
                    margin-top: 4px;
                    z-index: 1;
                }

                .event-dot.message { border-color: #2196f3; }
                .event-dot.tool { border-color: #ff9800; }
                .event-dot.thought { border-color: #9c27b0; }
                .event-dot.error { border-color: #f44336; }
                .event-dot.system { border-color: #607d8b; }

                .event-body {
                    flex: 1;
                    min-width: 0;
                }

                .event-time {
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                    margin-bottom: 4px;
                }

                .event-content {
                    font-size: 13px;
                    color: var(--bael-text-primary, #fff);
                    line-height: 1.4;
                    word-break: break-word;
                }

                .event-type {
                    display: inline-block;
                    padding: 2px 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-top: 6px;
                }

                .timeline-detail {
                    display: none;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    background: var(--bael-bg-secondary, #12121a);
                    max-height: 40%;
                    overflow-y: auto;
                }

                .timeline-detail.visible {
                    display: block;
                }

                .detail-header {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .detail-type {
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    color: var(--bael-accent, #ff3366);
                }

                .detail-time {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .detail-content {
                    padding: 12px 16px;
                    font-size: 13px;
                    color: var(--bael-text-primary, #fff);
                    line-height: 1.6;
                }

                .detail-json {
                    margin: 0;
                    padding: 12px 16px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    font-family: 'Monaco', 'Menlo', monospace;
                    font-size: 11px;
                    color: var(--bael-text-secondary, #aaa);
                    overflow-x: auto;
                    max-height: 200px;
                }

                .timeline-empty {
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--bael-text-muted, #666);
                }

                .timeline-empty svg {
                    width: 48px;
                    height: 48px;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }

                /* Trigger button */
                .bael-timeline-trigger {
                    position: fixed;
                    bottom: 90px;
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
                    z-index: 9989;
                    transition: all 0.3s ease;
                }

                .bael-timeline-trigger:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.1);
                }

                .bael-timeline-trigger svg {
                    width: 22px;
                    height: 22px;
                    color: var(--bael-text-primary, #fff);
                }

                .trigger-badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                    font-size: 9px;
                    font-weight: 700;
                    padding: 2px 5px;
                    border-radius: 8px;
                    min-width: 16px;
                    text-align: center;
                    display: none;
                }
            `;
      document.head.appendChild(styles);
    }

    bindEvents() {
      // Close
      this.container
        .querySelector("#timeline-close")
        .addEventListener("click", () => this.close());

      // Controls
      this.container
        .querySelector("#timeline-record")
        .addEventListener("click", (e) => {
          this.isRecording = !this.isRecording;
          e.target
            .closest(".timeline-ctrl")
            .classList.toggle("active", this.isRecording);
        });

      this.container
        .querySelector("#timeline-clear")
        .addEventListener("click", () => {
          this.events = [];
          this.saveEvents();
          this.renderEvents();
          this.updateBadge();
        });

      this.container
        .querySelector("#timeline-export")
        .addEventListener("click", () => {
          this.exportTimeline();
        });

      // Filters
      this.container
        .querySelectorAll(".timeline-filter input")
        .forEach((input) => {
          input.addEventListener("change", () => {
            this.filters[input.dataset.type] = input.checked;
            this.renderEvents();
          });
        });

      // Search
      this.container
        .querySelector("#timeline-search")
        .addEventListener("input", (e) => {
          this.renderEvents(e.target.value);
        });

      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "T") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape" && this.isVisible) {
          this.close();
        }
      });
    }

    renderEvents(searchQuery = "") {
      const container = this.container.querySelector("#timeline-events");
      const query = searchQuery.toLowerCase();

      const filtered = this.events
        .filter((event) => {
          if (!this.filters[event.type]) return false;
          if (query && !event.content.toLowerCase().includes(query))
            return false;
          return true;
        })
        .reverse(); // Show newest first

      if (filtered.length === 0) {
        container.innerHTML = `
                    <div class="timeline-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <p>No events recorded yet</p>
                        <p style="font-size: 12px; margin-top: 4px;">Agent actions will appear here</p>
                    </div>
                `;
        return;
      }

      container.innerHTML = filtered
        .map(
          (event) => `
                <div class="timeline-event ${this.selectedEvent?.id === event.id ? "selected" : ""}" data-id="${event.id}">
                    <div class="event-dot ${event.type}"></div>
                    <div class="event-body">
                        <div class="event-time">${this.formatTime(event.timestamp)}</div>
                        <div class="event-content">${this.escapeHtml(event.content)}</div>
                        <span class="event-type">${event.type}</span>
                    </div>
                </div>
            `,
        )
        .join("");

      // Bind click handlers
      container.querySelectorAll(".timeline-event").forEach((el) => {
        el.addEventListener("click", () => {
          const event = this.events.find((e) => e.id === el.dataset.id);
          if (event) {
            this.showDetail(event);
          }
        });
      });
    }

    showDetail(event) {
      this.selectedEvent = event;
      this.renderEvents();

      const detail = this.container.querySelector("#timeline-detail");
      detail.querySelector(".detail-type").textContent = event.type;
      detail.querySelector(".detail-time").textContent = new Date(
        event.timestamp,
      ).toLocaleString();
      detail.querySelector(".detail-content").textContent = event.content;
      detail.querySelector(".detail-json").textContent = event.details
        ? JSON.stringify(event.details, null, 2)
        : "No additional details";
      detail.classList.add("visible");
    }

    formatTime(timestamp) {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;

      if (diff < 60000) return "Just now";
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000)
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      return date.toLocaleDateString();
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    exportTimeline() {
      const data = JSON.stringify(this.events, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bael-timeline-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      if (window.BaelNotifications) {
        window.BaelNotifications.success("Timeline exported");
      }
    }

    // Public API
    open() {
      this.isVisible = true;
      this.container.classList.add("visible");
      this.renderEvents();
    }

    close() {
      this.isVisible = false;
      this.container.classList.remove("visible");
    }

    toggle() {
      if (this.isVisible) {
        this.close();
      } else {
        this.open();
      }
    }

    log(type, content, details = null) {
      this.addEvent({ type, content, details });
    }
  }

  // Initialize
  window.BaelTimeline = new BaelTimeline();
})();
