/**
 * BAEL - LORD OF ALL
 * Notification Center - Enhanced toast and notification system
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelNotifications {
    constructor() {
      this.container = null;
      this.center = null;
      this.notifications = [];
      this.history = [];
      this.maxHistory = 100;
      this.isCenterOpen = false;
      this.defaultDuration = 4000;
      this.position = "top-right";
      this.init();
    }

    init() {
      this.createContainer();
      this.createNotificationCenter();
      this.addStyles();
      this.bindEvents();
      console.log("🔔 Bael Notifications initialized");
    }

    createContainer() {
      const container = document.createElement("div");
      container.id = "bael-notifications";
      container.className = "bael-notifications top-right";
      document.body.appendChild(container);
      this.container = container;
    }

    createNotificationCenter() {
      const center = document.createElement("div");
      center.id = "bael-notification-center";
      center.className = "bael-notification-center";
      center.innerHTML = `
                <div class="nc-header">
                    <div class="nc-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                        <span>Notifications</span>
                        <span class="nc-count" id="nc-count">0</span>
                    </div>
                    <div class="nc-actions">
                        <button class="nc-btn" id="nc-mark-all-read" title="Mark all as read">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="9 11 12 14 22 4"/>
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                            </svg>
                        </button>
                        <button class="nc-btn" id="nc-clear-all" title="Clear all">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                        <button class="nc-btn" id="nc-close" title="Close">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="nc-tabs">
                    <button class="nc-tab active" data-tab="all">All</button>
                    <button class="nc-tab" data-tab="unread">Unread</button>
                    <button class="nc-tab" data-tab="system">System</button>
                    <button class="nc-tab" data-tab="agent">Agent</button>
                </div>
                <div class="nc-list" id="nc-list">
                    <div class="nc-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                            <line x1="9" y1="9" x2="9.01" y2="9"/>
                            <line x1="15" y1="9" x2="15.01" y2="9"/>
                        </svg>
                        <p>No notifications</p>
                    </div>
                </div>
                <div class="nc-footer">
                    <button class="nc-settings-btn" id="nc-settings">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                        </svg>
                        Settings
                    </button>
                </div>
            `;
      document.body.appendChild(center);
      this.center = center;
    }

    addStyles() {
      if (document.getElementById("bael-notifications-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-notifications-styles";
      styles.textContent = `
                /* Toast Container */
                .bael-notifications {
                    position: fixed;
                    z-index: 100001;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    pointer-events: none;
                }

                .bael-notifications.top-right {
                    top: 20px;
                    right: 20px;
                }

                .bael-notifications.top-left {
                    top: 20px;
                    left: 20px;
                }

                .bael-notifications.bottom-right {
                    bottom: 20px;
                    right: 20px;
                }

                .bael-notifications.bottom-left {
                    bottom: 20px;
                    left: 20px;
                }

                .bael-notifications.top-center {
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                }

                /* Individual Toast */
                .bael-toast {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    min-width: 320px;
                    max-width: 420px;
                    padding: 14px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                    pointer-events: auto;
                    animation: toastIn 0.3s ease;
                    transition: all 0.3s ease;
                }

                @keyframes toastIn {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                .bael-toast.hiding {
                    opacity: 0;
                    transform: translateX(100%);
                }

                .bael-toast.success {
                    border-left: 4px solid #4caf50;
                }

                .bael-toast.error {
                    border-left: 4px solid #f44336;
                }

                .bael-toast.warning {
                    border-left: 4px solid #ff9800;
                }

                .bael-toast.info {
                    border-left: 4px solid #2196f3;
                }

                .bael-toast.agent {
                    border-left: 4px solid var(--bael-accent, #ff3366);
                }

                .toast-icon {
                    width: 24px;
                    height: 24px;
                    flex-shrink: 0;
                }

                .bael-toast.success .toast-icon { color: #4caf50; }
                .bael-toast.error .toast-icon { color: #f44336; }
                .bael-toast.warning .toast-icon { color: #ff9800; }
                .bael-toast.info .toast-icon { color: #2196f3; }
                .bael-toast.agent .toast-icon { color: var(--bael-accent, #ff3366); }

                .toast-content {
                    flex: 1;
                    min-width: 0;
                }

                .toast-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 4px;
                }

                .toast-message {
                    font-size: 13px;
                    color: var(--bael-text-secondary, #888);
                    line-height: 1.4;
                    word-break: break-word;
                }

                .toast-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 10px;
                }

                .toast-action {
                    padding: 6px 12px;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    background: transparent;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .toast-action:hover {
                    border-color: var(--bael-accent, #ff3366);
                    background: rgba(255, 51, 102, 0.1);
                }

                .toast-action.primary {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                }

                .toast-close {
                    width: 20px;
                    height: 20px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 4px;
                    transition: all 0.2s ease;
                    flex-shrink: 0;
                }

                .toast-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--bael-text-primary, #fff);
                }

                .toast-close svg {
                    width: 14px;
                    height: 14px;
                }

                .toast-progress {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 3px;
                    background: var(--bael-accent, #ff3366);
                    border-radius: 0 0 0 12px;
                    animation: toastProgress linear forwards;
                }

                @keyframes toastProgress {
                    from { width: 100%; }
                    to { width: 0%; }
                }

                /* Notification Center */
                .bael-notification-center {
                    position: fixed;
                    top: 60px;
                    right: 20px;
                    width: 380px;
                    max-height: calc(100vh - 100px);
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
                    z-index: 99999;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                }

                .bael-notification-center.open {
                    display: flex;
                    animation: ncSlideIn 0.3s ease;
                }

                @keyframes ncSlideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .nc-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .nc-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .nc-title svg {
                    width: 20px;
                    height: 20px;
                    color: var(--bael-accent, #ff3366);
                }

                .nc-count {
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                    font-size: 11px;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: 10px;
                    min-width: 20px;
                    text-align: center;
                }

                .nc-actions {
                    display: flex;
                    gap: 4px;
                }

                .nc-btn {
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-secondary, #888);
                    cursor: pointer;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .nc-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--bael-text-primary, #fff);
                }

                .nc-btn svg {
                    width: 16px;
                    height: 16px;
                }

                .nc-tabs {
                    display: flex;
                    padding: 8px 12px;
                    gap: 4px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .nc-tab {
                    padding: 6px 12px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-secondary, #888);
                    font-size: 12px;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: all 0.2s ease;
                }

                .nc-tab:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .nc-tab.active {
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .nc-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px;
                }

                .nc-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    color: var(--bael-text-muted, #666);
                    text-align: center;
                }

                .nc-empty svg {
                    width: 48px;
                    height: 48px;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }

                .nc-item {
                    display: flex;
                    gap: 12px;
                    padding: 12px;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                }

                .nc-item:hover {
                    background: rgba(255, 255, 255, 0.03);
                }

                .nc-item.unread {
                    background: rgba(255, 51, 102, 0.05);
                }

                .nc-item.unread::before {
                    content: '';
                    position: absolute;
                    left: 4px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 6px;
                    height: 6px;
                    background: var(--bael-accent, #ff3366);
                    border-radius: 50%;
                }

                .nc-item-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .nc-item-icon.success { background: rgba(76, 175, 80, 0.2); color: #4caf50; }
                .nc-item-icon.error { background: rgba(244, 67, 54, 0.2); color: #f44336; }
                .nc-item-icon.warning { background: rgba(255, 152, 0, 0.2); color: #ff9800; }
                .nc-item-icon.info { background: rgba(33, 150, 243, 0.2); color: #2196f3; }
                .nc-item-icon.agent { background: rgba(255, 51, 102, 0.2); color: var(--bael-accent, #ff3366); }

                .nc-item-icon svg {
                    width: 18px;
                    height: 18px;
                }

                .nc-item-content {
                    flex: 1;
                    min-width: 0;
                }

                .nc-item-title {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 4px;
                }

                .nc-item-message {
                    font-size: 12px;
                    color: var(--bael-text-secondary, #888);
                    line-height: 1.4;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                }

                .nc-item-time {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                    margin-top: 4px;
                }

                .nc-footer {
                    padding: 12px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                }

                .nc-settings-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 10px;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    background: transparent;
                    color: var(--bael-text-secondary, #888);
                    font-size: 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .nc-settings-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-accent, #ff3366);
                }

                .nc-settings-btn svg {
                    width: 14px;
                    height: 14px;
                }
            `;
      document.head.appendChild(styles);
    }

    bindEvents() {
      // Notification center controls
      this.center
        .querySelector("#nc-close")
        .addEventListener("click", () => this.closeCenter());
      this.center
        .querySelector("#nc-mark-all-read")
        .addEventListener("click", () => this.markAllRead());
      this.center
        .querySelector("#nc-clear-all")
        .addEventListener("click", () => this.clearAll());

      // Tabs
      this.center.querySelectorAll(".nc-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          this.center
            .querySelectorAll(".nc-tab")
            .forEach((t) => t.classList.remove("active"));
          tab.classList.add("active");
          this.filterHistory(tab.dataset.tab);
        });
      });

      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isCenterOpen) {
          this.closeCenter();
        }
      });
    }

    icons = {
      success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
      error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
      warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
      agent: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 3a3 3 0 1 1-3 3 3 3 0 0 1 3-3zm0 14.2a8.2 8.2 0 0 1-6-2.6 4.8 4.8 0 0 1 4-2.1h4a4.8 4.8 0 0 1 4 2.1 8.2 8.2 0 0 1-6 2.6z"/></svg>`,
      close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    };

    // Create and show a toast notification
    show(options) {
      const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
      const notification = {
        id,
        type: options.type || "info",
        title: options.title || "",
        message: options.message || "",
        duration:
          options.duration !== undefined
            ? options.duration
            : this.defaultDuration,
        actions: options.actions || [],
        category: options.category || "system",
        timestamp: new Date(),
        read: false,
        persistent: options.persistent || false,
      };

      // Create toast element
      const toast = this.createToastElement(notification);
      this.container.appendChild(toast);
      this.notifications.push({ id, element: toast });

      // Add to history
      this.addToHistory(notification);

      // Play sound if enabled
      if (window.BaelAudio && options.sound !== false) {
        window.BaelAudio.play(
          notification.type === "success"
            ? "success"
            : notification.type === "error"
              ? "error"
              : "notify",
        );
      }

      // Auto-dismiss
      if (notification.duration > 0 && !notification.persistent) {
        setTimeout(() => this.dismiss(id), notification.duration);
      }

      return id;
    }

    createToastElement(notification) {
      const toast = document.createElement("div");
      toast.className = `bael-toast ${notification.type}`;
      toast.dataset.id = notification.id;

      const actionsHtml =
        notification.actions.length > 0
          ? `
                <div class="toast-actions">
                    ${notification.actions
                      .map(
                        (action) => `
                        <button class="toast-action ${action.primary ? "primary" : ""}"
                                data-action="${action.id}">${action.label}</button>
                    `,
                      )
                      .join("")}
                </div>
            `
          : "";

      const progressHtml =
        notification.duration > 0 && !notification.persistent
          ? `
                <div class="toast-progress" style="animation-duration: ${notification.duration}ms"></div>
            `
          : "";

      toast.innerHTML = `
                <div class="toast-icon">${this.icons[notification.type] || this.icons.info}</div>
                <div class="toast-content">
                    ${notification.title ? `<div class="toast-title">${notification.title}</div>` : ""}
                    <div class="toast-message">${notification.message}</div>
                    ${actionsHtml}
                </div>
                <button class="toast-close">${this.icons.close}</button>
                ${progressHtml}
            `;

      // Bind close button
      toast.querySelector(".toast-close").addEventListener("click", () => {
        this.dismiss(notification.id);
      });

      // Bind action buttons
      toast.querySelectorAll(".toast-action").forEach((btn) => {
        btn.addEventListener("click", () => {
          const action = notification.actions.find(
            (a) => a.id === btn.dataset.action,
          );
          if (action?.handler) action.handler();
          if (action?.dismiss !== false) this.dismiss(notification.id);
        });
      });

      return toast;
    }

    dismiss(id) {
      const index = this.notifications.findIndex((n) => n.id === id);
      if (index === -1) return;

      const { element } = this.notifications[index];
      element.classList.add("hiding");

      setTimeout(() => {
        element.remove();
        this.notifications.splice(index, 1);
      }, 300);
    }

    dismissAll() {
      this.notifications.forEach((n) => this.dismiss(n.id));
    }

    // Convenience methods
    success(message, options = {}) {
      return this.show({ ...options, type: "success", message });
    }

    error(message, options = {}) {
      return this.show({
        ...options,
        type: "error",
        message,
        duration: options.duration || 6000,
      });
    }

    warning(message, options = {}) {
      return this.show({ ...options, type: "warning", message });
    }

    info(message, options = {}) {
      return this.show({ ...options, type: "info", message });
    }

    agent(message, options = {}) {
      return this.show({
        ...options,
        type: "agent",
        category: "agent",
        message,
      });
    }

    // Notification Center methods
    addToHistory(notification) {
      this.history.unshift(notification);
      if (this.history.length > this.maxHistory) {
        this.history.pop();
      }
      this.updateCenter();
    }

    updateCenter() {
      const list = this.center.querySelector("#nc-list");
      const unreadCount = this.history.filter((n) => !n.read).length;

      this.center.querySelector("#nc-count").textContent = unreadCount;

      if (this.history.length === 0) {
        list.innerHTML = `
                    <div class="nc-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                            <line x1="9" y1="9" x2="9.01" y2="9"/>
                            <line x1="15" y1="9" x2="15.01" y2="9"/>
                        </svg>
                        <p>No notifications</p>
                    </div>
                `;
        return;
      }

      list.innerHTML = this.history
        .map((n) => this.renderHistoryItem(n))
        .join("");

      // Bind click handlers
      list.querySelectorAll(".nc-item").forEach((item) => {
        item.addEventListener("click", () => {
          const id = item.dataset.id;
          this.markRead(id);
        });
      });
    }

    renderHistoryItem(notification) {
      const timeAgo = this.getTimeAgo(notification.timestamp);

      return `
                <div class="nc-item ${notification.read ? "" : "unread"}" data-id="${notification.id}">
                    <div class="nc-item-icon ${notification.type}">
                        ${this.icons[notification.type] || this.icons.info}
                    </div>
                    <div class="nc-item-content">
                        ${notification.title ? `<div class="nc-item-title">${notification.title}</div>` : ""}
                        <div class="nc-item-message">${notification.message}</div>
                        <div class="nc-item-time">${timeAgo}</div>
                    </div>
                </div>
            `;
    }

    getTimeAgo(date) {
      const seconds = Math.floor((new Date() - new Date(date)) / 1000);

      if (seconds < 60) return "Just now";
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      return `${Math.floor(seconds / 86400)}d ago`;
    }

    filterHistory(filter) {
      // Re-render with filter
      const list = this.center.querySelector("#nc-list");
      let filtered = this.history;

      if (filter === "unread") {
        filtered = this.history.filter((n) => !n.read);
      } else if (filter !== "all") {
        filtered = this.history.filter((n) => n.category === filter);
      }

      if (filtered.length === 0) {
        list.innerHTML = `
                    <div class="nc-empty">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
                            <line x1="9" y1="9" x2="9.01" y2="9"/>
                            <line x1="15" y1="9" x2="15.01" y2="9"/>
                        </svg>
                        <p>No notifications</p>
                    </div>
                `;
        return;
      }

      list.innerHTML = filtered.map((n) => this.renderHistoryItem(n)).join("");
    }

    markRead(id) {
      const notification = this.history.find((n) => n.id === id);
      if (notification) {
        notification.read = true;
        this.updateCenter();
      }
    }

    markAllRead() {
      this.history.forEach((n) => (n.read = true));
      this.updateCenter();
    }

    clearAll() {
      this.history = [];
      this.updateCenter();
    }

    openCenter() {
      this.updateCenter();
      this.center.classList.add("open");
      this.isCenterOpen = true;
    }

    closeCenter() {
      this.center.classList.remove("open");
      this.isCenterOpen = false;
    }

    toggleCenter() {
      if (this.isCenterOpen) {
        this.closeCenter();
      } else {
        this.openCenter();
      }
    }

    setPosition(position) {
      this.container.className = `bael-notifications ${position}`;
      this.position = position;
    }
  }

  // Initialize and expose globally
  window.BaelNotifications = new BaelNotifications();

  // Convenience aliases
  window.Bael = window.Bael || {};
  window.Bael.notifications = window.BaelNotifications;
  window.Bael.toast = {
    success: (msg, opts) => window.BaelNotifications.success(msg, opts),
    error: (msg, opts) => window.BaelNotifications.error(msg, opts),
    warning: (msg, opts) => window.BaelNotifications.warning(msg, opts),
    info: (msg, opts) => window.BaelNotifications.info(msg, opts),
    agent: (msg, opts) => window.BaelNotifications.agent(msg, opts),
  };
})();
