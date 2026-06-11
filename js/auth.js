/**
 * auth.js — User authentication & per-user data management
 *
 * SECURITY NOTE: This is a client-side-only demo. Credentials are stored in
 * localStorage with a non-cryptographic hash. Do NOT use real passwords here.
 * A production app requires a server, HTTPS, and bcrypt/Argon2 hashing.
 */

const AUTH_USERS_KEY   = 'ecotrack_users';
const AUTH_SESSION_KEY = 'ecotrack_session';

// ─── Rate-limiting (in-memory; resets on page refresh) ───
const _loginAttempts = {}; // email → { count, lockedUntil }
const MAX_LOGIN_ATTEMPTS  = 5;
const LOCKOUT_DURATION_MS = 60_000; // 60 seconds

// ─── Input validation helpers ───

/**
 * Strip HTML tags and trim whitespace from a string input.
 * Prevents XSS from user-supplied data being rendered with innerHTML.
 * @param {string} str
 * @returns {string}
 */
function sanitizeInput(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '')        // strip HTML tags
    .replace(/['"`;]/g, '')          // strip common injection chars
    .trim();
}

/**
 * Validate an email address format.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

/**
 * Validate a username: 3–30 chars, alphanumeric + underscores only.
 * @param {string} username
 * @returns {boolean}
 */
function isValidUsername(username) {
  return /^[a-zA-Z0-9_]{3,30}$/.test(username);
}

// ─── Simple hash (not crypto-secure — demo only) ───
/**
 * Djb2-style hash for demo password storage.
 * @param {string} str
 * @returns {string}
 */
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32-bit int
  }
  return hash.toString(36);
}

// ─── User CRUD ───

/**
 * Retrieve all registered users from localStorage.
 * @returns {Array<Object>}
 */
function getAllUsers() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Persist the full users array to localStorage.
 * @param {Array<Object>} users
 */
function saveAllUsers(users) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

/**
 * Look up a user record by email (case-insensitive).
 * @param {string} email
 * @returns {Object|undefined}
 */
