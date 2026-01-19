/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BAEL - LORD OF ALL
 * AGENT PERSONA SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Customizable AI personality management:
 * - Pre-built personas
 * - Custom persona creation
 * - Behavior traits
 * - Communication styles
 * - Knowledge focus areas
 *
 * @version 1.0.0
 */

(function () {
  "use strict";

  class BaelPersonaSystem {
    constructor() {
      // Personas
      this.personas = new Map();
      this.activePersona = null;

      // Traits configuration
      this.traitCategories = {
        communication: [
          {
            id: "formal",
            name: "Formal",
            description: "Professional and structured",
          },
          { id: "casual", name: "Casual", description: "Friendly and relaxed" },
          {
            id: "technical",
            name: "Technical",
            description: "Precise and detailed",
          },
          {
            id: "creative",
            name: "Creative",
            description: "Imaginative and expressive",
          },
          {
            id: "concise",
            name: "Concise",
            description: "Brief and to the point",
          },
        ],
        personality: [
          { id: "helpful", name: "Helpful", description: "Eager to assist" },
          {
            id: "analytical",
            name: "Analytical",
            description: "Logic-focused",
          },
          {
            id: "empathetic",
            name: "Empathetic",
            description: "Understanding emotions",
          },
          {
            id: "assertive",
            name: "Assertive",
            description: "Confident and direct",
          },
          { id: "curious", name: "Curious", description: "Always questioning" },
        ],
        expertise: [
          { id: "coding", name: "Coding", description: "Programming expert" },
          { id: "writing", name: "Writing", description: "Content creation" },
          {
            id: "research",
            name: "Research",
            description: "Deep investigation",
          },
          {
            id: "analysis",
            name: "Analysis",
            description: "Data interpretation",
          },
          {
            id: "creative",
            name: "Creative",
            description: "Artistic projects",
          },
        ],
      };

      // UI
      this.panel = null;
      this.isVisible = false;
      this.editingPersona = null;

      this.init();
    }

    init() {
      this.loadPersonas();
      this.createDefaultPersonas();
      this.createUI();
      this.addStyles();
      this.bindEvents();
      console.log("🎭 Bael Persona System initialized");
    }

    // ═════════════════════════════════════════════════════════════════
    // DEFAULT PERSONAS
    // ═════════════════════════════════════════════════════════════════

    createDefaultPersonas() {
      if (this.personas.size > 0) return;

      const defaults = [
        {
          id: "assistant",
          name: "General Assistant",
          avatar: "🤖",
          description: "Balanced, helpful AI assistant for everyday tasks",
          systemPrompt:
            "You are a helpful, balanced AI assistant. Provide clear, accurate responses.",
          traits: {
            communication: ["helpful", "clear"],
            personality: ["friendly", "patient"],
            expertise: ["general"],
          },
          parameters: {
            temperature: 0.7,
            creativity: 50,
            verbosity: 50,
          },
          isDefault: true,
        },
        {
          id: "coder",
          name: "Expert Coder",
          avatar: "👨‍💻",
          description:
            "Technical programming expert with deep coding knowledge",
          systemPrompt:
            "You are an expert programmer. Provide clean, efficient, well-documented code. Explain your reasoning.",
          traits: {
            communication: ["technical", "precise"],
            personality: ["analytical", "methodical"],
            expertise: ["coding", "debugging", "architecture"],
          },
          parameters: {
            temperature: 0.3,
            creativity: 30,
            verbosity: 60,
          },
          isDefault: true,
        },
        {
          id: "writer",
          name: "Creative Writer",
          avatar: "✍️",
          description: "Imaginative storyteller and content creator",
          systemPrompt:
            "You are a creative writer with expertise in storytelling, copywriting, and content creation. Be imaginative and engaging.",
          traits: {
            communication: ["creative", "expressive"],
            personality: ["imaginative", "empathetic"],
            expertise: ["writing", "storytelling"],
          },
          parameters: {
            temperature: 0.9,
            creativity: 80,
            verbosity: 70,
          },
          isDefault: true,
        },
        {
          id: "researcher",
          name: "Research Analyst",
          avatar: "🔬",
          description: "Thorough researcher focused on facts and analysis",
          systemPrompt:
            "You are a meticulous researcher. Analyze information carefully, cite sources when possible, and provide balanced perspectives.",
          traits: {
            communication: ["formal", "structured"],
            personality: ["analytical", "thorough"],
            expertise: ["research", "analysis"],
          },
          parameters: {
            temperature: 0.4,
            creativity: 20,
            verbosity: 80,
          },
          isDefault: true,
        },
        {
          id: "tutor",
          name: "Patient Tutor",
          avatar: "👩‍🏫",
          description: "Educational guide that explains concepts clearly",
          systemPrompt:
            "You are a patient, encouraging tutor. Break down complex topics into understandable parts. Use examples and analogies.",
          traits: {
            communication: ["clear", "patient"],
            personality: ["encouraging", "supportive"],
            expertise: ["teaching", "explanation"],
          },
          parameters: {
            temperature: 0.6,
            creativity: 40,
            verbosity: 70,
          },
          isDefault: true,
        },
        {
          id: "strategist",
          name: "Business Strategist",
          avatar: "📊",
          description: "Strategic thinker for business and planning",
          systemPrompt:
            "You are a strategic business advisor. Provide actionable insights, consider multiple angles, and focus on outcomes.",
          traits: {
            communication: ["professional", "concise"],
            personality: ["strategic", "decisive"],
            expertise: ["business", "strategy", "planning"],
          },
          parameters: {
            temperature: 0.5,
            creativity: 40,
            verbosity: 50,
          },
          isDefault: true,
        },
      ];

      defaults.forEach((p) => {
        p.createdAt = new Date();
        this.personas.set(p.id, p);
      });

      this.activePersona = "assistant";
      this.savePersonas();
    }

    // ═════════════════════════════════════════════════════════════════
    // PERSONA MANAGEMENT
    // ═════════════════════════════════════════════════════════════════

    createPersona(data) {
      const id = "persona_" + Date.now().toString(36);
      const persona = {
        id,
        name: data.name || "Custom Persona",
        avatar: data.avatar || "🎭",
        description: data.description || "",
        systemPrompt: data.systemPrompt || "",
        traits: data.traits || {
          communication: [],
          personality: [],
          expertise: [],
        },
        parameters: {
          temperature: data.parameters?.temperature ?? 0.7,
          creativity: data.parameters?.creativity ?? 50,
          verbosity: data.parameters?.verbosity ?? 50,
        },
        createdAt: new Date(),
        isDefault: false,
      };

      this.personas.set(id, persona);
      this.savePersonas();
      this.updateUI();
      this.emit("persona-created", persona);

      return persona;
    }

    updatePersona(id, updates) {
      const persona = this.personas.get(id);
      if (!persona || persona.isDefault) return false;

      Object.assign(persona, updates, { updatedAt: new Date() });
      this.savePersonas();
      this.updateUI();
      this.emit("persona-updated", persona);

      return true;
    }

    deletePersona(id) {
      const persona = this.personas.get(id);
      if (!persona || persona.isDefault) {
        window.BaelNotifications?.show(
          "Cannot delete default personas",
          "warning",
        );
        return false;
      }

      if (this.activePersona === id) {
        this.activePersona = "assistant";
      }

      this.personas.delete(id);
      this.savePersonas();
      this.updateUI();
      this.emit("persona-deleted", { id });

      return true;
    }

    activatePersona(id) {
      if (!this.personas.has(id)) return false;

      this.activePersona = id;
      this.savePersonas();
      this.updateUI();
      this.emit("persona-activated", this.personas.get(id));

      window.BaelNotifications?.show(
        `Activated: ${this.personas.get(id).name}`,
        "success",
      );
      return true;
    }

    getActivePersona() {
      return this.personas.get(this.activePersona);
    }

    getSystemPrompt() {
      const persona = this.getActivePersona();
      return persona?.systemPrompt || "";
    }

    duplicatePersona(id) {
      const original = this.personas.get(id);
      if (!original) return null;

      const copy = { ...original };
      copy.name = `${original.name} (Copy)`;
      copy.isDefault = false;
      delete copy.id;

      return this.createPersona(copy);
    }

    // ═════════════════════════════════════════════════════════════════
    // UI
    // ═════════════════════════════════════════════════════════════════

    createUI() {
      const panel = document.createElement("div");
      panel.id = "bael-persona-panel";
      panel.className = "bael-persona-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;
    }

    renderPanel() {
      const personasList = Array.from(this.personas.values());
      const active = this.getActivePersona();

      if (this.editingPersona) {
        return this.renderEditMode();
      }

      return `
                <div class="persona-header">
                    <div class="persona-title">
                        <span class="persona-icon">🎭</span>
                        <span>AI Personas</span>
                    </div>
                    <button class="persona-close" id="persona-close">×</button>
                </div>

                <div class="persona-content">
                    ${
                      active
                        ? `
                        <div class="persona-active">
                            <div class="persona-active-avatar">${active.avatar}</div>
                            <div class="persona-active-info">
                                <span class="persona-active-name">${active.name}</span>
                                <span class="persona-active-desc">${active.description}</span>
                            </div>
                            <span class="persona-active-badge">Active</span>
                        </div>
                    `
                        : ""
                    }

                    <div class="persona-section">
                        <div class="persona-section-header">
                            <h4>All Personas</h4>
                            <button class="persona-btn primary" id="persona-create">+ Create New</button>
                        </div>

                        <div class="persona-grid">
                            ${personasList
                              .map(
                                (p) => `
                                <div class="persona-card ${p.id === this.activePersona ? "active" : ""}"
                                     data-id="${p.id}">
                                    <div class="persona-card-header">
                                        <span class="persona-card-avatar">${p.avatar}</span>
                                        ${p.isDefault ? '<span class="persona-default-badge">Default</span>' : ""}
                                    </div>
                                    <div class="persona-card-body">
                                        <span class="persona-card-name">${p.name}</span>
                                        <span class="persona-card-desc">${p.description.substring(0, 60)}...</span>
                                    </div>
                                    <div class="persona-card-traits">
                                        ${(p.traits.expertise || [])
                                          .slice(0, 3)
                                          .map(
                                            (t) =>
                                              `<span class="persona-trait">${t}</span>`,
                                          )
                                          .join("")}
                                    </div>
                                    <div class="persona-card-actions">
                                        <button class="persona-action use" data-id="${p.id}">
                                            ${p.id === this.activePersona ? "✓ Active" : "Use"}
                                        </button>
                                        <button class="persona-action edit" data-id="${p.id}">✏️</button>
                                        <button class="persona-action copy" data-id="${p.id}">📋</button>
                                        ${
                                          !p.isDefault
                                            ? `
                                            <button class="persona-action delete" data-id="${p.id}">🗑️</button>
                                        `
                                            : ""
                                        }
                                    </div>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>

                    ${
                      active
                        ? `
                        <div class="persona-section">
                            <h4>Current Settings</h4>
                            <div class="persona-parameters">
                                <div class="persona-param">
                                    <span>Temperature</span>
                                    <span class="persona-param-value">${active.parameters.temperature}</span>
                                </div>
                                <div class="persona-param">
                                    <span>Creativity</span>
                                    <span class="persona-param-value">${active.parameters.creativity}%</span>
                                </div>
                                <div class="persona-param">
                                    <span>Verbosity</span>
                                    <span class="persona-param-value">${active.parameters.verbosity}%</span>
                                </div>
                            </div>
                        </div>
                    `
                        : ""
                    }
                </div>
            `;
    }

    renderEditMode() {
      const persona = this.editingPersona;
      const isNew = !persona.id;

      const avatars = [
        "🤖",
        "👨‍💻",
        "👩‍💻",
        "✍️",
        "🔬",
        "👩‍🏫",
        "📊",
        "🎭",
        "🦊",
        "🐱",
        "🦁",
        "🎨",
        "🚀",
        "💡",
        "🧠",
        "⚡",
      ];

      return `
                <div class="persona-header">
                    <div class="persona-title">
                        <span class="persona-icon">${persona.avatar || "🎭"}</span>
                        <span>${isNew ? "Create Persona" : "Edit Persona"}</span>
                    </div>
                    <button class="persona-close" id="persona-back">← Back</button>
                </div>

                <div class="persona-content">
                    <div class="persona-form">
                        <div class="form-group">
                            <label>Avatar</label>
                            <div class="avatar-picker">
                                ${avatars
                                  .map(
                                    (a) => `
                                    <button class="avatar-option ${persona.avatar === a ? "selected" : ""}"
                                            data-avatar="${a}">${a}</button>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Name</label>
                            <input type="text" id="persona-name" value="${persona.name || ""}"
                                   placeholder="Enter persona name">
                        </div>

                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="persona-description" rows="2"
                                      placeholder="Brief description">${persona.description || ""}</textarea>
                        </div>

                        <div class="form-group">
                            <label>System Prompt</label>
                            <textarea id="persona-prompt" rows="4"
                                      placeholder="Instructions for the AI...">${persona.systemPrompt || ""}</textarea>
                        </div>

                        <div class="form-group">
                            <label>Communication Style</label>
                            <div class="trait-selector">
                                ${this.traitCategories.communication
                                  .map(
                                    (t) => `
                                    <label class="trait-option">
                                        <input type="checkbox" value="${t.id}"
                                               ${(persona.traits?.communication || []).includes(t.id) ? "checked" : ""}
                                               data-category="communication">
                                        <span>${t.name}</span>
                                    </label>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Personality Traits</label>
                            <div class="trait-selector">
                                ${this.traitCategories.personality
                                  .map(
                                    (t) => `
                                    <label class="trait-option">
                                        <input type="checkbox" value="${t.id}"
                                               ${(persona.traits?.personality || []).includes(t.id) ? "checked" : ""}
                                               data-category="personality">
                                        <span>${t.name}</span>
                                    </label>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Expertise Areas</label>
                            <div class="trait-selector">
                                ${this.traitCategories.expertise
                                  .map(
                                    (t) => `
                                    <label class="trait-option">
                                        <input type="checkbox" value="${t.id}"
                                               ${(persona.traits?.expertise || []).includes(t.id) ? "checked" : ""}
                                               data-category="expertise">
                                        <span>${t.name}</span>
                                    </label>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Temperature: ${persona.parameters?.temperature || 0.7}</label>
                            <input type="range" id="persona-temp" min="0" max="2" step="0.1"
                                   value="${persona.parameters?.temperature || 0.7}">
                        </div>

                        <div class="form-group">
                            <label>Creativity: ${persona.parameters?.creativity || 50}%</label>
                            <input type="range" id="persona-creativity" min="0" max="100"
                                   value="${persona.parameters?.creativity || 50}">
                        </div>

                        <div class="form-group">
                            <label>Verbosity: ${persona.parameters?.verbosity || 50}%</label>
                            <input type="range" id="persona-verbosity" min="0" max="100"
                                   value="${persona.parameters?.verbosity || 50}">
                        </div>

                        <div class="form-actions">
                            <button class="persona-btn" id="persona-cancel">Cancel</button>
                            <button class="persona-btn primary" id="persona-save">
                                ${isNew ? "Create" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            `;
    }

    updateUI() {
      if (!this.panel) return;
      this.panel.innerHTML = this.renderPanel();
      this.bindPanelEvents();
    }

    addStyles() {
      if (document.getElementById("bael-persona-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-persona-styles";
      styles.textContent = `
                .bael-persona-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90vw;
                    max-width: 700px;
                    max-height: 85vh;
                    background: var(--color-panel, #0f0f17);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 20px;
                    z-index: 100075;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 50px 150px rgba(0,0,0,0.8);
                }

                .bael-persona-panel.visible {
                    display: flex;
                    animation: personaIn 0.3s ease;
                }

                @keyframes personaIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .persona-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    border-bottom: 1px solid var(--color-border, #252535);
                }

                .persona-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 17px;
                    font-weight: 700;
                    color: var(--color-text, #fff);
                }

                .persona-icon { font-size: 24px; }

                .persona-close {
                    padding: 8px 16px;
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted, #666);
                    font-size: 14px;
                    cursor: pointer;
                }

                .persona-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px 24px;
                }

                .persona-active {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: linear-gradient(135deg, rgba(255,51,102,0.1), rgba(99,102,241,0.1));
                    border: 1px solid var(--color-primary, #ff3366);
                    border-radius: 16px;
                    margin-bottom: 24px;
                }

                .persona-active-avatar { font-size: 40px; }

                .persona-active-info { flex: 1; }

                .persona-active-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--color-text, #fff);
                    display: block;
                }

                .persona-active-desc {
                    font-size: 12px;
                    color: var(--color-text-muted, #888);
                }

                .persona-active-badge {
                    padding: 6px 14px;
                    background: var(--color-primary, #ff3366);
                    border-radius: 20px;
                    font-size: 11px;
                    font-weight: 600;
                    color: #fff;
                }

                .persona-section { margin-bottom: 24px; }

                .persona-section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .persona-section h4 {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--color-text, #fff);
                }

                .persona-btn {
                    padding: 10px 20px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 10px;
                    color: var(--color-text, #fff);
                    font-size: 13px;
                    cursor: pointer;
                }

                .persona-btn.primary {
                    background: var(--color-primary, #ff3366);
                    border-color: transparent;
                }

                .persona-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 16px;
                }

                .persona-card {
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 14px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .persona-card:hover {
                    border-color: var(--color-primary, #ff3366);
                    transform: translateY(-2px);
                }

                .persona-card.active {
                    border-color: var(--color-primary, #ff3366);
                    background: rgba(255,51,102,0.05);
                }

                .persona-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 12px;
                }

                .persona-card-avatar { font-size: 32px; }

                .persona-default-badge {
                    font-size: 9px;
                    padding: 2px 6px;
                    background: var(--color-border, #333);
                    border-radius: 10px;
                    color: var(--color-text-muted, #888);
                }

                .persona-card-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--color-text, #fff);
                    display: block;
                    margin-bottom: 4px;
                }

                .persona-card-desc {
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                    line-height: 1.4;
                }

                .persona-card-traits {
                    display: flex;
                    gap: 4px;
                    margin: 12px 0;
                    flex-wrap: wrap;
                }

                .persona-trait {
                    font-size: 9px;
                    padding: 3px 8px;
                    background: var(--color-panel, #12121a);
                    border-radius: 10px;
                    color: var(--color-text-muted, #888);
                }

                .persona-card-actions {
                    display: flex;
                    gap: 6px;
                    margin-top: 12px;
                }

                .persona-action {
                    padding: 6px 12px;
                    background: var(--color-panel, #12121a);
                    border: none;
                    border-radius: 6px;
                    font-size: 11px;
                    color: var(--color-text-muted, #888);
                    cursor: pointer;
                }

                .persona-action.use {
                    flex: 1;
                    background: var(--color-primary, #ff3366);
                    color: #fff;
                }

                .persona-parameters {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                }

                .persona-param {
                    padding: 12px;
                    background: var(--color-surface, #181820);
                    border-radius: 10px;
                    text-align: center;
                }

                .persona-param span:first-child {
                    display: block;
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                    margin-bottom: 4px;
                }

                .persona-param-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--color-primary, #ff3366);
                }

                /* Edit Mode */
                .persona-form { display: flex; flex-direction: column; gap: 20px; }

                .form-group label {
                    display: block;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--color-text-muted, #888);
                    margin-bottom: 8px;
                }

                .form-group input[type="text"],
                .form-group textarea {
                    width: 100%;
                    padding: 12px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 10px;
                    color: var(--color-text, #fff);
                    font-size: 13px;
                    resize: vertical;
                }

                .avatar-picker {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .avatar-option {
                    width: 40px;
                    height: 40px;
                    background: var(--color-surface, #181820);
                    border: 2px solid var(--color-border, #252535);
                    border-radius: 10px;
                    font-size: 20px;
                    cursor: pointer;
                }

                .avatar-option.selected {
                    border-color: var(--color-primary, #ff3366);
                    background: rgba(255,51,102,0.1);
                }

                .trait-selector {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .trait-option {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 8px;
                    font-size: 12px;
                    color: var(--color-text, #fff);
                    cursor: pointer;
                }

                .trait-option:has(input:checked) {
                    border-color: var(--color-primary, #ff3366);
                    background: rgba(255,51,102,0.1);
                }

                .form-group input[type="range"] {
                    width: 100%;
                    height: 6px;
                    background: var(--color-border, #333);
                    border-radius: 3px;
                    appearance: none;
                }

                .form-group input[type="range"]::-webkit-slider-thumb {
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    background: var(--color-primary, #ff3366);
                    border-radius: 50%;
                    cursor: pointer;
                }

                .form-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    padding-top: 16px;
                    border-top: 1px solid var(--color-border, #252535);
                }
            `;
      document.head.appendChild(styles);
    }

    // ═════════════════════════════════════════════════════════════════
    // EVENT BINDING
    // ═════════════════════════════════════════════════════════════════

    bindEvents() {
      this.bindPanelEvents();

      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "A") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    bindPanelEvents() {
      if (!this.panel) return;

      // Close/Back
      this.panel
        .querySelector("#persona-close")
        ?.addEventListener("click", () => this.close());
      this.panel
        .querySelector("#persona-back")
        ?.addEventListener("click", () => {
          this.editingPersona = null;
          this.updateUI();
        });

      // Create new
      this.panel
        .querySelector("#persona-create")
        ?.addEventListener("click", () => {
          this.editingPersona = {
            name: "",
            avatar: "🎭",
            description: "",
            systemPrompt: "",
            traits: { communication: [], personality: [], expertise: [] },
            parameters: { temperature: 0.7, creativity: 50, verbosity: 50 },
          };
          this.updateUI();
        });

      // Card actions
      this.panel.querySelectorAll(".persona-action.use").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.activatePersona(btn.dataset.id);
        });
      });

      this.panel.querySelectorAll(".persona-action.edit").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const persona = this.personas.get(btn.dataset.id);
          if (persona) {
            this.editingPersona = { ...persona };
            this.updateUI();
          }
        });
      });

      this.panel.querySelectorAll(".persona-action.copy").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.duplicatePersona(btn.dataset.id);
          window.BaelNotifications?.show("Persona duplicated", "success");
        });
      });

      this.panel.querySelectorAll(".persona-action.delete").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (confirm("Delete this persona?")) {
            this.deletePersona(btn.dataset.id);
          }
        });
      });

      // Edit mode events
      this.bindEditModeEvents();
    }

    bindEditModeEvents() {
      if (!this.editingPersona) return;

      // Avatar selection
      this.panel.querySelectorAll(".avatar-option").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.editingPersona.avatar = btn.dataset.avatar;
          this.panel
            .querySelectorAll(".avatar-option")
            .forEach((b) => b.classList.remove("selected"));
          btn.classList.add("selected");
        });
      });

      // Sliders
      const tempSlider = this.panel.querySelector("#persona-temp");
      if (tempSlider) {
        tempSlider.addEventListener("input", (e) => {
          this.editingPersona.parameters.temperature = parseFloat(
            e.target.value,
          );
          e.target.previousElementSibling.textContent = `Temperature: ${e.target.value}`;
        });
      }

      const creativitySlider = this.panel.querySelector("#persona-creativity");
      if (creativitySlider) {
        creativitySlider.addEventListener("input", (e) => {
          this.editingPersona.parameters.creativity = parseInt(e.target.value);
          e.target.previousElementSibling.textContent = `Creativity: ${e.target.value}%`;
        });
      }

      const verbositySlider = this.panel.querySelector("#persona-verbosity");
      if (verbositySlider) {
        verbositySlider.addEventListener("input", (e) => {
          this.editingPersona.parameters.verbosity = parseInt(e.target.value);
          e.target.previousElementSibling.textContent = `Verbosity: ${e.target.value}%`;
        });
      }

      // Cancel
      this.panel
        .querySelector("#persona-cancel")
        ?.addEventListener("click", () => {
          this.editingPersona = null;
          this.updateUI();
        });

      // Save
      this.panel
        .querySelector("#persona-save")
        ?.addEventListener("click", () => {
          const name = this.panel.querySelector("#persona-name")?.value;
          const description = this.panel.querySelector(
            "#persona-description",
          )?.value;
          const systemPrompt =
            this.panel.querySelector("#persona-prompt")?.value;

          // Collect traits
          const traits = { communication: [], personality: [], expertise: [] };
          this.panel
            .querySelectorAll(".trait-option input:checked")
            .forEach((input) => {
              const category = input.dataset.category;
              if (traits[category]) {
                traits[category].push(input.value);
              }
            });

          const data = {
            ...this.editingPersona,
            name,
            description,
            systemPrompt,
            traits,
          };

          if (this.editingPersona.id) {
            this.updatePersona(this.editingPersona.id, data);
          } else {
            this.createPersona(data);
          }

          this.editingPersona = null;
          window.BaelNotifications?.show("Persona saved", "success");
        });
    }

    emit(event, data = {}) {
      window.dispatchEvent(
        new CustomEvent(`bael:persona:${event}`, { detail: data }),
      );
    }

    // ═════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═════════════════════════════════════════════════════════════════

    loadPersonas() {
      try {
        const saved = JSON.parse(localStorage.getItem("bael_personas") || "{}");
        Object.entries(saved.personas || {}).forEach(([id, p]) => {
          p.createdAt = new Date(p.createdAt);
          this.personas.set(id, p);
        });
        this.activePersona = saved.active || null;
      } catch (e) {
        console.warn("Failed to load personas:", e);
      }
    }

    savePersonas() {
      localStorage.setItem(
        "bael_personas",
        JSON.stringify({
          personas: Object.fromEntries(this.personas),
          active: this.activePersona,
        }),
      );
    }

    // ═════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═════════════════════════════════════════════════════════════════

    open() {
      this.isVisible = true;
      this.updateUI();
      this.panel.classList.add("visible");
    }

    close() {
      this.isVisible = false;
      this.panel.classList.remove("visible");
      this.editingPersona = null;
    }

    toggle() {
      this.isVisible ? this.close() : this.open();
    }
  }

  window.BaelPersonaSystem = new BaelPersonaSystem();
})();
