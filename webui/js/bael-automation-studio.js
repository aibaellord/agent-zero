/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █    █████╗ ██╗   ██╗████████╗ ██████╗ ███╗   ███╗ █████╗ ████████╗███████╗█
 * █   ██╔══██╗██║   ██║╚══██╔══╝██╔═══██╗████╗ ████║██╔══██╗╚══██╔══╝██╔════╝█
 * █   ███████║██║   ██║   ██║   ██║   ██║██╔████╔██║███████║   ██║   █████╗  █
 * █   ██╔══██║██║   ██║   ██║   ██║   ██║██║╚██╔╝██║██╔══██║   ██║   ██╔══╝  █
 * █   ██║  ██║╚██████╔╝   ██║   ╚██████╔╝██║ ╚═╝ ██║██║  ██║   ██║   ███████╗█
 * █   ╚═╝  ╚═╝ ╚═════╝    ╚═╝    ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚══════╝█
 * █                                                                          █
 * █   BAEL AUTOMATION STUDIO - Visual Workflow Automation Builder           █
 * █   Create, manage, and execute automated task sequences                  █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelAutomationStudio {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;

      this.automations = [];
      this.selectedAutomation = null;
      this.isEditing = false;
    }

    async initialize() {
      console.log("🤖 Bael Automation Studio initializing...");

      this.loadAutomations();
      this.injectStyles();
      this.createContainer();
      this.setupShortcuts();
      this.initDefaultAutomations();

      this.initialized = true;
      console.log("✅ BAEL AUTOMATION STUDIO READY");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-automation-studio-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-automation-studio-styles";
      styles.textContent = `
                .bael-automation-studio {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10008;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(10px);
                }

                .bael-automation-studio.visible { display: flex; }

                .automation-layout {
                    display: flex;
                    width: 100%;
                    height: 100%;
                }

                .automation-sidebar {
                    width: 280px;
                    background: #1a1a2e;
                    border-right: 1px solid rgba(255, 255, 255, 0.08);
                    display: flex;
                    flex-direction: column;
                }

                .sidebar-header {
                    padding: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .sidebar-header h2 {
                    font-size: 18px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 16px;
                }

                .new-automation-btn {
                    width: 100%;
                    padding: 12px;
                    border-radius: 10px;
                    border: none;
                    background: #6366f1;
                    color: #fff;
                    font-size: 14px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    transition: all 0.2s;
                }

                .new-automation-btn:hover {
                    background: #4f46e5;
                }

                .automation-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px;
                }

                .automation-item {
                    padding: 14px;
                    border-radius: 10px;
                    cursor: pointer;
                    margin-bottom: 8px;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                }

                .automation-item:hover {
                    background: rgba(255, 255, 255, 0.06);
                }

                .automation-item.selected {
                    background: rgba(99, 102, 241, 0.15);
                    border-color: rgba(99, 102, 241, 0.3);
                }

                .automation-item-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 6px;
                }

                .automation-item-icon {
                    font-size: 20px;
                }

                .automation-item-name {
                    font-size: 14px;
                    font-weight: 600;
                    flex: 1;
                }

                .automation-status {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #4ade80;
                }

                .automation-status.disabled {
                    background: rgba(255, 255, 255, 0.3);
                }

                .automation-item-meta {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    display: flex;
                    gap: 12px;
                }

                .automation-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .main-header {
                    padding: 16px 24px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .main-header h3 {
                    font-size: 16px;
                    font-weight: 600;
                }

                .header-actions {
                    display: flex;
                    gap: 10px;
                }

                .header-btn {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                    cursor: pointer;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s;
                }

                .header-btn:hover {
                    background: rgba(255, 255, 255, 0.15);
                }

                .header-btn.run {
                    background: #22c55e;
                }

                .header-btn.run:hover {
                    background: #16a34a;
                }

                .header-btn.close {
                    background: rgba(239, 68, 68, 0.2);
                    color: #f87171;
                }

                .main-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                }

                .workflow-canvas {
                    min-height: 400px;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 12px;
                    padding: 24px;
                    position: relative;
                }

                .step-container {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .workflow-step {
                    display: flex;
                    align-items: flex-start;
                    gap: 16px;
                }

                .step-connector {
                    width: 32px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .step-number {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    background: #6366f1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    font-weight: 600;
                }

                .step-line {
                    width: 2px;
                    flex: 1;
                    min-height: 40px;
                    background: rgba(99, 102, 241, 0.3);
                }

                .step-card {
                    flex: 1;
                    background: rgba(255, 255, 255, 0.06);
                    border-radius: 12px;
                    padding: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }

                .step-card-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 12px;
                }

                .step-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                }

                .step-icon.action { background: rgba(99, 102, 241, 0.2); }
                .step-icon.condition { background: rgba(245, 158, 11, 0.2); }
                .step-icon.delay { background: rgba(14, 165, 233, 0.2); }
                .step-icon.message { background: rgba(34, 197, 94, 0.2); }

                .step-title {
                    flex: 1;
                    font-size: 14px;
                    font-weight: 600;
                }

                .step-actions {
                    display: flex;
                    gap: 4px;
                    opacity: 0;
                    transition: opacity 0.2s;
                }

                .step-card:hover .step-actions {
                    opacity: 1;
                }

                .step-action-btn {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    border: none;
                    background: rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.7);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                }

                .step-config {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.6);
                }

                .add-step-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 16px;
                    border: 2px dashed rgba(255, 255, 255, 0.15);
                    border-radius: 12px;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                    margin-top: 8px;
                    margin-left: 48px;
                }

                .add-step-btn:hover {
                    border-color: rgba(99, 102, 241, 0.5);
                    color: #a5b4fc;
                    background: rgba(99, 102, 241, 0.05);
                }

                .step-picker {
                    position: fixed;
                    background: #1e1e2e;
                    border-radius: 12px;
                    padding: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    z-index: 10100;
                    min-width: 250px;
                }

                .step-picker-title {
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 12px;
                }

                .step-picker-options {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .step-option {
                    padding: 12px;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.06);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: all 0.2s;
                }

                .step-option:hover {
                    background: rgba(99, 102, 241, 0.15);
                }

                .empty-automation {
                    text-align: center;
                    padding: 60px 20px;
                    color: rgba(255, 255, 255, 0.4);
                }

                .empty-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                    opacity: 0.5;
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-automation-studio";
      this.container.className = "bael-automation-studio";

      this.container.innerHTML = this.getTemplate();
      document.body.appendChild(this.container);

      this.bindEvents();
    }

    getTemplate() {
      return `
                <div class="automation-layout">
                    <div class="automation-sidebar">
                        <div class="sidebar-header">
                            <h2>🤖 Automations</h2>
                            <button class="new-automation-btn" onclick="BaelAutomationStudio.createNew()">
                                ➕ New Automation
                            </button>
                        </div>
                        <div class="automation-list" id="automation-list"></div>
                    </div>

                    <div class="automation-main">
                        <div class="main-header">
                            <h3 id="automation-title">Select an automation</h3>
                            <div class="header-actions">
                                <button class="header-btn run" id="run-btn" onclick="BaelAutomationStudio.runSelected()">
                                    ▶️ Run
                                </button>
                                <button class="header-btn" onclick="BaelAutomationStudio.duplicateSelected()">
                                    📋 Duplicate
                                </button>
                                <button class="header-btn" onclick="BaelAutomationStudio.deleteSelected()">
                                    🗑️ Delete
                                </button>
                                <button class="header-btn close" onclick="BaelAutomationStudio.hide()">
                                    ✕ Close
                                </button>
                            </div>
                        </div>
                        <div class="main-content">
                            <div class="workflow-canvas" id="workflow-canvas">
                                <div class="empty-automation">
                                    <div class="empty-icon">🤖</div>
                                    <div>Select or create an automation to get started</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }

    bindEvents() {
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.visible) {
          this.hide();
        }
      });
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Ctrl+Shift+Y for automation studio
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Y") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    initDefaultAutomations() {
      const defaults = [
        {
          id: "morning-briefing",
          name: "Morning Briefing",
          icon: "☀️",
          description: "Get a summary of tasks and updates",
          enabled: true,
          trigger: { type: "manual" },
          steps: [
            {
              type: "message",
              config: {
                text: "Good morning! Let me prepare your daily briefing...",
              },
            },
            { type: "action", config: { action: "check-tasks" } },
            { type: "action", config: { action: "summarize-updates" } },
          ],
        },
        {
          id: "code-review",
          name: "Code Review Helper",
          icon: "🔍",
          description: "Automated code review workflow",
          enabled: true,
          trigger: { type: "manual" },
          steps: [
            { type: "message", config: { text: "Starting code review..." } },
            { type: "action", config: { action: "analyze-code" } },
            { type: "delay", config: { seconds: 2 } },
            { type: "action", config: { action: "generate-report" } },
          ],
        },
        {
          id: "research-topic",
          name: "Research Topic",
          icon: "📚",
          description: "Deep dive into any topic",
          enabled: true,
          trigger: { type: "manual" },
          steps: [
            {
              type: "condition",
              config: { variable: "topic", operator: "exists" },
            },
            { type: "action", config: { action: "search-web" } },
            { type: "action", config: { action: "compile-findings" } },
            { type: "message", config: { text: "Research complete!" } },
          ],
        },
      ];

      defaults.forEach((automation) => {
        if (!this.automations.find((a) => a.id === automation.id)) {
          this.automations.push(automation);
        }
      });

      this.saveAutomations();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // AUTOMATION MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════════

    loadAutomations() {
      try {
        const stored = localStorage.getItem("bael_automations");
        this.automations = stored ? JSON.parse(stored) : [];
      } catch (e) {
        this.automations = [];
      }
    }

    saveAutomations() {
      localStorage.setItem(
        "bael_automations",
        JSON.stringify(this.automations),
      );
    }

    createNew() {
      const name = prompt("Automation name:");
      if (!name) return;

      const automation = {
        id: Date.now().toString(),
        name: name,
        icon: "⚡",
        description: "Custom automation",
        enabled: true,
        trigger: { type: "manual" },
        steps: [],
      };

      this.automations.push(automation);
      this.saveAutomations();
      this.selectAutomation(automation);
      this.renderList();
    }

    selectAutomation(automation) {
      this.selectedAutomation = automation;
      this.renderList();
      this.renderWorkflow();

      document.getElementById("automation-title").textContent = automation.name;
    }

    deleteSelected() {
      if (!this.selectedAutomation) return;
      if (!confirm(`Delete "${this.selectedAutomation.name}"?`)) return;

      this.automations = this.automations.filter(
        (a) => a.id !== this.selectedAutomation.id,
      );
      this.saveAutomations();
      this.selectedAutomation = null;
      this.renderList();
      this.renderWorkflow();

      document.getElementById("automation-title").textContent =
        "Select an automation";
    }

    duplicateSelected() {
      if (!this.selectedAutomation) return;

      const copy = {
        ...JSON.parse(JSON.stringify(this.selectedAutomation)),
        id: Date.now().toString(),
        name: `${this.selectedAutomation.name} (Copy)`,
      };

      this.automations.push(copy);
      this.saveAutomations();
      this.selectAutomation(copy);
      this.renderList();
    }

    async runSelected() {
      if (!this.selectedAutomation) return;

      console.log("Running automation:", this.selectedAutomation.name);

      for (const step of this.selectedAutomation.steps) {
        await this.executeStep(step);
      }

      window.dispatchEvent(
        new CustomEvent("bael:automation-completed", {
          detail: { automation: this.selectedAutomation },
        }),
      );
    }

    async executeStep(step) {
      switch (step.type) {
        case "message":
          window.dispatchEvent(
            new CustomEvent("bael:send-message", {
              detail: { text: step.config.text },
            }),
          );
          break;

        case "delay":
          await new Promise((resolve) =>
            setTimeout(resolve, (step.config.seconds || 1) * 1000),
          );
          break;

        case "action":
          window.dispatchEvent(
            new CustomEvent("bael:execute-action", {
              detail: { action: step.config.action },
            }),
          );
          break;

        case "condition":
          // Evaluate condition (simplified)
          break;
      }
    }

    addStep(type) {
      if (!this.selectedAutomation) return;

      const stepConfigs = {
        action: { action: "" },
        message: { text: "" },
        delay: { seconds: 1 },
        condition: { variable: "", operator: "exists" },
      };

      this.selectedAutomation.steps.push({
        type: type,
        config: stepConfigs[type] || {},
      });

      this.saveAutomations();
      this.renderWorkflow();
    }

    removeStep(index) {
      if (!this.selectedAutomation) return;

      this.selectedAutomation.steps.splice(index, 1);
      this.saveAutomations();
      this.renderWorkflow();
    }

    // ═══════════════════════════════════════════════════════════════════════
    // RENDERING
    // ═══════════════════════════════════════════════════════════════════════

    renderList() {
      const list = document.getElementById("automation-list");
      if (!list) return;

      list.innerHTML = this.automations
        .map(
          (a) => `
                <div class="automation-item ${this.selectedAutomation?.id === a.id ? "selected" : ""}"
                     onclick="BaelAutomationStudio.selectAutomation(BaelAutomationStudio.getAutomation('${a.id}'))">
                    <div class="automation-item-header">
                        <span class="automation-item-icon">${a.icon}</span>
                        <span class="automation-item-name">${this.escapeHtml(a.name)}</span>
                        <span class="automation-status ${a.enabled ? "" : "disabled"}"></span>
                    </div>
                    <div class="automation-item-meta">
                        <span>${a.steps.length} steps</span>
                        <span>${a.trigger.type}</span>
                    </div>
                </div>
            `,
        )
        .join("");
    }

    renderWorkflow() {
      const canvas = document.getElementById("workflow-canvas");
      if (!canvas) return;

      if (!this.selectedAutomation) {
        canvas.innerHTML = `
                    <div class="empty-automation">
                        <div class="empty-icon">🤖</div>
                        <div>Select or create an automation to get started</div>
                    </div>
                `;
        return;
      }

      if (this.selectedAutomation.steps.length === 0) {
        canvas.innerHTML = `
                    <div class="empty-automation">
                        <div class="empty-icon">📝</div>
                        <div>No steps yet. Add your first step!</div>
                    </div>
                    <button class="add-step-btn" onclick="BaelAutomationStudio.showStepPicker(event)">
                        ➕ Add Step
                    </button>
                `;
        return;
      }

      const stepIcons = {
        action: "⚡",
        message: "💬",
        delay: "⏱️",
        condition: "🔀",
      };

      let html = '<div class="step-container">';

      this.selectedAutomation.steps.forEach((step, index) => {
        html += `
                    <div class="workflow-step">
                        <div class="step-connector">
                            <div class="step-number">${index + 1}</div>
                            ${index < this.selectedAutomation.steps.length - 1 ? '<div class="step-line"></div>' : ""}
                        </div>
                        <div class="step-card">
                            <div class="step-card-header">
                                <div class="step-icon ${step.type}">${stepIcons[step.type] || "⚙️"}</div>
                                <span class="step-title">${this.formatStepTitle(step)}</span>
                                <div class="step-actions">
                                    <button class="step-action-btn" onclick="BaelAutomationStudio.removeStep(${index})">🗑️</button>
                                </div>
                            </div>
                            <div class="step-config">${this.formatStepConfig(step)}</div>
                        </div>
                    </div>
                `;
      });

      html += "</div>";
      html += `<button class="add-step-btn" onclick="BaelAutomationStudio.showStepPicker(event)">➕ Add Step</button>`;

      canvas.innerHTML = html;
    }

    formatStepTitle(step) {
      const titles = {
        action: "Execute Action",
        message: "Send Message",
        delay: "Wait",
        condition: "Check Condition",
      };
      return titles[step.type] || "Step";
    }

    formatStepConfig(step) {
      switch (step.type) {
        case "message":
          return step.config.text || "<em>No message configured</em>";
        case "delay":
          return `Wait ${step.config.seconds || 1} seconds`;
        case "action":
          return step.config.action || "<em>No action configured</em>";
        case "condition":
          return `${step.config.variable} ${step.config.operator}`;
        default:
          return JSON.stringify(step.config);
      }
    }

    showStepPicker(event) {
      // Remove existing picker
      document.querySelector(".step-picker")?.remove();

      const picker = document.createElement("div");
      picker.className = "step-picker";
      picker.style.left = `${event.clientX}px`;
      picker.style.top = `${event.clientY}px`;

      picker.innerHTML = `
                <div class="step-picker-title">Add Step</div>
                <div class="step-picker-options">
                    <div class="step-option" onclick="BaelAutomationStudio.addStep('action'); this.parentElement.parentElement.remove()">
                        <span>⚡</span> Execute Action
                    </div>
                    <div class="step-option" onclick="BaelAutomationStudio.addStep('message'); this.parentElement.parentElement.remove()">
                        <span>💬</span> Send Message
                    </div>
                    <div class="step-option" onclick="BaelAutomationStudio.addStep('delay'); this.parentElement.parentElement.remove()">
                        <span>⏱️</span> Wait/Delay
                    </div>
                    <div class="step-option" onclick="BaelAutomationStudio.addStep('condition'); this.parentElement.parentElement.remove()">
                        <span>🔀</span> Condition
                    </div>
                </div>
            `;

      document.body.appendChild(picker);

      // Close picker on outside click
      setTimeout(() => {
        document.addEventListener("click", function closePicker(e) {
          if (!picker.contains(e.target)) {
            picker.remove();
            document.removeEventListener("click", closePicker);
          }
        });
      }, 0);
    }

    getAutomation(id) {
      return this.automations.find((a) => a.id === id);
    }

    escapeHtml(str) {
      const div = document.createElement("div");
      div.textContent = str;
      return div.innerHTML;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VISIBILITY
    // ═══════════════════════════════════════════════════════════════════════

    show() {
      this.renderList();
      this.renderWorkflow();
      this.container.classList.add("visible");
      this.visible = true;
    }

    hide() {
      this.container.classList.remove("visible");
      this.visible = false;
    }

    toggle() {
      if (this.visible) this.hide();
      else this.show();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelAutomationStudio = new BaelAutomationStudio();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelAutomationStudio.initialize();
    });
  } else {
    window.BaelAutomationStudio.initialize();
  }

  console.log("🤖 Bael Automation Studio loaded");
})();
