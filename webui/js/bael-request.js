/**
 * BAEL Request - Advanced HTTP Request System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete request system:
 * - Request builder pattern
 * - Interceptors
 * - Retry logic
 * - Request cancellation
 * - Progress tracking
 * - Response caching
 */

(function () {
  "use strict";

  class BaelRequest {
    constructor() {
      this.defaults = {
        baseURL: "",
        timeout: 30000,
        headers: {},
        credentials: "same-origin",
        mode: "cors",
        cache: "default",
      };

      this.interceptors = {
        request: [],
        response: [],
      };

      this.cache = new Map();
      this.pendingRequests = new Map();

      console.log("📡 Bael Request initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════

    configure(options) {
      Object.assign(this.defaults, options);
      return this;
    }

    setBaseURL(url) {
      this.defaults.baseURL = url;
      return this;
    }

    setHeader(name, value) {
      this.defaults.headers[name] = value;
      return this;
    }

    setHeaders(headers) {
      Object.assign(this.defaults.headers, headers);
      return this;
    }

    setAuth(token, type = "Bearer") {
      this.defaults.headers["Authorization"] = `${type} ${token}`;
      return this;
    }

    // ═══════════════════════════════════════════════════════════
    // INTERCEPTORS
    // ═══════════════════════════════════════════════════════════

    addRequestInterceptor(onFulfilled, onRejected) {
      const id = Date.now() + Math.random();
      this.interceptors.request.push({ id, onFulfilled, onRejected });
      return id;
    }

    addResponseInterceptor(onFulfilled, onRejected) {
      const id = Date.now() + Math.random();
      this.interceptors.response.push({ id, onFulfilled, onRejected });
      return id;
    }

    removeInterceptor(type, id) {
      const interceptors = this.interceptors[type];
      const idx = interceptors.findIndex((i) => i.id === id);
      if (idx > -1) interceptors.splice(idx, 1);
    }

    async _applyRequestInterceptors(config) {
      for (const interceptor of this.interceptors.request) {
        try {
          config = await interceptor.onFulfilled(config);
        } catch (error) {
          if (interceptor.onRejected) {
            config = await interceptor.onRejected(error);
          } else {
            throw error;
          }
        }
      }
      return config;
    }

    async _applyResponseInterceptors(response) {
      for (const interceptor of this.interceptors.response) {
        try {
          response = await interceptor.onFulfilled(response);
        } catch (error) {
          if (interceptor.onRejected) {
            response = await interceptor.onRejected(error);
          } else {
            throw error;
          }
        }
      }
      return response;
    }

    // ═══════════════════════════════════════════════════════════
    // REQUEST METHODS
    // ═══════════════════════════════════════════════════════════

    async request(config) {
      config = { ...this.defaults, ...config };

      // Apply request interceptors
      config = await this._applyRequestInterceptors(config);

      // Build URL
      let url = config.url;
      if (config.baseURL && !url.startsWith("http")) {
        url = config.baseURL.replace(/\/$/, "") + "/" + url.replace(/^\//, "");
      }

      // Add query parameters
      if (config.params) {
        const params = new URLSearchParams(config.params);
        url += (url.includes("?") ? "&" : "?") + params.toString();
      }

      // Check cache
      if (config.useCache && config.method === "GET") {
        const cached = this.cache.get(url);
        if (
          cached &&
          Date.now() - cached.timestamp < (config.cacheTTL || 60000)
        ) {
          return cached.response;
        }
      }

      // Check for duplicate requests
      if (config.dedupe && this.pendingRequests.has(url)) {
        return this.pendingRequests.get(url);
      }

      // Build fetch options
      const fetchOptions = {
        method: config.method || "GET",
        headers: new Headers(config.headers),
        credentials: config.credentials,
        mode: config.mode,
        cache: config.cache,
      };

      // Add body
      if (config.data) {
        if (config.data instanceof FormData) {
          fetchOptions.body = config.data;
        } else if (typeof config.data === "object") {
          fetchOptions.headers.set("Content-Type", "application/json");
          fetchOptions.body = JSON.stringify(config.data);
        } else {
          fetchOptions.body = config.data;
        }
      }

      // Create abort controller
      const controller = new AbortController();
      fetchOptions.signal = controller.signal;

      // Timeout
      let timeoutId;
      if (config.timeout) {
        timeoutId = setTimeout(() => controller.abort(), config.timeout);
      }

      // Make request with retry logic
      const requestPromise = this._executeWithRetry(url, fetchOptions, config);

      // Store pending request for deduplication
      if (config.dedupe) {
        this.pendingRequests.set(url, requestPromise);
      }

      try {
        const response = await requestPromise;

        // Cache response
        if (config.useCache && config.method === "GET") {
          this.cache.set(url, { response, timestamp: Date.now() });
        }

        // Apply response interceptors
        return await this._applyResponseInterceptors(response);
      } finally {
        if (timeoutId) clearTimeout(timeoutId);
        this.pendingRequests.delete(url);
      }
    }

    async _executeWithRetry(url, options, config) {
      const maxRetries = config.retries || 0;
      const retryDelay = config.retryDelay || 1000;
      const retryCondition =
        config.retryCondition || ((resp) => resp.status >= 500);

      let lastError;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          const response = await fetch(url, options);

          // Check if should retry
          if (attempt < maxRetries && retryCondition(response)) {
            await this._sleep(retryDelay * Math.pow(2, attempt));
            continue;
          }

          // Parse response
          return await this._parseResponse(response, config);
        } catch (error) {
          lastError = error;

          if (error.name === "AbortError") {
            throw new RequestError("Request aborted", 0, { aborted: true });
          }

          if (attempt < maxRetries) {
            await this._sleep(retryDelay * Math.pow(2, attempt));
            continue;
          }
        }
      }

      throw lastError;
    }

    async _parseResponse(response, config) {
      const result = {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url,
      };

      // Parse body based on content type
      const contentType = response.headers.get("content-type") || "";

      if (config.responseType === "blob") {
        result.data = await response.blob();
      } else if (config.responseType === "arraybuffer") {
        result.data = await response.arrayBuffer();
      } else if (config.responseType === "text") {
        result.data = await response.text();
      } else if (contentType.includes("application/json")) {
        try {
          result.data = await response.json();
        } catch {
          result.data = null;
        }
      } else if (contentType.includes("text/")) {
        result.data = await response.text();
      } else {
        result.data = await response.blob();
      }

      // Throw on error status if configured
      if (!response.ok && config.throwOnError !== false) {
        throw new RequestError(
          result.data?.message || response.statusText,
          response.status,
          result,
        );
      }

      return result;
    }

    _sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // ═══════════════════════════════════════════════════════════
    // CONVENIENCE METHODS
    // ═══════════════════════════════════════════════════════════

    get(url, config = {}) {
      return this.request({ ...config, method: "GET", url });
    }

    post(url, data, config = {}) {
      return this.request({ ...config, method: "POST", url, data });
    }

    put(url, data, config = {}) {
      return this.request({ ...config, method: "PUT", url, data });
    }

    patch(url, data, config = {}) {
      return this.request({ ...config, method: "PATCH", url, data });
    }

    delete(url, config = {}) {
      return this.request({ ...config, method: "DELETE", url });
    }

    head(url, config = {}) {
      return this.request({ ...config, method: "HEAD", url });
    }

    options(url, config = {}) {
      return this.request({ ...config, method: "OPTIONS", url });
    }

    // ═══════════════════════════════════════════════════════════
    // SPECIAL REQUESTS
    // ═══════════════════════════════════════════════════════════

    upload(url, file, config = {}) {
      const formData = new FormData();

      if (file instanceof FileList) {
        for (const f of file) {
          formData.append("files", f);
        }
      } else if (Array.isArray(file)) {
        file.forEach((f) => formData.append("files", f));
      } else {
        formData.append("file", file);
      }

      // Add additional data
      if (config.data) {
        for (const [key, value] of Object.entries(config.data)) {
          formData.append(key, value);
        }
      }

      return this.post(url, formData, {
        ...config,
        headers: { ...config.headers },
      });
    }

    async download(url, filename, config = {}) {
      const response = await this.request({
        ...config,
        method: "GET",
        url,
        responseType: "blob",
      });

      const blob = response.data;
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download =
        filename || this._extractFilename(response.headers) || "download";
      link.click();
      URL.revokeObjectURL(link.href);

      return response;
    }

    _extractFilename(headers) {
      const disposition = headers["content-disposition"];
      if (!disposition) return null;

      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      return match ? match[1].replace(/['"]/g, "") : null;
    }

    // ═══════════════════════════════════════════════════════════
    // BUILDER PATTERN
    // ═══════════════════════════════════════════════════════════

    builder() {
      return new RequestBuilder(this);
    }

    // ═══════════════════════════════════════════════════════════
    // CACHE MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    clearCache(pattern) {
      if (!pattern) {
        this.cache.clear();
      } else {
        const regex = new RegExp(pattern);
        for (const key of this.cache.keys()) {
          if (regex.test(key)) {
            this.cache.delete(key);
          }
        }
      }
      return this;
    }

    getCacheStats() {
      return {
        size: this.cache.size,
        keys: [...this.cache.keys()],
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // REQUEST BUILDER
  // ═══════════════════════════════════════════════════════════════════

  class RequestBuilder {
    constructor(client) {
      this._client = client;
      this._config = {};
    }

    url(url) {
      this._config.url = url;
      return this;
    }

    method(method) {
      this._config.method = method;
      return this;
    }

    header(name, value) {
      this._config.headers = this._config.headers || {};
      this._config.headers[name] = value;
      return this;
    }

    headers(headers) {
      this._config.headers = { ...this._config.headers, ...headers };
      return this;
    }

    params(params) {
      this._config.params = { ...this._config.params, ...params };
      return this;
    }

    body(data) {
      this._config.data = data;
      return this;
    }

    timeout(ms) {
      this._config.timeout = ms;
      return this;
    }

    retry(count, delay = 1000) {
      this._config.retries = count;
      this._config.retryDelay = delay;
      return this;
    }

    cache(ttl = 60000) {
      this._config.useCache = true;
      this._config.cacheTTL = ttl;
      return this;
    }

    dedupe() {
      this._config.dedupe = true;
      return this;
    }

    auth(token, type = "Bearer") {
      return this.header("Authorization", `${type} ${token}`);
    }

    responseType(type) {
      this._config.responseType = type;
      return this;
    }

    send() {
      return this._client.request(this._config);
    }

    // Shorthand methods
    get() {
      return this.method("GET").send();
    }

    post(data) {
      if (data) this.body(data);
      return this.method("POST").send();
    }

    put(data) {
      if (data) this.body(data);
      return this.method("PUT").send();
    }

    patch(data) {
      if (data) this.body(data);
      return this.method("PATCH").send();
    }

    delete() {
      return this.method("DELETE").send();
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // REQUEST ERROR
  // ═══════════════════════════════════════════════════════════════════

  class RequestError extends Error {
    constructor(message, status, response) {
      super(message);
      this.name = "RequestError";
      this.status = status;
      this.response = response;
    }

    isTimeout() {
      return this.status === 0 && !this.response?.aborted;
    }

    isAborted() {
      return this.response?.aborted === true;
    }

    isNetworkError() {
      return this.status === 0;
    }

    isClientError() {
      return this.status >= 400 && this.status < 500;
    }

    isServerError() {
      return this.status >= 500;
    }
  }

  // Initialize
  window.BaelRequest = new BaelRequest();
  window.RequestError = RequestError;

  // Global shortcuts
  window.$request = window.BaelRequest;
  window.$fetch = (url, config) => window.BaelRequest.get(url, config);

  console.log("📡 Bael Request ready");
})();
