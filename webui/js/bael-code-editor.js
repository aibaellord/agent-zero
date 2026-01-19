/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BAEL - LORD OF ALL
 * CODE EDITOR INTEGRATION
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Full-featured code editor for in-chat coding:
 * - Syntax highlighting for 20+ languages
 * - Line numbers and code folding
 * - Auto-completion and snippets
 * - Multiple tabs/files
 * - Execute code directly
 * - Share code with AI
 *
 * @version 1.0.0
 */

(function () {
  "use strict";

  class BaelCodeEditor {
    constructor() {
      // Editor state
      this.tabs = new Map();
      this.activeTab = null;
      this.counter = 0;

      // Settings
      this.settings = {
        theme: "dark",
        fontSize: 14,
        tabSize: 4,
        lineNumbers: true,
        wordWrap: false,
        autoComplete: true,
        minimap: false,
      };

      // Language configurations
      this.languages = {
        javascript: {
          ext: ".js",
          keywords: [
            "const",
            "let",
            "var",
            "function",
            "return",
            "if",
            "else",
            "for",
            "while",
            "class",
            "import",
            "export",
            "async",
            "await",
          ],
          comment: "//",
        },
        typescript: {
          ext: ".ts",
          keywords: [
            "const",
            "let",
            "var",
            "function",
            "return",
            "if",
            "else",
            "for",
            "while",
            "class",
            "import",
            "export",
            "interface",
            "type",
            "async",
            "await",
          ],
          comment: "//",
        },
        python: {
          ext: ".py",
          keywords: [
            "def",
            "class",
            "import",
            "from",
            "return",
            "if",
            "elif",
            "else",
            "for",
            "while",
            "try",
            "except",
            "with",
            "as",
            "lambda",
            "async",
            "await",
          ],
          comment: "#",
        },
        html: {
          ext: ".html",
          keywords: [
            "html",
            "head",
            "body",
            "div",
            "span",
            "script",
            "style",
            "link",
            "meta",
          ],
          comment: "<!--",
        },
        css: {
          ext: ".css",
          keywords: [
            "color",
            "background",
            "display",
            "flex",
            "grid",
            "margin",
            "padding",
            "border",
            "font",
            "width",
            "height",
          ],
          comment: "/*",
        },
        json: { ext: ".json", keywords: [], comment: null },
        markdown: { ext: ".md", keywords: [], comment: null },
        shell: {
          ext: ".sh",
          keywords: [
            "echo",
            "if",
            "then",
            "else",
            "fi",
            "for",
            "do",
            "done",
            "while",
            "case",
            "esac",
            "function",
          ],
          comment: "#",
        },
        sql: {
          ext: ".sql",
          keywords: [
            "SELECT",
            "FROM",
            "WHERE",
            "INSERT",
            "UPDATE",
            "DELETE",
            "CREATE",
            "TABLE",
            "ALTER",
            "DROP",
            "JOIN",
            "ON",
            "GROUP",
            "ORDER",
            "BY",
          ],
          comment: "--",
        },
        rust: {
          ext: ".rs",
          keywords: [
            "fn",
            "let",
            "mut",
            "const",
            "if",
            "else",
            "match",
            "loop",
            "while",
            "for",
            "impl",
            "struct",
            "enum",
            "pub",
            "use",
            "mod",
          ],
          comment: "//",
        },
        go: {
          ext: ".go",
          keywords: [
            "func",
            "var",
            "const",
            "if",
            "else",
            "for",
            "range",
            "switch",
            "case",
            "type",
            "struct",
            "interface",
            "package",
            "import",
          ],
          comment: "//",
        },
        java: {
          ext: ".java",
          keywords: [
            "public",
            "private",
            "class",
            "static",
            "void",
            "int",
            "String",
            "if",
            "else",
            "for",
            "while",
            "return",
            "new",
            "import",
            "package",
          ],
          comment: "//",
        },
        cpp: {
          ext: ".cpp",
          keywords: [
            "int",
            "void",
            "class",
            "public",
            "private",
            "if",
            "else",
            "for",
            "while",
            "return",
            "include",
            "namespace",
            "using",
            "template",
          ],
          comment: "//",
        },
        php: {
          ext: ".php",
          keywords: [
            "function",
            "class",
            "public",
            "private",
            "if",
            "else",
            "foreach",
            "while",
            "return",
            "echo",
            "use",
            "namespace",
          ],
          comment: "//",
        },
        ruby: {
          ext: ".rb",
          keywords: [
            "def",
            "class",
            "module",
            "if",
            "else",
            "elsif",
            "unless",
            "while",
            "for",
            "do",
            "end",
            "return",
            "require",
          ],
          comment: "#",
        },
        swift: {
          ext: ".swift",
          keywords: [
            "func",
            "var",
            "let",
            "class",
            "struct",
            "if",
            "else",
            "for",
            "while",
            "switch",
            "case",
            "return",
            "import",
          ],
          comment: "//",
        },
        kotlin: {
          ext: ".kt",
          keywords: [
            "fun",
            "val",
            "var",
            "class",
            "if",
            "else",
            "when",
            "for",
            "while",
            "return",
            "import",
            "package",
          ],
          comment: "//",
        },
        yaml: { ext: ".yaml", keywords: [], comment: "#" },
        toml: { ext: ".toml", keywords: [], comment: "#" },
      };

      // Snippets
      this.snippets = {
        javascript: {
          fn: "function ${1:name}(${2:params}) {\n\t${3}\n}",
          afn: "async function ${1:name}(${2:params}) {\n\t${3}\n}",
          cl: "console.log(${1});",
          imp: "import { ${2} } from '${1}';",
        },
        python: {
          def: "def ${1:name}(${2:params}):\n\t${3:pass}",
          class: "class ${1:Name}:\n\tdef __init__(self):\n\t\t${2:pass}",
          main: "if __name__ == '__main__':\n\t${1:pass}",
        },
        html: {
          html5:
            '<!DOCTYPE html>\n<html lang="en">\n<head>\n\t<meta charset="UTF-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t<title>${1:Document}</title>\n</head>\n<body>\n\t${2}\n</body>\n</html>',
          div: '<div class="${1}">\n\t${2}\n</div>',
        },
      };

      // UI
      this.panel = null;
      this.isVisible = false;
      this.editor = null;
      this.lineNumbers = null;

      this.init();
    }

    init() {
      this.loadSettings();
      this.createUI();
      this.addStyles();
      this.bindEvents();
      this.createNewTab("untitled.js", "javascript");
      console.log("📝 Bael Code Editor initialized");
    }

    // ═════════════════════════════════════════════════════════════════
    // TAB MANAGEMENT
    // ═════════════════════════════════════════════════════════════════

    createNewTab(name = "untitled.js", language = "javascript", content = "") {
      const id = "tab_" + ++this.counter;
      const tab = {
        id,
        name,
        language,
        content,
        modified: false,
        cursorPosition: { line: 1, column: 1 },
        scrollPosition: 0,
      };

      this.tabs.set(id, tab);
      this.switchToTab(id);
      this.updateUI();

      return tab;
    }

    switchToTab(tabId) {
      if (this.activeTab) {
        // Save current state
        const current = this.tabs.get(this.activeTab);
        if (current && this.editor) {
          current.content = this.editor.value;
          current.scrollPosition = this.editor.scrollTop;
        }
      }

      this.activeTab = tabId;
      const tab = this.tabs.get(tabId);
      if (tab && this.editor) {
        this.editor.value = tab.content;
        this.editor.scrollTop = tab.scrollPosition;
        this.updateLineNumbers();
        this.highlightSyntax();
      }
      this.updateTabsUI();
    }

    closeTab(tabId) {
      const tab = this.tabs.get(tabId);
      if (tab?.modified) {
        if (!confirm(`Close "${tab.name}" without saving?`)) return;
      }

      this.tabs.delete(tabId);
      if (this.activeTab === tabId) {
        const remaining = Array.from(this.tabs.keys());
        if (remaining.length > 0) {
          this.switchToTab(remaining[remaining.length - 1]);
        } else {
          this.createNewTab();
        }
      }
      this.updateUI();
    }

    renameTab(tabId, newName) {
      const tab = this.tabs.get(tabId);
      if (tab) {
        tab.name = newName;
        // Detect language from extension
        const ext = newName.split(".").pop()?.toLowerCase();
        for (const [lang, config] of Object.entries(this.languages)) {
          if (config.ext === "." + ext) {
            tab.language = lang;
            break;
          }
        }
        this.updateUI();
      }
    }

    // ═════════════════════════════════════════════════════════════════
    // EDITOR FUNCTIONALITY
    // ═════════════════════════════════════════════════════════════════

    updateLineNumbers() {
      if (!this.editor || !this.lineNumbers) return;

      const lines = this.editor.value.split("\n").length;
      let html = "";
      for (let i = 1; i <= lines; i++) {
        html += `<div class="line-number">${i}</div>`;
      }
      this.lineNumbers.innerHTML = html;
    }

    highlightSyntax() {
      // Basic syntax highlighting via overlay
      const tab = this.tabs.get(this.activeTab);
      if (!tab) return;

      const highlight = this.panel?.querySelector(".editor-highlight");
      if (!highlight) return;

      const code = this.editor.value;
      const lang = this.languages[tab.language];
      if (!lang) {
        highlight.textContent = code;
        return;
      }

      let html = this.escapeHtml(code);

      // Highlight strings
      html = html.replace(
        /(["'`])(?:(?!\1|\\).|\\.)*\1/g,
        '<span class="hl-string">$&</span>',
      );

      // Highlight numbers
      html = html.replace(
        /\b(\d+\.?\d*)\b/g,
        '<span class="hl-number">$1</span>',
      );

      // Highlight keywords
      if (lang.keywords.length > 0) {
        const keywordPattern = new RegExp(
          `\\b(${lang.keywords.join("|")})\\b`,
          "g",
        );
        html = html.replace(
          keywordPattern,
          '<span class="hl-keyword">$1</span>',
        );
      }

      // Highlight comments
      if (lang.comment === "//") {
        html = html.replace(
          /(\/\/.*)$/gm,
          '<span class="hl-comment">$1</span>',
        );
      } else if (lang.comment === "#") {
        html = html.replace(/(#.*)$/gm, '<span class="hl-comment">$1</span>');
      }

      highlight.innerHTML = html + "\n";
    }

    escapeHtml(text) {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    handleTab(e) {
      if (e.key === "Tab") {
        e.preventDefault();
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const spaces = " ".repeat(this.settings.tabSize);

        this.editor.value =
          this.editor.value.substring(0, start) +
          spaces +
          this.editor.value.substring(end);
        this.editor.selectionStart = this.editor.selectionEnd =
          start + spaces.length;
        this.markModified();
      }
    }

    handleAutoComplete(e) {
      if (!this.settings.autoComplete) return;

      // Auto-close brackets
      const pairs = {
        "(": ")",
        "[": "]",
        "{": "}",
        '"': '"',
        "'": "'",
        "`": "`",
      };
      if (pairs[e.key]) {
        e.preventDefault();
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const selected = this.editor.value.substring(start, end);

        this.editor.value =
          this.editor.value.substring(0, start) +
          e.key +
          selected +
          pairs[e.key] +
          this.editor.value.substring(end);
        this.editor.selectionStart = this.editor.selectionEnd = start + 1;
        this.markModified();
      }
    }

    insertSnippet(snippet) {
      const tab = this.tabs.get(this.activeTab);
      if (!tab) return;

      const langSnippets = this.snippets[tab.language];
      if (!langSnippets || !langSnippets[snippet]) return;

      const start = this.editor.selectionStart;
      const text = langSnippets[snippet].replace(/\$\{\d+(?::[^}]*)?\}/g, "");

      this.editor.value =
        this.editor.value.substring(0, start) +
        text +
        this.editor.value.substring(this.editor.selectionEnd);
      this.editor.selectionStart = this.editor.selectionEnd =
        start + text.length;
      this.markModified();
    }

    markModified() {
      const tab = this.tabs.get(this.activeTab);
      if (tab) {
        tab.modified = true;
        tab.content = this.editor.value;
      }
      this.updateTabsUI();
      this.updateLineNumbers();
      this.highlightSyntax();
    }

    // ═════════════════════════════════════════════════════════════════
    // CODE ACTIONS
    // ═════════════════════════════════════════════════════════════════

    executeCode() {
      const tab = this.tabs.get(this.activeTab);
      if (!tab) return;

      const code = this.editor.value;
      window.BaelNotifications?.show(
        `Executing ${tab.language} code...`,
        "info",
      );

      // Send to agent for execution
      if (window.Alpine?.store("chat")) {
        const message = `Execute this ${tab.language} code:\n\`\`\`${tab.language}\n${code}\n\`\`\``;
        window.Alpine.store("chat").send(message);
        this.close();
      }
    }

    shareWithAI() {
      const tab = this.tabs.get(this.activeTab);
      if (!tab) return;

      const code = this.editor.value;
      const selected = this.editor.value.substring(
        this.editor.selectionStart,
        this.editor.selectionEnd,
      );

      const shareCode = selected || code;
      const message = `Here's my ${tab.language} code:\n\`\`\`${tab.language}\n${shareCode}\n\`\`\``;

      // Copy to input
      const input = document.querySelector("#user-input");
      if (input) {
        input.value = message;
        input.focus();
        this.close();
      }
    }

    downloadFile() {
      const tab = this.tabs.get(this.activeTab);
      if (!tab) return;

      const blob = new Blob([this.editor.value], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = tab.name;
      a.click();
      URL.revokeObjectURL(url);

      window.BaelNotifications?.show(`Downloaded ${tab.name}`, "success");
    }

    copyToClipboard() {
      const code = this.editor.value;
      navigator.clipboard.writeText(code);
      window.BaelNotifications?.show("Code copied to clipboard", "success");
    }

    formatCode() {
      const tab = this.tabs.get(this.activeTab);
      if (!tab) return;

      // Basic formatting - proper indentation
      let code = this.editor.value;
      let indent = 0;
      const lines = code.split("\n");
      const formatted = lines
        .map((line) => {
          const trimmed = line.trim();
          if (trimmed.match(/^[\}\]\)]/)) indent--;
          const newLine =
            " ".repeat(Math.max(0, indent) * this.settings.tabSize) + trimmed;
          if (trimmed.match(/[\{\[\(]$/)) indent++;
          return newLine;
        })
        .join("\n");

      this.editor.value = formatted;
      this.markModified();
      window.BaelNotifications?.show("Code formatted", "success");
    }

    // ═════════════════════════════════════════════════════════════════
    // UI
    // ═════════════════════════════════════════════════════════════════

    createUI() {
      const panel = document.createElement("div");
      panel.id = "bael-code-editor";
      panel.className = "bael-code-editor";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;
      this.editor = panel.querySelector(".editor-textarea");
      this.lineNumbers = panel.querySelector(".editor-line-numbers");
    }

    renderPanel() {
      const tab = this.tabs.get(this.activeTab);

      return `
                <div class="editor-header">
                    <div class="editor-title">
                        <span class="editor-icon">📝</span>
                        <span>Code Editor</span>
                    </div>
                    <div class="editor-actions">
                        <button class="editor-action" id="editor-format" title="Format Code">⚙️</button>
                        <button class="editor-action" id="editor-copy" title="Copy All">📋</button>
                        <button class="editor-action" id="editor-download" title="Download">💾</button>
                        <button class="editor-action" id="editor-share" title="Share with AI">🤖</button>
                        <button class="editor-action primary" id="editor-execute" title="Execute">▶️</button>
                        <button class="editor-close" id="editor-close">×</button>
                    </div>
                </div>

                <div class="editor-tabs" id="editor-tabs">
                    ${this.renderTabs()}
                    <button class="tab-new" id="editor-new-tab">+</button>
                </div>

                <div class="editor-toolbar">
                    <select class="editor-lang" id="editor-lang">
                        ${Object.keys(this.languages)
                          .map(
                            (lang) => `
                            <option value="${lang}" ${tab?.language === lang ? "selected" : ""}>
                                ${lang}
                            </option>
                        `,
                          )
                          .join("")}
                    </select>
                    <div class="editor-position">
                        Line <span id="editor-line">1</span>, Col <span id="editor-col">1</span>
                    </div>
                </div>

                <div class="editor-container">
                    <div class="editor-line-numbers"></div>
                    <div class="editor-wrapper">
                        <pre class="editor-highlight" aria-hidden="true"></pre>
                        <textarea class="editor-textarea"
                                  spellcheck="false"
                                  placeholder="Write your code here...">${tab?.content || ""}</textarea>
                    </div>
                </div>

                <div class="editor-status">
                    <span class="status-modified">${tab?.modified ? "● Modified" : ""}</span>
                    <span class="status-lang">${tab?.language || ""}</span>
                </div>
            `;
    }

    renderTabs() {
      return Array.from(this.tabs.values())
        .map(
          (tab) => `
                <div class="editor-tab ${tab.id === this.activeTab ? "active" : ""}" data-id="${tab.id}">
                    <span class="tab-name">${tab.name}</span>
                    ${tab.modified ? '<span class="tab-dot">●</span>' : ""}
                    <button class="tab-close" data-id="${tab.id}">×</button>
                </div>
            `,
        )
        .join("");
    }

    updateUI() {
      if (!this.panel) return;
      this.panel.innerHTML = this.renderPanel();
      this.editor = this.panel.querySelector(".editor-textarea");
      this.lineNumbers = this.panel.querySelector(".editor-line-numbers");
      this.bindEditorEvents();
      this.updateLineNumbers();
      this.highlightSyntax();
    }

    updateTabsUI() {
      const tabsContainer = this.panel?.querySelector("#editor-tabs");
      if (tabsContainer) {
        tabsContainer.innerHTML =
          this.renderTabs() +
          '<button class="tab-new" id="editor-new-tab">+</button>';
        this.bindTabEvents();
      }

      const modified = this.panel?.querySelector(".status-modified");
      const tab = this.tabs.get(this.activeTab);
      if (modified && tab) {
        modified.textContent = tab.modified ? "● Modified" : "";
      }
    }

    addStyles() {
      if (document.getElementById("bael-code-editor-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-code-editor-styles";
      styles.textContent = `
                .bael-code-editor {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90vw;
                    max-width: 900px;
                    height: 80vh;
                    background: #0d0d14;
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 16px;
                    z-index: 100070;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 50px 150px rgba(0,0,0,0.8);
                }

                .bael-code-editor.visible {
                    display: flex;
                    animation: editorIn 0.25s ease;
                }

                @keyframes editorIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.96); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .editor-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--color-border, #252535);
                    background: #0f0f17;
                }

                .editor-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--color-text, #fff);
                }

                .editor-icon { font-size: 18px; }

                .editor-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .editor-action {
                    width: 32px;
                    height: 32px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 8px;
                    font-size: 14px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .editor-action:hover {
                    background: var(--color-border, #333);
                }

                .editor-action.primary {
                    background: var(--color-primary, #ff3366);
                    border-color: transparent;
                }

                .editor-close {
                    width: 32px;
                    height: 32px;
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted, #666);
                    font-size: 20px;
                    cursor: pointer;
                    margin-left: 8px;
                }

                .editor-tabs {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    padding: 8px 16px;
                    background: #0a0a10;
                    overflow-x: auto;
                }

                .editor-tab {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    background: transparent;
                    border: 1px solid transparent;
                    border-radius: 6px;
                    color: var(--color-text-muted, #888);
                    font-size: 12px;
                    cursor: pointer;
                    white-space: nowrap;
                }

                .editor-tab.active {
                    background: var(--color-surface, #181820);
                    border-color: var(--color-border, #252535);
                    color: var(--color-text, #fff);
                }

                .tab-dot {
                    color: var(--color-primary, #ff3366);
                    font-size: 10px;
                }

                .tab-close {
                    width: 16px;
                    height: 16px;
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted, #666);
                    font-size: 14px;
                    cursor: pointer;
                    padding: 0;
                    opacity: 0;
                }

                .editor-tab:hover .tab-close { opacity: 1; }

                .tab-new {
                    width: 28px;
                    height: 28px;
                    background: transparent;
                    border: 1px dashed var(--color-border, #333);
                    border-radius: 6px;
                    color: var(--color-text-muted, #666);
                    font-size: 16px;
                    cursor: pointer;
                }

                .editor-toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 16px;
                    border-bottom: 1px solid var(--color-border, #252535);
                }

                .editor-lang {
                    padding: 6px 10px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 6px;
                    color: var(--color-text, #fff);
                    font-size: 12px;
                }

                .editor-position {
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                }

                .editor-container {
                    flex: 1;
                    display: flex;
                    overflow: hidden;
                }

                .editor-line-numbers {
                    width: 50px;
                    padding: 12px 8px;
                    background: #0a0a10;
                    border-right: 1px solid var(--color-border, #252535);
                    font-family: 'Fira Code', monospace;
                    font-size: 13px;
                    line-height: 1.6;
                    color: var(--color-text-muted, #555);
                    text-align: right;
                    overflow: hidden;
                    user-select: none;
                }

                .line-number {
                    height: 21px;
                }

                .editor-wrapper {
                    flex: 1;
                    position: relative;
                    overflow: auto;
                }

                .editor-textarea, .editor-highlight {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    padding: 12px;
                    margin: 0;
                    border: none;
                    font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
                    font-size: 13px;
                    line-height: 1.6;
                    white-space: pre;
                    overflow-wrap: normal;
                    overflow: auto;
                }

                .editor-textarea {
                    background: transparent;
                    color: transparent;
                    caret-color: var(--color-text, #fff);
                    resize: none;
                    z-index: 2;
                }

                .editor-highlight {
                    background: #0d0d14;
                    color: #e6e6e6;
                    pointer-events: none;
                    z-index: 1;
                }

                .hl-keyword { color: #ff79c6; }
                .hl-string { color: #f1fa8c; }
                .hl-number { color: #bd93f9; }
                .hl-comment { color: #6272a4; }
                .hl-function { color: #50fa7b; }

                .editor-status {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 16px;
                    background: #0a0a10;
                    border-top: 1px solid var(--color-border, #252535);
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                }

                .status-modified {
                    color: var(--color-primary, #ff3366);
                }
            `;
      document.head.appendChild(styles);
    }

    // ═════════════════════════════════════════════════════════════════
    // EVENT BINDING
    // ═════════════════════════════════════════════════════════════════

    bindEvents() {
      this.bindEditorEvents();

      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "E") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    bindEditorEvents() {
      if (!this.panel) return;

      // Close button
      this.panel
        .querySelector("#editor-close")
        ?.addEventListener("click", () => this.close());

      // Action buttons
      this.panel
        .querySelector("#editor-format")
        ?.addEventListener("click", () => this.formatCode());
      this.panel
        .querySelector("#editor-copy")
        ?.addEventListener("click", () => this.copyToClipboard());
      this.panel
        .querySelector("#editor-download")
        ?.addEventListener("click", () => this.downloadFile());
      this.panel
        .querySelector("#editor-share")
        ?.addEventListener("click", () => this.shareWithAI());
      this.panel
        .querySelector("#editor-execute")
        ?.addEventListener("click", () => this.executeCode());

      // New tab
      this.panel
        .querySelector("#editor-new-tab")
        ?.addEventListener("click", () => {
          this.createNewTab();
        });

      // Language change
      this.panel
        .querySelector("#editor-lang")
        ?.addEventListener("change", (e) => {
          const tab = this.tabs.get(this.activeTab);
          if (tab) {
            tab.language = e.target.value;
            this.highlightSyntax();
            this.updateTabsUI();
          }
        });

      // Editor events
      if (this.editor) {
        this.editor.addEventListener("input", () => this.markModified());
        this.editor.addEventListener("keydown", (e) => this.handleTab(e));
        this.editor.addEventListener("keypress", (e) =>
          this.handleAutoComplete(e),
        );
        this.editor.addEventListener("scroll", () => {
          const highlight = this.panel.querySelector(".editor-highlight");
          if (highlight) {
            highlight.scrollTop = this.editor.scrollTop;
            highlight.scrollLeft = this.editor.scrollLeft;
          }
          this.lineNumbers.scrollTop = this.editor.scrollTop;
        });

        // Update cursor position
        this.editor.addEventListener("click", () =>
          this.updateCursorPosition(),
        );
        this.editor.addEventListener("keyup", () =>
          this.updateCursorPosition(),
        );
      }

      this.bindTabEvents();
    }

    bindTabEvents() {
      this.panel?.querySelectorAll(".editor-tab").forEach((tab) => {
        tab.addEventListener("click", (e) => {
          if (e.target.classList.contains("tab-close")) return;
          this.switchToTab(tab.dataset.id);
        });

        tab.addEventListener("dblclick", () => {
          const newName = prompt(
            "Rename file:",
            this.tabs.get(tab.dataset.id)?.name,
          );
          if (newName) {
            this.renameTab(tab.dataset.id, newName);
          }
        });
      });

      this.panel?.querySelectorAll(".tab-close").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.closeTab(btn.dataset.id);
        });
      });
    }

    updateCursorPosition() {
      if (!this.editor) return;

      const text = this.editor.value.substring(0, this.editor.selectionStart);
      const lines = text.split("\n");
      const line = lines.length;
      const col = lines[lines.length - 1].length + 1;

      const lineEl = this.panel?.querySelector("#editor-line");
      const colEl = this.panel?.querySelector("#editor-col");
      if (lineEl) lineEl.textContent = line;
      if (colEl) colEl.textContent = col;
    }

    // ═════════════════════════════════════════════════════════════════
    // SETTINGS & PERSISTENCE
    // ═════════════════════════════════════════════════════════════════

    loadSettings() {
      try {
        const saved = JSON.parse(
          localStorage.getItem("bael_code_editor_settings") || "{}",
        );
        this.settings = { ...this.settings, ...saved };
      } catch (e) {
        console.warn("Failed to load editor settings:", e);
      }
    }

    saveSettings() {
      localStorage.setItem(
        "bael_code_editor_settings",
        JSON.stringify(this.settings),
      );
    }

    // ═════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═════════════════════════════════════════════════════════════════

    openWithCode(code, language = "javascript", filename = "untitled.js") {
      this.createNewTab(filename, language, code);
      this.open();
    }

    open() {
      this.isVisible = true;
      this.panel.classList.add("visible");
      this.editor?.focus();
    }

    close() {
      this.isVisible = false;
      this.panel.classList.remove("visible");
    }

    toggle() {
      this.isVisible ? this.close() : this.open();
    }
  }

  window.BaelCodeEditor = new BaelCodeEditor();
})();
