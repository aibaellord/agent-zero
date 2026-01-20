/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ██████╗ ██████╗ ██╗   ██╗██████╗ ██╗     ██╗███╗   ██╗██╗  ██╗         █
 * █  ██╔══██╗██╔══██╗╚██╗ ██╔╝██╔══██╗██║     ██║████╗  ██║██║ ██╔╝         █
 * █  ██║  ██║██████╔╝ ╚████╔╝ ██████╔╝██║     ██║██╔██╗ ██║█████╔╝          █
 * █  ██║  ██║██╔══██╗  ╚██╔╝  ██╔═══╝ ██║     ██║██║╚██╗██║██╔═██╗          █
 * █  ██████╔╝██║  ██║   ██║   ██║     ███████╗██║██║ ╚████║██║  ██╗         █
 * █  ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝     ╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝         █
 * █                                                                          █
 * █   BAEL DRYLINK - Drag & Drop Link Handler (auto-initialized)           █
 * █   Intelligent link and file drop handling anywhere on the page          █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelDrylink {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.dropIndicator = null;
      this.handlers = new Map();
    }

    async initialize() {
      console.log("🔗 Bael Drylink initializing...");

      this.injectStyles();
      this.createDropIndicator();
      this.setupDragHandlers();
      this.registerDefaultHandlers();

      this.initialized = true;
      console.log("✅ BAEL DRYLINK READY");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-drylink-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-drylink-styles";
      styles.textContent = `
                .bael-drop-indicator {
                    position: fixed;
                    inset: 0;
                    background: rgba(99, 102, 241, 0.15);
                    border: 4px dashed #6366f1;
                    z-index: 10000;
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .bael-drop-indicator.active {
                    opacity: 1;
                }

                .bael-drop-content {
                    background: #12121a;
                    padding: 40px 60px;
                    border-radius: 20px;
                    text-align: center;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    border: 2px solid rgba(255, 255, 255, 0.1);
                }

                .bael-drop-icon {
                    font-size: 64px;
                    margin-bottom: 16px;
                }

                .bael-drop-title {
                    font-size: 24px;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 8px;
                }

                .bael-drop-hint {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.5);
                }

                .bael-drop-types {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                    margin-top: 20px;
                }

                .bael-drop-type {
                    padding: 8px 16px;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.08);
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.6);
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .bael-link-toast {
                    position: fixed;
                    bottom: 80px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #12121a;
                    padding: 14px 24px;
                    border-radius: 12px;
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    z-index: 10001;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    opacity: 0;
                    transition: all 0.3s ease;
                    pointer-events: none;
                }

                .bael-link-toast.visible {
                    opacity: 1;
                    pointer-events: auto;
                }

                .bael-link-toast-icon {
                    font-size: 24px;
                }

                .bael-link-toast-content {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .bael-link-toast-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #fff;
                }

                .bael-link-toast-url {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                    max-width: 300px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .bael-link-toast-actions {
                    display: flex;
                    gap: 8px;
                    margin-left: 16px;
                }

                .bael-link-action {
                    padding: 8px 14px;
                    border-radius: 8px;
                    border: none;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .bael-link-action.primary {
                    background: rgba(99, 102, 241, 0.2);
                    color: #6366f1;
                }

                .bael-link-action.primary:hover {
                    background: rgba(99, 102, 241, 0.3);
                }

                .bael-link-action.secondary {
                    background: rgba(255, 255, 255, 0.06);
                    color: rgba(255, 255, 255, 0.6);
                }

                .bael-link-action.secondary:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
            `;
      document.head.appendChild(styles);
    }

    createDropIndicator() {
      this.dropIndicator = document.createElement("div");
      this.dropIndicator.className = "bael-drop-indicator";
      this.dropIndicator.innerHTML = `
                <div class="bael-drop-content">
                    <div class="bael-drop-icon">📥</div>
                    <div class="bael-drop-title">Drop to Process</div>
                    <div class="bael-drop-hint">Release to handle the dropped content</div>
                    <div class="bael-drop-types">
                        <div class="bael-drop-type">🔗 Links</div>
                        <div class="bael-drop-type">📄 Files</div>
                        <div class="bael-drop-type">📝 Text</div>
                        <div class="bael-drop-type">🖼️ Images</div>
                    </div>
                </div>
            `;
      document.body.appendChild(this.dropIndicator);
    }

    setupDragHandlers() {
      let dragCounter = 0;

      document.addEventListener("dragenter", (e) => {
        e.preventDefault();
        dragCounter++;
        if (dragCounter === 1) {
          this.dropIndicator.classList.add("active");
        }
      });

      document.addEventListener("dragleave", (e) => {
        e.preventDefault();
        dragCounter--;
        if (dragCounter === 0) {
          this.dropIndicator.classList.remove("active");
        }
      });

      document.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      document.addEventListener("drop", async (e) => {
        e.preventDefault();
        dragCounter = 0;
        this.dropIndicator.classList.remove("active");

        await this.handleDrop(e);
      });
    }

    registerDefaultHandlers() {
      // URL Handler
      this.handlers.set("url", async (url) => {
        this.showLinkToast(url, "link");
      });

      // File Handler
      this.handlers.set("file", async (file) => {
        await this.handleFile(file);
      });

      // Text Handler
      this.handlers.set("text", async (text) => {
        this.insertToChat(text);
      });

      // Image Handler
      this.handlers.set("image", async (file) => {
        await this.handleImage(file);
      });
    }

    async handleDrop(e) {
      const dataTransfer = e.dataTransfer;

      // Check for URLs first
      const url =
        dataTransfer.getData("text/uri-list") ||
        dataTransfer.getData("text/x-moz-url")?.split("\n")[0] ||
        dataTransfer.getData("URL");

      if (url && this.isValidUrl(url)) {
        const handler = this.handlers.get("url");
        if (handler) await handler(url);
        return;
      }

      // Check for files
      if (dataTransfer.files && dataTransfer.files.length > 0) {
        for (const file of dataTransfer.files) {
          if (file.type.startsWith("image/")) {
            const handler = this.handlers.get("image");
            if (handler) await handler(file);
          } else {
            const handler = this.handlers.get("file");
            if (handler) await handler(file);
          }
        }
        return;
      }

      // Check for plain text
      const text = dataTransfer.getData("text/plain");
      if (text) {
        // Check if text is a URL
        if (this.isValidUrl(text.trim())) {
          const handler = this.handlers.get("url");
          if (handler) await handler(text.trim());
        } else {
          const handler = this.handlers.get("text");
          if (handler) await handler(text);
        }
        return;
      }

      this.toast("Unknown content dropped", "warning");
    }

    isValidUrl(string) {
      try {
        new URL(string);
        return true;
      } catch (_) {
        return false;
      }
    }

    showLinkToast(url, type = "link") {
      // Remove existing toast
      const existing = document.querySelector(".bael-link-toast");
      if (existing) existing.remove();

      const toast = document.createElement("div");
      toast.className = "bael-link-toast";

      const icon = type === "image" ? "🖼️" : "🔗";
      const domain = new URL(url).hostname;

      toast.innerHTML = `
                <div class="bael-link-toast-icon">${icon}</div>
                <div class="bael-link-toast-content">
                    <div class="bael-link-toast-title">Link Detected</div>
                    <div class="bael-link-toast-url" title="${url}">${domain}</div>
                </div>
                <div class="bael-link-toast-actions">
                    <button class="bael-link-action primary" onclick="BaelDrylink.queryWithUrl('${url}')">🤖 Ask Agent</button>
                    <button class="bael-link-action secondary" onclick="BaelDrylink.insertUrl('${url}')">📝 Insert</button>
                    <button class="bael-link-action secondary" onclick="BaelDrylink.openUrl('${url}')">🌐 Open</button>
                    <button class="bael-link-action secondary" onclick="BaelDrylink.dismissToast()">✕</button>
                </div>
            `;

      document.body.appendChild(toast);

      // Show with animation
      requestAnimationFrame(() => {
        toast.classList.add("visible");
      });

      // Auto dismiss after 10 seconds
      setTimeout(() => {
        this.dismissToast();
      }, 10000);
    }

    dismissToast() {
      const toast = document.querySelector(".bael-link-toast");
      if (toast) {
        toast.classList.remove("visible");
        setTimeout(() => toast.remove(), 300);
      }
    }

    async queryWithUrl(url) {
      this.dismissToast();

      const chatInput = document.querySelector(
        '#msg-input, textarea[name="message"]',
      );
      if (chatInput) {
        chatInput.value = `Please analyze this URL and provide a summary: ${url}`;
        chatInput.dispatchEvent(new Event("input", { bubbles: true }));
        chatInput.focus();

        // Try to auto-submit
        const submitBtn = document.querySelector(
          '[type="submit"], button[x-on\\:click*="send"]',
        );
        if (submitBtn) {
          submitBtn.click();
        }
      }
    }

    insertUrl(url) {
      this.dismissToast();
      this.insertToChat(url);
    }

    openUrl(url) {
      this.dismissToast();
      window.open(url, "_blank");
    }

    insertToChat(text) {
      const chatInput = document.querySelector(
        '#msg-input, textarea[name="message"]',
      );
      if (chatInput) {
        const currentValue = chatInput.value;
        const newValue = currentValue ? `${currentValue}\n${text}` : text;
        chatInput.value = newValue;
        chatInput.dispatchEvent(new Event("input", { bubbles: true }));
        chatInput.focus();

        this.toast("Content inserted into chat", "success");
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(text).then(() => {
          this.toast("Copied to clipboard", "success");
        });
      }
    }

    async handleFile(file) {
      this.toast(`File: ${file.name} (${this.formatSize(file.size)})`, "info");

      // Try to upload through API
      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const result = await response.json();
          this.toast(`File uploaded: ${file.name}`, "success");

          // Dispatch event
          window.dispatchEvent(
            new CustomEvent("bael:file-uploaded", {
              detail: { file, result },
            }),
          );
        } else {
          // Fallback: insert filename to chat
          this.insertToChat(`[File: ${file.name}]`);
        }
      } catch (e) {
        this.insertToChat(`[File: ${file.name}]`);
      }
    }

    async handleImage(file) {
      this.toast(`Image: ${file.name}`, "info");

      // Create preview and upload
      const reader = new FileReader();
      reader.onload = async (e) => {
        const dataUrl = e.target.result;

        // Dispatch event with image data
        window.dispatchEvent(
          new CustomEvent("bael:image-dropped", {
            detail: { file, dataUrl },
          }),
        );

        // Try to upload
        try {
          const formData = new FormData();
          formData.append("file", file);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (response.ok) {
            const result = await response.json();
            this.toast(`Image uploaded: ${file.name}`, "success");
          }
        } catch (e) {
          console.log("Image upload failed, using local preview");
        }
      };
      reader.readAsDataURL(file);
    }

    formatSize(bytes) {
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }

    // Register custom handler
    registerHandler(type, handler) {
      this.handlers.set(type, handler);
    }

    toast(message, type = "info") {
      window.dispatchEvent(
        new CustomEvent("bael:toast", {
          detail: { message, type },
        }),
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelDrylink = new BaelDrylink();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelDrylink.initialize();
    });
  } else {
    window.BaelDrylink.initialize();
  }

  console.log("🔗 Bael Drylink loaded");
})();
