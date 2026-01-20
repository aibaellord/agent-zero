/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ██████╗ ██╗   ██╗██╗ ██████╗██╗  ██╗    ██████╗ ██████╗ ██████╗ ██╗   ██╗█
 * █  ██╔═══██╗██║   ██║██║██╔════╝██║ ██╔╝    ██╔══██╗██╔══██╗██╔══██╗╚██╗ ██╔╝█
 * █  ██║   ██║██║   ██║██║██║     █████╔╝     ██████╔╝██████╔╝██████╔╝ ╚████╔╝ █
 * █  ██║▄▄ ██║██║   ██║██║██║     ██╔═██╗     ██╔═══╝ ██╔══██╗██╔══██╗  ╚██╔╝  █
 * █  ╚██████╔╝╚██████╔╝██║╚██████╗██║  ██╗    ██║     ██║  ██║██║  ██║   ██║   █
 * █   ╚══▀▀═╝  ╚═════╝ ╚═╝ ╚═════╝╚═╝  ╚═╝    ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   █
 * █                                                                          █
 * █   BAEL QUICK PREVIEW - Instant Rich Previews for URLs, Files & Content  █
 * █   Hover to preview links, images, code, and more                         █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelQuickPreview {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.previewTimeout = null;
      this.currentTarget = null;
      this.cache = new Map();
    }

    async initialize() {
      console.log("👁️ Bael Quick Preview initializing...");

      this.injectStyles();
      this.createPreviewBox();
      this.setupListeners();

      this.initialized = true;
      console.log("✅ BAEL QUICK PREVIEW READY");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-quickpreview-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-quickpreview-styles";
      styles.textContent = `
                .bael-preview-box {
                    position: fixed;
                    max-width: 400px;
                    max-height: 350px;
                    background: #12121a;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 14px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    z-index: 9750;
                    display: none;
                    overflow: hidden;
                    pointer-events: none;
                }

                .bael-preview-box.visible {
                    display: block;
                    animation: previewIn 0.2s ease-out;
                }

                @keyframes previewIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .preview-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 14px;
                    background: rgba(255, 255, 255, 0.03);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .preview-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: rgba(99, 102, 241, 0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                }

                .preview-meta {
                    flex: 1;
                    min-width: 0;
                }

                .preview-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: #fff;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .preview-subtitle {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .preview-content {
                    padding: 12px 14px;
                    max-height: 250px;
                    overflow-y: auto;
                }

                .preview-content::-webkit-scrollbar {
                    width: 5px;
                }

                .preview-content::-webkit-scrollbar-track {
                    background: transparent;
                }

                .preview-content::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 2px;
                }

                /* Image preview */
                .preview-image {
                    max-width: 100%;
                    border-radius: 8px;
                }

                /* Code preview */
                .preview-code {
                    font-family: 'SF Mono', 'Fira Code', monospace;
                    font-size: 12px;
                    line-height: 1.5;
                    color: rgba(255, 255, 255, 0.85);
                    background: rgba(0, 0, 0, 0.3);
                    padding: 10px;
                    border-radius: 8px;
                    white-space: pre-wrap;
                    word-break: break-all;
                }

                /* URL preview */
                .preview-url-info {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .preview-url-host {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 13px;
                }

                .preview-url-host img {
                    width: 16px;
                    height: 16px;
                    border-radius: 4px;
                }

                .preview-url-path {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.4);
                    font-family: 'SF Mono', monospace;
                    word-break: break-all;
                }

                /* JSON preview */
                .preview-json {
                    font-family: 'SF Mono', monospace;
                    font-size: 11px;
                    line-height: 1.4;
                }

                .json-key { color: #f472b6; }
                .json-string { color: #a5d6ff; }
                .json-number { color: #79c0ff; }
                .json-boolean { color: #ff7b72; }
                .json-null { color: #8b949e; }

                /* Color preview */
                .preview-color {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .color-swatch {
                    width: 60px;
                    height: 60px;
                    border-radius: 10px;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                }

                .color-values {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    font-family: 'SF Mono', monospace;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.7);
                }

                /* File preview */
                .preview-file-info {
                    display: grid;
                    grid-template-columns: auto 1fr;
                    gap: 8px 12px;
                    font-size: 12px;
                }

                .preview-file-label {
                    color: rgba(255, 255, 255, 0.4);
                }

                .preview-file-value {
                    color: rgba(255, 255, 255, 0.8);
                }

                /* Loading state */
                .preview-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 30px;
                    color: rgba(255, 255, 255, 0.5);
                }

                .preview-loading::after {
                    content: '';
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    border-top-color: #6366f1;
                    border-radius: 50%;
                    margin-left: 10px;
                    animation: spin 0.8s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
      document.head.appendChild(styles);
    }

    createPreviewBox() {
      this.box = document.createElement("div");
      this.box.className = "bael-preview-box";
      document.body.appendChild(this.box);
    }

    setupListeners() {
      // Track mouse movement
      document.addEventListener("mousemove", (e) => {
        this.handleMouseMove(e);
      });

      // Hide on scroll
      document.addEventListener(
        "scroll",
        () => {
          this.hide();
        },
        { capture: true },
      );
    }

    handleMouseMove(e) {
      const target = e.target.closest("a, [data-preview], .preview-trigger");

      if (target && target !== this.currentTarget) {
        // Clear existing timeout
        clearTimeout(this.previewTimeout);

        // Start new timeout
        this.previewTimeout = setTimeout(() => {
          this.showPreview(target, e);
        }, 400);

        this.currentTarget = target;
      } else if (!target) {
        clearTimeout(this.previewTimeout);
        this.hide();
        this.currentTarget = null;
      }
    }

    async showPreview(target, event) {
      const type = this.detectContentType(target);
      const content = this.getContent(target);

      if (!type || !content) {
        this.hide();
        return;
      }

      // Render preview based on type
      switch (type) {
        case "url":
          this.renderURLPreview(content);
          break;
        case "image":
          this.renderImagePreview(content);
          break;
        case "code":
          this.renderCodePreview(content);
          break;
        case "json":
          this.renderJSONPreview(content);
          break;
        case "color":
          this.renderColorPreview(content);
          break;
        default:
          this.renderTextPreview(content);
      }

      this.position(event);
      this.box.classList.add("visible");
      this.visible = true;
    }

    detectContentType(target) {
      const href = target.href || target.dataset.preview || "";
      const content = target.textContent || "";

      // Check for URL
      if (href && href.startsWith("http")) {
        // Check if it's an image URL
        if (/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(href)) {
          return "image";
        }
        return "url";
      }

      // Check for color
      if (/^#[0-9a-f]{3,8}$/i.test(content) || /^rgb/i.test(content)) {
        return "color";
      }

      // Check for JSON
      if (
        (content.startsWith("{") && content.endsWith("}")) ||
        (content.startsWith("[") && content.endsWith("]"))
      ) {
        return "json";
      }

      // Check for code
      if (target.closest("pre, code") || target.classList.contains("code")) {
        return "code";
      }

      return "text";
    }

    getContent(target) {
      return target.href || target.dataset.preview || target.textContent;
    }

    renderURLPreview(url) {
      try {
        const urlObj = new URL(url);
        const favicon = `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;

        this.box.innerHTML = `
                    <div class="preview-header">
                        <div class="preview-icon">🔗</div>
                        <div class="preview-meta">
                            <div class="preview-title">Link Preview</div>
                            <div class="preview-subtitle">${urlObj.hostname}</div>
                        </div>
                    </div>
                    <div class="preview-content">
                        <div class="preview-url-info">
                            <div class="preview-url-host">
                                <img src="${favicon}" onerror="this.style.display='none'">
                                <span>${urlObj.hostname}</span>
                            </div>
                            <div class="preview-url-path">${urlObj.pathname}${urlObj.search}</div>
                        </div>
                    </div>
                `;
      } catch (e) {
        this.renderTextPreview(url);
      }
    }

    renderImagePreview(url) {
      this.box.innerHTML = `
                <div class="preview-header">
                    <div class="preview-icon">🖼️</div>
                    <div class="preview-meta">
                        <div class="preview-title">Image Preview</div>
                        <div class="preview-subtitle">${url.split("/").pop()}</div>
                    </div>
                </div>
                <div class="preview-content">
                    <div class="preview-loading">Loading</div>
                </div>
            `;

      // Load image
      const img = new Image();
      img.onload = () => {
        const content = this.box.querySelector(".preview-content");
        if (content) {
          content.innerHTML = `<img class="preview-image" src="${url}" alt="Preview">`;
        }
      };
      img.onerror = () => {
        const content = this.box.querySelector(".preview-content");
        if (content) {
          content.innerHTML =
            '<div style="color: rgba(255,255,255,0.5);">Failed to load image</div>';
        }
      };
      img.src = url;
    }

    renderCodePreview(code) {
      this.box.innerHTML = `
                <div class="preview-header">
                    <div class="preview-icon">💻</div>
                    <div class="preview-meta">
                        <div class="preview-title">Code Preview</div>
                        <div class="preview-subtitle">${code.split("\n").length} lines</div>
                    </div>
                </div>
                <div class="preview-content">
                    <pre class="preview-code">${this.escapeHtml(code.slice(0, 500))}${code.length > 500 ? "\n..." : ""}</pre>
                </div>
            `;
    }

    renderJSONPreview(content) {
      try {
        const obj = JSON.parse(content);
        const formatted = this.formatJSON(obj);

        this.box.innerHTML = `
                    <div class="preview-header">
                        <div class="preview-icon">📋</div>
                        <div class="preview-meta">
                            <div class="preview-title">JSON Preview</div>
                            <div class="preview-subtitle">${Array.isArray(obj) ? "Array" : "Object"}</div>
                        </div>
                    </div>
                    <div class="preview-content">
                        <pre class="preview-json">${formatted}</pre>
                    </div>
                `;
      } catch (e) {
        this.renderTextPreview(content);
      }
    }

    renderColorPreview(color) {
      let hex = color;
      let rgb = "";
      let hsl = "";

      // Convert to different formats
      if (color.startsWith("rgb")) {
        const match = color.match(/\d+/g);
        if (match) {
          const [r, g, b] = match.map(Number);
          hex =
            "#" +
            [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
          rgb = `rgb(${r}, ${g}, ${b})`;
        }
      } else if (color.startsWith("#")) {
        const hex6 =
          color.length === 4
            ? "#" + [...color.slice(1)].map((c) => c + c).join("")
            : color;
        const r = parseInt(hex6.slice(1, 3), 16);
        const g = parseInt(hex6.slice(3, 5), 16);
        const b = parseInt(hex6.slice(5, 7), 16);
        rgb = `rgb(${r}, ${g}, ${b})`;
      }

      this.box.innerHTML = `
                <div class="preview-header">
                    <div class="preview-icon">🎨</div>
                    <div class="preview-meta">
                        <div class="preview-title">Color Preview</div>
                        <div class="preview-subtitle">${hex}</div>
                    </div>
                </div>
                <div class="preview-content">
                    <div class="preview-color">
                        <div class="color-swatch" style="background: ${color}"></div>
                        <div class="color-values">
                            <div>HEX: ${hex}</div>
                            <div>RGB: ${rgb}</div>
                        </div>
                    </div>
                </div>
            `;
    }

    renderTextPreview(text) {
      this.box.innerHTML = `
                <div class="preview-header">
                    <div class="preview-icon">📝</div>
                    <div class="preview-meta">
                        <div class="preview-title">Text Preview</div>
                        <div class="preview-subtitle">${text.length} characters</div>
                    </div>
                </div>
                <div class="preview-content">
                    <div style="color: rgba(255,255,255,0.8); font-size: 13px; line-height: 1.5;">
                        ${this.escapeHtml(text.slice(0, 300))}${text.length > 300 ? "..." : ""}
                    </div>
                </div>
            `;
    }

    formatJSON(obj, indent = 0) {
      const spaces = "  ".repeat(indent);

      if (obj === null) return '<span class="json-null">null</span>';
      if (typeof obj === "boolean")
        return `<span class="json-boolean">${obj}</span>`;
      if (typeof obj === "number")
        return `<span class="json-number">${obj}</span>`;
      if (typeof obj === "string")
        return `<span class="json-string">"${this.escapeHtml(obj)}"</span>`;

      if (Array.isArray(obj)) {
        if (obj.length === 0) return "[]";
        const items = obj
          .map((item) => `${spaces}  ${this.formatJSON(item, indent + 1)}`)
          .join(",\n");
        return `[\n${items}\n${spaces}]`;
      }

      if (typeof obj === "object") {
        const keys = Object.keys(obj);
        if (keys.length === 0) return "{}";
        const entries = keys
          .map(
            (key) =>
              `${spaces}  <span class="json-key">"${this.escapeHtml(key)}"</span>: ${this.formatJSON(obj[key], indent + 1)}`,
          )
          .join(",\n");
        return `{\n${entries}\n${spaces}}`;
      }

      return String(obj);
    }

    position(event) {
      const padding = 15;
      let left = event.clientX + padding;
      let top = event.clientY + padding;

      // Get box dimensions
      const boxRect = this.box.getBoundingClientRect();

      // Adjust if would go off right edge
      if (left + boxRect.width > window.innerWidth) {
        left = event.clientX - boxRect.width - padding;
      }

      // Adjust if would go off bottom edge
      if (top + boxRect.height > window.innerHeight) {
        top = event.clientY - boxRect.height - padding;
      }

      // Ensure not off screen
      left = Math.max(10, left);
      top = Math.max(10, top);

      this.box.style.left = left + "px";
      this.box.style.top = top + "px";
    }

    hide() {
      this.box.classList.remove("visible");
      this.visible = false;
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelQuickPreview = new BaelQuickPreview();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelQuickPreview.initialize();
    });
  } else {
    window.BaelQuickPreview.initialize();
  }

  console.log("👁️ Bael Quick Preview loaded");
})();
