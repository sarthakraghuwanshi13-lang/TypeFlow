/* ============================================
   TypeFlow — LocalStorage Module
   ============================================ */

const STORAGE_KEY = 'typeflow_history';
const MAX_HISTORY = 50;

/**
 * Save a test result to localStorage.
 * @param {Object} result - The test result data
 */
export function saveResult(result) {
  const history = getHistory();
  history.unshift({
    ...result,
    timestamp: Date.now(),
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)
  });

  // Keep only the latest MAX_HISTORY results
  if (history.length > MAX_HISTORY) {
    history.length = MAX_HISTORY;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn('TypeFlow: Could not save to localStorage', e);
  }
}

/**
 * Retrieve all stored test results.
 * @returns {Object[]} Array of result objects, newest first
 */
export function getHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('TypeFlow: Could not read localStorage', e);
    return [];
  }
}

/**
 * Get the personal best WPM for a given mode.
 * @param {string} mode - e.g. 'time-30' or 'words-25'
 * @returns {number|null} Best WPM or null
 */
export function getPersonalBest(mode) {
  const history = getHistory();
  const modeResults = history.filter(r => r.mode === mode);
  if (modeResults.length === 0) return null;
  return Math.max(...modeResults.map(r => r.wpm));
}

/**
 * Check if a WPM is a new personal best for the given mode.
 * @param {number} wpm
 * @param {string} mode
 * @returns {boolean}
 */
export function isPersonalBest(wpm, mode) {
  const best = getPersonalBest(mode);
  return best === null || wpm > best;
}

/**
 * Clear all stored history.
 */
export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('TypeFlow: Could not clear localStorage', e);
  }
}
