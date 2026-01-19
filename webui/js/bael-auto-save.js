/**
 * BAEL - LORD OF ALL
 * Auto-Save & Draft Recovery - Never lose your work
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelAutoSave {
    constructor() {
      this.drafts = new Map();
      this.autosaveInterval = 30000; // 30 seconds
      this.maxDrafts = 20;
      this.indicator = null;
      this.recoveryModal = null;
      this.init();
    }

    init() {
      this.loadDrafts();
      this.addStyles();
      this.createIndicator();
      this.bindEvents();
      this.startAutoSave();
      this.checkForRecovery();
      console.log("💾 Bael Auto-Save initialized");
    }

    loadDrafts() {
      try {
        const saved = JSON.parse(localStorage.getItem("bael_drafts") || "{}");
        this.drafts = new Map(Object.entries(saved));
      } catch (e) {
        this.drafts = new Map();
      }
    }

    saveDrafts() {
      const obj = Object.fromEntries(this.drafts);
      localStorage.setItem("bael_drafts", JSON.stringify(obj));
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-autosave-styles";
      styles.textContent = `
                /* Save Indicator */
                .bael-save-indicator {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 20px;
                    padding: 8px 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                    z-index: 100010;
                    opacity: 0;
                    transform: translateY(10px);
                    transition: all 0.3s ease;
                    pointer-events: none;
                }

                .bael-save-indicator.visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .bael-save-indicator.saving {
                    color: var(--bael-accent, #ff3366);
                }

                .bael-save-indicator.saved {
                    color: #4ade80;
                }

                .save-icon {
                    font-size: 14px;
                }

                .save-icon.spinning {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                /* Recovery Modal */
                .bael-recovery-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 100050;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(4px);
                }

                .bael-recovery-overlay.visible {
                    display: flex;
                    animation: fadeIn 0.2s ease;
                }

                .bael-recovery-modal {
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    width: 500px;
                    max-width: 90vw;
                    max-height: 80vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    animation: modalAppear 0.3s ease;
                }

                @keyframes modalAppear {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }

                .recovery-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .recovery-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .recovery-close {
                    width: 32px;
                    height: 32px;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 6px;
                    font-size: 18px;
                }

                .recovery-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                .recovery-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px 20px;
                }

                .recovery-message {
                    margin-bottom: 16px;
                    padding: 12px;
                    background: rgba(251, 191, 36, 0.1);
                    border: 1px solid rgba(251, 191, 36, 0.3);
                    border-radius: 8px;
                    color: #fbbf24;
                    font-size: 13px;
                    line-height: 1.5;
                }

                .draft-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .draft-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .draft-item:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .draft-item.selected {
                    border-color: var(--bael-accent, #ff3366);
                    background: var(--bael-bg-tertiary, #181820);
                }

                .draft-radio {
                    width: 18px;
                    height: 18px;
                    border: 2px solid var(--bael-border, #2a2a3a);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .draft-item.selected .draft-radio {
                    border-color: var(--bael-accent, #ff3366);
                }

                .draft-item.selected .draft-radio::after {
                    content: '';
                    width: 8px;
                    height: 8px;
                    background: var(--bael-accent, #ff3366);
                    border-radius: 50%;
                }

                .draft-info {
                    flex: 1;
                    min-width: 0;
                }

                .draft-type {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 4px;
                }

                .draft-preview {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    margin-bottom: 6px;
                }

                .draft-meta {
                    font-size: 10px;
                    color: var(--bael-text-muted, #555);
                }

                .draft-delete {
                    width: 28px;
                    height: 28px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    font-size: 12px;
                    opacity: 0;
                    transition: all 0.2s ease;
                }

                .draft-item:hover .draft-delete {
                    opacity: 1;
                }

                .draft-delete:hover {
                    border-color: #f87171;
                    color: #f87171;
                }

                .recovery-footer {
                    padding: 16px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .recovery-actions {
                    display: flex;
                    gap: 10px;
                }

                .recovery-btn {
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .recovery-btn.discard {
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    color: var(--bael-text-muted, #666);
                }

                .recovery-btn.discard:hover {
                    border-color: #f87171;
                    color: #f87171;
                }

                .recovery-btn.restore {
                    background: var(--bael-accent, #ff3366);
                    border: none;
                    color: white;
                }

                .recovery-btn.restore:hover {
                    filter: brightness(1.1);
                }

                .recovery-btn.restore:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Drafts Panel Button */
                .bael-drafts-btn {
                    position: fixed;
                    bottom: 140px;
                    right: 20px;
                    width: 44px;
                    height: 44px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    z-index: 100005;
                    transition: all 0.3s ease;
                }

                .bael-drafts-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.1);
                }

                .drafts-badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    background: var(--bael-accent, #ff3366);
                    color: white;
                    font-size: 10px;
                    font-weight: 600;
                    padding: 2px 6px;
                    border-radius: 10px;
                    display: none;
                }

                .drafts-badge.visible {
                    display: block;
                }
            `;
      document.head.appendChild(styles);
    }

    createIndicator() {
      // Save indicator
      const indicator = document.createElement("div");
      indicator.className = "bael-save-indicator";
      indicator.innerHTML = `
                <span class="save-icon">💾</span>
                <span class="save-text">Saved</span>
            `;
      document.body.appendChild(indicator);
      this.indicator = indicator;

      // Drafts button
      const button = document.createElement("button");
      button.className = "bael-drafts-btn";
      button.innerHTML = `
                📋
                <span class="drafts-badge" id="drafts-badge">${this.drafts.size}</span>
            `;
      button.title = "View Drafts (Ctrl+Shift+R)";
      button.addEventListener("click", () => this.showRecoveryModal());
      document.body.appendChild(button);
      this.draftsButton = button;

      this.updateBadge();
    }

    bindEvents() {
      // Monitor input fields
      document.addEventListener("input", (e) => {
        const input = e.target;
        if (this.shouldSave(input)) {
          this.queueAutoSave(input);
        }
      });

      // Keyboard shortcut for recovery panel
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "R") {
          e.preventDefault();
          this.showRecoveryModal();
        }
      });

      // Save on visibility change
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          this.saveAllDrafts();
        }
      });

      // Save before unload
      window.addEventListener("beforeunload", () => {
        this.saveAllDrafts();
      });
    }

    shouldSave(element) {
      // Save inputs, textareas, contenteditable elements
      if (element.tagName === "INPUT" && element.type === "text") return true;
      if (element.tagName === "TEXTAREA") return true;
      if (element.contentEditable === "true") return true;
      return false;
    }

    queueAutoSave(element) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => {
        this.saveDraft(element);
      }, 2000);
    }

    saveDraft(element) {
      const id = this.getElementId(element);
      const value = element.value || element.textContent;

      if (!value.trim()) {
        this.drafts.delete(id);
      } else {
        this.drafts.set(id, {
          id: id,
          type: this.getElementType(element),
          value: value,
          timestamp: Date.now(),
          url: window.location.href,
        });
      }

      // Limit drafts
      if (this.drafts.size > this.maxDrafts) {
        const oldest = [...this.drafts.entries()].sort(
          (a, b) => a[1].timestamp - b[1].timestamp,
        )[0];
        this.drafts.delete(oldest[0]);
      }

      this.saveDrafts();
      this.showSaveIndicator();
      this.updateBadge();
    }

    saveAllDrafts() {
      // Find all inputs with values
      const inputs = document.querySelectorAll(
        'input[type="text"], textarea, [contenteditable="true"]',
      );
      inputs.forEach((input) => {
        const value = input.value || input.textContent;
        if (value.trim()) {
          this.saveDraft(input);
        }
      });
    }

    getElementId(element) {
      if (element.id) return element.id;
      if (element.name) return element.name;
      if (element.placeholder) return element.placeholder.substring(0, 30);
      return `element_${element.tagName}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getElementType(element) {
      if (
        element.id?.includes("chat") ||
        element.placeholder?.toLowerCase().includes("message")
      ) {
        return "Chat Message";
      }
      if (
        element.classList.contains("code") ||
        element.closest(".code-editor")
      ) {
        return "Code";
      }
      if (element.tagName === "TEXTAREA") return "Text Area";
      return "Input";
    }

    showSaveIndicator() {
      this.indicator.classList.add("saving", "visible");
      this.indicator.querySelector(".save-icon").classList.add("spinning");
      this.indicator.querySelector(".save-text").textContent = "Saving...";

      setTimeout(() => {
        this.indicator.classList.remove("saving");
        this.indicator.classList.add("saved");
        this.indicator.querySelector(".save-icon").classList.remove("spinning");
        this.indicator.querySelector(".save-text").textContent = "Saved";

        setTimeout(() => {
          this.indicator.classList.remove("visible", "saved");
        }, 1500);
      }, 500);
    }

    updateBadge() {
      const badge = document.getElementById("drafts-badge");
      if (badge) {
        badge.textContent = this.drafts.size;
        badge.classList.toggle("visible", this.drafts.size > 0);
      }
    }

    startAutoSave() {
      setInterval(() => {
        this.saveAllDrafts();
      }, this.autosaveInterval);
    }

    checkForRecovery() {
      // Check if there are drafts from a previous session
      if (this.drafts.size > 0) {
        const anyFromPreviousSession = [...this.drafts.values()].some(
          (draft) => {
            return Date.now() - draft.timestamp > 60000; // Older than 1 minute
          },
        );

        if (anyFromPreviousSession) {
          setTimeout(() => {
            this.showRecoveryNotification();
          }, 2000);
        }
      }
    }

    showRecoveryNotification() {
      if (window.BaelNotifications) {
        window.BaelNotifications.show({
          title: "Drafts Available",
          message: `${this.drafts.size} unsaved draft${this.drafts.size > 1 ? "s" : ""} found. Click to recover.`,
          type: "info",
          duration: 10000,
          onClick: () => this.showRecoveryModal(),
        });
      }
    }

    showRecoveryModal() {
      if (this.recoveryModal) {
        this.recoveryModal.remove();
      }

      const overlay = document.createElement("div");
      overlay.className = "bael-recovery-overlay visible";
      overlay.innerHTML = `
                <div class="bael-recovery-modal">
                    <div class="recovery-header">
                        <div class="recovery-title">
                            <span>📋</span>
                            <span>Draft Recovery</span>
                        </div>
                        <button class="recovery-close">×</button>
                    </div>

                    <div class="recovery-content">
                        ${
                          this.drafts.size > 0
                            ? `
                            <div class="recovery-message">
                                ⚠️ We found ${this.drafts.size} unsaved draft${this.drafts.size > 1 ? "s" : ""}.
                                Select one to restore or discard.
                            </div>
                            <div class="draft-list">
                                ${this.renderDraftList()}
                            </div>
                        `
                            : `
                            <div style="text-align: center; padding: 40px; color: var(--bael-text-muted);">
                                <div style="font-size: 36px; margin-bottom: 12px;">📋</div>
                                <div>No drafts saved</div>
                            </div>
                        `
                        }
                    </div>

                    <div class="recovery-footer">
                        <button class="recovery-btn discard" id="discard-all">Discard All</button>
                        <div class="recovery-actions">
                            <button class="recovery-btn discard" id="close-recovery">Cancel</button>
                            <button class="recovery-btn restore" id="restore-draft" ${this.drafts.size === 0 ? "disabled" : ""}>Restore Selected</button>
                        </div>
                    </div>
                </div>
            `;

      document.body.appendChild(overlay);
      this.recoveryModal = overlay;

      // Bind modal events
      overlay
        .querySelector(".recovery-close")
        .addEventListener("click", () => this.closeRecoveryModal());
      overlay
        .querySelector("#close-recovery")
        .addEventListener("click", () => this.closeRecoveryModal());
      overlay
        .querySelector("#discard-all")
        .addEventListener("click", () => this.discardAllDrafts());
      overlay
        .querySelector("#restore-draft")
        .addEventListener("click", () => this.restoreSelectedDraft());

      // Draft selection
      overlay.querySelectorAll(".draft-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          if (e.target.classList.contains("draft-delete")) return;
          overlay
            .querySelectorAll(".draft-item")
            .forEach((i) => i.classList.remove("selected"));
          item.classList.add("selected");
          this.selectedDraftId = item.dataset.id;
        });
      });

      // Draft delete buttons
      overlay.querySelectorAll(".draft-delete").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const id = btn.closest(".draft-item").dataset.id;
          this.deleteDraft(id);
        });
      });

      // Click outside to close
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          this.closeRecoveryModal();
        }
      });

      // Select first draft by default
      const firstDraft = overlay.querySelector(".draft-item");
      if (firstDraft) {
        firstDraft.classList.add("selected");
        this.selectedDraftId = firstDraft.dataset.id;
      }
    }

    renderDraftList() {
      return [...this.drafts.entries()]
        .map(([id, draft]) => {
          const time = new Date(draft.timestamp);
          const ago = this.getTimeAgo(draft.timestamp);

          return `
                    <div class="draft-item" data-id="${id}">
                        <div class="draft-radio"></div>
                        <div class="draft-info">
                            <div class="draft-type">${draft.type}</div>
                            <div class="draft-preview">${this.escapeHtml(draft.value.substring(0, 100))}${draft.value.length > 100 ? "..." : ""}</div>
                            <div class="draft-meta">${ago} • ${draft.value.length} chars</div>
                        </div>
                        <button class="draft-delete" title="Delete">🗑️</button>
                    </div>
                `;
        })
        .join("");
    }

    getTimeAgo(timestamp) {
      const seconds = Math.floor((Date.now() - timestamp) / 1000);
      if (seconds < 60) return "Just now";
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      return `${Math.floor(seconds / 86400)}d ago`;
    }

    closeRecoveryModal() {
      if (this.recoveryModal) {
        this.recoveryModal.classList.remove("visible");
        setTimeout(() => {
          this.recoveryModal.remove();
          this.recoveryModal = null;
        }, 200);
      }
    }

    restoreSelectedDraft() {
      if (!this.selectedDraftId) return;

      const draft = this.drafts.get(this.selectedDraftId);
      if (!draft) return;

      // Try to find the original element
      const element =
        document.getElementById(draft.id) ||
        document.getElementsByName(draft.id)[0] ||
        document.querySelector(`[placeholder*="${draft.id}"]`);

      if (element) {
        if (element.value !== undefined) {
          element.value = draft.value;
        } else {
          element.textContent = draft.value;
        }
        element.focus();
        element.dispatchEvent(new Event("input", { bubbles: true }));
      } else {
        // Copy to clipboard as fallback
        navigator.clipboard.writeText(draft.value).then(() => {
          if (window.BaelNotifications) {
            window.BaelNotifications.success("Draft copied to clipboard");
          }
        });
      }

      // Remove the restored draft
      this.drafts.delete(this.selectedDraftId);
      this.saveDrafts();
      this.updateBadge();
      this.closeRecoveryModal();
    }

    deleteDraft(id) {
      this.drafts.delete(id);
      this.saveDrafts();
      this.updateBadge();

      // Re-render modal
      if (this.recoveryModal) {
        this.showRecoveryModal();
      }
    }

    discardAllDrafts() {
      if (!confirm("Discard all drafts? This cannot be undone.")) return;

      this.drafts.clear();
      this.saveDrafts();
      this.updateBadge();
      this.closeRecoveryModal();

      if (window.BaelNotifications) {
        window.BaelNotifications.info("All drafts discarded");
      }
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Initialize
  window.BaelAutoSave = new BaelAutoSave();
})();