function findUserByEmail(email) {
  return getAllUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

/**
 * Register a new user account.
 * @param {string} username
 * @param {string} email
 * @param {string} password
 * @returns {{ ok: boolean, user?: Object, error?: string }}
 */
function registerUser(username, email, password) {
  const cleanUsername = sanitizeInput(username);
  const cleanEmail    = sanitizeInput(email).toLowerCase();

  // Validation
  if (!isValidUsername(cleanUsername)) {
    return { ok: false, error: 'Username must be 3–30 characters and contain only letters, numbers, or underscores.' };
  }
  if (!isValidEmail(cleanEmail)) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }
  if (!password || password.length < 6) {
    return { ok: false, error: 'Password must be at least 6 characters.' };
  }

  const users = getAllUsers();

  if (users.find(u => u.email.toLowerCase() === cleanEmail)) {
    return { ok: false, error: 'An account with this email already exists.' };
  }
  if (users.find(u => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
    return { ok: false, error: 'Username is already taken.' };
  }

  const user = {
    id:           'u_' + Date.now() + Math.random().toString(36).slice(2, 6),
    username:     cleanUsername,
    email:        cleanEmail,
    passwordHash: simpleHash(password),
    createdAt:    new Date().toISOString(),
    avatar:       getAvatarInitials(cleanUsername)
  };

  users.push(user);
  saveAllUsers(users);

  // Initialize empty data store for the new user
  saveUserData(user.id, {
    footprint:          null,
    actions:            {},
    monthly:            {},
    streak:             0,
    points:             0,
    badges:             [],
    challengeProgress:  {},
    completedChallenges:[],
    hubProgress:        {}
  });

  return { ok: true, user };
}

/**
 * Authenticate a user. Applies rate-limiting — locks out after 5 failed attempts.
 * @param {string} email
 * @param {string} password
 * @returns {{ ok: boolean, user?: Object, error?: string }}
 */
function loginUser(email, password) {
  const cleanEmail = sanitizeInput(email).toLowerCase();

  // Rate-limit check
  const attempt = _loginAttempts[cleanEmail];
  if (attempt && attempt.lockedUntil > Date.now()) {
    const secsLeft = Math.ceil((attempt.lockedUntil - Date.now()) / 1000);
    return { ok: false, error: `Too many failed attempts. Try again in ${secsLeft}s.` };
  }

  const user = findUserByEmail(cleanEmail);
  if (!user) {
    _recordFailedAttempt(cleanEmail);
    return { ok: false, error: 'No account found with this email.' };
  }

  if (user.passwordHash !== simpleHash(password)) {
    _recordFailedAttempt(cleanEmail);
    const remaining = MAX_LOGIN_ATTEMPTS - (_loginAttempts[cleanEmail]?.count || 0);
    const suffix    = remaining > 0 ? ` (${remaining} attempt${remaining === 1 ? '' : 's'} left)` : '';
    return { ok: false, error: `Incorrect password. Please try again.${suffix}` };
  }

  // Successful login — clear attempt counter
  delete _loginAttempts[cleanEmail];
  localStorage.setItem(AUTH_SESSION_KEY, user.id);
  return { ok: true, user };
}

/**
 * Record a failed login attempt; lock after MAX_LOGIN_ATTEMPTS.
 * @param {string} email
 * @private
 */
function _recordFailedAttempt(email) {
  if (!_loginAttempts[email]) {
    _loginAttempts[email] = { count: 0, lockedUntil: 0 };
  }
  _loginAttempts[email].count++;
  if (_loginAttempts[email].count >= MAX_LOGIN_ATTEMPTS) {
    _loginAttempts[email].lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
  }
}

/**
 * Log the current user out and redirect to login page.
 */
function logoutUser() {
  localStorage.removeItem(AUTH_SESSION_KEY);
  window.location.href = 'login.html';
}

/**
 * Get the current session's user ID from localStorage.
 * @returns {string|null}
 */
function getCurrentUserId() {
  return localStorage.getItem(AUTH_SESSION_KEY);
}

/**
 * Get the full user object for the currently logged-in user.
 * @returns {Object|null}
 */
function getCurrentUser() {
  const id = getCurrentUserId();
  if (!id) return null;
  return getAllUsers().find(u => u.id === id) || null;
}

/**
 * Check if a user session exists.
 * @returns {boolean}
 */
function isLoggedIn() {
  return !!getCurrentUserId();
}

/**
 * Redirect to login page if no session exists.
 * @returns {boolean} true if authenticated
 */
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// ─── Per-user data storage ───

/**
 * Build the localStorage key for a given user's data.
 * @param {string} userId
 * @returns {string}
 */
function userDataKey(userId) {
  return 'ecotrack_data_' + userId;
}

/**
 * Retrieve the data object for a user (defaults to current user).
 * @param {string} [userId]
 * @returns {Object}
 */
function getUserData(userId) {
  const id = userId || getCurrentUserId();
  if (!id) return {};
  try {
    return JSON.parse(localStorage.getItem(userDataKey(id)) || '{}');
  } catch {
    return {};
  }
}

/**
 * Persist a full data object for a user (defaults to current user).
 * @param {string|null} userId
 * @param {Object} data
 */
function saveUserData(userId, data) {
  const id = userId || getCurrentUserId();
  if (!id) return;
  localStorage.setItem(userDataKey(id), JSON.stringify(data));
}

/**
 * Shallow-merge a patch into the current user's data object.
 * @param {Object} patch
 */
function updateUserData(patch) {
  const data = getUserData();
  Object.assign(data, patch);
  saveUserData(null, data);
}

// Keep old name as alias for backward compatibility
const patchUserData = updateUserData;

// ─── Avatar helpers ───

/**
 * Return the first two uppercase characters of a name as initials.
 * @param {string} name
 * @returns {string}
 */
function getAvatarInitials(name) {
  return (name || '?').slice(0, 2).toUpperCase();
}

/**
 * Deterministically pick a colour from a palette based on username hash.
 * @param {string} username
 * @returns {string} CSS colour string
 */
function getAvatarColor(username) {
  const colors = ['#22c55e','#06b6d4','#8b5cf6','#f59e0b','#ef4444','#10b981','#3b82f6'];
  let hash = 0;
  for (const c of (username || '')) hash += c.charCodeAt(0);
  return colors[hash % colors.length];
}
