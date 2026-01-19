/**
 * BAEL - LORD OF ALL
 * Code Refactor Assistant - Intelligent code transformation and improvement
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelCodeRefactor {
    constructor() {
      this.isVisible = false;
      this.selectedCode = "";
      this.refactorOptions = [];
      this.history = [];
      this.init();
    }

    init() {
      this.createUI();
      this.bindEvents();
      console.log("🔧 Bael Code Refactor Assistant initialized");
    }

    createUI() {
      const styles = document.createElement("style");
      styles.id = "bael-refactor-styles";
      styles.textContent = `
                .bael-refactor-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.95);
                    width: 600px;
                    max-height: 80vh;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    opacity: 0;
                    pointer-events: none;
                    transition: all 0.3s ease;
                }

                .bael-refactor-panel.visible {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                    pointer-events: all;
                }

                .bael-refactor-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-refactor-title {
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .bael-refactor-close {
                    width: 30px;
                    height: 30px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    font-size: 14px;
                }

                .bael-refactor-close:hover {
                    background: #ff4444;
                    color: #fff;
                    border-color: #ff4444;
                }

                .bael-refactor-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                }

                .bael-refactor-input-section {
                    margin-bottom: 20px;
                }

                .bael-refactor-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--bael-text-muted, #888);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 8px;
                    display: block;
                }

                .bael-refactor-textarea {
                    width: 100%;
                    min-height: 120px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    padding: 12px;
                    color: var(--bael-text-primary, #fff);
                    font-family: 'Fira Code', 'Monaco', monospace;
                    font-size: 12px;
                    line-height: 1.5;
                    resize: vertical;
                }

                .bael-refactor-textarea:focus {
                    outline: none;
                    border-color: var(--bael-accent, #ff3366);
                }

                .bael-refactor-options {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                    margin-bottom: 20px;
                }

                .bael-refactor-option {
                    padding: 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 2px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-refactor-option:hover {
                    border-color: rgba(255, 51, 102, 0.4);
                }

                .bael-refactor-option.selected {
                    border-color: var(--bael-accent, #ff3366);
                    background: rgba(255, 51, 102, 0.05);
                }

                .bael-refactor-option-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 6px;
                }

                .bael-refactor-option-icon {
                    font-size: 18px;
                }

                .bael-refactor-option-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .bael-refactor-option-desc {
                    font-size: 11px;
                    color: var(--bael-text-muted, #888);
                    line-height: 1.4;
                }

                .bael-refactor-advanced {
                    margin-bottom: 20px;
                }

                .bael-refactor-advanced-toggle {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-muted, #888);
                    font-size: 12px;
                    cursor: pointer;
                    width: 100%;
                    text-align: left;
                }

                .bael-refactor-advanced-toggle:hover {
                    border-color: rgba(255, 51, 102, 0.3);
                }

                .bael-refactor-advanced-content {
                    display: none;
                    margin-top: 12px;
                    padding: 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-radius: 10px;
                }

                .bael-refactor-advanced-content.visible {
                    display: block;
                }

                .bael-refactor-checkbox-group {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .bael-refactor-checkbox {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: var(--bael-text-primary, #fff);
                    cursor: pointer;
                }

                .bael-refactor-checkbox input {
                    accent-color: var(--bael-accent, #ff3366);
                }

                .bael-refactor-output-section {
                    display: none;
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-refactor-output-section.visible {
                    display: block;
                }

                .bael-refactor-output-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }

                .bael-refactor-output-actions {
                    display: flex;
                    gap: 8px;
                }

                .bael-refactor-output-btn {
                    padding: 6px 12px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #888);
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-refactor-output-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                .bael-refactor-diff {
                    background: var(--bael-bg-secondary, #12121a);
                    border-radius: 10px;
                    overflow: hidden;
                    font-family: 'Fira Code', monospace;
                    font-size: 12px;
                }

                .bael-refactor-diff-line {
                    padding: 4px 12px;
                    display: flex;
                    gap: 12px;
                }

                .bael-refactor-diff-line.added {
                    background: rgba(34, 197, 94, 0.1);
                    color: #22c55e;
                }

                .bael-refactor-diff-line.removed {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }

                .bael-refactor-diff-line.unchanged {
                    color: var(--bael-text-muted, #666);
                }

                .bael-refactor-diff-marker {
                    width: 16px;
                    text-align: center;
                    user-select: none;
                }

                .bael-refactor-footer {
                    display: flex;
                    gap: 12px;
                    padding: 16px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-refactor-btn {
                    flex: 1;
                    padding: 12px;
                    border-radius: 10px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-refactor-btn.primary {
                    background: linear-gradient(135deg, var(--bael-accent, #ff3366) 0%, #ff6b8a 100%);
                    border: none;
                    color: #fff;
                }

                .bael-refactor-btn.primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 16px rgba(255, 51, 102, 0.4);
                }

                .bael-refactor-btn.secondary {
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    color: var(--bael-text-primary, #fff);
                }

                .bael-refactor-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    z-index: 9999;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                }

                .bael-refactor-overlay.visible {
                    opacity: 1;
                    pointer-events: all;
                }

                .bael-refactor-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 30px;
                    color: var(--bael-text-muted, #888);
                }

                .bael-refactor-spinner {
                    width: 24px;
                    height: 24px;
                    border: 3px solid var(--bael-border, #2a2a3a);
                    border-top-color: var(--bael-accent, #ff3366);
                    border-radius: 50%;
                    animation: bael-spin 1s linear infinite;
                }

                @keyframes bael-spin {
                    to { transform: rotate(360deg); }
                }

                /* Context menu item */
                .bael-refactor-context-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 16px;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }

                .bael-refactor-context-item:hover {
                    background: rgba(255, 51, 102, 0.1);
                }
            `;
      document.head.appendChild(styles);

      // Overlay
      this.overlay = document.createElement("div");
      this.overlay.className = "bael-refactor-overlay";
      document.body.appendChild(this.overlay);

      // Panel
      this.panel = document.createElement("div");
      this.panel.className = "bael-refactor-panel";
      this.panel.innerHTML = this.renderPanel();
      document.body.appendChild(this.panel);
    }

    renderPanel() {
      const refactorOptions = [
        {
          id: "simplify",
          icon: "✨",
          title: "Simplify Code",
          desc: "Reduce complexity, remove redundancy",
        },
        {
          id: "optimize",
          icon: "⚡",
          title: "Optimize Performance",
          desc: "Improve speed and efficiency",
        },
        {
          id: "modernize",
          icon: "🚀",
          title: "Modernize Syntax",
          desc: "Use latest language features",
        },
        {
          id: "readable",
          icon: "📖",
          title: "Improve Readability",
          desc: "Better names, comments, structure",
        },
        {
          id: "dry",
          icon: "♻️",
          title: "Apply DRY Principle",
          desc: "Extract common code, reduce duplication",
        },
        {
          id: "typescript",
          icon: "📘",
          title: "Add TypeScript",
          desc: "Add type annotations and interfaces",
        },
        {
          id: "async",
          icon: "🔄",
          title: "Convert to Async",
          desc: "Modernize to async/await pattern",
        },
        {
          id: "functional",
          icon: "λ",
          title: "Functional Style",
          desc: "Use map, filter, reduce patterns",
        },
      ];

      return `
                <div class="bael-refactor-header">
                    <div class="bael-refactor-title">
                        <span>🔧</span>
                        <span>Code Refactor Assistant</span>
                    </div>
                    <button class="bael-refactor-close">✕</button>
                </div>
                <div class="bael-refactor-content">
                    <div class="bael-refactor-input-section">
                        <label class="bael-refactor-label">Code to Refactor</label>
                        <textarea class="bael-refactor-textarea" id="refactor-input" placeholder="Paste your code here..."></textarea>
                    </div>

                    <label class="bael-refactor-label">Refactoring Type</label>
                    <div class="bael-refactor-options" id="refactor-options">
                        ${refactorOptions
                          .map(
                            (opt) => `
                            <div class="bael-refactor-option" data-id="${opt.id}">
                                <div class="bael-refactor-option-header">
                                    <span class="bael-refactor-option-icon">${opt.icon}</span>
                                    <span class="bael-refactor-option-title">${opt.title}</span>
                                </div>
                                <div class="bael-refactor-option-desc">${opt.desc}</div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>

                    <div class="bael-refactor-advanced">
                        <button class="bael-refactor-advanced-toggle" id="advanced-toggle">
                            <span>⚙️</span>
                            <span>Advanced Options</span>
                            <span style="margin-left: auto;">▼</span>
                        </button>
                        <div class="bael-refactor-advanced-content" id="advanced-content">
                            <div class="bael-refactor-checkbox-group">
                                <label class="bael-refactor-checkbox">
                                    <input type="checkbox" id="opt-comments" checked>
                                    Add explanatory comments
                                </label>
                                <label class="bael-refactor-checkbox">
                                    <input type="checkbox" id="opt-preserve-behavior" checked>
                                    Preserve exact behavior
                                </label>
                                <label class="bael-refactor-checkbox">
                                    <input type="checkbox" id="opt-error-handling">
                                    Add error handling
                                </label>
                                <label class="bael-refactor-checkbox">
                                    <input type="checkbox" id="opt-tests">
                                    Generate tests
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="bael-refactor-output-section" id="output-section">
                        <div class="bael-refactor-output-header">
                            <label class="bael-refactor-label" style="margin-bottom: 0;">Refactored Code</label>
                            <div class="bael-refactor-output-actions">
                                <button class="bael-refactor-output-btn" id="copy-output">📋 Copy</button>
                                <button class="bael-refactor-output-btn" id="apply-output">✓ Apply</button>
                            </div>
                        </div>
                        <div class="bael-refactor-diff" id="refactor-diff">
                            <!-- Diff output -->
                        </div>
                    </div>
                </div>
                <div class="bael-refactor-footer">
                    <button class="bael-refactor-btn secondary" id="refactor-cancel">Cancel</button>
                    <button class="bael-refactor-btn primary" id="refactor-run">🔧 Refactor Code</button>
                </div>
            `;
    }

    bindEvents() {
      this.overlay.addEventListener("click", () => this.hide());
      this.panel
        .querySelector(".bael-refactor-close")
        .addEventListener("click", () => this.hide());
      this.panel
        .querySelector("#refactor-cancel")
        .addEventListener("click", () => this.hide());

      // Option selection
      this.panel
        .querySelector("#refactor-options")
        .addEventListener("click", (e) => {
          const option = e.target.closest(".bael-refactor-option");
          if (option) {
            // Toggle selection
            option.classList.toggle("selected");
          }
        });

      // Advanced toggle
      this.panel
        .querySelector("#advanced-toggle")
        .addEventListener("click", () => {
          this.panel
            .querySelector("#advanced-content")
            .classList.toggle("visible");
        });

      // Run refactor
      this.panel
        .querySelector("#refactor-run")
        .addEventListener("click", () => {
          this.runRefactor();
        });

      // Copy output
      this.panel.querySelector("#copy-output").addEventListener("click", () => {
        if (this.refactoredCode) {
          navigator.clipboard.writeText(this.refactoredCode);
          if (window.BaelNotifications)
            window.BaelNotifications.success("Copied refactored code!");
        }
      });

      // Apply output
      this.panel
        .querySelector("#apply-output")
        .addEventListener("click", () => {
          if (this.refactoredCode) {
            document.dispatchEvent(
              new CustomEvent("bael-insert-code", {
                detail: { code: this.refactoredCode },
              }),
            );
            this.hide();
          }
        });

      // Keyboard
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "F") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape" && this.isVisible) {
          this.hide();
        }
      });

      // Listen for text selection
      document.addEventListener("bael-refactor-selection", (e) => {
        if (e.detail?.code) {
          this.show(e.detail.code);
        }
      });
    }

    async runRefactor() {
      const input = this.panel.querySelector("#refactor-input").value.trim();
      if (!input) {
        if (window.BaelNotifications)
          window.BaelNotifications.error("Please enter code to refactor");
        return;
      }

      const selectedOptions = Array.from(
        this.panel.querySelectorAll(".bael-refactor-option.selected"),
      ).map((el) => el.dataset.id);

      if (selectedOptions.length === 0) {
        if (window.BaelNotifications)
          window.BaelNotifications.error(
            "Please select at least one refactoring type",
          );
        return;
      }

      // Show loading
      const outputSection = this.panel.querySelector("#output-section");
      const diffContainer = this.panel.querySelector("#refactor-diff");
      outputSection.classList.add("visible");
      diffContainer.innerHTML = `
                <div class="bael-refactor-loading">
                    <div class="bael-refactor-spinner"></div>
                    <span>Refactoring code...</span>
                </div>
            `;

      // Simulate refactoring (in real implementation, this would call the AI)
      await this.simulateRefactor(input, selectedOptions);
    }

    async simulateRefactor(input, options) {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Demo refactored output based on options
      let refactored = input;

      if (options.includes("modernize")) {
        refactored = refactored.replace(/var /g, "const ");
        refactored = refactored.replace(
          /function\s+(\w+)\s*\((.*?)\)\s*{/g,
          "const $1 = ($2) => {",
        );
      }

      if (options.includes("simplify")) {
        refactored = "// Simplified version\n" + refactored;
      }

      if (options.includes("readable")) {
        refactored =
          "/**\n * Refactored for better readability\n */\n" + refactored;
      }

      this.refactoredCode = refactored;
      this.showDiff(input, refactored);
    }

    showDiff(original, refactored) {
      const originalLines = original.split("\n");
      const refactoredLines = refactored.split("\n");

      let diffHtml = "";

      // Simple diff display
      const maxLines = Math.max(originalLines.length, refactoredLines.length);

      for (let i = 0; i < maxLines; i++) {
        const origLine = originalLines[i] || "";
        const newLine = refactoredLines[i] || "";

        if (!originalLines[i] && refactoredLines[i]) {
          diffHtml += `<div class="bael-refactor-diff-line added">
                        <span class="bael-refactor-diff-marker">+</span>
                        <span>${this.escapeHtml(newLine)}</span>
                    </div>`;
        } else if (originalLines[i] && !refactoredLines[i]) {
          diffHtml += `<div class="bael-refactor-diff-line removed">
                        <span class="bael-refactor-diff-marker">-</span>
                        <span>${this.escapeHtml(origLine)}</span>
                    </div>`;
        } else if (origLine !== newLine) {
          diffHtml += `<div class="bael-refactor-diff-line removed">
                        <span class="bael-refactor-diff-marker">-</span>
                        <span>${this.escapeHtml(origLine)}</span>
                    </div>`;
          diffHtml += `<div class="bael-refactor-diff-line added">
                        <span class="bael-refactor-diff-marker">+</span>
                        <span>${this.escapeHtml(newLine)}</span>
                    </div>`;
        } else {
          diffHtml += `<div class="bael-refactor-diff-line unchanged">
                        <span class="bael-refactor-diff-marker"> </span>
                        <span>${this.escapeHtml(origLine)}</span>
                    </div>`;
        }
      }

      this.panel.querySelector("#refactor-diff").innerHTML = diffHtml;
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML || "&nbsp;";
    }

    toggle() {
      if (this.isVisible) this.hide();
      else this.show();
    }

    show(code = "") {
      this.isVisible = true;
      this.panel.classList.add("visible");
      this.overlay.classList.add("visible");

      if (code) {
        this.panel.querySelector("#refactor-input").value = code;
      }

      this.panel.querySelector("#refactor-input").focus();
    }

    hide() {
      this.isVisible = false;
      this.panel.classList.remove("visible");
      this.overlay.classList.remove("visible");
    }
  }

  window.BaelCodeRefactor = new BaelCodeRefactor();
})();
