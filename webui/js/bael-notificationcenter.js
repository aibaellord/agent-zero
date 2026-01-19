/**
 * BAEL Notification Center - Lord Of All Alerts
 *
 * Centralized notification management:
 * - Toast notifications
 * - Persistent notifications
 * - Notification history
 * - Badge counter
 * - Click actions
 * - Sound alerts
 * - Desktop notifications
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // NOTIFICATION CENTER CLASS
  // ============================================================

  class BaelNotificationCenter {
    constructor() {
      this.notifications = [];
      this.unreadCount = 0;
      this.maxHistory = 50;
      this.subscribers = [];
      this._injectStyles();
      this._init();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-notifcenter-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-notifcenter-styles";
      styles.textContent = `
                /* Notification Center Panel */
                .bael-notifcenter {
                    position: fixed;
                    top: 0;
                    right: -380px;
                    width: 380px;
                    height: 100vh;
                    background: white;
                    box-shadow: -4px 0 30px rgba(0,0,0,0.1);
                    z-index: 10000;
                    transition: right 0.3s ease-out;
                    font-family: system-ui, -apple-system, sans-serif;
                    display: flex;
                    flex-direction: column;
                }

                .bael-notifcenter.open {
                    right: 0;
                }

                /* Header */
                .bael-notifcenter-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .bael-notifcenter-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #111827;
                }

                .bael-notifcenter-actions {
                    display: flex;
                    gap: 8px;
                }

                .bael-notifcenter-btn {
                    padding: 6px 12px;
                    border: none;
                    background: #f3f4f6;
                    border-radius: 6px;
                    font-size: 12px;
                    color: #6b7280;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .bael-notifcenter-btn:hover {
                    background: #e5e7eb;
                    color: #374151;
                }

                .bael-notifcenter-close {
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: none;
                    color: #9ca3af;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    transition: all 0.15s;
                }

                .bael-notifcenter-close:hover {
                    background: #f3f4f6;
                    color: #374151;
                }

                /* Tabs */
                .bael-notifcenter-tabs {
                    display: flex;
                    border-bottom: 1px solid #e5e7eb;
                }

                .bael-notifcenter-tab {
                    flex: 1;
                    padding: 12px;
                    border: none;
                    background: none;
                    font-size: 13px;
                    font-weight: 500;
                    color: #6b7280;
                    cursor: pointer;
                    position: relative;
                    transition: color 0.15s;
                }

                .bael-notifcenter-tab:hover {
                    color: #374151;
                }

                .bael-notifcenter-tab.active {
                    color: #4f46e5;
                }

                .bael-notifcenter-tab.active::after {
                    content: '';
                    position: absolute;
                    bottom: -1px;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: #4f46e5;
                }

                .bael-notifcenter-tab-badge {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 18px;
                    height: 18px;
                    padding: 0 6px;
                    margin-left: 6px;
                    background: #ef4444;
                    color: white;
                    font-size: 10px;
                    font-weight: 600;
                    border-radius: 9px;
                }

                /* Content */
                .bael-notifcenter-content {
                    flex: 1;
                    overflow-y: auto;
                }

                .bael-notifcenter-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 20px;
                    color: #9ca3af;
                    text-align: center;
                }

                .bael-notifcenter-empty-icon {
                    width: 64px;
                    height: 64px;
                    margin-bottom: 16px;
                    color: #d1d5db;
                }

                /* Notification item */
                .bael-notifcenter-item {
                    display: flex;
                    gap: 12px;
                    padding: 16px 20px;
                    border-bottom: 1px solid #f3f4f6;
                    cursor: pointer;
                    transition: background 0.15s;
                }

                .bael-notifcenter-item:hover {
                    background: #f9fafb;
                }

                .bael-notifcenter-item.unread {
                    background: #eef2ff;
                }

                .bael-notifcenter-item.unread:hover {
                    background: #e0e7ff;
                }

                .bael-notifcenter-item-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .bael-notifcenter-item-icon svg {
                    width: 20px;
                    height: 20px;
                }

                .bael-notifcenter-item-icon.info {
                    background: #dbeafe;
                    color: #2563eb;
                }

                .bael-notifcenter-item-icon.success {
                    background: #d1fae5;
                    color: #059669;
                }

                .bael-notifcenter-item-icon.warning {
                    background: #fef3c7;
                    color: #d97706;
                }

                .bael-notifcenter-item-icon.error {
                    background: #fee2e2;
                    color: #dc2626;
                }

                .bael-notifcenter-item-body {
                    flex: 1;
                    min-width: 0;
                }

                .bael-notifcenter-item-title {
                    font-size: 14px;
                    font-weight: 500;
                    color: #111827;
                    margin-bottom: 2px;
                }

                .bael-notifcenter-item-message {
                    font-size: 13px;
                    color: #6b7280;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .bael-notifcenter-item-time {
                    font-size: 11px;
                    color: #9ca3af;
                    margin-top: 4px;
                }

                .bael-notifcenter-item-dismiss {
                    width: 24px;
                    height: 24px;
                    border: none;
                    background: none;
                    color: #9ca3af;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.15s;
                }

                .bael-notifcenter-item:hover .bael-notifcenter-item-dismiss {
                    opacity: 1;
                }

                .bael-notifcenter-item-dismiss:hover {
                    color: #ef4444;
                }

                /* Trigger button (optional) */
                .bael-notifcenter-trigger {
                    position: relative;
                    width: 40px;
                    height: 40px;
                    border: none;
                    background: #f3f4f6;
                    border-radius: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #6b7280;
                    transition: all 0.15s;
                }

                .bael-notifcenter-trigger:hover {
                    background: #e5e7eb;
                    color: #374151;
                }

                .bael-notifcenter-trigger-badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    min-width: 18px;
                    height: 18px;
                    padding: 0 5px;
                    background: #ef4444;
                    color: white;
                    font-size: 10px;
                    font-weight: 600;
                    border-radius: 9px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .bael-notifcenter-trigger-badge.hidden {
                    display: none;
                }

                /* Overlay */
                .bael-notifcenter-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.3);
                    z-index: 9999;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.3s, visibility 0.3s;
                }

                .bael-notifcenter-overlay.open {
                    opacity: 1;
                    visibility: visible;
                }
            `;
      document.head.appendChild(styles);
    }

    /**
     * Initialize notification center
     */
    _init() {
      // Create overlay
      this.overlay = document.createElement("div");
      this.overlay.className = "bael-notifcenter-overlay";
      this.overlay.addEventListener("click", () => this.close());
      document.body.appendChild(this.overlay);

      // Create panel
      this.panel = document.createElement("div");
      this.panel.className = "bael-notifcenter";

      // Header
      const header = document.createElement("div");
      header.className = "bael-notifcenter-header";

      const title = document.createElement("div");
      title.className = "bael-notifcenter-title";
      title.textContent = "Notifications";
      header.appendChild(title);

      const actions = document.createElement("div");
      actions.className = "bael-notifcenter-actions";

      const markAllBtn = document.createElement("button");
      markAllBtn.className = "bael-notifcenter-btn";
      markAllBtn.textContent = "Mark all read";
      markAllBtn.addEventListener("click", () => this.markAllRead());
      actions.appendChild(markAllBtn);

      const closeBtn = document.createElement("button");
      closeBtn.className = "bael-notifcenter-close";
      closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
      closeBtn.addEventListener("click", () => this.close());
      actions.appendChild(closeBtn);

      header.appendChild(actions);
      this.panel.appendChild(header);

      // Tabs
      const tabs = document.createElement("div");
      tabs.className = "bael-notifcenter-tabs";

      const allTab = document.createElement("button");
      allTab.className = "bael-notifcenter-tab active";
      allTab.innerHTML = "All";
      allTab.dataset.filter = "all";
      tabs.appendChild(allTab);

      const unreadTab = document.createElement("button");
      unreadTab.className = "bael-notifcenter-tab";
      unreadTab.innerHTML =
        'Unread <span class="bael-notifcenter-tab-badge">0</span>';
      unreadTab.dataset.filter = "unread";
      tabs.appendChild(unreadTab);
      this.unreadBadge = unreadTab.querySelector(".bael-notifcenter-tab-badge");

      tabs.querySelectorAll(".bael-notifcenter-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          tabs
            .querySelectorAll(".bael-notifcenter-tab")
            .forEach((t) => t.classList.remove("active"));
          tab.classList.add("active");
          this.activeFilter = tab.dataset.filter;
          this._renderNotifications();
        });
      });

      this.panel.appendChild(tabs);
      this.activeFilter = "all";

      // Content
      this.content = document.createElement("div");
      this.content.className = "bael-notifcenter-content";
      this.panel.appendChild(this.content);

      document.body.appendChild(this.panel);

      // Load from localStorage
      this._loadFromStorage();
      this._renderNotifications();
    }

    /**
     * Load notifications from localStorage
     */
    _loadFromStorage() {
      try {
        const stored = localStorage.getItem("bael-notifications");
        if (stored) {
          this.notifications = JSON.parse(stored);
          this._updateUnreadCount();
        }
      } catch (e) {
        this.notifications = [];
      }
    }

    /**
     * Save notifications to localStorage
     */
    _saveToStorage() {
      try {
        localStorage.setItem(
          "bael-notifications",
          JSON.stringify(this.notifications.slice(0, this.maxHistory)),
        );
      } catch (e) {
        // Ignore
      }
    }

    /**
     * Update unread count
     */
    _updateUnreadCount() {
      this.unreadCount = this.notifications.filter((n) => !n.read).length;
      if (this.unreadBadge) {
        this.unreadBadge.textContent = this.unreadCount;
        this.unreadBadge.style.display = this.unreadCount > 0 ? "" : "none";
      }
      // Update any trigger badges
      document
        .querySelectorAll(".bael-notifcenter-trigger-badge")
        .forEach((badge) => {
          badge.textContent = this.unreadCount;
          badge.classList.toggle("hidden", this.unreadCount === 0);
        });
      // Notify subscribers
      this.subscribers.forEach((fn) => fn(this.unreadCount));
    }

    /**
     * Get icon for type
     */
    _getIcon(type) {
      const icons = {
        info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
        success:
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        warning:
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        error:
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      };
      return icons[type] || icons.info;
    }

    /**
     * Format relative time
     */
    _formatTime(timestamp) {
      const now = Date.now();
      const diff = now - timestamp;

      if (diff < 60000) return "Just now";
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      return `${Math.floor(diff / 86400000)}d ago`;
    }

    /**
     * Render notifications list
     */
    _renderNotifications() {
      this.content.innerHTML = "";

      let filtered = this.notifications;
      if (this.activeFilter === "unread") {
        filtered = filtered.filter((n) => !n.read);
      }

      if (filtered.length === 0) {
        const empty = document.createElement("div");
        empty.className = "bael-notifcenter-empty";
        empty.innerHTML = `
                    <div class="bael-notifcenter-empty-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                    </div>
                    <div>No notifications</div>
                `;
        this.content.appendChild(empty);
        return;
      }

      filtered.forEach((notification) => {
        const item = document.createElement("div");
        item.className = `bael-notifcenter-item${notification.read ? "" : " unread"}`;

        // Icon
        const icon = document.createElement("div");
        icon.className = `bael-notifcenter-item-icon ${notification.type || "info"}`;
        icon.innerHTML = this._getIcon(notification.type);
        item.appendChild(icon);

        // Body
        const body = document.createElement("div");
        body.className = "bael-notifcenter-item-body";

        const title = document.createElement("div");
        title.className = "bael-notifcenter-item-title";
        title.textContent = notification.title;
        body.appendChild(title);

        if (notification.message) {
          const message = document.createElement("div");
          message.className = "bael-notifcenter-item-message";
          message.textContent = notification.message;
          body.appendChild(message);
        }

        const time = document.createElement("div");
        time.className = "bael-notifcenter-item-time";
        time.textContent = this._formatTime(notification.timestamp);
        body.appendChild(time);

        item.appendChild(body);

        // Dismiss
        const dismiss = document.createElement("button");
        dismiss.className = "bael-notifcenter-item-dismiss";
        dismiss.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
        dismiss.addEventListener("click", (e) => {
          e.stopPropagation();
          this.dismiss(notification.id);
        });
        item.appendChild(dismiss);

        // Click handler
        item.addEventListener("click", () => {
          this.markRead(notification.id);
          if (notification.action) {
            notification.action();
          }
        });

        this.content.appendChild(item);
      });
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    /**
     * Add a notification
     */
    add(options) {
      const notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "info", // info, success, warning, error
        title: "Notification",
        message: "",
        timestamp: Date.now(),
        read: false,
        action: null,
        ...options,
      };

      this.notifications.unshift(notification);

      // Trim history
      if (this.notifications.length > this.maxHistory) {
        this.notifications = this.notifications.slice(0, this.maxHistory);
      }

      this._updateUnreadCount();
      this._saveToStorage();
      this._renderNotifications();

      return notification.id;
    }

    /**
     * Mark notification as read
     */
    markRead(id) {
      const notification = this.notifications.find((n) => n.id === id);
      if (notification && !notification.read) {
        notification.read = true;
        this._updateUnreadCount();
        this._saveToStorage();
        this._renderNotifications();
      }
    }

    /**
     * Mark all as read
     */
    markAllRead() {
      this.notifications.forEach((n) => (n.read = true));
      this._updateUnreadCount();
      this._saveToStorage();
      this._renderNotifications();
    }

    /**
     * Dismiss notification
     */
    dismiss(id) {
      this.notifications = this.notifications.filter((n) => n.id !== id);
      this._updateUnreadCount();
      this._saveToStorage();
      this._renderNotifications();
    }

    /**
     * Clear all notifications
     */
    clearAll() {
      this.notifications = [];
      this._updateUnreadCount();
      this._saveToStorage();
      this._renderNotifications();
    }

    /**
     * Open notification center
     */
    open() {
      this.panel.classList.add("open");
      this.overlay.classList.add("open");
    }

    /**
     * Close notification center
     */
    close() {
      this.panel.classList.remove("open");
      this.overlay.classList.remove("open");
    }

    /**
     * Toggle notification center
     */
    toggle() {
      if (this.panel.classList.contains("open")) {
        this.close();
      } else {
        this.open();
      }
    }

    /**
     * Create trigger button
     */
    createTrigger() {
      const trigger = document.createElement("button");
      trigger.className = "bael-notifcenter-trigger";
      trigger.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span class="bael-notifcenter-trigger-badge ${this.unreadCount === 0 ? "hidden" : ""}">${this.unreadCount}</span>
            `;
      trigger.addEventListener("click", () => this.toggle());
      return trigger;
    }

    /**
     * Subscribe to unread count changes
     */
    subscribe(callback) {
      this.subscribers.push(callback);
      return () => {
        this.subscribers = this.subscribers.filter((fn) => fn !== callback);
      };
    }

    /**
     * Get unread count
     */
    getUnreadCount() {
      return this.unreadCount;
    }

    /**
     * Get all notifications
     */
    getAll() {
      return [...this.notifications];
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelNotificationCenter();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$notifications = {
    add: (options) => bael.add(options),
    info: (title, message, options = {}) =>
      bael.add({ type: "info", title, message, ...options }),
    success: (title, message, options = {}) =>
      bael.add({ type: "success", title, message, ...options }),
    warning: (title, message, options = {}) =>
      bael.add({ type: "warning", title, message, ...options }),
    error: (title, message, options = {}) =>
      bael.add({ type: "error", title, message, ...options }),
    markRead: (id) => bael.markRead(id),
    markAllRead: () => bael.markAllRead(),
    dismiss: (id) => bael.dismiss(id),
    clearAll: () => bael.clearAll(),
    open: () => bael.open(),
    close: () => bael.close(),
    toggle: () => bael.toggle(),
    createTrigger: () => bael.createTrigger(),
    subscribe: (fn) => bael.subscribe(fn),
    getUnreadCount: () => bael.getUnreadCount(),
    getAll: () => bael.getAll(),
  };

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelNotificationCenter = bael;

  console.log("🔔 BAEL Notification Center loaded");
})();
