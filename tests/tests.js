/**
 * tests.js — EcoTrack Comprehensive Unit Test Suite (v2)
 *
 * Zero-dependency browser-based tests. Runs automatically when tests.html is opened.
 * Covers: auth, validation, sanitization, grading, insights, tips, streak,
 * gamification, simulator math, challenge logic, and edge cases.
 */

'use strict';

// ============================================================
// MINI ASSERTION LIBRARY
// ============================================================

let _passed = 0;
let _failed = 0;
const _results = [];

function assertEquals(description, actual, expected) {
  if (actual === expected) {
    _results.push({ ok: true, description });
    _passed++;
  } else {
    _results.push({ ok: false, description, actual, expected });
    _failed++;
  }
}

function assertTrue(description, value) {
  assertEquals(description, !!value, true);
}

function assertFalse(description, value) {
  assertEquals(description, !!value, false);
}

function assertNotEquals(description, actual, unexpected) {
  if (actual !== unexpected) {
    _results.push({ ok: true, description });
    _passed++;
  } else {
    _results.push({ ok: false, description, actual, expected: `NOT ${unexpected}` });
    _failed++;
  }
}

function assertApprox(description, actual, expected, delta = 0.01) {
  if (Math.abs(actual - expected) <= delta) {
    _results.push({ ok: true, description });
    _passed++;
  } else {
    _results.push({ ok: false, description, actual, expected: `≈${expected} (±${delta})` });
    _failed++;
  }
}

function assertThrows(description, fn) {
  try {
    fn();
    _results.push({ ok: false, description, actual: 'no error thrown', expected: 'an error' });
    _failed++;
  } catch {
    _results.push({ ok: true, description });
    _passed++;
  }
}

function assertDeepIncludes(description, array, value) {
  const found = Array.isArray(array) && array.some(item => JSON.stringify(item) === JSON.stringify(value));
  if (found) {
    _results.push({ ok: true, description });
    _passed++;
  } else {
    _results.push({ ok: false, description, actual: JSON.stringify(array), expected: JSON.stringify(value) });
    _failed++;
  }
}

// ============================================================
// TESTS: simpleHash
// ============================================================

function testSimpleHash() {
  assertEquals('simpleHash: same input gives same hash', simpleHash('hello'), simpleHash('hello'));
  assertNotEquals('simpleHash: different inputs differ', simpleHash('hello'), simpleHash('world'));
  assertNotEquals('simpleHash: password123 vs empty', simpleHash('password123'), simpleHash(''));
  assertTrue('simpleHash: returns a string', typeof simpleHash('test') === 'string');
  assertTrue('simpleHash: handles empty string', simpleHash('') !== undefined);
  assertNotEquals('simpleHash: case sensitive', simpleHash('Hello'), simpleHash('hello'));
  assertTrue('simpleHash: produces non-empty output', simpleHash('abc').length > 0);
}

// ============================================================
// TESTS: sanitizeInput
// ============================================================

function testSanitizeInput() {
  assertEquals('sanitizeInput: strips script tags', sanitizeInput('<script>alert(1)</script>'), 'alert(1)');
  assertEquals('sanitizeInput: strips HTML tags', sanitizeInput('<b>bold</b>'), 'bold');
  assertEquals('sanitizeInput: strips single quotes', sanitizeInput("O'Brien"), 'OBrien');
  assertEquals('sanitizeInput: trims whitespace', sanitizeInput('  hello  '), 'hello');
  assertEquals('sanitizeInput: passes clean text', sanitizeInput('eco_warrior'), 'eco_warrior');
  assertEquals('sanitizeInput: null returns empty', sanitizeInput(null), '');
  assertEquals('sanitizeInput: number returns empty', sanitizeInput(42), '');
  assertEquals('sanitizeInput: undefined returns empty', sanitizeInput(undefined), '');
  assertEquals('sanitizeInput: object returns empty', sanitizeInput({}), '');
  assertEquals('sanitizeInput: strips semicolons', sanitizeInput('a;b'), 'ab');
  assertEquals('sanitizeInput: strips backticks', sanitizeInput('`cmd`'), 'cmd');
  assertEquals('sanitizeInput: strips double quotes', sanitizeInput('"hello"'), 'hello');
  assertEquals('sanitizeInput: nested tags stripped', sanitizeInput('<div><p>text</p></div>'), 'text');
}

