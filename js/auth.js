// auth.js — User authentication & per-user data management

const AUTH_USERS_KEY = 'ecotrack_users';
const AUTH_SESSION_KEY = 'ecotrack_session';

// ─── Simple hash (not crypto-secure, fine for demo) ───
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// ─── User CRUD ───
function getAllUsers() {
  return JSON.parse(localStorage.getItem(AUTH_USERS_KEY) || '[]');
}

function saveAllUsers(users) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

function registerUser(username, email, password) {
  const users = getAllUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: 'An account with this email already exists.' };
  }
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return { ok: false, error: 'Username is already taken.' };
  }
  const user = {
    id: 'u_' + Date.now() + Math.random().toString(36).slice(2, 6),
    username,
    email: email.toLowerCase(),
    passwordHash: simpleHash(password),
    createdAt: new Date().toISOString(),
    avatar: getAvatarInitials(username)
  };
  users.push(user);
  saveAllUsers(users);
  // Initialize empty data for new user
  saveUserData(user.id, {
    footprint: null,
    actions: {},
    monthly: {},
    streak: 0,
    points: 0,
    badges: [],
    challengeProgress: {},
    completedChallenges: [],
    hubProgress: {}
  });
  return { ok: true, user };
}

function loginUser(email, password) {
  const users = getAllUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { ok: false, error: 'No account found with this email.' };
  if (user.passwordHash !== simpleHash(password)) {
    return { ok: false, error: 'Incorrect password. Please try again.' };
  }
  localStorage.setItem(AUTH_SESSION_KEY, user.id);
  return { ok: true, user };
}

function logoutUser() {
  localStorage.removeItem(AUTH_SESSION_KEY);
  window.location.href = 'login.html';
}

function getCurrentUserId() {
  return localStorage.getItem(AUTH_SESSION_KEY);
}

function getCurrentUser() {
  const id = getCurrentUserId();
  if (!id) return null;
  const users = getAllUsers();
  return users.find(u => u.id === id) || null;
}

function isLoggedIn() {
  return !!getCurrentUserId();
}

function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// ─── Per-user data storage ───
function userDataKey(userId) {
  return 'ecotrack_data_' + userId;
}

function getUserData(userId) {
  const id = userId || getCurrentUserId();
  if (!id) return {};
  return JSON.parse(localStorage.getItem(userDataKey(id)) || '{}');
}

function saveUserData(userId, data) {
  const id = userId || getCurrentUserId();
  if (!id) return;
  localStorage.setItem(userDataKey(id), JSON.stringify(data));
}

function patchUserData(patch) {
  const data = getUserData();
  Object.assign(data, patch);
  saveUserData(null, data);
}

// ─── Avatar helpers ───
function getAvatarInitials(name) {
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(username) {
  const colors = ['#22c55e','#06b6d4','#8b5cf6','#f59e0b','#ef4444','#10b981','#3b82f6'];
  let hash = 0;
  for (let c of username) hash += c.charCodeAt(0);
  return colors[hash % colors.length];
}
