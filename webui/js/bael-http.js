/**
 * BAEL HTTP Utilities - Advanced Fetch Library
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete HTTP system:
 * - Request builder
 * - Response handling
 * - Interceptors
 * - Retry logic
 * - Caching
 * - File uploads
 * - Progress tracking
 */

(function () {
  "use strict";

  class BaelHttp {
    constructor() {
      this.baseUrl = "";
      this.defaultHeaders = {
        "Content-Type": "application/json",
      };
      this.timeout = 30000;
      this.interceptors = {
        request: [],
        response: [],
        error: [],
      };
      this.cache = new Map();
      this.pendingRequests = new Map();
      console.log("🌐 Bael HTTP initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════

    // Set base URL
    setBaseUrl(url) {
      this.baseUrl = url.replace(/\/$/, "");
      return this;
    }

    // Set default headers
    setHeaders(headers) {
      Object.assign(this.defaultHeaders, headers);
      return this;
    }

    // Set auth token
    setAuthToken(token, type = "Bearer") {
      this.defaultHeaders["Authorization"] = `${type} ${token}`;
      return this;
    }

    // Remove auth token
    clearAuthToken() {
      delete this.defaultHeaders["Authorization"];
      return this;
    }

    // Set timeout
    setTimeout(ms) {
      this.timeout = ms;
      return this;
    }

    // ═══════════════════════════════════════════════════════════
    // INTERCEPTORS
    // ═══════════════════════════════════════════════════════════

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

    // Add error interceptor
    addErrorInterceptor(fn) {
      this.interceptors.error.push(fn);
      return () => {
        const index = this.interceptors.error.indexOf(fn);
        if (index > -1) this.interceptors.error.splice(index, 1);
      };
    }

    // Run interceptors
    async runInterceptors(type, data) {
      let result = data;
      for (const interceptor of this.interceptors[type]) {
        result = await interceptor(result);
        if (result === false) return false;
      }
      return result;
    }

    // ═══════════════════════════════════════════════════════════
    // CORE REQUEST METHOD
    // ═══════════════════════════════════════════════════════════

    async request(method, url, options = {}) {
      const startTime = performance.now();

      // Build full URL
      const fullUrl = this.buildUrl(url, options.params);

      // Build request config
      let config = {
        method: method.toUpperCase(),
        headers: { ...this.defaultHeaders, ...options.headers },
        ...options,
      };

      // Handle body
      if (
        options.body &&
        typeof options.body === "object" &&
        (!options.body) instanceof FormData
      ) {
        config.body = JSON.stringify(options.body);
      }

      // Run request interceptors
      const interceptedConfig = await this.runInterceptors("request", config);
      if (interceptedConfig === false) {
        return { cancelled: true };
      }
      config = interceptedConfig;

      // Check cache
      if (options.cache && method === "GET") {
        const cached = this.getFromCache(fullUrl);
        if (cached) return cached;
      }

      // Dedupe identical requests
      if (options.dedupe && method === "GET") {
        const pending = this.pendingRequests.get(fullUrl);
        if (pending) return pending;
      }

      // Create abort controller
      const controller = new AbortController();
      config.signal = controller.signal;

      // Set timeout
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, options.timeout || this.timeout);

      // Create request promise
      const requestPromise = this.executeRequest(fullUrl, config, options);

      if (options.dedupe && method === "GET") {
        this.pendingRequests.set(fullUrl, requestPromise);
      }

      try {
        const response = await requestPromise;
        clearTimeout(timeoutId);

        // Calculate timing
        response.timing = {
          duration: performance.now() - startTime,
        };

        // Run response interceptors
        const interceptedResponse = await this.runInterceptors(
          "response",
          response,
        );

        // Cache response
        if (options.cache && method === "GET" && response.ok) {
          this.setCache(fullUrl, interceptedResponse, options.cacheTime);
        }

        return interceptedResponse;
      } catch (error) {
        clearTimeout(timeoutId);

        // Handle abort
        if (error.name === "AbortError") {
          error.isTimeout = true;
          error.message = "Request timeout";
        }

        // Run error interceptors
        const interceptedError = await this.runInterceptors("error", error);

        // Retry logic
        if (options.retry && options.retryCount > 0) {
          return this.request(method, url, {
            ...options,
            retryCount: options.retryCount - 1,
          });
        }

        throw interceptedError || error;
      } finally {
        this.pendingRequests.delete(fullUrl);
      }
    }

    // Execute fetch request
    async executeRequest(url, config, options) {
      const response = await fetch(url, config);

      // Parse response based on content type
      const contentType = response.headers.get("content-type") || "";
      let data;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else if (contentType.includes("text/")) {
        data = await response.text();
      } else if (
        contentType.includes("application/octet-stream") ||
        contentType.includes("application/pdf") ||
        contentType.includes("image/")
      ) {
        data = await response.blob();
      } else {
        try {
          data = await response.json();
        } catch {
          data = await response.text();
        }
      }

      // Build response object
      const result = {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        url: response.url,
      };

      // Throw on error status
      if (!response.ok && !options.ignoreErrors) {
        const error = new Error(
          `HTTP ${response.status}: ${response.statusText}`,
        );
        error.response = result;
        throw error;
      }

      return result;
    }

    // ═══════════════════════════════════════════════════════════
    // HTTP METHODS
    // ═══════════════════════════════════════════════════════════

    // GET
    get(url, options = {}) {
      return this.request("GET", url, options);
    }

    // POST
    post(url, body, options = {}) {
      return this.request("POST", url, { ...options, body });
    }

    // PUT
    put(url, body, options = {}) {
      return this.request("PUT", url, { ...options, body });
    }

    // PATCH
    patch(url, body, options = {}) {
      return this.request("PATCH", url, { ...options, body });
    }

    // DELETE
    delete(url, options = {}) {
      return this.request("DELETE", url, options);
    }

    // HEAD
    head(url, options = {}) {
      return this.request("HEAD", url, options);
    }

    // OPTIONS
    options(url, options = {}) {
      return this.request("OPTIONS", url, options);
    }

    // ═══════════════════════════════════════════════════════════
    // URL BUILDING
    // ═══════════════════════════════════════════════════════════

    buildUrl(url, params) {
      // Add base URL if not absolute
      let fullUrl = url.startsWith("http") ? url : `${this.baseUrl}${url}`;

      // Add query params
      if (params) {
        const queryString = this.buildQueryString(params);
        if (queryString) {
          fullUrl += (fullUrl.includes("?") ? "&" : "?") + queryString;
        }
      }

      return fullUrl;
    }

    buildQueryString(params) {
      const parts = [];

      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;

        if (Array.isArray(value)) {
          value.forEach((v) => {
            parts.push(`${encodeURIComponent(key)}[]=${encodeURIComponent(v)}`);
          });
        } else if (typeof value === "object") {
          for (const [subKey, subValue] of Object.entries(value)) {
            parts.push(
              `${encodeURIComponent(key)}[${encodeURIComponent(subKey)}]=${encodeURIComponent(subValue)}`,
            );
          }
        } else {
          parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
      }

      return parts.join("&");
    }

    // ═══════════════════════════════════════════════════════════
    // CACHING
    // ═══════════════════════════════════════════════════════════

    getFromCache(url) {
      const cached = this.cache.get(url);
      if (!cached) return null;

      if (Date.now() > cached.expires) {
        this.cache.delete(url);
        return null;
      }

      return cached.data;
    }

    setCache(url, data, ttl = 60000) {
      this.cache.set(url, {
        data,
        expires: Date.now() + ttl,
      });
    }

    clearCache(pattern) {
      if (!pattern) {
        this.cache.clear();
        return;
      }

      const regex = new RegExp(pattern);
      for (const key of this.cache.keys()) {
        if (regex.test(key)) {
          this.cache.delete(key);
        }
      }
    }

    // ═══════════════════════════════════════════════════════════
    // FILE UPLOAD
    // ═══════════════════════════════════════════════════════════

    // Upload file(s)
    async upload(url, files, options = {}) {
      const formData = new FormData();

      // Handle single file or array
      const fileList = Array.isArray(files) ? files : [files];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const fieldName =
          options.fieldName || (fileList.length > 1 ? `files[${i}]` : "file");
        formData.append(fieldName, file);
      }

      // Add extra fields
      if (options.data) {
        for (const [key, value] of Object.entries(options.data)) {
          formData.append(key, value);
        }
      }

      return this.request("POST", url, {
        ...options,
        body: formData,
        headers: {
          ...options.headers,
          // Let browser set content-type for FormData
        },
      });
    }

    // Upload with progress
    uploadWithProgress(url, file, options = {}) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();

        formData.append(options.fieldName || "file", file);

        // Add extra fields
        if (options.data) {
          for (const [key, value] of Object.entries(options.data)) {
            formData.append(key, value);
          }
        }

        // Progress handler
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable && options.onProgress) {
            const percent = Math.round((e.loaded / e.total) * 100);
            options.onProgress({
              loaded: e.loaded,
              total: e.total,
              percent,
            });
          }
        });

        // Complete handler
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            let data;
            try {
              data = JSON.parse(xhr.responseText);
            } catch {
              data = xhr.responseText;
            }
            resolve({
              ok: true,
              status: xhr.status,
              data,
            });
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        });

        // Error handler
        xhr.addEventListener("error", () => {
          reject(new Error("Upload failed"));
        });

        // Setup headers
        const fullUrl = this.buildUrl(url);
        xhr.open("POST", fullUrl);

        for (const [key, value] of Object.entries(this.defaultHeaders)) {
          if (key.toLowerCase() !== "content-type") {
            xhr.setRequestHeader(key, value);
          }
        }

        xhr.send(formData);
      });
    }

    // ═══════════════════════════════════════════════════════════
    // DOWNLOAD
    // ═══════════════════════════════════════════════════════════

    // Download file
    async download(url, filename, options = {}) {
      const response = await this.get(url, {
        ...options,
        headers: {
          ...options.headers,
        },
      });

      if (response.data instanceof Blob) {
        this.saveBlob(response.data, filename);
      } else {
        const blob = new Blob([response.data], {
          type: "application/octet-stream",
        });
        this.saveBlob(blob, filename);
      }

      return response;
    }

    // Save blob as file
    saveBlob(blob, filename) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // Download with progress
    downloadWithProgress(url, filename, options = {}) {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const fullUrl = this.buildUrl(url);

        xhr.open("GET", fullUrl);
        xhr.responseType = "blob";

        // Progress handler
        xhr.addEventListener("progress", (e) => {
          if (e.lengthComputable && options.onProgress) {
            const percent = Math.round((e.loaded / e.total) * 100);
            options.onProgress({
              loaded: e.loaded,
              total: e.total,
              percent,
            });
          }
        });

        // Complete handler
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            this.saveBlob(xhr.response, filename);
            resolve({
              ok: true,
              status: xhr.status,
            });
          } else {
            reject(new Error(`Download failed: ${xhr.status}`));
          }
        });

        // Error handler
        xhr.addEventListener("error", () => {
          reject(new Error("Download failed"));
        });

        // Setup headers
        for (const [key, value] of Object.entries(this.defaultHeaders)) {
          xhr.setRequestHeader(key, value);
        }

        xhr.send();
      });
    }

    // ═══════════════════════════════════════════════════════════
    // BATCH REQUESTS
    // ═══════════════════════════════════════════════════════════

    // Parallel requests
    async parallel(requests) {
      const promises = requests.map((req) => {
        const { method = "GET", url, ...options } = req;
        return this.request(method, url, options).catch((err) => ({
          error: err,
          failed: true,
        }));
      });

      return Promise.all(promises);
    }

    // Sequential requests
    async sequential(requests) {
      const results = [];

      for (const req of requests) {
        const { method = "GET", url, ...options } = req;
        try {
          const result = await this.request(method, url, options);
          results.push(result);
        } catch (err) {
          results.push({ error: err, failed: true });
        }
      }

      return results;
    }

    // ═══════════════════════════════════════════════════════════
    // REQUEST BUILDER
    // ═══════════════════════════════════════════════════════════

    // Create request builder
    builder() {
      const http = this;

      return {
        _method: "GET",
        _url: "",
        _params: {},
        _headers: {},
        _body: null,
        _options: {},

        method(m) {
          this._method = m;
          return this;
        },
        url(u) {
          this._url = u;
          return this;
        },
        params(p) {
          this._params = { ...this._params, ...p };
          return this;
        },
        headers(h) {
          this._headers = { ...this._headers, ...h };
          return this;
        },
        body(b) {
          this._body = b;
          return this;
        },
        option(key, value) {
          this._options[key] = value;
          return this;
        },

        auth(token, type = "Bearer") {
          this._headers["Authorization"] = `${type} ${token}`;
          return this;
        },

        timeout(ms) {
          this._options.timeout = ms;
          return this;
        },
        cache(ttl) {
          this._options.cache = true;
          this._options.cacheTime = ttl;
          return this;
        },
        retry(count) {
          this._options.retry = true;
          this._options.retryCount = count;
          return this;
        },

        get() {
          return this.method("GET");
        },
        post() {
          return this.method("POST");
        },
        put() {
          return this.method("PUT");
        },
        patch() {
          return this.method("PATCH");
        },
        delete() {
          return this.method("DELETE");
        },

        send() {
          return http.request(this._method, this._url, {
            params: this._params,
            headers: this._headers,
            body: this._body,
            ...this._options,
          });
        },
      };
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    // Create instance with different config
    create(config = {}) {
      const instance = new BaelHttp();
      if (config.baseUrl) instance.setBaseUrl(config.baseUrl);
      if (config.headers) instance.setHeaders(config.headers);
      if (config.timeout) instance.setTimeout(config.timeout);
      return instance;
    }

    // Serialize object to form data
    toFormData(obj, formData = new FormData(), parentKey = "") {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = parentKey ? `${parentKey}[${key}]` : key;

        if (value instanceof File || value instanceof Blob) {
          formData.append(fullKey, value);
        } else if (Array.isArray(value)) {
          value.forEach((v, i) => {
            if (typeof v === "object") {
              this.toFormData(v, formData, `${fullKey}[${i}]`);
            } else {
              formData.append(`${fullKey}[]`, v);
            }
          });
        } else if (typeof value === "object" && value !== null) {
          this.toFormData(value, formData, fullKey);
        } else if (value !== undefined && value !== null) {
          formData.append(fullKey, value);
        }
      }

      return formData;
    }
  }

  // Initialize
  window.BaelHttp = new BaelHttp();

  // Global shortcuts
  window.$http = window.BaelHttp;
  window.$get = (url, options) => window.BaelHttp.get(url, options);
  window.$post = (url, body, options) =>
    window.BaelHttp.post(url, body, options);
})();
