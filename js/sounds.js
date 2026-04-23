/* ============================================
   TypeFlow — Sound Module
   Multiple typing sounds + ambient backgrounds
   ============================================ */

import { getSetting } from './settings.js';

let audioCtx = null;
let initialized = false;

// ---- Typing sound buffers (keyed by sound type) ----
const soundBuffers = {};

// ---- Ambient sound state ----
let ambientType = 'none';

// ============================
// INITIALIZATION
// ============================

/**
 * Initialize the Web Audio context.
 * Must be called after a user gesture.
 */
export function initSounds() {
  if (initialized) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // Pre-generate all sound type buffers
    generateAllSoundBuffers();
    initialized = true;
  } catch (e) {
    console.warn('TypeFlow: Web Audio not available', e);
  }
}

/**
 * Ensure audio context is resumed (needed after user gesture).
 */
function ensureResumed() {
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// ============================
// TYPING SOUND GENERATION
// ============================

function generateAllSoundBuffers() {
  soundBuffers['mechanical'] = {
    click: createMechanicalClick(),
    error: createMechanicalError()
  };
  soundBuffers['soft'] = {
    click: createSoftClick(),
    error: createSoftError()
  };
  soundBuffers['clicky'] = {
    click: createClickyClick(),
    error: createClickyError()
  };
  soundBuffers['typewriter'] = {
    click: createTypewriterClick(),
    error: createTypewriterError()
  };
}

// ---- Mechanical Keyboard ----
function createMechanicalClick() {
  const sr = audioCtx.sampleRate;
  const dur = 0.045;
  const len = Math.floor(sr * dur);
  const buf = audioCtx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const env = Math.exp(-t * 140);
    d[i] = env * (
      Math.sin(2 * Math.PI * 900 * t) * 0.25 +
      Math.sin(2 * Math.PI * 2200 * t) * 0.15 +
      Math.sin(2 * Math.PI * 4500 * t) * 0.08 +
      (Math.random() * 2 - 1) * 0.2
    );
  }
  return buf;
}

function createMechanicalError() {
  const sr = audioCtx.sampleRate;
  const dur = 0.07;
  const len = Math.floor(sr * dur);
  const buf = audioCtx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const env = Math.exp(-t * 70);
    d[i] = env * (
      Math.sin(2 * Math.PI * 220 * t) * 0.35 +
      Math.sin(2 * Math.PI * 440 * t) * 0.15 +
      (Math.random() * 2 - 1) * 0.2
    );
  }
  return buf;
}

// ---- Soft Keyboard ----
function createSoftClick() {
  const sr = audioCtx.sampleRate;
  const dur = 0.03;
  const len = Math.floor(sr * dur);
  const buf = audioCtx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const env = Math.exp(-t * 200);
    d[i] = env * (
      Math.sin(2 * Math.PI * 600 * t) * 0.15 +
      Math.sin(2 * Math.PI * 1200 * t) * 0.08 +
      (Math.random() * 2 - 1) * 0.05
    );
  }
  return buf;
}

function createSoftError() {
  const sr = audioCtx.sampleRate;
  const dur = 0.05;
  const len = Math.floor(sr * dur);
  const buf = audioCtx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const env = Math.exp(-t * 100);
    d[i] = env * (
      Math.sin(2 * Math.PI * 180 * t) * 0.2 +
      (Math.random() * 2 - 1) * 0.08
    );
  }
  return buf;
}

// ---- Clicky ----
function createClickyClick() {
  const sr = audioCtx.sampleRate;
  const dur = 0.025;
  const len = Math.floor(sr * dur);
  const buf = audioCtx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const env = Math.exp(-t * 250);
    d[i] = env * (
      Math.sin(2 * Math.PI * 3000 * t) * 0.3 +
      Math.sin(2 * Math.PI * 5000 * t) * 0.15 +
      Math.sin(2 * Math.PI * 7000 * t) * 0.05 +
      (Math.random() * 2 - 1) * 0.1
    );
  }
  return buf;
}

function createClickyError() {
  const sr = audioCtx.sampleRate;
  const dur = 0.06;
  const len = Math.floor(sr * dur);
  const buf = audioCtx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const env = Math.exp(-t * 90);
    d[i] = env * (
      Math.sin(2 * Math.PI * 250 * t) * 0.3 +
      Math.sin(2 * Math.PI * 500 * t) * 0.15 +
      (Math.random() * 2 - 1) * 0.15
    );
  }
  return buf;
}

