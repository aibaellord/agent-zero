/**
 * BAEL - LORD OF ALL
 * Master Initialization Script
 * ============================
 * Coordinates all Bael systems and provides unified API
 */

(function () {
  "use strict";

  // Version and branding
  const BAEL_VERSION = "1.0.0";
  const BAEL_CODENAME = "Heisenberg";

  console.log(`
    ╔══════════════════════════════════════════════════════╗
    ║                                                      ║
    ║     ██████╗  █████╗ ███████╗██╗                     ║
    ║     ██╔══██╗██╔══██╗██╔════╝██║                     ║
    ║     ██████╔╝███████║█████╗  ██║                     ║
    ║     ██╔══██╗██╔══██║██╔══╝  ██║                     ║
    ║     ██████╔╝██║  ██║███████╗███████╗                ║
    ║     ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝                ║
    ║                                                      ║
    ║              L O R D   O F   A L L                  ║
    ║                                                      ║
    ║     Version: ${BAEL_VERSION}                                    ║
    ║     Codename: ${BAEL_CODENAME}                              ║
    ║                                                      ║
    ║     Powered by Heisenberg Singularity               ║
    ║                                                      ║
    ╚══════════════════════════════════════════════════════╝
    `);

  // Bael global namespace
  window.Bael = {
    version: BAEL_VERSION,
    codename: BAEL_CODENAME,
    initialized: false,
    systems: {},

    // System registry
    register(name, system) {
      this.systems[name] = system;
      console.log(`🔱 Bael: Registered system "${name}"`);
    },

    // Get system
    get(name) {
      return this.systems[name];
    },

    // Event bus
    events: {
      listeners: {},

      on(event, callback) {
        if (!this.listeners[event]) {
          this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
      },

      off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(
          (cb) => cb !== callback,
        );
      },

      emit(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach((callback) => {
          try {
            callback(data);
          } catch (e) {
            console.error(`🔱 Bael: Event handler error for "${event}":`, e);
          }
        });
      },
    },

    // Theme management
    theme: {
      current: localStorage.getItem("bael_theme") || "bael-dark",

      set(theme) {
        this.current = theme;
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("bael_theme", theme);
        Bael.events.emit("theme-change", { theme });
      },

      get() {
        return this.current;
      },

      toggle() {
        const themes = [
          "bael-dark",
          "bael-crimson",
          "bael-abyss",
          "bael-inferno",
          "bael-void",
          "bael-light",
        ];
        const currentIndex = themes.indexOf(this.current);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.set(themes[nextIndex]);
      },
    },

    // Keyboard shortcuts
    shortcuts: {
      registered: {},

      register(keys, callback, description = "") {
        const id = keys.join("+").toLowerCase();
        this.registered[id] = { keys, callback, description };
      },

      trigger(event) {
        const keys = [];
        if (event.ctrlKey || event.metaKey) keys.push("ctrl");
        if (event.shiftKey) keys.push("shift");
        if (event.altKey) keys.push("alt");
        keys.push(event.key.toLowerCase());

        const id = keys.join("+");
        if (this.registered[id]) {
          event.preventDefault();
          this.registered[id].callback();
          return true;
        }
        return false;
      },

      list() {
        return Object.values(this.registered).map((s) => ({
          keys: s.keys.join(" + "),
          description: s.description,
        }));
      },
    },

    // Notifications
    notify(message, type = "info", duration = 3000) {
      const notification = document.createElement("div");
      notification.className = `bael-notification bael-notification-${type}`;
      notification.innerHTML = `
                <span class="bael-notification-icon">${this.getNotificationIcon(type)}</span>
                <span class="bael-notification-message">${message}</span>
            `;

      document.body.appendChild(notification);

      setTimeout(() => {
        notification.classList.add("bael-notification-show");
      }, 10);

      setTimeout(() => {
        notification.classList.remove("bael-notification-show");
        setTimeout(() => notification.remove(), 300);
      }, duration);
    },

    getNotificationIcon(type) {
      const icons = {
        info: "ℹ️",
        success: "✅",
        warning: "⚠️",
        error: "❌",
      };
      return icons[type] || icons.info;
    },

    // Heisenberg Integration
    heisenberg: {
      async getStatus() {
        try {
          const response = await fetch("/heisenberg/status");
          return await response.json();
        } catch (e) {
          return null;
        }
      },

      async process(input, options = {}) {
        try {
          const response = await fetch("/heisenberg/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input, ...options }),
          });
          return await response.json();
        } catch (e) {
          console.error("🧠 Heisenberg process error:", e);
          return null;
        }
      },
    },

    // Utilities
    utils: {
      formatNumber(num) {
        return num.toLocaleString();
      },

      formatBytes(bytes) {
        const sizes = ["B", "KB", "MB", "GB"];
        if (bytes === 0) return "0 B";
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i];
      },

      formatDuration(ms) {
        if (ms < 1000) return ms + "ms";
        if (ms < 60000) return (ms / 1000).toFixed(1) + "s";
        return (
          Math.floor(ms / 60000) + "m " + Math.floor((ms % 60000) / 1000) + "s"
        );
      },

      debounce(func, wait) {
        let timeout;
        return function (...args) {
          clearTimeout(timeout);
          timeout = setTimeout(() => func.apply(this, args), wait);
        };
      },

      throttle(func, limit) {
        let inThrottle;
        return function (...args) {
          if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
          }
        };
      },
    },

    // Initialize all systems
    async init() {
      if (this.initialized) return;

      console.log("🔱 Bael: Initializing systems...");

      // Apply saved theme
      this.theme.set(this.theme.current);

      // Register global keyboard listener
      document.addEventListener("keydown", (e) => {
        this.shortcuts.trigger(e);
      });

      // Register default shortcuts
      this.shortcuts.register(
        ["ctrl", "k"],
        () => {
          if (window.baelPalette) window.baelPalette.toggle();
        },
        "Open Command Palette",
      );

      this.shortcuts.register(
        ["ctrl", "shift", "f"],
        () => {
          if (window.baelFocusMode) window.baelFocusMode.toggle();
        },
        "Toggle Focus Mode",
      );

      this.shortcuts.register(
        ["ctrl", "shift", "p"],
        () => {
          if (window.baelPromptLibrary) window.baelPromptLibrary.toggle();
        },
        "Open Prompt Library",
      );

      this.shortcuts.register(
        ["ctrl", "shift", "n"],
        () => {
          if (window.baelNotes) window.baelNotes.toggle();
        },
        "Toggle Notes Panel",
      );

      this.shortcuts.register(
        ["ctrl", "shift", "t"],
        () => {
          this.theme.toggle();
        },
        "Cycle Theme",
      );

      // Add notification styles
      this.addNotificationStyles();

      // Check Heisenberg status
      const heisenbergStatus = await this.heisenberg.getStatus();
      if (heisenbergStatus) {
        console.log("🧠 Heisenberg Singularity: Online");
      }

      this.initialized = true;
      console.log("🔱 Bael: All systems initialized");

      // Emit ready event
      this.events.emit("ready", { version: this.version });
      window.dispatchEvent(new CustomEvent("bael-ready"));
    },

    addNotificationStyles() {
      const style = document.createElement("style");
      style.textContent = `
                .bael-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 20px;
                    background: var(--color-panel);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-lg);
                    z-index: 99999;
                    transform: translateX(120%);
                    transition: transform 0.3s ease;
                }

                .bael-notification-show {
                    transform: translateX(0);
                }

                .bael-notification-success {
                    border-color: var(--color-success);
                }

                .bael-notification-warning {
                    border-color: var(--color-warning);
                }

                .bael-notification-error {
                    border-color: var(--color-error);
                }

                .bael-notification-icon {
                    font-size: 18px;
                }

                .bael-notification-message {
                    color: var(--color-text);
                    font-size: 14px;
                }
            `;
      document.head.appendChild(style);
    },
  };

  // Auto-initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => Bael.init());
  } else {
    Bael.init();
  }
})();
