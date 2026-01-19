/**
 * BAEL Error Boundary - Comprehensive Error Handling
 * Phase 7: Testing, Documentation & Performance
 *
 * Global error handling system with:
 * - Uncaught error capture
 * - Promise rejection handling
 * - Error recovery mechanisms
 * - Error reporting
 * - User-friendly error display
 * - Error analytics
 * - Retry mechanisms
 */

(function () {
  "use strict";

  class BaelErrorBoundary {
    constructor() {
      this.errors = [];
      this.maxErrors = 100;
      this.retryAttempts = {};
      this.maxRetries = 3;
      this.config = {
        showNotifications: true,
        logToConsole: true,
        captureContext: true,
        enableRecovery: true,
        reportEndpoint: null,
      };
      this.handlers = new Map();
      this.recoveryStrategies = new Map();
      this.init();
    }

    init() {
      this.loadConfig();
      this.setupGlobalHandlers();
      this.registerDefaultRecoveries();
      this.createUI();
      this.addStyles();
      this.bindEvents();
      console.log("🛡️ Bael Error Boundary initialized");
    }

    loadConfig() {
      const saved = localStorage.getItem("bael_error_config");
      if (saved) {
        try {
          Object.assign(this.config, JSON.parse(saved));
        } catch (e) {
          console.warn("Failed to load error config");
        }
      }
    }

    saveConfig() {
      localStorage.setItem("bael_error_config", JSON.stringify(this.config));
    }

    // Global Error Handlers
    setupGlobalHandlers() {
      // Uncaught errors
      window.addEventListener("error", (event) => {
        this.handleError({
          type: "uncaught",
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error,
          timestamp: new Date(),
        });
      });

      // Unhandled promise rejections
      window.addEventListener("unhandledrejection", (event) => {
        this.handleError({
          type: "promise",
          message: event.reason?.message || String(event.reason),
          stack: event.reason?.stack,
          error: event.reason,
          timestamp: new Date(),
        });
      });

      // Resource loading errors
      window.addEventListener(
        "error",
        (event) => {
          if (event.target !== window) {
            this.handleError({
              type: "resource",
              message: `Failed to load resource: ${event.target.src || event.target.href}`,
              element: event.target.tagName,
              source: event.target.src || event.target.href,
              timestamp: new Date(),
            });
          }
        },
        true,
      );

      // Network errors via fetch interception
      this.interceptFetch();

      // XHR errors
      this.interceptXHR();
    }

    interceptFetch() {
      const originalFetch = window.fetch;
      const self = this;

      window.fetch = async function (...args) {
        try {
          const response = await originalFetch.apply(this, args);

          if (!response.ok) {
            self.handleError({
              type: "network",
              message: `HTTP ${response.status}: ${response.statusText}`,
              url: args[0]?.toString() || args[0],
              status: response.status,
              timestamp: new Date(),
            });
          }

          return response;
        } catch (error) {
          self.handleError({
            type: "network",
            message: error.message,
            url: args[0]?.toString() || args[0],
            error,
            timestamp: new Date(),
          });
          throw error;
        }
      };
    }

    interceptXHR() {
      const originalOpen = XMLHttpRequest.prototype.open;
      const originalSend = XMLHttpRequest.prototype.send;
      const self = this;

      XMLHttpRequest.prototype.open = function (method, url) {
        this._errorBoundaryUrl = url;
        this._errorBoundaryMethod = method;
        return originalOpen.apply(this, arguments);
      };

      XMLHttpRequest.prototype.send = function () {
        this.addEventListener("error", () => {
          self.handleError({
            type: "xhr",
            message: `XHR request failed: ${this._errorBoundaryMethod} ${this._errorBoundaryUrl}`,
            url: this._errorBoundaryUrl,
            method: this._errorBoundaryMethod,
            timestamp: new Date(),
          });
        });

        this.addEventListener("load", () => {
          if (this.status >= 400) {
            self.handleError({
              type: "xhr",
              message: `XHR ${this.status}: ${this.statusText}`,
              url: this._errorBoundaryUrl,
              status: this.status,
              timestamp: new Date(),
            });
          }
        });

        return originalSend.apply(this, arguments);
      };
    }

    // Error Handling
    handleError(errorInfo) {
      // Add context
      if (this.config.captureContext) {
        errorInfo.context = this.captureContext();
      }

      // Generate unique ID
      errorInfo.id = this.generateErrorId(errorInfo);

      // Check for duplicate
      if (this.isDuplicate(errorInfo)) {
        return;
      }

      // Store error
      this.errors.push(errorInfo);
      while (this.errors.length > this.maxErrors) {
        this.errors.shift();
      }

      // Log to console
      if (this.config.logToConsole) {
        console.error("[Bael Error]", errorInfo);
      }

      // Show notification
      if (this.config.showNotifications) {
        this.showErrorNotification(errorInfo);
      }

      // Call custom handlers
      this.callHandlers(errorInfo);

      // Attempt recovery
      if (this.config.enableRecovery) {
        this.attemptRecovery(errorInfo);
      }

      // Report to endpoint
      if (this.config.reportEndpoint) {
        this.reportError(errorInfo);
      }

      // Update UI
      this.updateErrorList();

      // Dispatch event
      window.dispatchEvent(
        new CustomEvent("bael-error", { detail: errorInfo }),
      );
    }

    captureContext() {
      return {
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        memory: performance.memory
          ? {
              usedJSHeapSize: performance.memory.usedJSHeapSize,
              totalJSHeapSize: performance.memory.totalJSHeapSize,
            }
          : null,
        activeElement: document.activeElement?.tagName,
        localStorage: Object.keys(localStorage).length,
        sessionCount: sessionStorage.getItem("bael_session_count") || 0,
      };
    }

    generateErrorId(errorInfo) {
      const str = `${errorInfo.type}-${errorInfo.message}-${errorInfo.filename || ""}-${errorInfo.lineno || ""}`;
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash).toString(16);
    }

    isDuplicate(errorInfo) {
      const recentErrors = this.errors.slice(-10);
      return recentErrors.some((e) => e.id === errorInfo.id);
    }

    // Custom Handlers
    registerHandler(type, handler) {
      if (!this.handlers.has(type)) {
        this.handlers.set(type, []);
      }
      this.handlers.get(type).push(handler);
    }

    callHandlers(errorInfo) {
      const handlers = this.handlers.get(errorInfo.type) || [];
      const globalHandlers = this.handlers.get("*") || [];

      [...globalHandlers, ...handlers].forEach((handler) => {
        try {
          handler(errorInfo);
        } catch (e) {
          console.error("Error handler failed:", e);
        }
      });
    }

    // Recovery Strategies
    registerDefaultRecoveries() {
      // Network retry
      this.recoveryStrategies.set("network", async (errorInfo) => {
        const key = errorInfo.url;
        this.retryAttempts[key] = (this.retryAttempts[key] || 0) + 1;

        if (this.retryAttempts[key] <= this.maxRetries) {
          await this.delay(1000 * this.retryAttempts[key]);
          console.log(
            `Retrying request: ${key} (attempt ${this.retryAttempts[key]})`,
          );
          return fetch(key);
        }
        return null;
      });

      // Resource reload
      this.recoveryStrategies.set("resource", async (errorInfo) => {
        const element = document.querySelector(
          `[src="${errorInfo.source}"], [href="${errorInfo.source}"]`,
        );
        if (element) {
          const newSrc = errorInfo.source + "?retry=" + Date.now();
          if (element.src) element.src = newSrc;
          if (element.href) element.href = newSrc;
          console.log(`Retrying resource: ${errorInfo.source}`);
        }
      });
    }

    registerRecovery(type, strategy) {
      this.recoveryStrategies.set(type, strategy);
    }

    async attemptRecovery(errorInfo) {
      const strategy = this.recoveryStrategies.get(errorInfo.type);
      if (strategy) {
        try {
          const result = await strategy(errorInfo);
          if (result) {
            this.showRecoveryNotification(errorInfo);
          }
        } catch (e) {
          console.warn("Recovery failed:", e);
        }
      }
    }

    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // Error Reporting
    async reportError(errorInfo) {
      try {
        await fetch(this.config.reportEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...errorInfo,
            appVersion: window.BAEL_VERSION || "unknown",
            sessionId: this.getSessionId(),
          }),
        });
      } catch (e) {
        console.warn("Failed to report error:", e);
      }
    }

    getSessionId() {
      let sessionId = sessionStorage.getItem("bael_session_id");
      if (!sessionId) {
        sessionId =
          Date.now().toString(36) + Math.random().toString(36).substr(2);
        sessionStorage.setItem("bael_session_id", sessionId);
      }
      return sessionId;
    }

    // UI
    createUI() {
      // Error notification container
      this.notificationContainer = document.createElement("div");
      this.notificationContainer.id = "bael-error-notifications";
      document.body.appendChild(this.notificationContainer);

      // Error panel
      this.panel = document.createElement("div");
      this.panel.id = "bael-error-panel";
      this.panel.innerHTML = `
                <div class="error-panel-header">
                    <h3>🛡️ Error Log</h3>
                    <div class="error-panel-actions">
                        <button class="clear-btn" title="Clear errors">🗑️ Clear</button>
                        <button class="export-btn" title="Export errors">📤 Export</button>
                        <button class="close-btn" title="Close">✕</button>
                    </div>
                </div>

                <div class="error-panel-stats">
                    <div class="stat">
                        <span class="count" id="error-count-total">0</span>
                        <span class="label">Total</span>
                    </div>
                    <div class="stat">
                        <span class="count" id="error-count-uncaught">0</span>
                        <span class="label">Uncaught</span>
                    </div>
                    <div class="stat">
                        <span class="count" id="error-count-network">0</span>
                        <span class="label">Network</span>
                    </div>
                    <div class="stat">
                        <span class="count" id="error-count-promise">0</span>
                        <span class="label">Promise</span>
                    </div>
                </div>

                <div class="error-panel-list"></div>

                <div class="error-panel-config">
                    <h4>Configuration</h4>
                    <label>
                        <input type="checkbox" id="error-show-notifications" ${this.config.showNotifications ? "checked" : ""}>
                        Show notifications
                    </label>
                    <label>
                        <input type="checkbox" id="error-enable-recovery" ${this.config.enableRecovery ? "checked" : ""}>
                        Enable auto-recovery
                    </label>
                </div>
            `;
      document.body.appendChild(this.panel);

      // Error indicator
      this.indicator = document.createElement("div");
      this.indicator.id = "bael-error-indicator";
      this.indicator.innerHTML = `
                <span class="indicator-icon">⚠️</span>
                <span class="indicator-count">0</span>
            `;
      this.indicator.style.display = "none";
      document.body.appendChild(this.indicator);
    }

    showErrorNotification(errorInfo) {
      const notification = document.createElement("div");
      notification.className = `error-notification ${errorInfo.type}`;
      notification.innerHTML = `
                <div class="notification-icon">⚠️</div>
                <div class="notification-content">
                    <div class="notification-title">${this.getErrorTitle(errorInfo.type)}</div>
                    <div class="notification-message">${this.truncate(errorInfo.message, 100)}</div>
                </div>
                <button class="notification-close">✕</button>
            `;

      notification
        .querySelector(".notification-close")
        .addEventListener("click", () => {
          notification.remove();
        });

      this.notificationContainer.appendChild(notification);

      setTimeout(() => {
        notification.classList.add("visible");
      }, 10);

      setTimeout(() => {
        notification.classList.remove("visible");
        setTimeout(() => notification.remove(), 300);
      }, 5000);
    }

    showRecoveryNotification(errorInfo) {
      const notification = document.createElement("div");
      notification.className = "error-notification recovery";
      notification.innerHTML = `
                <div class="notification-icon">✓</div>
                <div class="notification-content">
                    <div class="notification-title">Recovery Successful</div>
                    <div class="notification-message">Recovered from: ${this.truncate(errorInfo.message, 60)}</div>
                </div>
            `;

      this.notificationContainer.appendChild(notification);

      setTimeout(() => notification.classList.add("visible"), 10);
      setTimeout(() => {
        notification.classList.remove("visible");
        setTimeout(() => notification.remove(), 300);
      }, 3000);
    }

    getErrorTitle(type) {
      const titles = {
        uncaught: "JavaScript Error",
        promise: "Async Error",
        network: "Network Error",
        resource: "Resource Error",
        xhr: "Request Error",
      };
      return titles[type] || "Error";
    }

    truncate(str, length) {
      if (!str) return "";
      return str.length > length ? str.substring(0, length) + "..." : str;
    }

    updateErrorList() {
      const list = this.panel.querySelector(".error-panel-list");
      const recentErrors = this.errors.slice(-50).reverse();

      list.innerHTML = recentErrors
        .map(
          (error) => `
                <div class="error-item ${error.type}">
                    <div class="error-item-header">
                        <span class="error-type">${error.type}</span>
                        <span class="error-time">${this.formatTime(error.timestamp)}</span>
                    </div>
                    <div class="error-message">${this.escapeHtml(error.message)}</div>
                    ${error.filename ? `<div class="error-location">${error.filename}:${error.lineno}</div>` : ""}
                </div>
            `,
        )
        .join("");

      // Update stats
      this.panel.querySelector("#error-count-total").textContent =
        this.errors.length;
      this.panel.querySelector("#error-count-uncaught").textContent =
        this.errors.filter((e) => e.type === "uncaught").length;
      this.panel.querySelector("#error-count-network").textContent =
        this.errors.filter(
          (e) => e.type === "network" || e.type === "xhr",
        ).length;
      this.panel.querySelector("#error-count-promise").textContent =
        this.errors.filter((e) => e.type === "promise").length;

      // Update indicator
      const count = this.errors.length;
      this.indicator.querySelector(".indicator-count").textContent = count;
      this.indicator.style.display = count > 0 ? "flex" : "none";
    }

    formatTime(date) {
      if (!date) return "";
      return new Date(date).toLocaleTimeString();
    }

    escapeHtml(str) {
      const div = document.createElement("div");
      div.textContent = str || "";
      return div.innerHTML;
    }

    addStyles() {
      const style = document.createElement("style");
      style.textContent = `
                /* Error Notifications */
                #bael-error-notifications {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 100003;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    max-width: 400px;
                }

                .error-notification {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 12px 16px;
                    background: #f44336;
                    color: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    opacity: 0;
                    transform: translateX(100%);
                    transition: opacity 0.3s, transform 0.3s;
                }

                .error-notification.visible {
                    opacity: 1;
                    transform: translateX(0);
                }

                .error-notification.network {
                    background: #ff9800;
                }

                .error-notification.recovery {
                    background: #4caf50;
                }

                .notification-icon {
                    font-size: 20px;
                }

                .notification-content {
                    flex: 1;
                }

                .notification-title {
                    font-weight: 600;
                    margin-bottom: 4px;
                }

                .notification-message {
                    font-size: 12px;
                    opacity: 0.9;
                }

                .notification-close {
                    background: transparent;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 0;
                    font-size: 16px;
                    opacity: 0.7;
                }

                .notification-close:hover {
                    opacity: 1;
                }

                /* Error Indicator */
                #bael-error-indicator {
                    position: fixed;
                    bottom: 20px;
                    left: 140px;
                    background: #f44336;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 20px;
                    cursor: pointer;
                    z-index: 99998;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    box-shadow: 0 2px 8px rgba(244, 67, 54, 0.4);
                    transition: transform 0.2s;
                }

                #bael-error-indicator:hover {
                    transform: scale(1.05);
                }

                .indicator-icon {
                    font-size: 14px;
                }

                .indicator-count {
                    font-weight: bold;
                }

                /* Error Panel */
                #bael-error-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.9);
                    width: 600px;
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

                #bael-error-panel.visible {
                    display: flex;
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }

                .error-panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background: var(--bael-bg-dark, #151515);
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .error-panel-header h3 {
                    margin: 0;
                    font-size: 16px;
                    color: var(--bael-text, #fff);
                }

                .error-panel-actions {
                    display: flex;
                    gap: 8px;
                }

                .error-panel-actions button {
                    background: var(--bael-surface, #252525);
                    border: 1px solid var(--bael-border, #333);
                    color: var(--bael-text, #fff);
                    padding: 6px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                }

                .error-panel-actions .close-btn {
                    background: transparent;
                    border: none;
                }

                .error-panel-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    padding: 16px;
                    background: rgba(0,0,0,0.2);
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .error-panel-stats .stat {
                    text-align: center;
                }

                .error-panel-stats .count {
                    display: block;
                    font-size: 24px;
                    font-weight: bold;
                    color: var(--bael-text, #fff);
                }

                .error-panel-stats .label {
                    font-size: 11px;
                    color: var(--bael-text-dim, #888);
                    text-transform: uppercase;
                }

                .error-panel-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px;
                }

                .error-item {
                    padding: 12px;
                    background: var(--bael-bg-dark, #151515);
                    border-radius: 8px;
                    margin-bottom: 8px;
                    border-left: 3px solid #f44336;
                }

                .error-item.network, .error-item.xhr {
                    border-left-color: #ff9800;
                }

                .error-item.resource {
                    border-left-color: #2196f3;
                }

                .error-item-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .error-type {
                    background: #f44336;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 10px;
                    text-transform: uppercase;
                }

                .error-item.network .error-type, .error-item.xhr .error-type {
                    background: #ff9800;
                }

                .error-time {
                    font-size: 11px;
                    color: var(--bael-text-dim, #888);
                }

                .error-message {
                    font-family: monospace;
                    font-size: 12px;
                    color: var(--bael-text, #fff);
                    word-break: break-word;
                }

                .error-location {
                    font-size: 11px;
                    color: var(--bael-text-dim, #888);
                    margin-top: 6px;
                }

                .error-panel-config {
                    padding: 16px;
                    background: var(--bael-bg-dark, #151515);
                    border-top: 1px solid var(--bael-border, #333);
                }

                .error-panel-config h4 {
                    margin: 0 0 12px;
                    font-size: 12px;
                    color: var(--bael-text-dim, #888);
                    text-transform: uppercase;
                }

                .error-panel-config label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: var(--bael-text, #fff);
                    margin-bottom: 8px;
                    cursor: pointer;
                }

                .error-panel-config input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                }
            `;
      document.head.appendChild(style);
    }

    bindEvents() {
      // Indicator click
      this.indicator.addEventListener("click", () => {
        this.open();
      });

      // Close button
      this.panel.querySelector(".close-btn").addEventListener("click", () => {
        this.close();
      });

      // Clear button
      this.panel.querySelector(".clear-btn").addEventListener("click", () => {
        this.clearErrors();
      });

      // Export button
      this.panel.querySelector(".export-btn").addEventListener("click", () => {
        this.exportErrors();
      });

      // Config changes
      this.panel
        .querySelector("#error-show-notifications")
        .addEventListener("change", (e) => {
          this.config.showNotifications = e.target.checked;
          this.saveConfig();
        });

      this.panel
        .querySelector("#error-enable-recovery")
        .addEventListener("change", (e) => {
          this.config.enableRecovery = e.target.checked;
          this.saveConfig();
        });

      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "E") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    clearErrors() {
      this.errors = [];
      this.updateErrorList();
    }

    exportErrors() {
      const data = {
        timestamp: new Date().toISOString(),
        errors: this.errors,
        context: this.captureContext(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bael-errors-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    // Public API
    open() {
      this.panel.classList.add("visible");
      this.updateErrorList();
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

    // Wrap function for error boundary
    wrap(fn, context = null) {
      const self = this;
      return function (...args) {
        try {
          return fn.apply(context, args);
        } catch (error) {
          self.handleError({
            type: "wrapped",
            message: error.message,
            stack: error.stack,
            error,
            timestamp: new Date(),
          });
          throw error;
        }
      };
    }

    // Wrap async function
    wrapAsync(fn, context = null) {
      const self = this;
      return async function (...args) {
        try {
          return await fn.apply(context, args);
        } catch (error) {
          self.handleError({
            type: "wrapped-async",
            message: error.message,
            stack: error.stack,
            error,
            timestamp: new Date(),
          });
          throw error;
        }
      };
    }

    // Manual error capture
    captureError(error, type = "manual", extra = {}) {
      this.handleError({
        type,
        message: error.message || String(error),
        stack: error.stack,
        error,
        timestamp: new Date(),
        ...extra,
      });
    }
  }

  // Initialize
  window.BaelErrorBoundary = new BaelErrorBoundary();
})();
