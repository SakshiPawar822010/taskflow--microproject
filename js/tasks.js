/**
 * TaskFlow – Task Management Controller
 * Handles Kanban Drag & Drop, List/Table Views, Filtering, Search, Modal CRUD, Confetti Celebration
 * Fully connected with Node.js, Express & MongoDB backend (http://localhost:5000)
 */

if (typeof API_BASE_URL === 'undefined') {
  var API_BASE_URL = 'http://localhost:5000';
}

class TasksModule {
  constructor() {
    this.currentViewMode = 'kanban'; // 'kanban', 'list', 'table'
    this.activeFilterCategory = 'all';
    this.activeFilterPriority = 'all';
    this.searchQuery = '';
    this.editingTaskId = null;
    this.draggedTaskId = null;
    this.recentlyDeletedTask = null;

    this.init();
  }

  init() {
    this.setupEventListeners();
    // Load logged-in user's tasks from MongoDB on start
    this.loadTasksFromBackend();
  }

  // ==========================================
  // Fetch only the logged-in user's tasks from MongoDB
  // ==========================================
  async loadTasksFromBackend() {
    const currentUser = window.taskflowStore.getCurrentUser();
    if (!currentUser) return;
    const userId = currentUser.id || currentUser._id;
    if (!userId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks?userId=${userId}`);
      const data = await response.json();

      if (data.success && Array.isArray(data.tasks)) {
        // Normalize MongoDB fields (_id -> id, deadline -> dueDate)
        const normalized = data.tasks.map(t => ({
          ...t,
          id: t._id || t.id,
          _id: t._id || t.id,
          dueDate: t.deadline || t.dueDate || '',
          deadline: t.deadline || t.dueDate || '',
          category: t.category || 'Study',
          priority: t.priority || 'medium',
          status: t.status || 'todo',
          assignedTo: t.assignedTo || currentUser.name,
          assigneeAvatar: (t.assignedTo || currentUser.name).substring(0, 2).toUpperCase()
        }));

        window.taskflowStore.saveTasks(normalized);
        this.render();

        // Also update dashboard counts if visible
        if (window.taskFlowApp && window.taskFlowApp.currentView === 'dashboard') {
          window.taskFlowApp.renderDashboard();
        }
      }
    } catch (err) {
      console.warn('Backend server not reachable on load. Using cached tasks:', err);
      this.render();
    }
  }

  setupEventListeners() {
    // View Switcher Buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentViewMode = btn.getAttribute('data-view-mode');
        this.render();
      });
    });

    // Filters
    const categoryFilter = document.getElementById('task-filter-category');
    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        this.activeFilterCategory = e.target.value;
        this.render();
      });
    }

    const priorityFilter = document.getElementById('task-filter-priority');
    if (priorityFilter) {
      priorityFilter.addEventListener('change', (e) => {
        this.activeFilterPriority = e.target.value;
        this.render();
      });
    }

    // Search
    const searchInput = document.getElementById('task-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.render();
      });
    }

    // Create Task Modal Trigger
    const btnNewTask = document.getElementById('btn-new-task');
    if (btnNewTask) {
      btnNewTask.addEventListener('click', () => this.openCreateModal());
    }

    // Modal Form Submit
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
      taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveTaskFromForm();
      });
    }

    // Modal Close Triggers
    document.querySelectorAll('.close-task-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        window.taskFlowApp.closeModal('task-modal');
      });
    });

    // Add subtask item in modal
    const btnAddModalSubtask = document.getElementById('btn-add-modal-subtask');
    if (btnAddModalSubtask) {
      btnAddModalSubtask.addEventListener('click', () => this.addModalSubtaskRow());
    }
  }

  // Retrieve filtered tasks
  getFilteredTasks() {
    const tasks = window.taskflowStore.getTasks();
    return tasks.filter(task => {
      const matchCategory = (this.activeFilterCategory === 'all' || (task.category && task.category.toLowerCase() === this.activeFilterCategory.toLowerCase()));
      const matchPriority = (this.activeFilterPriority === 'all' || (task.priority && task.priority.toLowerCase() === this.activeFilterPriority.toLowerCase()));
      const matchSearch = (!this.searchQuery ||
        (task.title && task.title.toLowerCase().includes(this.searchQuery)) ||
        (task.description && task.description.toLowerCase().includes(this.searchQuery)) ||
        (task.category && task.category.toLowerCase().includes(this.searchQuery)));
      return matchCategory && matchPriority && matchSearch;
    });
  }

  // Main Render router
  render() {
    const tasks = this.getFilteredTasks();

    const kanbanContainer = document.getElementById('tasks-kanban-view');
    const listContainer = document.getElementById('tasks-list-view');
    const tableContainer = document.getElementById('tasks-table-view');

    if (this.currentViewMode === 'kanban') {
      if (kanbanContainer) kanbanContainer.style.display = 'grid';
      if (listContainer) listContainer.style.display = 'none';
      if (tableContainer) tableContainer.style.display = 'none';
      this.renderKanban(tasks);
    } else if (this.currentViewMode === 'list') {
      if (kanbanContainer) kanbanContainer.style.display = 'none';
      if (listContainer) listContainer.style.display = 'block';
      if (tableContainer) tableContainer.style.display = 'none';
      this.renderList(tasks);
    } else if (this.currentViewMode === 'table') {
      if (kanbanContainer) kanbanContainer.style.display = 'none';
      if (listContainer) listContainer.style.display = 'none';
      if (tableContainer) tableContainer.style.display = 'block';
      this.renderTable(tasks);
    }

    // Refresh Dashboard if visible
    if (window.taskFlowApp && window.taskFlowApp.currentView === 'dashboard') {
      window.taskFlowApp.renderDashboard();
    }
  }

  // --- Kanban Board Render & Drag-and-Drop ---
  renderKanban(tasks) {
    const columns = {
      todo: document.getElementById('col-tasks-todo'),
      inprogress: document.getElementById('col-tasks-inprogress'),
      inreview: document.getElementById('col-tasks-inreview'),
      done: document.getElementById('col-tasks-done')
    };

    const counts = {
      todo: document.getElementById('count-todo'),
      inprogress: document.getElementById('count-inprogress'),
      inreview: document.getElementById('count-inreview'),
      done: document.getElementById('count-done')
    };

    // Reset column lists
    Object.keys(columns).forEach(status => {
      if (columns[status]) columns[status].innerHTML = '';
      if (counts[status]) counts[status].textContent = '0';
    });

    const statusCounts = { todo: 0, inprogress: 0, inreview: 0, done: 0 };

    tasks.forEach(task => {
      const col = columns[task.status] || columns.todo;
      if (col) {
        statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
        col.appendChild(this.createTaskCardElement(task));
      }
    });

    Object.keys(counts).forEach(status => {
      if (counts[status]) counts[status].textContent = statusCounts[status] || '0';
    });

    this.setupKanbanDragAndDrop();
  }

  createTaskCardElement(task) {
    const taskId = task._id || task.id;
    const taskDate = task.deadline || task.dueDate || 'No date';

    const card = document.createElement('div');
    card.className = `task-card ${task.status === 'done' ? 'completed' : ''}`;
    card.setAttribute('draggable', 'true');
    card.setAttribute('data-task-id', taskId);

    const priorityBadge = task.priority === 'urgent' ? 'badge-danger' :
                          task.priority === 'high' ? 'badge-warning' :
                          task.priority === 'medium' ? 'badge-primary' : 'badge-neutral';

    const categoryBadge = task.category === 'Study' ? 'badge-purple' :
                          task.category === 'Work' ? 'badge-primary' :
                          task.category === 'Team' ? 'badge-success' : 'badge-warning';

    const isOverdue = taskDate && taskDate !== 'No date' && new Date(taskDate) < new Date(new Date().setHours(0,0,0,0)) && task.status !== 'done';

    // Subtasks summary
    const totalSub = task.subtasks ? task.subtasks.length : 0;
    const completedSub = task.subtasks ? task.subtasks.filter(s => s.completed).length : 0;

    card.innerHTML = `
      <div class="task-card-header">
        <div style="display: flex; gap: 0.35rem; align-items: center;">
          <span class="badge ${categoryBadge}">${task.category || 'General'}</span>
          <span class="badge ${priorityBadge}">${task.priority || 'medium'}</span>
        </div>
        <div class="task-actions">
          <button class="btn-icon btn-sm btn-edit-task" title="Edit Task" data-id="${taskId}">✏️</button>
          <button class="btn-icon btn-sm btn-delete-task" title="Delete Task" data-id="${taskId}">🗑️</button>
        </div>
      </div>
      <div class="task-title" data-id="${taskId}">${task.title}</div>
      ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
      
      ${totalSub > 0 ? `
        <div class="task-progress-mini">
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 2px;">
            <span>Subtasks</span>
            <span>${completedSub}/${totalSub}</span>
          </div>
          <div class="progress-bar-container" style="height: 5px;">
            <div class="progress-bar-fill" style="width: ${Math.round((completedSub / totalSub) * 100)}%;"></div>
          </div>
        </div>
      ` : ''}

      <div class="task-card-footer">
        <div class="task-deadline ${isOverdue ? 'deadline-overdue' : ''}">
          <span>📅</span>
          <span>${taskDate}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <div class="avatar" style="width: 26px; height: 26px; font-size: 0.7rem;" title="${task.assignedTo || 'Assigned'}">
            ${task.assigneeAvatar || 'U'}
          </div>
          <div class="custom-checkbox ${task.status === 'done' ? 'checked' : ''}" data-id="${taskId}" title="Toggle Complete">
            ${task.status === 'done' ? '✓' : ''}
          </div>
        </div>
      </div>
    `;

    // Event listeners
    card.querySelector('.task-title').addEventListener('click', () => this.openEditModal(taskId));
    card.querySelector('.btn-edit-task').addEventListener('click', (e) => {
      e.stopPropagation();
      this.openEditModal(taskId);
    });
    card.querySelector('.btn-delete-task').addEventListener('click', (e) => {
      e.stopPropagation();
      this.deleteTask(taskId);
    });
    card.querySelector('.custom-checkbox').addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleTaskStatus(taskId);
    });

    return card;
  }

  setupKanbanDragAndDrop() {
    const cards = document.querySelectorAll('.task-card');
    const lists = document.querySelectorAll('.kanban-task-list');

    cards.forEach(card => {
      card.addEventListener('dragstart', (e) => {
        this.draggedTaskId = card.getAttribute('data-task-id');
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', this.draggedTaskId);
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        this.draggedTaskId = null;
        lists.forEach(l => l.classList.remove('drag-over'));
      });
    });

    lists.forEach(list => {
      list.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        list.classList.add('drag-over');
      });

      list.addEventListener('dragleave', (e) => {
        if (!list.contains(e.relatedTarget)) {
          list.classList.remove('drag-over');
        }
      });

      list.addEventListener('drop', (e) => {
        e.preventDefault();
        list.classList.remove('drag-over');
        const taskId = e.dataTransfer.getData('text/plain') || this.draggedTaskId;
        const newStatus = list.getAttribute('data-status');
        if (taskId && newStatus) {
          this.updateTaskStatus(taskId, newStatus);
        }
      });
    });
  }

  // --- List View Render ---
  renderList(tasks) {
    const container = document.getElementById('tasks-list-view');
    if (!container) return;

    if (tasks.length === 0) {
      container.innerHTML = '<div class="glass-card" style="padding: 3rem; text-align: center; color: var(--text-muted);">No tasks found for your account. Click "+ Create Task" to add one!</div>';
      return;
    }

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 0.85rem;">
        ${tasks.map(t => {
          const taskId = t._id || t.id;
          const taskDate = t.deadline || t.dueDate || 'No date';
          return `
            <div class="glass-card" style="padding: 1.15rem 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; border-left: 4px solid ${t.priority === 'urgent' ? 'var(--danger)' : t.priority === 'high' ? 'var(--warning)' : 'var(--primary)'};">
              <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
                <div class="custom-checkbox ${t.status === 'done' ? 'checked' : ''}" onclick="window.tasksModule.toggleTaskStatus('${taskId}')">
                  ${t.status === 'done' ? '✓' : ''}
                </div>
                <div>
                  <div style="font-weight: 700; font-size: 0.95rem; ${t.status === 'done' ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${t.title}</div>
                  <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">${t.description || 'No description provided'}</div>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span class="badge ${t.category === 'Study' ? 'badge-purple' : 'badge-primary'}">${t.category || 'General'}</span>
                <span class="badge ${t.status === 'done' ? 'badge-success' : 'badge-neutral'}">${t.status}</span>
                <span style="font-size: 0.8rem; color: var(--text-muted); min-width: 90px;">📅 ${taskDate}</span>
                <div class="avatar" style="width: 28px; height: 28px; font-size: 0.75rem;">${t.assigneeAvatar || 'U'}</div>
                <button class="btn-icon btn-sm" onclick="window.tasksModule.openEditModal('${taskId}')">✏️</button>
                <button class="btn-icon btn-sm" onclick="window.tasksModule.deleteTask('${taskId}')">🗑️</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // --- Table View Render ---
  renderTable(tasks) {
    const container = document.getElementById('tasks-table-view');
    if (!container) return;

    if (tasks.length === 0) {
      container.innerHTML = '<div class="glass-card" style="padding: 3rem; text-align: center; color: var(--text-muted);">No tasks found</div>';
      return;
    }

    container.innerHTML = `
      <table class="tasks-list-table">
        <thead>
          <tr>
            <th style="width: 40px;">Status</th>
            <th>Task Title</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Due Date</th>
            <th>Assignee</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${tasks.map(t => {
            const taskId = t._id || t.id;
            const taskDate = t.deadline || t.dueDate || '—';
            return `
              <tr>
                <td>
                  <div class="custom-checkbox ${t.status === 'done' ? 'checked' : ''}" onclick="window.tasksModule.toggleTaskStatus('${taskId}')">
                    ${t.status === 'done' ? '✓' : ''}
                  </div>
                </td>
                <td>
                  <span style="font-weight: 600; cursor: pointer; ${t.status === 'done' ? 'text-decoration: line-through; opacity: 0.6;' : ''}" onclick="window.tasksModule.openEditModal('${taskId}')">
                    ${t.title}
                  </span>
                </td>
                <td><span class="badge badge-neutral">${t.category || 'General'}</span></td>
                <td><span class="badge ${t.priority === 'urgent' ? 'badge-danger' : t.priority === 'high' ? 'badge-warning' : 'badge-primary'}">${t.priority}</span></td>
                <td style="font-size: 0.85rem; color: var(--text-muted);">${taskDate}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div class="avatar" style="width: 24px; height: 24px; font-size: 0.65rem;">${t.assigneeAvatar || 'U'}</div>
                    <span style="font-size: 0.85rem;">${t.assignedTo || 'Assigned'}</span>
                  </div>
                </td>
                <td style="text-align: right;">
                  <button class="btn-icon btn-sm" onclick="window.tasksModule.openEditModal('${taskId}')">✏️</button>
                  <button class="btn-icon btn-sm" onclick="window.tasksModule.deleteTask('${taskId}')">🗑️</button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  }

  // ==========================================
  // Update Task Status / Mark Completed (PUT /api/tasks/:id)
  // ==========================================
  async updateTaskStatus(taskId, newStatus) {
    const tasks = window.taskflowStore.getTasks();
    const task = tasks.find(t => (t.id === taskId || t._id === taskId));
    if (!task) return;

    const oldStatus = task.status;
    task.status = newStatus;

    if (newStatus === 'done' && oldStatus !== 'done') {
      task.progress = 100;
      if (task.subtasks) task.subtasks.forEach(s => s.completed = true);
      window.taskFlowApp.playSound('success');
      window.taskFlowApp.triggerConfetti();
      window.taskFlowApp.showToast(`Completed: "${task.title}"! 🎉`, 'success');
    } else {
      window.taskFlowApp.playSound('click');
    }

    window.taskflowStore.saveTasks(tasks);
    this.render();

    // Sync status with MongoDB via PUT /api/tasks/:id
    try {
      await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.warn('Could not update task status in MongoDB:', err);
    }
  }

  toggleTaskStatus(taskId) {
    const tasks = window.taskflowStore.getTasks();
    const task = tasks.find(t => (t.id === taskId || t._id === taskId));
    if (!task) return;

    if (task.status === 'done') {
      this.updateTaskStatus(taskId, 'todo');
    } else {
      this.updateTaskStatus(taskId, 'done');
    }
  }

  // --- CRUD Modals ---
  openCreateModal() {
    this.editingTaskId = null;
    document.getElementById('modal-task-title-heading').textContent = 'Create New Task';
    document.getElementById('task-input-title').value = '';
    document.getElementById('task-input-desc').value = '';
    document.getElementById('task-input-category').value = 'Study';
    document.getElementById('task-input-priority').value = 'medium';

    // Default to 2 days from now
    const d = new Date();
    d.setDate(d.getDate() + 2);
    document.getElementById('task-input-duedate').value = d.toISOString().split('T')[0];
    document.getElementById('task-input-status').value = 'todo';

    // Current user as assignee default
    const currentUser = window.taskflowStore.getCurrentUser();
    document.getElementById('task-input-assignee').value = currentUser ? currentUser.name : '';

    const subtaskContainer = document.getElementById('modal-subtasks-container');
    if (subtaskContainer) {
      subtaskContainer.innerHTML = '';
      this.addModalSubtaskRow('Initial review');
    }

    window.taskFlowApp.openModal('task-modal');
  }

  openEditModal(taskId) {
    const tasks = window.taskflowStore.getTasks();
    const task = tasks.find(t => (t.id === taskId || t._id === taskId));
    if (!task) return;

    this.editingTaskId = taskId;
    document.getElementById('modal-task-title-heading').textContent = 'Edit Task';
    document.getElementById('task-input-title').value = task.title;
    document.getElementById('task-input-desc').value = task.description || '';
    document.getElementById('task-input-category').value = task.category || 'Study';
    document.getElementById('task-input-priority').value = task.priority || 'medium';
    document.getElementById('task-input-duedate').value = task.deadline || task.dueDate || '';
    document.getElementById('task-input-status').value = task.status || 'todo';
    document.getElementById('task-input-assignee').value = task.assignedTo || '';

    const subtaskContainer = document.getElementById('modal-subtasks-container');
    if (subtaskContainer) {
      subtaskContainer.innerHTML = '';
      if (task.subtasks && task.subtasks.length > 0) {
        task.subtasks.forEach(sub => this.addModalSubtaskRow(sub.title, sub.completed));
      }
    }

    window.taskFlowApp.openModal('task-modal');
  }

  addModalSubtaskRow(text = '', completed = false) {
    const container = document.getElementById('modal-subtasks-container');
    if (!container) return;

    const row = document.createElement('div');
    row.style.cssText = 'display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;';
    row.innerHTML = `
      <input type="checkbox" ${completed ? 'checked' : ''} class="modal-subtask-check" style="width: 18px; height: 18px;">
      <input type="text" value="${text}" placeholder="Subtask title..." class="modal-subtask-text" style="flex: 1; padding: 0.4rem 0.6rem; font-size: 0.85rem;">
      <button type="button" class="btn-icon btn-sm btn-remove-subtask" style="color: var(--danger);">✕</button>
    `;

    row.querySelector('.btn-remove-subtask').addEventListener('click', () => row.remove());
    container.appendChild(row);
  }

  // ==========================================
  // Add / Edit Task in MongoDB
  // ==========================================
  async saveTaskFromForm() {
    const title = document.getElementById('task-input-title').value.trim();
    if (!title) {
      alert('Task title is required!');
      return;
    }

    const description = document.getElementById('task-input-desc').value.trim();
    const category = document.getElementById('task-input-category').value;
    const priority = document.getElementById('task-input-priority').value;
    const dueDate = document.getElementById('task-input-duedate').value;
    const status = document.getElementById('task-input-status').value;
    const assignedTo = document.getElementById('task-input-assignee').value;

    if (!dueDate) {
      alert('Deadline / Due date is required!');
      return;
    }

    const currentUser = window.taskflowStore.getCurrentUser();
    const userId = currentUser ? (currentUser.id || currentUser._id) : null;

    if (!userId) {
      alert('Please log in first to save tasks to your account.');
      return;
    }

    // Subtasks collection
    const subtasks = [];
    document.querySelectorAll('#modal-subtasks-container > div').forEach((row, i) => {
      const text = row.querySelector('.modal-subtask-text').value.trim();
      const completed = row.querySelector('.modal-subtask-check').checked;
      if (text) {
        subtasks.push({ id: `sub-${Date.now()}-${i}`, title: text, completed });
      }
    });

    const tasks = window.taskflowStore.getTasks();

    if (this.editingTaskId) {
      // ------------------------------------------
      // 3. EDIT TASK (PUT /api/tasks/:id)
      // ------------------------------------------
      try {
        const response = await fetch(`${API_BASE_URL}/api/tasks/${this.editingTaskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            category,
            priority,
            deadline: dueDate,
            dueDate,
            status,
            userId
          })
        });

        const data = await response.json();

        if (data.success && data.task) {
          const index = tasks.findIndex(t => (t.id === this.editingTaskId || t._id === this.editingTaskId));
          if (index !== -1) {
            tasks[index] = {
              ...tasks[index],
              ...data.task,
              id: data.task._id || this.editingTaskId,
              _id: data.task._id || this.editingTaskId,
              dueDate: data.task.deadline || dueDate,
              assignedTo: assignedTo || currentUser.name,
              subtasks
            };
            window.taskflowStore.saveTasks(tasks);
          }
          window.taskFlowApp.showToast('Task updated in MongoDB!', 'success');
        } else {
          alert(data.message || 'Failed to update task.');
        }
      } catch (err) {
        console.error('Error updating task in backend:', err);
        alert('Could not update task on backend server at http://localhost:5000');
      }

    } else {
      // ------------------------------------------
      // 4. ADD TASK (POST /api/tasks)
      // ------------------------------------------
      try {
        const response = await fetch(`${API_BASE_URL}/api/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            category,
            priority,
            deadline: dueDate,
            dueDate,
            status,
            userId
          })
        });

        const data = await response.json();

        if (data.success && data.task) {
          const newTask = {
            ...data.task,
            id: data.task._id,
            _id: data.task._id,
            dueDate: data.task.deadline || dueDate,
            deadline: data.task.deadline || dueDate,
            assignedTo: assignedTo || currentUser.name,
            assigneeAvatar: (assignedTo || currentUser.name).substring(0, 2).toUpperCase(),
            subtasks
          };

          tasks.unshift(newTask);
          window.taskflowStore.saveTasks(tasks);
          window.taskFlowApp.showToast('Task added to MongoDB!', 'success');
        } else {
          alert(data.message || 'Failed to save task.');
        }
      } catch (err) {
        console.error('Error adding task to MongoDB:', err);
        alert('Could not save task to backend at http://localhost:5000');
      }
    }

    window.taskFlowApp.closeModal('task-modal');
    this.render();
  }

  // ==========================================
  // 5. Delete Task from MongoDB (DELETE /api/tasks/:id)
  // ==========================================
  async deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    const tasks = window.taskflowStore.getTasks();
    const index = tasks.findIndex(t => (t.id === taskId || t._id === taskId));
    if (index === -1) return;

    this.recentlyDeletedTask = tasks[index];
    tasks.splice(index, 1);
    window.taskflowStore.saveTasks(tasks);
    this.render();

    // Call DELETE API on backend
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (data.success) {
        window.taskFlowApp.showToast('Task deleted from MongoDB', 'info');
      }
    } catch (err) {
      console.error('Error deleting task on backend:', err);
    }
  }
}

// Module Instance
document.addEventListener('DOMContentLoaded', () => {
  window.tasksModule = new TasksModule();
});

