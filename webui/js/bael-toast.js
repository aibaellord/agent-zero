/**
 * BAEL Toast Notifications - User Notification System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete notification system with:
 * - Multiple positions
 * - Toast types (success, error, warning, info)
 * - Progress bars
 * - Actions and callbacks
 * - Stacking and queue
 * - Persistence
 */

(function () {
  "use strict";

  class BaelToast {
    constructor() {
      this.toasts = new Map();
      this.containers = {};
      this.queue = [];
      this.maxVisible = 5;
      this.defaultDuration = 5000;
      this.defaultPosition = "top-right";
      this.init();
    }

    init() {
      this.createContainers();
      this.addStyles();
      console.log("🔔 Bael Toast initialized");
    }

    // Create containers for each position
    createContainers() {
      const positions = [
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ];

      positions.forEach((pos) => {
        const container = document.createElement("div");
        container.className = `bael-toast-container bael-toast-${pos}`;
        container.dataset.position = pos;
        document.body.appendChild(container);
        this.containers[pos] = container;
      });
    }

    // Show toast
    show(options) {
      const config =
        typeof options === "string" ? { message: options } : options;

      const toast = {
        id:
          config.id ||
          `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: config.type || "info",
        title: config.title || "",
        message: config.message || "",
        duration: config.duration ?? this.defaultDuration,
        position: config.position || this.defaultPosition,
        closable: config.closable !== false,
        progress: config.progress !== false,
        icon: config.icon ?? this.getDefaultIcon(config.type || "info"),
        actions: config.actions || [],
        onClick: config.onClick,
        onClose: config.onClose,
        persistent: config.persistent || false,
        className: config.className || "",
      };

      // Check if max visible reached
      const container = this.containers[toast.position];
      const visibleCount = container.children.length;

      if (visibleCount >= this.maxVisible && !toast.persistent) {
        this.queue.push(toast);
        return toast.id;
      }

      this.renderToast(toast);
      return toast.id;
    }

    // Get default icon for type
    getDefaultIcon(type) {
      const icons = {
        success: "✓",
        error: "✕",
        warning: "⚠",
        info: "ℹ",
        loading: "⟳",
      };
      return icons[type] || icons.info;
    }

    // Render toast element
    renderToast(toast) {
      const element = document.createElement("div");
      element.className = `bael-toast bael-toast-${toast.type} ${toast.className}`;
      element.dataset.id = toast.id;

      element.innerHTML = `
                <div class="bael-toast-icon">${toast.icon}</div>
                <div class="bael-toast-content">
                    ${toast.title ? `<div class="bael-toast-title">${toast.title}</div>` : ""}
                    <div class="bael-toast-message">${toast.message}</div>
                    ${
                      toast.actions.length > 0
                        ? `
                        <div class="bael-toast-actions">
                            ${toast.actions
                              .map(
                                (action, i) => `
                                <button class="bael-toast-action" data-action="${i}">${action.label}</button>
                            `,
                              )
                              .join("")}
                        </div>
                    `
                        : ""
                    }
                </div>
                ${toast.closable ? '<button class="bael-toast-close">✕</button>' : ""}
                ${toast.progress && toast.duration > 0 ? '<div class="bael-toast-progress"></div>' : ""}
            `;

      // Click handler
      if (toast.onClick) {
        element.addEventListener("click", (e) => {
          if (!e.target.closest(".bael-toast-close, .bael-toast-action")) {
            toast.onClick();
          }
        });
      }

      // Close button
      element
        .querySelector(".bael-toast-close")
        ?.addEventListener("click", () => {
          this.close(toast.id);
        });

      // Action buttons
      element.querySelectorAll(".bael-toast-action").forEach((btn, i) => {
        btn.addEventListener("click", () => {
          toast.actions[i].handler?.();
          if (toast.actions[i].close !== false) {
            this.close(toast.id);
          }
        });
      });

      // Add to container
      const container = this.containers[toast.position];
      if (toast.position.startsWith("bottom")) {
        container.prepend(element);
      } else {
        container.appendChild(element);
      }

      // Animate in
      requestAnimationFrame(() => {
        element.classList.add("bael-toast-visible");
      });

      // Progress bar animation
      if (toast.progress && toast.duration > 0) {
        const progressBar = element.querySelector(".bael-toast-progress");
        if (progressBar) {
          progressBar.style.transition = `width ${toast.duration}ms linear`;
          requestAnimationFrame(() => {
            progressBar.style.width = "0%";
          });
        }
      }

      // Store toast
      toast.element = element;
      this.toasts.set(toast.id, toast);

      // Auto close
      if (toast.duration > 0 && !toast.persistent) {
        toast.timeout = setTimeout(() => {
          this.close(toast.id);
        }, toast.duration);
      }

      // Pause on hover
      element.addEventListener("mouseenter", () => {
        if (toast.timeout) {
          clearTimeout(toast.timeout);
          toast.timeout = null;
        }
        const progressBar = element.querySelector(".bael-toast-progress");
        if (progressBar) {
          progressBar.style.animationPlayState = "paused";
        }
      });

      element.addEventListener("mouseleave", () => {
        if (toast.duration > 0 && !toast.persistent) {
          toast.timeout = setTimeout(() => {
            this.close(toast.id);
          }, 1000); // Resume with 1s delay
        }
      });
    }

    // Close toast
    close(id) {
      const toast = this.toasts.get(id);
      if (!toast) return false;

      // Clear timeout
      if (toast.timeout) {
        clearTimeout(toast.timeout);
      }

      // Animate out
      toast.element.classList.remove("bael-toast-visible");
      toast.element.classList.add("bael-toast-hiding");

      setTimeout(() => {
        toast.element.remove();
        this.toasts.delete(id);
        toast.onClose?.();

        // Show queued toast
        if (this.queue.length > 0) {
          const next = this.queue.shift();
          this.renderToast(next);
        }
      }, 300);

      return true;
    }

    // Close all toasts
    closeAll() {
      for (const id of this.toasts.keys()) {
        this.close(id);
      }
      this.queue = [];
    }

    // Update toast
    update(id, options) {
      const toast = this.toasts.get(id);
      if (!toast) return false;

      if (options.message !== undefined) {
        toast.message = options.message;
        toast.element.querySelector(".bael-toast-message").textContent =
          options.message;
      }

      if (options.title !== undefined) {
        toast.title = options.title;
        const titleEl = toast.element.querySelector(".bael-toast-title");
        if (titleEl) titleEl.textContent = options.title;
      }

      if (options.type !== undefined) {
        toast.element.classList.remove(`bael-toast-${toast.type}`);
        toast.type = options.type;
        toast.element.classList.add(`bael-toast-${toast.type}`);
        toast.element.querySelector(".bael-toast-icon").textContent =
          this.getDefaultIcon(options.type);
      }

      return true;
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
        duration: options.duration ?? 8000,
      });
    }

    warning(message, options = {}) {
      return this.show({ ...options, type: "warning", message });
    }

    info(message, options = {}) {
      return this.show({ ...options, type: "info", message });
    }

    loading(message, options = {}) {
      return this.show({
        ...options,
        type: "loading",
        message,
        duration: 0,
        persistent: true,
        closable: false,
        progress: false,
      });
    }

    // Promise toast
    promise(promise, messages) {
      const id = this.loading(messages.loading || "Loading...");

      promise
        .then((result) => {
          this.update(id, {
            type: "success",
            message:
              typeof messages.success === "function"
                ? messages.success(result)
                : messages.success || "Success!",
          });
          setTimeout(() => this.close(id), 3000);
          return result;
        })
        .catch((error) => {
          this.update(id, {
            type: "error",
            message:
              typeof messages.error === "function"
                ? messages.error(error)
                : messages.error || "Something went wrong",
          });
          setTimeout(() => this.close(id), 5000);
          throw error;
        });

      return promise;
    }

    // Add styles
    addStyles() {
      const style = document.createElement("style");
      style.id = "bael-toast-styles";
      style.textContent = `
                .bael-toast-container {
                    position: fixed;
                    z-index: 100002;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    padding: 20px;
                    pointer-events: none;
                }

                .bael-toast-top-left { top: 0; left: 0; }
                .bael-toast-top-center { top: 0; left: 50%; transform: translateX(-50%); }
                .bael-toast-top-right { top: 0; right: 0; }
                .bael-toast-bottom-left { bottom: 0; left: 0; }
                .bael-toast-bottom-center { bottom: 0; left: 50%; transform: translateX(-50%); }
                .bael-toast-bottom-right { bottom: 0; right: 0; }

                .bael-toast {
                    display: flex;
                    align-items: flex-start;
                    min-width: 300px;
                    max-width: 400px;
                    padding: 14px 16px;
                    background: var(--bael-surface, #252525);
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                    pointer-events: auto;
                    opacity: 0;
                    transform: translateX(100%);
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .bael-toast-top-left .bael-toast,
                .bael-toast-bottom-left .bael-toast {
                    transform: translateX(-100%);
                }

                .bael-toast-top-center .bael-toast,
                .bael-toast-bottom-center .bael-toast {
                    transform: translateY(-20px);
                }

                .bael-toast-visible {
                    opacity: 1;
                    transform: translateX(0) translateY(0);
                }

                .bael-toast-hiding {
                    opacity: 0;
                    transform: scale(0.9);
                }

                .bael-toast-icon {
                    flex-shrink: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    font-size: 14px;
                    margin-right: 12px;
                }

                .bael-toast-success .bael-toast-icon {
                    background: rgba(46, 204, 113, 0.2);
                    color: #2ecc71;
                }

                .bael-toast-error .bael-toast-icon {
                    background: rgba(231, 76, 60, 0.2);
                    color: #e74c3c;
                }

                .bael-toast-warning .bael-toast-icon {
                    background: rgba(241, 196, 15, 0.2);
                    color: #f1c40f;
                }

                .bael-toast-info .bael-toast-icon {
                    background: rgba(0, 212, 255, 0.2);
                    color: #00d4ff;
                }

                .bael-toast-loading .bael-toast-icon {
                    animation: bael-toast-spin 1s linear infinite;
                }

                @keyframes bael-toast-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .bael-toast-content {
                    flex: 1;
                    min-width: 0;
                }

                .bael-toast-title {
                    font-weight: 600;
                    color: var(--bael-text, #fff);
                    margin-bottom: 4px;
                }

                .bael-toast-message {
                    color: var(--bael-text-dim, #aaa);
                    font-size: 13px;
                    line-height: 1.4;
                }

                .bael-toast-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 10px;
                }

                .bael-toast-action {
                    padding: 6px 12px;
                    background: var(--bael-accent, #00d4ff);
                    border: none;
                    border-radius: 4px;
                    color: #000;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                }

                .bael-toast-action:hover {
                    opacity: 0.9;
                }

                .bael-toast-close {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 20px;
                    height: 20px;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-dim, #666);
                    cursor: pointer;
                    font-size: 14px;
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .bael-toast:hover .bael-toast-close {
                    opacity: 1;
                }

                .bael-toast-progress {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    height: 3px;
                    background: var(--bael-accent, #00d4ff);
                }
            `;
      document.head.appendChild(style);
    }
  }

  // Initialize
  window.BaelToast = new BaelToast();

  // Global shortcuts
  window.$toast = {
    show: (opts) => window.BaelToast.show(opts),
    success: (msg, opts) => window.BaelToast.success(msg, opts),
    error: (msg, opts) => window.BaelToast.error(msg, opts),
    warning: (msg, opts) => window.BaelToast.warning(msg, opts),
    info: (msg, opts) => window.BaelToast.info(msg, opts),
    loading: (msg, opts) => window.BaelToast.loading(msg, opts),
    promise: (p, msgs) => window.BaelToast.promise(p, msgs),
    close: (id) => window.BaelToast.close(id),
    closeAll: () => window.BaelToast.closeAll(),
  };
})();
