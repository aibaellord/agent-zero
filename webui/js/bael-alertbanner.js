/**
 * BAEL Alert/Banner Component - Lord Of All Messages
 *
 * Alert/notification banner system:
 * - Info, success, warning, error types
 * - Dismissible alerts
 * - Actions buttons
 * - Icons
 * - Animated entrance
 * - Auto-dismiss timer
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // ALERT CLASS
  // ============================================================

  class BaelAlert {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-alert-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-alert-styles";
      styles.textContent = `
                .bael-alert {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 16px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 12px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    animation: bael-alert-in 0.2s ease-out;
                }

                @keyframes bael-alert-in {
                    from {
                        opacity: 0;
                        transform: translateY(-8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .bael-alert.exiting {
                    animation: bael-alert-out 0.2s ease-out forwards;
                }

                @keyframes bael-alert-out {
                    to {
                        opacity: 0;
                        transform: translateY(-8px);
                    }
                }

                /* Icon */
                .bael-alert-icon {
                    flex-shrink: 0;
                    width: 20px;
                    height: 20px;
                    margin-top: 1px;
                }

                .bael-alert-icon svg {
                    width: 100%;
                    height: 100%;
                }

                /* Content */
                .bael-alert-content {
                    flex: 1;
                    min-width: 0;
                }

                .bael-alert-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 4px;
                }

                .bael-alert-message {
                    font-size: 13px;
                    color: #aaa;
                    line-height: 1.5;
                }

                /* Actions */
                .bael-alert-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 12px;
                }

                .bael-alert-action {
                    padding: 6px 12px;
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 500;
                    color: #ddd;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .bael-alert-action:hover {
                    background: rgba(255,255,255,0.12);
                }

                .bael-alert-action.primary {
                    background: rgba(59, 130, 246, 0.2);
                    border-color: rgba(59, 130, 246, 0.3);
                    color: #3b82f6;
                }

                .bael-alert-action.primary:hover {
                    background: rgba(59, 130, 246, 0.3);
                }

                /* Close button */
                .bael-alert-close {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 24px;
                    height: 24px;
                    background: none;
                    border: none;
                    border-radius: 4px;
                    color: #666;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .bael-alert-close:hover {
                    background: rgba(255,255,255,0.1);
                    color: #fff;
                }

                .bael-alert-close svg {
                    width: 14px;
                    height: 14px;
                }

                /* Type: Info */
                .bael-alert.info {
                    background: rgba(59, 130, 246, 0.1);
                    border-color: rgba(59, 130, 246, 0.2);
                }

                .bael-alert.info .bael-alert-icon {
                    color: #3b82f6;
                }

                /* Type: Success */
                .bael-alert.success {
                    background: rgba(34, 197, 94, 0.1);
                    border-color: rgba(34, 197, 94, 0.2);
                }

                .bael-alert.success .bael-alert-icon {
                    color: #22c55e;
                }

                /* Type: Warning */
                .bael-alert.warning {
                    background: rgba(234, 179, 8, 0.1);
                    border-color: rgba(234, 179, 8, 0.2);
                }

                .bael-alert.warning .bael-alert-icon {
                    color: #eab308;
                }

                /* Type: Error */
                .bael-alert.error {
                    background: rgba(239, 68, 68, 0.1);
                    border-color: rgba(239, 68, 68, 0.2);
                }

                .bael-alert.error .bael-alert-icon {
                    color: #ef4444;
                }

                /* Variants */
                .bael-alert.filled.info {
                    background: #3b82f6;
                    border-color: #3b82f6;
                }

                .bael-alert.filled.info .bael-alert-icon,
                .bael-alert.filled.info .bael-alert-title,
                .bael-alert.filled.info .bael-alert-message {
                    color: white;
                }

                .bael-alert.filled.success {
                    background: #22c55e;
                    border-color: #22c55e;
                }

                .bael-alert.filled.success .bael-alert-icon,
                .bael-alert.filled.success .bael-alert-title,
                .bael-alert.filled.success .bael-alert-message {
                    color: white;
                }

                .bael-alert.filled.warning {
                    background: #eab308;
                    border-color: #eab308;
                }

                .bael-alert.filled.warning .bael-alert-icon,
                .bael-alert.filled.warning .bael-alert-title,
                .bael-alert.filled.warning .bael-alert-message {
                    color: #1a1a1a;
                }

                .bael-alert.filled.error {
                    background: #ef4444;
                    border-color: #ef4444;
                }

                .bael-alert.filled.error .bael-alert-icon,
                .bael-alert.filled.error .bael-alert-title,
                .bael-alert.filled.error .bael-alert-message {
                    color: white;
                }

                /* Outlined variant */
                .bael-alert.outlined {
                    background: transparent;
                }

                /* Compact */
                .bael-alert.compact {
                    padding: 12px;
                    gap: 10px;
                }

                .bael-alert.compact .bael-alert-icon {
                    width: 16px;
                    height: 16px;
                }

                .bael-alert.compact .bael-alert-title {
                    font-size: 13px;
                }

                .bael-alert.compact .bael-alert-message {
                    font-size: 12px;
                }

                /* Progress bar for auto-dismiss */
                .bael-alert-progress {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 3px;
                    background: currentColor;
                    opacity: 0.3;
                    border-radius: 0 0 12px 12px;
                    transition: width linear;
                }

                .bael-alert.info .bael-alert-progress { background: #3b82f6; }
                .bael-alert.success .bael-alert-progress { background: #22c55e; }
                .bael-alert.warning .bael-alert-progress { background: #eab308; }
                .bael-alert.error .bael-alert-progress { background: #ef4444; }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // ICONS
    // ============================================================

    _icons = {
      info: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><path fill="#1e1e1e" d="M12 16v-4M12 8h.01"/></svg>',
      success:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
      warning:
        '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 21h22L12 2z"/><path fill="#1e1e1e" d="M12 14v-4M12 17h.01"/></svg>',
      error:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    };

    // ============================================================
    // CREATE ALERT
    // ============================================================

    /**
     * Create alert component
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Alert container not found");
        return null;
      }

      const id = `bael-alert-${++this.idCounter}`;
      const config = {
        type: "info", // info, success, warning, error
        title: "",
        message: "",
        icon: true, // Show icon or custom SVG
        dismissible: true,
        autoDismiss: 0, // ms, 0 = never
        showProgress: false, // Show countdown progress bar
        variant: "default", // default, filled, outlined
        compact: false,
        actions: [], // [{ label: 'Action', primary: false, onClick: fn }]
        onDismiss: null,
        ...options,
      };

      const el = document.createElement("div");
      el.className = `bael-alert ${config.type}`;
      if (config.variant !== "default") el.classList.add(config.variant);
      if (config.compact) el.classList.add("compact");
      el.id = id;
      el.style.position = "relative";

      const state = {
        id,
        element: el,
        container,
        config,
        timer: null,
      };

      this._render(state);
      container.appendChild(el);

      // Auto dismiss
      if (config.autoDismiss > 0) {
        if (config.showProgress) {
          const progress = document.createElement("div");
          progress.className = "bael-alert-progress";
          progress.style.width = "100%";
          progress.style.transitionDuration = `${config.autoDismiss}ms`;
          el.appendChild(progress);

          // Force reflow
          progress.offsetHeight;
          progress.style.width = "0%";
        }

        state.timer = setTimeout(() => {
          this._dismiss(state);
        }, config.autoDismiss);
      }

      this.instances.set(id, state);

      return {
        id,
        dismiss: () => this._dismiss(state),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Shorthand methods
     */
    info(container, message, options = {}) {
      return this.create(container, { type: "info", message, ...options });
    }

    success(container, message, options = {}) {
      return this.create(container, { type: "success", message, ...options });
    }

    warning(container, message, options = {}) {
      return this.create(container, { type: "warning", message, ...options });
    }

    error(container, message, options = {}) {
      return this.create(container, { type: "error", message, ...options });
    }

    /**
     * Render alert
     */
    _render(state) {
      const { element, config } = state;

      // Icon
      if (config.icon) {
        const icon = document.createElement("div");
        icon.className = "bael-alert-icon";
        icon.innerHTML =
          typeof config.icon === "string"
            ? config.icon
            : this._icons[config.type];
        element.appendChild(icon);
      }

      // Content
      const content = document.createElement("div");
      content.className = "bael-alert-content";

      if (config.title) {
        const title = document.createElement("div");
        title.className = "bael-alert-title";
        title.textContent = config.title;
        content.appendChild(title);
      }

      if (config.message) {
        const message = document.createElement("div");
        message.className = "bael-alert-message";
        message.innerHTML = config.message;
        content.appendChild(message);
      }

      // Actions
      if (config.actions.length) {
        const actions = document.createElement("div");
        actions.className = "bael-alert-actions";

        config.actions.forEach((action) => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = `bael-alert-action${action.primary ? " primary" : ""}`;
          btn.textContent = action.label;
          btn.addEventListener("click", () => {
            if (action.onClick) action.onClick();
            if (action.dismiss !== false) this._dismiss(state);
          });
          actions.appendChild(btn);
        });

        content.appendChild(actions);
      }

      element.appendChild(content);

      // Close button
      if (config.dismissible) {
        const close = document.createElement("button");
        close.type = "button";
        close.className = "bael-alert-close";
        close.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                `;
        close.addEventListener("click", () => this._dismiss(state));
        element.appendChild(close);
      }
    }

    /**
     * Dismiss alert with animation
     */
    _dismiss(state) {
      if (state.timer) {
        clearTimeout(state.timer);
      }

      state.element.classList.add("exiting");

      setTimeout(() => {
        if (state.config.onDismiss) {
          state.config.onDismiss();
        }
        this.destroy(state.id);
      }, 200);
    }

    /**
     * Destroy alert
     */
    destroy(id) {
      const state = this.instances.get(id);
      if (!state) return;

      if (state.timer) {
        clearTimeout(state.timer);
      }

      state.element.remove();
      this.instances.delete(id);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelAlert();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$alert = (container, options) => bael.create(container, options);
  window.$alertInfo = (container, message, options) =>
    bael.info(container, message, options);
  window.$alertSuccess = (container, message, options) =>
    bael.success(container, message, options);
  window.$alertWarning = (container, message, options) =>
    bael.warning(container, message, options);
  window.$alertError = (container, message, options) =>
    bael.error(container, message, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelAlert = bael;

  console.log("🚨 BAEL Alert Component loaded");
})();
