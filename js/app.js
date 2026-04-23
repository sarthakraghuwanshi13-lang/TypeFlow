/* ============================================
   TypeFlow — Main Application Orchestrator
   ============================================ */

import { TypingEngine } from './engine.js';
import { Renderer } from './renderer.js';
import { loadSettings, getSetting, setSetting, onSettingChange, getModeId, FONT_OPTIONS } from './settings.js';
import { initTheme, toggleTheme } from './themes.js';
import { showResults, hideResults } from './results.js';
import { initSounds, startAmbient, stopAmbient, setAmbientVolume } from './sounds.js';
import { BackgroundAnimation } from './background.js';

// ---- State ----
let engine = null;
let renderer = null;
let inputEl = null;
let isTestActive = false;
let bgAnimation = null;

// ---- Initialize ----
document.addEventListener('DOMContentLoaded', () => {
  // Load saved settings
  loadSettings();
  initTheme();

  // Start background animation
  bgAnimation = new BackgroundAnimation('bg-canvas');
  bgAnimation.start();

  // Cache DOM elements
  inputEl = document.getElementById('typing-input');
  const wordsContainer = document.getElementById('words-display');
  const caretEl = document.getElementById('caret');

  // Create renderer
  renderer = new Renderer(wordsContainer, caretEl);

  // Create engine
  engine = new TypingEngine();

  // Wire engine callbacks
  wireEngineCallbacks();

  // Set up event listeners
  setupInputHandling();
  setupModeSelector();
  setupSettingsPanel();
  setupKeyboardShortcuts();
  setupThemeToggle();
  setupRestartButton();
  setupFontSelector();
  setupSoundTypeSelector();
  setupAmbientControls();
  applySettingsToUI();

  // Apply saved font
  applyFont(getSetting('fontFamily'));

  // Start first test
  startNewTest();
});

/**
 * Wire engine events to renderer updates.
 */
function wireEngineCallbacks() {
  engine.onCharUpdate = (wIdx, cIdx, state) => {
    renderer.updateChar(wIdx, cIdx, state);
    renderer.setCaretTyping(true);
  };

  engine.onWordAdvance = (newIdx, prevIdx) => {
    renderer.setCurrentWord(newIdx, prevIdx);
  };

  engine.onExtraChar = (wIdx, char) => {
    renderer.addExtraChar(wIdx, char);
  };

  engine.onRemoveExtra = (wIdx) => {
    renderer.removeLastExtra(wIdx);
  };

  engine.onCaretUpdate = (wIdx, cIdx) => {
    renderer.updateCaret(wIdx, cIdx);
  };

  engine.onStatsUpdate = (wpm, accuracy, timeValue) => {
    updateLiveStats(wpm, accuracy, timeValue);
  };

  engine.onWordError = (wIdx) => {
    renderer.markWordError(wIdx);
  };

  engine.onTestEnd = (finalStats) => {
    isTestActive = false;
    inputEl.blur();
    showResults(finalStats);
    showRestartHint(true);
    document.querySelector('.live-stats')?.classList.remove('visible');
  };

  engine.onNewWords = (words) => {
    renderer.renderWords(words);
    renderer.setCurrentWord(engine.currentWordIndex);
    for (let w = 0; w < engine.currentWordIndex; w++) {
      const word = engine.words[w];
      const typed = engine.typedHistory[w];
      for (let c = 0; c < word.length; c++) {
        if (c < typed.length) {
          const state = typed[c] === word[c] ? 'correct' : 'incorrect';
          renderer.updateChar(w, c, state);
        }
      }
    }
    renderer.updateCaret(engine.currentWordIndex, engine.currentCharIndex);
  };
}

/**
 * Set up input handling on the hidden input element.
 */
