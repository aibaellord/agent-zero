/**
 * BAEL Dialog Component - Lord Of All Modals
 *
 * Full-featured dialog/modal component with:
 * - Multiple dialog types (modal, alert, confirm, prompt)
 * - Stacking support
 * - Animations
 * - Focus trapping
 * - Backdrop click
 * - Keyboard support
 * - Accessibility
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // DIALOG CLASS
  // ============================================================

  class BaelDialog {
    constructor() {
      this.instances = new Map();
      this.stack = [];
      this.idCounter = 0;
      this.container = null;
      this.baseZIndex = 10000;

      this._createContainer();
      this._setupKeyboardListener();
    }

    /**
     * Create global dialog container
     */
    _createContainer() {
      this.container = document.createElement("div");
      this.container.className = "bael-dialog-container";
      document.body.appendChild(this.container);
    }

    /**
     * Setup global keyboard listener
     */
    _setupKeyboardListener() {
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.stack.length > 0) {
          const topDialog = this.stack[this.stack.length - 1];
          const state = this.instances.get(topDialog);
          if (state && state.config.closeOnEscape) {
            this.close(topDialog);
          }
        }
      });
    }

    // ============================================================
    // CREATE DIALOG
    // ============================================================

    /**
     * Create a dialog
     */
    create(options = {}) {
      const id = `bael-dialog-${++this.idCounter}`;
      const config = {
        title: "",
        content: "",
        html: true,
        type: "modal",
        size: "medium",
        position: "center",
        closeButton: true,
        closeOnBackdrop: true,
        closeOnEscape: true,
        animated: true,
        duration: 200,
        backdrop: true,
        backdropBlur: false,
        draggable: false,
        resizable: false,
        fullscreen: false,
        buttons: [],
        customClass: "",
        onOpen: null,
        onClose: null,
        onConfirm: null,
        onCancel: null,
        ...options,
      };

      const state = {
        id,
        config,
        dialog: null,
        backdrop: null,
        isOpen: false,
        previousActiveElement: null,
        focusableElements: [],
      };

      // Create dialog elements
      this._createDialogElement(state);

      this.instances.set(id, state);

      return {
        id,
        open: () => this.open(id),
        close: () => this.close(id),
        toggle: () => this.toggle(id),
        setContent: (content) => this.setContent(id, content),
        setTitle: (title) => this.setTitle(id, title),
        isOpen: () => state.isOpen,
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Create dialog element
     */
    _createDialogElement(state) {
      const { config } = state;

      // Backdrop
      if (config.backdrop) {
        const backdrop = document.createElement("div");
        backdrop.className = `bael-dialog-backdrop ${config.backdropBlur ? "blur" : ""}`;
        backdrop.hidden = true;

        if (config.closeOnBackdrop) {
          backdrop.onclick = () => this.close(state.id);
        }

        this.container.appendChild(backdrop);
        state.backdrop = backdrop;
      }

      // Dialog
      const dialog = document.createElement("div");
      dialog.id = state.id;
      dialog.className = `bael-dialog bael-dialog-${config.size} bael-dialog-${config.position} ${config.customClass}`;
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-labelledby", `${state.id}-title`);
      dialog.hidden = true;

      if (config.fullscreen) {
        dialog.classList.add("fullscreen");
      }

      // Header
      if (config.title || config.closeButton) {
        const header = document.createElement("div");
        header.className = "bael-dialog-header";

        if (config.title) {
          const title = document.createElement("h2");
          title.id = `${state.id}-title`;
          title.className = "bael-dialog-title";
          title.textContent = config.title;
          header.appendChild(title);
          state.titleEl = title;
        }

        if (config.closeButton) {
          const closeBtn = document.createElement("button");
          closeBtn.className = "bael-dialog-close";
          closeBtn.innerHTML = "×";
          closeBtn.setAttribute("aria-label", "Close dialog");
          closeBtn.onclick = () => this.close(state.id);
          header.appendChild(closeBtn);
        }

        dialog.appendChild(header);

        // Draggable
        if (config.draggable) {
          this._setupDrag(state, header, dialog);
        }
      }

      // Body
      const body = document.createElement("div");
      body.className = "bael-dialog-body";
      this._setContent(body, config.content, config.html);
      dialog.appendChild(body);
      state.bodyEl = body;

      // Footer with buttons
      if (config.buttons.length > 0) {
        const footer = document.createElement("div");
        footer.className = "bael-dialog-footer";

        config.buttons.forEach((btn) => {
          const button = document.createElement("button");
          button.className = `bael-dialog-btn ${btn.class || ""} ${btn.primary ? "primary" : ""} ${btn.danger ? "danger" : ""}`;
          button.textContent = btn.text;
          button.disabled = btn.disabled || false;

          button.onclick = () => {
            if (btn.action) {
              const result = btn.action(state);
              if (result !== false && btn.close !== false) {
                this.close(state.id);
              }
            } else if (btn.close !== false) {
              this.close(state.id);
            }
          };

          footer.appendChild(button);
        });

        dialog.appendChild(footer);
      }

      this.container.appendChild(dialog);
      state.dialog = dialog;

      // Cache focusable elements
      this._updateFocusableElements(state);
    }

    /**
     * Set content
     */
    _setContent(element, content, isHtml) {
      if (typeof content === "function") {
        content = content();
      }

      if (content instanceof Element) {
        element.innerHTML = "";
        element.appendChild(content);
      } else if (isHtml) {
        element.innerHTML = content;
      } else {
        element.textContent = content;
      }
    }

    /**
     * Setup dragging
     */
    _setupDrag(state, handle, dialog) {
      let isDragging = false;
      let startX, startY, initialX, initialY;

      handle.style.cursor = "move";

      handle.addEventListener("mousedown", (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        const rect = dialog.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;

        dialog.style.position = "fixed";
        dialog.style.margin = "0";
      });

      document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        dialog.style.left = `${initialX + dx}px`;
        dialog.style.top = `${initialY + dy}px`;
      });

      document.addEventListener("mouseup", () => {
        isDragging = false;
      });
    }

    // ============================================================
    // OPEN/CLOSE
    // ============================================================

    /**
     * Open dialog
     */
    open(dialogId) {
      const state = this.instances.get(dialogId);
      if (!state || state.isOpen) return;

      const { dialog, backdrop, config } = state;

      // Store previous active element
      state.previousActiveElement = document.activeElement;

      // Calculate z-index
      const zIndex = this.baseZIndex + this.stack.length * 2;
      if (backdrop) {
        backdrop.style.zIndex = zIndex;
      }
      dialog.style.zIndex = zIndex + 1;

      // Show backdrop
      if (backdrop) {
        backdrop.hidden = false;
        if (config.animated) {
          backdrop.style.opacity = "0";
          backdrop.offsetHeight;
          backdrop.style.transition = `opacity ${config.duration}ms ease`;
          backdrop.style.opacity = "1";
        }
      }

      // Show dialog
      dialog.hidden = false;
      if (config.animated) {
        dialog.style.opacity = "0";
        dialog.style.transform = "scale(0.9) translateY(-20px)";
        dialog.offsetHeight;
        dialog.style.transition = `opacity ${config.duration}ms ease, transform ${config.duration}ms ease`;
        dialog.style.opacity = "1";
        dialog.style.transform = "scale(1) translateY(0)";
      }

      // Add to stack
      this.stack.push(dialogId);
      state.isOpen = true;

      // Prevent body scroll
      if (this.stack.length === 1) {
        document.body.style.overflow = "hidden";
      }

      // Focus first focusable element
      setTimeout(() => {
        this._focusFirst(state);
      }, config.duration);

      // Setup focus trap
      dialog.addEventListener("keydown", this._trapFocus.bind(this, state));

      // Callback
      if (config.onOpen) {
        config.onOpen(state);
      }
    }

    /**
     * Close dialog
     */
    close(dialogId, result) {
      const state = this.instances.get(dialogId);
      if (!state || !state.isOpen) return;

      const { dialog, backdrop, config } = state;

      // Animate out
      if (config.animated) {
        if (backdrop) {
          backdrop.style.opacity = "0";
        }
        dialog.style.opacity = "0";
        dialog.style.transform = "scale(0.9) translateY(-20px)";

        setTimeout(() => {
          this._finishClose(state);
        }, config.duration);
      } else {
        this._finishClose(state);
      }

      // Store result for promises
      state.result = result;

      // Callback
      if (config.onClose) {
        config.onClose(state, result);
      }
    }

    /**
     * Finish close
     */
    _finishClose(state) {
      const { dialog, backdrop } = state;

      dialog.hidden = true;
      dialog.style.transition = "";

      if (backdrop) {
        backdrop.hidden = true;
        backdrop.style.transition = "";
      }

      // Remove from stack
      const index = this.stack.indexOf(state.id);
      if (index !== -1) {
        this.stack.splice(index, 1);
      }

      state.isOpen = false;

      // Restore body scroll
      if (this.stack.length === 0) {
        document.body.style.overflow = "";
      }

      // Restore focus
      if (state.previousActiveElement) {
        state.previousActiveElement.focus();
      }
    }

    /**
     * Toggle dialog
     */
    toggle(dialogId) {
      const state = this.instances.get(dialogId);
      if (!state) return;

      if (state.isOpen) {
        this.close(dialogId);
      } else {
        this.open(dialogId);
      }
    }

    // ============================================================
    // FOCUS MANAGEMENT
    // ============================================================

    /**
     * Update focusable elements
     */
    _updateFocusableElements(state) {
      const selector =
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
      state.focusableElements = Array.from(
        state.dialog.querySelectorAll(selector),
      ).filter((el) => !el.disabled);
    }

    /**
     * Focus first focusable element
     */
    _focusFirst(state) {
      if (state.focusableElements.length > 0) {
        state.focusableElements[0].focus();
      }
    }

    /**
     * Trap focus within dialog
     */
    _trapFocus(state, e) {
      if (e.key !== "Tab") return;

      const { focusableElements } = state;
      if (focusableElements.length === 0) return;

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    // ============================================================
    // CONTENT UPDATES
    // ============================================================

    /**
     * Set content
     */
    setContent(dialogId, content) {
      const state = this.instances.get(dialogId);
      if (!state) return;

      this._setContent(state.bodyEl, content, state.config.html);
      this._updateFocusableElements(state);
    }

    /**
     * Set title
     */
    setTitle(dialogId, title) {
      const state = this.instances.get(dialogId);
      if (!state || !state.titleEl) return;

      state.titleEl.textContent = title;
    }

    // ============================================================
    // DESTROY
    // ============================================================

    /**
     * Destroy dialog
     */
    destroy(dialogId) {
      const state = this.instances.get(dialogId);
      if (!state) return;

      if (state.isOpen) {
        this.close(dialogId);
      }

      state.dialog.remove();
      if (state.backdrop) {
        state.backdrop.remove();
      }

      this.instances.delete(dialogId);
    }

    // ============================================================
    // CONVENIENCE METHODS
    // ============================================================

    /**
     * Alert dialog
     */
    alert(message, options = {}) {
      return new Promise((resolve) => {
        const dialog = this.create({
          title: options.title || "Alert",
          content: message,
          type: "alert",
          size: "small",
          buttons: [
            {
              text: options.okText || "OK",
              primary: true,
              action: () => resolve(true),
            },
          ],
          onClose: () => resolve(true),
          ...options,
        });

        dialog.open();
      });
    }

    /**
     * Confirm dialog
     */
    confirm(message, options = {}) {
      return new Promise((resolve) => {
        const dialog = this.create({
          title: options.title || "Confirm",
          content: message,
          type: "confirm",
          size: "small",
          buttons: [
            {
              text: options.cancelText || "Cancel",
              action: () => {
                resolve(false);
              },
            },
            {
              text: options.okText || "OK",
              primary: true,
              action: () => {
                resolve(true);
              },
            },
          ],
          closeOnBackdrop: false,
          onClose: () => resolve(false),
          ...options,
        });

        dialog.open();
      });
    }

    /**
     * Prompt dialog
     */
    prompt(message, options = {}) {
      return new Promise((resolve) => {
        const inputId = `prompt-input-${this.idCounter}`;
        const content = `
                    <p>${message}</p>
                    <input type="${options.type || "text"}"
                           id="${inputId}"
                           class="bael-dialog-input"
                           value="${options.defaultValue || ""}"
                           placeholder="${options.placeholder || ""}">
                `;

        const dialog = this.create({
          title: options.title || "Input",
          content,
          type: "prompt",
          size: "small",
          buttons: [
            {
              text: options.cancelText || "Cancel",
              action: () => {
                resolve(null);
              },
            },
            {
              text: options.okText || "OK",
              primary: true,
              action: (state) => {
                const input = state.dialog.querySelector(`#${inputId}`);
                resolve(input.value);
              },
            },
          ],
          closeOnBackdrop: false,
          onOpen: (state) => {
            setTimeout(() => {
              const input = state.dialog.querySelector(`#${inputId}`);
              if (input) input.focus();
            }, 50);
          },
          onClose: () => resolve(null),
          ...options,
        });

        dialog.open();
      });
    }

    /**
     * Loading dialog
     */
    loading(message = "Loading...", options = {}) {
      const content = `
                <div class="bael-dialog-loading">
                    <div class="bael-dialog-spinner"></div>
                    <p>${message}</p>
                </div>
            `;

      const dialog = this.create({
        content,
        size: "small",
        closeButton: false,
        closeOnBackdrop: false,
        closeOnEscape: false,
        ...options,
      });

      dialog.open();
      return dialog;
    }

    /**
     * Close all dialogs
     */
    closeAll() {
      const ids = [...this.stack];
      ids.forEach((id) => this.close(id));
    }

    /**
     * Show a quick modal
     */
    show(content, options = {}) {
      const dialog = this.create({
        content,
        ...options,
      });
      dialog.open();
      return dialog;
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelDialog();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$dialog = (options) => bael.create(options);
  window.$alert = (msg, opts) => bael.alert(msg, opts);
  window.$confirm = (msg, opts) => bael.confirm(msg, opts);
  window.$prompt = (msg, opts) => bael.prompt(msg, opts);
  window.$loading = (msg, opts) => bael.loading(msg, opts);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelDialog = bael;

  console.log("🪟 BAEL Dialog Component loaded");
})();
