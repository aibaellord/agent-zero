/**
 * BAEL Mention Component - Lord Of All Mentions
 *
 * @mentions in text inputs:
 * - User mentions (@user)
 * - Channel mentions (#channel)
 * - Custom prefixes
 * - Autocomplete dropdown
 * - Keyboard navigation
 * - Rich mentions display
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // MENTION CLASS
  // ============================================================

  class BaelMention {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-mention-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-mention-styles";
      styles.textContent = `
                .bael-mention-container {
                    position: relative;
                    font-family: system-ui, -apple-system, sans-serif;
                }

                .bael-mention-input {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                    line-height: 1.5;
                    resize: vertical;
                    min-height: 100px;
                    outline: none;
                    transition: border-color 0.15s, box-shadow 0.15s;
                }

                .bael-mention-input:focus {
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                }

                .bael-mention-dropdown {
                    position: absolute;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                    max-height: 200px;
                    overflow-y: auto;
                    z-index: 10000;
                    display: none;
                    min-width: 200px;
                }

                .bael-mention-dropdown.visible {
                    display: block;
                }

                .bael-mention-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 14px;
                    cursor: pointer;
                    transition: background 0.1s;
                }

                .bael-mention-item:hover,
                .bael-mention-item.highlighted {
                    background: #f3f4f6;
                }

                .bael-mention-item.highlighted {
                    background: #eef2ff;
                }

                .bael-mention-avatar {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: #e5e7eb;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 500;
                    color: #6b7280;
                    overflow: hidden;
                }

                .bael-mention-avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .bael-mention-info {
                    flex: 1;
                    min-width: 0;
                }

                .bael-mention-name {
                    font-weight: 500;
                    color: #111827;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .bael-mention-handle {
                    font-size: 12px;
                    color: #6b7280;
                }

                .bael-mention-empty {
                    padding: 16px;
                    text-align: center;
                    color: #9ca3af;
                    font-size: 13px;
                }

                .bael-mention-loading {
                    padding: 16px;
                    text-align: center;
                }

                .bael-mention-loading-spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid #e5e7eb;
                    border-top-color: #4f46e5;
                    border-radius: 50%;
                    animation: bael-mention-spin 0.6s linear infinite;
                    margin: 0 auto;
                }

                @keyframes bael-mention-spin {
                    to { transform: rotate(360deg); }
                }

                /* Highlighted mention in preview */
                .bael-mention-highlight {
                    color: #4f46e5;
                    font-weight: 500;
                    background: #eef2ff;
                    padding: 2px 6px;
                    border-radius: 4px;
                }

                .bael-mention-highlight.user {
                    background: #dbeafe;
                    color: #2563eb;
                }

                .bael-mention-highlight.channel {
                    background: #d1fae5;
                    color: #059669;
                }

                /* Preview container */
                .bael-mention-preview {
                    padding: 12px 16px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    background: #f9fafb;
                    margin-top: 8px;
                    line-height: 1.6;
                    word-wrap: break-word;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE MENTION INPUT
    // ============================================================

    /**
     * Create mention-enabled input
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Mention container not found");
        return null;
      }

      const id = `bael-mention-${++this.idCounter}`;
      const config = {
        triggers: {
          "@": {
            data: [], // Array of {id, name, handle, avatar}
            fetch: null, // Async function to fetch data
            type: "user",
          },
          "#": {
            data: [],
            fetch: null,
            type: "channel",
          },
        },
        placeholder: "Type @ to mention someone...",
        showPreview: false,
        minChars: 0, // Minimum chars before showing suggestions
        maxSuggestions: 10,
        insertTemplate: null, // Custom template function
        onMention: null,
        onChange: null,
        ...options,
      };

      const el = document.createElement("div");
      el.className = "bael-mention-container";
      el.id = id;

      const state = {
        id,
        element: el,
        container,
        config,
        activeTrigger: null,
        searchQuery: "",
        highlightIndex: 0,
        mentions: [],
        caretPosition: 0,
      };

      this._render(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        getValue: () => state.input.value,
        setValue: (value) => {
          state.input.value = value;
        },
        getMentions: () => [...state.mentions],
        getFormattedValue: () => this._getFormattedValue(state),
        focus: () => state.input.focus(),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render mention input
     */
    _render(state) {
      const { element, config } = state;

      element.innerHTML = "";

      // Textarea
      const input = document.createElement("textarea");
      input.className = "bael-mention-input";
      input.placeholder = config.placeholder;
      input.addEventListener("input", () => this._handleInput(state));
      input.addEventListener("keydown", (e) => this._handleKeyDown(state, e));
      input.addEventListener("blur", () => {
        setTimeout(() => this._hideDropdown(state), 150);
      });
      input.addEventListener("click", () => this._checkForTrigger(state));

      state.input = input;
      element.appendChild(input);

      // Dropdown
      const dropdown = document.createElement("div");
      dropdown.className = "bael-mention-dropdown";
      state.dropdown = dropdown;
      element.appendChild(dropdown);

      // Preview
      if (config.showPreview) {
        const preview = document.createElement("div");
        preview.className = "bael-mention-preview";
        preview.innerHTML =
          '<span style="color: #9ca3af;">Preview will appear here...</span>';
        state.preview = preview;
        element.appendChild(preview);
      }
    }

    /**
     * Handle input
     */
    _handleInput(state) {
      this._checkForTrigger(state);

      if (state.config.onChange) {
        state.config.onChange(state.input.value);
      }

      if (state.preview) {
        this._updatePreview(state);
      }
    }

    /**
     * Check for trigger character
     */
    _checkForTrigger(state) {
      const { input, config } = state;
      const text = input.value;
      const cursorPos = input.selectionStart;

      // Find if we're in a trigger context
      let triggerStart = -1;
      let trigger = null;

      for (let i = cursorPos - 1; i >= 0; i--) {
        const char = text[i];

        // Stop at whitespace or newline
        if (/\s/.test(char)) break;

        // Check for trigger
        if (config.triggers[char]) {
          // Make sure it's at start of word
          if (i === 0 || /\s/.test(text[i - 1])) {
            triggerStart = i;
            trigger = char;
            break;
          }
        }
      }

      if (trigger && triggerStart >= 0) {
        const query = text.slice(triggerStart + 1, cursorPos);

        if (query.length >= config.minChars) {
          state.activeTrigger = trigger;
          state.searchQuery = query;
          state.triggerStart = triggerStart;
          this._showSuggestions(state);
          return;
        }
      }

      this._hideDropdown(state);
    }

    /**
     * Show suggestions dropdown
     */
    async _showSuggestions(state) {
      const { dropdown, config, activeTrigger, searchQuery } = state;
      const triggerConfig = config.triggers[activeTrigger];

      if (!triggerConfig) return;

      dropdown.innerHTML = "";
      dropdown.classList.add("visible");

      // Position dropdown
      this._positionDropdown(state);

      // Get data
      let data = [];

      if (triggerConfig.fetch) {
        // Show loading
        dropdown.innerHTML = `
                    <div class="bael-mention-loading">
                        <div class="bael-mention-loading-spinner"></div>
                    </div>
                `;

        try {
          data = await triggerConfig.fetch(searchQuery);
        } catch (error) {
          console.error("Mention fetch error:", error);
          data = [];
        }
      } else {
        // Filter local data
        data = triggerConfig.data.filter((item) => {
          const name = (item.name || "").toLowerCase();
          const handle = (item.handle || "").toLowerCase();
          const query = searchQuery.toLowerCase();
          return name.includes(query) || handle.includes(query);
        });
      }

      // Limit results
      data = data.slice(0, config.maxSuggestions);

      if (!data.length) {
        dropdown.innerHTML =
          '<div class="bael-mention-empty">No matches found</div>';
        return;
      }

      state.highlightIndex = 0;
      state.suggestions = data;

      data.forEach((item, index) => {
        const el = this._createSuggestionItem(state, item, index);
        dropdown.appendChild(el);
      });
    }

    /**
     * Create suggestion item
     */
    _createSuggestionItem(state, item, index) {
      const el = document.createElement("div");
      el.className = `bael-mention-item${index === state.highlightIndex ? " highlighted" : ""}`;

      // Avatar
      const avatar = document.createElement("div");
      avatar.className = "bael-mention-avatar";

      if (item.avatar) {
        const img = document.createElement("img");
        img.src = item.avatar;
        img.alt = item.name;
        avatar.appendChild(img);
      } else {
        avatar.textContent = this._getInitials(item.name);
      }
      el.appendChild(avatar);

      // Info
      const info = document.createElement("div");
      info.className = "bael-mention-info";

      const name = document.createElement("div");
      name.className = "bael-mention-name";
      name.textContent = item.name;
      info.appendChild(name);

      if (item.handle) {
        const handle = document.createElement("div");
        handle.className = "bael-mention-handle";
        handle.textContent = `${state.activeTrigger}${item.handle}`;
        info.appendChild(handle);
      }

      el.appendChild(info);

      // Events
      el.addEventListener("mouseenter", () => {
        state.highlightIndex = index;
        this._updateHighlight(state);
      });

      el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        this._selectSuggestion(state, item);
      });

      return el;
    }

    /**
     * Get initials from name
     */
    _getInitials(name) {
      if (!name) return "?";
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) {
        return parts[0].charAt(0).toUpperCase();
      }
      return (
        parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
      ).toUpperCase();
    }

    /**
     * Position dropdown
     */
    _positionDropdown(state) {
      const { input, dropdown, triggerStart } = state;
      const inputRect = input.getBoundingClientRect();

      // Get approximate position of trigger in input
      // This is simplified - in production would use a hidden span
      const lineHeight = parseInt(getComputedStyle(input).lineHeight) || 20;
      const text = input.value.substring(0, triggerStart);
      const lines = text.split("\n");
      const lineNumber = lines.length - 1;
      const top = lineNumber * lineHeight + lineHeight + 4;

      dropdown.style.top = `${Math.min(top, input.offsetHeight)}px`;
      dropdown.style.left = "0";
    }

    /**
     * Handle keydown
     */
    _handleKeyDown(state, e) {
      if (!state.dropdown.classList.contains("visible")) return;

      const { suggestions, highlightIndex } = state;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          state.highlightIndex = Math.min(
            highlightIndex + 1,
            suggestions.length - 1,
          );
          this._updateHighlight(state);
          break;

        case "ArrowUp":
          e.preventDefault();
          state.highlightIndex = Math.max(highlightIndex - 1, 0);
          this._updateHighlight(state);
          break;

        case "Enter":
        case "Tab":
          if (suggestions && suggestions[highlightIndex]) {
            e.preventDefault();
            this._selectSuggestion(state, suggestions[highlightIndex]);
          }
          break;

        case "Escape":
          this._hideDropdown(state);
          break;
      }
    }

    /**
     * Update highlight
     */
    _updateHighlight(state) {
      const items = state.dropdown.querySelectorAll(".bael-mention-item");
      items.forEach((item, i) => {
        item.classList.toggle("highlighted", i === state.highlightIndex);
      });

      // Scroll into view
      const highlighted = items[state.highlightIndex];
      if (highlighted) {
        highlighted.scrollIntoView({ block: "nearest" });
      }
    }

    /**
     * Select suggestion
     */
    _selectSuggestion(state, item) {
      const { input, activeTrigger, triggerStart, config } = state;
      const cursorPos = input.selectionStart;

      // Get insert text
      let insertText;
      if (config.insertTemplate) {
        insertText = config.insertTemplate(item, activeTrigger);
      } else {
        insertText = `${activeTrigger}${item.handle || item.name} `;
      }

      // Replace trigger + query with mention
      const before = input.value.substring(0, triggerStart);
      const after = input.value.substring(cursorPos);
      input.value = before + insertText + after;

      // Set cursor position
      const newPos = triggerStart + insertText.length;
      input.setSelectionRange(newPos, newPos);
      input.focus();

      // Track mention
      state.mentions.push({
        trigger: activeTrigger,
        item,
        start: triggerStart,
        end: triggerStart + insertText.length,
      });

      // Callback
      if (config.onMention) {
        config.onMention(item, activeTrigger);
      }

      // Update preview
      if (state.preview) {
        this._updatePreview(state);
      }

      this._hideDropdown(state);
    }

    /**
     * Hide dropdown
     */
    _hideDropdown(state) {
      state.dropdown.classList.remove("visible");
      state.activeTrigger = null;
      state.searchQuery = "";
      state.suggestions = [];
    }

    /**
     * Update preview
     */
    _updatePreview(state) {
      const { input, preview, config } = state;
      let text = input.value;

      if (!text) {
        preview.innerHTML =
          '<span style="color: #9ca3af;">Preview will appear here...</span>';
        return;
      }

      // Escape HTML
      text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

      // Highlight mentions
      Object.entries(config.triggers).forEach(([trigger, triggerConfig]) => {
        const regex = new RegExp(`${trigger}(\\w+)`, "g");
        const type = triggerConfig.type || "default";
        text = text.replace(
          regex,
          `<span class="bael-mention-highlight ${type}">${trigger}$1</span>`,
        );
      });

      // Preserve line breaks
      text = text.replace(/\n/g, "<br>");

      preview.innerHTML = text;
    }

    /**
     * Get formatted value with mention data
     */
    _getFormattedValue(state) {
      return {
        text: state.input.value,
        mentions: state.mentions.map((m) => ({
          trigger: m.trigger,
          id: m.item.id,
          name: m.item.name,
          handle: m.item.handle,
        })),
      };
    }

    /**
     * Destroy mention input
     */
    destroy(inputId) {
      const state = this.instances.get(inputId);
      if (!state) return;

      state.element.remove();
      this.instances.delete(inputId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelMention();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$mention = (container, options) => bael.create(container, options);
  window.$mentions = window.$mention;

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelMention = bael;

  console.log("💬 BAEL Mention Component loaded");
})();
