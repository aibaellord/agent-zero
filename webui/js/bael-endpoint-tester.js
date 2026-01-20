/**
 * Bael Endpoint Tester - Test and explore API endpoints
 * Keyboard: Ctrl+Alt+E to toggle
 */
(function () {
  "use strict";

  class BaelEndpointTester {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.storageKey = "bael-endpoint-tester";
      this.history = [];
      this.collections = [];
      this.lastResponse = null;
    }

    async initialize() {
      this.loadFromStorage();
      this.injectStyles();
      this.createElements();
      this.setupShortcuts();
      this.initialized = true;
      console.log("🧪 Bael Endpoint Tester initialized");
    }

    injectStyles() {
      if (document.getElementById("bael-endpoint-styles")) return;

      const css = `
                .bael-endpoint-fab {
                    position: fixed;
                    bottom: 660px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #f97316, #ea580c);
                    color: white;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
                    z-index: 9999;
                    transition: all 0.3s ease;
                }

                .bael-endpoint-fab:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(249, 115, 22, 0.5);
                }

                .bael-endpoint-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.9);
                    width: 850px;
                    max-width: 95vw;
                    max-height: 85vh;
                    background: linear-gradient(135deg, #1a1a2e, #252540);
                    border-radius: 20px;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
                    z-index: 10001;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                    border: 1px solid rgba(249, 115, 22, 0.3);
                }

                .bael-endpoint-panel.visible {
                    opacity: 1;
                    visibility: visible;
                    transform: translate(-50%, -50%) scale(1);
                }

                .bael-endpoint-header {
                    background: linear-gradient(135deg, #f97316, #ea580c);
                    padding: 16px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .bael-endpoint-title {
                    color: white;
                    font-size: 18px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .bael-endpoint-close {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 18px;
                    transition: background 0.2s;
                }

                .bael-endpoint-close:hover {
                    background: rgba(255,255,255,0.3);
                }

                .bael-endpoint-content {
                    display: flex;
                    height: calc(85vh - 60px);
                }

                .bael-endpoint-sidebar {
                    width: 180px;
                    background: rgba(0,0,0,0.25);
                    border-right: 1px solid rgba(255,255,255,0.05);
                    padding: 12px;
                    overflow-y: auto;
                }

                .bael-endpoint-section-title {
                    color: #666;
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    padding: 8px 6px;
                }

                .bael-endpoint-history-item {
                    padding: 8px 10px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.04);
                    border-radius: 6px;
                    margin-bottom: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bael-endpoint-history-item:hover {
                    background: rgba(255,255,255,0.05);
                    border-color: rgba(249, 115, 22, 0.3);
                }

                .bael-endpoint-method-badge {
                    font-size: 9px;
                    font-weight: 700;
                    padding: 2px 5px;
                    border-radius: 3px;
                    text-transform: uppercase;
                }

                .bael-endpoint-method-badge.get { background: #22c55e; color: white; }
                .bael-endpoint-method-badge.post { background: #f59e0b; color: white; }
                .bael-endpoint-method-badge.put { background: #3b82f6; color: white; }
                .bael-endpoint-method-badge.delete { background: #ef4444; color: white; }
                .bael-endpoint-method-badge.patch { background: #8b5cf6; color: white; }

                .bael-endpoint-history-path {
                    color: #999;
                    font-size: 11px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    flex: 1;
                }

                .bael-endpoint-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .bael-endpoint-request-bar {
                    padding: 16px 20px;
                    background: rgba(0,0,0,0.15);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                .bael-endpoint-url-row {
                    display: flex;
                    gap: 8px;
                }

                .bael-endpoint-method-select {
                    padding: 11px 14px;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    color: white;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    min-width: 90px;
                }

                .bael-endpoint-url-input {
                    flex: 1;
                    padding: 11px 16px;
                    background: rgba(255,255,255,0.06);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    color: white;
                    font-size: 13px;
                    font-family: 'Consolas', monospace;
                }

                .bael-endpoint-url-input::placeholder {
                    color: #555;
                }

                .bael-endpoint-send-btn {
                    padding: 11px 22px;
                    background: linear-gradient(135deg, #f97316, #ea580c);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .bael-endpoint-send-btn:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
                }

                .bael-endpoint-send-btn:disabled {
                    opacity: 0.6;
                    cursor: wait;
                }

                .bael-endpoint-tabs-row {
                    display: flex;
                    gap: 0;
                    margin-top: 12px;
                }

                .bael-endpoint-tab-btn {
                    padding: 8px 16px;
                    background: transparent;
                    border: none;
                    color: #666;
                    font-size: 12px;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                    transition: all 0.2s;
                }

                .bael-endpoint-tab-btn.active {
                    color: #f97316;
                    border-bottom-color: #f97316;
                }

                .bael-endpoint-tab-panel {
                    display: none;
                    padding: 12px 0;
                }

                .bael-endpoint-tab-panel.active {
                    display: block;
                }

                .bael-endpoint-kv-table {
                    width: 100%;
                }

                .bael-endpoint-kv-row {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 6px;
                }

                .bael-endpoint-kv-input {
                    flex: 1;
                    padding: 8px 12px;
                    background: rgba(255,255,255,0.04);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 6px;
                    color: white;
                    font-size: 12px;
                }

                .bael-endpoint-kv-input::placeholder {
                    color: #444;
                }

                .bael-endpoint-kv-remove {
                    padding: 8px 12px;
                    background: rgba(239, 68, 68, 0.2);
                    border: none;
                    border-radius: 6px;
                    color: #ef4444;
                    font-size: 12px;
                    cursor: pointer;
                }

                .bael-endpoint-add-kv {
                    padding: 8px 16px;
                    background: rgba(249, 115, 22, 0.1);
                    border: 1px dashed rgba(249, 115, 22, 0.3);
                    border-radius: 6px;
                    color: #f97316;
                    font-size: 11px;
                    cursor: pointer;
                    width: 100%;
                    margin-top: 8px;
                }

                .bael-endpoint-body-editor {
                    width: 100%;
                    min-height: 120px;
                    padding: 12px;
                    background: rgba(0,0,0,0.2);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 8px;
                    color: #e0e0e0;
                    font-family: 'Consolas', monospace;
                    font-size: 12px;
                    resize: vertical;
                }

                .bael-endpoint-response-area {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    padding: 16px 20px;
                    overflow: hidden;
                }

                .bael-endpoint-response-meta {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }

                .bael-endpoint-status-row {
                    display: flex;
                    gap: 10px;
                }

                .bael-endpoint-status-pill {
                    padding: 5px 12px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .bael-endpoint-status-pill.ok { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
                .bael-endpoint-status-pill.err { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
                .bael-endpoint-status-pill.info { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }

                .bael-endpoint-response-actions {
                    display: flex;
                    gap: 8px;
                }

                .bael-endpoint-action {
                    padding: 5px 12px;
                    background: rgba(255,255,255,0.08);
                    border: none;
                    border-radius: 6px;
                    color: #888;
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .bael-endpoint-action:hover {
                    background: rgba(255,255,255,0.12);
                    color: #ccc;
                }

                .bael-endpoint-response-body {
                    flex: 1;
                    padding: 14px;
                    background: rgba(0,0,0,0.25);
                    border-radius: 10px;
                    overflow: auto;
                    font-family: 'Consolas', monospace;
                    font-size: 12px;
                    color: #d0d0d0;
                    white-space: pre-wrap;
                    word-break: break-word;
                    line-height: 1.5;
                }

                .bael-endpoint-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    height: 100%;
                    color: #666;
                }

                .bael-endpoint-spinner {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(249, 115, 22, 0.2);
                    border-top-color: #f97316;
                    border-radius: 50%;
                    animation: ept-spin 0.7s linear infinite;
                }

                @keyframes ept-spin {
                    to { transform: rotate(360deg); }
                }

                .bael-endpoint-empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #555;
                    text-align: center;
                }

                .bael-endpoint-empty-icon {
                    font-size: 40px;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }
            `;

      const style = document.createElement("style");
      style.id = "bael-endpoint-styles";
      style.textContent = css;
      document.head.appendChild(style);
    }

    createElements() {
      // FAB
      this.fab = document.createElement("button");
      this.fab.className = "bael-endpoint-fab";
      this.fab.innerHTML = "🧪";
      this.fab.title = "Endpoint Tester (Ctrl+Alt+E)";
      this.fab.addEventListener("click", () => this.toggle());
      document.body.appendChild(this.fab);

      // Panel
      this.panel = document.createElement("div");
      this.panel.className = "bael-endpoint-panel";
      this.panel.innerHTML = `
                <div class="bael-endpoint-header">
                    <div class="bael-endpoint-title">
                        <span>🧪</span>
                        <span>Endpoint Tester</span>
                    </div>
                    <button class="bael-endpoint-close">×</button>
                </div>
                <div class="bael-endpoint-content">
                    <div class="bael-endpoint-sidebar">
                        <div class="bael-endpoint-section-title">Recent</div>
                        <div id="bael-endpoint-history"></div>
                    </div>
                    <div class="bael-endpoint-main">
                        <div class="bael-endpoint-request-bar">
                            <div class="bael-endpoint-url-row">
                                <select class="bael-endpoint-method-select" id="bael-ep-method">
                                    <option value="GET">GET</option>
                                    <option value="POST">POST</option>
                                    <option value="PUT">PUT</option>
                                    <option value="PATCH">PATCH</option>
                                    <option value="DELETE">DELETE</option>
                                </select>
                                <input type="text" class="bael-endpoint-url-input" id="bael-ep-url" placeholder="http://localhost:5000/api/endpoint">
                                <button class="bael-endpoint-send-btn" id="bael-ep-send">
                                    <span>▶</span>
                                    <span>Send</span>
                                </button>
                            </div>
                            <div class="bael-endpoint-tabs-row">
                                <button class="bael-endpoint-tab-btn active" data-tab="params">Params</button>
                                <button class="bael-endpoint-tab-btn" data-tab="headers">Headers</button>
                                <button class="bael-endpoint-tab-btn" data-tab="body">Body</button>
                            </div>
                            <div class="bael-endpoint-tab-panel active" data-tab="params">
                                <div id="bael-ep-params" class="bael-endpoint-kv-table"></div>
                                <button class="bael-endpoint-add-kv" data-target="params">+ Add Parameter</button>
                            </div>
                            <div class="bael-endpoint-tab-panel" data-tab="headers">
                                <div id="bael-ep-headers" class="bael-endpoint-kv-table"></div>
                                <button class="bael-endpoint-add-kv" data-target="headers">+ Add Header</button>
                            </div>
                            <div class="bael-endpoint-tab-panel" data-tab="body">
                                <textarea class="bael-endpoint-body-editor" id="bael-ep-body" placeholder='{"key": "value"}'></textarea>
                            </div>
                        </div>
                        <div class="bael-endpoint-response-area">
                            <div class="bael-endpoint-response-meta">
                                <div class="bael-endpoint-status-row" id="bael-ep-status"></div>
                                <div class="bael-endpoint-response-actions">
                                    <button class="bael-endpoint-action" id="bael-ep-copy">📋 Copy</button>
                                    <button class="bael-endpoint-action" id="bael-ep-pretty">🎨 Pretty</button>
                                    <button class="bael-endpoint-action" id="bael-ep-save">💾 Save</button>
                                </div>
                            </div>
                            <div class="bael-endpoint-response-body" id="bael-ep-response">
                                <div class="bael-endpoint-empty-state">
                                    <div class="bael-endpoint-empty-icon">🧪</div>
                                    <div>Enter a URL and click Send</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
      document.body.appendChild(this.panel);

      // Initialize with default header
      this.addKVRow("headers", "Content-Type", "application/json");

      // Events
      this.panel
        .querySelector(".bael-endpoint-close")
        .addEventListener("click", () => this.hide());
      this.panel
        .querySelector("#bael-ep-send")
        .addEventListener("click", () => this.sendRequest());

      // Tabs
      this.panel.querySelectorAll(".bael-endpoint-tab-btn").forEach((btn) => {
        btn.addEventListener("click", () => this.switchTab(btn.dataset.tab));
      });

      // Add KV buttons
      this.panel.querySelectorAll(".bael-endpoint-add-kv").forEach((btn) => {
        btn.addEventListener("click", () => this.addKVRow(btn.dataset.target));
      });

      // Actions
      this.panel
        .querySelector("#bael-ep-copy")
        .addEventListener("click", () => this.copyResponse());
      this.panel
        .querySelector("#bael-ep-pretty")
        .addEventListener("click", () => this.prettyPrint());
      this.panel
        .querySelector("#bael-ep-save")
        .addEventListener("click", () => this.saveToCollection());

      // Enter to send
      this.panel
        .querySelector("#bael-ep-url")
        .addEventListener("keydown", (e) => {
          if (e.key === "Enter") this.sendRequest();
        });

      this.renderHistory();
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.altKey && e.key === "e") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape" && this.visible) {
          this.hide();
        }
      });
    }

    switchTab(tab) {
      this.panel
        .querySelectorAll(".bael-endpoint-tab-btn")
        .forEach((b) => b.classList.remove("active"));
      this.panel
        .querySelectorAll(".bael-endpoint-tab-panel")
        .forEach((p) => p.classList.remove("active"));
      this.panel
        .querySelector(`.bael-endpoint-tab-btn[data-tab="${tab}"]`)
        .classList.add("active");
      this.panel
        .querySelector(`.bael-endpoint-tab-panel[data-tab="${tab}"]`)
        .classList.add("active");
    }

    addKVRow(target, key = "", value = "") {
      const container = this.panel.querySelector(`#bael-ep-${target}`);
      const row = document.createElement("div");
      row.className = "bael-endpoint-kv-row";
      row.innerHTML = `
                <input type="text" class="bael-endpoint-kv-input" placeholder="Key" value="${key}">
                <input type="text" class="bael-endpoint-kv-input" placeholder="Value" value="${value}">
                <button class="bael-endpoint-kv-remove">×</button>
            `;
      row
        .querySelector(".bael-endpoint-kv-remove")
        .addEventListener("click", () => row.remove());
      container.appendChild(row);
    }

    getKVPairs(target) {
      const pairs = {};
      this.panel
        .querySelectorAll(`#bael-ep-${target} .bael-endpoint-kv-row`)
        .forEach((row) => {
          const inputs = row.querySelectorAll("input");
          const k = inputs[0].value.trim();
          const v = inputs[1].value.trim();
          if (k) pairs[k] = v;
        });
      return pairs;
    }

    async sendRequest() {
      const method = this.panel.querySelector("#bael-ep-method").value;
      let url = this.panel.querySelector("#bael-ep-url").value.trim();

      if (!url) {
        this.showToast("Enter a URL");
        return;
      }

      // Add params to URL
      const params = this.getKVPairs("params");
      if (Object.keys(params).length) {
        const sp = new URLSearchParams(params);
        url += (url.includes("?") ? "&" : "?") + sp.toString();
      }

      const headers = this.getKVPairs("headers");
      const body = this.panel.querySelector("#bael-ep-body").value.trim();

      // UI updates
      const sendBtn = this.panel.querySelector("#bael-ep-send");
      const responseEl = this.panel.querySelector("#bael-ep-response");
      const statusEl = this.panel.querySelector("#bael-ep-status");

      sendBtn.disabled = true;
      responseEl.innerHTML = `<div class="bael-endpoint-loading"><div class="bael-endpoint-spinner"></div><span>Sending...</span></div>`;
      statusEl.innerHTML = "";

      const startTime = performance.now();

      try {
        const opts = { method, headers };
        if (["POST", "PUT", "PATCH"].includes(method) && body) {
          opts.body = body;
        }

        const res = await fetch(url, opts);
        const duration = Math.round(performance.now() - startTime);

        let text;
        const ct = res.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          text = JSON.stringify(await res.json(), null, 2);
        } else {
          text = await res.text();
        }

        this.lastResponse = text;

        responseEl.textContent = text;
        statusEl.innerHTML = `
                    <span class="bael-endpoint-status-pill ${res.ok ? "ok" : "err"}">${res.status} ${res.statusText}</span>
                    <span class="bael-endpoint-status-pill info">${duration}ms</span>
                    <span class="bael-endpoint-status-pill info">${this.formatSize(text.length)}</span>
                `;

        this.addToHistory({
          method,
          url,
          status: res.status,
          time: Date.now(),
        });
      } catch (err) {
        responseEl.textContent = `Error: ${err.message}`;
        statusEl.innerHTML = `<span class="bael-endpoint-status-pill err">Error</span>`;
      }

      sendBtn.disabled = false;
    }

    formatSize(bytes) {
      if (bytes < 1024) return bytes + " B";
      return (bytes / 1024).toFixed(1) + " KB";
    }

    copyResponse() {
      if (this.lastResponse) {
        navigator.clipboard.writeText(this.lastResponse);
        this.showToast("Copied!");
      }
    }

    prettyPrint() {
      try {
        const el = this.panel.querySelector("#bael-ep-response");
        const json = JSON.parse(el.textContent);
        el.textContent = JSON.stringify(json, null, 2);
        this.lastResponse = el.textContent;
      } catch (e) {
        this.showToast("Not valid JSON");
      }
    }

    saveToCollection() {
      const method = this.panel.querySelector("#bael-ep-method").value;
      const url = this.panel.querySelector("#bael-ep-url").value;
      const name = prompt(
        "Name this request:",
        new URL(url).pathname || "Request",
      );
      if (name) {
        this.collections.push({
          name,
          method,
          url,
          headers: this.getKVPairs("headers"),
          body: this.panel.querySelector("#bael-ep-body").value,
        });
        this.saveToStorage();
        this.showToast("Saved!");
      }
    }

    addToHistory(entry) {
      this.history = [
        entry,
        ...this.history.filter((h) => h.url !== entry.url),
      ].slice(0, 15);
      this.saveToStorage();
      this.renderHistory();
    }

    renderHistory() {
      const container = this.panel.querySelector("#bael-endpoint-history");
      if (!container) return;

      container.innerHTML =
        this.history
          .map((h) => {
            const path =
              h.url.replace(/^https?:\/\/[^/]+/, "").split("?")[0] || "/";
            return `
                    <div class="bael-endpoint-history-item" data-url="${h.url}" data-method="${h.method}">
                        <span class="bael-endpoint-method-badge ${h.method.toLowerCase()}">${h.method}</span>
                        <span class="bael-endpoint-history-path">${path}</span>
                    </div>
                `;
          })
          .join("") ||
        '<div style="color:#555;font-size:11px;padding:8px;">No history yet</div>';

      container
        .querySelectorAll(".bael-endpoint-history-item")
        .forEach((el) => {
          el.addEventListener("click", () => {
            this.panel.querySelector("#bael-ep-url").value = el.dataset.url;
            this.panel.querySelector("#bael-ep-method").value =
              el.dataset.method;
          });
        });
    }

    showToast(msg) {
      const t = document.createElement("div");
      t.style.cssText = `position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#f97316,#ea580c);color:white;padding:12px 24px;border-radius:10px;font-size:14px;z-index:100000;`;
      t.textContent = msg;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 2000);
    }

    toggle() {
      this.visible ? this.hide() : this.show();
    }

    show() {
      this.panel.classList.add("visible");
      this.visible = true;
    }

    hide() {
      this.panel.classList.remove("visible");
      this.visible = false;
    }

    loadFromStorage() {
      try {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || "{}");
        this.history = data.history || [];
        this.collections = data.collections || [];
      } catch (e) {}
    }

    saveToStorage() {
      try {
        localStorage.setItem(
          this.storageKey,
          JSON.stringify({
            history: this.history,
            collections: this.collections,
          }),
        );
      } catch (e) {}
    }
  }

  window.BaelEndpointTester = new BaelEndpointTester();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      window.BaelEndpointTester.initialize(),
    );
  } else {
    window.BaelEndpointTester.initialize();
  }
})();
