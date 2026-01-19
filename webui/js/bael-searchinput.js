/**
 * BAEL Search Input Component - Lord Of All Queries
 *
 * Search input with suggestions:
 * - Auto-suggestions dropdown
 * - Recent searches
 * - Keyboard navigation
 * - Loading state
 * - Clear button
 * - Voice input support
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // SEARCH INPUT CLASS
  // ============================================================

  class BaelSearchInput {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-searchinput-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-searchinput-styles";
      styles.textContent = `
                .bael-searchinput {
                    position: relative;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                /* Input wrapper */
                .bael-searchinput-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 0 14px;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 10px;
                    transition: all 0.15s;
                }

                .bael-searchinput-wrapper:focus-within {
                    border-color: rgba(59, 130, 246, 0.5);
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                /* Search icon */
                .bael-searchinput-icon {
                    display: flex;
                    align-items: center;
                    color: #666;
                    flex-shrink: 0;
                }

                .bael-searchinput-icon svg {
                    width: 18px;
                    height: 18px;
                }

                .bael-searchinput-wrapper:focus-within .bael-searchinput-icon {
                    color: #888;
                }

                /* Input */
                .bael-searchinput-input {
                    flex: 1;
                    min-width: 0;
                    padding: 12px 0;
                    background: none;
                    border: none;
                    outline: none;
                    font-size: 14px;
                    font-family: inherit;
                    color: #fff;
                }

                .bael-searchinput-input::placeholder {
                    color: #555;
                }

                /* Action buttons */
                .bael-searchinput-actions {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .bael-searchinput-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    background: none;
                    border: none;
                    border-radius: 6px;
                    color: #666;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .bael-searchinput-btn:hover {
                    color: #aaa;
                    background: rgba(255,255,255,0.05);
                }

                .bael-searchinput-btn svg {
                    width: 16px;
                    height: 16px;
                }

                .bael-searchinput-btn.hidden {
                    display: none;
                }

                /* Loading spinner */
                .bael-searchinput-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255,255,255,0.1);
                    border-top-color: #3b82f6;
                    border-radius: 50%;
                    animation: bael-search-spin 0.8s linear infinite;
                }

                @keyframes bael-search-spin {
                    to { transform: rotate(360deg); }
                }

                /* Dropdown */
                .bael-searchinput-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    right: 0;
                    margin-top: 6px;
                    background: #1a1a1a;
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 10px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                    z-index: 1000;
                    overflow: hidden;
                    display: none;
                }

                .bael-searchinput-dropdown.open {
                    display: block;
                    animation: bael-search-fade 0.15s ease;
                }

                @keyframes bael-search-fade {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Section header */
                .bael-searchinput-section {
                    padding: 10px 14px 6px;
                    font-size: 11px;
                    font-weight: 600;
                    color: #666;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                /* Items */
                .bael-searchinput-items {
                    max-height: 300px;
                    overflow-y: auto;
                }

                .bael-searchinput-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 14px;
                    cursor: pointer;
                    transition: background 0.1s;
                }

                .bael-searchinput-item:hover,
                .bael-searchinput-item.highlighted {
                    background: rgba(255,255,255,0.05);
                }

                .bael-searchinput-item-icon {
                    display: flex;
                    align-items: center;
                    color: #666;
                }

                .bael-searchinput-item-icon svg {
                    width: 16px;
                    height: 16px;
                }

                .bael-searchinput-item-content {
                    flex: 1;
                    min-width: 0;
                }

                .bael-searchinput-item-title {
                    font-size: 13px;
                    color: #ddd;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .bael-searchinput-item-title mark {
                    background: rgba(59, 130, 246, 0.3);
                    color: inherit;
                    border-radius: 2px;
                    padding: 0 2px;
                }

                .bael-searchinput-item-subtitle {
                    font-size: 11px;
                    color: #666;
                    margin-top: 2px;
                }

                .bael-searchinput-item-action {
                    display: flex;
                    color: #555;
                    opacity: 0;
                    transition: opacity 0.1s;
                }

                .bael-searchinput-item:hover .bael-searchinput-item-action {
                    opacity: 1;
                }

                .bael-searchinput-item-action svg {
                    width: 14px;
                    height: 14px;
                }

                /* Empty state */
                .bael-searchinput-empty {
                    padding: 24px;
                    text-align: center;
                    color: #666;
                    font-size: 13px;
                }

                /* Size: Small */
                .bael-searchinput.small .bael-searchinput-wrapper {
                    padding: 0 10px;
                    border-radius: 8px;
                }

                .bael-searchinput.small .bael-searchinput-input {
                    padding: 8px 0;
                    font-size: 12px;
                }

                .bael-searchinput.small .bael-searchinput-icon svg {
                    width: 14px;
                    height: 14px;
                }

                .bael-searchinput.small .bael-searchinput-btn {
                    width: 22px;
                    height: 22px;
                }

                .bael-searchinput.small .bael-searchinput-btn svg {
                    width: 12px;
                    height: 12px;
                }

                /* Size: Large */
                .bael-searchinput.large .bael-searchinput-wrapper {
                    padding: 0 18px;
                    border-radius: 12px;
                }

                .bael-searchinput.large .bael-searchinput-input {
                    padding: 16px 0;
                    font-size: 16px;
                }

                .bael-searchinput.large .bael-searchinput-icon svg {
                    width: 22px;
                    height: 22px;
                }

                /* Pill variant */
                .bael-searchinput.pill .bael-searchinput-wrapper {
                    border-radius: 999px;
                }

                .bael-searchinput.pill .bael-searchinput-dropdown {
                    border-radius: 16px;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // ICONS
    // ============================================================

    _icons = {
      search:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
      clear:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
      clock:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
      arrow:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    };

    // ============================================================
    // CREATE SEARCH INPUT
    // ============================================================

    /**
     * Create search input
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Search input container not found");
        return null;
      }

      const id = `bael-searchinput-${++this.idCounter}`;
      const config = {
        placeholder: "Search...",
        value: "",
        suggestions: [], // [{ title, subtitle?, icon?, data? }]
        recentSearches: [], // Array of recent search strings
        showRecent: true,
        maxRecent: 5,
        minChars: 1, // Min chars before showing suggestions
        debounce: 200, // Debounce delay for onSearch
        loading: false,
        size: "default", // small, default, large
        variant: "default", // default, pill
        emptyText: "No results found",
        onSearch: null, // Called when input changes (debounced)
        onSelect: null, // Called when suggestion selected
        onSubmit: null, // Called when Enter pressed
        onClear: null,
        ...options,
      };

      const el = document.createElement("div");
      el.className = "bael-searchinput";
      if (config.size !== "default") el.classList.add(config.size);
      if (config.variant !== "default") el.classList.add(config.variant);
      el.id = id;

      const state = {
        id,
        element: el,
        container,
        config,
        value: config.value,
        isOpen: false,
        loading: config.loading,
        suggestions: config.suggestions,
        highlightIndex: -1,
        debounceTimer: null,
        input: null,
        dropdown: null,
        clearBtn: null,
      };

      this._render(state);
      this._bindEvents(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        getValue: () => state.value,
        setValue: (v) => this._setValue(state, v),
        setSuggestions: (s) => this._setSuggestions(state, s),
        setLoading: (l) => this._setLoading(state, l),
        open: () => this._open(state),
        close: () => this._close(state),
        focus: () => state.input.focus(),
        clear: () => this._clear(state),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render search input
     */
    _render(state) {
      const { element, config } = state;

      // Wrapper
      const wrapper = document.createElement("div");
      wrapper.className = "bael-searchinput-wrapper";

      // Search icon
      const icon = document.createElement("div");
      icon.className = "bael-searchinput-icon";
      icon.innerHTML = this._icons.search;
      wrapper.appendChild(icon);

      // Input
      const input = document.createElement("input");
      input.type = "text";
      input.className = "bael-searchinput-input";
      input.placeholder = config.placeholder;
      input.value = config.value;
      input.autocomplete = "off";
      state.input = input;
      wrapper.appendChild(input);

      // Actions
      const actions = document.createElement("div");
      actions.className = "bael-searchinput-actions";

      // Loading spinner
      const spinner = document.createElement("div");
      spinner.className = `bael-searchinput-spinner${state.loading ? "" : " hidden"}`;
      state.spinner = spinner;
      actions.appendChild(spinner);

      // Clear button
      const clearBtn = document.createElement("button");
      clearBtn.type = "button";
      clearBtn.className = `bael-searchinput-btn${config.value ? "" : " hidden"}`;
      clearBtn.innerHTML = this._icons.clear;
      state.clearBtn = clearBtn;
      actions.appendChild(clearBtn);

      wrapper.appendChild(actions);
      element.appendChild(wrapper);

      // Dropdown
      const dropdown = document.createElement("div");
      dropdown.className = "bael-searchinput-dropdown";
      state.dropdown = dropdown;
      element.appendChild(dropdown);
    }

    /**
     * Render dropdown content
     */
    _renderDropdown(state) {
      const { dropdown, config, value, suggestions } = state;
      dropdown.innerHTML = "";

      const items = [];

      // Show recent searches if no query
      if (!value && config.showRecent && config.recentSearches.length > 0) {
        const section = document.createElement("div");
        section.className = "bael-searchinput-section";
        section.textContent = "Recent";
        dropdown.appendChild(section);

        const recentItems = document.createElement("div");
        recentItems.className = "bael-searchinput-items";

        config.recentSearches.slice(0, config.maxRecent).forEach((text, i) => {
          const item = this._createItem(
            state,
            {
              title: text,
              icon: this._icons.clock,
              isRecent: true,
            },
            items.length,
          );
          items.push({ element: item, data: { title: text } });
          recentItems.appendChild(item);
        });

        dropdown.appendChild(recentItems);
      }
      // Show suggestions
      else if (suggestions.length > 0) {
        const suggestItems = document.createElement("div");
        suggestItems.className = "bael-searchinput-items";

        suggestions.forEach((sug, i) => {
          const item = this._createItem(state, sug, items.length);
          items.push({ element: item, data: sug });
          suggestItems.appendChild(item);
        });

        dropdown.appendChild(suggestItems);
      }
      // Empty state
      else if (value && value.length >= config.minChars) {
        const empty = document.createElement("div");
        empty.className = "bael-searchinput-empty";
        empty.textContent = config.emptyText;
        dropdown.appendChild(empty);
      }

      state.items = items;
      state.highlightIndex = -1;
    }

    /**
     * Create dropdown item
     */
    _createItem(state, data, index) {
      const item = document.createElement("div");
      item.className = "bael-searchinput-item";
      item.dataset.index = index;

      // Icon
      if (data.icon) {
        const icon = document.createElement("div");
        icon.className = "bael-searchinput-item-icon";
        icon.innerHTML = data.icon;
        item.appendChild(icon);
      }

      // Content
      const content = document.createElement("div");
      content.className = "bael-searchinput-item-content";

      const title = document.createElement("div");
      title.className = "bael-searchinput-item-title";
      // Highlight matching text
      if (state.value && data.title) {
        const regex = new RegExp(`(${this._escapeRegex(state.value)})`, "gi");
        title.innerHTML = data.title.replace(regex, "<mark>$1</mark>");
      } else {
        title.textContent = data.title;
      }
      content.appendChild(title);

      if (data.subtitle) {
        const subtitle = document.createElement("div");
        subtitle.className = "bael-searchinput-item-subtitle";
        subtitle.textContent = data.subtitle;
        content.appendChild(subtitle);
      }

      item.appendChild(content);

      // Action arrow
      const action = document.createElement("div");
      action.className = "bael-searchinput-item-action";
      action.innerHTML = this._icons.arrow;
      item.appendChild(action);

      return item;
    }

    /**
     * Escape regex special characters
     */
    _escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    /**
     * Set value
     */
    _setValue(state, value) {
      state.value = value;
      state.input.value = value;
      state.clearBtn.classList.toggle("hidden", !value);
    }

    /**
     * Set suggestions
     */
    _setSuggestions(state, suggestions) {
      state.suggestions = suggestions;
      this._renderDropdown(state);
    }

    /**
     * Set loading state
     */
    _setLoading(state, loading) {
      state.loading = loading;
      state.spinner.classList.toggle("hidden", !loading);
    }

    /**
     * Open dropdown
     */
    _open(state) {
      this._renderDropdown(state);
      state.dropdown.classList.add("open");
      state.isOpen = true;
    }

    /**
     * Close dropdown
     */
    _close(state) {
      state.dropdown.classList.remove("open");
      state.isOpen = false;
      state.highlightIndex = -1;
    }

    /**
     * Clear input
     */
    _clear(state) {
      this._setValue(state, "");
      state.input.focus();
      this._close(state);
      if (state.config.onClear) state.config.onClear();
    }

    /**
     * Select item
     */
    _selectItem(state, index) {
      const item = state.items[index];
      if (!item) return;

      const { config } = state;
      const title = item.data.title;

      // Add to recent searches
      if (config.showRecent && !item.data.isRecent) {
        const recent = config.recentSearches.filter((r) => r !== title);
        recent.unshift(title);
        config.recentSearches = recent.slice(0, config.maxRecent);
      }

      this._setValue(state, title);
      this._close(state);

      if (config.onSelect) {
        config.onSelect(item.data);
      }
    }

    /**
     * Highlight item
     */
    _highlight(state, index) {
      if (!state.items || state.items.length === 0) return;

      // Wrap around
      if (index < 0) index = state.items.length - 1;
      if (index >= state.items.length) index = 0;

      // Remove old highlight
      state.items.forEach(({ element }) => {
        element.classList.remove("highlighted");
      });

      // Add new highlight
      state.items[index].element.classList.add("highlighted");
      state.highlightIndex = index;

      // Scroll into view
      state.items[index].element.scrollIntoView({ block: "nearest" });
    }

    /**
     * Bind events
     */
    _bindEvents(state) {
      const { input, clearBtn, dropdown, config } = state;

      // Input events
      input.addEventListener("input", () => {
        const value = input.value;
        state.value = value;
        state.clearBtn.classList.toggle("hidden", !value);

        // Debounced search callback
        if (state.debounceTimer) {
          clearTimeout(state.debounceTimer);
        }

        state.debounceTimer = setTimeout(() => {
          if (config.onSearch && value.length >= config.minChars) {
            config.onSearch(value);
          }
        }, config.debounce);

        // Open dropdown
        if (value.length >= config.minChars || (!value && config.showRecent)) {
          this._open(state);
        } else {
          this._close(state);
        }
      });

      input.addEventListener("focus", () => {
        if (
          state.value.length >= config.minChars ||
          (!state.value &&
            config.showRecent &&
            config.recentSearches.length > 0)
        ) {
          this._open(state);
        }
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          if (!state.isOpen) {
            this._open(state);
          } else {
            this._highlight(state, state.highlightIndex + 1);
          }
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          this._highlight(state, state.highlightIndex - 1);
        } else if (e.key === "Enter") {
          if (state.highlightIndex >= 0) {
            e.preventDefault();
            this._selectItem(state, state.highlightIndex);
          } else if (config.onSubmit) {
            e.preventDefault();
            config.onSubmit(state.value);
            this._close(state);
          }
        } else if (e.key === "Escape") {
          this._close(state);
        }
      });

      // Clear button
      clearBtn.addEventListener("click", () => {
        this._clear(state);
      });

      // Dropdown item clicks
      dropdown.addEventListener("click", (e) => {
        const item = e.target.closest(".bael-searchinput-item");
        if (item) {
          this._selectItem(state, parseInt(item.dataset.index));
        }
      });

      // Close on outside click
      document.addEventListener("click", (e) => {
        if (!state.element.contains(e.target)) {
          this._close(state);
        }
      });
    }

    /**
     * Destroy instance
     */
    destroy(id) {
      const state = this.instances.get(id);
      if (!state) return;

      if (state.debounceTimer) {
        clearTimeout(state.debounceTimer);
      }

      state.element.remove();
      this.instances.delete(id);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelSearchInput();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$searchInput = (container, options) => bael.create(container, options);
  window.$autocomplete = (container, options) =>
    bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelSearchInput = bael;

  console.log("🔍 BAEL Search Input loaded");
})();
