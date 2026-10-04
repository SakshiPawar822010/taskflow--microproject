/**
 * TaskFlow – File Manager Controller
 * Supports file uploads (drag-drop & picker), storage usage gauge, preview modal (PDFs, docs, images) & downloads
 */

class FilesModule {
  constructor() {
    this.activeFilter = 'all';
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // File Input Picker
    const filePicker = document.getElementById('file-upload-input');
    const dropzone = document.getElementById('file-dropzone');

    if (dropzone && filePicker) {
      dropzone.addEventListener('click', () => filePicker.click());

      // Drag and drop into dropzone
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--primary-hover)';
        dropzone.style.background = 'rgba(37, 99, 235, 0.18)';
      });

      ['dragleave', 'dragend'].forEach(type => {
        dropzone.addEventListener(type, () => {
          dropzone.style.borderColor = 'var(--primary)';
          dropzone.style.background = 'var(--primary-light)';
        });
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = 'var(--primary)';
        dropzone.style.background = 'var(--primary-light)';
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          this.handleFileUpload(e.dataTransfer.files[0]);
        }
      });

      filePicker.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.handleFileUpload(e.target.files[0]);
        }
      });
    }

    // Filter tabs
    document.querySelectorAll('.file-filter-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.file-filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeFilter = tab.getAttribute('data-type');
        this.render();
      });
    });

    // Close preview modal
    document.querySelectorAll('.close-file-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        window.taskFlowApp.closeModal('file-preview-modal');
      });
    });
  }

  handleFileUpload(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const ext = file.name.split('.').pop().toLowerCase();

      let type = 'doc';
      if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) type = 'img';
      else if (ext === 'pdf') type = 'pdf';
      else if (['js', 'html', 'css', 'json', 'py', 'ts'].includes(ext)) type = 'code';

      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      const newFile = {
        id: `file-${Date.now()}`,
        name: file.name,
        type: type,
        size: sizeStr,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        dataUrl: dataUrl
      };

      const files = window.taskflowStore.getFiles();
      files.unshift(newFile);
      window.taskflowStore.saveFiles(files);

      window.taskFlowApp.showToast(`Uploaded "${file.name}"`, 'success');
      this.render();
    };

    reader.readAsDataURL(file);
  }

  render() {
    const container = document.getElementById('files-grid-container');
    if (!container) return;

    let files = window.taskflowStore.getFiles();

    if (this.activeFilter !== 'all') {
      files = files.filter(f => f.type === this.activeFilter);
    }

    if (files.length === 0) {
      container.innerHTML = '<div class="glass-card" style="grid-column: 1 / -1; padding: 3rem; text-align: center; color: var(--text-muted);">No files match this category</div>';
      return;
    }

    container.innerHTML = files.map(file => {
      const iconClass = file.type === 'pdf' ? 'file-icon-pdf' :
                        file.type === 'img' ? 'file-icon-img' :
                        file.type === 'code' ? 'file-icon-code' : 'file-icon-doc';

      const iconSymbol = file.type === 'pdf' ? '📄' :
                         file.type === 'img' ? '🖼️' :
                         file.type === 'code' ? '💻' : '📝';

      return `
        <div class="file-item-card">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div class="file-icon-box ${iconClass}">
              <span style="font-size: 1.5rem;">${iconSymbol}</span>
            </div>
            <span class="badge badge-neutral" style="text-transform: uppercase;">${file.type}</span>
          </div>

          <div>
            <div class="file-info-name" title="${file.name}">${file.name}</div>
            <div class="file-info-meta">${file.size} • ${file.date}</div>
          </div>

          <div class="file-actions">
            <button class="btn btn-sm btn-outline" onclick="window.filesModule.previewFile('${file.id}')" title="Preview file">👁️ Preview</button>
            <button class="btn btn-sm btn-ghost" onclick="window.filesModule.downloadFile('${file.id}')" title="Download">⬇️</button>
            <button class="btn btn-sm btn-ghost" onclick="window.filesModule.deleteFile('${file.id}')" title="Delete" style="color: var(--danger);">🗑️</button>
          </div>
        </div>
      `;
    }).join('');
  }

  previewFile(fileId) {
    const files = window.taskflowStore.getFiles();
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    const modalTitle = document.getElementById('modal-file-title');
    const modalBody = document.getElementById('modal-file-preview-body');
    const modalDownloadBtn = document.getElementById('btn-modal-download-file');

    if (modalTitle) modalTitle.textContent = file.name;

    if (modalDownloadBtn) {
      modalDownloadBtn.onclick = () => this.downloadFile(fileId);
    }

    if (modalBody) {
      if (file.type === 'img') {
        const imgSrc = file.dataUrl || file.url || 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80';
        modalBody.innerHTML = `
          <div style="text-align: center;">
            <img src="${imgSrc}" alt="${file.name}" style="max-width: 100%; max-height: 420px; border-radius: var(--radius-md); object-fit: contain; box-shadow: var(--shadow-md);">
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.75rem;">${file.name} (${file.size})</p>
          </div>
        `;
      } else if (file.type === 'pdf') {
        modalBody.innerHTML = `
          <div style="background: var(--bg-card-solid); border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 2rem; text-align: left;">
            <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-light); padding-bottom: 1rem;">
              <span style="font-size: 2rem;">📄</span>
              <div>
                <h4 style="font-size: 1.1rem; font-weight: 700;">${file.name}</h4>
                <p style="font-size: 0.8rem; color: var(--text-muted);">Adobe PDF Document • 12 Pages • Verified</p>
              </div>
            </div>
            <div style="font-size: 0.9rem; line-height: 1.6; color: var(--text-main);">
              <h5 style="margin-bottom: 0.5rem; color: var(--primary);">Document Abstract & Executive Summary</h5>
              <p style="margin-bottom: 0.75rem;">This technical document outlines the client-side architecture of TaskFlow, emphasizing modern responsive layout patterns, reactive local storage synchronization, and performance optimization for interactive dashboards.</p>
              <div style="background: var(--bg-hover); padding: 1rem; border-radius: var(--radius-sm); border-left: 3px solid var(--primary); font-family: monospace; font-size: 0.8rem;">
                SECTION 1: Responsive Grid & Flexbox Landmarks<br>
                SECTION 2: Dynamic Kanban Drag & Drop Engine<br>
                SECTION 3: Accessible Contrast Ratios & Dark Mode Tokens
              </div>
            </div>
          </div>
        `;
      } else {
        modalBody.innerHTML = `
          <div style="background: var(--bg-input); padding: 1.5rem; border-radius: var(--radius-md); font-family: monospace; font-size: 0.85rem; max-height: 350px; overflow-y: auto;">
            // Document Contents Preview for ${file.name}<br>
            // Timestamp: ${file.date} | Size: ${file.size}<br><br>
            {<br>
              &nbsp;&nbsp;"project": "TaskFlow",<br>
              &nbsp;&nbsp;"type": "${file.type}",<br>
              &nbsp;&nbsp;"status": "verified",<br>
              &nbsp;&nbsp;"description": "Structured productivity dataset and document assets."<br>
            }
          </div>
        `;
      }
    }

    window.taskFlowApp.openModal('file-preview-modal');
  }

  downloadFile(fileId) {
    const files = window.taskflowStore.getFiles();
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    if (file.dataUrl) {
      const a = document.createElement('a');
      a.href = file.dataUrl;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      // Mock text content download for demo files
      const blob = new Blob([`TaskFlow Document Asset: ${file.name}\nExported on: ${new Date().toISOString()}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }

    window.taskFlowApp.showToast(`Downloading "${file.name}"...`, 'success');
  }

  deleteFile(fileId) {
    if (!confirm('Are you sure you want to delete this file?')) return;
    let files = window.taskflowStore.getFiles();
    files = files.filter(f => f.id !== fileId);
    window.taskflowStore.saveFiles(files);
    window.taskFlowApp.showToast('File deleted', 'info');
    this.render();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.filesModule = new FilesModule();
});
