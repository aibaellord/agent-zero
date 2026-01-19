/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ███████╗██╗  ██╗██████╗  ██████╗ ██████╗ ████████╗                      █
 * █  ██╔════╝╚██╗██╔╝██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝                      █
 * █  █████╗   ╚███╔╝ ██████╔╝██║   ██║██████╔╝   ██║                         █
 * █  ██╔══╝   ██╔██╗ ██╔═══╝ ██║   ██║██╔══██╗   ██║                         █
 * █  ███████╗██╔╝ ██╗██║     ╚██████╔╝██║  ██║   ██║                         █
 * █  ╚══════╝╚═╝  ╚═╝╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝                         █
 * █                                                                          █
 * █   BAEL EXPORT CENTER - Unified Export Hub (Ctrl+Shift+X)                █
 * █   Export chats, settings, knowledge, and more in various formats       █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function() {
    'use strict';

    class BaelExportCenter {
        constructor() {
            this.version = '1.0.0';
            this.initialized = false;
            this.visible = false;
            this.container = null;
            this.exportTypes = [
                {
                    id: 'chat',
                    name: 'Current Chat',
                    icon: '💬',
                    description: 'Export the current conversation with all messages',
                    formats: ['json', 'markdown', 'txt', 'html']
                },
                {
                    id: 'all-chats',
                    name: 'All Chats',
                    icon: '📚',
                    description: 'Export entire chat history from all conversations',
                    formats: ['json', 'zip']
                },
                {
                    id: 'settings',
                    name: 'Settings',
                    icon: '⚙️',
                    description: 'Export all application settings and preferences',
                    formats: ['json']
                },
                {
                    id: 'memory',
                    name: 'Agent Memory',
                    icon: '🧠',
                    description: 'Export agent memory and learned information',
                    formats: ['json', 'txt']
                },
                {
                    id: 'knowledge',
                    name: 'Knowledge Base',
                    icon: '📖',
                    description: 'Export custom knowledge base files',
                    formats: ['zip']
                },
                {
                    id: 'snippets',
                    name: 'Code Snippets',
                    icon: '💾',
                    description: 'Export saved code snippets',
                    formats: ['json', 'zip']
                },
                {
                    id: 'notes',
                    name: 'Quick Notes',
                    icon: '📝',
                    description: 'Export all quick notes',
                    formats: ['json', 'markdown', 'zip']
                },
                {
                    id: 'full-backup',
                    name: 'Full Backup',
                    icon: '💼',
                    description: 'Complete backup of all data and settings',
                    formats: ['zip']
                }
            ];
        }

        async initialize() {
            console.log('📤 Bael Export Center initializing...');
            
            this.injectStyles();
            this.createContainer();
            this.setupShortcuts();
            
            this.initialized = true;
            console.log('✅ BAEL EXPORT CENTER READY');
            
            return this;
        }

        injectStyles() {
            if (document.getElementById('bael-export-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'bael-export-styles';
            styles.textContent = `
                .bael-export-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                    z-index: 9900;
                    opacity: 0;
                    transition: opacity 0.25s ease;
                    pointer-events: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .bael-export-overlay.visible {
                    opacity: 1;
                    pointer-events: auto;
                }
                
                .bael-export-modal {
                    width: 90vw;
                    max-width: 900px;
                    max-height: 85vh;
                    background: #12121a;
                    border-radius: 16px;
                    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    transform: scale(0.95);
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .bael-export-overlay.visible .bael-export-modal {
                    transform: scale(1);
                }
                
                .export-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    background: rgba(255, 255, 255, 0.03);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .export-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .export-title h2 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 600;
                    color: #fff;
                }
                
                .export-close {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    font-size: 20px;
                    transition: all 0.2s;
                }
                
                .export-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }
                
                .export-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                }
                
                .export-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
                    gap: 16px;
                }
                
                .export-card {
                    background: rgba(255, 255, 255, 0.04);
                    border-radius: 14px;
                    border: 2px solid rgba(255, 255, 255, 0.06);
                    padding: 20px;
                    transition: all 0.2s;
                }
                
                .export-card:hover {
                    border-color: rgba(99, 102, 241, 0.3);
                    transform: translateY(-3px);
                    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
                }
                
                .export-card-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 12px;
                }
                
                .export-card-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    background: rgba(99, 102, 241, 0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                }
                
                .export-card-name {
                    font-size: 15px;
                    font-weight: 600;
                    color: #fff;
                }
                
                .export-card-desc {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                    line-height: 1.5;
                    margin-bottom: 16px;
                }
                
                .export-formats {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }
                
                .export-format-btn {
                    padding: 8px 14px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.06);
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .export-format-btn:hover {
                    background: rgba(99, 102, 241, 0.2);
                    color: #6366f1;
                }
                
                .export-format-btn.exporting {
                    background: rgba(251, 191, 36, 0.2);
                    color: #fbbf24;
                    pointer-events: none;
                }
                
                .export-format-btn.success {
                    background: rgba(34, 197, 94, 0.2);
                    color: #22c55e;
                }
                
                .export-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 24px;
                    background: rgba(255, 255, 255, 0.03);
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .export-info {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.4);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .export-all-btn {
                    padding: 12px 24px;
                    border-radius: 10px;
                    border: none;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: #fff;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .export-all-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
                }
                
                .export-progress {
                    display: none;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 24px;
                    background: rgba(99, 102, 241, 0.1);
                    border-bottom: 1px solid rgba(99, 102, 241, 0.2);
                }
                
                .export-progress.active {
                    display: flex;
                }
                
                .export-progress-bar {
                    flex: 1;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                    overflow: hidden;
                }
                
                .export-progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #6366f1, #8b5cf6);
                    border-radius: 3px;
                    transition: width 0.3s ease;
                    width: 0%;
                }
                
                .export-progress-text {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.6);
                    white-space: nowrap;
                }
                
                .format-icon {
                    font-size: 14px;
                }
            `;
            document.head.appendChild(styles);
        }

        createContainer() {
            this.container = document.createElement('div');
            this.container.id = 'bael-export-center';
            this.container.className = 'bael-export-overlay';
            
            this.container.innerHTML = `
                <div class="bael-export-modal">
                    <div class="export-header">
                        <div class="export-title">
                            <span style="font-size: 24px;">📤</span>
                            <h2>Export Center</h2>
                        </div>
                        <button class="export-close" onclick="BaelExportCenter.hide()">✕</button>
                    </div>
                    <div class="export-progress">
                        <span class="export-progress-text">Exporting...</span>
                        <div class="export-progress-bar">
                            <div class="export-progress-fill"></div>
                        </div>
                    </div>
                    <div class="export-content">
                        <div class="export-grid"></div>
                    </div>
                    <div class="export-footer">
                        <div class="export-info">
                            💡 Choose a format to download your data
                        </div>
                        <button class="export-all-btn" onclick="BaelExportCenter.exportFullBackup()">
                            💼 Full Backup (.zip)
                        </button>
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
                // Ctrl+Shift+X for export center
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'X') {
                    e.preventDefault();
                    if (this.visible) {
                        this.hide();
                    } else {
                        this.show();
                    }
                }
            });
        }

        render() {
            const grid = this.container.querySelector('.export-grid');
            
            grid.innerHTML = this.exportTypes.map(type => {
                const formatButtons = type.formats.map(format => {
                    const icon = this.getFormatIcon(format);
                    return `
                        <button class="export-format-btn" 
                                onclick="BaelExportCenter.export('${type.id}', '${format}')"
                                data-type="${type.id}" data-format="${format}">
                            <span class="format-icon">${icon}</span>
                            .${format}
                        </button>
                    `;
                }).join('');
                
                return `
                    <div class="export-card">
                        <div class="export-card-header">
                            <div class="export-card-icon">${type.icon}</div>
                            <div class="export-card-name">${type.name}</div>
                        </div>
                        <div class="export-card-desc">${type.description}</div>
                        <div class="export-formats">
                            ${formatButtons}
                        </div>
                    </div>
                `;
            }).join('');
        }

        getFormatIcon(format) {
            const icons = {
                json: '{ }',
                markdown: 'MD',
                txt: '📄',
                html: '🌐',
                zip: '📦'
            };
            return icons[format] || '📁';
        }

        show() {
            this.visible = true;
            this.container.classList.add('visible');
            this.render();
        }

        hide() {
            this.visible = false;
            this.container.classList.remove('visible');
        }

        showProgress(percent, text) {
            const progressEl = this.container.querySelector('.export-progress');
            const fillEl = this.container.querySelector('.export-progress-fill');
            const textEl = this.container.querySelector('.export-progress-text');
            
            progressEl.classList.add('active');
            fillEl.style.width = `${percent}%`;
            textEl.textContent = text || `Exporting... ${percent}%`;
        }

        hideProgress() {
            this.container.querySelector('.export-progress').classList.remove('active');
        }

        async export(type, format) {
            const btn = this.container.querySelector(`[data-type="${type}"][data-format="${format}"]`);
            
            try {
                btn.classList.add('exporting');
                btn.innerHTML = `⏳ Exporting...`;
                
                this.showProgress(0, `Preparing ${type}...`);
                
                const data = await this.gatherData(type);
                
                this.showProgress(50, `Formatting as ${format}...`);
                
                const formatted = await this.formatData(data, format, type);
                
                this.showProgress(90, `Downloading...`);
                
                await this.downloadFile(formatted.content, formatted.filename, formatted.mimeType);
                
                this.showProgress(100, `Complete!`);
                
                btn.classList.remove('exporting');
                btn.classList.add('success');
                btn.innerHTML = `✓ Downloaded`;
                
                setTimeout(() => {
                    btn.classList.remove('success');
                    btn.innerHTML = `<span class="format-icon">${this.getFormatIcon(format)}</span>.${format}`;
                    this.hideProgress();
                }, 2000);
                
            } catch (e) {
                console.error('Export failed:', e);
                btn.classList.remove('exporting');
                btn.innerHTML = `❌ Failed`;
                this.toast('Export failed: ' + e.message, 'error');
                
                setTimeout(() => {
                    btn.innerHTML = `<span class="format-icon">${this.getFormatIcon(format)}</span>.${format}`;
                    this.hideProgress();
                }, 2000);
            }
        }

        async gatherData(type) {
            switch (type) {
                case 'chat':
                    return this.getCurrentChat();
                case 'all-chats':
                    return this.getAllChats();
                case 'settings':
                    return this.getSettings();
                case 'memory':
                    return this.getMemory();
                case 'knowledge':
                    return this.getKnowledge();
                case 'snippets':
                    return this.getSnippets();
                case 'notes':
                    return this.getNotes();
                case 'full-backup':
                    return this.getFullBackup();
                default:
                    throw new Error('Unknown export type');
            }
        }

        async getCurrentChat() {
            try {
                // Try to get from Alpine store
                if (window.Alpine?.store?.('chat')) {
                    const chat = Alpine.store('chat');
                    return {
                        messages: chat.messages || [],
                        id: chat.id,
                        timestamp: Date.now()
                    };
                }
                
                // Fallback: scrape from DOM
                const messages = [];
                document.querySelectorAll('[data-message]').forEach(el => {
                    messages.push({
                        role: el.dataset.role || 'unknown',
                        content: el.textContent
                    });
                });
                
                return { messages, timestamp: Date.now() };
            } catch (e) {
                return { messages: [], error: e.message, timestamp: Date.now() };
            }
        }

        async getAllChats() {
            try {
                const response = await fetch('/api/chats');
                if (response.ok) {
                    return await response.json();
                }
            } catch (e) {}
            
            // Fallback to localStorage
            const chats = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.includes('chat')) {
                    try {
                        chats.push(JSON.parse(localStorage.getItem(key)));
                    } catch (e) {}
                }
            }
            return { chats, timestamp: Date.now() };
        }

        async getSettings() {
            try {
                const response = await fetch('/api/settings');
                if (response.ok) {
                    return await response.json();
                }
            } catch (e) {}
            
            // Fallback
            const settings = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.includes('setting') || key.includes('config') || key.includes('bael')) {
                    try {
                        settings[key] = JSON.parse(localStorage.getItem(key));
                    } catch (e) {
                        settings[key] = localStorage.getItem(key);
                    }
                }
            }
            return { settings, timestamp: Date.now() };
        }

        async getMemory() {
            try {
                const response = await fetch('/api/memory');
                if (response.ok) {
                    return await response.json();
                }
            } catch (e) {}
            
            return { memory: [], timestamp: Date.now() };
        }

        async getKnowledge() {
            try {
                const response = await fetch('/api/knowledge');
                if (response.ok) {
                    return await response.json();
                }
            } catch (e) {}
            
            return { knowledge: [], timestamp: Date.now() };
        }

        getSnippets() {
            try {
                const saved = localStorage.getItem('bael-snippets');
                return saved ? JSON.parse(saved) : { snippets: [] };
            } catch (e) {
                return { snippets: [] };
            }
        }

        getNotes() {
            try {
                const saved = localStorage.getItem('bael-quick-notes');
                return saved ? JSON.parse(saved) : [];
            } catch (e) {
                return [];
            }
        }

        async getFullBackup() {
            const backup = {
                version: this.version,
                timestamp: Date.now(),
                chat: await this.getCurrentChat(),
                allChats: await this.getAllChats(),
                settings: await this.getSettings(),
                memory: await this.getMemory(),
                snippets: this.getSnippets(),
                notes: this.getNotes()
            };
            
            return backup;
        }

        async formatData(data, format, type) {
            const timestamp = new Date().toISOString().split('T')[0];
            
            switch (format) {
                case 'json':
                    return {
                        content: JSON.stringify(data, null, 2),
                        filename: `bael-${type}-${timestamp}.json`,
                        mimeType: 'application/json'
                    };
                    
                case 'markdown':
                    return {
                        content: this.toMarkdown(data, type),
                        filename: `bael-${type}-${timestamp}.md`,
                        mimeType: 'text/markdown'
                    };
                    
                case 'txt':
                    return {
                        content: this.toPlainText(data, type),
                        filename: `bael-${type}-${timestamp}.txt`,
                        mimeType: 'text/plain'
                    };
                    
                case 'html':
                    return {
                        content: this.toHtml(data, type),
                        filename: `bael-${type}-${timestamp}.html`,
                        mimeType: 'text/html'
                    };
                    
                case 'zip':
                    return {
                        content: JSON.stringify(data, null, 2),
                        filename: `bael-${type}-${timestamp}.json`,
                        mimeType: 'application/json'
                    };
                    
                default:
                    throw new Error('Unknown format');
            }
        }

        toMarkdown(data, type) {
            let md = `# Bael ${type} Export\n\n`;
            md += `**Exported:** ${new Date().toLocaleString()}\n\n---\n\n`;
            
            if (type === 'chat' && data.messages) {
                data.messages.forEach(msg => {
                    md += `### ${msg.role || 'User'}\n\n${msg.content}\n\n---\n\n`;
                });
            } else if (type === 'notes' && Array.isArray(data)) {
                data.forEach(note => {
                    md += `## ${note.title || 'Untitled'}\n\n${note.content}\n\n---\n\n`;
                });
            } else {
                md += '```json\n' + JSON.stringify(data, null, 2) + '\n```\n';
            }
            
            return md;
        }

        toPlainText(data, type) {
            let txt = `Bael ${type} Export\n`;
            txt += `Exported: ${new Date().toLocaleString()}\n`;
            txt += '='.repeat(50) + '\n\n';
            
            if (type === 'chat' && data.messages) {
                data.messages.forEach(msg => {
                    txt += `[${msg.role || 'User'}]\n${msg.content}\n\n`;
                });
            } else {
                txt += JSON.stringify(data, null, 2);
            }
            
            return txt;
        }

        toHtml(data, type) {
            let html = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Bael ${type} Export</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
               max-width: 800px; margin: 0 auto; padding: 40px; background: #12121a; color: #fff; }
        h1 { color: #6366f1; }
        .message { background: rgba(255,255,255,0.05); padding: 16px; border-radius: 8px; margin: 16px 0; }
        .role { font-weight: bold; color: #8b5cf6; margin-bottom: 8px; }
        pre { background: rgba(0,0,0,0.3); padding: 16px; border-radius: 8px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>Bael ${type} Export</h1>
    <p>Exported: ${new Date().toLocaleString()}</p>
    <hr>`;
            
            if (type === 'chat' && data.messages) {
                data.messages.forEach(msg => {
                    html += `<div class="message"><div class="role">${msg.role || 'User'}</div><div>${msg.content}</div></div>`;
                });
            } else {
                html += `<pre>${JSON.stringify(data, null, 2)}</pre>`;
            }
            
            html += '</body></html>';
            return html;
        }

        async downloadFile(content, filename, mimeType) {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            URL.revokeObjectURL(url);
        }

        async exportFullBackup() {
            await this.export('full-backup', 'json');
        }

        toast(message, type = 'info') {
            window.dispatchEvent(new CustomEvent('bael:toast', {
                detail: { message, type }
            }));
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    window.BaelExportCenter = new BaelExportCenter();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.BaelExportCenter.initialize();
        });
    } else {
        window.BaelExportCenter.initialize();
    }

    console.log('📤 Bael Export Center loaded');
})();
