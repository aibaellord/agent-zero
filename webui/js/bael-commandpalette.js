/**
 * BAEL Command Palette Component - Lord Of All Commands
 *
 * Command palette / quick actions:
 * - Keyboard shortcut (Cmd/Ctrl+K)
 * - Fuzzy search
 * - Categories/groups
 * - Recent commands
 * - Keyboard navigation
 * - Nested commands
 * - Custom actions
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // COMMAND PALETTE CLASS
  // ============================================================

  class BaelCommandPalette {
    constructor() {
      this.instance = null;
      this.isOpen = false;
      this.commands = [];
      this.recentCommands = [];
      this.maxRecent = 5;
      this._injectStyles();
      this._init();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-cmdpalette-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-cmdpalette-styles";
      styles.textContent = `
                .bael-cmdpalette-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding-top: 15vh;
                    z-index: 10000;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.15s, visibility 0.15s;
                }

                .bael-cmdpalette-overlay.open {
                    opacity: 1;
                    visibility: visible;
                }

                .bael-cmdpalette {
                    width: 100%;
                    max-width: 600px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                    overflow: hidden;
                    transform: translateY(-20px) scale(0.95);
                    transition: transform 0.2s ease-out;
                    font-family: system-ui, -apple-system, sans-serif;
                }

                .bael-cmdpalette-overlay.open .bael-cmdpalette {
                    transform: translateY(0) scale(1);
                }

                /* Search input */
                .bael-cmdpalette-search {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 20px;
                    border-bottom: 1px solid #e5e7eb;
                }

                .bael-cmdpalette-search-icon {
                    width: 20px;
                    height: 20px;
                    color: #9ca3af;
                    flex-shrink: 0;
                }

                .bael-cmdpalette-search input {
                    flex: 1;
                    border: none;
                    outline: none;
                    font-size: 16px;
                    color: #374151;
                    background: transparent;
                }

                .bael-cmdpalette-search input::placeholder {
                    color: #9ca3af;
                }

                .bael-cmdpalette-search-hint {
                    font-size: 12px;
                    color: #9ca3af;
                    padding: 4px 8px;
                    background: #f3f4f6;
                    border-radius: 4px;
                }

                /* Results */
                .bael-cmdpalette-results {
                    max-height: 400px;
                    overflow-y: auto;
                    padding: 8px;
                }

                .bael-cmdpalette-empty {
                    padding: 40px 20px;
                    text-align: center;
                    color: #9ca3af;
                }

                .bael-cmdpalette-empty-icon {
                    width: 48px;
                    height: 48px;
                    margin: 0 auto 12px;
                    color: #d1d5db;
                }

                /* Group */
                .bael-cmdpalette-group {
                    margin-bottom: 8px;
                }

                .bael-cmdpalette-group:last-child {
                    margin-bottom: 0;
                }

                .bael-cmdpalette-group-title {
                    font-size: 11px;
                    font-weight: 600;
                    color: #9ca3af;
                    text-transform: uppercase;
                    padding: 8px 12px 4px;
                    letter-spacing: 0.5px;
                }

                /* Command item */
                .bael-cmdpalette-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.1s;
                }

                .bael-cmdpalette-item:hover,
                .bael-cmdpalette-item.active {
                    background: #f3f4f6;
                }

                .bael-cmdpalette-item.active {
                    background: #eef2ff;
                }

                .bael-cmdpalette-item-icon {
                    width: 20px;
                    height: 20px;
                    color: #6b7280;
                    flex-shrink: 0;
                }

                .bael-cmdpalette-item.active .bael-cmdpalette-item-icon {
                    color: #4f46e5;
                }

                .bael-cmdpalette-item-content {
                    flex: 1;
                    min-width: 0;
                }

                .bael-cmdpalette-item-title {
                    font-size: 14px;
                    color: #374151;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .bael-cmdpalette-item-title mark {
                    background: #fef08a;
                    color: inherit;
                    padding: 0 2px;
                    border-radius: 2px;
                }

                .bael-cmdpalette-item-description {
                    font-size: 12px;
                    color: #9ca3af;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .bael-cmdpalette-item-shortcut {
                    display: flex;
                    gap: 4px;
                }

                .bael-cmdpalette-item-shortcut kbd {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 20px;
                    height: 20px;
                    padding: 0 6px;
                    font-size: 11px;
                    font-family: inherit;
                    color: #6b7280;
                    background: #f3f4f6;
                    border: 1px solid #e5e7eb;
                    border-radius: 4px;
                }

                /* Footer */
                .bael-cmdpalette-footer {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 16px;
                    background: #f9fafb;
                    border-top: 1px solid #e5e7eb;
                    font-size: 12px;
                    color: #6b7280;
                }

                .bael-cmdpalette-footer-hint {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .bael-cmdpalette-footer-hint span {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .bael-cmdpalette-footer kbd {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 18px;
                    height: 18px;
                    padding: 0 4px;
                    font-size: 10px;
                    font-family: inherit;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 3px;
                }
            `;
      document.head.appendChild(styles);
    }

    /**
     * Initialize command palette
     */
    _init() {
      // Create overlay
      this.overlay = document.createElement("div");
      this.overlay.className = "bael-cmdpalette-overlay";

      // Create palette
      this.palette = document.createElement("div");
      this.palette.className = "bael-cmdpalette";

      // Search
      const search = document.createElement("div");
      search.className = "bael-cmdpalette-search";

      const searchIcon = document.createElement("span");
      searchIcon.className = "bael-cmdpalette-search-icon";
      searchIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`;
      search.appendChild(searchIcon);

      this.searchInput = document.createElement("input");
      this.searchInput.type = "text";
      this.searchInput.placeholder = "Search commands...";
      this.searchInput.addEventListener("input", () => this._onSearch());
      this.searchInput.addEventListener("keydown", (e) => this._onKeyDown(e));
      search.appendChild(this.searchInput);

      const hint = document.createElement("span");
      hint.className = "bael-cmdpalette-search-hint";
      hint.textContent = "ESC";
      search.appendChild(hint);

      this.palette.appendChild(search);

      // Results
      this.results = document.createElement("div");
      this.results.className = "bael-cmdpalette-results";
      this.palette.appendChild(this.results);

      // Footer
      const footer = document.createElement("div");
      footer.className = "bael-cmdpalette-footer";
      footer.innerHTML = `
                <div class="bael-cmdpalette-footer-hint">
                    <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
                    <span><kbd>↵</kbd> Select</span>
                    <span><kbd>Esc</kbd> Close</span>
                </div>
            `;
      this.palette.appendChild(footer);

      this.overlay.appendChild(this.palette);
      document.body.appendChild(this.overlay);

      // Close on overlay click
      this.overlay.addEventListener("click", (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });

      // Global keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "k") {
          e.preventDefault();
          this.toggle();
        }
      });

      // Load recent from localStorage
      this._loadRecent();
    }

    /**
     * Load recent commands from localStorage
     */
    _loadRecent() {
      try {
        const stored = localStorage.getItem("bael-cmdpalette-recent");
        if (stored) {
          this.recentCommands = JSON.parse(stored);
        }
      } catch (e) {
        this.recentCommands = [];
      }
    }

    /**
     * Save recent commands to localStorage
     */
    _saveRecent() {
      try {
        localStorage.setItem(
          "bael-cmdpalette-recent",
          JSON.stringify(this.recentCommands),
        );
      } catch (e) {
        // Ignore
      }
    }

    /**
     * Add to recent commands
     */
    _addToRecent(command) {
      // Remove if already exists
      this.recentCommands = this.recentCommands.filter(
        (c) => c.id !== command.id,
      );
      // Add to front
      this.recentCommands.unshift({ id: command.id, title: command.title });
      // Limit size
      if (this.recentCommands.length > this.maxRecent) {
        this.recentCommands = this.recentCommands.slice(0, this.maxRecent);
      }
      this._saveRecent();
    }

    /**
     * Fuzzy match
     */
    _fuzzyMatch(text, query) {
      text = text.toLowerCase();
      query = query.toLowerCase();

      let tIdx = 0;
      let qIdx = 0;
      const matches = [];

      while (tIdx < text.length && qIdx < query.length) {
        if (text[tIdx] === query[qIdx]) {
          matches.push(tIdx);
          qIdx++;
        }
        tIdx++;
      }

      return qIdx === query.length ? matches : null;
    }

    /**
     * Highlight matches
     */
    _highlight(text, matches) {
      if (!matches || matches.length === 0) return text;

      let result = "";
      let lastIdx = 0;

      matches.forEach((idx) => {
        result += text.slice(lastIdx, idx);
        result += `<mark>${text[idx]}</mark>`;
        lastIdx = idx + 1;
      });

      result += text.slice(lastIdx);
      return result;
    }

    /**
     * Render results
     */
    _renderResults(filteredCommands = null, query = "") {
      this.results.innerHTML = "";
      this.activeIndex = -1;

      const commandsToRender = filteredCommands || this.commands;

      if (commandsToRender.length === 0) {
        const empty = document.createElement("div");
        empty.className = "bael-cmdpalette-empty";
        empty.innerHTML = `
                    <div class="bael-cmdpalette-empty-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <path d="m21 21-4.35-4.35"/>
                        </svg>
                    </div>
                    <div>No commands found</div>
                `;
        this.results.appendChild(empty);
        return;
      }

      // Group commands
      const groups = new Map();

      // Show recent first if no query
      if (!query && this.recentCommands.length > 0) {
        groups.set("Recent", []);
        this.recentCommands.forEach((recent) => {
          const cmd = this.commands.find((c) => c.id === recent.id);
          if (cmd) {
            groups.get("Recent").push({ ...cmd, highlighted: cmd.title });
          }
        });
      }

      commandsToRender.forEach((cmd) => {
        const group = cmd.group || "Commands";
        if (!groups.has(group)) {
          groups.set(group, []);
        }
        groups.get(group).push(cmd);
      });

      // Render groups
      groups.forEach((commands, groupName) => {
        if (commands.length === 0) return;

        const groupEl = document.createElement("div");
        groupEl.className = "bael-cmdpalette-group";

        const groupTitle = document.createElement("div");
        groupTitle.className = "bael-cmdpalette-group-title";
        groupTitle.textContent = groupName;
        groupEl.appendChild(groupTitle);

        commands.forEach((cmd) => {
          const item = this._createCommandItem(cmd, query);
          groupEl.appendChild(item);
        });

        this.results.appendChild(groupEl);
      });

      // Set first item as active
      this._setActiveIndex(0);
    }

    /**
     * Create command item
     */
    _createCommandItem(command, query = "") {
      const item = document.createElement("div");
      item.className = "bael-cmdpalette-item";
      item.dataset.commandId = command.id;

      // Icon
      if (command.icon) {
        const icon = document.createElement("span");
        icon.className = "bael-cmdpalette-item-icon";
        icon.innerHTML = command.icon;
        item.appendChild(icon);
      }

      // Content
      const content = document.createElement("div");
      content.className = "bael-cmdpalette-item-content";

      const title = document.createElement("div");
      title.className = "bael-cmdpalette-item-title";
      title.innerHTML = command.highlighted || command.title;
      content.appendChild(title);

      if (command.description) {
        const desc = document.createElement("div");
        desc.className = "bael-cmdpalette-item-description";
        desc.textContent = command.description;
        content.appendChild(desc);
      }

      item.appendChild(content);

      // Shortcut
      if (command.shortcut) {
        const shortcut = document.createElement("div");
        shortcut.className = "bael-cmdpalette-item-shortcut";
        command.shortcut.forEach((key) => {
          const kbd = document.createElement("kbd");
          kbd.textContent = key;
          shortcut.appendChild(kbd);
        });
        item.appendChild(shortcut);
      }

      // Click handler
      item.addEventListener("click", () => {
        this._executeCommand(command);
      });

      item.addEventListener("mouseenter", () => {
        const items = this.results.querySelectorAll(".bael-cmdpalette-item");
        const index = Array.from(items).indexOf(item);
        this._setActiveIndex(index);
      });

      return item;
    }

    /**
     * Set active item index
     */
    _setActiveIndex(index) {
      const items = this.results.querySelectorAll(".bael-cmdpalette-item");
      if (items.length === 0) return;

      // Wrap around
      if (index < 0) index = items.length - 1;
      if (index >= items.length) index = 0;

      // Remove previous active
      items.forEach((item) => item.classList.remove("active"));

      // Set new active
      items[index].classList.add("active");
      items[index].scrollIntoView({ block: "nearest" });

      this.activeIndex = index;
    }

    /**
     * Execute command
     */
    _executeCommand(command) {
      this._addToRecent(command);
      this.close();

      if (command.action) {
        command.action();
      }
    }

    /**
     * Handle search input
     */
    _onSearch() {
      const query = this.searchInput.value.trim();

      if (!query) {
        this._renderResults(null, "");
        return;
      }

      // Filter commands
      const filtered = this.commands
        .map((cmd) => {
          const matches = this._fuzzyMatch(cmd.title, query);
          if (matches) {
            return {
              ...cmd,
              matches,
              highlighted: this._highlight(cmd.title, matches),
              score: matches.length,
            };
          }
          return null;
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score);

      this._renderResults(filtered, query);
    }

    /**
     * Handle keyboard navigation
     */
    _onKeyDown(e) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          this._setActiveIndex(this.activeIndex + 1);
          break;
        case "ArrowUp":
          e.preventDefault();
          this._setActiveIndex(this.activeIndex - 1);
          break;
        case "Enter":
          e.preventDefault();
          const items = this.results.querySelectorAll(".bael-cmdpalette-item");
          if (items[this.activeIndex]) {
            const commandId = items[this.activeIndex].dataset.commandId;
            const command = this.commands.find((c) => c.id === commandId);
            if (command) {
              this._executeCommand(command);
            }
          }
          break;
        case "Escape":
          e.preventDefault();
          this.close();
          break;
      }
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    /**
     * Register commands
     */
    register(commands) {
      commands.forEach((cmd) => {
        // Generate ID if not provided
        if (!cmd.id) {
          cmd.id = `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        }
        this.commands.push(cmd);
      });
    }

    /**
     * Unregister command
     */
    unregister(commandId) {
      this.commands = this.commands.filter((c) => c.id !== commandId);
    }

    /**
     * Clear all commands
     */
    clear() {
      this.commands = [];
    }

    /**
     * Open palette
     */
    open() {
      this.isOpen = true;
      this.overlay.classList.add("open");
      this.searchInput.value = "";
      this.searchInput.focus();
      this._renderResults();
    }

    /**
     * Close palette
     */
    close() {
      this.isOpen = false;
      this.overlay.classList.remove("open");
    }

    /**
     * Toggle palette
     */
    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelCommandPalette();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$cmd = {
    register: (commands) => bael.register(commands),
    unregister: (id) => bael.unregister(id),
    clear: () => bael.clear(),
    open: () => bael.open(),
    close: () => bael.close(),
    toggle: () => bael.toggle(),
  };

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelCommandPalette = bael;

  console.log("⌨️ BAEL Command Palette Component loaded");
})();
