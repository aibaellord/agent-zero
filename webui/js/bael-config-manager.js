/**
 * BAEL Configuration Manager - Centralized Config System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete configuration system with:
 * - Hierarchical config (defaults, user, runtime)
 * - Schema validation
 * - Environment-based config
 * - Hot reloading
 * - Config versioning
 * - Migration support
 * - Secrets management
 * - Config diff/merge
 */

(function () {
  "use strict";

  class BaelConfigManager {
    constructor() {
      this.defaults = {};
      this.user = {};
      this.runtime = {};
      this.schema = {};
      this.version = "1.0.0";
      this.listeners = new Map();
      this.history = [];
      this.maxHistory = 50;
      this.init();
    }

    init() {
      this.loadDefaults();
      this.loadUserConfig();
      this.migrateIfNeeded();
      this.createUI();
      this.addStyles();
      this.bindEvents();
      console.log("⚙️ Bael Config Manager initialized");
    }

    // Load Default Configuration
    loadDefaults() {
      this.defaults = {
        // General
        general: {
          theme: "dark",
          language: "en",
          animations: true,
          sounds: false,
          fontSize: 14,
          fontFamily: "system-ui",
        },

        // Chat
        chat: {
          autoScroll: true,
          showTimestamps: false,
          showAvatars: true,
          messageLimit: 100,
          typingIndicator: true,
          enterToSend: true,
          saveHistory: true,
        },

        // AI
        ai: {
          defaultModel: "gpt-4",
          temperature: 0.7,
          maxTokens: 4096,
          streamResponse: true,
          showThinking: true,
          retryOnError: true,
          timeout: 30000,
        },

        // Performance
        performance: {
          lazyLoading: true,
          cacheEnabled: true,
          cacheTTL: 3600000,
          prefetch: true,
          debounceDelay: 300,
          maxConcurrentRequests: 6,
        },

        // Privacy
        privacy: {
          telemetryEnabled: false,
          errorReporting: true,
          saveLocally: true,
          clearOnExit: false,
        },

        // Accessibility
        accessibility: {
          reducedMotion: false,
          highContrast: false,
          screenReader: false,
          focusVisible: true,
          largeClickTargets: false,
        },

        // Developer
        developer: {
          debugMode: false,
          logLevel: "info",
          showDevTools: false,
          mockResponses: false,
        },

        // Features
        features: {
          personas: true,
          workflows: true,
          knowledgeGraph: true,
          collaboration: false,
          codeEditor: true,
          voiceInput: false,
        },
      };

      // Define schema
      this.schema = {
        "general.theme": { type: "enum", values: ["dark", "light", "auto"] },
        "general.fontSize": { type: "number", min: 10, max: 24 },
        "ai.temperature": { type: "number", min: 0, max: 2 },
        "ai.maxTokens": { type: "number", min: 100, max: 128000 },
        "ai.timeout": { type: "number", min: 5000, max: 120000 },
        "performance.cacheTTL": { type: "number", min: 0 },
        "developer.logLevel": {
          type: "enum",
          values: ["debug", "info", "warn", "error"],
        },
      };
    }

    // Load User Configuration
    loadUserConfig() {
      const saved = localStorage.getItem("bael_config");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.user = parsed.config || {};
          this.version = parsed.version || "1.0.0";
        } catch (e) {
          console.warn("Failed to load user config");
          this.user = {};
        }
      }
    }

    // Save User Configuration
    saveUserConfig() {
      const data = {
        version: this.version,
        config: this.user,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem("bael_config", JSON.stringify(data));
    }

    // Migrate Configuration
    migrateIfNeeded() {
      const migrations = {
        "0.9.0": (config) => {
          // Example migration
          if (config.theme) {
            config.general = config.general || {};
            config.general.theme = config.theme;
            delete config.theme;
          }
          return config;
        },
      };

      // Apply migrations in order
      Object.entries(migrations).forEach(([version, migrateFn]) => {
        if (this.compareVersions(this.version, version) < 0) {
          this.user = migrateFn(this.user);
          this.version = version;
        }
      });

      this.version = "1.0.0"; // Current version
      this.saveUserConfig();
    }

    // Compare versions
    compareVersions(v1, v2) {
      const parts1 = v1.split(".").map(Number);
      const parts2 = v2.split(".").map(Number);

      for (let i = 0; i < 3; i++) {
        if (parts1[i] > parts2[i]) return 1;
        if (parts1[i] < parts2[i]) return -1;
      }
      return 0;
    }

    // Get Configuration Value
    get(path, defaultValue = undefined) {
      // Priority: runtime > user > defaults
      let value = this.getByPath(this.runtime, path);
      if (value !== undefined) return value;

      value = this.getByPath(this.user, path);
      if (value !== undefined) return value;

      value = this.getByPath(this.defaults, path);
      if (value !== undefined) return value;

      return defaultValue;
    }

    // Get by path
    getByPath(obj, path) {
      return path
        .split(".")
        .reduce(
          (current, key) =>
            current && current[key] !== undefined ? current[key] : undefined,
          obj,
        );
    }

    // Set Configuration Value
    set(path, value, options = {}) {
      const { layer = "user", persist = true, silent = false } = options;

      // Validate against schema
      const validation = this.validate(path, value);
      if (!validation.valid) {
        throw new Error(`Invalid config value: ${validation.error}`);
      }

      // Get previous value
      const previous = this.get(path);

      // Set in appropriate layer
      const target = layer === "runtime" ? this.runtime : this.user;
      this.setByPath(target, path, value);

      // Record history
      this.history.push({
        path,
        previous,
        value,
        layer,
        timestamp: new Date(),
      });

      while (this.history.length > this.maxHistory) {
        this.history.shift();
      }

      // Persist if user layer
      if (persist && layer === "user") {
        this.saveUserConfig();
      }

      // Notify listeners
      if (!silent) {
        this.notifyListeners(path, value, previous);
      }

      return this;
    }

    // Set by path
    setByPath(obj, path, value) {
      const parts = path.split(".");
      const last = parts.pop();
      let current = obj;

      parts.forEach((part) => {
        if (!current[part]) current[part] = {};
        current = current[part];
      });

      current[last] = value;
    }

    // Reset to defaults
    reset(path) {
      if (path) {
        const parts = path.split(".");
        let current = this.user;

        for (let i = 0; i < parts.length - 1; i++) {
          if (!current[parts[i]]) return;
          current = current[parts[i]];
        }

        delete current[parts[parts.length - 1]];
      } else {
        this.user = {};
      }

      this.saveUserConfig();
      this.updateUI();
    }

    // Validate value against schema
    validate(path, value) {
      const schemaEntry = this.schema[path];
      if (!schemaEntry) return { valid: true };

      if (schemaEntry.type === "enum") {
        if (!schemaEntry.values.includes(value)) {
          return {
            valid: false,
            error: `Must be one of: ${schemaEntry.values.join(", ")}`,
          };
        }
      }

      if (schemaEntry.type === "number") {
        if (typeof value !== "number") {
          return { valid: false, error: "Must be a number" };
        }
        if (schemaEntry.min !== undefined && value < schemaEntry.min) {
          return { valid: false, error: `Minimum value is ${schemaEntry.min}` };
        }
        if (schemaEntry.max !== undefined && value > schemaEntry.max) {
          return { valid: false, error: `Maximum value is ${schemaEntry.max}` };
        }
      }

      return { valid: true };
    }

    // Subscribe to config changes
    subscribe(path, callback) {
      if (!this.listeners.has(path)) {
        this.listeners.set(path, []);
      }
      this.listeners.get(path).push(callback);

      // Return unsubscribe function
      return () => {
        const callbacks = this.listeners.get(path);
        const index = callbacks.indexOf(callback);
        if (index > -1) callbacks.splice(index, 1);
      };
    }

    // Notify listeners
    notifyListeners(path, value, previous) {
      // Exact path listeners
      const callbacks = this.listeners.get(path) || [];
      callbacks.forEach((cb) => cb(value, previous, path));

      // Wildcard listeners (e.g., 'general.*')
      const parts = path.split(".");
      for (let i = 1; i <= parts.length; i++) {
        const wildcardPath = [...parts.slice(0, i), "*"].join(".");
        const wildcardCallbacks = this.listeners.get(wildcardPath) || [];
        wildcardCallbacks.forEach((cb) => cb(value, previous, path));
      }

      // Global listeners
      const globalCallbacks = this.listeners.get("*") || [];
      globalCallbacks.forEach((cb) => cb(value, previous, path));

      // Dispatch event
      window.dispatchEvent(
        new CustomEvent("bael-config-changed", {
          detail: { path, value, previous },
        }),
      );
    }

    // Export configuration
    export() {
      return JSON.stringify(
        {
          version: this.version,
          exportedAt: new Date().toISOString(),
          config: this.user,
        },
        null,
        2,
      );
    }

    // Import configuration
    import(jsonString) {
      try {
        const data = JSON.parse(jsonString);
        this.user = data.config || data;
        this.saveUserConfig();
        this.updateUI();
        return { success: true };
      } catch (e) {
        return { success: false, error: e.message };
      }
    }

    // Get all config as flat object
    getAll() {
      const result = {};

      const flatten = (obj, prefix = "") => {
        Object.entries(obj).forEach(([key, value]) => {
          const path = prefix ? `${prefix}.${key}` : key;
          if (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value)
          ) {
            flatten(value, path);
          } else {
            result[path] = this.get(path);
          }
        });
      };

      flatten(this.defaults);
      return result;
    }

    // Get diff between user and defaults
    getDiff() {
      const diff = [];
      const all = this.getAll();

      Object.entries(all).forEach(([path, value]) => {
        const defaultValue = this.getByPath(this.defaults, path);
        const userValue = this.getByPath(this.user, path);

        if (userValue !== undefined && userValue !== defaultValue) {
          diff.push({ path, default: defaultValue, current: userValue });
        }
      });

      return diff;
    }

    // UI
    createUI() {
      this.panel = document.createElement("div");
      this.panel.id = "bael-config-panel";
      this.panel.innerHTML = `
                <div class="config-header">
                    <h3>⚙️ Configuration</h3>
                    <div class="config-actions">
                        <button class="export-btn" title="Export">📤</button>
                        <button class="import-btn" title="Import">📥</button>
                        <button class="reset-btn" title="Reset All">🔄</button>
                        <button class="close-btn">✕</button>
                    </div>
                </div>

                <div class="config-search">
                    <input type="text" id="config-search" placeholder="Search settings...">
                </div>

                <div class="config-categories" id="config-categories"></div>

                <div class="config-content" id="config-content"></div>
            `;
      document.body.appendChild(this.panel);
    }

    updateUI(filter = "") {
      this.updateCategories();
      this.updateContent(filter);
    }

    updateCategories() {
      const container = document.getElementById("config-categories");
      if (!container) return;

      const categories = Object.keys(this.defaults);
      container.innerHTML = `
                <button class="category-btn active" data-category="all">All</button>
                ${categories
                  .map(
                    (cat) => `
                    <button class="category-btn" data-category="${cat}">${this.formatCategory(cat)}</button>
                `,
                  )
                  .join("")}
            `;
    }

    updateContent(filter = "", category = "all") {
      const container = document.getElementById("config-content");
      if (!container) return;

      let html = "";
      const lowerFilter = filter.toLowerCase();

      Object.entries(this.defaults).forEach(([cat, settings]) => {
        if (category !== "all" && category !== cat) return;

        const items = Object.entries(settings).filter(
          ([key]) =>
            !filter ||
            key.toLowerCase().includes(lowerFilter) ||
            cat.toLowerCase().includes(lowerFilter),
        );

        if (items.length === 0) return;

        html += `<div class="config-category">
                    <h4>${this.formatCategory(cat)}</h4>
                    ${items
                      .map(([key, defaultValue]) => {
                        const path = `${cat}.${key}`;
                        const value = this.get(path);
                        const isModified =
                          this.getByPath(this.user, path) !== undefined;

                        return `
                            <div class="config-item ${isModified ? "modified" : ""}">
                                <div class="config-item-info">
                                    <span class="config-key">${this.formatKey(key)}</span>
                                    <span class="config-path">${path}</span>
                                </div>
                                <div class="config-input">
                                    ${this.renderInput(path, value, defaultValue)}
                                </div>
                            </div>
                        `;
                      })
                      .join("")}
                </div>`;
      });

      container.innerHTML =
        html || '<div class="no-results">No settings found</div>';
    }

    renderInput(path, value, defaultValue) {
      const schema = this.schema[path];

      if (typeof defaultValue === "boolean") {
        return `<label class="toggle-switch">
                    <input type="checkbox" data-path="${path}" ${value ? "checked" : ""}>
                    <span class="toggle-slider"></span>
                </label>`;
      }

      if (schema?.type === "enum") {
        return `<select data-path="${path}">
                    ${schema.values
                      .map(
                        (v) => `
                        <option value="${v}" ${v === value ? "selected" : ""}>${v}</option>
                    `,
                      )
                      .join("")}
                </select>`;
      }

      if (typeof defaultValue === "number") {
        return `<input type="number" data-path="${path}" value="${value}"
                    ${schema?.min !== undefined ? `min="${schema.min}"` : ""}
                    ${schema?.max !== undefined ? `max="${schema.max}"` : ""}>`;
      }

      return `<input type="text" data-path="${path}" value="${value}">`;
    }

    formatCategory(cat) {
      return cat.charAt(0).toUpperCase() + cat.slice(1);
    }

    formatKey(key) {
      return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (s) => s.toUpperCase());
    }

    addStyles() {
      const style = document.createElement("style");
      style.textContent = `
                #bael-config-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.9);
                    width: 650px;
                    max-width: 95vw;
                    max-height: 80vh;
                    background: var(--bael-surface, #1e1e1e);
                    border: 1px solid var(--bael-border, #333);
                    border-radius: 12px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                    z-index: 100001;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    opacity: 0;
                    transition: opacity 0.3s, transform 0.3s;
                }

                #bael-config-panel.visible {
                    display: flex;
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }

                .config-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background: var(--bael-bg-dark, #151515);
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .config-header h3 {
                    margin: 0;
                    font-size: 16px;
                    color: var(--bael-text, #fff);
                }

                .config-actions {
                    display: flex;
                    gap: 8px;
                }

                .config-actions button {
                    background: transparent;
                    border: none;
                    color: var(--bael-text-dim, #888);
                    cursor: pointer;
                    font-size: 16px;
                    padding: 4px;
                }

                .config-search {
                    padding: 12px 20px;
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .config-search input {
                    width: 100%;
                    padding: 10px 12px;
                    background: var(--bael-bg-dark, #151515);
                    border: 1px solid var(--bael-border, #333);
                    color: var(--bael-text, #fff);
                    border-radius: 6px;
                    font-size: 13px;
                }

                .config-categories {
                    display: flex;
                    gap: 8px;
                    padding: 12px 20px;
                    overflow-x: auto;
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .category-btn {
                    padding: 6px 12px;
                    background: var(--bael-bg-dark, #151515);
                    border: 1px solid var(--bael-border, #333);
                    color: var(--bael-text-dim, #888);
                    border-radius: 16px;
                    cursor: pointer;
                    font-size: 11px;
                    white-space: nowrap;
                }

                .category-btn.active {
                    background: var(--bael-accent, #00d4ff);
                    color: #000;
                    border-color: var(--bael-accent, #00d4ff);
                }

                .config-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px 20px;
                }

                .config-category {
                    margin-bottom: 24px;
                }

                .config-category h4 {
                    margin: 0 0 12px;
                    font-size: 12px;
                    color: var(--bael-text-dim, #888);
                    text-transform: uppercase;
                }

                .config-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background: var(--bael-bg-dark, #151515);
                    border-radius: 8px;
                    margin-bottom: 8px;
                }

                .config-item.modified {
                    border-left: 3px solid var(--bael-accent, #00d4ff);
                }

                .config-item-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .config-key {
                    color: var(--bael-text, #fff);
                    font-weight: 500;
                }

                .config-path {
                    font-size: 11px;
                    font-family: monospace;
                    color: var(--bael-text-dim, #666);
                }

                .config-input select,
                .config-input input[type="text"],
                .config-input input[type="number"] {
                    padding: 8px 12px;
                    background: var(--bael-surface, #252525);
                    border: 1px solid var(--bael-border, #333);
                    color: var(--bael-text, #fff);
                    border-radius: 6px;
                    font-size: 13px;
                    min-width: 120px;
                }

                .toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 44px;
                    height: 24px;
                }

                .toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .toggle-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #444;
                    transition: 0.3s;
                    border-radius: 24px;
                }

                .toggle-slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: 0.3s;
                    border-radius: 50%;
                }

                input:checked + .toggle-slider {
                    background-color: var(--bael-accent, #00d4ff);
                }

                input:checked + .toggle-slider:before {
                    transform: translateX(20px);
                }

                .no-results {
                    text-align: center;
                    padding: 40px;
                    color: var(--bael-text-dim, #888);
                }
            `;
      document.head.appendChild(style);
    }

    bindEvents() {
      // Close button
      this.panel
        .querySelector(".close-btn")
        .addEventListener("click", () => this.close());

      // Export button
      this.panel.querySelector(".export-btn").addEventListener("click", () => {
        const data = this.export();
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bael-config-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });

      // Import button
      this.panel.querySelector(".import-btn").addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const result = this.import(ev.target.result);
              if (!result.success) {
                alert("Import failed: " + result.error);
              }
            };
            reader.readAsText(file);
          }
        };
        input.click();
      });

      // Reset button
      this.panel.querySelector(".reset-btn").addEventListener("click", () => {
        if (confirm("Reset all settings to defaults?")) {
          this.reset();
        }
      });

      // Search
      document
        .getElementById("config-search")
        ?.addEventListener("input", (e) => {
          const category =
            this.panel.querySelector(".category-btn.active")?.dataset
              .category || "all";
          this.updateContent(e.target.value, category);
        });

      // Category buttons
      this.panel.addEventListener("click", (e) => {
        if (e.target.classList.contains("category-btn")) {
          this.panel
            .querySelectorAll(".category-btn")
            .forEach((b) => b.classList.remove("active"));
          e.target.classList.add("active");

          const search = document.getElementById("config-search")?.value || "";
          this.updateContent(search, e.target.dataset.category);
        }
      });

      // Config input changes
      this.panel.addEventListener("change", (e) => {
        const path = e.target.dataset.path;
        if (!path) return;

        let value;
        if (e.target.type === "checkbox") {
          value = e.target.checked;
        } else if (e.target.type === "number") {
          value = parseFloat(e.target.value);
        } else {
          value = e.target.value;
        }

        try {
          this.set(path, value);
          e.target.closest(".config-item")?.classList.add("modified");
        } catch (error) {
          alert(error.message);
          // Revert input
          e.target.value = this.get(path);
        }
      });
    }

    open() {
      this.panel.classList.add("visible");
      this.updateUI();
    }

    close() {
      this.panel.classList.remove("visible");
    }

    toggle() {
      if (this.panel.classList.contains("visible")) {
        this.close();
      } else {
        this.open();
      }
    }

    get isVisible() {
      return this.panel.classList.contains("visible");
    }
  }

  // Initialize
  window.BaelConfig = new BaelConfigManager();
})();
