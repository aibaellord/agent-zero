/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   ██████╗ ██████╗ ███████╗███████╗███████╗████████╗███████╗             █
 * █   ██╔══██╗██╔══██╗██╔════╝██╔════╝██╔════╝╚══██╔══╝██╔════╝             █
 * █   ██████╔╝██████╔╝█████╗  ███████╗█████╗     ██║   ███████╗             █
 * █   ██╔═══╝ ██╔══██╗██╔══╝  ╚════██║██╔══╝     ██║   ╚════██║             █
 * █   ██║     ██║  ██║███████╗███████║███████╗   ██║   ███████║             █
 * █   ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝   ╚═╝   ╚══════╝             █
 * █                                                                          █
 * █   BAEL PRESET MANAGER - Save & Apply Configuration Presets              █
 * █   Quick switching between different agent configurations                █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function() {
    'use strict';

    class BaelPresetManager {
        constructor() {
            this.version = '1.0.0';
            this.initialized = false;
            this.visible = false;
            this.container = null;
            
            this.presets = [];
            this.activePreset = null;
        }

        async initialize() {
            console.log('🎨 Bael Preset Manager initializing...');
            
            this.loadPresets();
            this.injectStyles();
            this.createContainer();
            this.setupShortcuts();
            this.initDefaultPresets();
            
            this.initialized = true;
            console.log('✅ BAEL PRESET MANAGER READY');
            
            return this;
        }

        injectStyles() {
            if (document.getElementById('bael-preset-manager-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'bael-preset-manager-styles';
            styles.textContent = `
                .bael-preset-manager {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10008;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(8px);
                    align-items: center;
                    justify-content: center;
                }
                
                .bael-preset-manager.visible { display: flex; }
                
                .preset-dialog {
                    width: 700px;
                    max-width: 95vw;
                    max-height: 85vh;
                    background: #1a1a2e;
                    border-radius: 16px;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                
                .preset-header {
                    padding: 20px 24px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }
                
                .preset-header h2 {
                    font-size: 18px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .preset-close {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                }
                
                .preset-close:hover {
                    background: rgba(239, 68, 68, 0.3);
                }
                
                .preset-tabs {
                    display: flex;
                    padding: 12px 24px;
                    gap: 8px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .preset-tab {
                    padding: 8px 16px;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s;
                }
                
                .preset-tab:hover {
                    background: rgba(255, 255, 255, 0.08);
                    color: #fff;
                }
                
                .preset-tab.active {
                    background: rgba(99, 102, 241, 0.2);
                    color: #a5b4fc;
                }
                
                .preset-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px 24px;
                }
                
                .preset-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 16px;
                }
                
                .preset-card {
                    background: rgba(255, 255, 255, 0.04);
                    border-radius: 12px;
                    padding: 20px;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 2px solid transparent;
                    position: relative;
                }
                
                .preset-card:hover {
                    background: rgba(255, 255, 255, 0.08);
                    transform: translateY(-2px);
                }
                
                .preset-card.active {
                    border-color: #6366f1;
                    background: rgba(99, 102, 241, 0.1);
                }
                
                .preset-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    margin-bottom: 14px;
                }
                
                .preset-icon.coding { background: rgba(34, 197, 94, 0.2); }
                .preset-icon.creative { background: rgba(168, 85, 247, 0.2); }
                .preset-icon.research { background: rgba(14, 165, 233, 0.2); }
                .preset-icon.assistant { background: rgba(245, 158, 11, 0.2); }
                .preset-icon.custom { background: rgba(99, 102, 241, 0.2); }
                
                .preset-name {
                    font-size: 15px;
                    font-weight: 600;
                    margin-bottom: 6px;
                }
                
                .preset-description {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                    line-height: 1.5;
                }
                
                .preset-badge {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .preset-badge.active {
                    background: rgba(34, 197, 94, 0.2);
                    color: #4ade80;
                }
                
                .preset-badge.builtin {
                    background: rgba(99, 102, 241, 0.2);
                    color: #a5b4fc;
                }
                
                .preset-actions {
                    position: absolute;
                    bottom: 12px;
                    right: 12px;
                    display: flex;
                    gap: 6px;
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                
                .preset-card:hover .preset-actions {
                    opacity: 1;
                }
                
                .preset-action-btn {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    border: none;
                    background: rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.7);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                }
                
                .preset-action-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                
                .preset-action-btn.delete:hover {
                    background: rgba(239, 68, 68, 0.3);
                    color: #f87171;
                }
                
                .create-preset-card {
                    background: transparent;
                    border: 2px dashed rgba(255, 255, 255, 0.15);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 150px;
                    cursor: pointer;
                }
                
                .create-preset-card:hover {
                    border-color: rgba(99, 102, 241, 0.5);
                    background: rgba(99, 102, 241, 0.05);
                }
                
                .create-icon {
                    font-size: 32px;
                    margin-bottom: 10px;
                    opacity: 0.5;
                }
                
                .create-text {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.5);
                }
                
                .preset-editor {
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: 12px;
                    padding: 20px;
                    margin-top: 16px;
                }
                
                .editor-row {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 16px;
                }
                
                .editor-field {
                    flex: 1;
                }
                
                .editor-field label {
                    display: block;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.6);
                    margin-bottom: 6px;
                }
                
                .editor-input {
                    width: 100%;
                    padding: 10px 12px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(0, 0, 0, 0.3);
                    color: #fff;
                    font-size: 14px;
                }
                
                .editor-input:focus {
                    outline: none;
                    border-color: #6366f1;
                }
                
                .editor-textarea {
                    width: 100%;
                    height: 100px;
                    padding: 10px 12px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(0, 0, 0, 0.3);
                    color: #fff;
                    font-size: 14px;
                    resize: vertical;
                }
                
                .editor-buttons {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                }
                
                .editor-btn {
                    padding: 10px 20px;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s;
                }
                
                .editor-btn.cancel {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }
                
                .editor-btn.save {
                    background: #6366f1;
                    color: #fff;
                }
                
                .editor-btn.save:hover {
                    background: #4f46e5;
                }
                
                .quick-apply-bar {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #1e1e2e;
                    border-radius: 12px;
                    padding: 12px 16px;
                    display: flex;
                    gap: 10px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                    z-index: 9500;
                    display: none;
                }
                
                .quick-apply-bar.visible { display: flex; }
                
                .quick-preset-btn {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: transparent;
                    color: #fff;
                    cursor: pointer;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s;
                }
                
                .quick-preset-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .quick-preset-btn.active {
                    background: rgba(99, 102, 241, 0.2);
                    border-color: #6366f1;
                }
            `;
            document.head.appendChild(styles);
        }

        createContainer() {
            this.container = document.createElement('div');
            this.container.id = 'bael-preset-manager';
            this.container.className = 'bael-preset-manager';
            
            this.container.innerHTML = this.getTemplate();
            document.body.appendChild(this.container);
            
            this.bindEvents();
        }

        getTemplate() {
            return `
                <div class="preset-dialog">
                    <div class="preset-header">
                        <h2>🎨 Preset Manager</h2>
                        <button class="preset-close" onclick="BaelPresetManager.hide()">×</button>
                    </div>
                    
                    <div class="preset-tabs">
                        <button class="preset-tab active" data-tab="all">All Presets</button>
                        <button class="preset-tab" data-tab="builtin">Built-in</button>
                        <button class="preset-tab" data-tab="custom">Custom</button>
                    </div>
                    
                    <div class="preset-content">
                        <div class="preset-grid" id="preset-grid"></div>
                    </div>
                </div>
            `;
        }

        bindEvents() {
            this.container.addEventListener('click', (e) => {
                if (e.target === this.container) this.hide();
            });
            
            // Tab switching
            this.container.querySelectorAll('.preset-tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    this.container.querySelectorAll('.preset-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                    this.renderPresets(tab.dataset.tab);
                });
            });
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.visible) this.hide();
            });
        }

        setupShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl+Shift+R for preset manager
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
                    e.preventDefault();
                    this.toggle();
                }
                
                // Quick preset switching: Ctrl+1-9
                if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
                    const num = parseInt(e.key);
                    if (num >= 1 && num <= 9) {
                        const preset = this.presets[num - 1];
                        if (preset) {
                            e.preventDefault();
                            this.applyPreset(preset);
                        }
                    }
                }
            });
        }

        initDefaultPresets() {
            const defaults = [
                {
                    id: 'coding',
                    name: 'Coding Mode',
                    description: 'Optimized for software development tasks',
                    icon: '💻',
                    category: 'coding',
                    builtin: true,
                    settings: {
                        temperature: 0.3,
                        maxTokens: 4000,
                        systemPromptAddition: 'Focus on clean, efficient code. Provide explanations when needed.'
                    }
                },
                {
                    id: 'creative',
                    name: 'Creative Mode',
                    description: 'Enhanced creativity for brainstorming',
                    icon: '🎨',
                    category: 'creative',
                    builtin: true,
                    settings: {
                        temperature: 0.9,
                        maxTokens: 2000,
                        systemPromptAddition: 'Be creative and think outside the box. Explore multiple possibilities.'
                    }
                },
                {
                    id: 'research',
                    name: 'Research Mode',
                    description: 'Deep analysis and fact-checking',
                    icon: '🔬',
                    category: 'research',
                    builtin: true,
                    settings: {
                        temperature: 0.2,
                        maxTokens: 8000,
                        systemPromptAddition: 'Provide detailed analysis. Cite sources when possible. Be thorough.'
                    }
                },
                {
                    id: 'assistant',
                    name: 'Assistant Mode',
                    description: 'General-purpose helpful assistant',
                    icon: '🤖',
                    category: 'assistant',
                    builtin: true,
                    settings: {
                        temperature: 0.5,
                        maxTokens: 2000,
                        systemPromptAddition: 'Be helpful, concise, and friendly.'
                    }
                }
            ];
            
            // Add defaults if not already present
            defaults.forEach(preset => {
                if (!this.presets.find(p => p.id === preset.id)) {
                    this.presets.push(preset);
                }
            });
            
            this.savePresets();
        }

        // ═══════════════════════════════════════════════════════════════════════
        // PRESET MANAGEMENT
        // ═══════════════════════════════════════════════════════════════════════

        loadPresets() {
            try {
                const stored = localStorage.getItem('bael_presets');
                this.presets = stored ? JSON.parse(stored) : [];
            } catch (e) {
                this.presets = [];
            }
            
            this.activePreset = localStorage.getItem('bael_active_preset');
        }

        savePresets() {
            localStorage.setItem('bael_presets', JSON.stringify(this.presets));
        }

        applyPreset(preset) {
            if (!preset) return;
            
            this.activePreset = preset.id;
            localStorage.setItem('bael_active_preset', preset.id);
            
            // Apply settings
            if (preset.settings) {
                window.dispatchEvent(new CustomEvent('bael:apply-preset', {
                    detail: preset
                }));
            }
            
            this.showNotification(`Applied: ${preset.name}`);
            this.renderPresets();
        }

        createPreset(data) {
            const preset = {
                id: Date.now().toString(),
                name: data.name,
                description: data.description,
                icon: data.icon || '⚙️',
                category: 'custom',
                builtin: false,
                settings: data.settings || {},
                createdAt: Date.now()
            };
            
            this.presets.push(preset);
            this.savePresets();
            this.renderPresets();
            
            return preset;
        }

        deletePreset(id) {
            const preset = this.presets.find(p => p.id === id);
            if (preset?.builtin) {
                this.showNotification('Cannot delete built-in presets');
                return;
            }
            
            this.presets = this.presets.filter(p => p.id !== id);
            this.savePresets();
            this.renderPresets();
        }

        duplicatePreset(id) {
            const original = this.presets.find(p => p.id === id);
            if (!original) return;
            
            const copy = {
                ...original,
                id: Date.now().toString(),
                name: `${original.name} (Copy)`,
                builtin: false,
                category: 'custom',
                createdAt: Date.now()
            };
            
            this.presets.push(copy);
            this.savePresets();
            this.renderPresets();
        }

        showNotification(message) {
            // Use existing notification system or create simple one
            if (window.BaelNotifications) {
                window.BaelNotifications.show(message);
            } else {
                console.log('Preset:', message);
            }
        }

        // ═══════════════════════════════════════════════════════════════════════
        // RENDERING
        // ═══════════════════════════════════════════════════════════════════════

        renderPresets(filter = 'all') {
            const grid = this.container.querySelector('#preset-grid');
            if (!grid) return;
            
            let filtered = this.presets;
            if (filter === 'builtin') {
                filtered = this.presets.filter(p => p.builtin);
            } else if (filter === 'custom') {
                filtered = this.presets.filter(p => !p.builtin);
            }
            
            let html = filtered.map(preset => `
                <div class="preset-card ${preset.id === this.activePreset ? 'active' : ''}"
                     onclick="BaelPresetManager.applyPreset(BaelPresetManager.getPreset('${preset.id}'))">
                    <div class="preset-icon ${preset.category}">${preset.icon}</div>
                    <div class="preset-name">${this.escapeHtml(preset.name)}</div>
                    <div class="preset-description">${this.escapeHtml(preset.description)}</div>
                    ${preset.id === this.activePreset ? '<span class="preset-badge active">Active</span>' : ''}
                    ${preset.builtin ? '<span class="preset-badge builtin">Built-in</span>' : ''}
                    <div class="preset-actions">
                        <button class="preset-action-btn" title="Duplicate"
                                onclick="event.stopPropagation(); BaelPresetManager.duplicatePreset('${preset.id}')">📋</button>
                        ${!preset.builtin ? `
                            <button class="preset-action-btn delete" title="Delete"
                                    onclick="event.stopPropagation(); BaelPresetManager.deletePreset('${preset.id}')">🗑</button>
                        ` : ''}
                    </div>
                </div>
            `).join('');
            
            // Add create button
            html += `
                <div class="preset-card create-preset-card" onclick="BaelPresetManager.showCreateForm()">
                    <span class="create-icon">➕</span>
                    <span class="create-text">Create New Preset</span>
                </div>
            `;
            
            grid.innerHTML = html;
        }

        getPreset(id) {
            return this.presets.find(p => p.id === id);
        }

        showCreateForm() {
            const name = prompt('Preset name:');
            if (!name) return;
            
            const description = prompt('Description:') || '';
            const icon = prompt('Icon (emoji):', '⚙️') || '⚙️';
            
            this.createPreset({
                name,
                description,
                icon,
                settings: {
                    temperature: 0.5,
                    maxTokens: 4000
                }
            });
        }

        escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        // ═══════════════════════════════════════════════════════════════════════
        // VISIBILITY
        // ═══════════════════════════════════════════════════════════════════════

        show() {
            this.renderPresets();
            this.container.classList.add('visible');
            this.visible = true;
        }

        hide() {
            this.container.classList.remove('visible');
            this.visible = false;
        }

        toggle() {
            if (this.visible) this.hide();
            else this.show();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    window.BaelPresetManager = new BaelPresetManager();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.BaelPresetManager.initialize();
        });
    } else {
        window.BaelPresetManager.initialize();
    }

    console.log('🎨 Bael Preset Manager loaded');
})();
