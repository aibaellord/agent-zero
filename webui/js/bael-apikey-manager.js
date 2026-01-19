/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BAEL - LORD OF ALL
 * API KEY MANAGER - Secure Credential Management
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Manage API keys and credentials securely:
 * - Multiple provider support
 * - Key validation
 * - Usage tracking
 * - Secure storage
 * - Quick switching
 *
 * @version 1.0.0
 */

(function () {
  "use strict";

  class BaelAPIKeyManager {
    constructor() {
      this.keys = new Map();
      this.activeKeys = {};
      this.providers = [];
      this.panel = null;
      this.isVisible = false;

      this.init();
    }

    init() {
      this.registerDefaultProviders();
      this.loadKeys();
      this.createUI();
      this.addStyles();
      this.bindEvents();
      console.log("🔑 Bael API Key Manager initialized");
    }

    registerDefaultProviders() {
      this.providers = [
        {
          id: "openai",
          name: "OpenAI",
          icon: "🤖",
          prefix: "sk-",
          validate: (key) => key.startsWith("sk-") && key.length > 20,
          description: "GPT-4, GPT-3.5, DALL-E, Whisper",
        },
        {
          id: "anthropic",
          name: "Anthropic",
          icon: "🧠",
          prefix: "sk-ant-",
          validate: (key) => key.startsWith("sk-ant-") && key.length > 20,
          description: "Claude 3, Claude 2",
        },
        {
          id: "google",
          name: "Google AI",
          icon: "🔮",
          prefix: "AI",
          validate: (key) => key.length > 20,
          description: "Gemini Pro, PaLM",
        },
        {
          id: "groq",
          name: "Groq",
          icon: "⚡",
          prefix: "gsk_",
          validate: (key) => key.startsWith("gsk_") && key.length > 20,
          description: "LLaMA, Mixtral (fast inference)",
        },
        {
          id: "openrouter",
          name: "OpenRouter",
          icon: "🔀",
          prefix: "sk-or-",
          validate: (key) => key.startsWith("sk-or-") && key.length > 20,
          description: "Multi-provider routing",
        },
        {
          id: "huggingface",
          name: "Hugging Face",
          icon: "🤗",
          prefix: "hf_",
          validate: (key) => key.startsWith("hf_") && key.length > 20,
          description: "Open source models",
        },
        {
          id: "replicate",
          name: "Replicate",
          icon: "🔄",
          prefix: "r8_",
          validate: (key) => key.startsWith("r8_") && key.length > 20,
          description: "Various AI models",
        },
        {
          id: "custom",
          name: "Custom",
          icon: "⚙️",
          prefix: "",
          validate: (key) => key.length > 0,
          description: "Custom API endpoint",
        },
      ];
    }

    // ═════════════════════════════════════════════════════════════════
    // KEY MANAGEMENT
    // ═════════════════════════════════════════════════════════════════

    addKey(providerId, key, name = "") {
      const provider = this.providers.find((p) => p.id === providerId);
      if (!provider) return { success: false, error: "Unknown provider" };

      if (!provider.validate(key)) {
        return { success: false, error: "Invalid key format" };
      }

      const keyId = "key_" + Date.now().toString(36);
      const keyData = {
        id: keyId,
        providerId,
        name: name || `${provider.name} Key`,
        key: this.encryptKey(key),
        maskedKey: this.maskKey(key),
        createdAt: new Date(),
        lastUsed: null,
        usageCount: 0,
        isActive: false,
      };

      if (!this.keys.has(providerId)) {
        this.keys.set(providerId, []);
      }
      this.keys.get(providerId).push(keyData);

      this.saveKeys();
      this.updateUI();
      this.emit("key-added", { providerId, keyId });

      return { success: true, keyId };
    }

    removeKey(providerId, keyId) {
      const providerKeys = this.keys.get(providerId);
      if (!providerKeys) return false;

      const idx = providerKeys.findIndex((k) => k.id === keyId);
      if (idx === -1) return false;

      providerKeys.splice(idx, 1);
      this.saveKeys();
      this.updateUI();
      this.emit("key-removed", { providerId, keyId });

      return true;
    }

    setActiveKey(providerId, keyId) {
      const providerKeys = this.keys.get(providerId);
      if (!providerKeys) return false;

      providerKeys.forEach((k) => (k.isActive = k.id === keyId));
      this.activeKeys[providerId] = keyId;
      this.saveKeys();
      this.updateUI();
      this.emit("key-activated", { providerId, keyId });

      return true;
    }

    getActiveKey(providerId) {
      const providerKeys = this.keys.get(providerId);
      if (!providerKeys) return null;

      const active = providerKeys.find((k) => k.isActive);
      return active ? this.decryptKey(active.key) : null;
    }

    getAllKeys(providerId = null) {
      if (providerId) {
        return this.keys.get(providerId) || [];
      }
      return Array.from(this.keys.entries());
    }

    recordUsage(providerId) {
      const providerKeys = this.keys.get(providerId);
      if (!providerKeys) return;

      const active = providerKeys.find((k) => k.isActive);
      if (active) {
        active.lastUsed = new Date();
        active.usageCount++;
        this.saveKeys();
      }
    }

    async validateKey(providerId, key) {
      const provider = this.providers.find((p) => p.id === providerId);
      if (!provider) return { valid: false, error: "Unknown provider" };

      if (!provider.validate(key)) {
        return { valid: false, error: "Invalid format" };
      }

      // TODO: Add actual API validation for each provider
      return { valid: true };
    }

    // ═════════════════════════════════════════════════════════════════
    // ENCRYPTION
    // ═════════════════════════════════════════════════════════════════

    encryptKey(key) {
      // Simple obfuscation (in production, use proper encryption)
      return btoa(key.split("").reverse().join(""));
    }

    decryptKey(encrypted) {
      try {
        return atob(encrypted).split("").reverse().join("");
      } catch (e) {
        return "";
      }
    }

    maskKey(key) {
      if (key.length <= 8) return "****";
      return key.substring(0, 4) + "••••••••" + key.substring(key.length - 4);
    }

    // ═════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═════════════════════════════════════════════════════════════════

    loadKeys() {
      try {
        const saved = JSON.parse(localStorage.getItem("bael_api_keys") || "{}");
        if (saved.keys) {
          for (const [providerId, keys] of Object.entries(saved.keys)) {
            this.keys.set(
              providerId,
              keys.map((k) => ({
                ...k,
                createdAt: new Date(k.createdAt),
                lastUsed: k.lastUsed ? new Date(k.lastUsed) : null,
              })),
            );
          }
        }
        if (saved.activeKeys) {
          this.activeKeys = saved.activeKeys;
        }
      } catch (e) {
        console.warn("Failed to load API keys:", e);
      }
    }

    saveKeys() {
      const data = {
        keys: Object.fromEntries(this.keys),
        activeKeys: this.activeKeys,
      };
      localStorage.setItem("bael_api_keys", JSON.stringify(data));
    }

    // ═════════════════════════════════════════════════════════════════
    // UI
    // ═════════════════════════════════════════════════════════════════

    createUI() {
      const panel = document.createElement("div");
      panel.id = "bael-apikey-panel";
      panel.className = "bael-apikey-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;
    }

    renderPanel() {
      const totalKeys = Array.from(this.keys.values()).flat().length;

      return `
                <div class="apikey-header">
                    <div class="apikey-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                        </svg>
                        <span>API Keys</span>
                        <span class="apikey-badge">${totalKeys} keys</span>
                    </div>
                    <button class="apikey-close" id="apikey-close">×</button>
                </div>

                <div class="apikey-content">
                    <div class="apikey-add">
                        <select id="apikey-provider" class="apikey-select">
                            ${this.providers
                              .map(
                                (p) => `
                                <option value="${p.id}">${p.icon} ${p.name}</option>
                            `,
                              )
                              .join("")}
                        </select>
                        <input type="text" id="apikey-name" placeholder="Key name (optional)" class="apikey-input"/>
                        <input type="password" id="apikey-value" placeholder="Enter API key" class="apikey-input key-input"/>
                        <button class="apikey-btn primary" id="apikey-add-btn">Add Key</button>
                    </div>

                    <div class="apikey-providers">
                        ${this.providers
                          .map((p) => {
                            const providerKeys = this.keys.get(p.id) || [];
                            if (providerKeys.length === 0) return "";

                            return `
                                <div class="apikey-provider">
                                    <div class="provider-header">
                                        <span class="provider-icon">${p.icon}</span>
                                        <span class="provider-name">${p.name}</span>
                                        <span class="provider-desc">${p.description}</span>
                                    </div>
                                    <div class="provider-keys">
                                        ${providerKeys
                                          .map(
                                            (k) => `
                                            <div class="key-item ${k.isActive ? "active" : ""}">
                                                <div class="key-info">
                                                    <div class="key-name">${k.name}</div>
                                                    <div class="key-masked">${k.maskedKey}</div>
                                                    <div class="key-meta">
                                                        Used ${k.usageCount} times
                                                        ${k.lastUsed ? `• Last: ${this.formatDate(k.lastUsed)}` : ""}
                                                    </div>
                                                </div>
                                                <div class="key-actions">
                                                    ${
                                                      k.isActive
                                                        ? `
                                                        <span class="key-active-badge">Active</span>
                                                    `
                                                        : `
                                                        <button class="key-activate" data-provider="${p.id}" data-key="${k.id}">
                                                            Use
                                                        </button>
                                                    `
                                                    }
                                                    <button class="key-delete" data-provider="${p.id}" data-key="${k.id}">
                                                        🗑
                                                    </button>
                                                </div>
                                            </div>
                                        `,
                                          )
                                          .join("")}
                                    </div>
                                </div>
                            `;
                          })
                          .join("")}

                        ${
                          totalKeys === 0
                            ? `
                            <div class="apikey-empty">
                                <p>No API keys configured</p>
                                <p class="sub">Add keys above to get started</p>
                            </div>
                        `
                            : ""
                        }
                    </div>
                </div>
            `;
    }

    formatDate(date) {
      if (!date) return "Never";
      const now = new Date();
      const diff = now - date;
      if (diff < 60000) return "Just now";
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      return date.toLocaleDateString();
    }

    updateUI() {
      if (!this.panel) return;
      this.panel.innerHTML = this.renderPanel();
      this.bindPanelEvents();
    }

    addStyles() {
      if (document.getElementById("bael-apikey-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-apikey-styles";
      styles.textContent = `
                .bael-apikey-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90vw;
                    max-width: 600px;
                    max-height: 80vh;
                    background: var(--color-panel, #0f0f17);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 20px;
                    z-index: 100095;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 40px 120px rgba(0,0,0,0.7);
                }

                .bael-apikey-panel.visible {
                    display: flex;
                    animation: apikeyIn 0.3s ease;
                }

                @keyframes apikeyIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .apikey-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    border-bottom: 1px solid var(--color-border, #252535);
                }

                .apikey-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 17px;
                    font-weight: 700;
                    color: var(--color-text, #fff);
                }

                .apikey-title svg {
                    width: 22px;
                    height: 22px;
                    color: var(--color-primary, #ff3366);
                }

                .apikey-badge {
                    font-size: 10px;
                    padding: 3px 8px;
                    background: var(--color-primary, #ff3366);
                    border-radius: 20px;
                }

                .apikey-close {
                    width: 36px;
                    height: 36px;
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted, #666);
                    font-size: 24px;
                    cursor: pointer;
                }

                .apikey-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                }

                .apikey-add {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-bottom: 24px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid var(--color-border, #252535);
                }

                .apikey-select, .apikey-input {
                    padding: 10px 14px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 8px;
                    color: var(--color-text, #fff);
                    font-size: 13px;
                }

                .apikey-select {
                    min-width: 150px;
                }

                .apikey-input {
                    flex: 1;
                    min-width: 120px;
                }

                .key-input {
                    flex: 2;
                    min-width: 200px;
                }

                .apikey-btn {
                    padding: 10px 20px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 8px;
                    color: var(--color-text, #fff);
                    font-size: 13px;
                    cursor: pointer;
                }

                .apikey-btn.primary {
                    background: var(--color-primary, #ff3366);
                    border-color: transparent;
                }

                .apikey-providers {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .apikey-provider {
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .provider-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 14px 16px;
                    background: var(--color-panel, #12121a);
                    border-bottom: 1px solid var(--color-border, #252535);
                }

                .provider-icon {
                    font-size: 20px;
                }

                .provider-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--color-text, #fff);
                }

                .provider-desc {
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                    margin-left: auto;
                }

                .provider-keys {
                    padding: 8px;
                }

                .key-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    border-radius: 8px;
                    transition: background 0.2s;
                }

                .key-item:hover {
                    background: rgba(255,255,255,0.03);
                }

                .key-item.active {
                    background: rgba(255,51,102,0.1);
                    border: 1px solid var(--color-primary, #ff3366);
                }

                .key-name {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--color-text, #fff);
                    margin-bottom: 2px;
                }

                .key-masked {
                    font-size: 12px;
                    color: var(--color-text-muted, #888);
                    font-family: 'JetBrains Mono', monospace;
                }

                .key-meta {
                    font-size: 10px;
                    color: var(--color-text-muted, #555);
                    margin-top: 4px;
                }

                .key-actions {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .key-active-badge {
                    font-size: 10px;
                    padding: 4px 10px;
                    background: var(--color-primary, #ff3366);
                    border-radius: 12px;
                    color: #fff;
                }

                .key-activate {
                    padding: 6px 14px;
                    background: transparent;
                    border: 1px solid var(--color-border, #333);
                    border-radius: 6px;
                    color: var(--color-text, #fff);
                    font-size: 11px;
                    cursor: pointer;
                }

                .key-activate:hover {
                    background: var(--color-primary, #ff3366);
                    border-color: transparent;
                }

                .key-delete {
                    width: 28px;
                    height: 28px;
                    background: transparent;
                    border: none;
                    font-size: 12px;
                    cursor: pointer;
                    opacity: 0.5;
                }

                .key-delete:hover {
                    opacity: 1;
                }

                .apikey-empty {
                    text-align: center;
                    padding: 40px;
                    color: var(--color-text-muted, #666);
                }

                .apikey-empty .sub {
                    font-size: 12px;
                    margin-top: 8px;
                }
            `;
      document.head.appendChild(styles);
    }

    // ═════════════════════════════════════════════════════════════════
    // EVENT BINDING
    // ═════════════════════════════════════════════════════════════════

    bindEvents() {
      this.bindPanelEvents();

      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "K") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    bindPanelEvents() {
      if (!this.panel) return;

      this.panel
        .querySelector("#apikey-close")
        ?.addEventListener("click", () => this.close());

      this.panel
        .querySelector("#apikey-add-btn")
        ?.addEventListener("click", () => {
          const provider = this.panel.querySelector("#apikey-provider").value;
          const name = this.panel.querySelector("#apikey-name").value;
          const key = this.panel.querySelector("#apikey-value").value;

          if (!key) {
            window.BaelNotifications?.show("Please enter an API key", "error");
            return;
          }

          const result = this.addKey(provider, key, name);
          if (result.success) {
            this.panel.querySelector("#apikey-name").value = "";
            this.panel.querySelector("#apikey-value").value = "";
            window.BaelNotifications?.show("API key added", "success");
          } else {
            window.BaelNotifications?.show(result.error, "error");
          }
        });

      this.panel.querySelectorAll(".key-activate").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.setActiveKey(btn.dataset.provider, btn.dataset.key);
          window.BaelNotifications?.show("Key activated", "success");
        });
      });

      this.panel.querySelectorAll(".key-delete").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (confirm("Delete this API key?")) {
            this.removeKey(btn.dataset.provider, btn.dataset.key);
            window.BaelNotifications?.show("Key removed", "info");
          }
        });
      });
    }

    // ═════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═════════════════════════════════════════════════════════════════

    emit(event, data) {
      window.dispatchEvent(
        new CustomEvent(`bael:apikey:${event}`, { detail: data }),
      );
    }

    open() {
      this.isVisible = true;
      this.updateUI();
      this.panel.classList.add("visible");
    }

    close() {
      this.isVisible = false;
      this.panel.classList.remove("visible");
    }

    toggle() {
      this.isVisible ? this.close() : this.open();
    }
  }

  window.BaelAPIKeyManager = new BaelAPIKeyManager();
})();
