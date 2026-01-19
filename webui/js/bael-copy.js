/**
 * BAEL Copy Component - Lord Of All Clipboards
 *
 * Clipboard operations with:
 * - Copy to clipboard
 * - Copy button generation
 * - Visual feedback (tooltip/animation)
 * - Code block copy buttons
 * - Copy rich text/HTML
 * - Copy images
 * - Paste detection
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // COPY CLASS
  // ============================================================

  class BaelCopy {
    constructor() {
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-copy-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-copy-styles";
      styles.textContent = `
                .bael-copy-btn {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 6px 12px;
                    background: #f3f4f6;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    font-size: 0.8rem;
                    color: #374151;
                    cursor: pointer;
                    transition: all 0.15s;
                    user-select: none;
                }

                .bael-copy-btn:hover {
                    background: #e5e7eb;
                    border-color: #d1d5db;
                }

                .bael-copy-btn:active {
                    transform: scale(0.98);
                }

                .bael-copy-btn.copied {
                    background: #dcfce7;
                    border-color: #86efac;
                    color: #166534;
                }

                .bael-copy-btn-icon {
                    font-size: 1em;
                }

                /* Inline button (icon only) */
                .bael-copy-btn.inline {
                    padding: 4px 6px;
                    background: transparent;
                    border: none;
                    color: #6b7280;
                }

                .bael-copy-btn.inline:hover {
                    color: #374151;
                    background: #f3f4f6;
                }

                /* Code block wrapper */
                .bael-copy-wrapper {
                    position: relative;
                }

                .bael-copy-wrapper .bael-copy-btn {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    padding: 6px 10px;
                    background: rgba(255,255,255,0.9);
                    backdrop-filter: blur(4px);
                    opacity: 0;
                    transition: opacity 0.15s;
                }

                .bael-copy-wrapper:hover .bael-copy-btn {
                    opacity: 1;
                }

                .bael-copy-wrapper .bael-copy-btn.copied {
                    opacity: 1;
                }

                /* Tooltip feedback */
                .bael-copy-tooltip {
                    position: fixed;
                    padding: 6px 12px;
                    background: #1f2937;
                    color: white;
                    font-size: 0.75rem;
                    border-radius: 6px;
                    white-space: nowrap;
                    pointer-events: none;
                    z-index: 99999;
                    opacity: 0;
                    transform: translateY(4px);
                    transition: all 0.2s;
                }

                .bael-copy-tooltip.visible {
                    opacity: 1;
                    transform: translateY(0);
                }

                .bael-copy-tooltip::after {
                    content: '';
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%);
                    border: 5px solid transparent;
                    border-top-color: #1f2937;
                }

                /* Animation */
                @keyframes bael-copy-pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }

                .bael-copy-btn.pulse {
                    animation: bael-copy-pulse 0.3s ease-out;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // COPY OPERATIONS
    // ============================================================

    /**
     * Copy text to clipboard
     */
    async text(text, options = {}) {
      const config = {
        showFeedback: true,
        feedbackType: "tooltip", // tooltip, console
        successMessage: "Copied!",
        errorMessage: "Failed to copy",
        onSuccess: null,
        onError: null,
        ...options,
      };

      try {
        await navigator.clipboard.writeText(text);

        if (config.showFeedback) {
          this._showFeedback(config.successMessage, "success");
        }

        if (config.onSuccess) {
          config.onSuccess(text);
        }

        return true;
      } catch (error) {
        console.error("Copy failed:", error);

        // Fallback for older browsers
        try {
          this._fallbackCopy(text);

          if (config.showFeedback) {
            this._showFeedback(config.successMessage, "success");
          }

          if (config.onSuccess) {
            config.onSuccess(text);
          }

          return true;
        } catch (fallbackError) {
          if (config.showFeedback) {
            this._showFeedback(config.errorMessage, "error");
          }

          if (config.onError) {
            config.onError(fallbackError);
          }

          return false;
        }
      }
    }

    /**
     * Fallback copy method
     */
    _fallbackCopy(text) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    /**
     * Copy HTML/rich text to clipboard
     */
    async html(html, options = {}) {
      const config = {
        showFeedback: true,
        successMessage: "Copied!",
        ...options,
      };

      try {
        const blob = new Blob([html], { type: "text/html" });
        const plainBlob = new Blob([this._stripHtml(html)], {
          type: "text/plain",
        });

        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": blob,
            "text/plain": plainBlob,
          }),
        ]);

        if (config.showFeedback) {
          this._showFeedback(config.successMessage, "success");
        }

        return true;
      } catch (error) {
        console.error("HTML copy failed:", error);
        // Fall back to text copy
        return this.text(this._stripHtml(html), options);
      }
    }

    /**
     * Strip HTML tags
     */
    _stripHtml(html) {
      const tmp = document.createElement("div");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    }

    /**
     * Copy from element
     */
    async fromElement(element, options = {}) {
      if (typeof element === "string") {
        element = document.querySelector(element);
      }

      if (!element) {
        console.error("Copy element not found");
        return false;
      }

      const text = element.textContent || element.value || "";
      return this.text(text, options);
    }

    /**
     * Copy image to clipboard
     */
    async image(imageSource, options = {}) {
      const config = {
        showFeedback: true,
        successMessage: "Image copied!",
        errorMessage: "Failed to copy image",
        ...options,
      };

      try {
        let blob;

        if (imageSource instanceof Blob) {
          blob = imageSource;
        } else if (typeof imageSource === "string") {
          // URL or data URL
          const response = await fetch(imageSource);
          blob = await response.blob();
        } else if (imageSource instanceof HTMLImageElement) {
          // Canvas method
          const canvas = document.createElement("canvas");
          canvas.width = imageSource.naturalWidth;
          canvas.height = imageSource.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(imageSource, 0, 0);
          blob = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/png"),
          );
        } else if (imageSource instanceof HTMLCanvasElement) {
          blob = await new Promise((resolve) =>
            imageSource.toBlob(resolve, "image/png"),
          );
        }

        await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);

        if (config.showFeedback) {
          this._showFeedback(config.successMessage, "success");
        }

        return true;
      } catch (error) {
        console.error("Image copy failed:", error);

        if (config.showFeedback) {
          this._showFeedback(config.errorMessage, "error");
        }

        return false;
      }
    }

    // ============================================================
    // BUTTONS
    // ============================================================

    /**
     * Create copy button
     */
    button(options = {}) {
      const config = {
        text: "Copy",
        copiedText: "Copied!",
        icon: "📋",
        copiedIcon: "✓",
        showIcon: true,
        showText: true,
        inline: false,
        target: null, // selector or element to copy from
        copyText: null, // direct text to copy
        resetDelay: 2000,
        onClick: null,
        ...options,
      };

      const btn = document.createElement("button");
      btn.className = `bael-copy-btn ${config.inline ? "inline" : ""}`;
      btn.type = "button";

      this._updateButtonContent(btn, config, false);

      btn.addEventListener("click", async () => {
        let textToCopy;

        if (config.copyText) {
          textToCopy =
            typeof config.copyText === "function"
              ? config.copyText()
              : config.copyText;
        } else if (config.target) {
          const target =
            typeof config.target === "string"
              ? document.querySelector(config.target)
              : config.target;
          textToCopy = target?.textContent || target?.value || "";
        }

        if (textToCopy) {
          const success = await this.text(textToCopy, { showFeedback: false });

          if (success) {
            btn.classList.add("copied", "pulse");
            this._updateButtonContent(btn, config, true);

            setTimeout(() => {
              btn.classList.remove("copied", "pulse");
              this._updateButtonContent(btn, config, false);
            }, config.resetDelay);
          }
        }

        if (config.onClick) {
          config.onClick(textToCopy);
        }
      });

      return btn;
    }

    /**
     * Update button content
     */
    _updateButtonContent(btn, config, copied) {
      let html = "";

      if (config.showIcon) {
        const icon = copied ? config.copiedIcon : config.icon;
        html += `<span class="bael-copy-btn-icon">${icon}</span>`;
      }

      if (config.showText) {
        const text = copied ? config.copiedText : config.text;
        html += `<span>${text}</span>`;
      }

      btn.innerHTML = html;
    }

    /**
     * Add copy button to code blocks
     */
    enhanceCodeBlocks(options = {}) {
      const config = {
        selector: "pre code, pre.code, code.block",
        buttonPosition: "top-right",
        ...options,
      };

      document.querySelectorAll(config.selector).forEach((codeBlock) => {
        // Skip if already enhanced
        if (codeBlock.parentElement.classList.contains("bael-copy-wrapper")) {
          return;
        }

        // Wrap the code block
        const wrapper = document.createElement("div");
        wrapper.className = "bael-copy-wrapper";
        codeBlock.parentNode.insertBefore(wrapper, codeBlock);
        wrapper.appendChild(codeBlock);

        // Add copy button
        const btn = this.button({
          text: "",
          copiedText: "",
          icon: "📋",
          copiedIcon: "✓",
          showText: false,
          inline: true,
          copyText: () => codeBlock.textContent,
        });

        wrapper.appendChild(btn);
      });
    }

    // ============================================================
    // FEEDBACK
    // ============================================================

    /**
     * Show feedback tooltip
     */
    _showFeedback(message, type = "success") {
      const tooltip = document.createElement("div");
      tooltip.className = "bael-copy-tooltip";
      tooltip.textContent = message;

      // Position near cursor or center
      const x = window.innerWidth / 2;
      const y = 100;

      tooltip.style.left = `${x}px`;
      tooltip.style.top = `${y}px`;
      tooltip.style.transform = "translateX(-50%) translateY(4px)";

      document.body.appendChild(tooltip);

      // Animate in
      requestAnimationFrame(() => {
        tooltip.classList.add("visible");
        tooltip.style.transform = "translateX(-50%) translateY(0)";
      });

      // Remove after delay
      setTimeout(() => {
        tooltip.classList.remove("visible");
        setTimeout(() => tooltip.remove(), 200);
      }, 1500);
    }

    // ============================================================
    // PASTE DETECTION
    // ============================================================

    /**
     * Listen for paste events
     */
    onPaste(element, callback) {
      if (typeof element === "string") {
        element = document.querySelector(element);
      }

      if (!element) {
        element = document;
      }

      element.addEventListener("paste", async (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        const result = {
          text: null,
          html: null,
          files: [],
          images: [],
        };

        for (const item of items) {
          if (item.kind === "string") {
            if (item.type === "text/plain") {
              result.text = await new Promise((resolve) =>
                item.getAsString(resolve),
              );
            } else if (item.type === "text/html") {
              result.html = await new Promise((resolve) =>
                item.getAsString(resolve),
              );
            }
          } else if (item.kind === "file") {
            const file = item.getAsFile();
            result.files.push(file);

            if (file.type.startsWith("image/")) {
              result.images.push(file);
            }
          }
        }

        callback(result, e);
      });
    }

    /**
     * Read clipboard content
     */
    async read() {
      try {
        const text = await navigator.clipboard.readText();
        return { text };
      } catch (error) {
        console.error("Failed to read clipboard:", error);
        return null;
      }
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelCopy();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$copy = (text, options) => bael.text(text, options);
  window.$copy.text = (text, options) => bael.text(text, options);
  window.$copy.html = (html, options) => bael.html(html, options);
  window.$copy.image = (source, options) => bael.image(source, options);
  window.$copy.fromElement = (el, options) => bael.fromElement(el, options);
  window.$copy.button = (options) => bael.button(options);
  window.$copy.enhanceCodeBlocks = (options) => bael.enhanceCodeBlocks(options);
  window.$copy.onPaste = (el, callback) => bael.onPaste(el, callback);
  window.$copy.read = () => bael.read();

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelCopy = bael;

  console.log("📋 BAEL Copy Component loaded");
})();
