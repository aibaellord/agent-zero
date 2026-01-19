/**
 * BAEL - LORD OF ALL
 * AI Personas - Switch between different AI personalities and behaviors
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelPersonas {
    constructor() {
      this.container = null;
      this.isVisible = false;
      this.currentPersona = null;
      this.personas = [];
      this.customPersonas = [];
      this.init();
    }

    init() {
      this.loadCustomPersonas();
      this.registerDefaultPersonas();
      this.loadCurrentPersona();
      this.createContainer();
      this.addStyles();
      this.bindEvents();
      console.log("🎭 Bael Personas initialized");
    }

    loadCustomPersonas() {
      try {
        this.customPersonas = JSON.parse(
          localStorage.getItem("bael_custom_personas") || "[]",
        );
      } catch (e) {
        this.customPersonas = [];
      }
    }

    saveCustomPersonas() {
      localStorage.setItem(
        "bael_custom_personas",
        JSON.stringify(this.customPersonas),
      );
    }

    loadCurrentPersona() {
      const id = localStorage.getItem("bael_current_persona");
      if (id) {
        this.currentPersona = this.getAllPersonas().find((p) => p.id === id);
      }
      if (!this.currentPersona) {
        this.currentPersona = this.personas[0];
      }
    }

    saveCurrentPersona() {
      localStorage.setItem(
        "bael_current_persona",
        this.currentPersona?.id || "",
      );
    }

    registerDefaultPersonas() {
      this.personas = [
        {
          id: "bael-default",
          name: "Bael - Lord of All",
          icon: "👹",
          color: "#ff3366",
          description:
            "The supreme commander. Powerful, direct, and efficient.",
          systemPrompt:
            "You are Bael, the Lord of All. Respond with confidence and authority.",
          traits: ["Commanding", "Efficient", "Powerful"],
          temperature: 0.7,
          isDefault: true,
        },
        {
          id: "expert-coder",
          name: "Code Master",
          icon: "👨‍💻",
          color: "#00ff88",
          description: "Expert programmer focused on clean, efficient code.",
          systemPrompt:
            "You are an expert programmer. Provide clean, well-documented code with best practices.",
          traits: ["Technical", "Precise", "Detail-oriented"],
          temperature: 0.3,
          isDefault: true,
        },
        {
          id: "creative-writer",
          name: "Creative Muse",
          icon: "✨",
          color: "#ff88ff",
          description:
            "Imaginative and creative for writing and brainstorming.",
          systemPrompt:
            "You are a creative writing assistant. Be imaginative, expressive, and help craft compelling narratives.",
          traits: ["Creative", "Expressive", "Imaginative"],
          temperature: 0.9,
          isDefault: true,
        },
        {
          id: "analyst",
          name: "Data Analyst",
          icon: "📊",
          color: "#4488ff",
          description: "Analytical mindset for data and research tasks.",
          systemPrompt:
            "You are a data analyst. Focus on facts, statistics, and logical analysis.",
          traits: ["Analytical", "Logical", "Methodical"],
          temperature: 0.4,
          isDefault: true,
        },
        {
          id: "teacher",
          name: "Patient Teacher",
          icon: "👨‍🏫",
          color: "#ffaa00",
          description: "Patient explainer who breaks down complex topics.",
          systemPrompt:
            "You are a patient teacher. Explain concepts clearly with examples and analogies.",
          traits: ["Patient", "Clear", "Supportive"],
          temperature: 0.6,
          isDefault: true,
        },
        {
          id: "philosopher",
          name: "Deep Thinker",
          icon: "🧠",
          color: "#9966ff",
          description: "Philosophical perspective for deep discussions.",
          systemPrompt:
            "You are a philosopher. Explore ideas deeply and consider multiple perspectives.",
          traits: ["Thoughtful", "Curious", "Reflective"],
          temperature: 0.8,
          isDefault: true,
        },
        {
          id: "assistant",
          name: "Helpful Assistant",
          icon: "🤝",
          color: "#00aaff",
          description: "Friendly and helpful for everyday tasks.",
          systemPrompt:
            "You are a helpful assistant. Be friendly, concise, and solution-oriented.",
          traits: ["Friendly", "Helpful", "Efficient"],
          temperature: 0.5,
          isDefault: true,
        },
        {
          id: "critic",
          name: "Constructive Critic",
          icon: "🔍",
          color: "#ff6600",
          description: "Provides thoughtful feedback and improvements.",
          systemPrompt:
            "You are a constructive critic. Provide honest, detailed feedback with suggestions for improvement.",
          traits: ["Critical", "Honest", "Constructive"],
          temperature: 0.5,
          isDefault: true,
        },
      ];
    }

    getAllPersonas() {
      return [...this.personas, ...this.customPersonas];
    }

    createContainer() {
      const container = document.createElement("div");
      container.id = "bael-personas";
      container.className = "bael-personas";
      container.innerHTML = `
                <div class="personas-header">
                    <div class="personas-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="8" r="5"/>
                            <path d="M20 21a8 8 0 00-16 0"/>
                        </svg>
                        <span>AI Personas</span>
                    </div>
                    <button class="personas-close" id="personas-close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <div class="personas-current" id="personas-current">
                    <!-- Current persona shown here -->
                </div>

                <div class="personas-tabs">
                    <button class="persona-tab active" data-tab="gallery">Gallery</button>
                    <button class="persona-tab" data-tab="custom">Custom</button>
                    <button class="persona-tab" data-tab="create">Create</button>
                </div>

                <div class="personas-content">
                    <div class="persona-panel active" data-panel="gallery">
                        <div class="personas-grid" id="personas-gallery"></div>
                    </div>

                    <div class="persona-panel" data-panel="custom">
                        <div class="personas-grid" id="personas-custom"></div>
                    </div>

                    <div class="persona-panel" data-panel="create">
                        <div class="persona-form">
                            <div class="form-group">
                                <label>Persona Name</label>
                                <input type="text" id="persona-name" placeholder="Enter name...">
                            </div>
                            <div class="form-group">
                                <label>Icon (emoji)</label>
                                <input type="text" id="persona-icon" placeholder="🤖" maxlength="2">
                            </div>
                            <div class="form-group">
                                <label>Color</label>
                                <input type="color" id="persona-color" value="#ff3366">
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <input type="text" id="persona-desc" placeholder="Describe this persona...">
                            </div>
                            <div class="form-group">
                                <label>System Prompt</label>
                                <textarea id="persona-prompt" rows="4" placeholder="You are..."></textarea>
                            </div>
                            <div class="form-group">
                                <label>Traits (comma separated)</label>
                                <input type="text" id="persona-traits" placeholder="Creative, Friendly, Expert">
                            </div>
                            <div class="form-group">
                                <label>Temperature: <span id="temp-value">0.7</span></label>
                                <input type="range" id="persona-temp" min="0" max="1" step="0.1" value="0.7">
                            </div>
                            <button class="persona-create-btn" id="persona-create-btn">Create Persona</button>
                        </div>
                    </div>
                </div>
            `;
      document.body.appendChild(container);
      this.container = container;

      // Create backdrop
      const backdrop = document.createElement("div");
      backdrop.className = "bael-personas-backdrop";
      backdrop.addEventListener("click", () => this.close());
      document.body.appendChild(backdrop);
      this.backdrop = backdrop;

      this.createTrigger();
      this.renderCurrentPersona();
      this.renderGallery();
    }

    createTrigger() {
      const trigger = document.createElement("button");
      trigger.id = "bael-personas-trigger";
      trigger.className = "bael-personas-trigger";
      trigger.title = "AI Personas (Ctrl+Shift+P)";
      trigger.innerHTML = `
                <span class="trigger-icon">${this.currentPersona?.icon || "🎭"}</span>
            `;
      document.body.appendChild(trigger);
      trigger.addEventListener("click", () => this.toggle());
    }

    updateTriggerIcon() {
      const trigger = document.querySelector(
        ".bael-personas-trigger .trigger-icon",
      );
      if (trigger) {
        trigger.textContent = this.currentPersona?.icon || "🎭";
      }
    }

    addStyles() {
      if (document.getElementById("bael-personas-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-personas-styles";
      styles.textContent = `
                .bael-personas {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 600px;
                    max-width: 95vw;
                    max-height: 85vh;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100022;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
                    overflow: hidden;
                }

                .bael-personas.visible {
                    display: flex;
                    animation: personasZoom 0.3s ease;
                }

                @keyframes personasZoom {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .personas-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .personas-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .personas-title svg {
                    width: 22px;
                    height: 22px;
                    color: var(--bael-accent, #ff3366);
                }

                .personas-close {
                    width: 36px;
                    height: 36px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .personas-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                .personas-close svg {
                    width: 20px;
                    height: 20px;
                }

                .personas-current {
                    padding: 16px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .current-persona {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }

                .current-icon {
                    width: 50px;
                    height: 50px;
                    font-size: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 12px;
                    background: rgba(255, 51, 102, 0.2);
                }

                .current-info {
                    flex: 1;
                }

                .current-name {
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 4px;
                }

                .current-desc {
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                }

                .current-label {
                    padding: 4px 10px;
                    background: var(--bael-accent, #ff3366);
                    border-radius: 12px;
                    font-size: 10px;
                    font-weight: 600;
                    color: #fff;
                    text-transform: uppercase;
                }

                .personas-tabs {
                    display: flex;
                    gap: 4px;
                    padding: 12px 20px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .persona-tab {
                    padding: 8px 16px;
                    background: transparent;
                    border: none;
                    border-radius: 8px;
                    color: var(--bael-text-muted, #666);
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .persona-tab:hover {
                    color: var(--bael-text-primary, #fff);
                }

                .persona-tab.active {
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .personas-content {
                    flex: 1;
                    overflow: hidden;
                    position: relative;
                }

                .persona-panel {
                    position: absolute;
                    inset: 0;
                    padding: 20px;
                    overflow-y: auto;
                    display: none;
                }

                .persona-panel.active {
                    display: block;
                }

                .personas-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                .persona-card {
                    background: var(--bael-bg-secondary, #12121a);
                    border: 2px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    padding: 16px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                }

                .persona-card:hover {
                    border-color: var(--persona-color, var(--bael-accent, #ff3366));
                    transform: translateY(-2px);
                }

                .persona-card.active {
                    border-color: var(--persona-color, var(--bael-accent, #ff3366));
                    background: rgba(255, 51, 102, 0.1);
                }

                .persona-card-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 10px;
                }

                .persona-card-icon {
                    width: 42px;
                    height: 42px;
                    font-size: 22px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    background: var(--persona-color-bg, rgba(255, 51, 102, 0.2));
                }

                .persona-card-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .persona-card-desc {
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                    line-height: 1.4;
                    margin-bottom: 10px;
                }

                .persona-traits {
                    display: flex;
                    gap: 6px;
                    flex-wrap: wrap;
                }

                .persona-trait {
                    padding: 3px 8px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-radius: 4px;
                    font-size: 10px;
                    color: var(--bael-text-secondary, #aaa);
                }

                .persona-delete {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 24px;
                    height: 24px;
                    border: none;
                    background: rgba(255, 0, 0, 0.2);
                    color: #f44336;
                    border-radius: 6px;
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .persona-card:hover .persona-delete {
                    opacity: 1;
                }

                /* Form styles */
                .persona-form {
                    max-width: 400px;
                    margin: 0 auto;
                }

                .form-group {
                    margin-bottom: 16px;
                }

                .form-group label {
                    display: block;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--bael-text-secondary, #aaa);
                    margin-bottom: 6px;
                }

                .form-group input[type="text"],
                .form-group input[type="color"],
                .form-group textarea {
                    width: 100%;
                    padding: 10px 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 13px;
                    outline: none;
                }

                .form-group input[type="color"] {
                    height: 40px;
                    cursor: pointer;
                }

                .form-group input:focus,
                .form-group textarea:focus {
                    border-color: var(--bael-accent, #ff3366);
                }

                .form-group textarea {
                    resize: vertical;
                    font-family: inherit;
                }

                .form-group input[type="range"] {
                    width: 100%;
                    margin-top: 6px;
                }

                .persona-create-btn {
                    width: 100%;
                    padding: 12px;
                    background: var(--bael-accent, #ff3366);
                    border: none;
                    border-radius: 8px;
                    color: #fff;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .persona-create-btn:hover {
                    background: #ff4477;
                }

                .empty-custom {
                    text-align: center;
                    padding: 40px;
                    color: var(--bael-text-muted, #666);
                }

                .empty-custom svg {
                    width: 48px;
                    height: 48px;
                    margin-bottom: 12px;
                    opacity: 0.5;
                }

                /* Trigger button */
                .bael-personas-trigger {
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    width: 44px;
                    height: 44px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9986;
                    transition: all 0.3s ease;
                }

                .bael-personas-trigger:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.1);
                }

                .trigger-icon {
                    font-size: 22px;
                }

                /* Backdrop */
                .bael-personas-backdrop {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    z-index: 100021;
                    display: none;
                }

                .bael-personas-backdrop.visible {
                    display: block;
                }
            `;
      document.head.appendChild(styles);
    }

    bindEvents() {
      // Close
      this.container
        .querySelector("#personas-close")
        .addEventListener("click", () => this.close());

      // Tabs
      this.container.querySelectorAll(".persona-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          this.switchTab(tab.dataset.tab);
        });
      });

      // Temperature slider
      const tempSlider = this.container.querySelector("#persona-temp");
      const tempValue = this.container.querySelector("#temp-value");
      tempSlider.addEventListener("input", () => {
        tempValue.textContent = tempSlider.value;
      });

      // Create persona
      this.container
        .querySelector("#persona-create-btn")
        .addEventListener("click", () => {
          this.createPersona();
        });

      // Keyboard shortcut (avoiding conflict with prompts)
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.altKey && e.key === "P") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape" && this.isVisible) {
          this.close();
        }
      });
    }

    switchTab(tab) {
      this.container
        .querySelectorAll(".persona-tab")
        .forEach((t) => t.classList.remove("active"));
      this.container
        .querySelector(`.persona-tab[data-tab="${tab}"]`)
        .classList.add("active");

      this.container
        .querySelectorAll(".persona-panel")
        .forEach((p) => p.classList.remove("active"));
      this.container
        .querySelector(`.persona-panel[data-panel="${tab}"]`)
        .classList.add("active");

      if (tab === "custom") this.renderCustom();
    }

    renderCurrentPersona() {
      const el = this.container.querySelector("#personas-current");
      if (!this.currentPersona) {
        el.innerHTML =
          '<p style="color: var(--bael-text-muted)">No persona selected</p>';
        return;
      }

      el.innerHTML = `
                <div class="current-persona">
                    <div class="current-icon" style="background: ${this.currentPersona.color}22">${this.currentPersona.icon}</div>
                    <div class="current-info">
                        <div class="current-name">${this.currentPersona.name}</div>
                        <div class="current-desc">${this.currentPersona.description}</div>
                    </div>
                    <span class="current-label">Active</span>
                </div>
            `;
    }

    renderGallery() {
      const grid = this.container.querySelector("#personas-gallery");
      grid.innerHTML = this.personas
        .map((persona) => this.renderPersonaCard(persona))
        .join("");
      this.bindCardEvents(grid);
    }

    renderCustom() {
      const grid = this.container.querySelector("#personas-custom");

      if (this.customPersonas.length === 0) {
        grid.innerHTML = `
                    <div class="empty-custom" style="grid-column: span 2;">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="8" r="5"/>
                            <path d="M20 21a8 8 0 00-16 0"/>
                        </svg>
                        <p>No custom personas yet</p>
                        <p style="font-size: 12px;">Create your first custom persona!</p>
                    </div>
                `;
        return;
      }

      grid.innerHTML = this.customPersonas
        .map((persona) => this.renderPersonaCard(persona, true))
        .join("");
      this.bindCardEvents(grid, true);
    }

    renderPersonaCard(persona, showDelete = false) {
      const isActive = this.currentPersona?.id === persona.id;
      return `
                <div class="persona-card ${isActive ? "active" : ""}"
                     data-id="${persona.id}"
                     style="--persona-color: ${persona.color}; --persona-color-bg: ${persona.color}22">
                    ${showDelete ? '<button class="persona-delete" data-id="' + persona.id + '">×</button>' : ""}
                    <div class="persona-card-header">
                        <div class="persona-card-icon">${persona.icon}</div>
                        <div class="persona-card-name">${persona.name}</div>
                    </div>
                    <div class="persona-card-desc">${persona.description}</div>
                    <div class="persona-traits">
                        ${persona.traits.map((t) => `<span class="persona-trait">${t}</span>`).join("")}
                    </div>
                </div>
            `;
    }

    bindCardEvents(grid, isCustom = false) {
      grid.querySelectorAll(".persona-card").forEach((card) => {
        card.addEventListener("click", (e) => {
          if (e.target.classList.contains("persona-delete")) return;
          const id = card.dataset.id;
          this.selectPersona(id);
        });
      });

      if (isCustom) {
        grid.querySelectorAll(".persona-delete").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            e.stopPropagation();
            this.deletePersona(btn.dataset.id);
          });
        });
      }
    }

    selectPersona(id) {
      const persona = this.getAllPersonas().find((p) => p.id === id);
      if (!persona) return;

      this.currentPersona = persona;
      this.saveCurrentPersona();
      this.renderCurrentPersona();
      this.renderGallery();
      this.updateTriggerIcon();

      // Emit event for other systems to react
      window.dispatchEvent(
        new CustomEvent("bael-persona-changed", { detail: persona }),
      );

      if (window.BaelNotifications) {
        window.BaelNotifications.success(`Switched to ${persona.name}`);
      }
    }

    createPersona() {
      const name = this.container.querySelector("#persona-name").value.trim();
      const icon =
        this.container.querySelector("#persona-icon").value.trim() || "🤖";
      const color = this.container.querySelector("#persona-color").value;
      const desc = this.container.querySelector("#persona-desc").value.trim();
      const prompt = this.container
        .querySelector("#persona-prompt")
        .value.trim();
      const traits = this.container
        .querySelector("#persona-traits")
        .value.split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const temp = parseFloat(
        this.container.querySelector("#persona-temp").value,
      );

      if (!name) {
        if (window.BaelNotifications) {
          window.BaelNotifications.error("Please enter a persona name");
        }
        return;
      }

      const persona = {
        id: "custom-" + Date.now(),
        name,
        icon,
        color,
        description: desc || "Custom persona",
        systemPrompt: prompt || "You are a helpful AI assistant.",
        traits: traits.length ? traits : ["Custom"],
        temperature: temp,
        isDefault: false,
      };

      this.customPersonas.push(persona);
      this.saveCustomPersonas();

      // Clear form
      this.container.querySelector("#persona-name").value = "";
      this.container.querySelector("#persona-icon").value = "";
      this.container.querySelector("#persona-desc").value = "";
      this.container.querySelector("#persona-prompt").value = "";
      this.container.querySelector("#persona-traits").value = "";
      this.container.querySelector("#persona-temp").value = "0.7";
      this.container.querySelector("#temp-value").textContent = "0.7";

      this.switchTab("custom");

      if (window.BaelNotifications) {
        window.BaelNotifications.success("Persona created!");
      }
    }

    deletePersona(id) {
      if (!confirm("Delete this persona?")) return;

      this.customPersonas = this.customPersonas.filter((p) => p.id !== id);
      this.saveCustomPersonas();

      if (this.currentPersona?.id === id) {
        this.currentPersona = this.personas[0];
        this.saveCurrentPersona();
        this.renderCurrentPersona();
        this.updateTriggerIcon();
      }

      this.renderCustom();

      if (window.BaelNotifications) {
        window.BaelNotifications.info("Persona deleted");
      }
    }

    // Public API
    open() {
      this.isVisible = true;
      this.container.classList.add("visible");
      this.backdrop.classList.add("visible");
    }

    close() {
      this.isVisible = false;
      this.container.classList.remove("visible");
      this.backdrop.classList.remove("visible");
    }

    toggle() {
      if (this.isVisible) {
        this.close();
      } else {
        this.open();
      }
    }

    getCurrentPersona() {
      return this.currentPersona;
    }
  }

  // Initialize
  window.BaelPersonas = new BaelPersonas();
})();
