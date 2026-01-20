/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   ██╗   ██╗███╗   ██╗██╗███████╗██╗███████╗██████╗                       █
 * █   ██║   ██║████╗  ██║██║██╔════╝██║██╔════╝██╔══██╗                      █
 * █   ██║   ██║██╔██╗ ██║██║█████╗  ██║█████╗  ██║  ██║                      █
 * █   ██║   ██║██║╚██╗██║██║██╔══╝  ██║██╔══╝  ██║  ██║                      █
 * █   ╚██████╔╝██║ ╚████║██║██║     ██║███████╗██████╔╝                      █
 * █    ╚═════╝ ╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝╚══════╝╚═════╝                       █
 * █                                                                          █
 * █   BAEL UNIFIED SEARCH - Search Everything, Find Anything                █
 * █   Cross-system search: Memory, Files, Chats, Templates, Commands        █
 * █   Keyboard Shortcut: Ctrl+/ or Cmd+/                                    █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelUnifiedSearch {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;

      this.query = "";
      this.results = [];
      this.selectedIndex = 0;
      this.isSearching = false;
      this.searchTimeout = null;

      // Search scopes
      this.scopes = {
        all: { icon: "🔍", label: "All", enabled: true },
        memory: { icon: "🧠", label: "Memory", enabled: true },
        files: { icon: "📁", label: "Files", enabled: true },
        chats: { icon: "💬", label: "Chats", enabled: true },
        templates: { icon: "📋", label: "Templates", enabled: true },
        commands: { icon: "⌨️", label: "Commands", enabled: true },
        settings: { icon: "⚙️", label: "Settings", enabled: true },
      };

      this.activeScope = "all";
      this.recentSearches = [];
    }

    async initialize() {
      console.log("🔍 Bael Unified Search initializing...");

      this.injectStyles();
      this.createContainer();
      this.loadRecentSearches();
      this.setupShortcuts();

      this.initialized = true;
      console.log("✅ BAEL UNIFIED SEARCH READY");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-unified-search-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-unified-search-styles";
      styles.textContent = `
                .bael-unified-search {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10005;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                    align-items: flex-start;
                    justify-content: center;
                    padding-top: 10vh;
                }

                .bael-unified-search.visible { display: flex; }

                .unified-search-dialog {
                    width: 680px;
                    max-width: 95vw;
                    background: #12121a;
                    border-radius: 16px;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
                    border: 1px solid #2a2a4a;
                    overflow: hidden;
                }

                .search-header {
                    display: flex;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid #2a2a4a;
                    gap: 12px;
                }

                .search-icon {
                    font-size: 24px;
                    opacity: 0.7;
                }

                .search-input-wrapper {
                    flex: 1;
                    position: relative;
                }

                .unified-search-input {
                    width: 100%;
                    padding: 12px 0;
                    border: none;
                    background: transparent;
                    color: #fff;
                    font-size: 20px;
                    outline: none;
                }

                .unified-search-input::placeholder { color: #666; }

                .search-close {
                    padding: 8px;
                    border: none;
                    background: none;
                    color: #888;
                    cursor: pointer;
                    font-size: 18px;
                    border-radius: 6px;
                    transition: all 0.15s;
                }

                .search-close:hover { background: #2a2a4a; color: #fff; }

                .scope-tabs {
                    display: flex;
                    gap: 4px;
                    padding: 12px 16px;
                    border-bottom: 1px solid #1a1a2e;
                    overflow-x: auto;
                }

                .scope-tab {
                    padding: 6px 14px;
                    border: none;
                    background: none;
                    color: #888;
                    cursor: pointer;
                    border-radius: 20px;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.15s;
                    white-space: nowrap;
                }

                .scope-tab:hover { background: #1a1a2e; color: #ccc; }
                .scope-tab.active { background: #6366f1; color: #fff; }

                .search-results {
                    max-height: 400px;
                    overflow-y: auto;
                }

                .search-result-group {
                    padding: 8px 0;
                }

                .result-group-title {
                    padding: 8px 20px;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #666;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .search-result-item {
                    display: flex;
                    align-items: center;
                    padding: 12px 20px;
                    cursor: pointer;
                    gap: 14px;
                    transition: all 0.1s;
                }

                .search-result-item:hover,
                .search-result-item.selected {
                    background: rgba(99, 102, 241, 0.15);
                }

                .result-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    background: #1a1a2e;
                }

                .result-content {
                    flex: 1;
                    min-width: 0;
                }

                .result-title {
                    font-weight: 500;
                    margin-bottom: 2px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .result-title .highlight {
                    background: rgba(234, 179, 8, 0.3);
                    color: #fbbf24;
                    padding: 0 2px;
                    border-radius: 2px;
                }

                .result-meta {
                    font-size: 12px;
                    color: #666;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .result-type {
                    padding: 2px 8px;
                    background: #2a2a4a;
                    border-radius: 4px;
                    font-size: 11px;
                }

                .result-action {
                    color: #888;
                    font-size: 12px;
                    opacity: 0;
                    transition: opacity 0.15s;
                }

                .search-result-item:hover .result-action,
                .search-result-item.selected .result-action { opacity: 1; }

                .search-footer {
                    padding: 12px 20px;
                    border-top: 1px solid #2a2a4a;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 12px;
                    color: #666;
                }

                .search-hints {
                    display: flex;
                    gap: 16px;
                }

                .hint-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .hint-key {
                    padding: 2px 6px;
                    background: #2a2a4a;
                    border-radius: 4px;
                    font-family: monospace;
                }

                .recent-searches {
                    padding: 16px 20px;
                }

                .recent-title {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #666;
                    margin-bottom: 12px;
                }

                .recent-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .recent-item {
                    padding: 6px 12px;
                    background: #1a1a2e;
                    border-radius: 16px;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.15s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .recent-item:hover { background: #252538; }

                .no-results {
                    padding: 40px 20px;
                    text-align: center;
                    color: #666;
                }

                .no-results-icon { font-size: 48px; opacity: 0.5; margin-bottom: 12px; }

                .searching-indicator {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 20px;
                    color: #888;
                }

                .searching-spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #2a2a4a;
                    border-top-color: #6366f1;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-unified-search";
      this.container.className = "bael-unified-search";

      this.container.innerHTML = this.getTemplate();
      document.body.appendChild(this.container);

      this.bindEvents();
    }

    getTemplate() {
      return `
                <div class="unified-search-dialog">
                    <div class="search-header">
                        <span class="search-icon">🔍</span>
                        <div class="search-input-wrapper">
                            <input type="text"
                                   class="unified-search-input"
                                   id="unified-search-input"
                                   placeholder="Search everything... (memory, files, chats, commands)"
                                   autocomplete="off">
                        </div>
                        <button class="search-close" id="search-close">✕</button>
                    </div>

                    <div class="scope-tabs" id="scope-tabs">
                        ${Object.entries(this.scopes)
                          .map(
                            ([key, scope]) => `
                            <button class="scope-tab ${key === "all" ? "active" : ""}" data-scope="${key}">
                                ${scope.icon} ${scope.label}
                            </button>
                        `,
                          )
                          .join("")}
                    </div>

                    <div class="search-results" id="search-results">
                        <div class="recent-searches" id="recent-searches">
                            <div class="recent-title">Recent Searches</div>
                            <div class="recent-list" id="recent-list"></div>
                        </div>
                    </div>

                    <div class="search-footer">
                        <div class="search-hints">
                            <div class="hint-item">
                                <span class="hint-key">↑↓</span>
                                <span>Navigate</span>
                            </div>
                            <div class="hint-item">
                                <span class="hint-key">Enter</span>
                                <span>Select</span>
                            </div>
                            <div class="hint-item">
                                <span class="hint-key">Tab</span>
                                <span>Change scope</span>
                            </div>
                            <div class="hint-item">
                                <span class="hint-key">Esc</span>
                                <span>Close</span>
                            </div>
                        </div>
                        <div id="result-count"></div>
                    </div>
                </div>
            `;
    }

    bindEvents() {
      const input = this.container.querySelector("#unified-search-input");
      const resultsEl = this.container.querySelector("#search-results");

      // Close
      this.container
        .querySelector("#search-close")
        .addEventListener("click", () => this.hide());
      this.container.addEventListener("click", (e) => {
        if (e.target === this.container) this.hide();
      });

      // Scope tabs
      this.container.querySelectorAll(".scope-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          this.activeScope = tab.dataset.scope;
          this.container
            .querySelectorAll(".scope-tab")
            .forEach((t) => t.classList.remove("active"));
          tab.classList.add("active");
          this.performSearch(this.query);
        });
      });

      // Input
      input.addEventListener("input", (e) => {
        this.query = e.target.value;
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
          this.performSearch(this.query);
        }, 150);
      });

      // Keyboard navigation
      input.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          this.selectNext();
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          this.selectPrev();
        } else if (e.key === "Enter") {
          e.preventDefault();
          this.executeSelected();
        } else if (e.key === "Tab") {
          e.preventDefault();
          this.cycleScope();
        }
      });
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Ctrl+/ or Cmd+/
        if ((e.ctrlKey || e.metaKey) && e.key === "/") {
          e.preventDefault();
          this.toggle();
        }

        // Also Ctrl+Shift+F for "Find"
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "F") {
          e.preventDefault();
          this.toggle();
        }

        if (this.visible && e.key === "Escape") {
          this.hide();
        }
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SEARCH ENGINE
    // ═══════════════════════════════════════════════════════════════════════

    async performSearch(query) {
      if (!query.trim()) {
        this.showRecentSearches();
        return;
      }

      this.isSearching = true;
      this.showSearching();

      const results = [];
      const q = query.toLowerCase();

      try {
        // Search commands (always fast)
        if (this.activeScope === "all" || this.activeScope === "commands") {
          const commands = this.searchCommands(q);
          results.push(...commands);
        }

        // Search templates
        if (this.activeScope === "all" || this.activeScope === "templates") {
          const templates = this.searchTemplates(q);
          results.push(...templates);
        }

        // Search settings
        if (this.activeScope === "all" || this.activeScope === "settings") {
          const settings = this.searchSettings(q);
          results.push(...settings);
        }

        // Search memory (API call)
        if (this.activeScope === "all" || this.activeScope === "memory") {
          const memories = await this.searchMemory(q);
          results.push(...memories);
        }

        // Search files (API call)
        if (this.activeScope === "all" || this.activeScope === "files") {
          const files = await this.searchFiles(q);
          results.push(...files);
        }

        // Search chats (API call)
        if (this.activeScope === "all" || this.activeScope === "chats") {
          const chats = await this.searchChats(q);
          results.push(...chats);
        }
      } catch (error) {
        console.warn("Search error:", error);
      }

      this.results = results;
      this.selectedIndex = 0;
      this.isSearching = false;
      this.renderResults();
    }

    searchCommands(q) {
      const commands = [
        { name: "New Chat", action: "newChat", icon: "💬", shortcut: "Ctrl+N" },
        {
          name: "Settings",
          action: "settings",
          icon: "⚙️",
          shortcut: "Ctrl+,",
        },
        {
          name: "Memory Dashboard",
          action: "memoryDashboard",
          icon: "🧠",
          shortcut: "Ctrl+Shift+M",
        },
        {
          name: "Agent Console",
          action: "agentConsole",
          icon: "📊",
          shortcut: "Ctrl+Shift+A",
        },
        {
          name: "Heisenberg Control",
          action: "heisenberg",
          icon: "⚛️",
          shortcut: "Ctrl+Shift+H",
        },
        {
          name: "Performance Dashboard",
          action: "perfDashboard",
          icon: "📈",
          shortcut: "Ctrl+Shift+P",
        },
        {
          name: "Command Center",
          action: "commandCenter",
          icon: "🎯",
          shortcut: "Ctrl+K",
        },
        {
          name: "Template Library",
          action: "templates",
          icon: "📋",
          shortcut: "Ctrl+Shift+T",
        },
        {
          name: "File Browser",
          action: "fileBrowser",
          icon: "📁",
          shortcut: "",
        },
        { name: "Scheduler", action: "scheduler", icon: "📅", shortcut: "" },
        {
          name: "Toggle Dark Mode",
          action: "darkMode",
          icon: "🌙",
          shortcut: "",
        },
        {
          name: "Restart Framework",
          action: "restart",
          icon: "🔄",
          shortcut: "",
        },
      ];

      return commands
        .filter((c) => c.name.toLowerCase().includes(q))
        .map((c) => ({
          type: "command",
          icon: c.icon,
          title: c.name,
          meta: c.shortcut || "Command",
          action: c.action,
          data: c,
        }));
    }

    searchTemplates(q) {
      if (!window.BaelTemplateLibrary?.templates) return [];

      return window.BaelTemplateLibrary.templates
        .filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            t.description?.toLowerCase().includes(q),
        )
        .slice(0, 5)
        .map((t) => ({
          type: "template",
          icon: "📋",
          title: t.name,
          meta: t.category,
          action: "openTemplate",
          data: t,
        }));
    }

    searchSettings(q) {
      const settings = [
        { name: "API Keys", section: "api", icon: "🔑" },
        { name: "Model Configuration", section: "model", icon: "🤖" },
        { name: "Agent Settings", section: "agent", icon: "👤" },
        { name: "Chat Settings", section: "chat", icon: "💬" },
        { name: "Memory Settings", section: "memory", icon: "🧠" },
        { name: "Development Settings", section: "dev", icon: "🔧" },
        { name: "Speech Settings", section: "speech", icon: "🎤" },
        { name: "Appearance", section: "appearance", icon: "🎨" },
      ];

      return settings
        .filter((s) => s.name.toLowerCase().includes(q))
        .map((s) => ({
          type: "setting",
          icon: s.icon,
          title: s.name,
          meta: "Setting",
          action: "openSettings",
          data: s,
        }));
    }

    async searchMemory(q) {
      try {
        // Use BaelGUIUnifier if available
        if (window.BaelGUIUnifier?.memory?.query) {
          const results = await window.BaelGUIUnifier.memory.query(q, 5);
          return (results || []).map((m) => ({
            type: "memory",
            icon: "🧠",
            title: m.text?.substring(0, 60) + "..." || "Memory",
            meta: m.type || "Memory",
            action: "viewMemory",
            data: m,
          }));
        }
        return [];
      } catch (e) {
        return [];
      }
    }

    async searchFiles(q) {
      try {
        // Search via API
        const response = await fetch("/file_browser");
        if (response.ok) {
          const data = await response.json();
          const files = data.files || [];
          return files
            .filter((f) => f.name.toLowerCase().includes(q))
            .slice(0, 5)
            .map((f) => ({
              type: "file",
              icon: f.is_dir ? "📁" : "📄",
              title: f.name,
              meta: f.is_dir ? "Folder" : this.formatSize(f.size),
              action: "openFile",
              data: f,
            }));
        }
        return [];
      } catch (e) {
        return [];
      }
    }

    async searchChats(q) {
      try {
        const response = await fetch("/get_chats");
        if (response.ok) {
          const data = await response.json();
          const chats = data.chats || [];
          return chats
            .filter(
              (c) => c.name?.toLowerCase().includes(q) || c.id?.includes(q),
            )
            .slice(0, 5)
            .map((c) => ({
              type: "chat",
              icon: "💬",
              title: c.name || c.id,
              meta: "Chat",
              action: "openChat",
              data: c,
            }));
        }
        return [];
      } catch (e) {
        return [];
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RENDERING
    // ═══════════════════════════════════════════════════════════════════════

    showSearching() {
      const resultsEl = this.container.querySelector("#search-results");
      resultsEl.innerHTML = `
                <div class="searching-indicator">
                    <div class="searching-spinner"></div>
                    <span>Searching...</span>
                </div>
            `;
    }

    showRecentSearches() {
      const resultsEl = this.container.querySelector("#search-results");
      const recentEl = this.container.querySelector("#recent-list");

      if (this.recentSearches.length === 0) {
        resultsEl.innerHTML = `
                    <div class="no-results">
                        <div class="no-results-icon">🔍</div>
                        <div>Start typing to search across all Bael systems</div>
                    </div>
                `;
        return;
      }

      resultsEl.innerHTML = `
                <div class="recent-searches">
                    <div class="recent-title">Recent Searches</div>
                    <div class="recent-list">
                        ${this.recentSearches
                          .map(
                            (s) => `
                            <div class="recent-item" data-query="${s}">
                                🕐 ${s}
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
            `;

      resultsEl.querySelectorAll(".recent-item").forEach((item) => {
        item.addEventListener("click", () => {
          const input = this.container.querySelector("#unified-search-input");
          input.value = item.dataset.query;
          this.query = item.dataset.query;
          this.performSearch(this.query);
        });
      });

      this.container.querySelector("#result-count").textContent = "";
    }

    renderResults() {
      const resultsEl = this.container.querySelector("#search-results");

      if (this.results.length === 0) {
        resultsEl.innerHTML = `
                    <div class="no-results">
                        <div class="no-results-icon">😕</div>
                        <div>No results found for "${this.query}"</div>
                    </div>
                `;
        this.container.querySelector("#result-count").textContent = "0 results";
        return;
      }

      // Group by type
      const groups = {};
      this.results.forEach((r) => {
        if (!groups[r.type]) groups[r.type] = [];
        groups[r.type].push(r);
      });

      const typeLabels = {
        command: "⌨️ Commands",
        template: "📋 Templates",
        setting: "⚙️ Settings",
        memory: "🧠 Memory",
        file: "📁 Files",
        chat: "💬 Chats",
      };

      let html = "";
      let globalIndex = 0;

      for (const [type, items] of Object.entries(groups)) {
        html += `
                    <div class="search-result-group">
                        <div class="result-group-title">${typeLabels[type] || type}</div>
                        ${items
                          .map((item, i) => {
                            const index = globalIndex++;
                            return `
                                <div class="search-result-item ${index === this.selectedIndex ? "selected" : ""}"
                                     data-index="${index}">
                                    <div class="result-icon">${item.icon}</div>
                                    <div class="result-content">
                                        <div class="result-title">${this.highlightMatch(item.title, this.query)}</div>
                                        <div class="result-meta">
                                            <span class="result-type">${item.meta}</span>
                                        </div>
                                    </div>
                                    <div class="result-action">Press Enter ↵</div>
                                </div>
                            `;
                          })
                          .join("")}
                    </div>
                `;
      }

      resultsEl.innerHTML = html;
      this.container.querySelector("#result-count").textContent =
        `${this.results.length} result${this.results.length !== 1 ? "s" : ""}`;

      // Bind click handlers
      resultsEl.querySelectorAll(".search-result-item").forEach((item) => {
        item.addEventListener("click", () => {
          this.selectedIndex = parseInt(item.dataset.index);
          this.executeSelected();
        });
      });
    }

    highlightMatch(text, query) {
      if (!query) return text;
      const regex = new RegExp(`(${query})`, "gi");
      return text.replace(regex, '<span class="highlight">$1</span>');
    }

    // ═══════════════════════════════════════════════════════════════════════
    // NAVIGATION & ACTIONS
    // ═══════════════════════════════════════════════════════════════════════

    selectNext() {
      if (this.results.length === 0) return;
      this.selectedIndex = (this.selectedIndex + 1) % this.results.length;
      this.updateSelection();
    }

    selectPrev() {
      if (this.results.length === 0) return;
      this.selectedIndex =
        (this.selectedIndex - 1 + this.results.length) % this.results.length;
      this.updateSelection();
    }

    updateSelection() {
      this.container
        .querySelectorAll(".search-result-item")
        .forEach((item, i) => {
          item.classList.toggle("selected", i === this.selectedIndex);
        });

      // Scroll into view
      const selected = this.container.querySelector(
        ".search-result-item.selected",
      );
      selected?.scrollIntoView({ block: "nearest" });
    }

    cycleScope() {
      const scopes = Object.keys(this.scopes);
      const currentIndex = scopes.indexOf(this.activeScope);
      const nextIndex = (currentIndex + 1) % scopes.length;
      this.activeScope = scopes[nextIndex];

      this.container.querySelectorAll(".scope-tab").forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.scope === this.activeScope);
      });

      this.performSearch(this.query);
    }

    executeSelected() {
      const result = this.results[this.selectedIndex];
      if (!result) return;

      // Save to recent
      this.addToRecent(this.query);

      this.hide();

      // Execute action
      switch (result.action) {
        case "newChat":
          window.dispatchEvent(new CustomEvent("bael:new-chat"));
          break;
        case "settings":
          window.dispatchEvent(new CustomEvent("bael:open-settings"));
          break;
        case "memoryDashboard":
          window.BaelMemoryDashboard?.show?.();
          break;
        case "agentConsole":
          window.BaelAgentConsole?.show?.();
          break;
        case "heisenberg":
          window.BaelHeisenbergControl?.show?.();
          break;
        case "perfDashboard":
          window.BaelPerformanceDashboard?.show?.();
          break;
        case "commandCenter":
          window.BaelCommandCenter?.show?.();
          break;
        case "templates":
          window.BaelTemplateLibrary?.show?.();
          break;
        case "openTemplate":
          window.BaelTemplateLibrary?.show?.();
          break;
        case "openSettings":
          window.dispatchEvent(
            new CustomEvent("bael:open-settings", {
              detail: { section: result.data.section },
            }),
          );
          break;
        case "openFile":
          window.dispatchEvent(
            new CustomEvent("bael:open-file", {
              detail: result.data,
            }),
          );
          break;
        case "openChat":
          window.dispatchEvent(
            new CustomEvent("bael:open-chat", {
              detail: result.data,
            }),
          );
          break;
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RECENT SEARCHES
    // ═══════════════════════════════════════════════════════════════════════

    loadRecentSearches() {
      try {
        const saved = localStorage.getItem("bael-recent-searches");
        if (saved) this.recentSearches = JSON.parse(saved);
      } catch (e) {}
    }

    addToRecent(query) {
      if (!query.trim()) return;

      // Remove if exists
      this.recentSearches = this.recentSearches.filter((s) => s !== query);

      // Add to front
      this.recentSearches.unshift(query);

      // Keep only last 10
      this.recentSearches = this.recentSearches.slice(0, 10);

      // Save
      localStorage.setItem(
        "bael-recent-searches",
        JSON.stringify(this.recentSearches),
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════════════

    formatSize(bytes) {
      if (!bytes) return "";
      const units = ["B", "KB", "MB", "GB"];
      let i = 0;
      while (bytes >= 1024 && i < units.length - 1) {
        bytes /= 1024;
        i++;
      }
      return bytes.toFixed(1) + " " + units[i];
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VISIBILITY
    // ═══════════════════════════════════════════════════════════════════════

    show() {
      this.container.classList.add("visible");
      this.visible = true;
      this.query = "";
      this.results = [];
      this.selectedIndex = 0;

      const input = this.container.querySelector("#unified-search-input");
      input.value = "";
      input.focus();

      this.showRecentSearches();
    }

    hide() {
      this.container.classList.remove("visible");
      this.visible = false;
    }

    toggle() {
      if (this.visible) this.hide();
      else this.show();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelUnifiedSearch = new BaelUnifiedSearch();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelUnifiedSearch.initialize();
    });
  } else {
    window.BaelUnifiedSearch.initialize();
  }

  console.log("🔍 Bael Unified Search loaded");
})();
