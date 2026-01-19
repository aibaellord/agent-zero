/**
 * BAEL - LORD OF ALL
 * Notification Center - Centralized notification management
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelNotificationCenter {
    constructor() {
      this.notifications = [];
      this.unreadCount = 0;
      this.panel = null;
      this.maxNotifications = 100;
      this.storageKey = "bael-notification-center";
      this.categories = {
        system: { icon: "⚙️", color: "#6366f1" },
        agent: { icon: "🤖", color: "#4ade80" },
        error: { icon: "❌", color: "#ef4444" },
        success: { icon: "✅", color: "#22c55e" },
        warning: { icon: "⚠️", color: "#fbbf24" },
        info: { icon: "ℹ️", color: "#3b82f6" },
        task: { icon: "📋", color: "#8b5cf6" },
        message: { icon: "💬", color: "#f472b6" },
      };
      this.init();
    }

    init() {
      this.addStyles();
      this.loadNotifications();
      this.createUI();
      this.bindEvents();
      this.hookIntoBaelNotifications();
      console.log("🔔 Bael Notification Center initialized");
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-notif-center-styles";
      styles.textContent = `
                /* Bell Button */
                .bael-bell-btn {
                    position: fixed;
                    top: 20px;
                    right: 80px;
                    width: 40px;
                    height: 40px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    z-index: 100010;
                    transition: all 0.3s ease;
                }

                .bael-bell-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.1);
                }

                .bael-bell-btn.has-unread {
                    animation: bellShake 0.5s ease;
                }

                @keyframes bellShake {
                    0%, 100% { transform: rotate(0); }
                    25% { transform: rotate(10deg); }
                    50% { transform: rotate(-10deg); }
                    75% { transform: rotate(5deg); }
                }

                .bell-badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    min-width: 18px;
                    height: 18px;
                    background: var(--bael-accent, #ff3366);
                    border-radius: 10px;
                    font-size: 10px;
                    font-weight: 700;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 4px;
                }

                .bell-badge.hidden {
                    display: none;
                }

                /* Notification Panel */
                .bael-notif-panel {
                    position: fixed;
                    top: 70px;
                    right: 20px;
                    width: 400px;
                    max-height: 70vh;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 14px;
                    z-index: 100030;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                }

                .bael-notif-panel.visible {
                    display: flex;
                    animation: notifPanelIn 0.2s ease;
                }

                @keyframes notifPanelIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Panel Header */
                .notif-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .notif-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .notif-actions {
                    display: flex;
                    gap: 6px;
                }

                .notif-action-btn {
                    padding: 6px 10px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .notif-action-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                /* Filters */
                .notif-filters {
                    display: flex;
                    gap: 6px;
                    padding: 10px 12px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    overflow-x: auto;
                }

                .notif-filter {
                    padding: 5px 10px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 20px;
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    white-space: nowrap;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    transition: all 0.2s ease;
                }

                .notif-filter:hover,
                .notif-filter.active {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-accent, #ff3366);
                }

                .notif-filter.active {
                    background: rgba(255, 51, 102, 0.15);
                }

                /* Notification List */
                .notif-list {
                    flex: 1;
                    overflow-y: auto;
                }

                .notif-group {
                    margin-bottom: 4px;
                }

                .notif-group-header {
                    padding: 8px 16px;
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--bael-text-muted, #555);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    background: var(--bael-bg-tertiary, #181820);
                }

                .notif-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 12px 16px;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .notif-item:hover {
                    background: var(--bael-bg-secondary, #12121a);
                }

                .notif-item.unread {
                    background: rgba(255, 51, 102, 0.05);
                    border-left: 3px solid var(--bael-accent, #ff3366);
                }

                .notif-icon {
                    width: 36px;
                    height: 36px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    flex-shrink: 0;
                }

                .notif-content {
                    flex: 1;
                    min-width: 0;
                }

                .notif-message {
                    font-size: 13px;
                    color: var(--bael-text-primary, #fff);
                    line-height: 1.4;
                    margin-bottom: 4px;
                }

                .notif-meta {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .notif-category {
                    padding: 2px 6px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-radius: 4px;
                    font-size: 9px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .notif-dismiss {
                    width: 24px;
                    height: 24px;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-muted, #555);
                    cursor: pointer;
                    border-radius: 4px;
                    font-size: 12px;
                    opacity: 0;
                    transition: all 0.2s ease;
                }

                .notif-item:hover .notif-dismiss {
                    opacity: 1;
                }

                .notif-dismiss:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                /* Empty State */
                .notif-empty {
                    text-align: center;
                    padding: 40px 20px;
                }

                .notif-empty-icon {
                    font-size: 48px;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }

                .notif-empty-text {
                    font-size: 13px;
                    color: var(--bael-text-muted, #666);
                }

                /* Settings */
                .notif-settings {
                    padding: 12px 16px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    background: var(--bael-bg-secondary, #12121a);
                }

                .notif-setting {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 0;
                }

                .notif-setting-label {
                    font-size: 12px;
                    color: var(--bael-text-primary, #fff);
                }

                .notif-toggle {
                    position: relative;
                    width: 36px;
                    height: 20px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .notif-toggle.active {
                    background: var(--bael-accent, #ff3366);
                }

                .notif-toggle::after {
                    content: '';
                    position: absolute;
                    top: 3px;
                    left: 3px;
                    width: 14px;
                    height: 14px;
                    background: #fff;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                }

                .notif-toggle.active::after {
                    left: 19px;
                }
            `;
      document.head.appendChild(styles);
    }

    loadNotifications() {
      try {
        const saved = JSON.parse(
          localStorage.getItem(this.storageKey) ||
            '{"notifications":[],"unread":0}',
        );
        this.notifications = saved.notifications || [];
        this.unreadCount = saved.unread || 0;
      } catch {
        this.notifications = [];
        this.unreadCount = 0;
      }
    }

    saveNotifications() {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({
          notifications: this.notifications.slice(0, this.maxNotifications),
          unread: this.unreadCount,
        }),
      );
    }

    createUI() {
      // Bell button
      const bell = document.createElement("button");
      bell.className = "bael-bell-btn";
      bell.innerHTML = `
                <span>🔔</span>
                <span class="bell-badge ${this.unreadCount === 0 ? "hidden" : ""}">${this.unreadCount}</span>
            `;
      bell.addEventListener("click", () => this.togglePanel());
      document.body.appendChild(bell);
      this.bell = bell;

      // Panel
      const panel = document.createElement("div");
      panel.className = "bael-notif-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;

      this.bindPanelEvents();
    }

    renderPanel() {
      return `
                <div class="notif-header">
                    <div class="notif-title">
                        <span>🔔</span>
                        <span>Notifications</span>
                    </div>
                    <div class="notif-actions">
                        <button class="notif-action-btn" id="mark-all-read">Mark all read</button>
                        <button class="notif-action-btn" id="clear-all">Clear all</button>
                    </div>
                </div>

                <div class="notif-filters">
                    <button class="notif-filter active" data-filter="all">All</button>
                    <button class="notif-filter" data-filter="unread">
                        <span>●</span> Unread
                    </button>
                    ${Object.entries(this.categories)
                      .map(
                        ([key, cat]) =>
                          `<button class="notif-filter" data-filter="${key}">${cat.icon} ${this.capitalize(key)}</button>`,
                      )
                      .join("")}
                </div>

                <div class="notif-list" id="notif-list">
                    ${this.renderNotificationList()}
                </div>
            `;
    }

    renderNotificationList(filter = "all") {
      let filtered = this.notifications;

      if (filter === "unread") {
        filtered = filtered.filter((n) => !n.read);
      } else if (filter !== "all") {
        filtered = filtered.filter((n) => n.category === filter);
      }

      if (filtered.length === 0) {
        return `
                    <div class="notif-empty">
                        <div class="notif-empty-icon">🔕</div>
                        <div class="notif-empty-text">No notifications</div>
                    </div>
                `;
      }

      // Group by date
      const groups = this.groupByDate(filtered);

      return Object.entries(groups)
        .map(
          ([date, items]) => `
                <div class="notif-group">
                    <div class="notif-group-header">${date}</div>
                    ${items.map((n, i) => this.renderNotificationItem(n)).join("")}
                </div>
            `,
        )
        .join("");
    }

    renderNotificationItem(notif) {
      const cat = this.categories[notif.category] || this.categories.info;
      const time = this.formatTime(notif.timestamp);

      return `
                <div class="notif-item ${notif.read ? "" : "unread"}" data-id="${notif.id}">
                    <div class="notif-icon" style="color: ${cat.color}">${cat.icon}</div>
                    <div class="notif-content">
                        <div class="notif-message">${this.escapeHtml(notif.message)}</div>
                        <div class="notif-meta">
                            <span class="notif-category">${notif.category}</span>
                            <span>${time}</span>
                        </div>
                    </div>
                    <button class="notif-dismiss" title="Dismiss">×</button>
                </div>
            `;
    }

    groupByDate(notifications) {
      const groups = {};
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();

      notifications.forEach((n) => {
        const date = new Date(n.timestamp).toDateString();
        let label;

        if (date === today) label = "Today";
        else if (date === yesterday) label = "Yesterday";
        else label = new Date(n.timestamp).toLocaleDateString();

        if (!groups[label]) groups[label] = [];
        groups[label].push(n);
      });

      return groups;
    }

    bindPanelEvents() {
      // Mark all read
      this.panel
        .querySelector("#mark-all-read")
        .addEventListener("click", () => {
          this.markAllRead();
        });

      // Clear all
      this.panel.querySelector("#clear-all").addEventListener("click", () => {
        this.clearAll();
      });

      // Filters
      this.panel.querySelectorAll(".notif-filter").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.panel
            .querySelectorAll(".notif-filter")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          this.refreshList(btn.dataset.filter);
        });
      });

      // Item clicks
      this.panel.querySelector("#notif-list").addEventListener("click", (e) => {
        const dismiss = e.target.closest(".notif-dismiss");
        const item = e.target.closest(".notif-item");

        if (dismiss && item) {
          e.stopPropagation();
          this.dismissNotification(item.dataset.id);
        } else if (item) {
          this.markAsRead(item.dataset.id);
        }
      });
    }

    bindEvents() {
      // Click outside to close
      document.addEventListener("click", (e) => {
        if (!this.panel.contains(e.target) && !this.bell.contains(e.target)) {
          this.closePanel();
        }
      });

      // Escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.panel.classList.contains("visible")) {
          this.closePanel();
        }
      });
    }

    hookIntoBaelNotifications() {
      // Hook into existing BaelNotifications if available
      const originalNotif = window.BaelNotifications;
      if (originalNotif) {
        const self = this;

        // Wrap existing methods
        ["success", "error", "warning", "info"].forEach((type) => {
          const original = originalNotif[type].bind(originalNotif);
          originalNotif[type] = function (message, options) {
            // Call original
            original(message, options);
            // Add to center
            self.addNotification(
              message,
              type === "error"
                ? "error"
                : type === "warning"
                  ? "warning"
                  : type === "success"
                    ? "success"
                    : "info",
            );
          };
        });
      }
    }

    addNotification(message, category = "info", options = {}) {
      const notif = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        message,
        category,
        timestamp: Date.now(),
        read: false,
        ...options,
      };

      this.notifications.unshift(notif);
      this.unreadCount++;

      // Limit notifications
      if (this.notifications.length > this.maxNotifications) {
        this.notifications = this.notifications.slice(0, this.maxNotifications);
      }

      this.saveNotifications();
      this.updateBadge();
      this.refreshList();

      // Animate bell
      this.bell.classList.add("has-unread");
      setTimeout(() => this.bell.classList.remove("has-unread"), 500);

      return notif.id;
    }

    markAsRead(id) {
      const notif = this.notifications.find((n) => n.id === id);
      if (notif && !notif.read) {
        notif.read = true;
        this.unreadCount = Math.max(0, this.unreadCount - 1);
        this.saveNotifications();
        this.updateBadge();
        this.refreshList();
      }
    }

    markAllRead() {
      this.notifications.forEach((n) => (n.read = true));
      this.unreadCount = 0;
      this.saveNotifications();
      this.updateBadge();
      this.refreshList();
    }

    dismissNotification(id) {
      const index = this.notifications.findIndex((n) => n.id === id);
      if (index >= 0) {
        const notif = this.notifications[index];
        if (!notif.read) {
          this.unreadCount = Math.max(0, this.unreadCount - 1);
        }
        this.notifications.splice(index, 1);
        this.saveNotifications();
        this.updateBadge();
        this.refreshList();
      }
    }

    clearAll() {
      if (confirm("Clear all notifications?")) {
        this.notifications = [];
        this.unreadCount = 0;
        this.saveNotifications();
        this.updateBadge();
        this.refreshList();
      }
    }

    updateBadge() {
      const badge = this.bell.querySelector(".bell-badge");
      badge.textContent = this.unreadCount;
      badge.classList.toggle("hidden", this.unreadCount === 0);
    }

    refreshList(filter = "all") {
      const list = this.panel.querySelector("#notif-list");
      list.innerHTML = this.renderNotificationList(filter);
    }

    togglePanel() {
      if (this.panel.classList.contains("visible")) {
        this.closePanel();
      } else {
        this.openPanel();
      }
    }

    openPanel() {
      this.panel.classList.add("visible");
    }

    closePanel() {
      this.panel.classList.remove("visible");
    }

    formatTime(timestamp) {
      const diff = Date.now() - timestamp;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);

      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return new Date(timestamp).toLocaleDateString();
    }

    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    // Public API
    notify(message, category = "info", options = {}) {
      return this.addNotification(message, category, options);
    }

    agent(message) {
      return this.addNotification(message, "agent");
    }

    system(message) {
      return this.addNotification(message, "system");
    }

    task(message) {
      return this.addNotification(message, "task");
    }
  }

  // Initialize
  window.BaelNotificationCenter = new BaelNotificationCenter();
})();
