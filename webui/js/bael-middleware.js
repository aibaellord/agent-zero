/**
 * BAEL Middleware - Request/Response Pipeline
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete middleware system with:
 * - Request/response interception
 * - Pipeline composition
 * - Middleware ordering
 * - Error handling middleware
 * - Async middleware support
 * - Context passing
 * - Short-circuit capability
 * - Built-in middleware library
 */

(function () {
  "use strict";

  class BaelMiddleware {
    constructor() {
      this.pipelines = new Map();
      this.globalMiddleware = [];
      this.errorHandlers = [];
      this.init();
    }

    init() {
      this.registerBuiltinMiddleware();
      this.createDefaultPipelines();
      console.log("🔗 Bael Middleware initialized");
    }

    // Create Pipeline
    createPipeline(name) {
      const pipeline = new MiddlewarePipeline(name);
      this.pipelines.set(name, pipeline);
      return pipeline;
    }

    // Get Pipeline
    getPipeline(name) {
      return this.pipelines.get(name);
    }

    // Add global middleware (runs on all pipelines)
    useGlobal(middleware, priority = 0) {
      this.globalMiddleware.push({ middleware, priority });
      this.globalMiddleware.sort((a, b) => b.priority - a.priority);
    }

    // Add error handler
    onError(handler) {
      this.errorHandlers.push(handler);
    }

    // Execute pipeline
    async execute(pipelineName, context = {}) {
      const pipeline = this.pipelines.get(pipelineName);
      if (!pipeline) {
        throw new Error(`Pipeline not found: ${pipelineName}`);
      }

      // Merge global middleware
      const allMiddleware = [
        ...this.globalMiddleware.map((m) => m.middleware),
        ...pipeline.middleware.map((m) => m.fn),
      ];

      // Create execution context
      const ctx = {
        ...context,
        pipelineName,
        timestamp: new Date(),
        aborted: false,
        data: {},
        errors: [],
      };

      try {
        // Execute middleware chain
        await this.executeChain(allMiddleware, ctx);
        return ctx;
      } catch (error) {
        ctx.errors.push(error);
        await this.handleError(error, ctx);
        throw error;
      }
    }

    // Execute middleware chain
    async executeChain(middleware, ctx) {
      let index = 0;

      const next = async () => {
        if (ctx.aborted) return;
        if (index >= middleware.length) return;

        const current = middleware[index++];

        try {
          await current(ctx, next);
        } catch (error) {
          ctx.errors.push(error);
          throw error;
        }
      };

      await next();
    }

    // Handle error
    async handleError(error, ctx) {
      for (const handler of this.errorHandlers) {
        try {
          await handler(error, ctx);
        } catch (e) {
          console.error("Error handler failed:", e);
        }
      }
    }

    // Register Built-in Middleware
    registerBuiltinMiddleware() {
      // Logging middleware
      this.builtins = {
        logging:
          (options = {}) =>
          async (ctx, next) => {
            const start = Date.now();
            console.log(
              `[Middleware] Starting: ${ctx.pipelineName}`,
              options.verbose ? ctx : "",
            );

            await next();

            const duration = Date.now() - start;
            console.log(
              `[Middleware] Completed: ${ctx.pipelineName} (${duration}ms)`,
            );
          },

        timing: () => async (ctx, next) => {
          ctx.data.startTime = performance.now();
          await next();
          ctx.data.endTime = performance.now();
          ctx.data.duration = ctx.data.endTime - ctx.data.startTime;
        },

        retry:
          (options = { maxRetries: 3, delay: 1000 }) =>
          async (ctx, next) => {
            let attempts = 0;
            let lastError;

            while (attempts < options.maxRetries) {
              try {
                await next();
                return;
              } catch (error) {
                lastError = error;
                attempts++;
                if (attempts < options.maxRetries) {
                  await new Promise((r) =>
                    setTimeout(r, options.delay * attempts),
                  );
                }
              }
            }

            throw lastError;
          },

        cache: (options = { ttl: 60000 }) => {
          const cache = new Map();

          return async (ctx, next) => {
            const key = ctx.cacheKey || JSON.stringify(ctx.request);
            const cached = cache.get(key);

            if (cached && Date.now() - cached.timestamp < options.ttl) {
              ctx.data.fromCache = true;
              ctx.response = cached.response;
              return;
            }

            await next();

            if (ctx.response && !ctx.errors.length) {
              cache.set(key, {
                response: ctx.response,
                timestamp: Date.now(),
              });
            }
          };
        },

        validate: (schema) => async (ctx, next) => {
          if (schema && ctx.request) {
            const errors = [];

            Object.entries(schema).forEach(([field, rules]) => {
              const value = ctx.request[field];

              if (rules.required && (value === undefined || value === null)) {
                errors.push(`${field} is required`);
              }

              if (rules.type && typeof value !== rules.type) {
                errors.push(`${field} must be of type ${rules.type}`);
              }

              if (rules.minLength && value?.length < rules.minLength) {
                errors.push(
                  `${field} must be at least ${rules.minLength} characters`,
                );
              }
            });

            if (errors.length) {
              ctx.validationErrors = errors;
              throw new Error("Validation failed: " + errors.join(", "));
            }
          }

          await next();
        },

        rateLimit: (options = { maxRequests: 100, window: 60000 }) => {
          const requests = [];

          return async (ctx, next) => {
            const now = Date.now();

            // Clean old requests
            while (requests.length && requests[0] < now - options.window) {
              requests.shift();
            }

            if (requests.length >= options.maxRequests) {
              ctx.rateLimited = true;
              throw new Error("Rate limit exceeded");
            }

            requests.push(now);
            await next();
          };
        },

        transform: (transformFn) => async (ctx, next) => {
          await next();
          if (ctx.response) {
            ctx.response = transformFn(ctx.response);
          }
        },

        timeout:
          (ms = 5000) =>
          async (ctx, next) => {
            const timeoutPromise = new Promise((_, reject) => {
              setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
            });

            await Promise.race([next(), timeoutPromise]);
          },

        auth:
          (options = {}) =>
          async (ctx, next) => {
            const token = ctx.request?.token || ctx.headers?.authorization;

            if (options.required && !token) {
              throw new Error("Authentication required");
            }

            if (token && options.validate) {
              ctx.user = await options.validate(token);
            }

            await next();
          },

        cors:
          (options = {}) =>
          async (ctx, next) => {
            ctx.headers = ctx.headers || {};
            ctx.headers["Access-Control-Allow-Origin"] = options.origin || "*";
            ctx.headers["Access-Control-Allow-Methods"] =
              options.methods || "GET, POST, PUT, DELETE";
            ctx.headers["Access-Control-Allow-Headers"] =
              options.headers || "Content-Type, Authorization";

            await next();
          },
      };
    }

    // Create Default Pipelines
    createDefaultPipelines() {
      // API request pipeline
      this.createPipeline("api-request")
        .use(this.builtins.timing())
        .use(this.builtins.logging({ verbose: false }));

      // Chat message pipeline
      this.createPipeline("chat-message")
        .use(this.builtins.timing())
        .use(
          this.builtins.validate({
            message: { required: true, type: "string", minLength: 1 },
          }),
        );

      // File upload pipeline
      this.createPipeline("file-upload")
        .use(this.builtins.timing())
        .use(this.builtins.rateLimit({ maxRequests: 10, window: 60000 }));
    }

    // Get builtin middleware
    getBuiltin(name) {
      return this.builtins[name];
    }

    // Compose multiple middleware into one
    compose(...middlewares) {
      return async (ctx, next) => {
        let index = -1;

        const dispatch = async (i) => {
          if (i <= index) {
            throw new Error("next() called multiple times");
          }
          index = i;

          const fn = i < middlewares.length ? middlewares[i] : next;
          if (!fn) return;

          await fn(ctx, () => dispatch(i + 1));
        };

        await dispatch(0);
      };
    }
  }

  // Pipeline Class
  class MiddlewarePipeline {
    constructor(name) {
      this.name = name;
      this.middleware = [];
    }

    use(fn, options = {}) {
      const { priority = 0, name = fn.name || "anonymous" } = options;

      this.middleware.push({ fn, priority, name });
      this.middleware.sort((a, b) => b.priority - a.priority);

      return this;
    }

    remove(name) {
      this.middleware = this.middleware.filter((m) => m.name !== name);
      return this;
    }

    clear() {
      this.middleware = [];
      return this;
    }

    getMiddleware() {
      return this.middleware.map((m) => ({
        name: m.name,
        priority: m.priority,
      }));
    }

    async execute(context = {}) {
      return window.BaelMiddleware.execute(this.name, context);
    }
  }

  // Initialize
  window.BaelMiddleware = new BaelMiddleware();
})();
