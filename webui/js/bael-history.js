/**
 * BAEL - LORD OF ALL
 * Undo/Redo History - Time travel through chat and code changes
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelHistory {
    constructor() {
      this.states = [];
      this.currentIndex = -1;
      this.maxStates = 50;
      this.isRecording = true;
      this.panel = null;
      this.init();
    }

    init() {
      this.loadStates();
      this.addStyles();
      this.createUI();
      this.bindEvents();
      this.hookIntoSystem();
      console.log("⏱️ Bael History initialized");
    }

    loadStates() {
      try {
        const saved = JSON.parse(
          sessionStorage.getItem("bael_history_states") || "[]",
        );
        this.states = saved;
        this.currentIndex = this.states.length - 1;
      } catch (e) {
        this.states = [];
        this.currentIndex = -1;
      }
    }

    saveStates() {
      // Only keep last maxStates
      const toSave = this.states.slice(-this.maxStates);
      sessionStorage.setItem("bael_history_states", JSON.stringify(toSave));
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-history-styles";
      styles.textContent = `
                /* History Panel */
                .bael-history-panel {
                    position: fixed;
                    bottom: 80px;
                    right: 80px;
                    width: 400px;
                    max-height: 500px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100021;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                }

                .bael-history-panel.visible {
                    display: flex;
                    animation: historyAppear 0.2s ease;
                }

                @keyframes historyAppear {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Header */
                .history-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .history-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .history-controls {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .history-btn {
                    width: 32px;
                    height: 32px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    transition: all 0.2s ease;
                }

                .history-btn:hover:not(:disabled) {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: white;
                }

                .history-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .history-close {
                    background: transparent;
                    border: none;
                }

                .history-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                /* Timeline */
                .history-timeline {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px;
                }

                .history-state {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    margin-bottom: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .history-state:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .history-state.current {
                    border-color: var(--bael-accent, #ff3366);
                    background: var(--bael-bg-tertiary, #181820);
                }

                .history-state.past {
                    opacity: 0.6;
                }

                .state-marker {
                    width: 32px;
                    height: 32px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 2px solid var(--bael-border, #2a2a3a);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    flex-shrink: 0;
                }

                .history-state.current .state-marker {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                }

                .state-info {
                    flex: 1;
                    min-width: 0;
                }

                .state-type {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 4px;
                }

                .state-preview {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .state-time {
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                    margin-top: 6px;
                }

                .state-restore {
                    padding: 6px 10px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    font-size: 10px;
                    cursor: pointer;
                    opacity: 0;
                    transition: all 0.2s ease;
                }

                .history-state:hover .state-restore {
                    opacity: 1;
                }

                .state-restore:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: white;
                }

                /* Footer */
                .history-footer {
                    padding: 12px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .history-info {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .history-clear {
                    padding: 6px 12px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    font-size: 11px;
                    cursor: pointer;
                }

                .history-clear:hover {
                    border-color: #f87171;
                    color: #f87171;
                }

                /* Floating indicator */
                .bael-history-indicator {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 25px;
                    padding: 8px 16px;
                    display: none;
                    align-items: center;
                    gap: 12px;
                    z-index: 100020;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
                }

                .bael-history-indicator.visible {
                    display: flex;
                    animation: indicatorSlide 0.3s ease;
                }

                @keyframes indicatorSlide {
                    from { opacity: 0; transform: translateX(-50%) translateY(20px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }

                .indicator-btn {
                    width: 28px;
                    height: 28px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 50%;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                }

                .indicator-btn:hover:not(:disabled) {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: white;
                }

                .indicator-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .indicator-text {
                    font-size: 12px;
                    color: var(--bael-text-primary, #fff);
                }

                .indicator-position {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }
            `;
      document.head.appendChild(styles);
    }

    createUI() {
      // Panel
      const panel = document.createElement("div");
      panel.className = "bael-history-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;

      // Floating indicator
      const indicator = document.createElement("div");
      indicator.className = "bael-history-indicator";
      indicator.innerHTML = `
                <button class="indicator-btn" id="ind-undo" title="Undo (Ctrl+Z)">↩</button>
                <div class="indicator-text">
                    <span id="ind-state">Ready</span>
                    <span class="indicator-position" id="ind-pos"></span>
                </div>
                <button class="indicator-btn" id="ind-redo" title="Redo (Ctrl+Y)">↪</button>
            `;
      document.body.appendChild(indicator);
      this.indicator = indicator;

      this.bindPanelEvents();
    }

    renderPanel() {
      return `
                <div class="history-header">
                    <div class="history-title">
                        <span>⏱️</span>
                        <span>History</span>
                    </div>
                    <div class="history-controls">
                        <button class="history-btn" id="hist-undo" title="Undo (Ctrl+Z)" ${this.currentIndex < 0 ? "disabled" : ""}>↩</button>
                        <button class="history-btn" id="hist-redo" title="Redo (Ctrl+Y)" ${this.currentIndex >= this.states.length - 1 ? "disabled" : ""}>↪</button>
                        <button class="history-btn history-close">×</button>
                    </div>
                </div>

                <div class="history-timeline" id="history-timeline">
                    ${this.renderTimeline()}
                </div>

                <div class="history-footer">
                    <div class="history-info">
                        ${this.states.length} state${this.states.length !== 1 ? "s" : ""} •
                        Position: ${this.currentIndex + 1}/${this.states.length}
                    </div>
                    <button class="history-clear" id="history-clear">Clear History</button>
                </div>
            `;
    }

    renderTimeline() {
      if (this.states.length === 0) {
        return `
                    <div style="text-align: center; padding: 40px; color: var(--bael-text-muted);">
                        <div style="font-size: 36px; margin-bottom: 12px;">⏱️</div>
                        <div>No history yet</div>
                    </div>
                `;
      }

      return this.states
        .map((state, index) => {
          const isCurrent = index === this.currentIndex;
          const isPast = index < this.currentIndex;
          const icon = this.getStateIcon(state.type);
          const time = new Date(state.timestamp).toLocaleTimeString();

          return `
                    <div class="history-state ${isCurrent ? "current" : ""} ${isPast ? "past" : ""}" data-index="${index}">
                        <div class="state-marker">${icon}</div>
                        <div class="state-info">
                            <div class="state-type">${this.getStateLabel(state.type)}</div>
                            <div class="state-preview">${this.escapeHtml(state.preview || "")}</div>
                            <div class="state-time">${time}</div>
                        </div>
                        ${!isCurrent ? '<button class="state-restore">Restore</button>' : ""}
                    </div>
                `;
        })
        .reverse()
        .join("");
    }

    getStateIcon(type) {
      const icons = {
        message: "💬",
        edit: "✏️",
        delete: "🗑️",
        create: "➕",
        settings: "⚙️",
        theme: "🎨",
        code: "💻",
        file: "📄",
        import: "📥",
        export: "📤",
      };
      return icons[type] || "📝";
    }

    getStateLabel(type) {
      const labels = {
        message: "Message Sent",
        edit: "Edit Made",
        delete: "Deleted",
        create: "Created",
        settings: "Settings Changed",
        theme: "Theme Changed",
        code: "Code Executed",
        file: "File Changed",
        import: "Data Imported",
        export: "Data Exported",
      };
      return labels[type] || "Change";
    }

    bindEvents() {
      // Keyboard shortcuts
      document.addEventListener("keydown", (e) => {
        // Ctrl+Z for undo
        if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          this.undo();
        }

        // Ctrl+Y or Ctrl+Shift+Z for redo
        if (
          (e.ctrlKey && e.key === "y") ||
          (e.ctrlKey && e.shiftKey && e.key === "z")
        ) {
          e.preventDefault();
          this.redo();
        }

        // Ctrl+Shift+H to toggle panel
        if (e.ctrlKey && e.shiftKey && e.key === "H") {
          e.preventDefault();
          this.togglePanel();
        }
      });
    }

    bindPanelEvents() {
      this.panel
        .querySelector(".history-close")
        .addEventListener("click", () => this.closePanel());
      this.panel
        .querySelector("#hist-undo")
        .addEventListener("click", () => this.undo());
      this.panel
        .querySelector("#hist-redo")
        .addEventListener("click", () => this.redo());
      this.panel
        .querySelector("#history-clear")
        .addEventListener("click", () => this.clearHistory());

      // State clicks
      this.panel.querySelectorAll(".history-state").forEach((state) => {
        state.addEventListener("click", () => {
          const index = parseInt(state.dataset.index);
          this.goToState(index);
        });
      });

      // Indicator buttons
      this.indicator
        .querySelector("#ind-undo")
        .addEventListener("click", () => this.undo());
      this.indicator
        .querySelector("#ind-redo")
        .addEventListener("click", () => this.redo());
    }

    hookIntoSystem() {
      // Listen for various events to record state
      window.addEventListener("bael-state-change", (e) => {
        if (this.isRecording) {
          this.recordState(e.detail);
        }
      });

      // Monitor DOM changes (messages, etc.)
      const observer = new MutationObserver((mutations) => {
        // Check for significant changes
      });
    }

    recordState(data) {
      // Remove any states after current index (for redo branch)
      this.states = this.states.slice(0, this.currentIndex + 1);

      const state = {
        id: Date.now(),
        timestamp: Date.now(),
        type: data.type || "edit",
        preview: data.preview || "",
        data: data.data || null,
      };

      this.states.push(state);
      this.currentIndex = this.states.length - 1;

      // Limit states
      if (this.states.length > this.maxStates) {
        this.states.shift();
        this.currentIndex--;
      }

      this.saveStates();
      this.updateUI();
    }

    undo() {
      if (this.currentIndex < 0) {
        if (window.BaelNotifications) {
          window.BaelNotifications.info("Nothing to undo");
        }
        return;
      }

      this.currentIndex--;
      this.applyState(this.currentIndex);
      this.updateUI();
      this.showIndicator("Undo");
    }

    redo() {
      if (this.currentIndex >= this.states.length - 1) {
        if (window.BaelNotifications) {
          window.BaelNotifications.info("Nothing to redo");
        }
        return;
      }

      this.currentIndex++;
      this.applyState(this.currentIndex);
      this.updateUI();
      this.showIndicator("Redo");
    }

    goToState(index) {
      if (index < 0 || index >= this.states.length) return;

      this.currentIndex = index;
      this.applyState(index);
      this.updateUI();
      this.showIndicator(`State ${index + 1}`);
    }

    applyState(index) {
      const state = this.states[index];
      if (!state) return;

      // Dispatch event for other systems to handle
      window.dispatchEvent(
        new CustomEvent("bael-restore-state", {
          detail: state,
        }),
      );
    }

    updateUI() {
      // Update panel
      if (this.panel.classList.contains("visible")) {
        this.panel.innerHTML = this.renderPanel();
        this.bindPanelEvents();
      }

      // Update indicator
      this.indicator.querySelector("#ind-undo").disabled =
        this.currentIndex < 0;
      this.indicator.querySelector("#ind-redo").disabled =
        this.currentIndex >= this.states.length - 1;
      this.indicator.querySelector("#ind-pos").textContent =
        this.states.length > 0
          ? `${this.currentIndex + 1}/${this.states.length}`
          : "";
    }

    showIndicator(text) {
      this.indicator.querySelector("#ind-state").textContent = text;
      this.indicator.classList.add("visible");

      clearTimeout(this.indicatorTimeout);
      this.indicatorTimeout = setTimeout(() => {
        this.indicator.classList.remove("visible");
      }, 2000);
    }

    clearHistory() {
      if (!confirm("Clear all history? This cannot be undone.")) return;

      this.states = [];
      this.currentIndex = -1;
      this.saveStates();
      this.updateUI();

      if (window.BaelNotifications) {
        window.BaelNotifications.info("History cleared");
      }
    }

    togglePanel() {
      this.panel.classList.toggle("visible");
      if (this.panel.classList.contains("visible")) {
        this.panel.innerHTML = this.renderPanel();
        this.bindPanelEvents();
      }
    }

    closePanel() {
      this.panel.classList.remove("visible");
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    // Public API
    record(type, preview, data = null) {
      this.recordState({ type, preview, data });
    }

    pauseRecording() {
      this.isRecording = false;
    }

    resumeRecording() {
      this.isRecording = true;
    }
  }

  // Initialize
  window.BaelHistory = new BaelHistory();
})();
