/**
 * BAEL Router - Client-Side Navigation System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete routing system with:
 * - Hash-based and history API routing
 * - Route parameters and wildcards
 * - Guards and middleware
 * - Lazy loading routes
 * - Transitions and animations
 * - Breadcrumbs and navigation state
 */

(function () {
  "use strict";

  class BaelRouter {
    constructor() {
      this.routes = new Map();
      this.middleware = [];
      this.guards = [];
      this.currentRoute = null;
      this.previousRoute = null;
      this.params = {};
      this.query = {};
      this.history = [];
      this.maxHistory = 50;
      this.mode = "hash"; // 'hash' or 'history'
      this.base = "";
      this.notFoundHandler = null;
      this.transitioning = false;
      this.init();
    }

    init() {
      this.setupRoutes();
      this.bindEvents();
      this.navigate(this.getCurrentPath());
      console.log("🧭 Bael Router initialized");
    }

    // Setup default routes
    setupRoutes() {
      // Default routes for Bael
      this.register("/", {
        name: "home",
        title: "Home",
        handler: () => this.showView("chat"),
      });

      this.register("/chat", {
        name: "chat",
        title: "Chat",
        handler: () => this.showView("chat"),
      });

      this.register("/settings", {
        name: "settings",
        title: "Settings",
        handler: () => this.showView("settings"),
      });

      this.register("/knowledge", {
        name: "knowledge",
        title: "Knowledge",
        handler: () => this.showView("knowledge"),
      });

      this.register("/workflows", {
        name: "workflows",
        title: "Workflows",
        handler: () => this.showView("workflows"),
      });

      this.register("/personas", {
        name: "personas",
        title: "Personas",
        handler: () => this.showView("personas"),
      });

      // Dynamic route example
      this.register("/chat/:id", {
        name: "chat-session",
        title: "Chat Session",
        handler: (params) => this.loadChatSession(params.id),
      });

      // Catch-all for 404
      this.notFound(() => {
        console.warn("Route not found:", this.getCurrentPath());
        this.navigate("/");
      });
    }

    // Register a route
    register(path, options) {
      const route = {
        path,
        pattern: this.pathToRegex(path),
        paramNames: this.extractParamNames(path),
        name: options.name || path,
        title: options.title || "",
        handler: options.handler || (() => {}),
        guard: options.guard,
        meta: options.meta || {},
        lazy: options.lazy || null,
      };

      this.routes.set(path, route);
      return this;
    }

    // Convert path to regex
    pathToRegex(path) {
      const pattern = path
        .replace(/\//g, "\\/")
        .replace(/:([^\/]+)/g, "([^\\/]+)")
        .replace(/\*/g, ".*");

      return new RegExp(`^${pattern}$`);
    }

    // Extract parameter names from path
    extractParamNames(path) {
      const matches = path.match(/:([^\/]+)/g) || [];
      return matches.map((m) => m.slice(1));
    }

    // Get current path
    getCurrentPath() {
      if (this.mode === "hash") {
        return window.location.hash.slice(1) || "/";
      }
      return window.location.pathname.replace(this.base, "") || "/";
    }

    // Parse query string
    parseQuery(queryString) {
      const query = {};
      if (!queryString) return query;

      queryString
        .replace(/^\?/, "")
        .split("&")
        .forEach((pair) => {
          const [key, value] = pair.split("=");
          if (key) {
            query[decodeURIComponent(key)] = decodeURIComponent(value || "");
          }
        });

      return query;
    }

    // Find matching route
    findRoute(path) {
      for (const [routePath, route] of this.routes) {
        const match = path.match(route.pattern);
        if (match) {
          // Extract params
          const params = {};
          route.paramNames.forEach((name, index) => {
            params[name] = match[index + 1];
          });
          return { route, params };
        }
      }
      return null;
    }

    // Navigate to path
    async navigate(path, options = {}) {
      const { replace = false, silent = false, data = {} } = options;

      if (this.transitioning) {
        console.warn("Navigation already in progress");
        return false;
      }

      // Parse path and query
      const [pathname, queryString] = path.split("?");
      this.query = this.parseQuery(queryString);

      // Find matching route
      const result = this.findRoute(pathname);

      if (!result) {
        if (this.notFoundHandler) {
          this.notFoundHandler(pathname);
        }
        return false;
      }

      const { route, params } = result;
      this.params = params;

      // Run guards
      if (!(await this.runGuards(route, params))) {
        return false;
      }

      // Run middleware
      if (!(await this.runMiddleware(route, params))) {
        return false;
      }

      // Store previous route
      this.previousRoute = this.currentRoute;
      this.currentRoute = route;

      // Update history
      this.history.push({
        path,
        route: route.name,
        params,
        timestamp: new Date(),
      });

      while (this.history.length > this.maxHistory) {
        this.history.shift();
      }

      // Update URL
      if (!silent) {
        this.updateURL(path, replace);
      }

      // Update title
      if (route.title) {
        document.title = `${route.title} - Bael`;
      }

      // Transition animation
      this.transitioning = true;
      await this.transition(route, params, data);
      this.transitioning = false;

      // Dispatch event
      window.dispatchEvent(
        new CustomEvent("bael-route-changed", {
          detail: { route, params, path },
        }),
      );

      return true;
    }

    // Update browser URL
    updateURL(path, replace = false) {
      if (this.mode === "hash") {
        if (replace) {
          window.location.replace(`#${path}`);
        } else {
          window.location.hash = path;
        }
      } else {
        const url = this.base + path;
        if (replace) {
          window.history.replaceState({}, "", url);
        } else {
          window.history.pushState({}, "", url);
        }
      }
    }

    // Run route guards
    async runGuards(route, params) {
      // Route-specific guard
      if (route.guard) {
        const result = await route.guard({ route, params, router: this });
        if (result === false) return false;
        if (typeof result === "string") {
          this.navigate(result);
          return false;
        }
      }

      // Global guards
      for (const guard of this.guards) {
        const result = await guard({ route, params, router: this });
        if (result === false) return false;
        if (typeof result === "string") {
          this.navigate(result);
          return false;
        }
      }

      return true;
    }

    // Run middleware
    async runMiddleware(route, params) {
      for (const middleware of this.middleware) {
        try {
          await middleware({ route, params, router: this });
        } catch (error) {
          console.error("Middleware error:", error);
          return false;
        }
      }
      return true;
    }

    // Transition between routes
    async transition(route, params, data) {
      // Simple transition - can be enhanced with animations
      try {
        // Load lazy component if defined
        if (route.lazy) {
          await route.lazy();
        }

        // Execute handler
        await route.handler(params, data);
      } catch (error) {
        console.error("Route handler error:", error);
      }
    }

    // Show view (helper for view-based routing)
    showView(viewName) {
      // Hide all views
      document.querySelectorAll("[data-view]").forEach((el) => {
        el.style.display = "none";
      });

      // Show target view
      const view = document.querySelector(`[data-view="${viewName}"]`);
      if (view) {
        view.style.display = "";
      }

      // Update nav active state
      document.querySelectorAll("[data-route]").forEach((el) => {
        el.classList.toggle("active", el.dataset.route === viewName);
      });
    }

    // Load chat session (example dynamic route handler)
    async loadChatSession(id) {
      console.log("Loading chat session:", id);
      this.showView("chat");
      // Would load specific chat session data here
    }

    // Go back
    back() {
      if (this.history.length > 1) {
        this.history.pop(); // Remove current
        const previous = this.history[this.history.length - 1];
        if (previous) {
          this.navigate(previous.path, { replace: true });
        }
      } else {
        window.history.back();
      }
    }

    // Go forward
    forward() {
      window.history.forward();
    }

    // Add guard
    beforeEach(guard) {
      this.guards.push(guard);
      return () => {
        const index = this.guards.indexOf(guard);
        if (index > -1) this.guards.splice(index, 1);
      };
    }

    // Add middleware
    use(middleware) {
      this.middleware.push(middleware);
      return this;
    }

    // Set not found handler
    notFound(handler) {
      this.notFoundHandler = handler;
      return this;
    }

    // Get route by name
    getRoute(name) {
      for (const route of this.routes.values()) {
        if (route.name === name) return route;
      }
      return null;
    }

    // Generate path from route name and params
    generate(name, params = {}) {
      const route = this.getRoute(name);
      if (!route) return "/";

      let path = route.path;
      Object.entries(params).forEach(([key, value]) => {
        path = path.replace(`:${key}`, value);
      });

      return path;
    }

    // Get breadcrumbs
    getBreadcrumbs() {
      const breadcrumbs = [];
      const parts = this.getCurrentPath().split("/").filter(Boolean);
      let path = "";

      parts.forEach((part) => {
        path += "/" + part;
        const result = this.findRoute(path);
        if (result) {
          breadcrumbs.push({
            path,
            name: result.route.name,
            title: result.route.title,
          });
        }
      });

      return breadcrumbs;
    }

    // Bind events
    bindEvents() {
      // Hash change
      if (this.mode === "hash") {
        window.addEventListener("hashchange", () => {
          this.navigate(this.getCurrentPath(), { silent: true });
        });
      } else {
        // History popstate
        window.addEventListener("popstate", () => {
          this.navigate(this.getCurrentPath(), { silent: true });
        });
      }

      // Link clicks
      document.addEventListener("click", (e) => {
        const link = e.target.closest("a[data-link]");
        if (link) {
          e.preventDefault();
          const href = link.getAttribute("href");
          this.navigate(href);
        }
      });

      // Route buttons
      document.addEventListener("click", (e) => {
        const routeBtn = e.target.closest("[data-go]");
        if (routeBtn) {
          e.preventDefault();
          this.navigate(routeBtn.dataset.go);
        }
      });
    }

    // Public API
    get current() {
      return {
        route: this.currentRoute,
        params: this.params,
        query: this.query,
        path: this.getCurrentPath(),
      };
    }

    get previous() {
      return this.previousRoute;
    }
  }

  // Initialize
  window.BaelRouter = new BaelRouter();
})();
