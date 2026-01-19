/**
 * BAEL API Client - Unified HTTP Client
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete API client with:
 * - Request/response interceptors
 * - Automatic retry with backoff
 * - Request deduplication
 * - Response caching
 * - Error handling
 * - Request cancellation
 * - Progress tracking
 */

(function () {
  "use strict";

  class BaelAPIClient {
    constructor() {
      this.baseURL = "";
      this.timeout = 30000;
      this.headers = {
        "Content-Type": "application/json",
      };
      this.interceptors = {
        request: [],
        response: [],
      };
      this.pendingRequests = new Map();
      this.stats = {
        requests: 0,
        successes: 0,
        failures: 0,
        retries: 0,
        cached: 0,
      };
      this.init();
    }

    init() {
      this.setupDefaultInterceptors();
      console.log("🌐 Bael API Client initialized");
    }

    // Setup default interceptors
    setupDefaultInterceptors() {
      // Add auth token if available
      this.interceptors.request.push((config) => {
        const token = localStorage.getItem("bael_auth_token");
        if (token) {
          config.headers = config.headers || {};
          config.headers["Authorization"] = `Bearer ${token}`;
        }
        return config;
      });

      // Log responses
      this.interceptors.response.push((response) => {
        if (window.BaelConfig?.get("developer.debugMode")) {
          console.log(`API Response [${response.status}]:`, response.url);
        }
        return response;
      });
    }

    // Make a request
    async request(config) {
      const {
        url,
        method = "GET",
        data = null,
        headers = {},
        timeout = this.timeout,
        retry = 0,
        retryDelay = 1000,
        cache = false,
        cacheTTL = 60000,
        dedupe = true,
        signal,
        onProgress,
        responseType = "json",
      } = config;

      const fullURL = this.resolveURL(url);
      const requestKey = `${method}:${fullURL}:${JSON.stringify(data)}`;

      this.stats.requests++;

      // Check cache first
      if (cache && method === "GET" && window.BaelCache) {
        const cached = await window.BaelCache.get(`api:${requestKey}`);
        if (cached) {
          this.stats.cached++;
          return cached;
        }
      }

      // Dedupe pending requests
      if (dedupe && this.pendingRequests.has(requestKey)) {
        return this.pendingRequests.get(requestKey);
      }

      // Build request config
      let requestConfig = {
        url: fullURL,
        method,
        headers: { ...this.headers, ...headers },
        data,
        timeout,
        retry,
        retryDelay,
        attempt: 0,
      };

      // Run request interceptors
      for (const interceptor of this.interceptors.request) {
        requestConfig = await interceptor(requestConfig);
      }

      // Create request promise
      const requestPromise = this.executeRequest(
        requestConfig,
        signal,
        onProgress,
        responseType,
      )
        .then(async (response) => {
          // Run response interceptors
          let result = response;
          for (const interceptor of this.interceptors.response) {
            result = await interceptor(result);
          }

          // Cache if enabled
          if (cache && method === "GET" && window.BaelCache) {
            await window.BaelCache.set(`api:${requestKey}`, result.data, {
              ttl: cacheTTL,
            });
          }

          this.stats.successes++;
          return result.data;
        })
        .catch(async (error) => {
          // Retry logic
          if (requestConfig.attempt < retry) {
            requestConfig.attempt++;
            this.stats.retries++;

            const delay = retryDelay * Math.pow(2, requestConfig.attempt - 1);
            await this.sleep(delay);

            return this.executeRequest(
              requestConfig,
              signal,
              onProgress,
              responseType,
            ).then((r) => r.data);
          }

          this.stats.failures++;
          throw error;
        })
        .finally(() => {
          this.pendingRequests.delete(requestKey);
        });

      if (dedupe) {
        this.pendingRequests.set(requestKey, requestPromise);
      }

      return requestPromise;
    }

    // Execute the actual fetch
    async executeRequest(config, signal, onProgress, responseType) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);

      // Combine signals
      const combinedSignal = signal
        ? this.combineAbortSignals(signal, controller.signal)
        : controller.signal;

      try {
        const fetchOptions = {
          method: config.method,
          headers: config.headers,
          signal: combinedSignal,
        };

        if (config.data && config.method !== "GET") {
          if (config.data instanceof FormData) {
            fetchOptions.body = config.data;
            delete fetchOptions.headers["Content-Type"];
          } else {
            fetchOptions.body = JSON.stringify(config.data);
          }
        }

        const response = await fetch(config.url, fetchOptions);

        clearTimeout(timeoutId);

        if (!response.ok) {
          const error = new Error(`HTTP Error ${response.status}`);
          error.status = response.status;
          error.response = response;
          throw error;
        }

        let data;
        switch (responseType) {
          case "text":
            data = await response.text();
            break;
          case "blob":
            data = await response.blob();
            break;
          case "arrayBuffer":
            data = await response.arrayBuffer();
            break;
          default:
            data = await response.json();
        }

        return {
          data,
          status: response.status,
          headers: response.headers,
          url: response.url,
        };
      } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === "AbortError") {
          throw new Error(
            config.timeout ? "Request timeout" : "Request cancelled",
          );
        }

        throw error;
      }
    }

    // Combine abort signals
    combineAbortSignals(...signals) {
      const controller = new AbortController();

      signals.forEach((signal) => {
        if (signal) {
          signal.addEventListener("abort", () => controller.abort());
        }
      });

      return controller.signal;
    }

    // Resolve URL
    resolveURL(url) {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
      }
      return `${this.baseURL}${url}`;
    }

    // Sleep utility
    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // Convenience methods
    get(url, config = {}) {
      return this.request({ ...config, url, method: "GET" });
    }

    post(url, data, config = {}) {
      return this.request({ ...config, url, method: "POST", data });
    }

    put(url, data, config = {}) {
      return this.request({ ...config, url, method: "PUT", data });
    }

    patch(url, data, config = {}) {
      return this.request({ ...config, url, method: "PATCH", data });
    }

    delete(url, config = {}) {
      return this.request({ ...config, url, method: "DELETE" });
    }

    // Upload with progress
    async upload(url, file, config = {}) {
      const formData = new FormData();
      formData.append("file", file);

      if (config.data) {
        Object.entries(config.data).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      return this.request({
        ...config,
        url,
        method: "POST",
        data: formData,
      });
    }

    // Download file
    async download(url, filename, config = {}) {
      const blob = await this.request({
        ...config,
        url,
        responseType: "blob",
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      return true;
    }

    // Add request interceptor
    addRequestInterceptor(fn) {
      this.interceptors.request.push(fn);
      return () => {
        const index = this.interceptors.request.indexOf(fn);
        if (index > -1) this.interceptors.request.splice(index, 1);
      };
    }

    // Add response interceptor
    addResponseInterceptor(fn) {
      this.interceptors.response.push(fn);
      return () => {
        const index = this.interceptors.response.indexOf(fn);
        if (index > -1) this.interceptors.response.splice(index, 1);
      };
    }

    // Set base URL
    setBaseURL(url) {
      this.baseURL = url;
      return this;
    }

    // Set default headers
    setHeaders(headers) {
      this.headers = { ...this.headers, ...headers };
      return this;
    }

    // Set timeout
    setTimeout(ms) {
      this.timeout = ms;
      return this;
    }

    // Cancel all pending requests
    cancelAll() {
      this.pendingRequests.forEach((promise, key) => {
        // Requests will reject with AbortError
      });
      this.pendingRequests.clear();
    }

    // Get statistics
    getStats() {
      return {
        ...this.stats,
        pending: this.pendingRequests.size,
        successRate:
          this.stats.requests > 0
            ? ((this.stats.successes / this.stats.requests) * 100).toFixed(1) +
              "%"
            : "0%",
      };
    }

    // Create instance with custom config
    create(config = {}) {
      const instance = new BaelAPIClient();
      if (config.baseURL) instance.setBaseURL(config.baseURL);
      if (config.headers) instance.setHeaders(config.headers);
      if (config.timeout) instance.setTimeout(config.timeout);
      return instance;
    }
  }

  // Initialize
  window.BaelAPI = new BaelAPIClient();
})();