function setupInputHandling() {
  const wordsDisplay = document.getElementById('words-display');

  wordsDisplay.addEventListener('click', () => {
    inputEl.focus();
  });

  inputEl.addEventListener('focus', () => {
    renderer.setBlurred(false);
    if (!engine.started && !engine.finished) {
      showRestartHint(false);
    }
  });

  inputEl.addEventListener('blur', () => {
    if (isTestActive) {
      renderer.setBlurred(true);
    }
  });

  // Input handling — character typing
  inputEl.addEventListener('input', (e) => {
    if (engine.finished) return;

    if (!isTestActive) {
      isTestActive = true;
      document.querySelector('.live-stats')?.classList.add('visible');
      showRestartHint(false);
      initSounds();
    }

    const result = engine.handleInput(inputEl.value, e);

    if (result === 'clear') {
      inputEl.value = '';
    } else if (result === 'restore') {
      inputEl.value = engine.getRestorationValue();
    }
  });

  // Keydown handling — backspace, tab, ctrl+backspace
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      return;
    }

    if (e.key === 'Backspace' && !engine.finished) {
      // When the input is empty, the 'input' event with deleteContentBackward
      // never fires, so we need to handle backspace manually here
      if (inputEl.value.length === 0) {
        e.preventDefault();

        if (!isTestActive) {
          isTestActive = true;
          document.querySelector('.live-stats')?.classList.add('visible');
          showRestartHint(false);
          initSounds();
        }

        // Create a synthetic event object for the engine
        const syntheticEvent = { inputType: 'deleteContentBackward', data: null };
        const result = engine.handleInput('', syntheticEvent);

        if (result === 'restore') {
          inputEl.value = engine.getRestorationValue();
        }
      }
      // If input has content, the normal 'input' event will handle it
    }

    // Ctrl+Backspace: delete entire current word input
    if (e.key === 'Backspace' && e.ctrlKey && !engine.finished) {
      e.preventDefault();
      // Delete all characters in the current word
      while (engine.currentCharIndex > 0) {
        const syntheticEvent = { inputType: 'deleteContentBackward', data: null };
        engine.handleInput('', syntheticEvent);
      }
      inputEl.value = '';
    }
  });

  // Prevent pasting
  inputEl.addEventListener('paste', (e) => {
    e.preventDefault();
  });

  // Auto-focus on page load
  setTimeout(() => inputEl.focus(), 100);
}

/**
 * Set up mode selector buttons.
 */
function setupModeSelector() {
  const modeButtons = document.querySelectorAll('.mode-btn');

  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      const value = parseInt(btn.dataset.value, 10);

      if (mode && value) {
        setSetting('testMode', mode);
        setSetting('testValue', value);
        updateModeButtonStates();
        startNewTest();
        inputEl.focus();
      }
    });
  });

  updateModeButtonStates();
}

/**
 * Update active state on mode buttons.
 */
function updateModeButtonStates() {
  const mode = getSetting('testMode');
  const value = getSetting('testValue');

  document.querySelectorAll('.mode-btn').forEach(btn => {
    const isActive = btn.dataset.mode === mode && parseInt(btn.dataset.value, 10) === value;
    btn.classList.toggle('active', isActive);
  });
}

/**
 * Start a new typing test.
 */
function startNewTest() {
  const mode = getSetting('testMode');
  const value = getSetting('testValue');

  hideResults();

  engine.initTest(mode, value);
  renderer.renderWords(engine.words);
  renderer.setCurrentWord(0);
  renderer.showCaret(true);
  renderer.setBlurred(false);

  inputEl.value = '';
  inputEl.focus();

  isTestActive = false;

  updateLiveStats(0, 100, mode === 'time' ? value : 0);
  document.querySelector('.live-stats')?.classList.remove('visible');

  showRestartHint(false);

  requestAnimationFrame(() => {
    renderer.updateCaret(0, 0);
  });
}

/**
 * Update live stats display.
 */
function updateLiveStats(wpm, accuracy, timeValue) {
  const wpmEl = document.getElementById('live-wpm');
  const accEl = document.getElementById('live-accuracy');
  const timeEl = document.getElementById('live-time');

  if (wpmEl) wpmEl.textContent = wpm;
  if (accEl) accEl.textContent = `${accuracy}%`;
  if (timeEl) timeEl.textContent = timeValue;
}

/**
 * Show/hide restart hint.
 */
function showRestartHint(visible) {
  const hint = document.querySelector('.restart-hint');
  if (hint) hint.classList.toggle('visible', visible);
}

/**
 * Set up keyboard shortcuts.
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab' && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      startNewTest();
      return;
    }

    if (e.key === 'Escape') {
      hideResults();
      closeSettings();
      inputEl.focus();
      return;
    }

    if (!e.ctrlKey && !e.altKey && !e.metaKey && e.key.length === 1) {
      const settingsPanel = document.getElementById('settings-panel');
      const resultsOverlay = document.getElementById('results-overlay');
      if (settingsPanel?.classList.contains('visible')) return;
      if (resultsOverlay?.classList.contains('visible')) return;

      if (document.activeElement !== inputEl) {
        inputEl.focus();
      }
    }
  });
}

/**
 * Set up theme toggle button.
 */
function setupThemeToggle() {
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.addEventListener('click', () => {
      toggleTheme();
    });
  }
}

/**
 * Set up restart button/hint.
 */
function setupRestartButton() {
  const hint = document.querySelector('.restart-hint');
  if (hint) {
    hint.addEventListener('click', () => {
      startNewTest();
    });
  }

  document.addEventListener('click', (e) => {
    if (e.target.id === 'restart-btn' || e.target.closest('#restart-btn')) {
      startNewTest();
    }
    if (e.target.id === 'next-test-btn' || e.target.closest('#next-test-btn')) {
      startNewTest();
    }
  });
}

/**
 * Set up settings panel.
 */
