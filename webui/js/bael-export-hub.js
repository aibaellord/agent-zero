/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ███████╗██╗  ██╗██████╗  ██████╗ ██████╗ ████████╗                      █
 * █  ██╔════╝╚██╗██╔╝██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝                      █
 * █  █████╗   ╚███╔╝ ██████╔╝██║   ██║██████╔╝   ██║                         █
 * █  ██╔══╝   ██╔██╗ ██╔═══╝ ██║   ██║██╔══██╗   ██║                         █
 * █  ███████╗██╔╝ ██╗██║     ╚██████╔╝██║  ██║   ██║                         █
 * █  ╚══════╝╚═╝  ╚═╝╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝                         █
 * █                                                                          █
 * █   BAEL EXPORT HUB - Multi-Format Conversation Export                    █
 * █   Export chats to Markdown, PDF, JSON, HTML, and more                   █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelExportHub {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
    }

    async initialize() {
      console.log("📤 Bael Export Hub initializing...");

      this.injectStyles();
      this.createButton();
      this.createPanel();
      this.setupShortcuts();

      this.initialized = true;
      console.log("✅ BAEL EXPORT HUB READY (Ctrl+Shift+E)");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-exporthub-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-exporthub-styles";
      styles.textContent = `
                /* Button */
                .bael-exporthub-btn {
                    position: fixed;
                    left: 20px;
                    bottom: 190px;
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #ec4899, #db2777);
                    border: none;
                    color: #fff;
                    font-size: 18px;
                    cursor: pointer;
                    z-index: 9300;
                    box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);
                    transition: all 0.3s;
                }

                .bael-exporthub-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(236, 72, 153, 0.5);
                }

                /* Panel */
                .bael-exporthub-panel {
                    position: fixed;
                    left: 20px;
                    bottom: 240px;
                    width: 320px;
                    background: #12121a;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    z-index: 9400;
                    display: none;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                }

                .bael-exporthub-panel.visible {
                    display: block;
                    animation: exportIn 0.25s ease-out;
                }

                @keyframes exportIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .exporthub-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .exporthub-title {
                    font-size: 15px;
                    font-weight: 700;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .exporthub-close {
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 14px;
                }

                .exporthub-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                /* Stats */
                .exporthub-stats {
                    padding: 12px 16px;
                    background: rgba(255, 255, 255, 0.02);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    display: flex;
                    gap: 16px;
                }

                .exporthub-stat {
                    text-align: center;
                }

                .stat-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: #fff;
                }

                .stat-label {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.4);
                }

                /* Format Grid */
                .exporthub-formats {
                    padding: 16px;
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 10px;
                }

                .exporthub-format {
                    padding: 16px;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    background: rgba(255, 255, 255, 0.02);
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: center;
                }

                .exporthub-format:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.15);
                    transform: translateY(-2px);
                }

                .format-icon {
                    font-size: 28px;
                    margin-bottom: 8px;
                }

                .format-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 2px;
                }

                .format-desc {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.4);
                }

                /* Options */
                .exporthub-options {
                    padding: 12px 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }

                .exporthub-option {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 0;
                }

                .option-label {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.7);
                }

                .option-toggle {
                    width: 40px;
                    height: 22px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 11px;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.2s;
                }

                .option-toggle.active {
                    background: rgba(236, 72, 153, 0.5);
                }

                .option-toggle::after {
                    content: '';
                    position: absolute;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #fff;
                    top: 2px;
                    left: 2px;
                    transition: transform 0.2s;
                }

                .option-toggle.active::after {
                    transform: translateX(18px);
                }

                /* Progress */
                .exporthub-progress {
                    padding: 16px;
                    text-align: center;
                    display: none;
                }

                .exporthub-progress.visible {
                    display: block;
                }

                .progress-bar {
                    height: 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                    overflow: hidden;
                    margin-bottom: 8px;
                }

                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #ec4899, #db2777);
                    border-radius: 3px;
                    transition: width 0.3s;
                }

                .progress-text {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                }
            `;
      document.head.appendChild(styles);
    }

    createButton() {
      this.button = document.createElement("button");
      this.button.className = "bael-exporthub-btn";
      this.button.innerHTML = "📤";
      this.button.title = "Export Hub (Ctrl+Shift+E)";
      this.button.onclick = () => this.toggle();
      document.body.appendChild(this.button);
    }

    createPanel() {
      this.panel = document.createElement("div");
      this.panel.className = "bael-exporthub-panel";
      document.body.appendChild(this.panel);
    }

    renderPanel() {
      const messages = this.getMessages();
      const wordCount = messages.reduce(
        (sum, m) => sum + (m.text?.split(/\s+/).length || 0),
        0,
      );

      this.panel.innerHTML = `
                <div class="exporthub-header">
                    <div class="exporthub-title">
                        <span>📤</span>
                        Export Hub
                    </div>
                    <button class="exporthub-close" onclick="BaelExportHub.hide()">✕</button>
                </div>

                <div class="exporthub-stats">
                    <div class="exporthub-stat">
                        <div class="stat-value">${messages.length}</div>
                        <div class="stat-label">Messages</div>
                    </div>
                    <div class="exporthub-stat">
                        <div class="stat-value">${this.formatNumber(wordCount)}</div>
                        <div class="stat-label">Words</div>
                    </div>
                    <div class="exporthub-stat">
                        <div class="stat-value">${this.estimateTokens(wordCount)}</div>
                        <div class="stat-label">~Tokens</div>
                    </div>
                </div>

                <div class="exporthub-formats">
                    <div class="exporthub-format" onclick="BaelExportHub.exportAs('markdown')">
                        <div class="format-icon">📝</div>
                        <div class="format-name">Markdown</div>
                        <div class="format-desc">.md file</div>
                    </div>
                    <div class="exporthub-format" onclick="BaelExportHub.exportAs('json')">
                        <div class="format-icon">📊</div>
                        <div class="format-name">JSON</div>
                        <div class="format-desc">Structured data</div>
                    </div>
                    <div class="exporthub-format" onclick="BaelExportHub.exportAs('html')">
                        <div class="format-icon">🌐</div>
                        <div class="format-name">HTML</div>
                        <div class="format-desc">Web page</div>
                    </div>
                    <div class="exporthub-format" onclick="BaelExportHub.exportAs('text')">
                        <div class="format-icon">📄</div>
                        <div class="format-name">Plain Text</div>
                        <div class="format-desc">.txt file</div>
                    </div>
                    <div class="exporthub-format" onclick="BaelExportHub.copyToClipboard()">
                        <div class="format-icon">📋</div>
                        <div class="format-name">Clipboard</div>
                        <div class="format-desc">Copy all</div>
                    </div>
                    <div class="exporthub-format" onclick="BaelExportHub.exportAs('csv')">
                        <div class="format-icon">📈</div>
                        <div class="format-name">CSV</div>
                        <div class="format-desc">Spreadsheet</div>
                    </div>
                </div>

                <div class="exporthub-options">
                    <div class="exporthub-option">
                        <span class="option-label">Include timestamps</span>
                        <div class="option-toggle active" id="opt-timestamps" onclick="this.classList.toggle('active')"></div>
                    </div>
                    <div class="exporthub-option">
                        <span class="option-label">Include metadata</span>
                        <div class="option-toggle" id="opt-metadata" onclick="this.classList.toggle('active')"></div>
                    </div>
                </div>

                <div class="exporthub-progress" id="export-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
                    </div>
                    <div class="progress-text" id="progress-text">Preparing export...</div>
                </div>
            `;
    }

    getMessages() {
      const messages = [];

      document
        .querySelectorAll('[class*="message"], .message, [role="article"]')
        .forEach((el, index) => {
          const text = el.textContent?.trim();
          if (!text) return;

          const isUser =
            el.classList.contains("user") ||
            el.querySelector('[class*="user"]') ||
            el.getAttribute("data-role") === "user";

          messages.push({
            index: index + 1,
            role: isUser ? "user" : "assistant",
            text: text,
            timestamp: new Date().toISOString(),
          });
        });

      return messages;
    }

    formatNumber(num) {
      if (num >= 1000) return (num / 1000).toFixed(1) + "K";
      return num.toString();
    }

    estimateTokens(words) {
      // Rough estimate: 1 word ≈ 1.3 tokens
      return this.formatNumber(Math.round(words * 1.3));
    }

    exportAs(format) {
      const messages = this.getMessages();
      const includeTimestamps = document
        .getElementById("opt-timestamps")
        ?.classList.contains("active");
      const includeMetadata = document
        .getElementById("opt-metadata")
        ?.classList.contains("active");

      this.showProgress();

      setTimeout(() => {
        let content, filename, mimeType;

        switch (format) {
          case "markdown":
            content = this.toMarkdown(
              messages,
              includeTimestamps,
              includeMetadata,
            );
            filename = "conversation.md";
            mimeType = "text/markdown";
            break;
          case "json":
            content = this.toJSON(messages, includeMetadata);
            filename = "conversation.json";
            mimeType = "application/json";
            break;
          case "html":
            content = this.toHTML(messages, includeTimestamps);
            filename = "conversation.html";
            mimeType = "text/html";
            break;
          case "text":
            content = this.toText(messages);
            filename = "conversation.txt";
            mimeType = "text/plain";
            break;
          case "csv":
            content = this.toCSV(messages);
            filename = "conversation.csv";
            mimeType = "text/csv";
            break;
        }

        this.download(content, filename, mimeType);
        this.hideProgress();
        this.showToast(`Exported as ${format.toUpperCase()}!`);
      }, 500);
    }

    toMarkdown(messages, timestamps, metadata) {
      let md = "# Conversation Export\n\n";

      if (metadata) {
        md += `> Exported on ${new Date().toLocaleString()}\n`;
        md += `> Total messages: ${messages.length}\n\n`;
      }

      messages.forEach((m) => {
        const role = m.role === "user" ? "**You**" : "**Assistant**";
        md += `## ${role}\n`;
        if (timestamps) md += `_${new Date(m.timestamp).toLocaleString()}_\n\n`;
        md += `${m.text}\n\n---\n\n`;
      });

      return md;
    }

    toJSON(messages, metadata) {
      const data = {
        exportedAt: new Date().toISOString(),
        messageCount: messages.length,
        messages: messages,
      };

      if (!metadata) {
        delete data.exportedAt;
      }

      return JSON.stringify(data, null, 2);
    }

    toHTML(messages, timestamps) {
      return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Conversation Export</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; background: #0a0a0f; color: #e5e5e5; }
        .message { margin-bottom: 24px; padding: 16px; border-radius: 12px; background: rgba(255,255,255,0.03); }
        .message.user { border-left: 3px solid #3b82f6; }
        .message.assistant { border-left: 3px solid #10b981; }
        .role { font-weight: 700; margin-bottom: 8px; }
        .user .role { color: #3b82f6; }
        .assistant .role { color: #10b981; }
        .timestamp { font-size: 12px; color: rgba(255,255,255,0.4); margin-bottom: 8px; }
        .text { white-space: pre-wrap; }
    </style>
</head>
<body>
    <h1>Conversation Export</h1>
    ${messages
      .map(
        (m) => `
        <div class="message ${m.role}">
            <div class="role">${m.role === "user" ? "You" : "Assistant"}</div>
            ${timestamps ? `<div class="timestamp">${new Date(m.timestamp).toLocaleString()}</div>` : ""}
            <div class="text">${this.escapeHtml(m.text)}</div>
        </div>
    `,
      )
      .join("")}
</body>
</html>`;
    }

    toText(messages) {
      return messages
        .map((m) => `${m.role.toUpperCase()}:\n${m.text}`)
        .join("\n\n---\n\n");
    }

    toCSV(messages) {
      const header = "Index,Role,Text,Timestamp\n";
      const rows = messages
        .map(
          (m) =>
            `${m.index},"${m.role}","${m.text.replace(/"/g, '""')}","${m.timestamp}"`,
        )
        .join("\n");
      return header + rows;
    }

    copyToClipboard() {
      const messages = this.getMessages();
      const text = this.toText(messages);

      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.showToast("Copied to clipboard!");
        })
        .catch((err) => {
          console.error("Copy failed:", err);
        });
    }

    download(content, filename, mimeType) {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    showProgress() {
      const progress = document.getElementById("export-progress");
      if (progress) {
        progress.classList.add("visible");
        const fill = document.getElementById("progress-fill");
        if (fill) {
          fill.style.width = "0%";
          setTimeout(() => (fill.style.width = "100%"), 50);
        }
      }
    }

    hideProgress() {
      const progress = document.getElementById("export-progress");
      if (progress) progress.classList.remove("visible");
    }

    showToast(message) {
      const toast = document.createElement("div");
      toast.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(236, 72, 153, 0.9);
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
        if (e.ctrlKey && e.shiftKey && e.key === "E") {
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
      this.renderPanel();
      this.panel.classList.add("visible");
    }

    hide() {
      this.visible = false;
      this.panel.classList.remove("visible");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelExportHub = new BaelExportHub();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelExportHub.initialize();
    });
  } else {
    window.BaelExportHub.initialize();
  }

  console.log("📤 Bael Export Hub loaded");
})();
