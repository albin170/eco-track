/**
 * tests.js — EcoTrack Unit Test Suite
 *
 * Zero-dependency browser-based tests. Runs automatically when tests.html is opened.
 * Uses a tiny assertion library defined at the top of this file.
 */

// ============================================================
// MINI ASSERTION LIBRARY
// ============================================================

let _passed = 0;
let _failed = 0;
const _results = [];

/**
 * Assert that actual === expected (strict equality).
 */
function assertEquals(description, actual, expected) {
  if (actual === expected) {
    _results.push({ ok: true, description });
    _passed++;
  } else {
    _results.push({ ok: false, description, actual, expected });
    _failed++;
  }
}

/**
 * Assert that value is truthy.
 */
function assertTrue(description, value) {
  assertEquals(description, !!value, true);
}

/**
 * Assert that value is falsy.
 */
function assertFalse(description, value) {
  assertEquals(description, !!value, false);
}

/**
 * Assert that actual is strictly not equal to unexpected.
 */
function assertNotEquals(description, actual, unexpected) {
  if (actual !== unexpected) {
    _results.push({ ok: true, description });
    _passed++;
  } else {
    _results.push({ ok: false, description, actual, expected: `NOT ${unexpected}` });
    _failed++;
  }
}

/**
 * Assert that actual is within ± delta of expected.
 */
function assertApprox(description, actual, expected, delta = 0.01) {
  if (Math.abs(actual - expected) <= delta) {
    _results.push({ ok: true, description });
    _passed++;
  } else {
    _results.push({ ok: false, description, actual, expected: `≈${expected} (±${delta})` });
    _failed++;
  }
}

// ============================================================
// TESTS: simpleHash
// ============================================================

function testSimpleHash() {
  assertEquals('simpleHash: same input returns same hash', simpleHash('hello'), simpleHash('hello'));
  assertNotEquals('simpleHash: different inputs produce different hashes', simpleHash('hello'), simpleHash('world'));
  assertNotEquals('simpleHash: password vs empty string', simpleHash('password123'), simpleHash(''));
  assertTrue('simpleHash: returns a string', typeof simpleHash('test') === 'string');
  assertTrue('simpleHash: handles empty string', simpleHash('') !== undefined);
}

// ============================================================
// TESTS: sanitizeInput
// ============================================================

function testSanitizeInput() {
  assertEquals('sanitizeInput: strips script tags', sanitizeInput('<script>alert(1)</script>'), 'alert(1)');
  assertEquals('sanitizeInput: strips angle brackets', sanitizeInput('<b>bold</b>'), 'bold');
  assertEquals('sanitizeInput: strips single quotes', sanitizeInput("O'Brien"), 'OBrien');
  assertEquals('sanitizeInput: trims whitespace', sanitizeInput('  hello  '), 'hello');
  assertEquals('sanitizeInput: leaves clean text unchanged', sanitizeInput('eco_warrior'), 'eco_warrior');
  assertEquals('sanitizeInput: handles non-string gracefully', sanitizeInput(null), '');
  assertEquals('sanitizeInput: handles number', sanitizeInput(42), '');
}

// ============================================================
// TESTS: isValidEmail
// ============================================================

function testIsValidEmail() {
  assertTrue('isValidEmail: valid email passes', isValidEmail('test@example.com'));
  assertTrue('isValidEmail: subdomain email passes', isValidEmail('user@sub.domain.co'));
  assertFalse('isValidEmail: no @ sign fails', isValidEmail('notanemail'));
  assertFalse('isValidEmail: no domain fails', isValidEmail('user@'));
  assertFalse('isValidEmail: no TLD fails', isValidEmail('user@domain'));
  assertFalse('isValidEmail: empty string fails', isValidEmail(''));
  assertFalse('isValidEmail: spaces fail', isValidEmail('user @domain.com'));
}

// ============================================================
// TESTS: isValidUsername
// ============================================================

