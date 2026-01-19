/**
 * BAEL - LORD OF ALL
 * Image Generator UI - Interface for AI image generation integration
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelImageGenerator {
    constructor() {
      this.isVisible = false;
      this.history = this.loadHistory();
      this.currentPrompt = "";
      this.isGenerating = false;
      this.init();
    }

    loadHistory() {
      const saved = localStorage.getItem("bael-image-history");
      return saved ? JSON.parse(saved) : [];
    }

    saveHistory() {
      localStorage.setItem(
        "bael-image-history",
        JSON.stringify(this.history.slice(-50)),
      );
    }

    init() {
      this.createUI();
      this.bindEvents();
      console.log("🖼️ Bael Image Generator initialized");
    }

    createUI() {
      const styles = document.createElement("style");
      styles.id = "bael-imagegen-styles";
      styles.textContent = `
                .bael-imagegen-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.9);
                    z-index: 10000;
                    display: none;
                    backdrop-filter: blur(10px);
                }

                .bael-imagegen-overlay.visible {
                    display: flex;
                }

                .bael-imagegen-container {
                    width: 100%;
                    height: 100%;
                    display: flex;
                }

                .bael-imagegen-sidebar {
                    width: 360px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border-right: 1px solid var(--bael-border, #2a2a3a);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .bael-imagegen-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-imagegen-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--bael-text-primary, #fff);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .bael-imagegen-close {
                    width: 36px;
                    height: 36px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    font-size: 16px;
                }

                .bael-imagegen-close:hover {
                    background: #ff4444;
                    color: #fff;
                    border-color: #ff4444;
                }

                .bael-imagegen-controls {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                }

                .bael-gen-section {
                    margin-bottom: 20px;
                }

                .bael-gen-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--bael-text-muted, #888);
                    text-transform: uppercase;
                    margin-bottom: 8px;
                }

                .bael-gen-textarea {
                    width: 100%;
                    height: 120px;
                    padding: 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    color: var(--bael-text-primary, #fff);
                    font-family: inherit;
                    font-size: 14px;
                    resize: none;
                }

                .bael-gen-textarea:focus {
                    outline: none;
                    border-color: var(--bael-accent, #ff3366);
                }

                .bael-gen-select,
                .bael-gen-input {
                    width: 100%;
                    padding: 10px 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 13px;
                }

                .bael-gen-select:focus,
                .bael-gen-input:focus {
                    outline: none;
                    border-color: var(--bael-accent, #ff3366);
                }

                .bael-size-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                }

                .bael-size-option {
                    padding: 10px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 2px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-size-option:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .bael-size-option.selected {
                    border-color: var(--bael-accent, #ff3366);
                    background: rgba(255, 51, 102, 0.1);
                }

                .bael-size-option .size-label {
                    font-size: 11px;
                    color: var(--bael-text-primary, #fff);
                    font-weight: 600;
                }

                .bael-size-option .size-dims {
                    font-size: 9px;
                    color: var(--bael-text-muted, #666);
                    margin-top: 2px;
                }

                .bael-style-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                }

                .bael-style-option {
                    padding: 12px 8px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 2px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-style-option:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .bael-style-option.selected {
                    border-color: var(--bael-accent, #ff3366);
                    background: rgba(255, 51, 102, 0.1);
                }

                .bael-style-option .style-icon {
                    font-size: 22px;
                    margin-bottom: 4px;
                }

                .bael-style-option .style-name {
                    font-size: 10px;
                    color: var(--bael-text-muted, #888);
                }

                .bael-gen-button {
                    width: 100%;
                    padding: 14px;
                    background: linear-gradient(135deg, var(--bael-accent, #ff3366), #ff6b6b);
                    border: none;
                    border-radius: 10px;
                    color: #fff;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .bael-gen-button:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(255, 51, 102, 0.4);
                }

                .bael-gen-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .bael-gen-button.generating {
                    background: linear-gradient(135deg, #8b5cf6, #a855f7);
                }

                .bael-imagegen-canvas {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    background: var(--bael-bg-secondary, #12121a);
                }

                .bael-canvas-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 20px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-canvas-tabs {
                    display: flex;
                    gap: 4px;
                }

                .bael-canvas-tab {
                    padding: 8px 16px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #888);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-canvas-tab:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                .bael-canvas-tab.active {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .bael-canvas-actions {
                    display: flex;
                    gap: 8px;
                }

                .bael-canvas-btn {
                    padding: 8px 12px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #888);
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-canvas-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                .bael-canvas-main {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    overflow: auto;
                }

                .bael-canvas-placeholder {
                    text-align: center;
                    color: var(--bael-text-muted, #666);
                }

                .bael-canvas-placeholder .icon {
                    font-size: 80px;
                    margin-bottom: 16px;
                    opacity: 0.5;
                }

                .bael-canvas-placeholder .text {
                    font-size: 16px;
                    margin-bottom: 8px;
                }

                .bael-canvas-placeholder .hint {
                    font-size: 13px;
                    opacity: 0.7;
                }

                .bael-generated-image {
                    max-width: 100%;
                    max-height: 100%;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                }

                .bael-history-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 12px;
                    padding: 20px;
                }

                .bael-history-item {
                    aspect-ratio: 1;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                }

                .bael-history-item:hover {
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.02);
                }

                .bael-history-item img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .bael-history-item .overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    padding: 8px;
                    background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
                    font-size: 10px;
                    color: #fff;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .bael-history-item:hover .overlay {
                    opacity: 1;
                }

                /* Progress Animation */
                .bael-gen-progress {
                    width: 100%;
                    height: 4px;
                    background: var(--bael-border, #2a2a3a);
                    border-radius: 2px;
                    margin-top: 12px;
                    overflow: hidden;
                    display: none;
                }

                .bael-gen-progress.active {
                    display: block;
                }

                .bael-gen-progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, var(--bael-accent, #ff3366), #8b5cf6, var(--bael-accent, #ff3366));
                    background-size: 200% 100%;
                    animation: bael-progress-flow 1.5s linear infinite;
                    width: 30%;
                }

                @keyframes bael-progress-flow {
                    0% { background-position: 0% 0%; }
                    100% { background-position: 200% 0%; }
                }

                /* Trigger */
                .bael-imagegen-trigger {
                    position: fixed;
                    bottom: 320px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
                    border: none;
                    border-radius: 50%;
                    color: #fff;
                    font-size: 22px;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(236, 72, 153, 0.4);
                    z-index: 8000;
                    transition: all 0.3s ease;
                }

                .bael-imagegen-trigger:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 30px rgba(236, 72, 153, 0.6);
                }
            `;
      document.head.appendChild(styles);

      // Overlay
      this.overlay = document.createElement("div");
      this.overlay.className = "bael-imagegen-overlay";
      this.overlay.innerHTML = this.renderUI();
      document.body.appendChild(this.overlay);

      // Trigger
      this.trigger = document.createElement("button");
      this.trigger.className = "bael-imagegen-trigger";
      this.trigger.innerHTML = "🖼️";
      this.trigger.title = "Image Generator (Ctrl+Shift+I)";
      document.body.appendChild(this.trigger);
    }

    renderUI() {
      return `
                <div class="bael-imagegen-container">
                    <div class="bael-imagegen-sidebar">
                        <div class="bael-imagegen-header">
                            <div class="bael-imagegen-title">
                                <span>🖼️</span>
                                <span>Image Generator</span>
                            </div>
                            <button class="bael-imagegen-close">✕</button>
                        </div>
                        <div class="bael-imagegen-controls">
                            <div class="bael-gen-section">
                                <div class="bael-gen-label">Prompt</div>
                                <textarea class="bael-gen-textarea" id="gen-prompt" placeholder="Describe the image you want to generate..."></textarea>
                            </div>

                            <div class="bael-gen-section">
                                <div class="bael-gen-label">Negative Prompt (Optional)</div>
                                <input type="text" class="bael-gen-input" id="gen-negative" placeholder="Things to avoid...">
                            </div>

                            <div class="bael-gen-section">
                                <div class="bael-gen-label">Image Size</div>
                                <div class="bael-size-grid">
                                    <div class="bael-size-option selected" data-size="512x512">
                                        <div class="size-label">Square</div>
                                        <div class="size-dims">512×512</div>
                                    </div>
                                    <div class="bael-size-option" data-size="768x512">
                                        <div class="size-label">Landscape</div>
                                        <div class="size-dims">768×512</div>
                                    </div>
                                    <div class="bael-size-option" data-size="512x768">
                                        <div class="size-label">Portrait</div>
                                        <div class="size-dims">512×768</div>
                                    </div>
                                    <div class="bael-size-option" data-size="1024x1024">
                                        <div class="size-label">HD Square</div>
                                        <div class="size-dims">1024×1024</div>
                                    </div>
                                    <div class="bael-size-option" data-size="1024x768">
                                        <div class="size-label">HD Wide</div>
                                        <div class="size-dims">1024×768</div>
                                    </div>
                                    <div class="bael-size-option" data-size="768x1024">
                                        <div class="size-label">HD Tall</div>
                                        <div class="size-dims">768×1024</div>
                                    </div>
                                </div>
                            </div>

                            <div class="bael-gen-section">
                                <div class="bael-gen-label">Style</div>
                                <div class="bael-style-grid">
                                    <div class="bael-style-option selected" data-style="none">
                                        <div class="style-icon">✨</div>
                                        <div class="style-name">None</div>
                                    </div>
                                    <div class="bael-style-option" data-style="cinematic">
                                        <div class="style-icon">🎬</div>
                                        <div class="style-name">Cinematic</div>
                                    </div>
                                    <div class="bael-style-option" data-style="anime">
                                        <div class="style-icon">🎨</div>
                                        <div class="style-name">Anime</div>
                                    </div>
                                    <div class="bael-style-option" data-style="photographic">
                                        <div class="style-icon">📷</div>
                                        <div class="style-name">Photo</div>
                                    </div>
                                    <div class="bael-style-option" data-style="digital-art">
                                        <div class="style-icon">🖥️</div>
                                        <div class="style-name">Digital</div>
                                    </div>
                                    <div class="bael-style-option" data-style="fantasy">
                                        <div class="style-icon">🏰</div>
                                        <div class="style-name">Fantasy</div>
                                    </div>
                                    <div class="bael-style-option" data-style="pixel-art">
                                        <div class="style-icon">👾</div>
                                        <div class="style-name">Pixel</div>
                                    </div>
                                    <div class="bael-style-option" data-style="3d-render">
                                        <div class="style-icon">🧊</div>
                                        <div class="style-name">3D</div>
                                    </div>
                                </div>
                            </div>

                            <button class="bael-gen-button" id="generate-btn">
                                <span>✨</span>
                                <span>Generate Image</span>
                            </button>
                            <div class="bael-gen-progress" id="gen-progress">
                                <div class="bael-gen-progress-bar"></div>
                            </div>
                        </div>
                    </div>

                    <div class="bael-imagegen-canvas">
                        <div class="bael-canvas-header">
                            <div class="bael-canvas-tabs">
                                <button class="bael-canvas-tab active" data-tab="current">Current</button>
                                <button class="bael-canvas-tab" data-tab="history">History (${this.history.length})</button>
                            </div>
                            <div class="bael-canvas-actions">
                                <button class="bael-canvas-btn" id="download-btn" style="display:none">⬇️ Download</button>
                                <button class="bael-canvas-btn" id="send-to-chat-btn" style="display:none">💬 Send to Chat</button>
                            </div>
                        </div>
                        <div class="bael-canvas-main" id="canvas-main">
                            <div class="bael-canvas-placeholder" id="canvas-placeholder">
                                <div class="icon">🖼️</div>
                                <div class="text">No image generated yet</div>
                                <div class="hint">Enter a prompt and click Generate</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }

    bindEvents() {
      // Trigger
      this.trigger.addEventListener("click", () => this.toggle());

      // Close
      this.overlay
        .querySelector(".bael-imagegen-close")
        .addEventListener("click", () => this.hide());

      // Size selection
      this.overlay.querySelectorAll(".bael-size-option").forEach((opt) => {
        opt.addEventListener("click", () => {
          this.overlay
            .querySelectorAll(".bael-size-option")
            .forEach((o) => o.classList.remove("selected"));
          opt.classList.add("selected");
        });
      });

      // Style selection
      this.overlay.querySelectorAll(".bael-style-option").forEach((opt) => {
        opt.addEventListener("click", () => {
          this.overlay
            .querySelectorAll(".bael-style-option")
            .forEach((o) => o.classList.remove("selected"));
          opt.classList.add("selected");
        });
      });

      // Tabs
      this.overlay.querySelectorAll(".bael-canvas-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          this.overlay
            .querySelectorAll(".bael-canvas-tab")
            .forEach((t) => t.classList.remove("active"));
          tab.classList.add("active");
          this.showTab(tab.dataset.tab);
        });
      });

      // Generate
      this.overlay
        .querySelector("#generate-btn")
        .addEventListener("click", () => this.generate());

      // Download
      this.overlay
        .querySelector("#download-btn")
        .addEventListener("click", () => this.downloadCurrent());

      // Send to chat
      this.overlay
        .querySelector("#send-to-chat-btn")
        .addEventListener("click", () => this.sendToChat());

      // Keyboard
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "I") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape" && this.isVisible) {
          this.hide();
        }
      });
    }

    toggle() {
      if (this.isVisible) {
        this.hide();
      } else {
        this.show();
      }
    }

    show() {
      this.isVisible = true;
      this.overlay.classList.add("visible");
    }

    hide() {
      this.isVisible = false;
      this.overlay.classList.remove("visible");
    }

    showTab(tab) {
      const main = this.overlay.querySelector("#canvas-main");

      if (tab === "history") {
        main.innerHTML =
          this.history.length > 0
            ? `<div class="bael-history-grid">${this.renderHistory()}</div>`
            : `<div class="bael-canvas-placeholder">
                        <div class="icon">📁</div>
                        <div class="text">No history yet</div>
                        <div class="hint">Generated images will appear here</div>
                    </div>`;

        // Bind history item clicks
        main.querySelectorAll(".bael-history-item").forEach((item) => {
          item.addEventListener("click", () => {
            this.showImage(item.dataset.url);
            this.overlay
              .querySelectorAll(".bael-canvas-tab")
              .forEach((t) => t.classList.remove("active"));
            this.overlay
              .querySelector('[data-tab="current"]')
              .classList.add("active");
          });
        });
      } else {
        this.showPlaceholder();
      }
    }

    renderHistory() {
      return this.history
        .map(
          (item) => `
                <div class="bael-history-item" data-url="${item.url}">
                    <img src="${item.url}" alt="${item.prompt}">
                    <div class="overlay">${item.prompt.substring(0, 50)}...</div>
                </div>
            `,
        )
        .join("");
    }

    showPlaceholder() {
      const main = this.overlay.querySelector("#canvas-main");
      main.innerHTML = `
                <div class="bael-canvas-placeholder" id="canvas-placeholder">
                    <div class="icon">🖼️</div>
                    <div class="text">No image generated yet</div>
                    <div class="hint">Enter a prompt and click Generate</div>
                </div>
            `;
      this.overlay.querySelector("#download-btn").style.display = "none";
      this.overlay.querySelector("#send-to-chat-btn").style.display = "none";
    }

    showImage(url) {
      const main = this.overlay.querySelector("#canvas-main");
      main.innerHTML = `<img class="bael-generated-image" src="${url}" alt="Generated image">`;
      this.currentImage = url;
      this.overlay.querySelector("#download-btn").style.display = "block";
      this.overlay.querySelector("#send-to-chat-btn").style.display = "block";
    }

    async generate() {
      if (this.isGenerating) return;

      const prompt = this.overlay.querySelector("#gen-prompt").value.trim();
      if (!prompt) {
        if (window.BaelNotifications) {
          window.BaelNotifications.error("Please enter a prompt");
        }
        return;
      }

      const negative = this.overlay.querySelector("#gen-negative").value.trim();
      const size = this.overlay.querySelector(".bael-size-option.selected")
        .dataset.size;
      const style = this.overlay.querySelector(".bael-style-option.selected")
        .dataset.style;

      this.isGenerating = true;
      const btn = this.overlay.querySelector("#generate-btn");
      btn.innerHTML = "<span>⏳</span><span>Generating...</span>";
      btn.classList.add("generating");
      btn.disabled = true;
      this.overlay.querySelector("#gen-progress").classList.add("active");

      try {
        // For demo, create a placeholder image
        // In production, this would call an actual image generation API
        await this.simulateGeneration(prompt, negative, size, style);
      } catch (err) {
        if (window.BaelNotifications) {
          window.BaelNotifications.error("Generation failed: " + err.message);
        }
      } finally {
        this.isGenerating = false;
        btn.innerHTML = "<span>✨</span><span>Generate Image</span>";
        btn.classList.remove("generating");
        btn.disabled = false;
        this.overlay.querySelector("#gen-progress").classList.remove("active");
      }
    }

    async simulateGeneration(prompt, negative, size, style) {
      // Simulate generation time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Create a demo placeholder image using canvas
      const [width, height] = size.split("x").map(Number);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");

      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#ff3366");
      gradient.addColorStop(0.5, "#8b5cf6");
      gradient.addColorStop(1, "#06b6d4");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Add some visual elements
      ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 100 + 20;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Add text
      ctx.fillStyle = "#fff";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Generated Image", width / 2, height / 2 - 20);
      ctx.font = "14px Arial";
      ctx.fillText(prompt.substring(0, 40) + "...", width / 2, height / 2 + 10);
      ctx.font = "12px Arial";
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.fillText(`${style} • ${size}`, width / 2, height / 2 + 35);

      const url = canvas.toDataURL("image/png");

      // Add to history
      this.history.unshift({
        url,
        prompt,
        negative,
        size,
        style,
        timestamp: Date.now(),
      });
      this.saveHistory();

      // Update history tab count
      const historyTab = this.overlay.querySelector('[data-tab="history"]');
      historyTab.textContent = `History (${this.history.length})`;

      // Show the image
      this.showImage(url);

      if (window.BaelNotifications) {
        window.BaelNotifications.success("Image generated!");
      }
    }

    downloadCurrent() {
      if (!this.currentImage) return;

      const a = document.createElement("a");
      a.href = this.currentImage;
      a.download = `bael-image-${Date.now()}.png`;
      a.click();

      if (window.BaelNotifications) {
        window.BaelNotifications.success("Image downloaded!");
      }
    }

    sendToChat() {
      if (!this.currentImage) return;

      // Emit event for chat integration
      document.dispatchEvent(
        new CustomEvent("bael-send-image", {
          detail: { url: this.currentImage },
        }),
      );

      if (window.BaelNotifications) {
        window.BaelNotifications.success("Image sent to chat!");
      }

      this.hide();
    }
  }

  // Initialize
  window.BaelImageGenerator = new BaelImageGenerator();
})();