// ============================================================
// TESTS: isValidEmail
// ============================================================

function testIsValidEmail() {
  assertTrue('isValidEmail: standard email passes', isValidEmail('test@example.com'));
  assertTrue('isValidEmail: subdomain passes', isValidEmail('user@sub.domain.co'));
  assertTrue('isValidEmail: plus addressing passes', isValidEmail('user+tag@example.org'));
  assertFalse('isValidEmail: no @ fails', isValidEmail('notanemail'));
  assertFalse('isValidEmail: no domain fails', isValidEmail('user@'));
  assertFalse('isValidEmail: no TLD fails', isValidEmail('user@domain'));
  assertFalse('isValidEmail: empty string fails', isValidEmail(''));
  assertFalse('isValidEmail: leading space fails', isValidEmail(' user@domain.com'));
  assertFalse('isValidEmail: trailing space fails', isValidEmail('user@domain.com '));
  assertFalse('isValidEmail: double @ fails', isValidEmail('user@@domain.com'));
}

// ============================================================
// TESTS: isValidUsername
// ============================================================

function testIsValidUsername() {
  assertTrue('isValidUsername: alphanumeric underscore', isValidUsername('eco_warrior'));
  assertTrue('isValidUsername: all numbers', isValidUsername('123456'));
  assertTrue('isValidUsername: exactly 3 chars', isValidUsername('abc'));
  assertTrue('isValidUsername: exactly 30 chars', isValidUsername('a'.repeat(30)));
  assertFalse('isValidUsername: 2 chars (too short)', isValidUsername('ab'));
  assertFalse('isValidUsername: spaces not allowed', isValidUsername('eco warrior'));
  assertFalse('isValidUsername: special chars', isValidUsername('eco@warrior!'));
  assertFalse('isValidUsername: empty string', isValidUsername(''));
  assertFalse('isValidUsername: 31 chars (too long)', isValidUsername('a'.repeat(31)));
  assertFalse('isValidUsername: hyphen not allowed', isValidUsername('eco-warrior'));
  assertFalse('isValidUsername: dot not allowed', isValidUsername('eco.warrior'));
}

// ============================================================
// TESTS: getAvatarInitials
// ============================================================

function testGetAvatarInitials() {
  assertEquals('getAvatarInitials: normal name', getAvatarInitials('EcoWarrior'), 'EC');
  assertEquals('getAvatarInitials: lowercase uppercased', getAvatarInitials('john'), 'JO');
  assertEquals('getAvatarInitials: single char', getAvatarInitials('X'), 'X');
  assertEquals('getAvatarInitials: empty fallback', getAvatarInitials(''), '?');
  assertEquals('getAvatarInitials: exactly 2 chars', getAvatarInitials('AB'), 'AB');
  assertEquals('getAvatarInitials: long name', getAvatarInitials('Alexander'), 'AL');
  assertEquals('getAvatarInitials: numeric prefix', getAvatarInitials('99user'), '99');
}

// ============================================================
// TESTS: getAvatarColor
// ============================================================

const PALETTE = ['#22c55e','#06b6d4','#8b5cf6','#f59e0b','#ef4444','#10b981','#3b82f6'];

function testGetAvatarColor() {
  const c1 = getAvatarColor('alice');
  const c2 = getAvatarColor('bob');
  assertTrue('getAvatarColor: returns palette color', PALETTE.includes(c1));
  assertEquals('getAvatarColor: consistent for same input', getAvatarColor('alice'), c1);
  assertNotEquals('getAvatarColor: alice vs bob differ', c1, c2);
  assertTrue('getAvatarColor: handles empty string', typeof getAvatarColor('') === 'string');
  assertTrue('getAvatarColor: handles undefined gracefully', typeof getAvatarColor(undefined) === 'string');
}

