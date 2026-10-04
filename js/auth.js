/**
 * TaskFlow – Authentication & Registration Controller
 * Connects frontend Login & Registration with Express & MongoDB backend
 * API Base URL: http://localhost:5000
 */

if (typeof API_BASE_URL === 'undefined') {
  var API_BASE_URL = 'http://localhost:5000';
}

class AuthModule {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Password toggle buttons
    document.querySelectorAll('.password-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const input = btn.previousElementSibling;
        if (input && input.type === 'password') {
          input.type = 'text';
          btn.textContent = '🙈';
        } else if (input) {
          input.type = 'password';
          btn.textContent = '👁️';
        }
      });
    });

    // Password strength meter on registration
    const regPassword = document.getElementById('reg-password');
    const strengthBar = document.getElementById('password-strength-fill');
    const strengthText = document.getElementById('password-strength-label');

    if (regPassword && strengthBar) {
      regPassword.addEventListener('input', (e) => {
        const val = e.target.value;
        let score = 0;
        if (val.length >= 6) score += 25;
        if (val.length >= 10) score += 25;
        if (/[A-Z]/.test(val) && /[0-9]/.test(val)) score += 25;
        if (/[^A-Za-z0-9]/.test(val)) score += 25;

        strengthBar.style.width = `${score}%`;

        if (score <= 25) {
          strengthBar.style.backgroundColor = 'var(--danger)';
          if (strengthText) strengthText.textContent = 'Weak';
        } else if (score <= 75) {
          strengthBar.style.backgroundColor = 'var(--warning)';
          if (strengthText) strengthText.textContent = 'Medium';
        } else {
          strengthBar.style.backgroundColor = 'var(--success)';
          if (strengthText) strengthText.textContent = 'Strong';
        }
      });
    }

    // Login Form Submit (connected to MongoDB)
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Registration Form Submit (connected to MongoDB)
    const regForm = document.getElementById('register-form');
    if (regForm) {
      regForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }

    // Quick Demo Logins (Connects demo accounts to backend MongoDB)
    document.querySelectorAll('.btn-demo-login').forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.getAttribute('data-user-id');
        const demoUser = DEFAULT_USERS.find(u => u.id === userId) || DEFAULT_USERS[0];

        try {
          // Attempt login via backend API
          let res = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: demoUser.email, password: 'password123' })
          });
          let data = await res.json();

          // If demo user is not yet in MongoDB, register them automatically
          if (!data.success) {
            res = await fetch(`${API_BASE_URL}/api/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: demoUser.name, email: demoUser.email, password: 'password123' })
            });
            data = await res.json();
          }

          if (data.success && data.user) {
            demoUser.id = data.user.id;
            demoUser._id = data.user.id;
          }
        } catch (err) {
          console.warn('Backend server not reachable for demo account, using local mode:', err);
        }

        window.taskflowStore.setCurrentUser(demoUser);
        if (window.taskFlowApp) {
          window.taskFlowApp.renderUserInfo(demoUser);
          window.taskFlowApp.showToast(`Logged in as ${demoUser.name} (${demoUser.category})`, 'success');
          window.taskFlowApp.playSound('success');
        }

        // Fetch this user's tasks from MongoDB
        if (window.tasksModule) {
          await window.tasksModule.loadTasksFromBackend();
        }

        window.location.hash = 'dashboard';
      });
    });

    // Forgot Password link
    const forgotLink = document.getElementById('link-forgot-password');
    if (forgotLink) {
      forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        const email = prompt('Enter your registered email address to receive password reset instructions:');
        if (email && email.trim()) {
          window.taskFlowApp.showToast(`Password reset link sent to: ${email.trim()}`, 'info');
        }
      });
    }
  }

  // ==========================================
  // 1. User Registration (POST /api/register)
  // ==========================================
  async handleRegister() {
    const name = document.getElementById('reg-fullname').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm-password').value;
    const roleSelect = document.getElementById('reg-role-select');
    const role = roleSelect ? roleSelect.value : 'Student';

    // Form validation
    if (!name || !email || !password) {
      alert('Please fill out all required fields.');
      return;
    }

    if (password !== confirm) {
      alert('Passwords do not match! Please check and try again.');
      return;
    }

    try {
      // Call Express & MongoDB Registration API
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!data.success) {
        // Show alert for duplicate email or validation failure
        alert(data.message || 'Registration failed. Please try again.');
        return;
      }

      // Save user details to store
      const newUser = {
        id: data.user.id,
        _id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: role === 'Student' ? 'CS & Web Tech Student' : role === 'Professional' ? 'Product Manager' : 'Team Lead',
        category: role,
        avatar: data.user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
        avatarBg: '#2563EB',
        bio: `Active ${role} on TaskFlow`,
        workspace: `${data.user.name}'s Workspace`
      };

      window.taskflowStore.setCurrentUser(newUser);
      window.taskflowStore.saveTasks([]); // New user starts with empty tasks

      if (window.taskFlowApp) {
        window.taskFlowApp.renderUserInfo(newUser);
        window.taskFlowApp.showToast(`Account created in MongoDB! Welcome, ${newUser.name}!`, 'success');
        window.taskFlowApp.playSound('success');
        window.taskFlowApp.triggerConfetti();
      }

      // Open existing dashboard
      window.location.hash = 'dashboard';

    } catch (error) {
      console.error('Registration API error:', error);
      alert('Could not connect to backend server at http://localhost:5000. Please ensure "node server.js" is running in the backend folder.');
    }
  }

  // ==========================================
  // 2. User Login (POST /api/login)
  // ==========================================
  async handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }

    try {
      // Call Express & MongoDB Login API
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      // Show alert for invalid login credentials
      if (!data.success) {
        alert(data.message || 'Invalid email or password. Please try again.');
        return;
      }

      // Save logged-in user with MongoDB _id
      const user = {
        id: data.user.id,
        _id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: 'Active Member',
        category: 'Professional',
        avatar: data.user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
        avatarBg: '#2563EB',
        bio: 'TaskFlow Member',
        workspace: `${data.user.name}'s Workspace`
      };

      window.taskflowStore.setCurrentUser(user);

      if (window.taskFlowApp) {
        window.taskFlowApp.renderUserInfo(user);
        window.taskFlowApp.showToast(`Welcome back, ${user.name}!`, 'success');
        window.taskFlowApp.playSound('success');
      }

      // Fetch and display only this logged-in user's tasks from MongoDB
      if (window.tasksModule) {
        await window.tasksModule.loadTasksFromBackend();
      }

      // After successful login open the existing dashboard
      window.location.hash = 'dashboard';

    } catch (error) {
      console.error('Login API error:', error);
      alert('Could not connect to backend server at http://localhost:5000. Please ensure "node server.js" is running in the backend folder.');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.authModule = new AuthModule();
});

