/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ███████╗██╗   ██╗███╗   ██╗ ██████╗                                     █
 * █  ██╔════╝╚██╗ ██╔╝████╗  ██║██╔════╝                                     █
 * █  ███████╗ ╚████╔╝ ██╔██╗ ██║██║                                          █
 * █  ╚════██║  ╚██╔╝  ██║╚██╗██║██║                                          █
 * █  ███████║   ██║   ██║ ╚████║╚██████╗                                     █
 * █  ╚══════╝   ╚═╝   ╚═╝  ╚═══╝ ╚═════╝                                     █
 * █                                                                          █
 * █   BAEL SYNC CENTER - Cross-Device Sync & Backup                          █
 * █   Sync settings, chats, and data across devices                          █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function() {
    'use strict';

    class BaelSyncCenter {
        constructor() {
            this.version = '1.0.0';
            this.initialized = false;
            this.visible = false;
            this.container = null;
            
            this.syncConfig = {
                lastSync: null,
                deviceId: null,
                autoSync: false,
                syncInterval: 300000, // 5 minutes
                syncItems: {
                    settings: true,
                    themes: true,
                    notes: true,
                    links: true,
                    templates: true,
                    history: true
                }
            };
            
            this.syncInterval = null;
        }

        async initialize() {
            console.log('🔄 Bael Sync Center initializing...');
            
            this.generateDeviceId();
            this.loadConfig();
            this.injectStyles();
            this.createContainer();
            this.setupShortcuts();
            
            if (this.syncConfig.autoSync) {
                this.startAutoSync();
            }
            
            this.initialized = true;
            console.log('✅ BAEL SYNC CENTER READY');
            
            return this;
        }

        generateDeviceId() {
            let deviceId = localStorage.getItem('bael-device-id');
            if (!deviceId) {
                deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('bael-device-id', deviceId);
            }
            this.syncConfig.deviceId = deviceId;
        }

        loadConfig() {
            try {
                const saved = localStorage.getItem('bael-sync-config');
                if (saved) {
                    this.syncConfig = { ...this.syncConfig, ...JSON.parse(saved) };
                }
            } catch (e) {}
        }

        saveConfig() {
            try {
                localStorage.setItem('bael-sync-config', JSON.stringify(this.syncConfig));
            } catch (e) {}
        }

        injectStyles() {
            if (document.getElementById('bael-sync-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'bael-sync-styles';
            styles.textContent = `
                .bael-sync-container {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.95);
                    width: 500px;
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
                
                .bael-sync-container.visible {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                    pointer-events: auto;
                }
                
                .bael-sync-backdrop {
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
                
                .bael-sync-backdrop.visible {
                    opacity: 1;
                    pointer-events: auto;
                }
                
                .sync-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(59, 130, 246, 0.1) 100%);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .sync-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 18px;
                    font-weight: 600;
                    color: #fff;
                }
                
                .sync-close {
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
                
                .sync-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }
                
                .sync-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                }
                
                .sync-status-card {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 16px;
                    padding: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    text-align: center;
                    margin-bottom: 24px;
                }
                
                .sync-icon {
                    font-size: 48px;
                    margin-bottom: 12px;
                }
                
                .sync-icon.syncing {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                .sync-status {
                    font-size: 16px;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 4px;
                }
                
                .sync-last {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.4);
                }
                
                .sync-device {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.3);
                    margin-top: 8px;
                    padding: 4px 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    display: inline-block;
                }
                
                .sync-actions {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                    margin-top: 16px;
                }
                
                .sync-btn {
                    padding: 10px 20px;
                    border-radius: 10px;
                    border: none;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .sync-btn.primary {
                    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
                    color: #fff;
                }
                
                .sync-btn.primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(6, 182, 212, 0.3);
                }
                
                .sync-btn.secondary {
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.7);
                }
                
                .sync-btn.secondary:hover {
                    background: rgba(255, 255, 255, 0.12);
                    color: #fff;
                }
                
                .sync-section {
                    margin-bottom: 24px;
                }
                
                .sync-section-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .sync-options {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .sync-option {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
                
                .sync-option-label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.7);
                }
                
                .sync-option-icon {
                    font-size: 18px;
                }
                
                .sync-toggle {
                    width: 44px;
                    height: 24px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.1);
                    position: relative;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .sync-toggle.active {
                    background: #06b6d4;
                }
                
                .sync-toggle::after {
                    content: '';
                    position: absolute;
                    width: 18px;
                    height: 18px;
                    border-radius: 50%;
                    background: #fff;
                    top: 3px;
                    left: 3px;
                    transition: all 0.2s;
                }
                
                .sync-toggle.active::after {
                    left: 23px;
                }
                
                .export-import-section {
                    display: flex;
                    gap: 12px;
                }
                
                .ei-card {
                    flex: 1;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 14px;
                    padding: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .ei-card:hover {
                    background: rgba(6, 182, 212, 0.08);
                    border-color: rgba(6, 182, 212, 0.3);
                }
                
                .ei-icon {
                    font-size: 32px;
                    margin-bottom: 10px;
                }
                
                .ei-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 4px;
                }
                
                .ei-desc {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                }
            `;
            document.head.appendChild(styles);
        }

        createContainer() {
            // Create backdrop
            this.backdrop = document.createElement('div');
            this.backdrop.className = 'bael-sync-backdrop';
            this.backdrop.onclick = () => this.hide();
            document.body.appendChild(this.backdrop);
            
            // Create main container
            this.container = document.createElement('div');
            this.container.id = 'bael-sync-center';
            this.container.className = 'bael-sync-container';
            
            this.renderContainer();
            
            document.body.appendChild(this.container);
        }

        renderContainer() {
            const lastSync = this.syncConfig.lastSync 
                ? new Date(this.syncConfig.lastSync).toLocaleString() 
                : 'Never';
            
            this.container.innerHTML = `
                <div class="sync-header">
                    <div class="sync-title">
                        <span>🔄</span> Sync Center
                    </div>
                    <button class="sync-close" onclick="BaelSyncCenter.hide()">✕</button>
                </div>
                <div class="sync-content">
                    <div class="sync-status-card">
                        <div class="sync-icon" id="sync-icon">☁️</div>
                        <div class="sync-status">Ready to Sync</div>
                        <div class="sync-last">Last sync: ${lastSync}</div>
                        <div class="sync-device">Device: ${this.syncConfig.deviceId}</div>
                        <div class="sync-actions">
                            <button class="sync-btn primary" onclick="BaelSyncCenter.syncNow()">
                                🔄 Sync Now
                            </button>
                        </div>
                    </div>
                    
                    <div class="sync-section">
                        <div class="sync-section-title">⚙️ Auto Sync</div>
                        <div class="sync-option">
                            <div class="sync-option-label">
                                <span class="sync-option-icon">🔄</span>
                                Enable Auto Sync
                            </div>
                            <div class="sync-toggle ${this.syncConfig.autoSync ? 'active' : ''}" 
                                 onclick="BaelSyncCenter.toggleAutoSync()"></div>
                        </div>
                    </div>
                    
                    <div class="sync-section">
                        <div class="sync-section-title">📦 Sync Items</div>
                        <div class="sync-options">
                            ${Object.entries(this.syncConfig.syncItems).map(([key, enabled]) => `
                                <div class="sync-option">
                                    <div class="sync-option-label">
                                        <span class="sync-option-icon">${this.getItemIcon(key)}</span>
                                        ${this.formatItemName(key)}
                                    </div>
                                    <div class="sync-toggle ${enabled ? 'active' : ''}" 
                                         onclick="BaelSyncCenter.toggleItem('${key}')"></div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="sync-section">
                        <div class="sync-section-title">💾 Export / Import</div>
                        <div class="export-import-section">
                            <div class="ei-card" onclick="BaelSyncCenter.exportAll()">
                                <div class="ei-icon">📤</div>
                                <div class="ei-title">Export Data</div>
                                <div class="ei-desc">Download all synced data</div>
                            </div>
                            <div class="ei-card" onclick="BaelSyncCenter.importData()">
                                <div class="ei-icon">📥</div>
                                <div class="ei-title">Import Data</div>
                                <div class="ei-desc">Restore from backup file</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        getItemIcon(key) {
            const icons = {
                settings: '⚙️',
                themes: '🎨',
                notes: '📝',
                links: '🔗',
                templates: '📋',
                history: '📜'
            };
            return icons[key] || '📦';
        }

        formatItemName(key) {
            return key.charAt(0).toUpperCase() + key.slice(1);
        }

        setupShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl+Shift+B for sync
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
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
            this.renderContainer();
        }

        hide() {
            this.visible = false;
            this.backdrop.classList.remove('visible');
            this.container.classList.remove('visible');
        }

        toggleAutoSync() {
            this.syncConfig.autoSync = !this.syncConfig.autoSync;
            this.saveConfig();
            
            if (this.syncConfig.autoSync) {
                this.startAutoSync();
            } else {
                this.stopAutoSync();
            }
            
            this.renderContainer();
        }

        toggleItem(key) {
            this.syncConfig.syncItems[key] = !this.syncConfig.syncItems[key];
            this.saveConfig();
            this.renderContainer();
        }

        startAutoSync() {
            this.stopAutoSync();
            this.syncInterval = setInterval(() => {
                this.syncNow(true);
            }, this.syncConfig.syncInterval);
        }

        stopAutoSync() {
            if (this.syncInterval) {
                clearInterval(this.syncInterval);
                this.syncInterval = null;
            }
        }

        async syncNow(silent = false) {
            const icon = this.container?.querySelector('#sync-icon');
            if (icon) {
                icon.classList.add('syncing');
                icon.textContent = '🔄';
            }
            
            // Collect data to sync
            const syncData = this.collectSyncData();
            
            // In a real implementation, this would sync to a server
            // For now, we just save to localStorage as a backup
            try {
                localStorage.setItem('bael-sync-backup', JSON.stringify({
                    timestamp: new Date().toISOString(),
                    deviceId: this.syncConfig.deviceId,
                    data: syncData
                }));
                
                this.syncConfig.lastSync = new Date().toISOString();
                this.saveConfig();
                
                if (!silent) {
                    window.dispatchEvent(new CustomEvent('bael:toast', {
                        detail: { message: 'Sync complete!', type: 'success' }
                    }));
                }
            } catch (e) {
                if (!silent) {
                    window.dispatchEvent(new CustomEvent('bael:toast', {
                        detail: { message: 'Sync failed', type: 'error' }
                    }));
                }
            }
            
            if (icon) {
                icon.classList.remove('syncing');
                icon.textContent = '☁️';
            }
            
            this.renderContainer();
        }

        collectSyncData() {
            const data = {};
            
            if (this.syncConfig.syncItems.settings) {
                data.settings = localStorage.getItem('bael-settings');
            }
            if (this.syncConfig.syncItems.themes) {
                data.themes = localStorage.getItem('bael-custom-themes');
            }
            if (this.syncConfig.syncItems.notes) {
                data.notes = localStorage.getItem('bael-notes');
            }
            if (this.syncConfig.syncItems.links) {
                data.links = localStorage.getItem('bael-quick-links');
            }
            if (this.syncConfig.syncItems.templates) {
                data.templates = localStorage.getItem('bael-suggest-templates');
            }
            if (this.syncConfig.syncItems.history) {
                data.history = localStorage.getItem('bael-suggest-history');
            }
            
            return data;
        }

        exportAll() {
            const syncData = this.collectSyncData();
            const exportObj = {
                version: this.version,
                exportedAt: new Date().toISOString(),
                deviceId: this.syncConfig.deviceId,
                data: syncData
            };
            
            const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bael-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            window.dispatchEvent(new CustomEvent('bael:toast', {
                detail: { message: 'Backup exported!', type: 'success' }
            }));
        }

        importData() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                try {
                    const text = await file.text();
                    const importObj = JSON.parse(text);
                    
                    if (!importObj.data) {
                        throw new Error('Invalid backup file');
                    }
                    
                    // Restore each item
                    Object.entries(importObj.data).forEach(([key, value]) => {
                        if (value) {
                            const storageKey = 'bael-' + (key === 'settings' ? 'settings' : 
                                                         key === 'themes' ? 'custom-themes' :
                                                         key === 'notes' ? 'notes' :
                                                         key === 'links' ? 'quick-links' :
                                                         key === 'templates' ? 'suggest-templates' :
                                                         key === 'history' ? 'suggest-history' : key);
                            localStorage.setItem(storageKey, value);
                        }
                    });
                    
                    window.dispatchEvent(new CustomEvent('bael:toast', {
                        detail: { message: 'Backup restored! Refresh to apply.', type: 'success' }
                    }));
                } catch (err) {
                    window.dispatchEvent(new CustomEvent('bael:toast', {
                        detail: { message: 'Import failed: ' + err.message, type: 'error' }
                    }));
                }
            };
            
            input.click();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    window.BaelSyncCenter = new BaelSyncCenter();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.BaelSyncCenter.initialize();
        });
    } else {
        window.BaelSyncCenter.initialize();
    }

    console.log('🔄 Bael Sync Center loaded');
})();
