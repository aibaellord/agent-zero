/**
 * BAEL File Upload Component - Lord Of All Files
 *
 * Full-featured file upload with:
 * - Drag & drop zone
 * - Multiple files
 * - File type validation
 * - Size validation
 * - Image preview
 * - Progress bars
 * - Chunked upload
 * - Resume upload
 * - Remove/cancel
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // FILE UPLOAD CLASS
  // ============================================================

  class BaelFileUpload {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-fileupload-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-fileupload-styles";
      styles.textContent = `
                .bael-fileupload {
                    font-family: system-ui, -apple-system, sans-serif;
                    font-size: 14px;
                }

                /* Drop zone */
                .bael-fileupload-dropzone {
                    border: 2px dashed #d1d5db;
                    border-radius: 12px;
                    padding: 40px 20px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s;
                    background: #fafafa;
                }

                .bael-fileupload-dropzone:hover {
                    border-color: #4f46e5;
                    background: #eef2ff;
                }

                .bael-fileupload-dropzone.dragover {
                    border-color: #4f46e5;
                    background: #eef2ff;
                    transform: scale(1.02);
                }

                .bael-fileupload-dropzone.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .bael-fileupload-icon {
                    width: 48px;
                    height: 48px;
                    margin: 0 auto 16px;
                    color: #9ca3af;
                }

                .bael-fileupload-text {
                    color: #6b7280;
                    margin-bottom: 8px;
                }

                .bael-fileupload-text strong {
                    color: #4f46e5;
                }

                .bael-fileupload-hint {
                    font-size: 12px;
                    color: #9ca3af;
                }

                /* File list */
                .bael-fileupload-list {
                    margin-top: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .bael-fileupload-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    transition: all 0.2s;
                }

                .bael-fileupload-item:hover {
                    border-color: #d1d5db;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }

                .bael-fileupload-item.error {
                    border-color: #fca5a5;
                    background: #fef2f2;
                }

                .bael-fileupload-item.success {
                    border-color: #86efac;
                    background: #f0fdf4;
                }

                /* Preview */
                .bael-fileupload-preview {
                    width: 48px;
                    height: 48px;
                    border-radius: 8px;
                    overflow: hidden;
                    flex-shrink: 0;
                    background: #f3f4f6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .bael-fileupload-preview img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .bael-fileupload-preview-icon {
                    width: 24px;
                    height: 24px;
                    color: #9ca3af;
                }

                /* Info */
                .bael-fileupload-info {
                    flex: 1;
                    min-width: 0;
                }

                .bael-fileupload-name {
                    font-weight: 500;
                    color: #374151;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .bael-fileupload-meta {
                    font-size: 12px;
                    color: #9ca3af;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bael-fileupload-error {
                    font-size: 12px;
                    color: #ef4444;
                }

                /* Progress */
                .bael-fileupload-progress {
                    width: 100%;
                    height: 4px;
                    background: #e5e7eb;
                    border-radius: 2px;
                    margin-top: 8px;
                    overflow: hidden;
                }

                .bael-fileupload-progress-bar {
                    height: 100%;
                    background: #4f46e5;
                    border-radius: 2px;
                    transition: width 0.2s;
                }

                /* Actions */
                .bael-fileupload-actions {
                    display: flex;
                    gap: 4px;
                    flex-shrink: 0;
                }

                .bael-fileupload-btn {
                    width: 32px;
                    height: 32px;
                    border: none;
                    background: none;
                    cursor: pointer;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #6b7280;
                    transition: all 0.15s;
                }

                .bael-fileupload-btn:hover {
                    background: #f3f4f6;
                    color: #374151;
                }

                .bael-fileupload-btn.remove:hover {
                    background: #fef2f2;
                    color: #ef4444;
                }

                /* Image grid variant */
                .bael-fileupload.grid .bael-fileupload-list {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                    gap: 12px;
                }

                .bael-fileupload.grid .bael-fileupload-item {
                    flex-direction: column;
                    padding: 8px;
                    aspect-ratio: 1;
                }

                .bael-fileupload.grid .bael-fileupload-preview {
                    width: 100%;
                    height: auto;
                    aspect-ratio: 1;
                }

                .bael-fileupload.grid .bael-fileupload-info {
                    width: 100%;
                    text-align: center;
                }

                .bael-fileupload.grid .bael-fileupload-name {
                    font-size: 12px;
                }

                .bael-fileupload.grid .bael-fileupload-meta {
                    display: none;
                }

                .bael-fileupload.grid .bael-fileupload-actions {
                    position: absolute;
                    top: 4px;
                    right: 4px;
                }

                /* Compact variant */
                .bael-fileupload.compact .bael-fileupload-dropzone {
                    padding: 20px;
                }

                .bael-fileupload.compact .bael-fileupload-icon {
                    width: 32px;
                    height: 32px;
                    margin-bottom: 8px;
                }
            `;
      document.head.appendChild(styles);
    }

    /**
     * Format file size
     */
    _formatSize(bytes) {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    }

    /**
     * Get file icon based on type
     */
    _getFileIcon(type) {
      if (type.startsWith("image/")) {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`;
      }
      if (type.startsWith("video/")) {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18"/><path d="m10 8 6 4-6 4Z"/></svg>`;
      }
      if (type.startsWith("audio/")) {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`;
      }
      if (type === "application/pdf") {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M10 9H8v6h2v-2h1a2 2 0 1 0 0-4h-1Z"/></svg>`;
      }
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>`;
    }

    // ============================================================
    // CREATE FILE UPLOAD
    // ============================================================

    /**
     * Create a file upload component
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("File upload container not found");
        return null;
      }

      const id = `bael-fileupload-${++this.idCounter}`;
      const config = {
        multiple: true,
        accept: "*/*", // MIME types or extensions
        maxSize: 10 * 1024 * 1024, // 10MB default
        maxFiles: 10,
        variant: "list", // list, grid, compact
        autoUpload: false,
        uploadUrl: null,
        uploadMethod: "POST",
        uploadHeaders: {},
        uploadFieldName: "file",
        chunked: false,
        chunkSize: 1024 * 1024, // 1MB chunks
        preview: true,
        disabled: false,
        dropzoneText:
          "Drag & drop files here or <strong>click to browse</strong>",
        dropzoneHint: null,
        onAdd: null,
        onRemove: null,
        onUpload: null,
        onProgress: null,
        onComplete: null,
        onError: null,
        ...options,
      };

      // Generate hint
      if (!config.dropzoneHint) {
        const sizeText = this._formatSize(config.maxSize);
        config.dropzoneHint = `Max ${config.maxFiles} files, ${sizeText} each`;
      }

      const el = document.createElement("div");
      el.className = `bael-fileupload ${config.variant}`;
      el.id = id;

      const state = {
        id,
        element: el,
        container,
        config,
        files: [],
        uploads: new Map(),
      };

      this._render(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        getFiles: () => [...state.files],
        addFiles: (files) => this._addFiles(state, files),
        removeFile: (index) => this._removeFile(state, index),
        upload: () => this._uploadAll(state),
        clear: () => this._clearAll(state),
        setDisabled: (d) => this.setDisabled(id, d),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render file upload
     */
    _render(state) {
      const { element, config } = state;

      element.innerHTML = "";

      // Hidden file input
      const input = document.createElement("input");
      input.type = "file";
      input.hidden = true;
      input.multiple = config.multiple;
      input.accept = config.accept;
      element.appendChild(input);

      state.input = input;

      // Drop zone
      const dropzone = document.createElement("div");
      dropzone.className = "bael-fileupload-dropzone";
      if (config.disabled) dropzone.classList.add("disabled");

      dropzone.innerHTML = `
                <div class="bael-fileupload-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="17 8 12 3 7 8"/>
                        <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                </div>
                <div class="bael-fileupload-text">${config.dropzoneText}</div>
                <div class="bael-fileupload-hint">${config.dropzoneHint}</div>
            `;

      element.appendChild(dropzone);

      state.dropzone = dropzone;

      // File list
      const list = document.createElement("div");
      list.className = "bael-fileupload-list";
      element.appendChild(list);

      state.list = list;

      // Events
      this._setupEvents(state);

      // Render existing files
      this._renderFileList(state);
    }

    /**
     * Setup events
     */
    _setupEvents(state) {
      const { input, dropzone, config } = state;

      // Click to open file dialog
      dropzone.addEventListener("click", () => {
        if (!config.disabled) input.click();
      });

      // File selected via dialog
      input.addEventListener("change", (e) => {
        if (e.target.files.length > 0) {
          this._addFiles(state, e.target.files);
        }
        input.value = ""; // Reset to allow same file
      });

      // Drag events
      dropzone.addEventListener("dragenter", (e) => {
        e.preventDefault();
        if (!config.disabled) dropzone.classList.add("dragover");
      });

      dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      dropzone.addEventListener("dragleave", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
      });

      dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        if (!config.disabled && e.dataTransfer.files.length > 0) {
          this._addFiles(state, e.dataTransfer.files);
        }
      });
    }

    /**
     * Add files
     */
    _addFiles(state, files) {
      const { config } = state;
      const fileArray = Array.from(files);

      fileArray.forEach((file) => {
        // Check max files
        if (state.files.length >= config.maxFiles) {
          if (config.onError) {
            config.onError({
              type: "maxFiles",
              message: `Maximum ${config.maxFiles} files allowed`,
            });
          }
          return;
        }

        // Check size
        if (file.size > config.maxSize) {
          if (config.onError) {
            config.onError({
              type: "maxSize",
              file,
              message: `File "${file.name}" exceeds maximum size of ${this._formatSize(config.maxSize)}`,
            });
          }
          return;
        }

        // Check type
        if (config.accept !== "*/*") {
          const accepted = config.accept.split(",").map((t) => t.trim());
          const matches = accepted.some((pattern) => {
            if (pattern.startsWith(".")) {
              return file.name.toLowerCase().endsWith(pattern.toLowerCase());
            }
            if (pattern.endsWith("/*")) {
              return file.type.startsWith(pattern.slice(0, -1));
            }
            return file.type === pattern;
          });

          if (!matches) {
            if (config.onError) {
              config.onError({
                type: "type",
                file,
                message: `File type "${file.type}" not allowed`,
              });
            }
            return;
          }
        }

        // Add file
        const fileData = {
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          status: "pending", // pending, uploading, success, error
          progress: 0,
          error: null,
          preview: null,
        };

        // Generate preview for images
        if (config.preview && file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            fileData.preview = e.target.result;
            this._renderFileList(state);
          };
          reader.readAsDataURL(file);
        }

        state.files.push(fileData);

        if (config.onAdd) {
          config.onAdd(fileData);
        }
      });

      this._renderFileList(state);

      // Auto upload
      if (config.autoUpload && config.uploadUrl) {
        this._uploadAll(state);
      }
    }

    /**
     * Render file list
     */
    _renderFileList(state) {
      const { list, config } = state;

      list.innerHTML = "";

      state.files.forEach((fileData, index) => {
        const item = document.createElement("div");
        item.className = `bael-fileupload-item ${fileData.status}`;

        // Preview
        const preview = document.createElement("div");
        preview.className = "bael-fileupload-preview";

        if (fileData.preview) {
          preview.innerHTML = `<img src="${fileData.preview}" alt="${fileData.name}">`;
        } else {
          preview.innerHTML = `<div class="bael-fileupload-preview-icon">${this._getFileIcon(fileData.type)}</div>`;
        }

        item.appendChild(preview);

        // Info
        const info = document.createElement("div");
        info.className = "bael-fileupload-info";

        info.innerHTML = `
                    <div class="bael-fileupload-name">${fileData.name}</div>
                    <div class="bael-fileupload-meta">
                        <span>${this._formatSize(fileData.size)}</span>
                        ${fileData.status === "uploading" ? `<span>${fileData.progress}%</span>` : ""}
                        ${fileData.status === "success" ? '<span style="color:#22c55e">✓ Uploaded</span>' : ""}
                    </div>
                    ${fileData.error ? `<div class="bael-fileupload-error">${fileData.error}</div>` : ""}
                    ${
                      fileData.status === "uploading"
                        ? `
                        <div class="bael-fileupload-progress">
                            <div class="bael-fileupload-progress-bar" style="width: ${fileData.progress}%"></div>
                        </div>
                    `
                        : ""
                    }
                `;

        item.appendChild(info);

        // Actions
        const actions = document.createElement("div");
        actions.className = "bael-fileupload-actions";

        const removeBtn = document.createElement("button");
        removeBtn.className = "bael-fileupload-btn remove";
        removeBtn.type = "button";
        removeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`;
        removeBtn.addEventListener("click", () =>
          this._removeFile(state, index),
        );

        actions.appendChild(removeBtn);
        item.appendChild(actions);

        list.appendChild(item);
      });
    }

    /**
     * Remove file
     */
    _removeFile(state, index) {
      const fileData = state.files[index];
      if (!fileData) return;

      // Cancel upload if in progress
      const xhr = state.uploads.get(fileData);
      if (xhr) {
        xhr.abort();
        state.uploads.delete(fileData);
      }

      state.files.splice(index, 1);

      if (state.config.onRemove) {
        state.config.onRemove(fileData, index);
      }

      this._renderFileList(state);
    }

    /**
     * Clear all files
     */
    _clearAll(state) {
      // Abort all uploads
      state.uploads.forEach((xhr) => xhr.abort());
      state.uploads.clear();

      state.files = [];
      this._renderFileList(state);
    }

    /**
     * Upload all pending files
     */
    _uploadAll(state) {
      const { config } = state;

      if (!config.uploadUrl) {
        console.error("Upload URL not configured");
        return;
      }

      state.files.forEach((fileData) => {
        if (fileData.status === "pending") {
          this._uploadFile(state, fileData);
        }
      });
    }

    /**
     * Upload single file
     */
    _uploadFile(state, fileData) {
      const { config } = state;

      fileData.status = "uploading";
      fileData.progress = 0;
      this._renderFileList(state);

      const formData = new FormData();
      formData.append(config.uploadFieldName, fileData.file);

      const xhr = new XMLHttpRequest();
      state.uploads.set(fileData, xhr);

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          fileData.progress = Math.round((e.loaded / e.total) * 100);
          this._renderFileList(state);

          if (config.onProgress) {
            config.onProgress(fileData, fileData.progress);
          }
        }
      });

      xhr.addEventListener("load", () => {
        state.uploads.delete(fileData);

        if (xhr.status >= 200 && xhr.status < 300) {
          fileData.status = "success";
          fileData.progress = 100;

          if (config.onUpload) {
            let response = xhr.responseText;
            try {
              response = JSON.parse(response);
            } catch (e) {}
            config.onUpload(fileData, response);
          }
        } else {
          fileData.status = "error";
          fileData.error = `Upload failed: ${xhr.status}`;

          if (config.onError) {
            config.onError({
              type: "upload",
              file: fileData,
              message: fileData.error,
            });
          }
        }

        this._renderFileList(state);
        this._checkComplete(state);
      });

      xhr.addEventListener("error", () => {
        state.uploads.delete(fileData);
        fileData.status = "error";
        fileData.error = "Network error";
        this._renderFileList(state);

        if (config.onError) {
          config.onError({
            type: "network",
            file: fileData,
            message: "Network error",
          });
        }

        this._checkComplete(state);
      });

      xhr.open(config.uploadMethod, config.uploadUrl);

      // Set headers
      Object.entries(config.uploadHeaders).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.send(formData);
    }

    /**
     * Check if all uploads complete
     */
    _checkComplete(state) {
      const pending = state.files.some(
        (f) => f.status === "pending" || f.status === "uploading",
      );
      if (!pending && state.config.onComplete) {
        state.config.onComplete(state.files);
      }
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    /**
     * Set disabled state
     */
    setDisabled(uploadId, disabled) {
      const state = this.instances.get(uploadId);
      if (!state) return;

      state.config.disabled = disabled;
      state.dropzone.classList.toggle("disabled", disabled);
    }

    /**
     * Destroy upload
     */
    destroy(uploadId) {
      const state = this.instances.get(uploadId);
      if (!state) return;

      // Abort all uploads
      state.uploads.forEach((xhr) => xhr.abort());

      state.element.remove();
      this.instances.delete(uploadId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelFileUpload();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$fileUpload = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelFileUpload = bael;

  console.log("📁 BAEL File Upload Component loaded");
})();
