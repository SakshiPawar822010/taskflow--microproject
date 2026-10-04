/**
 * TaskFlow – Notes Workspace Controller
 * Features Rich Text Editor toolbar, categories (Study, Personal, Work), search, auto-save & pinning
 */

class NotesModule {
  constructor() {
    this.activeNoteId = null;
    this.searchQuery = '';
    this.activeCategory = 'all';
    this.saveTimeout = null;

    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // New Note Button
    const btnNewNote = document.getElementById('btn-new-note');
    if (btnNewNote) {
      btnNewNote.addEventListener('click', () => this.createNewNote());
    }

    // Notes Search
    const searchInput = document.getElementById('notes-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderNotesList();
      });
    }

    // Category filter tabs
    document.querySelectorAll('.note-filter-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        document.querySelectorAll('.note-filter-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeCategory = tab.getAttribute('data-category');
        this.renderNotesList();
      });
    });

    // Formatting Toolbar Buttons
    document.querySelectorAll('.editor-tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const command = btn.getAttribute('data-command');
        this.applyFormat(command);
      });
    });

    // Auto-save on editor input
    const titleInput = document.getElementById('editor-note-title');
    const textarea = document.getElementById('editor-note-textarea');

    if (titleInput) {
      titleInput.addEventListener('input', () => this.queueAutoSave());
    }
    if (textarea) {
      textarea.addEventListener('input', () => this.queueAutoSave());
    }

    // Pin note button
    const btnPinNote = document.getElementById('btn-pin-note');
    if (btnPinNote) {
      btnPinNote.addEventListener('click', () => this.togglePinActiveNote());
    }

    // Delete note button
    const btnDeleteNote = document.getElementById('btn-delete-note');
    if (btnDeleteNote) {
      btnDeleteNote.addEventListener('click', () => this.deleteActiveNote());
    }
  }

  render() {
    const notes = window.taskflowStore.getNotes();
    if (!this.activeNoteId && notes.length > 0) {
      this.activeNoteId = notes[0].id;
    }
    this.renderNotesList();
    this.loadNoteIntoEditor(this.activeNoteId);
  }

  renderNotesList() {
    const container = document.getElementById('notes-sidebar-items');
    if (!container) return;

    let notes = window.taskflowStore.getNotes();

    // Filter by category
    if (this.activeCategory !== 'all') {
      notes = notes.filter(n => n.category.toLowerCase() === this.activeCategory.toLowerCase());
    }

    // Filter by search query
    if (this.searchQuery) {
      notes = notes.filter(n =>
        n.title.toLowerCase().includes(this.searchQuery) ||
        n.content.toLowerCase().includes(this.searchQuery) ||
        (n.tags && n.tags.some(t => t.toLowerCase().includes(this.searchQuery)))
      );
    }

    // Sort: Pinned first, then recent
    notes.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

    if (notes.length === 0) {
      container.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No notes found</div>';
      return;
    }

    container.innerHTML = notes.map(note => {
      const isActive = note.id === this.activeNoteId;
      return `
        <div class="note-snippet-card ${isActive ? 'active' : ''}" onclick="window.notesModule.selectNote('${note.id}')">
          <div class="note-snippet-title">
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 220px;">${note.title || 'Untitled Note'}</span>
            ${note.pinned ? '<span title="Pinned" style="color: var(--warning);">📌</span>' : ''}
          </div>
          <div class="note-snippet-body">${note.content.replace(/[#*`>]/g, '')}</div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.5rem; font-size: 0.72rem; color: var(--text-subtle);">
            <span class="badge ${note.category === 'Study' ? 'badge-purple' : 'badge-neutral'}">${note.category}</span>
            <span>${note.updatedAt || 'Recent'}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  selectNote(noteId) {
    this.activeNoteId = noteId;
    this.renderNotesList();
    this.loadNoteIntoEditor(noteId);
  }

  loadNoteIntoEditor(noteId) {
    const notes = window.taskflowStore.getNotes();
    const note = notes.find(n => n.id === noteId);

    const titleInput = document.getElementById('editor-note-title');
    const textarea = document.getElementById('editor-note-textarea');
    const categoryBadge = document.getElementById('editor-category-badge');
    const pinBtn = document.getElementById('btn-pin-note');

    if (!note) {
      if (titleInput) titleInput.value = '';
      if (textarea) textarea.value = '';
      return;
    }

    if (titleInput) titleInput.value = note.title;
    if (textarea) textarea.value = note.content;
    if (categoryBadge) categoryBadge.textContent = note.category;
    if (pinBtn) pinBtn.textContent = note.pinned ? '📌 Pinned' : '📍 Pin';
  }

  queueAutoSave() {
    clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.saveActiveNote();
    }, 600);
  }

  saveActiveNote() {
    if (!this.activeNoteId) return;

    const titleInput = document.getElementById('editor-note-title');
    const textarea = document.getElementById('editor-note-textarea');

    const title = titleInput.value.trim() || 'Untitled Note';
    const content = textarea.value;

    const notes = window.taskflowStore.getNotes();
    const note = notes.find(n => n.id === this.activeNoteId);

    if (note) {
      note.title = title;
      note.content = content;
      note.updatedAt = 'Just now';
      window.taskflowStore.saveNotes(notes);
      this.renderNotesList();
    }
  }

  createNewNote() {
    const category = prompt('Note Category (Study, Work, Personal):', 'Study') || 'Study';
    const notes = window.taskflowStore.getNotes();

    const newNote = {
      id: `note-${Date.now()}`,
      title: 'Untitled Note',
      category: category.trim(),
      pinned: false,
      updatedAt: 'Just now',
      tags: [category.trim()],
      content: `# New Note\nStart typing your thoughts, study notes, or meeting takeaways here...`
    };

    notes.unshift(newNote);
    window.taskflowStore.saveNotes(notes);
    this.activeNoteId = newNote.id;
    this.render();
    window.taskFlowApp.showToast('Created new note', 'success');

    const textarea = document.getElementById('editor-note-textarea');
    if (textarea) textarea.focus();
  }

  togglePinActiveNote() {
    if (!this.activeNoteId) return;
    const notes = window.taskflowStore.getNotes();
    const note = notes.find(n => n.id === this.activeNoteId);
    if (!note) return;

    note.pinned = !note.pinned;
    window.taskflowStore.saveNotes(notes);
    this.renderNotesList();

    const pinBtn = document.getElementById('btn-pin-note');
    if (pinBtn) pinBtn.textContent = note.pinned ? '📌 Pinned' : '📍 Pin';
    window.taskFlowApp.showToast(note.pinned ? 'Note pinned to top' : 'Note unpinned', 'info');
  }

  deleteActiveNote() {
    if (!this.activeNoteId) return;
    if (!confirm('Are you sure you want to delete this note?')) return;

    let notes = window.taskflowStore.getNotes();
    notes = notes.filter(n => n.id !== this.activeNoteId);
    window.taskflowStore.saveNotes(notes);

    this.activeNoteId = notes.length > 0 ? notes[0].id : null;
    this.render();
    window.taskFlowApp.showToast('Note deleted', 'info');
  }

  // Formatting helper
  applyFormat(command) {
    const textarea = document.getElementById('editor-note-textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    let replacement = '';

    switch (command) {
      case 'bold':
        replacement = `**${selected || 'bold text'}**`;
        break;
      case 'italic':
        replacement = `*${selected || 'italic text'}*`;
        break;
      case 'h1':
        replacement = `\n# ${selected || 'Heading 1'}\n`;
        break;
      case 'h2':
        replacement = `\n## ${selected || 'Heading 2'}\n`;
        break;
      case 'list-bullet':
        replacement = `\n- ${selected || 'List item'}\n`;
        break;
      case 'list-number':
        replacement = `\n1. ${selected || 'First item'}\n`;
        break;
      case 'quote':
        replacement = `\n> ${selected || 'Quote text'}\n`;
        break;
      case 'code':
        replacement = `\n\`\`\`javascript\n${selected || '// code block'}\n\`\`\`\n`;
        break;
      default:
        replacement = selected;
    }

    textarea.value = text.substring(0, start) + replacement + text.substring(end);
    textarea.focus();
    this.saveActiveNote();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.notesModule = new NotesModule();
});
