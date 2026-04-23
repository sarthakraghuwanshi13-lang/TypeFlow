/* ============================================
   TypeFlow — Settings Module
   ============================================ */

const SETTINGS_KEY = 'typeflow_settings';

const DEFAULT_SETTINGS = {
  theme: 'dark',
  soundEnabled: true,
  soundType: 'mechanical',      // 'mechanical', 'soft', 'clicky', 'typewriter'
  strictMode: false,
  testMode: 'time',
  testValue: 30,
  fontFamily: 'JetBrains Mono',
  ambientSound: 'none',         // 'none', 'ocean', 'rain', 'whitenoise'
  ambientVolume: 0.3            // 0 to 1
};

// Available font options
export const FONT_OPTIONS = [
  { name: 'JetBrains Mono', value: 'JetBrains Mono' },
  { name: 'Fira Code', value: 'Fira Code' },
  { name: 'Source Code Pro', value: 'Source Code Pro' },
  { name: 'Roboto Mono', value: 'Roboto Mono' },
  { name: 'Ubuntu Mono', value: 'Ubuntu Mono' },
  { name: 'Space Mono', value: 'Space Mono' }
];

// Available sound types
export const SOUND_TYPES = [
  { name: 'Mechanical', value: 'mechanical' },
  { name: 'Soft', value: 'soft' },
  { name: 'Clicky', value: 'clicky' },
  { name: 'Typewriter', value: 'typewriter' }
];

// Available ambient sounds
export const AMBIENT_TYPES = [
  { name: 'None', value: 'none' },
  { name: '🌊 Ocean Waves', value: 'ocean' },
  { name: '🌧 Rain', value: 'rain' },
  { name: '📻 White Noise', value: 'whitenoise' }
];

let currentSettings = { ...DEFAULT_SETTINGS };
let listeners = [];

/**
 * Load settings from localStorage (or use defaults).
 * @returns {Object} Current settings
 */
export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('TypeFlow: Could not load settings', e);
  }
  return { ...currentSettings };
}

/**
 * Save current settings to localStorage.
 */
function persistSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings));
  } catch (e) {
    console.warn('TypeFlow: Could not save settings', e);
  }
}

/**
 * Get a specific setting value.
 * @param {string} key
 * @returns {*} The setting value
 */
export function getSetting(key) {
  return currentSettings[key];
}

/**
 * Get all settings.
 * @returns {Object}
 */
export function getAllSettings() {
  return { ...currentSettings };
}

/**
 * Update a setting and notify listeners.
 * @param {string} key
 * @param {*} value
 */
export function setSetting(key, value) {
  if (currentSettings[key] === value) return;
  currentSettings[key] = value;
  persistSettings();
  notifyListeners(key, value);
}

/**
 * Register a callback for setting changes.
 * @param {Function} callback - fn(key, value)
 */
export function onSettingChange(callback) {
  listeners.push(callback);
}

/**
 * Notify all registered listeners.
 */
function notifyListeners(key, value) {
  listeners.forEach(fn => fn(key, value));
}

/**
 * Get the mode string identifier (e.g., 'time-30', 'words-25').
 * @returns {string}
 */
export function getModeId() {
  return `${currentSettings.testMode}-${currentSettings.testValue}`;
}