function testIsValidUsername() {
  assertTrue('isValidUsername: valid alphanumeric', isValidUsername('eco_warrior'));
  assertTrue('isValidUsername: all numbers', isValidUsername('123456'));
  assertTrue('isValidUsername: exactly 3 chars', isValidUsername('abc'));
  assertFalse('isValidUsername: too short (2 chars)', isValidUsername('ab'));
  assertFalse('isValidUsername: spaces not allowed', isValidUsername('eco warrior'));
  assertFalse('isValidUsername: special chars not allowed', isValidUsername('eco@warrior!'));
  assertFalse('isValidUsername: empty string', isValidUsername(''));
  assertFalse('isValidUsername: too long (31 chars)', isValidUsername('a'.repeat(31)));
}

// ============================================================
// TESTS: getAvatarInitials
// ============================================================

function testGetAvatarInitials() {
  assertEquals('getAvatarInitials: normal name', getAvatarInitials('EcoWarrior'), 'EC');
  assertEquals('getAvatarInitials: lowercase input uppercased', getAvatarInitials('john'), 'JO');
  assertEquals('getAvatarInitials: single char name', getAvatarInitials('X'), 'X');
  assertEquals('getAvatarInitials: fallback for empty', getAvatarInitials(''), '?');
  assertEquals('getAvatarInitials: exactly 2 chars', getAvatarInitials('AB'), 'AB');
}

// ============================================================
// TESTS: getAvatarColor
// ============================================================

const PALETTE = ['#22c55e','#06b6d4','#8b5cf6','#f59e0b','#ef4444','#10b981','#3b82f6'];

function testGetAvatarColor() {
  const color1 = getAvatarColor('alice');
  const color2 = getAvatarColor('bob');
  assertTrue('getAvatarColor: returns a value from the palette', PALETTE.includes(color1));
  assertTrue('getAvatarColor: consistent for same input', getAvatarColor('alice') === color1);
  // Different usernames should (usually) produce different colors — not guaranteed but true for these
  assertNotEquals('getAvatarColor: alice vs bob differ', color1, color2);
}

// ============================================================
// TESTS: getGrade (calculator.js)
// ============================================================

function testGetGrade() {
  assertEquals('getGrade: 0 tonnes = A', getGrade(0), 'A');
  assertEquals('getGrade: 2 tonnes = A', getGrade(2), 'A');
  assertEquals('getGrade: 2.1 tonnes = B', getGrade(2.1), 'B');
  assertEquals('getGrade: 4 tonnes = B', getGrade(4), 'B');
  assertEquals('getGrade: 4.1 tonnes = C', getGrade(4.1), 'C');
  assertEquals('getGrade: 8 tonnes = C', getGrade(8), 'C');
  assertEquals('getGrade: 8.1 tonnes = D', getGrade(8.1), 'D');
  assertEquals('getGrade: 20 tonnes = D', getGrade(20), 'D');
}

// ============================================================
// TESTS: buildInsights (insights.js)
// ============================================================

function testBuildInsights() {
  // No footprint — should return base insights only
  const baseInsights = buildInsights(null);
  assertTrue('buildInsights(null): returns at least 1 insight', baseInsights.length >= 1);
  assertTrue('buildInsights(null): each insight has a title', baseInsights.every(i => i.title));
  assertTrue('buildInsights(null): each insight has a text', baseInsights.every(i => i.text));
  assertTrue('buildInsights(null): each insight has a level', baseInsights.every(i => i.level));

  // High transport footprint — should add a transport priority insight
  const fpHighTransport = { transport: 3000, food: 1500, energy: 800, shopping: 400, total: 5700, tonnes: 5.7 };
  const insights = buildInsights(fpHighTransport);
  assertTrue('buildInsights(high transport): includes transport priority insight',
    insights.some(i => i.levelLabel && i.levelLabel.includes('Priority') && i.title.toLowerCase().includes('transport')));

  // High food footprint — should add a food priority insight
  const fpHighFood = { transport: 500, food: 3200, energy: 800, shopping: 400, total: 4900, tonnes: 4.9 };
  const foodInsights = buildInsights(fpHighFood);
  assertTrue('buildInsights(high food): includes food priority insight',
    foodInsights.some(i => i.title.toLowerCase().includes('food')));

  // High shopping footprint — should add shopping insight
  const fpHighShopping = { transport: 500, food: 1000, energy: 800, shopping: 1500, total: 3800, tonnes: 3.8 };
  const shopInsights = buildInsights(fpHighShopping);
  assertTrue('buildInsights(high shopping): includes shopping insight',
    shopInsights.some(i => i.title.toLowerCase().includes('shopping')));

  // Good footprint (below India avg) — should add positive reinforcement
  const fpGood = { transport: 300, food: 1000, energy: 400, shopping: 200, total: 1900, tonnes: 1.9 };
  const goodInsights = buildInsights(fpGood);
  assertTrue('buildInsights(below avg): includes positive reinforcement',
    goodInsights.some(i => i.levelLabel && i.levelLabel.includes('Excellent')));

  // Result should never exceed 7
  const allInsights = buildInsights({ transport: 4000, food: 3000, energy: 2000, shopping: 2000, total: 11000, tonnes: 11, flightLong: 3, meatFreq: 14, selections: { dietType: 'omnivore' } });
  assertTrue('buildInsights: never returns more than 7 insights', allInsights.length <= 7);
}

