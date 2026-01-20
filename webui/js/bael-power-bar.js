/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   ██████╗  ██████╗ ██╗    ██╗███████╗██████╗     ██████╗  █████╗ ██████╗ █
 * █   ██╔══██╗██╔═══██╗██║    ██║██╔════╝██╔══██╗    ██╔══██╗██╔══██╗██╔══██╗█
 * █   ██████╔╝██║   ██║██║ █╗ ██║█████╗  ██████╔╝    ██████╔╝███████║██████╔╝█
 * █   ██╔═══╝ ██║   ██║██║███╗██║██╔══╝  ██╔══██╗    ██╔══██╗██╔══██║██╔══██╗█
 * █   ██║     ╚██████╔╝╚███╔███╔╝███████╗██║  ██║    ██████╔╝██║  ██║██║  ██║█
 * █   ╚═╝      ╚═════╝  ╚══╝╚══╝ ╚══════╝╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝█
 * █                                                                          █
 * █   BAEL POWER BAR - Quick Access Floating Action Bar                     █
 * █   Always-accessible floating bar for rapid actions                      █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelPowerBar {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = true;
      this.minimized = false;
      this.container = null;
      this.position = { x: 20, y: window.innerHeight / 2 };
      this.isDragging = false;
    }

    async initialize() {
      console.log("⚡ Bael Power Bar initializing...");

      this.loadPosition();
      this.injectStyles();
      this.createContainer();
      this.setupDrag();
      this.setupShortcuts();

      this.initialized = true;
      console.log("✅ BAEL POWER BAR READY");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-power-bar-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-power-bar-styles";
      styles.textContent = `
                .bael-power-bar {
                    position: fixed;
                    z-index: 9500;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    background: rgba(26, 26, 46, 0.95);
                    backdrop-filter: blur(12px);
                    border-radius: 14px;
                    padding: 10px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4),
                                0 0 0 1px rgba(255, 255, 255, 0.1);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .bael-power-bar.minimized {
                    padding: 6px;
                }

                .bael-power-bar.minimized .power-btn:not(.toggle-btn) {
                    display: none;
                }

                .bael-power-bar.hidden {
                    transform: translateX(-100px);
                    opacity: 0;
                    pointer-events: none;
                }

                .power-btn {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    border: none;
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    transition: all 0.2s;
                    position: relative;
                }

                .power-btn:hover {
                    background: rgba(99, 102, 241, 0.3);
                    transform: scale(1.1);
                }

                .power-btn:active {
                    transform: scale(0.95);
                }

                .power-btn.toggle-btn {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                }

                .power-btn.toggle-btn:hover {
                    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
                }

                .bael-power-bar.minimized .toggle-btn {
                    width: 36px;
                    height: 36px;
                    font-size: 16px;
                }

                .power-tooltip {
                    position: absolute;
                    left: calc(100% + 10px);
                    top: 50%;
                    transform: translateY(-50%);
                    padding: 6px 12px;
                    background: #1e1e2e;
                    border-radius: 6px;
                    font-size: 12px;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }

                .power-btn:hover .power-tooltip {
                    opacity: 1;
                }

                .power-separator {
                    height: 1px;
                    background: rgba(255, 255, 255, 0.1);
                    margin: 4px 0;
                }

                .drag-handle {
                    width: 100%;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 3px;
                    cursor: grab;
                    margin-bottom: 6px;
                }

                .drag-handle:active {
                    cursor: grabbing;
                }

                .bael-power-bar.minimized .drag-handle {
                    display: none;
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-power-bar";
      this.container.className = "bael-power-bar";
      this.container.style.left = `${this.position.x}px`;
      this.container.style.top = `${this.position.y}px`;

      this.container.innerHTML = this.getTemplate();
      document.body.appendChild(this.container);
    }

    getTemplate() {
      const actions = [
        {
          icon: "🚀",
          action: "launcher",
          tooltip: "Quick Launcher",
          shortcut: "⌃⌃",
        },
        {
          icon: "🔍",
          action: "search",
          tooltip: "Universal Search",
          shortcut: "⌃/",
        },
        {
          icon: "🎯",
          action: "command",
          tooltip: "Command Center",
          shortcut: "⌃K",
        },
        { type: "separator" },
        { icon: "💬", action: "new-chat", tooltip: "New Chat", shortcut: "⌃N" },
        {
          icon: "📋",
          action: "templates",
          tooltip: "Templates",
          shortcut: "⌃⇧T",
        },
        {
          icon: "⭐",
          action: "favorites",
          tooltip: "Favorites",
          shortcut: "⌃⇧B",
        },
        { type: "separator" },
        {
          icon: "📊",
          action: "performance",
          tooltip: "Performance",
          shortcut: "⌃⇧P",
        },
        { icon: "🧠", action: "memory", tooltip: "Memory", shortcut: "⌃⇧M" },
        {
          icon: "📡",
          action: "status",
          tooltip: "System Status",
          shortcut: "⌃⇧S",
        },
        { type: "separator" },
        { icon: "⚙️", action: "settings", tooltip: "Settings", shortcut: "⌃," },
      ];

      let html = `
                <div class="drag-handle"></div>
                <button class="power-btn toggle-btn" onclick="BaelPowerBar.toggleMinimize()">
                    ⚡
                    <span class="power-tooltip">Toggle Power Bar</span>
                </button>
            `;

      for (const action of actions) {
        if (action.type === "separator") {
          html += '<div class="power-separator"></div>';
        } else {
          html += `
                        <button class="power-btn" onclick="BaelPowerBar.execute('${action.action}')">
                            ${action.icon}
                            <span class="power-tooltip">${action.tooltip} <small>${action.shortcut}</small></span>
                        </button>
                    `;
        }
      }

      return html;
    }

    setupDrag() {
      const handle = this.container.querySelector(".drag-handle");

      handle.addEventListener("mousedown", (e) => {
        this.isDragging = true;
        const rect = this.container.getBoundingClientRect();
        this.dragOffset = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        };

        document.addEventListener("mousemove", this.onDrag.bind(this));
        document.addEventListener("mouseup", this.onDragEnd.bind(this));
      });
    }

    onDrag(e) {
      if (!this.isDragging) return;

      const x = Math.max(
        0,
        Math.min(e.clientX - this.dragOffset.x, window.innerWidth - 60),
      );
      const y = Math.max(
        0,
        Math.min(e.clientY - this.dragOffset.y, window.innerHeight - 400),
      );

      this.container.style.left = `${x}px`;
      this.container.style.top = `${y}px`;
      this.position = { x, y };
    }

    onDragEnd() {
      this.isDragging = false;
      document.removeEventListener("mousemove", this.onDrag.bind(this));
      document.removeEventListener("mouseup", this.onDragEnd.bind(this));
      this.savePosition();
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Ctrl+B to toggle power bar visibility
        if ((e.ctrlKey || e.metaKey) && e.key === "b" && !e.shiftKey) {
          e.preventDefault();
          this.toggleVisibility();
        }
      });
    }

    loadPosition() {
      try {
        const stored = localStorage.getItem("bael_power_bar_position");
        if (stored) {
          this.position = JSON.parse(stored);
        }
      } catch (e) {
        // Use default
      }
    }

    savePosition() {
      localStorage.setItem(
        "bael_power_bar_position",
        JSON.stringify(this.position),
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ACTIONS
    // ═══════════════════════════════════════════════════════════════════════

    execute(action) {
      switch (action) {
        case "launcher":
          window.BaelQuickLauncher?.show?.();
          break;
        case "search":
          window.BaelUnifiedSearch?.show?.();
          break;
        case "command":
          window.BaelCommandCenter?.show?.();
          break;
        case "new-chat":
          window.dispatchEvent(new CustomEvent("bael:new-chat"));
          break;
        case "templates":
          window.BaelTemplateLibrary?.show?.();
          break;
        case "favorites":
          window.BaelFavoritesHub?.show?.();
          break;
        case "performance":
          window.BaelPerformanceDashboard?.show?.();
          break;
        case "memory":
          window.BaelMemoryDashboard?.show?.();
          break;
        case "status":
          window.BaelSystemStatus?.show?.();
          break;
        case "settings":
          window.dispatchEvent(new CustomEvent("bael:open-settings"));
          break;
      }
    }

    toggleMinimize() {
      this.minimized = !this.minimized;
      this.container.classList.toggle("minimized", this.minimized);
      localStorage.setItem("bael_power_bar_minimized", this.minimized);
    }

    toggleVisibility() {
      this.visible = !this.visible;
      this.container.classList.toggle("hidden", !this.visible);
    }

    show() {
      this.visible = true;
      this.container.classList.remove("hidden");
    }

    hide() {
      this.visible = false;
      this.container.classList.add("hidden");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelPowerBar = new BaelPowerBar();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelPowerBar.initialize();
    });
  } else {
    window.BaelPowerBar.initialize();
  }

  console.log("⚡ Bael Power Bar loaded");
})();
