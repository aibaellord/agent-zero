/**
 * BAEL - LORD OF ALL
 * Secret Vault - Secure credentials and API key management
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelSecretVault {
    constructor() {
      this.isVisible = false;
      this.secrets = this.loadSecrets();
      this.isUnlocked = false;
      this.masterKeyHash = localStorage.getItem("bael-vault-key");
      this.init();
    }

    loadSecrets() {
      const encrypted = localStorage.getItem("bael-vault-secrets");
      if (!encrypted) return [];
      try {
        return JSON.parse(atob(encrypted));
      } catch {
        return [];
      }
    }

    saveSecrets() {
      const encrypted = btoa(JSON.stringify(this.secrets));
      localStorage.setItem("bael-vault-secrets", encrypted);
    }

    init() {
      this.createUI();
      this.bindEvents();
      console.log("🔐 Bael Secret Vault initialized");
    }

    createUI() {
      const styles = document.createElement("style");
      styles.id = "bael-vault-styles";
      styles.textContent = `
                .bael-vault-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.95);
                    width: 480px;
                    max-height: 80vh;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    opacity: 0;
                    pointer-events: none;
                    transition: all 0.3s ease;
                }

                .bael-vault-panel.visible {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                    pointer-events: all;
                }

                .bael-vault-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-vault-title {
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .bael-vault-close {
                    width: 30px;
                    height: 30px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    font-size: 14px;
                }

                .bael-vault-close:hover {
                    background: #ff4444;
                    color: #fff;
                    border-color: #ff4444;
                }

                .bael-vault-lock-screen {
                    padding: 40px 30px;
                    text-align: center;
                }

                .bael-vault-lock-icon {
                    font-size: 60px;
                    margin-bottom: 20px;
                    opacity: 0.6;
                }

                .bael-vault-lock-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 8px;
                }

                .bael-vault-lock-desc {
                    font-size: 13px;
                    color: var(--bael-text-muted, #888);
                    margin-bottom: 24px;
                }

                .bael-vault-pin-input {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-bottom: 24px;
                }

                .bael-vault-pin-digit {
                    width: 50px;
                    height: 60px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 2px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 24px;
                    font-weight: 700;
                    text-align: center;
                    transition: all 0.2s ease;
                }

                .bael-vault-pin-digit:focus {
                    outline: none;
                    border-color: var(--bael-accent, #ff3366);
                }

                .bael-vault-unlock-btn {
                    padding: 14px 40px;
                    background: linear-gradient(135deg, var(--bael-accent, #ff3366) 0%, #ff6b8a 100%);
                    border: none;
                    border-radius: 10px;
                    color: #fff;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-vault-unlock-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 16px rgba(255, 51, 102, 0.4);
                }

                .bael-vault-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    display: none;
                }

                .bael-vault-content.visible {
                    display: block;
                }

                .bael-vault-add-btn {
                    width: 100%;
                    padding: 14px;
                    background: transparent;
                    border: 2px dashed var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    color: var(--bael-text-muted, #888);
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .bael-vault-add-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                .bael-vault-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .bael-vault-item {
                    padding: 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    transition: all 0.2s ease;
                }

                .bael-vault-item:hover {
                    border-color: rgba(255, 51, 102, 0.3);
                }

                .bael-vault-item-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 8px;
                }

                .bael-vault-item-icon {
                    width: 32px;
                    height: 32px;
                    background: rgba(255, 51, 102, 0.1);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                }

                .bael-vault-item-name {
                    flex: 1;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .bael-vault-item-actions {
                    display: flex;
                    gap: 4px;
                }

                .bael-vault-item-btn {
                    width: 28px;
                    height: 28px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #888);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-vault-item-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                .bael-vault-item-btn.delete:hover {
                    border-color: #ef4444;
                    color: #ef4444;
                }

                .bael-vault-item-value {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bael-vault-masked {
                    font-family: monospace;
                    font-size: 13px;
                    color: var(--bael-text-muted, #888);
                    letter-spacing: 2px;
                }

                .bael-vault-revealed {
                    font-family: 'Fira Code', monospace;
                    font-size: 12px;
                    color: #22c55e;
                    word-break: break-all;
                }

                .bael-vault-category {
                    font-size: 10px;
                    padding: 2px 8px;
                    background: rgba(139, 92, 246, 0.2);
                    border-radius: 8px;
                    color: #8b5cf6;
                }

                .bael-vault-empty {
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--bael-text-muted, #666);
                }

                .bael-vault-empty-icon {
                    font-size: 50px;
                    margin-bottom: 16px;
                    opacity: 0.4;
                }

                .bael-vault-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 9999;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.3s ease;
                }

                .bael-vault-overlay.visible {
                    opacity: 1;
                    pointer-events: all;
                }

                /* Add secret modal */
                .bael-vault-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 400px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 14px;
                    padding: 24px;
                    z-index: 10100;
                    display: none;
                }

                .bael-vault-modal.visible {
                    display: block;
                }

                .bael-vault-modal h3 {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin: 0 0 20px 0;
                }

                .bael-vault-form-group {
                    margin-bottom: 16px;
                }

                .bael-vault-form-label {
                    display: block;
                    font-size: 12px;
                    color: var(--bael-text-muted, #888);
                    margin-bottom: 6px;
                }

                .bael-vault-form-input {
                    width: 100%;
                    padding: 10px 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 13px;
                }

                .bael-vault-form-input:focus {
                    outline: none;
                    border-color: var(--bael-accent, #ff3366);
                }

                .bael-vault-form-select {
                    width: 100%;
                    padding: 10px 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 13px;
                }

                .bael-vault-form-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }

                .bael-vault-form-btn {
                    flex: 1;
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                }

                .bael-vault-form-btn.primary {
                    background: var(--bael-accent, #ff3366);
                    border: none;
                    color: #fff;
                }

                .bael-vault-form-btn.secondary {
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    color: var(--bael-text-primary, #fff);
                }

                .bael-vault-trigger {
                    position: fixed;
                    bottom: 360px;
                    right: 20px;
                    width: 44px;
                    height: 44px;
                    background: linear-gradient(135deg, #eab308 0%, #facc15 100%);
                    border: none;
                    border-radius: 12px;
                    color: #000;
                    font-size: 18px;
                    cursor: pointer;
                    box-shadow: 0 4px 16px rgba(234, 179, 8, 0.4);
                    z-index: 7999;
                    transition: all 0.3s ease;
                }

                .bael-vault-trigger:hover {
                    transform: scale(1.08);
                }
            `;
      document.head.appendChild(styles);

      // Overlay
      this.overlay = document.createElement("div");
      this.overlay.className = "bael-vault-overlay";
      document.body.appendChild(this.overlay);

      // Panel
      this.panel = document.createElement("div");
      this.panel.className = "bael-vault-panel";
      this.panel.innerHTML = this.renderPanel();
      document.body.appendChild(this.panel);

      // Add modal
      this.modal = document.createElement("div");
      this.modal.className = "bael-vault-modal";
      this.modal.innerHTML = this.renderModal();
      document.body.appendChild(this.modal);

      // Trigger
      this.trigger = document.createElement("button");
      this.trigger.className = "bael-vault-trigger";
      this.trigger.innerHTML = "🔐";
      this.trigger.title = "Secret Vault";
      document.body.appendChild(this.trigger);
    }

    renderPanel() {
      return `
                <div class="bael-vault-header">
                    <div class="bael-vault-title">
                        <span>🔐</span>
                        <span>Secret Vault</span>
                    </div>
                    <button class="bael-vault-close">✕</button>
                </div>
                <div class="bael-vault-lock-screen" id="lock-screen">
                    <div class="bael-vault-lock-icon">🔒</div>
                    <div class="bael-vault-lock-title">${this.masterKeyHash ? "Vault Locked" : "Create Master PIN"}</div>
                    <div class="bael-vault-lock-desc">${this.masterKeyHash ? "Enter your 4-digit PIN to unlock" : "Set a 4-digit PIN to secure your vault"}</div>
                    <div class="bael-vault-pin-input">
                        <input type="password" maxlength="1" class="bael-vault-pin-digit" data-idx="0">
                        <input type="password" maxlength="1" class="bael-vault-pin-digit" data-idx="1">
                        <input type="password" maxlength="1" class="bael-vault-pin-digit" data-idx="2">
                        <input type="password" maxlength="1" class="bael-vault-pin-digit" data-idx="3">
                    </div>
                    <button class="bael-vault-unlock-btn" id="unlock-btn">
                        ${this.masterKeyHash ? "🔓 Unlock Vault" : "🔐 Create Vault"}
                    </button>
                </div>
                <div class="bael-vault-content" id="vault-content">
                    <button class="bael-vault-add-btn" id="add-secret-btn">
                        <span>+</span>
                        <span>Add Secret</span>
                    </button>
                    <div class="bael-vault-list" id="secrets-list">
                        ${this.renderSecretsList()}
                    </div>
                </div>
            `;
    }

    renderModal() {
      return `
                <h3>🔐 Add New Secret</h3>
                <div class="bael-vault-form-group">
                    <label class="bael-vault-form-label">Name</label>
                    <input type="text" class="bael-vault-form-input" id="secret-name" placeholder="e.g., OpenAI API Key">
                </div>
                <div class="bael-vault-form-group">
                    <label class="bael-vault-form-label">Category</label>
                    <select class="bael-vault-form-select" id="secret-category">
                        <option value="api-key">API Key</option>
                        <option value="password">Password</option>
                        <option value="token">Token</option>
                        <option value="credential">Credential</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="bael-vault-form-group">
                    <label class="bael-vault-form-label">Value</label>
                    <input type="password" class="bael-vault-form-input" id="secret-value" placeholder="Enter secret value">
                </div>
                <div class="bael-vault-form-actions">
                    <button class="bael-vault-form-btn secondary" id="cancel-secret">Cancel</button>
                    <button class="bael-vault-form-btn primary" id="save-secret">Save Secret</button>
                </div>
            `;
    }

    renderSecretsList() {
      if (this.secrets.length === 0) {
        return `
                    <div class="bael-vault-empty">
                        <div class="bael-vault-empty-icon">🔐</div>
                        <div>No secrets stored</div>
                        <div style="font-size: 12px; margin-top: 8px;">Add your first secret to get started</div>
                    </div>
                `;
      }

      return this.secrets
        .map(
          (secret) => `
                <div class="bael-vault-item" data-id="${secret.id}">
                    <div class="bael-vault-item-header">
                        <div class="bael-vault-item-icon">${this.getCategoryIcon(secret.category)}</div>
                        <div class="bael-vault-item-name">${secret.name}</div>
                        <span class="bael-vault-category">${secret.category}</span>
                        <div class="bael-vault-item-actions">
                            <button class="bael-vault-item-btn reveal" data-id="${secret.id}" title="Show/Hide">👁️</button>
                            <button class="bael-vault-item-btn copy" data-id="${secret.id}" title="Copy">📋</button>
                            <button class="bael-vault-item-btn delete" data-id="${secret.id}" title="Delete">🗑️</button>
                        </div>
                    </div>
                    <div class="bael-vault-item-value">
                        <span class="bael-vault-masked" id="value-${secret.id}">••••••••••••</span>
                    </div>
                </div>
            `,
        )
        .join("");
    }

    bindEvents() {
      // Trigger
      this.trigger.addEventListener("click", () => this.toggle());
      this.overlay.addEventListener("click", () => this.hide());

      // Close
      this.panel
        .querySelector(".bael-vault-close")
        .addEventListener("click", () => this.hide());

      // PIN input
      const pinInputs = this.panel.querySelectorAll(".bael-vault-pin-digit");
      pinInputs.forEach((input, idx) => {
        input.addEventListener("input", (e) => {
          if (e.target.value && idx < 3) {
            pinInputs[idx + 1].focus();
          }
        });
        input.addEventListener("keydown", (e) => {
          if (e.key === "Backspace" && !e.target.value && idx > 0) {
            pinInputs[idx - 1].focus();
          }
        });
      });

      // Unlock
      this.panel
        .querySelector("#unlock-btn")
        .addEventListener("click", () => this.handleUnlock());

      // Add secret
      this.panel
        .querySelector("#add-secret-btn")
        .addEventListener("click", () => {
          this.modal.classList.add("visible");
        });

      this.modal
        .querySelector("#cancel-secret")
        .addEventListener("click", () => {
          this.modal.classList.remove("visible");
        });

      this.modal.querySelector("#save-secret").addEventListener("click", () => {
        this.saveSecret();
      });

      // Secret actions
      this.panel
        .querySelector("#secrets-list")
        .addEventListener("click", (e) => {
          const btn = e.target.closest(".bael-vault-item-btn");
          if (!btn) return;

          const secretId = btn.dataset.id;
          if (btn.classList.contains("reveal")) {
            this.toggleReveal(secretId);
          } else if (btn.classList.contains("copy")) {
            this.copySecret(secretId);
          } else if (btn.classList.contains("delete")) {
            this.deleteSecret(secretId);
          }
        });

      // Keyboard
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.modal.classList.remove("visible");
          if (this.isVisible) this.hide();
        }
      });
    }

    handleUnlock() {
      const pins = Array.from(
        this.panel.querySelectorAll(".bael-vault-pin-digit"),
      ).map((i) => i.value);
      const pin = pins.join("");

      if (pin.length !== 4) {
        if (window.BaelNotifications)
          window.BaelNotifications.error("Please enter 4 digits");
        return;
      }

      const hash = this.hashPin(pin);

      if (!this.masterKeyHash) {
        // Creating new vault
        localStorage.setItem("bael-vault-key", hash);
        this.masterKeyHash = hash;
        this.isUnlocked = true;
        this.showVaultContent();
        if (window.BaelNotifications)
          window.BaelNotifications.success("Vault created successfully!");
      } else {
        // Unlocking existing vault
        if (hash === this.masterKeyHash) {
          this.isUnlocked = true;
          this.showVaultContent();
          if (window.BaelNotifications)
            window.BaelNotifications.success("Vault unlocked!");
        } else {
          if (window.BaelNotifications)
            window.BaelNotifications.error("Invalid PIN");
          // Clear inputs
          this.panel
            .querySelectorAll(".bael-vault-pin-digit")
            .forEach((i) => (i.value = ""));
          this.panel.querySelector(".bael-vault-pin-digit").focus();
        }
      }
    }

    hashPin(pin) {
      // Simple hash for demo (use proper crypto in production)
      let hash = 0;
      for (let i = 0; i < pin.length; i++) {
        const char = pin.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return hash.toString(36);
    }

    showVaultContent() {
      this.panel.querySelector("#lock-screen").style.display = "none";
      this.panel.querySelector("#vault-content").classList.add("visible");
      this.refreshList();
    }

    saveSecret() {
      const name = this.modal.querySelector("#secret-name").value.trim();
      const category = this.modal.querySelector("#secret-category").value;
      const value = this.modal.querySelector("#secret-value").value;

      if (!name || !value) {
        if (window.BaelNotifications)
          window.BaelNotifications.error("Please fill all fields");
        return;
      }

      this.secrets.push({
        id: `secret-${Date.now()}`,
        name,
        category,
        value: btoa(value), // Simple encoding (use encryption in production)
        createdAt: Date.now(),
      });

      this.saveSecrets();
      this.refreshList();

      // Clear and close modal
      this.modal.querySelector("#secret-name").value = "";
      this.modal.querySelector("#secret-value").value = "";
      this.modal.classList.remove("visible");

      if (window.BaelNotifications)
        window.BaelNotifications.success("Secret saved!");
    }

    toggleReveal(secretId) {
      const secret = this.secrets.find((s) => s.id === secretId);
      if (!secret) return;

      const valueEl = this.panel.querySelector(`#value-${secretId}`);
      if (valueEl.classList.contains("bael-vault-revealed")) {
        valueEl.textContent = "••••••••••••";
        valueEl.classList.remove("bael-vault-revealed");
        valueEl.classList.add("bael-vault-masked");
      } else {
        valueEl.textContent = atob(secret.value);
        valueEl.classList.remove("bael-vault-masked");
        valueEl.classList.add("bael-vault-revealed");
      }
    }

    copySecret(secretId) {
      const secret = this.secrets.find((s) => s.id === secretId);
      if (!secret) return;

      navigator.clipboard.writeText(atob(secret.value));
      if (window.BaelNotifications)
        window.BaelNotifications.success("Copied to clipboard!");
    }

    deleteSecret(secretId) {
      if (confirm("Delete this secret?")) {
        this.secrets = this.secrets.filter((s) => s.id !== secretId);
        this.saveSecrets();
        this.refreshList();
        if (window.BaelNotifications)
          window.BaelNotifications.info("Secret deleted");
      }
    }

    refreshList() {
      this.panel.querySelector("#secrets-list").innerHTML =
        this.renderSecretsList();
    }

    toggle() {
      if (this.isVisible) this.hide();
      else this.show();
    }

    show() {
      this.isVisible = true;
      this.panel.classList.add("visible");
      this.overlay.classList.add("visible");

      if (!this.isUnlocked) {
        this.panel.querySelector(".bael-vault-pin-digit").focus();
      }
    }

    hide() {
      this.isVisible = false;
      this.panel.classList.remove("visible");
      this.overlay.classList.remove("visible");
      this.modal.classList.remove("visible");

      // Lock vault when closing
      if (this.isUnlocked) {
        this.isUnlocked = false;
        this.panel.querySelector("#lock-screen").style.display = "block";
        this.panel.querySelector("#vault-content").classList.remove("visible");
        this.panel
          .querySelectorAll(".bael-vault-pin-digit")
          .forEach((i) => (i.value = ""));
      }
    }

    getCategoryIcon(category) {
      const icons = {
        "api-key": "🔑",
        password: "🔒",
        token: "🎫",
        credential: "📜",
        other: "📄",
      };
      return icons[category] || "📄";
    }
  }

  window.BaelSecretVault = new BaelSecretVault();
})();
