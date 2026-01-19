/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   ██████╗ ██╗   ██╗███╗   ██╗███╗   ██╗███████╗██████╗                   █
 * █   ██╔══██╗██║   ██║████╗  ██║████╗  ██║██╔════╝██╔══██╗                  █
 * █   ██████╔╝██║   ██║██╔██╗ ██║██╔██╗ ██║█████╗  ██████╔╝                  █
 * █   ██╔══██╗██║   ██║██║╚██╗██║██║╚██╗██║██╔══╝  ██╔══██╗                  █
 * █   ██║  ██║╚██████╔╝██║ ╚████║██║ ╚████║███████╗██║  ██║                  █
 * █   ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝                  █
 * █                                                                          █
 * █   BAEL CODE RUNNER - Interactive Code Execution Environment              █
 * █   Execute and test code snippets in browser                              █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function() {
    'use strict';

    class BaelCodeRunner {
        constructor() {
            this.version = '1.0.0';
            this.initialized = false;
            this.visible = false;
            this.container = null;
            
            this.snippets = [];
            this.currentLanguage = 'javascript';
            this.history = [];
        }

        async initialize() {
            console.log('▶️ Bael Code Runner initializing...');
            
            this.loadData();
            this.injectStyles();
            this.createContainer();
            this.setupShortcuts();
            
            this.initialized = true;
            console.log('✅ BAEL CODE RUNNER READY');
            
            return this;
        }

        loadData() {
            try {
                const saved = localStorage.getItem('bael-code-snippets');
                if (saved) {
                    this.snippets = JSON.parse(saved);
                }
                const history = localStorage.getItem('bael-code-history');
                if (history) {
                    this.history = JSON.parse(history);
                }
            } catch (e) {}
        }

        saveData() {
            try {
                localStorage.setItem('bael-code-snippets', JSON.stringify(this.snippets));
                localStorage.setItem('bael-code-history', JSON.stringify(this.history.slice(0, 50)));
            } catch (e) {}
        }

        injectStyles() {
            if (document.getElementById('bael-runner-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'bael-runner-styles';
            styles.textContent = `
                .bael-runner-container {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.95);
                    width: 700px;
                    max-height: 85vh;
                    background: #12121a;
                    border-radius: 20px;
                    box-shadow: 0 30px 100px rgba(0, 0, 0, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    z-index: 9860;
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: none;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    font-family: 'JetBrains Mono', 'Fira Code', 'Monaco', monospace;
                }
                
                .bael-runner-container.visible {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                    pointer-events: auto;
                }
                
                .bael-runner-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 9859;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    pointer-events: none;
                }
                
                .bael-runner-backdrop.visible {
                    opacity: 1;
                    pointer-events: auto;
                }
                
                .runner-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .runner-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #fff;
                }
                
                .runner-controls {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .lang-select {
                    padding: 6px 12px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                    font-size: 12px;
                    cursor: pointer;
                }
                
                .runner-close {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                
                .runner-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }
                
                .runner-body {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }
                
                .runner-sidebar {
                    width: 180px;
                    background: rgba(0, 0, 0, 0.2);
                    border-right: 1px solid rgba(255, 255, 255, 0.06);
                    overflow-y: auto;
                }
                
                .sidebar-section {
                    padding: 12px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                }
                
                .sidebar-title {
                    font-size: 10px;
                    text-transform: uppercase;
                    color: rgba(255, 255, 255, 0.4);
                    margin-bottom: 8px;
                }
                
                .snippet-item {
                    padding: 8px 10px;
                    border-radius: 6px;
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.7);
                    cursor: pointer;
                    transition: all 0.2s;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin-bottom: 4px;
                }
                
                .snippet-item:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                }
                
                .runner-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                
                .code-editor-wrapper {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    min-height: 200px;
                }
                
                .code-toolbar {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                }
                
                .toolbar-left {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .toolbar-btn {
                    padding: 6px 12px;
                    border-radius: 6px;
                    border: none;
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                
                .toolbar-btn:hover {
                    background: rgba(255, 255, 255, 0.12);
                    color: #fff;
                }
                
                .toolbar-btn.primary {
                    background: linear-gradient(135deg, #22c55e 0%, #10b981 100%);
                    color: #fff;
                }
                
                .toolbar-btn.primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
                }
                
                .code-editor {
                    flex: 1;
                    width: 100%;
                    padding: 12px;
                    background: #0d0d14;
                    border: none;
                    outline: none;
                    color: #e2e8f0;
                    font-family: inherit;
                    font-size: 13px;
                    line-height: 1.6;
                    resize: none;
                }
                
                .code-editor::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }
                
                .output-section {
                    height: 150px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    display: flex;
                    flex-direction: column;
                }
                
                .output-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                }
                
                .output-title {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: uppercase;
                }
                
                .output-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px 12px;
                    font-size: 12px;
                    line-height: 1.5;
                }
                
                .output-line {
                    color: #94a3b8;
                    margin-bottom: 2px;
                }
                
                .output-line.error {
                    color: #ef4444;
                }
                
                .output-line.success {
                    color: #22c55e;
                }
                
                .output-line.result {
                    color: #06b6d4;
                }
                
                .templates-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }
                
                .template-card {
                    padding: 10px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .template-card:hover {
                    background: rgba(34, 197, 94, 0.08);
                    border-color: rgba(34, 197, 94, 0.3);
                }
                
                .template-name {
                    font-size: 11px;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 2px;
                }
                
                .template-desc {
                    font-size: 9px;
                    color: rgba(255, 255, 255, 0.4);
                }
            `;
            document.head.appendChild(styles);
        }

        createContainer() {
            // Create backdrop
            this.backdrop = document.createElement('div');
            this.backdrop.className = 'bael-runner-backdrop';
            this.backdrop.onclick = () => this.hide();
            document.body.appendChild(this.backdrop);
            
            // Create main container
            this.container = document.createElement('div');
            this.container.id = 'bael-code-runner';
            this.container.className = 'bael-runner-container';
            
            this.renderContainer();
            
            document.body.appendChild(this.container);
        }

        renderContainer() {
            const templates = [
                { name: 'Fetch API', desc: 'HTTP request', code: `fetch('https://api.example.com/data')\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err));` },
                { name: 'Array Map', desc: 'Transform array', code: `const nums = [1, 2, 3, 4, 5];\nconst doubled = nums.map(n => n * 2);\nconsole.log(doubled);` },
                { name: 'Async/Await', desc: 'Async function', code: `async function fetchData() {\n  try {\n    const response = await fetch('/api/data');\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Error:', error);\n  }\n}` },
                { name: 'DOM Query', desc: 'Select elements', code: `const elements = document.querySelectorAll('.my-class');\nelements.forEach(el => {\n  console.log(el.textContent);\n});` }
            ];
            
            this.container.innerHTML = `
                <div class="runner-header">
                    <div class="runner-title">
                        <span>▶️</span> Code Runner
                    </div>
                    <div class="runner-controls">
                        <select class="lang-select" onchange="BaelCodeRunner.setLanguage(this.value)">
                            <option value="javascript" ${this.currentLanguage === 'javascript' ? 'selected' : ''}>JavaScript</option>
                        </select>
                        <button class="runner-close" onclick="BaelCodeRunner.hide()">✕</button>
                    </div>
                </div>
                <div class="runner-body">
                    <div class="runner-sidebar">
                        <div class="sidebar-section">
                            <div class="sidebar-title">Templates</div>
                            <div class="templates-grid">
                                ${templates.map((t, i) => `
                                    <div class="template-card" onclick="BaelCodeRunner.loadTemplate(${i})">
                                        <div class="template-name">${t.name}</div>
                                        <div class="template-desc">${t.desc}</div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="sidebar-section">
                            <div class="sidebar-title">Saved Snippets</div>
                            ${this.snippets.map((s, i) => `
                                <div class="snippet-item" onclick="BaelCodeRunner.loadSnippet(${i})">
                                    ${s.name}
                                </div>
                            `).join('') || '<div style="color: rgba(255,255,255,0.3); font-size: 11px;">No saved snippets</div>'}
                        </div>
                    </div>
                    <div class="runner-main">
                        <div class="code-editor-wrapper">
                            <div class="code-toolbar">
                                <div class="toolbar-left">
                                    <button class="toolbar-btn primary" onclick="BaelCodeRunner.run()">
                                        ▶ Run
                                    </button>
                                    <button class="toolbar-btn" onclick="BaelCodeRunner.saveSnippet()">
                                        💾 Save
                                    </button>
                                    <button class="toolbar-btn" onclick="BaelCodeRunner.clear()">
                                        🗑️ Clear
                                    </button>
                                </div>
                            </div>
                            <textarea class="code-editor" 
                                      id="code-input"
                                      placeholder="// Write your code here...
// Press Ctrl+Enter to run"
                                      onkeydown="BaelCodeRunner.handleKeydown(event)"></textarea>
                        </div>
                        <div class="output-section">
                            <div class="output-header">
                                <span class="output-title">Output</span>
                                <button class="toolbar-btn" onclick="BaelCodeRunner.clearOutput()">Clear</button>
                            </div>
                            <div class="output-content" id="code-output"></div>
                        </div>
                    </div>
                </div>
            `;
            
            // Store template data
            this.templates = templates;
        }

        setupShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl+Shift+E for code runner
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
                    e.preventDefault();
                    if (this.visible) {
                        this.hide();
                    } else {
                        this.show();
                    }
                }
                
                // Escape to close
                if (e.key === 'Escape' && this.visible) {
                    this.hide();
                }
            });
        }

        show() {
            this.visible = true;
            this.backdrop.classList.add('visible');
            this.container.classList.add('visible');
            
            setTimeout(() => {
                this.container.querySelector('#code-input')?.focus();
            }, 100);
        }

        hide() {
            this.visible = false;
            this.backdrop.classList.remove('visible');
            this.container.classList.remove('visible');
        }

        handleKeydown(event) {
            // Ctrl+Enter to run
            if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
                event.preventDefault();
                this.run();
            }
            
            // Tab for indent
            if (event.key === 'Tab') {
                event.preventDefault();
                const textarea = event.target;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                textarea.value = textarea.value.substring(0, start) + '  ' + textarea.value.substring(end);
                textarea.selectionStart = textarea.selectionEnd = start + 2;
            }
        }

        setLanguage(lang) {
            this.currentLanguage = lang;
        }

        loadTemplate(index) {
            const template = this.templates[index];
            if (template) {
                const input = this.container.querySelector('#code-input');
                if (input) {
                    input.value = template.code;
                }
            }
        }

        loadSnippet(index) {
            const snippet = this.snippets[index];
            if (snippet) {
                const input = this.container.querySelector('#code-input');
                if (input) {
                    input.value = snippet.code;
                }
            }
        }

        run() {
            const input = this.container.querySelector('#code-input');
            const output = this.container.querySelector('#code-output');
            const code = input?.value || '';
            
            if (!code.trim()) return;
            
            // Clear output
            output.innerHTML = '';
            
            // Capture console output
            const logs = [];
            const originalLog = console.log;
            const originalError = console.error;
            const originalWarn = console.warn;
            
            console.log = (...args) => {
                logs.push({ type: 'log', message: args.map(a => JSON.stringify(a, null, 2)).join(' ') });
                originalLog.apply(console, args);
            };
            console.error = (...args) => {
                logs.push({ type: 'error', message: args.map(a => String(a)).join(' ') });
                originalError.apply(console, args);
            };
            console.warn = (...args) => {
                logs.push({ type: 'warn', message: args.map(a => String(a)).join(' ') });
                originalWarn.apply(console, args);
            };
            
            try {
                const result = eval(code);
                
                // Restore console
                console.log = originalLog;
                console.error = originalError;
                console.warn = originalWarn;
                
                // Display logs
                logs.forEach(log => {
                    const line = document.createElement('div');
                    line.className = 'output-line ' + (log.type === 'error' ? 'error' : '');
                    line.textContent = log.message;
                    output.appendChild(line);
                });
                
                // Display result
                if (result !== undefined) {
                    const line = document.createElement('div');
                    line.className = 'output-line result';
                    line.textContent = '→ ' + JSON.stringify(result, null, 2);
                    output.appendChild(line);
                }
                
                // Add to history
                this.history.unshift({ code, timestamp: new Date().toISOString() });
                this.saveData();
                
            } catch (err) {
                // Restore console
                console.log = originalLog;
                console.error = originalError;
                console.warn = originalWarn;
                
                const line = document.createElement('div');
                line.className = 'output-line error';
                line.textContent = '❌ ' + err.message;
                output.appendChild(line);
            }
        }

        saveSnippet() {
            const input = this.container.querySelector('#code-input');
            const code = input?.value || '';
            
            if (!code.trim()) return;
            
            const name = prompt('Enter snippet name:');
            if (!name) return;
            
            this.snippets.push({
                name,
                code,
                createdAt: new Date().toISOString()
            });
            
            this.saveData();
            this.renderContainer();
            
            window.dispatchEvent(new CustomEvent('bael:toast', {
                detail: { message: 'Snippet saved!', type: 'success' }
            }));
        }

        clear() {
            const input = this.container.querySelector('#code-input');
            if (input) {
                input.value = '';
            }
        }

        clearOutput() {
            const output = this.container.querySelector('#code-output');
            if (output) {
                output.innerHTML = '';
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    window.BaelCodeRunner = new BaelCodeRunner();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.BaelCodeRunner.initialize();
        });
    } else {
        window.BaelCodeRunner.initialize();
    }

    console.log('▶️ Bael Code Runner loaded');
})();
