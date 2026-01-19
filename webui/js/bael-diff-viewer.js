/**
 * BAEL - LORD OF ALL
 * Diff Viewer - Side-by-side code comparison and change tracking
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelDiffViewer {
    constructor() {
      this.panel = null;
      this.trigger = null;
      this.leftContent = "";
      this.rightContent = "";
      this.diffResult = [];
      this.init();
    }

    init() {
      this.addStyles();
      this.createUI();
      this.bindEvents();
      console.log("📊 Bael Diff Viewer initialized");
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-diff-viewer-styles";
      styles.textContent = `
                /* Diff Viewer Trigger */
                .bael-diff-trigger {
                    position: fixed;
                    bottom: 450px;
                    right: 20px;
                    width: 48px;
                    height: 48px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9982;
                    transition: all 0.3s ease;
                    font-size: 20px;
                }

                .bael-diff-trigger:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.1);
                }

                /* Diff Panel */
                .bael-diff-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 95vw;
                    max-width: 1400px;
                    height: 85vh;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100030;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 20px 80px rgba(0, 0, 0, 0.7);
                }

                .bael-diff-panel.visible {
                    display: flex;
                    animation: diffAppear 0.25s ease;
                }

                @keyframes diffAppear {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .bael-diff-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 100029;
                    display: none;
                }

                .bael-diff-overlay.visible {
                    display: block;
                }

                .diff-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px 16px 0 0;
                }

                .diff-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .diff-title-icon {
                    font-size: 24px;
                }

                .diff-actions {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .diff-btn {
                    padding: 8px 16px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s ease;
                }

                .diff-btn:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                }

                .diff-btn-primary {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                }

                .diff-close {
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                }

                .diff-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                /* Toolbar */
                .diff-toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .diff-view-modes {
                    display: flex;
                    gap: 4px;
                    background: var(--bael-bg-tertiary, #181820);
                    padding: 4px;
                    border-radius: 8px;
                }

                .view-mode-btn {
                    padding: 6px 12px;
                    background: transparent;
                    border: none;
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .view-mode-btn.active {
                    background: var(--bael-accent, #ff3366);
                    color: white;
                }

                .diff-stats {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                }

                .stat-added {
                    color: #4ade80;
                }

                .stat-removed {
                    color: #f87171;
                }

                .stat-modified {
                    color: #fbbf24;
                }

                /* Content Area */
                .diff-content {
                    flex: 1;
                    display: flex;
                    overflow: hidden;
                }

                /* Input Mode */
                .diff-input-mode {
                    display: flex;
                    flex: 1;
                }

                .diff-input-pane {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    border-right: 1px solid var(--bael-border, #2a2a3a);
                }

                .diff-input-pane:last-child {
                    border-right: none;
                }

                .pane-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 16px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .pane-title {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .pane-textarea {
                    flex: 1;
                    padding: 16px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: none;
                    color: var(--bael-text-primary, #fff);
                    font-family: 'SF Mono', Monaco, 'Fira Code', monospace;
                    font-size: 13px;
                    line-height: 1.6;
                    resize: none;
                    outline: none;
                }

                /* Diff View Mode */
                .diff-view-mode {
                    display: none;
                    flex: 1;
                    overflow: hidden;
                }

                .diff-view-mode.active {
                    display: flex;
                }

                /* Side by Side View */
                .diff-side-by-side {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }

                .diff-side-pane {
                    flex: 1;
                    overflow: auto;
                    border-right: 1px solid var(--bael-border, #2a2a3a);
                }

                .diff-side-pane:last-child {
                    border-right: none;
                }

                .diff-line {
                    display: flex;
                    font-family: 'SF Mono', Monaco, 'Fira Code', monospace;
                    font-size: 12px;
                    line-height: 1.6;
                }

                .line-number {
                    min-width: 50px;
                    padding: 0 12px;
                    text-align: right;
                    color: var(--bael-text-muted, #666);
                    background: var(--bael-bg-secondary, #12121a);
                    border-right: 1px solid var(--bael-border, #2a2a3a);
                    user-select: none;
                }

                .line-content {
                    flex: 1;
                    padding: 0 12px;
                    white-space: pre;
                    overflow-x: auto;
                }

                .line-added {
                    background: rgba(74, 222, 128, 0.15);
                }

                .line-added .line-content::before {
                    content: '+';
                    color: #4ade80;
                    margin-right: 8px;
                }

                .line-removed {
                    background: rgba(248, 113, 113, 0.15);
                }

                .line-removed .line-content::before {
                    content: '-';
                    color: #f87171;
                    margin-right: 8px;
                }

                .line-modified {
                    background: rgba(251, 191, 36, 0.1);
                }

                .line-unchanged {
                    color: var(--bael-text-muted, #888);
                }

                /* Unified View */
                .diff-unified {
                    flex: 1;
                    overflow: auto;
                    padding: 0;
                }

                .unified-line {
                    display: flex;
                    font-family: 'SF Mono', Monaco, 'Fira Code', monospace;
                    font-size: 12px;
                    line-height: 1.6;
                }

                .unified-numbers {
                    display: flex;
                    background: var(--bael-bg-secondary, #12121a);
                    border-right: 1px solid var(--bael-border, #2a2a3a);
                }

                .unified-numbers span {
                    min-width: 45px;
                    padding: 0 8px;
                    text-align: right;
                    color: var(--bael-text-muted, #666);
                }

                /* Inline View */
                .diff-inline {
                    flex: 1;
                    overflow: auto;
                    padding: 16px;
                }

                .inline-chunk {
                    margin-bottom: 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    overflow: hidden;
                }

                .chunk-header {
                    padding: 8px 12px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                /* Word-level diff highlighting */
                .word-added {
                    background: rgba(74, 222, 128, 0.3);
                    color: #4ade80;
                    padding: 1px 2px;
                    border-radius: 2px;
                }

                .word-removed {
                    background: rgba(248, 113, 113, 0.3);
                    color: #f87171;
                    text-decoration: line-through;
                    padding: 1px 2px;
                    border-radius: 2px;
                }

                /* Footer */
                .diff-footer {
                    padding: 12px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 0 0 16px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .diff-info {
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                }

                .diff-shortcuts {
                    display: flex;
                    gap: 16px;
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .shortcut-key {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                }

                .shortcut-key kbd {
                    padding: 2px 6px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 4px;
                    font-family: inherit;
                }
            `;
      document.head.appendChild(styles);
    }

    createUI() {
      // Trigger button
      const trigger = document.createElement("button");
      trigger.className = "bael-diff-trigger";
      trigger.title = "Diff Viewer (Ctrl+Shift+D)";
      trigger.innerHTML = "⇄";
      document.body.appendChild(trigger);
      this.trigger = trigger;

      // Overlay
      const overlay = document.createElement("div");
      overlay.className = "bael-diff-overlay";
      document.body.appendChild(overlay);
      this.overlay = overlay;

      // Panel
      const panel = document.createElement("div");
      panel.className = "bael-diff-panel";
      panel.innerHTML = `
                <div class="diff-header">
                    <div class="diff-title">
                        <span class="diff-title-icon">📊</span>
                        <span>Diff Viewer</span>
                    </div>
                    <div class="diff-actions">
                        <button class="diff-btn" id="diff-swap">
                            <span>⇄</span> Swap
                        </button>
                        <button class="diff-btn" id="diff-clear">
                            <span>🗑️</span> Clear
                        </button>
                        <button class="diff-btn diff-btn-primary" id="diff-compare">
                            <span>🔍</span> Compare
                        </button>
                        <button class="diff-close">×</button>
                    </div>
                </div>

                <div class="diff-toolbar">
                    <div class="diff-view-modes">
                        <button class="view-mode-btn active" data-mode="sideBySide">Side by Side</button>
                        <button class="view-mode-btn" data-mode="unified">Unified</button>
                        <button class="view-mode-btn" data-mode="inline">Inline</button>
                    </div>
                    <div class="diff-stats">
                        <div class="stat-item stat-added">
                            <span>+</span><span id="stat-added">0</span> added
                        </div>
                        <div class="stat-item stat-removed">
                            <span>-</span><span id="stat-removed">0</span> removed
                        </div>
                        <div class="stat-item stat-modified">
                            <span>~</span><span id="stat-modified">0</span> modified
                        </div>
                    </div>
                </div>

                <div class="diff-content">
                    <!-- Input Mode -->
                    <div class="diff-input-mode" id="input-mode">
                        <div class="diff-input-pane">
                            <div class="pane-header">
                                <span class="pane-title">Original (Left)</span>
                            </div>
                            <textarea class="pane-textarea" id="left-input" placeholder="Paste original code here..."></textarea>
                        </div>
                        <div class="diff-input-pane">
                            <div class="pane-header">
                                <span class="pane-title">Modified (Right)</span>
                            </div>
                            <textarea class="pane-textarea" id="right-input" placeholder="Paste modified code here..."></textarea>
                        </div>
                    </div>

                    <!-- Side by Side View -->
                    <div class="diff-view-mode" id="view-sideBySide">
                        <div class="diff-side-by-side">
                            <div class="diff-side-pane" id="left-pane"></div>
                            <div class="diff-side-pane" id="right-pane"></div>
                        </div>
                    </div>

                    <!-- Unified View -->
                    <div class="diff-view-mode" id="view-unified">
                        <div class="diff-unified" id="unified-pane"></div>
                    </div>

                    <!-- Inline View -->
                    <div class="diff-view-mode" id="view-inline">
                        <div class="diff-inline" id="inline-pane"></div>
                    </div>
                </div>

                <div class="diff-footer">
                    <div class="diff-info">
                        Use Ctrl+V to paste code • Click Compare to see differences
                    </div>
                    <div class="diff-shortcuts">
                        <span class="shortcut-key"><kbd>Esc</kbd> Close</span>
                        <span class="shortcut-key"><kbd>Enter</kbd> Compare</span>
                    </div>
                </div>
            `;
      document.body.appendChild(panel);
      this.panel = panel;

      this.bindPanelEvents();
    }

    bindEvents() {
      this.trigger.addEventListener("click", () => this.open());
      this.overlay.addEventListener("click", () => this.close());

      // Keyboard shortcuts
      document.addEventListener("keydown", (e) => {
        // Ctrl+Alt+D to open (changed to avoid conflict with dashboard)
        if (e.ctrlKey && e.altKey && e.key === "d") {
          e.preventDefault();
          this.toggle();
        }

        if (this.panel.classList.contains("visible")) {
          if (e.key === "Escape") {
            this.close();
          }
          if (e.key === "Enter" && e.ctrlKey) {
            this.compare();
          }
        }
      });
    }

    bindPanelEvents() {
      this.panel
        .querySelector(".diff-close")
        .addEventListener("click", () => this.close());
      this.panel
        .querySelector("#diff-compare")
        .addEventListener("click", () => this.compare());
      this.panel
        .querySelector("#diff-clear")
        .addEventListener("click", () => this.clear());
      this.panel
        .querySelector("#diff-swap")
        .addEventListener("click", () => this.swap());

      // View mode buttons
      this.panel.querySelectorAll(".view-mode-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.panel
            .querySelectorAll(".view-mode-btn")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          this.renderDiff(btn.dataset.mode);
        });
      });
    }

    open() {
      this.panel.classList.add("visible");
      this.overlay.classList.add("visible");
      this.panel.querySelector("#left-input").focus();
    }

    close() {
      this.panel.classList.remove("visible");
      this.overlay.classList.remove("visible");
    }

    toggle() {
      if (this.panel.classList.contains("visible")) {
        this.close();
      } else {
        this.open();
      }
    }

    clear() {
      this.panel.querySelector("#left-input").value = "";
      this.panel.querySelector("#right-input").value = "";
      this.leftContent = "";
      this.rightContent = "";
      this.diffResult = [];
      this.showInputMode();
    }

    swap() {
      const leftInput = this.panel.querySelector("#left-input");
      const rightInput = this.panel.querySelector("#right-input");
      const temp = leftInput.value;
      leftInput.value = rightInput.value;
      rightInput.value = temp;
    }

    showInputMode() {
      this.panel.querySelector("#input-mode").style.display = "flex";
      this.panel
        .querySelectorAll(".diff-view-mode")
        .forEach((v) => v.classList.remove("active"));
      this.updateStats(0, 0, 0);
    }

    compare() {
      this.leftContent = this.panel.querySelector("#left-input").value;
      this.rightContent = this.panel.querySelector("#right-input").value;

      if (!this.leftContent && !this.rightContent) {
        if (window.BaelNotifications) {
          window.BaelNotifications.warning("Please paste content to compare");
        }
        return;
      }

      this.diffResult = this.computeDiff(this.leftContent, this.rightContent);

      // Hide input mode, show diff view
      this.panel.querySelector("#input-mode").style.display = "none";

      // Get active view mode
      const activeMode =
        this.panel.querySelector(".view-mode-btn.active")?.dataset.mode ||
        "sideBySide";
      this.renderDiff(activeMode);
    }

    computeDiff(left, right) {
      const leftLines = left.split("\n");
      const rightLines = right.split("\n");
      const result = [];

      // Simple LCS-based diff
      const lcs = this.longestCommonSubsequence(leftLines, rightLines);
      let li = 0,
        ri = 0,
        lcsIdx = 0;

      while (li < leftLines.length || ri < rightLines.length) {
        if (
          lcsIdx < lcs.length &&
          li < leftLines.length &&
          leftLines[li] === lcs[lcsIdx] &&
          ri < rightLines.length &&
          rightLines[ri] === lcs[lcsIdx]
        ) {
          result.push({
            type: "unchanged",
            leftLine: li + 1,
            rightLine: ri + 1,
            left: leftLines[li],
            right: rightLines[ri],
          });
          li++;
          ri++;
          lcsIdx++;
        } else if (
          li < leftLines.length &&
          (lcsIdx >= lcs.length || leftLines[li] !== lcs[lcsIdx])
        ) {
          result.push({
            type: "removed",
            leftLine: li + 1,
            rightLine: null,
            left: leftLines[li],
            right: null,
          });
          li++;
        } else if (
          ri < rightLines.length &&
          (lcsIdx >= lcs.length || rightLines[ri] !== lcs[lcsIdx])
        ) {
          result.push({
            type: "added",
            leftLine: null,
            rightLine: ri + 1,
            left: null,
            right: rightLines[ri],
          });
          ri++;
        }
      }

      return result;
    }

    longestCommonSubsequence(a, b) {
      const m = a.length,
        n = b.length;
      const dp = Array(m + 1)
        .fill(null)
        .map(() => Array(n + 1).fill(0));

      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          if (a[i - 1] === b[j - 1]) {
            dp[i][j] = dp[i - 1][j - 1] + 1;
          } else {
            dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
          }
        }
      }

      // Backtrack to find LCS
      const lcs = [];
      let i = m,
        j = n;
      while (i > 0 && j > 0) {
        if (a[i - 1] === b[j - 1]) {
          lcs.unshift(a[i - 1]);
          i--;
          j--;
        } else if (dp[i - 1][j] > dp[i][j - 1]) {
          i--;
        } else {
          j--;
        }
      }

      return lcs;
    }

    renderDiff(mode) {
      this.panel
        .querySelectorAll(".diff-view-mode")
        .forEach((v) => v.classList.remove("active"));
      const view = this.panel.querySelector(`#view-${mode}`);
      if (view) {
        view.classList.add("active");
      }

      // Calculate stats
      const added = this.diffResult.filter((d) => d.type === "added").length;
      const removed = this.diffResult.filter(
        (d) => d.type === "removed",
      ).length;
      const modified = 0; // We track add/remove, not modify in this simple diff
      this.updateStats(added, removed, modified);

      switch (mode) {
        case "sideBySide":
          this.renderSideBySide();
          break;
        case "unified":
          this.renderUnified();
          break;
        case "inline":
          this.renderInline();
          break;
      }
    }

    updateStats(added, removed, modified) {
      this.panel.querySelector("#stat-added").textContent = added;
      this.panel.querySelector("#stat-removed").textContent = removed;
      this.panel.querySelector("#stat-modified").textContent = modified;
    }

    renderSideBySide() {
      const leftPane = this.panel.querySelector("#left-pane");
      const rightPane = this.panel.querySelector("#right-pane");

      leftPane.innerHTML = "";
      rightPane.innerHTML = "";

      this.diffResult.forEach((diff) => {
        // Left pane
        const leftLine = document.createElement("div");
        leftLine.className = `diff-line line-${diff.type === "added" ? "empty" : diff.type}`;
        leftLine.innerHTML = `
                    <div class="line-number">${diff.leftLine || ""}</div>
                    <div class="line-content">${this.escapeHtml(diff.left || "")}</div>
                `;
        leftPane.appendChild(leftLine);

        // Right pane
        const rightLine = document.createElement("div");
        rightLine.className = `diff-line line-${diff.type === "removed" ? "empty" : diff.type}`;
        rightLine.innerHTML = `
                    <div class="line-number">${diff.rightLine || ""}</div>
                    <div class="line-content">${this.escapeHtml(diff.right || "")}</div>
                `;
        rightPane.appendChild(rightLine);
      });

      // Sync scroll
      leftPane.onscroll = () => {
        rightPane.scrollTop = leftPane.scrollTop;
      };
      rightPane.onscroll = () => {
        leftPane.scrollTop = rightPane.scrollTop;
      };
    }

    renderUnified() {
      const pane = this.panel.querySelector("#unified-pane");
      pane.innerHTML = "";

      this.diffResult.forEach((diff) => {
        const line = document.createElement("div");
        line.className = `unified-line line-${diff.type}`;

        const content = diff.type === "removed" ? diff.left : diff.right;
        line.innerHTML = `
                    <div class="unified-numbers">
                        <span>${diff.leftLine || ""}</span>
                        <span>${diff.rightLine || ""}</span>
                    </div>
                    <div class="line-content">${this.escapeHtml(content || "")}</div>
                `;
        pane.appendChild(line);
      });
    }

    renderInline() {
      const pane = this.panel.querySelector("#inline-pane");
      pane.innerHTML = "";

      // Group consecutive changes
      let chunks = [];
      let currentChunk = null;

      this.diffResult.forEach((diff, idx) => {
        if (diff.type !== "unchanged") {
          if (!currentChunk) {
            currentChunk = {
              startLine: diff.leftLine || diff.rightLine,
              changes: [],
            };
          }
          currentChunk.changes.push(diff);
        } else {
          if (currentChunk) {
            chunks.push(currentChunk);
            currentChunk = null;
          }
        }
      });
      if (currentChunk) chunks.push(currentChunk);

      if (chunks.length === 0) {
        pane.innerHTML =
          '<div style="padding: 40px; text-align: center; color: var(--bael-text-muted);">No differences found</div>';
        return;
      }

      chunks.forEach((chunk) => {
        const chunkEl = document.createElement("div");
        chunkEl.className = "inline-chunk";

        let html = `<div class="chunk-header">@@ Line ${chunk.startLine} @@</div>`;
        chunk.changes.forEach((change) => {
          const content =
            change.type === "removed" ? change.left : change.right;
          html += `<div class="diff-line line-${change.type}">
                        <div class="line-number">${change.leftLine || change.rightLine || ""}</div>
                        <div class="line-content">${this.escapeHtml(content || "")}</div>
                    </div>`;
        });

        chunkEl.innerHTML = html;
        pane.appendChild(chunkEl);
      });
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    // Public API for programmatic diff
    diffText(left, right) {
      this.panel.querySelector("#left-input").value = left;
      this.panel.querySelector("#right-input").value = right;
      this.open();
      this.compare();
    }
  }

  // Initialize
  window.BaelDiffViewer = new BaelDiffViewer();
})();
