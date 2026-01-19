/**
 * BAEL Modal System - Unified Dialog/Modal Management
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete modal system with:
 * - Alert, confirm, prompt dialogs
 * - Custom modals
 * - Stacking
 * - Animations
 * - Keyboard navigation
 * - Focus trap
 */

(function () {
  "use strict";

  class BaelModal {
    constructor() {
      this.modals = new Map();
      this.stack = [];
      this.container = null;
      this.init();
    }

    init() {
      this.createContainer();
      this.addStyles();
      this.bindEvents();
      console.log("🗔 Bael Modal initialized");
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-modal-container";
      document.body.appendChild(this.container);
    }

    // Create and show modal
    create(options) {
      const config = {
        id: options.id || `modal_${Date.now()}`,
        title: options.title || "",
        content: options.content || "",
        footer: options.footer,
        size: options.size || "medium", // small, medium, large, fullscreen
        closable: options.closable !== false,
        closeOnBackdrop: options.closeOnBackdrop !== false,
        closeOnEscape: options.closeOnEscape !== false,
        showCloseButton: options.showCloseButton !== false,
        className: options.className || "",
        onOpen: options.onOpen,
        onClose: options.onClose,
        onConfirm: options.onConfirm,
        onCancel: options.onCancel,
        buttons: options.buttons || [],
        focusTrap: options.focusTrap !== false,
      };

      // Create modal element
      const modal = document.createElement("div");
      modal.className = `bael-modal bael-modal-${config.size} ${config.className}`;
      modal.dataset.id = config.id;
      modal.setAttribute("role", "dialog");
      modal.setAttribute("aria-modal", "true");
      if (config.title) {
        modal.setAttribute("aria-labelledby", `${config.id}-title`);
      }

      modal.innerHTML = `
                <div class="bael-modal-backdrop"></div>
                <div class="bael-modal-dialog">
                    ${
                      config.title || config.showCloseButton
                        ? `
                        <div class="bael-modal-header">
                            ${config.title ? `<h3 id="${config.id}-title" class="bael-modal-title">${config.title}</h3>` : ""}
                            ${config.showCloseButton && config.closable ? '<button class="bael-modal-close" aria-label="Close">✕</button>' : ""}
                        </div>
                    `
                        : ""
                    }
                    <div class="bael-modal-body">
                        ${typeof config.content === "string" ? config.content : ""}
                    </div>
                    ${
                      config.footer !== false &&
                      (config.footer || config.buttons.length > 0)
                        ? `
                        <div class="bael-modal-footer">
                            ${
                              config.footer ||
                              config.buttons
                                .map(
                                  (btn, i) => `
                                <button class="bael-modal-btn bael-modal-btn-${btn.type || "default"}" data-btn="${i}">${btn.label}</button>
                            `,
                                )
                                .join("")
                            }
                        </div>
                    `
                        : ""
                    }
                </div>
            `;

      // If content is an element, append it
      if (config.content instanceof HTMLElement) {
        modal.querySelector(".bael-modal-body").appendChild(config.content);
      }

      // Store config
      config.element = modal;
      this.modals.set(config.id, config);

      // Add to container
      this.container.appendChild(modal);

      // Bind modal events
      this.bindModalEvents(config);

      // Show modal
      requestAnimationFrame(() => {
        modal.classList.add("bael-modal-visible");
        this.stack.push(config.id);

        // Focus first focusable element
        const firstFocusable = modal.querySelector(
          'button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (firstFocusable) {
          firstFocusable.focus();
        }

        config.onOpen?.();
      });

      return {
        id: config.id,
        close: () => this.close(config.id),
        update: (updates) => this.update(config.id, updates),
        element: modal,
      };
    }

    // Bind modal-specific events
    bindModalEvents(config) {
      const { element: modal, id } = config;

      // Close button
      modal
        .querySelector(".bael-modal-close")
        ?.addEventListener("click", () => {
          this.close(id);
        });

      // Backdrop click
      if (config.closeOnBackdrop) {
        modal
          .querySelector(".bael-modal-backdrop")
          ?.addEventListener("click", () => {
            if (config.closable) {
              config.onCancel?.();
              this.close(id);
            }
          });
      }

      // Button clicks
      modal.querySelectorAll(".bael-modal-btn").forEach((btn, i) => {
        btn.addEventListener("click", () => {
          const buttonConfig = config.buttons[i];
          if (buttonConfig?.handler) {
            buttonConfig.handler();
          }
          if (buttonConfig?.close !== false) {
            this.close(id);
          }
        });
      });

      // Focus trap
      if (config.focusTrap) {
        modal.addEventListener("keydown", (e) => {
          if (e.key !== "Tab") return;

          const focusable = modal.querySelectorAll(
            'button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
          );
          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        });
      }
    }

    // Close modal
    close(id) {
      const config = this.modals.get(id);
      if (!config) return false;

      const modal = config.element;
      modal.classList.remove("bael-modal-visible");
      modal.classList.add("bael-modal-hiding");

      setTimeout(() => {
        modal.remove();
        this.modals.delete(id);

        const stackIndex = this.stack.indexOf(id);
        if (stackIndex > -1) {
          this.stack.splice(stackIndex, 1);
        }

        config.onClose?.();
      }, 300);

      return true;
    }

    // Close all modals
    closeAll() {
      for (const id of this.modals.keys()) {
        this.close(id);
      }
    }

    // Update modal
    update(id, updates) {
      const config = this.modals.get(id);
      if (!config) return false;

      if (updates.title !== undefined) {
        const titleEl = config.element.querySelector(".bael-modal-title");
        if (titleEl) titleEl.textContent = updates.title;
      }

      if (updates.content !== undefined) {
        const bodyEl = config.element.querySelector(".bael-modal-body");
        if (bodyEl) {
          if (typeof updates.content === "string") {
            bodyEl.innerHTML = updates.content;
          } else if (updates.content instanceof HTMLElement) {
            bodyEl.innerHTML = "";
            bodyEl.appendChild(updates.content);
          }
        }
      }

      return true;
    }

    // Alert dialog
    alert(message, options = {}) {
      return new Promise((resolve) => {
        this.create({
          ...options,
          title: options.title || "Alert",
          content: `<p>${message}</p>`,
          size: "small",
          buttons: [
            {
              label: options.okText || "OK",
              type: "primary",
              handler: resolve,
            },
          ],
          closeOnBackdrop: false,
          onClose: resolve,
        });
      });
    }

    // Confirm dialog
    confirm(message, options = {}) {
      return new Promise((resolve) => {
        this.create({
          ...options,
          title: options.title || "Confirm",
          content: `<p>${message}</p>`,
          size: "small",
          buttons: [
            {
              label: options.cancelText || "Cancel",
              type: "default",
              handler: () => resolve(false),
            },
            {
              label: options.okText || "OK",
              type: "primary",
              handler: () => resolve(true),
            },
          ],
          closeOnBackdrop: false,
          onCancel: () => resolve(false),
        });
      });
    }

    // Prompt dialog
    prompt(message, options = {}) {
      return new Promise((resolve) => {
        const inputId = `prompt_${Date.now()}`;
        const modal = this.create({
          ...options,
          title: options.title || "Input",
          content: `
                        <p>${message}</p>
                        <input type="${options.type || "text"}" id="${inputId}" class="bael-modal-input"
                            placeholder="${options.placeholder || ""}"
                            value="${options.defaultValue || ""}"
                            ${options.required ? "required" : ""}>
                    `,
          size: "small",
          buttons: [
            {
              label: options.cancelText || "Cancel",
              type: "default",
              handler: () => resolve(null),
            },
            {
              label: options.okText || "OK",
              type: "primary",
              handler: () => {
                const input = document.getElementById(inputId);
                resolve(input?.value ?? null);
              },
            },
          ],
          closeOnBackdrop: false,
          onOpen: () => {
            setTimeout(() => {
              document.getElementById(inputId)?.focus();
            }, 100);
          },
          onCancel: () => resolve(null),
        });

        // Submit on Enter
        document.getElementById(inputId)?.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            resolve(e.target.value);
            modal.close();
          }
        });
      });
    }

    // Loading modal
    loading(message = "Loading...", options = {}) {
      return this.create({
        ...options,
        content: `
                    <div class="bael-modal-loading">
                        <div class="bael-modal-spinner"></div>
                        <p>${message}</p>
                    </div>
                `,
        size: "small",
        closable: false,
        showCloseButton: false,
        closeOnBackdrop: false,
        closeOnEscape: false,
        footer: false,
      });
    }

    // Bind global events
    bindEvents() {
      // Escape key
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.stack.length > 0) {
          const topId = this.stack[this.stack.length - 1];
          const config = this.modals.get(topId);
          if (config?.closeOnEscape && config.closable) {
            config.onCancel?.();
            this.close(topId);
          }
        }
      });
    }

    // Add styles
    addStyles() {
      const style = document.createElement("style");
      style.id = "bael-modal-styles";
      style.textContent = `
                #bael-modal-container {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 100000;
                }

                .bael-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    pointer-events: auto;
                    opacity: 0;
                    visibility: hidden;
                    transition: opacity 0.3s, visibility 0.3s;
                }

                .bael-modal-visible {
                    opacity: 1;
                    visibility: visible;
                }

                .bael-modal-hiding {
                    opacity: 0;
                }

                .bael-modal-backdrop {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.6);
                }

                .bael-modal-dialog {
                    position: relative;
                    background: var(--bael-surface, #1e1e1e);
                    border: 1px solid var(--bael-border, #333);
                    border-radius: 12px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.4);
                    max-height: 90vh;
                    display: flex;
                    flex-direction: column;
                    transform: scale(0.95) translateY(-10px);
                    transition: transform 0.3s;
                }

                .bael-modal-visible .bael-modal-dialog {
                    transform: scale(1) translateY(0);
                }

                .bael-modal-small .bael-modal-dialog { width: 380px; }
                .bael-modal-medium .bael-modal-dialog { width: 500px; }
                .bael-modal-large .bael-modal-dialog { width: 700px; }
                .bael-modal-fullscreen .bael-modal-dialog {
                    width: 95vw;
                    height: 95vh;
                    max-height: 95vh;
                }

                .bael-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .bael-modal-title {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--bael-text, #fff);
                }

                .bael-modal-close {
                    background: transparent;
                    border: none;
                    color: var(--bael-text-dim, #888);
                    font-size: 18px;
                    cursor: pointer;
                    padding: 4px;
                }

                .bael-modal-close:hover {
                    color: var(--bael-text, #fff);
                }

                .bael-modal-body {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                    color: var(--bael-text, #fff);
                }

                .bael-modal-body p {
                    margin: 0 0 12px;
                    line-height: 1.5;
                }

                .bael-modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    padding: 16px 20px;
                    border-top: 1px solid var(--bael-border, #333);
                }

                .bael-modal-btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .bael-modal-btn-default {
                    background: var(--bael-bg-dark, #2a2a2a);
                    color: var(--bael-text, #fff);
                    border: 1px solid var(--bael-border, #444);
                }

                .bael-modal-btn-primary {
                    background: var(--bael-accent, #00d4ff);
                    color: #000;
                }

                .bael-modal-btn-danger {
                    background: #e74c3c;
                    color: #fff;
                }

                .bael-modal-btn:hover {
                    opacity: 0.9;
                }

                .bael-modal-input {
                    width: 100%;
                    padding: 10px 12px;
                    background: var(--bael-bg-dark, #151515);
                    border: 1px solid var(--bael-border, #444);
                    border-radius: 6px;
                    color: var(--bael-text, #fff);
                    font-size: 14px;
                }

                .bael-modal-input:focus {
                    outline: none;
                    border-color: var(--bael-accent, #00d4ff);
                }

                .bael-modal-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 20px;
                }

                .bael-modal-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid var(--bael-border, #333);
                    border-top-color: var(--bael-accent, #00d4ff);
                    border-radius: 50%;
                    animation: bael-modal-spin 1s linear infinite;
                    margin-bottom: 16px;
                }

                @keyframes bael-modal-spin {
                    to { transform: rotate(360deg); }
                }
            `;
      document.head.appendChild(style);
    }

    // Check if any modal is open
    get isOpen() {
      return this.stack.length > 0;
    }
  }

  // Initialize
  window.BaelModal = new BaelModal();

  // Global shortcuts
  window.$modal = {
    create: (opts) => window.BaelModal.create(opts),
    alert: (msg, opts) => window.BaelModal.alert(msg, opts),
    confirm: (msg, opts) => window.BaelModal.confirm(msg, opts),
    prompt: (msg, opts) => window.BaelModal.prompt(msg, opts),
    loading: (msg, opts) => window.BaelModal.loading(msg, opts),
    close: (id) => window.BaelModal.close(id),
    closeAll: () => window.BaelModal.closeAll(),
  };
})();
