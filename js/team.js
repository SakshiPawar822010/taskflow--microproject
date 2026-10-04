/**
 * TaskFlow – Team Collaboration Controller
 * Handles shared task allocation, team member workload, workspace switching & comments thread
 */

class TeamModule {
  constructor() {
    this.currentWorkspace = 'WT Microproject Team';
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Comment post form
    const commentForm = document.getElementById('team-comment-form');
    if (commentForm) {
      commentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.postComment();
      });
    }

    // Invite member modal trigger
    const btnInviteMember = document.getElementById('btn-invite-member');
    if (btnInviteMember) {
      btnInviteMember.addEventListener('click', () => {
        window.taskFlowApp.openModal('invite-member-modal');
      });
    }

    // Close invite modal
    document.querySelectorAll('.close-invite-modal').forEach(btn => {
      btn.addEventListener('click', () => {
        window.taskFlowApp.closeModal('invite-member-modal');
      });
    });

    // Save invite form
    const inviteForm = document.getElementById('invite-member-form');
    if (inviteForm) {
      inviteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveInvitedMember();
      });
    }

    // Workspace selector dropdown in team page
    const workspaceSelect = document.getElementById('team-workspace-select');
    if (workspaceSelect) {
      workspaceSelect.addEventListener('change', (e) => {
        this.currentWorkspace = e.target.value;
        window.taskFlowApp.showToast(`Switched team workspace to: ${this.currentWorkspace}`, 'info');
        this.render();
      });
    }
  }

  render() {
    this.renderMembersList();
    this.renderSharedTasks();
    this.renderCommentsStream();
  }

  renderMembersList() {
    const container = document.getElementById('team-members-container');
    if (!container) return;

    const members = window.taskflowStore.getTeamMembers();

    container.innerHTML = members.map(m => {
      const statusClass = m.status === 'online' ? 'status-online' :
                          m.status === 'away' ? 'status-away' : 'status-busy';

      return `
        <div class="team-member-row">
          <div class="member-left">
            <div style="position: relative;">
              <div class="avatar" style="width: 42px; height: 42px;">${m.avatar}</div>
              <div class="member-status-indicator ${statusClass}" style="position: absolute; bottom: 0; right: 0;" title="${m.status}"></div>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 0.95rem;">${m.name}</div>
              <div style="font-size: 0.775rem; color: var(--text-muted);">${m.role}</div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 1.5rem;">
            <div style="width: 110px;">
              <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 2px;">
                <span>Workload</span>
                <span>${m.workload}%</span>
              </div>
              <div class="progress-bar-container" style="height: 6px; margin: 0;">
                <div class="progress-bar-fill" style="width: ${m.workload}%; background: ${m.workload > 80 ? 'var(--danger)' : 'var(--primary)'};"></div>
              </div>
            </div>

            <div style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted); min-width: 60px;">
              ${m.activeTasks} tasks
            </div>

            <button class="btn btn-sm btn-outline" onclick="window.teamModule.assignTaskToMember('${m.name}')">Assign</button>
          </div>
        </div>
      `;
    }).join('');
  }

  renderSharedTasks() {
    const container = document.getElementById('team-shared-tasks-container');
    if (!container) return;

    const tasks = window.taskflowStore.getTasks();
    const teamTasks = tasks.filter(t => t.category === 'Team' || t.category === 'Work');

    if (teamTasks.length === 0) {
      container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);">No shared tasks in this workspace</div>';
      return;
    }

    container.innerHTML = teamTasks.map(t => `
      <div class="glass-card" style="padding: 0.9rem 1.15rem; margin-bottom: 0.75rem; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <div class="custom-checkbox ${t.status === 'done' ? 'checked' : ''}" onclick="window.tasksModule.toggleTaskStatus('${t.id}')">
            ${t.status === 'done' ? '✓' : ''}
          </div>
          <div>
            <div style="font-weight: 600; font-size: 0.9rem;">${t.title}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Assigned to: <strong>${t.assignedTo || 'Unassigned'}</strong></div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="badge ${t.priority === 'urgent' ? 'badge-danger' : 'badge-primary'}">${t.priority}</span>
          <span class="badge badge-neutral">${t.status}</span>
        </div>
      </div>
    `).join('');
  }

  renderCommentsStream() {
    const container = document.getElementById('team-comments-stream');
    if (!container) return;

    const comments = window.taskflowStore.getComments();

    container.innerHTML = comments.map(c => `
      <div class="activity-item">
        <div class="activity-avatar">${c.avatar}</div>
        <div class="activity-content">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
            <strong style="font-size: 0.85rem;">${c.author}</strong>
            <span class="activity-time">${c.time}</span>
          </div>
          <p style="font-size: 0.85rem; color: var(--text-main);">${c.text}</p>
        </div>
      </div>
    `).join('');

    container.scrollTop = container.scrollHeight;
  }

  postComment() {
    const input = document.getElementById('team-comment-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const currentUser = window.taskflowStore.getCurrentUser();
    const comments = window.taskflowStore.getComments();

    comments.push({
      id: `comm-${Date.now()}`,
      author: currentUser.name,
      avatar: currentUser.avatar,
      time: 'Just now',
      text: text
    });

    window.taskflowStore.saveComments(comments);
    input.value = '';
    this.renderCommentsStream();
    window.taskFlowApp.playSound('click');
  }

  assignTaskToMember(memberName) {
    if (window.tasksModule) {
      window.tasksModule.openCreateModal();
      const assigneeField = document.getElementById('task-input-assignee');
      if (assigneeField) assigneeField.value = memberName;
      const categoryField = document.getElementById('task-input-category');
      if (categoryField) categoryField.value = 'Team';
    }
  }

  saveInvitedMember() {
    const nameInput = document.getElementById('invite-input-name');
    const emailInput = document.getElementById('invite-input-email');
    const roleInput = document.getElementById('invite-input-role');

    if (!nameInput || !nameInput.value.trim()) return;

    const newMember = {
      id: `tm-${Date.now()}`,
      name: nameInput.value.trim(),
      role: roleInput.value.trim() || 'Contributor',
      email: emailInput.value.trim() || `${nameInput.value.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      avatar: nameInput.value.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
      status: 'online',
      activeTasks: 0,
      workload: 10
    };

    const members = window.taskflowStore.getTeamMembers();
    members.push(newMember);
    window.taskflowStore.saveTeamMembers(members);

    window.taskFlowApp.closeModal('invite-member-modal');
    window.taskFlowApp.showToast(`Invited ${newMember.name} to workspace!`, 'success');
    this.render();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.teamModule = new TeamModule();
});
