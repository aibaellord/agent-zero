/**
 * Bael Scratch Pad - Floating scratchpad for temporary notes
 * Keyboard: Ctrl+Shift+X to toggle
 */
(function () {
  "use strict";

  class BaelScratchPad {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.storageKey = "bael-scratch-pad";
      this.pads = [];
      this.currentPad = null;
      this.position = { x: 120, y: 120 };
      this.size = { w: 340, h: 420 };
    }

    async initialize() {
      this.loadFromStorage();
      this.injectStyles();
      this.createElements();
      this.setupShortcuts();
      this.initialized = true;
      console.log("✏️ Bael Scratch Pad initialized");
    }

    injectStyles() {
      if (document.getElementById("bael-scratch-pad-styles")) return;

      const css = `
                .bael-scratch-fab {
                    position: fixed;
                    bottom: 420px;
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

                .bael-scratch-fab:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(249, 115, 22, 0.5);
                }

                .bael-scratch-window {
                    position: fixed;
                    background: linear-gradient(135deg, #1e1e2e, #2a2a3e);
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    z-index: 10000;
                    opacity: 0;
                    visibility: hidden;
                    transform: scale(0.9);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    border: 1px solid rgba(249, 115, 22, 0.3);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    resize: both;
                    min-width: 280px;
                    min-height: 300px;
                }

                .bael-scratch-window.visible {
                    opacity: 1;
                    visibility: visible;
                    transform: scale(1);
                }

                .bael-scratch-header {
                    background: linear-gradient(135deg, #f97316, #ea580c);
                    padding: 12px 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    cursor: move;
                    user-select: none;
                }

                .bael-scratch-title {
                    color: white;
                    font-size: 14px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bael-scratch-actions {
                    display: flex;
                    gap: 6px;
                }

                .bael-scratch-action {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 26px;
                    height: 26px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                }

                .bael-scratch-action:hover {
                    background: rgba(255,255,255,0.3);
                }

                .bael-scratch-tabs {
                    display: flex;
                    background: rgba(0,0,0,0.2);
                    padding: 8px 8px 0;
                    gap: 4px;
                    overflow-x: auto;
                }

                .bael-scratch-tab {
                    padding: 8px 14px;
                    background: transparent;
                    border: none;
                    color: #888;
                    font-size: 12px;
                    cursor: pointer;
                    border-radius: 8px 8px 0 0;
                    white-space: nowrap;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .bael-scratch-tab.active {
                    background: rgba(249, 115, 22, 0.15);
                    color: #f97316;
                }

                .bael-scratch-tab:hover:not(.active) {
                    background: rgba(255,255,255,0.05);
                    color: #ccc;
                }

                .bael-scratch-tab-close {
                    opacity: 0;
                    font-size: 10px;
                    padding: 2px 4px;
                    border-radius: 4px;
                    transition: all 0.2s;
                }

                .bael-scratch-tab:hover .bael-scratch-tab-close {
                    opacity: 1;
                }

                .bael-scratch-tab-close:hover {
                    background: rgba(239, 68, 68, 0.3);
                    color: #ef4444;
                }

                .bael-scratch-add-tab {
                    padding: 8px 12px;
                    background: transparent;
                    border: none;
                    color: #666;
                    font-size: 16px;
                    cursor: pointer;
                    transition: color 0.2s;
                }

                .bael-scratch-add-tab:hover {
                    color: #f97316;
                }

                .bael-scratch-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .bael-scratch-editor {
                    flex: 1;
                    padding: 16px;
                    background: transparent;
                    border: none;
                    color: #e0e0e0;
                    font-size: 14px;
                    line-height: 1.6;
                    resize: none;
                    font-family: 'Consolas', 'Monaco', monospace;
                }

                .bael-scratch-editor::placeholder {
                    color: #555;
                }

                .bael-scratch-footer {
                    padding: 10px 16px;
                    background: rgba(0,0,0,0.2);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 11px;
                    color: #666;
                }

                .bael-scratch-stats {
                    display: flex;
                    gap: 12px;
                }

                .bael-scratch-footer-btns {
                    display: flex;
                    gap: 8px;
                }

                .bael-scratch-footer-btn {
                    background: rgba(255,255,255,0.1);
                    border: none;
                    color: #888;
                    padding: 4px 10px;
                    border-radius: 4px;
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .bael-scratch-footer-btn:hover {
                    background: rgba(255,255,255,0.15);
                    color: #ccc;
                }

                .bael-scratch-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: #555;
                    gap: 12px;
                }

                .bael-scratch-empty-icon {
                    font-size: 40px;
                    opacity: 0.5;
                }

                .bael-scratch-new-btn {
                    background: linear-gradient(135deg, #f97316, #ea580c);
                    border: none;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .bael-scratch-new-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
                }
            `;

      const style = document.createElement("style");
      style.id = "bael-scratch-pad-styles";
      style.textContent = css;
      document.head.appendChild(style);
    }

    createElements() {
      // FAB Button
      this.fab = document.createElement("button");
      this.fab.className = "bael-scratch-fab";
      this.fab.innerHTML = "✏️";
      this.fab.title = "Scratch Pad (Ctrl+Shift+X)";
      this.fab.addEventListener("click", () => this.toggle());
      document.body.appendChild(this.fab);

      // Window
      this.window = document.createElement("div");
      this.window.className = "bael-scratch-window";
      this.window.style.left = this.position.x + "px";
      this.window.style.top = this.position.y + "px";
      this.window.style.width = this.size.w + "px";
      this.window.style.height = this.size.h + "px";

      this.window.innerHTML = `
                <div class="bael-scratch-header">
                    <div class="bael-scratch-title">
                        <span>✏️</span>
                        <span>Scratch Pad</span>
                    </div>
                    <div class="bael-scratch-actions">
                        <button class="bael-scratch-action" id="bael-scratch-clear" title="Clear">🗑️</button>
                        <button class="bael-scratch-action" id="bael-scratch-close" title="Close">×</button>
                    </div>
                </div>
                <div class="bael-scratch-tabs" id="bael-scratch-tabs">
                    <button class="bael-scratch-add-tab" id="bael-scratch-add" title="New pad">+</button>
                </div>
                <div class="bael-scratch-content" id="bael-scratch-content">
                    <div class="bael-scratch-empty">
                        <div class="bael-scratch-empty-icon">✏️</div>
                        <div>No scratch pads</div>
                        <button class="bael-scratch-new-btn" id="bael-scratch-create-first">Create Pad</button>
                    </div>
                </div>
            `;
      document.body.appendChild(this.window);

      // Events
      this.window
        .querySelector("#bael-scratch-close")
        .addEventListener("click", () => this.hide());
      this.window
        .querySelector("#bael-scratch-add")
        .addEventListener("click", () => this.createPad());
      this.window
        .querySelector("#bael-scratch-clear")
        .addEventListener("click", () => this.clearCurrent());
      this.window
        .querySelector("#bael-scratch-create-first")
        ?.addEventListener("click", () => this.createPad());

      this.setupDrag();
      this.renderTabs();
    }

    setupDrag() {
      const header = this.window.querySelector(".bael-scratch-header");
      let isDragging = false;
      let startX, startY, startLeft, startTop;

      header.addEventListener("mousedown", (e) => {
        if (e.target.closest(".bael-scratch-action")) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = this.window.offsetLeft;
        startTop = this.window.offsetTop;
        document.body.style.userSelect = "none";
      });

      document.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        this.window.style.left = startLeft + e.clientX - startX + "px";
        this.window.style.top = startTop + e.clientY - startY + "px";
      });

      document.addEventListener("mouseup", () => {
        if (isDragging) {
          isDragging = false;
          document.body.style.userSelect = "";
          this.position.x = this.window.offsetLeft;
          this.position.y = this.window.offsetTop;
          this.saveToStorage();
        }
      });
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "X") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape" && this.visible) {
          this.hide();
        }
      });
    }

    createPad() {
      const pad = {
        id: Date.now().toString(),
        title: "Pad " + (this.pads.length + 1),
        content: "",
        created: Date.now(),
      };

      this.pads.push(pad);
      this.currentPad = pad.id;
      this.renderTabs();
      this.renderContent();
      this.saveToStorage();

      setTimeout(() => {
        const editor = this.window.querySelector(".bael-scratch-editor");
        if (editor) editor.focus();
      }, 100);
    }

    deletePad(id) {
      const index = this.pads.findIndex((p) => p.id === id);
      if (index === -1) return;

      this.pads.splice(index, 1);

      if (this.currentPad === id) {
        this.currentPad = this.pads.length > 0 ? this.pads[0].id : null;
      }

      this.renderTabs();
      this.renderContent();
      this.saveToStorage();
    }

    selectPad(id) {
      this.currentPad = id;
      this.renderTabs();
      this.renderContent();
    }

    updatePad(content) {
      const pad = this.pads.find((p) => p.id === this.currentPad);
      if (!pad) return;

      pad.content = content;

      const firstLine = content.split("\n")[0].trim();
      if (firstLine) {
        pad.title =
          firstLine.substring(0, 25) + (firstLine.length > 25 ? "..." : "");
      }

      this.renderTabs();
      this.saveToStorage();
    }

    clearCurrent() {
      const pad = this.pads.find((p) => p.id === this.currentPad);
      if (!pad) return;

      pad.content = "";
      pad.title = "Pad " + (this.pads.indexOf(pad) + 1);

      this.renderContent();
      this.renderTabs();
      this.saveToStorage();
    }

    renderTabs() {
      const container = this.window.querySelector("#bael-scratch-tabs");
      const addBtn = container.querySelector("#bael-scratch-add");

      container
        .querySelectorAll(".bael-scratch-tab")
        .forEach((t) => t.remove());

      this.pads.forEach((pad) => {
        const tab = document.createElement("button");
        tab.className = `bael-scratch-tab ${pad.id === this.currentPad ? "active" : ""}`;
        tab.innerHTML = `
                    <span>${pad.title}</span>
                    <span class="bael-scratch-tab-close" data-id="${pad.id}">×</span>
                `;

        tab.addEventListener("click", (e) => {
          if (e.target.classList.contains("bael-scratch-tab-close")) {
            this.deletePad(e.target.dataset.id);
          } else {
            this.selectPad(pad.id);
          }
        });

        container.insertBefore(tab, addBtn);
      });
    }

    renderContent() {
      const container = this.window.querySelector("#bael-scratch-content");

      if (this.pads.length === 0) {
        container.innerHTML = `
                    <div class="bael-scratch-empty">
                        <div class="bael-scratch-empty-icon">✏️</div>
                        <div>No scratch pads</div>
                        <button class="bael-scratch-new-btn" id="bael-scratch-create-first">Create Pad</button>
                    </div>
                `;
        container
          .querySelector("#bael-scratch-create-first")
          .addEventListener("click", () => this.createPad());
        return;
      }

      const pad = this.pads.find((p) => p.id === this.currentPad);
      if (!pad) return;

      const lines = pad.content.split("\n").length;
      const chars = pad.content.length;

      container.innerHTML = `
                <textarea class="bael-scratch-editor" placeholder="Scratch notes here...">${pad.content}</textarea>
                <div class="bael-scratch-footer">
                    <div class="bael-scratch-stats">
                        <span>${lines} lines</span>
                        <span>${chars} chars</span>
                    </div>
                    <div class="bael-scratch-footer-btns">
                        <button class="bael-scratch-footer-btn" id="bael-scratch-copy">📋 Copy</button>
                        <button class="bael-scratch-footer-btn" id="bael-scratch-insert">📥 Insert</button>
                    </div>
                </div>
            `;

      const editor = container.querySelector(".bael-scratch-editor");
      editor.addEventListener("input", (e) => this.updatePad(e.target.value));

      container
        .querySelector("#bael-scratch-copy")
        .addEventListener("click", () => {
          navigator.clipboard.writeText(pad.content);
        });

      container
        .querySelector("#bael-scratch-insert")
        .addEventListener("click", () => {
          const input = document.querySelector(
            '#chat-input, textarea[class*="chat"], [contenteditable="true"]',
          );
          if (input) {
            if (input.value !== undefined) {
              input.value += pad.content;
            } else {
              input.textContent += pad.content;
            }
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.focus();
          }
          this.hide();
        });
    }

    toggle() {
      this.visible ? this.hide() : this.show();
    }

    show() {
      this.window.classList.add("visible");
      this.visible = true;
    }

    hide() {
      this.window.classList.remove("visible");
      this.visible = false;
      this.saveToStorage();
    }

    loadFromStorage() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const data = JSON.parse(saved);
          this.pads = data.pads || [];
          this.currentPad =
            data.currentPad || (this.pads.length > 0 ? this.pads[0].id : null);
          this.position = data.position || this.position;
          this.size = data.size || this.size;
        }
      } catch (e) {}
    }

    saveToStorage() {
      try {
        localStorage.setItem(
          this.storageKey,
          JSON.stringify({
            pads: this.pads,
            currentPad: this.currentPad,
            position: this.position,
            size: this.size,
          }),
        );
      } catch (e) {}
    }
  }

  window.BaelScratchPad = new BaelScratchPad();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelScratchPad.initialize();
    });
  } else {
    window.BaelScratchPad.initialize();
  }
})();
