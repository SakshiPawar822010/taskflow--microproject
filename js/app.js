/**
 * TaskFlow – Application Core Controller
 * Handles Routing, State, Navigation, Dark Mode, Command Palette, Toasts, Confetti & Audio
 */

class TaskFlowApp {
  constructor() {
    this.currentView = 'landing';
    this.audioContext = null;
    this.soundEnabled = true;
    this.init();
  }

  init() {
    this.setupTheme();
    this.setupRouting();
    this.setupUser();
    this.setupNavigation();
    this.setupCommandPalette();
    this.setupNotifications();
    this.setupAudio();
    this.updateNotificationBadge();

    // Check URL hash or default
    const hash = window.location.hash.replace('#', '') || 'landing';
    this.navigateTo(hash);
  }

  // --- Theme Management ---
  setupTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
    }

    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => this.toggleTheme());
    }

    const settingsThemeToggle = document.getElementById('settings-theme-toggle');
    if (settingsThemeToggle) {
      settingsThemeToggle.checked = (savedTheme === 'dark');
      settingsThemeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.setTheme('dark');
        } else {
          this.setTheme('light');
        }
      });
    }
  }

  toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    const theme = isDark ? 'dark' : 'light';
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    this.showToast(`Switched to ${theme} mode`, 'info');

    const settingsThemeToggle = document.getElementById('settings-theme-toggle');
    if (settingsThemeToggle) {
      settingsThemeToggle.checked = isDark;
    }
  }

  setTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    this.showToast(`Theme updated to ${theme} mode`, 'info');
  }

  // --- Web Audio Feedback (Zero-Dependency Synthesized SFX) ---
  setupAudio() {
    // Lazy initialize on first interaction to comply with browser audio policies
    document.addEventListener('click', () => {
      if (!this.audioContext) {
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          this.audioContext = new AudioContext();
        } catch (e) {
          console.warn('Web Audio API not supported', e);
        }
      }
    }, { once: true });
  }

  playSound(type = 'success') {
    if (!this.soundEnabled || !this.audioContext) return;
    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, this.audioContext.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, this.audioContext.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.25);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.25);
      } else if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
        gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.05);
      }
    } catch (e) {
      // Audio fallback silent
    }
  }

  // --- Confetti Celebration Effect ---
  triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2,
        r: Math.random() * 6 + 4,
        d: Math.random() * 90,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 1.2) * 14,
        gravity: 0.35,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }

    let animationFrame;
    const startTime = Date.now();

    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = Date.now() - startTime;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.5);
        ctx.restore();
      });

      if (elapsed < 2500) {
        animationFrame = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animationFrame);
      }
    }

    render();
  }

  // --- User Persona System ---
  setupUser() {
    const user = window.taskflowStore.getCurrentUser();
    this.renderUserInfo(user);

    // Switch User dropdown
    const userProfileEl = document.getElementById('sidebar-user-profile');
    const userSwitcherModal = document.getElementById('user-switcher-modal');
    if (userProfileEl && userSwitcherModal) {
      userProfileEl.addEventListener('click', () => {
        this.openModal('user-switcher-modal');
      });
    }

    // Persona selection buttons
    document.querySelectorAll('.persona-switch-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const userId = btn.getAttribute('data-user-id');
        this.switchUser(userId);
      });
    });
  }

  renderUserInfo(user) {
    document.querySelectorAll('.user-name-display').forEach(el => el.textContent = user.name);
    document.querySelectorAll('.user-role-display').forEach(el => el.textContent = user.role);
    document.querySelectorAll('.user-email-display').forEach(el => el.textContent = user.email);
    document.querySelectorAll('.user-workspace-display').forEach(el => el.textContent = user.workspace);
    document.querySelectorAll('.user-avatar-display').forEach(el => {
      el.textContent = user.avatar;
      if (user.avatarBg) el.style.backgroundColor = user.avatarBg;
    });

    // Dynamic greeting based on time of day
    const greetingEl = document.getElementById('dashboard-greeting');
    if (greetingEl) {
      const hour = new Date().getHours();
      let greeting = 'Good evening';
      if (hour < 12) greeting = 'Good morning';
      else if (hour < 17) greeting = 'Good afternoon';
      greetingEl.textContent = `${greeting}, ${user.name.split(' ')[0]}!`;
    }
  }

  switchUser(userId) {
    const user = DEFAULT_USERS.find(u => u.id === userId) || DEFAULT_USERS[0];
    window.taskflowStore.setCurrentUser(user);
    this.renderUserInfo(user);
    this.closeModal('user-switcher-modal');
    this.showToast(`Switched account to ${user.name} (${user.category})`, 'success');

    // Reload user-specific tasks from MongoDB
    if (window.tasksModule) {
      window.tasksModule.loadTasksFromBackend();
    }

    // Re-render modules if active
    if (this.currentView === 'dashboard') this.renderDashboard();
    if (this.currentView === 'tasks' && window.tasksModule) window.tasksModule.render();
    if (this.currentView === 'profile') this.renderProfile();
  }

  // --- Routing & Navigation ---
  setupRouting() {
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'landing';
      this.navigateTo(hash);
    });
  }

  navigateTo(viewId) {
    const validViews = [
      'landing', 'login', 'register', 'dashboard', 'tasks',
      'checklists', 'notes', 'files', 'team', 'calendar', 'analytics', 'profile'
    ];

    if (!validViews.includes(viewId)) {
      viewId = 'landing';
    }

    this.currentView = viewId;

    // Show/hide Landing page wrapper vs App layout
    const appSidebar = document.querySelector('.app-sidebar');
    const appHeader = document.querySelector('.app-header');
    const mainWrapper = document.querySelector('.main-wrapper');

    const isLandingOrAuth = ['landing', 'login', 'register'].includes(viewId);

    if (isLandingOrAuth) {
      if (appSidebar) appSidebar.style.display = 'none';
      if (appHeader) appHeader.style.display = 'none';
      if (mainWrapper) mainWrapper.style.marginLeft = '0';
    } else {
      if (appSidebar) appSidebar.style.display = 'flex';
      if (appHeader) appHeader.style.display = 'flex';
      if (mainWrapper) mainWrapper.style.marginLeft = window.innerWidth <= 768 ? '0' : 'var(--sidebar-width)';
    }

    // Toggle active view
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.remove('active');
    });

    const activeView = document.getElementById(`view-${viewId}`);
    if (activeView) {
      activeView.classList.add('active');
    }

    // Update active nav link in sidebar
    document.querySelectorAll('.nav-item').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('data-view') === viewId) {
        link.classList.add('active');
      }
    });

    // Close mobile sidebar
    if (appSidebar) appSidebar.classList.remove('mobile-open');

    // Trigger page-specific renders
    if (viewId === 'dashboard') {
      if (window.tasksModule) window.tasksModule.loadTasksFromBackend();
      this.renderDashboard();
    }
    if (viewId === 'tasks' && window.tasksModule) {
      window.tasksModule.loadTasksFromBackend();
      window.tasksModule.render();
    }
    if (viewId === 'checklists' && window.checklistsModule) window.checklistsModule.render();
    if (viewId === 'notes' && window.notesModule) window.notesModule.render();
    if (viewId === 'files' && window.filesModule) window.filesModule.render();
    if (viewId === 'team' && window.teamModule) window.teamModule.render();
    if (viewId === 'calendar' && window.calendarModule) window.calendarModule.render();
    if (viewId === 'analytics' && window.analyticsModule) window.analyticsModule.render();
    if (viewId === 'profile') this.renderProfile();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setupNavigation() {
    // Mobile Drawer Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const appSidebar = document.querySelector('.app-sidebar');
    if (mobileMenuBtn && appSidebar) {
      mobileMenuBtn.addEventListener('click', () => {
        appSidebar.classList.toggle('mobile-open');
      });
    }

    // Nav link click events
    document.querySelectorAll('[data-view-target]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const target = el.getAttribute('data-view-target');
        window.location.hash = target;
      });
    });

    // Global quick add task button in header
    const quickAddTaskBtn = document.getElementById('btn-header-add-task');
    if (quickAddTaskBtn) {
      quickAddTaskBtn.addEventListener('click', () => {
        if (window.tasksModule) {
          window.tasksModule.openCreateModal();
        } else {
          this.navigateTo('tasks');
        }
      });
    }
  }

  // --- Notifications Dropdown ---
  setupNotifications() {
    const notifBtn = document.getElementById('notifications-btn');
    const notifDropdown = document.getElementById('notifications-dropdown');

    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('active');
        this.renderNotificationsList();
      });

      document.addEventListener('click', (e) => {
        if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
          notifDropdown.classList.remove('active');
        }
      });
    }

    const markAllReadBtn = document.getElementById('mark-all-read-btn');
    if (markAllReadBtn) {
      markAllReadBtn.addEventListener('click', () => {
        const notifs = window.taskflowStore.getNotifications();
        notifs.forEach(n => n.read = true);
        window.taskflowStore.saveNotifications(notifs);
        this.renderNotificationsList();
        this.updateNotificationBadge();
        this.showToast('All notifications marked as read', 'info');
      });
    }
  }

  updateNotificationBadge() {
    const notifs = window.taskflowStore.getNotifications();
    const unreadCount = notifs.filter(n => !n.read).length;
    const badge = document.getElementById('notif-badge');
    if (badge) {
      if (unreadCount > 0) {
        badge.textContent = unreadCount;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }

  renderNotificationsList() {
    const container = document.getElementById('notifications-list-container');
    if (!container) return;
    const notifs = window.taskflowStore.getNotifications();

    if (notifs.length === 0) {
      container.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No new notifications</div>';
      return;
    }

    container.innerHTML = notifs.map(n => `
      <div class="dropdown-item notif-item ${n.read ? 'read' : 'unread'}" style="opacity: ${n.read ? '0.7' : '1'}; border-left: 3px solid ${n.type === 'urgent' ? 'var(--danger)' : n.type === 'success' ? 'var(--success)' : 'var(--primary)'};">
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 0.825rem; margin-bottom: 2px;">${n.title}</div>
          <div style="font-size: 0.775rem; color: var(--text-muted);">${n.message}</div>
          <div style="font-size: 0.7rem; color: var(--text-subtle); margin-top: 4px;">${n.time}</div>
        </div>
      </div>
    `).join('');
  }

  // --- Command Palette (Ctrl+K or Header Search) ---
  setupCommandPalette() {
    const paletteModal = document.getElementById('command-palette-modal');
    const paletteInput = document.getElementById('palette-input');
    const paletteResults = document.getElementById('palette-results');
    const searchBar = document.getElementById('header-search-bar');

    if (searchBar) {
      searchBar.addEventListener('click', () => this.openCommandPalette());
    }

    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        this.openCommandPalette();
      }
      if (e.key === 'Escape') {
        this.closeModal('command-palette-modal');
      }
    });

    if (paletteInput && paletteResults) {
      paletteInput.addEventListener('input', (e) => {
        this.filterPaletteResults(e.target.value.toLowerCase());
      });
    }
  }

  openCommandPalette() {
    this.openModal('command-palette-modal');
    const input = document.getElementById('palette-input');
    if (input) {
      input.value = '';
      input.focus();
    }
    this.filterPaletteResults('');
  }

  filterPaletteResults(query) {
    const container = document.getElementById('palette-results');
    if (!container) return;

    const commands = [
      { title: 'Go to Dashboard', subtitle: 'Overview, productivity score & statistics', action: () => this.navigateTo('dashboard'), icon: '📊' },
      { title: 'View Task Board', subtitle: 'Interactive Kanban, drag and drop, list view', action: () => this.navigateTo('tasks'), icon: '📋' },
      { title: 'Create New Task', subtitle: 'Add task with priority, category and deadline', action: () => { this.navigateTo('tasks'); if(window.tasksModule) window.tasksModule.openCreateModal(); }, icon: '➕' },
      { title: 'Checklists & Toggles', subtitle: 'Nested subtasks, progress bars, Notion style', action: () => this.navigateTo('checklists'), icon: '☑️' },
      { title: 'Notes Workspace', subtitle: 'Rich text notes, study memos and ideas', action: () => this.navigateTo('notes'), icon: '📝' },
      { title: 'File Manager', subtitle: 'Upload documents, preview PDFs and manage assets', action: () => this.navigateTo('files'), icon: '📁' },
      { title: 'Team Collaboration', subtitle: 'Assign tasks, shared boards and discussions', action: () => this.navigateTo('team'), icon: '👥' },
      { title: 'Interactive Calendar', subtitle: 'Month & week views, deadline schedule', action: () => this.navigateTo('calendar'), icon: '📅' },
      { title: 'Productivity Analytics', subtitle: 'Weekly velocity, category donut & completion trends', action: () => this.navigateTo('analytics'), icon: '📈' },
      { title: 'Profile & Settings', subtitle: 'Manage preferences, dark mode, export data', action: () => this.navigateTo('profile'), icon: '⚙️' },
      { title: 'Toggle Dark Mode', subtitle: 'Switch between light and dark themes', action: () => this.toggleTheme(), icon: '🌓' },
      { title: 'Switch User Persona', subtitle: 'Change between Student, Professional and Team Lead', action: () => this.openModal('user-switcher-modal'), icon: '🔄' }
    ];

    const filtered = commands.filter(c => c.title.toLowerCase().includes(query) || c.subtitle.toLowerCase().includes(query));

    if (filtered.length === 0) {
      container.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--text-muted);">No matching commands or pages found</div>`;
      return;
    }

    container.innerHTML = filtered.map((c, idx) => `
      <div class="palette-item" data-index="${idx}">
        <div style="display: flex; align-items: center; gap: 0.85rem;">
          <span style="font-size: 1.25rem;">${c.icon}</span>
          <div>
            <div style="font-weight: 600; font-size: 0.9rem;">${c.title}</div>
            <div style="font-size: 0.775rem; color: var(--text-muted);">${c.subtitle}</div>
          </div>
        </div>
        <span class="shortcut-tag">Enter</span>
      </div>
    `).join('');

    container.querySelectorAll('.palette-item').forEach((item, idx) => {
      item.addEventListener('click', () => {
        this.closeModal('command-palette-modal');
        filtered[idx].action();
      });
    });
  }

  // --- Toast Manager ---
  showToast(message, type = 'info', actionText = null, actionCallback = null) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'warning') icon = '⚠️';
    if (type === 'danger') icon = '❌';

    toast.innerHTML = `
      <span style="font-size: 1.1rem;">${icon}</span>
      <span style="flex: 1; font-size: 0.875rem; font-weight: 500;">${message}</span>
      ${actionText ? `<button class="btn btn-sm btn-ghost toast-action" style="font-weight: 700; color: var(--primary);">${actionText}</button>` : ''}
    `;

    container.appendChild(toast);

    if (actionText && actionCallback) {
      toast.querySelector('.toast-action').addEventListener('click', () => {
        actionCallback();
        toast.remove();
      });
    }

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // --- Modal Helpers ---
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
  }

  // --- 4. Dashboard View Renderer ---
  renderDashboard() {
    const tasks = window.taskflowStore.getTasks();
    const user = window.taskflowStore.getCurrentUser();

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const pending = total - completed;
    const urgent = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length;

    // Stat cards values
    const statTotalEl = document.getElementById('stat-total-tasks');
    const statCompletedEl = document.getElementById('stat-completed-tasks');
    const statPendingEl = document.getElementById('stat-pending-tasks');
    const statUrgentEl = document.getElementById('stat-urgent-tasks');

    if (statTotalEl) statTotalEl.textContent = total;
    if (statCompletedEl) statCompletedEl.textContent = completed;
    if (statPendingEl) statPendingEl.textContent = pending;
    if (statUrgentEl) statUrgentEl.textContent = urgent;

    // Productivity score circular / radial percentage
    const scorePct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const scoreDisplay = document.getElementById('stat-productivity-score');
    if (scoreDisplay) scoreDisplay.textContent = `${scorePct}%`;

    // Sidebar task count badge
    const sidebarTaskCount = document.getElementById('sidebar-task-count');
    if (sidebarTaskCount) sidebarTaskCount.textContent = total;

    // Upcoming Deadlines List
    const deadlinesContainer = document.getElementById('dashboard-upcoming-deadlines');
    if (deadlinesContainer) {
      const pendingTasksWithDates = tasks
        .filter(t => t.status !== 'done' && (t.dueDate || t.deadline))
        .sort((a, b) => new Date(a.dueDate || a.deadline) - new Date(b.dueDate || b.deadline))
        .slice(0, 4);

      if (pendingTasksWithDates.length === 0) {
        deadlinesContainer.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">All tasks up to date! 🎉</div>';
      } else {
        deadlinesContainer.innerHTML = pendingTasksWithDates.map(task => {
          const taskDate = task.dueDate || task.deadline || '';
          const isOverdue = taskDate && new Date(taskDate) < new Date(new Date().setHours(0,0,0,0));
          const badgeClass = task.priority === 'urgent' ? 'badge-danger' : task.priority === 'high' ? 'badge-warning' : 'badge-primary';
          const taskId = task._id || task.id;
          return `
            <div class="deadline-item" style="border-left-color: ${task.priority === 'urgent' ? 'var(--danger)' : 'var(--primary)'}">
              <div class="deadline-left">
                <div class="custom-checkbox ${task.status === 'done' ? 'checked' : ''}" onclick="window.tasksModule.toggleTaskStatus('${taskId}')">
                  ${task.status === 'done' ? '✓' : ''}
                </div>
                <div>
                  <div class="deadline-title">${task.title}</div>
                  <div class="deadline-date ${isOverdue ? 'deadline-overdue' : ''}">
                    📅 Due: ${taskDate} ${isOverdue ? '(Overdue)' : ''}
                  </div>
                </div>
              </div>
              <span class="badge ${badgeClass}">${task.priority}</span>
            </div>
          `;
        }).join('');
      }
    }

    // Mini Productivity Sparkline (7-day simulated bars)
    const sparklineContainer = document.getElementById('dashboard-sparkline-bars');
    if (sparklineContainer) {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const heights = [45, 60, 80, 50, 95, 70, 85];
      sparklineContainer.innerHTML = days.map((day, i) => `
        <div class="chart-bar-col">
          <div class="chart-bar-pillar" style="height: ${heights[i]}%; background: ${i === 4 ? 'var(--success)' : 'var(--primary)'};"></div>
          <div class="chart-bar-label">${day}</div>
        </div>
      `).join('');
    }

    // Activity Stream
    const activityContainer = document.getElementById('dashboard-activity-stream');
    if (activityContainer) {
      const comments = window.taskflowStore.getComments().slice(0, 3);
      activityContainer.innerHTML = comments.map(c => `
        <div class="activity-item">
          <div class="activity-avatar">${c.avatar}</div>
          <div class="activity-content">
            <p><strong>${c.author}</strong>: ${c.text}</p>
            <div class="activity-time">${c.time}</div>
          </div>
        </div>
      `).join('');
    }
  }

  // --- 12. Profile View Renderer ---
  renderProfile() {
    const user = window.taskflowStore.getCurrentUser();
    const nameInput = document.getElementById('profile-input-name');
    const emailInput = document.getElementById('profile-input-email');
    const roleInput = document.getElementById('profile-input-role');
    const bioInput = document.getElementById('profile-input-bio');
    const workspaceInput = document.getElementById('profile-input-workspace');

    if (nameInput) nameInput.value = user.name;
    if (emailInput) emailInput.value = user.email;
    if (roleInput) roleInput.value = user.role;
    if (bioInput) bioInput.value = user.bio || '';
    if (workspaceInput) workspaceInput.value = user.workspace;

    // Profile save button
    const saveBtn = document.getElementById('btn-save-profile');
    if (saveBtn) {
      saveBtn.onclick = () => {
        user.name = nameInput.value.trim() || user.name;
        user.email = emailInput.value.trim() || user.email;
        user.role = roleInput.value.trim() || user.role;
        user.bio = bioInput.value.trim();
        user.workspace = workspaceInput.value.trim() || user.workspace;
        window.taskflowStore.setCurrentUser(user);
        this.renderUserInfo(user);
        this.showToast('Profile settings saved successfully!', 'success');
      };
    }

    // Reset data button
    const resetBtn = document.getElementById('btn-reset-data');
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (confirm('Are you sure you want to restore default sample data? All local changes will be reset.')) {
          window.taskflowStore.resetToDefaults();
          this.showToast('All data has been reset to default state', 'info');
          this.navigateTo('dashboard');
        }
      };
    }

    // Export data button
    const exportBtn = document.getElementById('btn-export-data');
    if (exportBtn) {
      exportBtn.onclick = () => {
        const fullBackup = {
          user: window.taskflowStore.getCurrentUser(),
          tasks: window.taskflowStore.getTasks(),
          checklists: window.taskflowStore.getChecklists(),
          notes: window.taskflowStore.getNotes(),
          files: window.taskflowStore.getFiles(),
          team: window.taskflowStore.getTeamMembers(),
          exportDate: new Date().toISOString()
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", `TaskFlow_Backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();
        this.showToast('Full workspace JSON backup exported!', 'success');
      };
    }
  }
}

// Global App Initialization
document.addEventListener('DOMContentLoaded', () => {
  window.taskFlowApp = new TaskFlowApp();
});
