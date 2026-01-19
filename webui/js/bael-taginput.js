/**
 * BAEL Tag Input Component - Lord Of All Tags
 *
 * Multi-tag input field:
 * - Add tags by typing
 * - Remove with backspace or click
 * - Autocomplete suggestions
 * - Validation (duplicates, max tags)
 * - Customizable separators
 * - Drag to reorder
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // TAG INPUT CLASS
  // ============================================================

  class BaelTagInput {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-taginput-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-taginput-styles";
      styles.textContent = `
                .bael-taginput {
                    font-family: system-ui, -apple-system, sans-serif;
                }

                .bael-taginput-wrapper {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    padding: 8px 12px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    background: white;
                    min-height: 42px;
                    cursor: text;
                    transition: border-color 0.15s, box-shadow 0.15s;
                }

                .bael-taginput-wrapper:focus-within {
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                }

                .bael-taginput-wrapper.disabled {
                    background: #f9fafb;
                    cursor: not-allowed;
                }

                .bael-taginput-wrapper.error {
                    border-color: #ef4444;
                }

                .bael-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 4px 8px;
                    background: #eef2ff;
                    border-radius: 4px;
                    font-size: 13px;
                    color: #4f46e5;
                    max-width: 200px;
                    animation: bael-tag-in 0.2s ease-out;
                }

                @keyframes bael-tag-in {
                    from {
                        transform: scale(0.8);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                .bael-tag.dragging {
                    opacity: 0.5;
                }

                .bael-tag-text {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .bael-tag-remove {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 16px;
                    height: 16px;
                    border: none;
                    background: transparent;
                    color: #4f46e5;
                    cursor: pointer;
                    padding: 0;
                    border-radius: 50%;
                    transition: background 0.15s;
                }

                .bael-tag-remove:hover {
                    background: rgba(79, 70, 229, 0.2);
                }

                .bael-tag-remove svg {
                    width: 12px;
                    height: 12px;
                }

                .bael-taginput-input {
                    flex: 1;
                    min-width: 100px;
                    border: none;
                    outline: none;
                    font-size: 14px;
                    padding: 4px 0;
                    background: transparent;
                }

                .bael-taginput-input::placeholder {
                    color: #9ca3af;
                }

                .bael-taginput-input:disabled {
                    cursor: not-allowed;
                }

                .bael-taginput-suggestions {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    margin-top: 4px;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
                    max-height: 200px;
                    overflow-y: auto;
                    z-index: 1000;
                }

                .bael-taginput-suggestion {
                    padding: 10px 14px;
                    cursor: pointer;
                    transition: background 0.1s;
                }

                .bael-taginput-suggestion:hover,
                .bael-taginput-suggestion.highlighted {
                    background: #f3f4f6;
                }

                .bael-taginput-suggestion.highlighted {
                    background: #eef2ff;
                }

                .bael-taginput-count {
                    font-size: 12px;
                    color: #9ca3af;
                    margin-top: 4px;
                }

                .bael-taginput-count.max {
                    color: #ef4444;
                }

                /* Variants */
                .bael-taginput.pills .bael-tag {
                    border-radius: 9999px;
                    padding: 4px 12px;
                }

                .bael-taginput.outline .bael-tag {
                    background: transparent;
                    border: 1px solid #4f46e5;
                }

                .bael-taginput.colorful .bael-tag:nth-child(5n+1) { background: #fee2e2; color: #dc2626; }
                .bael-taginput.colorful .bael-tag:nth-child(5n+2) { background: #fef3c7; color: #d97706; }
                .bael-taginput.colorful .bael-tag:nth-child(5n+3) { background: #d1fae5; color: #059669; }
                .bael-taginput.colorful .bael-tag:nth-child(5n+4) { background: #dbeafe; color: #2563eb; }
                .bael-taginput.colorful .bael-tag:nth-child(5n+5) { background: #ede9fe; color: #7c3aed; }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE TAG INPUT
    // ============================================================

    /**
     * Create tag input
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Tag input container not found");
        return null;
      }

      const id = `bael-taginput-${++this.idCounter}`;
      const config = {
        tags: [],
        placeholder: "Add tags...",
        separators: [",", "Enter", "Tab"],
        maxTags: 0, // 0 = unlimited
        maxLength: 50, // max characters per tag
        allowDuplicates: false,
        caseSensitive: false,
        suggestions: [],
        suggestionsFilter: null, // custom filter function
        minChars: 1, // min chars to show suggestions
        draggable: false,
        disabled: false,
        variant: "default", // default, pills, outline, colorful
        showCount: false,
        validate: null, // custom validation function
        transform: null, // transform input before adding
        onChange: null,
        onAdd: null,
        onRemove: null,
        ...options,
      };

      const el = document.createElement("div");
      el.className = `bael-taginput${config.variant !== "default" ? " " + config.variant : ""}`;
      el.id = id;
      el.style.position = "relative";

      const state = {
        id,
        element: el,
        container,
        config,
        tags: [...config.tags],
        highlightIndex: -1,
        suggestionsVisible: false,
      };

      this._render(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        getTags: () => [...state.tags],
        setTags: (tags) => this.setTags(id, tags),
        addTag: (tag) => this.addTag(id, tag),
        removeTag: (tag) => this.removeTag(id, tag),
        clear: () => this.clear(id),
        focus: () => state.input?.focus(),
        setDisabled: (disabled) => this.setDisabled(id, disabled),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render tag input
     */
    _render(state) {
      const { element, config, tags } = state;

      element.innerHTML = "";

      // Wrapper
      const wrapper = document.createElement("div");
      wrapper.className = "bael-taginput-wrapper";
      if (config.disabled) wrapper.classList.add("disabled");

      // Tags
      tags.forEach((tag, index) => {
        const tagEl = this._createTagElement(state, tag, index);
        wrapper.appendChild(tagEl);
      });

      // Input
      const input = document.createElement("input");
      input.type = "text";
      input.className = "bael-taginput-input";
      input.placeholder = tags.length ? "" : config.placeholder;
      input.disabled = config.disabled;
      input.maxLength = config.maxLength;

      input.addEventListener("keydown", (e) => this._handleKeyDown(state, e));
      input.addEventListener("input", () => this._handleInput(state));
      input.addEventListener("blur", () => {
        // Add tag on blur if there's text
        setTimeout(() => {
          if (input.value.trim()) {
            this.addTag(state.id, input.value);
            input.value = "";
          }
          this._hideSuggestions(state);
        }, 150);
      });

      state.input = input;
      wrapper.appendChild(input);

      // Click wrapper to focus input
      wrapper.addEventListener("click", (e) => {
        if (e.target === wrapper && !config.disabled) {
          input.focus();
        }
      });

      element.appendChild(wrapper);
      state.wrapper = wrapper;

      // Suggestions container
      const suggestions = document.createElement("div");
      suggestions.className = "bael-taginput-suggestions";
      suggestions.style.display = "none";
      element.appendChild(suggestions);
      state.suggestionsEl = suggestions;

      // Count
      if (config.showCount) {
        const count = document.createElement("div");
        count.className = "bael-taginput-count";
        this._updateCount(state, count);
        element.appendChild(count);
        state.countEl = count;
      }
    }

    /**
     * Create tag element
     */
    _createTagElement(state, tag, index) {
      const { config } = state;

      const tagEl = document.createElement("span");
      tagEl.className = "bael-tag";
      tagEl.dataset.index = index;

      if (config.draggable && !config.disabled) {
        tagEl.draggable = true;
        tagEl.addEventListener("dragstart", (e) =>
          this._handleDragStart(state, e, index),
        );
        tagEl.addEventListener("dragover", (e) =>
          this._handleDragOver(state, e),
        );
        tagEl.addEventListener("drop", (e) =>
          this._handleDrop(state, e, index),
        );
        tagEl.addEventListener("dragend", () => this._handleDragEnd(state));
      }

      const text = document.createElement("span");
      text.className = "bael-tag-text";
      text.textContent = tag;
      text.title = tag;
      tagEl.appendChild(text);

      if (!config.disabled) {
        const removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "bael-tag-remove";
        removeBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
        removeBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.removeTag(state.id, tag);
        });
        tagEl.appendChild(removeBtn);
      }

      return tagEl;
    }

    /**
     * Handle key down
     */
    _handleKeyDown(state, e) {
      const { config, input, suggestionsVisible, highlightIndex } = state;

      // Check for separators
      if (config.separators.includes(e.key)) {
        if (input.value.trim()) {
          e.preventDefault();
          const success = this.addTag(state.id, input.value);
          if (success) {
            input.value = "";
            this._hideSuggestions(state);
          }
        }
        return;
      }

      // Comma separator
      if (config.separators.includes(",") && e.key === ",") {
        e.preventDefault();
        if (input.value.trim()) {
          this.addTag(state.id, input.value);
          input.value = "";
          this._hideSuggestions(state);
        }
        return;
      }

      // Backspace to remove last tag
      if (e.key === "Backspace" && !input.value && state.tags.length) {
        this.removeTag(state.id, state.tags[state.tags.length - 1]);
        return;
      }

      // Navigate suggestions
      if (suggestionsVisible) {
        const suggestions = this._getFilteredSuggestions(state, input.value);

        if (e.key === "ArrowDown") {
          e.preventDefault();
          state.highlightIndex = Math.min(
            highlightIndex + 1,
            suggestions.length - 1,
          );
          this._updateSuggestionsHighlight(state);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          state.highlightIndex = Math.max(highlightIndex - 1, 0);
          this._updateSuggestionsHighlight(state);
        } else if (e.key === "Enter" && highlightIndex >= 0) {
          e.preventDefault();
          this.addTag(state.id, suggestions[highlightIndex]);
          input.value = "";
          this._hideSuggestions(state);
        } else if (e.key === "Escape") {
          this._hideSuggestions(state);
        }
      }
    }

    /**
     * Handle input
     */
    _handleInput(state) {
      const { config, input } = state;
      const value = input.value;

      // Check for comma in input
      if (config.separators.includes(",") && value.includes(",")) {
        const parts = value.split(",");
        parts.forEach((part, i) => {
          if (part.trim() && i < parts.length - 1) {
            this.addTag(state.id, part);
          }
        });
        input.value = parts[parts.length - 1];
      }

      // Show suggestions
      if (value.length >= config.minChars && config.suggestions.length) {
        this._showSuggestions(state, value);
      } else {
        this._hideSuggestions(state);
      }
    }

    /**
     * Get filtered suggestions
     */
    _getFilteredSuggestions(state, query) {
      const { config, tags } = state;
      const lowerQuery = query.toLowerCase();

      let suggestions = config.suggestions;

      // Custom filter
      if (config.suggestionsFilter) {
        suggestions = config.suggestionsFilter(query, suggestions);
      } else {
        suggestions = suggestions.filter((s) =>
          s.toLowerCase().includes(lowerQuery),
        );
      }

      // Remove already added tags
      if (!config.allowDuplicates) {
        const tagsLower = tags.map((t) =>
          config.caseSensitive ? t : t.toLowerCase(),
        );
        suggestions = suggestions.filter(
          (s) =>
            !tagsLower.includes(config.caseSensitive ? s : s.toLowerCase()),
        );
      }

      return suggestions.slice(0, 10);
    }

    /**
     * Show suggestions
     */
    _showSuggestions(state, query) {
      const suggestions = this._getFilteredSuggestions(state, query);

      if (!suggestions.length) {
        this._hideSuggestions(state);
        return;
      }

      state.suggestionsEl.innerHTML = "";
      state.highlightIndex = -1;
      state.suggestionsVisible = true;

      suggestions.forEach((suggestion, index) => {
        const item = document.createElement("div");
        item.className = "bael-taginput-suggestion";
        item.textContent = suggestion;
        item.addEventListener("mousedown", (e) => {
          e.preventDefault();
          this.addTag(state.id, suggestion);
          state.input.value = "";
          this._hideSuggestions(state);
        });
        item.addEventListener("mouseenter", () => {
          state.highlightIndex = index;
          this._updateSuggestionsHighlight(state);
        });
        state.suggestionsEl.appendChild(item);
      });

      state.suggestionsEl.style.display = "block";
    }

    /**
     * Hide suggestions
     */
    _hideSuggestions(state) {
      state.suggestionsEl.style.display = "none";
      state.suggestionsVisible = false;
      state.highlightIndex = -1;
    }

    /**
     * Update suggestions highlight
     */
    _updateSuggestionsHighlight(state) {
      const items = state.suggestionsEl.querySelectorAll(
        ".bael-taginput-suggestion",
      );
      items.forEach((item, i) => {
        item.classList.toggle("highlighted", i === state.highlightIndex);
      });
    }

    /**
     * Update count display
     */
    _updateCount(state, countEl) {
      const { config, tags } = state;
      if (!config.showCount) return;

      if (config.maxTags > 0) {
        countEl.textContent = `${tags.length} / ${config.maxTags}`;
        countEl.classList.toggle("max", tags.length >= config.maxTags);
      } else {
        countEl.textContent = `${tags.length} tag${tags.length !== 1 ? "s" : ""}`;
      }
    }

    // ============================================================
    // DRAG & DROP
    // ============================================================

    _handleDragStart(state, e, index) {
      state.dragIndex = index;
      e.target.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
    }

    _handleDragOver(state, e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    }

    _handleDrop(state, e, targetIndex) {
      e.preventDefault();
      const sourceIndex = state.dragIndex;

      if (sourceIndex !== targetIndex) {
        const [removed] = state.tags.splice(sourceIndex, 1);
        state.tags.splice(targetIndex, 0, removed);
        this._render(state);
        this._triggerChange(state);
      }
    }

    _handleDragEnd(state) {
      delete state.dragIndex;
      state.wrapper.querySelectorAll(".bael-tag").forEach((el) => {
        el.classList.remove("dragging");
      });
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    /**
     * Add tag
     */
    addTag(inputId, tag) {
      const state = this.instances.get(inputId);
      if (!state) return false;

      const { config, tags } = state;

      // Transform
      if (config.transform) {
        tag = config.transform(tag);
      }

      tag = tag.trim();
      if (!tag) return false;

      // Validate max tags
      if (config.maxTags > 0 && tags.length >= config.maxTags) {
        state.wrapper.classList.add("error");
        setTimeout(() => state.wrapper.classList.remove("error"), 500);
        return false;
      }

      // Validate duplicates
      if (!config.allowDuplicates) {
        const exists = tags.some((t) =>
          config.caseSensitive
            ? t === tag
            : t.toLowerCase() === tag.toLowerCase(),
        );
        if (exists) {
          state.wrapper.classList.add("error");
          setTimeout(() => state.wrapper.classList.remove("error"), 500);
          return false;
        }
      }

      // Custom validation
      if (config.validate && !config.validate(tag)) {
        state.wrapper.classList.add("error");
        setTimeout(() => state.wrapper.classList.remove("error"), 500);
        return false;
      }

      state.tags.push(tag);
      this._render(state);
      this._triggerChange(state);

      if (config.onAdd) {
        config.onAdd(tag, state.tags);
      }

      return true;
    }

    /**
     * Remove tag
     */
    removeTag(inputId, tag) {
      const state = this.instances.get(inputId);
      if (!state) return;

      const { config } = state;
      const index = state.tags.findIndex((t) =>
        config.caseSensitive
          ? t === tag
          : t.toLowerCase() === tag.toLowerCase(),
      );

      if (index !== -1) {
        const removed = state.tags.splice(index, 1)[0];
        this._render(state);
        this._triggerChange(state);

        if (config.onRemove) {
          config.onRemove(removed, state.tags);
        }
      }
    }

    /**
     * Set tags
     */
    setTags(inputId, tags) {
      const state = this.instances.get(inputId);
      if (!state) return;

      state.tags = [...tags];
      this._render(state);
      this._triggerChange(state);
    }

    /**
     * Clear all tags
     */
    clear(inputId) {
      this.setTags(inputId, []);
    }

    /**
     * Set disabled state
     */
    setDisabled(inputId, disabled) {
      const state = this.instances.get(inputId);
      if (!state) return;

      state.config.disabled = disabled;
      this._render(state);
    }

    /**
     * Trigger change callback
     */
    _triggerChange(state) {
      if (state.config.onChange) {
        state.config.onChange(state.tags);
      }
      if (state.countEl) {
        this._updateCount(state, state.countEl);
      }
    }

    /**
     * Destroy tag input
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

  const bael = new BaelTagInput();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$tagInput = (container, options) => bael.create(container, options);
  window.$tags = window.$tagInput;

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelTagInput = bael;

  console.log("🏷️ BAEL Tag Input Component loaded");
})();