function setupSettingsPanel() {
  const settingsBtn = document.getElementById('settings-btn');
  const settingsOverlay = document.getElementById('settings-overlay');
  const closeBtn = document.getElementById('close-settings-btn');

  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => openSettings());
  }

  if (settingsOverlay) {
    settingsOverlay.addEventListener('click', () => closeSettings());
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeSettings());
  }

  // Sound toggle
  const soundToggle = document.getElementById('sound-toggle');
  if (soundToggle) {
    soundToggle.checked = getSetting('soundEnabled');
    soundToggle.addEventListener('change', () => {
      setSetting('soundEnabled', soundToggle.checked);
      if (soundToggle.checked) initSounds();
    });
  }

  // Strict mode toggle
  const strictToggle = document.getElementById('strict-toggle');
  if (strictToggle) {
    strictToggle.checked = getSetting('strictMode');
    strictToggle.addEventListener('change', () => {
      setSetting('strictMode', strictToggle.checked);
    });
  }
}

/**
 * Set up sound type selector.
 */
function setupSoundTypeSelector() {
  const select = document.getElementById('sound-type-select');
  if (!select) return;

  select.value = getSetting('soundType') || 'mechanical';

  select.addEventListener('change', () => {
    setSetting('soundType', select.value);
    // Play a preview click
    initSounds();
    // Small delay to allow buffer generation
    setTimeout(() => {
      const { playKeyClick } = import('./sounds.js').then(m => m.playKeyClick());
    }, 50);
  });
}

/**
 * Set up ambient sound controls.
 */
function setupAmbientControls() {
  const ambientSelect = document.getElementById('ambient-select');
  const ambientVolume = document.getElementById('ambient-volume');
  const volumeDisplay = document.getElementById('ambient-volume-display');

  if (ambientSelect) {
    ambientSelect.value = getSetting('ambientSound') || 'none';
    ambientSelect.addEventListener('change', () => {
      const type = ambientSelect.value;
      setSetting('ambientSound', type);
      initSounds();
      if (type === 'none') {
        stopAmbient();
      } else {
        startAmbient(type, getSetting('ambientVolume'));
      }
    });
  }

  if (ambientVolume) {
    const savedVol = Math.round((getSetting('ambientVolume') || 0.3) * 100);
    ambientVolume.value = savedVol;
    if (volumeDisplay) volumeDisplay.textContent = `${savedVol}%`;

    ambientVolume.addEventListener('input', () => {
      const vol = parseInt(ambientVolume.value, 10) / 100;
      if (volumeDisplay) volumeDisplay.textContent = `${ambientVolume.value}%`;
      setSetting('ambientVolume', vol);
      setAmbientVolume(vol);
    });
  }
}

/**
 * Set up font selector dropdown.
 */
function setupFontSelector() {
  const fontSelect = document.getElementById('font-select');
  if (!fontSelect) return;

  fontSelect.value = getSetting('fontFamily') || 'JetBrains Mono';

  fontSelect.addEventListener('change', () => {
    const font = fontSelect.value;
    setSetting('fontFamily', font);
    applyFont(font);
  });
}

/**
 * Apply a font to the typing area.
 * @param {string} fontName
 */
function applyFont(fontName) {
  const wordsDisplay = document.getElementById('words-display');
  if (wordsDisplay) {
    wordsDisplay.style.fontFamily = `'${fontName}', monospace`;
  }
}

function openSettings() {
  document.getElementById('settings-overlay')?.classList.add('visible');
  document.getElementById('settings-panel')?.classList.add('visible');
}

function closeSettings() {
  document.getElementById('settings-overlay')?.classList.remove('visible');
  document.getElementById('settings-panel')?.classList.remove('visible');
}

/**
 * Apply saved settings to UI controls on load.
 */
function applySettingsToUI() {
  const soundToggle = document.getElementById('sound-toggle');
  const strictToggle = document.getElementById('strict-toggle');
  const fontSelect = document.getElementById('font-select');
  const soundTypeSelect = document.getElementById('sound-type-select');
  const ambientSelect = document.getElementById('ambient-select');
  const ambientVolume = document.getElementById('ambient-volume');
  const volumeDisplay = document.getElementById('ambient-volume-display');

  if (soundToggle) soundToggle.checked = getSetting('soundEnabled');
  if (strictToggle) strictToggle.checked = getSetting('strictMode');
  if (fontSelect) fontSelect.value = getSetting('fontFamily') || 'JetBrains Mono';
  if (soundTypeSelect) soundTypeSelect.value = getSetting('soundType') || 'mechanical';
  if (ambientSelect) ambientSelect.value = getSetting('ambientSound') || 'none';

  if (ambientVolume) {
    const vol = Math.round((getSetting('ambientVolume') || 0.3) * 100);
    ambientVolume.value = vol;
    if (volumeDisplay) volumeDisplay.textContent = `${vol}%`;
  }

  updateModeButtonStates();
}