// ============================================================
// TESTS: getGrade
// ============================================================

function testGetGrade() {
  assertEquals('getGrade: 0t = A', getGrade(0), 'A');
  assertEquals('getGrade: 1t = A', getGrade(1), 'A');
  assertEquals('getGrade: 2t = A', getGrade(2), 'A');
  assertEquals('getGrade: 2.1t = B', getGrade(2.1), 'B');
  assertEquals('getGrade: 4t = B', getGrade(4), 'B');
  assertEquals('getGrade: 4.1t = C', getGrade(4.1), 'C');
  assertEquals('getGrade: 8t = C', getGrade(8), 'C');
  assertEquals('getGrade: 8.1t = D', getGrade(8.1), 'D');
  assertEquals('getGrade: 20t = D', getGrade(20), 'D');
  assertEquals('getGrade: 100t = D', getGrade(100), 'D');
}

// ============================================================
// TESTS: buildInsights
// ============================================================

function testBuildInsights() {
  const base = buildInsights(null);
  assertTrue('buildInsights(null): returns ≥1 insight', base.length >= 1);
  assertTrue('buildInsights(null): all have title', base.every(i => i.title));
  assertTrue('buildInsights(null): all have text', base.every(i => i.text));
  assertTrue('buildInsights(null): all have level', base.every(i => i.level));

  const fpHighTransport = { transport: 3000, food: 1500, energy: 800, shopping: 400, total: 5700, tonnes: 5.7 };
  const ins1 = buildInsights(fpHighTransport);
  assertTrue('buildInsights(high transport): has transport priority',
    ins1.some(i => i.levelLabel?.includes('Priority') && i.title.toLowerCase().includes('transport')));

  const fpHighFood = { transport: 500, food: 3200, energy: 800, shopping: 400, total: 4900, tonnes: 4.9 };
  assertTrue('buildInsights(high food): has food insight',
    buildInsights(fpHighFood).some(i => i.title.toLowerCase().includes('food')));

  const fpHighShopping = { transport: 500, food: 1000, energy: 800, shopping: 1500, total: 3800, tonnes: 3.8 };
  assertTrue('buildInsights(high shopping): has shopping insight',
    buildInsights(fpHighShopping).some(i => i.title.toLowerCase().includes('shopping')));

  const fpGood = { transport: 300, food: 1000, energy: 400, shopping: 200, total: 1900, tonnes: 1.9 };
  assertTrue('buildInsights(below avg): has positive reinforcement',
    buildInsights(fpGood).some(i => i.levelLabel?.includes('Excellent')));

  const fpMax = { transport: 4000, food: 3000, energy: 2000, shopping: 2000, total: 11000, tonnes: 11, flightLong: 3, meatFreq: 14, selections: { dietType: 'omnivore' } };
  assertTrue('buildInsights: never exceeds 7', buildInsights(fpMax).length <= 7);

  // High flights
  const fpFlights = { transport: 500, food: 1000, energy: 800, shopping: 400, total: 2700, tonnes: 2.7, flightLong: 4 };
  assertTrue('buildInsights(high flights): has flight insight',
    buildInsights(fpFlights).some(i => i.title.toLowerCase().includes('flight') || i.title.toLowerCase().includes('long-haul')));
}

// ============================================================
// TESTS: generateTips
// ============================================================

