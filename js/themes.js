/* ============================================
   TypeFlow — Theme Module
   ============================================ */

import { getSetting, setSetting } from './settings.js';

/**
 * Apply a theme to the document.
 * @param {string} theme - 'dark' or 'light'
 */
export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  setSetting('theme', theme);
  updateThemeIcon(theme);
}

/**
 * Toggle between dark and light themes.
 */
export function toggleTheme() {
  const current = getSetting('theme');
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
}

/**
 * Initialize theme from saved settings.
 */
export function initTheme() {
  const theme = getSetting('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcon(theme);
}

/**
 * Update the theme toggle button icon.
 * @param {string} theme
 */
function updateThemeIcon(theme) {
  const btn = document.getElementById('theme-toggle-btn');
  if (!btn) return;

  if (theme === 'dark') {
    btn.innerHTML = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
    btn.title = 'Switch to light mode';
  } else {
    btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
    btn.title = 'Switch to dark mode';
  }
}
