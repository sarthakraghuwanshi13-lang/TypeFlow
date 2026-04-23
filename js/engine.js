/* ============================================
   TypeFlow — Core Typing Engine
   ============================================ */

import { generateWords, generateTimedWords } from './words.js';
import { CountdownTimer, Stopwatch } from './timer.js';
import { StatsTracker } from './stats.js';
import { getSetting } from './settings.js';
import { playKeyClick, playError } from './sounds.js';

/**
 * Core typing engine — manages all test state and input processing.
 * Emits events for the renderer to consume.
 */
export class TypingEngine {
  constructor() {
    this.words = [];
    this.currentWordIndex = 0;
    this.currentCharIndex = 0;
    this.typedHistory = [];     // Array of arrays: typed chars per word
    this.wordStatuses = [];     // 'pending' | 'correct' | 'incorrect'

    this.started = false;
    this.finished = false;

    this.mode = 'time';         // 'time' or 'words'
    this.modeValue = 30;

    this.timer = null;
    this.stats = new StatsTracker();

    // Callbacks
    this.onCharUpdate = null;   // (wordIdx, charIdx, state)
    this.onWordAdvance = null;  // (newWordIdx, prevWordIdx)
    this.onExtraChar = null;    // (wordIdx, char)
    this.onRemoveExtra = null;  // (wordIdx)
    this.onCaretUpdate = null;  // (wordIdx, charIdx)
    this.onStatsUpdate = null;  // (wpm, accuracy, time)
    this.onTestEnd = null;      // (finalStats)
    this.onWordError = null;    // (wordIdx)
    this.onTimerTick = null;    // (display value)
  }

  /**
   * Initialize a new test.
   * @param {string} mode - 'time' or 'words'
   * @param {number} value - seconds or word count
   */
  initTest(mode, value) {
    this.mode = mode;
    this.modeValue = value;
    this.currentWordIndex = 0;
    this.currentCharIndex = 0;
    this.typedHistory = [];
    this.wordStatuses = [];
    this.started = false;
    this.finished = false;
    this.stats.reset();

    // Stop any existing timer
    if (this.timer) {
      this.timer.stop();
      this.timer = null;
    }

    // Generate words
    if (mode === 'time') {
      this.words = generateTimedWords();
    } else {
      this.words = generateWords(value);
    }

    // Initialize typed history for each word
    this.words.forEach(() => {
      this.typedHistory.push([]);
      this.wordStatuses.push('pending');
    });

    // Set up timer
    if (mode === 'time') {
      this.timer = new CountdownTimer(
        value,
        (remaining, elapsed) => this._onTimerTick(remaining, elapsed),
        () => this._endTest()
      );
    } else {
      this.timer = new Stopwatch(
        (elapsed) => this._onTimerTick(null, elapsed)
      );
    }
  }

  /**
   * Process a character input event.
   * Called on every keystroke from the hidden input.
   * @param {string} inputValue - Current value of the input field
   * @param {InputEvent} event - The input event
   */
  handleInput(inputValue, event) {
    if (this.finished) return;

    const inputType = event.inputType;

    // Start test on first input
    if (!this.started) {
      this.started = true;
      this.timer.start();
    }

    const currentWord = this.words[this.currentWordIndex];
    const strictMode = getSetting('strictMode');

    if (inputType === 'insertText' && event.data === ' ') {
      // ---- SPACE: advance to next word ----
      this._advanceWord();
      return 'clear';
    }

    if (inputType === 'deleteContentBackward') {
      // ---- BACKSPACE ----
      if (this.currentCharIndex > 0) {
        // Check for extra chars first
        const extras = this.currentCharIndex - currentWord.length;
        if (extras > 0) {
          // Remove an extra character
          this.currentCharIndex--;
          this.typedHistory[this.currentWordIndex].pop();
          if (this.onRemoveExtra) this.onRemoveExtra(this.currentWordIndex);
        } else {
          // Remove a regular character
          this.currentCharIndex--;
          this.typedHistory[this.currentWordIndex].pop();
          if (this.onCharUpdate) {
            this.onCharUpdate(this.currentWordIndex, this.currentCharIndex, 'default');
          }
        }
        if (this.onCaretUpdate) {
          this.onCaretUpdate(this.currentWordIndex, this.currentCharIndex);
        }
        playKeyClick();
      } else if (!strictMode && this.currentWordIndex > 0) {
        // Go back to previous word (only if it was incorrect and not in strict mode)
        const prevIdx = this.currentWordIndex - 1;
        if (this.wordStatuses[prevIdx] === 'incorrect') {
          this._goBackWord();
          return 'restore';
        }
      }
      return null;
    }

    if (inputType === 'insertText' && event.data) {
      // ---- CHARACTER INPUT ----
      const typedChar = event.data;

      if (this.currentCharIndex < currentWord.length) {
        // Typing within word length
        const expectedChar = currentWord[this.currentCharIndex];
        const isCorrect = typedChar === expectedChar;

        this.typedHistory[this.currentWordIndex].push(typedChar);
        this.stats.recordKeystroke(isCorrect);

        if (this.onCharUpdate) {
          this.onCharUpdate(
            this.currentWordIndex,
            this.currentCharIndex,
            isCorrect ? 'correct' : 'incorrect'
          );
        }

        if (isCorrect) {
          playKeyClick();
        } else {
          playError();
        }

        this.currentCharIndex++;
      } else {
        // Extra character beyond word length
        if (!strictMode) {
          this.typedHistory[this.currentWordIndex].push(typedChar);
          this.stats.recordExtra(1);
          this.currentCharIndex++;
          if (this.onExtraChar) this.onExtraChar(this.currentWordIndex, typedChar);
          playError();
        }
      }

      if (this.onCaretUpdate) {
        this.onCaretUpdate(this.currentWordIndex, this.currentCharIndex);
      }

      // Take stats snapshot
      if (this.timer) {
        this.stats.maybeSnapshot(this.timer.getElapsed());
      }

      return null;
    }

    return null;
  }

