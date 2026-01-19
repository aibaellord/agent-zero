/**
 * BAEL - LORD OF ALL
 * Enhanced Markdown Preview System
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelMarkdownPreview {
    constructor() {
      this.previewPanel = null;
      this.isOpen = false;
      this.currentContent = "";
      this.syncScroll = true;
      this.init();
    }

    init() {
      this.createPanel();
      this.bindEvents();
      console.log("📝 Bael Markdown Preview initialized");
    }

    createPanel() {
      const panel = document.createElement("div");
      panel.id = "bael-markdown-preview";
      panel.className = "bael-markdown-preview";
      panel.innerHTML = `
                <div class="mdp-header">
                    <div class="mdp-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10 9 9 9 8 9"/>
                        </svg>
                        <span>Preview</span>
                    </div>
                    <div class="mdp-tabs">
                        <button class="mdp-tab active" data-tab="preview">Preview</button>
                        <button class="mdp-tab" data-tab="source">Source</button>
                        <button class="mdp-tab" data-tab="diff">Diff</button>
                    </div>
                    <div class="mdp-actions">
                        <label class="mdp-toggle" title="Sync scroll">
                            <input type="checkbox" id="mdp-sync-scroll" checked>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="17 1 21 5 17 9"/>
                                <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
                                <polyline points="7 23 3 19 7 15"/>
                                <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                            </svg>
                        </label>
                        <button class="mdp-btn" id="mdp-copy" title="Copy">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                        </button>
                        <button class="mdp-btn" id="mdp-fullscreen" title="Fullscreen">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="15 3 21 3 21 9"/>
                                <polyline points="9 21 3 21 3 15"/>
                                <line x1="21" y1="3" x2="14" y2="10"/>
                                <line x1="3" y1="21" x2="10" y2="14"/>
                            </svg>
                        </button>
                        <button class="mdp-btn" id="mdp-close" title="Close">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="mdp-content">
                    <div class="mdp-pane preview-pane active" data-pane="preview">
                        <div class="mdp-rendered"></div>
                    </div>
                    <div class="mdp-pane source-pane" data-pane="source">
                        <pre class="mdp-source"><code></code></pre>
                    </div>
                    <div class="mdp-pane diff-pane" data-pane="diff">
                        <div class="mdp-diff"></div>
                    </div>
                </div>
                <div class="mdp-footer">
                    <div class="mdp-stats">
                        <span id="mdp-word-count">0 words</span>
                        <span class="mdp-divider">•</span>
                        <span id="mdp-char-count">0 chars</span>
                        <span class="mdp-divider">•</span>
                        <span id="mdp-line-count">0 lines</span>
                    </div>
                    <div class="mdp-format">Markdown</div>
                </div>
            `;
      document.body.appendChild(panel);
      this.previewPanel = panel;
      this.addStyles();
    }

    addStyles() {
      if (document.getElementById("bael-markdown-preview-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-markdown-preview-styles";
      styles.textContent = `
                .bael-markdown-preview {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 800px;
                    max-width: 90vw;
                    height: 600px;
                    max-height: 80vh;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    box-shadow: 0 25px 100px rgba(0, 0, 0, 0.6);
                    z-index: 100000;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    overflow: hidden;
                }

                .bael-markdown-preview.open {
                    display: flex;
                    animation: mdpSlideIn 0.3s ease;
                }

                .bael-markdown-preview.fullscreen {
                    width: 100vw;
                    height: 100vh;
                    max-width: none;
                    max-height: none;
                    border-radius: 0;
                }

                @keyframes mdpSlideIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }

                .mdp-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 12px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .mdp-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--bael-accent, #ff3366);
                    font-weight: 600;
                    font-size: 14px;
                }

                .mdp-title svg {
                    width: 18px;
                    height: 18px;
                }

                .mdp-tabs {
                    display: flex;
                    gap: 4px;
                    flex: 1;
                }

                .mdp-tab {
                    padding: 6px 14px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-secondary, #888);
                    font-size: 13px;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: all 0.2s ease;
                }

                .mdp-tab:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--bael-text-primary, #fff);
                }

                .mdp-tab.active {
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .mdp-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .mdp-toggle {
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                }

                .mdp-toggle input {
                    display: none;
                }

                .mdp-toggle svg {
                    width: 18px;
                    height: 18px;
                    color: var(--bael-text-muted, #666);
                    transition: color 0.2s ease;
                }

                .mdp-toggle input:checked + svg {
                    color: var(--bael-accent, #ff3366);
                }

                .mdp-btn {
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-secondary, #888);
                    cursor: pointer;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .mdp-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--bael-text-primary, #fff);
                }

                .mdp-btn svg {
                    width: 18px;
                    height: 18px;
                }

                .mdp-content {
                    flex: 1;
                    overflow: hidden;
                    position: relative;
                }

                .mdp-pane {
                    position: absolute;
                    inset: 0;
                    overflow-y: auto;
                    padding: 24px;
                    display: none;
                }

                .mdp-pane.active {
                    display: block;
                }

                /* Preview Pane Styles */
                .mdp-rendered {
                    color: var(--bael-text-primary, #fff);
                    line-height: 1.7;
                    font-size: 15px;
                }

                .mdp-rendered h1, .mdp-rendered h2, .mdp-rendered h3,
                .mdp-rendered h4, .mdp-rendered h5, .mdp-rendered h6 {
                    margin-top: 1.5em;
                    margin-bottom: 0.5em;
                    font-weight: 600;
                    color: var(--bael-accent, #ff3366);
                }

                .mdp-rendered h1 { font-size: 2em; }
                .mdp-rendered h2 { font-size: 1.5em; }
                .mdp-rendered h3 { font-size: 1.25em; }

                .mdp-rendered p {
                    margin-bottom: 1em;
                }

                .mdp-rendered code {
                    font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 0.9em;
                }

                .mdp-rendered pre {
                    background: var(--bael-bg-tertiary, #1a1a24);
                    padding: 16px;
                    border-radius: 8px;
                    overflow-x: auto;
                    margin: 1em 0;
                }

                .mdp-rendered pre code {
                    background: none;
                    padding: 0;
                }

                .mdp-rendered blockquote {
                    border-left: 4px solid var(--bael-accent, #ff3366);
                    padding-left: 16px;
                    margin: 1em 0;
                    color: var(--bael-text-secondary, #888);
                }

                .mdp-rendered ul, .mdp-rendered ol {
                    padding-left: 24px;
                    margin: 1em 0;
                }

                .mdp-rendered li {
                    margin: 0.5em 0;
                }

                .mdp-rendered a {
                    color: var(--bael-accent, #ff3366);
                    text-decoration: none;
                }

                .mdp-rendered a:hover {
                    text-decoration: underline;
                }

                .mdp-rendered table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1em 0;
                }

                .mdp-rendered th, .mdp-rendered td {
                    border: 1px solid var(--bael-border, #2a2a3a);
                    padding: 8px 12px;
                    text-align: left;
                }

                .mdp-rendered th {
                    background: var(--bael-bg-secondary, #12121a);
                    font-weight: 600;
                }

                .mdp-rendered img {
                    max-width: 100%;
                    border-radius: 8px;
                }

                .mdp-rendered hr {
                    border: none;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    margin: 2em 0;
                }

                /* Source Pane */
                .mdp-source {
                    margin: 0;
                    background: transparent;
                    font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
                    font-size: 13px;
                    line-height: 1.6;
                    color: var(--bael-text-secondary, #888);
                    white-space: pre-wrap;
                    word-break: break-word;
                }

                /* Diff Pane */
                .mdp-diff {
                    font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
                    font-size: 13px;
                    line-height: 1.6;
                }

                .diff-line {
                    padding: 2px 8px;
                }

                .diff-add {
                    background: rgba(76, 175, 80, 0.2);
                    color: #4caf50;
                }

                .diff-remove {
                    background: rgba(244, 67, 54, 0.2);
                    color: #f44336;
                }

                .diff-unchanged {
                    color: var(--bael-text-muted, #666);
                }

                .mdp-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                }

                .mdp-stats {
                    display: flex;
                    gap: 8px;
                }

                .mdp-divider {
                    color: var(--bael-border, #2a2a3a);
                }

                .mdp-format {
                    font-weight: 500;
                    color: var(--bael-accent, #ff3366);
                }

                /* Code syntax highlighting */
                .mdp-rendered .token.comment { color: #6a737d; }
                .mdp-rendered .token.string { color: #9ecbff; }
                .mdp-rendered .token.keyword { color: #ff7b72; }
                .mdp-rendered .token.number { color: #79c0ff; }
                .mdp-rendered .token.function { color: #d2a8ff; }
                .mdp-rendered .token.operator { color: #ff7b72; }
            `;
      document.head.appendChild(styles);
    }

    bindEvents() {
      const tabs = this.previewPanel.querySelectorAll(".mdp-tab");
      tabs.forEach((tab) => {
        tab.addEventListener("click", () => {
          tabs.forEach((t) => t.classList.remove("active"));
          tab.classList.add("active");

          const panes = this.previewPanel.querySelectorAll(".mdp-pane");
          panes.forEach((p) => p.classList.remove("active"));
          this.previewPanel
            .querySelector(`[data-pane="${tab.dataset.tab}"]`)
            ?.classList.add("active");
        });
      });

      this.previewPanel
        .querySelector("#mdp-close")
        .addEventListener("click", () => this.close());
      this.previewPanel
        .querySelector("#mdp-copy")
        .addEventListener("click", () => this.copyContent());
      this.previewPanel
        .querySelector("#mdp-fullscreen")
        .addEventListener("click", () => this.toggleFullscreen());
      this.previewPanel
        .querySelector("#mdp-sync-scroll")
        .addEventListener("change", (e) => {
          this.syncScroll = e.target.checked;
        });

      // Keyboard shortcuts
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen) {
          this.close();
        }
        // Ctrl+Shift+P for preview
        if (e.ctrlKey && e.shiftKey && e.key === "M") {
          e.preventDefault();
          this.previewSelection();
        }
      });
    }

    open(content, previousContent = null) {
      this.currentContent = content;

      // Render preview
      this.previewPanel.querySelector(".mdp-rendered").innerHTML =
        this.renderMarkdown(content);

      // Show source
      this.previewPanel.querySelector(".mdp-source code").textContent = content;

      // Show diff if previous content provided
      if (previousContent) {
        this.previewPanel.querySelector(".mdp-diff").innerHTML =
          this.createDiff(previousContent, content);
      }

      // Update stats
      this.updateStats(content);

      this.previewPanel.classList.add("open");
      this.isOpen = true;
    }

    close() {
      this.previewPanel.classList.remove("open");
      this.isOpen = false;
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else if (this.currentContent) {
        this.previewPanel.classList.add("open");
        this.isOpen = true;
      }
    }

    toggleFullscreen() {
      this.previewPanel.classList.toggle("fullscreen");
    }

    previewSelection() {
      const selection = window.getSelection().toString();
      if (selection) {
        this.open(selection);
      }
    }

    renderMarkdown(text) {
      if (!text) return "";

      // Basic markdown rendering
      let html = text
        // Escape HTML
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        // Headers
        .replace(/^###### (.+)$/gm, "<h6>$1</h6>")
        .replace(/^##### (.+)$/gm, "<h5>$1</h5>")
        .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
        .replace(/^### (.+)$/gm, "<h3>$1</h3>")
        .replace(/^## (.+)$/gm, "<h2>$1</h2>")
        .replace(/^# (.+)$/gm, "<h1>$1</h1>")
        // Bold & Italic
        .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/___(.+?)___/g, "<strong><em>$1</em></strong>")
        .replace(/__(.+?)__/g, "<strong>$1</strong>")
        .replace(/_(.+?)_/g, "<em>$1</em>")
        // Strikethrough
        .replace(/~~(.+?)~~/g, "<del>$1</del>")
        // Code blocks
        .replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
          return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
        })
        // Inline code
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        // Blockquotes
        .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
        // Horizontal rule
        .replace(/^(-{3,}|_{3,}|\*{3,})$/gm, "<hr>")
        // Links
        .replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" target="_blank" rel="noopener">$1</a>',
        )
        // Images
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
        // Unordered lists
        .replace(/^[\s]*[-*+] (.+)$/gm, "<li>$1</li>")
        // Ordered lists
        .replace(/^[\s]*(\d+)\. (.+)$/gm, "<li>$2</li>")
        // Paragraphs
        .replace(/\n\n/g, "</p><p>")
        // Line breaks
        .replace(/\n/g, "<br>");

      // Wrap in paragraph tags
      html = "<p>" + html + "</p>";

      // Fix nested blockquotes
      html = html.replace(/<\/blockquote><br><blockquote>/g, "<br>");

      // Wrap list items
      html = html.replace(/(<li>.*<\/li>)+/gs, "<ul>$&</ul>");

      return html;
    }

    createDiff(oldText, newText) {
      const oldLines = oldText.split("\n");
      const newLines = newText.split("\n");
      const diff = [];

      // Simple line-by-line diff
      const maxLines = Math.max(oldLines.length, newLines.length);

      for (let i = 0; i < maxLines; i++) {
        const oldLine = oldLines[i];
        const newLine = newLines[i];

        if (oldLine === undefined) {
          diff.push(
            `<div class="diff-line diff-add">+ ${this.escapeHtml(newLine)}</div>`,
          );
        } else if (newLine === undefined) {
          diff.push(
            `<div class="diff-line diff-remove">- ${this.escapeHtml(oldLine)}</div>`,
          );
        } else if (oldLine !== newLine) {
          diff.push(
            `<div class="diff-line diff-remove">- ${this.escapeHtml(oldLine)}</div>`,
          );
          diff.push(
            `<div class="diff-line diff-add">+ ${this.escapeHtml(newLine)}</div>`,
          );
        } else {
          diff.push(
            `<div class="diff-line diff-unchanged">  ${this.escapeHtml(oldLine)}</div>`,
          );
        }
      }

      return diff.join("");
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    updateStats(content) {
      const words = content
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length;
      const chars = content.length;
      const lines = content.split("\n").length;

      this.previewPanel.querySelector("#mdp-word-count").textContent =
        `${words} words`;
      this.previewPanel.querySelector("#mdp-char-count").textContent =
        `${chars} chars`;
      this.previewPanel.querySelector("#mdp-line-count").textContent =
        `${lines} lines`;
    }

    copyContent() {
      navigator.clipboard.writeText(this.currentContent);
      if (window.Bael?.notifications) {
        window.Bael.notifications.success("Copied to clipboard");
      }
    }

    // Static method to preview a message
    static previewMessage(messageEl) {
      const content = messageEl?.querySelector(".message-content")?.textContent;
      if (content && window.BaelMarkdownPreview) {
        window.BaelMarkdownPreview.open(content);
      }
    }
  }

  // Initialize
  window.BaelMarkdownPreview = new BaelMarkdownPreview();
})();
