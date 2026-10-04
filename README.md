# TaskFlow – An Interactive To-Do List & Modern Productivity Workspace

> **"Organize Tasks. Manage Time. Achieve Goals."**

TaskFlow is an advanced, modern SaaS productivity platform designed for students, professionals, teams, and daily users. It provides an all-in-one unified workspace combining task boards, Notion-style nested toggle checklists, rich text notes, file preview and storage management, team delegation, interactive calendars, and visual productivity analytics.

Developed for **Web Technology (WT) Microproject Evaluation**, TaskFlow is built with clean HTML5, modern responsive CSS3, and ES6+ Vanilla JavaScript with zero external build dependencies. It works immediately in any web browser with 100% offline data persistence via `localStorage`.

---

## 🎨 Design Philosophy & Aesthetic

- **Modern SaaS Dashboard**: Inspired by the best of Notion, Trello, and ClickUp with an elevated, minimal aesthetic.
- **Glassmorphism**: Subtle translucent cards with `backdrop-filter: blur(16px)`, refined border radii, and soft ambient shadows.
- **Dynamic Dark / Light Themes**: Switch instantly between daylight mode (`#F8FAFC`) and deep obsidian dark mode (`#0B0F19`) with custom CSS variables and persistence.
- **Micro-Interactions & Haptics**: Smooth button lifts, accordion chevron rotations, particle confetti celebrations upon task completion, and synthesized Web Audio chimes.
- **Responsive Layout**: Fluid breakpoints optimized for mobile, tablet, and widescreen desktop displays with a collapsible sidebar.

### Official Color Palette
| Token | Hex Code | Usage |
|---|---|---|
| **Primary Blue** | `#2563EB` | Brand accents, active links, primary buttons |
| **Success Green** | `#10B981` | Completed states, positive trends, student persona |
| **Warning Orange** | `#F59E0B` | In-review tasks, medium priority, focus alerts |
| **Danger Red** | `#EF4444` | Urgent deadlines, overdue warnings, destructive actions |
| **Background Light** | `#F8FAFC` | Base app background in light mode |
| **Text Main** | `#1E293B` | High-contrast typography and headings |
| **Obsidian Dark** | `#0B0F19` / `#1E293B` | Base dark mode surfaces and cards |

---

## 📑 12 Comprehensive Pages & Modules

### 1. Landing Page (`#landing`)
- **Hero Section**: High-converting headline, value proposition, and interactive preview mockup frame.
- **Feature Showcase**: 6 feature cards detailing Kanban, Notion toggles, rich notes, file management, team sync, and calendars.
- **Tailored Personas**: Dedicated sections for Students, Professionals, Teams, and Daily Users with 1-click demo actions.
- **SaaS Footer**: Multi-column footer with project metadata, evaluation credentials, and quick links.

### 2. Login Page (`#login`)
- Email & password authentication with show/hide password toggle.
- "Remember me" option and Forgot Password modal workflow.
- **1-Click Quick Demo Sign In**:
  - 🎓 **Student**: Emma Watson (CS & Web Tech Student)
  - 💼 **Professional**: Alex Chen (Senior Product Manager)
  - 🚀 **Team Lead**: Sarah Connor (Engineering Architect)

### 3. Registration Page (`#register`)
- Full Name, Email, Password, Confirm Password, and Role selection.
- **Dynamic Password Strength Meter**: Real-time visual bar calculating weak, medium, and strong criteria.
- Automatic account creation with session initialization and celebratory confetti.

### 4. Dashboard (`#dashboard`)
- **Personalized Welcome Banner**: Dynamic time-of-day greeting (Morning / Afternoon / Evening), user workspace tag, and motivational quote.
- **4 Metric Cards**: Total Tasks, Completed, Pending, and Productivity Score percentage.
- **Upcoming Deadlines Widget**: Color-coded countdown badges (Today, Tomorrow, Overdue) with instant check-off.
- **7-Day Velocity Sparkline**: Weekly focus hours and daily task velocity bars.
- **Quick Action Grid**: 1-click triggers to create tasks, quick notes, upload files, or start checklists.
- **Recent Team Activity Stream**: Live feed of peer updates and milestones.

### 5. Task Management Page (`#tasks`)
- **3 Dynamic Views**:
  - **Kanban Board**: Drag-and-drop cards across To-Do, In Progress, In Review, and Completed columns.
  - **List View**: Grouped layout with priority left-accent borders.
  - **Table View**: Compact data table with sortable columns and inline actions.
- **Filters & Search**: Instant category filter (Study, Work, Personal, Team), priority filter (Urgent, High, Medium, Low), and fuzzy text search.
- **Task Modal**: Create or edit tasks with deadlines, assignees, categories, and subtasks builder.
- **Undo Delete Toast**: Deleted tasks can be restored within 4 seconds via the floating toast action.

### 6. Checklist & Toggle List Page (`#checklists`)
- **Notion-Style Hierarchies**: Collapsible sections with rotating chevron indicators.
- **Nested Subtasks**: Indent and outdent controls to create parent-child task structures.
- **Dynamic Progress Bars**: Automatic percentage calculation based on completed items.
- **Quick Add**: Inline input to rapidly add items with Enter key press.

