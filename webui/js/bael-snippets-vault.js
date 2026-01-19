/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ███████╗███╗   ██╗██╗██████╗ ██████╗ ███████╗████████╗███████╗          █
 * █  ██╔════╝████╗  ██║██║██╔══██╗██╔══██╗██╔════╝╚══██╔══╝██╔════╝          █
 * █  ███████╗██╔██╗ ██║██║██████╔╝██████╔╝█████╗     ██║   ███████╗          █
 * █  ╚════██║██║╚██╗██║██║██╔═══╝ ██╔═══╝ ██╔══╝     ██║   ╚════██║          █
 * █  ███████║██║ ╚████║██║██║     ██║     ███████╗   ██║   ███████║          █
 * █  ╚══════╝╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝     ╚══════╝   ╚═╝   ╚══════╝          █
 * █                                                                          █
 * █   BAEL SNIPPETS VAULT - Code Snippets Storage & Management              █
 * █   Store, organize and quickly access code snippets (Ctrl+Shift+V)       █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function() {
    'use strict';

    class BaelSnippetsVault {
        constructor() {
            this.version = '1.0.0';
            this.initialized = false;
            this.visible = false;
            this.container = null;
            this.snippets = [];
            this.currentCategory = 'all';
            this.searchQuery = '';
        }

        async initialize() {
            console.log('📦 Bael Snippets Vault initializing...');
            
            this.loadSnippets();
            this.injectStyles();
            this.createContainer();
            this.setupShortcuts();
            this.render();
            
            this.initialized = true;
            console.log('✅ BAEL SNIPPETS VAULT READY');
            
            return this;
        }

        injectStyles() {
            if (document.getElementById('bael-snippets-vault-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'bael-snippets-vault-styles';
            styles.textContent = `
                .bael-snippets-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                    z-index: 9900;
                    opacity: 0;
                    transition: opacity 0.25s ease;
                    pointer-events: none;
                }
                
                .bael-snippets-overlay.visible {
                    opacity: 1;
                    pointer-events: auto;
                }
                
                .bael-snippets-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.95);
                    width: 90vw;
                    max-width: 1100px;
                    height: 85vh;
                    max-height: 800px;
                    background: #12121a;
                    border-radius: 16px;
                    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    z-index: 9901;
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .bael-snippets-overlay.visible .bael-snippets-modal {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                
                .snippets-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    background: rgba(255, 255, 255, 0.03);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .snippets-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .snippets-title h2 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 600;
                    color: #fff;
                }
                
                .snippets-title .count {
                    background: rgba(99, 102, 241, 0.2);
                    color: #6366f1;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 600;
                }
                
                .snippets-header-actions {
                    display: flex;
                    gap: 10px;
                }
                
                .snippet-btn {
                    padding: 10px 18px;
                    border-radius: 8px;
                    border: none;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .snippet-btn.primary {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: #fff;
                }
                
                .snippet-btn.primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
                }
                
                .snippet-btn.secondary {
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.8);
                }
                
                .snippet-btn.secondary:hover {
                    background: rgba(255, 255, 255, 0.12);
                }
                
                .snippets-close {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                
                .snippets-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }
                
                .snippets-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px 24px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                }
                
                .snippets-search {
                    flex: 1;
                    max-width: 400px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(255, 255, 255, 0.06);
                    border-radius: 10px;
                    padding: 10px 14px;
                }
                
                .snippets-search input {
                    flex: 1;
                    background: none;
                    border: none;
                    color: #fff;
                    font-size: 14px;
                    outline: none;
                }
                
                .snippets-search input::placeholder {
                    color: rgba(255, 255, 255, 0.4);
                }
                
                .snippets-categories {
                    display: flex;
                    gap: 6px;
                }
                
                .category-tag {
                    padding: 8px 14px;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.06);
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }
                
                .category-tag:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .category-tag.active {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: #fff;
                }
                
                .snippets-content {
                    flex: 1;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 16px;
                    padding: 20px 24px;
                    overflow-y: auto;
                    align-content: start;
                }
                
                .snippet-card {
                    background: rgba(255, 255, 255, 0.04);
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    overflow: hidden;
                    transition: all 0.2s;
                }
                
                .snippet-card:hover {
                    border-color: rgba(99, 102, 241, 0.3);
                    transform: translateY(-2px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                }
                
                .snippet-card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                }
                
                .snippet-info {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .snippet-lang {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: rgba(99, 102, 241, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                }
                
                .snippet-meta h4 {
                    margin: 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: #fff;
                }
                
                .snippet-meta p {
                    margin: 2px 0 0;
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                }
                
                .snippet-actions {
                    display: flex;
                    gap: 6px;
                }
                
                .snippet-action {
                    width: 30px;
                    height: 30px;
                    border-radius: 6px;
                    border: none;
                    background: rgba(255, 255, 255, 0.06);
                    color: rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                
                .snippet-action:hover {
                    background: rgba(99, 102, 241, 0.3);
                    color: #fff;
                }
                
                .snippet-action.delete:hover {
                    background: rgba(239, 68, 68, 0.3);
                    color: #ef4444;
                }
                
                .snippet-code {
                    padding: 16px;
                    max-height: 150px;
                    overflow: auto;
                    background: rgba(0, 0, 0, 0.2);
                }
                
                .snippet-code pre {
                    margin: 0;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    font-size: 12px;
                    line-height: 1.5;
                    color: #e4e4e7;
                    white-space: pre-wrap;
                }
                
                .snippet-tags {
                    display: flex;
                    gap: 6px;
                    padding: 12px 16px;
                    flex-wrap: wrap;
                }
                
                .snippet-tag {
                    padding: 4px 10px;
                    border-radius: 6px;
                    background: rgba(255, 255, 255, 0.06);
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 11px;
                }
                
                .empty-state {
                    grid-column: 1 / -1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 20px;
                    color: rgba(255, 255, 255, 0.5);
                    text-align: center;
                }
                
                .empty-state .icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }
                
                .empty-state h3 {
                    margin: 0 0 8px;
                    font-size: 18px;
                    color: #fff;
                }
                
                .empty-state p {
                    margin: 0;
                    font-size: 14px;
                }
                
                /* New Snippet Modal */
                .snippet-form-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.8);
                    z-index: 9950;
                    display: none;
                    align-items: center;
                    justify-content: center;
                }
                
                .snippet-form-overlay.visible {
                    display: flex;
                }
                
                .snippet-form-modal {
                    width: 90vw;
                    max-width: 600px;
                    background: #1a1a2e;
                    border-radius: 16px;
                    padding: 24px;
                }
                
                .snippet-form-modal h3 {
                    margin: 0 0 20px;
                    font-size: 18px;
                    color: #fff;
                }
                
                .form-group {
                    margin-bottom: 16px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 6px;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.6);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .form-group input,
                .form-group select,
                .form-group textarea {
                    width: 100%;
                    padding: 12px 14px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.2s;
                }
                
                .form-group input:focus,
                .form-group select:focus,
                .form-group textarea:focus {
                    border-color: #6366f1;
                }
                
                .form-group textarea {
                    min-height: 150px;
                    font-family: 'JetBrains Mono', monospace;
                    resize: vertical;
                }
                
                .form-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: flex-end;
                    margin-top: 20px;
                }
            `;
            document.head.appendChild(styles);
        }

        createContainer() {
            this.container = document.createElement('div');
            this.container.id = 'bael-snippets-vault';
            this.container.className = 'bael-snippets-overlay';
            
            this.container.innerHTML = `
                <div class="bael-snippets-modal">
                    <div class="snippets-header">
                        <div class="snippets-title">
                            <span style="font-size: 24px;">📦</span>
                            <h2>Snippets Vault</h2>
                            <span class="count">0 snippets</span>
                        </div>
                        <div class="snippets-header-actions">
                            <button class="snippet-btn primary" onclick="BaelSnippetsVault.showNewForm()">
                                ➕ New Snippet
                            </button>
                            <button class="snippet-btn secondary" onclick="BaelSnippetsVault.importSnippets()">
                                📥 Import
                            </button>
                            <button class="snippet-btn secondary" onclick="BaelSnippetsVault.exportSnippets()">
                                📤 Export
                            </button>
                            <button class="snippets-close" onclick="BaelSnippetsVault.hide()">✕</button>
                        </div>
                    </div>
                    <div class="snippets-toolbar">
                        <div class="snippets-search">
                            <span>🔍</span>
                            <input type="text" placeholder="Search snippets..." oninput="BaelSnippetsVault.search(this.value)">
                        </div>
                        <div class="snippets-categories">
                            <button class="category-tag active" data-cat="all" onclick="BaelSnippetsVault.filterCategory('all')">All</button>
                            <button class="category-tag" data-cat="javascript" onclick="BaelSnippetsVault.filterCategory('javascript')">JavaScript</button>
                            <button class="category-tag" data-cat="python" onclick="BaelSnippetsVault.filterCategory('python')">Python</button>
                            <button class="category-tag" data-cat="bash" onclick="BaelSnippetsVault.filterCategory('bash')">Bash</button>
                            <button class="category-tag" data-cat="html" onclick="BaelSnippetsVault.filterCategory('html')">HTML/CSS</button>
                            <button class="category-tag" data-cat="other" onclick="BaelSnippetsVault.filterCategory('other')">Other</button>
                        </div>
                    </div>
                    <div class="snippets-content">
                        <!-- Snippets grid -->
                    </div>
                </div>
                
                <!-- New Snippet Form -->
                <div class="snippet-form-overlay">
                    <div class="snippet-form-modal">
                        <h3>✨ New Snippet</h3>
                        <div class="form-group">
                            <label>Title</label>
                            <input type="text" id="snippet-title" placeholder="My awesome snippet">
                        </div>
                        <div class="form-group">
                            <label>Language</label>
                            <select id="snippet-language">
                                <option value="javascript">JavaScript</option>
                                <option value="python">Python</option>
                                <option value="bash">Bash</option>
                                <option value="html">HTML</option>
                                <option value="css">CSS</option>
                                <option value="json">JSON</option>
                                <option value="sql">SQL</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Code</label>
                            <textarea id="snippet-code" placeholder="Paste your code here..."></textarea>
                        </div>
                        <div class="form-group">
                            <label>Tags (comma separated)</label>
                            <input type="text" id="snippet-tags" placeholder="utility, api, helper">
                        </div>
                        <div class="form-actions">
                            <button class="snippet-btn secondary" onclick="BaelSnippetsVault.hideNewForm()">Cancel</button>
                            <button class="snippet-btn primary" onclick="BaelSnippetsVault.saveNewSnippet()">💾 Save Snippet</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(this.container);
            
            // Close on overlay click
            this.container.addEventListener('click', (e) => {
                if (e.target === this.container) {
                    this.hide();
                }
            });
        }

        setupShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl+Shift+V to show snippets vault
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
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

        loadSnippets() {
            try {
                const stored = localStorage.getItem('bael_snippets');
                this.snippets = stored ? JSON.parse(stored) : this.getDefaultSnippets();
            } catch (e) {
                this.snippets = this.getDefaultSnippets();
            }
        }

        saveSnippets() {
            localStorage.setItem('bael_snippets', JSON.stringify(this.snippets));
        }

        getDefaultSnippets() {
            return [
                {
                    id: 'snp_1',
                    title: 'Fetch API Helper',
                    language: 'javascript',
                    code: `async function fetchJSON(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  if (!response.ok) throw new Error(response.statusText);
  return response.json();
}`,
                    tags: ['api', 'fetch', 'utility'],
                    created: new Date().toISOString()
                },
                {
                    id: 'snp_2',
                    title: 'Debounce Function',
                    language: 'javascript',
                    code: `function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}`,
                    tags: ['utility', 'performance'],
                    created: new Date().toISOString()
                },
                {
                    id: 'snp_3',
                    title: 'Python HTTP Server',
                    language: 'python',
                    code: `from http.server import HTTPServer, SimpleHTTPRequestHandler

def run(port=8000):
    server = HTTPServer(('localhost', port), SimpleHTTPRequestHandler)
    print(f'Serving on http://localhost:{port}')
    server.serve_forever()

if __name__ == '__main__':
    run()`,
                    tags: ['server', 'http', 'utility'],
                    created: new Date().toISOString()
                }
            ];
        }

        getLangIcon(lang) {
            const icons = {
                'javascript': '🟨',
                'python': '🐍',
                'bash': '💻',
                'html': '🌐',
                'css': '🎨',
                'json': '📋',
                'sql': '🗃️',
                'other': '📄'
            };
            return icons[lang] || '📄';
        }

        getFilteredSnippets() {
            let filtered = this.snippets;
            
            // Category filter
            if (this.currentCategory !== 'all') {
                filtered = filtered.filter(s => {
                    if (this.currentCategory === 'html') {
                        return s.language === 'html' || s.language === 'css';
                    }
                    return s.language === this.currentCategory;
                });
            }
            
            // Search filter
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                filtered = filtered.filter(s => 
                    s.title.toLowerCase().includes(query) ||
                    s.code.toLowerCase().includes(query) ||
                    s.tags.some(t => t.toLowerCase().includes(query))
                );
            }
            
            return filtered;
        }

        render() {
            const content = this.container.querySelector('.snippets-content');
            const filtered = this.getFilteredSnippets();
            
            // Update count
            this.container.querySelector('.count').textContent = `${this.snippets.length} snippets`;
            
            if (filtered.length === 0) {
                content.innerHTML = `
                    <div class="empty-state">
                        <span class="icon">📭</span>
                        <h3>No snippets found</h3>
                        <p>Create a new snippet or try a different search</p>
                    </div>
                `;
                return;
            }
            
            content.innerHTML = filtered.map(snippet => `
                <div class="snippet-card" data-id="${snippet.id}">
                    <div class="snippet-card-header">
                        <div class="snippet-info">
                            <span class="snippet-lang">${this.getLangIcon(snippet.language)}</span>
                            <div class="snippet-meta">
                                <h4>${this.escapeHtml(snippet.title)}</h4>
                                <p>${snippet.language} • ${new Date(snippet.created).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div class="snippet-actions">
                            <button class="snippet-action" onclick="BaelSnippetsVault.copySnippet('${snippet.id}')" title="Copy">📋</button>
                            <button class="snippet-action" onclick="BaelSnippetsVault.insertSnippet('${snippet.id}')" title="Insert">📝</button>
                            <button class="snippet-action" onclick="BaelSnippetsVault.editSnippet('${snippet.id}')" title="Edit">✏️</button>
                            <button class="snippet-action delete" onclick="BaelSnippetsVault.deleteSnippet('${snippet.id}')" title="Delete">🗑️</button>
                        </div>
                    </div>
                    <div class="snippet-code">
                        <pre>${this.escapeHtml(snippet.code)}</pre>
                    </div>
                    <div class="snippet-tags">
                        ${snippet.tags.map(tag => `<span class="snippet-tag">#${tag}</span>`).join('')}
                    </div>
                </div>
            `).join('');
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // ═══════════════════════════════════════════════════════════════════════
        // ACTIONS
        // ═══════════════════════════════════════════════════════════════════════

        show() {
            this.visible = true;
            this.container.classList.add('visible');
            this.render();
        }

        hide() {
            this.visible = false;
            this.container.classList.remove('visible');
        }

        search(query) {
            this.searchQuery = query;
            this.render();
        }

        filterCategory(category) {
            this.currentCategory = category;
            
            // Update active state
            this.container.querySelectorAll('.category-tag').forEach(tag => {
                tag.classList.toggle('active', tag.dataset.cat === category);
            });
            
            this.render();
        }

        showNewForm() {
            const form = this.container.querySelector('.snippet-form-overlay');
            form.classList.add('visible');
            this.container.querySelector('#snippet-title').value = '';
            this.container.querySelector('#snippet-code').value = '';
            this.container.querySelector('#snippet-tags').value = '';
            this.container.querySelector('#snippet-title').focus();
        }

        hideNewForm() {
            const form = this.container.querySelector('.snippet-form-overlay');
            form.classList.remove('visible');
        }

        saveNewSnippet() {
            const title = this.container.querySelector('#snippet-title').value.trim();
            const language = this.container.querySelector('#snippet-language').value;
            const code = this.container.querySelector('#snippet-code').value;
            const tagsStr = this.container.querySelector('#snippet-tags').value;
            
            if (!title || !code) {
                this.toast('Please fill in title and code', 'error');
                return;
            }
            
            const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t);
            
            const snippet = {
                id: 'snp_' + Date.now(),
                title,
                language,
                code,
                tags,
                created: new Date().toISOString()
            };
            
            this.snippets.unshift(snippet);
            this.saveSnippets();
            this.hideNewForm();
            this.render();
            this.toast('Snippet saved!', 'success');
        }

        copySnippet(id) {
            const snippet = this.snippets.find(s => s.id === id);
            if (snippet) {
                navigator.clipboard.writeText(snippet.code).then(() => {
                    this.toast('Copied to clipboard!', 'success');
                });
            }
        }

        insertSnippet(id) {
            const snippet = this.snippets.find(s => s.id === id);
            if (snippet) {
                // Dispatch event for chat input insertion
                window.dispatchEvent(new CustomEvent('bael:insert-text', {
                    detail: { text: snippet.code }
                }));
                this.toast('Inserted!', 'success');
                this.hide();
            }
        }

        editSnippet(id) {
            const snippet = this.snippets.find(s => s.id === id);
            if (snippet) {
                this.container.querySelector('#snippet-title').value = snippet.title;
                this.container.querySelector('#snippet-language').value = snippet.language;
                this.container.querySelector('#snippet-code').value = snippet.code;
                this.container.querySelector('#snippet-tags').value = snippet.tags.join(', ');
                
                // Remove old, add new
                this.snippets = this.snippets.filter(s => s.id !== id);
                
                const form = this.container.querySelector('.snippet-form-overlay');
                form.classList.add('visible');
            }
        }

        deleteSnippet(id) {
            if (confirm('Delete this snippet?')) {
                this.snippets = this.snippets.filter(s => s.id !== id);
                this.saveSnippets();
                this.render();
                this.toast('Snippet deleted', 'success');
            }
        }

        importSnippets() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    const text = await file.text();
                    try {
                        const imported = JSON.parse(text);
                        if (Array.isArray(imported)) {
                            this.snippets = [...imported, ...this.snippets];
                            this.saveSnippets();
                            this.render();
                            this.toast(`Imported ${imported.length} snippets!`, 'success');
                        }
                    } catch (e) {
                        this.toast('Invalid file format', 'error');
                    }
                }
            };
            input.click();
        }

        exportSnippets() {
            const blob = new Blob([JSON.stringify(this.snippets, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bael-snippets-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            this.toast('Snippets exported!', 'success');
        }

        toast(message, type = 'info') {
            window.dispatchEvent(new CustomEvent('bael:toast', {
                detail: { message, type }
            }));
        }

        // Add snippet from selection
        addFromSelection(text, language = 'javascript') {
            const title = prompt('Snippet title:');
            if (title) {
                const snippet = {
                    id: 'snp_' + Date.now(),
                    title,
                    language,
                    code: text,
                    tags: [],
                    created: new Date().toISOString()
                };
                this.snippets.unshift(snippet);
                this.saveSnippets();
                this.toast('Snippet added!', 'success');
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    window.BaelSnippetsVault = new BaelSnippetsVault();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.BaelSnippetsVault.initialize();
        });
    } else {
        window.BaelSnippetsVault.initialize();
    }

    console.log('📦 Bael Snippets Vault loaded');
})();
