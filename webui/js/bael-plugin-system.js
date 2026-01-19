/**
 * BAEL - LORD OF ALL
 * Plugin System - Extensible plugin architecture for community modules
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelPluginSystem {
    constructor() {
      this.plugins = new Map();
      this.hooks = new Map();
      this.enabled = new Set();
      this.container = null;
      this.isVisible = false;
      this.pluginStore = [];
      this.init();
    }

    init() {
      this.loadEnabledPlugins();
      this.createContainer();
      this.addStyles();
      this.bindEvents();
      this.registerCoreHooks();
      console.log("🔌 Bael Plugin System initialized");
    }

    registerCoreHooks() {
      // Register available hooks that plugins can tap into
      this.registerHook("onChatStart", "Fired when a new chat is started");
      this.registerHook("onMessageSend", "Fired before a message is sent");
      this.registerHook("onMessageReceive", "Fired when a message is received");
      this.registerHook("onToolCall", "Fired when a tool is called");
      this.registerHook("onThemeChange", "Fired when theme changes");
      this.registerHook("onSettingsChange", "Fired when settings change");
      this.registerHook("onAgentStart", "Fired when agent starts processing");
      this.registerHook("onAgentComplete", "Fired when agent completes");
      this.registerHook("onError", "Fired on any error");
      this.registerHook("onUIReady", "Fired when UI is fully loaded");
    }

    registerHook(name, description) {
      if (!this.hooks.has(name)) {
        this.hooks.set(name, {
          description,
          callbacks: [],
        });
      }
    }

    registerPlugin(manifest) {
      if (!manifest.id || !manifest.name || !manifest.version) {
        console.error("Invalid plugin manifest:", manifest);
        return false;
      }

      const plugin = {
        id: manifest.id,
        name: manifest.name,
        version: manifest.version,
        description: manifest.description || "",
        author: manifest.author || "Unknown",
        icon: manifest.icon || "🔌",
        hooks: manifest.hooks || {},
        settings: manifest.settings || [],
        commands: manifest.commands || [],
        init: manifest.init || (() => {}),
        destroy: manifest.destroy || (() => {}),
        enabled: false,
        settingsValues: {},
      };

      this.plugins.set(plugin.id, plugin);

      // Check if previously enabled
      if (this.enabled.has(plugin.id)) {
        this.enablePlugin(plugin.id);
      }

      return true;
    }

    enablePlugin(id) {
      const plugin = this.plugins.get(id);
      if (!plugin) return false;

      try {
        // Initialize plugin
        plugin.init(this.getPluginAPI(plugin));
        plugin.enabled = true;

        // Register hooks
        Object.entries(plugin.hooks).forEach(([hookName, callback]) => {
          this.addHookCallback(hookName, plugin.id, callback);
        });

        // Register commands
        plugin.commands.forEach((cmd) => {
          if (window.BaelCommandPalette) {
            window.BaelCommandPalette.registerCommand({
              id: `plugin:${plugin.id}:${cmd.id}`,
              title: cmd.title,
              category: plugin.name,
              icon: cmd.icon || plugin.icon,
              action: cmd.action,
            });
          }
        });

        this.enabled.add(id);
        this.saveEnabledPlugins();
        this.updatePluginList();

        if (window.BaelNotifications) {
          window.BaelNotifications.success(`Plugin "${plugin.name}" enabled`);
        }

        return true;
      } catch (e) {
        console.error(`Failed to enable plugin ${id}:`, e);
        if (window.BaelNotifications) {
          window.BaelNotifications.error(
            `Failed to enable "${plugin.name}": ${e.message}`,
          );
        }
        return false;
      }
    }

    disablePlugin(id) {
      const plugin = this.plugins.get(id);
      if (!plugin || !plugin.enabled) return false;

      try {
        // Call destroy
        plugin.destroy();
        plugin.enabled = false;

        // Remove hooks
        Object.keys(plugin.hooks).forEach((hookName) => {
          this.removeHookCallback(hookName, plugin.id);
        });

        // Remove commands
        plugin.commands.forEach((cmd) => {
          if (window.BaelCommandPalette) {
            window.BaelCommandPalette.unregisterCommand(
              `plugin:${plugin.id}:${cmd.id}`,
            );
          }
        });

        this.enabled.delete(id);
        this.saveEnabledPlugins();
        this.updatePluginList();

        if (window.BaelNotifications) {
          window.BaelNotifications.info(`Plugin "${plugin.name}" disabled`);
        }

        return true;
      } catch (e) {
        console.error(`Failed to disable plugin ${id}:`, e);
        return false;
      }
    }

    addHookCallback(hookName, pluginId, callback) {
      const hook = this.hooks.get(hookName);
      if (hook) {
        hook.callbacks.push({ pluginId, callback });
      }
    }

    removeHookCallback(hookName, pluginId) {
      const hook = this.hooks.get(hookName);
      if (hook) {
        hook.callbacks = hook.callbacks.filter(
          (cb) => cb.pluginId !== pluginId,
        );
      }
    }

    trigger(hookName, data = {}) {
      const hook = this.hooks.get(hookName);
      if (!hook) return data;

      let result = data;
      for (const { callback } of hook.callbacks) {
        try {
          const modified = callback(result);
          if (modified !== undefined) {
            result = modified;
          }
        } catch (e) {
          console.error(`Hook callback error in ${hookName}:`, e);
        }
      }
      return result;
    }

    getPluginAPI(plugin) {
      return {
        // Storage
        storage: {
          get: (key) => this.getPluginStorage(plugin.id, key),
          set: (key, value) => this.setPluginStorage(plugin.id, key, value),
          remove: (key) => this.removePluginStorage(plugin.id, key),
          clear: () => this.clearPluginStorage(plugin.id),
        },

        // Settings
        getSetting: (key) => plugin.settingsValues[key],

        // UI
        ui: {
          showNotification: (message, type = "info") => {
            if (window.BaelNotifications) {
              window.BaelNotifications[type]?.(message) ||
                window.BaelNotifications.info(message);
            }
          },
          registerCommand: (cmd) => {
            if (window.BaelCommandPalette) {
              window.BaelCommandPalette.registerCommand({
                ...cmd,
                id: `plugin:${plugin.id}:${cmd.id}`,
                category: plugin.name,
              });
            }
          },
          addStyles: (css) => {
            const style = document.createElement("style");
            style.id = `plugin-styles-${plugin.id}`;
            style.textContent = css;
            document.head.appendChild(style);
          },
          removeStyles: () => {
            document.getElementById(`plugin-styles-${plugin.id}`)?.remove();
          },
        },

        // Events
        on: (hookName, callback) => {
          this.addHookCallback(hookName, plugin.id, callback);
        },
        off: (hookName) => {
          this.removeHookCallback(hookName, plugin.id);
        },

        // Utilities
        log: (...args) => console.log(`[${plugin.name}]`, ...args),
        warn: (...args) => console.warn(`[${plugin.name}]`, ...args),
        error: (...args) => console.error(`[${plugin.name}]`, ...args),
      };
    }

    getPluginStorage(pluginId, key) {
      try {
        const data =
          JSON.parse(localStorage.getItem(`bael_plugin_${pluginId}`)) || {};
        return key ? data[key] : data;
      } catch (e) {
        return key ? null : {};
      }
    }

    setPluginStorage(pluginId, key, value) {
      try {
        const data = this.getPluginStorage(pluginId);
        data[key] = value;
        localStorage.setItem(`bael_plugin_${pluginId}`, JSON.stringify(data));
      } catch (e) {
        console.error("Storage error:", e);
      }
    }

    removePluginStorage(pluginId, key) {
      try {
        const data = this.getPluginStorage(pluginId);
        delete data[key];
        localStorage.setItem(`bael_plugin_${pluginId}`, JSON.stringify(data));
      } catch (e) {}
    }

    clearPluginStorage(pluginId) {
      localStorage.removeItem(`bael_plugin_${pluginId}`);
    }

    loadEnabledPlugins() {
      try {
        this.enabled = new Set(
          JSON.parse(localStorage.getItem("bael_enabled_plugins")) || [],
        );
      } catch (e) {
        this.enabled = new Set();
      }
    }

    saveEnabledPlugins() {
      localStorage.setItem(
        "bael_enabled_plugins",
        JSON.stringify([...this.enabled]),
      );
    }

    createContainer() {
      const container = document.createElement("div");
      container.id = "bael-plugin-manager";
      container.className = "bael-plugin-manager";
      container.innerHTML = `
                <div class="plugin-manager-header">
                    <div class="plugin-manager-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                            <path d="M2 17l10 5 10-5"/>
                            <path d="M2 12l10 5 10-5"/>
                        </svg>
                        <span>Plugin Manager</span>
                    </div>
                    <div class="plugin-tabs">
                        <button class="plugin-tab active" data-tab="installed">Installed</button>
                        <button class="plugin-tab" data-tab="store">Store</button>
                        <button class="plugin-tab" data-tab="develop">Develop</button>
                    </div>
                    <button class="plugin-manager-close" id="plugin-manager-close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <div class="plugin-content">
                    <div class="plugin-panel active" id="panel-installed">
                        <div class="plugin-list" id="installed-plugins"></div>
                    </div>

                    <div class="plugin-panel" id="panel-store">
                        <div class="plugin-store-header">
                            <input type="text" placeholder="Search plugins..." id="plugin-search">
                        </div>
                        <div class="plugin-list" id="store-plugins">
                            <div class="store-placeholder">
                                <p>🏪 Plugin Store coming soon!</p>
                                <p>Create and share plugins with the community.</p>
                            </div>
                        </div>
                    </div>

                    <div class="plugin-panel" id="panel-develop">
                        <div class="develop-content">
                            <h3>Create Your Own Plugin</h3>
                            <div class="code-example">
                                <pre><code>// Register a plugin
BaelPluginSystem.registerPlugin({
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
    description: 'A custom plugin',
    author: 'Your Name',
    icon: '🚀',

    hooks: {
        onMessageSend: (data) => {
            console.log('Message:', data);
            return data;
        }
    },

    commands: [{
        id: 'hello',
        title: 'Say Hello',
        icon: '👋',
        action: () => alert('Hello!')
    }],

    settings: [{
        id: 'enabled',
        label: 'Enable Feature',
        type: 'toggle',
        default: true
    }],

    init: (api) => {
        api.log('Plugin initialized!');
    },

    destroy: () => {
        console.log('Plugin destroyed');
    }
});</code></pre>
                            </div>
                            <h4>Available Hooks</h4>
                            <div class="hooks-list" id="hooks-list"></div>
                        </div>
                    </div>
                </div>
            `;
      document.body.appendChild(container);
      this.container = container;

      this.updatePluginList();
      this.updateHooksList();
    }

    addStyles() {
      if (document.getElementById("bael-plugin-system-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-plugin-system-styles";
      styles.textContent = `
                .bael-plugin-manager {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 700px;
                    max-width: 90vw;
                    max-height: 80vh;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    box-shadow: 0 30px 100px rgba(0, 0, 0, 0.5);
                    z-index: 100015;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .bael-plugin-manager.visible {
                    display: flex;
                    animation: pluginSlideIn 0.3s ease;
                }

                @keyframes pluginSlideIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }

                .plugin-manager-header {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .plugin-manager-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .plugin-manager-title svg {
                    width: 22px;
                    height: 22px;
                    color: var(--bael-accent, #ff3366);
                }

                .plugin-tabs {
                    display: flex;
                    gap: 4px;
                    flex: 1;
                }

                .plugin-tab {
                    padding: 8px 16px;
                    background: transparent;
                    border: 1px solid transparent;
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .plugin-tab:hover {
                    color: var(--bael-text-primary, #fff);
                }

                .plugin-tab.active {
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .plugin-manager-close {
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .plugin-manager-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                .plugin-manager-close svg {
                    width: 18px;
                    height: 18px;
                }

                .plugin-content {
                    flex: 1;
                    overflow: hidden;
                }

                .plugin-panel {
                    display: none;
                    height: 100%;
                    overflow-y: auto;
                }

                .plugin-panel.active {
                    display: block;
                }

                .plugin-list {
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .plugin-card {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                    padding: 16px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    transition: all 0.2s ease;
                }

                .plugin-card:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .plugin-icon {
                    width: 48px;
                    height: 48px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    flex-shrink: 0;
                }

                .plugin-info {
                    flex: 1;
                    min-width: 0;
                }

                .plugin-name {
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 4px;
                }

                .plugin-meta {
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                    margin-bottom: 8px;
                }

                .plugin-description {
                    font-size: 13px;
                    color: var(--bael-text-secondary, #aaa);
                    line-height: 1.5;
                }

                .plugin-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .plugin-toggle {
                    position: relative;
                    width: 48px;
                    height: 24px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .plugin-toggle.enabled {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                }

                .plugin-toggle::after {
                    content: '';
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 18px;
                    height: 18px;
                    background: #fff;
                    border-radius: 50%;
                    transition: all 0.2s ease;
                }

                .plugin-toggle.enabled::after {
                    left: 26px;
                }

                .plugin-settings-btn {
                    padding: 6px 12px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-secondary, #aaa);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .plugin-settings-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: var(--bael-text-primary, #fff);
                }

                .no-plugins {
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--bael-text-muted, #666);
                }

                .plugin-store-header {
                    padding: 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                #plugin-search {
                    width: 100%;
                    padding: 10px 14px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 14px;
                    outline: none;
                }

                #plugin-search:focus {
                    border-color: var(--bael-accent, #ff3366);
                }

                .store-placeholder {
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--bael-text-muted, #666);
                }

                .store-placeholder p:first-child {
                    font-size: 24px;
                    margin-bottom: 8px;
                }

                .develop-content {
                    padding: 20px;
                }

                .develop-content h3 {
                    font-size: 18px;
                    color: var(--bael-text-primary, #fff);
                    margin: 0 0 16px 0;
                }

                .develop-content h4 {
                    font-size: 14px;
                    color: var(--bael-text-primary, #fff);
                    margin: 24px 0 12px 0;
                }

                .code-example {
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    overflow: hidden;
                }

                .code-example pre {
                    margin: 0;
                    padding: 16px;
                    overflow-x: auto;
                }

                .code-example code {
                    font-family: 'Monaco', 'Menlo', monospace;
                    font-size: 12px;
                    color: var(--bael-text-secondary, #aaa);
                    line-height: 1.6;
                }

                .hooks-list {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }

                .hook-item {
                    padding: 12px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                }

                .hook-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--bael-accent, #ff3366);
                    margin-bottom: 4px;
                    font-family: 'Monaco', 'Menlo', monospace;
                }

                .hook-desc {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }
            `;
      document.head.appendChild(styles);
    }

    bindEvents() {
      // Close
      this.container
        .querySelector("#plugin-manager-close")
        .addEventListener("click", () => this.close());

      // Tabs
      this.container.querySelectorAll(".plugin-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          this.container
            .querySelectorAll(".plugin-tab")
            .forEach((t) => t.classList.remove("active"));
          this.container
            .querySelectorAll(".plugin-panel")
            .forEach((p) => p.classList.remove("active"));
          tab.classList.add("active");
          this.container
            .querySelector(`#panel-${tab.dataset.tab}`)
            .classList.add("active");
        });
      });

      // Escape to close
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isVisible) {
          this.close();
        }
      });
    }

    updatePluginList() {
      const list = this.container.querySelector("#installed-plugins");

      if (this.plugins.size === 0) {
        list.innerHTML = `
                    <div class="no-plugins">
                        <p>No plugins installed</p>
                        <p>Check the Store or create your own!</p>
                    </div>
                `;
        return;
      }

      list.innerHTML = "";
      this.plugins.forEach((plugin, id) => {
        const card = document.createElement("div");
        card.className = "plugin-card";
        card.innerHTML = `
                    <div class="plugin-icon">${plugin.icon}</div>
                    <div class="plugin-info">
                        <div class="plugin-name">${plugin.name}</div>
                        <div class="plugin-meta">v${plugin.version} by ${plugin.author}</div>
                        <div class="plugin-description">${plugin.description}</div>
                    </div>
                    <div class="plugin-actions">
                        <div class="plugin-toggle ${plugin.enabled ? "enabled" : ""}" data-id="${id}"></div>
                        ${plugin.settings.length ? '<button class="plugin-settings-btn">Settings</button>' : ""}
                    </div>
                `;

        // Toggle handler
        card.querySelector(".plugin-toggle").addEventListener("click", (e) => {
          const toggle = e.target;
          const pluginId = toggle.dataset.id;

          if (toggle.classList.contains("enabled")) {
            this.disablePlugin(pluginId);
          } else {
            this.enablePlugin(pluginId);
          }
        });

        list.appendChild(card);
      });
    }

    updateHooksList() {
      const list = this.container.querySelector("#hooks-list");
      list.innerHTML = "";

      this.hooks.forEach((hook, name) => {
        const item = document.createElement("div");
        item.className = "hook-item";
        item.innerHTML = `
                    <div class="hook-name">${name}</div>
                    <div class="hook-desc">${hook.description}</div>
                `;
        list.appendChild(item);
      });
    }

    // Public API
    open() {
      this.isVisible = true;
      this.container.classList.add("visible");
      this.updatePluginList();
    }

    close() {
      this.isVisible = false;
      this.container.classList.remove("visible");
    }

    toggle() {
      if (this.isVisible) {
        this.close();
      } else {
        this.open();
      }
    }
  }

  // Initialize
  window.BaelPluginSystem = new BaelPluginSystem();

  // Register sample plugin for demonstration
  window.BaelPluginSystem.registerPlugin({
    id: "bael-demo-plugin",
    name: "Demo Plugin",
    version: "1.0.0",
    description:
      "A demonstration plugin showing the plugin system capabilities.",
    author: "Bael Team",
    icon: "🎯",

    hooks: {
      onUIReady: () => {
        console.log("Demo plugin: UI is ready!");
      },
    },

    commands: [
      {
        id: "demo-action",
        title: "Run Demo Action",
        icon: "🎯",
        action: () => {
          if (window.BaelNotifications) {
            window.BaelNotifications.success("Demo plugin action executed!");
          }
        },
      },
    ],

    settings: [],

    init: (api) => {
      api.log("Demo plugin initialized");
    },

    destroy: () => {
      console.log("Demo plugin destroyed");
    },
  });
})();
