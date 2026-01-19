/**
 * BAEL Error Boundary Component - Lord Of All Errors
 *
 * Error handling and recovery:
 * - Error capture
 * - Fallback UI
 * - Retry mechanisms
 * - Error reporting
 * - Graceful degradation
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // ERROR BOUNDARY CLASS
  // ============================================================

  class BaelErrorBoundary {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this.errors = [];
      this._injectStyles();
      this._setupGlobalHandlers();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-error-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-error-styles";
      styles.textContent = `
                .bael-error-boundary {
                    position: relative;
                }

                .bael-error-boundary.has-error {
                    min-height: 100px;
                }

                .bael-error-fallback {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 32px 24px;
                    text-align: center;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    background: rgba(239, 68, 68, 0.05);
                    border: 1px solid rgba(239, 68, 68, 0.2);
                    border-radius: 12px;
                }

                .bael-error-fallback.minimal {
                    padding: 16px;
                    flex-direction: row;
                    gap: 12px;
                    text-align: left;
                }

                .bael-error-fallback.inline {
                    display: inline-flex;
                    padding: 8px 12px;
                    font-size: 13px;
                }

                .bael-error-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 64px;
                    height: 64px;
                    background: rgba(239, 68, 68, 0.15);
                    border-radius: 50%;
                    color: #ef4444;
                    margin-bottom: 16px;
                }

                .bael-error-fallback.minimal .bael-error-icon,
                .bael-error-fallback.inline .bael-error-icon {
                    width: 32px;
                    height: 32px;
                    margin-bottom: 0;
                }

                .bael-error-icon svg {
                    width: 32px;
                    height: 32px;
                }

                .bael-error-fallback.minimal .bael-error-icon svg,
                .bael-error-fallback.inline .bael-error-icon svg {
                    width: 18px;
                    height: 18px;
                }

                .bael-error-content {
                    flex: 1;
                }

                .bael-error-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #fff;
                    margin: 0 0 6px;
                }

                .bael-error-fallback.minimal .bael-error-title,
                .bael-error-fallback.inline .bael-error-title {
                    font-size: 14px;
                    margin-bottom: 2px;
                }

                .bael-error-message {
                    font-size: 14px;
                    color: #888;
                    margin: 0;
                    max-width: 400px;
                }

                .bael-error-fallback.inline .bael-error-message {
                    font-size: 12px;
                }

                .bael-error-details {
                    margin-top: 16px;
                    padding: 12px;
                    background: rgba(0,0,0,0.3);
                    border-radius: 8px;
                    font-family: 'SF Mono', Monaco, monospace;
                    font-size: 12px;
                    color: #f87171;
                    text-align: left;
                    max-width: 500px;
                    overflow-x: auto;
                    white-space: pre-wrap;
                    word-break: break-all;
                }

                .bael-error-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 20px;
                }

                .bael-error-fallback.minimal .bael-error-actions {
                    margin-top: 8px;
                }

                .bael-error-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 10px 18px;
                    font-size: 14px;
                    font-weight: 500;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.15s;
                    font-family: inherit;
                }

                .bael-error-btn.primary {
                    background: #ef4444;
                    color: #fff;
                }

                .bael-error-btn.primary:hover {
                    background: #dc2626;
                }

                .bael-error-btn.secondary {
                    background: rgba(255,255,255,0.08);
                    color: #ccc;
                }

                .bael-error-btn.secondary:hover {
                    background: rgba(255,255,255,0.12);
                    color: #fff;
                }

                .bael-error-btn svg {
                    width: 16px;
                    height: 16px;
                }

                /* Toast error notification */
                .bael-error-toast {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 14px 18px;
                    background: linear-gradient(135deg, #dc2626, #b91c1c);
                    border-radius: 12px;
                    color: #fff;
                    box-shadow: 0 8px 32px rgba(239, 68, 68, 0.4);
                    z-index: 10000;
                    max-width: 400px;
                    animation: bael-error-slide-in 0.3s ease;
                }

                @keyframes bael-error-slide-in {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                .bael-error-toast.exiting {
                    animation: bael-error-slide-out 0.2s ease forwards;
                }

                @keyframes bael-error-slide-out {
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }

                .bael-error-toast-icon {
                    flex-shrink: 0;
                }

                .bael-error-toast-icon svg {
                    width: 20px;
                    height: 20px;
                }

                .bael-error-toast-content {
                    flex: 1;
                }

                .bael-error-toast-title {
                    font-weight: 600;
                    font-size: 14px;
                    margin-bottom: 2px;
                }

                .bael-error-toast-message {
                    font-size: 13px;
                    opacity: 0.9;
                }

                .bael-error-toast-close {
                    flex-shrink: 0;
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.7);
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: all 0.15s;
                }

                .bael-error-toast-close:hover {
                    background: rgba(255,255,255,0.1);
                    color: #fff;
                }

                .bael-error-toast-close svg {
                    width: 16px;
                    height: 16px;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // ICONS
    // ============================================================

    _errorIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    _refreshIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>';
    _closeIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    _warningIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';

    // ============================================================
    // GLOBAL ERROR HANDLERS
    // ============================================================

    /**
     * Setup global error handlers
     */
    _setupGlobalHandlers() {
      // JavaScript errors
      window.addEventListener("error", (e) => {
        this._logError({
          type: "javascript",
          message: e.message,
          filename: e.filename,
          lineno: e.lineno,
          colno: e.colno,
          error: e.error,
        });
      });

      // Promise rejections
      window.addEventListener("unhandledrejection", (e) => {
        this._logError({
          type: "promise",
          message: e.reason?.message || String(e.reason),
          error: e.reason,
        });
      });
    }

    /**
     * Log error
     */
    _logError(error) {
      this.errors.push({
        ...error,
        timestamp: Date.now(),
      });

      // Keep last 100 errors
      if (this.errors.length > 100) {
        this.errors.shift();
      }
    }

    // ============================================================
    // CREATE ERROR BOUNDARY
    // ============================================================

    /**
     * Create error boundary wrapper
     */
    wrap(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Error boundary container not found");
        return null;
      }

      const id = `bael-error-boundary-${++this.idCounter}`;
      const config = {
        fallback: "default", // default, minimal, inline, custom
        showDetails: false, // Show error stack
        retryable: true,
        retryLabel: "Retry",
        title: "Something went wrong",
        message: "An error occurred while rendering this component.",
        customFallback: null, // Custom fallback element
        onError: null, // (error) => {}
        onRetry: null, // () => {}
        ...options,
      };

      const wrapper = document.createElement("div");
      wrapper.className = "bael-error-boundary";
      wrapper.id = id;

      // Wrap container content
      while (container.firstChild) {
        wrapper.appendChild(container.firstChild);
      }
      container.appendChild(wrapper);

      const state = {
        id,
        element: wrapper,
        container,
        config,
        hasError: false,
        error: null,
        originalContent: wrapper.innerHTML,
      };

      this.instances.set(id, state);

      return {
        id,
        setError: (e) => this._setError(state, e),
        clear: () => this._clear(state),
        retry: () => this._retry(state),
        getErrors: () => [...this.errors],
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Set error state
     */
    _setError(state, error) {
      state.hasError = true;
      state.error = error;
      state.element.classList.add("has-error");

      // Save original content if not saved
      if (!state.originalContent) {
        state.originalContent = state.element.innerHTML;
      }

      // Clear content
      state.element.innerHTML = "";

      // Log error
      this._logError({
        type: "boundary",
        message: error?.message || String(error),
        error,
      });

      // Callback
      if (state.config.onError) {
        state.config.onError(error);
      }

      // Render fallback
      this._renderFallback(state);
    }

    /**
     * Render fallback UI
     */
    _renderFallback(state) {
      const { element, config, error } = state;

      if (config.customFallback) {
        if (typeof config.customFallback === "function") {
          const fallback = config.customFallback(error);
          if (typeof fallback === "string") {
            element.innerHTML = fallback;
          } else {
            element.appendChild(fallback);
          }
        } else if (typeof config.customFallback === "string") {
          element.innerHTML = config.customFallback;
        } else {
          element.appendChild(config.customFallback);
        }
        return;
      }

      const fallback = document.createElement("div");
      fallback.className = `bael-error-fallback ${config.fallback}`;

      // Icon
      const icon = document.createElement("div");
      icon.className = "bael-error-icon";
      icon.innerHTML = this._errorIcon;
      fallback.appendChild(icon);

      // Content
      const content = document.createElement("div");
      content.className = "bael-error-content";

      const title = document.createElement("h4");
      title.className = "bael-error-title";
      title.textContent = config.title;
      content.appendChild(title);

      const message = document.createElement("p");
      message.className = "bael-error-message";
      message.textContent = config.message;
      content.appendChild(message);

      // Details
      if (config.showDetails && error) {
        const details = document.createElement("pre");
        details.className = "bael-error-details";
        details.textContent = error.stack || error.message || String(error);
        content.appendChild(details);
      }

      // Actions
      if (config.retryable) {
        const actions = document.createElement("div");
        actions.className = "bael-error-actions";

        const retryBtn = document.createElement("button");
        retryBtn.className = "bael-error-btn primary";
        retryBtn.innerHTML = this._refreshIcon;
        retryBtn.appendChild(document.createTextNode(config.retryLabel));
        retryBtn.addEventListener("click", () => this._retry(state));
        actions.appendChild(retryBtn);

        content.appendChild(actions);
      }

      fallback.appendChild(content);
      element.appendChild(fallback);
    }

    /**
     * Clear error
     */
    _clear(state) {
      state.hasError = false;
      state.error = null;
      state.element.classList.remove("has-error");
      state.element.innerHTML = state.originalContent;
    }

    /**
     * Retry
     */
    _retry(state) {
      this._clear(state);

      if (state.config.onRetry) {
        try {
          state.config.onRetry();
        } catch (error) {
          this._setError(state, error);
        }
      }
    }

    // ============================================================
    // TOAST NOTIFICATIONS
    // ============================================================

    /**
     * Show error toast
     */
    toast(message, options = {}) {
      const config = {
        title: "Error",
        duration: 5000,
        closable: true,
        ...options,
      };

      const toast = document.createElement("div");
      toast.className = "bael-error-toast";

      // Icon
      const icon = document.createElement("div");
      icon.className = "bael-error-toast-icon";
      icon.innerHTML = this._warningIcon;
      toast.appendChild(icon);

      // Content
      const content = document.createElement("div");
      content.className = "bael-error-toast-content";

      const title = document.createElement("div");
      title.className = "bael-error-toast-title";
      title.textContent = config.title;
      content.appendChild(title);

      const msg = document.createElement("div");
      msg.className = "bael-error-toast-message";
      msg.textContent = message;
      content.appendChild(msg);

      toast.appendChild(content);

      // Close button
      if (config.closable) {
        const close = document.createElement("button");
        close.className = "bael-error-toast-close";
        close.innerHTML = this._closeIcon;
        close.addEventListener("click", () => this._dismissToast(toast));
        toast.appendChild(close);
      }

      document.body.appendChild(toast);

      // Auto dismiss
      if (config.duration > 0) {
        setTimeout(() => this._dismissToast(toast), config.duration);
      }

      return {
        dismiss: () => this._dismissToast(toast),
      };
    }

    /**
     * Dismiss toast
     */
    _dismissToast(toast) {
      if (!toast.parentNode) return;

      toast.classList.add("exiting");
      setTimeout(() => toast.remove(), 200);
    }

    // ============================================================
    // TRY-CATCH WRAPPER
    // ============================================================

    /**
     * Safely execute a function
     */
    try(fn, fallback = null) {
      try {
        return fn();
      } catch (error) {
        this._logError({
          type: "try-catch",
          message: error.message,
          error,
        });
        return fallback;
      }
    }

    /**
     * Async safe execute
     */
    async tryAsync(fn, fallback = null) {
      try {
        return await fn();
      } catch (error) {
        this._logError({
          type: "async-try-catch",
          message: error.message,
          error,
        });
        return fallback;
      }
    }

    /**
     * Destroy instance
     */
    destroy(id) {
      const state = this.instances.get(id);
      if (!state) return;

      this._clear(state);
      this.instances.delete(id);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelErrorBoundary();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$errorBoundary = (container, options) => bael.wrap(container, options);
  window.$errorToast = (message, options) => bael.toast(message, options);
  window.$try = (fn, fallback) => bael.try(fn, fallback);
  window.$tryAsync = (fn, fallback) => bael.tryAsync(fn, fallback);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelErrorBoundary = bael;

  console.log("🛡️ BAEL Error Boundary loaded");
})();
