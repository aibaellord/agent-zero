/**
 * BAEL Dependency Injection Container - IoC Container
 * Phase 7: Testing, Documentation & Performance
 *
 * Full IoC container with:
 * - Service registration
 * - Singleton/transient scopes
 * - Factory functions
 * - Lazy initialization
 * - Dependency resolution
 * - Circular dependency detection
 * - Service locator pattern
 * - Auto-wiring
 */

(function () {
  "use strict";

  class BaelDIContainer {
    constructor() {
      this.services = new Map();
      this.singletons = new Map();
      this.factories = new Map();
      this.resolving = new Set();
      this.aliases = new Map();
      this.decorators = new Map();
      this.init();
    }

    init() {
      this.registerCoreServices();
      console.log("💉 Bael DI Container initialized");
    }

    // Register Core Services
    registerCoreServices() {
      // Register all Bael systems as services
      this.registerSingleton("eventBus", () => window.BaelEventBus);
      this.registerSingleton("featureFlags", () => window.BaelFeatureFlags);
      this.registerSingleton("stateMachine", () => window.BaelStateMachine);
      this.registerSingleton("errorBoundary", () => window.BaelErrorBoundary);
      this.registerSingleton("lazyLoader", () => window.BaelLazyLoader);
      this.registerSingleton("telemetry", () => window.BaelTelemetry);
      this.registerSingleton(
        "performanceMonitor",
        () => window.BaelPerformanceMonitor,
      );
      this.registerSingleton("testSuite", () => window.BaelTestSuite);
      this.registerSingleton("documentation", () => window.BaelDocumentation);
      this.registerSingleton("commandPalette", () => window.BaelCommandPalette);

      // Register Phase 6 services
      this.registerSingleton("workflowEngine", () => window.BaelWorkflowEngine);
      this.registerSingleton("pluginManager", () => window.BaelPluginManager);
      this.registerSingleton("knowledgeGraph", () => window.BaelKnowledgeGraph);
      this.registerSingleton("personaSystem", () => window.BaelPersonaSystem);
      this.registerSingleton(
        "sessionRecorder",
        () => window.BaelSessionRecorder,
      );
      this.registerSingleton("contextManager", () => window.BaelContextManager);
      this.registerSingleton("codeEditor", () => window.BaelCodeEditor);

      // Register Phase 5 services
      this.registerSingleton(
        "multiModelRouter",
        () => window.BaelMultiModelRouter,
      );
      this.registerSingleton("costTracker", () => window.BaelCostTracker);
      this.registerSingleton("scheduler", () => window.BaelScheduler);
      this.registerSingleton(
        "offlineController",
        () => window.BaelOfflineController,
      );
      this.registerSingleton(
        "analyticsDashboard",
        () => window.BaelAnalyticsDashboard,
      );

      // Aliases
      this.alias("events", "eventBus");
      this.alias("flags", "featureFlags");
      this.alias("fsm", "stateMachine");
      this.alias("errors", "errorBoundary");
      this.alias("perf", "performanceMonitor");
      this.alias("docs", "documentation");
      this.alias("cmd", "commandPalette");
    }

    // Register service with transient scope (new instance each time)
    register(name, factory, dependencies = []) {
      this.services.set(name, {
        factory,
        dependencies,
        scope: "transient",
      });
      return this;
    }

    // Register singleton service (same instance always)
    registerSingleton(name, factory, dependencies = []) {
      this.services.set(name, {
        factory,
        dependencies,
        scope: "singleton",
      });
      return this;
    }

    // Register instance directly
    registerInstance(name, instance) {
      this.singletons.set(name, instance);
      this.services.set(name, {
        factory: () => instance,
        dependencies: [],
        scope: "singleton",
      });
      return this;
    }

    // Register factory function
    registerFactory(name, factoryFn) {
      this.factories.set(name, factoryFn);
      return this;
    }

    // Create alias for service
    alias(aliasName, serviceName) {
      this.aliases.set(aliasName, serviceName);
      return this;
    }

    // Add decorator for service
    decorate(name, decorator) {
      if (!this.decorators.has(name)) {
        this.decorators.set(name, []);
      }
      this.decorators.get(name).push(decorator);
      return this;
    }

    // Resolve service
    resolve(name) {
      // Check alias
      const resolvedName = this.aliases.get(name) || name;

      // Check if we're in a circular resolution
      if (this.resolving.has(resolvedName)) {
        throw new Error(`Circular dependency detected: ${resolvedName}`);
      }

      // Check factory
      if (this.factories.has(resolvedName)) {
        return this.factories.get(resolvedName)(this);
      }

      // Check singleton cache
      if (this.singletons.has(resolvedName)) {
        return this.applyDecorators(
          resolvedName,
          this.singletons.get(resolvedName),
        );
      }

      // Get service definition
      const service = this.services.get(resolvedName);
      if (!service) {
        throw new Error(`Service not found: ${resolvedName}`);
      }

      // Mark as resolving
      this.resolving.add(resolvedName);

      try {
        // Resolve dependencies
        const deps = service.dependencies.map((dep) => this.resolve(dep));

        // Create instance
        let instance = service.factory(...deps);

        // Handle promise-based factories
        if (instance && typeof instance.then === "function") {
          return instance.then((resolved) => {
            if (service.scope === "singleton") {
              this.singletons.set(resolvedName, resolved);
            }
            return this.applyDecorators(resolvedName, resolved);
          });
        }

        // Cache singleton
        if (service.scope === "singleton") {
          this.singletons.set(resolvedName, instance);
        }

        return this.applyDecorators(resolvedName, instance);
      } finally {
        this.resolving.delete(resolvedName);
      }
    }

    // Apply decorators to instance
    applyDecorators(name, instance) {
      const decorators = this.decorators.get(name);
      if (!decorators || decorators.length === 0) {
        return instance;
      }

      return decorators.reduce((inst, decorator) => decorator(inst), instance);
    }

    // Try to resolve (returns null if not found)
    tryResolve(name) {
      try {
        return this.resolve(name);
      } catch (e) {
        return null;
      }
    }

    // Check if service is registered
    has(name) {
      const resolvedName = this.aliases.get(name) || name;
      return (
        this.services.has(resolvedName) || this.factories.has(resolvedName)
      );
    }

    // Get all registered service names
    getServiceNames() {
      return Array.from(this.services.keys());
    }

    // Get service info
    getServiceInfo(name) {
      const resolvedName = this.aliases.get(name) || name;
      const service = this.services.get(resolvedName);

      if (!service) return null;

      return {
        name: resolvedName,
        scope: service.scope,
        dependencies: service.dependencies,
        isSingleton: service.scope === "singleton",
        isInstantiated: this.singletons.has(resolvedName),
        hasDecorators: this.decorators.has(resolvedName),
      };
    }

    // Clear singleton cache
    clearSingletons() {
      this.singletons.clear();
    }

    // Remove service
    unregister(name) {
      this.services.delete(name);
      this.singletons.delete(name);
      this.factories.delete(name);
      this.decorators.delete(name);

      // Remove aliases pointing to this service
      this.aliases.forEach((target, alias) => {
        if (target === name) {
          this.aliases.delete(alias);
        }
      });
    }

    // Create child container
    createChild() {
      const child = new BaelDIContainer();
      child.parent = this;

      // Override resolve to check parent
      const originalResolve = child.resolve.bind(child);
      child.resolve = (name) => {
        try {
          return originalResolve(name);
        } catch (e) {
          if (this.has(name)) {
            return this.resolve(name);
          }
          throw e;
        }
      };

      return child;
    }

    // Inject dependencies into object
    inject(target, config = {}) {
      Object.entries(config).forEach(([prop, serviceName]) => {
        Object.defineProperty(target, prop, {
          get: () => this.resolve(serviceName),
          configurable: true,
        });
      });
      return target;
    }

    // Auto-wire class constructor
    autowire(ClassConstructor, ...additionalArgs) {
      const paramNames = this.getConstructorParams(ClassConstructor);
      const deps = paramNames.map((name) => this.tryResolve(name));
      return new ClassConstructor(...deps, ...additionalArgs);
    }

    // Get constructor parameter names (simple parser)
    getConstructorParams(fn) {
      const str = fn.toString();
      const match = str.match(/constructor\s*\(([^)]*)\)/);
      if (!match) return [];

      return match[1]
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p && !p.startsWith("..."));
    }

    // Debug info
    getDebugInfo() {
      const info = {
        services: {},
        singletons: Array.from(this.singletons.keys()),
        factories: Array.from(this.factories.keys()),
        aliases: Object.fromEntries(this.aliases),
      };

      this.services.forEach((service, name) => {
        info.services[name] = {
          scope: service.scope,
          dependencies: service.dependencies,
          instantiated: this.singletons.has(name),
        };
      });

      return info;
    }
  }

  // Create global container
  window.BaelDI = new BaelDIContainer();

  // Shorthand accessor
  window.$bael = (name) => window.BaelDI.resolve(name);
})();
