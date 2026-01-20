/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ██████╗ ██████╗  ██████╗  ██████╗ ██████╗ ███████╗███████╗███████╗      █
 * █  ██╔══██╗██╔══██╗██╔═══██╗██╔════╝ ██╔══██╗██╔════╝██╔════╝██╔════╝      █
 * █  ██████╔╝██████╔╝██║   ██║██║  ███╗██████╔╝█████╗  ███████╗███████╗      █
 * █  ██╔═══╝ ██╔══██╗██║   ██║██║   ██║██╔══██╗██╔══╝  ╚════██║╚════██║      █
 * █  ██║     ██║  ██║╚██████╔╝╚██████╔╝██║  ██║███████╗███████║███████║      █
 * █  ╚═╝     ╚═╝  ╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝      █
 * █                                                                          █
 * █   BAEL PROGRESS TRACKER - Task & Goal Tracking (Ctrl+Shift+T)            █
 * █   Track tasks, goals, milestones with visual progress indicators         █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelProgressTracker {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;
      this.projects = [];
      this.selectedProjectId = null;
    }

    async initialize() {
      console.log("📊 Bael Progress Tracker initializing...");

      this.loadProjects();
      this.injectStyles();
      this.createContainer();
      this.setupShortcuts();

      this.initialized = true;
      console.log("✅ BAEL PROGRESS TRACKER READY");

      return this;
    }

    loadProjects() {
      try {
        const saved = localStorage.getItem("bael-progress-projects");
        if (saved) {
          this.projects = JSON.parse(saved);
        } else {
          // Create default project
          this.projects = [
            {
              id: "default",
              name: "My Tasks",
              color: "#6366f1",
              tasks: [],
              createdAt: new Date().toISOString(),
            },
          ];
          this.saveProjects();
        }
      } catch (e) {
        this.projects = [];
      }
    }

    saveProjects() {
      try {
        localStorage.setItem(
          "bael-progress-projects",
          JSON.stringify(this.projects),
        );
      } catch (e) {}
    }

    injectStyles() {
      if (document.getElementById("bael-progress-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-progress-styles";
      styles.textContent = `
                .bael-progress-container {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.95);
                    width: 90%;
                    max-width: 800px;
                    max-height: 85vh;
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

                .bael-progress-container.visible {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                    pointer-events: auto;
                }

                .bael-progress-backdrop {
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

                .bael-progress-backdrop.visible {
                    opacity: 1;
                    pointer-events: auto;
                }

                .progress-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .progress-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 18px;
                    font-weight: 600;
                    color: #fff;
                }

                .progress-header-actions {
                    display: flex;
                    gap: 10px;
                }

                .progress-btn {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: none;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .progress-btn.primary {
                    background: linear-gradient(135deg, #22c55e 0%, #10b981 100%);
                    color: #fff;
                }

                .progress-btn.primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
                }

                .progress-btn.secondary {
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.7);
                }

                .progress-btn.secondary:hover {
                    background: rgba(255, 255, 255, 0.12);
                    color: #fff;
                }

                .progress-close {
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

                .progress-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .progress-body {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }

                .progress-sidebar {
                    width: 220px;
                    background: rgba(255, 255, 255, 0.02);
                    border-right: 1px solid rgba(255, 255, 255, 0.06);
                    padding: 16px;
                    overflow-y: auto;
                }

                .project-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .project-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 14px;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                }

                .project-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .project-item.active {
                    background: rgba(34, 197, 94, 0.1);
                    border-color: rgba(34, 197, 94, 0.3);
                }

                .project-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }

                .project-name {
                    flex: 1;
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.8);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .project-count {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    padding: 2px 8px;
                    background: rgba(255, 255, 255, 0.06);
                    border-radius: 10px;
                }

                .add-project-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    width: 100%;
                    padding: 12px;
                    margin-top: 12px;
                    border-radius: 10px;
                    border: 1px dashed rgba(255, 255, 255, 0.15);
                    background: transparent;
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .add-project-btn:hover {
                    border-color: rgba(34, 197, 94, 0.4);
                    color: #22c55e;
                    background: rgba(34, 197, 94, 0.05);
                }

                .progress-main {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                }

                .task-header {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    margin-bottom: 20px;
                }

                .task-input-wrapper {
                    flex: 1;
                    position: relative;
                }

                .task-input {
                    width: 100%;
                    padding: 12px 16px;
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: #fff;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s;
                }

                .task-input:focus {
                    border-color: rgba(34, 197, 94, 0.5);
                    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
                }

                .task-input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }

                .task-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .task-item {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 14px 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    transition: all 0.2s;
                }

                .task-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                }

                .task-item.completed {
                    opacity: 0.6;
                }

                .task-checkbox {
                    width: 22px;
                    height: 22px;
                    border-radius: 6px;
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }

                .task-checkbox:hover {
                    border-color: #22c55e;
                }

                .task-checkbox.checked {
                    background: #22c55e;
                    border-color: #22c55e;
                    color: #fff;
                    font-size: 12px;
                }

                .task-content {
                    flex: 1;
                    min-width: 0;
                }

                .task-text {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.85);
                }

                .task-item.completed .task-text {
                    text-decoration: line-through;
                    color: rgba(255, 255, 255, 0.4);
                }

                .task-meta {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-top: 6px;
                }

                .task-date {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.3);
                }

                .task-priority {
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .task-priority.high {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .task-priority.medium {
                    background: rgba(245, 158, 11, 0.2);
                    color: #f59e0b;
                }

                .task-priority.low {
                    background: rgba(59, 130, 246, 0.2);
                    color: #3b82f6;
                }

                .task-delete {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.3);
                    cursor: pointer;
                    font-size: 14px;
                    opacity: 0;
                    transition: all 0.2s;
                }

                .task-item:hover .task-delete {
                    opacity: 1;
                }

                .task-delete:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .progress-stats {
                    display: flex;
                    gap: 16px;
                    padding: 16px 20px;
                    background: rgba(255, 255, 255, 0.02);
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                }

                .stat-box {
                    flex: 1;
                    text-align: center;
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 10px;
                }

                .stat-value {
                    font-size: 24px;
                    font-weight: 600;
                    color: #22c55e;
                }

                .stat-label {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-top: 4px;
                }

                .progress-bar-container {
                    padding: 0 20px 16px;
                }

                .progress-bar-label {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                    margin-bottom: 8px;
                }

                .progress-bar-track {
                    height: 8px;
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-bar-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #22c55e 0%, #10b981 100%);
                    border-radius: 4px;
                    transition: width 0.5s ease;
                }

                .empty-tasks {
                    text-align: center;
                    padding: 60px 20px;
                    color: rgba(255, 255, 255, 0.3);
                }

                .empty-tasks-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }

                .empty-tasks-text {
                    font-size: 14px;
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      // Create backdrop
      this.backdrop = document.createElement("div");
      this.backdrop.className = "bael-progress-backdrop";
      this.backdrop.onclick = () => this.hide();
      document.body.appendChild(this.backdrop);

      // Create main container
      this.container = document.createElement("div");
      this.container.id = "bael-progress-tracker";
      this.container.className = "bael-progress-container";

      this.selectedProjectId = this.projects[0]?.id || null;
      this.renderContainer();

      document.body.appendChild(this.container);
    }

    renderContainer() {
      const project = this.projects.find(
        (p) => p.id === this.selectedProjectId,
      );
      const tasks = project?.tasks || [];
      const completedCount = tasks.filter((t) => t.completed).length;
      const progress =
        tasks.length > 0
          ? Math.round((completedCount / tasks.length) * 100)
          : 0;

      this.container.innerHTML = `
                <div class="progress-header">
                    <div class="progress-title">
                        <span>📊</span> Progress Tracker
                    </div>
                    <div class="progress-header-actions">
                        <button class="progress-close" onclick="BaelProgressTracker.hide()">✕</button>
                    </div>
                </div>
                <div class="progress-body">
                    <div class="progress-sidebar">
                        <div class="project-list">
                            ${this.projects
                              .map(
                                (p) => `
                                <div class="project-item ${p.id === this.selectedProjectId ? "active" : ""}"
                                     onclick="BaelProgressTracker.selectProject('${p.id}')">
                                    <div class="project-dot" style="background: ${p.color}"></div>
                                    <span class="project-name">${p.name}</span>
                                    <span class="project-count">${p.tasks.length}</span>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                        <button class="add-project-btn" onclick="BaelProgressTracker.addProject()">
                            + New Project
                        </button>
                    </div>
                    <div class="progress-main">
                        <div class="task-header">
                            <div class="task-input-wrapper">
                                <input type="text" class="task-input"
                                       placeholder="Add a new task... (Enter to add)"
                                       onkeydown="if(event.key==='Enter') BaelProgressTracker.addTask(this.value)">
                            </div>
                            <button class="progress-btn primary"
                                    onclick="BaelProgressTracker.addTask(document.querySelector('.task-input').value)">
                                Add Task
                            </button>
                        </div>
                        <div class="task-list">
                            ${
                              tasks.length === 0
                                ? `
                                <div class="empty-tasks">
                                    <div class="empty-tasks-icon">📝</div>
                                    <div class="empty-tasks-text">No tasks yet. Add one above!</div>
                                </div>
                            `
                                : tasks
                                    .map(
                                      (t) => `
                                <div class="task-item ${t.completed ? "completed" : ""}" data-id="${t.id}">
                                    <div class="task-checkbox ${t.completed ? "checked" : ""}"
                                         onclick="BaelProgressTracker.toggleTask('${t.id}')">
                                        ${t.completed ? "✓" : ""}
                                    </div>
                                    <div class="task-content">
                                        <div class="task-text">${t.text}</div>
                                        <div class="task-meta">
                                            <span class="task-date">${this.formatDate(t.createdAt)}</span>
                                            ${t.priority ? `<span class="task-priority ${t.priority}">${t.priority}</span>` : ""}
                                        </div>
                                    </div>
                                    <button class="task-delete" onclick="BaelProgressTracker.deleteTask('${t.id}')">🗑</button>
                                </div>
                            `,
                                    )
                                    .join("")
                            }
                        </div>
                    </div>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar-label">
                        <span>Overall Progress</span>
                        <span>${progress}%</span>
                    </div>
                    <div class="progress-bar-track">
                        <div class="progress-bar-fill" style="width: ${progress}%"></div>
                    </div>
                </div>
                <div class="progress-stats">
                    <div class="stat-box">
                        <div class="stat-value">${tasks.length}</div>
                        <div class="stat-label">Total Tasks</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${completedCount}</div>
                        <div class="stat-label">Completed</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${tasks.length - completedCount}</div>
                        <div class="stat-label">Remaining</div>
                    </div>
                </div>
            `;
    }

    formatDate(iso) {
      const d = new Date(iso);
      const now = new Date();
      const diff = now - d;

      if (diff < 60000) return "Just now";
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      return d.toLocaleDateString();
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Ctrl+Shift+T for progress tracker
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "T") {
          e.preventDefault();
          if (this.visible) {
            this.hide();
          } else {
            this.show();
          }
        }

        // Escape to close
        if (e.key === "Escape" && this.visible) {
          this.hide();
        }
      });
    }

    show() {
      this.visible = true;
      this.backdrop.classList.add("visible");
      this.container.classList.add("visible");
      this.renderContainer();

      setTimeout(() => {
        this.container.querySelector(".task-input")?.focus();
      }, 100);
    }

    hide() {
      this.visible = false;
      this.backdrop.classList.remove("visible");
      this.container.classList.remove("visible");
    }

    selectProject(id) {
      this.selectedProjectId = id;
      this.renderContainer();
    }

    addProject() {
      const name = prompt("Project name:");
      if (!name?.trim()) return;

      const colors = [
        "#6366f1",
        "#22c55e",
        "#ef4444",
        "#f59e0b",
        "#3b82f6",
        "#8b5cf6",
        "#ec4899",
      ];
      const color = colors[Math.floor(Math.random() * colors.length)];

      const project = {
        id: Date.now().toString(),
        name: name.trim(),
        color,
        tasks: [],
        createdAt: new Date().toISOString(),
      };

      this.projects.push(project);
      this.selectedProjectId = project.id;
      this.saveProjects();
      this.renderContainer();
    }

    addTask(text) {
      if (!text?.trim()) return;

      const project = this.projects.find(
        (p) => p.id === this.selectedProjectId,
      );
      if (!project) return;

      // Parse priority from text
      let priority = null;
      let taskText = text.trim();

      if (taskText.startsWith("!!! ")) {
        priority = "high";
        taskText = taskText.substring(4);
      } else if (taskText.startsWith("!! ")) {
        priority = "medium";
        taskText = taskText.substring(3);
      } else if (taskText.startsWith("! ")) {
        priority = "low";
        taskText = taskText.substring(2);
      }

      const task = {
        id: Date.now().toString(),
        text: taskText,
        completed: false,
        priority,
        createdAt: new Date().toISOString(),
      };

      project.tasks.unshift(task);
      this.saveProjects();
      this.renderContainer();

      this.container.querySelector(".task-input").value = "";
      this.container.querySelector(".task-input")?.focus();
    }

    toggleTask(taskId) {
      const project = this.projects.find(
        (p) => p.id === this.selectedProjectId,
      );
      if (!project) return;

      const task = project.tasks.find((t) => t.id === taskId);
      if (task) {
        task.completed = !task.completed;
        this.saveProjects();
        this.renderContainer();
      }
    }

    deleteTask(taskId) {
      const project = this.projects.find(
        (p) => p.id === this.selectedProjectId,
      );
      if (!project) return;

      project.tasks = project.tasks.filter((t) => t.id !== taskId);
      this.saveProjects();
      this.renderContainer();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelProgressTracker = new BaelProgressTracker();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelProgressTracker.initialize();
    });
  } else {
    window.BaelProgressTracker.initialize();
  }

  console.log("📊 Bael Progress Tracker loaded");
})();
