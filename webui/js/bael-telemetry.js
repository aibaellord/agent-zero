/**
 * BAEL Telemetry - Usage Analytics & Metrics
 * Phase 7: Testing, Documentation & Performance
 *
 * Privacy-first telemetry system with:
 * - Usage tracking
 * - Feature metrics
 * - Performance data
 * - Error tracking
 * - Session analytics
 * - Custom events
 * - Data export
 * - Opt-in privacy
 */

(function () {
  "use strict";

  class BaelTelemetry {
    constructor() {
      this.events = [];
      this.maxEvents = 1000;
      this.sessions = [];
      this.currentSession = null;
      this.config = {
        enabled: false, // Opt-in by default
        trackErrors: true,
        trackPerformance: true,
        trackFeatures: true,
        trackSessions: true,
        anonymize: true,
        batchSize: 50,
        flushInterval: 30000, // 30 seconds
      };
      this.metrics = {
        features: {},
        errors: {},
        performance: [],
      };
      this.init();
    }

    init() {
      this.loadConfig();
      this.startSession();
      this.setupTracking();
      this.createUI();
      this.addStyles();
      this.bindEvents();
      console.log(
        "📊 Bael Telemetry initialized (enabled:",
        this.config.enabled,
        ")",
      );
    }

    loadConfig() {
      const saved = localStorage.getItem("bael_telemetry_config");
      if (saved) {
        try {
          Object.assign(this.config, JSON.parse(saved));
        } catch (e) {
          console.warn("Failed to load telemetry config");
        }
      }

      // Load stored events
      const events = localStorage.getItem("bael_telemetry_events");
      if (events) {
        try {
          this.events = JSON.parse(events);
        } catch (e) {
          this.events = [];
        }
      }
    }

    saveConfig() {
      localStorage.setItem(
        "bael_telemetry_config",
        JSON.stringify(this.config),
      );
    }

    saveEvents() {
      localStorage.setItem(
        "bael_telemetry_events",
        JSON.stringify(this.events.slice(-this.maxEvents)),
      );
    }

    // Session Management
    startSession() {
      if (!this.config.enabled || !this.config.trackSessions) return;

      this.currentSession = {
        id: this.generateId(),
        startTime: new Date(),
        endTime: null,
        pageViews: 0,
        interactions: 0,
        features: [],
        errors: [],
      };

      this.sessions.push(this.currentSession);
    }

    endSession() {
      if (this.currentSession) {
        this.currentSession.endTime = new Date();
        this.currentSession.duration =
          this.currentSession.endTime - this.currentSession.startTime;
      }
    }

    // Event Tracking
    track(eventName, data = {}, category = "general") {
      if (!this.config.enabled) return;

      const event = {
        id: this.generateId(),
        name: eventName,
        category,
        data: this.config.anonymize ? this.anonymizeData(data) : data,
        timestamp: new Date(),
        sessionId: this.currentSession?.id,
      };

      this.events.push(event);

      // Update current session
      if (this.currentSession) {
        this.currentSession.interactions++;
      }

      // Trim events
      while (this.events.length > this.maxEvents) {
        this.events.shift();
      }

      this.saveEvents();
      this.updateUI();
    }

    // Feature Tracking
    trackFeature(featureName, action = "used") {
      if (!this.config.enabled || !this.config.trackFeatures) return;

      if (!this.metrics.features[featureName]) {
        this.metrics.features[featureName] = {
          firstUsed: new Date(),
          lastUsed: new Date(),
          count: 0,
          actions: {},
        };
      }

      const feature = this.metrics.features[featureName];
      feature.lastUsed = new Date();
      feature.count++;
      feature.actions[action] = (feature.actions[action] || 0) + 1;

      if (this.currentSession) {
        if (!this.currentSession.features.includes(featureName)) {
          this.currentSession.features.push(featureName);
        }
      }

      this.track(`feature:${featureName}`, { action }, "feature");
    }

    // Error Tracking
    trackError(error, context = {}) {
      if (!this.config.enabled || !this.config.trackErrors) return;

      const errorKey = error.message || String(error);

      if (!this.metrics.errors[errorKey]) {
        this.metrics.errors[errorKey] = {
          firstSeen: new Date(),
          lastSeen: new Date(),
          count: 0,
          contexts: [],
        };
      }

      const errorEntry = this.metrics.errors[errorKey];
      errorEntry.lastSeen = new Date();
      errorEntry.count++;
      errorEntry.contexts.push({
        timestamp: new Date(),
        context: this.config.anonymize ? this.anonymizeData(context) : context,
      });

      // Keep only last 10 contexts
      errorEntry.contexts = errorEntry.contexts.slice(-10);

      if (this.currentSession) {
        this.currentSession.errors.push(errorKey);
      }

      this.track(
        "error",
        {
          message: errorKey,
          stack: error.stack?.substring(0, 500),
        },
        "error",
      );
    }

    // Performance Tracking
    trackPerformance(metricName, value, unit = "ms") {
      if (!this.config.enabled || !this.config.trackPerformance) return;

      this.metrics.performance.push({
        name: metricName,
        value,
        unit,
        timestamp: new Date(),
      });

      // Keep only last 1000 performance entries
      this.metrics.performance = this.metrics.performance.slice(-1000);

      this.track(`performance:${metricName}`, { value, unit }, "performance");
    }

    // Setup automatic tracking
    setupTracking() {
      if (!this.config.enabled) return;

      // Track page visibility
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          this.track("page:hidden", {}, "lifecycle");
        } else {
          this.track("page:visible", {}, "lifecycle");
        }
      });

      // Track beforeunload
      window.addEventListener("beforeunload", () => {
        this.endSession();
        this.saveEvents();
      });

      // Track errors
      window.addEventListener("error", (e) => {
        this.trackError(e.error || e, {
          filename: e.filename,
          lineno: e.lineno,
        });
      });

      window.addEventListener("unhandledrejection", (e) => {
        this.trackError(e.reason || "Promise rejected", {});
      });

      // Track performance
      if ("PerformanceObserver" in window) {
        try {
          const paintObserver = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
              this.trackPerformance(entry.name, entry.startTime);
            });
          });
          paintObserver.observe({ entryTypes: ["paint"] });
        } catch (e) {
          // Observer not supported
        }
      }
    }

    // Data anonymization
    anonymizeData(data) {
      const anonymized = {};

      Object.entries(data).forEach(([key, value]) => {
        // Hash potentially sensitive values
        if (
          ["email", "name", "user", "token", "key", "password"].some((s) =>
            key.toLowerCase().includes(s),
          )
        ) {
          anonymized[key] = "[REDACTED]";
        } else if (typeof value === "string" && value.length > 100) {
          anonymized[key] = value.substring(0, 100) + "...";
        } else {
          anonymized[key] = value;
        }
      });

      return anonymized;
    }

    // Generate ID
    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    // Get analytics summary
    getSummary() {
      const now = new Date();
      const dayAgo = new Date(now - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

      const eventsToday = this.events.filter(
        (e) => new Date(e.timestamp) > dayAgo,
      );
      const eventsThisWeek = this.events.filter(
        (e) => new Date(e.timestamp) > weekAgo,
      );

      const topFeatures = Object.entries(this.metrics.features)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10);

      const topErrors = Object.entries(this.metrics.errors)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10);

      return {
        totalEvents: this.events.length,
        eventsToday: eventsToday.length,
        eventsThisWeek: eventsThisWeek.length,
        totalSessions: this.sessions.length,
        topFeatures,
        topErrors,
        currentSessionDuration: this.currentSession
          ? Math.round((now - new Date(this.currentSession.startTime)) / 1000)
          : 0,
      };
    }

    // Export data
    exportData() {
      const data = {
        exportedAt: new Date().toISOString(),
        config: this.config,
        summary: this.getSummary(),
        events: this.events,
        metrics: this.metrics,
        sessions: this.sessions,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bael-telemetry-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    // Clear data
    clearData() {
      this.events = [];
      this.metrics = { features: {}, errors: {}, performance: [] };
      this.sessions = [];
      localStorage.removeItem("bael_telemetry_events");
      this.startSession();
      this.updateUI();
    }

    // UI
    createUI() {
      this.panel = document.createElement("div");
      this.panel.id = "bael-telemetry-panel";
      this.panel.innerHTML = `
                <div class="telemetry-header">
                    <h3>📊 Telemetry</h3>
                    <div class="telemetry-actions">
                        <button class="export-btn" title="Export data">📤</button>
                        <button class="clear-btn" title="Clear data">🗑️</button>
                        <button class="close-btn">✕</button>
                    </div>
                </div>

                <div class="telemetry-toggle">
                    <label>
                        <input type="checkbox" id="telemetry-enabled" ${this.config.enabled ? "checked" : ""}>
                        Enable Telemetry
                    </label>
                    <span class="privacy-note">Your data stays local</span>
                </div>

                <div class="telemetry-tabs">
                    <button class="tab-btn active" data-tab="overview">Overview</button>
                    <button class="tab-btn" data-tab="features">Features</button>
                    <button class="tab-btn" data-tab="events">Events</button>
                    <button class="tab-btn" data-tab="settings">Settings</button>
                </div>

                <div class="telemetry-content">
                    <div class="tab-content active" id="telemetry-tab-overview">
                        <div class="telemetry-stats" id="telemetry-stats"></div>
                    </div>

                    <div class="tab-content" id="telemetry-tab-features">
                        <div class="feature-list" id="feature-list"></div>
                    </div>

                    <div class="tab-content" id="telemetry-tab-events">
                        <div class="event-list" id="telemetry-event-list"></div>
                    </div>

                    <div class="tab-content" id="telemetry-tab-settings">
                        <div class="telemetry-settings">
                            <label>
                                <input type="checkbox" id="telemetry-track-errors" ${this.config.trackErrors ? "checked" : ""}>
                                Track Errors
                            </label>
                            <label>
                                <input type="checkbox" id="telemetry-track-performance" ${this.config.trackPerformance ? "checked" : ""}>
                                Track Performance
                            </label>
                            <label>
                                <input type="checkbox" id="telemetry-track-features" ${this.config.trackFeatures ? "checked" : ""}>
                                Track Feature Usage
                            </label>
                            <label>
                                <input type="checkbox" id="telemetry-anonymize" ${this.config.anonymize ? "checked" : ""}>
                                Anonymize Data
                            </label>
                        </div>
                    </div>
                </div>
            `;
      document.body.appendChild(this.panel);
    }

    updateUI() {
      this.updateStats();
      this.updateFeatureList();
      this.updateEventList();
    }

    updateStats() {
      const container = document.getElementById("telemetry-stats");
      if (!container) return;

      const summary = this.getSummary();

      container.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <span class="stat-value">${summary.totalEvents}</span>
                        <span class="stat-label">Total Events</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">${summary.eventsToday}</span>
                        <span class="stat-label">Events Today</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">${summary.totalSessions}</span>
                        <span class="stat-label">Sessions</span>
                    </div>
                    <div class="stat-card">
                        <span class="stat-value">${this.formatDuration(summary.currentSessionDuration)}</span>
                        <span class="stat-label">Current Session</span>
                    </div>
                </div>

                <h4>Top Features</h4>
                <div class="top-list">
                    ${
                      summary.topFeatures
                        .map(
                          ([name, data]) => `
                        <div class="top-item">
                            <span class="item-name">${name}</span>
                            <span class="item-count">${data.count} uses</span>
                        </div>
                    `,
                        )
                        .join("") ||
                      '<div class="no-data">No feature data</div>'
                    }
                </div>
            `;
    }

    updateFeatureList() {
      const list = document.getElementById("feature-list");
      if (!list) return;

      const features = Object.entries(this.metrics.features).sort(
        (a, b) => b[1].count - a[1].count,
      );

      list.innerHTML =
        features
          .map(
            ([name, data]) => `
                <div class="feature-item">
                    <div class="feature-header">
                        <span class="feature-name">${name}</span>
                        <span class="feature-count">${data.count} uses</span>
                    </div>
                    <div class="feature-meta">
                        <span>First used: ${this.formatDate(data.firstUsed)}</span>
                        <span>Last used: ${this.formatDate(data.lastUsed)}</span>
                    </div>
                </div>
            `,
          )
          .join("") || '<div class="no-data">No feature data</div>';
    }

    updateEventList() {
      const list = document.getElementById("telemetry-event-list");
      if (!list) return;

      const recentEvents = this.events.slice(-50).reverse();

      list.innerHTML =
        recentEvents
          .map(
            (e) => `
                <div class="event-item">
                    <span class="event-time">${this.formatTime(e.timestamp)}</span>
                    <span class="event-category">${e.category}</span>
                    <span class="event-name">${e.name}</span>
                </div>
            `,
          )
          .join("") || '<div class="no-data">No events recorded</div>';
    }

    formatDate(date) {
      return new Date(date).toLocaleDateString();
    }

    formatTime(date) {
      return new Date(date).toLocaleTimeString();
    }

    formatDuration(seconds) {
      if (seconds < 60) return `${seconds}s`;
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
      return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    }

    addStyles() {
      const style = document.createElement("style");
      style.textContent = `
                #bael-telemetry-panel {
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

                #bael-telemetry-panel.visible {
                    display: flex;
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }

                .telemetry-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background: var(--bael-bg-dark, #151515);
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .telemetry-header h3 {
                    margin: 0;
                    font-size: 16px;
                    color: var(--bael-text, #fff);
                }

                .telemetry-actions {
                    display: flex;
                    gap: 8px;
                }

                .telemetry-actions button {
                    background: transparent;
                    border: none;
                    color: var(--bael-text-dim, #888);
                    cursor: pointer;
                    font-size: 16px;
                    padding: 4px;
                }

                .telemetry-toggle {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 20px;
                    background: rgba(0,0,0,0.2);
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .telemetry-toggle label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--bael-text, #fff);
                    font-size: 13px;
                    cursor: pointer;
                }

                .privacy-note {
                    font-size: 11px;
                    color: #4caf50;
                }

                .telemetry-tabs {
                    display: flex;
                    background: var(--bael-bg-dark, #151515);
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .telemetry-tabs .tab-btn {
                    flex: 1;
                    padding: 12px;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-dim, #888);
                    cursor: pointer;
                    font-size: 12px;
                    border-bottom: 2px solid transparent;
                }

                .telemetry-tabs .tab-btn.active {
                    color: var(--bael-accent, #00d4ff);
                    border-bottom-color: var(--bael-accent, #00d4ff);
                }

                .telemetry-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                }

                .tab-content {
                    display: none;
                }

                .tab-content.active {
                    display: block;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    margin-bottom: 20px;
                }

                .stat-card {
                    background: var(--bael-bg-dark, #151515);
                    padding: 16px;
                    border-radius: 8px;
                    text-align: center;
                }

                .stat-value {
                    display: block;
                    font-size: 24px;
                    font-weight: bold;
                    color: var(--bael-accent, #00d4ff);
                }

                .stat-label {
                    font-size: 11px;
                    color: var(--bael-text-dim, #888);
                    text-transform: uppercase;
                }

                #telemetry-stats h4 {
                    margin: 0 0 12px;
                    font-size: 12px;
                    color: var(--bael-text-dim, #888);
                    text-transform: uppercase;
                }

                .top-item, .feature-item, .event-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 12px;
                    background: var(--bael-bg-dark, #151515);
                    border-radius: 6px;
                    margin-bottom: 6px;
                }

                .item-name, .feature-name, .event-name {
                    color: var(--bael-text, #fff);
                }

                .item-count, .feature-count {
                    color: #4caf50;
                    font-weight: 500;
                }

                .feature-item {
                    flex-direction: column;
                    gap: 8px;
                }

                .feature-header {
                    display: flex;
                    justify-content: space-between;
                }

                .feature-meta {
                    display: flex;
                    gap: 16px;
                    font-size: 11px;
                    color: var(--bael-text-dim, #888);
                }

                .event-item {
                    display: grid;
                    grid-template-columns: 80px 80px 1fr;
                    gap: 12px;
                    font-size: 12px;
                }

                .event-time {
                    color: var(--bael-text-dim, #888);
                }

                .event-category {
                    color: var(--bael-accent, #00d4ff);
                }

                .telemetry-settings label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px;
                    background: var(--bael-bg-dark, #151515);
                    border-radius: 6px;
                    margin-bottom: 8px;
                    color: var(--bael-text, #fff);
                    cursor: pointer;
                }

                .no-data {
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

      // Export button
      this.panel.querySelector(".export-btn").addEventListener("click", () => {
        this.exportData();
      });

      // Clear button
      this.panel.querySelector(".clear-btn").addEventListener("click", () => {
        if (confirm("Clear all telemetry data?")) {
          this.clearData();
        }
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
            .getElementById(`telemetry-tab-${btn.dataset.tab}`)
            .classList.add("active");

          this.updateUI();
        });
      });

      // Enable toggle
      document
        .getElementById("telemetry-enabled")
        ?.addEventListener("change", (e) => {
          this.config.enabled = e.target.checked;
          this.saveConfig();
          if (this.config.enabled) {
            this.startSession();
            this.setupTracking();
          }
        });

      // Settings
      document
        .getElementById("telemetry-track-errors")
        ?.addEventListener("change", (e) => {
          this.config.trackErrors = e.target.checked;
          this.saveConfig();
        });

      document
        .getElementById("telemetry-track-performance")
        ?.addEventListener("change", (e) => {
          this.config.trackPerformance = e.target.checked;
          this.saveConfig();
        });

      document
        .getElementById("telemetry-track-features")
        ?.addEventListener("change", (e) => {
          this.config.trackFeatures = e.target.checked;
          this.saveConfig();
        });

      document
        .getElementById("telemetry-anonymize")
        ?.addEventListener("change", (e) => {
          this.config.anonymize = e.target.checked;
          this.saveConfig();
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
  window.BaelTelemetry = new BaelTelemetry();
})();