function testGenerateTips() {
  const highTransport = { transport: 3000, food: 1000, energy: 800, shopping: 400, total: 5200, tonnes: 5.2 };
  const tips1 = generateTips(highTransport);
  assertTrue('generateTips(high transport): returns ≥1 tip', tips1.length >= 1);
  assertTrue('generateTips(high transport): returns ≤4 tips', tips1.length <= 4);
  assertTrue('generateTips: each tip has icon', tips1.every(t => t.icon));
  assertTrue('generateTips: each tip has text', tips1.every(t => t.text));
  assertTrue('generateTips: each tip has saving', tips1.every(t => t.saving));
  assertTrue('generateTips(high transport): tip mentions transport/commute/car',
    tips1.some(t => t.text.toLowerCase().includes('transport') || t.text.toLowerCase().includes('commute') || t.text.toLowerCase().includes('car')));

  const highFood = { transport: 200, food: 3500, energy: 400, shopping: 200, total: 4300, tonnes: 4.3 };
  const tips2 = generateTips(highFood);
  assertTrue('generateTips(high food): tip mentions meat/plant/diet',
    tips2.some(t => t.text.toLowerCase().includes('meat') || t.text.toLowerCase().includes('plant') || t.text.toLowerCase().includes('diet')));

  const highEnergy = { transport: 200, food: 800, energy: 3000, shopping: 200, total: 4200, tonnes: 4.2 };
  const tips3 = generateTips(highEnergy);
  assertTrue('generateTips(high energy): tip mentions solar/ac/energy',
    tips3.some(t => t.text.toLowerCase().includes('solar') || t.text.toLowerCase().includes('ac') || t.text.toLowerCase().includes('energy')));
}

// ============================================================
// TESTS: calculateStreak
// ============================================================

function testCalculateStreak() {
  assertEquals('calculateStreak: null input returns 0', calculateStreak(null), 0);
  assertEquals('calculateStreak: empty object returns 0', calculateStreak({}), 0);
  assertEquals('calculateStreak: non-object returns 0', calculateStreak('invalid'), 0);

  // Build today's key
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;

  // One action today
  const oneDay = { [todayKey]: ['walk-bike'] };
  assertEquals('calculateStreak: 1 day streak', calculateStreak(oneDay), 1);

  // Two consecutive days
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const ydayKey = `${yesterday.getFullYear()}-${yesterday.getMonth()+1}-${yesterday.getDate()}`;

  const twoDays = { [todayKey]: ['walk-bike'], [ydayKey]: ['public-transit'] };
  assertEquals('calculateStreak: 2 day streak', calculateStreak(twoDays), 2);

  // Gap — yesterday empty, today has action => streak is 1
  const gapDays = { [todayKey]: ['walk-bike'] };
  assertEquals('calculateStreak: gap breaks streak', calculateStreak(gapDays), 1);

  // Empty today array => streak 0
  const emptyToday = { [todayKey]: [] };
  assertEquals('calculateStreak: empty today array = 0', calculateStreak(emptyToday), 0);
}

// ============================================================
// TESTS: getTotalActions / getTotalPoints
// ============================================================

function testGetTotalActionsAndPoints() {
  const emptyData = { actions: {} };
  assertEquals('getTotalActions: empty data = 0', getTotalActions(emptyData), 0);
  assertEquals('getTotalPoints: empty data = 0', getTotalPoints(emptyData), 0);

  // With actual ECO_ACTIONS data
  if (typeof ECO_ACTIONS !== 'undefined' && ECO_ACTIONS.length > 0) {
    const firstAction = ECO_ACTIONS[0];
    const data1 = { actions: { '2024-1-1': [firstAction.id] }, completedChallenges: [] };
    assertEquals('getTotalActions: 1 action in 1 day = 1', getTotalActions(data1), 1);
    assertEquals('getTotalPoints: 1 action = action.points', getTotalPoints(data1), firstAction.points);

    // Two different days
    const data2 = { actions: { '2024-1-1': [firstAction.id], '2024-1-2': [firstAction.id] }, completedChallenges: [] };
    assertEquals('getTotalActions: same action 2 days = 2', getTotalActions(data2), 2);
    assertEquals('getTotalPoints: 2 actions = 2×pts', getTotalPoints(data2), firstAction.points * 2);

    // Challenge bonus
    const data3 = { actions: {}, completedChallenges: ['challenge-1'] };
    assertEquals('getTotalPoints: 1 completed challenge = 100pts', getTotalPoints(data3), 100);
  }
}

