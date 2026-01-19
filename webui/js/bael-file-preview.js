/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ███████╗██╗██╗     ███████╗    ██████╗ ██████╗ ███████╗██╗   ██╗        █
 * █  ██╔════╝██║██║     ██╔════╝    ██╔══██╗██╔══██╗██╔════╝██║   ██║        █
 * █  █████╗  ██║██║     █████╗      ██████╔╝██████╔╝█████╗  ██║   ██║        █
 * █  ██╔══╝  ██║██║     ██╔══╝      ██╔═══╝ ██╔══██╗██╔══╝  ╚██╗ ██╔╝        █
 * █  ██║     ██║███████╗███████╗    ██║     ██║  ██║███████╗ ╚████╔╝         █
 * █  ╚═╝     ╚═╝╚══════╝╚══════╝    ╚═╝     ╚═╝  ╚═╝╚══════╝  ╚═══╝          █
 * █                                                                          █
 * █   BAEL FILE PREVIEW - Quick File Preview Panel                          █
 * █   Preview files without opening them fully (Ctrl+Shift+E)               █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function() {
    'use strict';

    class BaelFilePreview {
        constructor() {
            this.version = '1.0.0';
            this.initialized = false;
            this.visible = false;
            this.container = null;
            this.currentFile = null;
        }

        async initialize() {
            console.log('📄 Bael File Preview initializing...');
            
            this.injectStyles();
            this.createContainer();
            this.setupShortcuts();
            
            this.initialized = true;
            console.log('✅ BAEL FILE PREVIEW READY');
            
            return this;
        }

        injectStyles() {
            if (document.getElementById('bael-file-preview-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'bael-file-preview-styles';
            styles.textContent = `
                .bael-file-preview-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                    z-index: 9900;
                    opacity: 0;
                    transition: opacity 0.25s ease;
                    pointer-events: none;
                }
                
                .bael-file-preview-overlay.visible {
                    opacity: 1;
                    pointer-events: auto;
                }
                
                .bael-file-preview-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.95);
                    width: 80vw;
                    max-width: 1000px;
                    height: 80vh;
                    max-height: 700px;
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
                
                .bael-file-preview-overlay.visible .bael-file-preview-modal {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                
                .preview-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: rgba(255, 255, 255, 0.03);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .preview-title-section {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .preview-icon {
                    font-size: 28px;
                }
                
                .preview-info h3 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 600;
                    color: #fff;
                }
                
                .preview-info p {
                    margin: 4px 0 0;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                }
                
                .preview-actions {
                    display: flex;
                    gap: 8px;
                }
                
                .preview-btn {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: none;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .preview-btn.primary {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: #fff;
                }
                
                .preview-btn.primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
                }
                
                .preview-btn.secondary {
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.8);
                }
                
                .preview-btn.secondary:hover {
                    background: rgba(255, 255, 255, 0.12);
                }
                
                .preview-close {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                
                .preview-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }
                
                .preview-content {
                    flex: 1;
                    overflow: auto;
                    padding: 0;
                }
                
                .preview-code {
                    padding: 20px;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    font-size: 13px;
                    line-height: 1.6;
                    color: #e4e4e7;
                    white-space: pre-wrap;
                    background: transparent;
                    margin: 0;
                }
                
                .preview-image {
                    max-width: 100%;
                    max-height: 100%;
                    object-fit: contain;
                    display: block;
                    margin: auto;
                }
                
                .preview-markdown {
                    padding: 24px;
                    color: #e4e4e7;
                    line-height: 1.7;
                }
                
                .preview-markdown h1, .preview-markdown h2, .preview-markdown h3 {
                    color: #fff;
                    margin-top: 24px;
                    margin-bottom: 12px;
                }
                
                .preview-markdown p {
                    margin: 12px 0;
                }
                
                .preview-markdown code {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: 'JetBrains Mono', monospace;
                }
                
                .preview-markdown pre {
                    background: rgba(0, 0, 0, 0.3);
                    padding: 16px;
                    border-radius: 8px;
                    overflow-x: auto;
                }
                
                .preview-pdf {
                    width: 100%;
                    height: 100%;
                    border: none;
                }
                
                .preview-audio, .preview-video {
                    width: 100%;
                    max-width: 600px;
                    display: block;
                    margin: 40px auto;
                }
                
                .preview-footer {
                    padding: 12px 20px;
                    background: rgba(255, 255, 255, 0.03);
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                }
                
                .preview-stats {
                    display: flex;
                    gap: 16px;
                }
                
                .preview-stat {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .preview-loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    gap: 16px;
                    color: rgba(255, 255, 255, 0.6);
                }
                
                .preview-loading .spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid rgba(99, 102, 241, 0.2);
                    border-top-color: #6366f1;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                .preview-error {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    gap: 16px;
                    color: rgba(255, 255, 255, 0.6);
                }
                
                .preview-error .error-icon {
                    font-size: 48px;
                }
                
                .line-numbers {
                    counter-reset: line;
                }
                
                .line-numbers .line::before {
                    counter-increment: line;
                    content: counter(line);
                    display: inline-block;
                    width: 40px;
                    margin-right: 16px;
                    text-align: right;
                    color: rgba(255, 255, 255, 0.3);
                    user-select: none;
                }
            `;
            document.head.appendChild(styles);
        }

        createContainer() {
            this.container = document.createElement('div');
            this.container.id = 'bael-file-preview';
            this.container.className = 'bael-file-preview-overlay';
            
            this.container.innerHTML = `
                <div class="bael-file-preview-modal">
                    <div class="preview-header">
                        <div class="preview-title-section">
                            <span class="preview-icon">📄</span>
                            <div class="preview-info">
                                <h3 class="preview-filename">No file selected</h3>
                                <p class="preview-path">-</p>
                            </div>
                        </div>
                        <div class="preview-actions">
                            <button class="preview-btn secondary" onclick="BaelFilePreview.copyContent()">
                                📋 Copy
                            </button>
                            <button class="preview-btn secondary" onclick="BaelFilePreview.download()">
                                ⬇️ Download
                            </button>
                            <button class="preview-btn primary" onclick="BaelFilePreview.openFull()">
                                📂 Open
                            </button>
                            <button class="preview-close" onclick="BaelFilePreview.hide()">✕</button>
                        </div>
                    </div>
                    <div class="preview-content">
                        <div class="preview-loading">
                            <div class="spinner"></div>
                            <span>Loading preview...</span>
                        </div>
                    </div>
                    <div class="preview-footer">
                        <div class="preview-stats">
                            <span class="preview-stat"><span>📊</span> <span class="file-size">-</span></span>
                            <span class="preview-stat"><span>📅</span> <span class="file-modified">-</span></span>
                            <span class="preview-stat"><span>📝</span> <span class="file-lines">-</span></span>
                        </div>
                        <span class="preview-hint">Press Esc to close • Arrow keys to navigate</span>
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
                // Ctrl+Shift+E to show file preview
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'e') {
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

        getFileIcon(filename) {
            const ext = filename.split('.').pop()?.toLowerCase() || '';
            const icons = {
                'js': '📜', 'ts': '📘', 'jsx': '⚛️', 'tsx': '⚛️',
                'py': '🐍', 'rb': '💎', 'go': '🔵', 'rs': '🦀',
                'html': '🌐', 'css': '🎨', 'scss': '🎨', 'less': '🎨',
                'json': '📋', 'yaml': '📋', 'yml': '📋', 'xml': '📋',
                'md': '📝', 'txt': '📄', 'log': '📜',
                'png': '🖼️', 'jpg': '🖼️', 'jpeg': '🖼️', 'gif': '🖼️', 'svg': '🖼️',
                'mp3': '🎵', 'wav': '🎵', 'ogg': '🎵',
                'mp4': '🎬', 'mov': '🎬', 'avi': '🎬',
                'pdf': '📕', 'doc': '📘', 'docx': '📘',
                'zip': '📦', 'tar': '📦', 'gz': '📦',
                'sh': '💻', 'bash': '💻', 'zsh': '💻'
            };
            return icons[ext] || '📄';
        }

        getFileType(filename) {
            const ext = filename.split('.').pop()?.toLowerCase() || '';
            
            const codeExts = ['js', 'ts', 'jsx', 'tsx', 'py', 'rb', 'go', 'rs', 'java', 'c', 'cpp', 'h', 'cs', 'php', 'sh', 'bash', 'zsh', 'html', 'css', 'scss', 'less', 'json', 'yaml', 'yml', 'xml', 'sql'];
            const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico', 'bmp'];
            const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'm4a'];
            const videoExts = ['mp4', 'mov', 'avi', 'webm', 'mkv'];
            const pdfExts = ['pdf'];
            const markdownExts = ['md', 'markdown'];
            
            if (codeExts.includes(ext)) return 'code';
            if (imageExts.includes(ext)) return 'image';
            if (audioExts.includes(ext)) return 'audio';
            if (videoExts.includes(ext)) return 'video';
            if (pdfExts.includes(ext)) return 'pdf';
            if (markdownExts.includes(ext)) return 'markdown';
            return 'text';
        }

        formatSize(bytes) {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        async show(file = null) {
            this.visible = true;
            this.container.classList.add('visible');
            
            if (file) {
                await this.loadFile(file);
            }
        }

        hide() {
            this.visible = false;
            this.container.classList.remove('visible');
        }

        async loadFile(file) {
            this.currentFile = file;
            const contentEl = this.container.querySelector('.preview-content');
            
            // Update header
            this.container.querySelector('.preview-icon').textContent = this.getFileIcon(file.name);
            this.container.querySelector('.preview-filename').textContent = file.name;
            this.container.querySelector('.preview-path').textContent = file.path || 'Unknown path';
            
            // Show loading
            contentEl.innerHTML = `
                <div class="preview-loading">
                    <div class="spinner"></div>
                    <span>Loading preview...</span>
                </div>
            `;
            
            try {
                const fileType = this.getFileType(file.name);
                const content = await this.fetchFileContent(file);
                
                switch (fileType) {
                    case 'code':
                        this.renderCode(content);
                        break;
                    case 'image':
                        this.renderImage(file);
                        break;
                    case 'audio':
                        this.renderAudio(file);
                        break;
                    case 'video':
                        this.renderVideo(file);
                        break;
                    case 'pdf':
                        this.renderPdf(file);
                        break;
                    case 'markdown':
                        this.renderMarkdown(content);
                        break;
                    default:
                        this.renderText(content);
                }
                
                // Update stats
                this.container.querySelector('.file-size').textContent = this.formatSize(content?.length || 0);
                this.container.querySelector('.file-lines').textContent = `${(content?.split('\n')?.length || 0)} lines`;
                this.container.querySelector('.file-modified').textContent = file.modified || 'Unknown';
                
            } catch (error) {
                contentEl.innerHTML = `
                    <div class="preview-error">
                        <span class="error-icon">❌</span>
                        <span>Failed to load preview</span>
                        <small>${error.message}</small>
                    </div>
                `;
            }
        }

        async fetchFileContent(file) {
            // Try to get content from the file object
            if (file.content) return file.content;
            
            // Fetch from API
            if (file.path) {
                try {
                    const response = await fetch(`/api/file?path=${encodeURIComponent(file.path)}`);
                    if (response.ok) {
                        return await response.text();
                    }
                } catch (e) {
                    console.warn('Failed to fetch file:', e);
                }
            }
            
            return 'Preview not available';
        }

        renderCode(content) {
            const contentEl = this.container.querySelector('.preview-content');
            const lines = content.split('\n');
            const numberedLines = lines.map(line => `<div class="line">${this.escapeHtml(line) || '&nbsp;'}</div>`).join('');
            
            contentEl.innerHTML = `<pre class="preview-code line-numbers">${numberedLines}</pre>`;
        }

        renderText(content) {
            const contentEl = this.container.querySelector('.preview-content');
            contentEl.innerHTML = `<pre class="preview-code">${this.escapeHtml(content)}</pre>`;
        }

        renderMarkdown(content) {
            const contentEl = this.container.querySelector('.preview-content');
            // Simple markdown rendering
            let html = content
                .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br>');
            
            contentEl.innerHTML = `<div class="preview-markdown">${html}</div>`;
        }

        renderImage(file) {
            const contentEl = this.container.querySelector('.preview-content');
            const src = file.url || file.path || URL.createObjectURL(file);
            contentEl.innerHTML = `<img class="preview-image" src="${src}" alt="${file.name}">`;
        }

        renderAudio(file) {
            const contentEl = this.container.querySelector('.preview-content');
            const src = file.url || file.path;
            contentEl.innerHTML = `<audio class="preview-audio" controls src="${src}"></audio>`;
        }

        renderVideo(file) {
            const contentEl = this.container.querySelector('.preview-content');
            const src = file.url || file.path;
            contentEl.innerHTML = `<video class="preview-video" controls src="${src}"></video>`;
        }

        renderPdf(file) {
            const contentEl = this.container.querySelector('.preview-content');
            const src = file.url || file.path;
            contentEl.innerHTML = `<iframe class="preview-pdf" src="${src}"></iframe>`;
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // ═══════════════════════════════════════════════════════════════════════
        // ACTIONS
        // ═══════════════════════════════════════════════════════════════════════

        copyContent() {
            if (!this.currentFile) return;
            
            const code = this.container.querySelector('.preview-code');
            if (code) {
                navigator.clipboard.writeText(code.textContent).then(() => {
                    window.dispatchEvent(new CustomEvent('bael:toast', {
                        detail: { message: 'Content copied!', type: 'success' }
                    }));
                });
            }
        }

        download() {
            if (!this.currentFile) return;
            window.dispatchEvent(new CustomEvent('bael:download-file', {
                detail: this.currentFile
            }));
        }

        openFull() {
            if (!this.currentFile) return;
            window.dispatchEvent(new CustomEvent('bael:open-file', {
                detail: this.currentFile
            }));
            this.hide();
        }

        // Preview a file from file browser interaction
        previewFromSelection() {
            const selectedFile = document.querySelector('.file-item.selected, [data-file].selected');
            if (selectedFile) {
                const file = {
                    name: selectedFile.dataset.filename || selectedFile.textContent,
                    path: selectedFile.dataset.path || selectedFile.dataset.file
                };
                this.show(file);
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    window.BaelFilePreview = new BaelFilePreview();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.BaelFilePreview.initialize();
        });
    } else {
        window.BaelFilePreview.initialize();
    }

    console.log('📄 Bael File Preview loaded');
})();
