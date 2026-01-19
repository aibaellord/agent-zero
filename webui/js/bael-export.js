/**
 * BAEL - LORD OF ALL
 * Advanced Export System - Export chats in multiple formats
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelExport {
    constructor() {
      this.isOpen = false;
      this.container = null;
      this.currentChat = null;
      this.exportOptions = {
        format: "markdown",
        includeMetadata: true,
        includeTimestamps: true,
        includeSystemMessages: false,
        theme: "dark",
        codeHighlighting: true,
      };
      this.init();
    }

    init() {
      this.createExportModal();
      this.registerShortcuts();
      console.log("⚡ Bael Export System initialized");
    }

    createExportModal() {
      const modal = document.createElement("div");
      modal.id = "bael-export";
      modal.className = "bael-export";
      modal.innerHTML = `
                <div class="export-overlay"></div>
                <div class="export-modal">
                    <div class="export-header">
                        <div class="export-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                <polyline points="7 10 12 15 17 10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            <span>Export Conversation</span>
                        </div>
                        <button class="export-close" title="Close">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>

                    <div class="export-body">
                        <div class="export-section">
                            <h3>Export Format</h3>
                            <div class="export-formats">
                                <label class="format-option">
                                    <input type="radio" name="export-format" value="markdown" checked>
                                    <div class="format-card">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                            <polyline points="14 2 14 8 20 8"/>
                                            <line x1="16" y1="13" x2="8" y2="13"/>
                                            <line x1="16" y1="17" x2="8" y2="17"/>
                                        </svg>
                                        <span class="format-name">Markdown</span>
                                        <span class="format-ext">.md</span>
                                    </div>
                                </label>
                                <label class="format-option">
                                    <input type="radio" name="export-format" value="html">
                                    <div class="format-card">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="16 18 22 12 16 6"/>
                                            <polyline points="8 6 2 12 8 18"/>
                                        </svg>
                                        <span class="format-name">HTML</span>
                                        <span class="format-ext">.html</span>
                                    </div>
                                </label>
                                <label class="format-option">
                                    <input type="radio" name="export-format" value="json">
                                    <div class="format-card">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M4 6c0-1.1.9-2 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z"/>
                                            <path d="M8 10h.01"/>
                                            <path d="M12 10h.01"/>
                                            <path d="M16 10h.01"/>
                                            <path d="M8 14h.01"/>
                                            <path d="M12 14h.01"/>
                                            <path d="M16 14h.01"/>
                                        </svg>
                                        <span class="format-name">JSON</span>
                                        <span class="format-ext">.json</span>
                                    </div>
                                </label>
                                <label class="format-option">
                                    <input type="radio" name="export-format" value="pdf">
                                    <div class="format-card">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                            <polyline points="14 2 14 8 20 8"/>
                                        </svg>
                                        <span class="format-name">PDF</span>
                                        <span class="format-ext">.pdf</span>
                                    </div>
                                </label>
                                <label class="format-option">
                                    <input type="radio" name="export-format" value="txt">
                                    <div class="format-card">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                            <polyline points="14 2 14 8 20 8"/>
                                            <line x1="16" y1="13" x2="8" y2="13"/>
                                            <line x1="16" y1="17" x2="8" y2="17"/>
                                            <line x1="10" y1="9" x2="8" y2="9"/>
                                        </svg>
                                        <span class="format-name">Plain Text</span>
                                        <span class="format-ext">.txt</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div class="export-section">
                            <h3>Options</h3>
                            <div class="export-options">
                                <label class="option-toggle">
                                    <input type="checkbox" id="opt-metadata" checked>
                                    <span class="toggle-slider"></span>
                                    <span class="option-label">Include metadata (title, date)</span>
                                </label>
                                <label class="option-toggle">
                                    <input type="checkbox" id="opt-timestamps" checked>
                                    <span class="toggle-slider"></span>
                                    <span class="option-label">Include timestamps</span>
                                </label>
                                <label class="option-toggle">
                                    <input type="checkbox" id="opt-system">
                                    <span class="toggle-slider"></span>
                                    <span class="option-label">Include system messages</span>
                                </label>
                                <label class="option-toggle">
                                    <input type="checkbox" id="opt-code-highlight" checked>
                                    <span class="toggle-slider"></span>
                                    <span class="option-label">Syntax highlighting (HTML/PDF)</span>
                                </label>
                            </div>
                        </div>

                        <div class="export-section html-options hidden">
                            <h3>HTML Theme</h3>
                            <div class="theme-options">
                                <label class="theme-option">
                                    <input type="radio" name="html-theme" value="dark" checked>
                                    <div class="theme-preview dark">
                                        <span>Dark</span>
                                    </div>
                                </label>
                                <label class="theme-option">
                                    <input type="radio" name="html-theme" value="light">
                                    <div class="theme-preview light">
                                        <span>Light</span>
                                    </div>
                                </label>
                                <label class="theme-option">
                                    <input type="radio" name="html-theme" value="bael">
                                    <div class="theme-preview bael">
                                        <span>Bael</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div class="export-preview">
                            <h3>Preview</h3>
                            <div class="preview-container">
                                <pre class="preview-content"></pre>
                            </div>
                        </div>
                    </div>

                    <div class="export-footer">
                        <div class="export-info">
                            <span class="chat-title"></span>
                            <span class="message-count"></span>
                        </div>
                        <div class="export-actions">
                            <button class="export-btn secondary" data-action="copy">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                                </svg>
                                Copy to Clipboard
                            </button>
                            <button class="export-btn primary" data-action="download">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="7 10 12 15 17 10"/>
                                    <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            `;

      document.body.appendChild(modal);
      this.container = modal;

      this.bindEvents();
      this.addStyles();
    }

    addStyles() {
      if (document.getElementById("bael-export-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-export-styles";
      styles.textContent = `
                .bael-export {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10001;
                    display: none;
                    align-items: center;
                    justify-content: center;
                }

                .bael-export.open {
                    display: flex;
                }

                .export-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(4px);
                }

                .export-modal {
                    position: relative;
                    width: 90%;
                    max-width: 700px;
                    max-height: 85vh;
                    background: var(--bael-bg-secondary, #12121a);
                    border-radius: 16px;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    animation: exportIn 0.3s ease;
                }

                @keyframes exportIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                .export-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .export-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .export-close {
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

                .export-close:hover {
                    background: #ff4444;
                    color: #fff;
                }

                .export-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                }

                .export-section {
                    margin-bottom: 24px;
                }

                .export-section h3 {
                    font-size: 13px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--bael-text-secondary, #888);
                    margin-bottom: 12px;
                }

                .export-section.hidden {
                    display: none;
                }

                .export-formats {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .format-option {
                    cursor: pointer;
                }

                .format-option input {
                    display: none;
                }

                .format-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                    padding: 16px 24px;
                    border-radius: 12px;
                    background: var(--bael-bg-tertiary, #1a1a25);
                    border: 2px solid transparent;
                    transition: all 0.2s ease;
                }

                .format-option:hover .format-card {
                    border-color: var(--bael-border, #2a2a3a);
                }

                .format-option input:checked + .format-card {
                    border-color: var(--bael-accent, #ff3366);
                    background: var(--bael-accent-dim, rgba(255, 51, 102, 0.1));
                }

                .format-card svg {
                    color: var(--bael-text-secondary, #888);
                    transition: color 0.2s ease;
                }

                .format-option input:checked + .format-card svg {
                    color: var(--bael-accent, #ff3366);
                }

                .format-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .format-ext {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .export-options {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .option-toggle {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                }

                .option-toggle input {
                    display: none;
                }

                .toggle-slider {
                    width: 44px;
                    height: 24px;
                    background: var(--bael-bg-tertiary, #1a1a25);
                    border-radius: 12px;
                    position: relative;
                    transition: background 0.2s ease;
                }

                .toggle-slider::after {
                    content: '';
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 20px;
                    height: 20px;
                    background: var(--bael-text-secondary, #888);
                    border-radius: 50%;
                    transition: all 0.2s ease;
                }

                .option-toggle input:checked + .toggle-slider {
                    background: var(--bael-accent, #ff3366);
                }

                .option-toggle input:checked + .toggle-slider::after {
                    left: 22px;
                    background: #fff;
                }

                .option-label {
                    font-size: 14px;
                    color: var(--bael-text-primary, #fff);
                }

                .theme-options {
                    display: flex;
                    gap: 12px;
                }

                .theme-option {
                    cursor: pointer;
                }

                .theme-option input {
                    display: none;
                }

                .theme-preview {
                    width: 100px;
                    height: 60px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid transparent;
                    transition: all 0.2s ease;
                    font-size: 12px;
                    font-weight: 600;
                }

                .theme-preview.dark {
                    background: #1a1a25;
                    color: #fff;
                }

                .theme-preview.light {
                    background: #f5f5f5;
                    color: #333;
                }

                .theme-preview.bael {
                    background: linear-gradient(135deg, #1a1a25, #2a1a2e);
                    color: #ff3366;
                }

                .theme-option input:checked + .theme-preview {
                    border-color: var(--bael-accent, #ff3366);
                }

                .export-preview {
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    padding-top: 20px;
                }

                .preview-container {
                    background: var(--bael-bg-primary, #0a0a0f);
                    border-radius: 8px;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    max-height: 200px;
                    overflow: auto;
                }

                .preview-content {
                    padding: 16px;
                    margin: 0;
                    font-size: 12px;
                    font-family: 'Fira Code', 'Monaco', monospace;
                    color: var(--bael-text-secondary, #888);
                    white-space: pre-wrap;
                    word-break: break-word;
                }

                .export-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                }

                .export-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .export-info .chat-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .export-info .message-count {
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                }

                .export-actions {
                    display: flex;
                    gap: 12px;
                }

                .export-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 18px;
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .export-btn.secondary {
                    background: var(--bael-bg-tertiary, #1a1a25);
                    color: var(--bael-text-primary, #fff);
                }

                .export-btn.secondary:hover {
                    background: var(--bael-bg-primary, #0a0a0f);
                }

                .export-btn.primary {
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .export-btn.primary:hover {
                    background: var(--bael-accent-light, #ff4d7a);
                    transform: translateY(-1px);
                }
            `;
      document.head.appendChild(styles);
    }

    bindEvents() {
      // Close
      this.container
        .querySelector(".export-overlay")
        .addEventListener("click", () => this.close());
      this.container
        .querySelector(".export-close")
        .addEventListener("click", () => this.close());

      // Format selection
      this.container
        .querySelectorAll('input[name="export-format"]')
        .forEach((input) => {
          input.addEventListener("change", () => {
            this.exportOptions.format = input.value;
            this.updatePreview();

            // Show/hide HTML options
            const htmlOptions = this.container.querySelector(".html-options");
            htmlOptions.classList.toggle(
              "hidden",
              !["html", "pdf"].includes(input.value),
            );
          });
        });

      // Theme selection
      this.container
        .querySelectorAll('input[name="html-theme"]')
        .forEach((input) => {
          input.addEventListener("change", () => {
            this.exportOptions.theme = input.value;
            this.updatePreview();
          });
        });

      // Options
      this.container
        .querySelector("#opt-metadata")
        .addEventListener("change", (e) => {
          this.exportOptions.includeMetadata = e.target.checked;
          this.updatePreview();
        });

      this.container
        .querySelector("#opt-timestamps")
        .addEventListener("change", (e) => {
          this.exportOptions.includeTimestamps = e.target.checked;
          this.updatePreview();
        });

      this.container
        .querySelector("#opt-system")
        .addEventListener("change", (e) => {
          this.exportOptions.includeSystemMessages = e.target.checked;
          this.updatePreview();
        });

      this.container
        .querySelector("#opt-code-highlight")
        .addEventListener("change", (e) => {
          this.exportOptions.codeHighlighting = e.target.checked;
        });

      // Actions
      this.container
        .querySelector('[data-action="copy"]')
        .addEventListener("click", () => this.copyToClipboard());
      this.container
        .querySelector('[data-action="download"]')
        .addEventListener("click", () => this.download());

      // Escape to close
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen) {
          this.close();
        }
      });
    }

    async open(chatId = null) {
      this.isOpen = true;
      this.container.classList.add("open");

      // Get current chat if not specified
      if (!chatId) {
        try {
          const currentChat = Alpine.store("chats")?.current;
          chatId = currentChat?.id;
        } catch (e) {}
      }

      if (chatId) {
        await this.loadChat(chatId);
      }
    }

    close() {
      this.isOpen = false;
      this.container.classList.remove("open");
    }

    async loadChat(chatId) {
      try {
        const response = await fetch(`/get_chat_messages?chat_id=${chatId}`);
        if (!response.ok) throw new Error("Failed to load chat");

        const data = await response.json();

        // Get chat title
        let chatTitle = `Chat ${chatId}`;
        try {
          const chat = Alpine.store("chats")?.all?.find((c) => c.id === chatId);
          if (chat?.title) chatTitle = chat.title;
        } catch (e) {}

        this.currentChat = {
          id: chatId,
          title: chatTitle,
          messages: data.messages || [],
          createdAt: data.created_at || new Date().toISOString(),
        };

        // Update UI
        this.container.querySelector(".chat-title").textContent = chatTitle;
        this.container.querySelector(".message-count").textContent =
          `${this.currentChat.messages.length} messages`;

        this.updatePreview();
      } catch (e) {
        console.error("Error loading chat:", e);
        if (window.Bael?.notifications) {
          window.Bael.notifications.error("Failed to load chat");
        }
      }
    }

    updatePreview() {
      if (!this.currentChat) return;

      const preview = this.container.querySelector(".preview-content");
      const content = this.generateExport(true);
      preview.textContent =
        content.substring(0, 1000) +
        (content.length > 1000 ? "\n\n... (truncated)" : "");
    }

    generateExport(preview = false) {
      if (!this.currentChat) return "";

      const {
        format,
        includeMetadata,
        includeTimestamps,
        includeSystemMessages,
      } = this.exportOptions;
      const { title, messages, createdAt } = this.currentChat;

      // Filter messages
      let filteredMessages = messages;
      if (!includeSystemMessages) {
        filteredMessages = messages.filter((m) => m.role !== "system");
      }

      switch (format) {
        case "markdown":
          return this.generateMarkdown(
            title,
            filteredMessages,
            createdAt,
            includeMetadata,
            includeTimestamps,
          );
        case "html":
          return this.generateHTML(
            title,
            filteredMessages,
            createdAt,
            includeMetadata,
            includeTimestamps,
          );
        case "json":
          return this.generateJSON(
            title,
            filteredMessages,
            createdAt,
            includeMetadata,
          );
        case "txt":
          return this.generatePlainText(
            title,
            filteredMessages,
            createdAt,
            includeMetadata,
            includeTimestamps,
          );
        case "pdf":
          // PDF uses HTML generation then converts
          return this.generateHTML(
            title,
            filteredMessages,
            createdAt,
            includeMetadata,
            includeTimestamps,
          );
        default:
          return "";
      }
    }

    generateMarkdown(
      title,
      messages,
      createdAt,
      includeMetadata,
      includeTimestamps,
    ) {
      let md = "";

      if (includeMetadata) {
        md += `# ${title}\n\n`;
        md += `> Exported from Bael - Lord Of All\n`;
        md += `> Date: ${new Date(createdAt).toLocaleString()}\n\n`;
        md += `---\n\n`;
      }

      messages.forEach((msg) => {
        const role = msg.role === "user" ? "👤 **User**" : "🤖 **Bael**";
        const timestamp =
          includeTimestamps && msg.timestamp
            ? ` _(${new Date(msg.timestamp).toLocaleTimeString()})_`
            : "";

        md += `### ${role}${timestamp}\n\n`;
        md += `${msg.content}\n\n`;
      });

      return md;
    }

    generateHTML(
      title,
      messages,
      createdAt,
      includeMetadata,
      includeTimestamps,
    ) {
      const theme = this.exportOptions.theme;
      const themeStyles = this.getThemeStyles(theme);

      let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(title)} - Bael Export</title>
    <style>
        ${themeStyles}
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .header {
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--border);
        }
        .header h1 {
            margin: 0 0 10px;
        }
        .header .meta {
            font-size: 14px;
            opacity: 0.7;
        }
        .message {
            margin-bottom: 24px;
            padding: 16px 20px;
            border-radius: 12px;
        }
        .message.user {
            background: var(--user-bg);
            border-left: 4px solid var(--accent);
        }
        .message.assistant {
            background: var(--assistant-bg);
            border-left: 4px solid var(--secondary);
        }
        .message-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        .message-role {
            font-weight: 600;
            font-size: 14px;
        }
        .message-time {
            font-size: 12px;
            opacity: 0.6;
        }
        .message-content {
            font-size: 15px;
        }
        pre {
            background: var(--code-bg);
            padding: 12px;
            border-radius: 8px;
            overflow-x: auto;
        }
        code {
            font-family: 'Fira Code', monospace;
            font-size: 13px;
        }
    </style>
</head>
<body>`;

      if (includeMetadata) {
        html += `
    <div class="header">
        <h1>${this.escapeHtml(title)}</h1>
        <div class="meta">
            Exported from Bael - Lord Of All • ${new Date(createdAt).toLocaleString()}
        </div>
    </div>`;
      }

      messages.forEach((msg) => {
        const roleDisplay = msg.role === "user" ? "👤 User" : "🤖 Bael";
        const timestamp =
          includeTimestamps && msg.timestamp
            ? `<span class="message-time">${new Date(msg.timestamp).toLocaleTimeString()}</span>`
            : "";

        html += `
    <div class="message ${msg.role}">
        <div class="message-header">
            <span class="message-role">${roleDisplay}</span>
            ${timestamp}
        </div>
        <div class="message-content">${this.formatContent(msg.content)}</div>
    </div>`;
      });

      html += `
</body>
</html>`;

      return html;
    }

    getThemeStyles(theme) {
      switch (theme) {
        case "dark":
          return `
                        :root {
                            --bg: #0a0a0f;
                            --text: #ffffff;
                            --border: #2a2a3a;
                            --accent: #ff3366;
                            --secondary: #00ffcc;
                            --user-bg: rgba(255, 51, 102, 0.1);
                            --assistant-bg: rgba(255, 255, 255, 0.05);
                            --code-bg: #1a1a25;
                        }
                        body { background: var(--bg); color: var(--text); }
                    `;
        case "light":
          return `
                        :root {
                            --bg: #ffffff;
                            --text: #333333;
                            --border: #e0e0e0;
                            --accent: #ff3366;
                            --secondary: #00aa88;
                            --user-bg: rgba(255, 51, 102, 0.08);
                            --assistant-bg: #f5f5f5;
                            --code-bg: #f0f0f0;
                        }
                        body { background: var(--bg); color: var(--text); }
                    `;
        case "bael":
          return `
                        :root {
                            --bg: linear-gradient(135deg, #0a0a0f, #1a0a15);
                            --text: #ffffff;
                            --border: #3a1a2a;
                            --accent: #ff3366;
                            --secondary: #00ffcc;
                            --user-bg: rgba(255, 51, 102, 0.15);
                            --assistant-bg: rgba(0, 255, 204, 0.05);
                            --code-bg: #1a0a15;
                        }
                        body { background: var(--bg); color: var(--text); }
                    `;
        default:
          return "";
      }
    }

    generateJSON(title, messages, createdAt, includeMetadata) {
      const data = {
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
          ...(m.timestamp && { timestamp: m.timestamp }),
        })),
      };

      if (includeMetadata) {
        data.metadata = {
          title,
          exportedAt: new Date().toISOString(),
          createdAt,
          source: "Bael - Lord Of All",
          messageCount: messages.length,
        };
      }

      return JSON.stringify(data, null, 2);
    }

    generatePlainText(
      title,
      messages,
      createdAt,
      includeMetadata,
      includeTimestamps,
    ) {
      let txt = "";

      if (includeMetadata) {
        txt += `${title}\n`;
        txt += `${"=".repeat(title.length)}\n\n`;
        txt += `Exported from Bael - Lord Of All\n`;
        txt += `Date: ${new Date(createdAt).toLocaleString()}\n\n`;
        txt += `${"-".repeat(50)}\n\n`;
      }

      messages.forEach((msg) => {
        const role = msg.role === "user" ? "User" : "Bael";
        const timestamp =
          includeTimestamps && msg.timestamp
            ? ` (${new Date(msg.timestamp).toLocaleTimeString()})`
            : "";

        txt += `[${role}]${timestamp}\n`;
        txt += `${msg.content}\n\n`;
      });

      return txt;
    }

    formatContent(content) {
      // Basic HTML escaping and formatting
      let formatted = this.escapeHtml(content);

      // Convert code blocks
      formatted = formatted.replace(
        /```(\w+)?\n([\s\S]*?)```/g,
        "<pre><code>$2</code></pre>",
      );

      // Convert inline code
      formatted = formatted.replace(/`([^`]+)`/g, "<code>$1</code>");

      // Convert newlines
      formatted = formatted.replace(/\n/g, "<br>");

      return formatted;
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text || "";
      return div.innerHTML;
    }

    async copyToClipboard() {
      const content = this.generateExport();

      try {
        await navigator.clipboard.writeText(content);
        if (window.Bael?.notifications) {
          window.Bael.notifications.success("Copied to clipboard");
        }
      } catch (e) {
        console.error("Failed to copy:", e);
        if (window.Bael?.notifications) {
          window.Bael.notifications.error("Failed to copy to clipboard");
        }
      }
    }

    download() {
      const content = this.generateExport();
      const { format } = this.exportOptions;
      const { title } = this.currentChat;

      const extensions = {
        markdown: "md",
        html: "html",
        json: "json",
        txt: "txt",
        pdf: "html", // PDF starts as HTML
      };

      const mimeTypes = {
        markdown: "text/markdown",
        html: "text/html",
        json: "application/json",
        txt: "text/plain",
        pdf: "text/html",
      };

      const filename = `${this.sanitizeFilename(title)}.${extensions[format]}`;
      const blob = new Blob([content], { type: mimeTypes[format] });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();

      URL.revokeObjectURL(link.href);

      if (window.Bael?.notifications) {
        window.Bael.notifications.success(`Downloaded ${filename}`);
      }

      this.close();
    }

    sanitizeFilename(name) {
      return name.replace(/[^a-z0-9]/gi, "_").substring(0, 50);
    }

    registerShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Ctrl+E = Export
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "e") {
          e.preventDefault();
          this.open();
        }
      });

      // Register with command palette
      if (window.BaelCommandPalette) {
        window.BaelCommandPalette.registerCommand({
          id: "export:open",
          title: "Export Current Chat",
          category: "Export",
          shortcut: "Ctrl+E",
          handler: () => this.open(),
        });
      }
    }
  }

  // Initialize
  window.BaelExport = new BaelExport();
})();
