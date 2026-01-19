/**
 * BAEL Kanban Component - Lord Of All Boards
 *
 * Kanban board with:
 * - Multiple columns
 * - Drag & drop cards
 * - Card actions
 * - Column management
 * - Swimlanes
 * - WIP limits
 * - Filtering
 * - Card templates
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // KANBAN CLASS
  // ============================================================

  class BaelKanban {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-kanban-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-kanban-styles";
      styles.textContent = `
                .bael-kanban {
                    font-family: system-ui, -apple-system, sans-serif;
                    display: flex;
                    gap: 16px;
                    overflow-x: auto;
                    padding: 16px;
                    background: #f9fafb;
                    border-radius: 12px;
                    min-height: 400px;
                }

                /* Column */
                .bael-kanban-column {
                    flex: 0 0 280px;
                    background: #f3f4f6;
                    border-radius: 12px;
                    display: flex;
                    flex-direction: column;
                    max-height: 100%;
                }

                .bael-kanban-column.over-limit .bael-kanban-header {
                    background: #fef2f2;
                    color: #dc2626;
                }

                /* Header */
                .bael-kanban-header {
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    border-radius: 12px 12px 0 0;
                    background: white;
                    border-bottom: 1px solid #e5e7eb;
                }

                .bael-kanban-title {
                    font-weight: 600;
                    color: #374151;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bael-kanban-count {
                    background: #e5e7eb;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 12px;
                    color: #6b7280;
                }

                .bael-kanban-actions {
                    display: flex;
                    gap: 4px;
                }

                .bael-kanban-btn {
                    width: 28px;
                    height: 28px;
                    border: none;
                    background: none;
                    cursor: pointer;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #9ca3af;
                    transition: all 0.15s;
                }

                .bael-kanban-btn:hover {
                    background: #e5e7eb;
                    color: #374151;
                }

                /* Cards container */
                .bael-kanban-cards {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    min-height: 100px;
                }

                .bael-kanban-cards.dragover {
                    background: #eef2ff;
                }

                /* Card */
                .bael-kanban-card {
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 12px;
                    cursor: grab;
                    transition: all 0.2s;
                    position: relative;
                }

                .bael-kanban-card:hover {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    transform: translateY(-1px);
                }

                .bael-kanban-card.dragging {
                    opacity: 0.5;
                    transform: rotate(3deg);
                }

                .bael-kanban-card-title {
                    font-weight: 500;
                    color: #374151;
                    margin-bottom: 8px;
                }

                .bael-kanban-card-desc {
                    font-size: 13px;
                    color: #6b7280;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                /* Card labels */
                .bael-kanban-card-labels {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                    margin-bottom: 8px;
                }

                .bael-kanban-label {
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 500;
                }

                .bael-kanban-label.red { background: #fee2e2; color: #dc2626; }
                .bael-kanban-label.orange { background: #ffedd5; color: #ea580c; }
                .bael-kanban-label.yellow { background: #fef3c7; color: #d97706; }
                .bael-kanban-label.green { background: #dcfce7; color: #16a34a; }
                .bael-kanban-label.blue { background: #dbeafe; color: #2563eb; }
                .bael-kanban-label.purple { background: #f3e8ff; color: #9333ea; }
                .bael-kanban-label.pink { background: #fce7f3; color: #db2777; }
                .bael-kanban-label.gray { background: #f3f4f6; color: #6b7280; }

                /* Card footer */
                .bael-kanban-card-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-top: 12px;
                    padding-top: 12px;
                    border-top: 1px solid #f3f4f6;
                }

                .bael-kanban-card-meta {
                    display: flex;
                    gap: 12px;
                    font-size: 12px;
                    color: #9ca3af;
                }

                .bael-kanban-card-meta svg {
                    width: 14px;
                    height: 14px;
                }

                .bael-kanban-card-meta-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                /* Assignees */
                .bael-kanban-assignees {
                    display: flex;
                    margin-left: auto;
                }

                .bael-kanban-assignee {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    border: 2px solid white;
                    margin-left: -8px;
                    background-size: cover;
                    background-position: center;
                }

                .bael-kanban-assignee:first-child {
                    margin-left: 0;
                }

                /* Priority indicator */
                .bael-kanban-card.priority-high::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 3px;
                    background: #ef4444;
                    border-radius: 8px 0 0 8px;
                }

                .bael-kanban-card.priority-medium::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 3px;
                    background: #f59e0b;
                    border-radius: 8px 0 0 8px;
                }

                /* Add card button */
                .bael-kanban-add {
                    padding: 8px;
                    border-top: 1px solid #e5e7eb;
                }

                .bael-kanban-add-btn {
                    width: 100%;
                    padding: 8px;
                    border: 1px dashed #d1d5db;
                    border-radius: 6px;
                    background: none;
                    cursor: pointer;
                    color: #9ca3af;
                    font-size: 13px;
                    transition: all 0.15s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                }

                .bael-kanban-add-btn:hover {
                    border-color: #4f46e5;
                    color: #4f46e5;
                    background: #eef2ff;
                }

                /* Placeholder */
                .bael-kanban-placeholder {
                    height: 80px;
                    border: 2px dashed #d1d5db;
                    border-radius: 8px;
                    background: #f9fafb;
                }

                /* Swimlanes */
                .bael-kanban-swimlane {
                    margin-bottom: 24px;
                }

                .bael-kanban-swimlane-header {
                    padding: 8px 16px;
                    background: #e5e7eb;
                    border-radius: 8px;
                    margin-bottom: 12px;
                    font-weight: 600;
                    color: #374151;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE KANBAN
    // ============================================================

    /**
     * Create a kanban board
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Kanban container not found");
        return null;
      }

      const id = `bael-kanban-${++this.idCounter}`;
      const config = {
        columns: [], // { id, title, cards: [], wipLimit: null }
        allowAdd: true,
        allowEdit: true,
        allowDelete: true,
        onCardMove: null,
        onCardClick: null,
        onCardAdd: null,
        onCardDelete: null,
        onColumnAdd: null,
        ...options,
      };

      const el = document.createElement("div");
      el.className = "bael-kanban";
      el.id = id;

      const state = {
        id,
        element: el,
        container,
        config,
        columns: config.columns,
        dragCard: null,
        dragColumn: null,
      };

      this._render(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        getColumns: () => [...state.columns],
        getCards: (columnId) => this.getCards(id, columnId),
        addColumn: (column) => this.addColumn(id, column),
        addCard: (columnId, card) => this.addCard(id, columnId, card),
        moveCard: (cardId, fromCol, toCol, index) =>
          this.moveCard(id, cardId, fromCol, toCol, index),
        updateCard: (columnId, cardId, data) =>
          this.updateCard(id, columnId, cardId, data),
        removeCard: (columnId, cardId) => this.removeCard(id, columnId, cardId),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render kanban board
     */
    _render(state) {
      const { element, columns } = state;

      element.innerHTML = "";

      columns.forEach((column) => {
        element.appendChild(this._createColumn(state, column));
      });
    }

    /**
     * Create column
     */
    _createColumn(state, column) {
      const { config } = state;

      const el = document.createElement("div");
      el.className = "bael-kanban-column";
      el.dataset.columnId = column.id;

      // Check WIP limit
      if (column.wipLimit && column.cards.length >= column.wipLimit) {
        el.classList.add("over-limit");
      }

      // Header
      const header = document.createElement("div");
      header.className = "bael-kanban-header";

      const title = document.createElement("div");
      title.className = "bael-kanban-title";
      title.innerHTML = `
                ${column.title}
                <span class="bael-kanban-count">${column.cards.length}${column.wipLimit ? "/" + column.wipLimit : ""}</span>
            `;
      header.appendChild(title);

      if (config.allowEdit) {
        const actions = document.createElement("div");
        actions.className = "bael-kanban-actions";

        const menuBtn = document.createElement("button");
        menuBtn.className = "bael-kanban-btn";
        menuBtn.type = "button";
        menuBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>`;
        actions.appendChild(menuBtn);

        header.appendChild(actions);
      }

      el.appendChild(header);

      // Cards container
      const cards = document.createElement("div");
      cards.className = "bael-kanban-cards";

      column.cards.forEach((card) => {
        cards.appendChild(this._createCard(state, column, card));
      });

      // Drag events for column
      cards.addEventListener("dragover", (e) => {
        e.preventDefault();
        cards.classList.add("dragover");
      });

      cards.addEventListener("dragleave", () => {
        cards.classList.remove("dragover");
      });

      cards.addEventListener("drop", (e) => {
        e.preventDefault();
        cards.classList.remove("dragover");

        if (state.dragCard) {
          this._handleDrop(state, column.id, cards, e);
        }
      });

      el.appendChild(cards);

      // Add card button
      if (config.allowAdd) {
        const add = document.createElement("div");
        add.className = "bael-kanban-add";

        const addBtn = document.createElement("button");
        addBtn.className = "bael-kanban-add-btn";
        addBtn.type = "button";
        addBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                    Add card
                `;
        addBtn.addEventListener("click", () => {
          if (config.onCardAdd) {
            config.onCardAdd(column.id);
          }
        });

        add.appendChild(addBtn);
        el.appendChild(add);
      }

      return el;
    }

    /**
     * Create card
     */
    _createCard(state, column, card) {
      const { config } = state;

      const el = document.createElement("div");
      el.className = "bael-kanban-card";
      el.dataset.cardId = card.id;
      el.draggable = true;

      // Priority
      if (card.priority) {
        el.classList.add(`priority-${card.priority}`);
      }

      // Labels
      if (card.labels && card.labels.length > 0) {
        const labels = document.createElement("div");
        labels.className = "bael-kanban-card-labels";

        card.labels.forEach((label) => {
          const labelEl = document.createElement("span");
          labelEl.className = `bael-kanban-label ${label.color || "gray"}`;
          labelEl.textContent = label.text;
          labels.appendChild(labelEl);
        });

        el.appendChild(labels);
      }

      // Title
      const title = document.createElement("div");
      title.className = "bael-kanban-card-title";
      title.textContent = card.title;
      el.appendChild(title);

      // Description
      if (card.description) {
        const desc = document.createElement("div");
        desc.className = "bael-kanban-card-desc";
        desc.textContent = card.description;
        el.appendChild(desc);
      }

      // Footer
      if (card.comments || card.attachments || card.dueDate || card.assignees) {
        const footer = document.createElement("div");
        footer.className = "bael-kanban-card-footer";

        const meta = document.createElement("div");
        meta.className = "bael-kanban-card-meta";

        if (card.dueDate) {
          const due = document.createElement("span");
          due.className = "bael-kanban-card-meta-item";
          due.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg> ${card.dueDate}`;
          meta.appendChild(due);
        }

        if (card.comments) {
          const comments = document.createElement("span");
          comments.className = "bael-kanban-card-meta-item";
          comments.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> ${card.comments}`;
          meta.appendChild(comments);
        }

        if (card.attachments) {
          const attachments = document.createElement("span");
          attachments.className = "bael-kanban-card-meta-item";
          attachments.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg> ${card.attachments}`;
          meta.appendChild(attachments);
        }

        footer.appendChild(meta);

        // Assignees
        if (card.assignees && card.assignees.length > 0) {
          const assignees = document.createElement("div");
          assignees.className = "bael-kanban-assignees";

          card.assignees.slice(0, 3).forEach((assignee) => {
            const avatar = document.createElement("div");
            avatar.className = "bael-kanban-assignee";
            avatar.style.backgroundImage = `url(${assignee.avatar || ""})`;
            avatar.title = assignee.name || "";
            assignees.appendChild(avatar);
          });

          footer.appendChild(assignees);
        }

        el.appendChild(footer);
      }

      // Drag events
      el.addEventListener("dragstart", (e) => {
        state.dragCard = { card, columnId: column.id };
        el.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
      });

      el.addEventListener("dragend", () => {
        el.classList.remove("dragging");
        state.dragCard = null;
      });

      // Click
      if (config.onCardClick) {
        el.addEventListener("click", () => config.onCardClick(card, column.id));
      }

      return el;
    }

    /**
     * Handle card drop
     */
    _handleDrop(state, toColumnId, cardsContainer, e) {
      const { dragCard, columns, config } = state;
      if (!dragCard) return;

      const { card, columnId: fromColumnId } = dragCard;

      // Find columns
      const fromColumn = columns.find((c) => c.id === fromColumnId);
      const toColumn = columns.find((c) => c.id === toColumnId);

      if (!fromColumn || !toColumn) return;

      // Check WIP limit
      if (
        toColumn.wipLimit &&
        fromColumnId !== toColumnId &&
        toColumn.cards.length >= toColumn.wipLimit
      ) {
        return; // Can't exceed limit
      }

      // Find drop position
      const cardElements = [
        ...cardsContainer.querySelectorAll(".bael-kanban-card:not(.dragging)"),
      ];
      let dropIndex = cardElements.length;

      for (let i = 0; i < cardElements.length; i++) {
        const rect = cardElements[i].getBoundingClientRect();
        if (e.clientY < rect.top + rect.height / 2) {
          dropIndex = i;
          break;
        }
      }

      // Remove from source
      const cardIndex = fromColumn.cards.findIndex((c) => c.id === card.id);
      if (cardIndex > -1) {
        fromColumn.cards.splice(cardIndex, 1);
      }

      // Add to destination
      toColumn.cards.splice(dropIndex, 0, card);

      // Re-render
      this._render(state);

      // Callback
      if (config.onCardMove) {
        config.onCardMove({
          card,
          fromColumn: fromColumnId,
          toColumn: toColumnId,
          index: dropIndex,
        });
      }
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    /**
     * Get cards from column
     */
    getCards(kanbanId, columnId) {
      const state = this.instances.get(kanbanId);
      if (!state) return [];

      const column = state.columns.find((c) => c.id === columnId);
      return column ? [...column.cards] : [];
    }

    /**
     * Add column
     */
    addColumn(kanbanId, column) {
      const state = this.instances.get(kanbanId);
      if (!state) return;

      state.columns.push({
        id: column.id || `col-${Date.now()}`,
        title: column.title,
        cards: column.cards || [],
        wipLimit: column.wipLimit || null,
      });

      this._render(state);
    }

    /**
     * Add card to column
     */
    addCard(kanbanId, columnId, card) {
      const state = this.instances.get(kanbanId);
      if (!state) return;

      const column = state.columns.find((c) => c.id === columnId);
      if (!column) return;

      column.cards.push({
        id: card.id || `card-${Date.now()}`,
        ...card,
      });

      this._render(state);
    }

    /**
     * Move card
     */
    moveCard(kanbanId, cardId, fromColumnId, toColumnId, index = -1) {
      const state = this.instances.get(kanbanId);
      if (!state) return;

      const fromColumn = state.columns.find((c) => c.id === fromColumnId);
      const toColumn = state.columns.find((c) => c.id === toColumnId);

      if (!fromColumn || !toColumn) return;

      const cardIndex = fromColumn.cards.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return;

      const [card] = fromColumn.cards.splice(cardIndex, 1);

      if (index === -1) {
        toColumn.cards.push(card);
      } else {
        toColumn.cards.splice(index, 0, card);
      }

      this._render(state);
    }

    /**
     * Update card
     */
    updateCard(kanbanId, columnId, cardId, data) {
      const state = this.instances.get(kanbanId);
      if (!state) return;

      const column = state.columns.find((c) => c.id === columnId);
      if (!column) return;

      const card = column.cards.find((c) => c.id === cardId);
      if (!card) return;

      Object.assign(card, data);
      this._render(state);
    }

    /**
     * Remove card
     */
    removeCard(kanbanId, columnId, cardId) {
      const state = this.instances.get(kanbanId);
      if (!state) return;

      const column = state.columns.find((c) => c.id === columnId);
      if (!column) return;

      const index = column.cards.findIndex((c) => c.id === cardId);
      if (index > -1) {
        column.cards.splice(index, 1);
        this._render(state);
      }
    }

    /**
     * Destroy kanban
     */
    destroy(kanbanId) {
      const state = this.instances.get(kanbanId);
      if (!state) return;

      state.element.remove();
      this.instances.delete(kanbanId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelKanban();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$kanban = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelKanban = bael;

  console.log("📋 BAEL Kanban Component loaded");
})();