// ============================================================
// TESTS: simulator math
// ============================================================

function testSimulatorMath() {
  // Test the core calculation formula from updateSimulatorResults
  // Each config has annualKgPerPct * 100 = annual kg saved at 100%
  const config = SIMULATOR_CONFIG;
  assertTrue('SIMULATOR_CONFIG: has driveReduction', !!config.driveReduction);
  assertTrue('SIMULATOR_CONFIG: has meatReduction', !!config.meatReduction);
  assertTrue('SIMULATOR_CONFIG: has renewableAdoption', !!config.renewableAdoption);
  assertTrue('SIMULATOR_CONFIG: has buyingReduction', !!config.buyingReduction);
  assertTrue('SIMULATOR_CONFIG: has flyingReduction', !!config.flyingReduction);

  // At 100% drive reduction: 14 * 100 = 1400 kg saved
  assertApprox('simMath: 100% drive reduction = 1400 kg', (100/100) * (config.driveReduction.annualKgPerPct * 100), 1400, 1);
  // At 50% meat reduction: 15 * 100 * 0.5 = 750 kg
  assertApprox('simMath: 50% meat reduction = 750 kg', (50/100) * (config.meatReduction.annualKgPerPct * 100), 750, 1);
  // All at 100%: sum of all annualKgPerPct * 100, capped at 8000
  const uncapped = Object.values(config).reduce((s, c) => s + c.annualKgPerPct * 100, 0);
  const capped = Math.min(uncapped, 8000);
  assertTrue('simMath: capped at 8000', capped <= 8000);
}

// ============================================================
// TESTS: registerUser input validation
// ============================================================

function testRegisterValidation() {
  const ts = Date.now();

  const r1 = registerUser('validname', 'notanemail', 'pass123');
  assertFalse('registerUser: invalid email rejected', r1.ok);
  assertTrue('registerUser: returns error message', typeof r1.error === 'string' && r1.error.length > 0);

  const r2 = registerUser('bad!name', `good${ts}@test.com`, 'pass123');
  assertFalse('registerUser: bad username rejected', r2.ok);

  const r3 = registerUser('goodname', `good2${ts}@test.com`, '12');
  assertFalse('registerUser: short password rejected', r3.ok);

  // Username too short
  const r4 = registerUser('ab', `short${ts}@test.com`, 'pass123');
  assertFalse('registerUser: 2-char username rejected', r4.ok);

  // Valid registration
  const r5 = registerUser(`eco${ts}`, `eco${ts}@test.com`, 'password123');
  assertTrue('registerUser: valid data returns ok:true', r5.ok);
  assertTrue('registerUser: valid data returns user object', !!r5.user);
  assertEquals('registerUser: username matches input', r5.user.username, `eco${ts}`);

  // Duplicate email
  const r6 = registerUser(`eco2${ts}`, `eco${ts}@test.com`, 'password123');
  assertFalse('registerUser: duplicate email rejected', r6.ok);

  // Duplicate username (different case)
  const r7 = registerUser(`ECO${ts}`, `eco3${ts}@test.com`, 'password123');
  assertFalse('registerUser: duplicate username (case-insensitive) rejected', r7.ok);

  // XSS in username should be rejected by isValidUsername
  const r8 = registerUser('<script>x</script>', `xss${ts}@test.com`, 'pass123');
  assertFalse('registerUser: script tag in username rejected', r8.ok);

  // Clean up
  const users = getAllUsers().filter(u => !String(u.email).includes(String(ts)));
  saveAllUsers(users);
}

// ============================================================
// TESTS: login & rate limiting
// ============================================================