// ---- Typewriter ----
function createTypewriterClick() {
  const sr = audioCtx.sampleRate;
  const dur = 0.06;
  const len = Math.floor(sr * dur);
  const buf = audioCtx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    // Initial sharp impact
    const impact = Math.exp(-t * 300) * 0.4;
    // Follow-through metallic ring
    const ring = Math.exp(-t * 80) * Math.sin(2 * Math.PI * 1800 * t) * 0.12;
    // Mechanical rattle
    const rattle = Math.exp(-t * 60) * (Math.random() * 2 - 1) * 0.08;
    d[i] = impact + ring + rattle;
  }
  return buf;
}

function createTypewriterError() {
  const sr = audioCtx.sampleRate;
  const dur = 0.1;
  const len = Math.floor(sr * dur);
  const buf = audioCtx.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const t = i / sr;
    const env = Math.exp(-t * 50);
    d[i] = env * (
      Math.sin(2 * Math.PI * 150 * t) * 0.3 +
      Math.sin(2 * Math.PI * 300 * t * (1 + t * 2)) * 0.15 +
      (Math.random() * 2 - 1) * 0.15
    );
  }
  return buf;
}

// ============================
// TYPING SOUND PLAYBACK
// ============================

/**
 * Play a buffer with low latency.
 */
function playBuffer(buffer, volume = 0.3) {
  if (!audioCtx || !buffer) return;
  ensureResumed();
  const source = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();
  gain.gain.value = volume;
  source.buffer = buffer;
  source.connect(gain);
  gain.connect(audioCtx.destination);
  source.start(0);
}

/**
 * Play the key click sound.
 */
export function playKeyClick() {
  if (!getSetting('soundEnabled')) return;
  if (!initialized) initSounds();
  const type = getSetting('soundType') || 'mechanical';
  const buffers = soundBuffers[type];
  if (buffers) playBuffer(buffers.click, 0.35);
}

/**
 * Play the error sound.
 */
export function playError() {
  if (!getSetting('soundEnabled')) return;
  if (!initialized) initSounds();
  const type = getSetting('soundType') || 'mechanical';
  const buffers = soundBuffers[type];
  if (buffers) playBuffer(buffers.error, 0.3);
}

// ============================
// AMBIENT SOUND ENGINE
// Uses real MP3 files from sounds/ folder
// ============================

// Map ambient types to file paths
const AMBIENT_FILES = {
  ocean: 'sounds/ocean.mp3',
  rain: 'sounds/rain.mp3',
  whitenoise: 'sounds/whitenoise.mp3'
};

let ambientAudio = null;

/**
 * Start ambient sound using real MP3 files.
 * @param {string} type - 'ocean', 'rain', 'whitenoise', or 'none'
 * @param {number} volume - 0 to 1
 */
export function startAmbient(type, volume = 0.3) {
  // Stop any existing ambient
  stopAmbient();

  if (type === 'none' || !type) {
    ambientType = 'none';
    return;
  }

  const filePath = AMBIENT_FILES[type];
  if (!filePath) return;

  ambientType = type;

  // Create audio element for smooth looping
  ambientAudio = new Audio(filePath);
  ambientAudio.loop = true;
  ambientAudio.volume = volume;
  ambientAudio.preload = 'auto';

  // Play with user gesture handling
  const playPromise = ambientAudio.play();
  if (playPromise) {
    playPromise.catch(e => {
      console.warn('TypeFlow: Ambient playback requires user interaction', e);
    });
  }
}

/**
 * Stop ambient sound.
 */
export function stopAmbient() {
  if (ambientAudio) {
    ambientAudio.pause();
    ambientAudio.currentTime = 0;
    ambientAudio.src = '';
    ambientAudio = null;
  }
  ambientType = 'none';
}

/**
 * Update ambient volume.
 * @param {number} volume - 0 to 1
 */
export function setAmbientVolume(volume) {
  if (ambientAudio) {
    ambientAudio.volume = Math.max(0, Math.min(1, volume));
  }
}

/**
 * Get current ambient type.
 */
export function getAmbientType() {
  return ambientType;
}



