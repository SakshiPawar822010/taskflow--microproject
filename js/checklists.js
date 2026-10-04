/**
 * TaskFlow – Checklist & Toggle List Controller (Notion Style)
 * Supports nested tasks, expand/collapse toggles, dynamic progress tracking, and group creation
 */

class ChecklistsModule {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    const btnNewToggleGroup = document.getElementById('btn-new-toggle-group');
    if (btnNewToggleGroup) {
      btnNewToggleGroup.addEventListener('click', () => this.openCreateGroupPrompt());
    }
  }

  render() {
    const container = document.getElementById('checklists-container');
    if (!container) return;

    const checklists = window.taskflowStore.getChecklists();

    if (checklists.length === 0) {
      container.innerHTML = `
        <div class="glass-card" style="padding: 3rem; text-align: center; color: var(--text-muted);">
          No checklists yet. Click "+ New Toggle Section" to create one.
        </div>
      `;
      return;
    }

    container.innerHTML = checklists.map(group => {
      const total = group.items.length;
      const completed = group.items.filter(i => i.completed).length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

      return `
        <div class="toggle-group ${group.collapsed ? 'collapsed' : ''}" data-group-id="${group.id}">
          <div class="toggle-header" onclick="window.checklistsModule.toggleGroupCollapse('${group.id}')">
            <div class="toggle-left">
              <span class="toggle-chevron">▼</span>
              <div>
                <span class="toggle-title">${group.title}</span>
                <span class="badge ${group.category === 'Study' ? 'badge-purple' : group.category === 'Work' ? 'badge-primary' : 'badge-neutral'}" style="margin-left: 0.5rem;">${group.category}</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 1.25rem;">
              <div style="width: 140px; text-align: right;">
                <div style="font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 2px;">
                  ${completed}/${total} completed (${pct}%)
                </div>
                <div class="progress-bar-container" style="height: 6px; margin: 0;">
                  <div class="progress-bar-fill" style="width: ${pct}%;"></div>
                </div>
              </div>
              <button class="btn-icon btn-sm" onclick="event.stopPropagation(); window.checklistsModule.addItemPrompt('${group.id}')" title="Add item">➕</button>
              <button class="btn-icon btn-sm" onclick="event.stopPropagation(); window.checklistsModule.deleteGroup('${group.id}')" title="Delete section" style="color: var(--danger);">🗑️</button>
            </div>
          </div>

          <div class="toggle-body">
            ${group.items.map(item => `
              <div class="checklist-item-row ${item.level > 0 ? 'nested-checklist-indent' : ''}">
                <div class="checklist-item-left">
                  <div class="custom-checkbox ${item.completed ? 'checked' : ''}" onclick="window.checklistsModule.toggleItem('${group.id}', '${item.id}')">
                    ${item.completed ? '✓' : ''}
                  </div>
                  <span class="checklist-text ${item.completed ? 'checked' : ''}">${item.text}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 0.25rem;">
                  <button class="btn-icon btn-sm" onclick="window.checklistsModule.indentItem('${group.id}', '${item.id}')" title="Indent subtask">➡️</button>
                  <button class="btn-icon btn-sm" onclick="window.checklistsModule.outdentItem('${group.id}', '${item.id}')" title="Outdent">⬅️</button>
                  <button class="btn-icon btn-sm" onclick="window.checklistsModule.deleteItem('${group.id}', '${item.id}')" title="Delete item" style="color: var(--danger);">✕</button>
                </div>
              </div>
            `).join('')}

            <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem;">
              <input type="text" id="quick-add-input-${group.id}" placeholder="Type new item or subtask and press Enter..." 
                     style="font-size: 0.85rem; padding: 0.45rem 0.8rem;"
                     onkeydown="if(event.key==='Enter') window.checklistsModule.addQuickItem('${group.id}')">
              <button class="btn btn-sm btn-primary" onclick="window.checklistsModule.addQuickItem('${group.id}')">Add</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  toggleGroupCollapse(groupId) {
    const lists = window.taskflowStore.getChecklists();
    const group = lists.find(g => g.id === groupId);
    if (!group) return;

    group.collapsed = !group.collapsed;
    window.taskflowStore.saveChecklists(lists);
    this.render();
  }

  toggleItem(groupId, itemId) {
    const lists = window.taskflowStore.getChecklists();
    const group = lists.find(g => g.id === groupId);
    if (!group) return;

    const item = group.items.find(i => i.id === itemId);
    if (!item) return;

    item.completed = !item.completed;
    window.taskflowStore.saveChecklists(lists);

    if (item.completed) {
      window.taskFlowApp.playSound('success');
    } else {
      window.taskFlowApp.playSound('click');
    }

    this.render();
  }

  addQuickItem(groupId) {
    const input = document.getElementById(`quick-add-input-${groupId}`);
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const lists = window.taskflowStore.getChecklists();
    const group = lists.find(g => g.id === groupId);
    if (!group) return;

    group.items.push({
      id: `ci-${Date.now()}`,
      text: text,
      completed: false,
      level: 0
    });

    window.taskflowStore.saveChecklists(lists);
    window.taskFlowApp.showToast('Item added to checklist', 'success');
    this.render();
  }

  addItemPrompt(groupId) {
    const text = prompt('Enter checklist item text:');
    if (!text || !text.trim()) return;

    const lists = window.taskflowStore.getChecklists();
    const group = lists.find(g => g.id === groupId);
    if (!group) return;

    group.items.push({
      id: `ci-${Date.now()}`,
      text: text.trim(),
      completed: false,
      level: 0
    });

    window.taskflowStore.saveChecklists(lists);
    this.render();
  }

  indentItem(groupId, itemId) {
    const lists = window.taskflowStore.getChecklists();
    const group = lists.find(g => g.id === groupId);
    if (!group) return;
    const item = group.items.find(i => i.id === itemId);
    if (item) {
      item.level = 1;
      window.taskflowStore.saveChecklists(lists);
      this.render();
    }
  }

  outdentItem(groupId, itemId) {
    const lists = window.taskflowStore.getChecklists();
    const group = lists.find(g => g.id === groupId);
    if (!group) return;
    const item = group.items.find(i => i.id === itemId);
    if (item) {
      item.level = 0;
      window.taskflowStore.saveChecklists(lists);
      this.render();
    }
  }

  deleteItem(groupId, itemId) {
    const lists = window.taskflowStore.getChecklists();
    const group = lists.find(g => g.id === groupId);
    if (!group) return;

    group.items = group.items.filter(i => i.id !== itemId);
    window.taskflowStore.saveChecklists(lists);
    this.render();
  }

  deleteGroup(groupId) {
    if (!confirm('Are you sure you want to delete this checklist section?')) return;
    let lists = window.taskflowStore.getChecklists();
    lists = lists.filter(g => g.id !== groupId);
    window.taskflowStore.saveChecklists(lists);
    window.taskFlowApp.showToast('Checklist section removed', 'info');
    this.render();
  }

  openCreateGroupPrompt() {
    const title = prompt('Enter title for the new Toggle Checklist section:');
    if (!title || !title.trim()) return;

    const category = prompt('Category (Study, Work, Personal, Team):', 'Study') || 'Study';

    const lists = window.taskflowStore.getChecklists();
    const newGroup = {
      id: `chk-${Date.now()}`,
      title: title.trim(),
      category: category.trim(),
      collapsed: false,
      items: [
        { id: `ci-${Date.now()}-1`, text: 'First milestone item', completed: false, level: 0 }
      ]
    };

    lists.unshift(newGroup);
    window.taskflowStore.saveChecklists(lists);
    window.taskFlowApp.showToast(`Created section: "${title}"`, 'success');
    this.render();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.checklistsModule = new ChecklistsModule();
});