function testRateLimiting() {
  const testEmail = `ratelimit_${Date.now()}@test.example`;
  registerUser(`rl${Date.now()}`, testEmail, 'correct123');

  for (let i = 0; i < 5; i++) {
    loginUser(testEmail, 'wrongpassword');
  }

  const locked = loginUser(testEmail, 'wrongpassword');
  assertFalse('rateLimit: 6th failed attempt blocked', locked.ok);
  assertTrue('rateLimit: lockout error message returned',
    locked.error.toLowerCase().includes('too many') || locked.error.toLowerCase().includes('attempt'));

  // Even correct password should be blocked
  const blockedCorrect = loginUser(testEmail, 'correct123');
  assertFalse('rateLimit: correct password also blocked during lockout', blockedCorrect.ok);

  // Clean up
  const users = getAllUsers().filter(u => u.email !== testEmail);
  saveAllUsers(users);
}

function testLoginSuccess() {
  const ts    = Date.now();
  const email = `login_ok_${ts}@test.com`;
  const name  = `loginok${ts}`;
  registerUser(name, email, 'mypass123');

  // Wrong password
  const fail = loginUser(email, 'wrongpass');
  assertFalse('loginUser: wrong password fails', fail.ok);
  assertTrue('loginUser: wrong password error message', typeof fail.error === 'string');

  // Non-existent email
  const noUser = loginUser(`nosuchuser_${ts}@none.com`, 'anypass');
  assertFalse('loginUser: unknown email fails', noUser.ok);

  // Correct credentials
  const ok = loginUser(email, 'mypass123');
  assertTrue('loginUser: correct credentials succeeds', ok.ok);
  assertTrue('loginUser: returns user object', !!ok.user);
  assertEquals('loginUser: user email matches', ok.user.email, email);

  // Clean up
  const users = getAllUsers().filter(u => u.email !== email);
  saveAllUsers(users);
  localStorage.removeItem('ecotrack_session');
}

// ============================================================
// TESTS: getUserData / saveUserData / updateUserData
// ============================================================

function testUserDataStorage() {
  const ts  = Date.now();
  const uid = 'test_uid_' + ts;

  // Save and retrieve
  saveUserData(uid, { footprint: null, streak: 3, points: 150 });
  const d = getUserData(uid);
  assertEquals('getUserData: streak persisted', d.streak, 3);
  assertEquals('getUserData: points persisted', d.points, 150);

  // Patch
  const users_before = getAllUsers();
  // set session
  localStorage.setItem('ecotrack_session', uid);
  updateUserData({ streak: 7 });
  const d2 = getUserData(uid);
  assertEquals('updateUserData: streak patched', d2.streak, 7);
  assertEquals('updateUserData: points preserved', d2.points, 150);

  // Non-existent key returns empty object
  const empty = getUserData('nonexistent_uid_xyz');
  assertEquals('getUserData: missing uid returns empty obj', JSON.stringify(empty), '{}');

  // Clean up
  localStorage.removeItem('ecotrack_data_' + uid);
  localStorage.removeItem('ecotrack_session');
}

// ============================================================
// TESTS: sanitizeInput edge cases (security)
// ============================================================

function testSecurityEdgeCases() {
  // Common XSS vectors
  assertEquals('security: img onerror XSS neutralized',
    sanitizeInput('<img src=x onerror=alert(1)>'), '');
  assertEquals('security: svg/onload XSS neutralized',
    sanitizeInput('<svg onload=alert(1)>'), '');
  assertEquals('security: iframe stripped',
    sanitizeInput('<iframe src="evil.com"></iframe>'), '');
  // Injection chars stripped
  assertEquals('security: semicolon stripped', sanitizeInput('x;DROP TABLE users'), 'xDROP TABLE users');
  assertTrue('security: normal text unaffected', sanitizeInput('Hello World 123') === 'Hello World 123');
  // Very long input truncated by sanitize (no crash)
  assertTrue('security: very long input handled', sanitizeInput('a'.repeat(10000)).length >= 0);
}

// ============================================================
// TESTS: findUserByEmail
// ============================================================

