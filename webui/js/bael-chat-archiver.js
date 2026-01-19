/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   ██████╗██╗  ██╗ █████╗ ████████╗                                       █
 * █  ██╔════╝██║  ██║██╔══██╗╚══██╔══╝                                       █
 * █  ██║     ███████║███████║   ██║                                          █
 * █  ██║     ██╔══██║██╔══██║   ██║                                          █
 * █  ╚██████╗██║  ██║██║  ██║   ██║                                          █
 * █   ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝                                          █
 * █                                                                          █
 * █   BAEL CHAT ARCHIVER - Archive & Export Conversations                    █
 * █   Save important chats, tag them, search archives                        █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function() {
    'use strict';

    class BaelChatArchiver {
        constructor() {
            this.version = '1.0.0';
            this.initialized = false;
            this.visible = false;
            this.container = null;
            this.archives = [];
            this.searchQuery = '';
            this.selectedTag = 'all';
            this.tags = ['all', 'important', 'work', 'research', 'code', 'personal'];
        }

        async initialize() {
            console.log('📦 Bael Chat Archiver initializing...');
            
            this.loadArchives();
            this.injectStyles();
            this.createContainer();
            this.setupShortcuts();
            this.listenForArchiveRequests();
            
            this.initialized = true;
            console.log('✅ BAEL CHAT ARCHIVER READY');
            
            return this;
        }

        loadArchives() {
            try {
                const saved = localStorage.getItem('bael-chat-archives');
                if (saved) {
                    this.archives = JSON.parse(saved);
                }
            } catch (e) {
                this.archives = [];
            }
        }

        saveArchives() {
            try {
                localStorage.setItem('bael-chat-archives', JSON.stringify(this.archives));
            } catch (e) {}
        }

        injectStyles() {
            if (document.getElementById('bael-archiver-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'bael-archiver-styles';
            styles.textContent = `
                .bael-archiver-container {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.95);
                    width: 90%;
                    max-width: 900px;
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
                
                .bael-archiver-container.visible {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                    pointer-events: auto;
                }
                
                .bael-archiver-backdrop {
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
                
                .bael-archiver-backdrop.visible {
                    opacity: 1;
                    pointer-events: auto;
                }
                
                .archiver-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .archiver-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 18px;
                    font-weight: 600;
                    color: #fff;
                }
                
                .archiver-stats {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                
                .archiver-stat {
                    text-align: center;
                }
                
                .archiver-stat-value {
                    font-size: 18px;
                    font-weight: 600;
                    color: #f59e0b;
                }
                
                .archiver-stat-label {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.4);
                    text-transform: uppercase;
                }
                
                .archiver-actions {
                    display: flex;
                    gap: 10px;
                }
                
                .archiver-btn {
                    padding: 8px 14px;
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
                
                .archiver-btn.primary {
                    background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
                    color: #fff;
                }
                
                .archiver-btn.primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
                }
                
                .archiver-close {
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
                
                .archiver-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }
                
                .archiver-toolbar {
                    display: flex;
                    gap: 16px;
                    padding: 16px 24px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                }
                
                .archiver-search {
                    flex: 1;
                    position: relative;
                }
                
                .archiver-search-input {
                    width: 100%;
                    padding: 10px 14px;
                    padding-left: 40px;
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: #fff;
                    font-size: 14px;
                    outline: none;
                }
                
                .archiver-search-input:focus {
                    border-color: rgba(245, 158, 11, 0.5);
                }
                
                .archiver-search-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: rgba(255, 255, 255, 0.3);
                }
                
                .archiver-tags {
                    display: flex;
                    gap: 8px;
                }
                
                .archiver-tag {
                    padding: 8px 14px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-transform: capitalize;
                }
                
                .archiver-tag:hover {
                    background: rgba(255, 255, 255, 0.08);
                }
                
                .archiver-tag.active {
                    background: rgba(245, 158, 11, 0.2);
                    color: #f59e0b;
                }
                
                .archiver-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px 24px;
                }
                
                .archive-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .archive-card {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 14px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    overflow: hidden;
                    transition: all 0.2s;
                }
                
                .archive-card:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(245, 158, 11, 0.2);
                }
                
                .archive-card-header {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 16px;
                    cursor: pointer;
                }
                
                .archive-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    background: rgba(245, 158, 11, 0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    flex-shrink: 0;
                }
                
                .archive-info {
                    flex: 1;
                    min-width: 0;
                }
                
                .archive-title {
                    font-size: 15px;
                    font-weight: 500;
                    color: #fff;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .archive-meta {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-top: 4px;
                }
                
                .archive-date {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.4);
                }
                
                .archive-message-count {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    padding: 2px 8px;
                    background: rgba(255, 255, 255, 0.06);
                    border-radius: 10px;
                }
                
                .archive-tags {
                    display: flex;
                    gap: 6px;
                }
                
                .archive-tag-badge {
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 500;
                    text-transform: uppercase;
                }
                
                .archive-tag-badge.important { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
                .archive-tag-badge.work { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
                .archive-tag-badge.research { background: rgba(139, 92, 246, 0.2); color: #8b5cf6; }
                .archive-tag-badge.code { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
                .archive-tag-badge.personal { background: rgba(236, 72, 153, 0.2); color: #ec4899; }
                
                .archive-actions {
                    display: flex;
                    gap: 8px;
                }
                
                .archive-action {
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
                
                .archive-action:hover {
                    background: rgba(255, 255, 255, 0.12);
                    color: #fff;
                }
                
                .archive-action.delete:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }
                
                .archive-preview {
                    padding: 0 16px 16px;
                    display: none;
                }
                
                .archive-card.expanded .archive-preview {
                    display: block;
                }
                
                .preview-messages {
                    max-height: 200px;
                    overflow-y: auto;
                    padding: 12px;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 10px;
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.7);
                    line-height: 1.5;
                }
                
                .preview-message {
                    margin-bottom: 10px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }
                
                .preview-message:last-child {
                    margin-bottom: 0;
                    padding-bottom: 0;
                    border-bottom: none;
                }
                
                .preview-role {
                    font-size: 11px;
                    font-weight: 600;
                    color: #f59e0b;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                }
                
                .empty-archives {
                    text-align: center;
                    padding: 60px 20px;
                    color: rgba(255, 255, 255, 0.3);
                }
                
                .empty-archives-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }
            `;
            document.head.appendChild(styles);
        }

        createContainer() {
            // Create backdrop
            this.backdrop = document.createElement('div');
            this.backdrop.className = 'bael-archiver-backdrop';
            this.backdrop.onclick = () => this.hide();
            document.body.appendChild(this.backdrop);
            
            // Create main container
            this.container = document.createElement('div');
            this.container.id = 'bael-chat-archiver';
            this.container.className = 'bael-archiver-container';
            
            this.renderContainer();
            
            document.body.appendChild(this.container);
        }

        renderContainer() {
            const filtered = this.getFilteredArchives();
            
            this.container.innerHTML = `
                <div class="archiver-header">
                    <div class="archiver-title">
                        <span>📦</span> Chat Archives
                    </div>
                    <div class="archiver-stats">
                        <div class="archiver-stat">
                            <div class="archiver-stat-value">${this.archives.length}</div>
                            <div class="archiver-stat-label">Archives</div>
                        </div>
                        <div class="archiver-stat">
                            <div class="archiver-stat-value">${this.getTotalMessages()}</div>
                            <div class="archiver-stat-label">Messages</div>
                        </div>
                    </div>
                    <div class="archiver-actions">
                        <button class="archiver-btn primary" onclick="BaelChatArchiver.archiveCurrentChat()">
                            📥 Archive Current Chat
                        </button>
                        <button class="archiver-close" onclick="BaelChatArchiver.hide()">✕</button>
                    </div>
                </div>
                <div class="archiver-toolbar">
                    <div class="archiver-search">
                        <span class="archiver-search-icon">🔍</span>
                        <input type="text" class="archiver-search-input" 
                               placeholder="Search archives..."
                               value="${this.searchQuery}"
                               oninput="BaelChatArchiver.search(this.value)">
                    </div>
                    <div class="archiver-tags">
                        ${this.tags.map(tag => `
                            <button class="archiver-tag ${this.selectedTag === tag ? 'active' : ''}"
                                    onclick="BaelChatArchiver.selectTag('${tag}')">
                                ${tag}
                            </button>
                        `).join('')}
                    </div>
                </div>
                <div class="archiver-content">
                    ${filtered.length === 0 ? `
                        <div class="empty-archives">
                            <div class="empty-archives-icon">📦</div>
                            <div>No archives found. Archive your first chat!</div>
                        </div>
                    ` : `
                        <div class="archive-list">
                            ${filtered.map(archive => this.renderArchiveCard(archive)).join('')}
                        </div>
                    `}
                </div>
            `;
        }

        renderArchiveCard(archive) {
            return `
                <div class="archive-card" data-id="${archive.id}">
                    <div class="archive-card-header" onclick="BaelChatArchiver.toggleExpand('${archive.id}')">
                        <div class="archive-icon">💬</div>
                        <div class="archive-info">
                            <div class="archive-title">${archive.title}</div>
                            <div class="archive-meta">
                                <span class="archive-date">${this.formatDate(archive.archivedAt)}</span>
                                <span class="archive-message-count">${archive.messages.length} messages</span>
                            </div>
                        </div>
                        <div class="archive-tags">
                            ${archive.tags.map(tag => `
                                <span class="archive-tag-badge ${tag}">${tag}</span>
                            `).join('')}
                        </div>
                        <div class="archive-actions" onclick="event.stopPropagation()">
                            <button class="archive-action" onclick="BaelChatArchiver.exportArchive('${archive.id}')" title="Export">
                                📤
                            </button>
                            <button class="archive-action" onclick="BaelChatArchiver.editTags('${archive.id}')" title="Edit Tags">
                                🏷️
                            </button>
                            <button class="archive-action delete" onclick="BaelChatArchiver.deleteArchive('${archive.id}')" title="Delete">
                                🗑
                            </button>
                        </div>
                    </div>
                    <div class="archive-preview">
                        <div class="preview-messages">
                            ${archive.messages.slice(0, 5).map(msg => `
                                <div class="preview-message">
                                    <div class="preview-role">${msg.role}</div>
                                    <div class="preview-content">${this.truncate(msg.content, 200)}</div>
                                </div>
                            `).join('')}
                            ${archive.messages.length > 5 ? `
                                <div style="text-align: center; color: rgba(255,255,255,0.3); font-size: 12px; margin-top: 10px;">
                                    ... and ${archive.messages.length - 5} more messages
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }

        getFilteredArchives() {
            let archives = [...this.archives];
            
            // Filter by tag
            if (this.selectedTag !== 'all') {
                archives = archives.filter(a => a.tags.includes(this.selectedTag));
            }
            
            // Filter by search
            if (this.searchQuery) {
                const q = this.searchQuery.toLowerCase();
                archives = archives.filter(a => 
                    a.title.toLowerCase().includes(q) ||
                    a.messages.some(m => m.content.toLowerCase().includes(q))
                );
            }
            
            // Sort by date (newest first)
            archives.sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt));
            
            return archives;
        }

        getTotalMessages() {
            return this.archives.reduce((sum, a) => sum + a.messages.length, 0);
        }

        formatDate(iso) {
            const d = new Date(iso);
            return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }

        truncate(text, maxLength) {
            if (!text) return '';
            if (text.length <= maxLength) return text;
            return text.substring(0, maxLength) + '...';
        }

        setupShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl+Shift+A for archiver
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
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

        listenForArchiveRequests() {
            window.addEventListener('bael:archive-chat', (e) => {
                this.archiveChat(e.detail);
            });
        }

        show() {
            this.visible = true;
            this.backdrop.classList.add('visible');
            this.container.classList.add('visible');
            this.renderContainer();
        }

        hide() {
            this.visible = false;
            this.backdrop.classList.remove('visible');
            this.container.classList.remove('visible');
        }

        search(query) {
            this.searchQuery = query;
            this.renderContainer();
        }

        selectTag(tag) {
            this.selectedTag = tag;
            this.renderContainer();
        }

        toggleExpand(id) {
            const card = this.container.querySelector(`[data-id="${id}"]`);
            if (card) {
                card.classList.toggle('expanded');
            }
        }

        async archiveCurrentChat() {
            // Try to get current chat from Alpine store or DOM
            let messages = [];
            let title = 'Archived Chat';
            
            try {
                // Try Alpine store
                if (window.Alpine?.store?.('chat')) {
                    const chatStore = Alpine.store('chat');
                    messages = chatStore.messages || [];
                    title = chatStore.title || `Chat ${new Date().toLocaleDateString()}`;
                }
                
                // If no messages from store, try to scrape from DOM
                if (messages.length === 0) {
                    const messageEls = document.querySelectorAll('.chat-message, [class*="message"]');
                    messageEls.forEach(el => {
                        const roleEl = el.querySelector('.role, [class*="role"]');
                        const contentEl = el.querySelector('.content, [class*="content"]');
                        if (contentEl) {
                            messages.push({
                                role: roleEl?.textContent?.trim() || 'unknown',
                                content: contentEl.textContent?.trim() || ''
                            });
                        }
                    });
                }
            } catch (e) {
                console.error('Failed to get chat messages:', e);
            }
            
            if (messages.length === 0) {
                window.dispatchEvent(new CustomEvent('bael:toast', {
                    detail: { message: 'No messages to archive', type: 'warning' }
                }));
                return;
            }
            
            const customTitle = prompt('Archive title:', title);
            if (!customTitle) return;
            
            const tagStr = prompt('Tags (comma-separated):', 'work');
            const tags = tagStr ? tagStr.split(',').map(t => t.trim().toLowerCase()).filter(t => t) : [];
            
            this.archiveChat({
                title: customTitle,
                messages,
                tags
            });
        }

        archiveChat(data) {
            const archive = {
                id: Date.now().toString(),
                title: data.title || 'Archived Chat',
                messages: data.messages || [],
                tags: data.tags || [],
                archivedAt: new Date().toISOString()
            };
            
            this.archives.unshift(archive);
            this.saveArchives();
            this.renderContainer();
            
            window.dispatchEvent(new CustomEvent('bael:toast', {
                detail: { message: 'Chat archived successfully!', type: 'success' }
            }));
        }

        exportArchive(id) {
            const archive = this.archives.find(a => a.id === id);
            if (!archive) return;
            
            const content = archive.messages.map(m => 
                `[${m.role.toUpperCase()}]\n${m.content}\n`
            ).join('\n---\n\n');
            
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${archive.title.replace(/[^a-z0-9]/gi, '_')}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        }

        editTags(id) {
            const archive = this.archives.find(a => a.id === id);
            if (!archive) return;
            
            const tagStr = prompt('Edit tags (comma-separated):', archive.tags.join(', '));
            if (tagStr === null) return;
            
            archive.tags = tagStr.split(',').map(t => t.trim().toLowerCase()).filter(t => t);
            this.saveArchives();
            this.renderContainer();
        }

        deleteArchive(id) {
            if (!confirm('Delete this archive?')) return;
            
            this.archives = this.archives.filter(a => a.id !== id);
            this.saveArchives();
            this.renderContainer();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    window.BaelChatArchiver = new BaelChatArchiver();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.BaelChatArchiver.initialize();
        });
    } else {
        window.BaelChatArchiver.initialize();
    }

    console.log('📦 Bael Chat Archiver loaded');
})();
