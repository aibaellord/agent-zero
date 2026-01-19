/**
 * BAEL - LORD OF ALL
 * Quick Notes Panel
 * =================
 * Collapsible side panel for quick notes, todos, and snippets
 */

class BaelNotesPanel {
  constructor() {
    this.notes = JSON.parse(localStorage.getItem("bael_notes") || "[]");
    this.isOpen = false;
    this.init();
  }

  init() {
    this.createPanel();
    this.bindEvents();
    console.log("📝 Bael Notes Panel initialized");
  }

  createPanel() {
    const panel = document.createElement("div");
    panel.id = "bael-notes-panel";
    panel.className = "bael-notes-panel";
    panel.innerHTML = `
            <button class="bnp-toggle" onclick="baelNotes.toggle()">
                <span class="bnp-toggle-icon">📝</span>
                <span class="bnp-badge" id="bnp-count">${this.notes.length}</span>
            </button>
            <div class="bnp-container">
                <div class="bnp-header">
                    <h3>📝 Quick Notes</h3>
                    <div class="bnp-actions">
                        <button class="bnp-btn" onclick="baelNotes.addNote()">+</button>
                        <button class="bnp-btn" onclick="baelNotes.exportNotes()">↓</button>
                        <button class="bnp-btn" onclick="baelNotes.close()">✕</button>
                    </div>
                </div>
                <div class="bnp-search">
                    <input type="text" placeholder="Search notes..." id="bnp-search" oninput="baelNotes.filterNotes()">
                </div>
                <div class="bnp-tabs">
                    <button class="bnp-tab active" data-tab="all" onclick="baelNotes.switchTab('all')">All</button>
                    <button class="bnp-tab" data-tab="pinned" onclick="baelNotes.switchTab('pinned')">📌 Pinned</button>
                    <button class="bnp-tab" data-tab="todos" onclick="baelNotes.switchTab('todos')">☑️ Todos</button>
                </div>
                <div class="bnp-notes" id="bnp-notes"></div>
            </div>
        `;

    const style = document.createElement("style");
    style.textContent = `
            .bael-notes-panel {
                position: fixed;
                right: 0;
                top: 50%;
                transform: translateY(-50%);
                z-index: 9997;
            }

            .bnp-toggle {
                position: absolute;
                right: 0;
                top: 50%;
                transform: translateY(-50%);
                width: 40px;
                height: 80px;
                background: var(--gradient-primary);
                border: none;
                border-radius: var(--radius-lg) 0 0 var(--radius-lg);
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 4px;
                box-shadow: var(--shadow-md);
                transition: all 0.3s ease;
            }

            .bnp-toggle:hover {
                width: 50px;
            }

            .bnp-toggle-icon {
                font-size: 20px;
            }

            .bnp-badge {
                background: var(--color-background);
                color: var(--color-text);
                font-size: 11px;
                padding: 2px 6px;
                border-radius: var(--radius-full);
            }

            .bael-notes-panel.open .bnp-toggle {
                right: 320px;
            }

            .bnp-container {
                position: absolute;
                right: -320px;
                top: 50%;
                transform: translateY(-50%);
                width: 320px;
                height: 500px;
                background: var(--color-panel);
                border: 1px solid var(--color-border);
                border-right: none;
                border-radius: var(--radius-lg) 0 0 var(--radius-lg);
                box-shadow: var(--shadow-lg);
                display: flex;
                flex-direction: column;
                transition: right 0.3s ease;
            }

            .bael-notes-panel.open .bnp-container {
                right: 0;
            }

            .bnp-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px;
                border-bottom: 1px solid var(--color-border);
            }

            .bnp-header h3 {
                margin: 0;
                font-size: 16px;
                color: var(--color-text);
            }

            .bnp-actions {
                display: flex;
                gap: 8px;
            }

            .bnp-btn {
                width: 28px;
                height: 28px;
                background: var(--color-surface);
                border: 1px solid var(--color-border);
                color: var(--color-text);
                border-radius: var(--radius-sm);
                cursor: pointer;
                transition: all 0.2s;
            }

            .bnp-btn:hover {
                background: var(--color-primary);
                border-color: var(--color-primary);
            }

            .bnp-search {
                padding: 12px;
            }

            .bnp-search input {
                width: 100%;
                padding: 8px 12px;
                background: var(--color-background);
                border: 1px solid var(--color-border);
                color: var(--color-text);
                border-radius: var(--radius-md);
                outline: none;
            }

            .bnp-search input:focus {
                border-color: var(--color-primary);
            }

            .bnp-tabs {
                display: flex;
                padding: 0 12px;
                gap: 8px;
                border-bottom: 1px solid var(--color-border);
            }

            .bnp-tab {
                flex: 1;
                padding: 8px;
                background: transparent;
                border: none;
                border-bottom: 2px solid transparent;
                color: var(--color-text-secondary);
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s;
            }

            .bnp-tab:hover, .bnp-tab.active {
                color: var(--color-primary);
                border-bottom-color: var(--color-primary);
            }

            .bnp-notes {
                flex: 1;
                overflow-y: auto;
                padding: 12px;
            }

            .bnp-note {
                background: var(--color-surface);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-md);
                padding: 12px;
                margin-bottom: 8px;
                transition: all 0.2s;
            }

            .bnp-note:hover {
                border-color: var(--color-primary);
            }

            .bnp-note.pinned {
                border-left: 3px solid var(--color-warning);
            }

            .bnp-note-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }

            .bnp-note-title {
                font-weight: 600;
                color: var(--color-text);
                font-size: 13px;
            }

            .bnp-note-actions {
                display: flex;
                gap: 4px;
            }

            .bnp-note-btn {
                padding: 2px 6px;
                background: transparent;
                border: none;
                color: var(--color-text-muted);
                cursor: pointer;
                font-size: 12px;
                border-radius: var(--radius-sm);
            }

            .bnp-note-btn:hover {
                background: var(--color-surface-elevated);
                color: var(--color-text);
            }

            .bnp-note-content {
                font-size: 12px;
                color: var(--color-text-secondary);
                line-height: 1.5;
                white-space: pre-wrap;
            }

            .bnp-note-content[contenteditable="true"] {
                background: var(--color-background);
                padding: 8px;
                border-radius: var(--radius-sm);
                outline: none;
            }

            .bnp-note-meta {
                display: flex;
                justify-content: space-between;
                margin-top: 8px;
                font-size: 10px;
                color: var(--color-text-muted);
            }

            .bnp-empty {
                text-align: center;
                padding: 40px;
                color: var(--color-text-muted);
            }

            .bnp-empty-icon {
                font-size: 40px;
                margin-bottom: 10px;
            }

            .bnp-todo-checkbox {
                margin-right: 8px;
                cursor: pointer;
            }

            .bnp-note.completed .bnp-note-content {
                text-decoration: line-through;
                opacity: 0.6;
            }
        `;

    document.head.appendChild(style);
    document.body.appendChild(panel);

    this.panel = panel;
    this.renderNotes();
  }

