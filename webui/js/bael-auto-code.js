/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   █████╗ ██╗   ██╗████████╗ ██████╗     ██████╗ ██████╗ ██████╗ ███████╗ █
 * █  ██╔══██╗██║   ██║╚══██╔══╝██╔═══██╗    ██╔════╝██╔═══██╗██╔══██╗██╔════╝ █
 * █  ███████║██║   ██║   ██║   ██║   ██║    ██║     ██║   ██║██║  ██║█████╗   █
 * █  ██╔══██║██║   ██║   ██║   ██║   ██║    ██║     ██║   ██║██║  ██║██╔══╝   █
 * █  ██║  ██║╚██████╔╝   ██║   ╚██████╔╝    ╚██████╗╚██████╔╝██████╔╝███████╗ █
 * █  ╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝      ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝ █
 * █                                                                          █
 * █   BAEL AUTO CODE - Intelligent Code Completion & Generation Assistant   █
 * █   AI-powered code suggestions, snippets, and intelligent autocomplete   █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelAutoCode {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.suggestions = [];
      this.selectedIndex = 0;
      this.triggerChar = null;
      this.storageKey = "bael-autocode";

      // Code snippet templates
      this.snippets = {
        python: [
          {
            trigger: "def",
            label: "Function Definition",
            code: "def ${1:function_name}(${2:params}):\n    ${3:pass}",
          },
          {
            trigger: "class",
            label: "Class Definition",
            code: "class ${1:ClassName}:\n    def __init__(self${2:, params}):\n        ${3:pass}",
          },
          {
            trigger: "for",
            label: "For Loop",
            code: "for ${1:item} in ${2:iterable}:\n    ${3:pass}",
          },
          {
            trigger: "if",
            label: "If Statement",
            code: "if ${1:condition}:\n    ${2:pass}",
          },
          {
            trigger: "try",
            label: "Try/Except",
            code: "try:\n    ${1:pass}\nexcept ${2:Exception} as e:\n    ${3:pass}",
          },
          {
            trigger: "with",
            label: "Context Manager",
            code: "with ${1:expression} as ${2:var}:\n    ${3:pass}",
          },
          {
            trigger: "async",
            label: "Async Function",
            code: "async def ${1:function_name}(${2:params}):\n    ${3:pass}",
          },
          {
            trigger: "lambda",
            label: "Lambda Function",
            code: "lambda ${1:x}: ${2:expression}",
          },
          {
            trigger: "list",
            label: "List Comprehension",
            code: "[${1:expr} for ${2:item} in ${3:iterable}]",
          },
          {
            trigger: "dict",
            label: "Dict Comprehension",
            code: "{${1:key}: ${2:value} for ${3:item} in ${4:iterable}}",
          },
        ],
        javascript: [
          {
            trigger: "fn",
            label: "Function",
            code: "function ${1:name}(${2:params}) {\n    ${3}\n}",
          },
          {
            trigger: "afn",
            label: "Arrow Function",
            code: "const ${1:name} = (${2:params}) => {\n    ${3}\n}",
          },
          {
            trigger: "class",
            label: "Class",
            code: "class ${1:ClassName} {\n    constructor(${2:params}) {\n        ${3}\n    }\n}",
          },
          {
            trigger: "for",
            label: "For Loop",
            code: "for (let ${1:i} = 0; ${1:i} < ${2:length}; ${1:i}++) {\n    ${3}\n}",
          },
          {
            trigger: "fore",
            label: "For Each",
            code: "${1:array}.forEach((${2:item}) => {\n    ${3}\n})",
          },
          {
            trigger: "map",
            label: "Map",
            code: "${1:array}.map((${2:item}) => ${3})",
          },
          {
            trigger: "filter",
            label: "Filter",
            code: "${1:array}.filter((${2:item}) => ${3})",
          },
          {
            trigger: "async",
            label: "Async Function",
            code: "async function ${1:name}(${2:params}) {\n    ${3}\n}",
          },
          {
            trigger: "fetch",
            label: "Fetch Request",
            code: "const response = await fetch('${1:url}');\nconst data = await response.json();",
          },
          {
            trigger: "try",
            label: "Try/Catch",
            code: "try {\n    ${1}\n} catch (error) {\n    ${2:console.error(error)}\n}",
          },
        ],
        bash: [
          {
            trigger: "if",
            label: "If Statement",
            code: "if [ ${1:condition} ]; then\n    ${2}\nfi",
          },
          {
            trigger: "for",
            label: "For Loop",
            code: "for ${1:item} in ${2:list}; do\n    ${3}\ndone",
          },
          {
            trigger: "while",
            label: "While Loop",
            code: "while [ ${1:condition} ]; do\n    ${2}\ndone",
          },
          {
            trigger: "func",
            label: "Function",
            code: "${1:function_name}() {\n    ${2}\n}",
          },
          {
            trigger: "case",
            label: "Case Statement",
            code: "case ${1:variable} in\n    ${2:pattern})\n        ${3}\n        ;;\nesac",
          },
        ],
        sql: [
          {
            trigger: "sel",
            label: "SELECT",
            code: "SELECT ${1:columns}\nFROM ${2:table}\nWHERE ${3:condition};",
          },
          {
            trigger: "ins",
            label: "INSERT",
            code: "INSERT INTO ${1:table} (${2:columns})\nVALUES (${3:values});",
          },
          {
            trigger: "upd",
            label: "UPDATE",
            code: "UPDATE ${1:table}\nSET ${2:column} = ${3:value}\nWHERE ${4:condition};",
          },
          {
            trigger: "del",
            label: "DELETE",
            code: "DELETE FROM ${1:table}\nWHERE ${2:condition};",
          },
          {
            trigger: "join",
            label: "JOIN",
            code: "SELECT ${1:columns}\nFROM ${2:table1}\nJOIN ${3:table2} ON ${4:condition};",
          },
        ],
      };

      // Common patterns
      this.patterns = [
        {
          trigger: "todo",
          label: "TODO Comment",
          code: "// TODO: ${1:description}",
        },
        {
          trigger: "fix",
          label: "FIXME Comment",
          code: "// FIXME: ${1:description}",
        },
        {
          trigger: "note",
          label: "NOTE Comment",
          code: "// NOTE: ${1:description}",
        },
        {
          trigger: "log",
          label: "Console Log",
          code: "console.log(${1:value});",
        },
        { trigger: "print", label: "Print", code: "print(${1:value})" },
      ];
    }

    async initialize() {
      console.log("🚀 Bael Auto Code initializing...");

      this.loadFromStorage();
      this.injectStyles();
      this.createPopup();
      this.setupListeners();

      this.initialized = true;
      console.log("✅ BAEL AUTO CODE READY");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-autocode-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-autocode-styles";
      styles.textContent = `
                .bael-autocode-popup {
                    position: fixed;
                    min-width: 280px;
                    max-width: 400px;
                    max-height: 300px;
                    background: #1a1a2e;
                    border: 1px solid rgba(99, 102, 241, 0.3);
                    border-radius: 12px;
                    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
                    z-index: 9850;
                    display: none;
                    overflow: hidden;
                }

                .bael-autocode-popup.visible {
                    display: block;
                    animation: autocodeIn 0.15s ease-out;
                }

                @keyframes autocodeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-5px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .autocode-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .autocode-title {
                    font-size: 11px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .autocode-lang {
                    font-size: 11px;
                    padding: 2px 8px;
                    background: rgba(99, 102, 241, 0.15);
                    color: #a5b4fc;
                    border-radius: 6px;
                }

                .autocode-list {
                    max-height: 250px;
                    overflow-y: auto;
                    padding: 6px;
                }

                .autocode-list::-webkit-scrollbar {
                    width: 6px;
                }

                .autocode-list::-webkit-scrollbar-track {
                    background: transparent;
                }

                .autocode-list::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                }

                .autocode-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .autocode-item:hover, .autocode-item.selected {
                    background: rgba(99, 102, 241, 0.15);
                }

                .autocode-item.selected {
                    border-left: 3px solid #6366f1;
                    padding-left: 9px;
                }

                .autocode-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: rgba(99, 102, 241, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    color: #a5b4fc;
                    flex-shrink: 0;
                }

                .autocode-info {
                    flex: 1;
                    min-width: 0;
                }

                .autocode-label {
                    font-size: 13px;
                    font-weight: 500;
                    color: #fff;
                    margin-bottom: 2px;
                }

                .autocode-trigger {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    font-family: 'SF Mono', monospace;
                }

                .autocode-shortcut {
                    font-size: 10px;
                    padding: 3px 8px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 4px;
                    color: rgba(255, 255, 255, 0.4);
                }

                .autocode-hint {
                    padding: 8px 12px;
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    text-align: center;
                }
            `;
      document.head.appendChild(styles);
    }

    createPopup() {
      this.popup = document.createElement("div");
      this.popup.className = "bael-autocode-popup";
      document.body.appendChild(this.popup);
    }

    setupListeners() {
      document.addEventListener("keydown", (e) => {
        if (this.visible) {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            this.selectNext();
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            this.selectPrev();
          } else if (e.key === "Enter" || e.key === "Tab") {
            e.preventDefault();
            this.insertSelected();
          } else if (e.key === "Escape") {
            this.hide();
          }
        }
      });

      // Watch for input in textareas and contenteditable
      document.addEventListener("input", (e) => {
        const target = e.target;
        if (
          target.matches(
            'textarea, [contenteditable="true"], input[type="text"]',
          )
        ) {
          this.handleInput(target);
        }
      });

      // Hide on click outside
      document.addEventListener("click", (e) => {
        if (!this.popup.contains(e.target)) {
          this.hide();
        }
      });
    }

    handleInput(element) {
      const text = element.value || element.textContent;
      const cursorPos = element.selectionStart || text.length;

      // Get current word being typed
      const beforeCursor = text.substring(0, cursorPos);
      const wordMatch = beforeCursor.match(/(\w+)$/);

      if (wordMatch && wordMatch[1].length >= 2) {
        const word = wordMatch[1].toLowerCase();
        this.showSuggestions(word, element);
      } else {
        this.hide();
      }
    }

    showSuggestions(query, element) {
      // Detect language from context
      const lang = this.detectLanguage(element);

      // Get matching snippets
      const langSnippets = this.snippets[lang] || [];
      const allSnippets = [...langSnippets, ...this.patterns];

      this.suggestions = allSnippets.filter(
        (s) =>
          s.trigger.startsWith(query) || s.label.toLowerCase().includes(query),
      );

      if (this.suggestions.length === 0) {
        this.hide();
        return;
      }

      this.selectedIndex = 0;
      this.targetElement = element;
      this.currentQuery = query;
      this.render(lang);
      this.position(element);
    }

    detectLanguage(element) {
      const text = element.value || element.textContent || "";

      // Check for language hints
      if (
        text.includes("def ") ||
        text.includes("import ") ||
        text.includes("print(")
      ) {
        return "python";
      }
      if (
        text.includes("function ") ||
        text.includes("const ") ||
        text.includes("=>")
      ) {
        return "javascript";
      }
      if (
        text.includes("SELECT ") ||
        text.includes("FROM ") ||
        text.includes("WHERE ")
      ) {
        return "sql";
      }
      if (
        text.includes("#!/bin/bash") ||
        text.includes("then") ||
        text.includes("fi")
      ) {
        return "bash";
      }

      return "javascript"; // Default
    }

    render(lang) {
      this.popup.innerHTML = `
                <div class="autocode-header">
                    <span class="autocode-title">Code Snippets</span>
                    <span class="autocode-lang">${lang}</span>
                </div>
                <div class="autocode-list">
                    ${this.suggestions
                      .map(
                        (s, i) => `
                        <div class="autocode-item ${i === this.selectedIndex ? "selected" : ""}"
                             onclick="BaelAutoCode.insertAt(${i})">
                            <div class="autocode-icon">📝</div>
                            <div class="autocode-info">
                                <div class="autocode-label">${s.label}</div>
                                <div class="autocode-trigger">${s.trigger}</div>
                            </div>
                            <span class="autocode-shortcut">Tab</span>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
                <div class="autocode-hint">↑↓ Navigate • Tab/Enter Insert • Esc Close</div>
            `;

      this.popup.classList.add("visible");
      this.visible = true;
    }

    position(element) {
      const rect = element.getBoundingClientRect();
      const popupRect = this.popup.getBoundingClientRect();

      let top = rect.bottom + 5;
      let left = rect.left;

      // Adjust if popup would go off screen
      if (top + popupRect.height > window.innerHeight) {
        top = rect.top - popupRect.height - 5;
      }
      if (left + popupRect.width > window.innerWidth) {
        left = window.innerWidth - popupRect.width - 10;
      }

      this.popup.style.top = top + "px";
      this.popup.style.left = left + "px";
    }

    selectNext() {
      this.selectedIndex = (this.selectedIndex + 1) % this.suggestions.length;
      this.updateSelection();
    }

    selectPrev() {
      this.selectedIndex =
        (this.selectedIndex - 1 + this.suggestions.length) %
        this.suggestions.length;
      this.updateSelection();
    }

    updateSelection() {
      const items = this.popup.querySelectorAll(".autocode-item");
      items.forEach((item, i) => {
        item.classList.toggle("selected", i === this.selectedIndex);
      });
    }

    insertAt(index) {
      this.selectedIndex = index;
      this.insertSelected();
    }

    insertSelected() {
      const snippet = this.suggestions[this.selectedIndex];
      if (!snippet || !this.targetElement) return;

      const element = this.targetElement;
      const text = element.value || element.textContent;
      const cursorPos = element.selectionStart || text.length;

      // Find and replace the trigger word
      const beforeCursor = text.substring(0, cursorPos);
      const afterCursor = text.substring(cursorPos);
      const newBefore = beforeCursor.replace(
        new RegExp(this.currentQuery + "$"),
        "",
      );

      // Process the snippet (replace ${n:text} placeholders)
      let code = snippet.code.replace(/\$\{(\d+):?([^}]*)\}/g, "$2");

      // Insert the code
      if (element.value !== undefined) {
        element.value = newBefore + code + afterCursor;
        element.selectionStart = element.selectionEnd =
          newBefore.length + code.length;
      } else {
        element.textContent = newBefore + code + afterCursor;
      }

      // Trigger input event
      element.dispatchEvent(new Event("input", { bubbles: true }));

      this.hide();
    }

    hide() {
      this.popup.classList.remove("visible");
      this.visible = false;
      this.suggestions = [];
    }

    saveToStorage() {
      try {
        localStorage.setItem(
          this.storageKey,
          JSON.stringify({
            customSnippets: this.customSnippets || [],
          }),
        );
      } catch (e) {
        console.error("Failed to save auto code:", e);
      }
    }

    loadFromStorage() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const data = JSON.parse(saved);
          this.customSnippets = data.customSnippets || [];
        }
      } catch (e) {
        console.error("Failed to load auto code:", e);
      }
    }

    // API Methods
    addSnippet(lang, snippet) {
      if (!this.snippets[lang]) {
        this.snippets[lang] = [];
      }
      this.snippets[lang].push(snippet);
    }

    getSnippets(lang) {
      return this.snippets[lang] || [];
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelAutoCode = new BaelAutoCode();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelAutoCode.initialize();
    });
  } else {
    window.BaelAutoCode.initialize();
  }

  console.log("🚀 Bael Auto Code loaded");
})();
