/**
 * BAEL Clipboard Manager - Enhanced Copy/Paste
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete clipboard with:
 * - Copy/paste detection
 * - Clipboard history
 * - Rich content support
 * - Drag and drop
 * - Paste preprocessing
 */

(function () {
  "use strict";

  class BaelClipboard {
    constructor() {
      this.history = [];
      this.maxHistory = 50;
      this.callbacks = {
        copy: [],
        paste: [],
        cut: [],
      };
      this.init();
    }

    init() {
      this.loadHistory();
      this.bindEvents();
      console.log("📋 Bael Clipboard initialized");
    }

    // Load history from storage
    loadHistory() {
      try {
        const saved = localStorage.getItem("bael_clipboard_history");
        if (saved) {
          this.history = JSON.parse(saved);
        }
      } catch (e) {
        this.history = [];
      }
    }

    // Save history to storage
    saveHistory() {
      try {
        localStorage.setItem(
          "bael_clipboard_history",
          JSON.stringify(this.history),
        );
      } catch (e) {
        // Storage full
      }
    }

    // Copy text to clipboard
    async copy(text, options = {}) {
      try {
        await navigator.clipboard.writeText(text);

        this.addToHistory({
          type: "text",
          content: text,
          timestamp: new Date().toISOString(),
        });

        // Trigger callbacks
        this.callbacks.copy.forEach((cb) => cb(text));

        // Show notification
        if (options.notify !== false && window.BaelToast) {
          window.BaelToast.success("Copied to clipboard", { duration: 2000 });
        }

        return true;
      } catch (e) {
        // Fallback for older browsers
        return this.copyFallback(text);
      }
    }

    // Fallback copy method
    copyFallback(text) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();

      try {
        document.execCommand("copy");
        this.addToHistory({
          type: "text",
          content: text,
          timestamp: new Date().toISOString(),
        });
        return true;
      } catch (e) {
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    }

    // Read from clipboard
    async read() {
      try {
        const text = await navigator.clipboard.readText();
        return text;
      } catch (e) {
        console.warn("Clipboard read failed:", e);
        return null;
      }
    }

    // Copy rich content (HTML)
    async copyRich(html, plainText) {
      try {
        const blob = new Blob([html], { type: "text/html" });
        const textBlob = new Blob([plainText || html], { type: "text/plain" });

        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": blob,
            "text/plain": textBlob,
          }),
        ]);

        this.addToHistory({
          type: "html",
          content: html,
          plainText: plainText,
          timestamp: new Date().toISOString(),
        });

        return true;
      } catch (e) {
        // Fallback to plain text
        return this.copy(plainText || html);
      }
    }

    // Copy image
    async copyImage(imageSource) {
      try {
        let blob;

        if (imageSource instanceof Blob) {
          blob = imageSource;
        } else if (typeof imageSource === "string") {
          // URL or data URL
          const response = await fetch(imageSource);
          blob = await response.blob();
        } else if (imageSource instanceof HTMLImageElement) {
          // Convert to blob
          const canvas = document.createElement("canvas");
          canvas.width = imageSource.naturalWidth;
          canvas.height = imageSource.naturalHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(imageSource, 0, 0);
          blob = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/png"),
          );
        }

        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob }),
          ]);

          this.addToHistory({
            type: "image",
            content: URL.createObjectURL(blob),
            timestamp: new Date().toISOString(),
          });

          if (window.BaelToast) {
            window.BaelToast.success("Image copied", { duration: 2000 });
          }

          return true;
        }

        return false;
      } catch (e) {
        console.error("Copy image failed:", e);
        return false;
      }
    }

    // Add to history
    addToHistory(item) {
      // Avoid duplicates
      const existingIndex = this.history.findIndex(
        (h) => h.type === item.type && h.content === item.content,
      );

      if (existingIndex > -1) {
        this.history.splice(existingIndex, 1);
      }

      this.history.unshift(item);

      while (this.history.length > this.maxHistory) {
        this.history.pop();
      }

      this.saveHistory();
    }

    // Get history
    getHistory() {
      return [...this.history];
    }

    // Clear history
    clearHistory() {
      this.history = [];
      this.saveHistory();
    }

    // Copy from history
    copyFromHistory(index) {
      const item = this.history[index];
      if (!item) return false;

      if (item.type === "html") {
        return this.copyRich(item.content, item.plainText);
      }

      return this.copy(item.content, { notify: true });
    }

    // Register callback
    on(event, callback) {
      if (this.callbacks[event]) {
        this.callbacks[event].push(callback);
      }
      return () => {
        const index = this.callbacks[event]?.indexOf(callback);
        if (index > -1) {
          this.callbacks[event].splice(index, 1);
        }
      };
    }

    // Bind events
    bindEvents() {
      // Track copy events
      document.addEventListener("copy", (e) => {
        const selection = window.getSelection()?.toString();
        if (selection) {
          this.addToHistory({
            type: "text",
            content: selection,
            timestamp: new Date().toISOString(),
          });
        }
        this.callbacks.copy.forEach((cb) => cb(selection));
      });

      // Track cut events
      document.addEventListener("cut", (e) => {
        const selection = window.getSelection()?.toString();
        if (selection) {
          this.addToHistory({
            type: "text",
            content: selection,
            timestamp: new Date().toISOString(),
          });
        }
        this.callbacks.cut.forEach((cb) => cb(selection));
      });

      // Track paste events
      document.addEventListener("paste", (e) => {
        const text = e.clipboardData?.getData("text/plain");
        this.callbacks.paste.forEach((cb) => cb(text, e));
      });
    }

    // Copy element content
    copyElement(element) {
      if (typeof element === "string") {
        element = document.querySelector(element);
      }

      if (!element) return false;

      const html = element.innerHTML;
      const text = element.innerText;

      return this.copyRich(html, text);
    }

    // Copy code with formatting
    copyCode(code, language) {
      // Create highlighted version for rich text
      const html = `<pre><code class="language-${language || "text"}">${this.escapeHtml(code)}</code></pre>`;
      return this.copyRich(html, code);
    }

    // Escape HTML
    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    // Auto-copy on selection (optional feature)
    enableAutoSelect(element) {
      if (typeof element === "string") {
        element = document.querySelector(element);
      }

      element?.addEventListener("click", async () => {
        const text = element.innerText || element.textContent;
        await this.copy(text);
      });
    }

    // Create copyable element
    makeCopyable(element, content) {
      if (typeof element === "string") {
        element = document.querySelector(element);
      }

      if (!element) return;

      element.style.cursor = "copy";
      element.title = "Click to copy";

      element.addEventListener("click", async () => {
        const textToCopy = content || element.innerText || element.textContent;
        await this.copy(textToCopy);
      });
    }
  }

  // Initialize
  window.BaelClipboard = new BaelClipboard();

  // Global shortcut
  window.$copy = (text, opts) => window.BaelClipboard.copy(text, opts);
})();
