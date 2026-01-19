/**
 * BAEL Documentation System - Interactive Help & Documentation
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete documentation system with:
 * - Interactive feature guides
 * - Keyboard shortcut reference
 * - System component documentation
 * - Searchable help system
 * - Quick tips and tutorials
 * - Version changelog
 */

(function () {
  "use strict";

  class BaelDocumentation {
    constructor() {
      this.docs = new Map();
      this.searchIndex = [];
      this.currentDoc = null;
      this.history = [];
      this.historyIndex = -1;
      this.init();
    }

    init() {
      this.registerDocs();
      this.buildSearchIndex();
      this.createUI();
      this.addStyles();
      this.bindEvents();
      console.log("📚 Bael Documentation initialized");
    }

    // Documentation Registry
    registerDocs() {
      // Getting Started
      this.addDoc("getting-started", {
        title: "Getting Started",
        category: "Basics",
        icon: "🚀",
        content: `
                    <h2>Welcome to Bael - Lord Of All</h2>
                    <p>Bael is an advanced AI interface framework built on top of Agent Zero, providing a powerful and customizable experience for AI interactions.</p>

                    <h3>Quick Start</h3>
                    <ol>
                        <li><strong>Open Command Palette:</strong> Press <kbd>Ctrl</kbd>+<kbd>K</kbd> to access quick commands</li>
                        <li><strong>Start a Chat:</strong> Type your message in the input box and press Enter</li>
                        <li><strong>Use Personas:</strong> Press <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd> to select an AI persona</li>
                        <li><strong>Check Settings:</strong> Click the settings icon or press <kbd>Ctrl</kbd>+<kbd>,</kbd></li>
                    </ol>

                    <h3>Key Features</h3>
                    <ul>
                        <li><strong>Multi-Model Support:</strong> Switch between different AI models seamlessly</li>
                        <li><strong>Personas:</strong> Customize AI personality and behavior</li>
                        <li><strong>Workflows:</strong> Create automated task sequences</li>
                        <li><strong>Knowledge Graph:</strong> Visualize and explore information</li>
                        <li><strong>Offline Mode:</strong> Work without an internet connection</li>
                    </ul>

                    <div class="doc-tip">
                        <strong>💡 Tip:</strong> Press <kbd>F1</kbd> at any time to open this help panel.
                    </div>
                `,
      });

      // Keyboard Shortcuts
      this.addDoc("keyboard-shortcuts", {
        title: "Keyboard Shortcuts",
        category: "Reference",
        icon: "⌨️",
        content: `
                    <h2>Keyboard Shortcuts</h2>
                    <p>Master these shortcuts to boost your productivity.</p>

                    <h3>General</h3>
                    <table class="shortcuts-table">
                        <tr><td><kbd>F1</kbd></td><td>Open Help / Documentation</td></tr>
                        <tr><td><kbd>Ctrl</kbd>+<kbd>K</kbd></td><td>Quick Actions / Command Palette</td></tr>
                        <tr><td><kbd>Ctrl</kbd>+<kbd>,</kbd></td><td>Open Settings</td></tr>
                        <tr><td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd></td><td>Toggle Theme</td></tr>
                        <tr><td><kbd>Escape</kbd></td><td>Close current panel/modal</td></tr>
                    </table>

                    <h3>Chat & Messages</h3>
                    <table class="shortcuts-table">
                        <tr><td><kbd>Enter</kbd></td><td>Send message</td></tr>
                        <tr><td><kbd>Shift</kbd>+<kbd>Enter</kbd></td><td>New line in message</td></tr>
                        <tr><td><kbd>Ctrl</kbd>+<kbd>L</kbd></td><td>Clear chat history</td></tr>
                        <tr><td><kbd>Ctrl</kbd>+<kbd>N</kbd></td><td>New chat session</td></tr>
                        <tr><td><kbd>↑</kbd></td><td>Edit last message (when input is empty)</td></tr>
                    </table>

                    <h3>Features</h3>
                    <table class="shortcuts-table">
                        <tr><td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd></td><td>Persona System</td></tr>
                        <tr><td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd></td><td>Session Recorder</td></tr>
                        <tr><td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Y</kbd></td><td>Chat Analytics</td></tr>
                        <tr><td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd></td><td>Performance Monitor</td></tr>
                        <tr><td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd></td><td>Test Suite</td></tr>
                        <tr><td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>X</kbd></td><td>Context Manager</td></tr>
                        <tr><td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>W</kbd></td><td>Workflow Engine</td></tr>
                        <tr><td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>K</kbd></td><td>Knowledge Graph</td></tr>
                    </table>

                    <h3>Navigation</h3>
                    <table class="shortcuts-table">
                        <tr><td><kbd>Ctrl</kbd>+<kbd>1-9</kbd></td><td>Switch to chat tab 1-9</td></tr>
                        <tr><td><kbd>Ctrl</kbd>+<kbd>Tab</kbd></td><td>Next chat tab</td></tr>
                        <tr><td><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>Tab</kbd></td><td>Previous chat tab</td></tr>
                    </table>
                `,
      });

      // Personas
      this.addDoc("personas", {
        title: "AI Personas",
        category: "Features",
        icon: "🎭",
        content: `
                    <h2>AI Personas</h2>
                    <p>Personas allow you to customize the AI's personality, communication style, and expertise areas.</p>

                    <h3>Built-in Personas</h3>
                    <ul>
                        <li><strong>General Assistant:</strong> Balanced, helpful for everyday tasks</li>
                        <li><strong>Expert Coder:</strong> Technical, precise, code-focused</li>
                        <li><strong>Creative Writer:</strong> Imaginative, expressive, storytelling</li>
                        <li><strong>Research Analyst:</strong> Thorough, analytical, fact-based</li>
                        <li><strong>Patient Tutor:</strong> Educational, encouraging, step-by-step</li>
                        <li><strong>Business Strategist:</strong> Professional, strategic, goal-oriented</li>
                    </ul>

                    <h3>Creating Custom Personas</h3>
                    <ol>
                        <li>Open Persona System (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>A</kbd>)</li>
                        <li>Click "Create New Persona"</li>
                        <li>Configure personality traits:</li>
                        <ul>
                            <li><strong>Communication:</strong> Formal ↔ Casual</li>
                            <li><strong>Detail Level:</strong> Concise ↔ Detailed</li>
                            <li><strong>Tone:</strong> Serious ↔ Playful</li>
                        </ul>
                        <li>Set expertise areas and system prompt</li>
                        <li>Save and activate</li>
                    </ol>

                    <div class="doc-tip">
                        <strong>💡 Tip:</strong> Personas persist across sessions and can be exported/imported.
                    </div>
                `,
      });

      // Workflows
      this.addDoc("workflows", {
        title: "Workflow Engine",
        category: "Features",
        icon: "⚡",
        content: `
                    <h2>Workflow Engine</h2>
                    <p>Create automated sequences of tasks that the AI can execute in order.</p>

                    <h3>Workflow Components</h3>
                    <ul>
                        <li><strong>Triggers:</strong> What starts the workflow (manual, scheduled, event-based)</li>
                        <li><strong>Actions:</strong> Tasks to perform (prompts, API calls, file operations)</li>
                        <li><strong>Conditions:</strong> Branch logic based on previous results</li>
                        <li><strong>Variables:</strong> Store and pass data between steps</li>
                    </ul>

                    <h3>Creating a Workflow</h3>
                    <ol>
                        <li>Open Workflow Engine (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>W</kbd>)</li>
                        <li>Click "New Workflow"</li>
                        <li>Add steps by clicking the + button</li>
                        <li>Configure each step's action and parameters</li>
                        <li>Connect steps to define execution order</li>
                        <li>Save and test your workflow</li>
                    </ol>

                    <h3>Example Workflows</h3>
                    <ul>
                        <li><strong>Daily Summary:</strong> Collect updates → Summarize → Send notification</li>
                        <li><strong>Code Review:</strong> Get code → Analyze → Generate report</li>
                        <li><strong>Research Pipeline:</strong> Search → Extract → Synthesize → Format</li>
                    </ul>
                `,
      });

      // Knowledge Graph
      this.addDoc("knowledge-graph", {
        title: "Knowledge Graph",
        category: "Features",
        icon: "🕸️",
        content: `
                    <h2>Knowledge Graph</h2>
                    <p>Visualize and explore relationships between concepts, topics, and information.</p>

                    <h3>Graph Elements</h3>
                    <ul>
                        <li><strong>Nodes:</strong> Individual concepts, topics, or entities</li>
                        <li><strong>Edges:</strong> Relationships connecting nodes</li>
                        <li><strong>Clusters:</strong> Groups of related nodes</li>
                        <li><strong>Labels:</strong> Descriptive tags on relationships</li>
                    </ul>

                    <h3>Navigation</h3>
                    <ul>
                        <li><strong>Pan:</strong> Click and drag on empty space</li>
                        <li><strong>Zoom:</strong> Scroll wheel or pinch gesture</li>
                        <li><strong>Select:</strong> Click on a node</li>
                        <li><strong>Expand:</strong> Double-click to show related nodes</li>
                        <li><strong>Details:</strong> Right-click for node options</li>
                    </ul>

                    <h3>Building Your Graph</h3>
                    <ol>
                        <li>Add nodes manually or from chat context</li>
                        <li>Connect related concepts with edges</li>
                        <li>Label relationships for clarity</li>
                        <li>Organize nodes into clusters</li>
                        <li>Export graph as image or JSON</li>
                    </ol>
                `,
      });

      // Multi-Model Router
      this.addDoc("multi-model", {
        title: "Multi-Model Router",
        category: "Features",
        icon: "🔀",
        content: `
                    <h2>Multi-Model Router</h2>
                    <p>Seamlessly switch between different AI models based on task requirements.</p>

                    <h3>Supported Providers</h3>
                    <ul>
                        <li><strong>OpenAI:</strong> GPT-4, GPT-4 Turbo, GPT-3.5 Turbo</li>
                        <li><strong>Anthropic:</strong> Claude 3 Opus, Sonnet, Haiku</li>
                        <li><strong>Google:</strong> Gemini Pro, Gemini Ultra</li>
                        <li><strong>Local:</strong> Ollama, LM Studio, vLLM</li>
                    </ul>

                    <h3>Routing Modes</h3>
                    <ul>
                        <li><strong>Manual:</strong> Explicitly select model per request</li>
                        <li><strong>Auto:</strong> Router selects best model for task</li>
                        <li><strong>Cost-Optimized:</strong> Prefer cheaper models when possible</li>
                        <li><strong>Quality-First:</strong> Always use highest capability model</li>
                        <li><strong>Fallback Chain:</strong> Try models in order until success</li>
                    </ul>

                    <h3>Configuration</h3>
                    <ol>
                        <li>Add API keys in Settings → API Keys</li>
                        <li>Configure model priorities in Router settings</li>
                        <li>Set cost limits and usage quotas</li>
                        <li>Define routing rules for different task types</li>
                    </ol>
                `,
      });

      // Cost Tracker
      this.addDoc("cost-tracker", {
        title: "Cost Tracker",
        category: "Features",
        icon: "💰",
        content: `
                    <h2>Cost Tracker</h2>
                    <p>Monitor and manage your AI API usage and costs.</p>

                    <h3>Metrics Tracked</h3>
                    <ul>
                        <li><strong>Token Usage:</strong> Input and output tokens per request</li>
                        <li><strong>Request Count:</strong> Number of API calls</li>
                        <li><strong>Cost:</strong> Estimated USD cost per model</li>
                        <li><strong>Trends:</strong> Daily, weekly, monthly usage patterns</li>
                    </ul>

                    <h3>Budget Controls</h3>
                    <ul>
                        <li><strong>Daily Limit:</strong> Maximum spend per day</li>
                        <li><strong>Monthly Cap:</strong> Total monthly budget</li>
                        <li><strong>Alerts:</strong> Notifications at threshold levels</li>
                        <li><strong>Auto-Stop:</strong> Pause usage when limit reached</li>
                    </ul>

                    <h3>Optimization Tips</h3>
                    <ul>
                        <li>Use shorter prompts when possible</li>
                        <li>Enable prompt caching for repeated queries</li>
                        <li>Use cheaper models for simple tasks</li>
                        <li>Set max tokens appropriately</li>
                    </ul>
                `,
      });

      // Offline Mode
      this.addDoc("offline-mode", {
        title: "Offline Mode",
        category: "Features",
        icon: "📴",
        content: `
                    <h2>Offline Mode</h2>
                    <p>Continue working even without an internet connection.</p>

                    <h3>Available Offline</h3>
                    <ul>
                        <li>✅ Previously loaded conversations</li>
                        <li>✅ Local knowledge base search</li>
                        <li>✅ Cached responses and templates</li>
                        <li>✅ Draft messages (synced when online)</li>
                        <li>✅ Settings and preferences</li>
                    </ul>

                    <h3>Requires Connection</h3>
                    <ul>
                        <li>❌ New AI model requests</li>
                        <li>❌ Real-time collaboration</li>
                        <li>❌ External API integrations</li>
                        <li>❌ Cloud sync</li>
                    </ul>

                    <h3>Local Models</h3>
                    <p>For full offline AI capability, configure a local model:</p>
                    <ol>
                        <li>Install Ollama or LM Studio</li>
                        <li>Download a model (e.g., Llama 3, Mistral)</li>
                        <li>Configure in Settings → Models → Local</li>
                        <li>Set as fallback or primary model</li>
                    </ol>
                `,
      });

      // Session Recording
      this.addDoc("session-recording", {
        title: "Session Recording",
        category: "Features",
        icon: "🎬",
        content: `
                    <h2>Session Recording</h2>
                    <p>Record, replay, and share your interaction sessions.</p>

                    <h3>What Gets Recorded</h3>
                    <ul>
                        <li>All messages sent and received</li>
                        <li>User interactions (clicks, inputs)</li>
                        <li>UI state changes</li>
                        <li>Timestamps for each event</li>
                    </ul>

                    <h3>Recording Controls</h3>
                    <ul>
                        <li><strong>Start:</strong> Begin a new recording</li>
                        <li><strong>Pause/Resume:</strong> Temporarily stop recording</li>
                        <li><strong>Bookmark:</strong> Mark important moments</li>
                        <li><strong>Stop:</strong> End and save recording</li>
                    </ul>

                    <h3>Playback Features</h3>
                    <ul>
                        <li>Timeline scrubbing</li>
                        <li>Speed control (0.5x, 1x, 2x, 5x)</li>
                        <li>Jump to bookmarks</li>
                        <li>Visual interaction indicators</li>
                    </ul>

                    <h3>Export & Share</h3>
                    <p>Export recordings as JSON files that can be imported into any Bael instance.</p>
                `,
      });

      // Context Manager
      this.addDoc("context-manager", {
        title: "Context Manager",
        category: "Features",
        icon: "📋",
        content: `
                    <h2>Context Manager</h2>
                    <p>Manage and optimize the context sent to AI models.</p>

                    <h3>Context Components</h3>
                    <ul>
                        <li><strong>System Prompt:</strong> Base instructions for the AI</li>
                        <li><strong>Conversation History:</strong> Previous messages</li>
                        <li><strong>Attached Files:</strong> Documents, code, images</li>
                        <li><strong>Knowledge Snippets:</strong> Relevant information</li>
                        <li><strong>Variables:</strong> Dynamic values</li>
                    </ul>

                    <h3>Context Optimization</h3>
                    <ul>
                        <li><strong>Summarization:</strong> Compress long conversations</li>
                        <li><strong>Prioritization:</strong> Keep most relevant context</li>
                        <li><strong>Truncation:</strong> Remove oldest messages first</li>
                        <li><strong>Chunking:</strong> Split large documents</li>
                    </ul>

                    <h3>Token Budget</h3>
                    <p>Monitor and control context size:</p>
                    <ul>
                        <li>View current token usage</li>
                        <li>Set maximum context size</li>
                        <li>Reserve tokens for response</li>
                        <li>Auto-compress when near limit</li>
                    </ul>
                `,
      });

      // Troubleshooting
      this.addDoc("troubleshooting", {
        title: "Troubleshooting",
        category: "Support",
        icon: "🔧",
        content: `
                    <h2>Troubleshooting</h2>
                    <p>Solutions for common issues.</p>

                    <h3>Connection Issues</h3>
                    <div class="doc-issue">
                        <strong>Problem:</strong> "Connection failed" error
                        <br><strong>Solutions:</strong>
                        <ul>
                            <li>Check your internet connection</li>
                            <li>Verify API keys are correct</li>
                            <li>Check if the AI provider is up</li>
                            <li>Try a different model/provider</li>
                        </ul>
                    </div>

                    <h3>Performance Issues</h3>
                    <div class="doc-issue">
                        <strong>Problem:</strong> Interface is slow or laggy
                        <br><strong>Solutions:</strong>
                        <ul>
                            <li>Clear chat history (Ctrl+L)</li>
                            <li>Reduce context window size</li>
                            <li>Disable unnecessary features</li>
                            <li>Check Performance Monitor (Ctrl+Shift+P)</li>
                        </ul>
                    </div>

                    <h3>Data Issues</h3>
                    <div class="doc-issue">
                        <strong>Problem:</strong> Settings or data not saving
                        <br><strong>Solutions:</strong>
                        <ul>
                            <li>Check browser storage quota</li>
                            <li>Clear cache and try again</li>
                            <li>Export data as backup</li>
                            <li>Check for browser extensions blocking storage</li>
                        </ul>
                    </div>

                    <h3>Reset to Defaults</h3>
                    <p>To completely reset Bael:</p>
                    <ol>
                        <li>Open browser Developer Tools (F12)</li>
                        <li>Go to Application → Storage</li>
                        <li>Clear Local Storage for this site</li>
                        <li>Refresh the page</li>
                    </ol>
                `,
      });

      // Changelog
      this.addDoc("changelog", {
        title: "Changelog",
        category: "About",
        icon: "📝",
        content: `
                    <h2>Changelog</h2>

                    <div class="changelog-version">
                        <h3>Version 7.0 - Testing & Performance</h3>
                        <span class="version-date">Latest</span>
                        <ul>
                            <li>🧪 Comprehensive test suite with unit and integration tests</li>
                            <li>📊 Real-time performance monitoring</li>
                            <li>📚 Interactive documentation system</li>
                            <li>🔧 Performance optimizations</li>
                        </ul>
                    </div>

                    <div class="changelog-version">
                        <h3>Version 6.0 - Extensibility</h3>
                        <ul>
                            <li>🎭 AI Persona System</li>
                            <li>🎬 Session Recording & Playback</li>
                            <li>📊 Chat Analytics Dashboard</li>
                            <li>✨ Response Formatter with syntax highlighting</li>
                            <li>📋 Context Manager</li>
                            <li>⚡ Workflow Engine</li>
                            <li>🔌 Plugin Manager</li>
                            <li>🔐 API Key Manager</li>
                            <li>💾 Backup System</li>
                            <li>🕸️ Knowledge Graph</li>
                        </ul>
                    </div>

                    <div class="changelog-version">
                        <h3>Version 5.0 - Infrastructure</h3>
                        <ul>
                            <li>🔀 Multi-Model Router</li>
                            <li>💰 Cost Tracker</li>
                            <li>📅 Task Scheduler</li>
                            <li>📴 Offline Controller</li>
                            <li>📈 Analytics Dashboard</li>
                            <li>📱 Mobile Layout</li>
                            <li>⚙️ Master Controller</li>
                        </ul>
                    </div>

                    <div class="changelog-version">
                        <h3>Earlier Versions</h3>
                        <ul>
                            <li>Phase 1-4: Core systems, themes, settings, UI components</li>
                            <li>76+ Bael systems implemented</li>
                            <li>Heisenberg cognitive modules</li>
                            <li>Quantum processing integration</li>
                        </ul>
                    </div>
                `,
      });
    }

    addDoc(id, doc) {
      this.docs.set(id, { id, ...doc });
    }

    buildSearchIndex() {
      this.searchIndex = [];
      for (const [id, doc] of this.docs) {
        // Extract text content from HTML
        const text = doc.content.replace(/<[^>]*>/g, " ").toLowerCase();
        this.searchIndex.push({
          id,
          title: doc.title,
          category: doc.category,
          text,
        });
      }
    }

    search(query) {
      const q = query.toLowerCase().trim();
      if (!q) return [];

      return this.searchIndex
        .filter(
          (item) =>
            item.title.toLowerCase().includes(q) || item.text.includes(q),
        )
        .map((item) => ({
          ...this.docs.get(item.id),
          score: item.title.toLowerCase().includes(q) ? 2 : 1,
        }))
        .sort((a, b) => b.score - a.score);
    }

    // UI Creation
    createUI() {
      this.panel = document.createElement("div");
      this.panel.id = "bael-docs-panel";
      this.panel.innerHTML = `
                <div class="bael-docs-header">
                    <h3>📚 Bael Documentation</h3>
                    <div class="docs-nav-btns">
                        <button class="nav-back" disabled title="Back">←</button>
                        <button class="nav-forward" disabled title="Forward">→</button>
                    </div>
                    <button class="docs-close" title="Close">✕</button>
                </div>

                <div class="bael-docs-search">
                    <input type="text" placeholder="Search documentation..." />
                    <span class="search-icon">🔍</span>
                </div>

                <div class="bael-docs-body">
                    <div class="docs-sidebar">
                        <div class="docs-categories"></div>
                    </div>
                    <div class="docs-content">
                        <div class="docs-welcome">
                            <h2>📚 Bael Documentation</h2>
                            <p>Select a topic from the sidebar or search for help.</p>

                            <div class="quick-links">
                                <h3>Quick Links</h3>
                                <div class="quick-grid"></div>
                            </div>
                        </div>
                        <div class="docs-article" style="display:none;"></div>
                        <div class="docs-search-results" style="display:none;"></div>
                    </div>
                </div>
            `;

      document.body.appendChild(this.panel);
      this.renderSidebar();
      this.renderQuickLinks();
    }

    renderSidebar() {
      const categories = new Map();

      for (const doc of this.docs.values()) {
        if (!categories.has(doc.category)) {
          categories.set(doc.category, []);
        }
        categories.get(doc.category).push(doc);
      }

      const container = this.panel.querySelector(".docs-categories");
      container.innerHTML = "";

      for (const [category, docs] of categories) {
        const section = document.createElement("div");
        section.className = "docs-category";
        section.innerHTML = `
                    <div class="category-title">${category}</div>
                    <div class="category-items">
                        ${docs
                          .map(
                            (doc) => `
                            <div class="category-item" data-doc="${doc.id}">
                                <span class="item-icon">${doc.icon}</span>
                                <span class="item-title">${doc.title}</span>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                `;
        container.appendChild(section);
      }
    }

    renderQuickLinks() {
      const quickDocs = [
        "getting-started",
        "keyboard-shortcuts",
        "personas",
        "workflows",
      ];
      const grid = this.panel.querySelector(".quick-grid");

      grid.innerHTML = quickDocs
        .map((id) => {
          const doc = this.docs.get(id);
          if (!doc) return "";
          return `
                    <div class="quick-link" data-doc="${id}">
                        <span class="quick-icon">${doc.icon}</span>
                        <span class="quick-title">${doc.title}</span>
                    </div>
                `;
        })
        .join("");
    }

    addStyles() {
      const style = document.createElement("style");
      style.textContent = `
                #bael-docs-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.9);
                    width: 900px;
                    max-width: 95vw;
                    height: 80vh;
                    background: var(--bael-surface, #1e1e1e);
                    border: 1px solid var(--bael-border, #333);
                    border-radius: 12px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                    z-index: 100001;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    opacity: 0;
                    transition: opacity 0.3s, transform 0.3s;
                }

                #bael-docs-panel.visible {
                    display: flex;
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }

                .bael-docs-header {
                    display: flex;
                    align-items: center;
                    padding: 16px 20px;
                    background: var(--bael-bg-dark, #151515);
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .bael-docs-header h3 {
                    margin: 0;
                    flex: 1;
                    font-size: 16px;
                    color: var(--bael-text, #fff);
                }

                .docs-nav-btns {
                    display: flex;
                    gap: 4px;
                    margin-right: 16px;
                }

                .docs-nav-btns button {
                    background: var(--bael-surface, #252525);
                    border: 1px solid var(--bael-border, #333);
                    color: var(--bael-text, #fff);
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                }

                .docs-nav-btns button:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }

                .docs-close {
                    background: transparent;
                    border: none;
                    color: var(--bael-text, #fff);
                    font-size: 18px;
                    cursor: pointer;
                    padding: 4px 8px;
                }

                .bael-docs-search {
                    position: relative;
                    padding: 12px 20px;
                    background: var(--bael-bg-dark, #151515);
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .bael-docs-search input {
                    width: 100%;
                    padding: 10px 40px 10px 12px;
                    background: var(--bael-surface, #252525);
                    border: 1px solid var(--bael-border, #333);
                    border-radius: 6px;
                    color: var(--bael-text, #fff);
                    font-size: 14px;
                }

                .bael-docs-search .search-icon {
                    position: absolute;
                    right: 30px;
                    top: 50%;
                    transform: translateY(-50%);
                    opacity: 0.5;
                }

                .bael-docs-body {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }

                .docs-sidebar {
                    width: 240px;
                    border-right: 1px solid var(--bael-border, #333);
                    overflow-y: auto;
                    background: var(--bael-bg-dark, #151515);
                }

                .docs-category {
                    margin-bottom: 8px;
                }

                .category-title {
                    padding: 12px 16px 8px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    color: var(--bael-text-dim, #888);
                    letter-spacing: 0.5px;
                }

                .category-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 16px;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .category-item:hover {
                    background: rgba(255,255,255,0.05);
                }

                .category-item.active {
                    background: var(--bael-primary, #646cff);
                }

                .item-icon {
                    font-size: 14px;
                }

                .item-title {
                    font-size: 13px;
                    color: var(--bael-text, #fff);
                }

                .docs-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                }

                .docs-welcome h2 {
                    margin: 0 0 12px;
                    color: var(--bael-text, #fff);
                }

                .docs-welcome > p {
                    color: var(--bael-text-dim, #888);
                    margin-bottom: 32px;
                }

                .quick-links h3 {
                    font-size: 14px;
                    color: var(--bael-text, #fff);
                    margin-bottom: 16px;
                }

                .quick-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                .quick-link {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: var(--bael-bg-dark, #151515);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: background 0.2s, transform 0.2s;
                }

                .quick-link:hover {
                    background: var(--bael-primary, #646cff);
                    transform: translateY(-2px);
                }

                .quick-icon {
                    font-size: 24px;
                }

                .quick-title {
                    font-size: 14px;
                    color: var(--bael-text, #fff);
                    font-weight: 500;
                }

                /* Article Styles */
                .docs-article {
                    line-height: 1.6;
                }

                .docs-article h2 {
                    color: var(--bael-text, #fff);
                    margin: 0 0 16px;
                    font-size: 24px;
                }

                .docs-article h3 {
                    color: var(--bael-text, #fff);
                    margin: 24px 0 12px;
                    font-size: 18px;
                }

                .docs-article p {
                    color: var(--bael-text-dim, #ccc);
                    margin-bottom: 16px;
                }

                .docs-article ul, .docs-article ol {
                    color: var(--bael-text-dim, #ccc);
                    margin: 0 0 16px 20px;
                }

                .docs-article li {
                    margin-bottom: 8px;
                }

                .docs-article kbd {
                    display: inline-block;
                    padding: 3px 8px;
                    background: var(--bael-bg-dark, #151515);
                    border: 1px solid var(--bael-border, #444);
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 12px;
                    color: var(--bael-text, #fff);
                }

                .shortcuts-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 24px;
                }

                .shortcuts-table tr {
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .shortcuts-table td {
                    padding: 12px 8px;
                }

                .shortcuts-table td:first-child {
                    width: 200px;
                }

                .shortcuts-table td:last-child {
                    color: var(--bael-text-dim, #888);
                }

                .doc-tip {
                    background: rgba(100, 108, 255, 0.1);
                    border-left: 3px solid var(--bael-primary, #646cff);
                    padding: 12px 16px;
                    border-radius: 0 6px 6px 0;
                    margin: 16px 0;
                }

                .doc-issue {
                    background: var(--bael-bg-dark, #151515);
                    padding: 16px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                }

                .changelog-version {
                    margin-bottom: 24px;
                    padding-bottom: 24px;
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .changelog-version h3 {
                    display: inline;
                }

                .version-date {
                    background: var(--bael-primary, #646cff);
                    color: white;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    margin-left: 12px;
                }

                /* Search Results */
                .docs-search-results h3 {
                    color: var(--bael-text, #fff);
                    margin-bottom: 16px;
                }

                .search-result-item {
                    display: flex;
                    gap: 12px;
                    padding: 16px;
                    background: var(--bael-bg-dark, #151515);
                    border-radius: 8px;
                    margin-bottom: 8px;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .search-result-item:hover {
                    background: var(--bael-surface, #252525);
                }

                .search-result-icon {
                    font-size: 20px;
                }

                .search-result-info {
                    flex: 1;
                }

                .search-result-title {
                    color: var(--bael-text, #fff);
                    font-weight: 500;
                    margin-bottom: 4px;
                }

                .search-result-category {
                    font-size: 12px;
                    color: var(--bael-text-dim, #888);
                }
            `;
      document.head.appendChild(style);
    }

    bindEvents() {
      // Close button
      this.panel.querySelector(".docs-close").addEventListener("click", () => {
        this.close();
      });

      // Navigation
      this.panel.querySelector(".nav-back").addEventListener("click", () => {
        this.navigateBack();
      });

      this.panel.querySelector(".nav-forward").addEventListener("click", () => {
        this.navigateForward();
      });

      // Sidebar items
      this.panel
        .querySelector(".docs-categories")
        .addEventListener("click", (e) => {
          const item = e.target.closest(".category-item");
          if (item) {
            this.showDoc(item.dataset.doc);
          }
        });

      // Quick links
      this.panel.querySelector(".quick-grid").addEventListener("click", (e) => {
        const link = e.target.closest(".quick-link");
        if (link) {
          this.showDoc(link.dataset.doc);
        }
      });

      // Search
      const searchInput = this.panel.querySelector(".bael-docs-search input");
      let searchTimeout;
      searchInput.addEventListener("input", () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          this.performSearch(searchInput.value);
        }, 300);
      });

      // Search result clicks
      this.panel
        .querySelector(".docs-search-results")
        .addEventListener("click", (e) => {
          const item = e.target.closest(".search-result-item");
          if (item) {
            searchInput.value = "";
            this.showDoc(item.dataset.doc);
          }
        });

      // Keyboard shortcuts
      document.addEventListener("keydown", (e) => {
        if (e.key === "F1") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape" && this.isVisible) {
          this.close();
        }
      });
    }

    showDoc(id) {
      const doc = this.docs.get(id);
      if (!doc) return;

      // Update history
      if (this.currentDoc !== id) {
        this.history = this.history.slice(0, this.historyIndex + 1);
        this.history.push(id);
        this.historyIndex = this.history.length - 1;
        this.updateNavButtons();
      }

      this.currentDoc = id;

      // Update sidebar active state
      this.panel.querySelectorAll(".category-item").forEach((item) => {
        item.classList.toggle("active", item.dataset.doc === id);
      });

      // Show article
      const welcome = this.panel.querySelector(".docs-welcome");
      const article = this.panel.querySelector(".docs-article");
      const search = this.panel.querySelector(".docs-search-results");

      welcome.style.display = "none";
      search.style.display = "none";
      article.style.display = "block";
      article.innerHTML = doc.content;

      // Scroll to top
      this.panel.querySelector(".docs-content").scrollTop = 0;
    }

    performSearch(query) {
      const welcome = this.panel.querySelector(".docs-welcome");
      const article = this.panel.querySelector(".docs-article");
      const searchResults = this.panel.querySelector(".docs-search-results");

      if (!query.trim()) {
        welcome.style.display = "block";
        article.style.display = "none";
        searchResults.style.display = "none";
        return;
      }

      const results = this.search(query);

      welcome.style.display = "none";
      article.style.display = "none";
      searchResults.style.display = "block";

      if (results.length === 0) {
        searchResults.innerHTML = `
                    <h3>No results found</h3>
                    <p style="color: var(--bael-text-dim);">Try different keywords or browse the sidebar.</p>
                `;
      } else {
        searchResults.innerHTML = `
                    <h3>${results.length} result${results.length === 1 ? "" : "s"} found</h3>
                    ${results
                      .map(
                        (doc) => `
                        <div class="search-result-item" data-doc="${doc.id}">
                            <span class="search-result-icon">${doc.icon}</span>
                            <div class="search-result-info">
                                <div class="search-result-title">${doc.title}</div>
                                <div class="search-result-category">${doc.category}</div>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                `;
      }
    }

    navigateBack() {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        this.showDoc(this.history[this.historyIndex]);
      }
    }

    navigateForward() {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        this.showDoc(this.history[this.historyIndex]);
      }
    }

    updateNavButtons() {
      this.panel.querySelector(".nav-back").disabled = this.historyIndex <= 0;
      this.panel.querySelector(".nav-forward").disabled =
        this.historyIndex >= this.history.length - 1;
    }

    // Public API
    open(docId = null) {
      this.panel.classList.add("visible");
      if (docId) {
        this.showDoc(docId);
      }
    }

    close() {
      this.panel.classList.remove("visible");
    }

    toggle() {
      this.panel.classList.toggle("visible");
    }

    get isVisible() {
      return this.panel.classList.contains("visible");
    }
  }

  // Initialize
  window.BaelDocumentation = new BaelDocumentation();
})();
