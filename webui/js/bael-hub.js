/**
 * BAEL Integration Hub - Unified System Connector
 * Phase 7: Testing, Documentation & Performance
 *
 * Master integration layer:
 * - System orchestration
 * - Cross-system communication
 * - Initialization management
 * - Global state coordination
 * - Plugin registration
 * - Debug console
 */

(function () {
  "use strict";

  class BaelHub {
    constructor() {
      this.version = "7.0.0";
      this.systems = new Map();
      this.plugins = new Map();
      this.initQueue = [];
      this.initialized = false;
      this.startTime = performance.now();
      this.init();
    }

    init() {
      // Register core systems
      this.discoverSystems();

      // Initialize when DOM is ready
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.bootstrap());
      } else {
        this.bootstrap();
      }
    }

    // Discover and register existing systems
    discoverSystems() {
      const systemPrefixes = [
        "BaelCore",
        "BaelUI",
        "BaelWorkflows",
        "BaelPersonas",
        "BaelKnowledge",
        "BaelSettings",
        "BaelCommander",
        "BaelVoice",
        "BaelChat",
        "BaelSearch",
        "BaelTheme",
        "BaelContextMenu",
        "BaelMarkdown",
        "BaelCodeHighlight",
        "BaelSidebar",
        "BaelScroll",
        "BaelLazyImages",
        "BaelTooltips",
        "BaelFocusManager",
        "BaelInputValidator",
        "BaelHistory",
        "BaelCollapse",
        "BaelTabs",
        "BaelProgress",
        "BaelAvatar",
        "BaelBadge",
        "BaelEmpty",
        "BaelSkeleton",
        "BaelCards",
        "BaelList",
        "BaelDataTable",
        "BaelRichText",
        "BaelNotificationsPanel",
        "BaelActivityFeed",
        "BaelWidget",
        "BaelDashboard",
        "BaelMetrics",
        "BaelStats",
        "BaelCounters",
        "BaelSparkline",
        "BaelGauge",
        "BaelHeatmap",
        "BaelTreemap",
        "BaelFlowchart",
        "BaelMindmap",
        "BaelSlider",
        "BaelToggle",
        "BaelCheckbox",
        "BaelRadio",
        "BaelSelect",
        "BaelRating",
        "BaelTagInput",
        "BaelDatePicker",
        "BaelTimePicker",
        "BaelColorPicker",
        "BaelFilePicker",
        "BaelAutocomplete",
        "BaelPWA",
        "BaelServiceWorker",
        "BaelWebShare",
        "BaelBiometrics",
        "BaelVibration",
        "BaelDeviceMotion",
        "BaelBattery",
        "BaelPayments",
        "BaelPlugins",
        "BaelHooks",
        "BaelSandbox",
        "BaelWorkers",
        "BaelTemplates",
        "BaelThemeBuilder",
        "BaelWidgetFactory",
        "BaelCustomElements",
        "BaelErrorBoundary",
        "BaelLazyLoader",
        "BaelStateMachine",
        "BaelEventBus",
        "BaelFeatureFlags",
        "BaelTelemetry",
        "BaelDIContainer",
        "BaelMiddleware",
        "BaelConfigManager",
        "BaelRouter",
        "BaelCacheManager",
        "BaelAPIClient",
        "BaelFormValidator",
        "BaelLog",
        "BaelKeyboard",
        "BaelToast",
        "BaelModal",
        "BaelClipboard",
        "BaelStorage",
        "BaelNetwork",
        "BaelDragDrop",
        "BaelAnimate",
        "BaelTimer",
        "BaelDOM",
        "BaelColor",
        "BaelString",
        "BaelDateTime",
        "BaelAccessibility",
        "BaelPerformanceMonitor",
        "BaelDebugConsole",
        "BaelTestSuite",
        "BaelDocumentation",
        "BaelQuickStats",
        "BaelNotifications",
      ];

      systemPrefixes.forEach((name) => {
        if (window[name]) {
          this.systems.set(name, window[name]);
        }
      });
    }

    // Bootstrap all systems
    bootstrap() {
      this.processInitQueue();
      this.setupGlobalShortcuts();
      this.setupDebugMode();
      this.emitReady();
      this.initialized = true;

      const elapsed = (performance.now() - this.startTime).toFixed(2);
      console.log(
        `👑 Bael Hub v${this.version} ready in ${elapsed}ms with ${this.systems.size} systems`,
      );
    }

    // Process initialization queue
    processInitQueue() {
      this.initQueue.forEach((fn) => {
        try {
          fn();
        } catch (e) {
          console.error("Init queue error:", e);
        }
      });
      this.initQueue = [];
    }

    // Register a system
    register(name, instance, options = {}) {
      this.systems.set(name, instance);

      if (options.onReady) {
        this.onReady(options.onReady);
      }

      // Emit registration event
      window.dispatchEvent(
        new CustomEvent("bael:system:registered", {
          detail: { name, instance },
        }),
      );

      return instance;
    }

    // Get a system
    get(name) {
      return this.systems.get(name);
    }

    // Check if system exists
    has(name) {
      return this.systems.has(name);
    }

    // Get all systems
    getAll() {
      return Object.fromEntries(this.systems);
    }

    // Execute when ready
    onReady(callback) {
      if (this.initialized) {
        callback();
      } else {
        this.initQueue.push(callback);
      }
    }

    // Emit ready event
    emitReady() {
      window.dispatchEvent(
        new CustomEvent("bael:ready", {
          detail: {
            version: this.version,
            systems: Array.from(this.systems.keys()),
          },
        }),
      );
    }

    // Setup global shortcuts
    setupGlobalShortcuts() {
      // Master accessor
      window.$bael = (name) => (name ? this.get(name) : this);

      // System shortcuts (if not already defined)
      const shortcuts = {
        $eventBus: "BaelEventBus",
        $state: "BaelStateMachine",
        $di: "BaelDIContainer",
        $flags: "BaelFeatureFlags",
        $telemetry: "BaelTelemetry",
        $cache: "BaelCacheManager",
        $api: "BaelAPIClient",
        $router: "BaelRouter",
        $config: "BaelConfigManager",
        $keyboard: "BaelKeyboard",
        $toast: "BaelToast",
        $modal: "BaelModal",
        $clipboard: "BaelClipboard",
        $storage: "BaelStorage",
        $network: "BaelNetwork",
        $animate: "BaelAnimate",
        $timer: "BaelTimer",
        $dom: "BaelDOM",
        $color: "BaelColor",
        $str: "BaelString",
        $date: "BaelDateTime",
        $log: "BaelLog",
        $drag: "BaelDragDrop",
        $validator: "BaelFormValidator",
      };

      for (const [shortcut, systemName] of Object.entries(shortcuts)) {
        if (!window[shortcut]) {
          Object.defineProperty(window, shortcut, {
            get: () => this.systems.get(systemName),
          });
        }
      }
    }

    // Setup debug mode
    setupDebugMode() {
      // Check for debug flag
      const isDebug =
        localStorage.getItem("bael_debug") === "true" ||
        new URLSearchParams(window.location.search).has("debug");

      if (isDebug) {
        this.enableDebug();
      }
    }

    // Enable debug mode
    enableDebug() {
      window.BAEL_DEBUG = true;
      localStorage.setItem("bael_debug", "true");
      console.log("🔧 Bael Debug Mode enabled");
    }

    // Disable debug mode
    disableDebug() {
      window.BAEL_DEBUG = false;
      localStorage.removeItem("bael_debug");
      console.log("🔧 Bael Debug Mode disabled");
    }

    // ═══════════════════════════════════════════════════════════
    // PLUGIN SYSTEM
    // ═══════════════════════════════════════════════════════════

    // Register plugin
    registerPlugin(name, plugin) {
      if (this.plugins.has(name)) {
        console.warn(`Plugin ${name} already registered`);
        return false;
      }

      // Validate plugin
      if (!plugin.init || typeof plugin.init !== "function") {
        console.error(`Plugin ${name} must have an init method`);
        return false;
      }

      this.plugins.set(name, plugin);

      // Initialize if hub is ready
      if (this.initialized) {
        this.initializePlugin(name, plugin);
      }

      return true;
    }

    // Initialize plugin
    initializePlugin(name, plugin) {
      try {
        plugin.init(this);
        console.log(`📦 Plugin ${name} initialized`);
      } catch (e) {
        console.error(`Failed to initialize plugin ${name}:`, e);
      }
    }

    // Get plugin
    getPlugin(name) {
      return this.plugins.get(name);
    }

    // ═══════════════════════════════════════════════════════════
    // MESSAGING
    // ═══════════════════════════════════════════════════════════

    // Broadcast message to all systems
    broadcast(event, data) {
      window.dispatchEvent(new CustomEvent(`bael:${event}`, { detail: data }));

      // Also emit through EventBus if available
      if (this.systems.has("BaelEventBus")) {
        this.systems.get("BaelEventBus").emit(event, data);
      }
    }

    // Listen for messages
    listen(event, callback) {
      window.addEventListener(`bael:${event}`, (e) => callback(e.detail));
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    // Get system status
    status() {
      const systems = [];

      this.systems.forEach((instance, name) => {
        systems.push({
          name,
          status: "active",
          hasUI: typeof instance.createUI === "function",
          hasAPI: typeof instance.getAPI === "function",
        });
      });

      return {
        version: this.version,
        initialized: this.initialized,
        systemCount: this.systems.size,
        pluginCount: this.plugins.size,
        systems,
        uptime: performance.now() - this.startTime,
      };
    }

    // Health check
    async healthCheck() {
      const results = {
        hub: "healthy",
        systems: {},
        timestamp: new Date().toISOString(),
      };

      for (const [name, instance] of this.systems) {
        try {
          if (typeof instance.healthCheck === "function") {
            results.systems[name] = await instance.healthCheck();
          } else {
            results.systems[name] = "ok";
          }
        } catch (e) {
          results.systems[name] = `error: ${e.message}`;
        }
      }

      return results;
    }

    // Reset all systems
    async reset() {
      for (const [name, instance] of this.systems) {
        if (typeof instance.reset === "function") {
          try {
            await instance.reset();
          } catch (e) {
            console.error(`Failed to reset ${name}:`, e);
          }
        }
      }

      console.log("🔄 All systems reset");
    }

    // Export configuration
    exportConfig() {
      const config = {};

      for (const [name, instance] of this.systems) {
        if (typeof instance.exportConfig === "function") {
          config[name] = instance.exportConfig();
        } else if (typeof instance.getConfig === "function") {
          config[name] = instance.getConfig();
        }
      }

      return config;
    }

    // Import configuration
    async importConfig(config) {
      for (const [name, data] of Object.entries(config)) {
        const instance = this.systems.get(name);
        if (instance && typeof instance.importConfig === "function") {
          try {
            await instance.importConfig(data);
          } catch (e) {
            console.error(`Failed to import config for ${name}:`, e);
          }
        }
      }
    }

    // Create system diagnostic
    diagnose() {
      console.group("🔍 Bael System Diagnostic");
      console.log("Version:", this.version);
      console.log("Systems:", this.systems.size);
      console.log("Plugins:", this.plugins.size);
      console.log(
        "Uptime:",
        `${((performance.now() - this.startTime) / 1000).toFixed(2)}s`,
      );
      console.log("Memory:", this.getMemoryUsage());

      console.groupCollapsed("Registered Systems");
      this.systems.forEach((_, name) => console.log(`  ✓ ${name}`));
      console.groupEnd();

      if (this.plugins.size > 0) {
        console.groupCollapsed("Plugins");
        this.plugins.forEach((_, name) => console.log(`  📦 ${name}`));
        console.groupEnd();
      }

      console.groupEnd();
    }

    // Get memory usage
    getMemoryUsage() {
      if (performance.memory) {
        return {
          used:
            (performance.memory.usedJSHeapSize / 1048576).toFixed(2) + " MB",
          total:
            (performance.memory.totalJSHeapSize / 1048576).toFixed(2) + " MB",
        };
      }
      return "Not available";
    }

    // ═══════════════════════════════════════════════════════════
    // FEATURE FLAGS INTEGRATION
    // ═══════════════════════════════════════════════════════════

    // Check feature flag
    isFeatureEnabled(flag) {
      const featureFlags = this.systems.get("BaelFeatureFlags");
      return featureFlags ? featureFlags.isEnabled(flag) : true;
    }

    // ═══════════════════════════════════════════════════════════
    // TELEMETRY INTEGRATION
    // ═══════════════════════════════════════════════════════════

    // Track event
    track(event, data) {
      const telemetry = this.systems.get("BaelTelemetry");
      if (telemetry) {
        telemetry.track(event, data);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // QUICK ACTIONS
    // ═══════════════════════════════════════════════════════════

    // Show toast
    toast(message, type = "info") {
      const toastSystem = this.systems.get("BaelToast");
      if (toastSystem && typeof toastSystem[type] === "function") {
        return toastSystem[type](message);
      }
      console.log(`[${type.toUpperCase()}]`, message);
    }

    // Show modal
    modal(options) {
      const modalSystem = this.systems.get("BaelModal");
      if (modalSystem) {
        return modalSystem.create(options);
      }
      return Promise.resolve();
    }

    // Navigate
    navigate(path) {
      const router = this.systems.get("BaelRouter");
      if (router) {
        return router.navigate(path);
      }
      window.location.hash = path;
    }

    // Log
    log(level, ...args) {
      const logger = this.systems.get("BaelLog");
      if (logger && typeof logger[level] === "function") {
        logger[level](...args);
      } else {
        console[level]?.(...args) || console.log(...args);
      }
    }
  }

  // Initialize Hub
  window.BaelHub = new BaelHub();

  // Global accessor
  window.$bael = (name) => (name ? window.BaelHub.get(name) : window.BaelHub);
})();
