/**
 * Bael Zen Mode - Ultra-minimal distraction-free AI interaction
 * Keyboard: Ctrl+Shift+Z for zen mode toggle
 */
(function () {
  "use strict";

  class BaelZenMode {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.active = false;
      this.storageKey = "bael-zen-mode";
      this.settings = {
        theme: "dark", // dark, light, sepia
        fontSize: 16,
        lineHeight: 1.8,
        maxWidth: 800,
        showTimer: true,
        ambientMode: false,
      };
    }

    async initialize() {
      this.loadFromStorage();
      this.injectStyles();
      this.createElements();
      this.setupShortcuts();
      this.initialized = true;
      console.log("🧘 Bael Zen Mode initialized");
    }

    injectStyles() {
      if (document.getElementById("bael-zen-mode-styles")) return;

      const css = `
                .bael-zen-fab {
                    position: fixed;
                    bottom: 360px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #059669, #047857);
                    color: white;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    box-shadow: 0 4px 15px rgba(5, 150, 105, 0.4);
                    z-index: 9999;
                    transition: all 0.3s ease;
                }

                .bael-zen-fab:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(5, 150, 105, 0.5);
                }

                .bael-zen-fab.active {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
                }

                .bael-zen-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 99999;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.5s ease;
                    display: flex;
                    flex-direction: column;
                }

                .bael-zen-overlay.visible {
                    opacity: 1;
                    visibility: visible;
                }

                .bael-zen-overlay.theme-dark {
                    background: #0f0f0f;
                    color: #e0e0e0;
                }

                .bael-zen-overlay.theme-light {
                    background: #fafafa;
                    color: #1a1a1a;
                }

                .bael-zen-overlay.theme-sepia {
                    background: #f4ecd8;
                    color: #433422;
                }

                .bael-zen-header {
                    padding: 16px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    opacity: 0.3;
                    transition: opacity 0.3s;
                }

                .bael-zen-header:hover {
                    opacity: 1;
                }

                .bael-zen-time {
                    font-family: monospace;
                    font-size: 14px;
                    opacity: 0.6;
                }

                .bael-zen-controls {
                    display: flex;
                    gap: 8px;
                }

                .bael-zen-ctrl-btn {
                    background: rgba(128,128,128,0.2);
                    border: none;
                    padding: 8px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.2s;
                }

                .theme-dark .bael-zen-ctrl-btn {
                    color: #ccc;
                }

                .theme-light .bael-zen-ctrl-btn {
                    color: #333;
                }

                .theme-sepia .bael-zen-ctrl-btn {
                    color: #433422;
                }

                .bael-zen-ctrl-btn:hover {
                    background: rgba(128,128,128,0.3);
                }

                .bael-zen-content {
                    flex: 1;
                    overflow-y: auto;
                    display: flex;
                    justify-content: center;
                    padding: 0 24px;
                }

                .bael-zen-messages {
                    width: 100%;
                    max-width: var(--zen-max-width, 800px);
                    padding-bottom: 200px;
                }

                .bael-zen-message {
                    margin-bottom: 32px;
                    font-size: var(--zen-font-size, 16px);
                    line-height: var(--zen-line-height, 1.8);
                }

                .bael-zen-message.user {
                    padding-left: 24px;
                    border-left: 3px solid rgba(5, 150, 105, 0.5);
                }

                .bael-zen-message.agent {
                    padding-left: 24px;
                    border-left: 3px solid rgba(99, 102, 241, 0.5);
                }

                .bael-zen-message pre {
                    background: rgba(0,0,0,0.1);
                    padding: 16px;
                    border-radius: 8px;
                    overflow-x: auto;
                    font-size: 14px;
                }

                .theme-dark .bael-zen-message pre {
                    background: rgba(255,255,255,0.05);
                }

                .bael-zen-input-area {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 24px;
                    display: flex;
                    justify-content: center;
                    background: linear-gradient(to top, var(--zen-bg) 80%, transparent);
                }

                .theme-dark .bael-zen-input-area {
                    --zen-bg: #0f0f0f;
                }

                .theme-light .bael-zen-input-area {
                    --zen-bg: #fafafa;
                }

                .theme-sepia .bael-zen-input-area {
                    --zen-bg: #f4ecd8;
                }

                .bael-zen-input-wrapper {
                    width: 100%;
                    max-width: var(--zen-max-width, 800px);
                    display: flex;
                    gap: 12px;
                }

                .bael-zen-input {
                    flex: 1;
                    padding: 16px 20px;
                    border-radius: 12px;
                    font-size: 15px;
                    resize: none;
                    min-height: 24px;
                    max-height: 150px;
                    transition: all 0.2s;
                }

                .theme-dark .bael-zen-input {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #e0e0e0;
                }

                .theme-light .bael-zen-input {
                    background: white;
                    border: 1px solid rgba(0,0,0,0.1);
                    color: #1a1a1a;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }

                .theme-sepia .bael-zen-input {
                    background: #fff8e7;
                    border: 1px solid rgba(67, 52, 34, 0.2);
                    color: #433422;
                }

                .bael-zen-input::placeholder {
                    opacity: 0.4;
                }

                .bael-zen-send {
                    width: 50px;
                    height: 50px;
                    border-radius: 12px;
                    border: none;
                    cursor: pointer;
                    font-size: 18px;
                    transition: all 0.2s;
                    flex-shrink: 0;
                    background: linear-gradient(135deg, #059669, #047857);
                    color: white;
                }

                .bael-zen-send:hover {
                    transform: scale(1.05);
                }

                .bael-zen-settings {
                    position: fixed;
                    top: 60px;
                    right: 24px;
                    background: rgba(30,30,30,0.95);
                    border-radius: 12px;
                    padding: 16px;
                    z-index: 100001;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(-10px);
                    transition: all 0.2s;
                    min-width: 200px;
                }

                .bael-zen-settings.visible {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }

                .theme-light .bael-zen-settings {
                    background: rgba(255,255,255,0.98);
                    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                }

                .bael-zen-setting {
                    margin-bottom: 12px;
                }

                .bael-zen-setting:last-child {
                    margin-bottom: 0;
                }

                .bael-zen-setting-label {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    opacity: 0.6;
                    margin-bottom: 6px;
                }

                .bael-zen-theme-btns {
                    display: flex;
                    gap: 6px;
                }

                .bael-zen-theme-btn {
                    flex: 1;
                    padding: 8px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 11px;
                    transition: all 0.2s;
                }

                .bael-zen-theme-btn.dark {
                    background: #1a1a1a;
                    color: #ccc;
                }

                .bael-zen-theme-btn.light {
                    background: #f0f0f0;
                    color: #333;
                }

                .bael-zen-theme-btn.sepia {
                    background: #f4ecd8;
                    color: #433422;
                }

                .bael-zen-theme-btn.active {
                    outline: 2px solid #059669;
                    outline-offset: 2px;
                }

                .bael-zen-slider {
                    width: 100%;
                    height: 6px;
                    -webkit-appearance: none;
                    background: rgba(128,128,128,0.3);
                    border-radius: 3px;
                    outline: none;
                }

                .bael-zen-slider::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 16px;
                    height: 16px;
                    background: #059669;
                    border-radius: 50%;
                    cursor: pointer;
                }

                .bael-zen-ambient {
                    position: fixed;
                    inset: 0;
                    pointer-events: none;
                    z-index: -1;
                    opacity: 0;
                    transition: opacity 2s;
                }

                .bael-zen-ambient.active {
                    opacity: 0.15;
                    animation: bael-ambient 20s ease-in-out infinite;
                }

                @keyframes bael-ambient {
                    0%, 100% { background: radial-gradient(circle at 20% 30%, #059669, transparent 50%); }
                    25% { background: radial-gradient(circle at 80% 20%, #6366f1, transparent 50%); }
                    50% { background: radial-gradient(circle at 70% 80%, #8b5cf6, transparent 50%); }
                    75% { background: radial-gradient(circle at 30% 70%, #06b6d4, transparent 50%); }
                }
            `;

      const style = document.createElement("style");
      style.id = "bael-zen-mode-styles";
      style.textContent = css;
      document.head.appendChild(style);
    }

    createElements() {
      // FAB Button
      this.fab = document.createElement("button");
      this.fab.className = "bael-zen-fab";
      this.fab.innerHTML = "🧘";
      this.fab.title = "Zen Mode (Ctrl+Shift+Z)";
      this.fab.addEventListener("click", () => this.toggle());
      document.body.appendChild(this.fab);

      // Zen Overlay
      this.overlay = document.createElement("div");
      this.overlay.className = `bael-zen-overlay theme-${this.settings.theme}`;
      this.overlay.innerHTML = `
                <div class="bael-zen-ambient" id="bael-zen-ambient"></div>
                <div class="bael-zen-header">
                    <div class="bael-zen-time" id="bael-zen-time"></div>
                    <div class="bael-zen-controls">
                        <button class="bael-zen-ctrl-btn" id="bael-zen-settings-btn">⚙️ Settings</button>
                        <button class="bael-zen-ctrl-btn" id="bael-zen-exit">✕ Exit</button>
                    </div>
                </div>
                <div class="bael-zen-content">
                    <div class="bael-zen-messages" id="bael-zen-messages"></div>
                </div>
                <div class="bael-zen-input-area">
                    <div class="bael-zen-input-wrapper">
                        <textarea class="bael-zen-input" id="bael-zen-input" placeholder="Enter your thoughts..." rows="1"></textarea>
                        <button class="bael-zen-send" id="bael-zen-send">➤</button>
                    </div>
                </div>

                <div class="bael-zen-settings" id="bael-zen-settings-panel">
                    <div class="bael-zen-setting">
                        <div class="bael-zen-setting-label">Theme</div>
                        <div class="bael-zen-theme-btns">
                            <button class="bael-zen-theme-btn dark ${this.settings.theme === "dark" ? "active" : ""}" data-theme="dark">Dark</button>
                            <button class="bael-zen-theme-btn light ${this.settings.theme === "light" ? "active" : ""}" data-theme="light">Light</button>
                            <button class="bael-zen-theme-btn sepia ${this.settings.theme === "sepia" ? "active" : ""}" data-theme="sepia">Sepia</button>
                        </div>
                    </div>
                    <div class="bael-zen-setting">
                        <div class="bael-zen-setting-label">Font Size: <span id="bael-zen-font-value">${this.settings.fontSize}px</span></div>
                        <input type="range" class="bael-zen-slider" id="bael-zen-font-slider" min="14" max="24" value="${this.settings.fontSize}">
                    </div>
                    <div class="bael-zen-setting">
                        <div class="bael-zen-setting-label">Line Height: <span id="bael-zen-line-value">${this.settings.lineHeight}</span></div>
                        <input type="range" class="bael-zen-slider" id="bael-zen-line-slider" min="1.4" max="2.2" step="0.1" value="${this.settings.lineHeight}">
                    </div>
                    <div class="bael-zen-setting">
                        <div class="bael-zen-setting-label">Max Width: <span id="bael-zen-width-value">${this.settings.maxWidth}px</span></div>
                        <input type="range" class="bael-zen-slider" id="bael-zen-width-slider" min="600" max="1200" step="50" value="${this.settings.maxWidth}">
                    </div>
                </div>
            `;
      document.body.appendChild(this.overlay);

      // Event listeners
      this.overlay
        .querySelector("#bael-zen-exit")
        .addEventListener("click", () => this.hide());
      this.overlay
        .querySelector("#bael-zen-settings-btn")
        .addEventListener("click", () => this.toggleSettings());
      this.overlay
        .querySelector("#bael-zen-send")
        .addEventListener("click", () => this.sendMessage());

      const input = this.overlay.querySelector("#bael-zen-input");
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
      input.addEventListener("input", () => {
        input.style.height = "auto";
        input.style.height = Math.min(input.scrollHeight, 150) + "px";
      });

      // Theme buttons
      this.overlay.querySelectorAll(".bael-zen-theme-btn").forEach((btn) => {
        btn.addEventListener("click", () => this.setTheme(btn.dataset.theme));
      });

      // Sliders
      this.overlay
        .querySelector("#bael-zen-font-slider")
        .addEventListener("input", (e) => {
          this.settings.fontSize = parseInt(e.target.value);
          this.applySettings();
          this.overlay.querySelector("#bael-zen-font-value").textContent =
            this.settings.fontSize + "px";
        });

      this.overlay
        .querySelector("#bael-zen-line-slider")
        .addEventListener("input", (e) => {
          this.settings.lineHeight = parseFloat(e.target.value);
          this.applySettings();
          this.overlay.querySelector("#bael-zen-line-value").textContent =
            this.settings.lineHeight;
        });

      this.overlay
        .querySelector("#bael-zen-width-slider")
        .addEventListener("input", (e) => {
          this.settings.maxWidth = parseInt(e.target.value);
          this.applySettings();
          this.overlay.querySelector("#bael-zen-width-value").textContent =
            this.settings.maxWidth + "px";
        });

      // Close settings when clicking outside
      this.overlay.addEventListener("click", (e) => {
        const panel = this.overlay.querySelector("#bael-zen-settings-panel");
        const btn = this.overlay.querySelector("#bael-zen-settings-btn");
        if (!panel.contains(e.target) && e.target !== btn) {
          panel.classList.remove("visible");
        }
      });

      this.applySettings();
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "Z") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape" && this.active) {
          this.hide();
        }
      });
    }

    toggle() {
      this.active ? this.hide() : this.show();
    }

    show() {
      this.active = true;
      this.syncMessages();
      this.overlay.classList.add("visible");
      this.fab.classList.add("active");
      this.startTimeUpdate();

      setTimeout(() => {
        this.overlay.querySelector("#bael-zen-input").focus();
      }, 300);

      if (this.settings.ambientMode) {
        this.overlay.querySelector("#bael-zen-ambient").classList.add("active");
      }
    }

    hide() {
      this.active = false;
      this.overlay.classList.remove("visible");
      this.fab.classList.remove("active");
      this.stopTimeUpdate();
      this.saveToStorage();
    }

    syncMessages() {
      const container = this.overlay.querySelector("#bael-zen-messages");
      container.innerHTML = "";

      const messages = document.querySelectorAll(
        '[class*="message"], .message, .chat-message',
      );
      messages.forEach((msg) => {
        const isUser =
          msg.classList.contains("user") ||
          msg.querySelector('[class*="user"]') ||
          msg.getAttribute("data-role") === "user";

        const div = document.createElement("div");
        div.className = `bael-zen-message ${isUser ? "user" : "agent"}`;
        div.innerHTML = msg.innerHTML;
        container.appendChild(div);
      });

      const content = this.overlay.querySelector(".bael-zen-content");
      content.scrollTop = content.scrollHeight;
    }

    sendMessage() {
      const input = this.overlay.querySelector("#bael-zen-input");
      const text = input.value.trim();
      if (!text) return;

      // Add to zen view
      const container = this.overlay.querySelector("#bael-zen-messages");
      const msg = document.createElement("div");
      msg.className = "bael-zen-message user";
      msg.textContent = text;
      container.appendChild(msg);

      // Forward to real input
      const realInput = document.querySelector(
        '#chat-input, textarea[class*="chat"], [contenteditable="true"]',
      );
      if (realInput) {
        if (realInput.value !== undefined) {
          realInput.value = text;
        } else {
          realInput.textContent = text;
        }
        realInput.dispatchEvent(new Event("input", { bubbles: true }));

        const sendBtn = document.querySelector(
          '[class*="send"], button[type="submit"], .send-button',
        );
        if (sendBtn) sendBtn.click();
      }

      input.value = "";
      input.style.height = "auto";

      // Watch for responses
      this.watchResponses();
    }

    watchResponses() {
      const observer = new MutationObserver(() => this.syncMessages());
      const container = document.querySelector(
        "#messages, .messages, .chat-messages",
      );
      if (container) {
        observer.observe(container, { childList: true, subtree: true });
        setTimeout(() => observer.disconnect(), 30000);
      }
    }

    setTheme(theme) {
      this.settings.theme = theme;
      this.overlay.className = `bael-zen-overlay visible theme-${theme}`;

      this.overlay.querySelectorAll(".bael-zen-theme-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.theme === theme);
      });

      this.saveToStorage();
    }

    applySettings() {
      this.overlay.style.setProperty(
        "--zen-font-size",
        this.settings.fontSize + "px",
      );
      this.overlay.style.setProperty(
        "--zen-line-height",
        this.settings.lineHeight,
      );
      this.overlay.style.setProperty(
        "--zen-max-width",
        this.settings.maxWidth + "px",
      );
    }

    toggleSettings() {
      const panel = this.overlay.querySelector("#bael-zen-settings-panel");
      panel.classList.toggle("visible");
    }

    startTimeUpdate() {
      this.updateTime();
      this.timeInterval = setInterval(() => this.updateTime(), 1000);
    }

    stopTimeUpdate() {
      if (this.timeInterval) {
        clearInterval(this.timeInterval);
      }
    }

    updateTime() {
      const el = this.overlay.querySelector("#bael-zen-time");
      if (el) {
        el.textContent = new Date().toLocaleTimeString();
      }
    }

    loadFromStorage() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
      } catch (e) {}
    }

    saveToStorage() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
      } catch (e) {}
    }
  }

  window.BaelZenMode = new BaelZenMode();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelZenMode.initialize();
    });
  } else {
    window.BaelZenMode.initialize();
  }
})();
