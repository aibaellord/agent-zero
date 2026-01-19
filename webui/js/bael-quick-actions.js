/**
 * BAEL - LORD OF ALL
 * Quick Actions - Radial menu for instant access to common actions
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelQuickActions {
    constructor() {
      this.menu = null;
      this.isOpen = false;
      this.actions = this.getDefaultActions();
      this.init();
    }

    init() {
      this.addStyles();
      this.createUI();
      this.bindEvents();
      console.log("⚡ Bael Quick Actions initialized");
    }

    getDefaultActions() {
      return [
        {
          id: "new-chat",
          icon: "💬",
          label: "New Chat",
          action: () => this.newChat(),
        },
        {
          id: "search",
          icon: "🔍",
          label: "Search",
          action: () => this.openSearch(),
        },
        {
          id: "terminal",
          icon: "💻",
          label: "Terminal",
          action: () => this.openTerminal(),
        },
        {
          id: "notes",
          icon: "📝",
          label: "Notes",
          action: () => this.openNotes(),
        },
        {
          id: "settings",
          icon: "⚙️",
          label: "Settings",
          action: () => this.openSettings(),
        },
        {
          id: "prompts",
          icon: "📚",
          label: "Prompts",
          action: () => this.openPrompts(),
        },
        {
          id: "voice",
          icon: "🎤",
          label: "Voice",
          action: () => this.toggleVoice(),
        },
        {
          id: "export",
          icon: "📤",
          label: "Export",
          action: () => this.exportChat(),
        },
      ];
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-quick-actions-styles";
      styles.textContent = `
                /* Quick Actions Overlay */
                .bael-quick-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(8px);
                    z-index: 100040;
                    display: none;
                    align-items: center;
                    justify-content: center;
                }

                .bael-quick-overlay.visible {
                    display: flex;
                    animation: quickOverlayIn 0.2s ease;
                }

                @keyframes quickOverlayIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                /* Radial Menu */
                .bael-quick-menu {
                    position: relative;
                    width: 400px;
                    height: 400px;
                }

                /* Center Hub */
                .quick-center {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 100px;
                    height: 100px;
                    background: linear-gradient(135deg, var(--bael-accent, #ff3366), #8b5cf6);
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 0 40px rgba(255, 51, 102, 0.5);
                    transition: transform 0.2s ease;
                    z-index: 2;
                }

                .quick-center:hover {
                    transform: translate(-50%, -50%) scale(1.05);
                }

                .quick-center-icon {
                    font-size: 28px;
                    margin-bottom: 4px;
                }

                .quick-center-text {
                    font-size: 11px;
                    color: white;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                /* Action Items */
                .quick-action {
                    position: absolute;
                    width: 70px;
                    height: 70px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 2px solid var(--bael-border, #2a2a3a);
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    opacity: 0;
                    transform: scale(0);
                }

                .bael-quick-overlay.visible .quick-action {
                    opacity: 1;
                    transform: scale(1);
                }

                .quick-action:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.15) !important;
                    box-shadow: 0 0 25px rgba(255, 51, 102, 0.5);
                }

                .quick-action-icon {
                    font-size: 24px;
                    margin-bottom: 2px;
                }

                .quick-action-label {
                    font-size: 9px;
                    color: var(--bael-text-primary, #fff);
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* Animation delays */
                .quick-action:nth-child(1) { transition-delay: 0.05s; }
                .quick-action:nth-child(2) { transition-delay: 0.1s; }
                .quick-action:nth-child(3) { transition-delay: 0.15s; }
                .quick-action:nth-child(4) { transition-delay: 0.2s; }
                .quick-action:nth-child(5) { transition-delay: 0.25s; }
                .quick-action:nth-child(6) { transition-delay: 0.3s; }
                .quick-action:nth-child(7) { transition-delay: 0.35s; }
                .quick-action:nth-child(8) { transition-delay: 0.4s; }

                /* Connecting Lines */
                .quick-lines {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    pointer-events: none;
                }

                .quick-lines svg {
                    width: 100%;
                    height: 100%;
                }

                .quick-line {
                    stroke: var(--bael-border, #2a2a3a);
                    stroke-width: 1;
                    stroke-dasharray: 5, 5;
                    opacity: 0.5;
                }

                /* Hint Text */
                .quick-hint {
                    position: fixed;
                    bottom: 40px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                    text-align: center;
                }

                .quick-hint kbd {
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 4px;
                    padding: 3px 8px;
                    margin: 0 2px;
                }
            `;
      document.head.appendChild(styles);
    }

    createUI() {
      const overlay = document.createElement("div");
      overlay.className = "bael-quick-overlay";

      const menu = document.createElement("div");
      menu.className = "bael-quick-menu";

      // Create connecting lines SVG
      const linesSvg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg",
      );
      linesSvg.classList.add("quick-lines");

      // Create action buttons in radial pattern
      const centerX = 200;
      const centerY = 200;
      const radius = 140;

      this.actions.forEach((action, index) => {
        const angle = (index / this.actions.length) * 2 * Math.PI - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle) - 35;
        const y = centerY + radius * Math.sin(angle) - 35;

        // Create connecting line
        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line",
        );
        line.classList.add("quick-line");
        line.setAttribute("x1", centerX);
        line.setAttribute("y1", centerY);
        line.setAttribute("x2", centerX + radius * Math.cos(angle));
        line.setAttribute("y2", centerY + radius * Math.sin(angle));
        linesSvg.appendChild(line);

        // Create action button
        const btn = document.createElement("div");
        btn.className = "quick-action";
        btn.dataset.action = action.id;
        btn.style.left = x + "px";
        btn.style.top = y + "px";
        btn.innerHTML = `
                    <span class="quick-action-icon">${action.icon}</span>
                    <span class="quick-action-label">${action.label}</span>
                `;
        btn.addEventListener("click", () => {
          action.action();
          this.close();
        });
        menu.appendChild(btn);
      });

      menu.appendChild(linesSvg);

      // Center hub
      const center = document.createElement("div");
      center.className = "quick-center";
      center.innerHTML = `
                <span class="quick-center-icon">⚡</span>
                <span class="quick-center-text">BAEL</span>
            `;
      center.addEventListener("click", () => this.close());
      menu.appendChild(center);

      overlay.appendChild(menu);

      // Hint text
      const hint = document.createElement("div");
      hint.className = "quick-hint";
      hint.innerHTML = "Press <kbd>Space</kbd> or <kbd>Esc</kbd> to close";
      overlay.appendChild(hint);

      document.body.appendChild(overlay);
      this.overlay = overlay;
      this.menu = menu;
    }

    bindEvents() {
      // Middle click to open
      document.addEventListener("auxclick", (e) => {
        if (e.button === 1) {
          // Middle click
          e.preventDefault();
          this.toggle();
        }
      });

      // Keyboard shortcuts
      document.addEventListener("keydown", (e) => {
        // Ctrl+Space to toggle
        if (e.ctrlKey && e.code === "Space") {
          e.preventDefault();
          this.toggle();
        }

        // Escape or Space to close when open
        if (this.isOpen && (e.key === "Escape" || e.key === " ")) {
          e.preventDefault();
          this.close();
        }

        // Number keys to select action when open
        if (this.isOpen && e.key >= "1" && e.key <= "8") {
          const index = parseInt(e.key) - 1;
          if (this.actions[index]) {
            this.actions[index].action();
            this.close();
          }
        }
      });

      // Click overlay to close
      this.overlay.addEventListener("click", (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      this.overlay.classList.add("visible");
      this.isOpen = true;
    }

    close() {
      this.overlay.classList.remove("visible");
      this.isOpen = false;
    }

    // Action handlers
    newChat() {
      window.dispatchEvent(new CustomEvent("bael-new-chat"));
      if (window.BaelNotifications) {
        window.BaelNotifications.info("Starting new chat...");
      }
    }

    openSearch() {
      if (window.BaelChatSearch) {
        window.BaelChatSearch.toggle();
      } else if (window.BaelNotifications) {
        window.BaelNotifications.info("Search: Ctrl+F");
      }
    }

    openTerminal() {
      if (window.BaelTerminal) {
        window.BaelTerminal.toggle();
      }
    }

    openNotes() {
      if (window.BaelNotesPanel) {
        window.BaelNotesPanel.toggle();
      }
    }

    openSettings() {
      window.dispatchEvent(new CustomEvent("bael-open-settings"));
      if (window.BaelNotifications) {
        window.BaelNotifications.info("Opening settings...");
      }
    }

    openPrompts() {
      if (window.BaelPromptLibrary) {
        window.BaelPromptLibrary.toggle();
      }
    }

    toggleVoice() {
      if (window.BaelVoiceCommands) {
        window.BaelVoiceCommands.toggle();
      }
    }

    exportChat() {
      if (window.BaelExport) {
        window.BaelExport.showExportModal();
      }
    }
  }

  // Initialize
  window.BaelQuickActions = new BaelQuickActions();
})();
