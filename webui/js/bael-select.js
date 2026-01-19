/**
 * BAEL Select Component - Lord Of All Choices
 *
 * Advanced select/combobox with:
 * - Single and multi-select
 * - Search/filter
 * - Option groups
 * - Custom rendering
 * - Tags display
 * - Async loading
 * - Keyboard navigation
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // SELECT CLASS
  // ============================================================

  class BaelSelect {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-select-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-select-styles";
      styles.textContent = `
                .bael-select {
                    --select-primary: #4f46e5;
                    --select-bg: #ffffff;
                    --select-border: #d1d5db;
                    --select-text: #111827;
                    --select-placeholder: #9ca3af;
                    --select-hover: #f3f4f6;
                    --select-selected: #eef2ff;

                    position: relative;
                    width: 100%;
                    font-size: 0.875rem;
                }

                /* Trigger */
                .bael-select-trigger {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 12px;
                    background: var(--select-bg);
                    border: 1px solid var(--select-border);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.15s;
                    min-height: 42px;
                }

                .bael-select-trigger:hover {
                    border-color: #9ca3af;
                }

                .bael-select.open .bael-select-trigger {
                    border-color: var(--select-primary);
                    box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
                }

                .bael-select-trigger.disabled {
                    background: #f9fafb;
                    cursor: not-allowed;
                    opacity: 0.7;
                }

                .bael-select-value {
                    flex: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    color: var(--select-text);
                }

                .bael-select-value.placeholder {
                    color: var(--select-placeholder);
                }

                .bael-select-arrow {
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #9ca3af;
                    transition: transform 0.2s;
                    flex-shrink: 0;
                }

                .bael-select.open .bael-select-arrow {
                    transform: rotate(180deg);
                }

                .bael-select-clear {
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #9ca3af;
                    border-radius: 50%;
                    transition: all 0.15s;
                }

                .bael-select-clear:hover {
                    background: #e5e7eb;
                    color: #374151;
                }

                /* Tags (multi-select) */
                .bael-select-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                    flex: 1;
                    min-width: 0;
                }

                .bael-select-tag {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 2px 8px;
                    background: #eef2ff;
                    color: #4f46e5;
                    border-radius: 4px;
                    font-size: 0.8rem;
                    max-width: 150px;
                }

                .bael-select-tag-text {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .bael-select-tag-remove {
                    cursor: pointer;
                    opacity: 0.7;
                    transition: opacity 0.15s;
                }

                .bael-select-tag-remove:hover {
                    opacity: 1;
                }

                .bael-select-tag-more {
                    background: #e5e7eb;
                    color: #374151;
                }

                /* Dropdown */
                .bael-select-dropdown {
                    position: absolute;
                    top: calc(100% + 4px);
                    left: 0;
                    right: 0;
                    background: var(--select-bg);
                    border: 1px solid var(--select-border);
                    border-radius: 8px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    z-index: 1000;
                    display: none;
                    max-height: 300px;
                    overflow: hidden;
                }

                .bael-select.open .bael-select-dropdown {
                    display: block;
                    animation: bael-select-fade 0.15s ease-out;
                }

                @keyframes bael-select-fade {
                    from {
                        opacity: 0;
                        transform: translateY(-8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Search */
                .bael-select-search {
                    padding: 8px;
                    border-bottom: 1px solid var(--select-border);
                }

                .bael-select-search input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid var(--select-border);
                    border-radius: 6px;
                    font-size: 0.875rem;
                }

                .bael-select-search input:focus {
                    outline: none;
                    border-color: var(--select-primary);
                }

                /* Options */
                .bael-select-options {
                    max-height: 250px;
                    overflow-y: auto;
                    padding: 4px;
                }

                .bael-select-option {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background 0.15s;
                }

                .bael-select-option:hover {
                    background: var(--select-hover);
                }

                .bael-select-option.highlighted {
                    background: var(--select-hover);
                }

                .bael-select-option.selected {
                    background: var(--select-selected);
                    color: var(--select-primary);
                }

                .bael-select-option.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .bael-select-option-check {
                    width: 18px;
                    height: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .bael-select-option-content {
                    flex: 1;
                    min-width: 0;
                }

                .bael-select-option-label {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .bael-select-option-description {
                    font-size: 0.75rem;
                    color: #6b7280;
                    margin-top: 2px;
                }

                .bael-select-option-icon {
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                /* Group */
                .bael-select-group-label {
                    padding: 8px 12px 4px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: #6b7280;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                /* Empty */
                .bael-select-empty {
                    padding: 24px;
                    text-align: center;
                    color: #6b7280;
                }

                /* Loading */
                .bael-select-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 24px;
                    color: #6b7280;
                }

                .bael-select-loading-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid #e5e7eb;
                    border-top-color: var(--select-primary);
                    border-radius: 50%;
                    animation: bael-select-spin 0.8s linear infinite;
                }

                @keyframes bael-select-spin {
                    to { transform: rotate(360deg); }
                }

                /* Create option */
                .bael-select-create {
                    padding: 10px 12px;
                    border-top: 1px solid var(--select-border);
                    color: var(--select-primary);
                    cursor: pointer;
                    transition: background 0.15s;
                }

                .bael-select-create:hover {
                    background: var(--select-selected);
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE SELECT
    // ============================================================

    /**
     * Create a select
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Select container not found");
        return null;
      }

      const id = `bael-select-${++this.idCounter}`;
      const config = {
        options: [],
        value: null,
        multiple: false,
        searchable: false,
        clearable: false,
        disabled: false,
        placeholder: "Select...",
        searchPlaceholder: "Search...",
        emptyText: "No options",
        maxTagsVisible: 3,
        closeOnSelect: true,
        creatable: false,
        createPrefix: "Create: ",
        loadOptions: null,
        filterOption: null,
        renderOption: null,
        renderValue: null,
        onChange: null,
        onSearch: null,
        onCreate: null,
        ...options,
      };

      const state = {
        id,
        container,
        config,
        isOpen: false,
        search: "",
        highlightedIndex: -1,
        selected: this._initSelected(config),
        loading: false,
        filteredOptions: [...config.options],
      };

      // Create structure
      this._createStructure(state);
      this._setupEvents(state);
      this._render(state);

      this.instances.set(id, state);

      return {
        id,
        getValue: () => this.getValue(id),
        setValue: (value) => this.setValue(id, value),
        getOptions: () => state.config.options,
        setOptions: (options) => this.setOptions(id, options),
        addOption: (option) => this.addOption(id, option),
        removeOption: (value) => this.removeOption(id, value),
        open: () => this.open(id),
        close: () => this.close(id),
        toggle: () => this.toggle(id),
        focus: () => this.focus(id),
        clear: () => this.clear(id),
        enable: () => this.setDisabled(id, false),
        disable: () => this.setDisabled(id, true),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Initialize selected value(s)
     */
    _initSelected(config) {
      if (config.multiple) {
        if (Array.isArray(config.value)) {
          return new Set(config.value);
        }
        return new Set();
      }
      return config.value;
    }

    /**
     * Create select structure
     */
    _createStructure(state) {
      const { config, id } = state;

      const wrapper = document.createElement("div");
      wrapper.className = "bael-select";
      wrapper.id = id;

      // Trigger
      const trigger = document.createElement("div");
      trigger.className = "bael-select-trigger";
      if (config.disabled) trigger.classList.add("disabled");
      trigger.tabIndex = config.disabled ? -1 : 0;

      trigger.innerHTML = `
                <div class="bael-select-value placeholder">${config.placeholder}</div>
                ${config.clearable ? '<div class="bael-select-clear" style="display: none;">✕</div>' : ""}
                <div class="bael-select-arrow">▼</div>
            `;

      wrapper.appendChild(trigger);

      // Dropdown
      const dropdown = document.createElement("div");
      dropdown.className = "bael-select-dropdown";

      // Search
      if (config.searchable) {
        const search = document.createElement("div");
        search.className = "bael-select-search";
        search.innerHTML = `<input type="text" placeholder="${config.searchPlaceholder}">`;
        dropdown.appendChild(search);
      }

      // Options container
      const optionsContainer = document.createElement("div");
      optionsContainer.className = "bael-select-options";
      dropdown.appendChild(optionsContainer);

      wrapper.appendChild(dropdown);
      state.container.appendChild(wrapper);

      state.wrapper = wrapper;
      state.trigger = trigger;
      state.dropdown = dropdown;
      state.valueEl = trigger.querySelector(".bael-select-value");
      state.clearEl = trigger.querySelector(".bael-select-clear");
      state.optionsContainer = optionsContainer;
      state.searchInput = dropdown.querySelector("input");
    }

    /**
     * Setup event listeners
     */
    _setupEvents(state) {
      const { trigger, dropdown, searchInput, clearEl, wrapper } = state;

      // Toggle dropdown
      trigger.addEventListener("click", (e) => {
        if (state.config.disabled) return;
        if (clearEl && clearEl.contains(e.target)) return;
        this.toggle(state.id);
      });

      // Keyboard navigation
      trigger.addEventListener("keydown", (e) => {
        if (state.config.disabled) return;
        this._handleKeydown(state, e);
      });

      // Clear
      if (clearEl) {
        clearEl.addEventListener("click", (e) => {
          e.stopPropagation();
          this.clear(state.id);
        });
      }

      // Search
      if (searchInput) {
        searchInput.addEventListener("input", (e) => {
          state.search = e.target.value;
          this._filterOptions(state);
          this._renderOptions(state);

          if (state.config.onSearch) {
            state.config.onSearch(state.search);
          }
        });

        searchInput.addEventListener("keydown", (e) => {
          this._handleKeydown(state, e);
        });
      }

      // Click outside
      document.addEventListener("click", (e) => {
        if (!wrapper.contains(e.target) && state.isOpen) {
          this.close(state.id);
        }
      });
    }

    /**
     * Handle keyboard navigation
     */
    _handleKeydown(state, e) {
      const { filteredOptions, highlightedIndex } = state;

      switch (e.key) {
        case "Enter":
          e.preventDefault();
          if (!state.isOpen) {
            this.open(state.id);
          } else if (
            highlightedIndex >= 0 &&
            filteredOptions[highlightedIndex]
          ) {
            this._selectOption(state, filteredOptions[highlightedIndex]);
          }
          break;

        case "Escape":
          e.preventDefault();
          this.close(state.id);
          break;

        case "ArrowDown":
          e.preventDefault();
          if (!state.isOpen) {
            this.open(state.id);
          } else {
            state.highlightedIndex = Math.min(
              highlightedIndex + 1,
              filteredOptions.length - 1,
            );
            this._renderOptions(state);
            this._scrollToHighlighted(state);
          }
          break;

        case "ArrowUp":
          e.preventDefault();
          if (state.isOpen) {
            state.highlightedIndex = Math.max(highlightedIndex - 1, 0);
            this._renderOptions(state);
            this._scrollToHighlighted(state);
          }
          break;

        case "Tab":
          this.close(state.id);
          break;
      }
    }

    /**
     * Scroll to highlighted option
     */
    _scrollToHighlighted(state) {
      const highlighted = state.optionsContainer.querySelector(".highlighted");
      if (highlighted) {
        highlighted.scrollIntoView({ block: "nearest" });
      }
    }

    // ============================================================
    // RENDER
    // ============================================================

    /**
     * Main render
     */
    _render(state) {
      this._renderValue(state);
      this._renderOptions(state);
    }

    /**
     * Render selected value
     */
    _renderValue(state) {
      const { config, selected, valueEl, clearEl } = state;

      if (config.multiple) {
        const selectedArray = Array.from(selected);

        if (selectedArray.length === 0) {
          valueEl.className = "bael-select-value placeholder";
          valueEl.textContent = config.placeholder;
        } else {
          valueEl.className = "bael-select-tags";

          const visibleTags = selectedArray.slice(0, config.maxTagsVisible);
          const hiddenCount = selectedArray.length - visibleTags.length;

          valueEl.innerHTML = visibleTags
            .map((value) => {
              const option = this._findOption(state, value);
              const label = option ? option.label || option.value : value;

              return `
                            <span class="bael-select-tag">
                                <span class="bael-select-tag-text">${label}</span>
                                <span class="bael-select-tag-remove" data-value="${value}">✕</span>
                            </span>
                        `;
            })
            .join("");

          if (hiddenCount > 0) {
            valueEl.innerHTML += `
                            <span class="bael-select-tag bael-select-tag-more">
                                +${hiddenCount} more
                            </span>
                        `;
          }

          // Tag remove listeners
          valueEl.querySelectorAll(".bael-select-tag-remove").forEach((btn) => {
            btn.addEventListener("click", (e) => {
              e.stopPropagation();
              const value = btn.dataset.value;
              selected.delete(value);
              this._render(state);
              this._emitChange(state);
            });
          });
        }
      } else {
        if (selected === null || selected === undefined) {
          valueEl.className = "bael-select-value placeholder";
          valueEl.textContent = config.placeholder;
        } else {
          valueEl.className = "bael-select-value";

          if (config.renderValue) {
            const option = this._findOption(state, selected);
            valueEl.innerHTML = config.renderValue(option);
          } else {
            const option = this._findOption(state, selected);
            valueEl.textContent = option
              ? option.label || option.value
              : selected;
          }
        }
      }

      // Clear button visibility
      if (clearEl) {
        const hasValue = config.multiple
          ? selected.size > 0
          : selected !== null;
        clearEl.style.display = hasValue ? "flex" : "none";
      }
    }

    /**
     * Render options list
     */
    _renderOptions(state) {
      const {
        config,
        optionsContainer,
        filteredOptions,
        highlightedIndex,
        loading,
      } = state;

      if (loading) {
        optionsContainer.innerHTML = `
                    <div class="bael-select-loading">
                        <div class="bael-select-loading-spinner"></div>
                        Loading...
                    </div>
                `;
        return;
      }

      if (filteredOptions.length === 0) {
        let html = `<div class="bael-select-empty">${config.emptyText}</div>`;

        // Creatable
        if (config.creatable && state.search) {
          html += `
                        <div class="bael-select-create">
                            ${config.createPrefix}"${state.search}"
                        </div>
                    `;
        }

        optionsContainer.innerHTML = html;

        // Create listener
        const createEl = optionsContainer.querySelector(".bael-select-create");
        if (createEl) {
          createEl.addEventListener("click", () => {
            this._createOption(state, state.search);
          });
        }

        return;
      }

      // Group options
      const groups = this._groupOptions(filteredOptions);
      let html = "";
      let index = 0;

      groups.forEach((options, groupLabel) => {
        if (groupLabel) {
          html += `<div class="bael-select-group-label">${groupLabel}</div>`;
        }

        options.forEach((option) => {
          const isSelected = this._isSelected(state, option.value);
          const isHighlighted = index === highlightedIndex;
          const isDisabled = option.disabled;

          const classes = ["bael-select-option"];
          if (isSelected) classes.push("selected");
          if (isHighlighted) classes.push("highlighted");
          if (isDisabled) classes.push("disabled");

          let content = "";
          if (config.renderOption) {
            content = config.renderOption(option);
          } else {
            content = `
                            ${option.icon ? `<span class="bael-select-option-icon">${option.icon}</span>` : ""}
                            <span class="bael-select-option-content">
                                <span class="bael-select-option-label">${option.label || option.value}</span>
                                ${option.description ? `<span class="bael-select-option-description">${option.description}</span>` : ""}
                            </span>
                        `;
          }

          html += `
                        <div class="${classes.join(" ")}" data-value="${option.value}" data-index="${index}">
                            ${
                              config.multiple
                                ? `
                                <span class="bael-select-option-check">
                                    ${isSelected ? "✓" : ""}
                                </span>
                            `
                                : ""
                            }
                            ${content}
                        </div>
                    `;

          index++;
        });
      });

      // Creatable
      if (
        config.creatable &&
        state.search &&
        !this._findOption(state, state.search)
      ) {
        html += `
                    <div class="bael-select-create">
                        ${config.createPrefix}"${state.search}"
                    </div>
                `;
      }

      optionsContainer.innerHTML = html;

      // Option listeners
      optionsContainer.querySelectorAll(".bael-select-option").forEach((el) => {
        el.addEventListener("click", () => {
          if (el.classList.contains("disabled")) return;
          const value = el.dataset.value;
          const option = this._findOption(state, value);
          if (option) this._selectOption(state, option);
        });

        el.addEventListener("mouseenter", () => {
          state.highlightedIndex = parseInt(el.dataset.index);
          optionsContainer.querySelectorAll(".highlighted").forEach((h) => {
            h.classList.remove("highlighted");
          });
          el.classList.add("highlighted");
        });
      });

      // Create listener
      const createEl = optionsContainer.querySelector(".bael-select-create");
      if (createEl) {
        createEl.addEventListener("click", () => {
          this._createOption(state, state.search);
        });
      }
    }

    // ============================================================
    // HELPERS
    // ============================================================

    /**
     * Find option by value
     */
    _findOption(state, value) {
      return state.config.options.find(
        (o) => o.value === value || o.value === String(value),
      );
    }

    /**
     * Check if value is selected
     */
    _isSelected(state, value) {
      if (state.config.multiple) {
        return state.selected.has(value);
      }
      return state.selected === value;
    }

    /**
     * Group options
     */
    _groupOptions(options) {
      const groups = new Map();
      groups.set("", []); // Default group

      options.forEach((option) => {
        const group = option.group || "";
        if (!groups.has(group)) {
          groups.set(group, []);
        }
        groups.get(group).push(option);
      });

      // Remove empty default group if there are other groups
      if (groups.size > 1 && groups.get("").length === 0) {
        groups.delete("");
      }

      return groups;
    }

    /**
     * Filter options based on search
     */
    _filterOptions(state) {
      const { config, search } = state;

      if (!search) {
        state.filteredOptions = [...config.options];
        return;
      }

      const searchLower = search.toLowerCase();

      if (config.filterOption) {
        state.filteredOptions = config.options.filter((o) =>
          config.filterOption(o, search),
        );
      } else {
        state.filteredOptions = config.options.filter((o) => {
          const label = (o.label || o.value || "").toLowerCase();
          return label.includes(searchLower);
        });
      }

      state.highlightedIndex = state.filteredOptions.length > 0 ? 0 : -1;
    }

    /**
     * Select an option
     */
    _selectOption(state, option) {
      const { config } = state;

      if (config.multiple) {
        if (state.selected.has(option.value)) {
          state.selected.delete(option.value);
        } else {
          state.selected.add(option.value);
        }
      } else {
        state.selected = option.value;
      }

      this._render(state);
      this._emitChange(state);

      if (config.closeOnSelect && !config.multiple) {
        this.close(state.id);
      }
    }

    /**
     * Create a new option
     */
    _createOption(state, value) {
      const { config } = state;

      const newOption = { value, label: value };

      if (config.onCreate) {
        const result = config.onCreate(value);
        if (result === false) return;
        if (typeof result === "object") {
          Object.assign(newOption, result);
        }
      }

      config.options.push(newOption);
      state.filteredOptions.push(newOption);

      this._selectOption(state, newOption);

      state.search = "";
      if (state.searchInput) {
        state.searchInput.value = "";
      }
      this._filterOptions(state);
      this._renderOptions(state);
    }

    /**
     * Emit change event
     */
    _emitChange(state) {
      if (state.config.onChange) {
        state.config.onChange(this.getValue(state.id));
      }
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    /**
     * Open dropdown
     */
    async open(selectId) {
      const state = this.instances.get(selectId);
      if (!state || state.isOpen || state.config.disabled) return;

      state.isOpen = true;
      state.wrapper.classList.add("open");

      // Load options if needed
      if (state.config.loadOptions) {
        state.loading = true;
        this._renderOptions(state);

        try {
          const options = await state.config.loadOptions();
          state.config.options = options;
          state.filteredOptions = options;
        } catch (error) {
          console.error("Error loading options:", error);
        }

        state.loading = false;
        this._renderOptions(state);
      }

      // Focus search
      if (state.searchInput) {
        setTimeout(() => state.searchInput.focus(), 0);
      }
    }

    /**
     * Close dropdown
     */
    close(selectId) {
      const state = this.instances.get(selectId);
      if (!state || !state.isOpen) return;

      state.isOpen = false;
      state.wrapper.classList.remove("open");
      state.highlightedIndex = -1;
      state.search = "";

      if (state.searchInput) {
        state.searchInput.value = "";
      }

      this._filterOptions(state);
    }

    /**
     * Toggle dropdown
     */
    toggle(selectId) {
      const state = this.instances.get(selectId);
      if (!state) return;

      if (state.isOpen) {
        this.close(selectId);
      } else {
        this.open(selectId);
      }
    }

    /**
     * Focus select
     */
    focus(selectId) {
      const state = this.instances.get(selectId);
      if (!state) return;

      state.trigger.focus();
    }

    /**
     * Get value
     */
    getValue(selectId) {
      const state = this.instances.get(selectId);
      if (!state) return null;

      if (state.config.multiple) {
        return Array.from(state.selected);
      }
      return state.selected;
    }

    /**
     * Set value
     */
    setValue(selectId, value) {
      const state = this.instances.get(selectId);
      if (!state) return;

      if (state.config.multiple) {
        state.selected = new Set(Array.isArray(value) ? value : [value]);
      } else {
        state.selected = value;
      }

      this._render(state);
    }

    /**
     * Set options
     */
    setOptions(selectId, options) {
      const state = this.instances.get(selectId);
      if (!state) return;

      state.config.options = options;
      state.filteredOptions = [...options];
      this._renderOptions(state);
    }

    /**
     * Add option
     */
    addOption(selectId, option) {
      const state = this.instances.get(selectId);
      if (!state) return;

      state.config.options.push(option);
      this._filterOptions(state);
      this._renderOptions(state);
    }

    /**
     * Remove option
     */
    removeOption(selectId, value) {
      const state = this.instances.get(selectId);
      if (!state) return;

      state.config.options = state.config.options.filter(
        (o) => o.value !== value,
      );
      state.selected.delete?.(value);
      if (state.selected === value) state.selected = null;

      this._filterOptions(state);
      this._render(state);
    }

    /**
     * Clear selection
     */
    clear(selectId) {
      const state = this.instances.get(selectId);
      if (!state) return;

      if (state.config.multiple) {
        state.selected.clear();
      } else {
        state.selected = null;
      }

      this._render(state);
      this._emitChange(state);
    }

    /**
     * Set disabled state
     */
    setDisabled(selectId, disabled) {
      const state = this.instances.get(selectId);
      if (!state) return;

      state.config.disabled = disabled;
      state.trigger.classList.toggle("disabled", disabled);
      state.trigger.tabIndex = disabled ? -1 : 0;

      if (disabled && state.isOpen) {
        this.close(selectId);
      }
    }

    /**
     * Destroy select
     */
    destroy(selectId) {
      const state = this.instances.get(selectId);
      if (!state) return;

      state.wrapper.remove();
      this.instances.delete(selectId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelSelect();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$selectBox = (container, options) => bael.create(container, options);
  window.$multiSelect = (container, options) =>
    bael.create(container, {
      multiple: true,
      ...options,
    });
  window.$combobox = (container, options) =>
    bael.create(container, {
      searchable: true,
      ...options,
    });

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelSelect = bael;

  console.log("📋 BAEL Select Component loaded");
})();
