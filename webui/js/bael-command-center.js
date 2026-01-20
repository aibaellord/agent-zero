/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   ██████╗ ██████╗ ███╗   ███╗███╗   ███╗ █████╗ ███╗   ██╗██████╗        █
 * █  ██╔════╝██╔═══██╗████╗ ████║████╗ ████║██╔══██╗████╗  ██║██╔══██╗       █
 * █  ██║     ██║   ██║██╔████╔██║██╔████╔██║███████║██╔██╗ ██║██║  ██║       █
 * █  ██║     ██║   ██║██║╚██╔╝██║██║╚██╔╝██║██╔══██║██║╚██╗██║██║  ██║       █
 * █  ╚██████╗╚██████╔╝██║ ╚═╝ ██║██║ ╚═╝ ██║██║  ██║██║ ╚████║██████╔╝       █
 * █   ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝        █
 * █                                                                          █
 * █   BAEL COMMAND CENTER - Universal Command Palette with Power Actions    █
 * █   Ctrl+K unified interface for all Bael operations                      █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelCommandCenter {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;

      // Command registry
      this.commands = [];
      this.recentCommands = [];
      this.maxRecent = 10;

      // State
      this.query = "";
      this.filteredCommands = [];
      this.selectedIndex = 0;

      // Categories
      this.categories = {
        chat: { icon: "💬", label: "Chat", color: "#6366f1" },
        settings: { icon: "⚙️", label: "Settings", color: "#8b5cf6" },
        memory: { icon: "🧠", label: "Memory", color: "#22c55e" },
        scheduler: { icon: "📅", label: "Scheduler", color: "#f59e0b" },
        files: { icon: "📁", label: "Files", color: "#06b6d4" },
        projects: { icon: "📂", label: "Projects", color: "#ec4899" },
        dashboards: { icon: "📊", label: "Dashboards", color: "#10b981" },
        tools: { icon: "🔧", label: "Tools", color: "#f97316" },
        power: { icon: "⚡", label: "Power Systems", color: "#ef4444" },
        navigation: { icon: "🧭", label: "Navigation", color: "#3b82f6" },
      };
    }

    async initialize() {
      console.log("🎮 Bael Command Center initializing...");

      this.injectStyles();
      this.createContainer();
      this.registerDefaultCommands();
      this.setupShortcuts();
      this.loadRecentCommands();

      this.initialized = true;
      console.log("✅ BAEL COMMAND CENTER READY");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-command-center-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-command-center-styles";
      styles.textContent = `
                .bael-command-center {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10002;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    align-items: flex-start;
                    justify-content: center;
                    padding-top: 15vh;
                }

                .bael-command-center.visible {
                    display: flex;
                    animation: fadeIn 0.15s ease-out;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .command-dialog {
                    width: 600px;
                    max-width: 90vw;
                    max-height: 60vh;
                    background: #12121a;
                    border-radius: 16px;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
                    border: 1px solid #2a2a4a;
                    overflow: hidden;
                    animation: slideDown 0.2s ease-out;
                }

                @keyframes slideDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .command-input-container {
                    display: flex;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid #2a2a4a;
                    gap: 12px;
                }

                .command-icon {
                    font-size: 20px;
                    opacity: 0.5;
                }

                .command-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    font-size: 18px;
                    color: #e0e0e0;
                    font-family: inherit;
                }

                .command-input::placeholder {
                    color: #666;
                }

                .command-shortcut {
                    padding: 4px 8px;
                    background: #2a2a4a;
                    border-radius: 4px;
                    font-size: 12px;
                    color: #888;
                }

                .command-results {
                    max-height: calc(60vh - 70px);
                    overflow-y: auto;
                }

                .command-section {
                    padding: 8px 12px;
                }

                .command-section-title {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #666;
                    padding: 8px 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .command-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.1s;
                }

                .command-item:hover,
                .command-item.selected {
                    background: rgba(99, 102, 241, 0.15);
                }

                .command-item.selected {
                    background: rgba(99, 102, 241, 0.25);
                }

                .command-item-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    flex-shrink: 0;
                }

                .command-item-content {
                    flex: 1;
                    min-width: 0;
                }

                .command-item-name {
                    font-weight: 500;
                    margin-bottom: 2px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .command-item-name mark {
                    background: rgba(99, 102, 241, 0.4);
                    color: inherit;
                    border-radius: 2px;
                    padding: 0 2px;
                }

                .command-item-desc {
                    font-size: 12px;
                    color: #888;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .command-item-shortcut {
                    padding: 4px 8px;
                    background: #2a2a4a;
                    border-radius: 4px;
                    font-size: 11px;
                    color: #888;
                    flex-shrink: 0;
                }

                .command-item-category {
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-size: 10px;
                    text-transform: uppercase;
                    font-weight: 600;
                }

                .command-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    border-top: 1px solid #2a2a4a;
                    font-size: 12px;
                    color: #666;
                }

                .command-footer-hint {
                    display: flex;
                    gap: 16px;
                }

                .command-footer-hint span {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .command-footer kbd {
                    padding: 2px 6px;
                    background: #2a2a4a;
                    border-radius: 4px;
                    font-family: inherit;
                }

                .command-empty {
                    padding: 40px 20px;
                    text-align: center;
                    color: #666;
                }

                .command-empty-icon {
                    font-size: 48px;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }

                /* Category colors */
                .cat-chat { background: rgba(99, 102, 241, 0.2); }
                .cat-settings { background: rgba(139, 92, 246, 0.2); }
                .cat-memory { background: rgba(34, 197, 94, 0.2); }
                .cat-scheduler { background: rgba(245, 158, 11, 0.2); }
                .cat-files { background: rgba(6, 182, 212, 0.2); }
                .cat-projects { background: rgba(236, 72, 153, 0.2); }
                .cat-dashboards { background: rgba(16, 185, 129, 0.2); }
                .cat-tools { background: rgba(249, 115, 22, 0.2); }
                .cat-power { background: rgba(239, 68, 68, 0.2); }
                .cat-navigation { background: rgba(59, 130, 246, 0.2); }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-command-center";
      this.container.className = "bael-command-center";

      this.container.innerHTML = `
                <div class="command-dialog">
                    <div class="command-input-container">
                        <span class="command-icon">🎮</span>
                        <input type="text"
                               class="command-input"
                               id="command-input"
                               placeholder="Type a command or search..."
                               autocomplete="off"
                               spellcheck="false">
                        <span class="command-shortcut">ESC to close</span>
                    </div>
                    <div class="command-results" id="command-results">
                        <!-- Dynamic content -->
                    </div>
                    <div class="command-footer">
                        <div class="command-footer-hint">
                            <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
                            <span><kbd>↵</kbd> select</span>
                            <span><kbd>Tab</kbd> autocomplete</span>
                        </div>
                        <span id="command-count">0 commands</span>
                    </div>
                </div>
            `;

      document.body.appendChild(this.container);
      this.bindEvents();
    }

    bindEvents() {
      const input = this.container.querySelector("#command-input");

      // Input handling
      input.addEventListener("input", (e) => {
        this.query = e.target.value;
        this.filterCommands();
        this.render();
      });

      // Keyboard navigation
      input.addEventListener("keydown", (e) => {
        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            this.selectNext();
            break;
          case "ArrowUp":
            e.preventDefault();
            this.selectPrev();
            break;
          case "Enter":
            e.preventDefault();
            this.executeSelected();
            break;
          case "Tab":
            e.preventDefault();
            this.autocomplete();
            break;
          case "Escape":
            this.hide();
            break;
        }
      });

      // Click outside to close
      this.container.addEventListener("click", (e) => {
        if (e.target === this.container) {
          this.hide();
        }
      });
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Ctrl/Cmd + K
        if ((e.ctrlKey || e.metaKey) && e.key === "k") {
          e.preventDefault();
          this.toggle();
        }

        // Ctrl/Cmd + P (alternative)
        if ((e.ctrlKey || e.metaKey) && e.key === "p" && !e.shiftKey) {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // COMMAND REGISTRY
    // ═══════════════════════════════════════════════════════════════════════

    registerDefaultCommands() {
      // Chat commands
      this.register({
        id: "chat.new",
        name: "New Chat",
        description: "Start a new conversation",
        category: "chat",
        shortcut: "Ctrl+N",
        action: () => window.dispatchEvent(new CustomEvent("bael:new-chat")),
      });

      this.register({
        id: "chat.clear",
        name: "Clear Chat",
        description: "Clear current conversation",
        category: "chat",
        action: () => window.dispatchEvent(new CustomEvent("bael:clear-chat")),
      });

      this.register({
        id: "chat.export",
        name: "Export Chat",
        description: "Export conversation as JSON",
        category: "chat",
        action: () => window.BaelChat?.export?.(),
      });

      // Settings commands
      this.register({
        id: "settings.open",
        name: "Open Settings",
        description: "Open settings panel",
        category: "settings",
        shortcut: "Ctrl+,",
        action: () =>
          window.dispatchEvent(new CustomEvent("bael:open-settings")),
      });

      this.register({
        id: "settings.theme",
        name: "Toggle Theme",
        description: "Switch between light and dark theme",
        category: "settings",
        action: () => window.BaelSettings?.toggleTheme?.(),
      });

      // Memory commands
      this.register({
        id: "memory.dashboard",
        name: "Memory Dashboard",
        description: "Open memory management dashboard",
        category: "memory",
        action: () => window.BaelMemoryDashboard?.toggle?.(),
      });

      this.register({
        id: "memory.import",
        name: "Import Knowledge",
        description: "Import files to knowledge base",
        category: "memory",
        action: () => window.BaelMemoryDashboard?.importKnowledge?.(),
      });

      this.register({
        id: "memory.reindex",
        name: "Reindex Memory",
        description: "Rebuild memory index",
        category: "memory",
        action: () => window.BaelMemoryDashboard?.reindex?.(),
      });

      // Scheduler commands
      this.register({
        id: "scheduler.open",
        name: "Task Scheduler",
        description: "Open scheduler panel",
        category: "scheduler",
        action: () => Alpine.store("sidebar")?.setActiveView?.("tasks"),
      });

      this.register({
        id: "scheduler.new",
        name: "New Scheduled Task",
        description: "Create a new scheduled task",
        category: "scheduler",
        action: () => window.BaelScheduler?.showCreateDialog?.(),
      });

      // Dashboard commands
      this.register({
        id: "dashboard.agent",
        name: "Agent Console",
        description: "Real-time agent monitoring",
        category: "dashboards",
        shortcut: "Ctrl+Shift+C",
        action: () => window.BaelAgentConsole?.toggle?.(),
      });

      this.register({
        id: "dashboard.heisenberg",
        name: "Heisenberg Control",
        description: "Quantum AI intelligence dashboard",
        category: "dashboards",
        shortcut: "Ctrl+Shift+H",
        action: () => window.BaelHeisenbergControl?.toggle?.(),
      });

      this.register({
        id: "dashboard.performance",
        name: "Performance Dashboard",
        description: "Token usage and cost analytics",
        category: "dashboards",
        shortcut: "Ctrl+Shift+P",
        action: () => window.BaelPerformanceDashboard?.toggle?.(),
      });

      this.register({
        id: "dashboard.workflow",
        name: "Workflow Builder",
        description: "Visual workflow automation",
        category: "dashboards",
        action: () => window.BaelWorkflowBuilder?.toggle?.(),
      });

      // File commands
      this.register({
        id: "files.browser",
        name: "File Browser",
        description: "Open file browser",
        category: "files",
        action: () => Alpine.store("sidebar")?.setActiveView?.("files"),
      });

      this.register({
        id: "files.upload",
        name: "Upload Files",
        description: "Upload files to workspace",
        category: "files",
        action: () => window.BaelFiles?.upload?.(),
      });

      // Project commands
      this.register({
        id: "projects.list",
        name: "View Projects",
        description: "Open projects panel",
        category: "projects",
        action: () => Alpine.store("sidebar")?.setActiveView?.("projects"),
      });

      this.register({
        id: "projects.new",
        name: "New Project",
        description: "Create a new project",
        category: "projects",
        action: () => window.BaelProjects?.create?.(),
      });

      // Power system commands
      this.register({
        id: "power.supremacy",
        name: "Bael Supremacy",
        description: "Master integration hub status",
        category: "power",
        action: () => console.log("Supremacy:", window.BaelSupremacy),
      });

      this.register({
        id: "power.domination",
        name: "Bael Domination",
        description: "Multi-agent control system",
        category: "power",
        action: () => console.log("Domination:", window.BaelDomination),
      });

      this.register({
        id: "power.omniscient",
        name: "Bael Omniscient",
        description: "All-seeing intelligence",
        category: "power",
        action: () => console.log("Omniscient:", window.BaelOmniscient),
      });

      this.register({
        id: "power.exploit",
        name: "Bael Exploit",
        description: "Maximum advantage extraction",
        category: "power",
        action: () => console.log("Exploit:", window.BaelExploit),
      });

      // Tool commands
      this.register({
        id: "tools.split",
        name: "Split View",
        description: "Toggle split view mode",
        category: "tools",
        action: () => window.BaelSplitView?.toggle?.(),
      });

      this.register({
        id: "tools.focus",
        name: "Focus Mode",
        description: "Enter distraction-free mode",
        category: "tools",
        action: () => window.BaelFocusMode?.toggle?.(),
      });

      this.register({
        id: "tools.template",
        name: "Template Library",
        description: "Browse prompt templates",
        category: "tools",
        action: () => window.BaelTemplateLibrary?.toggle?.(),
      });

      // Navigation commands
      this.register({
        id: "nav.sidebar",
        name: "Toggle Sidebar",
        description: "Show/hide sidebar",
        category: "navigation",
        shortcut: "Ctrl+B",
        action: () => Alpine.store("sidebar")?.toggle?.(),
      });

      this.register({
        id: "nav.fullscreen",
        name: "Toggle Fullscreen",
        description: "Enter/exit fullscreen mode",
        category: "navigation",
        shortcut: "F11",
        action: () => {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            document.documentElement.requestFullscreen();
          }
        },
      });
    }

    register(command) {
      // Validate
      if (!command.id || !command.name || !command.action) {
        console.warn("Invalid command:", command);
        return;
      }

      // Add category info
      const cat = this.categories[command.category] || this.categories.tools;
      command.categoryInfo = cat;

      // Add keywords for search
      command.keywords = [
        command.name.toLowerCase(),
        command.description?.toLowerCase() || "",
        command.category,
        command.id,
      ].join(" ");

      this.commands.push(command);
    }

    unregister(commandId) {
      this.commands = this.commands.filter((c) => c.id !== commandId);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FILTERING & SEARCH
    // ═══════════════════════════════════════════════════════════════════════

    filterCommands() {
      const query = this.query.toLowerCase().trim();

      if (!query) {
        // Show recent commands first, then all
        const recentIds = this.recentCommands.map((r) => r.id);
        const recent = this.recentCommands
          .map((r) => this.commands.find((c) => c.id === r.id))
          .filter(Boolean);
        const others = this.commands.filter((c) => !recentIds.includes(c.id));

        this.filteredCommands = [...recent, ...others].slice(0, 20);
      } else {
        // Fuzzy search
        this.filteredCommands = this.commands
          .map((cmd) => ({
            cmd,
            score: this.fuzzyScore(cmd.keywords, query),
          }))
          .filter((item) => item.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 20)
          .map((item) => item.cmd);
      }

      this.selectedIndex = 0;
    }

    fuzzyScore(text, query) {
      if (!text || !query) return 0;

      text = text.toLowerCase();
      query = query.toLowerCase();

      // Exact match
      if (text.includes(query)) return 100;

      // Word start matches
      const words = text.split(/\s+/);
      let score = 0;

      for (const word of words) {
        if (word.startsWith(query)) {
          score += 50;
        } else if (word.includes(query)) {
          score += 25;
        }
      }

      // Character sequence match
      let queryIdx = 0;
      for (let i = 0; i < text.length && queryIdx < query.length; i++) {
        if (text[i] === query[queryIdx]) {
          queryIdx++;
          score += 5;
        }
      }

      if (queryIdx === query.length) {
        return score;
      }

      return 0;
    }

    highlightMatch(text, query) {
      if (!query) return text;

      const regex = new RegExp(
        `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi",
      );
      return text.replace(regex, "<mark>$1</mark>");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // NAVIGATION
    // ═══════════════════════════════════════════════════════════════════════

    selectNext() {
      this.selectedIndex = Math.min(
        this.selectedIndex + 1,
        this.filteredCommands.length - 1,
      );
      this.render();
      this.scrollToSelected();
    }

    selectPrev() {
      this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
      this.render();
      this.scrollToSelected();
    }

    scrollToSelected() {
      const results = this.container.querySelector("#command-results");
      const selected = results.querySelector(".command-item.selected");
      if (selected) {
        selected.scrollIntoView({ block: "nearest" });
      }
    }

    autocomplete() {
      const selected = this.filteredCommands[this.selectedIndex];
      if (selected) {
        const input = this.container.querySelector("#command-input");
        input.value = selected.name;
        this.query = selected.name;
        this.filterCommands();
        this.render();
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EXECUTION
    // ═══════════════════════════════════════════════════════════════════════

    executeSelected() {
      const command = this.filteredCommands[this.selectedIndex];
      if (command) {
        this.execute(command);
      }
    }

    execute(command) {
      // Track as recent
      this.addToRecent(command);

      // Hide palette
      this.hide();

      // Execute
      try {
        command.action();
      } catch (error) {
        console.error("Command execution failed:", error);
        window.BaelNotify?.error?.(`Failed to execute: ${command.name}`);
      }
    }

    addToRecent(command) {
      // Remove if already exists
      this.recentCommands = this.recentCommands.filter(
        (r) => r.id !== command.id,
      );

      // Add to front
      this.recentCommands.unshift({
        id: command.id,
        timestamp: Date.now(),
      });

      // Trim to max
      this.recentCommands = this.recentCommands.slice(0, this.maxRecent);

      // Save
      this.saveRecentCommands();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RENDERING
    // ═══════════════════════════════════════════════════════════════════════

    render() {
      const results = this.container.querySelector("#command-results");
      const count = this.container.querySelector("#command-count");

      if (this.filteredCommands.length === 0) {
        results.innerHTML = `
                    <div class="command-empty">
                        <div class="command-empty-icon">🔍</div>
                        <div>No commands found for "${this.query}"</div>
                    </div>
                `;
        count.textContent = "0 commands";
        return;
      }

      // Group by category if no search
      let html = "";

      if (!this.query) {
        // Show recent first
        const recentIds = this.recentCommands.map((r) => r.id);
        const recent = this.filteredCommands.filter((c) =>
          recentIds.includes(c.id),
        );
        const others = this.filteredCommands.filter(
          (c) => !recentIds.includes(c.id),
        );

        if (recent.length > 0) {
          html += `<div class="command-section-title">🕐 Recent</div>`;
          html += `<div class="command-section">`;
          html += recent.map((cmd, i) => this.renderCommand(cmd, i)).join("");
          html += `</div>`;
        }

        if (others.length > 0) {
          html += `<div class="command-section-title">📋 All Commands</div>`;
          html += `<div class="command-section">`;
          html += others
            .map((cmd, i) => this.renderCommand(cmd, recent.length + i))
            .join("");
          html += `</div>`;
        }
      } else {
        html += `<div class="command-section">`;
        html += this.filteredCommands
          .map((cmd, i) => this.renderCommand(cmd, i))
          .join("");
        html += `</div>`;
      }

      results.innerHTML = html;
      count.textContent = `${this.filteredCommands.length} commands`;

      // Bind click events
      results.querySelectorAll(".command-item").forEach((item, index) => {
        item.addEventListener("click", () => {
          this.selectedIndex = index;
          this.executeSelected();
        });

        item.addEventListener("mouseenter", () => {
          this.selectedIndex = index;
          this.render();
        });
      });
    }

    renderCommand(cmd, index) {
      const isSelected = index === this.selectedIndex;
      const catInfo = cmd.categoryInfo || {};

      return `
                <div class="command-item ${isSelected ? "selected" : ""}" data-index="${index}">
                    <div class="command-item-icon cat-${cmd.category}"
                         style="background: ${catInfo.color}22;">
                        ${catInfo.icon || "⚡"}
                    </div>
                    <div class="command-item-content">
                        <div class="command-item-name">
                            ${this.highlightMatch(cmd.name, this.query)}
                        </div>
                        <div class="command-item-desc">${cmd.description || ""}</div>
                    </div>
                    ${cmd.shortcut ? `<span class="command-item-shortcut">${cmd.shortcut}</span>` : ""}
                </div>
            `;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═══════════════════════════════════════════════════════════════════════

    loadRecentCommands() {
      try {
        const stored = localStorage.getItem("bael-recent-commands");
        if (stored) {
          this.recentCommands = JSON.parse(stored);
        }
      } catch (e) {
        console.warn("Failed to load recent commands:", e);
      }
    }

    saveRecentCommands() {
      try {
        localStorage.setItem(
          "bael-recent-commands",
          JSON.stringify(this.recentCommands),
        );
      } catch (e) {
        console.warn("Failed to save recent commands:", e);
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VISIBILITY
    // ═══════════════════════════════════════════════════════════════════════

    show() {
      this.container.classList.add("visible");
      this.visible = true;

      // Reset state
      this.query = "";
      this.selectedIndex = 0;

      // Focus input
      const input = this.container.querySelector("#command-input");
      input.value = "";
      input.focus();

      // Render
      this.filterCommands();
      this.render();
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

  window.BaelCommandCenter = new BaelCommandCenter();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelCommandCenter.initialize();
    });
  } else {
    window.BaelCommandCenter.initialize();
  }

  console.log("🎮 Bael Command Center loaded");
})();
