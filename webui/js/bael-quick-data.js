/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   ██████╗ ██╗   ██╗██╗ ██████╗██╗  ██╗    ██████╗  █████╗ ████████╗ █████╗█
 * █  ██╔═══██╗██║   ██║██║██╔════╝██║ ██╔╝    ██╔══██╗██╔══██╗╚══██╔══╝██╔══██╗
 * █  ██║   ██║██║   ██║██║██║     █████╔╝     ██║  ██║███████║   ██║   ███████║
 * █  ██║▄▄ ██║██║   ██║██║██║     ██╔═██╗     ██║  ██║██╔══██║   ██║   ██╔══██║
 * █  ╚██████╔╝╚██████╔╝██║╚██████╗██║  ██╗    ██████╔╝██║  ██║   ██║   ██║  ██║
 * █   ╚══▀▀═╝  ╚═════╝ ╚═╝ ╚═════╝╚═╝  ╚═╝    ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝█
 * █                                                                          █
 * █   BAEL QUICK DATA - Instant Data Extraction & Transformation Tool       █
 * █   Extract, transform, and format data from AI responses instantly       █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelQuickData {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;
      this.currentData = "";
      this.extractedData = [];
    }

    async initialize() {
      console.log("📊 Bael Quick Data initializing...");

      this.injectStyles();
      this.createContainer();
      this.setupShortcuts();
      this.observeSelection();

      this.initialized = true;
      console.log("✅ BAEL QUICK DATA READY (Ctrl+Shift+D)");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-quickdata-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-quickdata-styles";
      styles.textContent = `
                .bael-quickdata-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 600px;
                    max-width: 90vw;
                    max-height: 80vh;
                    background: #12121a;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6);
                    z-index: 9800;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                }

                .bael-quickdata-panel.visible {
                    display: flex;
                    animation: quickdataIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @keyframes quickdataIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }

                .quickdata-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .quickdata-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .quickdata-close {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 18px;
                }

                .quickdata-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                .quickdata-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .quickdata-input-area {
                    padding: 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .quickdata-textarea {
                    width: 100%;
                    height: 120px;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 10px;
                    color: #fff;
                    font-size: 13px;
                    font-family: 'SF Mono', monospace;
                    resize: vertical;
                    outline: none;
                }

                .quickdata-textarea:focus {
                    border-color: rgba(99, 102, 241, 0.5);
                }

                .quickdata-tools {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    padding: 12px 16px;
                    background: rgba(255, 255, 255, 0.02);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .quickdata-tool {
                    padding: 8px 14px;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .quickdata-tool:hover {
                    background: rgba(99, 102, 241, 0.15);
                    border-color: rgba(99, 102, 241, 0.3);
                }

                .quickdata-output-area {
                    flex: 1;
                    padding: 16px;
                    overflow-y: auto;
                }

                .quickdata-output {
                    min-height: 100px;
                    padding: 12px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 10px;
                    font-family: 'SF Mono', monospace;
                    font-size: 12px;
                    line-height: 1.5;
                    color: rgba(255, 255, 255, 0.8);
                    white-space: pre-wrap;
                    overflow-x: auto;
                }

                .quickdata-output.success {
                    border-left: 3px solid #10b981;
                }

                .quickdata-output.error {
                    border-left: 3px solid #ef4444;
                    color: #fca5a5;
                }

                .quickdata-stats {
                    display: flex;
                    gap: 20px;
                    padding: 8px 16px;
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .stat-value {
                    color: #a5b4fc;
                    font-weight: 600;
                }

                .quickdata-actions {
                    display: flex;
                    gap: 8px;
                    padding: 12px 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }

                .quickdata-btn {
                    flex: 1;
                    padding: 10px;
                    border-radius: 8px;
                    border: none;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .quickdata-btn.primary {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: #fff;
                }

                .quickdata-btn.primary:hover {
                    opacity: 0.9;
                }

                .quickdata-btn.secondary {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                .quickdata-btn.secondary:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                /* Overlay */
                .quickdata-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    z-index: 9799;
                    display: none;
                }

                .quickdata-overlay.visible {
                    display: block;
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      // Overlay
      this.overlay = document.createElement("div");
      this.overlay.className = "quickdata-overlay";
      this.overlay.onclick = () => this.hide();
      document.body.appendChild(this.overlay);

      // Main panel
      this.container = document.createElement("div");
      this.container.id = "bael-quickdata-panel";
      this.container.className = "bael-quickdata-panel";

      this.render();
      document.body.appendChild(this.container);
    }

    render() {
      this.container.innerHTML = `
                <div class="quickdata-header">
                    <div class="quickdata-title">
                        <span>📊</span>
                        Quick Data
                    </div>
                    <button class="quickdata-close" onclick="BaelQuickData.hide()">✕</button>
                </div>

                <div class="quickdata-content">
                    <div class="quickdata-input-area">
                        <textarea class="quickdata-textarea"
                                  id="quickdata-input"
                                  placeholder="Paste or type data here... (or select text and press Ctrl+Shift+D)">${this.currentData}</textarea>
                    </div>

                    <div class="quickdata-tools">
                        <button class="quickdata-tool" onclick="BaelQuickData.extractEmails()">
                            📧 Emails
                        </button>
                        <button class="quickdata-tool" onclick="BaelQuickData.extractURLs()">
                            🔗 URLs
                        </button>
                        <button class="quickdata-tool" onclick="BaelQuickData.extractNumbers()">
                            🔢 Numbers
                        </button>
                        <button class="quickdata-tool" onclick="BaelQuickData.extractCode()">
                            💻 Code Blocks
                        </button>
                        <button class="quickdata-tool" onclick="BaelQuickData.extractJSON()">
                            📋 JSON
                        </button>
                        <button class="quickdata-tool" onclick="BaelQuickData.extractList()">
                            📝 List Items
                        </button>
                        <button class="quickdata-tool" onclick="BaelQuickData.toJSON()">
                            ➡️ To JSON
                        </button>
                        <button class="quickdata-tool" onclick="BaelQuickData.toCSV()">
                            ➡️ To CSV
                        </button>
                        <button class="quickdata-tool" onclick="BaelQuickData.toMarkdown()">
                            ➡️ To Markdown
                        </button>
                        <button class="quickdata-tool" onclick="BaelQuickData.minify()">
                            📦 Minify
                        </button>
                        <button class="quickdata-tool" onclick="BaelQuickData.prettify()">
                            ✨ Prettify
                        </button>
                    </div>

                    <div class="quickdata-output-area">
                        <div class="quickdata-output" id="quickdata-output">
                            Output will appear here...
                        </div>
                    </div>

                    <div class="quickdata-stats" id="quickdata-stats">
                        <div class="stat-item">Input: <span class="stat-value" id="stat-input">0</span> chars</div>
                        <div class="stat-item">Output: <span class="stat-value" id="stat-output">0</span> items</div>
                    </div>
                </div>

                <div class="quickdata-actions">
                    <button class="quickdata-btn secondary" onclick="BaelQuickData.clear()">
                        🗑️ Clear
                    </button>
                    <button class="quickdata-btn primary" onclick="BaelQuickData.copyOutput()">
                        📋 Copy Output
                    </button>
                </div>
            `;

      // Add input listener
      setTimeout(() => {
        const input = document.getElementById("quickdata-input");
        if (input) {
          input.addEventListener("input", () => this.updateStats());
        }
      }, 0);
    }

    getInput() {
      return document.getElementById("quickdata-input")?.value || "";
    }

    setOutput(content, isError = false) {
      const output = document.getElementById("quickdata-output");
      if (output) {
        output.textContent = content;
        output.className =
          "quickdata-output " + (isError ? "error" : "success");
      }
      this.updateStats();
    }

    updateStats() {
      const input = this.getInput();
      const output =
        document.getElementById("quickdata-output")?.textContent || "";

      document.getElementById("stat-input").textContent = input.length;

      // Count output items (lines or array items)
      const lines = output.split("\n").filter((l) => l.trim()).length;
      document.getElementById("stat-output").textContent = lines;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EXTRACTION TOOLS
    // ═══════════════════════════════════════════════════════════════════════

    extractEmails() {
      const text = this.getInput();
      const emails =
        text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
      const unique = [...new Set(emails)];
      this.setOutput(unique.length > 0 ? unique.join("\n") : "No emails found");
    }

    extractURLs() {
      const text = this.getInput();
      const urls = text.match(/https?:\/\/[^\s<>"{}|\\^`[\]]+/g) || [];
      const unique = [...new Set(urls)];
      this.setOutput(unique.length > 0 ? unique.join("\n") : "No URLs found");
    }

    extractNumbers() {
      const text = this.getInput();
      const numbers = text.match(/-?\d+\.?\d*/g) || [];
      this.setOutput(
        numbers.length > 0 ? numbers.join("\n") : "No numbers found",
      );
    }

    extractCode() {
      const text = this.getInput();
      const codeBlocks = text.match(/```[\s\S]*?```/g) || [];
      const cleaned = codeBlocks.map((block) =>
        block
          .replace(/```\w*\n?/g, "")
          .replace(/```$/g, "")
          .trim(),
      );
      this.setOutput(
        cleaned.length > 0
          ? cleaned.join("\n\n---\n\n")
          : "No code blocks found",
      );
    }

    extractJSON() {
      const text = this.getInput();
      try {
        // Try to find JSON objects or arrays
        const jsonMatch = text.match(/[{[][\s\S]*?[}\]]/g) || [];
        const validJSON = [];

        jsonMatch.forEach((match) => {
          try {
            const parsed = JSON.parse(match);
            validJSON.push(JSON.stringify(parsed, null, 2));
          } catch {}
        });

        this.setOutput(
          validJSON.length > 0 ? validJSON.join("\n\n") : "No valid JSON found",
        );
      } catch (e) {
        this.setOutput("Error extracting JSON: " + e.message, true);
      }
    }

    extractList() {
      const text = this.getInput();
      // Match various list formats
      const items =
        text.match(/^[\s]*[-*•]\s*.+$/gm) ||
        text.match(/^\s*\d+[.)]\s*.+$/gm) ||
        [];
      const cleaned = items.map((item) =>
        item.replace(/^[\s]*[-*•\d.)\s]+/, "").trim(),
      );
      this.setOutput(
        cleaned.length > 0 ? cleaned.join("\n") : "No list items found",
      );
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TRANSFORMATION TOOLS
    // ═══════════════════════════════════════════════════════════════════════

    toJSON() {
      const text = this.getInput();
      const lines = text.split("\n").filter((l) => l.trim());

      try {
        // Try to detect key:value pairs
        if (lines.some((l) => l.includes(":"))) {
          const obj = {};
          lines.forEach((line) => {
            const [key, ...valueParts] = line.split(":");
            if (key && valueParts.length > 0) {
              obj[key.trim()] = valueParts.join(":").trim();
            }
          });
          this.setOutput(JSON.stringify(obj, null, 2));
        } else {
          // Convert to array
          this.setOutput(JSON.stringify(lines, null, 2));
        }
      } catch (e) {
        this.setOutput("Error converting to JSON: " + e.message, true);
      }
    }

    toCSV() {
      const text = this.getInput();
      try {
        // Try to parse as JSON first
        const data = JSON.parse(text);

        if (Array.isArray(data)) {
          if (data.length > 0 && typeof data[0] === "object") {
            const headers = Object.keys(data[0]);
            const rows = data.map((item) =>
              headers
                .map(
                  (h) => `"${(item[h] || "").toString().replace(/"/g, '""')}"`,
                )
                .join(","),
            );
            this.setOutput([headers.join(","), ...rows].join("\n"));
          } else {
            this.setOutput(data.join("\n"));
          }
        } else if (typeof data === "object") {
          const rows = Object.entries(data).map(([k, v]) => `"${k}","${v}"`);
          this.setOutput(rows.join("\n"));
        }
      } catch {
        // Not JSON, convert lines to CSV
        const lines = text.split("\n").filter((l) => l.trim());
        const csv = lines.map((l) => `"${l.replace(/"/g, '""')}"`).join("\n");
        this.setOutput(csv);
      }
    }

    toMarkdown() {
      const text = this.getInput();
      try {
        const data = JSON.parse(text);

        if (
          Array.isArray(data) &&
          data.length > 0 &&
          typeof data[0] === "object"
        ) {
          // Convert to markdown table
          const headers = Object.keys(data[0]);
          const headerRow = "| " + headers.join(" | ") + " |";
          const separator = "| " + headers.map(() => "---").join(" | ") + " |";
          const rows = data.map(
            (item) =>
              "| " + headers.map((h) => item[h] || "").join(" | ") + " |",
          );
          this.setOutput([headerRow, separator, ...rows].join("\n"));
        } else if (typeof data === "object") {
          const rows = Object.entries(data).map(([k, v]) => `- **${k}**: ${v}`);
          this.setOutput(rows.join("\n"));
        } else {
          this.setOutput(
            "- " +
              text
                .split("\n")
                .filter((l) => l.trim())
                .join("\n- "),
          );
        }
      } catch {
        // Not JSON, convert to list
        const lines = text.split("\n").filter((l) => l.trim());
        this.setOutput(lines.map((l) => "- " + l).join("\n"));
      }
    }

    minify() {
      const text = this.getInput();
      try {
        const parsed = JSON.parse(text);
        this.setOutput(JSON.stringify(parsed));
      } catch {
        // Not JSON, just remove extra whitespace
        this.setOutput(text.replace(/\s+/g, " ").trim());
      }
    }

    prettify() {
      const text = this.getInput();
      try {
        const parsed = JSON.parse(text);
        this.setOutput(JSON.stringify(parsed, null, 2));
      } catch (e) {
        this.setOutput("Error: Input is not valid JSON\n" + e.message, true);
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════════════

    clear() {
      document.getElementById("quickdata-input").value = "";
      document.getElementById("quickdata-output").textContent =
        "Output will appear here...";
      document.getElementById("quickdata-output").className =
        "quickdata-output";
      this.updateStats();
    }

    copyOutput() {
      const output =
        document.getElementById("quickdata-output")?.textContent || "";
      navigator.clipboard.writeText(output);
      this.showToast("Copied to clipboard!");
    }

    showToast(message) {
      const toast = document.createElement("div");
      toast.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(16, 185, 129, 0.9);
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

    observeSelection() {
      // Optional: auto-fill from selection
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "D") {
          e.preventDefault();

          // Get selected text if any
          const selection = window.getSelection()?.toString().trim();
          if (selection) {
            this.currentData = selection;
          }

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
      this.render();
      this.overlay.classList.add("visible");
      this.container.classList.add("visible");

      setTimeout(() => {
        document.getElementById("quickdata-input")?.focus();
      }, 50);
    }

    hide() {
      this.visible = false;
      this.overlay.classList.remove("visible");
      this.container.classList.remove("visible");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelQuickData = new BaelQuickData();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelQuickData.initialize();
    });
  } else {
    window.BaelQuickData.initialize();
  }

  console.log("📊 Bael Quick Data loaded");
})();