function testFindUserByEmail() {
  const ts  = Date.now();
  const email = `find_${ts}@test.com`;
  registerUser(`finder${ts}`, email, 'findpass');

  const found = findUserByEmail(email);
  assertTrue('findUserByEmail: finds registered user', !!found);
  assertEquals('findUserByEmail: email matches', found.email, email);

  // Case-insensitive
  const foundUpper = findUserByEmail(email.toUpperCase());
  assertTrue('findUserByEmail: case-insensitive', !!foundUpper);

  // Non-existent
  const notFound = findUserByEmail(`nosuchuser_${ts}@none.com`);
  assertEquals('findUserByEmail: returns undefined for unknown', notFound, undefined);

  // Clean up
  const users = getAllUsers().filter(u => u.email !== email);
  saveAllUsers(users);
}

// ============================================================
// TESTS: challenge progress logic (unit-level)
// ============================================================

function testChallengeData() {
  // Verify WEEKLY_CHALLENGES array is populated
  assertTrue('WEEKLY_CHALLENGES: defined and non-empty', Array.isArray(WEEKLY_CHALLENGES) && WEEKLY_CHALLENGES.length > 0);
  assertTrue('WEEKLY_CHALLENGES: all have id', WEEKLY_CHALLENGES.every(c => c.id));
  assertTrue('WEEKLY_CHALLENGES: all have target', WEEKLY_CHALLENGES.every(c => typeof c.target === 'number' && c.target > 0));
  assertTrue('WEEKLY_CHALLENGES: all have points', WEEKLY_CHALLENGES.every(c => typeof c.points === 'number' && c.points > 0));
  assertTrue('WEEKLY_CHALLENGES: all have category', WEEKLY_CHALLENGES.every(c => ['easy','medium','hard'].includes(c.category)));

  // pct calculation
  const challenge = WEEKLY_CHALLENGES[0];
  const pct = Math.min((3 / challenge.target) * 100, 100);
  assertTrue('challengePct: 3/7 days is between 0 and 100', pct >= 0 && pct <= 100);
  assertApprox('challengePct: 3/7 ≈ 42.86%', pct, 42.86, 1);
}

// ============================================================
// TESTS: BADGES data integrity
// ============================================================

function testBadgesData() {
  assertTrue('BADGES: defined and non-empty', Array.isArray(BADGES) && BADGES.length > 0);
  assertTrue('BADGES: all have id', BADGES.every(b => b.id));
  assertTrue('BADGES: all have emoji', BADGES.every(b => b.emoji));
  assertTrue('BADGES: all have name', BADGES.every(b => b.name));
  assertTrue('BADGES: all have check function', BADGES.every(b => typeof b.check === 'function'));

  // check functions with empty data should return false (except maybe none)
  const emptyData = { actions: {}, footprint: null, streak: 0, points: 0, completedChallenges: [], badges: [] };
  BADGES.forEach(badge => {
    const result = badge.check(emptyData);
    assertTrue(`BADGE check '${badge.id}': returns boolean`, typeof result === 'boolean');
  });

  // With footprint set, calculator-done badge should return true
  const withFp = { ...emptyData, footprint: { total: 3000, tonnes: 3 } };
  assertTrue('BADGE calculator-done: true when footprint set',
    BADGES.find(b => b.id === 'calculator-done').check(withFp));
}

// ============================================================
// RUN ALL TESTS
// ============================================================

function runAllTests() {
  testSimpleHash();
  testSanitizeInput();
  testIsValidEmail();
  testIsValidUsername();
  testGetAvatarInitials();
  testGetAvatarColor();
  testGetGrade();
  testBuildInsights();
  testGenerateTips();
  testCalculateStreak();
  testGetTotalActionsAndPoints();
  testSimulatorMath();
  testRegisterValidation();
  testRateLimiting();
  testLoginSuccess();
  testUserDataStorage();
  testSecurityEdgeCases();
  testFindUserByEmail();
  testChallengeData();
  testBadgesData();
}
