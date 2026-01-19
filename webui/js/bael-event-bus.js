/**
 * BAEL Event Bus - Centralized Event System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete pub/sub event system with:
 * - Event publishing and subscription
 * - Wildcard event matching
 * - Event namespacing
 * - Once listeners
 * - Event history
 * - Priority-based handlers
 * - Async event handling
 * - Event replay
 * - Debug mode
 */

(function () {
  "use strict";

  class BaelEventBus {
    constructor() {
      this.subscribers = new Map();
      this.wildcardSubscribers = [];
      this.history = [];
      this.maxHistory = 500;
      this.config = {
        debug: false,
        logEvents: false,
        maxListeners: 100,
        asyncDefault: false,
      };
      this.eventCounts = new Map();
      this.init();
    }

    init() {
      this.loadConfig();
      this.createUI();
      this.addStyles();
      this.bindEvents();
      this.setupCoreEvents();
      console.log("📡 Bael Event Bus initialized");
    }

    loadConfig() {
      const saved = localStorage.getItem("bael_eventbus_config");
      if (saved) {
        try {
          Object.assign(this.config, JSON.parse(saved));
        } catch (e) {
          console.warn("Failed to load event bus config");
        }
      }
    }

    saveConfig() {
      localStorage.setItem("bael_eventbus_config", JSON.stringify(this.config));
    }

    // Subscribe to event
    on(event, handler, options = {}) {
      const {
        priority = 0,
        once = false,
        async = this.config.asyncDefault,
      } = options;

      if (!this.subscribers.has(event)) {
        this.subscribers.set(event, []);
      }

      const listeners = this.subscribers.get(event);

      // Check max listeners
      if (listeners.length >= this.config.maxListeners) {
        console.warn(
          `[EventBus] Max listeners (${this.config.maxListeners}) reached for "${event}"`,
        );
      }

      const subscription = {
        handler,
        priority,
        once,
        async,
        id: this.generateId(),
      };
      listeners.push(subscription);

      // Sort by priority (higher first)
      listeners.sort((a, b) => b.priority - a.priority);

      if (this.config.debug) {
        console.log(`[EventBus] Subscribed to "${event}"`, subscription.id);
      }

      // Return unsubscribe function
      return () => this.off(event, subscription.id);
    }

    // Subscribe once
    once(event, handler, options = {}) {
      return this.on(event, handler, { ...options, once: true });
    }

    // Subscribe to all events (wildcard)
    onAny(handler, options = {}) {
      const subscription = {
        handler,
        priority: options.priority || 0,
        async: options.async || false,
        id: this.generateId(),
      };

      this.wildcardSubscribers.push(subscription);
      this.wildcardSubscribers.sort((a, b) => b.priority - a.priority);

      return () => {
        const idx = this.wildcardSubscribers.findIndex(
          (s) => s.id === subscription.id,
        );
        if (idx > -1) this.wildcardSubscribers.splice(idx, 1);
      };
    }

    // Unsubscribe
    off(event, handlerOrId) {
      if (!this.subscribers.has(event)) return;

      const listeners = this.subscribers.get(event);
      const idx = listeners.findIndex(
        (s) => s.id === handlerOrId || s.handler === handlerOrId,
      );

      if (idx > -1) {
        listeners.splice(idx, 1);
        if (this.config.debug) {
          console.log(`[EventBus] Unsubscribed from "${event}"`);
        }
      }
    }

    // Remove all listeners for event
    offAll(event) {
      if (event) {
        this.subscribers.delete(event);
      } else {
        this.subscribers.clear();
        this.wildcardSubscribers = [];
      }
    }

    // Emit event
    emit(event, data = {}, options = {}) {
      const { async = false, recordHistory = true } = options;

      // Record in history
      if (recordHistory) {
        this.recordEvent(event, data);
      }

      // Update counts
      this.eventCounts.set(event, (this.eventCounts.get(event) || 0) + 1);

      // Debug log
      if (this.config.debug || this.config.logEvents) {
        console.log(`[EventBus] Emit: "${event}"`, data);
      }

      // Create event object
      const eventObj = {
        type: event,
        data,
        timestamp: new Date(),
        id: this.generateId(),
      };

      // Collect handlers
      const handlers = [];

      // Wildcard handlers
      this.wildcardSubscribers.forEach((sub) => {
        handlers.push({ ...sub, isWildcard: true });
      });

      // Event handlers
      if (this.subscribers.has(event)) {
        this.subscribers.get(event).forEach((sub) => {
          handlers.push({ ...sub, isWildcard: false });
        });
      }

      // Namespace matching (e.g., "chat:*" matches "chat:message")
      this.subscribers.forEach((subs, pattern) => {
        if (pattern.endsWith(":*")) {
          const namespace = pattern.slice(0, -2);
          if (event.startsWith(namespace + ":") && event !== namespace) {
            subs.forEach((sub) => {
              handlers.push({ ...sub, isWildcard: false });
            });
          }
        }
      });

      // Sort by priority
      handlers.sort((a, b) => b.priority - a.priority);

      // Execute handlers
      const execute = (sub) => {
        try {
          const result = sub.handler(eventObj.data, eventObj);

          // Remove if once
          if (sub.once && !sub.isWildcard) {
            this.off(event, sub.id);
          }

          return result;
        } catch (error) {
          console.error(`[EventBus] Handler error for "${event}":`, error);
        }
      };

      if (async) {
        return Promise.all(
          handlers.map((sub) =>
            sub.async
              ? Promise.resolve().then(() => execute(sub))
              : execute(sub),
          ),
        );
      } else {
        handlers.forEach(execute);
      }

      // Update UI
      this.updateUI();
    }

    // Emit async and wait for all handlers
    async emitAsync(event, data = {}) {
      return this.emit(event, data, { async: true });
    }

    // Record event in history
    recordEvent(event, data) {
      this.history.push({
        event,
        data,
        timestamp: new Date(),
      });

      while (this.history.length > this.maxHistory) {
        this.history.shift();
      }
    }

    // Replay events
    replay(filter = {}) {
      const { event, since, until } = filter;

      let events = [...this.history];

      if (event) {
        events = events.filter(
          (e) => e.event === event || e.event.startsWith(event + ":"),
        );
      }

      if (since) {
        events = events.filter((e) => e.timestamp >= since);
      }

      if (until) {
        events = events.filter((e) => e.timestamp <= until);
      }

      events.forEach((e) => {
        this.emit(e.event, e.data, { recordHistory: false });
      });
    }

    // Get listener count
    listenerCount(event) {
      if (event) {
        return this.subscribers.get(event)?.length || 0;
      }
      let count = this.wildcardSubscribers.length;
      this.subscribers.forEach((subs) => {
        count += subs.length;
      });
      return count;
    }

    // Get event names
    eventNames() {
      return Array.from(this.subscribers.keys());
    }

    // Setup core events
    setupCoreEvents() {
      // Bridge DOM events
      document.addEventListener("click", (e) => {
        if (e.target.dataset.baelEvent) {
          this.emit(e.target.dataset.baelEvent, {
            element: e.target,
            originalEvent: e,
          });
        }
      });

      // Bridge custom events
      window.addEventListener("bael-event", (e) => {
        if (e.detail?.type) {
          this.emit(e.detail.type, e.detail.data);
        }
      });
    }

    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    // UI
    createUI() {
      this.panel = document.createElement("div");
      this.panel.id = "bael-eventbus-panel";
      this.panel.innerHTML = `
                <div class="eventbus-header">
                    <h3>📡 Event Bus</h3>
                    <div class="eventbus-actions">
                        <button class="clear-btn" title="Clear history">🗑️</button>
                        <button class="close-btn">✕</button>
                    </div>
                </div>

                <div class="eventbus-tabs">
                    <button class="tab-btn active" data-tab="live">Live Events</button>
                    <button class="tab-btn" data-tab="listeners">Listeners</button>
                    <button class="tab-btn" data-tab="stats">Stats</button>
                </div>

                <div class="eventbus-content">
                    <div class="tab-content active" id="eventbus-tab-live">
                        <div class="event-stream" id="event-stream"></div>
                    </div>

                    <div class="tab-content" id="eventbus-tab-listeners">
                        <div class="listener-list" id="listener-list"></div>
                    </div>

                    <div class="tab-content" id="eventbus-tab-stats">
                        <div class="event-stats" id="event-stats"></div>
                    </div>
                </div>

                <div class="eventbus-footer">
                    <input type="text" id="emit-event-name" placeholder="Event name...">
                    <input type="text" id="emit-event-data" placeholder='{"key": "value"}'>
                    <button id="emit-btn">Emit</button>
                </div>
            `;
      document.body.appendChild(this.panel);
    }

    updateUI() {
      this.updateEventStream();
      this.updateListenerList();
      this.updateStats();
    }

    updateEventStream() {
      const stream = document.getElementById("event-stream");
      if (!stream) return;

      const recentEvents = this.history.slice(-50).reverse();
      stream.innerHTML =
        recentEvents
          .map(
            (e) => `
                <div class="stream-event">
                    <span class="event-time">${this.formatTime(e.timestamp)}</span>
                    <span class="event-name">${e.event}</span>
                    <span class="event-data">${this.truncateData(e.data)}</span>
                </div>
            `,
          )
          .join("") || '<div class="no-events">No events yet</div>';
    }

    updateListenerList() {
      const list = document.getElementById("listener-list");
      if (!list) return;

      const entries = [];

      if (this.wildcardSubscribers.length > 0) {
        entries.push({
          event: "* (wildcard)",
          count: this.wildcardSubscribers.length,
        });
      }

      this.subscribers.forEach((subs, event) => {
        entries.push({ event, count: subs.length });
      });

      list.innerHTML =
        entries
          .map(
            (e) => `
                <div class="listener-item">
                    <span class="listener-event">${e.event}</span>
                    <span class="listener-count">${e.count} listener${e.count !== 1 ? "s" : ""}</span>
                </div>
            `,
          )
          .join("") ||
        '<div class="no-listeners">No listeners registered</div>';
    }

    updateStats() {
      const stats = document.getElementById("event-stats");
      if (!stats) return;

      const sortedCounts = Array.from(this.eventCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);

      stats.innerHTML = `
                <div class="stats-summary">
                    <div class="stat">
                        <span class="value">${this.history.length}</span>
                        <span class="label">Events in History</span>
                    </div>
                    <div class="stat">
                        <span class="value">${this.listenerCount()}</span>
                        <span class="label">Total Listeners</span>
                    </div>
                    <div class="stat">
                        <span class="value">${this.eventNames().length}</span>
                        <span class="label">Event Types</span>
                    </div>
                </div>
                <h4>Top Events</h4>
                <div class="top-events">
                    ${
                      sortedCounts
                        .map(
                          ([event, count]) => `
                        <div class="top-event">
                            <span class="event-name">${event}</span>
                            <span class="event-count">${count}</span>
                        </div>
                    `,
                        )
                        .join("") || '<div class="no-data">No event data</div>'
                    }
                </div>
            `;
    }

    formatTime(date) {
      return new Date(date).toLocaleTimeString();
    }

    truncateData(data) {
      const str = JSON.stringify(data);
      return str.length > 50 ? str.substring(0, 50) + "..." : str;
    }

    addStyles() {
      const style = document.createElement("style");
      style.textContent = `
                #bael-eventbus-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.9);
                    width: 550px;
                    max-width: 95vw;
                    max-height: 80vh;
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

                #bael-eventbus-panel.visible {
                    display: flex;
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }

                .eventbus-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background: var(--bael-bg-dark, #151515);
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .eventbus-header h3 {
                    margin: 0;
                    font-size: 16px;
                    color: var(--bael-text, #fff);
                }

                .eventbus-actions {
                    display: flex;
                    gap: 8px;
                }

                .eventbus-actions button {
                    background: transparent;
                    border: none;
                    color: var(--bael-text-dim, #888);
                    cursor: pointer;
                    font-size: 16px;
                    padding: 4px;
                }

                .eventbus-tabs {
                    display: flex;
                    background: var(--bael-bg-dark, #151515);
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .eventbus-tabs .tab-btn {
                    flex: 1;
                    padding: 12px;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-dim, #888);
                    cursor: pointer;
                    font-size: 12px;
                    border-bottom: 2px solid transparent;
                }

                .eventbus-tabs .tab-btn.active {
                    color: var(--bael-accent, #00d4ff);
                    border-bottom-color: var(--bael-accent, #00d4ff);
                }

                .eventbus-content {
                    flex: 1;
                    overflow-y: auto;
                    max-height: 400px;
                }

                .tab-content {
                    display: none;
                    padding: 12px;
                }

                .tab-content.active {
                    display: block;
                }

                .stream-event {
                    display: grid;
                    grid-template-columns: 80px 1fr 1fr;
                    gap: 12px;
                    padding: 10px 12px;
                    background: var(--bael-bg-dark, #151515);
                    border-radius: 6px;
                    margin-bottom: 6px;
                    font-size: 12px;
                }

                .event-time {
                    color: var(--bael-text-dim, #888);
                }

                .event-name {
                    color: #4caf50;
                    font-weight: 500;
                }

                .event-data {
                    color: var(--bael-text-dim, #888);
                    font-family: monospace;
                    font-size: 11px;
                    word-break: break-all;
                }

                .listener-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 12px;
                    background: var(--bael-bg-dark, #151515);
                    border-radius: 6px;
                    margin-bottom: 6px;
                }

                .listener-event {
                    color: var(--bael-accent, #00d4ff);
                }

                .listener-count {
                    color: var(--bael-text-dim, #888);
                    font-size: 12px;
                }

                .stats-summary {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .stats-summary .stat {
                    text-align: center;
                    padding: 16px;
                    background: var(--bael-bg-dark, #151515);
                    border-radius: 8px;
                }

                .stats-summary .value {
                    display: block;
                    font-size: 24px;
                    font-weight: bold;
                    color: var(--bael-accent, #00d4ff);
                }

                .stats-summary .label {
                    font-size: 10px;
                    color: var(--bael-text-dim, #888);
                    text-transform: uppercase;
                }

                #event-stats h4 {
                    margin: 0 0 12px;
                    font-size: 12px;
                    color: var(--bael-text-dim, #888);
                    text-transform: uppercase;
                }

                .top-event {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 12px;
                    background: var(--bael-bg-dark, #151515);
                    border-radius: 6px;
                    margin-bottom: 4px;
                    font-size: 12px;
                }

                .top-event .event-name {
                    color: var(--bael-text, #fff);
                }

                .top-event .event-count {
                    color: #4caf50;
                    font-weight: bold;
                }

                .eventbus-footer {
                    display: flex;
                    gap: 8px;
                    padding: 12px;
                    background: var(--bael-bg-dark, #151515);
                    border-top: 1px solid var(--bael-border, #333);
                }

                .eventbus-footer input {
                    flex: 1;
                    padding: 10px 12px;
                    background: var(--bael-surface, #252525);
                    border: 1px solid var(--bael-border, #333);
                    color: var(--bael-text, #fff);
                    border-radius: 6px;
                    font-size: 12px;
                }

                .eventbus-footer button {
                    padding: 10px 20px;
                    background: var(--bael-accent, #00d4ff);
                    color: #000;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 600;
                }

                .no-events, .no-listeners, .no-data {
                    text-align: center;
                    padding: 40px;
                    color: var(--bael-text-dim, #888);
                }
            `;
      document.head.appendChild(style);
    }

    bindEvents() {
      // Close button
      this.panel.querySelector(".close-btn").addEventListener("click", () => {
        this.close();
      });

      // Clear button
      this.panel.querySelector(".clear-btn").addEventListener("click", () => {
        this.history = [];
        this.eventCounts.clear();
        this.updateUI();
      });

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
          document
            .getElementById(`eventbus-tab-${btn.dataset.tab}`)
            .classList.add("active");

          this.updateUI();
        });
      });

      // Emit button
      document.getElementById("emit-btn")?.addEventListener("click", () => {
        const eventName = document.getElementById("emit-event-name")?.value;
        const eventData = document.getElementById("emit-event-data")?.value;

        if (eventName) {
          try {
            const data = eventData ? JSON.parse(eventData) : {};
            this.emit(eventName, data);
            document.getElementById("emit-event-name").value = "";
            document.getElementById("emit-event-data").value = "";
          } catch (e) {
            alert("Invalid JSON data");
          }
        }
      });

      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "B") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    open() {
      this.panel.classList.add("visible");
      this.updateUI();
    }

    close() {
      this.panel.classList.remove("visible");
    }

    toggle() {
      if (this.panel.classList.contains("visible")) {
        this.close();
      } else {
        this.open();
      }
    }

    get isVisible() {
      return this.panel.classList.contains("visible");
    }
  }

  // Initialize
  window.BaelEventBus = new BaelEventBus();
})();
