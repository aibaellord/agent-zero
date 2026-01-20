/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ██████╗ ██╗   ██╗██╗ ██████╗██╗  ██╗    ██████╗ ██╗███████╗███████╗     █
 * █  ██╔═══██╗██║   ██║██║██╔════╝██║ ██╔╝    ██╔══██╗██║██╔════╝██╔════╝     █
 * █  ██║   ██║██║   ██║██║██║     █████╔╝     ██║  ██║██║█████╗  █████╗       █
 * █  ██║▄▄ ██║██║   ██║██║██║     ██╔═██╗     ██║  ██║██║██╔══╝  ██╔══╝       █
 * █  ╚██████╔╝╚██████╔╝██║╚██████╗██║  ██╗    ██████╔╝██║██║     ██║          █
 * █   ╚══▀▀═╝  ╚═════╝ ╚═╝ ╚═════╝╚═╝  ╚═╝    ╚═════╝ ╚═╝╚═╝     ╚═╝          █
 * █                                                                          █
 * █   BAEL QUICK DIFF - Visual Comparison & Change Tracking                 █
 * █   Compare code versions, track changes, and view diffs                  █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelQuickDiff {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.leftText = "";
      this.rightText = "";
    }

    async initialize() {
      console.log("📊 Bael Quick Diff initializing...");

      this.injectStyles();
      this.createModal();
      this.setupShortcuts();

      this.initialized = true;
      console.log("✅ BAEL QUICK DIFF READY (Ctrl+Shift+I)");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-quickdiff-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-quickdiff-styles";
      styles.textContent = `
                /* Modal Overlay */
                .bael-quickdiff-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.8);
                    z-index: 9700;
                    display: none;
                    align-items: center;
                    justify-content: center;
                }

                .bael-quickdiff-overlay.visible {
                    display: flex;
                    animation: diffFadeIn 0.2s ease-out;
                }

                @keyframes diffFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                /* Modal */
                .bael-quickdiff-modal {
                    width: 95%;
                    max-width: 1200px;
                    height: 85%;
                    background: #12121a;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
                }

                /* Header */
                .quickdiff-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .quickdiff-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .quickdiff-actions {
                    display: flex;
                    gap: 8px;
                }

                .quickdiff-action {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: none;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .quickdiff-action.primary {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    color: #fff;
                }

                .quickdiff-action.secondary {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                .quickdiff-action:hover {
                    transform: translateY(-1px);
                }

                .quickdiff-close {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 16px;
                }

                .quickdiff-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                /* Tab Bar */
                .quickdiff-tabs {
                    display: flex;
                    padding: 8px 20px;
                    gap: 4px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .quickdiff-tab {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .quickdiff-tab:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.8);
                }

                .quickdiff-tab.active {
                    background: rgba(59, 130, 246, 0.15);
                    color: #3b82f6;
                }

                /* Content Area */
                .quickdiff-content {
                    flex: 1;
                    display: flex;
                    overflow: hidden;
                }

                /* Input Mode */
                .quickdiff-input-mode {
                    flex: 1;
                    display: flex;
                    padding: 16px;
                    gap: 16px;
                }

                .quickdiff-input-pane {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }

                .input-pane-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }

                .input-pane-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.7);
                }

                .input-pane-actions {
                    display: flex;
                    gap: 4px;
                }

                .input-pane-action {
                    padding: 4px 8px;
                    border-radius: 6px;
                    border: none;
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 11px;
                    cursor: pointer;
                }

                .input-pane-action:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                .quickdiff-textarea {
                    flex: 1;
                    padding: 12px;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 10px;
                    color: #fff;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    font-size: 13px;
                    line-height: 1.5;
                    resize: none;
                    outline: none;
                }

                .quickdiff-textarea:focus {
                    border-color: rgba(59, 130, 246, 0.5);
                }

                .quickdiff-textarea::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                /* Diff View */
                .quickdiff-diff-view {
                    flex: 1;
                    display: none;
                    flex-direction: column;
                }

                .quickdiff-diff-view.visible {
                    display: flex;
                }

                /* Stats Bar */
                .quickdiff-stats {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 8px 20px;
                    background: rgba(0, 0, 0, 0.2);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .diff-stat {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                }

                .diff-stat.added {
                    color: #10b981;
                }

                .diff-stat.removed {
                    color: #ef4444;
                }

                .diff-stat.changed {
                    color: #f59e0b;
                }

                /* Diff Output */
                .quickdiff-output {
                    flex: 1;
                    overflow: auto;
                    padding: 16px 20px;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    font-size: 13px;
                    line-height: 1.6;
                }

                .diff-line {
                    padding: 2px 8px;
                    margin: 0 -8px;
                    white-space: pre-wrap;
                    word-break: break-all;
                }

                .diff-line.added {
                    background: rgba(16, 185, 129, 0.15);
                    color: #10b981;
                }

                .diff-line.removed {
                    background: rgba(239, 68, 68, 0.15);
                    color: #ef4444;
                }

                .diff-line.unchanged {
                    color: rgba(255, 255, 255, 0.5);
                }

                .diff-line-number {
                    display: inline-block;
                    width: 40px;
                    color: rgba(255, 255, 255, 0.3);
                    user-select: none;
                }

                /* Side by Side */
                .quickdiff-sidebyside {
                    flex: 1;
                    display: none;
                    overflow: hidden;
                }

                .quickdiff-sidebyside.visible {
                    display: flex;
                }

                .sidebyside-pane {
                    flex: 1;
                    overflow: auto;
                    padding: 16px;
                    border-right: 1px solid rgba(255, 255, 255, 0.05);
                }

                .sidebyside-pane:last-child {
                    border-right: none;
                }

                .sidebyside-pane.left {
                    background: rgba(239, 68, 68, 0.02);
                }

                .sidebyside-pane.right {
                    background: rgba(16, 185, 129, 0.02);
                }
            `;
      document.head.appendChild(styles);
    }

    createModal() {
      this.overlay = document.createElement("div");
      this.overlay.className = "bael-quickdiff-overlay";
      this.overlay.onclick = (e) => {
        if (e.target === this.overlay) this.hide();
      };
      document.body.appendChild(this.overlay);
    }

    renderModal() {
      this.overlay.innerHTML = `
                <div class="bael-quickdiff-modal">
                    <div class="quickdiff-header">
                        <div class="quickdiff-title">
                            <span>📊</span>
                            Quick Diff
                        </div>
                        <div class="quickdiff-actions">
                            <button class="quickdiff-action secondary" onclick="BaelQuickDiff.swapTexts()">⇄ Swap</button>
                            <button class="quickdiff-action secondary" onclick="BaelQuickDiff.clearAll()">🗑️ Clear</button>
                            <button class="quickdiff-action primary" onclick="BaelQuickDiff.compare()">Compare</button>
                        </div>
                        <button class="quickdiff-close" onclick="BaelQuickDiff.hide()">✕</button>
                    </div>

                    <div class="quickdiff-tabs">
                        <button class="quickdiff-tab active" data-view="input" onclick="BaelQuickDiff.switchView('input')">Input</button>
                        <button class="quickdiff-tab" data-view="unified" onclick="BaelQuickDiff.switchView('unified')">Unified Diff</button>
                        <button class="quickdiff-tab" data-view="sidebyside" onclick="BaelQuickDiff.switchView('sidebyside')">Side by Side</button>
                    </div>

                    <div class="quickdiff-content">
                        <div class="quickdiff-input-mode" id="view-input">
                            <div class="quickdiff-input-pane">
                                <div class="input-pane-header">
                                    <span class="input-pane-title">Original (Left)</span>
                                    <div class="input-pane-actions">
                                        <button class="input-pane-action" onclick="BaelQuickDiff.pasteLeft()">📋 Paste</button>
                                    </div>
                                </div>
                                <textarea class="quickdiff-textarea" id="diff-left"
                                          placeholder="Paste or type original text here..."
                                          oninput="BaelQuickDiff.leftText = this.value">${this.escapeHtml(this.leftText)}</textarea>
                            </div>
                            <div class="quickdiff-input-pane">
                                <div class="input-pane-header">
                                    <span class="input-pane-title">Modified (Right)</span>
                                    <div class="input-pane-actions">
                                        <button class="input-pane-action" onclick="BaelQuickDiff.pasteRight()">📋 Paste</button>
                                    </div>
                                </div>
                                <textarea class="quickdiff-textarea" id="diff-right"
                                          placeholder="Paste or type modified text here..."
                                          oninput="BaelQuickDiff.rightText = this.value">${this.escapeHtml(this.rightText)}</textarea>
                            </div>
                        </div>

                        <div class="quickdiff-diff-view" id="view-unified">
                            <div class="quickdiff-stats" id="diff-stats"></div>
                            <div class="quickdiff-output" id="diff-output"></div>
                        </div>

                        <div class="quickdiff-sidebyside" id="view-sidebyside">
                            <div class="sidebyside-pane left" id="side-left"></div>
                            <div class="sidebyside-pane right" id="side-right"></div>
                        </div>
                    </div>
                </div>
            `;
    }

    switchView(view) {
      // Update tabs
      document.querySelectorAll(".quickdiff-tab").forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.view === view);
      });

      // Show correct view
      document.getElementById("view-input").style.display =
        view === "input" ? "flex" : "none";
      document
        .getElementById("view-unified")
        .classList.toggle("visible", view === "unified");
      document
        .getElementById("view-sidebyside")
        .classList.toggle("visible", view === "sidebyside");

      // Run comparison if switching to diff views
      if (view !== "input") {
        this.compare();
      }
    }

    compare() {
      const left = this.leftText;
      const right = this.rightText;

      if (!left && !right) {
        this.showToast("Enter text in both panes to compare");
        return;
      }

      const diff = this.computeDiff(left, right);
      this.renderDiff(diff);
      this.renderSideBySide(diff);

      // Switch to unified view if on input
      const inputView = document.getElementById("view-input");
      if (inputView && inputView.style.display !== "none") {
        this.switchView("unified");
      }
    }

    computeDiff(left, right) {
      const leftLines = left.split("\n");
      const rightLines = right.split("\n");

      const result = [];
      let added = 0,
        removed = 0,
        changed = 0;

      const maxLen = Math.max(leftLines.length, rightLines.length);

      for (let i = 0; i < maxLen; i++) {
        const leftLine = leftLines[i];
        const rightLine = rightLines[i];

        if (leftLine === undefined) {
          result.push({ type: "added", line: rightLine, lineNum: i + 1 });
          added++;
        } else if (rightLine === undefined) {
          result.push({ type: "removed", line: leftLine, lineNum: i + 1 });
          removed++;
        } else if (leftLine === rightLine) {
          result.push({ type: "unchanged", line: leftLine, lineNum: i + 1 });
        } else {
          result.push({ type: "removed", line: leftLine, lineNum: i + 1 });
          result.push({ type: "added", line: rightLine, lineNum: i + 1 });
          changed++;
        }
      }

      return { lines: result, stats: { added, removed, changed } };
    }

    renderDiff(diff) {
      // Stats
      const statsEl = document.getElementById("diff-stats");
      if (statsEl) {
        statsEl.innerHTML = `
                    <div class="diff-stat added">
                        <span>+${diff.stats.added}</span>
                        <span>Added</span>
                    </div>
                    <div class="diff-stat removed">
                        <span>-${diff.stats.removed}</span>
                        <span>Removed</span>
                    </div>
                    <div class="diff-stat changed">
                        <span>~${diff.stats.changed}</span>
                        <span>Changed</span>
                    </div>
                `;
      }

      // Output
      const outputEl = document.getElementById("diff-output");
      if (outputEl) {
        outputEl.innerHTML = diff.lines
          .map((item) => {
            const prefix =
              item.type === "added" ? "+" : item.type === "removed" ? "-" : " ";
            return `<div class="diff-line ${item.type}"><span class="diff-line-number">${item.lineNum}</span>${prefix} ${this.escapeHtml(item.line)}</div>`;
          })
          .join("");
      }
    }

    renderSideBySide(diff) {
      const leftEl = document.getElementById("side-left");
      const rightEl = document.getElementById("side-right");

      if (!leftEl || !rightEl) return;

      let leftHtml = "",
        rightHtml = "";

      diff.lines.forEach((item) => {
        if (item.type === "unchanged") {
          leftHtml += `<div class="diff-line unchanged">${this.escapeHtml(item.line)}</div>`;
          rightHtml += `<div class="diff-line unchanged">${this.escapeHtml(item.line)}</div>`;
        } else if (item.type === "removed") {
          leftHtml += `<div class="diff-line removed">${this.escapeHtml(item.line)}</div>`;
        } else if (item.type === "added") {
          rightHtml += `<div class="diff-line added">${this.escapeHtml(item.line)}</div>`;
        }
      });

      leftEl.innerHTML = leftHtml;
      rightEl.innerHTML = rightHtml;
    }

    swapTexts() {
      const temp = this.leftText;
      this.leftText = this.rightText;
      this.rightText = temp;

      const leftEl = document.getElementById("diff-left");
      const rightEl = document.getElementById("diff-right");

      if (leftEl) leftEl.value = this.leftText;
      if (rightEl) rightEl.value = this.rightText;

      this.showToast("Texts swapped");
    }

    clearAll() {
      this.leftText = "";
      this.rightText = "";

      const leftEl = document.getElementById("diff-left");
      const rightEl = document.getElementById("diff-right");

      if (leftEl) leftEl.value = "";
      if (rightEl) rightEl.value = "";

      this.showToast("Cleared");
    }

    async pasteLeft() {
      try {
        this.leftText = await navigator.clipboard.readText();
        const el = document.getElementById("diff-left");
        if (el) el.value = this.leftText;
        this.showToast("Pasted to left");
      } catch (e) {
        console.error("Paste failed:", e);
      }
    }

    async pasteRight() {
      try {
        this.rightText = await navigator.clipboard.readText();
        const el = document.getElementById("diff-right");
        if (el) el.value = this.rightText;
        this.showToast("Pasted to right");
      } catch (e) {
        console.error("Paste failed:", e);
      }
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text || "";
      return div.innerHTML;
    }

    showToast(message) {
      const toast = document.createElement("div");
      toast.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(59, 130, 246, 0.9);
                color: #fff;
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 13px;
                z-index: 9999;
            `;
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "I") {
          e.preventDefault();
          this.toggle();
        }

        if (e.key === "Escape" && this.visible) {
          this.hide();
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
      this.renderModal();
      this.overlay.classList.add("visible");
    }

    hide() {
      this.visible = false;
      this.overlay.classList.remove("visible");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelQuickDiff = new BaelQuickDiff();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelQuickDiff.initialize();
    });
  } else {
    window.BaelQuickDiff.initialize();
  }

  console.log("📊 Bael Quick Diff loaded");
})();
