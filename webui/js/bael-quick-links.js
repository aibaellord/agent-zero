/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ██████╗ ██╗   ██╗██╗ ██████╗██╗  ██╗    ██╗      ██╗███╗   ██╗██╗  ██╗ █
 * █  ██╔═══██╗██║   ██║██║██╔════╝██║ ██╔╝    ██║      ██║████╗  ██║██║ ██╔╝ █
 * █  ██║   ██║██║   ██║██║██║     █████╔╝     ██║      ██║██╔██╗ ██║█████╔╝  █
 * █  ██║▄▄ ██║██║   ██║██║██║     ██╔═██╗     ██║      ██║██║╚██╗██║██╔═██╗  █
 * █  ╚██████╔╝╚██████╔╝██║╚██████╗██║  ██╗    ███████╗██║██║ ╚████║██║  ██╗ █
 * █   ╚══▀▀═╝  ╚═════╝ ╚═╝ ╚═════╝╚═╝  ╚═╝    ╚══════╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝ █
 * █                                                                          █
 * █   BAEL QUICK LINKS - Fast Access Link Manager                            █
 * █   Save & access frequently used links, bookmarks, resources              █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelQuickLinks {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;
      this.links = [];
      this.categories = [
        "All",
        "Documentation",
        "Tools",
        "APIs",
        "Reference",
        "Other",
      ];
      this.selectedCategory = "All";
      this.searchQuery = "";
    }

    async initialize() {
      console.log("🔗 Bael Quick Links initializing...");

      this.loadLinks();
      this.injectStyles();
      this.createContainer();
      this.setupShortcuts();

      this.initialized = true;
      console.log("✅ BAEL QUICK LINKS READY");

      return this;
    }

    loadLinks() {
      try {
        const saved = localStorage.getItem("bael-quick-links");
        if (saved) {
          this.links = JSON.parse(saved);
        } else {
          // Default useful links
          this.links = [
            {
              id: "1",
              title: "Agent Zero Docs",
              url: "https://github.com/frdel/agent-zero",
              category: "Documentation",
              icon: "📚",
              pinned: true,
            },
            {
              id: "2",
              title: "OpenAI API",
              url: "https://platform.openai.com/docs",
              category: "APIs",
              icon: "🤖",
              pinned: false,
            },
            {
              id: "3",
              title: "Anthropic Docs",
              url: "https://docs.anthropic.com",
              category: "APIs",
              icon: "🧠",
              pinned: false,
            },
            {
              id: "4",
              title: "Alpine.js",
              url: "https://alpinejs.dev/docs",
              category: "Reference",
              icon: "🏔️",
              pinned: false,
            },
            {
              id: "5",
              title: "MDN Web Docs",
              url: "https://developer.mozilla.org",
              category: "Reference",
              icon: "📖",
              pinned: false,
            },
          ];
          this.saveLinks();
        }
      } catch (e) {
        this.links = [];
      }
    }

    saveLinks() {
      try {
        localStorage.setItem("bael-quick-links", JSON.stringify(this.links));
      } catch (e) {}
    }

    injectStyles() {
      if (document.getElementById("bael-quicklinks-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-quicklinks-styles";
      styles.textContent = `
                .bael-quicklinks-container {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.95);
                    width: 600px;
                    max-height: 80vh;
                    background: #12121a;
                    border-radius: 20px;
                    box-shadow: 0 30px 100px rgba(0, 0, 0, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    z-index: 9850;
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: none;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .bael-quicklinks-container.visible {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                    pointer-events: auto;
                }

                .bael-quicklinks-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 9849;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    pointer-events: none;
                }

                .bael-quicklinks-backdrop.visible {
                    opacity: 1;
                    pointer-events: auto;
                }

                .quicklinks-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .quicklinks-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 18px;
                    font-weight: 600;
                    color: #fff;
                }

                .quicklinks-actions {
                    display: flex;
                    gap: 10px;
                }

                .quicklinks-btn {
                    padding: 8px 14px;
                    border-radius: 8px;
                    border: none;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .quicklinks-btn.primary {
                    background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
                    color: #fff;
                }

                .quicklinks-btn.primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }

                .quicklinks-close {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.2s;
                }

                .quicklinks-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .quicklinks-search {
                    padding: 16px 24px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                }

                .search-input {
                    width: 100%;
                    padding: 12px 16px;
                    padding-left: 42px;
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: #fff;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.3)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'%3E%3C/path%3E%3C/svg%3E");
                    background-repeat: no-repeat;
                    background-position: 14px center;
                    background-size: 18px;
                }

                .search-input:focus {
                    border-color: rgba(59, 130, 246, 0.5);
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                .search-input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                .quicklinks-categories {
                    display: flex;
                    gap: 8px;
                    padding: 14px 24px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                    overflow-x: auto;
                    scrollbar-width: none;
                }

                .quicklinks-categories::-webkit-scrollbar {
                    display: none;
                }

                .category-tab {
                    padding: 8px 14px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: all 0.2s;
                }

                .category-tab:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.7);
                }

                .category-tab.active {
                    background: rgba(59, 130, 246, 0.2);
                    color: #3b82f6;
                }

                .quicklinks-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px 24px;
                }

                .links-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 12px;
                }

                .link-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    cursor: pointer;
                    transition: all 0.2s;
                    position: relative;
                    overflow: hidden;
                }

                .link-card:hover {
                    background: rgba(59, 130, 246, 0.08);
                    border-color: rgba(59, 130, 246, 0.3);
                    transform: translateY(-2px);
                }

                .link-card.pinned::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 4px;
                    height: 100%;
                    background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
                }

                .link-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    background: rgba(59, 130, 246, 0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .link-info {
                    flex: 1;
                    min-width: 0;
                }

                .link-title {
                    font-size: 14px;
                    font-weight: 500;
                    color: #fff;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .link-url {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.3);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin-top: 3px;
                }

                .link-actions {
                    display: flex;
                    gap: 6px;
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .link-card:hover .link-actions {
                    opacity: 1;
                }

                .link-action {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    border: none;
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.2s;
                }

                .link-action:hover {
                    background: rgba(255, 255, 255, 0.15);
                    color: #fff;
                }

                .link-action.delete:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .empty-links {
                    text-align: center;
                    padding: 60px 20px;
                    color: rgba(255, 255, 255, 0.3);
                }

                .empty-links-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }

                .add-link-modal {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 0.2s;
                }

                .add-link-modal.visible {
                    opacity: 1;
                    pointer-events: auto;
                }

                .add-link-form {
                    width: 400px;
                    background: #1a1a2e;
                    border-radius: 16px;
                    padding: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .form-title {
                    font-size: 18px;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 20px;
                }

                .form-group {
                    margin-bottom: 16px;
                }

                .form-label {
                    display: block;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                    margin-bottom: 6px;
                }

                .form-input {
                    width: 100%;
                    padding: 10px 14px;
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 14px;
                    outline: none;
                }

                .form-input:focus {
                    border-color: rgba(59, 130, 246, 0.5);
                }

                .form-select {
                    width: 100%;
                    padding: 10px 14px;
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 14px;
                    outline: none;
                    cursor: pointer;
                }

                .form-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                    margin-top: 20px;
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      // Create backdrop
      this.backdrop = document.createElement("div");
      this.backdrop.className = "bael-quicklinks-backdrop";
      this.backdrop.onclick = () => this.hide();
      document.body.appendChild(this.backdrop);

      // Create main container
      this.container = document.createElement("div");
      this.container.id = "bael-quick-links";
      this.container.className = "bael-quicklinks-container";

      this.renderContainer();

      document.body.appendChild(this.container);
    }

    renderContainer() {
      const filteredLinks = this.getFilteredLinks();

      this.container.innerHTML = `
                <div class="quicklinks-header">
                    <div class="quicklinks-title">
                        <span>🔗</span> Quick Links
                    </div>
                    <div class="quicklinks-actions">
                        <button class="quicklinks-btn primary" onclick="BaelQuickLinks.showAddModal()">
                            + Add Link
                        </button>
                        <button class="quicklinks-close" onclick="BaelQuickLinks.hide()">✕</button>
                    </div>
                </div>
                <div class="quicklinks-search">
                    <input type="text" class="search-input"
                           placeholder="Search links..."
                           value="${this.searchQuery}"
                           oninput="BaelQuickLinks.search(this.value)">
                </div>
                <div class="quicklinks-categories">
                    ${this.categories
                      .map(
                        (cat) => `
                        <button class="category-tab ${this.selectedCategory === cat ? "active" : ""}"
                                onclick="BaelQuickLinks.selectCategory('${cat}')">
                            ${cat}
                        </button>
                    `,
                      )
                      .join("")}
                </div>
                <div class="quicklinks-content">
                    ${
                      filteredLinks.length === 0
                        ? `
                        <div class="empty-links">
                            <div class="empty-links-icon">🔗</div>
                            <div>No links found. Add your first link!</div>
                        </div>
                    `
                        : `
                        <div class="links-grid">
                            ${filteredLinks
                              .map(
                                (link) => `
                                <div class="link-card ${link.pinned ? "pinned" : ""}"
                                     onclick="BaelQuickLinks.openLink('${link.url}')">
                                    <div class="link-icon">${link.icon || "🔗"}</div>
                                    <div class="link-info">
                                        <div class="link-title">${link.title}</div>
                                        <div class="link-url">${new URL(link.url).hostname}</div>
                                    </div>
                                    <div class="link-actions" onclick="event.stopPropagation()">
                                        <button class="link-action" onclick="BaelQuickLinks.togglePin('${link.id}')" title="${link.pinned ? "Unpin" : "Pin"}">
                                            ${link.pinned ? "📌" : "📍"}
                                        </button>
                                        <button class="link-action delete" onclick="BaelQuickLinks.deleteLink('${link.id}')" title="Delete">
                                            🗑
                                        </button>
                                    </div>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    `
                    }
                </div>
                <div class="add-link-modal" id="add-link-modal">
                    <div class="add-link-form" onclick="event.stopPropagation()">
                        <div class="form-title">Add New Link</div>
                        <div class="form-group">
                            <label class="form-label">Title</label>
                            <input type="text" class="form-input" id="link-title" placeholder="My Bookmark">
                        </div>
                        <div class="form-group">
                            <label class="form-label">URL</label>
                            <input type="url" class="form-input" id="link-url" placeholder="https://example.com">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Category</label>
                            <select class="form-select" id="link-category">
                                ${this.categories
                                  .filter((c) => c !== "All")
                                  .map(
                                    (cat) => `
                                    <option value="${cat}">${cat}</option>
                                `,
                                  )
                                  .join("")}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Icon (emoji)</label>
                            <input type="text" class="form-input" id="link-icon" placeholder="🔗" maxlength="2">
                        </div>
                        <div class="form-actions">
                            <button class="quicklinks-btn" style="background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7)"
                                    onclick="BaelQuickLinks.hideAddModal()">Cancel</button>
                            <button class="quicklinks-btn primary" onclick="BaelQuickLinks.saveNewLink()">Save Link</button>
                        </div>
                    </div>
                </div>
            `;
    }

    getFilteredLinks() {
      let links = [...this.links];

      // Filter by category
      if (this.selectedCategory !== "All") {
        links = links.filter((l) => l.category === this.selectedCategory);
      }

      // Filter by search
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        links = links.filter(
          (l) =>
            l.title.toLowerCase().includes(q) ||
            l.url.toLowerCase().includes(q),
        );
      }

      // Sort: pinned first, then by title
      links.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return a.title.localeCompare(b.title);
      });

      return links;
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Ctrl+Shift+L for quick links
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "L") {
          e.preventDefault();
          if (this.visible) {
            this.hide();
          } else {
            this.show();
          }
        }

        // Escape to close
        if (e.key === "Escape" && this.visible) {
          const modal = this.container.querySelector(".add-link-modal");
          if (modal?.classList.contains("visible")) {
            this.hideAddModal();
          } else {
            this.hide();
          }
        }
      });
    }

    show() {
      this.visible = true;
      this.backdrop.classList.add("visible");
      this.container.classList.add("visible");
      this.renderContainer();

      setTimeout(() => {
        this.container.querySelector(".search-input")?.focus();
      }, 100);
    }

    hide() {
      this.visible = false;
      this.backdrop.classList.remove("visible");
      this.container.classList.remove("visible");
    }

    search(query) {
      this.searchQuery = query;
      this.renderContainer();
    }

    selectCategory(category) {
      this.selectedCategory = category;
      this.renderContainer();
    }

    openLink(url) {
      window.open(url, "_blank");
    }

    togglePin(id) {
      const link = this.links.find((l) => l.id === id);
      if (link) {
        link.pinned = !link.pinned;
        this.saveLinks();
        this.renderContainer();
      }
    }

    deleteLink(id) {
      if (!confirm("Delete this link?")) return;
      this.links = this.links.filter((l) => l.id !== id);
      this.saveLinks();
      this.renderContainer();
    }

    showAddModal() {
      this.container.querySelector(".add-link-modal").classList.add("visible");
      this.container.querySelector("#link-title")?.focus();
    }

    hideAddModal() {
      this.container
        .querySelector(".add-link-modal")
        .classList.remove("visible");
    }

    saveNewLink() {
      const title = this.container.querySelector("#link-title").value.trim();
      const url = this.container.querySelector("#link-url").value.trim();
      const category = this.container.querySelector("#link-category").value;
      const icon =
        this.container.querySelector("#link-icon").value.trim() || "🔗";

      if (!title || !url) {
        alert("Please enter title and URL");
        return;
      }

      try {
        new URL(url);
      } catch {
        alert("Please enter a valid URL");
        return;
      }

      this.links.push({
        id: Date.now().toString(),
        title,
        url,
        category,
        icon,
        pinned: false,
      });

      this.saveLinks();
      this.hideAddModal();
      this.renderContainer();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelQuickLinks = new BaelQuickLinks();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelQuickLinks.initialize();
    });
  } else {
    window.BaelQuickLinks.initialize();
  }

  console.log("🔗 Bael Quick Links loaded");
})();
