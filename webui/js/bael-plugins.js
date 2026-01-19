/**
 * BAEL Plugins - Plugin Architecture & Extension System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete plugin system:
 * - Plugin lifecycle management
 * - Hook system
 * - Extension points
 * - Hot reloading
 * - Sandboxing
 */

(function () {
  "use strict";

  class BaelPlugins {
    constructor() {
      this.plugins = new Map();
      this.hooks = new Map();
      this.extensions = new Map();
      this.middlewares = new Map();
      this.config = {};
      console.log("🔌 Bael Plugins initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // PLUGIN REGISTRATION
    // ═══════════════════════════════════════════════════════════

    register(plugin) {
      if (!plugin.name) {
        throw new Error("Plugin must have a name");
      }

      if (this.plugins.has(plugin.name)) {
        console.warn(`Plugin "${plugin.name}" is already registered`);
        return this;
      }

      const pluginInstance = {
        name: plugin.name,
        version: plugin.version || "1.0.0",
        description: plugin.description || "",
        author: plugin.author || "",
        dependencies: plugin.dependencies || [],
        hooks: plugin.hooks || {},
        extensions: plugin.extensions || {},
        install: plugin.install,
        uninstall: plugin.uninstall,
        enabled: false,
        config: plugin.config || {},
        state: {},
      };

      this.plugins.set(plugin.name, pluginInstance);

      return this;
    }

    unregister(name) {
      const plugin = this.plugins.get(name);
      if (plugin) {
        if (plugin.enabled) {
          this.disable(name);
        }
        this.plugins.delete(name);
      }
      return this;
    }

    // ═══════════════════════════════════════════════════════════
    // PLUGIN LIFECYCLE
    // ═══════════════════════════════════════════════════════════

    async enable(name, options = {}) {
      const plugin = this.plugins.get(name);
      if (!plugin) {
        throw new Error(`Plugin "${name}" not found`);
      }

      if (plugin.enabled) {
        return this;
      }

      // Check dependencies
      for (const dep of plugin.dependencies) {
        const depPlugin = this.plugins.get(dep);
        if (!depPlugin) {
          throw new Error(`Missing dependency: ${dep}`);
        }
        if (!depPlugin.enabled) {
          await this.enable(dep);
        }
      }

      // Install hooks
      for (const [hookName, handler] of Object.entries(plugin.hooks)) {
        this.addHook(hookName, handler, name);
      }

      // Install extensions
      for (const [extName, extension] of Object.entries(plugin.extensions)) {
        this.addExtension(extName, extension, name);
      }

      // Call install
      if (plugin.install) {
        await plugin.install({
          plugin,
          options: { ...plugin.config, ...options },
          bael: window.Bael,
        });
      }

      plugin.enabled = true;
      plugin.config = { ...plugin.config, ...options };

      this.runHook("plugin:enabled", { plugin: name });

      return this;
    }

    async disable(name) {
      const plugin = this.plugins.get(name);
      if (!plugin || !plugin.enabled) {
        return this;
      }

      // Check if other plugins depend on this one
      for (const [pName, p] of this.plugins) {
        if (p.enabled && p.dependencies.includes(name)) {
          throw new Error(`Cannot disable: "${pName}" depends on "${name}"`);
        }
      }

      // Call uninstall
      if (plugin.uninstall) {
        await plugin.uninstall({ plugin, bael: window.Bael });
      }

      // Remove hooks
      for (const hookName of Object.keys(plugin.hooks)) {
        this.removeHook(hookName, name);
      }

      // Remove extensions
      for (const extName of Object.keys(plugin.extensions)) {
        this.removeExtension(extName, name);
      }

      plugin.enabled = false;

      this.runHook("plugin:disabled", { plugin: name });

      return this;
    }

    async reload(name) {
      await this.disable(name);
      await this.enable(name);
      return this;
    }

    // ═══════════════════════════════════════════════════════════
    // HOOKS
    // ═══════════════════════════════════════════════════════════

    addHook(name, handler, source = "anonymous") {
      if (!this.hooks.has(name)) {
        this.hooks.set(name, []);
      }

      this.hooks.get(name).push({
        handler,
        source,
        priority: handler.priority || 10,
      });

      // Sort by priority
      this.hooks.get(name).sort((a, b) => a.priority - b.priority);

      return this;
    }

    removeHook(name, source) {
      const hooks = this.hooks.get(name);
      if (hooks) {
        this.hooks.set(
          name,
          hooks.filter((h) => h.source !== source),
        );
      }
      return this;
    }

    async runHook(name, data = {}) {
      const hooks = this.hooks.get(name) || [];
      let result = data;

      for (const { handler } of hooks) {
        const hookResult = await handler(result);
        if (hookResult !== undefined) {
          result = hookResult;
        }
      }

      return result;
    }

    runHookSync(name, data = {}) {
      const hooks = this.hooks.get(name) || [];
      let result = data;

      for (const { handler } of hooks) {
        const hookResult = handler(result);
        if (hookResult !== undefined) {
          result = hookResult;
        }
      }

      return result;
    }

    hasHook(name) {
      return this.hooks.has(name) && this.hooks.get(name).length > 0;
    }

    getHooks(name) {
      return this.hooks.get(name) || [];
    }

    // ═══════════════════════════════════════════════════════════
    // EXTENSIONS
    // ═══════════════════════════════════════════════════════════

    addExtension(name, extension, source = "anonymous") {
      if (!this.extensions.has(name)) {
        this.extensions.set(name, []);
      }

      this.extensions.get(name).push({
        extension,
        source,
      });

      return this;
    }

    removeExtension(name, source) {
      const extensions = this.extensions.get(name);
      if (extensions) {
        this.extensions.set(
          name,
          extensions.filter((e) => e.source !== source),
        );
      }
      return this;
    }

    getExtensions(name) {
      return (this.extensions.get(name) || []).map((e) => e.extension);
    }

    // ═══════════════════════════════════════════════════════════
    // MIDDLEWARE
    // ═══════════════════════════════════════════════════════════

    addMiddleware(name, middleware, source = "anonymous") {
      if (!this.middlewares.has(name)) {
        this.middlewares.set(name, []);
      }

      this.middlewares.get(name).push({
        middleware,
        source,
      });

      return this;
    }

    async runMiddleware(name, context) {
      const middlewares = this.middlewares.get(name) || [];

      const compose = (index) => {
        if (index >= middlewares.length) {
          return Promise.resolve();
        }

        const { middleware } = middlewares[index];
        return Promise.resolve(middleware(context, () => compose(index + 1)));
      };

      return compose(0);
    }

    // ═══════════════════════════════════════════════════════════
    // PLUGIN QUERIES
    // ═══════════════════════════════════════════════════════════

    get(name) {
      return this.plugins.get(name);
    }

    has(name) {
      return this.plugins.has(name);
    }

    isEnabled(name) {
      const plugin = this.plugins.get(name);
      return plugin?.enabled || false;
    }

    list() {
      return [...this.plugins.values()];
    }

    listEnabled() {
      return this.list().filter((p) => p.enabled);
    }

    listDisabled() {
      return this.list().filter((p) => !p.enabled);
    }

    // ═══════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════

    configure(name, options) {
      const plugin = this.plugins.get(name);
      if (plugin) {
        plugin.config = { ...plugin.config, ...options };

        // Notify plugin of config change
        this.runHook("plugin:configured", {
          plugin: name,
          config: plugin.config,
        });
      }
      return this;
    }

    getConfig(name) {
      return this.plugins.get(name)?.config || {};
    }

    // ═══════════════════════════════════════════════════════════
    // PLUGIN CREATION HELPERS
    // ═══════════════════════════════════════════════════════════

    createPlugin(options) {
      return {
        name: options.name,
        version: options.version || "1.0.0",
        description: options.description || "",
        author: options.author || "",
        dependencies: options.dependencies || [],
        config: options.config || {},
        hooks: options.hooks || {},
        extensions: options.extensions || {},

        install:
          options.install ||
          (async ({ plugin, options, bael }) => {
            if (options.setup) {
              await options.setup(bael, plugin);
            }
          }),

        uninstall:
          options.uninstall ||
          (async ({ plugin, bael }) => {
            if (options.teardown) {
              await options.teardown(bael, plugin);
            }
          }),
      };
    }

    // ═══════════════════════════════════════════════════════════
    // SANDBOX
    // ═══════════════════════════════════════════════════════════

    createSandbox(name) {
      const sandbox = {
        hooks: new Map(),
        extensions: new Map(),
        state: {},

        addHook: (hookName, handler) => {
          this.addHook(hookName, handler, name);
          sandbox.hooks.set(hookName, handler);
        },

        removeHook: (hookName) => {
          this.removeHook(hookName, name);
          sandbox.hooks.delete(hookName);
        },

        addExtension: (extName, extension) => {
          this.addExtension(extName, extension, name);
          sandbox.extensions.set(extName, extension);
        },

        removeExtension: (extName) => {
          this.removeExtension(extName, name);
          sandbox.extensions.delete(extName);
        },

        setState: (key, value) => {
          sandbox.state[key] = value;
        },

        getState: (key) => sandbox.state[key],

        cleanup: () => {
          sandbox.hooks.forEach((_, hookName) => {
            this.removeHook(hookName, name);
          });
          sandbox.extensions.forEach((_, extName) => {
            this.removeExtension(extName, name);
          });
          sandbox.hooks.clear();
          sandbox.extensions.clear();
          sandbox.state = {};
        },
      };

      return sandbox;
    }

    // ═══════════════════════════════════════════════════════════
    // BATCH OPERATIONS
    // ═══════════════════════════════════════════════════════════

    async enableAll() {
      const sorted = this.topologicalSort();
      for (const name of sorted) {
        await this.enable(name);
      }
      return this;
    }

    async disableAll() {
      const sorted = this.topologicalSort().reverse();
      for (const name of sorted) {
        if (this.isEnabled(name)) {
          await this.disable(name);
        }
      }
      return this;
    }

    topologicalSort() {
      const visited = new Set();
      const result = [];

      const visit = (name) => {
        if (visited.has(name)) return;
        visited.add(name);

        const plugin = this.plugins.get(name);
        if (plugin) {
          for (const dep of plugin.dependencies) {
            visit(dep);
          }
          result.push(name);
        }
      };

      for (const name of this.plugins.keys()) {
        visit(name);
      }

      return result;
    }

    // ═══════════════════════════════════════════════════════════
    // STATS
    // ═══════════════════════════════════════════════════════════

    stats() {
      return {
        total: this.plugins.size,
        enabled: this.listEnabled().length,
        disabled: this.listDisabled().length,
        hooks: this.hooks.size,
        extensions: this.extensions.size,
        middlewares: this.middlewares.size,
      };
    }
  }

  // Initialize
  window.BaelPlugins = new BaelPlugins();

  // Global shortcuts
  window.$plugins = window.BaelPlugins;

  console.log("🔌 Bael Plugins ready");
})();
