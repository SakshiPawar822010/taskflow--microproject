/**
 * TaskFlow – Initial Dataset & Local Storage Sync
 * Provides comprehensive sample data for all 12 modules and multiple personas.
 */

const STORAGE_KEYS = {
  CURRENT_USER: 'taskflow_current_user',
  TASKS: 'taskflow_tasks',
  CHECKLISTS: 'taskflow_checklists',
  NOTES: 'taskflow_notes',
  FILES: 'taskflow_files',
  TEAM_MEMBERS: 'taskflow_team_members',
  COMMENTS: 'taskflow_comments',
  NOTIFICATIONS: 'taskflow_notifications',
  THEME: 'taskflow_theme',
  SETTINGS: 'taskflow_settings'
};

// Available Persona Accounts
const DEFAULT_USERS = [
  {
    id: 'user_1',
    name: 'Alex Chen',
    email: 'alex.chen@workplace.io',
    role: 'Senior Product Manager',
    category: 'Professional',
    avatar: 'AC',
    avatarBg: '#2563EB',
    bio: 'Building scalable productivity tooling and leading cross-functional design sprints.',
    workspace: 'Product HQ'
  },
  {
    id: 'user_2',
    name: 'Emma Watson',
    email: 'emma.w@university.edu',
    role: 'CS & Web Tech Student',
    category: 'Student',
    avatar: 'EW',
    avatarBg: '#10B981',
    bio: 'Final semester Computer Science student focusing on modern web architectures and interactive UX.',
    workspace: 'WT Microproject Workspace'
  },
  {
    id: 'user_3',
    name: 'Sarah Connor',
    email: 'sarah.c@techcorps.com',
    role: 'Engineering Team Lead',
    category: 'Team Lead',
    avatar: 'SC',
    avatarBg: '#8B5CF6',
    bio: 'Directing frontend architecture, agile sprint deliverables, and team collaboration.',
    workspace: 'Engineering Alpha Squad'
  }
];

// Helper to format ISO date relative to current date
function getRelativeDateStr(offsetDays = 0, hour = 17, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString().split('T')[0];
}

