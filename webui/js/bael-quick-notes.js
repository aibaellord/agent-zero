/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   ██████╗ ██╗   ██╗██╗ ██████╗██╗  ██╗    ███╗   ██╗ ██████╗ ████████╗   █
 * █  ██╔═══██╗██║   ██║██║██╔════╝██║ ██╔╝    ████╗  ██║██╔═══██╗╚══██╔══╝   █
 * █  ██║   ██║██║   ██║██║██║     █████╔╝     ██╔██╗ ██║██║   ██║   ██║      █
 * █  ██║▄▄ ██║██║   ██║██║██║     ██╔═██╗     ██║╚██╗██║██║   ██║   ██║      █
 * █  ╚██████╔╝╚██████╔╝██║╚██████╗██║  ██╗    ██║ ╚████║╚██████╔╝   ██║      █
 * █   ╚══▀▀═╝  ╚═════╝ ╚═╝ ╚═════╝╚═╝  ╚═╝    ╚═╝  ╚═══╝ ╚═════╝    ╚═╝      █
 * █                                                                          █
 * █   BAEL QUICK NOTES - Fast Note-Taking & Scratch Pad (Ctrl+Shift+N)      █
 * █   Lightning-fast notes for ideas, reminders, and quick captures         █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function() {
    'use strict';

    class BaelQuickNotes {
        constructor() {
            this.version = '1.0.0';
            this.initialized = false;
            this.visible = false;
            this.container = null;
            this.notes = [];
            this.activeNote = null;
            this.autosaveTimer = null;
        }

        async initialize() {
            console.log('📝 Bael Quick Notes initializing...');
            
            this.loadFromStorage();
            this.injectStyles();
            this.createContainer();
            this.setupShortcuts();
            
            this.initialized = true;
            console.log('✅ BAEL QUICK NOTES READY');
            
            return this;
        }

        loadFromStorage() {
            try {
                const saved = localStorage.getItem('bael-quick-notes');
                if (saved) {
                    this.notes = JSON.parse(saved);
                } else {
                    this.notes = [this.createDefaultNote()];
                }
            } catch (e) {
                this.notes = [this.createDefaultNote()];
            }
        }

        createDefaultNote() {
            return {
                id: Date.now().toString(),
                title: 'Quick Notes',
                content: '',
                color: '#6366f1',
                pinned: false,
                created: Date.now(),
                modified: Date.now()
            };
        }

        saveToStorage() {
            try {
                localStorage.setItem('bael-quick-notes', JSON.stringify(this.notes));
            } catch (e) {
                console.error('Failed to save notes:', e);
            }
        }

        injectStyles() {
            if (document.getElementById('bael-quicknotes-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'bael-quicknotes-styles';
            styles.textContent = `
                .bael-quicknotes-overlay {
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
                
                .bael-quicknotes-overlay.visible {
                    opacity: 1;
                    pointer-events: auto;
                }
                
                .bael-quicknotes-modal {
                    width: 90vw;
                    max-width: 1000px;
                    height: 75vh;
                    background: #12121a;
                    border-radius: 16px;
                    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                    display: flex;
                    transform: scale(0.95);
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .bael-quicknotes-overlay.visible .bael-quicknotes-modal {
                    transform: scale(1);
                }
                
                .notes-sidebar {
                    width: 260px;
                    background: rgba(255, 255, 255, 0.03);
                    border-right: 1px solid rgba(255, 255, 255, 0.08);
                    display: flex;
                    flex-direction: column;
                }
                
                .notes-sidebar-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .notes-sidebar-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 15px;
                    font-weight: 600;
                    color: #fff;
                }
                
                .notes-add-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(99, 102, 241, 0.2);
                    color: #6366f1;
                    cursor: pointer;
                    font-size: 18px;
                    transition: all 0.2s;
                }
                
                .notes-add-btn:hover {
                    background: rgba(99, 102, 241, 0.3);
                    transform: scale(1.1);
                }
                
                .notes-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 10px;
                }
                
                .note-item {
                    padding: 12px 14px;
                    border-radius: 10px;
                    margin-bottom: 6px;
                    cursor: pointer;
                    transition: all 0.2s;
                    border-left: 3px solid transparent;
                }
                
                .note-item:hover {
                    background: rgba(255, 255, 255, 0.06);
                }
                
                .note-item.active {
                    background: rgba(99, 102, 241, 0.15);
                    border-left-color: #6366f1;
                }
                
                .note-item-title {
                    font-size: 13px;
                    font-weight: 500;
                    color: #fff;
                    margin-bottom: 4px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .note-item-title .pin {
                    color: #fbbf24;
                    font-size: 10px;
                }
                
                .note-item-preview {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .note-item-date {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.3);
                    margin-top: 4px;
                }
                
                .notes-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                }
                
                .notes-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .note-title-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    font-size: 18px;
                    font-weight: 600;
                    color: #fff;
                    outline: none;
                }
                
                .note-title-input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }
                
                .notes-actions {
                    display: flex;
                    gap: 8px;
                }
                
                .note-action {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.06);
                    color: rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.2s;
                }
                
                .note-action:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }
                
                .note-action.pin.active {
                    background: rgba(251, 191, 36, 0.2);
                    color: #fbbf24;
                }
                
                .note-action.delete:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }
                
                .notes-close {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.06);
                    color: rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    font-size: 18px;
                    transition: all 0.2s;
                }
                
                .notes-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }
                
                .notes-toolbar {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 10px 20px;
                    background: rgba(255, 255, 255, 0.02);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                }
                
                .toolbar-btn {
                    width: 32px;
                    height: 32px;
                    border-radius: 6px;
                    border: none;
                    background: rgba(255, 255, 255, 0.04);
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                
                .toolbar-btn:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                }
                
                .toolbar-separator {
                    width: 1px;
                    height: 20px;
                    background: rgba(255, 255, 255, 0.1);
                    margin: 0 6px;
                }
                
                .color-picker {
                    display: flex;
                    gap: 4px;
                }
                
                .color-option {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    border: 2px solid transparent;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .color-option:hover {
                    transform: scale(1.2);
                }
                
                .color-option.active {
                    border-color: #fff;
                }
                
                .notes-editor {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                }
                
                .notes-textarea {
                    width: 100%;
                    height: 100%;
                    background: transparent;
                    border: none;
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.9);
                    line-height: 1.7;
                    resize: none;
                    outline: none;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
                }
                
                .notes-textarea::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }
                
                .notes-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 20px;
                    background: rgba(255, 255, 255, 0.02);
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .notes-stats {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                }
                
                .notes-autosave {
                    font-size: 11px;
                    color: rgba(34, 197, 94, 0.8);
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }
                
                .notes-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: rgba(255, 255, 255, 0.3);
                }
                
                .notes-empty-icon {
                    font-size: 64px;
                    margin-bottom: 16px;
                }
            `;
            document.head.appendChild(styles);
        }

        createContainer() {
            this.container = document.createElement('div');
            this.container.id = 'bael-quick-notes';
            this.container.className = 'bael-quicknotes-overlay';
            
            this.container.innerHTML = `
                <div class="bael-quicknotes-modal">
                    <div class="notes-sidebar">
                        <div class="notes-sidebar-header">
                            <div class="notes-sidebar-title">
                                <span>📝</span> Notes
                            </div>
                            <button class="notes-add-btn" onclick="BaelQuickNotes.createNote()" title="New Note">+</button>
                        </div>
                        <div class="notes-list"></div>
                    </div>
                    <div class="notes-main">
                        <div class="notes-header">
                            <input type="text" class="note-title-input" placeholder="Note title..." 
                                   onchange="BaelQuickNotes.updateTitle(this.value)">
                            <div class="notes-actions">
                                <button class="note-action pin" onclick="BaelQuickNotes.togglePin()" title="Pin note">📌</button>
                                <button class="note-action" onclick="BaelQuickNotes.duplicateNote()" title="Duplicate">📄</button>
                                <button class="note-action" onclick="BaelQuickNotes.exportNote()" title="Export">📤</button>
                                <button class="note-action delete" onclick="BaelQuickNotes.deleteNote()" title="Delete">🗑️</button>
                                <button class="notes-close" onclick="BaelQuickNotes.hide()">✕</button>
                            </div>
                        </div>
                        <div class="notes-toolbar">
                            <button class="toolbar-btn" onclick="BaelQuickNotes.format('bold')" title="Bold">B</button>
                            <button class="toolbar-btn" onclick="BaelQuickNotes.format('italic')" title="Italic">I</button>
                            <button class="toolbar-btn" onclick="BaelQuickNotes.format('heading')" title="Heading">#</button>
                            <button class="toolbar-btn" onclick="BaelQuickNotes.format('list')" title="List">•</button>
                            <button class="toolbar-btn" onclick="BaelQuickNotes.format('check')" title="Checkbox">☑</button>
                            <div class="toolbar-separator"></div>
                            <div class="color-picker">
                                <div class="color-option active" style="background: #6366f1;" onclick="BaelQuickNotes.setColor('#6366f1')"></div>
                                <div class="color-option" style="background: #22c55e;" onclick="BaelQuickNotes.setColor('#22c55e')"></div>
                                <div class="color-option" style="background: #f59e0b;" onclick="BaelQuickNotes.setColor('#f59e0b')"></div>
                                <div class="color-option" style="background: #ef4444;" onclick="BaelQuickNotes.setColor('#ef4444')"></div>
                                <div class="color-option" style="background: #ec4899;" onclick="BaelQuickNotes.setColor('#ec4899')"></div>
                            </div>
                        </div>
                        <div class="notes-editor">
                            <textarea class="notes-textarea" placeholder="Start typing your note..."></textarea>
                        </div>
                        <div class="notes-footer">
                            <span class="notes-stats">0 characters • 0 words</span>
                            <span class="notes-autosave">✓ Auto-saved</span>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(this.container);
            
            // Setup textarea events
            const textarea = this.container.querySelector('.notes-textarea');
            textarea.addEventListener('input', () => this.onContentChange());
            
            // Close on overlay click
            this.container.addEventListener('click', (e) => {
                if (e.target === this.container) {
                    this.hide();
                }
            });
        }

        setupShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl+Shift+N for quick notes
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'N') {
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
            const list = this.container.querySelector('.notes-list');
            
            // Sort notes: pinned first, then by modified date
            const sortedNotes = [...this.notes].sort((a, b) => {
                if (a.pinned && !b.pinned) return -1;
                if (!a.pinned && b.pinned) return 1;
                return b.modified - a.modified;
            });
            
            list.innerHTML = sortedNotes.map(note => {
                const isActive = note.id === this.activeNote?.id;
                const preview = (note.content || '').substring(0, 50) || 'Empty note';
                const date = new Date(note.modified).toLocaleDateString();
                
                return `
                    <div class="note-item ${isActive ? 'active' : ''}" 
                         onclick="BaelQuickNotes.selectNote('${note.id}')"
                         style="border-left-color: ${note.color}">
                        <div class="note-item-title">
                            ${note.pinned ? '<span class="pin">📌</span>' : ''}
                            ${note.title || 'Untitled'}
                        </div>
                        <div class="note-item-preview">${this.escapeHtml(preview)}</div>
                        <div class="note-item-date">${date}</div>
                    </div>
                `;
            }).join('');
            
            // Render active note
            if (this.activeNote) {
                this.container.querySelector('.note-title-input').value = this.activeNote.title;
                this.container.querySelector('.notes-textarea').value = this.activeNote.content;
                this.container.querySelector('.note-action.pin').classList.toggle('active', this.activeNote.pinned);
                
                // Update color picker
                this.container.querySelectorAll('.color-option').forEach(opt => {
                    opt.classList.toggle('active', opt.style.background === this.activeNote.color);
                });
                
                this.updateStats();
            }
        }

        selectNote(noteId) {
            this.activeNote = this.notes.find(n => n.id === noteId);
            this.render();
        }

        createNote() {
            const note = {
                id: Date.now().toString(),
                title: 'New Note',
                content: '',
                color: '#6366f1',
                pinned: false,
                created: Date.now(),
                modified: Date.now()
            };
            
            this.notes.unshift(note);
            this.activeNote = note;
            this.saveToStorage();
            this.render();
            
            // Focus title
            setTimeout(() => {
                const titleInput = this.container.querySelector('.note-title-input');
                titleInput.select();
            }, 100);
        }

        updateTitle(title) {
            if (!this.activeNote) return;
            this.activeNote.title = title;
            this.activeNote.modified = Date.now();
            this.saveToStorage();
            this.render();
        }

        onContentChange() {
            if (!this.activeNote) return;
            
            const textarea = this.container.querySelector('.notes-textarea');
            this.activeNote.content = textarea.value;
            this.activeNote.modified = Date.now();
            
            this.updateStats();
            
            // Debounced autosave
            clearTimeout(this.autosaveTimer);
            this.autosaveTimer = setTimeout(() => {
                this.saveToStorage();
                this.showAutosaved();
            }, 500);
        }

        updateStats() {
            const content = this.activeNote?.content || '';
            const chars = content.length;
            const words = content.trim() ? content.trim().split(/\s+/).length : 0;
            
            this.container.querySelector('.notes-stats').textContent = 
                `${chars} characters • ${words} words`;
        }

        showAutosaved() {
            const indicator = this.container.querySelector('.notes-autosave');
            indicator.innerHTML = '✓ Saved';
            indicator.style.color = 'rgba(34, 197, 94, 0.8)';
            
            setTimeout(() => {
                indicator.innerHTML = '✓ Auto-saved';
            }, 1500);
        }

        togglePin() {
            if (!this.activeNote) return;
            this.activeNote.pinned = !this.activeNote.pinned;
            this.saveToStorage();
            this.render();
        }

        duplicateNote() {
            if (!this.activeNote) return;
            
            const duplicate = {
                ...this.activeNote,
                id: Date.now().toString(),
                title: `${this.activeNote.title} (copy)`,
                pinned: false,
                created: Date.now(),
                modified: Date.now()
            };
            
            this.notes.unshift(duplicate);
            this.activeNote = duplicate;
            this.saveToStorage();
            this.render();
        }

        exportNote() {
            if (!this.activeNote) return;
            
            const content = `# ${this.activeNote.title}\n\n${this.activeNote.content}`;
            const blob = new Blob([content], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.activeNote.title.replace(/[^a-z0-9]/gi, '_')}.md`;
            a.click();
            
            URL.revokeObjectURL(url);
        }

        deleteNote() {
            if (!this.activeNote) return;
            if (this.notes.length === 1) {
                this.toast('Cannot delete the last note', 'warning');
                return;
            }
            
            if (!confirm('Delete this note?')) return;
            
            const index = this.notes.findIndex(n => n.id === this.activeNote.id);
            this.notes = this.notes.filter(n => n.id !== this.activeNote.id);
            this.activeNote = this.notes[Math.min(index, this.notes.length - 1)];
            this.saveToStorage();
            this.render();
        }

        format(type) {
            const textarea = this.container.querySelector('.notes-textarea');
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const content = textarea.value;
            
            let prefix = '', suffix = '';
            
            switch (type) {
                case 'bold':
                    prefix = suffix = '**';
                    break;
                case 'italic':
                    prefix = suffix = '*';
                    break;
                case 'heading':
                    prefix = '## ';
                    break;
                case 'list':
                    prefix = '- ';
                    break;
                case 'check':
                    prefix = '- [ ] ';
                    break;
            }
            
            const newContent = content.substring(0, start) + prefix + 
                              content.substring(start, end) + suffix + 
                              content.substring(end);
            
            textarea.value = newContent;
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
            textarea.focus();
            
            this.onContentChange();
        }

        setColor(color) {
            if (!this.activeNote) return;
            this.activeNote.color = color;
            this.saveToStorage();
            this.render();
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        show() {
            this.visible = true;
            this.container.classList.add('visible');
            
            // Select first note if none active
            if (!this.activeNote && this.notes.length > 0) {
                this.activeNote = this.notes[0];
            }
            
            this.render();
            
            // Focus textarea
            setTimeout(() => {
                this.container.querySelector('.notes-textarea').focus();
            }, 100);
        }

        hide() {
            this.visible = false;
            this.container.classList.remove('visible');
            this.saveToStorage();
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

    window.BaelQuickNotes = new BaelQuickNotes();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.BaelQuickNotes.initialize();
        });
    } else {
        window.BaelQuickNotes.initialize();
    }

    console.log('📝 Bael Quick Notes loaded');
})();
