/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BAEL - LORD OF ALL
 * SCHEDULER SYSTEM - Advanced Task Automation
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Schedule and automate tasks with:
 * - Cron-style scheduling
 * - Recurring tasks
 * - Chain/sequence execution
 * - Conditional triggers
 * - Notification integration
 *
 * @version 1.0.0
 */

(function () {
  "use strict";

  class BaelScheduler {
    constructor() {
      // Scheduled tasks
      this.tasks = new Map();

      // Running tasks
      this.running = new Set();

      // Task history
      this.history = [];

      // Check interval (1 minute)
      this.checkInterval = null;

      // Triggers
      this.triggers = new Map();

      // UI
      this.panel = null;
      this.isVisible = false;

      this.init();
    }

    init() {
      this.loadTasks();
      this.startScheduler();
      this.createUI();
      this.addStyles();
      this.bindEvents();
      console.log("⏰ Bael Scheduler initialized");
    }

    // ═════════════════════════════════════════════════════════════════
    // TASK MANAGEMENT
    // ═════════════════════════════════════════════════════════════════

    createTask(config) {
      const task = {
        id: config.id || this.generateId(),
        name: config.name || "Unnamed Task",
        description: config.description || "",
        type: config.type || "once", // once, recurring, cron
        schedule: config.schedule || null,
        action: config.action || (() => {}),
        actionType: config.actionType || "function", // function, message, prompt, api
        actionData: config.actionData || null,
        enabled: config.enabled !== false,
        lastRun: null,
        nextRun: null,
        runCount: 0,
        maxRuns: config.maxRuns || Infinity,
        conditions: config.conditions || [],
        chain: config.chain || [], // Tasks to run after this one
        tags: config.tags || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Calculate next run
      task.nextRun = this.calculateNextRun(task);

      this.tasks.set(task.id, task);
      this.saveTasks();
      this.updateUI();
      this.emit("task-created", task);

      return task;
    }

    updateTask(id, updates) {
      const task = this.tasks.get(id);
      if (!task) return null;

      Object.assign(task, updates, { updatedAt: new Date() });
      task.nextRun = this.calculateNextRun(task);

      this.saveTasks();
      this.updateUI();
      this.emit("task-updated", task);

      return task;
    }

    deleteTask(id) {
      const task = this.tasks.get(id);
      if (!task) return false;

      this.tasks.delete(id);
      this.saveTasks();
      this.updateUI();
      this.emit("task-deleted", { id });

      return true;
    }

    enableTask(id) {
      return this.updateTask(id, { enabled: true });
    }

    disableTask(id) {
      return this.updateTask(id, { enabled: false });
    }

    // ═════════════════════════════════════════════════════════════════
    // SCHEDULING
    // ═════════════════════════════════════════════════════════════════

    calculateNextRun(task) {
      if (!task.enabled) return null;
      if (task.runCount >= task.maxRuns) return null;

      const now = new Date();

      switch (task.type) {
        case "once":
          if (task.schedule instanceof Date) {
            return task.schedule > now ? task.schedule : null;
          }
          if (typeof task.schedule === "string") {
            const date = new Date(task.schedule);
            return date > now ? date : null;
          }
          return null;

        case "recurring":
          return this.calculateRecurringNext(task, now);

        case "cron":
          return this.calculateCronNext(task.schedule, now);

        default:
          return null;
      }
    }

    calculateRecurringNext(task, now) {
      const { interval, unit } = task.schedule;
      const base = task.lastRun || task.createdAt;
      let next = new Date(base);

      switch (unit) {
        case "minutes":
          next.setMinutes(next.getMinutes() + interval);
          break;
        case "hours":
          next.setHours(next.getHours() + interval);
          break;
        case "days":
          next.setDate(next.getDate() + interval);
          break;
        case "weeks":
          next.setDate(next.getDate() + interval * 7);
          break;
        case "months":
          next.setMonth(next.getMonth() + interval);
          break;
      }

      // If next is in the past, calculate from now
      while (next <= now) {
        switch (unit) {
          case "minutes":
            next.setMinutes(next.getMinutes() + interval);
            break;
          case "hours":
            next.setHours(next.getHours() + interval);
            break;
          case "days":
            next.setDate(next.getDate() + interval);
            break;
          case "weeks":
            next.setDate(next.getDate() + interval * 7);
            break;
          case "months":
            next.setMonth(next.getMonth() + interval);
            break;
        }
      }

      return next;
    }

    calculateCronNext(cronExpr, now) {
      // Simplified cron parser: minute hour day month dayOfWeek
      const [minute, hour, day, month, dow] = cronExpr.split(" ");

      let next = new Date(now);
      next.setSeconds(0);
      next.setMilliseconds(0);

      // Basic implementation - advance to next matching time
      for (let i = 0; i < 525600; i++) {
        // Max 1 year of minutes
        next.setMinutes(next.getMinutes() + 1);

        if (this.cronMatches(next, minute, hour, day, month, dow)) {
          return next;
        }
      }

      return null;
    }

    cronMatches(date, minute, hour, day, month, dow) {
      const m = date.getMinutes();
      const h = date.getHours();
      const d = date.getDate();
      const mo = date.getMonth() + 1;
      const w = date.getDay();

      return (
        this.cronFieldMatches(m, minute) &&
        this.cronFieldMatches(h, hour) &&
        this.cronFieldMatches(d, day) &&
        this.cronFieldMatches(mo, month) &&
        this.cronFieldMatches(w, dow)
      );
    }

    cronFieldMatches(value, field) {
      if (field === "*") return true;
      if (field.includes(",")) {
        return field.split(",").map(Number).includes(value);
      }
      if (field.includes("-")) {
        const [min, max] = field.split("-").map(Number);
        return value >= min && value <= max;
      }
      if (field.includes("/")) {
        const [, step] = field.split("/");
        return value % Number(step) === 0;
      }
      return Number(field) === value;
    }

    // ═════════════════════════════════════════════════════════════════
    // EXECUTION
    // ═════════════════════════════════════════════════════════════════

    startScheduler() {
      // Check every minute
      this.checkInterval = setInterval(() => this.checkSchedule(), 60000);
      // Also check immediately
      setTimeout(() => this.checkSchedule(), 1000);
    }

    stopScheduler() {
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
      }
    }

    checkSchedule() {
      const now = new Date();

      for (const [id, task] of this.tasks) {
        if (!task.enabled) continue;
        if (this.running.has(id)) continue;
        if (!task.nextRun) continue;

        if (task.nextRun <= now) {
          this.executeTask(id);
        }
      }
    }

    async executeTask(id) {
      const task = this.tasks.get(id);
      if (!task) return;

      // Check conditions
      if (!this.checkConditions(task)) {
        console.log(`⏰ Task "${task.name}" skipped - conditions not met`);
        return;
      }

      this.running.add(id);
      this.emit("task-started", task);

      const startTime = Date.now();
      let result = { success: false, error: null, output: null };

      try {
        switch (task.actionType) {
          case "function":
            result.output = await task.action();
            result.success = true;
            break;

          case "message":
            result.output = await this.sendMessage(task.actionData);
            result.success = true;
            break;

          case "prompt":
            result.output = await this.executePrompt(task.actionData);
            result.success = true;
            break;

          case "api":
            result.output = await this.callAPI(task.actionData);
            result.success = true;
            break;
        }
      } catch (error) {
        result.error = error.message;
        console.error(`⏰ Task "${task.name}" failed:`, error);
      }

      const endTime = Date.now();

      // Update task
      task.lastRun = new Date();
      task.runCount++;
      task.nextRun = this.calculateNextRun(task);

      // Record history
      this.history.unshift({
        taskId: id,
        taskName: task.name,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        duration: endTime - startTime,
        ...result,
      });

      // Keep history manageable
      if (this.history.length > 100) {
        this.history.pop();
      }

      this.running.delete(id);
      this.saveTasks();
      this.updateUI();
      this.emit("task-completed", { task, result });

      // Execute chain
      if (result.success && task.chain.length > 0) {
        for (const chainId of task.chain) {
          await this.executeTask(chainId);
        }
      }

      return result;
    }

    checkConditions(task) {
      for (const condition of task.conditions) {
        switch (condition.type) {
          case "time-range":
            const now = new Date();
            const hour = now.getHours();
            if (hour < condition.start || hour >= condition.end) return false;
            break;

          case "day-of-week":
            const day = new Date().getDay();
            if (!condition.days.includes(day)) return false;
            break;

          case "custom":
            if (typeof condition.check === "function" && !condition.check())
              return false;
            break;
        }
      }
      return true;
    }

    async sendMessage(data) {
      // Send message to agent
      if (window.BaelChat) {
        return await window.BaelChat.sendMessage(data.message);
      }
      throw new Error("Chat system not available");
    }

    async executePrompt(data) {
      // Execute a saved prompt
      if (window.BaelPromptLibrary) {
        return await window.BaelPromptLibrary.executePrompt(data.promptId);
      }
      throw new Error("Prompt library not available");
    }

    async callAPI(data) {
      const response = await fetch(data.url, {
        method: data.method || "GET",
        headers: data.headers || {},
        body: data.body ? JSON.stringify(data.body) : undefined,
      });
      return await response.json();
    }

    // ═════════════════════════════════════════════════════════════════
    // TRIGGERS
    // ═════════════════════════════════════════════════════════════════

    registerTrigger(name, config) {
      this.triggers.set(name, {
        name,
        event: config.event,
        filter: config.filter,
        tasks: config.tasks || [],
      });

      // Set up event listener
      if (config.event) {
        window.addEventListener(config.event, (e) => {
          if (!config.filter || config.filter(e)) {
            this.fireTrigger(name, e);
          }
        });
      }
    }

    fireTrigger(name, data) {
      const trigger = this.triggers.get(name);
      if (!trigger) return;

      for (const taskId of trigger.tasks) {
        this.executeTask(taskId);
      }

      this.emit("trigger-fired", { name, data });
    }

    // ═════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═════════════════════════════════════════════════════════════════

    loadTasks() {
      try {
        const saved = JSON.parse(
          localStorage.getItem("bael_scheduled_tasks") || "{}",
        );
        if (saved.tasks) {
          for (const [id, task] of Object.entries(saved.tasks)) {
            // Restore dates
            task.createdAt = new Date(task.createdAt);
            task.updatedAt = new Date(task.updatedAt);
            if (task.lastRun) task.lastRun = new Date(task.lastRun);
            if (task.nextRun) task.nextRun = new Date(task.nextRun);
            // Recalculate next run
            task.nextRun = this.calculateNextRun(task);
            this.tasks.set(id, task);
          }
        }
        if (saved.history) {
          this.history = saved.history.map((h) => ({
            ...h,
            startTime: new Date(h.startTime),
            endTime: new Date(h.endTime),
          }));
        }
      } catch (e) {
        console.warn("Failed to load scheduled tasks:", e);
      }
    }

    saveTasks() {
      const data = {
        tasks: Object.fromEntries(this.tasks),
        history: this.history.slice(0, 50),
      };
      localStorage.setItem("bael_scheduled_tasks", JSON.stringify(data));
    }

    // ═════════════════════════════════════════════════════════════════
    // UI
    // ═════════════════════════════════════════════════════════════════

    createUI() {
      const panel = document.createElement("div");
      panel.id = "bael-scheduler-panel";
      panel.className = "bael-scheduler-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;
    }

    renderPanel() {
      const tasksList = Array.from(this.tasks.values());
      const now = new Date();

      return `
                <div class="scheduler-header">
                    <div class="scheduler-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span>Task Scheduler</span>
                    </div>
                    <button class="scheduler-close" id="scheduler-close">×</button>
                </div>

                <div class="scheduler-toolbar">
                    <button class="scheduler-btn primary" id="create-task-btn">
                        + New Task
                    </button>
                    <div class="scheduler-stats">
                        <span class="stat">${tasksList.filter((t) => t.enabled).length} Active</span>
                        <span class="stat">${this.running.size} Running</span>
                    </div>
                </div>

                <div class="scheduler-content">
                    <!-- Task List -->
                    <div class="task-list">
                        ${tasksList.length === 0 ? '<div class="empty-state">No scheduled tasks</div>' : ""}
                        ${tasksList.map((task) => this.renderTaskCard(task, now)).join("")}
                    </div>

                    <!-- History -->
                    <div class="scheduler-history">
                        <h4>Recent History</h4>
                        <div class="history-list">
                            ${this.history
                              .slice(0, 10)
                              .map(
                                (h) => `
                                <div class="history-item ${h.success ? "success" : "error"}">
                                    <span class="history-name">${h.taskName}</span>
                                    <span class="history-time">${this.formatTime(h.startTime)}</span>
                                    <span class="history-duration">${h.duration}ms</span>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                </div>

                <!-- Create Task Modal -->
                <div class="task-modal" id="task-modal">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>Create Task</h3>
                            <button class="modal-close" id="modal-close">×</button>
                        </div>
                        <div class="modal-body">
                            <div class="form-group">
                                <label>Task Name</label>
                                <input type="text" id="task-name" placeholder="Daily Summary">
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <input type="text" id="task-desc" placeholder="Optional description">
                            </div>
                            <div class="form-group">
                                <label>Schedule Type</label>
                                <select id="task-type">
                                    <option value="once">One Time</option>
                                    <option value="recurring">Recurring</option>
                                    <option value="cron">Cron Expression</option>
                                </select>
                            </div>
                            <div class="form-group schedule-once">
                                <label>Run At</label>
                                <input type="datetime-local" id="task-datetime">
                            </div>
                            <div class="form-group schedule-recurring" style="display:none">
                                <label>Repeat Every</label>
                                <div class="interval-input">
                                    <input type="number" id="task-interval" value="1" min="1">
                                    <select id="task-unit">
                                        <option value="minutes">Minutes</option>
                                        <option value="hours">Hours</option>
                                        <option value="days">Days</option>
                                        <option value="weeks">Weeks</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group schedule-cron" style="display:none">
                                <label>Cron Expression</label>
                                <input type="text" id="task-cron" placeholder="0 9 * * *">
                                <small>minute hour day month dayOfWeek</small>
                            </div>
                            <div class="form-group">
                                <label>Action Type</label>
                                <select id="task-action-type">
                                    <option value="message">Send Message</option>
                                    <option value="prompt">Execute Prompt</option>
                                    <option value="api">API Call</option>
                                </select>
                            </div>
                            <div class="form-group action-message">
                                <label>Message</label>
                                <textarea id="task-message" placeholder="Give me a summary of today's tasks"></textarea>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn secondary" id="cancel-task">Cancel</button>
                            <button class="btn primary" id="save-task">Create Task</button>
                        </div>
                    </div>
                </div>
            `;
    }

    renderTaskCard(task, now) {
      const isRunning = this.running.has(task.id);
      const nextRunStr = task.nextRun
        ? this.formatNextRun(task.nextRun, now)
        : "Not scheduled";

      return `
                <div class="task-card ${task.enabled ? "" : "disabled"} ${isRunning ? "running" : ""}" data-task-id="${task.id}">
                    <div class="task-status">
                        ${isRunning ? '<div class="status-pulse"></div>' : ""}
                    </div>
                    <div class="task-info">
                        <div class="task-name">${task.name}</div>
                        <div class="task-meta">
                            <span class="task-type">${task.type}</span>
                            <span class="task-next">${nextRunStr}</span>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button class="task-btn run" data-action="run" title="Run Now">▶</button>
                        <button class="task-btn toggle" data-action="toggle" title="${task.enabled ? "Disable" : "Enable"}">
                            ${task.enabled ? "⏸" : "▶"}
                        </button>
                        <button class="task-btn delete" data-action="delete" title="Delete">🗑</button>
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
      if (document.getElementById("bael-scheduler-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-scheduler-styles";
      styles.textContent = `
                .bael-scheduler-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 560px;
                    max-width: 95vw;
                    max-height: 85vh;
                    background: var(--color-panel, #12121a);
                    border: 1px solid var(--color-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100060;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 30px 100px rgba(0, 0, 0, 0.6);
                }

                .bael-scheduler-panel.visible {
                    display: flex;
                    animation: schedulerIn 0.3s ease;
                }

                @keyframes schedulerIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .scheduler-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--color-border, #2a2a3a);
                }

                .scheduler-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--color-text, #fff);
                }

                .scheduler-title svg {
                    width: 22px;
                    height: 22px;
                    color: var(--color-primary, #ff3366);
                }

                .scheduler-close {
                    width: 32px;
                    height: 32px;
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted, #666);
                    font-size: 24px;
                    cursor: pointer;
                    border-radius: 6px;
                }

                .scheduler-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .scheduler-toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 20px;
                    border-bottom: 1px solid var(--color-border, #2a2a3a);
                }

                .scheduler-btn {
                    padding: 8px 16px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--color-text, #fff);
                    font-size: 13px;
                    cursor: pointer;
                }

                .scheduler-btn.primary {
                    background: var(--color-primary, #ff3366);
                    border-color: transparent;
                }

                .scheduler-stats {
                    display: flex;
                    gap: 16px;
                }

                .scheduler-stats .stat {
                    font-size: 12px;
                    color: var(--color-text-muted, #666);
                }

                .scheduler-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px 20px;
                }

                .task-list {
                    margin-bottom: 24px;
                }

                .empty-state {
                    text-align: center;
                    padding: 40px;
                    color: var(--color-text-muted, #666);
                }

                .task-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px 16px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #2a2a3a);
                    border-radius: 10px;
                    margin-bottom: 8px;
                    transition: all 0.2s;
                }

                .task-card.disabled {
                    opacity: 0.5;
                }

                .task-card.running {
                    border-color: var(--color-primary, #ff3366);
                }

                .task-status {
                    width: 10px;
                    height: 10px;
                }

                .status-pulse {
                    width: 10px;
                    height: 10px;
                    background: var(--color-primary, #ff3366);
                    border-radius: 50%;
                    animation: pulse 1s infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.8); }
                }

                .task-info {
                    flex: 1;
                }

                .task-name {
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--color-text, #fff);
                }

                .task-meta {
                    display: flex;
                    gap: 12px;
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                    margin-top: 4px;
                }

                .task-type {
                    background: var(--color-border, #2a2a3a);
                    padding: 2px 6px;
                    border-radius: 4px;
                }

                .task-actions {
                    display: flex;
                    gap: 6px;
                }

                .task-btn {
                    width: 28px;
                    height: 28px;
                    background: var(--color-background, #0a0a0f);
                    border: 1px solid var(--color-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--color-text-muted, #666);
                    cursor: pointer;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .task-btn:hover {
                    border-color: var(--color-primary, #ff3366);
                    color: var(--color-text, #fff);
                }

                .task-btn.delete:hover {
                    border-color: #ef4444;
                    color: #ef4444;
                }

                .scheduler-history h4 {
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    color: var(--color-text-muted, #666);
                    margin-bottom: 12px;
                }

                .history-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 8px 12px;
                    background: var(--color-surface, #181820);
                    border-radius: 6px;
                    margin-bottom: 4px;
                    font-size: 12px;
                }

                .history-item.success {
                    border-left: 3px solid #10b981;
                }

                .history-item.error {
                    border-left: 3px solid #ef4444;
                }

                .history-name {
                    flex: 1;
                    color: var(--color-text, #fff);
                }

                .history-time, .history-duration {
                    color: var(--color-text-muted, #666);
                }

                /* Modal */
                .task-modal {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.8);
                    display: none;
                    align-items: center;
                    justify-content: center;
                    z-index: 10;
                }

                .task-modal.visible {
                    display: flex;
                }

                .modal-content {
                    background: var(--color-panel, #12121a);
                    border: 1px solid var(--color-border, #2a2a3a);
                    border-radius: 12px;
                    width: 400px;
                    max-width: 90%;
                }

                .modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--color-border, #2a2a3a);
                }

                .modal-header h3 {
                    margin: 0;
                    font-size: 16px;
                    color: var(--color-text, #fff);
                }

                .modal-close {
                    width: 28px;
                    height: 28px;
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted, #666);
                    font-size: 20px;
                    cursor: pointer;
                }

                .modal-body {
                    padding: 20px;
                }

                .form-group {
                    margin-bottom: 16px;
                }

                .form-group label {
                    display: block;
                    font-size: 12px;
                    color: var(--color-text-muted, #666);
                    margin-bottom: 6px;
                }

                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: 10px 12px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--color-text, #fff);
                    font-size: 13px;
                }

                .form-group textarea {
                    min-height: 80px;
                    resize: vertical;
                }

                .form-group small {
                    display: block;
                    margin-top: 4px;
                    font-size: 10px;
                    color: var(--color-text-muted, #666);
                }

                .interval-input {
                    display: flex;
                    gap: 8px;
                }

                .interval-input input {
                    width: 80px;
                }

                .interval-input select {
                    flex: 1;
                }

                .modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                    padding: 16px 20px;
                    border-top: 1px solid var(--color-border, #2a2a3a);
                }

                .btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    font-size: 13px;
                    cursor: pointer;
                }

                .btn.primary {
                    background: var(--color-primary, #ff3366);
                    color: #fff;
                }

                .btn.secondary {
                    background: var(--color-surface, #181820);
                    color: var(--color-text, #fff);
                    border: 1px solid var(--color-border, #2a2a3a);
                }
            `;
      document.head.appendChild(styles);
    }

    // ═════════════════════════════════════════════════════════════════
    // EVENT BINDING
    // ═════════════════════════════════════════════════════════════════

    bindEvents() {
      this.bindPanelEvents();

      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "T") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    bindPanelEvents() {
      if (!this.panel) return;

      // Close
      this.panel
        .querySelector("#scheduler-close")
        ?.addEventListener("click", () => this.close());

      // Create task button
      this.panel
        .querySelector("#create-task-btn")
        ?.addEventListener("click", () => {
          this.panel.querySelector("#task-modal").classList.add("visible");
        });

      // Modal close
      this.panel
        .querySelector("#modal-close")
        ?.addEventListener("click", () => {
          this.panel.querySelector("#task-modal").classList.remove("visible");
        });

      this.panel
        .querySelector("#cancel-task")
        ?.addEventListener("click", () => {
          this.panel.querySelector("#task-modal").classList.remove("visible");
        });

      // Schedule type change
      this.panel
        .querySelector("#task-type")
        ?.addEventListener("change", (e) => {
          const type = e.target.value;
          this.panel.querySelector(".schedule-once").style.display =
            type === "once" ? "block" : "none";
          this.panel.querySelector(".schedule-recurring").style.display =
            type === "recurring" ? "block" : "none";
          this.panel.querySelector(".schedule-cron").style.display =
            type === "cron" ? "block" : "none";
        });

      // Save task
      this.panel.querySelector("#save-task")?.addEventListener("click", () => {
        this.saveNewTask();
      });

      // Task actions
      this.panel.querySelectorAll(".task-card").forEach((card) => {
        const taskId = card.dataset.taskId;
        card.querySelectorAll(".task-btn").forEach((btn) => {
          btn.addEventListener("click", () => {
            const action = btn.dataset.action;
            if (action === "run") this.executeTask(taskId);
            else if (action === "toggle") {
              const task = this.tasks.get(taskId);
              if (task.enabled) this.disableTask(taskId);
              else this.enableTask(taskId);
            } else if (action === "delete") {
              if (confirm("Delete this task?")) {
                this.deleteTask(taskId);
              }
            }
          });
        });
      });
    }

    saveNewTask() {
      const name = this.panel.querySelector("#task-name").value;
      const desc = this.panel.querySelector("#task-desc").value;
      const type = this.panel.querySelector("#task-type").value;
      const actionType = this.panel.querySelector("#task-action-type").value;
      const message = this.panel.querySelector("#task-message").value;

      let schedule;
      if (type === "once") {
        schedule = new Date(this.panel.querySelector("#task-datetime").value);
      } else if (type === "recurring") {
        schedule = {
          interval: parseInt(this.panel.querySelector("#task-interval").value),
          unit: this.panel.querySelector("#task-unit").value,
        };
      } else if (type === "cron") {
        schedule = this.panel.querySelector("#task-cron").value;
      }

      this.createTask({
        name,
        description: desc,
        type,
        schedule,
        actionType,
        actionData: actionType === "message" ? { message } : null,
      });

      this.panel.querySelector("#task-modal").classList.remove("visible");
      this.updateUI();
    }

    // ═════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═════════════════════════════════════════════════════════════════

    generateId() {
      return (
        "task_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9)
      );
    }

    formatTime(date) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    formatNextRun(next, now) {
      const diff = next - now;
      if (diff < 0) return "Overdue";
      if (diff < 60000) return "In < 1 min";
      if (diff < 3600000) return `In ${Math.round(diff / 60000)} min`;
      if (diff < 86400000) return `In ${Math.round(diff / 3600000)} hr`;
      return next.toLocaleDateString();
    }

    emit(event, data) {
      window.dispatchEvent(
        new CustomEvent(`bael:scheduler:${event}`, { detail: data }),
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
    }

    toggle() {
      if (this.isVisible) this.close();
      else this.open();
    }

    getTasks() {
      return Array.from(this.tasks.values());
    }

    getHistory() {
      return [...this.history];
    }
  }

  // Initialize
  window.BaelScheduler = new BaelScheduler();
})();
