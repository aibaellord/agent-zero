/**
 * BAEL - LORD OF ALL
 * Task Scheduler - Automated task scheduling and queuing system
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelTaskScheduler {
    constructor() {
      this.isVisible = false;
      this.tasks = this.loadTasks();
      this.runningTasks = new Map();
      this.checkInterval = null;
      this.init();
    }

    loadTasks() {
      const saved = localStorage.getItem("bael-scheduled-tasks");
      return saved ? JSON.parse(saved) : [];
    }

    saveTasks() {
      localStorage.setItem("bael-scheduled-tasks", JSON.stringify(this.tasks));
    }

    init() {
      this.createUI();
      this.bindEvents();
      this.startScheduler();
      console.log("📅 Bael Task Scheduler initialized");
    }

    createUI() {
      const styles = document.createElement("style");
      styles.id = "bael-scheduler-styles";
      styles.textContent = `
                .bael-scheduler-overlay {
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

                .bael-scheduler-overlay.visible {
                    display: flex;
                }

                .bael-scheduler-panel {
                    width: 90%;
                    max-width: 800px;
                    max-height: 85vh;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                }

                .bael-scheduler-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-scheduler-title {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--bael-text-primary, #fff);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .bael-scheduler-close {
                    width: 36px;
                    height: 36px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    font-size: 18px;
                }

                .bael-scheduler-close:hover {
                    background: #ff4444;
                    color: #fff;
                    border-color: #ff4444;
                }

                .bael-scheduler-toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 20px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-scheduler-stats {
                    display: flex;
                    gap: 20px;
                }

                .bael-sched-stat {
                    text-align: center;
                }

                .bael-sched-stat-value {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--bael-text-primary, #fff);
                }

                .bael-sched-stat-label {
                    font-size: 10px;
                    color: var(--bael-text-muted, #888);
                    text-transform: uppercase;
                }

                .bael-scheduler-btn {
                    padding: 10px 18px;
                    background: var(--bael-accent, #ff3366);
                    border: none;
                    border-radius: 8px;
                    color: #fff;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s ease;
                }

                .bael-scheduler-btn:hover {
                    background: #ff4477;
                    transform: translateY(-1px);
                }

                .bael-scheduler-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                }

                .bael-task-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .bael-task-card {
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    padding: 16px;
                    transition: all 0.2s ease;
                }

                .bael-task-card:hover {
                    border-color: rgba(255, 51, 102, 0.3);
                }

                .bael-task-card.running {
                    border-color: #22c55e;
                    background: rgba(34, 197, 94, 0.05);
                }

                .bael-task-card.paused {
                    opacity: 0.6;
                }

                .bael-task-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    margin-bottom: 12px;
                }

                .bael-task-info {
                    flex: 1;
                }

                .bael-task-name {
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 4px;
                }

                .bael-task-prompt {
                    font-size: 12px;
                    color: var(--bael-text-muted, #888);
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .bael-task-status {
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .bael-task-status.pending {
                    background: rgba(234, 179, 8, 0.1);
                    color: #eab308;
                }

                .bael-task-status.running {
                    background: rgba(34, 197, 94, 0.1);
                    color: #22c55e;
                }

                .bael-task-status.completed {
                    background: rgba(59, 130, 246, 0.1);
                    color: #3b82f6;
                }

                .bael-task-status.failed {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }

                .bael-task-status.paused {
                    background: rgba(156, 163, 175, 0.1);
                    color: #9ca3af;
                }

                .bael-task-schedule {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 10px 0;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    margin-bottom: 12px;
                }

                .bael-schedule-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: var(--bael-text-muted, #888);
                }

                .bael-schedule-item .icon {
                    font-size: 14px;
                }

                .bael-task-actions {
                    display: flex;
                    gap: 8px;
                }

                .bael-task-action {
                    padding: 6px 12px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #888);
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-task-action:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                .bael-task-action.delete:hover {
                    border-color: #ff4444;
                    color: #ff4444;
                }

                /* Create Task Modal */
                .bael-create-task-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 500px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    padding: 24px;
                    z-index: 10100;
                    display: none;
                    max-height: 80vh;
                    overflow-y: auto;
                }

                .bael-create-task-modal.visible {
                    display: block;
                }

                .bael-create-task-modal h3 {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin: 0 0 20px 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .bael-form-group {
                    margin-bottom: 16px;
                }

                .bael-form-label {
                    display: block;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--bael-text-muted, #888);
                    margin-bottom: 6px;
                }

                .bael-form-input,
                .bael-form-select,
                .bael-form-textarea {
                    width: 100%;
                    padding: 10px 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 13px;
                    font-family: inherit;
                }

                .bael-form-input:focus,
                .bael-form-select:focus,
                .bael-form-textarea:focus {
                    outline: none;
                    border-color: var(--bael-accent, #ff3366);
                }

                .bael-form-textarea {
                    height: 100px;
                    resize: none;
                }

                .bael-form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .bael-form-actions {
                    display: flex;
                    gap: 10px;
                    margin-top: 20px;
                }

                .bael-form-btn {
                    flex: 1;
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-form-btn.secondary {
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    color: var(--bael-text-muted, #888);
                }

                .bael-form-btn.secondary:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                .bael-form-btn.primary {
                    background: var(--bael-accent, #ff3366);
                    border: none;
                    color: #fff;
                }

                .bael-form-btn.primary:hover {
                    background: #ff4477;
                }

                /* Trigger */
                .bael-scheduler-trigger {
                    position: fixed;
                    bottom: 380px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #eab308 0%, #facc15 100%);
                    border: none;
                    border-radius: 50%;
                    color: #000;
                    font-size: 22px;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(234, 179, 8, 0.4);
                    z-index: 8000;
                    transition: all 0.3s ease;
                }

                .bael-scheduler-trigger:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 30px rgba(234, 179, 8, 0.6);
                }

                .bael-scheduler-trigger .badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                    font-size: 10px;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 10px;
                    min-width: 18px;
                    text-align: center;
                }

                .bael-empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--bael-text-muted, #666);
                }

                .bael-empty-state .icon {
                    font-size: 60px;
                    margin-bottom: 16px;
                    opacity: 0.5;
                }

                .bael-empty-state .text {
                    font-size: 16px;
                    margin-bottom: 8px;
                }

                .bael-empty-state .hint {
                    font-size: 13px;
                    opacity: 0.7;
                }
            `;
      document.head.appendChild(styles);

      // Overlay
      this.overlay = document.createElement("div");
      this.overlay.className = "bael-scheduler-overlay";
      this.overlay.innerHTML = this.renderPanel();
      document.body.appendChild(this.overlay);

      // Create modal
      this.modal = document.createElement("div");
      this.modal.className = "bael-create-task-modal";
      this.modal.innerHTML = this.renderModal();
      document.body.appendChild(this.modal);

      // Trigger
      this.trigger = document.createElement("button");
      this.trigger.className = "bael-scheduler-trigger";
      this.trigger.innerHTML = `📅<span class="badge" style="display:${this.getActiveCount() > 0 ? "block" : "none"}">${this.getActiveCount()}</span>`;
      this.trigger.title = "Task Scheduler";
      document.body.appendChild(this.trigger);
    }

    renderPanel() {
      const pending = this.tasks.filter((t) => t.status === "pending").length;
      const running = this.tasks.filter((t) => t.status === "running").length;
      const completed = this.tasks.filter(
        (t) => t.status === "completed",
      ).length;

      return `
                <div class="bael-scheduler-panel">
                    <div class="bael-scheduler-header">
                        <div class="bael-scheduler-title">
                            <span>📅</span>
                            <span>Task Scheduler</span>
                        </div>
                        <button class="bael-scheduler-close">✕</button>
                    </div>
                    <div class="bael-scheduler-toolbar">
                        <div class="bael-scheduler-stats">
                            <div class="bael-sched-stat">
                                <div class="bael-sched-stat-value">${pending}</div>
                                <div class="bael-sched-stat-label">Pending</div>
                            </div>
                            <div class="bael-sched-stat">
                                <div class="bael-sched-stat-value">${running}</div>
                                <div class="bael-sched-stat-label">Running</div>
                            </div>
                            <div class="bael-sched-stat">
                                <div class="bael-sched-stat-value">${completed}</div>
                                <div class="bael-sched-stat-label">Completed</div>
                            </div>
                        </div>
                        <button class="bael-scheduler-btn" id="create-task-btn">
                            <span>+</span>
                            <span>New Task</span>
                        </button>
                    </div>
                    <div class="bael-scheduler-content">
                        <div class="bael-task-list" id="task-list">
                            ${this.renderTasks()}
                        </div>
                    </div>
                </div>
            `;
    }

    renderTasks() {
      if (this.tasks.length === 0) {
        return `
                    <div class="bael-empty-state">
                        <div class="icon">📅</div>
                        <div class="text">No scheduled tasks</div>
                        <div class="hint">Create a task to automate agent interactions</div>
                    </div>
                `;
      }

      return this.tasks
        .map(
          (task) => `
                <div class="bael-task-card ${task.status}" data-task-id="${task.id}">
                    <div class="bael-task-header">
                        <div class="bael-task-info">
                            <div class="bael-task-name">${task.name}</div>
                            <div class="bael-task-prompt">${task.prompt}</div>
                        </div>
                        <span class="bael-task-status ${task.status}">${task.status}</span>
                    </div>
                    <div class="bael-task-schedule">
                        <div class="bael-schedule-item">
                            <span class="icon">🕐</span>
                            <span>${this.formatSchedule(task)}</span>
                        </div>
                        <div class="bael-schedule-item">
                            <span class="icon">🔄</span>
                            <span>${task.repeat ? task.repeatType : "Once"}</span>
                        </div>
                        <div class="bael-schedule-item">
                            <span class="icon">✅</span>
                            <span>${task.runCount || 0} runs</span>
                        </div>
                    </div>
                    <div class="bael-task-actions">
                        ${
                          task.status === "pending"
                            ? `
                            <button class="bael-task-action run-now" data-id="${task.id}">▶ Run Now</button>
                            <button class="bael-task-action pause" data-id="${task.id}">⏸ Pause</button>
                        `
                            : ""
                        }
                        ${
                          task.status === "paused"
                            ? `
                            <button class="bael-task-action resume" data-id="${task.id}">▶ Resume</button>
                        `
                            : ""
                        }
                        <button class="bael-task-action edit" data-id="${task.id}">✏️ Edit</button>
                        <button class="bael-task-action delete" data-id="${task.id}">🗑️ Delete</button>
                    </div>
                </div>
            `,
        )
        .join("");
    }

    renderModal() {
      return `
                <h3><span>📅</span> Schedule New Task</h3>
                <div class="bael-form-group">
                    <label class="bael-form-label">Task Name</label>
                    <input type="text" class="bael-form-input" id="task-name" placeholder="e.g., Daily Code Review">
                </div>
                <div class="bael-form-group">
                    <label class="bael-form-label">Prompt / Instructions</label>
                    <textarea class="bael-form-textarea" id="task-prompt" placeholder="What should Bael do?"></textarea>
                </div>
                <div class="bael-form-row">
                    <div class="bael-form-group">
                        <label class="bael-form-label">Schedule Type</label>
                        <select class="bael-form-select" id="task-schedule">
                            <option value="immediate">Immediate</option>
                            <option value="delay">After Delay</option>
                            <option value="datetime">Specific Time</option>
                        </select>
                    </div>
                    <div class="bael-form-group" id="delay-group" style="display:none">
                        <label class="bael-form-label">Delay (minutes)</label>
                        <input type="number" class="bael-form-input" id="task-delay" value="30" min="1">
                    </div>
                    <div class="bael-form-group" id="datetime-group" style="display:none">
                        <label class="bael-form-label">Date & Time</label>
                        <input type="datetime-local" class="bael-form-input" id="task-datetime">
                    </div>
                </div>
                <div class="bael-form-row">
                    <div class="bael-form-group">
                        <label class="bael-form-label">Repeat</label>
                        <select class="bael-form-select" id="task-repeat">
                            <option value="none">Don't Repeat</option>
                            <option value="hourly">Every Hour</option>
                            <option value="daily">Every Day</option>
                            <option value="weekly">Every Week</option>
                            <option value="custom">Custom Interval</option>
                        </select>
                    </div>
                    <div class="bael-form-group" id="custom-interval-group" style="display:none">
                        <label class="bael-form-label">Interval (minutes)</label>
                        <input type="number" class="bael-form-input" id="task-interval" value="60" min="1">
                    </div>
                </div>
                <div class="bael-form-group">
                    <label class="bael-form-label">Priority</label>
                    <select class="bael-form-select" id="task-priority">
                        <option value="low">Low</option>
                        <option value="normal" selected>Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </select>
                </div>
                <div class="bael-form-actions">
                    <button class="bael-form-btn secondary" id="cancel-task">Cancel</button>
                    <button class="bael-form-btn primary" id="save-task">Schedule Task</button>
                </div>
            `;
    }

    bindEvents() {
      // Trigger
      this.trigger.addEventListener("click", () => this.toggle());

      // Close
      this.overlay
        .querySelector(".bael-scheduler-close")
        .addEventListener("click", () => this.hide());
      this.overlay.addEventListener("click", (e) => {
        if (e.target === this.overlay) this.hide();
      });

      // Create task
      this.overlay
        .querySelector("#create-task-btn")
        .addEventListener("click", () => {
          this.modal.classList.add("visible");
        });

      this.modal.querySelector("#cancel-task").addEventListener("click", () => {
        this.modal.classList.remove("visible");
      });

      this.modal.querySelector("#save-task").addEventListener("click", () => {
        this.createTask();
      });

      // Schedule type change
      this.modal
        .querySelector("#task-schedule")
        .addEventListener("change", (e) => {
          this.modal.querySelector("#delay-group").style.display =
            e.target.value === "delay" ? "block" : "none";
          this.modal.querySelector("#datetime-group").style.display =
            e.target.value === "datetime" ? "block" : "none";
        });

      // Repeat change
      this.modal
        .querySelector("#task-repeat")
        .addEventListener("change", (e) => {
          this.modal.querySelector("#custom-interval-group").style.display =
            e.target.value === "custom" ? "block" : "none";
        });

      // Task actions
      this.overlay
        .querySelector("#task-list")
        .addEventListener("click", (e) => {
          const btn = e.target.closest(".bael-task-action");
          if (!btn) return;

          const id = btn.dataset.id;
          if (btn.classList.contains("run-now")) this.runTask(id);
          else if (btn.classList.contains("pause")) this.pauseTask(id);
          else if (btn.classList.contains("resume")) this.resumeTask(id);
          else if (btn.classList.contains("delete")) this.deleteTask(id);
        });

      // Keyboard
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          this.modal.classList.remove("visible");
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
      this.refreshList();
    }

    hide() {
      this.isVisible = false;
      this.overlay.classList.remove("visible");
      this.modal.classList.remove("visible");
    }

    refreshList() {
      this.overlay.querySelector("#task-list").innerHTML = this.renderTasks();
      this.updateTriggerBadge();
    }

    updateTriggerBadge() {
      const count = this.getActiveCount();
      const badge = this.trigger.querySelector(".badge");
      badge.textContent = count;
      badge.style.display = count > 0 ? "block" : "none";
    }

    getActiveCount() {
      return this.tasks.filter(
        (t) => t.status === "pending" || t.status === "running",
      ).length;
    }

    createTask() {
      const name = this.modal.querySelector("#task-name").value.trim();
      const prompt = this.modal.querySelector("#task-prompt").value.trim();
      const scheduleType = this.modal.querySelector("#task-schedule").value;
      const repeatType = this.modal.querySelector("#task-repeat").value;
      const priority = this.modal.querySelector("#task-priority").value;

      if (!name || !prompt) {
        if (window.BaelNotifications) {
          window.BaelNotifications.error("Name and prompt are required");
        }
        return;
      }

      let scheduledTime = Date.now();
      if (scheduleType === "delay") {
        const delay =
          parseInt(this.modal.querySelector("#task-delay").value) || 30;
        scheduledTime = Date.now() + delay * 60 * 1000;
      } else if (scheduleType === "datetime") {
        const datetime = this.modal.querySelector("#task-datetime").value;
        if (datetime) {
          scheduledTime = new Date(datetime).getTime();
        }
      }

      const task = {
        id: `task-${Date.now()}`,
        name,
        prompt,
        scheduleType,
        scheduledTime,
        repeat: repeatType !== "none",
        repeatType,
        repeatInterval: this.getRepeatInterval(repeatType),
        priority,
        status: "pending",
        runCount: 0,
        createdAt: Date.now(),
        lastRun: null,
      };

      this.tasks.push(task);
      this.saveTasks();
      this.refreshList();

      // Reset form
      this.modal.querySelector("#task-name").value = "";
      this.modal.querySelector("#task-prompt").value = "";
      this.modal.classList.remove("visible");

      if (window.BaelNotifications) {
        window.BaelNotifications.success(`Task "${name}" scheduled!`);
      }
    }

    getRepeatInterval(type) {
      switch (type) {
        case "hourly":
          return 60 * 60 * 1000;
        case "daily":
          return 24 * 60 * 60 * 1000;
        case "weekly":
          return 7 * 24 * 60 * 60 * 1000;
        case "custom":
          const mins =
            parseInt(this.modal.querySelector("#task-interval").value) || 60;
          return mins * 60 * 1000;
        default:
          return 0;
      }
    }

    formatSchedule(task) {
      if (task.scheduleType === "immediate") return "Immediate";
      const date = new Date(task.scheduledTime);
      return date.toLocaleString();
    }

    startScheduler() {
      this.checkInterval = setInterval(() => {
        this.checkScheduledTasks();
      }, 10000); // Check every 10 seconds
    }

    checkScheduledTasks() {
      const now = Date.now();

      this.tasks.forEach((task) => {
        if (task.status === "pending" && task.scheduledTime <= now) {
          this.executeTask(task);
        }
      });
    }

    async executeTask(task) {
      task.status = "running";
      this.saveTasks();
      this.refreshList();

      // Emit event for the agent to pick up
      document.dispatchEvent(
        new CustomEvent("bael-scheduled-task", {
          detail: { task },
        }),
      );

      // Simulate task completion
      setTimeout(() => {
        task.status = "completed";
        task.runCount = (task.runCount || 0) + 1;
        task.lastRun = Date.now();

        // Schedule next run if repeating
        if (task.repeat && task.repeatInterval > 0) {
          task.scheduledTime = Date.now() + task.repeatInterval;
          task.status = "pending";
        }

        this.saveTasks();
        this.refreshList();

        if (window.BaelNotifications) {
          window.BaelNotifications.success(`Task "${task.name}" completed!`);
        }
      }, 2000);
    }

    runTask(id) {
      const task = this.tasks.find((t) => t.id === id);
      if (task) {
        task.scheduledTime = Date.now();
        this.executeTask(task);
      }
    }

    pauseTask(id) {
      const task = this.tasks.find((t) => t.id === id);
      if (task) {
        task.status = "paused";
        this.saveTasks();
        this.refreshList();
      }
    }

    resumeTask(id) {
      const task = this.tasks.find((t) => t.id === id);
      if (task) {
        task.status = "pending";
        this.saveTasks();
        this.refreshList();
      }
    }

    deleteTask(id) {
      if (confirm("Delete this task?")) {
        this.tasks = this.tasks.filter((t) => t.id !== id);
        this.saveTasks();
        this.refreshList();

        if (window.BaelNotifications) {
          window.BaelNotifications.info("Task deleted");
        }
      }
    }
  }

  // Initialize
  window.BaelTaskScheduler = new BaelTaskScheduler();
})();