// Initial Tasks
const DEFAULT_TASKS = [
  {
    id: 'task-101',
    title: 'Complete WT Microproject UI & Interactive Modules',
    description: 'Design and assemble all 12 frontend pages for TaskFlow including Kanban drag & drop, charts, and file preview.',
    status: 'inprogress',
    priority: 'urgent',
    category: 'Study',
    dueDate: getRelativeDateStr(0),
    assignedTo: 'Emma Watson',
    assigneeAvatar: 'EW',
    progress: 85,
    subtasks: [
      { id: 'sub-1', title: 'Implement Responsive SaaS Layout & Glassmorphism Cards', completed: true },
      { id: 'sub-2', title: 'Build Drag & Drop Kanban Board', completed: true },
      { id: 'sub-3', title: 'Add Notion-style Collapsible Checklist & Progress Bars', completed: true },
      { id: 'sub-4', title: 'Finalize Interactive Analytics SVG Charts', completed: false }
    ],
    createdAt: '2026-09-20'
  },
  {
    id: 'task-102',
    title: 'Review Sprint 14 PRs & Design Systems Specs',
    description: 'Audit accessibility criteria, color contrast ratios, and responsive breakpoints across desktop and mobile.',
    status: 'inreview',
    priority: 'high',
    category: 'Work',
    dueDate: getRelativeDateStr(1),
    assignedTo: 'Alex Chen',
    assigneeAvatar: 'AC',
    progress: 60,
    subtasks: [
      { id: 'sub-21', title: 'Verify WCAG AA contrast on dark mode tokens', completed: true },
      { id: 'sub-22', title: 'Test touch target sizes on mobile drawer', completed: false }
    ],
    createdAt: '2026-09-22'
  },
  {
    id: 'task-103',
    title: 'Prepare Final Academic Project Presentation & Video Demo',
    description: 'Create slide deck highlighting architecture, localStorage state management, and modern Web APIs.',
    status: 'todo',
    priority: 'high',
    category: 'Study',
    dueDate: getRelativeDateStr(3),
    assignedTo: 'Emma Watson',
    assigneeAvatar: 'EW',
    progress: 20,
    subtasks: [
      { id: 'sub-31', title: 'Draft presentation slides (10 slides max)', completed: true },
      { id: 'sub-32', title: 'Record 2-minute walkthrough screencast', completed: false },
      { id: 'sub-33', title: 'Export PDF documentation summary', completed: false }
    ],
    createdAt: '2026-09-24'
  },
  {
    id: 'task-104',
    title: 'Deploy Production Cloud CDN & Optimize Asset Bundle',
    description: 'Minify CSS/JS dependencies, configure HTTP caching headers, and test Lighthouse performance scores.',
    status: 'todo',
    priority: 'medium',
    category: 'Team',
    dueDate: getRelativeDateStr(5),
    assignedTo: 'Sarah Connor',
    assigneeAvatar: 'SC',
    progress: 0,
    subtasks: [
      { id: 'sub-41', title: 'Audit bundle size and defer non-critical scripts', completed: false }
    ],
    createdAt: '2026-09-25'
  },
  {
    id: 'task-105',
    title: 'Weekly 1-on-1 Mentorship & Project Sync',
    description: 'Sync with frontend engineering peers on roadmap velocity, blockers, and upcoming milestones.',
    status: 'done',
    priority: 'medium',
    category: 'Team',
    dueDate: getRelativeDateStr(-1),
    assignedTo: 'Sarah Connor',
    assigneeAvatar: 'SC',
    progress: 100,
    subtasks: [
      { id: 'sub-51', title: 'Review sprint backlog items', completed: true },
      { id: 'sub-52', title: 'Align on Q4 productivity objectives', completed: true }
    ],
    createdAt: '2026-09-18'
  },
  {
    id: 'task-106',
    title: 'Renew Gym Membership & Plan Daily Workout Split',
    description: 'Set up push-pull-legs workout routine and track hydration and protein intake goals.',
    status: 'done',
    priority: 'low',
    category: 'Personal',
    dueDate: getRelativeDateStr(-2),
    assignedTo: 'Alex Chen',
    assigneeAvatar: 'AC',
    progress: 100,
    subtasks: [
      { id: 'sub-61', title: 'Register fitness passport app', completed: true }
    ],
    createdAt: '2026-09-15'
  },
  {
    id: 'task-107',
    title: 'Refactor LocalStorage Reactive Store Architecture',
    description: 'Extract storage dispatch logic into clean decoupled modules with automatic reactive UI synchronization.',
    status: 'inprogress',
    priority: 'urgent',
    category: 'Work',
    dueDate: getRelativeDateStr(2),
    assignedTo: 'Sarah Connor',
    assigneeAvatar: 'SC',
    progress: 50,
    subtasks: [
      { id: 'sub-71', title: 'Create robust serialization error handling', completed: true },
      { id: 'sub-72', title: 'Add schema validation and initial seed fallback', completed: false }
    ],
    createdAt: '2026-09-24'
  }
];

// Initial Notion-Style Toggle Checklists
const DEFAULT_CHECKLISTS = [
  {
    id: 'chk-1',
    title: 'WT Microproject Submission Requirements',
    category: 'Study',
    collapsed: false,
    items: [
      { id: 'ci-1', text: 'All 12 required views built and fully navigable', completed: true, level: 0 },
      { id: 'ci-2', text: 'Clean Glassmorphism cards with smooth hover transitions', completed: true, level: 1 },
      { id: 'ci-3', text: 'Interactive Kanban board with Drag and Drop', completed: true, level: 1 },
      { id: 'ci-4', text: 'Notion-style toggle lists with nested items and progress tracking', completed: true, level: 1 },
      { id: 'ci-5', text: 'Rich-text notes workspace with formatting tools', completed: true, level: 1 },
      { id: 'ci-6', text: 'Simulated File manager with file preview modal (PDFs & Images)', completed: true, level: 1 },
      { id: 'ci-7', text: 'Responsive layout verified across mobile and desktop screens', completed: true, level: 0 },
      { id: 'ci-8', text: 'Self-contained zero-dependency browser execution ready', completed: false, level: 0 }
    ]
  },
  {
    id: 'chk-2',
    title: 'Sprint 14 Launch Preparation & QA',
    category: 'Work',
    collapsed: false,
    items: [
      { id: 'ci-20', text: 'Cross-browser testing on Chrome, Firefox, Safari and Edge', completed: true, level: 0 },
      { id: 'ci-21', text: 'Verify dark mode contrast ratios and palette tokens', completed: true, level: 0 },
      { id: 'ci-22', text: 'Keyboard shortcuts & Command Palette (Ctrl+K) verification', completed: true, level: 1 },
      { id: 'ci-23', text: 'Validate simulated file upload size indicators and download trigger', completed: false, level: 0 }
    ]
  },
  {
    id: 'chk-3',
    title: 'Daily High-Productivity Routine',
    category: 'Personal',
    collapsed: true,
    items: [
      { id: 'ci-30', text: 'Morning mindfulness & priority review (Top 3 Goals)', completed: true, level: 0 },
      { id: 'ci-31', text: 'Deep work focus block #1 (90 mins without distractions)', completed: true, level: 0 },
      { id: 'ci-32', text: 'Hydration check (minimum 2L water)', completed: false, level: 0 },
      { id: 'ci-33', text: 'Evening inbox zero & tomorrow agenda planning', completed: false, level: 0 }
    ]
  }
];

