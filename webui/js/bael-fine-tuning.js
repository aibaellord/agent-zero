/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BAEL - LORD OF ALL
 * MODEL FINE-TUNING INTERFACE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Advanced AI model customization:
 * - Dataset creation and management
 * - Training configuration
 * - Prompt templates
 * - Response calibration
 * - Performance monitoring
 *
 * @version 1.0.0
 */

(function () {
  "use strict";

  class BaelFineTuning {
    constructor() {
      // Datasets
      this.datasets = new Map();
      this.activeDataset = null;

      // Training jobs
      this.trainingJobs = new Map();

      // Prompt templates
      this.templates = new Map();

      // Response calibration
      this.calibrations = {
        temperature: 0.7,
        topP: 0.9,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        maxTokens: 2048,
      };

      // UI
      this.panel = null;
      this.isVisible = false;
      this.activeTab = "datasets";

      this.init();
    }

    init() {
      this.loadData();
      this.createDefaultTemplates();
      this.createUI();
      this.addStyles();
      this.bindEvents();
      console.log("🎯 Bael Fine-Tuning Interface initialized");
    }

    // ═════════════════════════════════════════════════════════════════
    // DATASET MANAGEMENT
    // ═════════════════════════════════════════════════════════════════

    createDataset(name, description = "") {
      const id = "ds_" + Date.now().toString(36);
      const dataset = {
        id,
        name,
        description,
        createdAt: new Date(),
        entries: [],
        format: "instruction", // instruction, chat, completion
        statistics: {
          totalTokens: 0,
          avgTokens: 0,
          entryCount: 0,
        },
      };

      this.datasets.set(id, dataset);
      this.saveData();
      this.updateUI();

      return dataset;
    }

    addDataEntry(datasetId, entry) {
      const dataset = this.datasets.get(datasetId);
      if (!dataset) return false;

      const entryId = "entry_" + Date.now().toString(36);
      const newEntry = {
        id: entryId,
        ...entry,
        createdAt: new Date(),
        tokens: this.estimateTokens(entry),
      };

      dataset.entries.push(newEntry);
      this.updateDatasetStats(datasetId);
      this.saveData();
      this.updateUI();

      return newEntry;
    }

    removeDataEntry(datasetId, entryId) {
      const dataset = this.datasets.get(datasetId);
      if (!dataset) return false;

      dataset.entries = dataset.entries.filter((e) => e.id !== entryId);
      this.updateDatasetStats(datasetId);
      this.saveData();
      this.updateUI();

      return true;
    }

    updateDatasetStats(datasetId) {
      const dataset = this.datasets.get(datasetId);
      if (!dataset) return;

      const totalTokens = dataset.entries.reduce(
        (sum, e) => sum + (e.tokens || 0),
        0,
      );
      dataset.statistics = {
        totalTokens,
        avgTokens: dataset.entries.length
          ? Math.round(totalTokens / dataset.entries.length)
          : 0,
        entryCount: dataset.entries.length,
      };
    }

    estimateTokens(entry) {
      // Rough estimation: 1 token ≈ 4 characters
      const text =
        (entry.instruction || "") +
        (entry.input || "") +
        (entry.output || "") +
        (entry.messages?.map((m) => m.content).join("") || "");
      return Math.ceil(text.length / 4);
    }

    deleteDataset(datasetId) {
      this.datasets.delete(datasetId);
      if (this.activeDataset === datasetId) {
        this.activeDataset = null;
      }
      this.saveData();
      this.updateUI();
    }

    exportDataset(datasetId, format = "jsonl") {
      const dataset = this.datasets.get(datasetId);
      if (!dataset) return;

      let content;
      let filename;

      if (format === "jsonl") {
        content = dataset.entries.map((e) => JSON.stringify(e)).join("\n");
        filename = `${dataset.name}.jsonl`;
      } else {
        content = JSON.stringify(dataset, null, 2);
        filename = `${dataset.name}.json`;
      }

      const blob = new Blob([content], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

      window.BaelNotifications?.show(`Exported ${filename}`, "success");
    }

    importDataset(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          let entries;

          if (file.name.endsWith(".jsonl")) {
            entries = content
              .split("\n")
              .filter(Boolean)
              .map((line) => JSON.parse(line));
          } else {
            const data = JSON.parse(content);
            entries = data.entries || [data];
          }

          const dataset = this.createDataset(
            file.name.replace(/\.(json|jsonl)$/, ""),
          );
          entries.forEach((entry) => this.addDataEntry(dataset.id, entry));

          window.BaelNotifications?.show(
            `Imported ${entries.length} entries`,
            "success",
          );
        } catch (err) {
          window.BaelNotifications?.show("Failed to import dataset", "error");
        }
      };
      reader.readAsText(file);
    }

    // ═════════════════════════════════════════════════════════════════
    // TRAINING
    // ═════════════════════════════════════════════════════════════════

    createTrainingJob(config) {
      const id = "job_" + Date.now().toString(36);
      const job = {
        id,
        datasetId: config.datasetId,
        baseModel: config.baseModel || "gpt-3.5-turbo",
        epochs: config.epochs || 3,
        batchSize: config.batchSize || 4,
        learningRate: config.learningRate || 0.0001,
        status: "pending",
        progress: 0,
        createdAt: new Date(),
        logs: [],
      };

      this.trainingJobs.set(id, job);
      this.saveData();
      this.updateUI();

      return job;
    }

    startTraining(jobId) {
      const job = this.trainingJobs.get(jobId);
      if (!job || job.status === "running") return;

      job.status = "running";
      job.startedAt = new Date();
      job.logs.push({ time: new Date(), message: "Training started" });
      this.updateUI();

      // Simulate training progress
      const interval = setInterval(() => {
        if (job.progress >= 100) {
          clearInterval(interval);
          job.status = "completed";
          job.completedAt = new Date();
          job.logs.push({ time: new Date(), message: "Training completed" });
          this.saveData();
          this.updateUI();
          window.BaelNotifications?.show("Training completed!", "success");
          return;
        }

        job.progress += Math.random() * 10;
        job.progress = Math.min(100, job.progress);
        job.logs.push({
          time: new Date(),
          message: `Epoch ${Math.ceil(job.progress / 33.33)} - Loss: ${(2 - job.progress / 50).toFixed(4)}`,
        });
        this.updateUI();
      }, 1500);
    }

    cancelTraining(jobId) {
      const job = this.trainingJobs.get(jobId);
      if (!job || job.status !== "running") return;

      job.status = "cancelled";
      job.logs.push({
        time: new Date(),
        message: "Training cancelled by user",
      });
      this.saveData();
      this.updateUI();
    }

    // ═════════════════════════════════════════════════════════════════
    // PROMPT TEMPLATES
    // ═════════════════════════════════════════════════════════════════

    createDefaultTemplates() {
      if (this.templates.size > 0) return;

      const defaults = [
        {
          id: "assistant",
          name: "AI Assistant",
          system: "You are a helpful AI assistant.",
          format: "{{instruction}}\n\nUser: {{input}}\n\nAssistant:",
        },
        {
          id: "coder",
          name: "Code Assistant",
          system:
            "You are an expert programmer. Provide clean, efficient code.",
          format:
            "### Task\n{{instruction}}\n\n### Input\n{{input}}\n\n### Code",
        },
        {
          id: "creative",
          name: "Creative Writer",
          system: "You are a creative writer with expertise in storytelling.",
          format: "Create: {{instruction}}\n\nContext: {{input}}\n\n---\n",
        },
        {
          id: "analyst",
          name: "Data Analyst",
          system: "You are a data analyst providing insights and analysis.",
          format:
            "Analysis Request: {{instruction}}\n\nData: {{input}}\n\nAnalysis:",
        },
      ];

      defaults.forEach((t) => this.templates.set(t.id, t));
    }

    createTemplate(name, system, format) {
      const id = "tpl_" + Date.now().toString(36);
      const template = { id, name, system, format, createdAt: new Date() };
      this.templates.set(id, template);
      this.saveData();
      this.updateUI();
      return template;
    }

    deleteTemplate(templateId) {
      this.templates.delete(templateId);
      this.saveData();
      this.updateUI();
    }

    applyTemplate(templateId, data) {
      const template = this.templates.get(templateId);
      if (!template) return null;

      let output = template.format;
      Object.entries(data).forEach(([key, value]) => {
        output = output.replace(new RegExp(`{{${key}}}`, "g"), value);
      });

      return {
        system: template.system,
        prompt: output,
      };
    }

    // ═════════════════════════════════════════════════════════════════
    // CALIBRATION
    // ═════════════════════════════════════════════════════════════════

    updateCalibration(key, value) {
      if (key in this.calibrations) {
        this.calibrations[key] = parseFloat(value);
        this.saveData();
        this.updateUI();
      }
    }

    getCalibrationPreset(name) {
      const presets = {
        creative: {
          temperature: 0.9,
          topP: 0.95,
          frequencyPenalty: 0.3,
          presencePenalty: 0.3,
        },
        balanced: {
          temperature: 0.7,
          topP: 0.9,
          frequencyPenalty: 0.0,
          presencePenalty: 0.0,
        },
        precise: {
          temperature: 0.3,
          topP: 0.8,
          frequencyPenalty: 0.0,
          presencePenalty: 0.0,
        },
        deterministic: {
          temperature: 0.0,
          topP: 1.0,
          frequencyPenalty: 0.0,
          presencePenalty: 0.0,
        },
      };
      return presets[name] || presets["balanced"];
    }

    applyCalibrationPreset(name) {
      const preset = this.getCalibrationPreset(name);
      this.calibrations = { ...this.calibrations, ...preset };
      this.saveData();
      this.updateUI();
    }

    // ═════════════════════════════════════════════════════════════════
    // UI
    // ═════════════════════════════════════════════════════════════════

    createUI() {
      const panel = document.createElement("div");
      panel.id = "bael-finetune-panel";
      panel.className = "bael-finetune-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;
    }

    renderPanel() {
      return `
                <div class="ft-header">
                    <div class="ft-title">
                        <span class="ft-icon">🎯</span>
                        <span>Model Fine-Tuning</span>
                    </div>
                    <button class="ft-close" id="ft-close">×</button>
                </div>

                <div class="ft-tabs">
                    <button class="ft-tab ${this.activeTab === "datasets" ? "active" : ""}" data-tab="datasets">
                        📊 Datasets
                    </button>
                    <button class="ft-tab ${this.activeTab === "training" ? "active" : ""}" data-tab="training">
                        ⚡ Training
                    </button>
                    <button class="ft-tab ${this.activeTab === "templates" ? "active" : ""}" data-tab="templates">
                        📝 Templates
                    </button>
                    <button class="ft-tab ${this.activeTab === "calibration" ? "active" : ""}" data-tab="calibration">
                        🎛️ Calibration
                    </button>
                </div>

                <div class="ft-content">
                    ${this.renderTabContent()}
                </div>
            `;
    }

    renderTabContent() {
      switch (this.activeTab) {
        case "datasets":
          return this.renderDatasetsTab();
        case "training":
          return this.renderTrainingTab();
        case "templates":
          return this.renderTemplatesTab();
        case "calibration":
          return this.renderCalibrationTab();
        default:
          return "";
      }
    }

    renderDatasetsTab() {
      const datasetsList = Array.from(this.datasets.values());
      const activeDs = this.datasets.get(this.activeDataset);

      return `
                <div class="ft-section">
                    <div class="ft-actions">
                        <button class="ft-btn primary" id="ft-new-dataset">+ New Dataset</button>
                        <button class="ft-btn" id="ft-import-dataset">📥 Import</button>
                    </div>

                    <div class="ft-grid">
                        <div class="ft-list">
                            <h4>Datasets (${datasetsList.length})</h4>
                            ${
                              datasetsList.length === 0
                                ? `
                                <p class="ft-empty">No datasets yet</p>
                            `
                                : `
                                ${datasetsList
                                  .map(
                                    (ds) => `
                                    <div class="ft-item ${ds.id === this.activeDataset ? "active" : ""}"
                                         data-id="${ds.id}">
                                        <div class="ft-item-info">
                                            <span class="ft-item-name">${ds.name}</span>
                                            <span class="ft-item-meta">
                                                ${ds.statistics.entryCount} entries • ${ds.statistics.totalTokens} tokens
                                            </span>
                                        </div>
                                        <div class="ft-item-actions">
                                            <button class="ft-item-btn export-ds" data-id="${ds.id}">📤</button>
                                            <button class="ft-item-btn delete-ds" data-id="${ds.id}">🗑️</button>
                                        </div>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            `
                            }
                        </div>

                        ${
                          activeDs
                            ? `
                            <div class="ft-detail">
                                <h4>${activeDs.name}</h4>
                                <p>${activeDs.description || "No description"}</p>

                                <div class="ft-stats">
                                    <div class="ft-stat">
                                        <span class="ft-stat-value">${activeDs.statistics.entryCount}</span>
                                        <span class="ft-stat-label">Entries</span>
                                    </div>
                                    <div class="ft-stat">
                                        <span class="ft-stat-value">${activeDs.statistics.totalTokens}</span>
                                        <span class="ft-stat-label">Tokens</span>
                                    </div>
                                    <div class="ft-stat">
                                        <span class="ft-stat-value">${activeDs.statistics.avgTokens}</span>
                                        <span class="ft-stat-label">Avg/Entry</span>
                                    </div>
                                </div>

                                <button class="ft-btn" id="ft-add-entry">+ Add Entry</button>

                                <div class="ft-entries">
                                    ${activeDs.entries
                                      .slice(0, 10)
                                      .map(
                                        (e) => `
                                        <div class="ft-entry">
                                            <div class="ft-entry-content">
                                                <strong>Instruction:</strong> ${(e.instruction || "").substring(0, 100)}...<br>
                                                <strong>Output:</strong> ${(e.output || "").substring(0, 100)}...
                                            </div>
                                            <button class="ft-entry-del" data-id="${e.id}">×</button>
                                        </div>
                                    `,
                                      )
                                      .join("")}
                                    ${
                                      activeDs.entries.length > 10
                                        ? `
                                        <p class="ft-more">And ${activeDs.entries.length - 10} more entries...</p>
                                    `
                                        : ""
                                    }
                                </div>
                            </div>
                        `
                            : `
                            <div class="ft-detail ft-empty-detail">
                                Select a dataset to view details
                            </div>
                        `
                        }
                    </div>
                </div>
            `;
    }

    renderTrainingTab() {
      const jobs = Array.from(this.trainingJobs.values()).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      return `
                <div class="ft-section">
                    <button class="ft-btn primary" id="ft-new-training">🚀 Start Training Job</button>

                    <div class="ft-jobs">
                        ${
                          jobs.length === 0
                            ? `
                            <p class="ft-empty">No training jobs yet</p>
                        `
                            : `
                            ${jobs
                              .map(
                                (job) => `
                                <div class="ft-job ${job.status}">
                                    <div class="ft-job-header">
                                        <span class="ft-job-model">${job.baseModel}</span>
                                        <span class="ft-job-status">${job.status}</span>
                                    </div>
                                    <div class="ft-job-progress">
                                        <div class="ft-progress-bar">
                                            <div class="ft-progress-fill" style="width: ${job.progress}%"></div>
                                        </div>
                                        <span class="ft-progress-text">${Math.round(job.progress)}%</span>
                                    </div>
                                    <div class="ft-job-meta">
                                        Epochs: ${job.epochs} • Batch: ${job.batchSize} • LR: ${job.learningRate}
                                    </div>
                                    <div class="ft-job-actions">
                                        ${
                                          job.status === "pending"
                                            ? `
                                            <button class="ft-btn start-job" data-id="${job.id}">▶ Start</button>
                                        `
                                            : ""
                                        }
                                        ${
                                          job.status === "running"
                                            ? `
                                            <button class="ft-btn cancel-job" data-id="${job.id}">⏹ Cancel</button>
                                        `
                                            : ""
                                        }
                                    </div>
                                    <div class="ft-job-logs">
                                        ${job.logs
                                          .slice(-5)
                                          .map(
                                            (log) => `
                                            <div class="ft-log">${new Date(log.time).toLocaleTimeString()}: ${log.message}</div>
                                        `,
                                          )
                                          .join("")}
                                    </div>
                                </div>
                            `,
                              )
                              .join("")}
                        `
                        }
                    </div>
                </div>
            `;
    }

    renderTemplatesTab() {
      const templatesList = Array.from(this.templates.values());

      return `
                <div class="ft-section">
                    <button class="ft-btn primary" id="ft-new-template">+ New Template</button>

                    <div class="ft-templates">
                        ${templatesList
                          .map(
                            (t) => `
                            <div class="ft-template">
                                <div class="ft-template-header">
                                    <span class="ft-template-name">${t.name}</span>
                                    ${
                                      !t.id.startsWith("tpl_")
                                        ? ""
                                        : `
                                        <button class="ft-template-del" data-id="${t.id}">🗑️</button>
                                    `
                                    }
                                </div>
                                <div class="ft-template-system">${t.system}</div>
                                <pre class="ft-template-format">${this.escapeHtml(t.format)}</pre>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
            `;
    }

    renderCalibrationTab() {
      return `
                <div class="ft-section">
                    <h4>Response Calibration</h4>
                    <p class="ft-desc">Adjust model behavior parameters</p>

                    <div class="ft-presets">
                        <button class="ft-preset" data-preset="creative">🎨 Creative</button>
                        <button class="ft-preset" data-preset="balanced">⚖️ Balanced</button>
                        <button class="ft-preset" data-preset="precise">🎯 Precise</button>
                        <button class="ft-preset" data-preset="deterministic">🔒 Deterministic</button>
                    </div>

                    <div class="ft-sliders">
                        <div class="ft-slider">
                            <label>
                                <span>Temperature</span>
                                <span class="ft-slider-value">${this.calibrations.temperature}</span>
                            </label>
                            <input type="range" min="0" max="2" step="0.1"
                                   value="${this.calibrations.temperature}"
                                   data-key="temperature">
                            <div class="ft-slider-desc">Controls randomness. Lower = more focused, higher = more creative</div>
                        </div>

                        <div class="ft-slider">
                            <label>
                                <span>Top P</span>
                                <span class="ft-slider-value">${this.calibrations.topP}</span>
                            </label>
                            <input type="range" min="0" max="1" step="0.05"
                                   value="${this.calibrations.topP}"
                                   data-key="topP">
                            <div class="ft-slider-desc">Nucleus sampling threshold</div>
                        </div>

                        <div class="ft-slider">
                            <label>
                                <span>Frequency Penalty</span>
                                <span class="ft-slider-value">${this.calibrations.frequencyPenalty}</span>
                            </label>
                            <input type="range" min="0" max="2" step="0.1"
                                   value="${this.calibrations.frequencyPenalty}"
                                   data-key="frequencyPenalty">
                            <div class="ft-slider-desc">Reduces repetition of frequently used tokens</div>
                        </div>

                        <div class="ft-slider">
                            <label>
                                <span>Presence Penalty</span>
                                <span class="ft-slider-value">${this.calibrations.presencePenalty}</span>
                            </label>
                            <input type="range" min="0" max="2" step="0.1"
                                   value="${this.calibrations.presencePenalty}"
                                   data-key="presencePenalty">
                            <div class="ft-slider-desc">Encourages new topics</div>
                        </div>

                        <div class="ft-slider">
                            <label>
                                <span>Max Tokens</span>
                                <span class="ft-slider-value">${this.calibrations.maxTokens}</span>
                            </label>
                            <input type="range" min="256" max="8192" step="256"
                                   value="${this.calibrations.maxTokens}"
                                   data-key="maxTokens">
                            <div class="ft-slider-desc">Maximum response length</div>
                        </div>
                    </div>
                </div>
            `;
    }

    escapeHtml(text) {
      return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    updateUI() {
      if (!this.panel) return;
      this.panel.innerHTML = this.renderPanel();
      this.bindPanelEvents();
    }

    addStyles() {
      if (document.getElementById("bael-finetune-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-finetune-styles";
      styles.textContent = `
                .bael-finetune-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90vw;
                    max-width: 900px;
                    max-height: 85vh;
                    background: var(--color-panel, #0f0f17);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 20px;
                    z-index: 100072;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 50px 150px rgba(0,0,0,0.8);
                }

                .bael-finetune-panel.visible {
                    display: flex;
                    animation: ftIn 0.3s ease;
                }

                @keyframes ftIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .ft-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    border-bottom: 1px solid var(--color-border, #252535);
                }

                .ft-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 17px;
                    font-weight: 700;
                    color: var(--color-text, #fff);
                }

                .ft-icon { font-size: 22px; }

                .ft-close {
                    width: 36px;
                    height: 36px;
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted, #666);
                    font-size: 24px;
                    cursor: pointer;
                }

                .ft-tabs {
                    display: flex;
                    gap: 4px;
                    padding: 12px 24px;
                    border-bottom: 1px solid var(--color-border, #252535);
                    overflow-x: auto;
                }

                .ft-tab {
                    padding: 10px 16px;
                    background: transparent;
                    border: none;
                    border-radius: 8px;
                    color: var(--color-text-muted, #888);
                    font-size: 13px;
                    cursor: pointer;
                    white-space: nowrap;
                }

                .ft-tab.active {
                    background: var(--color-surface, #181820);
                    color: var(--color-text, #fff);
                }

                .ft-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px 24px;
                }

                .ft-section { margin-bottom: 20px; }
                .ft-section h4 {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--color-text, #fff);
                    margin-bottom: 12px;
                }

                .ft-actions {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 20px;
                }

                .ft-btn {
                    padding: 10px 16px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 8px;
                    color: var(--color-text, #fff);
                    font-size: 13px;
                    cursor: pointer;
                }

                .ft-btn.primary {
                    background: var(--color-primary, #ff3366);
                    border-color: transparent;
                }

                .ft-grid {
                    display: grid;
                    grid-template-columns: 300px 1fr;
                    gap: 20px;
                }

                @media (max-width: 768px) {
                    .ft-grid { grid-template-columns: 1fr; }
                }

                .ft-list h4 {
                    font-size: 12px;
                    color: var(--color-text-muted, #666);
                    margin-bottom: 10px;
                }

                .ft-empty {
                    text-align: center;
                    padding: 30px;
                    color: var(--color-text-muted, #555);
                    font-size: 13px;
                }

                .ft-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 10px;
                    margin-bottom: 8px;
                    cursor: pointer;
                }

                .ft-item.active {
                    border-color: var(--color-primary, #ff3366);
                    background: rgba(255,51,102,0.1);
                }

                .ft-item-name {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--color-text, #fff);
                }

                .ft-item-meta {
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                    display: block;
                    margin-top: 2px;
                }

                .ft-item-actions { display: flex; gap: 4px; }

                .ft-item-btn {
                    width: 28px;
                    height: 28px;
                    background: transparent;
                    border: none;
                    font-size: 12px;
                    cursor: pointer;
                    opacity: 0.6;
                }

                .ft-item-btn:hover { opacity: 1; }

                .ft-detail {
                    padding: 20px;
                    background: var(--color-surface, #181820);
                    border-radius: 12px;
                }

                .ft-empty-detail {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--color-text-muted, #555);
                }

                .ft-stats {
                    display: flex;
                    gap: 20px;
                    margin: 16px 0;
                }

                .ft-stat {
                    text-align: center;
                }

                .ft-stat-value {
                    display: block;
                    font-size: 24px;
                    font-weight: 700;
                    color: var(--color-primary, #ff3366);
                }

                .ft-stat-label {
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                }

                .ft-entries {
                    margin-top: 16px;
                    max-height: 300px;
                    overflow-y: auto;
                }

                .ft-entry {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px;
                    background: var(--color-panel, #12121a);
                    border-radius: 8px;
                    margin-bottom: 6px;
                    font-size: 11px;
                    color: var(--color-text-muted, #888);
                }

                .ft-entry-del {
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted, #666);
                    font-size: 14px;
                    cursor: pointer;
                }

                .ft-more {
                    text-align: center;
                    font-size: 11px;
                    color: var(--color-text-muted, #555);
                    padding: 10px;
                }

                /* Training Jobs */
                .ft-job {
                    padding: 16px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 12px;
                    margin-bottom: 12px;
                }

                .ft-job.running { border-color: #10b981; }
                .ft-job.completed { border-color: #6366f1; }
                .ft-job.cancelled { opacity: 0.6; }

                .ft-job-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 12px;
                }

                .ft-job-model {
                    font-weight: 600;
                    color: var(--color-text, #fff);
                }

                .ft-job-status {
                    font-size: 11px;
                    padding: 3px 8px;
                    border-radius: 20px;
                    background: var(--color-border, #333);
                    text-transform: capitalize;
                }

                .ft-job.running .ft-job-status { background: #10b981; color: #fff; }
                .ft-job.completed .ft-job-status { background: #6366f1; color: #fff; }

                .ft-job-progress {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 10px;
                }

                .ft-progress-bar {
                    flex: 1;
                    height: 6px;
                    background: var(--color-border, #333);
                    border-radius: 3px;
                    overflow: hidden;
                }

                .ft-progress-fill {
                    height: 100%;
                    background: var(--color-primary, #ff3366);
                    transition: width 0.3s ease;
                }

                .ft-progress-text {
                    font-size: 12px;
                    color: var(--color-text-muted, #888);
                    min-width: 40px;
                }

                .ft-job-meta {
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                    margin-bottom: 10px;
                }

                .ft-job-logs {
                    max-height: 100px;
                    overflow-y: auto;
                    font-family: monospace;
                    font-size: 10px;
                    color: var(--color-text-muted, #555);
                }

                .ft-log { padding: 2px 0; }

                /* Templates */
                .ft-template {
                    padding: 16px;
                    background: var(--color-surface, #181820);
                    border-radius: 12px;
                    margin-bottom: 12px;
                }

                .ft-template-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }

                .ft-template-name {
                    font-weight: 600;
                    color: var(--color-text, #fff);
                }

                .ft-template-del {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    opacity: 0.6;
                }

                .ft-template-system {
                    font-size: 12px;
                    color: var(--color-text-muted, #888);
                    margin-bottom: 10px;
                }

                .ft-template-format {
                    padding: 12px;
                    background: var(--color-panel, #12121a);
                    border-radius: 8px;
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                    overflow-x: auto;
                }

                /* Calibration */
                .ft-desc {
                    font-size: 13px;
                    color: var(--color-text-muted, #888);
                    margin-bottom: 20px;
                }

                .ft-presets {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                }

                .ft-preset {
                    padding: 10px 16px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 8px;
                    color: var(--color-text, #fff);
                    font-size: 12px;
                    cursor: pointer;
                }

                .ft-preset:hover {
                    border-color: var(--color-primary, #ff3366);
                }

                .ft-sliders { display: flex; flex-direction: column; gap: 24px; }

                .ft-slider label {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 13px;
                    color: var(--color-text, #fff);
                }

                .ft-slider-value {
                    color: var(--color-primary, #ff3366);
                    font-weight: 600;
                }

                .ft-slider input[type="range"] {
                    width: 100%;
                    height: 6px;
                    background: var(--color-border, #333);
                    border-radius: 3px;
                    appearance: none;
                }

                .ft-slider input[type="range"]::-webkit-slider-thumb {
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    background: var(--color-primary, #ff3366);
                    border-radius: 50%;
                    cursor: pointer;
                }

                .ft-slider-desc {
                    font-size: 11px;
                    color: var(--color-text-muted, #555);
                    margin-top: 6px;
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
        if (e.ctrlKey && e.shiftKey && e.key === "F") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    bindPanelEvents() {
      if (!this.panel) return;

      // Close
      this.panel
        .querySelector("#ft-close")
        ?.addEventListener("click", () => this.close());

      // Tab switching
      this.panel.querySelectorAll(".ft-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          this.activeTab = tab.dataset.tab;
          this.updateUI();
        });
      });

      // Dataset actions
      this.panel
        .querySelector("#ft-new-dataset")
        ?.addEventListener("click", () => {
          const name = prompt("Dataset name:");
          if (name) this.createDataset(name);
        });

      this.panel
        .querySelector("#ft-import-dataset")
        ?.addEventListener("click", () => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".json,.jsonl";
          input.onchange = (e) => {
            if (e.target.files[0]) this.importDataset(e.target.files[0]);
          };
          input.click();
        });

      this.panel.querySelectorAll(".ft-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          if (e.target.closest(".ft-item-actions")) return;
          this.activeDataset = item.dataset.id;
          this.updateUI();
        });
      });

      this.panel.querySelectorAll(".export-ds").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          this.exportDataset(btn.dataset.id);
        });
      });

      this.panel.querySelectorAll(".delete-ds").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (confirm("Delete this dataset?")) {
            this.deleteDataset(btn.dataset.id);
          }
        });
      });

      // Add entry
      this.panel
        .querySelector("#ft-add-entry")
        ?.addEventListener("click", () => {
          const instruction = prompt("Instruction/Prompt:");
          if (!instruction) return;
          const output = prompt("Expected Output:");
          if (output) {
            this.addDataEntry(this.activeDataset, { instruction, output });
          }
        });

      // Delete entry
      this.panel.querySelectorAll(".ft-entry-del").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.removeDataEntry(this.activeDataset, btn.dataset.id);
        });
      });

      // Training
      this.panel
        .querySelector("#ft-new-training")
        ?.addEventListener("click", () => {
          const datasets = Array.from(this.datasets.values());
          if (datasets.length === 0) {
            window.BaelNotifications?.show("Create a dataset first", "warning");
            return;
          }
          const job = this.createTrainingJob({
            datasetId: datasets[0].id,
            baseModel: "gpt-3.5-turbo",
            epochs: 3,
          });
          window.BaelNotifications?.show("Training job created", "success");
        });

      this.panel.querySelectorAll(".start-job").forEach((btn) => {
        btn.addEventListener("click", () => this.startTraining(btn.dataset.id));
      });

      this.panel.querySelectorAll(".cancel-job").forEach((btn) => {
        btn.addEventListener("click", () =>
          this.cancelTraining(btn.dataset.id),
        );
      });

      // Templates
      this.panel
        .querySelector("#ft-new-template")
        ?.addEventListener("click", () => {
          const name = prompt("Template name:");
          if (!name) return;
          const system = prompt("System message:");
          const format = prompt("Format (use {{instruction}} and {{input}}):");
          if (name && system && format) {
            this.createTemplate(name, system, format);
          }
        });

      this.panel.querySelectorAll(".ft-template-del").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (confirm("Delete template?")) {
            this.deleteTemplate(btn.dataset.id);
          }
        });
      });

      // Calibration presets
      this.panel.querySelectorAll(".ft-preset").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.applyCalibrationPreset(btn.dataset.preset);
          window.BaelNotifications?.show(
            `Applied ${btn.dataset.preset} preset`,
            "success",
          );
        });
      });

      // Calibration sliders
      this.panel.querySelectorAll(".ft-slider input").forEach((input) => {
        input.addEventListener("input", (e) => {
          const key = e.target.dataset.key;
          const value = parseFloat(e.target.value);
          this.calibrations[key] = value;
          e.target.parentElement.querySelector(".ft-slider-value").textContent =
            value;
        });

        input.addEventListener("change", (e) => {
          this.saveData();
        });
      });
    }

    // ═════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═════════════════════════════════════════════════════════════════

    loadData() {
      try {
        const datasets = JSON.parse(
          localStorage.getItem("bael_ft_datasets") || "{}",
        );
        Object.entries(datasets).forEach(([id, ds]) => {
          ds.createdAt = new Date(ds.createdAt);
          this.datasets.set(id, ds);
        });

        const jobs = JSON.parse(localStorage.getItem("bael_ft_jobs") || "{}");
        Object.entries(jobs).forEach(([id, job]) => {
          job.createdAt = new Date(job.createdAt);
          this.trainingJobs.set(id, job);
        });

        const templates = JSON.parse(
          localStorage.getItem("bael_ft_templates") || "{}",
        );
        Object.entries(templates).forEach(([id, t]) =>
          this.templates.set(id, t),
        );

        const calibrations = JSON.parse(
          localStorage.getItem("bael_ft_calibrations") || "{}",
        );
        this.calibrations = { ...this.calibrations, ...calibrations };
      } catch (e) {
        console.warn("Failed to load fine-tuning data:", e);
      }
    }

    saveData() {
      localStorage.setItem(
        "bael_ft_datasets",
        JSON.stringify(Object.fromEntries(this.datasets)),
      );
      localStorage.setItem(
        "bael_ft_jobs",
        JSON.stringify(Object.fromEntries(this.trainingJobs)),
      );
      localStorage.setItem(
        "bael_ft_templates",
        JSON.stringify(Object.fromEntries(this.templates)),
      );
      localStorage.setItem(
        "bael_ft_calibrations",
        JSON.stringify(this.calibrations),
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
      this.isVisible ? this.close() : this.open();
    }
  }

  window.BaelFineTuning = new BaelFineTuning();
})();
