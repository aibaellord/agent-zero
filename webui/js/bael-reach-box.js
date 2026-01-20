/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ██████╗ ███████╗ █████╗ ██████╗██╗  ██╗    ██████╗  ██████╗ ██╗  ██╗   █
 * █  ██╔══██╗██╔════╝██╔══██╗██╔═══╝██║  ██║    ██╔══██╗██╔═══██╗╚██╗██╔╝   █
 * █  ██████╔╝█████╗  ███████║██║    ███████║    ██████╔╝██║   ██║ ╚███╔╝    █
 * █  ██╔══██╗██╔══╝  ██╔══██║██║    ██╔══██║    ██╔══██╗██║   ██║ ██╔██╗    █
 * █  ██║  ██║███████╗██║  ██║╚█████╗██║  ██║    ██████╔╝╚██████╔╝██╔╝ ██╗   █
 * █  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚════╝╚═╝  ╚═╝    ╚═════╝  ╚═════╝ ╚═╝  ╚═╝   █
 * █                                                                          █
 * █   BAEL REACH BOX - Advanced Global Search Command Palette               █
 * █   Lightning-fast access to everything in the Bael system                █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelReachBox {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;
      this.searchInput = null;
      this.results = [];
      this.selectedIndex = 0;

      // Searchable sources
      this.sources = [];
      this.recentActions = this.loadRecent();
    }

    async initialize() {
      console.log("🔍 Bael Reach Box initializing...");

      this.injectStyles();
      this.createContainer();
      this.setupShortcut();
      this.buildSources();

      this.initialized = true;
      console.log("✅ BAEL REACH BOX READY (Ctrl+/)");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-reachbox-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-reachbox-styles";
      styles.textContent = `
                .bael-reachbox-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    z-index: 9900;
                    display: none;
                    justify-content: center;
                    padding-top: 15vh;
                }

                .bael-reachbox-overlay.visible {
                    display: flex;
                    animation: overlayIn 0.2s ease;
                }

                @keyframes overlayIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .bael-reachbox {
                    width: 600px;
                    max-width: 90vw;
                    max-height: 60vh;
                    background: #12121a;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    animation: boxIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @keyframes boxIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                .reachbox-search {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .search-icon {
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 18px;
                }

                .reachbox-input {
                    flex: 1;
                    background: none;
                    border: none;
                    outline: none;
                    color: #fff;
                    font-size: 16px;
                    font-family: inherit;
                }

                .reachbox-input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                .reachbox-hint {
                    display: flex;
                    gap: 6px;
                }

                .hint-key {
                    padding: 4px 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.5);
                    font-family: 'SF Mono', monospace;
                }

                .reachbox-results {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px;
                }

                .result-group {
                    margin-bottom: 12px;
                }

                .result-group-title {
                    font-size: 11px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.4);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    padding: 6px 12px;
                }

                .result-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .result-item:hover,
                .result-item.selected {
                    background: rgba(99, 102, 241, 0.15);
                }

                .result-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                }

                .result-content {
                    flex: 1;
                    min-width: 0;
                }

                .result-title {
                    font-size: 14px;
                    font-weight: 500;
                    color: #fff;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .result-title mark {
                    background: rgba(250, 204, 21, 0.3);
                    color: #facc15;
                }

                .result-desc {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.4);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .result-shortcut {
                    font-size: 11px;
                    font-family: 'SF Mono', monospace;
                    color: rgba(255, 255, 255, 0.3);
                    padding: 4px 8px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 4px;
                }

                .reachbox-footer {
                    padding: 10px 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    display: flex;
                    gap: 16px;
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                }

                .footer-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .footer-key {
                    padding: 2px 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                    font-family: 'SF Mono', monospace;
                }

                .no-results {
                    text-align: center;
                    padding: 40px;
                    color: rgba(255, 255, 255, 0.4);
                }

                .no-results-icon {
                    font-size: 40px;
                    margin-bottom: 12px;
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-reachbox-overlay";
      this.container.className = "bael-reachbox-overlay";
      this.container.onclick = (e) => {
        if (e.target === this.container) this.hide();
      };

      this.container.innerHTML = `
                <div class="bael-reachbox">
                    <div class="reachbox-search">
                        <span class="search-icon">🔍</span>
                        <input type="text"
                               class="reachbox-input"
                               placeholder="Search modules, actions, settings..."
                               id="reachbox-input">
                        <div class="reachbox-hint">
                            <span class="hint-key">ESC</span>
                        </div>
                    </div>
                    <div class="reachbox-results" id="reachbox-results"></div>
                    <div class="reachbox-footer">
                        <div class="footer-item">
                            <span class="footer-key">↑↓</span>
                            Navigate
                        </div>
                        <div class="footer-item">
                            <span class="footer-key">↵</span>
                            Select
                        </div>
                        <div class="footer-item">
                            <span class="footer-key">Tab</span>
                            Category
                        </div>
                    </div>
                </div>
            `;
      document.body.appendChild(this.container);

      this.searchInput = this.container.querySelector("#reachbox-input");
      this.resultsContainer = this.container.querySelector("#reachbox-results");

      // Input handlers
      this.searchInput.addEventListener("input", (e) =>
        this.search(e.target.value),
      );
      this.searchInput.addEventListener("keydown", (e) =>
        this.handleKeydown(e),
      );
    }

    buildSources() {
      // Build searchable sources from Bael modules
      this.sources = [
        // Recent actions
        ...this.recentActions.map((action) => ({
          ...action,
          group: "Recent",
        })),

        // Bael modules
        ...this.getBaelModules().map((m) => ({
          icon: "⚡",
          title: m.name,
          desc: `Bael module`,
          group: "Modules",
          action: () => {
            if (window[m.name]?.toggle) window[m.name].toggle();
            else if (window[m.name]?.show) window[m.name].show();
          },
          shortcut: m.shortcut || "",
        })),

        // Quick actions
        {
          icon: "🆕",
          title: "New Chat",
          desc: "Start a new conversation",
          group: "Actions",
          action: () => this.executeCommand("newChat"),
        },
        {
          icon: "💾",
          title: "Save Session",
          desc: "Save current session",
          group: "Actions",
          action: () => this.executeCommand("saveSession"),
        },
        {
          icon: "📤",
          title: "Export Chat",
          desc: "Export chat history",
          group: "Actions",
          action: () => this.executeCommand("exportChat"),
        },
        {
          icon: "🔄",
          title: "Refresh",
          desc: "Refresh the page",
          group: "Actions",
          action: () => location.reload(),
        },
        {
          icon: "🌙",
          title: "Toggle Dark Mode",
          desc: "Switch theme",
          group: "Actions",
          action: () => this.toggleTheme(),
        },

        // Settings
        {
          icon: "⚙️",
          title: "Settings",
          desc: "Open settings panel",
          group: "Settings",
          action: () => this.openSettings(),
        },
        {
          icon: "🔑",
          title: "API Keys",
          desc: "Manage API keys",
          group: "Settings",
          action: () => this.openSettings("api"),
        },
        {
          icon: "📊",
          title: "Performance",
          desc: "View performance stats",
          group: "Settings",
          shortcut: "Ctrl+Shift+P",
        },

        // Navigation
        {
          icon: "📁",
          title: "Files",
          desc: "Open file browser",
          group: "Navigation",
          action: () => this.navigate("files"),
        },
        {
          icon: "💡",
          title: "Knowledge",
          desc: "View knowledge base",
          group: "Navigation",
          action: () => this.navigate("knowledge"),
        },
        {
          icon: "📝",
          title: "Prompts",
          desc: "Browse prompts",
          group: "Navigation",
          action: () => this.navigate("prompts"),
        },

        // Help
        {
          icon: "❓",
          title: "Help",
          desc: "View documentation",
          group: "Help",
          action: () => this.openHelp(),
        },
        {
          icon: "⌨️",
          title: "Keyboard Shortcuts",
          desc: "View all shortcuts",
          group: "Help",
          shortcut: "Ctrl+Shift+K",
        },
      ];
    }

    getBaelModules() {
      const modules = [];
      const shortcuts = {
        BaelCommandPalette: "Ctrl+K",
        BaelKeyboardShortcuts: "Ctrl+Shift+K",
        BaelFavorites: "Ctrl+Shift+F",
        BaelChatHistorySearch: "Ctrl+Shift+H",
        BaelDataVisualizer: "Ctrl+Shift+G",
        BaelChatInsights: "Ctrl+Shift+I",
        BaelAITutor: "Ctrl+Shift+?",
      };

      Object.keys(window)
        .filter((k) => k.startsWith("Bael"))
        .forEach((name) => {
          modules.push({
            name,
            shortcut: shortcuts[name] || "",
          });
        });

      return modules;
    }

    search(query) {
      if (!query.trim()) {
        this.showDefaultResults();
        return;
      }

      const lowerQuery = query.toLowerCase();
      const filtered = this.sources.filter(
        (item) =>
          item.title.toLowerCase().includes(lowerQuery) ||
          item.desc.toLowerCase().includes(lowerQuery),
      );

      this.results = filtered;
      this.selectedIndex = 0;
      this.renderResults(query);
    }

    showDefaultResults() {
      // Show recent + suggested
      const recent = this.sources
        .filter((s) => s.group === "Recent")
        .slice(0, 3);
      const modules = this.sources
        .filter((s) => s.group === "Modules")
        .slice(0, 5);
      const actions = this.sources
        .filter((s) => s.group === "Actions")
        .slice(0, 4);

      this.results = [...recent, ...modules, ...actions];
      this.renderResults("");
    }

    renderResults(query) {
      if (this.results.length === 0) {
        this.resultsContainer.innerHTML = `
                    <div class="no-results">
                        <div class="no-results-icon">🔍</div>
                        <div>No results found for "${query}"</div>
                    </div>
                `;
        return;
      }

      // Group results
      const groups = {};
      this.results.forEach((item) => {
        if (!groups[item.group]) groups[item.group] = [];
        groups[item.group].push(item);
      });

      let html = "";
      let globalIndex = 0;

      Object.entries(groups).forEach(([groupName, items]) => {
        html += `<div class="result-group">
                    <div class="result-group-title">${groupName}</div>`;

        items.forEach((item) => {
          const isSelected = globalIndex === this.selectedIndex;
          const highlightedTitle = this.highlight(item.title, query);

          html += `
                        <div class="result-item ${isSelected ? "selected" : ""}"
                             data-index="${globalIndex}"
                             onclick="BaelReachBox.selectItem(${globalIndex})">
                            <div class="result-icon">${item.icon}</div>
                            <div class="result-content">
                                <div class="result-title">${highlightedTitle}</div>
                                <div class="result-desc">${item.desc}</div>
                            </div>
                            ${item.shortcut ? `<span class="result-shortcut">${item.shortcut}</span>` : ""}
                        </div>
                    `;
          globalIndex++;
        });

        html += "</div>";
      });

      this.resultsContainer.innerHTML = html;
    }

    highlight(text, query) {
      if (!query) return text;
      const regex = new RegExp(`(${query})`, "gi");
      return text.replace(regex, "<mark>$1</mark>");
    }

    handleKeydown(e) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          this.selectedIndex = Math.min(
            this.selectedIndex + 1,
            this.results.length - 1,
          );
          this.updateSelection();
          break;
        case "ArrowUp":
          e.preventDefault();
          this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
          this.updateSelection();
          break;
        case "Enter":
          e.preventDefault();
          this.executeSelected();
          break;
        case "Escape":
          this.hide();
          break;
      }
    }

    updateSelection() {
      this.resultsContainer
        .querySelectorAll(".result-item")
        .forEach((el, i) => {
          el.classList.toggle("selected", i === this.selectedIndex);
        });

      // Scroll into view
      const selected = this.resultsContainer.querySelector(".selected");
      if (selected) selected.scrollIntoView({ block: "nearest" });
    }

    selectItem(index) {
      this.selectedIndex = index;
      this.executeSelected();
    }

    executeSelected() {
      const item = this.results[this.selectedIndex];
      if (item && item.action) {
        this.addToRecent(item);
        this.hide();
        item.action();
      }
    }

    addToRecent(item) {
      // Don't add if already recent
      if (item.group === "Recent") return;

      const recentItem = { ...item, group: "Recent" };
      this.recentActions = [
        recentItem,
        ...this.recentActions.filter((r) => r.title !== item.title),
      ].slice(0, 5);
      this.saveRecent();
    }

    loadRecent() {
      try {
        return JSON.parse(localStorage.getItem("bael_reachbox_recent") || "[]");
      } catch {
        return [];
      }
    }

    saveRecent() {
      localStorage.setItem(
        "bael_reachbox_recent",
        JSON.stringify(this.recentActions),
      );
    }

    setupShortcut() {
      document.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "/") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    toggle() {
      if (this.visible) {
        this.hide();
      } else {
        this.show();
      }
    }

    show() {
      this.visible = true;
      this.container.classList.add("visible");
      this.searchInput.value = "";
      this.buildSources(); // Refresh sources
      this.showDefaultResults();
      setTimeout(() => this.searchInput.focus(), 50);
    }

    hide() {
      this.visible = false;
      this.container.classList.remove("visible");
    }

    // Utility actions
    executeCommand(cmd) {
      console.log("Executing command:", cmd);
      // Integration points with other Bael modules
    }

    toggleTheme() {
      document.body.classList.toggle("light-theme");
    }

    openSettings(section) {
      console.log("Open settings:", section);
    }

    navigate(target) {
      console.log("Navigate to:", target);
    }

    openHelp() {
      window.open("https://github.com/aibaellord/agent-zero", "_blank");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelReachBox = new BaelReachBox();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelReachBox.initialize();
    });
  } else {
    window.BaelReachBox.initialize();
  }

  console.log("🔍 Bael Reach Box loaded");
})();
