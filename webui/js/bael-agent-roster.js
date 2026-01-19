/**
 * BAEL - LORD OF ALL
 * Agent Roster - Multi-agent team management and delegation interface
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelAgentRoster {
    constructor() {
      this.isVisible = false;
      this.agents = this.loadAgents();
      this.activeAgent = null;
      this.init();
    }

    loadAgents() {
      const saved = localStorage.getItem("bael-agent-roster");
      const custom = saved ? JSON.parse(saved) : [];

      const defaults = [
        {
          id: "bael-prime",
          name: "Bael Prime",
          role: "Supreme Commander",
          avatar: "👑",
          color: "#ff3366",
          specialty: "General tasks, orchestration",
          status: "active",
          isDefault: true,
          stats: { tasks: 0, success: 0 },
        },
        {
          id: "code-weaver",
          name: "Code Weaver",
          role: "Software Engineer",
          avatar: "💻",
          color: "#22c55e",
          specialty: "Programming, debugging, architecture",
          status: "standby",
          isDefault: true,
          stats: { tasks: 0, success: 0 },
        },
        {
          id: "data-oracle",
          name: "Data Oracle",
          role: "Data Scientist",
          avatar: "📊",
          color: "#8b5cf6",
          specialty: "Analysis, ML, statistics",
          status: "standby",
          isDefault: true,
          stats: { tasks: 0, success: 0 },
        },
        {
          id: "research-sage",
          name: "Research Sage",
          role: "Knowledge Expert",
          avatar: "🔍",
          color: "#06b6d4",
          specialty: "Research, documentation, learning",
          status: "standby",
          isDefault: true,
          stats: { tasks: 0, success: 0 },
        },
        {
          id: "creative-muse",
          name: "Creative Muse",
          role: "Creative Director",
          avatar: "🎨",
          color: "#f97316",
          specialty: "Writing, design, brainstorming",
          status: "standby",
          isDefault: true,
          stats: { tasks: 0, success: 0 },
        },
        {
          id: "security-sentinel",
          name: "Security Sentinel",
          role: "Security Analyst",
          avatar: "🛡️",
          color: "#ef4444",
          specialty: "Security, auditing, hardening",
          status: "standby",
          isDefault: true,
          stats: { tasks: 0, success: 0 },
        },
      ];

      return [...defaults, ...custom];
    }

    saveAgents() {
      const custom = this.agents.filter((a) => !a.isDefault);
      localStorage.setItem("bael-agent-roster", JSON.stringify(custom));
    }

    init() {
      this.createUI();
      this.bindEvents();
      this.activeAgent =
        this.agents.find((a) => a.status === "active") || this.agents[0];
      console.log("👥 Bael Agent Roster initialized");
    }

    createUI() {
      const styles = document.createElement("style");
      styles.id = "bael-roster-styles";
      styles.textContent = `
                .bael-roster-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.85);
                    z-index: 10000;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(10px);
                }

                .bael-roster-overlay.visible {
                    display: flex;
                }

                .bael-roster-panel {
                    width: 90%;
                    max-width: 900px;
                    max-height: 85vh;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 20px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
                }

                .bael-roster-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 18px 24px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-roster-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--bael-text-primary, #fff);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .bael-roster-actions {
                    display: flex;
                    gap: 10px;
                }

                .bael-roster-btn {
                    padding: 10px 18px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    color: var(--bael-text-muted, #888);
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .bael-roster-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                .bael-roster-btn.primary {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .bael-roster-btn.primary:hover {
                    background: #ff4477;
                }

                .bael-roster-close {
                    width: 40px;
                    height: 40px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    font-size: 18px;
                }

                .bael-roster-close:hover {
                    background: #ff4444;
                    color: #fff;
                    border-color: #ff4444;
                }

                .bael-roster-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                }

                .bael-roster-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 18px;
                }

                .bael-agent-card {
                    background: var(--bael-bg-secondary, #12121a);
                    border: 2px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    padding: 20px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                }

                .bael-agent-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
                }

                .bael-agent-card.active {
                    border-color: var(--bael-accent, #ff3366);
                    box-shadow: 0 0 30px rgba(255, 51, 102, 0.2);
                }

                .bael-agent-card.active::before {
                    content: '✓ ACTIVE';
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    padding: 4px 10px;
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                    font-size: 9px;
                    font-weight: 700;
                    border-radius: 20px;
                }

                .bael-agent-header {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    margin-bottom: 14px;
                }

                .bael-agent-avatar {
                    width: 56px;
                    height: 56px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                }

                .bael-agent-info h3 {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin: 0 0 4px 0;
                }

                .bael-agent-info .role {
                    font-size: 12px;
                    color: var(--bael-text-muted, #888);
                }

                .bael-agent-specialty {
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                    margin-bottom: 14px;
                    line-height: 1.4;
                }

                .bael-agent-stats {
                    display: flex;
                    gap: 16px;
                    padding-top: 14px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-stat {
                    text-align: center;
                }

                .bael-stat-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--bael-text-primary, #fff);
                }

                .bael-stat-label {
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                    text-transform: uppercase;
                }

                .bael-agent-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 14px;
                }

                .bael-agent-action {
                    flex: 1;
                    padding: 8px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-muted, #888);
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-agent-action:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                .bael-agent-action.delete:hover {
                    border-color: #ff4444;
                    background: rgba(255, 68, 68, 0.1);
                    color: #ff4444;
                }

                /* Create Agent Modal */
                .bael-create-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 400px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    padding: 24px;
                    z-index: 10100;
                    display: none;
                }

                .bael-create-modal.visible {
                    display: block;
                }

                .bael-create-modal h3 {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin: 0 0 20px 0;
                }

                .bael-form-group {
                    margin-bottom: 16px;
                }

                .bael-form-label {
                    display: block;
                    font-size: 12px;
                    color: var(--bael-text-muted, #888);
                    margin-bottom: 6px;
                }

                .bael-form-input {
                    width: 100%;
                    padding: 10px 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 14px;
                }

                .bael-form-input:focus {
                    outline: none;
                    border-color: var(--bael-accent, #ff3366);
                }

                .bael-emoji-picker {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-top: 8px;
                }

                .bael-emoji-option {
                    width: 36px;
                    height: 36px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 2px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 18px;
                    transition: all 0.2s ease;
                }

                .bael-emoji-option:hover,
                .bael-emoji-option.selected {
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.1);
                }

                .bael-form-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }

                /* Trigger Button */
                .bael-roster-trigger {
                    position: fixed;
                    bottom: 260px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%);
                    border: none;
                    border-radius: 50%;
                    color: #fff;
                    font-size: 22px;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(6, 182, 212, 0.4);
                    z-index: 8000;
                    transition: all 0.3s ease;
                }

                .bael-roster-trigger:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 30px rgba(6, 182, 212, 0.6);
                }

                /* Active agent indicator */
                .bael-active-agent-badge {
                    position: fixed;
                    top: 10px;
                    left: 50%;
                    transform: translateX(-50%);
                    padding: 8px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 20px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: var(--bael-text-primary, #fff);
                    z-index: 5000;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .bael-active-agent-badge:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .bael-active-agent-badge .avatar {
                    font-size: 18px;
                }

                .bael-active-agent-badge .status {
                    width: 8px;
                    height: 8px;
                    background: #22c55e;
                    border-radius: 50%;
                    animation: bael-pulse 2s infinite;
                }

                @keyframes bael-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `;
      document.head.appendChild(styles);

      // Overlay
      this.overlay = document.createElement("div");
      this.overlay.className = "bael-roster-overlay";
      this.overlay.innerHTML = this.renderPanel();
      document.body.appendChild(this.overlay);

      // Create modal
      this.createModal = document.createElement("div");
      this.createModal.className = "bael-create-modal";
      this.createModal.innerHTML = this.renderCreateModal();
      document.body.appendChild(this.createModal);

      // Trigger
      this.trigger = document.createElement("button");
      this.trigger.className = "bael-roster-trigger";
      this.trigger.innerHTML = "👥";
      this.trigger.title = "Agent Roster (Ctrl+Shift+R)";
      document.body.appendChild(this.trigger);

      // Active badge
      this.badge = document.createElement("div");
      this.badge.className = "bael-active-agent-badge";
      this.updateBadge();
      document.body.appendChild(this.badge);
    }

    renderPanel() {
      return `
                <div class="bael-roster-panel">
                    <div class="bael-roster-header">
                        <div class="bael-roster-title">
                            <span>👥</span>
                            <span>Agent Roster</span>
                        </div>
                        <div class="bael-roster-actions">
                            <button class="bael-roster-btn primary" id="create-agent-btn">
                                <span>+</span>
                                <span>Create Agent</span>
                            </button>
                            <button class="bael-roster-close">✕</button>
                        </div>
                    </div>
                    <div class="bael-roster-content">
                        <div class="bael-roster-grid" id="roster-grid">
                            ${this.renderAgentCards()}
                        </div>
                    </div>
                </div>
            `;
    }

    renderAgentCards() {
      return this.agents
        .map(
          (agent) => `
                <div class="bael-agent-card ${agent.status === "active" ? "active" : ""}" data-agent-id="${agent.id}">
                    <div class="bael-agent-header">
                        <div class="bael-agent-avatar" style="background: ${agent.color}20">
                            ${agent.avatar}
                        </div>
                        <div class="bael-agent-info">
                            <h3>${agent.name}</h3>
                            <div class="role" style="color: ${agent.color}">${agent.role}</div>
                        </div>
                    </div>
                    <div class="bael-agent-specialty">${agent.specialty}</div>
                    <div class="bael-agent-stats">
                        <div class="bael-stat">
                            <div class="bael-stat-value">${agent.stats.tasks}</div>
                            <div class="bael-stat-label">Tasks</div>
                        </div>
                        <div class="bael-stat">
                            <div class="bael-stat-value">${agent.stats.tasks > 0 ? Math.round((agent.stats.success / agent.stats.tasks) * 100) : 0}%</div>
                            <div class="bael-stat-label">Success</div>
                        </div>
                    </div>
                    <div class="bael-agent-actions">
                        <button class="bael-agent-action activate-btn" data-agent-id="${agent.id}">
                            ${agent.status === "active" ? "✓ Active" : "▶ Activate"}
                        </button>
                        ${!agent.isDefault ? `<button class="bael-agent-action delete" data-agent-id="${agent.id}">🗑️</button>` : ""}
                    </div>
                </div>
            `,
        )
        .join("");
    }

    renderCreateModal() {
      const emojis = [
        "🤖",
        "🧠",
        "⚡",
        "🔮",
        "🎯",
        "🚀",
        "💎",
        "🌟",
        "🔥",
        "👾",
        "🦾",
        "🎭",
      ];
      const colors = [
        "#ff3366",
        "#22c55e",
        "#8b5cf6",
        "#06b6d4",
        "#f97316",
        "#ef4444",
        "#eab308",
        "#ec4899",
      ];

      return `
                <h3>Create New Agent</h3>
                <div class="bael-form-group">
                    <label class="bael-form-label">Agent Name</label>
                    <input type="text" class="bael-form-input" id="agent-name" placeholder="e.g., Code Master">
                </div>
                <div class="bael-form-group">
                    <label class="bael-form-label">Role</label>
                    <input type="text" class="bael-form-input" id="agent-role" placeholder="e.g., Software Architect">
                </div>
                <div class="bael-form-group">
                    <label class="bael-form-label">Specialty</label>
                    <input type="text" class="bael-form-input" id="agent-specialty" placeholder="e.g., System design, APIs">
                </div>
                <div class="bael-form-group">
                    <label class="bael-form-label">Avatar</label>
                    <div class="bael-emoji-picker" id="emoji-picker">
                        ${emojis.map((e, i) => `<button class="bael-emoji-option ${i === 0 ? "selected" : ""}" data-emoji="${e}">${e}</button>`).join("")}
                    </div>
                </div>
                <div class="bael-form-group">
                    <label class="bael-form-label">Color</label>
                    <div class="bael-emoji-picker" id="color-picker">
                        ${colors.map((c, i) => `<button class="bael-emoji-option ${i === 0 ? "selected" : ""}" data-color="${c}" style="background: ${c}"></button>`).join("")}
                    </div>
                </div>
                <div class="bael-form-actions">
                    <button class="bael-roster-btn" id="cancel-create">Cancel</button>
                    <button class="bael-roster-btn primary" id="confirm-create">Create Agent</button>
                </div>
            `;
    }

    bindEvents() {
      // Trigger
      this.trigger.addEventListener("click", () => this.toggle());
      this.badge.addEventListener("click", () => this.toggle());

      // Close
      this.overlay
        .querySelector(".bael-roster-close")
        .addEventListener("click", () => this.hide());
      this.overlay.addEventListener("click", (e) => {
        if (e.target === this.overlay) this.hide();
      });

      // Create agent
      this.overlay
        .querySelector("#create-agent-btn")
        .addEventListener("click", () => {
          this.createModal.classList.add("visible");
        });

      this.createModal
        .querySelector("#cancel-create")
        .addEventListener("click", () => {
          this.createModal.classList.remove("visible");
        });

      this.createModal
        .querySelector("#confirm-create")
        .addEventListener("click", () => {
          this.createAgent();
        });

      // Emoji picker
      this.createModal
        .querySelector("#emoji-picker")
        .addEventListener("click", (e) => {
          if (e.target.classList.contains("bael-emoji-option")) {
            this.createModal
              .querySelectorAll("#emoji-picker .bael-emoji-option")
              .forEach((o) => o.classList.remove("selected"));
            e.target.classList.add("selected");
          }
        });

      // Color picker
      this.createModal
        .querySelector("#color-picker")
        .addEventListener("click", (e) => {
          if (e.target.classList.contains("bael-emoji-option")) {
            this.createModal
              .querySelectorAll("#color-picker .bael-emoji-option")
              .forEach((o) => o.classList.remove("selected"));
            e.target.classList.add("selected");
          }
        });

      // Agent card interactions
      this.overlay
        .querySelector("#roster-grid")
        .addEventListener("click", (e) => {
          const activateBtn = e.target.closest(".activate-btn");
          const deleteBtn = e.target.closest(".bael-agent-action.delete");

          if (activateBtn) {
            this.activateAgent(activateBtn.dataset.agentId);
          } else if (deleteBtn) {
            this.deleteAgent(deleteBtn.dataset.agentId);
          }
        });

      // Keyboard
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "R") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape") {
          this.createModal.classList.remove("visible");
          if (this.isVisible) this.hide();
        }
      });
    }

    toggle() {
      if (this.isVisible) {
        this.hide();
      } else {
        this.show();
      }
    }

    show() {
      this.isVisible = true;
      this.overlay.classList.add("visible");
      this.refreshGrid();
    }

    hide() {
      this.isVisible = false;
      this.overlay.classList.remove("visible");
      this.createModal.classList.remove("visible");
    }

    refreshGrid() {
      this.overlay.querySelector("#roster-grid").innerHTML =
        this.renderAgentCards();
    }

    updateBadge() {
      if (this.activeAgent) {
        this.badge.innerHTML = `
                    <span class="avatar">${this.activeAgent.avatar}</span>
                    <span>${this.activeAgent.name}</span>
                    <span class="status"></span>
                `;
      }
    }

    activateAgent(agentId) {
      this.agents.forEach((agent) => {
        agent.status = agent.id === agentId ? "active" : "standby";
      });

      this.activeAgent = this.agents.find((a) => a.id === agentId);
      this.saveAgents();
      this.refreshGrid();
      this.updateBadge();

      if (window.BaelNotifications) {
        window.BaelNotifications.success(`${this.activeAgent.name} activated!`);
      }

      // Emit event
      document.dispatchEvent(
        new CustomEvent("bael-agent-changed", {
          detail: { agent: this.activeAgent },
        }),
      );
    }

    createAgent() {
      const name = this.createModal.querySelector("#agent-name").value.trim();
      const role = this.createModal.querySelector("#agent-role").value.trim();
      const specialty = this.createModal
        .querySelector("#agent-specialty")
        .value.trim();
      const emoji =
        this.createModal.querySelector("#emoji-picker .selected")?.dataset
          .emoji || "🤖";
      const color =
        this.createModal.querySelector("#color-picker .selected")?.dataset
          .color || "#ff3366";

      if (!name || !role) {
        if (window.BaelNotifications) {
          window.BaelNotifications.error("Name and role are required");
        }
        return;
      }

      const newAgent = {
        id: `custom-${Date.now()}`,
        name,
        role,
        avatar: emoji,
        color,
        specialty: specialty || "General assistance",
        status: "standby",
        isDefault: false,
        stats: { tasks: 0, success: 0 },
      };

      this.agents.push(newAgent);
      this.saveAgents();
      this.refreshGrid();

      // Reset form
      this.createModal.querySelector("#agent-name").value = "";
      this.createModal.querySelector("#agent-role").value = "";
      this.createModal.querySelector("#agent-specialty").value = "";
      this.createModal.classList.remove("visible");

      if (window.BaelNotifications) {
        window.BaelNotifications.success(`Agent "${name}" created!`);
      }
    }

    deleteAgent(agentId) {
      const agent = this.agents.find((a) => a.id === agentId);
      if (!agent || agent.isDefault) return;

      if (confirm(`Delete agent "${agent.name}"?`)) {
        this.agents = this.agents.filter((a) => a.id !== agentId);
        this.saveAgents();
        this.refreshGrid();

        if (window.BaelNotifications) {
          window.BaelNotifications.info(`Agent "${agent.name}" deleted`);
        }
      }
    }

    // Public API
    getActiveAgent() {
      return this.activeAgent;
    }

    recordTask(agentId, success = true) {
      const agent = this.agents.find((a) => a.id === agentId);
      if (agent) {
        agent.stats.tasks++;
        if (success) agent.stats.success++;
        this.saveAgents();
      }
    }
  }

  // Initialize
  window.BaelAgentRoster = new BaelAgentRoster();
})();
