/**
 * TaskFlow – Analytics & Productivity Insights Controller
 * Renders zero-dependency high-DPI SVG charts, weekly reports & export summaries
 */

class AnalyticsModule {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    const btnPrintReport = document.getElementById('btn-print-report');
    if (btnPrintReport) {
      btnPrintReport.addEventListener('click', () => {
        window.print();
      });
    }
  }

  render() {
    const tasks = window.taskflowStore.getTasks();

    this.renderMetricsSummary(tasks);
    this.renderWeeklyBarChart(tasks);
    this.renderCategoryDonutChart(tasks);
    this.renderPriorityBreakdown(tasks);
  }

  renderMetricsSummary(tasks) {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'done').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const elTotal = document.getElementById('analytics-stat-total');
    const elRate = document.getElementById('analytics-stat-rate');
    const elStreak = document.getElementById('analytics-stat-streak');
    const elHours = document.getElementById('analytics-stat-hours');

    if (elTotal) elTotal.textContent = total;
    if (elRate) elRate.textContent = `${rate}%`;
    if (elStreak) elStreak.textContent = '7 Days 🔥';
    if (elHours) elHours.textContent = '38.5 hrs';
  }

  // --- SVG Weekly Velocity Chart ---
  renderWeeklyBarChart(tasks) {
    const container = document.getElementById('analytics-weekly-chart');
    if (!container) return;

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const completedCounts = [4, 7, 5, 8, 9, 3, 6];
    const createdCounts = [6, 8, 7, 9, 10, 4, 7];
    const maxVal = 12;

    container.innerHTML = `
      <div style="display: flex; justify-content: flex-end; gap: 1rem; font-size: 0.8rem; margin-bottom: 1rem;">
        <span style="display: flex; align-items: center; gap: 0.35rem;"><span style="width: 12px; height: 12px; background: var(--primary); border-radius: 3px;"></span> Completed</span>
        <span style="display: flex; align-items: center; gap: 0.35rem;"><span style="width: 12px; height: 12px; background: var(--border-medium); border-radius: 3px;"></span> Created</span>
      </div>

      <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 200px; padding-top: 1rem; border-bottom: 2px solid var(--border-light); gap: 0.85rem;">
        ${days.map((day, idx) => {
          const compHeight = Math.round((completedCounts[idx] / maxVal) * 100);
          const creatHeight = Math.round((createdCounts[idx] / maxVal) * 100);

          return `
            <div style="flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end;">
              <div style="display: flex; align-items: flex-end; gap: 4px; width: 100%; justify-content: center; height: 85%;">
                <div style="width: 14px; height: ${compHeight}%; background: var(--primary); border-radius: 4px 4px 0 0;" title="${completedCounts[idx]} completed"></div>
                <div style="width: 14px; height: ${creatHeight}%; background: var(--border-medium); border-radius: 4px 4px 0 0;" title="${createdCounts[idx]} created"></div>
              </div>
              <span style="font-size: 0.78rem; font-weight: 600; color: var(--text-muted); margin-top: 8px;">${day}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // --- SVG Category Donut Chart ---
  renderCategoryDonutChart(tasks) {
    const container = document.getElementById('analytics-donut-chart');
    if (!container) return;

    const categories = ['Study', 'Work', 'Personal', 'Team'];
    const colors = ['#8B5CF6', '#2563EB', '#F59E0B', '#10B981'];

    const counts = categories.map(cat => tasks.filter(t => t.category.toLowerCase() === cat.toLowerCase()).length);
    const total = counts.reduce((a, b) => a + b, 0) || 1;

    // SVG donut parameters
    const size = 160;
    const strokeWidth = 24;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    let accumulatedOffset = 0;
    const paths = counts.map((count, i) => {
      const slicePct = count / total;
      const strokeDash = `${slicePct * circumference} ${circumference}`;
      const offset = -accumulatedOffset;
      accumulatedOffset += slicePct * circumference;

      return `
        <circle cx="${size / 2}" cy="${size / 2}" r="${radius}"
                fill="transparent"
                stroke="${colors[i]}"
                stroke-width="${strokeWidth}"
                stroke-dasharray="${strokeDash}"
                stroke-dashoffset="${offset}"
                style="transition: stroke-dashoffset 0.6s ease; transform: rotate(-90deg); transform-origin: 50% 50%;">
        </circle>
      `;
    }).join('');

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-around; flex-wrap: wrap; gap: 1.5rem; height: 100%;">
        <div style="position: relative; width: ${size}px; height: ${size}px;">
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            ${paths}
          </svg>
          <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <span style="font-size: 1.35rem; font-weight: 800;">${tasks.length}</span>
            <span style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Tasks</span>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.65rem;">
          ${categories.map((cat, idx) => {
            const pct = Math.round((counts[idx] / total) * 100);
            return `
              <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem;">
                <span style="width: 10px; height: 10px; border-radius: 50%; background: ${colors[idx]};"></span>
                <span style="font-weight: 600; min-width: 70px;">${cat}</span>
                <span style="color: var(--text-muted);">${counts[idx]} (${pct}%)</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // --- Priority Breakdown Bars ---
  renderPriorityBreakdown(tasks) {
    const container = document.getElementById('analytics-priority-bars');
    if (!container) return;

    const priorities = [
      { name: 'Urgent', color: 'var(--danger)', key: 'urgent' },
      { name: 'High', color: 'var(--warning)', key: 'high' },
      { name: 'Medium', color: 'var(--primary)', key: 'medium' },
      { name: 'Low', color: 'var(--text-subtle)', key: 'low' }
    ];

    const total = tasks.length || 1;

    container.innerHTML = priorities.map(p => {
      const count = tasks.filter(t => t.priority === p.key).length;
      const pct = Math.round((count / total) * 100);

      return `
        <div style="margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; margin-bottom: 4px;">
            <span>${p.name}</span>
            <span>${count} tasks (${pct}%)</span>
          </div>
          <div class="progress-bar-container" style="height: 8px;">
            <div class="progress-bar-fill" style="width: ${pct}%; background: ${p.color};"></div>
          </div>
        </div>
      `;
    }).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.analyticsModule = new AnalyticsModule();
});