// Initial Notes Workspace
const DEFAULT_NOTES = [
  {
    id: 'note-1',
    title: 'Web Technology Architecture & Responsive Design Principles',
    category: 'Study',
    pinned: true,
    updatedAt: 'Just now',
    tags: ['Frontend', 'Architecture', 'CSS3'],
    content: `### Executive Overview
TaskFlow is engineered as a modern, high-velocity productivity platform integrating best practices in web architecture:

1. **Clean Modular Layout**: Separation of concerns between presentation, data state, and reactive event listeners.
2. **Glassmorphism Aesthetic**: Subtle backdrop-filter blurs, balanced translucent borders, and soft multi-layered shadows.
3. **Accessibility**: Semantic landmarks, keyboard navigability (Command Palette with Ctrl+K), and high-contrast color tokens.
4. **State Persistence**: Complete data synchronization via browser \`localStorage\` for offline reliability.`
  },
  {
    id: 'note-2',
    title: 'Product Requirements Document – TaskFlow 2.0',
    category: 'Work',
    pinned: true,
    updatedAt: 'Yesterday',
    tags: ['PRD', 'Roadmap', 'SaaS'],
    content: `## Vision & Target Personas
- **Students**: Managing assignment deadlines, study toggle checklists, lecture notes, and syllabus progress.
- **Professionals**: Tracking cross-functional sprints, priorities, time velocity, and document attachments.
- **Teams**: Real-time collaborative workspace, assignee workload distribution, and shared review boards.

### Key Performance Indicators:
- Instant UI response (<100ms) with zero jank
- Seamless theme switching without page reload
- 100% data integrity with offline-first client storage.`
  },
  {
    id: 'note-3',
    title: 'Quick Brainstorm: Micro-Interactions & Haptic Celebrations',
    category: 'Personal',
    pinned: false,
    updatedAt: '3 days ago',
    tags: ['Ideas', 'UX'],
    content: `### Micro-interactions to Delight Users:
- Trigger dynamic particle confetti canvas when marking high priority tasks as complete!
- Smooth accordion collapse with rotating chevron icons.
- Real-time password strength meter that guides secure password selection.
- Toast notifications with automatic 4-second dismiss and undo triggers.`
  }
];

// Initial File Manager Data
const DEFAULT_FILES = [
  {
    id: 'file-1',
    name: 'WT_Microproject_Project_Report.pdf',
    type: 'pdf',
    size: '2.4 MB',
    date: 'Sep 26, 2026',
    url: '#preview-pdf',
    icon: 'file-text'
  },
  {
    id: 'file-2',
    name: 'TaskFlow_UI_Architecture_Spec.docx',
    type: 'doc',
    size: '840 KB',
    date: 'Sep 25, 2026',
    url: '#preview-doc',
    icon: 'file'
  },
  {
    id: 'file-3',
    name: 'Dashboard_Glassmorphism_Mockup.png',
    type: 'img',
    size: '3.8 MB',
    date: 'Sep 24, 2026',
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    icon: 'image'
  },
  {
    id: 'file-4',
    name: 'Sprint_14_Productivity_Dataset.json',
    type: 'code',
    size: '128 KB',
    date: 'Sep 22, 2026',
    url: '#preview-code',
    icon: 'code'
  }
];

