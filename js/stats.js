/* ============================================
   TypeFlow — Statistics Module
   ============================================ */

/**
 * Calculate net WPM (words per minute).
 * Standard: 1 word = 5 characters.
 * @param {number} correctChars - Number of correctly typed characters
 * @param {number} elapsedSeconds - Time elapsed in seconds
 * @returns {number} WPM rounded to nearest integer
 */
export function calculateWPM(correctChars, elapsedSeconds) {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.round((correctChars / 5) / minutes);
}

/**
 * Calculate raw WPM (including incorrect characters).
 * @param {number} totalChars - Total characters typed
 * @param {number} elapsedSeconds - Time elapsed
 * @returns {number} Raw WPM
 */
export function calculateRawWPM(totalChars, elapsedSeconds) {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.round((totalChars / 5) / minutes);
}

/**
 * Calculate typing accuracy as a percentage.
 * @param {number} correctChars - Correctly typed characters
 * @param {number} totalChars - Total characters typed
 * @returns {number} Accuracy percentage (0-100)
 */
export function calculateAccuracy(correctChars, totalChars) {
  if (totalChars <= 0) return 100;
  return Math.round((correctChars / totalChars) * 100);
}

/**
 * Snapshot manager — records WPM at regular intervals for graphing.
 */
export class StatsTracker {
  constructor() {
    this.snapshots = [];        // { time, wpm, rawWpm, errors }
    this.totalCorrect = 0;
    this.totalIncorrect = 0;
    this.totalExtra = 0;
    this.totalMissed = 0;
    this.totalKeystrokes = 0;
    this.lastSnapshotTime = 0;
    this.snapshotInterval = 1;  // seconds
  }

  /**
   * Record a keystroke result.
   * @param {boolean} isCorrect
   */
  recordKeystroke(isCorrect) {
    this.totalKeystrokes++;
    if (isCorrect) {
      this.totalCorrect++;
    } else {
      this.totalIncorrect++;
    }
  }

  /**
   * Record extra characters typed beyond word length.
   * @param {number} count
   */
  recordExtra(count) {
    this.totalExtra += count;
    this.totalIncorrect += count;
    this.totalKeystrokes += count;
  }

  /**
   * Record missed (untyped) characters in a word.
   * @param {number} count
   */
  recordMissed(count) {
    this.totalMissed += count;
  }

  /**
   * Take a WPM snapshot if enough time has elapsed.
   * @param {number} elapsedSeconds
   */
  maybeSnapshot(elapsedSeconds) {
    if (elapsedSeconds - this.lastSnapshotTime >= this.snapshotInterval) {
      this.snapshots.push({
        time: Math.round(elapsedSeconds),
        wpm: calculateWPM(this.totalCorrect, elapsedSeconds),
        rawWpm: calculateRawWPM(this.totalKeystrokes, elapsedSeconds),
        errors: this.totalIncorrect
      });
      this.lastSnapshotTime = elapsedSeconds;
    }
  }

  /**
   * Get final results summary.
   * @param {number} elapsedSeconds
   * @returns {Object} Complete stats object
   */
  getFinalStats(elapsedSeconds) {
    // Take final snapshot
    this.snapshots.push({
      time: Math.round(elapsedSeconds),
      wpm: calculateWPM(this.totalCorrect, elapsedSeconds),
      rawWpm: calculateRawWPM(this.totalKeystrokes, elapsedSeconds),
      errors: this.totalIncorrect
    });

    return {
      wpm: calculateWPM(this.totalCorrect, elapsedSeconds),
      rawWpm: calculateRawWPM(this.totalKeystrokes, elapsedSeconds),
      accuracy: calculateAccuracy(this.totalCorrect, this.totalKeystrokes),
      correctChars: this.totalCorrect,
      incorrectChars: this.totalIncorrect,
      extraChars: this.totalExtra,
      missedChars: this.totalMissed,
      totalChars: this.totalKeystrokes,
      time: Math.round(elapsedSeconds * 10) / 10,
      snapshots: [...this.snapshots]
    };
  }

  /**
   * Reset all stats for a new test.
   */
  reset() {
    this.snapshots = [];
    this.totalCorrect = 0;
    this.totalIncorrect = 0;
    this.totalExtra = 0;
    this.totalMissed = 0;
    this.totalKeystrokes = 0;
    this.lastSnapshotTime = 0;
  }
}
