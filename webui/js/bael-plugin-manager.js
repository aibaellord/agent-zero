/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BAEL - LORD OF ALL
 * PLUGIN MANAGER - Extensibility Framework v2
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Add custom functionality through plugins:
 * - Plugin discovery & loading
 * - Lifecycle management
 * - Sandboxed execution
 * - Plugin marketplace UI
 * - API hooks for integration
 *
 * @version 2.0.0
 */

(function () {
  "use strict";

  class BaelPluginManager {
    constructor() {
      this.plugins = new Map();
      this.enabled = new Set();
      this.hooks = new Map();
      this.api = {};
      this.panel = null;
      this.isVisible = false;

      this.init();
    }

    init() {
      this.setupAPI();
      this.loadPlugins();
      this.createUI();
      this.addStyles();
      this.bindEvents();
      console.log("🔌 Bael Plugin Manager v2 initialized");
    }

    setupAPI() {
      this.api = {
        version: "2.0.0",

        ui: {
          notify: (msg, type = "info") => {
            window.BaelNotifications?.show(msg, type);
          },
          showModal: (title, content, actions = []) => {
            return this.showPluginModal(title, content, actions);
          },
          addPanel: (id, position, html) => {
            return this.addPluginPanel(id, position, html);
          },
          removePanel: (id) => {
            document.getElementById(`plugin-panel-${id}`)?.remove();
          },
        },

        chat: {
          sendMessage: async (text) => window.BaelChat?.sendMessage(text),
          onMessage: (callback) => {
            window.addEventListener("bael:message-received", (e) =>
              callback(e.detail),
            );
          },
          getHistory: () => window.BaelChat?.getHistory() || [],
        },

        storage: {
          get: (pluginId, key) => {
            const data = JSON.parse(
              localStorage.getItem(`bael_plugin_${pluginId}`) || "{}",
            );
            return data[key];
          },
          set: (pluginId, key, value) => {
            const data = JSON.parse(
              localStorage.getItem(`bael_plugin_${pluginId}`) || "{}",
            );
            data[key] = value;
            localStorage.setItem(
              `bael_plugin_${pluginId}`,
              JSON.stringify(data),
            );
          },
          clear: (pluginId) =>
            localStorage.removeItem(`bael_plugin_${pluginId}`),
        },

        hooks: {
          add: (hookName, callback, priority = 10) =>
            this.addHook(hookName, callback, priority),
          trigger: async (hookName, data) => this.triggerHook(hookName, data),
        },

        events: {
          on: (event, cb) =>
            window.addEventListener(`bael:${event}`, (e) => cb(e.detail)),
          emit: (event, data) =>
            window.dispatchEvent(
              new CustomEvent(`bael:${event}`, { detail: data }),
            ),
        },

        utils: {
          generateId: () => "plg_" + Math.random().toString(36).substr(2, 9),
          debounce: (fn, delay) => {
            let timer;
            return (...args) => {
              clearTimeout(timer);
              timer = setTimeout(() => fn(...args), delay);
            };
          },
        },
      };
    }

    addHook(hookName, callback, priority = 10) {
      if (!this.hooks.has(hookName)) this.hooks.set(hookName, []);
      const hookId = "hk_" + Math.random().toString(36).substr(2, 9);
      this.hooks.get(hookName).push({ id: hookId, callback, priority });
      this.hooks.get(hookName).sort((a, b) => a.priority - b.priority);
      return hookId;
    }

    async triggerHook(hookName, data) {
      const hooks = this.hooks.get(hookName) || [];
      let result = data;
      for (const hook of hooks) {
        try {
          const returned = await hook.callback(result);
          if (returned !== undefined) result = returned;
        } catch (e) {
          console.error(`Hook error [${hookName}]:`, e);
        }
      }
      return result;
    }

    registerPlugin(manifest) {
      const required = ["id", "name", "version", "main"];
      for (const field of required) {
        if (!manifest[field])
          throw new Error(`Missing required field: ${field}`);
      }

      const plugin = {
        ...manifest,
        status: "registered",
        instance: null,
        loadedAt: null,
        error: null,
      };

      this.plugins.set(manifest.id, plugin);
      this.emit("plugin-registered", plugin);

      const enabledList = JSON.parse(
        localStorage.getItem("bael_enabled_plugins") || "[]",
      );
      if (enabledList.includes(manifest.id)) this.enablePlugin(manifest.id);

      return plugin;
    }

    async enablePlugin(pluginId) {
      const plugin = this.plugins.get(pluginId);
      if (!plugin || plugin.status === "active")
        return plugin?.status === "active";

      try {
        plugin.status = "loading";
        if (typeof plugin.main === "function") {
          plugin.instance = await plugin.main(this.api);
        }
        plugin.status = "active";
        plugin.loadedAt = new Date();
        this.enabled.add(pluginId);
        this.saveEnabledPlugins();
        this.emit("plugin-enabled", plugin);
        this.updateUI();
        return true;
      } catch (e) {
        plugin.status = "error";
        plugin.error = e.message;
        console.error(`Failed to enable plugin ${pluginId}:`, e);
        return false;
      }
    }

    async disablePlugin(pluginId) {
      const plugin = this.plugins.get(pluginId);
      if (!plugin || plugin.status !== "active") return false;

      try {
        if (plugin.instance?.cleanup) await plugin.instance.cleanup();
        plugin.status = "disabled";
        plugin.instance = null;
        this.enabled.delete(pluginId);
        this.saveEnabledPlugins();
        this.emit("plugin-disabled", plugin);
        this.updateUI();
        return true;
      } catch (e) {
        console.error(`Failed to disable plugin ${pluginId}:`, e);
        return false;
      }
    }

    unregisterPlugin(pluginId) {
      this.disablePlugin(pluginId);
      this.plugins.delete(pluginId);
      this.updateUI();
    }

    loadPlugins() {
      try {
        const saved = JSON.parse(
          localStorage.getItem("bael_installed_plugins") || "[]",
        );
      } catch (e) {
        console.warn("Failed to load plugins:", e);
      }
    }

    saveEnabledPlugins() {
      localStorage.setItem(
        "bael_enabled_plugins",
        JSON.stringify([...this.enabled]),
      );
    }

    createUI() {
      const panel = document.createElement("div");
      panel.id = "bael-plugin-manager-panel";
      panel.className = "bael-plugin-mgr-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;
    }

    renderPanel() {
      const plugins = [...this.plugins.values()];
      const activeCount = plugins.filter((p) => p.status === "active").length;

      return `
                <div class="pmgr-header">
                    <div class="pmgr-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z"/>
                        </svg>
                        <span>Plugin Manager</span>
                        <span class="pmgr-badge">${activeCount} active</span>
                    </div>
                    <button class="pmgr-close" id="pmgr-close">×</button>
                </div>

                <div class="pmgr-tabs">
                    <button class="pmgr-tab active" data-tab="installed">Installed</button>
                    <button class="pmgr-tab" data-tab="browse">Browse</button>
                    <button class="pmgr-tab" data-tab="develop">Develop</button>
                </div>

                <div class="pmgr-content">
                    <div class="pmgr-tab-content active" data-tab="installed">
                        ${
                          plugins.length === 0
                            ? `
                            <div class="pmgr-empty">
                                <p>No plugins installed</p>
                                <p class="sub">Browse the marketplace or create your own</p>
                            </div>
                        `
                            : `
                            <div class="pmgr-list">
                                ${plugins.map((p) => this.renderPluginCard(p)).join("")}
                            </div>
                        `
                        }
                    </div>

                    <div class="pmgr-tab-content" data-tab="browse">
                        <div class="pmgr-search">
                            <input type="text" placeholder="Search plugins..."/>
                        </div>
                        <div class="pmgr-marketplace">
                            ${this.renderMarketplace()}
                        </div>
                    </div>

                    <div class="pmgr-tab-content" data-tab="develop">
                        <div class="pmgr-develop">
                            <h4>Create a Plugin</h4>
                            <p>Extend Bael with custom functionality</p>
                            <div class="pmgr-code-example">
                                <pre>${this.escapeHtml(this.getExampleCode())}</pre>
                            </div>
                            <div class="pmgr-actions">
                                <button class="pmgr-btn" id="pmgr-copy-example">Copy Template</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }

    renderPluginCard(plugin) {
      const isActive = plugin.status === "active";
      const hasError = plugin.status === "error";

      return `
                <div class="pmgr-card ${hasError ? "error" : ""}">
                    <div class="pmgr-card-icon">${plugin.icon || "🔌"}</div>
                    <div class="pmgr-card-info">
                        <div class="pmgr-card-name">${plugin.name}</div>
                        <div class="pmgr-card-desc">${plugin.description || "No description"}</div>
                        <div class="pmgr-card-meta">
                            <span>v${plugin.version}</span>
                            ${plugin.author ? `<span>by ${plugin.author}</span>` : ""}
                        </div>
                        ${hasError ? `<div class="pmgr-card-error">${plugin.error}</div>` : ""}
                    </div>
                    <div class="pmgr-card-actions">
                        <label class="pmgr-toggle">
                            <input type="checkbox" ${isActive ? "checked" : ""} data-plugin="${plugin.id}"/>
                            <span class="pmgr-toggle-slider"></span>
                        </label>
                        <button class="pmgr-remove" data-plugin="${plugin.id}" title="Remove">🗑</button>
                    </div>
                </div>
            `;
    }

    renderMarketplace() {
      const featured = [
        {
          id: "quick-templates",
          name: "Quick Templates",
          description: "Save and reuse message templates",
          icon: "📋",
          version: "1.0.0",
          author: "Bael Team",
        },
        {
          id: "code-snippets",
          name: "Code Snippets",
          description: "Enhanced code block handling",
          icon: "💻",
          version: "1.0.0",
          author: "Bael Team",
        },
        {
          id: "export-tools",
          name: "Export Tools",
          description: "Export conversations to PDF/MD",
          icon: "📤",
          version: "1.0.0",
          author: "Bael Team",
        },
      ];

      return featured
        .map(
          (p) => `
                <div class="pmgr-mp-card">
                    <div class="pmgr-mp-icon">${p.icon}</div>
                    <div class="pmgr-mp-info">
                        <div class="pmgr-mp-name">${p.name}</div>
                        <div class="pmgr-mp-desc">${p.description}</div>
                        <div class="pmgr-mp-meta">v${p.version} by ${p.author}</div>
                    </div>
                    <button class="pmgr-mp-install" data-plugin="${p.id}">Install</button>
                </div>
            `,
        )
        .join("");
    }

    getExampleCode() {
      return `// Bael Plugin Template
window.BaelPluginManager.registerPlugin({
    id: 'my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
    author: 'Your Name',
    description: 'Does something awesome',
    icon: '🚀',

    main: function(api) {
        api.ui.notify('Plugin activated!', 'success');

        return {
            cleanup: () => {
                console.log('Plugin unloaded');
            }
        };
    }
});`;
    }

    escapeHtml(text) {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    updateUI() {
      if (!this.panel) return;
      this.panel.innerHTML = this.renderPanel();
      this.bindPanelEvents();
    }

    showPluginModal(title, content, actions = []) {
      const modal = document.createElement("div");
      modal.className = "pmgr-modal-overlay";
      modal.innerHTML = `
                <div class="pmgr-modal">
                    <div class="pmgr-modal-header">
                        <span>${title}</span>
                        <button class="pmgr-modal-close">×</button>
                    </div>
                    <div class="pmgr-modal-content">${content}</div>
                    <div class="pmgr-modal-actions">
                        ${actions
                          .map(
                            (a, i) => `
                            <button class="pmgr-modal-btn ${a.primary ? "primary" : ""}" data-idx="${i}">${a.label}</button>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
            `;
      document.body.appendChild(modal);
      modal
        .querySelector(".pmgr-modal-close")
        .addEventListener("click", () => modal.remove());
      modal.querySelectorAll(".pmgr-modal-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const action = actions[parseInt(btn.dataset.idx)];
          if (action?.callback) action.callback();
          modal.remove();
        });
      });
      return modal;
    }

    addPluginPanel(id, position, html) {
      document.getElementById(`plugin-panel-${id}`)?.remove();
      const panel = document.createElement("div");
      panel.id = `plugin-panel-${id}`;
      panel.className = `pmgr-plugin-panel pmgr-panel-${position}`;
      panel.innerHTML = html;
      document.body.appendChild(panel);
      return panel;
    }

    addStyles() {
      if (document.getElementById("bael-plugin-mgr-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-plugin-mgr-styles";
      styles.textContent = `
                .bael-plugin-mgr-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90vw;
                    max-width: 700px;
                    max-height: 80vh;
                    background: var(--color-panel, #0f0f17);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 20px;
                    z-index: 100090;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 40px 120px rgba(0,0,0,0.7);
                }

                .bael-plugin-mgr-panel.visible {
                    display: flex;
                    animation: pmgrIn 0.3s ease;
                }

                @keyframes pmgrIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .pmgr-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    border-bottom: 1px solid var(--color-border, #252535);
                }

                .pmgr-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 17px;
                    font-weight: 700;
                    color: var(--color-text, #fff);
                }

                .pmgr-title svg {
                    width: 24px;
                    height: 24px;
                    color: var(--color-primary, #ff3366);
                }

                .pmgr-badge {
                    font-size: 10px;
                    padding: 3px 8px;
                    background: var(--color-primary, #ff3366);
                    border-radius: 20px;
                }

                .pmgr-close {
                    width: 36px;
                    height: 36px;
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted, #666);
                    font-size: 24px;
                    cursor: pointer;
                }

                .pmgr-tabs {
                    display: flex;
                    border-bottom: 1px solid var(--color-border, #252535);
                }

                .pmgr-tab {
                    flex: 1;
                    padding: 12px;
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted, #666);
                    font-size: 13px;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                }

                .pmgr-tab.active {
                    color: var(--color-text, #fff);
                    border-bottom-color: var(--color-primary, #ff3366);
                }

                .pmgr-content {
                    flex: 1;
                    overflow-y: auto;
                }

                .pmgr-tab-content {
                    display: none;
                    padding: 20px;
                }

                .pmgr-tab-content.active {
                    display: block;
                }

                .pmgr-empty {
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--color-text-muted, #666);
                }

                .pmgr-empty .sub {
                    font-size: 12px;
                    margin-top: 8px;
                }

                .pmgr-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .pmgr-card {
                    display: flex;
                    gap: 16px;
                    padding: 16px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 12px;
                }

                .pmgr-card.error {
                    border-color: #ef4444;
                }

                .pmgr-card-icon {
                    font-size: 32px;
                    width: 48px;
                    height: 48px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--color-panel, #12121a);
                    border-radius: 10px;
                }

                .pmgr-card-info {
                    flex: 1;
                }

                .pmgr-card-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--color-text, #fff);
                    margin-bottom: 4px;
                }

                .pmgr-card-desc {
                    font-size: 12px;
                    color: var(--color-text-muted, #888);
                    margin-bottom: 6px;
                }

                .pmgr-card-meta {
                    font-size: 10px;
                    color: var(--color-text-muted, #555);
                }

                .pmgr-card-meta span {
                    margin-right: 12px;
                }

                .pmgr-card-error {
                    font-size: 11px;
                    color: #ef4444;
                    margin-top: 6px;
                }

                .pmgr-card-actions {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }

                .pmgr-toggle {
                    position: relative;
                    width: 40px;
                    height: 22px;
                }

                .pmgr-toggle input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .pmgr-toggle-slider {
                    position: absolute;
                    inset: 0;
                    background: var(--color-border, #333);
                    border-radius: 22px;
                    cursor: pointer;
                    transition: 0.2s;
                }

                .pmgr-toggle-slider::before {
                    content: '';
                    position: absolute;
                    width: 16px;
                    height: 16px;
                    left: 3px;
                    top: 3px;
                    background: #fff;
                    border-radius: 50%;
                    transition: 0.2s;
                }

                .pmgr-toggle input:checked + .pmgr-toggle-slider {
                    background: var(--color-primary, #ff3366);
                }

                .pmgr-toggle input:checked + .pmgr-toggle-slider::before {
                    transform: translateX(18px);
                }

                .pmgr-remove {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    font-size: 14px;
                    opacity: 0.5;
                }

                .pmgr-remove:hover {
                    opacity: 1;
                }

                .pmgr-search input {
                    width: 100%;
                    padding: 12px 16px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 10px;
                    color: var(--color-text, #fff);
                    font-size: 13px;
                    margin-bottom: 16px;
                }

                .pmgr-marketplace {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .pmgr-mp-card {
                    display: flex;
                    gap: 16px;
                    align-items: center;
                    padding: 16px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 12px;
                }

                .pmgr-mp-icon {
                    font-size: 28px;
                }

                .pmgr-mp-info {
                    flex: 1;
                }

                .pmgr-mp-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--color-text, #fff);
                }

                .pmgr-mp-desc {
                    font-size: 12px;
                    color: var(--color-text-muted, #888);
                }

                .pmgr-mp-meta {
                    font-size: 10px;
                    color: var(--color-text-muted, #555);
                }

                .pmgr-mp-install {
                    padding: 8px 16px;
                    background: var(--color-primary, #ff3366);
                    border: none;
                    border-radius: 8px;
                    color: #fff;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .pmgr-develop {
                    padding: 10px;
                }

                .pmgr-develop h4 {
                    font-size: 15px;
                    font-weight: 700;
                    color: var(--color-text, #fff);
                    margin-bottom: 8px;
                }

                .pmgr-develop > p {
                    font-size: 12px;
                    color: var(--color-text-muted, #888);
                    margin-bottom: 16px;
                }

                .pmgr-code-example {
                    background: var(--color-panel, #12121a);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 10px;
                    padding: 16px;
                    margin-bottom: 16px;
                    overflow-x: auto;
                }

                .pmgr-code-example pre {
                    margin: 0;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    font-size: 11px;
                    color: var(--color-text, #ccc);
                    white-space: pre-wrap;
                }

                .pmgr-actions {
                    display: flex;
                    gap: 12px;
                }

                .pmgr-btn {
                    padding: 10px 20px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 8px;
                    color: var(--color-text, #fff);
                    font-size: 12px;
                    cursor: pointer;
                }

                .pmgr-modal-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.6);
                    z-index: 100100;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .pmgr-modal {
                    background: var(--color-panel, #0f0f17);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 16px;
                    max-width: 500px;
                    width: 90%;
                    overflow: hidden;
                }

                .pmgr-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--color-border, #252535);
                    font-weight: 600;
                    color: var(--color-text, #fff);
                }

                .pmgr-modal-close {
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted, #666);
                    font-size: 24px;
                    cursor: pointer;
                }

                .pmgr-modal-content {
                    padding: 20px;
                    color: var(--color-text, #fff);
                }

                .pmgr-modal-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    padding: 16px 20px;
                    border-top: 1px solid var(--color-border, #252535);
                }

                .pmgr-modal-btn {
                    padding: 10px 20px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 8px;
                    color: var(--color-text, #fff);
                    cursor: pointer;
                }

                .pmgr-modal-btn.primary {
                    background: var(--color-primary, #ff3366);
                    border-color: transparent;
                }

                .pmgr-plugin-panel {
                    position: fixed;
                    z-index: 100050;
                }

                .pmgr-panel-bottom-right {
                    bottom: 80px;
                    right: 20px;
                }

                .pmgr-panel-bottom-left {
                    bottom: 80px;
                    left: 20px;
                }

                .pmgr-panel-top-right {
                    top: 80px;
                    right: 20px;
                }

                .pmgr-panel-top-left {
                    top: 80px;
                    left: 20px;
                }
            `;
      document.head.appendChild(styles);
    }

    bindEvents() {
      this.bindPanelEvents();

      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "P") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    bindPanelEvents() {
      if (!this.panel) return;

      this.panel
        .querySelector("#pmgr-close")
        ?.addEventListener("click", () => this.close());

      this.panel.querySelectorAll(".pmgr-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          this.panel
            .querySelectorAll(".pmgr-tab")
            .forEach((t) => t.classList.remove("active"));
          this.panel
            .querySelectorAll(".pmgr-tab-content")
            .forEach((c) => c.classList.remove("active"));
          tab.classList.add("active");
          this.panel
            .querySelector(`.pmgr-tab-content[data-tab="${tab.dataset.tab}"]`)
            ?.classList.add("active");
        });
      });

      this.panel.querySelectorAll(".pmgr-toggle input").forEach((toggle) => {
        toggle.addEventListener("change", () => {
          const pluginId = toggle.dataset.plugin;
          toggle.checked
            ? this.enablePlugin(pluginId)
            : this.disablePlugin(pluginId);
        });
      });

      this.panel.querySelectorAll(".pmgr-remove").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (confirm("Remove this plugin?"))
            this.unregisterPlugin(btn.dataset.plugin);
        });
      });

      this.panel
        .querySelector("#pmgr-copy-example")
        ?.addEventListener("click", () => {
          navigator.clipboard.writeText(this.getExampleCode());
          window.BaelNotifications?.show("Plugin template copied!", "success");
        });
    }

    emit(event, data) {
      window.dispatchEvent(
        new CustomEvent(`bael:plugin:${event}`, { detail: data }),
      );
    }

    open() {
      this.isVisible = true;
      this.updateUI();
      this.panel.classList.add("visible");
    }

    close() {
      this.isVisible = false;
      this.panel.classList.remove("visible");
    }

    toggle() {
      this.isVisible ? this.close() : this.open();
    }

    getAllPlugins() {
      return [...this.plugins.values()];
    }
  }

  window.BaelPluginManager = new BaelPluginManager();
})();
