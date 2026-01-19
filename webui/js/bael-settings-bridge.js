/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   ███████╗███████╗████████╗████████╗██╗███╗   ██╗ ██████╗ ███████╗       █
 * █   ██╔════╝██╔════╝╚══██╔══╝╚══██╔══╝██║████╗  ██║██╔════╝ ██╔════╝       █
 * █   ███████╗█████╗     ██║      ██║   ██║██╔██╗ ██║██║  ███╗███████╗       █
 * █   ╚════██║██╔══╝     ██║      ██║   ██║██║╚██╗██║██║   ██║╚════██║       █
 * █   ███████║███████╗   ██║      ██║   ██║██║ ╚████║╚██████╔╝███████║       █
 * █   ╚══════╝╚══════╝   ╚═╝      ╚═╝   ╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚══════╝       █
 * █                                                                          █
 * █   BRIDGE - UNIFIED SETTINGS INTEGRATION                                  █
 * █   Seamless integration between Agent Zero settings and Bael GUI          █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelSettingsBridge {
    constructor() {
      this.settings = {};
      this.originalSettings = null;
      this.listeners = new Map();
      this.syncInterval = null;
      this.initialized = false;

      console.log("⚙️ Bael Settings Bridge initialized");
    }

    async initialize() {
      // Connect to original Agent Zero settings
      await this.connectToOriginalSettings();

      // Setup bidirectional sync
      await this.setupBidirectionalSync();

      // Enhance settings UI
      await this.enhanceSettingsUI();

      // Setup auto-save
      await this.setupAutoSave();

      // Apply Bael defaults
      await this.applyBaelDefaults();

      this.initialized = true;
      console.log("🔗 SETTINGS BRIDGE ACTIVE");
      return this;
    }

    /**
     * Connect to original Agent Zero settings system
     */
    async connectToOriginalSettings() {
      // Get settings from API
      const api = window.api || window.BaelApiClient;

      if (api?.get_settings) {
        try {
          this.originalSettings = await api.get_settings();
          this.settings = { ...this.originalSettings };
        } catch (e) {
          console.warn("Could not fetch settings from API:", e);
        }
      }

      // Fallback to localStorage if API not available
      if (!this.originalSettings) {
        const stored = localStorage.getItem("agent_zero_settings");
        if (stored) {
          try {
            this.originalSettings = JSON.parse(stored);
            this.settings = { ...this.originalSettings };
          } catch (e) {
            console.warn("Could not parse stored settings:", e);
          }
        }
      }

      // Connect to Alpine store if available
      if (window.Alpine?.store) {
        const alpineSettings = Alpine.store("settings");
        if (alpineSettings) {
          this.settings = { ...this.settings, ...alpineSettings };
        }
      }

      // Ensure we have default structure
      this.settings = this.ensureDefaults(this.settings);
    }

    /**
     * Ensure all required settings have default values
     */
    ensureDefaults(settings) {
      const defaults = {
        // Agent Configuration
        agent: {
          name: "Agent Zero",
          model: "gpt-4o",
          temperature: 0.7,
          maxTokens: 4096,
          contextWindow: 128000,
          systemPrompt: "",
          profile: "default",
        },

        // API Keys
        api: {
          openai: "",
          anthropic: "",
          google: "",
          custom: {},
        },

        // UI Settings
        ui: {
          theme: "dark",
          fontSize: 14,
          fontFamily: "Inter",
          compactMode: false,
          showTimestamps: true,
          showThoughts: true,
          showTools: true,
          syntaxHighlight: true,
          animations: true,
        },

        // Chat Settings
        chat: {
          streamResponses: true,
          autoScroll: true,
          saveHistory: true,
          maxHistory: 100,
          messageSound: false,
        },

        // Memory Settings
        memory: {
          enabled: true,
          autoSave: true,
          maxMemories: 1000,
          similarity: 0.7,
        },

        // Scheduler Settings
        scheduler: {
          enabled: false,
          tasks: [],
          defaultInterval: 3600000,
        },

        // Development Settings
        dev: {
          debugMode: false,
          logLevel: "info",
          showPerformance: false,
          rfcEnabled: false,
          rfcHost: "localhost",
          rfcPort: 5555,
        },

        // Bael Enhancements
        bael: {
          powerMode: true,
          autoOptimize: true,
          predictiveCache: true,
          parallelExecution: true,
          tokenOptimization: true,
          swarmEnabled: false,
          dominationProtocol: false,
        },
      };

      // Deep merge
      return this.deepMerge(defaults, settings || {});
    }

    /**
     * Deep merge helper
     */
    deepMerge(target, source) {
      const result = { ...target };

      for (const key in source) {
        if (
          source[key] &&
          typeof source[key] === "object" &&
          !Array.isArray(source[key])
        ) {
          result[key] = this.deepMerge(target[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }

      return result;
    }

    /**
     * Setup bidirectional sync between settings systems
     */
    async setupBidirectionalSync() {
      // Sync from Alpine to our settings
      if (window.Alpine?.effect) {
        Alpine.effect(() => {
          const alpineSettings = Alpine.store("settings");
          if (alpineSettings) {
            this.onAlpineSettingsChange(alpineSettings);
          }
        });
      }

      // Watch for localStorage changes
      window.addEventListener("storage", (e) => {
        if (e.key === "agent_zero_settings" || e.key?.startsWith("bael_")) {
          this.onStorageChange(e);
        }
      });

      // Periodic sync
      this.syncInterval = setInterval(() => {
        this.syncSettings();
      }, 5000);
    }

    /**
     * Handle Alpine settings changes
     */
    onAlpineSettingsChange(alpineSettings) {
      const changed = [];

      for (const key in alpineSettings) {
        if (
          JSON.stringify(this.settings[key]) !==
          JSON.stringify(alpineSettings[key])
        ) {
          changed.push(key);
          this.settings[key] = alpineSettings[key];
        }
      }

      if (changed.length > 0) {
        this.notifyListeners("alpine_change", changed);
        this.persistSettings();
      }
    }

    /**
     * Handle storage changes
     */
    onStorageChange(event) {
      if (event.key === "agent_zero_settings") {
        try {
          const newSettings = JSON.parse(event.newValue);
          this.settings = this.deepMerge(this.settings, newSettings);
          this.updateAlpineStore();
          this.notifyListeners("storage_change", Object.keys(newSettings));
        } catch (e) {
          console.warn("Could not parse storage settings:", e);
        }
      }
    }

    /**
     * Sync settings across all systems
     */
    async syncSettings() {
      // Update Alpine store
      this.updateAlpineStore();

      // Sync with API if connected
      const api = window.api || window.BaelApiClient;
      if (api?.get_settings) {
        try {
          const serverSettings = await api.get_settings();
          if (
            serverSettings &&
            JSON.stringify(serverSettings) !==
              JSON.stringify(this.originalSettings)
          ) {
            this.settings = this.deepMerge(this.settings, serverSettings);
            this.originalSettings = serverSettings;
            this.notifyListeners("api_sync", Object.keys(serverSettings));
          }
        } catch (e) {
          // API not available, continue with local settings
        }
      }
    }

    /**
     * Update Alpine store with current settings
     */
    updateAlpineStore() {
      if (window.Alpine?.store) {
        const store = Alpine.store("settings");
        if (store) {
          for (const key in this.settings) {
            if (store[key] !== undefined) {
              store[key] = this.settings[key];
            }
          }
        }
      }
    }

    /**
     * Enhance the settings UI with Bael features
     */
    async enhanceSettingsUI() {
      // Add Bael settings section
      this.addBaelSettingsSection();

      // Add quick toggles
      this.addQuickToggles();

      // Add preset buttons
      this.addPresetButtons();

      // Add export/import buttons
      this.addExportImportButtons();
    }

    /**
     * Add Bael-specific settings section
     */
    addBaelSettingsSection() {
      const settingsContainer = document.querySelector(
        '.settings-container, #settings, [x-data*="settings"]',
      );
      if (!settingsContainer) return;

      const baelSection = document.createElement("div");
      baelSection.className = "bael-settings-section";
      baelSection.innerHTML = `
                <div class="settings-section-header">
                    <h3>⚡ Bael Power Settings</h3>
                    <span class="badge">Enhanced</span>
                </div>
                <div class="settings-group">
                    <label class="settings-toggle">
                        <input type="checkbox" id="bael-power-mode" ${this.settings.bael?.powerMode ? "checked" : ""}>
                        <span>Power Mode</span>
                        <small>Enable all optimizations</small>
                    </label>
                    <label class="settings-toggle">
                        <input type="checkbox" id="bael-auto-optimize" ${this.settings.bael?.autoOptimize ? "checked" : ""}>
                        <span>Auto Optimize</span>
                        <small>Automatic performance tuning</small>
                    </label>
                    <label class="settings-toggle">
                        <input type="checkbox" id="bael-predictive-cache" ${this.settings.bael?.predictiveCache ? "checked" : ""}>
                        <span>Predictive Cache</span>
                        <small>Pre-fetch likely needed data</small>
                    </label>
                    <label class="settings-toggle">
                        <input type="checkbox" id="bael-token-optimization" ${this.settings.bael?.tokenOptimization ? "checked" : ""}>
                        <span>Token Optimization</span>
                        <small>Compress prompts to save tokens</small>
                    </label>
                </div>
            `;

      // Add event listeners
      baelSection
        .querySelectorAll('input[type="checkbox"]')
        .forEach((input) => {
          input.addEventListener("change", () => {
            const key = input.id.replace("bael-", "").replace(/-/g, "");
            const camelKey = key.replace(/([A-Z])/g, (m) => m.toLowerCase());
            this.set(`bael.${camelKey}`, input.checked);
          });
        });

      settingsContainer.appendChild(baelSection);
    }

    /**
     * Add quick toggle buttons to header
     */
    addQuickToggles() {
      const header = document.querySelector("header, .header, #header");
      if (!header) return;

      const toggleContainer = document.createElement("div");
      toggleContainer.className = "bael-quick-toggles";
      toggleContainer.innerHTML = `
                <button class="quick-toggle" data-setting="ui.theme" title="Toggle Theme">
                    <span class="icon">${this.settings.ui?.theme === "dark" ? "🌙" : "☀️"}</span>
                </button>
                <button class="quick-toggle" data-setting="bael.powerMode" title="Power Mode">
                    <span class="icon">⚡</span>
                </button>
                <button class="quick-toggle" data-setting="dev.debugMode" title="Debug Mode">
                    <span class="icon">🐛</span>
                </button>
            `;

      toggleContainer.querySelectorAll(".quick-toggle").forEach((btn) => {
        btn.addEventListener("click", () => {
          const setting = btn.dataset.setting;
          const current = this.get(setting);

          if (setting === "ui.theme") {
            this.set(setting, current === "dark" ? "light" : "dark");
            btn.querySelector(".icon").textContent =
              current === "dark" ? "☀️" : "🌙";
          } else {
            this.set(setting, !current);
            btn.classList.toggle("active", !current);
          }
        });
      });

      header.appendChild(toggleContainer);
    }

    /**
     * Add preset configuration buttons
     */
    addPresetButtons() {
      const presets = {
        minimal: {
          name: "Minimal",
          icon: "🔋",
          settings: {
            "ui.animations": false,
            "ui.compactMode": true,
            "bael.powerMode": false,
            "chat.streamResponses": true,
          },
        },
        balanced: {
          name: "Balanced",
          icon: "⚖️",
          settings: {
            "ui.animations": true,
            "ui.compactMode": false,
            "bael.powerMode": true,
            "bael.autoOptimize": true,
          },
        },
        maximum: {
          name: "Maximum Power",
          icon: "🔥",
          settings: {
            "ui.animations": true,
            "bael.powerMode": true,
            "bael.autoOptimize": true,
            "bael.predictiveCache": true,
            "bael.parallelExecution": true,
            "bael.tokenOptimization": true,
          },
        },
      };

      this.presets = presets;
    }

    /**
     * Add export/import functionality
     */
    addExportImportButtons() {
      this.exportSettings = () => {
        const data = JSON.stringify(this.settings, null, 2);
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "bael-settings.json";
        a.click();
        URL.revokeObjectURL(url);
      };

      this.importSettings = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const imported = JSON.parse(e.target.result);
            this.settings = this.deepMerge(this.settings, imported);
            this.persistSettings();
            this.updateAlpineStore();
            this.notifyListeners("import", Object.keys(imported));
          } catch (err) {
            console.error("Failed to import settings:", err);
          }
        };
        reader.readAsText(file);
      };
    }

    /**
     * Setup auto-save functionality
     */
    async setupAutoSave() {
      // Debounced save
      this.debouncedSave = this.debounce(() => {
        this.persistSettings();
      }, 1000);
    }

    /**
     * Apply Bael default enhancements
     */
    async applyBaelDefaults() {
      // Enable power mode by default
      if (this.settings.bael?.powerMode === undefined) {
        this.settings.bael = this.settings.bael || {};
        this.settings.bael.powerMode = true;
      }

      // Apply theme to document
      if (this.settings.ui?.theme) {
        document.documentElement.setAttribute(
          "data-theme",
          this.settings.ui.theme,
        );
      }

      // Configure based on settings
      if (this.settings.bael?.powerMode) {
        this.enablePowerMode();
      }
    }

    /**
     * Enable power mode optimizations
     */
    enablePowerMode() {
      // Enable Bael systems
      if (window.BaelExploit?.initialize) {
        window.BaelExploit.initialize();
      }

      if (window.BaelOmniscient?.initialize) {
        window.BaelOmniscient.initialize();
      }

      // Dispatch event
      window.dispatchEvent(
        new CustomEvent("bael:powermode", { detail: { enabled: true } }),
      );
    }

    /**
     * Get a setting value
     */
    get(path, defaultValue = undefined) {
      const parts = path.split(".");
      let value = this.settings;

      for (const part of parts) {
        if (value && typeof value === "object" && part in value) {
          value = value[part];
        } else {
          return defaultValue;
        }
      }

      return value;
    }

    /**
     * Set a setting value
     */
    set(path, value) {
      const parts = path.split(".");
      let obj = this.settings;

      for (let i = 0; i < parts.length - 1; i++) {
        if (!(parts[i] in obj)) {
          obj[parts[i]] = {};
        }
        obj = obj[parts[i]];
      }

      const oldValue = obj[parts[parts.length - 1]];
      obj[parts[parts.length - 1]] = value;

      // Notify listeners
      this.notifyListeners("set", { path, oldValue, newValue: value });

      // Auto-save
      this.debouncedSave?.();

      return this;
    }

    /**
     * Persist settings to storage
     */
    persistSettings() {
      // Save to localStorage
      localStorage.setItem(
        "agent_zero_settings",
        JSON.stringify(this.settings),
      );
      localStorage.setItem(
        "bael_settings",
        JSON.stringify(this.settings.bael || {}),
      );

      // Save to API if available
      const api = window.api || window.BaelApiClient;
      if (api?.save_settings) {
        api.save_settings(this.settings).catch((e) => {
          console.warn("Could not save settings to API:", e);
        });
      }

      this.notifyListeners("persist", this.settings);
    }

    /**
     * Apply a preset
     */
    applyPreset(presetName) {
      const preset = this.presets[presetName];
      if (!preset) return false;

      for (const [path, value] of Object.entries(preset.settings)) {
        this.set(path, value);
      }

      this.notifyListeners("preset", { name: presetName, preset });
      return true;
    }

    /**
     * Subscribe to setting changes
     */
    subscribe(callback) {
      const id = Date.now().toString();
      this.listeners.set(id, callback);
      return () => this.listeners.delete(id);
    }

    /**
     * Notify all listeners
     */
    notifyListeners(event, data) {
      this.listeners.forEach((callback) => {
        try {
          callback(event, data);
        } catch (e) {
          console.error("Settings listener error:", e);
        }
      });

      // Also dispatch DOM event
      window.dispatchEvent(
        new CustomEvent("bael:settings", {
          detail: { event, data },
        }),
      );
    }

    /**
     * Debounce helper
     */
    debounce(fn, delay) {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn.apply(this, args), delay);
      };
    }

    /**
     * Get all settings
     */
    getAll() {
      return { ...this.settings };
    }

    /**
     * Reset to defaults
     */
    reset() {
      this.settings = this.ensureDefaults({});
      this.persistSettings();
      this.updateAlpineStore();
      this.notifyListeners("reset", this.settings);
    }

    /**
     * Cleanup
     */
    destroy() {
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
      }
      this.listeners.clear();
    }
  }

  // Initialize and export
  window.BaelSettingsBridge = new BaelSettingsBridge();

  // Auto-initialize
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelSettingsBridge.initialize();
    });
  } else {
    window.BaelSettingsBridge.initialize();
  }
})();
