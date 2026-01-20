/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ██████╗ ███████╗ █████╗ ██████╗     ██╗   ██╗██╗███████╗██╗    ██╗      █
 * █  ██╔══██╗██╔════╝██╔══██╗██╔══██╗    ██║   ██║██║██╔════╝██║    ██║      █
 * █  ██████╔╝█████╗  ███████║██║  ██║    ██║   ██║██║█████╗  ██║ █╗ ██║      █
 * █  ██╔══██╗██╔══╝  ██╔══██║██║  ██║    ╚██╗ ██╔╝██║██╔══╝  ██║███╗██║      █
 * █  ██║  ██║███████╗██║  ██║██████╔╝     ╚████╔╝ ██║███████╗╚███╔███╔╝      █
 * █  ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝       ╚═══╝  ╚═╝╚══════╝ ╚══╝╚══╝       █
 * █                                                                          █
 * █   BAEL READ VIEW - Enhanced Reading Mode & Focus View                   █
 * █   Clean reading experience with focus mode, highlighting, and notes     █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelReadView {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.active = false;
      this.highlights = [];
      this.fontSize = 16;
      this.lineHeight = 1.8;
      this.theme = "dark";
      this.storageKey = "bael-read-view";
    }

    async initialize() {
      console.log("📖 Bael Read View initializing...");

      this.loadSettings();
      this.injectStyles();
      this.createButton();
      this.createOverlay();
      this.setupShortcuts();

      this.initialized = true;
      console.log("✅ BAEL READ VIEW READY (Ctrl+Shift+F)");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-readview-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-readview-styles";
      styles.textContent = `
                /* Toggle Button */
                .bael-readview-btn {
                    position: fixed;
                    right: 20px;
                    bottom: 230px;
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #6366f1, #4f46e5);
                    border: none;
                    color: #fff;
                    font-size: 18px;
                    cursor: pointer;
                    z-index: 9300;
                    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
                    transition: all 0.3s;
                }

                .bael-readview-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
                }

                .bael-readview-btn.active {
                    background: linear-gradient(135deg, #10b981, #059669);
                    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
                }

                /* Read View Overlay */
                .bael-readview-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 9500;
                    display: none;
                    overflow-y: auto;
                }

                .bael-readview-overlay.visible {
                    display: block;
                    animation: readviewIn 0.3s ease-out;
                }

                @keyframes readviewIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .bael-readview-overlay.theme-dark {
                    background: #0a0a0f;
                    color: #e5e5e5;
                }

                .bael-readview-overlay.theme-light {
                    background: #fafafa;
                    color: #1a1a1a;
                }

                .bael-readview-overlay.theme-sepia {
                    background: #f4ecd8;
                    color: #5c4a32;
                }

                /* Toolbar */
                .readview-toolbar {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 50px;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(10px);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 20px;
                    z-index: 9501;
                }

                .theme-light .readview-toolbar {
                    background: rgba(255, 255, 255, 0.9);
                    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
                }

                .theme-sepia .readview-toolbar {
                    background: rgba(244, 236, 216, 0.95);
                    border-bottom: 1px solid rgba(92, 74, 50, 0.2);
                }

                .toolbar-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .theme-light .toolbar-title,
                .theme-sepia .toolbar-title {
                    color: #1a1a1a;
                }

                .toolbar-controls {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .toolbar-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                }

                .theme-light .toolbar-btn,
                .theme-sepia .toolbar-btn {
                    background: rgba(0, 0, 0, 0.05);
                    color: #1a1a1a;
                }

                .toolbar-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }

                .theme-light .toolbar-btn:hover,
                .theme-sepia .toolbar-btn:hover {
                    background: rgba(0, 0, 0, 0.1);
                }

                .toolbar-btn.close {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .toolbar-btn.close:hover {
                    background: #ef4444;
                    color: #fff;
                }

                .toolbar-divider {
                    width: 1px;
                    height: 24px;
                    background: rgba(255, 255, 255, 0.1);
                    margin: 0 8px;
                }

                .theme-light .toolbar-divider,
                .theme-sepia .toolbar-divider {
                    background: rgba(0, 0, 0, 0.1);
                }

                /* Content Container */
                .readview-content {
                    max-width: 700px;
                    margin: 80px auto 60px;
                    padding: 0 24px;
                }

                .readview-message {
                    margin-bottom: 32px;
                    padding-bottom: 32px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .theme-light .readview-message {
                    border-bottom-color: rgba(0, 0, 0, 0.05);
                }

                .theme-sepia .readview-message {
                    border-bottom-color: rgba(92, 74, 50, 0.1);
                }

                .readview-message:last-child {
                    border-bottom: none;
                }

                .readview-role {
                    font-size: 12px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }

                .readview-role.user {
                    color: #3b82f6;
                    opacity: 1;
                }

                .readview-role.assistant {
                    color: #10b981;
                    opacity: 1;
                }

                .readview-text {
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }

                .readview-text code {
                    background: rgba(0, 0, 0, 0.2);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.9em;
                }

                .theme-light .readview-text code {
                    background: rgba(0, 0, 0, 0.05);
                }

                .readview-text pre {
                    background: rgba(0, 0, 0, 0.3);
                    padding: 16px;
                    border-radius: 8px;
                    overflow-x: auto;
                    margin: 16px 0;
                }

                .theme-light .readview-text pre {
                    background: rgba(0, 0, 0, 0.05);
                }

                /* Highlight */
                .readview-highlight {
                    background: rgba(245, 158, 11, 0.3);
                    padding: 2px 0;
                    border-radius: 2px;
                }

                /* Progress Bar */
                .readview-progress {
                    position: fixed;
                    top: 50px;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: rgba(255, 255, 255, 0.1);
                    z-index: 9502;
                }

                .readview-progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #3b82f6, #10b981);
                    width: 0%;
                    transition: width 0.1s;
                }

                /* Settings Panel */
                .readview-settings {
                    position: fixed;
                    top: 60px;
                    right: 20px;
                    width: 220px;
                    background: rgba(0, 0, 0, 0.9);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 16px;
                    z-index: 9503;
                    display: none;
                }

                .readview-settings.visible {
                    display: block;
                    animation: settingsIn 0.2s ease-out;
                }

                @keyframes settingsIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .theme-light .readview-settings {
                    background: rgba(255, 255, 255, 0.95);
                    border-color: rgba(0, 0, 0, 0.1);
                }

                .settings-group {
                    margin-bottom: 16px;
                }

                .settings-group:last-child {
                    margin-bottom: 0;
                }

                .settings-label {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                    margin-bottom: 8px;
                }

                .theme-light .settings-label {
                    color: rgba(0, 0, 0, 0.5);
                }

                .settings-themes {
                    display: flex;
                    gap: 8px;
                }

                .theme-btn {
                    flex: 1;
                    height: 32px;
                    border-radius: 6px;
                    border: 2px solid transparent;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .theme-btn.dark {
                    background: #0a0a0f;
                }

                .theme-btn.light {
                    background: #fafafa;
                }

                .theme-btn.sepia {
                    background: #f4ecd8;
                }

                .theme-btn.selected {
                    border-color: #3b82f6;
                }

                .settings-slider {
                    width: 100%;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 2px;
                    appearance: none;
                    outline: none;
                }

                .theme-light .settings-slider {
                    background: rgba(0, 0, 0, 0.1);
                }

                .settings-slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: #3b82f6;
                    cursor: pointer;
                }
            `;
      document.head.appendChild(styles);
    }

    createButton() {
      this.button = document.createElement("button");
      this.button.className = "bael-readview-btn";
      this.button.innerHTML = "📖";
      this.button.title = "Read View (Ctrl+Shift+F)";
      this.button.onclick = () => this.toggle();
      document.body.appendChild(this.button);
    }

    createOverlay() {
      this.overlay = document.createElement("div");
      this.overlay.className = `bael-readview-overlay theme-${this.theme}`;
      document.body.appendChild(this.overlay);
    }

    renderOverlay() {
      const messages = this.extractMessages();

      this.overlay.className = `bael-readview-overlay theme-${this.theme} visible`;
      this.overlay.innerHTML = `
                <div class="readview-toolbar">
                    <div class="toolbar-title">
                        <span>📖</span>
                        Read View
                    </div>
                    <div class="toolbar-controls">
                        <button class="toolbar-btn" onclick="BaelReadView.decreaseFontSize()" title="Decrease Font">A-</button>
                        <button class="toolbar-btn" onclick="BaelReadView.increaseFontSize()" title="Increase Font">A+</button>
                        <div class="toolbar-divider"></div>
                        <button class="toolbar-btn" onclick="BaelReadView.toggleSettings()" title="Settings">⚙️</button>
                        <button class="toolbar-btn" onclick="BaelReadView.copyAll()" title="Copy All">📋</button>
                        <div class="toolbar-divider"></div>
                        <button class="toolbar-btn close" onclick="BaelReadView.deactivate()" title="Close (Esc)">✕</button>
                    </div>
                </div>

                <div class="readview-progress">
                    <div class="readview-progress-bar" id="read-progress"></div>
                </div>

                <div class="readview-settings" id="readview-settings">
                    <div class="settings-group">
                        <div class="settings-label">Theme</div>
                        <div class="settings-themes">
                            <button class="theme-btn dark ${this.theme === "dark" ? "selected" : ""}" onclick="BaelReadView.setTheme('dark')"></button>
                            <button class="theme-btn light ${this.theme === "light" ? "selected" : ""}" onclick="BaelReadView.setTheme('light')"></button>
                            <button class="theme-btn sepia ${this.theme === "sepia" ? "selected" : ""}" onclick="BaelReadView.setTheme('sepia')"></button>
                        </div>
                    </div>
                    <div class="settings-group">
                        <div class="settings-label">Font Size: ${this.fontSize}px</div>
                        <input type="range" class="settings-slider" min="12" max="24" value="${this.fontSize}"
                               oninput="BaelReadView.setFontSize(this.value)">
                    </div>
                    <div class="settings-group">
                        <div class="settings-label">Line Height: ${this.lineHeight}</div>
                        <input type="range" class="settings-slider" min="1.4" max="2.4" step="0.1" value="${this.lineHeight}"
                               oninput="BaelReadView.setLineHeight(this.value)">
                    </div>
                </div>

                <div class="readview-content" style="font-size: ${this.fontSize}px; line-height: ${this.lineHeight}">
                    ${messages
                      .map(
                        (msg) => `
                        <div class="readview-message">
                            <div class="readview-role ${msg.role}">${msg.role === "user" ? "👤 You" : "🤖 Assistant"}</div>
                            <div class="readview-text">${this.formatText(msg.text)}</div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            `;

      this.setupScrollProgress();
    }

    extractMessages() {
      const messages = [];

      // Try to find messages in various formats
      document
        .querySelectorAll('[class*="message"], .message, [role="article"]')
        .forEach((el) => {
          const text = el.textContent?.trim();
          if (!text) return;

          // Try to determine role from classes or structure
          const isUser =
            el.classList.contains("user") ||
            el.querySelector('[class*="user"]') ||
            el.getAttribute("data-role") === "user";

          messages.push({
            role: isUser ? "user" : "assistant",
            text: text,
          });
        });

      // If no messages found, show placeholder
      if (messages.length === 0) {
        messages.push({
          role: "assistant",
          text: "No conversation found. Start chatting to see content in Read View.",
        });
      }

      return messages;
    }

    formatText(text) {
      return text
        .replace(/```(\w+)?\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\n/g, "<br>");
    }

    setupScrollProgress() {
      const content = this.overlay.querySelector(".readview-content");
      if (!content) return;

      this.overlay.onscroll = () => {
        const scrollTop = this.overlay.scrollTop;
        const scrollHeight =
          this.overlay.scrollHeight - this.overlay.clientHeight;
        const progress =
          scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

        const progressBar = document.getElementById("read-progress");
        if (progressBar) progressBar.style.width = `${progress}%`;
      };
    }

    toggleSettings() {
      const panel = document.getElementById("readview-settings");
      if (panel) panel.classList.toggle("visible");
    }

    setTheme(theme) {
      this.theme = theme;
      this.overlay.className = `bael-readview-overlay theme-${theme} visible`;

      document.querySelectorAll(".theme-btn").forEach((btn) => {
        btn.classList.toggle("selected", btn.classList.contains(theme));
      });

      this.saveSettings();
    }

    setFontSize(size) {
      this.fontSize = parseInt(size);
      const content = this.overlay.querySelector(".readview-content");
      if (content) content.style.fontSize = `${this.fontSize}px`;
      this.saveSettings();
    }

    increaseFontSize() {
      this.setFontSize(Math.min(this.fontSize + 2, 24));
      this.renderOverlay();
    }

    decreaseFontSize() {
      this.setFontSize(Math.max(this.fontSize - 2, 12));
      this.renderOverlay();
    }

    setLineHeight(height) {
      this.lineHeight = parseFloat(height);
      const content = this.overlay.querySelector(".readview-content");
      if (content) content.style.lineHeight = this.lineHeight;
      this.saveSettings();
    }

    copyAll() {
      const messages = this.extractMessages();
      const text = messages
        .map((m) => `${m.role.toUpperCase()}:\n${m.text}`)
        .join("\n\n---\n\n");

      navigator.clipboard
        .writeText(text)
        .then(() => {
          this.showToast("Conversation copied!");
        })
        .catch((err) => {
          console.error("Failed to copy:", err);
        });
    }

    showToast(message) {
      const toast = document.createElement("div");
      toast.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(99, 102, 241, 0.9);
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

    saveSettings() {
      try {
        localStorage.setItem(
          this.storageKey,
          JSON.stringify({
            fontSize: this.fontSize,
            lineHeight: this.lineHeight,
            theme: this.theme,
          }),
        );
      } catch (e) {
        console.error("Failed to save read view settings:", e);
      }
    }

    loadSettings() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const data = JSON.parse(saved);
          this.fontSize = data.fontSize ?? 16;
          this.lineHeight = data.lineHeight ?? 1.8;
          this.theme = data.theme ?? "dark";
        }
      } catch (e) {
        console.error("Failed to load read view settings:", e);
      }
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "F") {
          e.preventDefault();
          this.toggle();
        }

        if (e.key === "Escape" && this.active) {
          this.deactivate();
        }
      });
    }

    toggle() {
      if (this.active) {
        this.deactivate();
      } else {
        this.activate();
      }
    }

    activate() {
      this.active = true;
      this.button.classList.add("active");
      this.renderOverlay();
      document.body.style.overflow = "hidden";
    }

    deactivate() {
      this.active = false;
      this.button.classList.remove("active");
      this.overlay.classList.remove("visible");
      document.body.style.overflow = "";
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelReadView = new BaelReadView();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelReadView.initialize();
    });
  } else {
    window.BaelReadView.initialize();
  }

  console.log("📖 Bael Read View loaded");
})();