// Initial Team Members Data
const DEFAULT_TEAM = [
  {
    id: 'tm-1',
    name: 'Sarah Connor',
    role: 'Lead Architect',
    email: 'sarah.c@techcorps.com',
    avatar: 'SC',
    status: 'online',
    activeTasks: 4,
    workload: 75
  },
  {
    id: 'tm-2',
    name: 'Alex Chen',
    role: 'Product Manager',
    email: 'alex.chen@workplace.io',
    avatar: 'AC',
    status: 'online',
    activeTasks: 3,
    workload: 60
  },
  {
    id: 'tm-3',
    name: 'Emma Watson',
    role: 'Frontend Engineer & Student',
    email: 'emma.w@university.edu',
    avatar: 'EW',
    status: 'away',
    activeTasks: 5,
    workload: 90
  },
  {
    id: 'tm-4',
    name: 'David Kim',
    role: 'UI/UX Designer',
    email: 'david.k@creativelab.com',
    avatar: 'DK',
    status: 'online',
    activeTasks: 2,
    workload: 40
  },
  {
    id: 'tm-5',
    name: 'Priya Patel',
    role: 'QA & Accessibility Specialist',
    email: 'priya.p@qualityfirst.io',
    avatar: 'PP',
    status: 'busy',
    activeTasks: 3,
    workload: 70
  }
];

// Initial Team Collaboration Discussion Stream
const DEFAULT_COMMENTS = [
  {
    id: 'comm-1',
    author: 'Sarah Connor',
    avatar: 'SC',
    time: '25 mins ago',
    text: 'Great progress on the Kanban drag & drop module! Make sure the dragover indicator is clearly visible in both light and dark themes.'
  },
  {
    id: 'comm-2',
    author: 'Emma Watson',
    avatar: 'EW',
    time: '15 mins ago',
    text: 'Added high-contrast dashed borders and auto-updating task count badges. Working on the rich text notes workspace next!'
  },
  {
    id: 'comm-3',
    author: 'Alex Chen',
    avatar: 'AC',
    time: '5 mins ago',
    text: 'The interactive SVG charts on the Analytics tab look crisp! The weekly productivity trend is super intuitive.'
  }
];

// Initial Notifications
const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Urgent Deadline Today',
    message: '"Complete WT Microproject UI" is due at 5:00 PM.',
    time: '10m ago',
    type: 'urgent',
    read: false
  },
  {
    id: 'notif-2',
    title: 'Task Assigned',
    message: 'Sarah Connor assigned you "Deploy Production Cloud CDN".',
    time: '1h ago',
    type: 'info',
    read: false
  },
  {
    id: 'notif-3',
    title: 'Milestone Achieved',
    message: 'You have maintained a 7-day productivity streak! 🔥',
    time: '3h ago',
    type: 'success',
    read: true
  }
];

// Centralized Store Class
class TaskFlowStore {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEFAULT_USERS[0]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHECKLISTS)) {
      localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(DEFAULT_CHECKLISTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTES)) {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(DEFAULT_NOTES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FILES)) {
      localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(DEFAULT_FILES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TEAM_MEMBERS)) {
      localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(DEFAULT_TEAM));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
      localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(DEFAULT_COMMENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
    }
  }

  // Getters
  getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) || DEFAULT_USERS[0];
  }

  setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  getTasks() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS)) || [];
  }

  saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }

  getChecklists() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CHECKLISTS)) || [];
  }

  saveChecklists(lists) {
    localStorage.setItem(STORAGE_KEYS.CHECKLISTS, JSON.stringify(lists));
  }

  getNotes() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES)) || [];
  }

  saveNotes(notes) {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  }

  getFiles() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.FILES)) || [];
  }

  saveFiles(files) {
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
  }

  getTeamMembers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TEAM_MEMBERS)) || [];
  }

  saveTeamMembers(team) {
    localStorage.setItem(STORAGE_KEYS.TEAM_MEMBERS, JSON.stringify(team));
  }

  getComments() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMMENTS)) || [];
  }

  saveComments(comments) {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(comments));
  }

  getNotifications() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) || [];
  }

  saveNotifications(notifs) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
  }

  // Reset to Factory Default Data
  resetToDefaults() {
    localStorage.clear();
    this.init();
  }
}

// Global Store Instance
window.taskflowStore = new TaskFlowStore();
