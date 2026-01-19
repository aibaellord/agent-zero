/**
 * BAEL SDK - Unified Framework Interface
 * Phase 7: Testing, Documentation & Performance
 *
 * The unified entry point for all Bael systems:
 * - Single namespace access
 * - Lazy loading support
 * - Feature detection
 * - Version management
 * - Plugin architecture
 */

(function () {
  "use strict";

  const VERSION = "1.0.0";
  const BUILD = "2024.01";

  class BaelSDK {
    constructor() {
      this.version = VERSION;
      this.build = BUILD;
      this.initialized = false;
      this.plugins = new Map();
      this.features = new Map();
      this.config = {};

      // Bind core systems
      this.bindCoreSystems();

      console.log(`🌟 Bael SDK v${VERSION} initialized`);
    }

    // ═══════════════════════════════════════════════════════════
    // CORE SYSTEM BINDINGS
    // ═══════════════════════════════════════════════════════════

    bindCoreSystems() {
      // Core Framework
      this.defineLazy("core", () => window.BaelCore);
      this.defineLazy("dom", () => window.BaelDOM);
      this.defineLazy("events", () => window.BaelEvents);
      this.defineLazy("state", () => window.BaelState);

      // UI Components
      this.defineLazy("components", () => window.BaelComponents);
      this.defineLazy("modal", () => window.BaelModal);
      this.defineLazy("toast", () => window.BaelToast);
      this.defineLazy("animate", () => window.BaelAnimate);

      // Data & State
      this.defineLazy("store", () => window.BaelStore);
      this.defineLazy("storage", () => window.BaelStorage);
      this.defineLazy("cache", () => window.BaelCacheManager);
      this.defineLazy("query", () => window.BaelQuery);

      // Networking
      this.defineLazy("http", () => window.BaelHttp);
      this.defineLazy("socket", () => window.BaelSocket);
      this.defineLazy("api", () => window.BaelApiClient);

      // Navigation
      this.defineLazy("router", () => window.BaelRouter);

      // Utilities
      this.defineLazy("math", () => window.BaelMath);
      this.defineLazy("string", () => window.BaelString);
      this.defineLazy("datetime", () => window.BaelDateTime);
      this.defineLazy("color", () => window.BaelColor);
      this.defineLazy("object", () => window.BaelObject);

      // Validation
      this.defineLazy("validate", () => window.BaelValidate);
      this.defineLazy("schema", () => window.BaelSchema);

      // Security
      this.defineLazy("crypto", () => window.BaelCrypto);

      // Testing
      this.defineLazy("test", () => window.BaelTest);

      // Performance
      this.defineLazy("perf", () => window.BaelPerformance);
      this.defineLazy("worker", () => window.BaelWorker);

      // Development
      this.defineLazy("debug", () => window.BaelDebug);
      this.defineLazy("docs", () => window.BaelDocs);
      this.defineLazy("logger", () => window.BaelLogger);

      // Internationalization
      this.defineLazy("i18n", () => window.BaelI18n);

      // Accessibility
      this.defineLazy("a11y", () => window.BaelA11y);

      // Media
      this.defineLazy("media", () => window.BaelMedia);

      // Geolocation
      this.defineLazy("geo", () => window.BaelGeo);

      // Scheduling
      this.defineLazy("scheduler", () => window.BaelScheduler);

      // History
      this.defineLazy("history", () => window.BaelHistory);

      // Hub
      this.defineLazy("hub", () => window.BaelHub);

      // Keyboard
      this.defineLazy("keyboard", () => window.BaelKeyboardManager);

      // Clipboard
      this.defineLazy("clipboard", () => window.BaelClipboard);

      // Timer
      this.defineLazy("timer", () => window.BaelTimer);

      // Drag & Drop
      this.defineLazy("dragdrop", () => window.BaelDragDrop);

      // Network Monitor
      this.defineLazy("network", () => window.BaelNetworkMonitor);

      // Bundle
      this.defineLazy("bundle", () => window.BaelBundle);

      // Form Validator
      this.defineLazy("form", () => window.BaelFormValidator);

      // Config Manager
      this.defineLazy("config", () => window.BaelConfigManager);

      // Feature Flags
      this.defineLazy("flags", () => window.BaelFeatureFlags);

      // Error Boundary
      this.defineLazy("errors", () => window.BaelErrorBoundary);

      // Lazy Loader
      this.defineLazy("lazy", () => window.BaelLazyLoader);

      // State Machine
      this.defineLazy("machine", () => window.BaelStateMachine);

      // Event Bus
      this.defineLazy("bus", () => window.BaelEventBus);

      // DI Container
      this.defineLazy("di", () => window.BaelDI);

      // Middleware
      this.defineLazy("middleware", () => window.BaelMiddleware);

      // Telemetry
      this.defineLazy("telemetry", () => window.BaelTelemetry);
    }

    defineLazy(name, getter) {
      Object.defineProperty(this, name, {
        get: () => {
          const value = getter();
          if (!value) {
            console.warn(`Bael.${name} is not available`);
          }
          return value;
        },
        configurable: true,
      });
    }

    // ═══════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════

    async init(config = {}) {
      if (this.initialized) return this;

      this.config = { ...this.config, ...config };

      // Wait for DOM
      if (document.readyState === "loading") {
        await new Promise((r) =>
          document.addEventListener("DOMContentLoaded", r),
        );
      }

      // Initialize core systems
      await this.initializeSystems(config);

      this.initialized = true;
      this.emit("initialized");

      console.log("🌟 Bael SDK fully initialized");

      return this;
    }

    async initializeSystems(config) {
      // Initialize in order
      const systems = [
        "core",
        "events",
        "state",
        "store",
        "router",
        "components",
        "hub",
      ];

      for (const name of systems) {
        const system = this[name];
        if (system?.init) {
          await system.init(config[name] || {});
        }
      }
    }

    // ═══════════════════════════════════════════════════════════
    // PLUGIN SYSTEM
    // ═══════════════════════════════════════════════════════════

    use(plugin, options = {}) {
      if (typeof plugin === "function") {
        plugin = plugin(this, options);
      }

      if (plugin.name) {
        this.plugins.set(plugin.name, plugin);
      }

      if (plugin.install) {
        plugin.install(this, options);
      }

      return this;
    }

    getPlugin(name) {
      return this.plugins.get(name);
    }

    hasPlugin(name) {
      return this.plugins.has(name);
    }

    // ═══════════════════════════════════════════════════════════
    // FEATURE DETECTION
    // ═══════════════════════════════════════════════════════════

    hasFeature(name) {
      if (this.features.has(name)) {
        return this.features.get(name);
      }

      const checks = {
        serviceWorker: "serviceWorker" in navigator,
        webWorker: typeof Worker !== "undefined",
        sharedWorker: typeof SharedWorker !== "undefined",
        indexedDB: "indexedDB" in window,
        localStorage: "localStorage" in window,
        sessionStorage: "sessionStorage" in window,
        webSocket: "WebSocket" in window,
        fetch: "fetch" in window,
        promise: typeof Promise !== "undefined",
        proxy: typeof Proxy !== "undefined",
        symbol: typeof Symbol !== "undefined",
        map: typeof Map !== "undefined",
        set: typeof Set !== "undefined",
        weakMap: typeof WeakMap !== "undefined",
        weakSet: typeof WeakSet !== "undefined",
        geolocation: "geolocation" in navigator,
        notifications: "Notification" in window,
        bluetooth: "bluetooth" in navigator,
        usb: "usb" in navigator,
        webGL: this.checkWebGL(),
        webAudio: "AudioContext" in window || "webkitAudioContext" in window,
        webRTC: "RTCPeerConnection" in window,
        webXR: "xr" in navigator,
        crypto: "crypto" in window && "subtle" in window.crypto,
        clipboard: "clipboard" in navigator,
        share: "share" in navigator,
        vibrate: "vibrate" in navigator,
        battery: "getBattery" in navigator,
        mediaDevices: "mediaDevices" in navigator,
        speechRecognition:
          "SpeechRecognition" in window || "webkitSpeechRecognition" in window,
        speechSynthesis: "speechSynthesis" in window,
        intersectionObserver: "IntersectionObserver" in window,
        mutationObserver: "MutationObserver" in window,
        resizeObserver: "ResizeObserver" in window,
        performanceObserver: "PerformanceObserver" in window,
        customElements: "customElements" in window,
        shadowDOM: "attachShadow" in Element.prototype,
        modules: "noModule" in HTMLScriptElement.prototype,
        cssGrid: CSS.supports("display", "grid"),
        cssVariables: CSS.supports("--test", "0"),
        containerQueries: CSS.supports("container-type", "inline-size"),
        touch: "ontouchstart" in window,
        pointer: "PointerEvent" in window,
        gamepad: "getGamepads" in navigator,
      };

      const result = checks[name] ?? false;
      this.features.set(name, result);
      return result;
    }

    checkWebGL() {
      try {
        const canvas = document.createElement("canvas");
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext("webgl") ||
            canvas.getContext("experimental-webgl"))
        );
      } catch {
        return false;
      }
    }

    getFeatures() {
      const all = [
        "serviceWorker",
        "webWorker",
        "sharedWorker",
        "indexedDB",
        "localStorage",
        "sessionStorage",
        "webSocket",
        "fetch",
        "promise",
        "proxy",
        "symbol",
        "map",
        "set",
        "weakMap",
        "weakSet",
        "geolocation",
        "notifications",
        "bluetooth",
        "usb",
        "webGL",
        "webAudio",
        "webRTC",
        "webXR",
        "crypto",
        "clipboard",
        "share",
        "vibrate",
        "battery",
        "mediaDevices",
        "speechRecognition",
        "speechSynthesis",
        "intersectionObserver",
        "mutationObserver",
        "resizeObserver",
        "performanceObserver",
        "customElements",
        "shadowDOM",
        "modules",
        "cssGrid",
        "cssVariables",
        "containerQueries",
        "touch",
        "pointer",
        "gamepad",
      ];

      const result = {};
      all.forEach((name) => {
        result[name] = this.hasFeature(name);
      });
      return result;
    }

    // ═══════════════════════════════════════════════════════════
    // EVENTS
    // ═══════════════════════════════════════════════════════════

    on(event, handler) {
      if (!this._events) this._events = new Map();
      if (!this._events.has(event)) this._events.set(event, new Set());
      this._events.get(event).add(handler);
      return () => this.off(event, handler);
    }

    off(event, handler) {
      this._events?.get(event)?.delete(handler);
    }

    emit(event, data) {
      this._events?.get(event)?.forEach((fn) => fn(data));
    }

    once(event, handler) {
      const wrapped = (data) => {
        this.off(event, wrapped);
        handler(data);
      };
      return this.on(event, wrapped);
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    // Get all available systems
    getSystems() {
      const systems = [];
      const baelPattern = /^Bael/;

      for (const key in window) {
        if (baelPattern.test(key)) {
          systems.push(key);
        }
      }

      return systems.sort();
    }

    // Check system availability
    hasSystem(name) {
      return !!window[`Bael${name}`] || !!this[name.toLowerCase()];
    }

    // Get framework info
    info() {
      return {
        version: this.version,
        build: this.build,
        systems: this.getSystems().length,
        plugins: this.plugins.size,
        initialized: this.initialized,
        features: this.getFeatures(),
      };
    }

    // Print banner
    banner() {
      console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    ██████╗  █████╗ ███████╗██╗                              ║
║    ██╔══██╗██╔══██╗██╔════╝██║                              ║
║    ██████╔╝███████║█████╗  ██║                              ║
║    ██╔══██╗██╔══██║██╔══╝  ██║                              ║
║    ██████╔╝██║  ██║███████╗███████╗                         ║
║    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝                         ║
║                                                              ║
║    Lord Of All - Enterprise Framework                       ║
║    Version: ${this.version.padEnd(48)}║
║    Systems: ${String(this.getSystems().length).padEnd(47)}║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
            `);
    }

    // Quick helpers
    ready(fn) {
      if (this.initialized) {
        fn(this);
      } else {
        this.once("initialized", () => fn(this));
      }
    }

    // Create element helper
    createElement(tag, props = {}, ...children) {
      const el = document.createElement(tag);

      Object.entries(props).forEach(([key, value]) => {
        if (key.startsWith("on")) {
          el.addEventListener(key.slice(2).toLowerCase(), value);
        } else if (key === "style" && typeof value === "object") {
          Object.assign(el.style, value);
        } else if (key === "className") {
          el.className = value;
        } else {
          el.setAttribute(key, value);
        }
      });

      children.flat().forEach((child) => {
        if (typeof child === "string") {
          el.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
          el.appendChild(child);
        }
      });

      return el;
    }
  }

  // Initialize SDK
  window.Bael = new BaelSDK();

  // Global shortcuts
  window.$bael = window.Bael;
  window.$el = (tag, props, ...children) =>
    window.Bael.createElement(tag, props, ...children);

  // Auto-initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.Bael.init();
    });
  } else {
    window.Bael.init();
  }

  console.log("🌟 Bael SDK loaded");
})();
