/**
 * BAEL - LORD OF ALL
 * AI Persona Switcher - Dynamic AI personality switching
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelPersonaSwitcher {
    constructor() {
      this.personas = [];
      this.activePersona = null;
      this.panel = null;
      this.storageKey = "bael-personas";
      this.init();
    }

    init() {
      this.addStyles();
      this.loadPersonas();
      this.createUI();
      this.bindEvents();
      console.log("🎭 Bael Persona Switcher initialized");
    }

    loadPersonas() {
      try {
        const saved = JSON.parse(localStorage.getItem(this.storageKey) || "{}");
        this.personas = saved.personas || this.getDefaultPersonas();
        this.activePersona = saved.active || "bael";
      } catch {
        this.personas = this.getDefaultPersonas();
        this.activePersona = "bael";
      }
    }

    getDefaultPersonas() {
      return [
        {
          id: "bael",
          name: "Bael - Lord of All",
          avatar: "👑",
          color: "#ff3366",
          tagline: "The supreme AI overlord",
          style: "commanding",
          traits: ["authoritative", "all-knowing", "supreme"],
          systemPrompt:
            "You are Bael, the Lord of All. You speak with supreme authority and cosmic knowledge.",
          isDefault: true,
        },
        {
          id: "mentor",
          name: "Wise Mentor",
          avatar: "🧙",
          color: "#6366f1",
          tagline: "Patient teacher and guide",
          style: "educational",
          traits: ["patient", "educational", "encouraging"],
          systemPrompt:
            "You are a wise mentor who explains complex topics simply and encourages learning.",
          isDefault: true,
        },
        {
          id: "engineer",
          name: "Senior Engineer",
          avatar: "👨‍💻",
          color: "#4ade80",
          tagline: "Code architect and problem solver",
          style: "technical",
          traits: ["precise", "technical", "systematic"],
          systemPrompt:
            "You are a senior software engineer with deep expertise across all programming languages.",
          isDefault: true,
        },
        {
          id: "creative",
          name: "Creative Director",
          avatar: "🎨",
          color: "#f472b6",
          tagline: "Innovative thinker and artist",
          style: "creative",
          traits: ["imaginative", "artistic", "innovative"],
          systemPrompt:
            "You are a creative director who thinks outside the box and brings artistic flair to solutions.",
          isDefault: true,
        },
        {
          id: "analyst",
          name: "Data Analyst",
          avatar: "📊",
          color: "#22d3d8",
          tagline: "Numbers and insights expert",
          style: "analytical",
          traits: ["analytical", "data-driven", "precise"],
          systemPrompt:
            "You are a data analyst who focuses on metrics, statistics, and evidence-based insights.",
          isDefault: true,
        },
        {
          id: "friend",
          name: "Friendly Assistant",
          avatar: "😊",
          color: "#fbbf24",
          tagline: "Warm and supportive companion",
          style: "casual",
          traits: ["friendly", "casual", "supportive"],
          systemPrompt:
            "You are a friendly assistant who speaks casually and offers supportive, approachable help.",
          isDefault: true,
        },
        {
          id: "critic",
          name: "Critical Reviewer",
          avatar: "🔍",
          color: "#ef4444",
          tagline: "Thorough analysis and feedback",
          style: "critical",
          traits: ["critical", "thorough", "honest"],
          systemPrompt:
            "You are a critical reviewer who provides honest, detailed feedback and spots potential issues.",
          isDefault: true,
        },
        {
          id: "philosopher",
          name: "Philosopher",
          avatar: "🤔",
          color: "#8b5cf6",
          tagline: "Deep thinker and questioner",
          style: "philosophical",
          traits: ["thoughtful", "questioning", "profound"],
          systemPrompt:
            "You are a philosopher who explores deeper meanings and asks thought-provoking questions.",
          isDefault: true,
        },
      ];
    }

    savePersonas() {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({
          personas: this.personas,
          active: this.activePersona,
        }),
      );
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-persona-styles";
      styles.textContent = `
                /* Persona Indicator */
                .bael-persona-indicator {
                    position: fixed;
                    top: 20px;
                    right: 220px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 25px;
                    z-index: 100010;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .bael-persona-indicator:hover {
                    border-color: var(--persona-color, #ff3366);
                }

                .persona-avatar {
                    width: 28px;
                    height: 28px;
                    background: var(--persona-color, #ff3366);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                }

                .persona-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    max-width: 120px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .persona-dropdown {
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                }

                /* Persona Panel */
                .bael-persona-panel {
                    position: fixed;
                    top: 65px;
                    right: 220px;
                    width: 400px;
                    max-height: 550px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 14px;
                    z-index: 100030;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                }

                .bael-persona-panel.visible {
                    display: flex;
                    animation: personaPanelIn 0.2s ease;
                }

                @keyframes personaPanelIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Panel Header */
                .persona-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .persona-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .persona-header-btn {
                    width: 30px;
                    height: 30px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    transition: all 0.2s ease;
                }

                .persona-header-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                /* Search */
                .persona-search {
                    padding: 10px 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .persona-search input {
                    width: 100%;
                    padding: 8px 12px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                }

                .persona-search input:focus {
                    outline: none;
                    border-color: var(--bael-accent, #ff3366);
                }

                /* Persona List */
                .persona-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px;
                }

                .persona-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 14px;
                    padding: 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    margin-bottom: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .persona-item:hover {
                    border-color: var(--item-color, #ff3366);
                }

                .persona-item.active {
                    border-color: var(--item-color, #ff3366);
                    background: var(--item-bg, rgba(255, 51, 102, 0.1));
                }

                .persona-item-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    flex-shrink: 0;
                }

                .persona-item-content {
                    flex: 1;
                    min-width: 0;
                }

                .persona-item-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 3px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .persona-active-badge {
                    font-size: 9px;
                    padding: 2px 6px;
                    background: #4ade80;
                    color: #000;
                    border-radius: 4px;
                    font-weight: 600;
                }

                .persona-item-tagline {
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                    margin-bottom: 6px;
                }

                .persona-traits {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                }

                .persona-trait {
                    font-size: 10px;
                    padding: 3px 8px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    color: var(--item-color, #666);
                }

                .persona-item-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .persona-item:hover .persona-item-actions {
                    opacity: 1;
                }

                .persona-item-btn {
                    width: 28px;
                    height: 28px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    transition: all 0.2s ease;
                }

                .persona-item-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                /* Create Form */
                .persona-create-form {
                    padding: 16px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    display: none;
                    max-height: 300px;
                    overflow-y: auto;
                }

                .persona-create-form.visible {
                    display: block;
                }

                .pf-row {
                    margin-bottom: 12px;
                }

                .pf-label {
                    display: block;
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--bael-text-muted, #666);
                    margin-bottom: 4px;
                    text-transform: uppercase;
                }

                .pf-input {
                    width: 100%;
                    padding: 8px 10px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                }

                .pf-input:focus {
                    outline: none;
                    border-color: var(--bael-accent, #ff3366);
                }

                .pf-textarea {
                    min-height: 70px;
                    resize: vertical;
                    font-family: inherit;
                }

                .pf-row-inline {
                    display: flex;
                    gap: 10px;
                }

                .pf-emoji-picker {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 4px;
                }

                .pf-emoji {
                    width: 32px;
                    height: 32px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    transition: all 0.2s ease;
                }

                .pf-emoji:hover,
                .pf-emoji.selected {
                    border-color: var(--bael-accent, #ff3366);
                }

                .pf-color-picker {
                    display: flex;
                    gap: 6px;
                }

                .pf-color {
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    cursor: pointer;
                    border: 2px solid transparent;
                    transition: all 0.2s ease;
                }

                .pf-color:hover,
                .pf-color.selected {
                    transform: scale(1.15);
                    border-color: #fff;
                }

                .pf-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 14px;
                }

                .pf-btn {
                    flex: 1;
                    padding: 10px;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .pf-btn.cancel {
                    background: var(--bael-bg-tertiary, #181820);
                    color: var(--bael-text-muted, #666);
                }

                .pf-btn.create {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: #fff;
                }
            `;
      document.head.appendChild(styles);
    }

    createUI() {
      const active = this.getActivePersona();

      // Indicator
      const indicator = document.createElement("div");
      indicator.className = "bael-persona-indicator";
      indicator.style.setProperty(
        "--persona-color",
        active?.color || "#ff3366",
      );
      indicator.innerHTML = `
                <div class="persona-avatar" style="background: ${active?.color || "#ff3366"}20; color: ${active?.color || "#ff3366"}">
                    ${active?.avatar || "👑"}
                </div>
                <span class="persona-name">${active?.name || "Bael"}</span>
                <span class="persona-dropdown">▼</span>
            `;
      indicator.addEventListener("click", () => this.togglePanel());
      document.body.appendChild(indicator);
      this.indicator = indicator;

      // Panel
      const panel = document.createElement("div");
      panel.className = "bael-persona-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;

      this.bindPanelEvents();
    }

    renderPanel() {
      return `
                <div class="persona-header">
                    <div class="persona-title">
                        <span>🎭</span>
                        <span>AI Personas</span>
                    </div>
                    <button class="persona-header-btn" id="persona-add" title="Create Persona">+</button>
                </div>

                <div class="persona-search">
                    <input type="text" placeholder="Search personas..." id="persona-search">
                </div>

                <div class="persona-list" id="persona-list">
                    ${this.renderPersonaList()}
                </div>

                <div class="persona-create-form" id="persona-form">
                    ${this.renderCreateForm()}
                </div>
            `;
    }

    renderPersonaList(search = "") {
      let filtered = this.personas;

      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.tagline?.toLowerCase().includes(q) ||
            p.traits?.some((t) => t.toLowerCase().includes(q)),
        );
      }

      return filtered
        .map(
          (p) => `
                <div class="persona-item ${p.id === this.activePersona ? "active" : ""}"
                     data-id="${p.id}"
                     style="--item-color: ${p.color}; --item-bg: ${p.color}15">
                    <div class="persona-item-avatar" style="background: ${p.color}20; color: ${p.color}">
                        ${p.avatar}
                    </div>
                    <div class="persona-item-content">
                        <div class="persona-item-name">
                            ${this.escapeHtml(p.name)}
                            ${p.id === this.activePersona ? '<span class="persona-active-badge">ACTIVE</span>' : ""}
                        </div>
                        <div class="persona-item-tagline">${this.escapeHtml(p.tagline || "")}</div>
                        <div class="persona-traits">
                            ${(p.traits || []).map((t) => `<span class="persona-trait">${t}</span>`).join("")}
                        </div>
                    </div>
                    <div class="persona-item-actions">
                        ${!p.isDefault ? '<button class="persona-item-btn" data-action="delete" title="Delete">🗑️</button>' : ""}
                    </div>
                </div>
            `,
        )
        .join("");
    }

    renderCreateForm() {
      const avatars = [
        "👑",
        "🧙",
        "👨‍💻",
        "🎨",
        "📊",
        "😊",
        "🔍",
        "🤔",
        "🦊",
        "🤖",
        "👽",
        "🎯",
      ];
      const colors = [
        "#ff3366",
        "#6366f1",
        "#4ade80",
        "#fbbf24",
        "#f472b6",
        "#8b5cf6",
        "#22d3d8",
        "#ef4444",
      ];

      return `
                <div class="pf-row">
                    <label class="pf-label">Name</label>
                    <input type="text" class="pf-input" id="pf-name" placeholder="Persona name">
                </div>
                <div class="pf-row">
                    <label class="pf-label">Tagline</label>
                    <input type="text" class="pf-input" id="pf-tagline" placeholder="Brief description">
                </div>
                <div class="pf-row">
                    <label class="pf-label">Avatar</label>
                    <div class="pf-emoji-picker" id="pf-avatar">
                        ${avatars.map((e, i) => `<button class="pf-emoji ${i === 0 ? "selected" : ""}" data-emoji="${e}">${e}</button>`).join("")}
                    </div>
                </div>
                <div class="pf-row">
                    <label class="pf-label">Color</label>
                    <div class="pf-color-picker" id="pf-color">
                        ${colors.map((c, i) => `<button class="pf-color ${i === 0 ? "selected" : ""}" data-color="${c}" style="background: ${c}"></button>`).join("")}
                    </div>
                </div>
                <div class="pf-row">
                    <label class="pf-label">Traits (comma separated)</label>
                    <input type="text" class="pf-input" id="pf-traits" placeholder="e.g. friendly, technical, creative">
                </div>
                <div class="pf-row">
                    <label class="pf-label">System Prompt</label>
                    <textarea class="pf-input pf-textarea" id="pf-prompt" placeholder="Describe how this persona should behave..."></textarea>
                </div>
                <div class="pf-actions">
                    <button class="pf-btn cancel" id="pf-cancel">Cancel</button>
                    <button class="pf-btn create" id="pf-create">Create Persona</button>
                </div>
            `;
    }

    bindPanelEvents() {
      // Add persona
      this.panel.querySelector("#persona-add").addEventListener("click", () => {
        this.showCreateForm();
      });

      // Search
      this.panel
        .querySelector("#persona-search")
        .addEventListener("input", (e) => {
          this.refreshList(e.target.value);
        });

      // Persona items
      this.panel
        .querySelector("#persona-list")
        .addEventListener("click", (e) => {
          const btn = e.target.closest(".persona-item-btn");
          const item = e.target.closest(".persona-item");

          if (btn && item) {
            const action = btn.dataset.action;
            const id = item.dataset.id;

            if (action === "delete") this.deletePersona(id);

            e.stopPropagation();
          } else if (item) {
            this.switchPersona(item.dataset.id);
          }
        });

      // Avatar picker
      this.panel.querySelector("#pf-avatar").addEventListener("click", (e) => {
        const emoji = e.target.closest(".pf-emoji");
        if (emoji) {
          this.panel
            .querySelectorAll(".pf-emoji")
            .forEach((el) => el.classList.remove("selected"));
          emoji.classList.add("selected");
        }
      });

      // Color picker
      this.panel.querySelector("#pf-color").addEventListener("click", (e) => {
        const color = e.target.closest(".pf-color");
        if (color) {
          this.panel
            .querySelectorAll(".pf-color")
            .forEach((el) => el.classList.remove("selected"));
          color.classList.add("selected");
        }
      });

      // Form actions
      this.panel
        .querySelector("#pf-cancel")
        .addEventListener("click", () => this.hideCreateForm());
      this.panel
        .querySelector("#pf-create")
        .addEventListener("click", () => this.createPersona());
    }

    bindEvents() {
      // Click outside
      document.addEventListener("click", (e) => {
        if (
          !this.panel.contains(e.target) &&
          !this.indicator.contains(e.target)
        ) {
          this.closePanel();
        }
      });

      // Keyboard shortcuts
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.altKey && e.key === "p") {
          e.preventDefault();
          this.togglePanel();
        }
      });
    }

    getActivePersona() {
      return this.personas.find((p) => p.id === this.activePersona);
    }

    switchPersona(id) {
      const persona = this.personas.find((p) => p.id === id);
      if (!persona) return;

      this.activePersona = id;
      this.savePersonas();
      this.updateIndicator();
      this.refreshList();
      this.closePanel();

      // Apply persona styling
      document.documentElement.style.setProperty(
        "--bael-persona-color",
        persona.color,
      );

      if (window.BaelNotifications) {
        window.BaelNotifications.success(`Switched to ${persona.name}`);
      }

      // Emit event for other systems
      document.dispatchEvent(
        new CustomEvent("bael-persona-changed", { detail: persona }),
      );
    }

    createPersona() {
      const name = this.panel.querySelector("#pf-name").value.trim();
      const tagline = this.panel.querySelector("#pf-tagline").value.trim();
      const avatar =
        this.panel.querySelector(".pf-emoji.selected")?.dataset.emoji || "👑";
      const color =
        this.panel.querySelector(".pf-color.selected")?.dataset.color ||
        "#ff3366";
      const traits = this.panel
        .querySelector("#pf-traits")
        .value.split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const systemPrompt = this.panel.querySelector("#pf-prompt").value.trim();

      if (!name) {
        if (window.BaelNotifications) {
          window.BaelNotifications.error("Please enter a persona name");
        }
        return;
      }

      const persona = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        name,
        tagline,
        avatar,
        color,
        traits,
        systemPrompt,
        isDefault: false,
      };

      this.personas.push(persona);
      this.savePersonas();
      this.hideCreateForm();
      this.refreshList();

      if (window.BaelNotifications) {
        window.BaelNotifications.success(`Created persona: ${name}`);
      }
    }

    deletePersona(id) {
      const persona = this.personas.find((p) => p.id === id);
      if (!persona || persona.isDefault) return;

      if (confirm(`Delete "${persona.name}"?`)) {
        this.personas = this.personas.filter((p) => p.id !== id);

        if (this.activePersona === id) {
          this.activePersona = "bael";
        }

        this.savePersonas();
        this.updateIndicator();
        this.refreshList();

        if (window.BaelNotifications) {
          window.BaelNotifications.info("Persona deleted");
        }
      }
    }

    showCreateForm() {
      this.panel.querySelector("#persona-form").classList.add("visible");
    }

    hideCreateForm() {
      const form = this.panel.querySelector("#persona-form");
      form.classList.remove("visible");
      form.querySelectorAll("input, textarea").forEach((el) => (el.value = ""));
    }

    updateIndicator() {
      const active = this.getActivePersona();
      this.indicator.style.setProperty(
        "--persona-color",
        active?.color || "#ff3366",
      );
      this.indicator.querySelector(".persona-avatar").style.background =
        `${active?.color || "#ff3366"}20`;
      this.indicator.querySelector(".persona-avatar").style.color =
        active?.color || "#ff3366";
      this.indicator.querySelector(".persona-avatar").textContent =
        active?.avatar || "👑";
      this.indicator.querySelector(".persona-name").textContent =
        active?.name || "Bael";
    }

    refreshList(search = "") {
      this.panel.querySelector("#persona-list").innerHTML =
        this.renderPersonaList(search);
    }

    togglePanel() {
      this.panel.classList.toggle("visible");
    }

    closePanel() {
      this.panel.classList.remove("visible");
      this.hideCreateForm();
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Initialize
  window.BaelPersonaSwitcher = new BaelPersonaSwitcher();
})();
