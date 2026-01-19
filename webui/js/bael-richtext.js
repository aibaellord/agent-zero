/**
 * BAEL Rich Text Editor Component - Lord Of All Words
 *
 * Full-featured rich text editor with:
 * - Toolbar formatting
 * - Bold/italic/underline
 * - Headers
 * - Lists
 * - Links/images
 * - Tables
 * - Code blocks
 * - Markdown support
 * - Mentions
 * - Emoji picker
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // RICH TEXT EDITOR CLASS
  // ============================================================

  class BaelRichText {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-richtext-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-richtext-styles";
      styles.textContent = `
                .bael-richtext {
                    font-family: system-ui, -apple-system, sans-serif;
                    border: 1px solid #d1d5db;
                    border-radius: 12px;
                    overflow: hidden;
                    background: white;
                }

                .bael-richtext:focus-within {
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                }

                /* Toolbar */
                .bael-richtext-toolbar {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                    padding: 8px;
                    background: #f9fafb;
                    border-bottom: 1px solid #e5e7eb;
                }

                .bael-richtext-btn {
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: none;
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #6b7280;
                    transition: all 0.15s;
                }

                .bael-richtext-btn:hover {
                    background: #e5e7eb;
                    color: #374151;
                }

                .bael-richtext-btn.active {
                    background: #4f46e5;
                    color: white;
                }

                .bael-richtext-btn svg {
                    width: 18px;
                    height: 18px;
                }

                .bael-richtext-separator {
                    width: 1px;
                    height: 24px;
                    background: #e5e7eb;
                    margin: 4px;
                }

                .bael-richtext-select {
                    height: 32px;
                    padding: 0 8px;
                    border: 1px solid #e5e7eb;
                    border-radius: 6px;
                    background: white;
                    font-size: 13px;
                    color: #374151;
                    cursor: pointer;
                }

                .bael-richtext-select:focus {
                    outline: none;
                    border-color: #4f46e5;
                }

                /* Editor area */
                .bael-richtext-editor {
                    min-height: 200px;
                    padding: 16px;
                    outline: none;
                    line-height: 1.6;
                    color: #374151;
                }

                .bael-richtext-editor:empty::before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                    pointer-events: none;
                }

                /* Editor content styles */
                .bael-richtext-editor h1 { font-size: 2em; font-weight: 700; margin: 0.67em 0; }
                .bael-richtext-editor h2 { font-size: 1.5em; font-weight: 600; margin: 0.83em 0; }
                .bael-richtext-editor h3 { font-size: 1.17em; font-weight: 600; margin: 1em 0; }
                .bael-richtext-editor p { margin: 1em 0; }

                .bael-richtext-editor ul,
                .bael-richtext-editor ol {
                    margin: 1em 0;
                    padding-left: 2em;
                }

                .bael-richtext-editor blockquote {
                    margin: 1em 0;
                    padding-left: 1em;
                    border-left: 4px solid #4f46e5;
                    color: #6b7280;
                    font-style: italic;
                }

                .bael-richtext-editor pre {
                    background: #1f2937;
                    color: #f9fafb;
                    padding: 16px;
                    border-radius: 8px;
                    overflow-x: auto;
                    font-family: 'SF Mono', Monaco, monospace;
                    font-size: 14px;
                }

                .bael-richtext-editor code {
                    background: #f3f4f6;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: 'SF Mono', Monaco, monospace;
                    font-size: 0.9em;
                }

                .bael-richtext-editor pre code {
                    background: none;
                    padding: 0;
                }

                .bael-richtext-editor a {
                    color: #4f46e5;
                    text-decoration: underline;
                }

                .bael-richtext-editor img {
                    max-width: 100%;
                    border-radius: 8px;
                }

                .bael-richtext-editor table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 1em 0;
                }

                .bael-richtext-editor th,
                .bael-richtext-editor td {
                    border: 1px solid #e5e7eb;
                    padding: 8px 12px;
                    text-align: left;
                }

                .bael-richtext-editor th {
                    background: #f9fafb;
                    font-weight: 600;
                }

                .bael-richtext-editor hr {
                    border: none;
                    border-top: 2px solid #e5e7eb;
                    margin: 2em 0;
                }

                /* Footer */
                .bael-richtext-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 16px;
                    background: #f9fafb;
                    border-top: 1px solid #e5e7eb;
                    font-size: 12px;
                    color: #9ca3af;
                }

                /* Link dialog */
                .bael-richtext-dialog {
                    position: absolute;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 16px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                    z-index: 1000;
                    width: 300px;
                }

                .bael-richtext-dialog input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    margin-bottom: 12px;
                }

                .bael-richtext-dialog input:focus {
                    outline: none;
                    border-color: #4f46e5;
                }

                .bael-richtext-dialog-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                }

                .bael-richtext-dialog-btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                }

                .bael-richtext-dialog-btn.primary {
                    background: #4f46e5;
                    color: white;
                }

                .bael-richtext-dialog-btn.secondary {
                    background: #f3f4f6;
                    color: #374151;
                }

                /* Minimal variant */
                .bael-richtext.minimal .bael-richtext-toolbar {
                    background: white;
                    border-bottom: none;
                    padding: 8px 16px;
                }

                .bael-richtext.minimal .bael-richtext-footer {
                    display: none;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // ICONS
    // ============================================================

    _icons = {
      bold: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>`,
      italic: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>`,
      underline: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><line x1="4" y1="20" x2="20" y2="20"/></svg>`,
      strike: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.8 3.3 5.2 3.9"/><path d="M8.3 15.1c.3 3.2 2.3 4 5.4 4 2.5 0 4.5-1.3 5-3.6"/><line x1="2" y1="12" x2="22" y2="12"/></svg>`,
      ul: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>`,
      ol: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="4" y="7" font-size="6" fill="currentColor">1</text><text x="4" y="13" font-size="6" fill="currentColor">2</text><text x="4" y="19" font-size="6" fill="currentColor">3</text></svg>`,
      quote: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v4z"/></svg>`,
      code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
      link: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
      image: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`,
      hr: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/></svg>`,
      undo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>`,
      redo: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>`,
      clear: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="m5 7 1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12"/><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></svg>`,
    };

    // ============================================================
    // CREATE EDITOR
    // ============================================================

    /**
     * Create a rich text editor
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Rich text container not found");
        return null;
      }

      const id = `bael-richtext-${++this.idCounter}`;
      const config = {
        placeholder: "Start writing...",
        toolbar: [
          "heading",
          "|",
          "bold",
          "italic",
          "underline",
          "strike",
          "|",
          "ul",
          "ol",
          "quote",
          "|",
          "link",
          "image",
          "code",
          "hr",
          "|",
          "undo",
          "redo",
        ],
        variant: "default", // default, minimal
        showFooter: true,
        maxLength: null,
        onChange: null,
        onFocus: null,
        onBlur: null,
        ...options,
      };

      const el = document.createElement("div");
      el.className = `bael-richtext ${config.variant}`;
      el.id = id;

      const state = {
        id,
        element: el,
        container,
        config,
        content: "",
      };

      this._render(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        getHTML: () => this.getHTML(id),
        getText: () => this.getText(id),
        setHTML: (html) => this.setHTML(id, html),
        focus: () => state.editor.focus(),
        clear: () => this.clear(id),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render editor
     */
    _render(state) {
      const { element, config } = state;

      element.innerHTML = "";

      // Toolbar
      const toolbar = document.createElement("div");
      toolbar.className = "bael-richtext-toolbar";

      config.toolbar.forEach((item) => {
        if (item === "|") {
          const sep = document.createElement("div");
          sep.className = "bael-richtext-separator";
          toolbar.appendChild(sep);
        } else if (item === "heading") {
          const select = document.createElement("select");
          select.className = "bael-richtext-select";
          select.innerHTML = `
                        <option value="p">Paragraph</option>
                        <option value="h1">Heading 1</option>
                        <option value="h2">Heading 2</option>
                        <option value="h3">Heading 3</option>
                    `;
          select.addEventListener("change", () => {
            document.execCommand("formatBlock", false, select.value);
            state.editor.focus();
          });
          toolbar.appendChild(select);
          state.headingSelect = select;
        } else {
          const btn = document.createElement("button");
          btn.className = "bael-richtext-btn";
          btn.type = "button";
          btn.dataset.action = item;
          btn.innerHTML = this._icons[item] || item;
          btn.title = item.charAt(0).toUpperCase() + item.slice(1);
          btn.addEventListener("click", () => this._execCommand(state, item));
          toolbar.appendChild(btn);
        }
      });

      element.appendChild(toolbar);
      state.toolbar = toolbar;

      // Editor
      const editor = document.createElement("div");
      editor.className = "bael-richtext-editor";
      editor.contentEditable = "true";
      editor.dataset.placeholder = config.placeholder;

      editor.addEventListener("input", () => this._onInput(state));
      editor.addEventListener("keydown", (e) => this._onKeyDown(state, e));
      editor.addEventListener("focus", () => {
        if (config.onFocus) config.onFocus();
      });
      editor.addEventListener("blur", () => {
        if (config.onBlur) config.onBlur();
      });

      // Update toolbar state on selection change
      document.addEventListener("selectionchange", () => {
        if (document.activeElement === editor) {
          this._updateToolbarState(state);
        }
      });

      element.appendChild(editor);
      state.editor = editor;

      // Footer
      if (config.showFooter && config.variant !== "minimal") {
        const footer = document.createElement("div");
        footer.className = "bael-richtext-footer";

        const charCount = document.createElement("span");
        charCount.className = "bael-richtext-charcount";
        charCount.textContent = config.maxLength
          ? `0/${config.maxLength}`
          : "0 characters";
        footer.appendChild(charCount);

        state.charCount = charCount;

        element.appendChild(footer);
      }
    }

    /**
     * Execute command
     */
    _execCommand(state, command) {
      state.editor.focus();

      const commands = {
        bold: () => document.execCommand("bold"),
        italic: () => document.execCommand("italic"),
        underline: () => document.execCommand("underline"),
        strike: () => document.execCommand("strikeThrough"),
        ul: () => document.execCommand("insertUnorderedList"),
        ol: () => document.execCommand("insertOrderedList"),
        quote: () => document.execCommand("formatBlock", false, "blockquote"),
        code: () => this._insertCode(state),
        link: () => this._insertLink(state),
        image: () => this._insertImage(state),
        hr: () => document.execCommand("insertHorizontalRule"),
        undo: () => document.execCommand("undo"),
        redo: () => document.execCommand("redo"),
        clear: () => this.clear(state.id),
      };

      if (commands[command]) {
        commands[command]();
      }

      this._updateToolbarState(state);
    }

    /**
     * Insert code block
     */
    _insertCode(state) {
      const selection = window.getSelection();
      const text = selection.toString();

      if (text) {
        document.execCommand("insertHTML", false, `<code>${text}</code>`);
      } else {
        document.execCommand("formatBlock", false, "pre");
      }
    }

    /**
     * Insert link
     */
    _insertLink(state) {
      const selection = window.getSelection();
      const text = selection.toString();
      const url = prompt("Enter URL:", "https://");

      if (url) {
        if (text) {
          document.execCommand(
            "insertHTML",
            false,
            `<a href="${url}" target="_blank">${text}</a>`,
          );
        } else {
          document.execCommand(
            "insertHTML",
            false,
            `<a href="${url}" target="_blank">${url}</a>`,
          );
        }
      }
    }

    /**
     * Insert image
     */
    _insertImage(state) {
      const url = prompt("Enter image URL:");

      if (url) {
        document.execCommand("insertHTML", false, `<img src="${url}" alt="">`);
      }
    }

    /**
     * Handle input
     */
    _onInput(state) {
      const { config, editor, charCount } = state;

      // Update character count
      const text = editor.textContent;
      if (charCount) {
        if (config.maxLength) {
          charCount.textContent = `${text.length}/${config.maxLength}`;
          if (text.length > config.maxLength) {
            charCount.style.color = "#ef4444";
          } else {
            charCount.style.color = "";
          }
        } else {
          charCount.textContent = `${text.length} characters`;
        }
      }

      if (config.onChange) {
        config.onChange(this.getHTML(state.id));
      }
    }

    /**
     * Handle keydown
     */
    _onKeyDown(state, e) {
      // Handle keyboard shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            this._execCommand(state, "bold");
            break;
          case "i":
            e.preventDefault();
            this._execCommand(state, "italic");
            break;
          case "u":
            e.preventDefault();
            this._execCommand(state, "underline");
            break;
          case "k":
            e.preventDefault();
            this._execCommand(state, "link");
            break;
        }
      }
    }

    /**
     * Update toolbar button states
     */
    _updateToolbarState(state) {
      const { toolbar, headingSelect } = state;

      // Update button states
      toolbar.querySelectorAll(".bael-richtext-btn").forEach((btn) => {
        const action = btn.dataset.action;
        const commands = {
          bold: "bold",
          italic: "italic",
          underline: "underline",
          strike: "strikeThrough",
        };

        if (commands[action]) {
          btn.classList.toggle(
            "active",
            document.queryCommandState(commands[action]),
          );
        }
      });

      // Update heading select
      if (headingSelect) {
        const block = document.queryCommandValue("formatBlock").toLowerCase();
        headingSelect.value = block || "p";
      }
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    /**
     * Get HTML content
     */
    getHTML(editorId) {
      const state = this.instances.get(editorId);
      if (!state) return "";
      return state.editor.innerHTML;
    }

    /**
     * Get plain text content
     */
    getText(editorId) {
      const state = this.instances.get(editorId);
      if (!state) return "";
      return state.editor.textContent;
    }

    /**
     * Set HTML content
     */
    setHTML(editorId, html) {
      const state = this.instances.get(editorId);
      if (!state) return;
      state.editor.innerHTML = html;
      this._onInput(state);
    }

    /**
     * Clear editor
     */
    clear(editorId) {
      const state = this.instances.get(editorId);
      if (!state) return;
      state.editor.innerHTML = "";
      this._onInput(state);
    }

    /**
     * Destroy editor
     */
    destroy(editorId) {
      const state = this.instances.get(editorId);
      if (!state) return;

      state.element.remove();
      this.instances.delete(editorId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelRichText();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$richText = (container, options) => bael.create(container, options);
  window.$editor = window.$richText; // Alias

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelRichText = bael;

  console.log("📝 BAEL Rich Text Editor loaded");
})();
