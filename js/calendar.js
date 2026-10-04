/**
 * TaskFlow – Interactive Calendar Controller
 * Features Monthly & Weekly Views, Task Deadline Tracking & Day Task Inspector
 */

class CalendarModule {
  constructor() {
    this.currentDate = new Date();
    this.viewMode = 'month'; // 'month' or 'week'
    this.selectedDateStr = null;

    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Navigation buttons
    const prevBtn = document.getElementById('cal-btn-prev');
    const nextBtn = document.getElementById('cal-btn-next');
    const todayBtn = document.getElementById('cal-btn-today');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.viewMode === 'month') {
          this.currentDate.setMonth(this.currentDate.getMonth() - 1);
        } else {
          this.currentDate.setDate(this.currentDate.getDate() - 7);
        }
        this.render();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.viewMode === 'month') {
          this.currentDate.setMonth(this.currentDate.getMonth() + 1);
        } else {
          this.currentDate.setDate(this.currentDate.getDate() + 7);
        }
        this.render();
      });
    }

    if (todayBtn) {
      todayBtn.addEventListener('click', () => {
        this.currentDate = new Date();
        this.render();
      });
    }

    // View switcher (Month vs Week)
    document.querySelectorAll('.cal-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cal-view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.viewMode = btn.getAttribute('data-mode');
        this.render();
      });
    });

    // Close Day Task Inspector modal
    document.querySelectorAll('.close-day-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        window.taskFlowApp.closeModal('cal-day-modal');
      });
    });
  }

  render() {
    const titleEl = document.getElementById('cal-month-title');
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    if (titleEl) {
      titleEl.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
    }

    if (this.viewMode === 'month') {
      this.renderMonthView();
    } else {
      this.renderWeekView();
    }
  }

  renderMonthView() {
    const grid = document.getElementById('calendar-days-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDayCurrent = new Date(year, month + 1, 0).getDate();
    const lastDayPrev = new Date(year, month, 0).getDate();

    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
    const tasks = window.taskflowStore.getTasks();

    // Previous month filler days
    for (let i = firstDayIndex; i > 0; i--) {
      const prevDateNum = lastDayPrev - i + 1;
      const cell = document.createElement('div');
      cell.className = 'calendar-day-cell other-month';
      cell.innerHTML = `<span class="day-number">${prevDateNum}</span>`;
      grid.appendChild(cell);
    }

    // Current month days
    for (let day = 1; day <= lastDayCurrent; day++) {
      const cell = document.createElement('div');
      const isToday = isCurrentMonth && day === today.getDate();
      cell.className = `calendar-day-cell ${isToday ? 'today' : ''}`;

      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayTasks = tasks.filter(t => (t.dueDate === dateStr || t.deadline === dateStr));

      let tasksHtml = '';
      dayTasks.slice(0, 3).forEach(task => {
        const bg = task.priority === 'urgent' ? 'rgba(239, 68, 68, 0.15)' :
                   task.priority === 'high' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(37, 99, 235, 0.15)';
        const color = task.priority === 'urgent' ? 'var(--danger)' :
                      task.priority === 'high' ? 'var(--warning)' : 'var(--primary)';

        tasksHtml += `
          <div class="calendar-task-tag" style="background: ${bg}; color: ${color};" title="${task.title}">
            ${task.status === 'done' ? '✓ ' : ''}${task.title}
          </div>
        `;
      });

      if (dayTasks.length > 3) {
        tasksHtml += `<div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 700;">+${dayTasks.length - 3} more</div>`;
      }

      cell.innerHTML = `
        <span class="day-number">${day}</span>
        <div style="flex: 1; overflow: hidden; display: flex; flex-direction: column; gap: 2px;">
          ${tasksHtml}
        </div>
      `;

      cell.addEventListener('click', () => this.openDayDetails(dateStr, dayTasks, day));
      grid.appendChild(cell);
    }

    // Next month filler days to complete grid 35 or 42 cells
    const totalCells = firstDayIndex + lastDayCurrent;
    const remaining = 35 - totalCells > 0 ? 35 - totalCells : (42 - totalCells > 0 ? 42 - totalCells : 0);

    for (let j = 1; j <= remaining; j++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-day-cell other-month';
      cell.innerHTML = `<span class="day-number">${j}</span>`;
      grid.appendChild(cell);
    }
  }

  renderWeekView() {
    const grid = document.getElementById('calendar-days-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const current = new Date(this.currentDate);
    const dayOfWeek = current.getDay();
    const sunday = new Date(current.setDate(current.getDate() - dayOfWeek));

    const tasks = window.taskflowStore.getTasks();
    const todayStr = new Date().toISOString().split('T')[0];

    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(sunday);
      dayDate.setDate(sunday.getDate() + i);

      const dateStr = dayDate.toISOString().split('T')[0];
      const isToday = dateStr === todayStr;
      const dayTasks = tasks.filter(t => (t.dueDate === dateStr || t.deadline === dateStr));

      const cell = document.createElement('div');
      cell.className = `calendar-day-cell ${isToday ? 'today' : ''}`;
      cell.style.minHeight = '320px';

      cell.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border-light); padding-bottom: 4px; margin-bottom: 8px;">
          <span class="day-number" style="font-size: 1rem;">${dayDate.getDate()}</span>
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i]}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; flex: 1;">
          ${dayTasks.map(task => `
            <div class="calendar-task-tag" style="background: var(--bg-hover); padding: 6px 8px; border-left: 3px solid ${task.priority === 'urgent' ? 'var(--danger)' : 'var(--primary)'}; border-radius: 4px;">
              <div style="font-weight: 600; font-size: 0.78rem;">${task.title}</div>
              <div style="font-size: 0.7rem; color: var(--text-muted);">${task.category || 'General'} • ${task.priority || 'medium'}</div>
            </div>
          `).join('')}
          <button class="btn btn-sm btn-ghost" style="margin-top: auto; font-size: 0.75rem; width: 100%; border: 1px dashed var(--border-medium);" onclick="window.calendarModule.quickAddTaskOnDate('${dateStr}')">+ Add</button>
        </div>
      `;

      grid.appendChild(cell);
    }
  }

  openDayDetails(dateStr, tasks, dayNum) {
    this.selectedDateStr = dateStr;
    const modalTitle = document.getElementById('cal-day-modal-title');
    const modalBody = document.getElementById('cal-day-modal-body');

    if (modalTitle) {
      modalTitle.textContent = `Schedule for ${dateStr}`;
    }

    if (modalBody) {
      if (tasks.length === 0) {
        modalBody.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
            No tasks scheduled for this day.<br><br>
            <button class="btn btn-primary btn-sm" onclick="window.calendarModule.quickAddTaskOnDate('${dateStr}')">+ Schedule Task</button>
          </div>
        `;
      } else {
        modalBody.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 0.85rem; margin-bottom: 1.5rem;">
            ${tasks.map(t => {
              const taskId = t._id || t.id;
              return `
              <div class="glass-card" style="padding: 0.85rem 1rem; display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <div style="font-weight: 600; font-size: 0.9rem;">${t.title}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${t.category || 'General'} • Assigned to ${t.assignedTo || 'Unassigned'}</div>
                </div>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span class="badge ${t.priority === 'urgent' ? 'badge-danger' : 'badge-primary'}">${t.priority}</span>
                  <div class="custom-checkbox ${t.status === 'done' ? 'checked' : ''}" onclick="window.tasksModule.toggleTaskStatus('${taskId}'); window.calendarModule.render(); window.taskFlowApp.closeModal('cal-day-modal');">
                    ${t.status === 'done' ? '✓' : ''}
                  </div>
                </div>
              </div>
            `;}).join('')}
          </div>
          <button class="btn btn-outline btn-sm" style="width: 100%;" onclick="window.calendarModule.quickAddTaskOnDate('${dateStr}')">+ Add Another Task on this Date</button>
        `;
      }
    }

    window.taskFlowApp.openModal('cal-day-modal');
  }

  quickAddTaskOnDate(dateStr) {
    window.taskFlowApp.closeModal('cal-day-modal');
    if (window.tasksModule) {
      window.tasksModule.openCreateModal();
      const dateField = document.getElementById('task-input-duedate');
      if (dateField) dateField.value = dateStr;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.calendarModule = new CalendarModule();
});
