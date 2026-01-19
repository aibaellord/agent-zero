/**
 * BAEL - LORD OF ALL
 * Advanced Notifications - Rich notification system with actions and persistence
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelNotificationsAdvanced {
    constructor() {
      this.container = null;
      this.notifications = [];
      this.queue = [];
      this.maxVisible = 5;
      this.defaultDuration = 5000;
      this.position = "top-right";
      this.persistent = [];
      this.sounds = {};
      this.init();
    }

    init() {
      this.createContainer();
      this.addStyles();
      this.loadPersistent();
      this.setupSounds();
      console.log("🔔 Bael Advanced Notifications initialized");
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-notifications-advanced";
      this.container.className = `bael-notif-container ${this.position}`;
      document.body.appendChild(this.container);
    }

    addStyles() {
      if (document.getElementById("bael-notifications-advanced-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-notifications-advanced-styles";
      styles.textContent = `
                .bael-notif-container {
                    position: fixed;
                    z-index: 100050;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    max-width: 400px;
                    pointer-events: none;
                }
                .bael-notif-container.top-right { top: 20px; right: 20px; }
                .bael-notif-container.top-left { top: 20px; left: 20px; }
                .bael-notif-container.bottom-right { bottom: 20px; right: 20px; }
                .bael-notif-container.bottom-left { bottom: 20px; left: 20px; }
                .bael-notif-container.top-center { top: 20px; left: 50%; transform: translateX(-50%); }
                .bael-notif-container.bottom-center { bottom: 20px; left: 50%; transform: translateX(-50%); }

                .bael-notif {
                    display: flex;
                    flex-direction: column;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                    overflow: hidden;
                    pointer-events: auto;
                    animation: notifSlideIn 0.3s ease;
                    transform-origin: top right;
                }

                .bael-notif.exiting {
                    animation: notifSlideOut 0.3s ease forwards;
                }

                @keyframes notifSlideIn {
                    from { opacity: 0; transform: translateX(100%) scale(0.9); }
                    to { opacity: 1; transform: translateX(0) scale(1); }
                }

                @keyframes notifSlideOut {
                    from { opacity: 1; transform: translateX(0) scale(1); }
                    to { opacity: 0; transform: translateX(100%) scale(0.9); }
                }

                .bael-notif-progress {
                    height: 3px;
                    background: var(--bael-accent, #ff3366);
                    transition: width linear;
                }

                .bael-notif-content {
                    display: flex;
                    gap: 12px;
                    padding: 14px 16px;
                }

                .bael-notif-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .bael-notif.success .bael-notif-icon { background: rgba(74, 222, 128, 0.2); }
                .bael-notif.error .bael-notif-icon { background: rgba(239, 68, 68, 0.2); }
                .bael-notif.warning .bael-notif-icon { background: rgba(251, 191, 36, 0.2); }
                .bael-notif.info .bael-notif-icon { background: rgba(59, 130, 246, 0.2); }

                .bael-notif-body {
                    flex: 1;
                    min-width: 0;
                }

                .bael-notif-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 4px;
                }

                .bael-notif-message {
                    font-size: 13px;
                    color: var(--bael-text-secondary, #aaa);
                    line-height: 1.4;
                }

                .bael-notif-time {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                    margin-top: 6px;
                }

                .bael-notif-close {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 24px;
                    height: 24px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: all 0.2s;
                }

                .bael-notif:hover .bael-notif-close {
                    opacity: 1;
                }

                .bael-notif-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--bael-text-primary, #fff);
                }

                .bael-notif-actions {
                    display: flex;
                    gap: 8px;
                    padding: 0 16px 14px 68px;
                }

                .bael-notif-action {
                    padding: 6px 12px;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    background: transparent;
                    color: var(--bael-text-secondary, #aaa);
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .bael-notif-action:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .bael-notif-action.primary {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .bael-notif-image {
                    width: 100%;
                    max-height: 200px;
                    object-fit: cover;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-notif-stack {
                    position: relative;
                }

                .bael-notif-badge {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                    font-size: 10px;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 10px;
                    min-width: 18px;
                    text-align: center;
                }
            `;
      document.head.appendChild(styles);
    }

    setupSounds() {
      const audioContext = window.AudioContext || window.webkitAudioContext;
      if (!audioContext) return;

      this.audioContext = new audioContext();
    }

    playSound(type) {
      if (!this.audioContext) return;

      const frequencies = {
        success: [523.25, 659.25, 783.99],
        error: [392, 349.23],
        warning: [440, 466.16],
        info: [523.25, 587.33],
      };

      const freqs = frequencies[type] || frequencies.info;

      freqs.forEach((freq, i) => {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = freq;
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(
          0.1,
          this.audioContext.currentTime + i * 0.1,
        );
        gainNode.gain.exponentialDecayTo &&
          gainNode.gain.exponentialDecayTo(
            0.01,
            this.audioContext.currentTime + i * 0.1 + 0.2,
          );

        oscillator.start(this.audioContext.currentTime + i * 0.1);
        oscillator.stop(this.audioContext.currentTime + i * 0.1 + 0.2);
      });
    }

    /**
     * Show a notification
     */
    show(options) {
      const {
        type = "info",
        title = "",
        message = "",
        duration = this.defaultDuration,
        actions = [],
        image = null,
        sound = false,
        persistent = false,
        id = Date.now().toString(),
        closable = true,
        onClick = null,
        data = {},
      } = typeof options === "string" ? { message: options } : options;

      // Check if we need to queue
      if (this.notifications.length >= this.maxVisible) {
        this.queue.push(options);
        return id;
      }

      const icons = {
        success: "✅",
        error: "❌",
        warning: "⚠️",
        info: "ℹ️",
      };

      const notification = document.createElement("div");
      notification.className = `bael-notif ${type}`;
      notification.dataset.id = id;
      notification.style.position = "relative";

      notification.innerHTML = `
                ${duration > 0 ? `<div class="bael-notif-progress" style="width: 100%;"></div>` : ""}
                <div class="bael-notif-content">
                    <div class="bael-notif-icon">${icons[type]}</div>
                    <div class="bael-notif-body">
                        ${title ? `<div class="bael-notif-title">${title}</div>` : ""}
                        <div class="bael-notif-message">${message}</div>
                        <div class="bael-notif-time">${new Date().toLocaleTimeString()}</div>
                    </div>
                </div>
                ${closable ? `<button class="bael-notif-close">✕</button>` : ""}
                ${
                  actions.length > 0
                    ? `
                    <div class="bael-notif-actions">
                        ${actions
                          .map(
                            (action, i) => `
                            <button class="bael-notif-action ${action.primary ? "primary" : ""}" data-action="${i}">
                                ${action.label}
                            </button>
                        `,
                          )
                          .join("")}
                    </div>
                `
                    : ""
                }
                ${image ? `<img class="bael-notif-image" src="${image}" alt="">` : ""}
            `;

      // Event handlers
      if (closable) {
        notification
          .querySelector(".bael-notif-close")
          .addEventListener("click", (e) => {
            e.stopPropagation();
            this.dismiss(id);
          });
      }

      actions.forEach((action, i) => {
        const btn = notification.querySelector(`[data-action="${i}"]`);
        if (btn) {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            action.callback?.();
            if (action.dismiss !== false) {
              this.dismiss(id);
            }
          });
        }
      });

      if (onClick) {
        notification.style.cursor = "pointer";
        notification.addEventListener("click", () => {
          onClick(data);
          this.dismiss(id);
        });
      }

      // Add to container
      this.container.appendChild(notification);
      this.notifications.push({ id, element: notification, persistent });

      // Play sound
      if (sound) {
        this.playSound(type);
      }

      // Auto dismiss
      if (duration > 0) {
        const progress = notification.querySelector(".bael-notif-progress");
        if (progress) {
          progress.style.transition = `width ${duration}ms linear`;
          requestAnimationFrame(() => {
            progress.style.width = "0%";
          });
        }

        setTimeout(() => this.dismiss(id), duration);
      }

      // Save persistent
      if (persistent) {
        this.savePersistent(id, options);
      }

      return id;
    }

    /**
     * Dismiss a notification
     */
    dismiss(id) {
      const index = this.notifications.findIndex((n) => n.id === id);
      if (index === -1) return;

      const { element } = this.notifications[index];
      element.classList.add("exiting");

      setTimeout(() => {
        element.remove();
        this.notifications.splice(index, 1);
        this.removePersistent(id);

        // Show queued notification
        if (this.queue.length > 0) {
          this.show(this.queue.shift());
        }
      }, 300);
    }

    /**
     * Dismiss all notifications
     */
    dismissAll() {
      [...this.notifications].forEach((n) => this.dismiss(n.id));
    }

    /**
     * Convenience methods
     */
    success(message, options = {}) {
      return this.show({ type: "success", message, ...options });
    }

    error(message, options = {}) {
      return this.show({ type: "error", message, duration: 8000, ...options });
    }

    warning(message, options = {}) {
      return this.show({ type: "warning", message, ...options });
    }

    info(message, options = {}) {
      return this.show({ type: "info", message, ...options });
    }

    /**
     * Show confirmation notification
     */
    confirm(message, options = {}) {
      return new Promise((resolve) => {
        this.show({
          type: "warning",
          message,
          duration: 0,
          closable: false,
          actions: [
            {
              label: options.cancelLabel || "Cancel",
              callback: () => resolve(false),
            },
            {
              label: options.confirmLabel || "Confirm",
              primary: true,
              callback: () => resolve(true),
            },
          ],
          ...options,
        });
      });
    }

    /**
     * Show promise notification
     */
    promise(promise, options = {}) {
      const id = this.show({
        type: "info",
        message: options.loading || "Loading...",
        duration: 0,
      });

      promise
        .then((result) => {
          this.dismiss(id);
          this.success(
            typeof options.success === "function"
              ? options.success(result)
              : options.success || "Success!",
          );
        })
        .catch((error) => {
          this.dismiss(id);
          this.error(
            typeof options.error === "function"
              ? options.error(error)
              : options.error || error.message || "Error!",
          );
        });

      return promise;
    }

    /**
     * Save persistent notification
     */
    savePersistent(id, options) {
      this.persistent.push({ id, options, timestamp: Date.now() });
      localStorage.setItem(
        "bael-notifications-persistent",
        JSON.stringify(this.persistent),
      );
    }

    /**
     * Remove persistent notification
     */
    removePersistent(id) {
      this.persistent = this.persistent.filter((n) => n.id !== id);
      localStorage.setItem(
        "bael-notifications-persistent",
        JSON.stringify(this.persistent),
      );
    }

    /**
     * Load persistent notifications
     */
    loadPersistent() {
      try {
        this.persistent = JSON.parse(
          localStorage.getItem("bael-notifications-persistent") || "[]",
        );
        // Re-show persistent notifications
        this.persistent.forEach(({ options }) => {
          this.show({ ...options, persistent: false });
        });
      } catch {
        this.persistent = [];
      }
    }

    /**
     * Set position
     */
    setPosition(position) {
      this.container.className = `bael-notif-container ${position}`;
      this.position = position;
    }

    /**
     * Request browser notification permission
     */
    async requestPermission() {
      if (!("Notification" in window)) return false;

      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    /**
     * Show native browser notification
     */
    async native(title, options = {}) {
      if (!("Notification" in window)) return null;

      if (Notification.permission !== "granted") {
        const granted = await this.requestPermission();
        if (!granted) return null;
      }

      const notification = new Notification(title, {
        icon: "/public/bael-favicon.svg",
        badge: "/public/bael-favicon.svg",
        ...options,
      });

      if (options.onClick) {
        notification.onclick = options.onClick;
      }

      return notification;
    }
  }

  // Initialize
  window.BaelNotificationsAdvanced = new BaelNotificationsAdvanced();
})();