  bindEvents() {
    document.addEventListener("keydown", (e) => {
      // Ctrl+Shift+N to toggle
      if (e.ctrlKey && e.shiftKey && e.key === "N") {
        e.preventDefault();
        this.toggle();
      }
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.panel.classList.add("open");
  }

  close() {
    this.isOpen = false;
    this.panel.classList.remove("open");
  }

  addNote() {
    const note = {
      id: Date.now(),
      title: "New Note",
      content: "",
      pinned: false,
      isTodo: false,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.notes.unshift(note);
    this.saveNotes();
    this.renderNotes();

    // Focus the new note for editing
    setTimeout(() => {
      const noteEl = document.querySelector(
        `[data-note-id="${note.id}"] .bnp-note-content`,
      );
      if (noteEl) {
        noteEl.setAttribute("contenteditable", "true");
        noteEl.focus();
      }
    }, 100);
  }

  updateNote(id, field, value) {
    const note = this.notes.find((n) => n.id === id);
    if (note) {
      note[field] = value;
      note.updatedAt = new Date().toISOString();
      this.saveNotes();
    }
  }

  deleteNote(id) {
    if (confirm("Delete this note?")) {
      this.notes = this.notes.filter((n) => n.id !== id);
      this.saveNotes();
      this.renderNotes();
    }
  }

  togglePin(id) {
    const note = this.notes.find((n) => n.id === id);
    if (note) {
      note.pinned = !note.pinned;
      this.saveNotes();
      this.renderNotes();
    }
  }

  toggleTodo(id) {
    const note = this.notes.find((n) => n.id === id);
    if (note) {
      note.isTodo = !note.isTodo;
      note.completed = false;
      this.saveNotes();
      this.renderNotes();
    }
  }

  toggleComplete(id) {
    const note = this.notes.find((n) => n.id === id);
    if (note && note.isTodo) {
      note.completed = !note.completed;
      this.saveNotes();
      this.renderNotes();
    }
  }

  saveNotes() {
    localStorage.setItem("bael_notes", JSON.stringify(this.notes));
    document.getElementById("bnp-count").textContent = this.notes.length;
  }

  filterNotes() {
    const query = document.getElementById("bnp-search").value.toLowerCase();
    this.renderNotes(query);
  }

  switchTab(tab) {
    document
      .querySelectorAll(".bnp-tab")
      .forEach((t) => t.classList.remove("active"));
    document.querySelector(`[data-tab="${tab}"]`).classList.add("active");
    this.currentTab = tab;
    this.renderNotes();
  }

  renderNotes(searchQuery = "") {
    const container = document.getElementById("bnp-notes");
    let filtered = this.notes;

    // Apply tab filter
    if (this.currentTab === "pinned") {
      filtered = filtered.filter((n) => n.pinned);
    } else if (this.currentTab === "todos") {
      filtered = filtered.filter((n) => n.isTodo);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (n) =>
          n.title.toLowerCase().includes(searchQuery) ||
          n.content.toLowerCase().includes(searchQuery),
      );
    }

    // Sort: pinned first, then by date
    filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    if (filtered.length === 0) {
      container.innerHTML = `
                <div class="bnp-empty">
                    <div class="bnp-empty-icon">📝</div>
                    <div>No notes yet</div>
                    <div style="margin-top: 8px; font-size: 12px;">Click + to add one</div>
                </div>
            `;
      return;
    }

    container.innerHTML = filtered
      .map(
        (note) => `
            <div class="bnp-note ${note.pinned ? "pinned" : ""} ${note.completed ? "completed" : ""}"
                 data-note-id="${note.id}">
                <div class="bnp-note-header">
                    <div class="bnp-note-title">
                        ${
                          note.isTodo
                            ? `<input type="checkbox" class="bnp-todo-checkbox"
                            ${note.completed ? "checked" : ""}
                            onchange="baelNotes.toggleComplete(${note.id})">`
                            : ""
                        }
                        ${this.escapeHtml(note.title)}
                    </div>
                    <div class="bnp-note-actions">
                        <button class="bnp-note-btn" onclick="baelNotes.togglePin(${note.id})" title="Pin">
                            ${note.pinned ? "📌" : "📍"}
                        </button>
                        <button class="bnp-note-btn" onclick="baelNotes.toggleTodo(${note.id})" title="Todo">
                            ${note.isTodo ? "☑️" : "☐"}
                        </button>
                        <button class="bnp-note-btn" onclick="baelNotes.deleteNote(${note.id})" title="Delete">
                            🗑️
                        </button>
                    </div>
                </div>
                <div class="bnp-note-content"
                     contenteditable="true"
                     onblur="baelNotes.updateNote(${note.id}, 'content', this.textContent)"
                     >${this.escapeHtml(note.content) || "Click to edit..."}</div>
                <div class="bnp-note-meta">
                    <span>${this.formatDate(note.createdAt)}</span>
                    <span>${note.updatedAt !== note.createdAt ? "Edited" : ""}</span>
                </div>
            </div>
        `,
      )
      .join("");
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return date.toLocaleDateString();
  }

  exportNotes() {
    const data = JSON.stringify(this.notes, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bael-notes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Add note from chat
  addFromChat(content) {
    const note = {
      id: Date.now(),
      title: "From Chat",
      content: content,
      pinned: false,
      isTodo: false,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.notes.unshift(note);
    this.saveNotes();
    this.renderNotes();
    this.open();
  }
}

// Initialize
let baelNotes;
document.addEventListener("DOMContentLoaded", () => {
  baelNotes = new BaelNotesPanel();
  window.baelNotes = baelNotes;
});