// ============================================================
// TESTS: generateTips (calculator.js)
// ============================================================

function testGenerateTips() {
  const result = {
    transport: 3000,
    food: 1000,
    energy: 800,
    shopping: 400,
    total: 5200,
    tonnes: 5.2
  };

  const tips = generateTips(result);
  assertTrue('generateTips: returns at least 1 tip', tips.length >= 1);
  assertTrue('generateTips: returns at most 4 tips', tips.length <= 4);
  assertTrue('generateTips: each tip has icon', tips.every(t => t.icon));
  assertTrue('generateTips: each tip has text', tips.every(t => t.text));
  assertTrue('generateTips: each tip has saving', tips.every(t => t.saving));

  // Highest category (transport here) should supply 2 tips
  // At least one tip should reference transport
  assertTrue('generateTips: tips include transport advice (highest category)',
    tips.some(t => t.text.toLowerCase().includes('transport') || t.text.toLowerCase().includes('commute') || t.text.toLowerCase().includes('car')));
}

// ============================================================
// TESTS: login rate-limiting
// ============================================================

function testRateLimiting() {
  // Register a test user
  const testEmail = `ratelimit_${Date.now()}@test.example`;
  registerUser('rlTestUser', testEmail, 'correct123');

  // Fail login 5 times with wrong password
  for (let i = 0; i < 5; i++) {
    loginUser(testEmail, 'wrongpassword');
  }

  // 6th attempt should return a lockout error
  const result = loginUser(testEmail, 'wrongpassword');
  assertFalse('Rate limit: 6th failed attempt returns ok=false', result.ok);
  assertTrue('Rate limit: error message mentions attempts or try again',
    result.error.toLowerCase().includes('too many') || result.error.toLowerCase().includes('attempt'));

  // Correct password should also be blocked during lockout
  const blockedCorrect = loginUser(testEmail, 'correct123');
  assertFalse('Rate limit: correct password blocked during lockout', blockedCorrect.ok);

  // Clean up: delete the test user
  const users = getAllUsers().filter(u => u.email !== testEmail);
  saveAllUsers(users);
}

// ============================================================
// TESTS: registerUser input validation
// ============================================================

function testRegisterValidation() {
  const ts = Date.now();

  // Invalid email
  const r1 = registerUser('validname', 'notanemail', 'pass123');
  assertFalse('registerUser: rejects invalid email', r1.ok);

  // Invalid username (special chars)
  const r2 = registerUser('bad!name', `good${ts}@test.com`, 'pass123');
  assertFalse('registerUser: rejects username with special chars', r2.ok);

  // Short password
  const r3 = registerUser('goodname', `good2${ts}@test.com`, '123');
  assertFalse('registerUser: rejects password under 6 chars', r3.ok);

  // Valid registration
  const r4 = registerUser(`eco${ts}`, `eco${ts}@test.com`, 'password123');
  assertTrue('registerUser: valid data succeeds', r4.ok);

  // Duplicate email
  const r5 = registerUser(`eco2${ts}`, `eco${ts}@test.com`, 'password123');
  assertFalse('registerUser: duplicate email rejected', r5.ok);

  // Clean up
  const users = getAllUsers().filter(u => !u.email.includes(`${ts}`));
  saveAllUsers(users);
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
  testRegisterValidation();
  testRateLimiting();
}
