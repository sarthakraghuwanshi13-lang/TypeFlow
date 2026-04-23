/* ============================================
   TypeFlow — Renderer Module
   ============================================ */

/**
 * Handles all DOM manipulation for the typing display.
 * Separated from engine logic for clean architecture.
 */

const LINE_SCROLL_THRESHOLD = 2; // scroll after typing past this many lines

export class Renderer {
  constructor(containerEl, caretEl) {
    this.container = containerEl;
    this.caret = caretEl;
    this.wordElements = [];
    this.scrollOffset = 0;
    this.lineHeight = 0;
    this.firstLineTop = 0;
  }

  /**
   * Render all words into the display container.
   * @param {string[]} words - Array of words to display
   */
  renderWords(words) {
    this.container.innerHTML = '';
    this.wordElements = [];
    this.scrollOffset = 0;
    this.container.style.transform = 'translateY(0)';

    const fragment = document.createDocumentFragment();
    words.forEach((word, wIdx) => {
      const wordEl = document.createElement('div');
      wordEl.className = 'word';
      wordEl.dataset.index = wIdx;

      const charEls = [];
      for (let cIdx = 0; cIdx < word.length; cIdx++) {
        const charEl = document.createElement('span');
        charEl.className = 'char';
        charEl.textContent = word[cIdx];
        charEl.dataset.index = cIdx;
        wordEl.appendChild(charEl);
        charEls.push(charEl);
      }

      fragment.appendChild(wordEl);
      this.wordElements.push({ el: wordEl, charEls, extras: [] });
    });

    this.container.appendChild(fragment);

    // Calculate line height from rendered elements
    if (this.wordElements.length > 0) {
      this.firstLineTop = this.wordElements[0].el.offsetTop;
      this.lineHeight = this.wordElements[0].el.offsetHeight;
    }
  }

  /**
   * Highlight the current word.
   * @param {number} wordIdx
   * @param {number|null} prevWordIdx
   */
  setCurrentWord(wordIdx, prevWordIdx = null) {
    if (prevWordIdx !== null && this.wordElements[prevWordIdx]) {
      this.wordElements[prevWordIdx].el.classList.remove('current');
    }
    if (this.wordElements[wordIdx]) {
      this.wordElements[wordIdx].el.classList.add('current');
    }
  }

  /**
   * Mark a word as having errors (incorrect completion).
   * @param {number} wordIdx
   */
  markWordError(wordIdx) {
    if (this.wordElements[wordIdx]) {
      this.wordElements[wordIdx].el.classList.add('error-word');
    }
  }

  /**
   * Update a character's visual state.
   * @param {number} wordIdx
   * @param {number} charIdx
   * @param {'correct'|'incorrect'|'default'} state
   */
  updateChar(wordIdx, charIdx, state) {
    const word = this.wordElements[wordIdx];
    if (!word || !word.charEls[charIdx]) return;

    const el = word.charEls[charIdx];
    el.classList.remove('correct', 'incorrect');
    if (state !== 'default') {
      el.classList.add(state);
    }
  }

  /**
   * Add extra (overflow) characters to a word.
   * @param {number} wordIdx
   * @param {string} char
   */
  addExtraChar(wordIdx, char) {
    const word = this.wordElements[wordIdx];
    if (!word) return;

    const extraEl = document.createElement('span');
    extraEl.className = 'char extra incorrect';
    extraEl.textContent = char;
    word.el.appendChild(extraEl);
    word.extras.push(extraEl);
  }

  /**
   * Remove the last extra character from a word.
   * @param {number} wordIdx
   */
  removeLastExtra(wordIdx) {
    const word = this.wordElements[wordIdx];
    if (!word || word.extras.length === 0) return;

    const lastExtra = word.extras.pop();
    lastExtra.remove();
  }

  /**
   * Position the caret at the correct location.
   * @param {number} wordIdx - Current word index
   * @param {number} charIdx - Current character index within the word
   */
  updateCaret(wordIdx, charIdx) {
    const word = this.wordElements[wordIdx];
    if (!word) return;

    let left, top;
    const totalChars = word.charEls.length + word.extras.length;

    if (charIdx === 0) {
      // Beginning of word
      const firstChar = word.charEls[0];
      if (!firstChar) return;
      const rect = firstChar.getBoundingClientRect();
      const containerRect = this.container.getBoundingClientRect();
      left = rect.left - containerRect.left;
      top = rect.top - containerRect.top;
    } else if (charIdx <= word.charEls.length) {
      // Within the original word characters
      const targetChar = word.charEls[charIdx - 1];
      if (!targetChar) return;
      const rect = targetChar.getBoundingClientRect();
      const containerRect = this.container.getBoundingClientRect();
      left = rect.right - containerRect.left;
      top = rect.top - containerRect.top;
    } else {
      // In extra characters
      const extraIdx = charIdx - word.charEls.length - 1;
      const targetExtra = word.extras[extraIdx];
      if (targetExtra) {
        const rect = targetExtra.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        left = rect.right - containerRect.left;
        top = rect.top - containerRect.top;
      } else if (word.extras.length > 0) {
        const lastExtra = word.extras[word.extras.length - 1];
        const rect = lastExtra.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        left = rect.right - containerRect.left;
        top = rect.top - containerRect.top;
      }
    }

    if (left !== undefined) {
      this.caret.style.left = `${left}px`;
      this.caret.style.top = `${top}px`;
    }

    // Handle line scrolling
    this._handleScroll(wordIdx);
  }

  /**
   * Smooth scroll when typing moves past visible lines.
   */
  _handleScroll(wordIdx) {
    const word = this.wordElements[wordIdx];
    if (!word || !this.lineHeight) return;

    const wordTop = word.el.offsetTop;
    const currentLine = Math.floor((wordTop - this.firstLineTop) / this.lineHeight);

    if (currentLine >= LINE_SCROLL_THRESHOLD) {
      const targetOffset = (currentLine - LINE_SCROLL_THRESHOLD + 1) * this.lineHeight;
      if (targetOffset !== this.scrollOffset) {
        this.scrollOffset = targetOffset;
        this.container.style.transform = `translateY(-${this.scrollOffset}px)`;
      }
    }
  }

  /**
   * Set caret to typing (non-blinking) mode.
   */
  setCaretTyping(isTyping) {
    if (isTyping) {
      this.caret.classList.add('typing');
      // Resume blink after 500ms of no typing
      clearTimeout(this._blinkTimeout);
      this._blinkTimeout = setTimeout(() => {
        this.caret.classList.remove('typing');
      }, 500);
    }
  }

  /**
   * Show or hide the caret.
   * @param {boolean} visible
   */
  showCaret(visible) {
    this.caret.style.display = visible ? 'block' : 'none';
  }

  /**
   * Set blur state on the display (when input loses focus).
   * @param {boolean} blurred
   */
  setBlurred(blurred) {
    this.container.classList.toggle('blurred', blurred);
    this.showCaret(!blurred);
  }

  /**
   * Reset the display completely.
   */
  reset() {
    this.container.innerHTML = '';
    this.wordElements = [];
    this.scrollOffset = 0;
    this.container.style.transform = 'translateY(0)';
    this.showCaret(true);
    this.setBlurred(false);
  }
}
