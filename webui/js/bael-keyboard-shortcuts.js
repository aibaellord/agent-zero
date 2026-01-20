/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ██╗  ██╗███████╗██╗   ██╗███████╗                                       █
 * █  ██║ ██╔╝██╔════╝╚██╗ ██╔╝██╔════╝                                       █
 * █  █████╔╝ █████╗   ╚████╔╝ ███████╗                                       █
 * █  ██╔═██╗ ██╔══╝    ╚██╔╝  ╚════██║                                       █
 * █  ██║  ██╗███████╗   ██║   ███████║                                       █
 * █  ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝                                       █
 * █                                                                          █
 * █   BAEL KEYBOARD SHORTCUTS MANAGER - Centralized Hotkey Reference        █
 * █   View, search, and manage all keyboard shortcuts (Ctrl+Shift+K)        █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelKeyboardShortcuts {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;
      this.searchQuery = "";

      // Master list of all Bael shortcuts
      this.shortcuts = [
        // Core shortcuts
        {
          key: "Ctrl+/",
          category: "Core",
          action: "Toggle Command Palette",
          module: "command-palette",
        },
        {
          key: "Ctrl+Shift+/",
          category: "Core",
          action: "Toggle Help",
          module: "help",
        },
        {
          key: "Ctrl+Enter",
          category: "Core",
          action: "Send Message",
          module: "chat",
        },
        {
          key: "Escape",
          category: "Core",
          action: "Close Modal/Cancel",
          module: "core",
        },

        // Productivity
        {
          key: "Ctrl+Shift+S",
          category: "Productivity",
          action: "Snippets Manager",
          module: "snippets-manager",
        },
        {
          key: "Ctrl+Shift+V",
          category: "Productivity",
          action: "Snippets Vault",
          module: "snippets-vault",
        },
        {
          key: "Ctrl+Shift+B",
          category: "Productivity",
          action: "Sync Center",
          module: "sync-center",
        },
        {
          key: "Ctrl+Shift+Y",
          category: "Productivity",
          action: "Theme Customizer",
          module: "theme-customizer",
        },
        {
          key: "Ctrl+Shift+M",
          category: "Productivity",
          action: "Voice Commander",
          module: "voice-commander",
        },
        {
          key: "Ctrl+Shift+L",
          category: "Productivity",
          action: "Workspace Layouts",
          module: "workspace-layouts",
        },
        {
          key: "Ctrl+Shift+N",
          category: "Productivity",
          action: "Quick Notes",
          module: "quick-notes",
        },
        {
          key: "Ctrl+Shift+P",
          category: "Productivity",
          action: "Pomodoro Timer",
          module: "pomodoro-timer",
        },

        // Data & Analytics
        {
          key: "Ctrl+Shift+G",
          category: "Analytics",
          action: "Data Visualizer",
          module: "data-visualizer",
        },
        {
          key: "Ctrl+Shift+I",
          category: "Analytics",
          action: "Chat Insights",
          module: "chat-insights",
        },
        {
          key: "Ctrl+Shift+D",
          category: "Analytics",
          action: "Metrics Dashboard",
          module: "metrics-dashboard",
        },

        // Learning
        {
          key: "Ctrl+Shift+?",
          category: "Learning",
          action: "AI Tutor",
          module: "ai-tutor",
        },

        // Navigation
        {
          key: "Ctrl+Shift+K",
          category: "Navigation",
          action: "Keyboard Shortcuts (this)",
          module: "keyboard-shortcuts",
        },
        {
          key: "Ctrl+Shift+F",
          category: "Navigation",
          action: "Global Search",
          module: "global-search",
        },
        {
          key: "Ctrl+Shift+H",
          category: "Navigation",
          action: "History",
          module: "chat-history",
        },

        // Quick Layouts
        {
          key: "Ctrl+Alt+1",
          category: "Layouts",
          action: "Default Layout",
          module: "workspace-layouts",
        },
        {
          key: "Ctrl+Alt+2",
          category: "Layouts",
          action: "Split View",
          module: "workspace-layouts",
        },
        {
          key: "Ctrl+Alt+3",
          category: "Layouts",
          action: "Focus Mode",
          module: "workspace-layouts",
        },
        {
          key: "Ctrl+Alt+4",
          category: "Layouts",
          action: "Developer Layout",
          module: "workspace-layouts",
        },
        {
          key: "Ctrl+Alt+5",
          category: "Layouts",
          action: "Research Layout",
          module: "workspace-layouts",
        },

        // Chat
        { key: "Ctrl+N", category: "Chat", action: "New Chat", module: "chat" },
        {
          key: "Ctrl+Shift+E",
          category: "Chat",
          action: "Export Chat",
          module: "chat-export",
        },
        {
          key: "Ctrl+Shift+A",
          category: "Chat",
          action: "Archive Chat",
          module: "chat-archiver",
        },
      ];

      this.categories = [...new Set(this.shortcuts.map((s) => s.category))];
      this.selectedCategory = "All";
    }

    async initialize() {
      console.log("⌨️ Bael Keyboard Shortcuts initializing...");

      this.loadCustomShortcuts();
      this.injectStyles();
      this.createContainer();
      this.setupShortcuts();

      this.initialized = true;
      console.log("✅ BAEL KEYBOARD SHORTCUTS READY");

      return this;
    }

    loadCustomShortcuts() {
      try {
        const saved = localStorage.getItem("bael-custom-shortcuts");
        if (saved) {
          const custom = JSON.parse(saved);
          this.shortcuts.push(...custom);
        }
      } catch (e) {}
    }

    saveCustomShortcuts(customShortcuts) {
      try {
        localStorage.setItem(
          "bael-custom-shortcuts",
          JSON.stringify(customShortcuts),
        );
      } catch (e) {}
    }

    injectStyles() {
      if (document.getElementById("bael-shortcuts-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-shortcuts-styles";
      styles.textContent = `
                .bael-shortcuts-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(12px);
                    z-index: 9900;
                    opacity: 0;
                    transition: opacity 0.25s ease;
                    pointer-events: none;
                }

                .bael-shortcuts-overlay.visible {
                    opacity: 1;
                    pointer-events: auto;
                }

                .bael-shortcuts-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.95);
                    width: 90vw;
                    max-width: 800px;
                    max-height: 80vh;
                    background: #12121a;
                    border-radius: 16px;
                    box-shadow: 0 30px 100px rgba(0, 0, 0, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    z-index: 9901;
                    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .bael-shortcuts-overlay.visible .bael-shortcuts-modal {
                    transform: translate(-50%, -50%) scale(1);
                }

                .shortcuts-header {
                    padding: 20px 24px;
                    background: rgba(255, 255, 255, 0.03);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .shortcuts-title {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 16px;
                }

                .shortcuts-title h2 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 600;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .shortcuts-close {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.06);
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 18px;
                    transition: all 0.2s;
                }

                .shortcuts-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .shortcuts-search {
                    width: 100%;
                    padding: 12px 16px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: #fff;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s;
                }

                .shortcuts-search:focus {
                    border-color: #6366f1;
                    background: rgba(99, 102, 241, 0.1);
                }

                .shortcuts-search::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                .shortcuts-categories {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    padding: 12px 24px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                }

                .category-btn {
                    padding: 6px 14px;
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: transparent;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .category-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                }

                .category-btn.active {
                    background: #6366f1;
                    border-color: #6366f1;
                    color: #fff;
                }

                .shortcuts-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px 24px;
                }

                .shortcuts-group {
                    margin-bottom: 24px;
                }

                .shortcuts-group:last-child {
                    margin-bottom: 0;
                }

                .shortcuts-group-title {
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: rgba(255, 255, 255, 0.4);
                    margin-bottom: 12px;
                }

                .shortcut-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                    margin-bottom: 6px;
                    border: 1px solid transparent;
                    transition: all 0.2s;
                }

                .shortcut-item:hover {
                    background: rgba(99, 102, 241, 0.1);
                    border-color: rgba(99, 102, 241, 0.2);
                }

                .shortcut-action {
                    font-size: 14px;
                    color: #fff;
                }

                .shortcut-module {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    margin-top: 2px;
                }

                .shortcut-keys {
                    display: flex;
                    gap: 4px;
                }

                .key {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 28px;
                    height: 28px;
                    padding: 0 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #fff;
                    font-family: monospace;
                }

                .key-separator {
                    color: rgba(255, 255, 255, 0.3);
                    font-size: 12px;
                    margin: 0 2px;
                }

                .no-results {
                    text-align: center;
                    padding: 40px;
                    color: rgba(255, 255, 255, 0.4);
                }

                .no-results span {
                    font-size: 48px;
                    display: block;
                    margin-bottom: 12px;
                }

                .shortcuts-footer {
                    padding: 16px 24px;
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                    text-align: center;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.4);
                }

                .shortcuts-footer a {
                    color: #6366f1;
                    text-decoration: none;
                }

                .shortcuts-footer a:hover {
                    text-decoration: underline;
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-keyboard-shortcuts";
      this.container.className = "bael-shortcuts-overlay";
      document.body.appendChild(this.container);

      this.container.addEventListener("click", (e) => {
        if (e.target === this.container) {
          this.hide();
        }
      });
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Ctrl+Shift+K for keyboard shortcuts
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "K") {
          e.preventDefault();
          if (this.visible) {
            this.hide();
          } else {
            this.show();
          }
        }

        // Escape to close
        if (e.key === "Escape" && this.visible) {
          this.hide();
        }
      });
    }

    show() {
      this.visible = true;
      this.searchQuery = "";
      this.selectedCategory = "All";
      this.render();
      this.container.classList.add("visible");

      // Focus search
      setTimeout(() => {
        const search = this.container.querySelector(".shortcuts-search");
        if (search) search.focus();
      }, 100);
    }

    hide() {
      this.visible = false;
      this.container.classList.remove("visible");
    }

    setCategory(category) {
      this.selectedCategory = category;
      this.render();
    }

    search(query) {
      this.searchQuery = query.toLowerCase();
      this.render();
    }

    getFilteredShortcuts() {
      let filtered = this.shortcuts;

      // Filter by category
      if (this.selectedCategory !== "All") {
        filtered = filtered.filter((s) => s.category === this.selectedCategory);
      }

      // Filter by search
      if (this.searchQuery) {
        filtered = filtered.filter(
          (s) =>
            s.action.toLowerCase().includes(this.searchQuery) ||
            s.key.toLowerCase().includes(this.searchQuery) ||
            s.category.toLowerCase().includes(this.searchQuery) ||
            s.module.toLowerCase().includes(this.searchQuery),
        );
      }

      return filtered;
    }

    renderKeyCombo(keyString) {
      const parts = keyString.split("+");
      return parts
        .map((part, i) => {
          const keyHtml = `<span class="key">${part}</span>`;
          if (i < parts.length - 1) {
            return keyHtml + '<span class="key-separator">+</span>';
          }
          return keyHtml;
        })
        .join("");
    }

    render() {
      const filtered = this.getFilteredShortcuts();

      // Group by category
      const grouped = {};
      filtered.forEach((shortcut) => {
        if (!grouped[shortcut.category]) {
          grouped[shortcut.category] = [];
        }
        grouped[shortcut.category].push(shortcut);
      });

      this.container.innerHTML = `
                <div class="bael-shortcuts-modal">
                    <div class="shortcuts-header">
                        <div class="shortcuts-title">
                            <h2>⌨️ Keyboard Shortcuts</h2>
                            <button class="shortcuts-close" onclick="BaelKeyboardShortcuts.hide()">✕</button>
                        </div>
                        <input type="text"
                               class="shortcuts-search"
                               placeholder="Search shortcuts... (e.g., 'notes', 'Ctrl+N')"
                               value="${this.searchQuery}"
                               oninput="BaelKeyboardShortcuts.search(this.value)">
                    </div>

                    <div class="shortcuts-categories">
                        <button class="category-btn ${this.selectedCategory === "All" ? "active" : ""}"
                                onclick="BaelKeyboardShortcuts.setCategory('All')">All</button>
                        ${this.categories
                          .map(
                            (cat) => `
                            <button class="category-btn ${this.selectedCategory === cat ? "active" : ""}"
                                    onclick="BaelKeyboardShortcuts.setCategory('${cat}')">${cat}</button>
                        `,
                          )
                          .join("")}
                    </div>

                    <div class="shortcuts-list">
                        ${
                          Object.keys(grouped).length > 0
                            ? Object.entries(grouped)
                                .map(
                                  ([category, shortcuts]) => `
                            <div class="shortcuts-group">
                                <div class="shortcuts-group-title">${category}</div>
                                ${shortcuts
                                  .map(
                                    (s) => `
                                    <div class="shortcut-item">
                                        <div>
                                            <div class="shortcut-action">${s.action}</div>
                                            <div class="shortcut-module">${s.module}</div>
                                        </div>
                                        <div class="shortcut-keys">
                                            ${this.renderKeyCombo(s.key)}
                                        </div>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>
                        `,
                                )
                                .join("")
                            : `
                            <div class="no-results">
                                <span>🔍</span>
                                No shortcuts found for "${this.searchQuery}"
                            </div>
                        `
                        }
                    </div>

                    <div class="shortcuts-footer">
                        ${this.shortcuts.length} shortcuts available •
                        <a href="#" onclick="BaelKeyboardShortcuts.printShortcuts(); return false;">Print Reference</a>
                    </div>
                </div>
            `;
    }

    printShortcuts() {
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
                <html>
                <head>
                    <title>Bael Keyboard Shortcuts</title>
                    <style>
                        body { font-family: system-ui; padding: 40px; }
                        h1 { color: #333; }
                        .category { margin: 24px 0; }
                        .category h2 { color: #666; font-size: 14px; border-bottom: 1px solid #ddd; padding-bottom: 8px; }
                        .shortcut { display: flex; justify-content: space-between; padding: 8px 0; }
                        .key { background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-family: monospace; }
                    </style>
                </head>
                <body>
                    <h1>⌨️ Bael Keyboard Shortcuts</h1>
                    ${this.categories
                      .map(
                        (cat) => `
                        <div class="category">
                            <h2>${cat}</h2>
                            ${this.shortcuts
                              .filter((s) => s.category === cat)
                              .map(
                                (s) => `
                                <div class="shortcut">
                                    <span>${s.action}</span>
                                    <span class="key">${s.key}</span>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    `,
                      )
                      .join("")}
                </body>
                </html>
            `);
      printWindow.document.close();
      printWindow.print();
    }

    // API for other modules to register shortcuts
    registerShortcut(shortcut) {
      if (!this.shortcuts.find((s) => s.key === shortcut.key)) {
        this.shortcuts.push(shortcut);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelKeyboardShortcuts = new BaelKeyboardShortcuts();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelKeyboardShortcuts.initialize();
    });
  } else {
    window.BaelKeyboardShortcuts.initialize();
  }

  console.log("⌨️ Bael Keyboard Shortcuts loaded");
})();
