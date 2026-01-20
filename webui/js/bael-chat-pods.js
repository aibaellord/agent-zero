/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   ██████╗██╗  ██╗ █████╗ ████████╗    ██████╗ ██████╗ ██████╗ ███████╗   █
 * █  ██╔════╝██║  ██║██╔══██╗╚══██╔══╝    ██╔══██╗██╔══██╗██╔══██╗██╔════╝   █
 * █  ██║     ███████║███████║   ██║       ██████╔╝██████╔╝██║  ██║███████╗   █
 * █  ██║     ██╔══██║██╔══██║   ██║       ██╔═══╝ ██╔══██╗██║  ██║╚════██║   █
 * █  ╚██████╗██║  ██║██║  ██║   ██║       ██║     ██║  ██║██████╔╝███████║   █
 * █   ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝       ╚═╝     ╚═╝  ╚═╝╚═════╝ ╚══════╝   █
 * █                                                                          █
 * █   BAEL CHAT PODS - Organize Conversations into Topic Pods               █
 * █   Group related messages, create topic threads, and navigate easily     █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelChatPods {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.pods = [];
      this.activePod = null;
      this.storageKey = "bael-chat-pods";
    }

    async initialize() {
      console.log("📦 Bael Chat Pods initializing...");

      this.loadFromStorage();
      this.injectStyles();
      this.createSidebar();
      this.createFAB();
      this.setupShortcuts();

      this.initialized = true;
      console.log("✅ BAEL CHAT PODS READY (Ctrl+Shift+P)");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-chatpods-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-chatpods-styles";
      styles.textContent = `
                /* FAB Button */
                .bael-pods-fab {
                    position: fixed;
                    left: 20px;
                    bottom: 140px;
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #8b5cf6, #6366f1);
                    border: none;
                    color: #fff;
                    font-size: 18px;
                    cursor: pointer;
                    z-index: 9300;
                    box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);
                    transition: all 0.3s;
                }

                .bael-pods-fab:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(139, 92, 246, 0.5);
                }

                .bael-pods-fab .badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #ef4444;
                    color: #fff;
                    font-size: 10px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                /* Pods Sidebar */
                .bael-pods-sidebar {
                    position: fixed;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 300px;
                    background: #12121a;
                    border-right: 1px solid rgba(255, 255, 255, 0.1);
                    z-index: 9600;
                    display: none;
                    flex-direction: column;
                    box-shadow: 10px 0 40px rgba(0, 0, 0, 0.3);
                }

                .bael-pods-sidebar.visible {
                    display: flex;
                    animation: podsSidebarIn 0.3s ease-out;
                }

                @keyframes podsSidebarIn {
                    from {
                        transform: translateX(-100%);
                    }
                    to {
                        transform: translateX(0);
                    }
                }

                .pods-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .pods-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .pods-close {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 18px;
                }

                .pods-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                /* Search */
                .pods-search {
                    padding: 12px 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .pods-search-input {
                    width: 100%;
                    padding: 10px 14px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 10px;
                    color: #fff;
                    font-size: 13px;
                    outline: none;
                }

                .pods-search-input:focus {
                    border-color: rgba(139, 92, 246, 0.5);
                }

                /* Pod List */
                .pods-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px;
                }

                .pod-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-bottom: 4px;
                }

                .pod-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .pod-item.active {
                    background: rgba(139, 92, 246, 0.15);
                    border-left: 3px solid #8b5cf6;
                    padding-left: 9px;
                }

                .pod-color {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .pod-info {
                    flex: 1;
                    min-width: 0;
                }

                .pod-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: #fff;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .pod-meta {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    display: flex;
                    gap: 8px;
                    margin-top: 2px;
                }

                .pod-actions {
                    display: flex;
                    gap: 4px;
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .pod-item:hover .pod-actions {
                    opacity: 1;
                }

                .pod-action-btn {
                    width: 26px;
                    height: 26px;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.4);
                    cursor: pointer;
                    font-size: 12px;
                }

                .pod-action-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                /* Add Pod Button */
                .pods-add {
                    margin: 12px;
                    padding: 12px;
                    border-radius: 10px;
                    border: 2px dashed rgba(255, 255, 255, 0.1);
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .pods-add:hover {
                    border-color: rgba(139, 92, 246, 0.5);
                    background: rgba(139, 92, 246, 0.05);
                    color: #8b5cf6;
                }

                /* Empty State */
                .pods-empty {
                    text-align: center;
                    padding: 40px 20px;
                    color: rgba(255, 255, 255, 0.4);
                }

                .pods-empty-icon {
                    font-size: 40px;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }

                /* Add Pod Modal */
                .pods-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 380px;
                    background: #12121a;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    z-index: 9700;
                    display: none;
                    overflow: hidden;
                    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
                }

                .pods-modal.visible {
                    display: block;
                    animation: podsModalIn 0.2s ease-out;
                }

                @keyframes podsModalIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }

                .modal-header {
                    padding: 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    font-size: 15px;
                    font-weight: 700;
                    color: #fff;
                }

                .modal-content {
                    padding: 16px;
                }

                .modal-field {
                    margin-bottom: 14px;
                }

                .modal-label {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.6);
                    margin-bottom: 6px;
                }

                .modal-input {
                    width: 100%;
                    padding: 10px 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 13px;
                    outline: none;
                }

                .modal-input:focus {
                    border-color: rgba(139, 92, 246, 0.5);
                }

                .modal-colors {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .modal-color {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    border: 2px solid transparent;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .modal-color:hover, .modal-color.selected {
                    border-color: #fff;
                    transform: scale(1.1);
                }

                .modal-actions {
                    display: flex;
                    gap: 8px;
                    padding: 12px 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }

                .modal-btn {
                    flex: 1;
                    padding: 10px;
                    border-radius: 8px;
                    border: none;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                }

                .modal-btn.primary {
                    background: linear-gradient(135deg, #8b5cf6, #6366f1);
                    color: #fff;
                }

                .modal-btn.secondary {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                .pods-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 9599;
                    display: none;
                }

                .pods-overlay.visible {
                    display: block;
                }
            `;
      document.head.appendChild(styles);
    }

    createSidebar() {
      // Overlay
      this.overlay = document.createElement("div");
      this.overlay.className = "pods-overlay";
      this.overlay.onclick = () => this.hide();
      document.body.appendChild(this.overlay);

      // Sidebar
      this.sidebar = document.createElement("div");
      this.sidebar.className = "bael-pods-sidebar";
      this.renderSidebar();
      document.body.appendChild(this.sidebar);

      // Modal
      this.modal = document.createElement("div");
      this.modal.className = "pods-modal";
      document.body.appendChild(this.modal);
    }

    createFAB() {
      this.fab = document.createElement("button");
      this.fab.className = "bael-pods-fab";
      this.fab.innerHTML = "📦";
      this.fab.title = "Chat Pods (Ctrl+Shift+P)";
      this.fab.onclick = () => this.toggle();
      this.updateFABBadge();
      document.body.appendChild(this.fab);
    }

    renderSidebar() {
      this.sidebar.innerHTML = `
                <div class="pods-header">
                    <div class="pods-title">
                        <span>📦</span>
                        Chat Pods
                    </div>
                    <button class="pods-close" onclick="BaelChatPods.hide()">✕</button>
                </div>

                <div class="pods-search">
                    <input type="text"
                           class="pods-search-input"
                           placeholder="Search pods..."
                           oninput="BaelChatPods.filterPods(this.value)">
                </div>

                <div class="pods-list" id="pods-list">
                    ${this.renderPodsList()}
                </div>

                <button class="pods-add" onclick="BaelChatPods.showAddModal()">
                    <span>➕</span>
                    Create New Pod
                </button>
            `;
    }

    renderPodsList() {
      if (this.pods.length === 0) {
        return `
                    <div class="pods-empty">
                        <div class="pods-empty-icon">📦</div>
                        <div>No pods yet</div>
                        <div style="font-size: 12px; margin-top: 4px;">Create a pod to organize your chats</div>
                    </div>
                `;
      }

      return this.pods
        .map(
          (pod, index) => `
                <div class="pod-item ${this.activePod === pod.id ? "active" : ""}"
                     onclick="BaelChatPods.selectPod('${pod.id}')">
                    <div class="pod-color" style="background: ${pod.color}"></div>
                    <div class="pod-info">
                        <div class="pod-name">${this.escapeHtml(pod.name)}</div>
                        <div class="pod-meta">
                            <span>${pod.messageCount || 0} messages</span>
                            <span>${this.formatTime(pod.lastUpdated)}</span>
                        </div>
                    </div>
                    <div class="pod-actions">
                        <button class="pod-action-btn" onclick="event.stopPropagation(); BaelChatPods.editPod('${pod.id}')" title="Edit">✏️</button>
                        <button class="pod-action-btn" onclick="event.stopPropagation(); BaelChatPods.deletePod('${pod.id}')" title="Delete">🗑️</button>
                    </div>
                </div>
            `,
        )
        .join("");
    }

    showAddModal(editPod = null) {
      const colors = [
        "#ef4444",
        "#f59e0b",
        "#10b981",
        "#3b82f6",
        "#8b5cf6",
        "#ec4899",
        "#6366f1",
        "#14b8a6",
      ];

      this.modal.innerHTML = `
                <div class="modal-header">${editPod ? "Edit Pod" : "Create New Pod"}</div>
                <div class="modal-content">
                    <div class="modal-field">
                        <div class="modal-label">Pod Name</div>
                        <input type="text" class="modal-input" id="pod-name-input"
                               placeholder="e.g., Project Ideas, Code Review..."
                               value="${editPod ? this.escapeHtml(editPod.name) : ""}">
                    </div>
                    <div class="modal-field">
                        <div class="modal-label">Description (optional)</div>
                        <input type="text" class="modal-input" id="pod-desc-input"
                               placeholder="Brief description..."
                               value="${editPod ? this.escapeHtml(editPod.description || "") : ""}">
                    </div>
                    <div class="modal-field">
                        <div class="modal-label">Color</div>
                        <div class="modal-colors" id="color-picker">
                            ${colors
                              .map(
                                (c) => `
                                <div class="modal-color ${editPod?.color === c ? "selected" : ""}"
                                     style="background: ${c}"
                                     data-color="${c}"
                                     onclick="BaelChatPods.selectColor('${c}')"></div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="modal-btn secondary" onclick="BaelChatPods.hideModal()">Cancel</button>
                    <button class="modal-btn primary" onclick="BaelChatPods.savePod('${editPod?.id || ""}')">
                        ${editPod ? "Save Changes" : "Create Pod"}
                    </button>
                </div>
            `;

      this.selectedColor = editPod?.color || colors[0];
      this.modal.classList.add("visible");

      setTimeout(() => {
        document.getElementById("pod-name-input")?.focus();
      }, 50);
    }

    selectColor(color) {
      this.selectedColor = color;
      document.querySelectorAll(".modal-color").forEach((el) => {
        el.classList.toggle("selected", el.dataset.color === color);
      });
    }

    savePod(editId = "") {
      const name = document.getElementById("pod-name-input")?.value.trim();
      const description = document
        .getElementById("pod-desc-input")
        ?.value.trim();

      if (!name) {
        this.showToast("Please enter a pod name");
        return;
      }

      if (editId) {
        // Edit existing
        const pod = this.pods.find((p) => p.id === editId);
        if (pod) {
          pod.name = name;
          pod.description = description;
          pod.color = this.selectedColor;
          pod.lastUpdated = Date.now();
        }
      } else {
        // Create new
        this.pods.unshift({
          id: "pod-" + Date.now(),
          name,
          description,
          color: this.selectedColor,
          messageCount: 0,
          messages: [],
          createdAt: Date.now(),
          lastUpdated: Date.now(),
        });
      }

      this.saveToStorage();
      this.hideModal();
      this.renderSidebar();
      this.updateFABBadge();
      this.showToast(editId ? "Pod updated!" : "Pod created!");
    }

    hideModal() {
      this.modal.classList.remove("visible");
    }

    selectPod(id) {
      this.activePod = this.activePod === id ? null : id;
      this.renderSidebar();

      if (this.activePod) {
        const pod = this.pods.find((p) => p.id === id);
        this.showToast(`📦 Switched to "${pod?.name}"`);
      }
    }

    editPod(id) {
      const pod = this.pods.find((p) => p.id === id);
      if (pod) {
        this.showAddModal(pod);
      }
    }

    deletePod(id) {
      if (confirm("Delete this pod? Messages will be unlinked.")) {
        this.pods = this.pods.filter((p) => p.id !== id);
        if (this.activePod === id) {
          this.activePod = null;
        }
        this.saveToStorage();
        this.renderSidebar();
        this.updateFABBadge();
        this.showToast("Pod deleted");
      }
    }

    filterPods(query) {
      const list = document.getElementById("pods-list");
      if (!list) return;

      const filtered = this.pods.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          (p.description || "").toLowerCase().includes(query.toLowerCase()),
      );

      // Re-render with filtered list
      list.innerHTML =
        filtered.length === 0 && query
          ? `<div class="pods-empty"><div>No pods match "${query}"</div></div>`
          : filtered
              .map(
                (pod) => `
                    <div class="pod-item ${this.activePod === pod.id ? "active" : ""}"
                         onclick="BaelChatPods.selectPod('${pod.id}')">
                        <div class="pod-color" style="background: ${pod.color}"></div>
                        <div class="pod-info">
                            <div class="pod-name">${this.escapeHtml(pod.name)}</div>
                            <div class="pod-meta">
                                <span>${pod.messageCount || 0} messages</span>
                            </div>
                        </div>
                    </div>
                `,
              )
              .join("");
    }

    updateFABBadge() {
      const existingBadge = this.fab.querySelector(".badge");

      if (this.pods.length > 0) {
        if (existingBadge) {
          existingBadge.textContent = this.pods.length;
        } else {
          const badge = document.createElement("span");
          badge.className = "badge";
          badge.textContent = this.pods.length;
          this.fab.appendChild(badge);
        }
      } else if (existingBadge) {
        existingBadge.remove();
      }
    }

    formatTime(timestamp) {
      if (!timestamp) return "";

      const diff = Date.now() - timestamp;
      if (diff < 60000) return "Just now";
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      return new Date(timestamp).toLocaleDateString();
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
                background: rgba(139, 92, 246, 0.9);
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

    saveToStorage() {
      try {
        localStorage.setItem(
          this.storageKey,
          JSON.stringify({
            pods: this.pods,
            activePod: this.activePod,
          }),
        );
      } catch (e) {
        console.error("Failed to save pods:", e);
      }
    }

    loadFromStorage() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const data = JSON.parse(saved);
          this.pods = data.pods || [];
          this.activePod = data.activePod || null;
        }
      } catch (e) {
        console.error("Failed to load pods:", e);
      }
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "P") {
          e.preventDefault();
          this.toggle();
        }

        if (e.key === "Escape") {
          if (this.modal.classList.contains("visible")) {
            this.hideModal();
          } else if (this.visible) {
            this.hide();
          }
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
      this.overlay.classList.add("visible");
      this.sidebar.classList.add("visible");
      this.renderSidebar();
    }

    hide() {
      this.visible = false;
      this.overlay.classList.remove("visible");
      this.sidebar.classList.remove("visible");
    }

    // API for adding messages to active pod
    addMessageToActivePod(messageText) {
      if (!this.activePod) return;

      const pod = this.pods.find((p) => p.id === this.activePod);
      if (pod) {
        pod.messages.push({
          text: messageText.slice(0, 200),
          timestamp: Date.now(),
        });
        pod.messageCount = pod.messages.length;
        pod.lastUpdated = Date.now();
        this.saveToStorage();
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelChatPods = new BaelChatPods();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelChatPods.initialize();
    });
  } else {
    window.BaelChatPods.initialize();
  }

  console.log("📦 Bael Chat Pods loaded");
})();
