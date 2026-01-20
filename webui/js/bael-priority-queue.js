/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ██████╗ ██████╗ ██╗ ██████╗ ██████╗ ██╗████████╗██╗   ██╗               █
 * █  ██╔══██╗██╔══██╗██║██╔═══██╗██╔══██╗██║╚══██╔══╝╚██╗ ██╔╝               █
 * █  ██████╔╝██████╔╝██║██║   ██║██████╔╝██║   ██║    ╚████╔╝                █
 * █  ██╔═══╝ ██╔══██╗██║██║   ██║██╔══██╗██║   ██║     ╚██╔╝                 █
 * █  ██║     ██║  ██║██║╚██████╔╝██║  ██║██║   ██║      ██║                  █
 * █  ╚═╝     ╚═╝  ╚═╝╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝   ╚═╝      ╚═╝                  █
 * █                                                                          █
 * █   BAEL PRIORITY QUEUE - Task Queue & Request Prioritization             █
 * █   Queue up prompts, prioritize requests, and manage task order          █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelPriorityQueue {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.queue = [];
      this.storageKey = "bael-priority-queue";
    }

    async initialize() {
      console.log("📋 Bael Priority Queue initializing...");

      this.loadQueue();
      this.injectStyles();
      this.createWidget();
      this.createPanel();
      this.setupShortcuts();

      this.initialized = true;
      console.log("✅ BAEL PRIORITY QUEUE READY (Ctrl+Shift+Q)");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-priorityqueue-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-priorityqueue-styles";
      styles.textContent = `
                /* Widget */
                .bael-pqueue-widget {
                    position: fixed;
                    right: 20px;
                    bottom: 80px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    z-index: 9300;
                }

                .pqueue-btn {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #14b8a6, #0d9488);
                    border: none;
                    color: #fff;
                    font-size: 18px;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(20, 184, 166, 0.4);
                    transition: all 0.3s;
                    position: relative;
                }

                .pqueue-btn:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(20, 184, 166, 0.5);
                }

                .pqueue-badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    min-width: 18px;
                    height: 18px;
                    padding: 0 4px;
                    border-radius: 9px;
                    background: #ef4444;
                    color: #fff;
                    font-size: 10px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .pqueue-add-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px dashed rgba(255, 255, 255, 0.2);
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 18px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .pqueue-add-btn:hover {
                    background: rgba(20, 184, 166, 0.2);
                    border-color: #14b8a6;
                    color: #14b8a6;
                }

                /* Panel */
                .bael-pqueue-panel {
                    position: fixed;
                    right: 20px;
                    bottom: 130px;
                    width: 360px;
                    max-height: 500px;
                    background: #12121a;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    z-index: 9400;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                }

                .bael-pqueue-panel.visible {
                    display: flex;
                    animation: pqueueIn 0.25s ease-out;
                }

                @keyframes pqueueIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .pqueue-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .pqueue-title {
                    font-size: 15px;
                    font-weight: 700;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .pqueue-actions {
                    display: flex;
                    gap: 4px;
                }

                .pqueue-action {
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 14px;
                }

                .pqueue-action:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                /* Queue List */
                .pqueue-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px;
                    max-height: 350px;
                }

                .pqueue-item {
                    display: flex;
                    gap: 10px;
                    padding: 12px;
                    border-radius: 10px;
                    background: rgba(255, 255, 255, 0.02);
                    margin-bottom: 6px;
                    transition: all 0.2s;
                    cursor: grab;
                }

                .pqueue-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .pqueue-item.dragging {
                    opacity: 0.5;
                    cursor: grabbing;
                }

                .pqueue-handle {
                    color: rgba(255, 255, 255, 0.3);
                    cursor: grab;
                    font-size: 14px;
                }

                .pqueue-priority {
                    width: 6px;
                    border-radius: 3px;
                    flex-shrink: 0;
                }

                .pqueue-priority.high { background: #ef4444; }
                .pqueue-priority.medium { background: #f59e0b; }
                .pqueue-priority.low { background: #10b981; }

                .pqueue-content {
                    flex: 1;
                    min-width: 0;
                }

                .pqueue-text {
                    font-size: 13px;
                    color: #fff;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin-bottom: 4px;
                }

                .pqueue-meta {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    display: flex;
                    gap: 8px;
                }

                .pqueue-item-actions {
                    display: flex;
                    gap: 4px;
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .pqueue-item:hover .pqueue-item-actions {
                    opacity: 1;
                }

                .pqueue-item-action {
                    width: 26px;
                    height: 26px;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 12px;
                }

                .pqueue-item-action:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                .pqueue-item-action.run {
                    background: rgba(20, 184, 166, 0.2);
                    color: #14b8a6;
                }

                .pqueue-item-action.run:hover {
                    background: #14b8a6;
                    color: #000;
                }

                /* Empty State */
                .pqueue-empty {
                    text-align: center;
                    padding: 40px 20px;
                    color: rgba(255, 255, 255, 0.4);
                }

                .pqueue-empty-icon {
                    font-size: 40px;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }

                /* Add Form */
                .pqueue-add-form {
                    padding: 12px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }

                .pqueue-add-input {
                    width: 100%;
                    padding: 10px 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 13px;
                    outline: none;
                    margin-bottom: 8px;
                }

                .pqueue-add-input:focus {
                    border-color: rgba(20, 184, 166, 0.5);
                }

                .pqueue-add-row {
                    display: flex;
                    gap: 8px;
                }

                .pqueue-priority-select {
                    flex: 1;
                    padding: 8px 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 12px;
                    outline: none;
                }

                .pqueue-add-submit {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: none;
                    background: linear-gradient(135deg, #14b8a6, #0d9488);
                    color: #fff;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                }
            `;
      document.head.appendChild(styles);
    }

    createWidget() {
      this.widget = document.createElement("div");
      this.widget.className = "bael-pqueue-widget";
      this.updateWidget();
      document.body.appendChild(this.widget);
    }

    updateWidget() {
      this.widget.innerHTML = `
                <button class="pqueue-add-btn" onclick="BaelPriorityQueue.quickAdd()" title="Quick Add to Queue">+</button>
                <button class="pqueue-btn" onclick="BaelPriorityQueue.toggle()" title="Task Queue (Ctrl+Shift+Q)">
                    📋
                    ${this.queue.length > 0 ? `<span class="pqueue-badge">${this.queue.length}</span>` : ""}
                </button>
            `;
    }

    createPanel() {
      this.panel = document.createElement("div");
      this.panel.className = "bael-pqueue-panel";
      document.body.appendChild(this.panel);
    }

    renderPanel() {
      this.panel.innerHTML = `
                <div class="pqueue-header">
                    <div class="pqueue-title">
                        <span>📋</span>
                        Priority Queue
                        <span style="opacity: 0.5; font-size: 12px;">(${this.queue.length})</span>
                    </div>
                    <div class="pqueue-actions">
                        <button class="pqueue-action" onclick="BaelPriorityQueue.runNext()" title="Run Next">▶</button>
                        <button class="pqueue-action" onclick="BaelPriorityQueue.clearAll()" title="Clear All">🗑️</button>
                        <button class="pqueue-action" onclick="BaelPriorityQueue.hide()">✕</button>
                    </div>
                </div>

                <div class="pqueue-list" id="pqueue-list">
                    ${this.renderQueue()}
                </div>

                <div class="pqueue-add-form">
                    <input type="text" class="pqueue-add-input" id="pqueue-input"
                           placeholder="Enter prompt or task..."
                           onkeydown="if(event.key==='Enter') BaelPriorityQueue.addItem()">
                    <div class="pqueue-add-row">
                        <select class="pqueue-priority-select" id="pqueue-priority">
                            <option value="high">🔴 High Priority</option>
                            <option value="medium" selected>🟡 Medium</option>
                            <option value="low">🟢 Low Priority</option>
                        </select>
                        <button class="pqueue-add-submit" onclick="BaelPriorityQueue.addItem()">Add to Queue</button>
                    </div>
                </div>
            `;

      this.setupDragDrop();
    }

    renderQueue() {
      if (this.queue.length === 0) {
        return `
                    <div class="pqueue-empty">
                        <div class="pqueue-empty-icon">📋</div>
                        <div>Queue is empty</div>
                        <div style="font-size: 12px; margin-top: 4px;">Add prompts to run in order</div>
                    </div>
                `;
      }

      return this.queue
        .map(
          (item, index) => `
                <div class="pqueue-item" data-index="${index}" draggable="true">
                    <span class="pqueue-handle">⋮⋮</span>
                    <div class="pqueue-priority ${item.priority}"></div>
                    <div class="pqueue-content">
                        <div class="pqueue-text">${this.escapeHtml(item.text)}</div>
                        <div class="pqueue-meta">
                            <span>#${index + 1}</span>
                            <span>${item.priority}</span>
                            <span>${this.formatTime(item.createdAt)}</span>
                        </div>
                    </div>
                    <div class="pqueue-item-actions">
                        <button class="pqueue-item-action run" onclick="BaelPriorityQueue.runItem(${index})" title="Run Now">▶</button>
                        <button class="pqueue-item-action" onclick="BaelPriorityQueue.editItem(${index})" title="Edit">✏️</button>
                        <button class="pqueue-item-action" onclick="BaelPriorityQueue.removeItem(${index})" title="Remove">🗑️</button>
                    </div>
                </div>
            `,
        )
        .join("");
    }

    setupDragDrop() {
      const list = document.getElementById("pqueue-list");
      if (!list) return;

      let draggedIndex = null;

      list.addEventListener("dragstart", (e) => {
        const item = e.target.closest(".pqueue-item");
        if (item) {
          draggedIndex = parseInt(item.dataset.index);
          item.classList.add("dragging");
        }
      });

      list.addEventListener("dragend", (e) => {
        const item = e.target.closest(".pqueue-item");
        if (item) {
          item.classList.remove("dragging");
        }
      });

      list.addEventListener("dragover", (e) => {
        e.preventDefault();
        const item = e.target.closest(".pqueue-item");
        if (item && draggedIndex !== null) {
          const targetIndex = parseInt(item.dataset.index);
          if (targetIndex !== draggedIndex) {
            this.moveItem(draggedIndex, targetIndex);
            draggedIndex = targetIndex;
            this.renderPanel();
          }
        }
      });
    }

    addItem() {
      const input = document.getElementById("pqueue-input");
      const prioritySelect = document.getElementById("pqueue-priority");

      const text = input?.value.trim();
      const priority = prioritySelect?.value || "medium";

      if (!text) {
        this.showToast("Enter a prompt or task");
        return;
      }

      this.queue.push({
        id: Date.now(),
        text,
        priority,
        createdAt: Date.now(),
      });

      // Sort by priority
      this.sortQueue();
      this.saveQueue();

      if (input) input.value = "";

      this.renderPanel();
      this.updateWidget();
      this.showToast("Added to queue!");
    }

    quickAdd() {
      // Get current input value if any
      const chatInput = document.querySelector("textarea, #chat-input");
      const currentText = chatInput?.value?.trim();

      if (currentText) {
        this.queue.push({
          id: Date.now(),
          text: currentText,
          priority: "medium",
          createdAt: Date.now(),
        });

        this.sortQueue();
        this.saveQueue();
        this.updateWidget();

        if (chatInput) chatInput.value = "";

        this.showToast("Added to queue!");
      } else {
        this.show();
      }
    }

    runItem(index) {
      const item = this.queue[index];
      if (!item) return;

      // Insert into chat input
      const chatInput = document.querySelector(
        'textarea, #chat-input, [contenteditable="true"]',
      );
      if (chatInput) {
        if (chatInput.tagName === "TEXTAREA" || chatInput.tagName === "INPUT") {
          chatInput.value = item.text;
          chatInput.dispatchEvent(new Event("input", { bubbles: true }));
        } else {
          chatInput.innerText = item.text;
        }
        chatInput.focus();
      }

      // Remove from queue
      this.queue.splice(index, 1);
      this.saveQueue();
      this.renderPanel();
      this.updateWidget();

      this.showToast("Prompt loaded! Press Enter to send");
      this.hide();
    }

    runNext() {
      if (this.queue.length > 0) {
        this.runItem(0);
      } else {
        this.showToast("Queue is empty");
      }
    }

    editItem(index) {
      const item = this.queue[index];
      if (!item) return;

      const newText = prompt("Edit prompt:", item.text);
      if (newText !== null && newText.trim()) {
        item.text = newText.trim();
        this.saveQueue();
        this.renderPanel();
      }
    }

    removeItem(index) {
      this.queue.splice(index, 1);
      this.saveQueue();
      this.renderPanel();
      this.updateWidget();
    }

    moveItem(fromIndex, toIndex) {
      const item = this.queue.splice(fromIndex, 1)[0];
      this.queue.splice(toIndex, 0, item);
      this.saveQueue();
    }

    clearAll() {
      if (this.queue.length === 0) return;

      if (confirm("Clear all queued items?")) {
        this.queue = [];
        this.saveQueue();
        this.renderPanel();
        this.updateWidget();
        this.showToast("Queue cleared");
      }
    }

    sortQueue() {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      this.queue.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
      );
    }

    formatTime(timestamp) {
      const diff = Date.now() - timestamp;
      if (diff < 60000) return "Just now";
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      return `${Math.floor(diff / 3600000)}h ago`;
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    showToast(message) {
      const toast = document.createElement("div");
      toast.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(20, 184, 166, 0.9);
                color: #fff;
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 13px;
                z-index: 9999;
            `;
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }

    saveQueue() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.queue));
      } catch (e) {
        console.error("Failed to save queue:", e);
      }
    }

    loadQueue() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          this.queue = JSON.parse(saved);
        }
      } catch (e) {
        console.error("Failed to load queue:", e);
      }
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "Q") {
          e.preventDefault();
          this.toggle();
        }

        if (e.key === "Escape" && this.visible) {
          this.hide();
        }
      });
    }

    toggle() {
      if (this.visible) {
        this.hide();
      } else {
        this.show();
      }
    }

    show() {
      this.visible = true;
      this.renderPanel();
      this.panel.classList.add("visible");
    }

    hide() {
      this.visible = false;
      this.panel.classList.remove("visible");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelPriorityQueue = new BaelPriorityQueue();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelPriorityQueue.initialize();
    });
  } else {
    window.BaelPriorityQueue.initialize();
  }

  console.log("📋 Bael Priority Queue loaded");
})();
