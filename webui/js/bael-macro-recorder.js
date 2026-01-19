/**
 * BAEL - LORD OF ALL
 * Macro Recorder - Automate repetitive tasks
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelMacroRecorder {
    constructor() {
      this.panel = null;
      this.isOpen = false;
      this.isRecording = false;
      this.isPlaying = false;
      this.currentMacro = null;
      this.macros = [];
      this.recordedActions = [];
      this.playbackIndex = 0;
      this.playbackDelay = 500;
      this.init();
    }

    init() {
      this.createPanel();
      this.loadMacros();
      this.bindEvents();
      console.log("🎬 Bael Macro Recorder initialized");
    }

    createPanel() {
      const panel = document.createElement("div");
      panel.id = "bael-macro-recorder";
      panel.className = "bael-macro-recorder";
      panel.innerHTML = `
                <div class="macro-header">
                    <div class="macro-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <circle cx="12" cy="12" r="4" fill="currentColor"/>
                        </svg>
                        <span>Macro Recorder</span>
                    </div>
                    <div class="macro-header-actions">
                        <button class="macro-btn icon" id="macro-help" title="Help">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                                <line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                        </button>
                        <button class="macro-btn icon" id="macro-close" title="Close">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="macro-tabs">
                    <button class="macro-tab active" data-tab="library">Library</button>
                    <button class="macro-tab" data-tab="record">Record</button>
                    <button class="macro-tab" data-tab="editor">Editor</button>
                </div>

                <div class="macro-content">
                    <!-- Library Tab -->
                    <div class="macro-pane active" data-pane="library">
                        <div class="macro-search">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"/>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                            <input type="text" placeholder="Search macros..." id="macro-search-input">
                        </div>
                        <div class="macro-list" id="macro-list"></div>
                        <div class="macro-empty" id="macro-empty">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                            </svg>
                            <p>No macros yet</p>
                            <span>Start recording to create your first macro</span>
                        </div>
                    </div>

                    <!-- Record Tab -->
                    <div class="macro-pane" data-pane="record">
                        <div class="record-status" id="record-status">
                            <div class="record-indicator">
                                <div class="record-dot"></div>
                                <span>Ready to Record</span>
                            </div>
                            <div class="record-time" id="record-time">00:00</div>
                        </div>
                        <div class="record-actions-list" id="record-actions-list">
                            <div class="record-placeholder">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polygon points="5 3 19 12 5 21 5 3"/>
                                </svg>
                                <p>Press Record to start capturing actions</p>
                            </div>
                        </div>
                        <div class="record-controls">
                            <button class="record-btn primary" id="record-start">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <circle cx="12" cy="12" r="4" fill="currentColor"/>
                                </svg>
                                <span>Start Recording</span>
                            </button>
                            <button class="record-btn" id="record-stop" disabled>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="6" y="6" width="12" height="12" rx="2"/>
                                </svg>
                                <span>Stop</span>
                            </button>
                            <button class="record-btn" id="record-clear">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                                <span>Clear</span>
                            </button>
                        </div>
                    </div>

                    <!-- Editor Tab -->
                    <div class="macro-pane" data-pane="editor">
                        <div class="editor-form">
                            <div class="form-group">
                                <label>Macro Name</label>
                                <input type="text" id="macro-name" placeholder="My Awesome Macro">
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea id="macro-description" placeholder="What does this macro do?"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Keyboard Shortcut</label>
                                <div class="shortcut-input">
                                    <input type="text" id="macro-shortcut" placeholder="Click to record..." readonly>
                                    <button class="clear-shortcut" id="clear-shortcut">×</button>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Playback Speed</label>
                                <div class="speed-slider">
                                    <input type="range" id="macro-speed" min="100" max="2000" value="500">
                                    <span id="speed-value">500ms</span>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>Actions</label>
                                <div class="actions-editor" id="actions-editor">
                                    <div class="action-placeholder">No actions recorded</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="macro-footer">
                    <button class="macro-btn secondary" id="macro-import">Import</button>
                    <button class="macro-btn secondary" id="macro-export">Export</button>
                    <button class="macro-btn primary" id="macro-save">Save Macro</button>
                </div>
            `;
      document.body.appendChild(panel);
      this.panel = panel;
      this.addStyles();
    }

    addStyles() {
      if (document.getElementById("bael-macro-recorder-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-macro-recorder-styles";
      styles.textContent = `
                .bael-macro-recorder {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 500px;
                    max-width: 90vw;
                    max-height: 80vh;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    box-shadow: 0 25px 100px rgba(0, 0, 0, 0.6);
                    z-index: 100001;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .bael-macro-recorder.open {
                    display: flex;
                    animation: macroSlideIn 0.3s ease;
                }

                @keyframes macroSlideIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }

                .macro-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .macro-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .macro-title svg {
                    width: 20px;
                    height: 20px;
                    color: var(--bael-accent, #ff3366);
                }

                .macro-header-actions {
                    display: flex;
                    gap: 8px;
                }

                .macro-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    background: transparent;
                    color: var(--bael-text-secondary, #888);
                    font-size: 13px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .macro-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                .macro-btn.primary {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .macro-btn.primary:hover {
                    filter: brightness(1.1);
                }

                .macro-btn.icon {
                    width: 32px;
                    height: 32px;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .macro-btn svg {
                    width: 16px;
                    height: 16px;
                }

                .macro-tabs {
                    display: flex;
                    padding: 8px 12px;
                    gap: 4px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .macro-tab {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-secondary, #888);
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                }

                .macro-tab:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .macro-tab.active {
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .macro-content {
                    flex: 1;
                    overflow: hidden;
                    position: relative;
                }

                .macro-pane {
                    position: absolute;
                    inset: 0;
                    overflow-y: auto;
                    padding: 16px;
                    display: none;
                }

                .macro-pane.active {
                    display: block;
                }

                /* Library */
                .macro-search {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    margin-bottom: 16px;
                }

                .macro-search svg {
                    width: 18px;
                    height: 18px;
                    color: var(--bael-text-muted, #666);
                }

                .macro-search input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    font-size: 14px;
                    color: var(--bael-text-primary, #fff);
                }

                .macro-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .macro-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .macro-item:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .macro-item-icon {
                    width: 40px;
                    height: 40px;
                    background: rgba(255, 51, 102, 0.1);
                    color: var(--bael-accent, #ff3366);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .macro-item-icon svg {
                    width: 20px;
                    height: 20px;
                }

                .macro-item-content {
                    flex: 1;
                }

                .macro-item-name {
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--bael-text-primary, #fff);
                }

                .macro-item-meta {
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                    margin-top: 2px;
                }

                .macro-item-actions {
                    display: flex;
                    gap: 4px;
                }

                .macro-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    text-align: center;
                    color: var(--bael-text-muted, #666);
                }

                .macro-empty svg {
                    width: 48px;
                    height: 48px;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }

                .macro-empty p {
                    font-size: 14px;
                    margin-bottom: 4px;
                }

                .macro-empty span {
                    font-size: 12px;
                }

                /* Record Tab */
                .record-status {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-radius: 10px;
                    margin-bottom: 16px;
                }

                .record-indicator {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--bael-text-primary, #fff);
                }

                .record-dot {
                    width: 12px;
                    height: 12px;
                    background: var(--bael-text-muted, #666);
                    border-radius: 50%;
                    transition: all 0.3s ease;
                }

                .recording .record-dot {
                    background: #f44336;
                    animation: recordPulse 1s ease-in-out infinite;
                }

                @keyframes recordPulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.5); }
                    50% { box-shadow: 0 0 0 8px rgba(244, 67, 54, 0); }
                }

                .record-time {
                    font-family: 'SF Mono', monospace;
                    font-size: 20px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .record-actions-list {
                    min-height: 200px;
                    max-height: 300px;
                    overflow-y: auto;
                    background: var(--bael-bg-tertiary, #1a1a24);
                    border-radius: 10px;
                    padding: 12px;
                    margin-bottom: 16px;
                }

                .record-placeholder {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 180px;
                    color: var(--bael-text-muted, #666);
                    text-align: center;
                }

                .record-placeholder svg {
                    width: 36px;
                    height: 36px;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }

                .recorded-action {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-radius: 8px;
                    margin-bottom: 8px;
                    font-size: 13px;
                }

                .action-number {
                    width: 24px;
                    height: 24px;
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    font-weight: 600;
                }

                .action-type {
                    color: var(--bael-accent, #ff3366);
                    font-weight: 500;
                }

                .action-value {
                    flex: 1;
                    color: var(--bael-text-secondary, #888);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .record-controls {
                    display: flex;
                    gap: 8px;
                }

                .record-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    background: transparent;
                    color: var(--bael-text-secondary, #888);
                    font-size: 13px;
                    font-weight: 500;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .record-btn:hover:not(:disabled) {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                .record-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .record-btn.primary {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .record-btn svg {
                    width: 16px;
                    height: 16px;
                }

                /* Editor Tab */
                .editor-form {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group label {
                    font-size: 12px;
                    font-weight: 500;
                    color: var(--bael-text-muted, #666);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .form-group input,
                .form-group textarea {
                    padding: 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.2s ease;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    border-color: var(--bael-accent, #ff3366);
                }

                .form-group textarea {
                    resize: vertical;
                    min-height: 80px;
                }

                .shortcut-input {
                    display: flex;
                    gap: 8px;
                }

                .shortcut-input input {
                    flex: 1;
                    cursor: pointer;
                }

                .clear-shortcut {
                    width: 40px;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 18px;
                }

                .speed-slider {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .speed-slider input[type="range"] {
                    flex: 1;
                    -webkit-appearance: none;
                    background: var(--bael-border, #2a2a3a);
                    height: 6px;
                    border-radius: 3px;
                }

                .speed-slider input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 18px;
                    height: 18px;
                    background: var(--bael-accent, #ff3366);
                    border-radius: 50%;
                    cursor: pointer;
                }

                .speed-slider span {
                    font-family: monospace;
                    font-size: 13px;
                    color: var(--bael-text-secondary, #888);
                    min-width: 60px;
                }

                .actions-editor {
                    max-height: 200px;
                    overflow-y: auto;
                    background: var(--bael-bg-tertiary, #1a1a24);
                    border-radius: 8px;
                    padding: 12px;
                }

                .action-placeholder {
                    text-align: center;
                    color: var(--bael-text-muted, #666);
                    padding: 20px;
                    font-size: 13px;
                }

                .macro-footer {
                    display: flex;
                    gap: 8px;
                    padding: 16px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                }

                .macro-footer .macro-btn {
                    flex: 1;
                }

                .macro-footer .macro-btn.secondary {
                    flex: 0 0 auto;
                }
            `;
      document.head.appendChild(styles);
    }

    bindEvents() {
      // Close button
      this.panel
        .querySelector("#macro-close")
        .addEventListener("click", () => this.close());

      // Tabs
      this.panel.querySelectorAll(".macro-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          this.panel
            .querySelectorAll(".macro-tab")
            .forEach((t) => t.classList.remove("active"));
          this.panel
            .querySelectorAll(".macro-pane")
            .forEach((p) => p.classList.remove("active"));
          tab.classList.add("active");
          this.panel
            .querySelector(`[data-pane="${tab.dataset.tab}"]`)
            .classList.add("active");
        });
      });

      // Recording controls
      this.panel
        .querySelector("#record-start")
        .addEventListener("click", () => this.startRecording());
      this.panel
        .querySelector("#record-stop")
        .addEventListener("click", () => this.stopRecording());
      this.panel
        .querySelector("#record-clear")
        .addEventListener("click", () => this.clearRecording());

      // Editor
      this.panel
        .querySelector("#macro-speed")
        .addEventListener("input", (e) => {
          this.panel.querySelector("#speed-value").textContent =
            e.target.value + "ms";
          this.playbackDelay = parseInt(e.target.value);
        });

      this.panel
        .querySelector("#macro-shortcut")
        .addEventListener("click", (e) => {
          e.target.placeholder = "Press shortcut...";
          this.recordShortcut = true;
        });

      this.panel
        .querySelector("#clear-shortcut")
        .addEventListener("click", () => {
          this.panel.querySelector("#macro-shortcut").value = "";
        });

      // Save button
      this.panel
        .querySelector("#macro-save")
        .addEventListener("click", () => this.saveMacro());

      // Import/Export
      this.panel
        .querySelector("#macro-import")
        .addEventListener("click", () => this.importMacros());
      this.panel
        .querySelector("#macro-export")
        .addEventListener("click", () => this.exportMacros());

      // Search
      this.panel
        .querySelector("#macro-search-input")
        .addEventListener("input", (e) => {
          this.filterMacros(e.target.value);
        });

      // Global keyboard listener for shortcut recording
      document.addEventListener("keydown", (e) => {
        if (this.recordShortcut) {
          e.preventDefault();
          const shortcut = this.buildShortcutString(e);
          this.panel.querySelector("#macro-shortcut").value = shortcut;
          this.panel.querySelector("#macro-shortcut").placeholder =
            "Click to record...";
          this.recordShortcut = false;
        }

        // ESC to close
        if (e.key === "Escape" && this.isOpen) {
          this.close();
        }
      });

      // Recording event listeners
      this.setupActionListeners();
    }

    setupActionListeners() {
      // Listen for input events
      document.addEventListener(
        "keypress",
        (e) => {
          if (this.isRecording && !this.panel.contains(e.target)) {
            this.recordAction({
              type: "keypress",
              key: e.key,
              code: e.code,
              target: this.getTargetSelector(e.target),
            });
          }
        },
        true,
      );

      // Listen for click events
      document.addEventListener(
        "click",
        (e) => {
          if (this.isRecording && !this.panel.contains(e.target)) {
            this.recordAction({
              type: "click",
              target: this.getTargetSelector(e.target),
              x: e.clientX,
              y: e.clientY,
            });
          }
        },
        true,
      );

      // Listen for input changes
      document.addEventListener(
        "change",
        (e) => {
          if (this.isRecording && !this.panel.contains(e.target)) {
            this.recordAction({
              type: "change",
              target: this.getTargetSelector(e.target),
              value: e.target.value,
            });
          }
        },
        true,
      );
    }

    getTargetSelector(element) {
      if (element.id) return `#${element.id}`;
      if (element.className) {
        const classes = element.className
          .split(" ")
          .filter((c) => c)
          .join(".");
        if (classes) return `.${classes}`;
      }
      return element.tagName.toLowerCase();
    }

    buildShortcutString(e) {
      const parts = [];
      if (e.ctrlKey || e.metaKey) parts.push("Ctrl");
      if (e.altKey) parts.push("Alt");
      if (e.shiftKey) parts.push("Shift");
      if (e.key && !["Control", "Alt", "Shift", "Meta"].includes(e.key)) {
        parts.push(e.key.toUpperCase());
      }
      return parts.join("+");
    }

    startRecording() {
      this.isRecording = true;
      this.recordedActions = [];
      this.recordStartTime = Date.now();

      const status = this.panel.querySelector("#record-status");
      status.classList.add("recording");
      status.querySelector("span").textContent = "Recording...";

      this.panel.querySelector("#record-start").disabled = true;
      this.panel.querySelector("#record-stop").disabled = false;

      // Clear placeholder
      this.panel.querySelector("#record-actions-list").innerHTML = "";

      // Start timer
      this.recordTimerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - this.recordStartTime) / 1000);
        const mins = Math.floor(elapsed / 60)
          .toString()
          .padStart(2, "0");
        const secs = (elapsed % 60).toString().padStart(2, "0");
        this.panel.querySelector("#record-time").textContent =
          `${mins}:${secs}`;
      }, 1000);
    }

    stopRecording() {
      this.isRecording = false;

      if (this.recordTimerInterval) {
        clearInterval(this.recordTimerInterval);
      }

      const status = this.panel.querySelector("#record-status");
      status.classList.remove("recording");
      status.querySelector("span").textContent = "Recording Complete";

      this.panel.querySelector("#record-start").disabled = false;
      this.panel.querySelector("#record-stop").disabled = true;

      // Switch to editor tab with recorded actions
      if (this.recordedActions.length > 0) {
        this.switchToEditor();
      }
    }

    clearRecording() {
      this.recordedActions = [];
      this.panel.querySelector("#record-actions-list").innerHTML = `
                <div class="record-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    <p>Press Record to start capturing actions</p>
                </div>
            `;
      this.panel.querySelector("#record-time").textContent = "00:00";
    }

    recordAction(action) {
      action.timestamp = Date.now() - this.recordStartTime;
      this.recordedActions.push(action);
      this.renderRecordedAction(action, this.recordedActions.length);
    }

    renderRecordedAction(action, index) {
      const list = this.panel.querySelector("#record-actions-list");

      // Remove placeholder if present
      const placeholder = list.querySelector(".record-placeholder");
      if (placeholder) placeholder.remove();

      const item = document.createElement("div");
      item.className = "recorded-action";
      item.innerHTML = `
                <div class="action-number">${index}</div>
                <div class="action-type">${action.type}</div>
                <div class="action-value">${this.getActionDescription(action)}</div>
            `;
      list.appendChild(item);
      list.scrollTop = list.scrollHeight;
    }

    getActionDescription(action) {
      switch (action.type) {
        case "click":
          return `Click on ${action.target}`;
        case "keypress":
          return `Press "${action.key}"`;
        case "change":
          return `Set ${action.target} to "${action.value?.substring(0, 30)}..."`;
        default:
          return JSON.stringify(action);
      }
    }

    switchToEditor() {
      this.panel
        .querySelectorAll(".macro-tab")
        .forEach((t) => t.classList.remove("active"));
      this.panel
        .querySelectorAll(".macro-pane")
        .forEach((p) => p.classList.remove("active"));
      this.panel.querySelector('[data-tab="editor"]').classList.add("active");
      this.panel.querySelector('[data-pane="editor"]').classList.add("active");

      // Populate editor
      this.renderActionsEditor();
    }

    renderActionsEditor() {
      const editor = this.panel.querySelector("#actions-editor");

      if (this.recordedActions.length === 0) {
        editor.innerHTML =
          '<div class="action-placeholder">No actions recorded</div>';
        return;
      }

      editor.innerHTML = this.recordedActions
        .map(
          (action, i) => `
                <div class="recorded-action" data-index="${i}">
                    <div class="action-number">${i + 1}</div>
                    <div class="action-type">${action.type}</div>
                    <div class="action-value">${this.getActionDescription(action)}</div>
                </div>
            `,
        )
        .join("");
    }

    saveMacro() {
      const name = this.panel.querySelector("#macro-name").value.trim();
      if (!name) {
        if (window.BaelNotifications) {
          window.BaelNotifications.warning("Please enter a macro name");
        }
        return;
      }

      const macro = {
        id: Date.now().toString(36),
        name,
        description: this.panel.querySelector("#macro-description").value,
        shortcut: this.panel.querySelector("#macro-shortcut").value,
        speed: parseInt(this.panel.querySelector("#macro-speed").value),
        actions: this.recordedActions,
        createdAt: new Date().toISOString(),
      };

      this.macros.push(macro);
      this.saveMacrosToStorage();
      this.renderMacroList();

      // Clear form
      this.panel.querySelector("#macro-name").value = "";
      this.panel.querySelector("#macro-description").value = "";
      this.panel.querySelector("#macro-shortcut").value = "";
      this.recordedActions = [];
      this.renderActionsEditor();

      // Switch to library
      this.panel
        .querySelectorAll(".macro-tab")
        .forEach((t) => t.classList.remove("active"));
      this.panel
        .querySelectorAll(".macro-pane")
        .forEach((p) => p.classList.remove("active"));
      this.panel.querySelector('[data-tab="library"]').classList.add("active");
      this.panel.querySelector('[data-pane="library"]').classList.add("active");

      if (window.BaelNotifications) {
        window.BaelNotifications.success(`Macro "${name}" saved`);
      }
    }

    renderMacroList() {
      const list = this.panel.querySelector("#macro-list");
      const empty = this.panel.querySelector("#macro-empty");

      if (this.macros.length === 0) {
        list.style.display = "none";
        empty.style.display = "flex";
        return;
      }

      list.style.display = "flex";
      empty.style.display = "none";

      list.innerHTML = this.macros
        .map(
          (macro) => `
                <div class="macro-item" data-id="${macro.id}">
                    <div class="macro-item-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                    </div>
                    <div class="macro-item-content">
                        <div class="macro-item-name">${macro.name}</div>
                        <div class="macro-item-meta">${macro.actions.length} actions • ${macro.shortcut || "No shortcut"}</div>
                    </div>
                    <div class="macro-item-actions">
                        <button class="macro-btn icon play-macro" title="Play">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                        </button>
                        <button class="macro-btn icon delete-macro" title="Delete">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `,
        )
        .join("");

      // Bind play/delete handlers
      list.querySelectorAll(".play-macro").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = btn.closest(".macro-item").dataset.id;
          this.playMacro(id);
        });
      });

      list.querySelectorAll(".delete-macro").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = btn.closest(".macro-item").dataset.id;
          this.deleteMacro(id);
        });
      });
    }

    playMacro(id) {
      const macro = this.macros.find((m) => m.id === id);
      if (!macro || macro.actions.length === 0) return;

      this.isPlaying = true;
      this.playbackIndex = 0;
      this.close();

      if (window.BaelNotifications) {
        window.BaelNotifications.info(`Playing macro: ${macro.name}`);
      }

      this.executeNextAction(macro);
    }

    executeNextAction(macro) {
      if (this.playbackIndex >= macro.actions.length) {
        this.isPlaying = false;
        if (window.BaelNotifications) {
          window.BaelNotifications.success("Macro completed");
        }
        return;
      }

      const action = macro.actions[this.playbackIndex];
      this.executeAction(action);
      this.playbackIndex++;

      setTimeout(() => {
        this.executeNextAction(macro);
      }, macro.speed || this.playbackDelay);
    }

    executeAction(action) {
      try {
        switch (action.type) {
          case "click":
            const clickTarget = document.querySelector(action.target);
            if (clickTarget) clickTarget.click();
            break;
          case "keypress":
            const keyTarget = document.activeElement || document.body;
            keyTarget.dispatchEvent(
              new KeyboardEvent("keypress", {
                key: action.key,
                code: action.code,
              }),
            );
            break;
          case "change":
            const changeTarget = document.querySelector(action.target);
            if (changeTarget) {
              changeTarget.value = action.value;
              changeTarget.dispatchEvent(new Event("change"));
            }
            break;
        }
      } catch (e) {
        console.warn("Failed to execute action:", action, e);
      }
    }

    deleteMacro(id) {
      if (!confirm("Delete this macro?")) return;
      this.macros = this.macros.filter((m) => m.id !== id);
      this.saveMacrosToStorage();
      this.renderMacroList();
    }

    filterMacros(query) {
      const items = this.panel.querySelectorAll(".macro-item");
      const lowerQuery = query.toLowerCase();

      items.forEach((item) => {
        const name = item
          .querySelector(".macro-item-name")
          .textContent.toLowerCase();
        item.style.display = name.includes(lowerQuery) ? "flex" : "none";
      });
    }

    saveMacrosToStorage() {
      localStorage.setItem("bael_macros", JSON.stringify(this.macros));
    }

    loadMacros() {
      try {
        const saved = localStorage.getItem("bael_macros");
        if (saved) {
          this.macros = JSON.parse(saved);
          this.renderMacroList();
        }
      } catch (e) {
        console.warn("Failed to load macros:", e);
      }
    }

    importMacros() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const imported = JSON.parse(e.target.result);
            this.macros = [...this.macros, ...imported];
            this.saveMacrosToStorage();
            this.renderMacroList();
            if (window.BaelNotifications) {
              window.BaelNotifications.success(
                `Imported ${imported.length} macros`,
              );
            }
          } catch (err) {
            if (window.BaelNotifications) {
              window.BaelNotifications.error("Failed to import macros");
            }
          }
        };
        reader.readAsText(file);
      };
      input.click();
    }

    exportMacros() {
      const data = JSON.stringify(this.macros, null, 2);
      const blob = new Blob([data], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "bael-macros.json";
      link.click();
    }

    // Public API
    open() {
      this.panel.classList.add("open");
      this.isOpen = true;
      this.renderMacroList();
    }

    close() {
      this.panel.classList.remove("open");
      this.isOpen = false;
      if (this.isRecording) {
        this.stopRecording();
      }
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }
  }

  // Initialize
  window.BaelMacroRecorder = new BaelMacroRecorder();
})();
