/**
 * BAEL - LORD OF ALL
 * Command Palette System
 * ======================
 * VS Code-style command palette with fuzzy search, categories, and quick actions
 */

class BaelCommandPalette {
  constructor() {
    this.isOpen = false;
    this.selectedIndex = 0;
    this.filteredCommands = [];
    this.history = JSON.parse(
      localStorage.getItem("bael_command_history") || "[]",
    );
    this.commands = [];
    this.categories = new Map();

    this.init();
  }

  init() {
    this.createDOM();
    this.registerDefaultCommands();
    this.bindEvents();
    console.log("🔱 Bael Command Palette initialized");
  }

  createDOM() {
    // Create palette container
    const palette = document.createElement("div");
    palette.id = "bael-command-palette";
    palette.className = "bael-command-palette hidden";
    palette.innerHTML = `
            <div class="bcp-overlay" onclick="baelPalette.close()"></div>
            <div class="bcp-modal">
                <div class="bcp-header">
                    <div class="bcp-icon">🔱</div>
                    <input type="text"
                           id="bcp-search"
                           class="bcp-search"
                           placeholder="Type a command... (Ctrl+K)"
                           autocomplete="off"
                           spellcheck="false">
                    <span class="bcp-hint">ESC to close</span>
                </div>
                <div class="bcp-categories">
                    <button class="bcp-cat active" data-cat="all">All</button>
                    <button class="bcp-cat" data-cat="navigation">Navigation</button>
                    <button class="bcp-cat" data-cat="actions">Actions</button>
                    <button class="bcp-cat" data-cat="settings">Settings</button>
                    <button class="bcp-cat" data-cat="heisenberg">Heisenberg</button>
                    <button class="bcp-cat" data-cat="theme">Theme</button>
                </div>
                <div class="bcp-results" id="bcp-results"></div>
                <div class="bcp-footer">
                    <span>↑↓ Navigate</span>
                    <span>↵ Execute</span>
                    <span>Tab Autocomplete</span>
                </div>
            </div>
        `;
    document.body.appendChild(palette);

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
            .bael-command-palette {
                position: fixed;
                inset: 0;
                z-index: 99999;
                display: flex;
                align-items: flex-start;
                justify-content: center;
                padding-top: 15vh;
            }

            .bael-command-palette.hidden {
                display: none;
            }

            .bcp-overlay {
                position: absolute;
                inset: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
            }

            .bcp-modal {
                position: relative;
                width: 90%;
                max-width: 600px;
                background: var(--color-panel, #1a1a1a);
                border: 1px solid var(--color-primary, #DC143C);
                border-radius: var(--radius-lg, 12px);
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), var(--shadow-glow, 0 0 20px rgba(220,20,60,0.3));
                overflow: hidden;
                animation: bcp-slide-in 0.15s ease-out;
            }

            @keyframes bcp-slide-in {
                from {
                    opacity: 0;
                    transform: translateY(-20px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            .bcp-header {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 16px;
                border-bottom: 1px solid var(--color-border, #333);
            }

            .bcp-icon {
                font-size: 24px;
            }

            .bcp-search {
                flex: 1;
                background: transparent;
                border: none;
                color: var(--color-text, #e0e0e0);
                font-size: 18px;
                outline: none;
            }

            .bcp-search::placeholder {
                color: var(--color-text-muted, #666);
            }

            .bcp-hint {
                font-size: 12px;
                color: var(--color-text-muted, #666);
                padding: 4px 8px;
                background: var(--color-background, #0a0a0a);
                border-radius: var(--radius-sm, 4px);
            }

            .bcp-categories {
                display: flex;
                gap: 8px;
                padding: 12px 16px;
                border-bottom: 1px solid var(--color-border, #333);
                overflow-x: auto;
            }

            .bcp-cat {
                padding: 6px 12px;
                background: transparent;
                border: 1px solid var(--color-border, #333);
                color: var(--color-text-secondary, #888);
                border-radius: var(--radius-full, 9999px);
                cursor: pointer;
                font-size: 12px;
                white-space: nowrap;
                transition: all 0.2s;
            }

            .bcp-cat:hover, .bcp-cat.active {
                background: var(--color-primary, #DC143C);
                border-color: var(--color-primary, #DC143C);
                color: white;
            }

            .bcp-results {
                max-height: 400px;
                overflow-y: auto;
            }

            .bcp-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px 16px;
                cursor: pointer;
                transition: all 0.1s;
                border-left: 3px solid transparent;
            }

            .bcp-item:hover, .bcp-item.selected {
                background: var(--color-surface, #1e1e1e);
                border-left-color: var(--color-primary, #DC143C);
            }

            .bcp-item-icon {
                font-size: 20px;
                width: 28px;
                text-align: center;
            }

            .bcp-item-content {
                flex: 1;
            }

            .bcp-item-title {
                color: var(--color-text, #e0e0e0);
                font-weight: 500;
            }

            .bcp-item-title mark {
                background: var(--color-primary, #DC143C);
                color: white;
                padding: 0 2px;
                border-radius: 2px;
            }

            .bcp-item-desc {
                font-size: 12px;
                color: var(--color-text-muted, #666);
                margin-top: 2px;
            }

            .bcp-item-shortcut {
                display: flex;
                gap: 4px;
            }

            .bcp-key {
                padding: 2px 6px;
                background: var(--color-background, #0a0a0a);
                border: 1px solid var(--color-border, #333);
                border-radius: var(--radius-sm, 4px);
                font-size: 11px;
                font-family: var(--font-mono, monospace);
                color: var(--color-text-secondary, #888);
            }

            .bcp-empty {
                padding: 40px;
                text-align: center;
                color: var(--color-text-muted, #666);
            }

            .bcp-footer {
                display: flex;
                justify-content: center;
                gap: 24px;
                padding: 12px;
                border-top: 1px solid var(--color-border, #333);
                font-size: 12px;
                color: var(--color-text-muted, #666);
            }

            .bcp-group-header {
                padding: 8px 16px;
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: var(--color-primary, #DC143C);
                background: var(--color-background-alt, #121212);
            }
        `;
    document.head.appendChild(style);

    this.modal = palette;
    this.searchInput = document.getElementById("bcp-search");
    this.resultsContainer = document.getElementById("bcp-results");
  }

  registerDefaultCommands() {
    // Navigation commands
    this.register({
      id: "nav.chat",
      title: "Go to Chat",
      description: "Open the chat interface",
      icon: "💬",
      category: "navigation",
      shortcut: ["Ctrl", "1"],
      action: () => this.navigateTo("chat"),
    });

    this.register({
      id: "nav.settings",
      title: "Open Settings",
      description: "Configure Bael settings",
      icon: "⚙️",
      category: "navigation",
      shortcut: ["Ctrl", ","],
      action: () => this.navigateTo("settings"),
    });

    this.register({
      id: "nav.heisenberg",
      title: "Open Heisenberg Dashboard",
      description: "View cognitive system status",
      icon: "🧠",
      category: "heisenberg",
      shortcut: ["Ctrl", "Shift", "H"],
      action: () => this.navigateTo("heisenberg"),
    });

    this.register({
      id: "nav.scheduler",
      title: "Open Scheduler",
      description: "Manage scheduled tasks",
      icon: "📅",
      category: "navigation",
      action: () => this.navigateTo("scheduler"),
    });

    this.register({
      id: "nav.files",
      title: "Open File Browser",
      description: "Browse and manage files",
      icon: "📁",
      category: "navigation",
      action: () => this.navigateTo("files"),
    });

    // Action commands
    this.register({
      id: "action.newchat",
      title: "New Chat",
      description: "Start a fresh conversation",
      icon: "➕",
      category: "actions",
      shortcut: ["Ctrl", "N"],
      action: () => this.executeAction("newChat"),
    });

    this.register({
      id: "action.restart",
      title: "Restart Framework",
      description: "Restart the Bael framework",
      icon: "🔄",
      category: "actions",
      action: () => this.executeAction("restart"),
    });

    this.register({
      id: "action.pause",
      title: "Pause/Resume Agent",
      description: "Toggle agent execution",
      icon: "⏸️",
      category: "actions",
      shortcut: ["Ctrl", "P"],
      action: () => this.executeAction("togglePause"),
    });

    this.register({
      id: "action.nudge",
      title: "Nudge Agent",
      description: "Retry the last operation",
      icon: "👉",
      category: "actions",
      action: () => this.executeAction("nudge"),
    });

    this.register({
      id: "action.export",
      title: "Export Chat",
      description: "Export current conversation",
      icon: "📤",
      category: "actions",
      action: () => this.executeAction("export"),
    });

    this.register({
      id: "action.focus",
      title: "Toggle Focus Mode",
      description: "Enter distraction-free mode",
      icon: "🎯",
      category: "actions",
      shortcut: ["Ctrl", "Shift", "F"],
      action: () => this.executeAction("focusMode"),
    });

    // Theme commands
    this.register({
      id: "theme.dark",
      title: "Theme: Bael Dark",
      description: "Default dark theme",
      icon: "🌙",
      category: "theme",
      action: () => this.setTheme("bael-dark"),
    });

    this.register({
      id: "theme.crimson",
      title: "Theme: Bael Crimson",
      description: "Deep crimson theme",
      icon: "❤️",
      category: "theme",
      action: () => this.setTheme("bael-crimson"),
    });

    this.register({
      id: "theme.abyss",
      title: "Theme: Bael Abyss",
      description: "Purple void theme",
      icon: "💜",
      category: "theme",
      action: () => this.setTheme("bael-abyss"),
    });

    this.register({
      id: "theme.inferno",
      title: "Theme: Bael Inferno",
      description: "Fiery orange theme",
      icon: "🔥",
      category: "theme",
      action: () => this.setTheme("bael-inferno"),
    });

    this.register({
      id: "theme.void",
      title: "Theme: Bael Void",
      description: "Cyan cyberpunk theme",
      icon: "💎",
      category: "theme",
      action: () => this.setTheme("bael-void"),
    });

    this.register({
      id: "theme.light",
      title: "Theme: Bael Light",
      description: "Light mode theme",
      icon: "☀️",
      category: "theme",
      action: () => this.setTheme("bael-light"),
    });

    // Heisenberg commands
    this.register({
      id: "heisenberg.analyze",
      title: "Heisenberg: Analyze System",
      description: "Run cognitive analysis",
      icon: "🔬",
      category: "heisenberg",
      action: () => this.heisenbergAction("analyze"),
    });

    this.register({
      id: "heisenberg.optimize",
      title: "Heisenberg: Optimize",
      description: "Optimize cognitive processes",
      icon: "⚡",
      category: "heisenberg",
      action: () => this.heisenbergAction("optimize"),
    });

    this.register({
      id: "heisenberg.instruments",
      title: "Heisenberg: Power Instruments",
      description: "View power instruments",
      icon: "🛠️",
      category: "heisenberg",
      shortcut: ["Ctrl", "Shift", "I"],
      action: () => this.heisenbergAction("instruments"),
    });

    // Settings commands
    this.register({
      id: "settings.api",
      title: "Configure API Keys",
      description: "Set up API providers",
      icon: "🔑",
      category: "settings",
      action: () => this.openSettingsTab("api"),
    });

    this.register({
      id: "settings.models",
      title: "Configure Models",
      description: "Change AI models",
      icon: "🤖",
      category: "settings",
      action: () => this.openSettingsTab("models"),
    });

    this.register({
      id: "settings.agent",
      title: "Agent Configuration",
      description: "Customize agent behavior",
      icon: "👤",
      category: "settings",
      action: () => this.openSettingsTab("agent"),
    });

    // ═══════════════════════════════════════════════════════════
    // ADVANCED BAEL FEATURES
    // ═══════════════════════════════════════════════════════════

    // Voice Commands
    this.register({
      id: "voice.toggle",
      title: "Toggle Voice Commands",
      description: "Enable/disable voice control",
      icon: "🎤",
      category: "actions",
      shortcut: ["Ctrl", "Shift", "V"],
      action: () => window.BaelVoiceCommands?.toggle(),
    });

    // Memory Visualization
    this.register({
      id: "memory.visualize",
      title: "Memory Visualization",
      description: "View agent memory graph",
      icon: "🧠",
      category: "heisenberg",
      action: () => window.BaelMemoryViz?.toggle(),
    });

    // Workflow Builder
    this.register({
      id: "workflow.builder",
      title: "Workflow Builder",
      description: "Create visual task pipelines",
      icon: "🔧",
      category: "actions",
      shortcut: ["Ctrl", "Shift", "W"],
      action: () => window.BaelWorkflowBuilder?.toggle(),
    });

    // Plugin Manager
    this.register({
      id: "plugins.manager",
      title: "Plugin Manager",
      description: "Manage installed plugins",
      icon: "🔌",
      category: "settings",
      action: () => window.BaelPluginSystem?.toggle(),
    });

    // Multi-Model Manager
    this.register({
      id: "models.manager",
      title: "Model Manager",
      description: "Switch AI models and parameters",
      icon: "🤖",
      category: "settings",
      shortcut: ["Ctrl", "Shift", "M"],
      action: () => window.BaelMultiModel?.toggle(),
    });

    // Macro Recorder
    this.register({
      id: "macro.toggle",
      title: "Macro Recorder",
      description: "Record and playback actions",
      icon: "⏺️",
      category: "actions",
      action: () => window.BaelMacroRecorder?.toggle(),
    });

    // Notes Panel
    this.register({
      id: "notes.toggle",
      title: "Toggle Notes Panel",
      description: "Quick notes sidebar",
      icon: "📝",
      category: "actions",
      shortcut: ["Ctrl", "Shift", "N"],
      action: () => window.BaelNotesPanel?.toggle(),
    });

    // Prompt Library
    this.register({
      id: "prompts.library",
      title: "Prompt Library",
      description: "Saved prompt templates",
      icon: "📚",
      category: "actions",
      shortcut: ["Ctrl", "Shift", "P"],
      action: () => window.BaelPromptLibrary?.toggle(),
    });

    // Chat Search
    this.register({
      id: "search.chat",
      title: "Search Chat",
      description: "Search through messages",
      icon: "🔍",
      category: "actions",
      shortcut: ["Ctrl", "F"],
      action: () => window.BaelChatSearch?.toggle(),
    });

    // Split View
    this.register({
      id: "view.split",
      title: "Toggle Split View",
      description: "Compare two chats side by side",
      icon: "⬜",
      category: "actions",
      shortcut: ["Ctrl", "Alt", "S"],
      action: () => window.BaelSplitView?.toggle(),
    });

    // Markdown Preview
    this.register({
      id: "preview.markdown",
      title: "Markdown Preview",
      description: "Preview markdown content",
      icon: "📄",
      category: "actions",
      action: () => window.BaelMarkdownPreview?.toggle(),
    });

    // Theme Editor
    this.register({
      id: "theme.editor",
      title: "Theme Editor",
      description: "Create custom themes",
      icon: "🎨",
      category: "theme",
      action: () => window.BaelThemeEditor?.toggle(),
    });

    // Keyboard Shortcuts
    this.register({
      id: "shortcuts.show",
      title: "Show Keyboard Shortcuts",
      description: "View all keyboard shortcuts",
      icon: "⌨️",
      category: "settings",
      shortcut: ["Ctrl", "/"],
      action: () => window.BaelKeybindings?.showHelp(),
    });

    // Export Options
    this.register({
      id: "export.options",
      title: "Export Chat",
      description: "Export as Markdown, JSON, PDF",
      icon: "📤",
      category: "actions",
      shortcut: ["Ctrl", "E"],
      action: () => window.BaelExport?.open(),
    });

    // Performance Monitor
    this.register({
      id: "perf.monitor",
      title: "Performance Monitor",
      description: "View system performance",
      icon: "📊",
      category: "heisenberg",
      action: () => window.BaelPerformance?.toggle(),
    });

    // AI Thinking Visualization
    this.register({
      id: "thinking.viz",
      title: "Thinking Visualization",
      description: "Visualize AI reasoning",
      icon: "💭",
      category: "heisenberg",
      action: () => window.BaelThinkingViz?.toggle(),
    });

    // Session Statistics
    this.register({
      id: "stats.session",
      title: "Session Statistics",
      description: "View session stats and tokens",
      icon: "📈",
      category: "actions",
      action: () => window.BaelSessionStats?.toggle(),
    });

    // Notification Center
    this.register({
      id: "notifications.center",
      title: "Notification Center",
      description: "View all notifications",
      icon: "🔔",
      category: "actions",
      action: () => window.BaelNotifications?.showCenter(),
    });

    // Toggle Sidebar
    this.register({
      id: "ui.sidebar",
      title: "Toggle Sidebar",
      description: "Show/hide sidebar",
      icon: "◧",
      category: "navigation",
      shortcut: ["Ctrl", "B"],
      action: () => document.querySelector(".sidebar-toggle")?.click(),
    });

    // Clear Chat
    this.register({
      id: "action.clearChat",
      title: "Clear Current Chat",
      description: "Clear all messages",
      icon: "🗑️",
      category: "actions",
      action: () => {
        if (confirm("Are you sure you want to clear this chat?")) {
          window.dispatchEvent(new CustomEvent("clear-chat"));
        }
      },
    });

    // Toggle Sound Effects
    this.register({
      id: "audio.toggle",
      title: "Toggle Sound Effects",
      description: "Enable/disable UI sounds",
      icon: "🔊",
      category: "settings",
      action: () => window.BaelAudio?.toggle(),
    });
  }

  register(command) {
    this.commands.push(command);

    if (!this.categories.has(command.category)) {
      this.categories.set(command.category, []);
    }
    this.categories.get(command.category).push(command);
  }

  bindEvents() {
    // Global keyboard shortcut
    document.addEventListener("keydown", (e) => {
      // Ctrl+K to open
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        this.toggle();
      }

      // Escape to close
      if (e.key === "Escape" && this.isOpen) {
        this.close();
      }
    });

    // Search input
    this.searchInput.addEventListener("input", () => this.filter());
    this.searchInput.addEventListener("keydown", (e) => this.handleKeydown(e));

    // Category buttons
    document.querySelectorAll(".bcp-cat").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll(".bcp-cat")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.filter(btn.dataset.cat);
      });
    });
  }

  handleKeydown(e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      this.selectedIndex = Math.min(
        this.selectedIndex + 1,
        this.filteredCommands.length - 1,
      );
      this.updateSelection();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
      this.updateSelection();
    } else if (e.key === "Enter") {
      e.preventDefault();
      this.executeSelected();
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (this.filteredCommands.length > 0) {
        this.searchInput.value =
          this.filteredCommands[this.selectedIndex].title;
        this.filter();
      }
    }
  }

  filter(category = "all") {
    const query = this.searchInput.value.toLowerCase();

    this.filteredCommands = this.commands.filter((cmd) => {
      const matchesCategory = category === "all" || cmd.category === category;
      const matchesQuery =
        !query ||
        cmd.title.toLowerCase().includes(query) ||
        cmd.description.toLowerCase().includes(query) ||
        cmd.id.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });

    // Sort: history first, then alphabetical
    this.filteredCommands.sort((a, b) => {
      const aInHistory = this.history.indexOf(a.id);
      const bInHistory = this.history.indexOf(b.id);

      if (aInHistory !== -1 && bInHistory === -1) return -1;
      if (bInHistory !== -1 && aInHistory === -1) return 1;
      if (aInHistory !== -1 && bInHistory !== -1)
        return aInHistory - bInHistory;
      return a.title.localeCompare(b.title);
    });

    this.selectedIndex = 0;
    this.render();
  }

  render() {
    if (this.filteredCommands.length === 0) {
      this.resultsContainer.innerHTML = `
                <div class="bcp-empty">
                    <div style="font-size: 40px; margin-bottom: 10px;">🔍</div>
                    <div>No commands found</div>
                </div>
            `;
      return;
    }

    const query = this.searchInput.value.toLowerCase();
    let html = "";
    let currentCategory = "";

    this.filteredCommands.forEach((cmd, index) => {
      if (cmd.category !== currentCategory) {
        currentCategory = cmd.category;
        html += `<div class="bcp-group-header">${currentCategory}</div>`;
      }

      const title = this.highlightMatch(cmd.title, query);
      const shortcut = cmd.shortcut
        ? cmd.shortcut.map((k) => `<span class="bcp-key">${k}</span>`).join("")
        : "";

      html += `
                <div class="bcp-item ${index === this.selectedIndex ? "selected" : ""}"
                     data-index="${index}"
                     onclick="baelPalette.execute(${index})">
                    <div class="bcp-item-icon">${cmd.icon}</div>
                    <div class="bcp-item-content">
                        <div class="bcp-item-title">${title}</div>
                        <div class="bcp-item-desc">${cmd.description}</div>
                    </div>
                    <div class="bcp-item-shortcut">${shortcut}</div>
                </div>
            `;
    });

    this.resultsContainer.innerHTML = html;
  }

  highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  }

  updateSelection() {
    document.querySelectorAll(".bcp-item").forEach((el, i) => {
      el.classList.toggle("selected", i === this.selectedIndex);
    });

    // Scroll into view
    const selected = document.querySelector(".bcp-item.selected");
    if (selected) {
      selected.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  execute(index) {
    const cmd = this.filteredCommands[index];
    if (cmd) {
      // Add to history
      this.history = this.history.filter((id) => id !== cmd.id);
      this.history.unshift(cmd.id);
      this.history = this.history.slice(0, 10);
      localStorage.setItem(
        "bael_command_history",
        JSON.stringify(this.history),
      );

      this.close();
      cmd.action();
    }
  }

  executeSelected() {
    this.execute(this.selectedIndex);
  }

  open() {
    this.isOpen = true;
    this.modal.classList.remove("hidden");
    this.searchInput.value = "";
    this.filter();
    this.searchInput.focus();
  }

  close() {
    this.isOpen = false;
    this.modal.classList.add("hidden");
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  // Action handlers
  navigateTo(page) {
    console.log(`🔱 Navigating to: ${page}`);
    // Integrate with existing navigation system
    if (window.Alpine && window.Alpine.store) {
      const store = window.Alpine.store("appStore");
      if (store && store.setPage) {
        store.setPage(page);
      }
    }
  }

  executeAction(action) {
    console.log(`🔱 Executing action: ${action}`);
    switch (action) {
      case "newChat":
        if (typeof newChat === "function") newChat();
        break;
      case "restart":
        if (typeof restartFramework === "function") restartFramework();
        break;
      case "togglePause":
        if (typeof togglePause === "function") togglePause();
        break;
      case "nudge":
        if (typeof nudge === "function") nudge();
        break;
      case "export":
        if (typeof exportChat === "function") exportChat();
        break;
      case "focusMode":
        if (window.baelFocusMode) window.baelFocusMode.toggle();
        break;
    }
  }

  setTheme(theme) {
    console.log(`🔱 Setting theme: ${theme}`);
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("bael_theme", theme);

    // Dispatch theme change event
    window.dispatchEvent(
      new CustomEvent("bael-theme-change", { detail: { theme } }),
    );
  }

  heisenbergAction(action) {
    console.log(`🔱 Heisenberg action: ${action}`);
    // Integrate with Heisenberg system
    window.dispatchEvent(
      new CustomEvent("heisenberg-action", { detail: { action } }),
    );
  }

  openSettingsTab(tab) {
    this.navigateTo("settings");
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("settings-tab", { detail: { tab } }),
      );
    }, 100);
  }
}

// Initialize
let baelPalette;
document.addEventListener("DOMContentLoaded", () => {
  baelPalette = new BaelCommandPalette();
  window.baelPalette = baelPalette;
});