  /**
   * Advance to the next word.
   */
  _advanceWord() {
    const currentWord = this.words[this.currentWordIndex];
    const typed = this.typedHistory[this.currentWordIndex];

    // Determine if word was typed correctly
    let wordCorrect = true;
    if (typed.length !== currentWord.length) {
      wordCorrect = false;
    } else {
      for (let i = 0; i < currentWord.length; i++) {
        if (typed[i] !== currentWord[i]) {
          wordCorrect = false;
          break;
        }
      }
    }

    // Record missed characters
    if (typed.length < currentWord.length) {
      this.stats.recordMissed(currentWord.length - typed.length);
    }

    this.wordStatuses[this.currentWordIndex] = wordCorrect ? 'correct' : 'incorrect';

    if (!wordCorrect && this.onWordError) {
      this.onWordError(this.currentWordIndex);
    }

    playKeyClick();

    const prevWordIdx = this.currentWordIndex;
    this.currentWordIndex++;
    this.currentCharIndex = 0;

    // Check if test is complete (word mode)
    if (this.mode === 'words' && this.currentWordIndex >= this.words.length) {
      this._endTest();
      return;
    }

    // Check if we need more words (time mode, approaching end of pool)
    if (this.mode === 'time' && this.currentWordIndex >= this.words.length - 20) {
      const moreWords = generateWords(100);
      this.words.push(...moreWords);
      moreWords.forEach(() => {
        this.typedHistory.push([]);
        this.wordStatuses.push('pending');
      });
      // Signal that new words need rendering
      if (this.onNewWords) this.onNewWords(this.words);
    }

    if (this.onWordAdvance) {
      this.onWordAdvance(this.currentWordIndex, prevWordIdx);
    }
    if (this.onCaretUpdate) {
      this.onCaretUpdate(this.currentWordIndex, 0);
    }
  }

  /**
   * Go back to the previous word.
   */
  _goBackWord() {
    const prevIdx = this.currentWordIndex - 1;
    const prevWordIdx = this.currentWordIndex;

    this.currentWordIndex = prevIdx;
    this.currentCharIndex = this.typedHistory[prevIdx].length;
    this.wordStatuses[prevIdx] = 'pending';

    if (this.onWordAdvance) {
      this.onWordAdvance(this.currentWordIndex, prevWordIdx);
    }
    if (this.onCaretUpdate) {
      this.onCaretUpdate(this.currentWordIndex, this.currentCharIndex);
    }
  }

  /**
   * Timer tick callback.
   */
  _onTimerTick(remaining, elapsed) {
    const wpm = this.stats.totalCorrect > 0
      ? Math.round((this.stats.totalCorrect / 5) / (elapsed / 60))
      : 0;
    const accuracy = this.stats.totalKeystrokes > 0
      ? Math.round((this.stats.totalCorrect / this.stats.totalKeystrokes) * 100)
      : 100;

    this.stats.maybeSnapshot(elapsed);

    if (this.onStatsUpdate) {
      if (this.mode === 'time') {
        this.onStatsUpdate(wpm, accuracy, Math.ceil(remaining));
      } else {
        this.onStatsUpdate(wpm, accuracy, Math.round(elapsed));
      }
    }

    if (this.onTimerTick) {
      if (this.mode === 'time') {
        this.onTimerTick(Math.ceil(remaining));
      } else {
        this.onTimerTick(Math.round(elapsed));
      }
    }
  }

  /**
   * End the test and calculate final stats.
   */
  _endTest() {
    if (this.finished) return;
    this.finished = true;

    if (this.timer) {
      const elapsed = this.timer.getElapsed();
      this.timer.stop();

      const finalStats = this.stats.getFinalStats(elapsed);
      finalStats.mode = `${this.mode}-${this.modeValue}`;
      finalStats.wordsTyped = this.currentWordIndex;

      if (this.onTestEnd) {
        this.onTestEnd(finalStats);
      }
    }
  }

  /**
   * Force end the test early.
   */
  forceEnd() {
    if (this.started && !this.finished) {
      this._endTest();
    }
  }

  /**
   * Get the restoration string for going back to previous word.
   */
  getRestorationValue() {
    return this.typedHistory[this.currentWordIndex].join('');
  }
}
