/**
 * BAEL - LORD OF ALL
 * Custom Keybindings Editor - Full keyboard shortcut customization
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelKeybindings {
    constructor() {
      this.isOpen = false;
      this.container = null;
      this.editingBinding = null;
      this.defaultBindings = this.getDefaultBindings();
      this.customBindings = this.loadCustomBindings();
      this.activeBindings = this.mergeBindings();
      this.init();
    }

    getDefaultBindings() {
      return {
        "command-palette": {
          keys: ["Ctrl", "K"],
          description: "Open Command Palette",
          category: "Navigation",
        },
        "focus-mode": {
          keys: ["Ctrl", "Shift", "F"],
          description: "Toggle Focus Mode",
          category: "View",
        },
        "notes-panel": {
          keys: ["Ctrl", "Shift", "N"],
          description: "Toggle Notes Panel",
          category: "Panels",
        },
        "prompt-library": {
          keys: ["Ctrl", "Shift", "P"],
          description: "Open Prompt Library",
          category: "Tools",
        },
        "split-view": {
          keys: ["Ctrl", "Alt", "S"],
          description: "Toggle Split View",
          category: "View",
        },
        search: {
          keys: ["Ctrl", "F"],
          description: "Search Messages",
          category: "Search",
        },
        "new-chat": {
          keys: ["Ctrl", "N"],
          description: "New Chat",
          category: "Chat",
        },
        "send-message": {
          keys: ["Enter"],
          description: "Send Message",
          category: "Chat",
        },
        "send-multiline": {
          keys: ["Shift", "Enter"],
          description: "New Line in Message",
          category: "Chat",
        },
        "close-modal": {
          keys: ["Escape"],
          description: "Close Modal/Panel",
          category: "Navigation",
        },
        "toggle-sidebar": {
          keys: ["Ctrl", "B"],
          description: "Toggle Sidebar",
          category: "View",
        },
        settings: {
          keys: ["Ctrl", ","],
          description: "Open Settings",
          category: "Navigation",
        },
        "theme-switch": {
          keys: ["Ctrl", "Shift", "T"],
          description: "Switch Theme",
          category: "View",
        },
        "export-chat": {
          keys: ["Ctrl", "E"],
          description: "Export Current Chat",
          category: "Chat",
        },
        "clear-chat": {
          keys: ["Ctrl", "Shift", "Delete"],
          description: "Clear Chat History",
          category: "Chat",
        },
        "zoom-in": {
          keys: ["Ctrl", "+"],
          description: "Zoom In",
          category: "View",
        },
        "zoom-out": {
          keys: ["Ctrl", "-"],
          description: "Zoom Out",
          category: "View",
        },
        "zoom-reset": {
          keys: ["Ctrl", "0"],
          description: "Reset Zoom",
          category: "View",
        },
        performance: {
          keys: ["Ctrl", "Shift", "D"],
          description: "Performance Dashboard",
          category: "Tools",
        },
        fullscreen: {
          keys: ["F11"],
          description: "Toggle Fullscreen",
          category: "View",
        },
      };
    }

    init() {
      this.createEditor();
      this.setupGlobalHandler();
      console.log("⚡ Bael Keybindings Editor initialized");
    }

    createEditor() {
      const editor = document.createElement("div");
      editor.id = "bael-keybindings";
      editor.className = "bael-keybindings";
      editor.innerHTML = `
                <div class="keybindings-overlay"></div>
                <div class="keybindings-modal">
                    <div class="keybindings-header">
                        <div class="keybindings-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="4" width="20" height="16" rx="2"/>
                                <path d="M6 8h.01"/>
                                <path d="M10 8h.01"/>
                                <path d="M14 8h.01"/>
                                <path d="M18 8h.01"/>
                                <path d="M8 12h.01"/>
                                <path d="M12 12h.01"/>
                                <path d="M16 12h.01"/>
                                <path d="M7 16h10"/>
                            </svg>
                            <span>Keyboard Shortcuts</span>
                        </div>
                        <div class="keybindings-actions">
                            <button class="keybindings-btn" data-action="reset" title="Reset to Defaults">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="1 4 1 10 7 10"/>
                                    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                                </svg>
                                Reset All
                            </button>
                            <button class="keybindings-btn primary" data-action="save" title="Save Changes">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                    <polyline points="17 21 17 13 7 13 7 21"/>
                                    <polyline points="7 3 7 8 15 8"/>
                                </svg>
                                Save
                            </button>
                            <button class="keybindings-close" data-action="close" title="Close (Escape)">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="keybindings-search">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input type="text"
                               class="keybindings-search-input"
                               placeholder="Search shortcuts..."
                               autocomplete="off">
                    </div>

                    <div class="keybindings-body">
                        <div class="keybindings-list"></div>
                    </div>

                    <div class="keybindings-footer">
                        <div class="keybindings-help">
                            <span>Click on a shortcut to edit</span>
                            <span>Press <kbd>Escape</kbd> to cancel editing</span>
                        </div>
                    </div>
                </div>

                <!-- Recording overlay -->
                <div class="keybindings-recording hidden">
                    <div class="recording-content">
                        <div class="recording-title">Press your new shortcut</div>
                        <div class="recording-keys"></div>
                        <div class="recording-hint">Press Escape to cancel, Enter to confirm</div>
                    </div>
                </div>
            `;

      document.body.appendChild(editor);
      this.container = editor;

      this.bindEvents();
      this.addStyles();
      this.renderBindings();
    }

    addStyles() {
      if (document.getElementById("bael-keybindings-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-keybindings-styles";
      styles.textContent = `
                .bael-keybindings {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10002;
                    display: none;
                    align-items: center;
                    justify-content: center;
                }

                .bael-keybindings.open {
                    display: flex;
                }

                .keybindings-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(4px);
                }

                .keybindings-modal {
                    position: relative;
                    width: 90%;
                    max-width: 800px;
                    max-height: 80vh;
                    background: var(--bael-bg-secondary, #12121a);
                    border-radius: 16px;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    animation: modalIn 0.3s ease;
                }

                @keyframes modalIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                .keybindings-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .keybindings-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .keybindings-actions {
                    display: flex;
                    gap: 8px;
                }

                .keybindings-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 14px;
                    border: none;
                    border-radius: 8px;
                    background: var(--bael-bg-tertiary, #1a1a25);
                    color: var(--bael-text-secondary, #888);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .keybindings-btn:hover {
                    background: var(--bael-bg-primary, #0a0a0f);
                    color: var(--bael-text-primary, #fff);
                }

                .keybindings-btn.primary {
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .keybindings-btn.primary:hover {
                    background: var(--bael-accent-light, #ff4d7a);
                }

                .keybindings-close {
                    width: 36px;
                    height: 36px;
                    border: none;
                    border-radius: 8px;
                    background: transparent;
                    color: var(--bael-text-secondary, #888);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .keybindings-close:hover {
                    background: #ff4444;
                    color: #fff;
                }

                .keybindings-search {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 20px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .keybindings-search svg {
                    color: var(--bael-text-muted, #666);
                }

                .keybindings-search-input {
                    flex: 1;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-primary, #fff);
                    font-size: 14px;
                    outline: none;
                }

                .keybindings-search-input::placeholder {
                    color: var(--bael-text-muted, #666);
                }

                .keybindings-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px 0;
                }

                .keybindings-list {
                    display: flex;
                    flex-direction: column;
                }

                .keybindings-category {
                    padding: 8px 20px;
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--bael-accent, #ff3366);
                    background: var(--bael-bg-tertiary, #1a1a25);
                    position: sticky;
                    top: 0;
                    z-index: 1;
                }

                .keybinding-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 20px;
                    border-bottom: 1px solid var(--bael-border-dim, #1a1a25);
                    cursor: pointer;
                    transition: background 0.2s ease;
                }

                .keybinding-item:hover {
                    background: var(--bael-bg-tertiary, #1a1a25);
                }

                .keybinding-item.modified {
                    border-left: 3px solid var(--bael-accent, #ff3366);
                }

                .keybinding-item.editing {
                    background: var(--bael-accent-dim, rgba(255, 51, 102, 0.1));
                }

                .keybinding-item.hidden {
                    display: none;
                }

                .keybinding-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .keybinding-name {
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--bael-text-primary, #fff);
                }

                .keybinding-id {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                    font-family: monospace;
                }

                .keybinding-keys {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .key-badge {
                    padding: 4px 8px;
                    border-radius: 6px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    min-width: 24px;
                    text-align: center;
                }

                .key-badge.modifier {
                    background: var(--bael-accent-dim, rgba(255, 51, 102, 0.2));
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-accent, #ff3366);
                }

                .key-plus {
                    color: var(--bael-text-muted, #666);
                    font-size: 11px;
                }

                .keybinding-reset {
                    width: 28px;
                    height: 28px;
                    border: none;
                    border-radius: 6px;
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: all 0.2s ease;
                    margin-left: 8px;
                }

                .keybinding-item.modified:hover .keybinding-reset {
                    opacity: 1;
                }

                .keybinding-reset:hover {
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .keybindings-footer {
                    padding: 12px 20px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                }

                .keybindings-help {
                    display: flex;
                    gap: 20px;
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                }

                .keybindings-help kbd {
                    padding: 2px 6px;
                    border-radius: 4px;
                    background: var(--bael-bg-tertiary, #1a1a25);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    font-size: 10px;
                    font-family: inherit;
                }

                /* Recording overlay */
                .keybindings-recording {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10003;
                }

                .keybindings-recording.hidden {
                    display: none;
                }

                .recording-content {
                    text-align: center;
                }

                .recording-title {
                    font-size: 24px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 24px;
                }

                .recording-keys {
                    display: flex;
                    gap: 8px;
                    justify-content: center;
                    min-height: 48px;
                    margin-bottom: 24px;
                }

                .recording-keys .key-badge {
                    padding: 12px 20px;
                    font-size: 18px;
                    animation: keyPulse 0.5s ease;
                }

                @keyframes keyPulse {
                    0% {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    50% {
                        transform: scale(1.1);
                    }
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                .recording-hint {
                    font-size: 14px;
                    color: var(--bael-text-muted, #666);
                }

                /* Conflict warning */
                .conflict-warning {
                    margin-top: 16px;
                    padding: 10px 16px;
                    border-radius: 8px;
                    background: rgba(255, 170, 0, 0.1);
                    border: 1px solid #ffaa00;
                    color: #ffaa00;
                    font-size: 13px;
                }
            `;
      document.head.appendChild(styles);
    }

    bindEvents() {
      // Close
      this.container
        .querySelector(".keybindings-overlay")
        .addEventListener("click", () => this.close());
      this.container
        .querySelector('[data-action="close"]')
        .addEventListener("click", () => this.close());

      // Actions
      this.container
        .querySelector('[data-action="reset"]')
        .addEventListener("click", () => this.resetAll());
      this.container
        .querySelector('[data-action="save"]')
        .addEventListener("click", () => this.save());

      // Search
      this.container
        .querySelector(".keybindings-search-input")
        .addEventListener("input", (e) => {
          this.filterBindings(e.target.value);
        });

      // Escape to close
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen && !this.editingBinding) {
          this.close();
        }
      });
    }

    renderBindings() {
      const container = this.container.querySelector(".keybindings-list");
      const categories = {};

      // Group by category
      Object.entries(this.activeBindings).forEach(([id, binding]) => {
        const category = binding.category || "Other";
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push({ id, ...binding });
      });

      // Render
      let html = "";
      Object.entries(categories)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .forEach(([category, bindings]) => {
          html += `<div class="keybindings-category">${category}</div>`;
          bindings.forEach((binding) => {
            const isModified = this.customBindings[binding.id] !== undefined;
            html += `
                        <div class="keybinding-item ${isModified ? "modified" : ""}"
                             data-id="${binding.id}"
                             data-description="${binding.description.toLowerCase()}">
                            <div class="keybinding-info">
                                <div class="keybinding-name">${binding.description}</div>
                                <div class="keybinding-id">${binding.id}</div>
                            </div>
                            <div class="keybinding-keys">
                                ${this.renderKeys(binding.keys)}
                                ${
                                  isModified
                                    ? `
                                    <button class="keybinding-reset" data-reset="${binding.id}" title="Reset to default">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="1 4 1 10 7 10"/>
                                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                                        </svg>
                                    </button>
                                `
                                    : ""
                                }
                            </div>
                        </div>
                    `;
          });
        });

      container.innerHTML = html;

      // Bind click events
      container.querySelectorAll(".keybinding-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          if (!e.target.closest(".keybinding-reset")) {
            this.startRecording(item.dataset.id);
          }
        });
      });

      container.querySelectorAll(".keybinding-reset").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.resetBinding(btn.dataset.reset);
        });
      });
    }

    renderKeys(keys) {
      const modifiers = ["Ctrl", "Alt", "Shift", "Meta", "Cmd"];
      return keys
        .map((key, index) => {
          const isModifier = modifiers.includes(key);
          const displayKey = key === "Meta" ? "⌘" : key;
          const html = `<span class="key-badge ${isModifier ? "modifier" : ""}">${displayKey}</span>`;
          if (index < keys.length - 1) {
            return html + '<span class="key-plus">+</span>';
          }
          return html;
        })
        .join("");
    }

    filterBindings(query) {
      const items = this.container.querySelectorAll(".keybinding-item");
      const queryLower = query.toLowerCase();

      items.forEach((item) => {
        const description = item.dataset.description;
        const id = item.dataset.id;
        const matches =
          description.includes(queryLower) || id.includes(queryLower);
        item.classList.toggle("hidden", !matches);
      });

      // Hide empty categories
      const categories = this.container.querySelectorAll(
        ".keybindings-category",
      );
      categories.forEach((cat) => {
        let nextEl = cat.nextElementSibling;
        let hasVisible = false;
        while (nextEl && !nextEl.classList.contains("keybindings-category")) {
          if (!nextEl.classList.contains("hidden")) {
            hasVisible = true;
            break;
          }
          nextEl = nextEl.nextElementSibling;
        }
        cat.style.display = hasVisible ? "" : "none";
      });
    }

    startRecording(bindingId) {
      this.editingBinding = bindingId;
      const recordingEl = this.container.querySelector(
        ".keybindings-recording",
      );
      const keysEl = recordingEl.querySelector(".recording-keys");

      recordingEl.classList.remove("hidden");
      keysEl.innerHTML = "";

      // Highlight the item being edited
      this.container.querySelectorAll(".keybinding-item").forEach((item) => {
        item.classList.toggle("editing", item.dataset.id === bindingId);
      });

      // Listen for key presses
      this.recordingKeys = [];
      this.recordingHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.key === "Escape") {
          this.cancelRecording();
          return;
        }

        if (e.key === "Enter" && this.recordingKeys.length > 0) {
          this.finishRecording();
          return;
        }

        // Build key combination
        this.recordingKeys = [];
        if (e.ctrlKey || e.metaKey) this.recordingKeys.push("Ctrl");
        if (e.altKey) this.recordingKeys.push("Alt");
        if (e.shiftKey) this.recordingKeys.push("Shift");

        // Add the actual key if it's not a modifier
        const key = e.key;
        if (!["Control", "Alt", "Shift", "Meta"].includes(key)) {
          // Normalize key name
          let normalizedKey = key.length === 1 ? key.toUpperCase() : key;
          if (key === " ") normalizedKey = "Space";
          this.recordingKeys.push(normalizedKey);
        }

        keysEl.innerHTML = this.renderKeys(this.recordingKeys);

        // Check for conflicts
        this.checkConflicts(this.recordingKeys);
      };

      document.addEventListener("keydown", this.recordingHandler, true);
    }

    checkConflicts(keys) {
      const keysStr = keys.join("+");
      const recordingEl = this.container.querySelector(
        ".keybindings-recording",
      );

      // Remove existing warning
      const existingWarning = recordingEl.querySelector(".conflict-warning");
      if (existingWarning) existingWarning.remove();

      // Find conflicts
      for (const [id, binding] of Object.entries(this.activeBindings)) {
        if (id !== this.editingBinding && binding.keys.join("+") === keysStr) {
          const warning = document.createElement("div");
          warning.className = "conflict-warning";
          warning.textContent = `⚠️ This shortcut is already used by "${binding.description}"`;
          recordingEl.querySelector(".recording-content").appendChild(warning);
          break;
        }
      }
    }

    finishRecording() {
      if (this.recordingKeys.length > 0) {
        this.customBindings[this.editingBinding] = {
          ...this.activeBindings[this.editingBinding],
          keys: [...this.recordingKeys],
        };
        this.activeBindings = this.mergeBindings();
        this.renderBindings();
      }
      this.cancelRecording();
    }

    cancelRecording() {
      document.removeEventListener("keydown", this.recordingHandler, true);
      this.editingBinding = null;
      this.recordingKeys = [];

      this.container
        .querySelector(".keybindings-recording")
        .classList.add("hidden");
      this.container.querySelectorAll(".keybinding-item").forEach((item) => {
        item.classList.remove("editing");
      });
    }

    resetBinding(bindingId) {
      delete this.customBindings[bindingId];
      this.activeBindings = this.mergeBindings();
      this.renderBindings();

      if (window.Bael?.notifications) {
        window.Bael.notifications.info(
          `Reset "${this.defaultBindings[bindingId]?.description}" to default`,
        );
      }
    }

    resetAll() {
      if (confirm("Reset all keyboard shortcuts to defaults?")) {
        this.customBindings = {};
        this.activeBindings = this.mergeBindings();
        this.renderBindings();
        this.saveCustomBindings();

        if (window.Bael?.notifications) {
          window.Bael.notifications.success("All shortcuts reset to defaults");
        }
      }
    }

    save() {
      this.saveCustomBindings();
      this.applyBindings();

      if (window.Bael?.notifications) {
        window.Bael.notifications.success("Keyboard shortcuts saved");
      }

      this.close();
    }

    applyBindings() {
      // Emit event for other components to update
      window.dispatchEvent(
        new CustomEvent("bael:keybindings:changed", {
          detail: { bindings: this.activeBindings },
        }),
      );
    }

    mergeBindings() {
      const merged = { ...this.defaultBindings };

      for (const [id, binding] of Object.entries(this.customBindings)) {
        if (merged[id]) {
          merged[id] = { ...merged[id], ...binding };
        }
      }

      return merged;
    }

    saveCustomBindings() {
      try {
        localStorage.setItem(
          "bael-keybindings",
          JSON.stringify(this.customBindings),
        );
      } catch (e) {}
    }

    loadCustomBindings() {
      try {
        return JSON.parse(localStorage.getItem("bael-keybindings")) || {};
      } catch (e) {
        return {};
      }
    }

    setupGlobalHandler() {
      // Global keybinding handler that respects custom bindings
      document.addEventListener("keydown", (e) => {
        // Don't trigger in input fields unless it's a known shortcut
        if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
          return;
        }

        const keys = [];
        if (e.ctrlKey || e.metaKey) keys.push("Ctrl");
        if (e.altKey) keys.push("Alt");
        if (e.shiftKey) keys.push("Shift");

        const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
        if (!["Control", "Alt", "Shift", "Meta"].includes(e.key)) {
          keys.push(key);
        }

        const keysStr = keys.join("+");

        // Find matching binding
        for (const [id, binding] of Object.entries(this.activeBindings)) {
          if (binding.keys.join("+") === keysStr) {
            // Emit event for the binding
            const event = new CustomEvent(`bael:shortcut:${id}`, {
              detail: { keys, binding },
            });
            window.dispatchEvent(event);
            break;
          }
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
      this.isOpen = true;
      this.container.classList.add("open");
      this.renderBindings();

      setTimeout(() => {
        this.container.querySelector(".keybindings-search-input").focus();
      }, 100);
    }

    close() {
      if (this.editingBinding) {
        this.cancelRecording();
      }
      this.isOpen = false;
      this.container.classList.remove("open");
    }

    getBinding(id) {
      return this.activeBindings[id];
    }

    getShortcutString(id) {
      const binding = this.activeBindings[id];
      if (!binding) return "";
      return binding.keys.join("+");
    }
  }

  // Initialize
  window.BaelKeybindings = new BaelKeybindings();

  // Register with command palette
  if (window.BaelCommandPalette) {
    window.BaelCommandPalette.registerCommand({
      id: "keybindings:open",
      title: "Open Keyboard Shortcuts",
      category: "Settings",
      handler: () => window.BaelKeybindings.toggle(),
    });
  }
})();