### 7. Notes Workspace (`#notes`)
- **Category Filter & Search**: Filter notes by Study, Work, Personal, or tags.
- **Rich Text Formatting Toolbar**: Bold (`**`), Italic (`*`), H1, H2, Bullet lists, Numbered lists, Quote blocks, and Code syntax.
- **Live Auto-Save**: Debounced persistence directly to `localStorage`.
- **Pin to Top**: Mark crucial lecture memos or PRDs to stay at the top of the feed.

### 8. File Manager (`#files`)
- **Cloud Storage Meter**: Visual gauge showing used storage (1.4 GB / 5.0 GB).
- **Drag & Drop Upload Zone**: Upload any file from your computer (PDFs, docs, images, code).
- **File Preview Modal**:
  - **Images**: High-res visual preview.
  - **PDFs**: Realistic document reader mockup with summary abstract.
  - **Code & Docs**: Formatted structured preview.
- **Download Simulation**: Download files directly to your device.

### 9. Team Collaboration (`#team`)
- **Workspace Selector**: Switch between teams (e.g. WT Microproject Team, Product HQ, Alpha Squad).
- **Member Directory**: Live presence status (Online, Away, Busy) and interactive workload meters (0–100%).
- **Shared Tasks**: Allocate tasks directly to specific teammates.
- **Discussion Stream**: Post real-time updates and comments in the team channel.
- **Invite Member Modal**: Add new contributors with customized roles.

### 10. Calendar Page (`#calendar`)
- **Monthly & Weekly Layouts**: Navigate across months with Prev, Next, and Today controls.
- **Deadline Tracking**: Task deadlines render as color-coded pills inside date cells.
- **Day Task Inspector**: Click any date cell to view all scheduled tasks or schedule a new task on that day.

### 11. Analytics Page (`#analytics`)
- **Velocity Metrics**: Total velocity, completion rate, 7-day streak 🔥, and focus hours.
- **SVG Weekly Bar Chart**: Interactive comparisons of completed vs created tasks.
- **SVG Category Donut Chart**: Visual distribution of Study, Work, Personal, and Team workloads.
- **Priority Breakdown**: Percentage gauges for Urgent, High, Medium, and Low priorities.
- **AI Productivity Insights**: Automated behavioral recommendations based on user patterns.
- **Print / Export Report**: Formatted printable executive summary (`window.print()`).

### 12. Profile & Settings Page (`#profile`)
- **User Profile Management**: Edit display name, email, job title / college degree, workspace name, and bio.
- **Account Switcher**: Switch between Student, Professional, and Team Lead personas.
- **Interface Toggles**: Dark mode switch, Web Audio sound effects toggle.
- **Data Management**: Full workspace JSON backup export and "Reset to Defaults" option.

---

## ⚡ Global Power Features

- **Command Palette (`Ctrl + K` / `Cmd + K`)**: Instant search dialog to jump to any page, create a task, switch theme, or trigger actions from anywhere.
- **Zero-Dependency Sound Engine**: Synthesized Web Audio API chimes for subtle feedback without loading external audio assets.
- **Celebration Confetti**: HTML5 Canvas particle confetti system triggered when high-priority tasks are completed or accounts are created.
- **Responsive Navigation**: Mobile bottom drawer and slide-out navigation bar for smaller viewports.

---

## 🚀 How to Run TaskFlow

### Method 1: Direct Browser Launch (Recommended & Instant)
No installations, Node.js, or server required!
1. Navigate to the project folder: `c:\Users\aksha\Desktop\wt microproject#`
2. Double-click **`index.html`** or right-click and choose **Open with Google Chrome / Microsoft Edge / Firefox**.
3. All features, styles, icons, and local persistence work immediately!

### Method 2: Local Python Server (Optional)
If you prefer running through a local HTTP server:
```bash
python server.py
```
This will automatically launch `http://localhost:8080` in your default web browser.

---

## 📁 Project Structure

```text
wt microproject#/
├── index.html           # Master HTML5 file housing all 12 modules & modals
├── server.py            # Convenient local Python HTTP development server
├── README.md            # Comprehensive project documentation
├── css/
│   └── style.css        # Modern glassmorphism, responsive grid, dark mode & animations
└── js/
    ├── data.js          # Default dataset, personas, and central localStorage store
    ├── app.js           # Core router, theme manager, command palette, toasts & confetti
    ├── tasks.js         # Kanban drag-and-drop, list/table views, task CRUD & filters
    ├── checklists.js    # Notion-style collapsible toggle lists & subtask progress
    ├── notes.js         # Rich text notes workspace, formatting tools & auto-save
    ├── files.js         # File manager, drag-and-drop upload & PDF/image preview modal
    ├── team.js          # Team collaboration, workload meters & discussion stream
    ├── calendar.js      # Monthly & weekly calendar with deadline cell indicators
    ├── analytics.js     # High-DPI SVG charts, category donut & priority breakdown
    └── auth.js          # Authentication, password strength meter & demo logins
```

---

*TaskFlow – Developed for Web Technology (WT) Microproject 2026.*
