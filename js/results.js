/* ============================================
   TypeFlow — Results Module
   (Monkeytype-inspired: WPM/acc left, chart right, stats bottom)
   ============================================ */

import { saveResult, getHistory, isPersonalBest } from './storage.js';

let chartInstance = null;

/**
 * Calculate consistency (inverse of WPM standard deviation).
 * @param {Object[]} snapshots
 * @returns {number} Consistency percentage (0-100)
 */
function calculateConsistency(snapshots) {
  if (snapshots.length < 2) return 100;
  const wpmValues = snapshots.map(s => s.wpm);
  const mean = wpmValues.reduce((a, b) => a + b, 0) / wpmValues.length;
  const variance = wpmValues.reduce((sum, v) => sum + (v - mean) ** 2, 0) / wpmValues.length;
  const stdDev = Math.sqrt(variance);
  // Convert to percentage: lower stdDev = higher consistency
  const consistency = Math.max(0, Math.round(100 - (stdDev / Math.max(mean, 1)) * 100));
  return consistency;
}

/**
 * Show the results overlay with stats and chart.
 * @param {Object} stats - Final stats from the engine
 */
export function showResults(stats) {
  const overlay = document.getElementById('results-overlay');
  if (!overlay) return;

  const isPB = isPersonalBest(stats.wpm, stats.mode);
  const consistency = calculateConsistency(stats.snapshots);

  // Add consistency to stats before saving
  stats.consistency = consistency;
  saveResult(stats);

  // Hero values: WPM and Accuracy
  document.getElementById('result-wpm').textContent = stats.wpm;
  document.getElementById('result-accuracy').textContent = `${stats.accuracy}%`;

  // PB badge
  const pbBadge = document.getElementById('pb-badge');
  if (pbBadge) pbBadge.style.display = isPB ? 'inline-block' : 'none';

  // Detail row values
  const modeParts = stats.mode.split('-');
  const modeLabel = modeParts[0] === 'time' ? 'time' : 'words';
  const modeVal = modeParts[0] === 'time' ? `${modeParts[1]}s` : `${modeParts[1]}`;

  document.getElementById('result-test-type').textContent = `${modeLabel} ${modeVal}`;
  document.getElementById('result-raw-wpm').textContent = stats.rawWpm;
  document.getElementById('result-characters').textContent =
    `${stats.correctChars}/${stats.incorrectChars}/${stats.extraChars}/${stats.missedChars}`;
  document.getElementById('result-consistency').textContent = `${consistency}%`;
  document.getElementById('result-time').textContent = `${stats.time}s`;

  // Set animation delays for detail items
  const details = overlay.querySelectorAll('.result-detail');
  details.forEach((d, i) => {
    d.style.setProperty('--delay', `${0.15 + i * 0.06}s`);
  });

  // Render chart
  renderChart(stats.snapshots);

  // Show overlay
  overlay.classList.add('visible');
}

/**
 * Hide the results overlay.
 */
export function hideResults() {
  const overlay = document.getElementById('results-overlay');
  if (overlay) overlay.classList.remove('visible');
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
}

/**
 * Render a dual-axis chart: WPM + Raw WPM (left axis), Errors (right axis).
 * Matches Monkeytype style: yellow WPM line, gray raw line, red error points.
 */
function renderChart(snapshots) {
  const canvas = document.getElementById('wpm-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  if (chartInstance) chartInstance.destroy();

  const ctx = canvas.getContext('2d');
  const style = getComputedStyle(document.documentElement);
  const wpmColor = style.getPropertyValue('--chart-wpm').trim() || '#e8b931';
  const rawColor = style.getPropertyValue('--chart-raw').trim() || '#8a8a9a';
  const errorColor = style.getPropertyValue('--chart-error').trim() || '#f4587a';
  const textDim = style.getPropertyValue('--text-dim').trim();
  const bgSurface = style.getPropertyValue('--bg-surface').trim();

  const labels = snapshots.map(s => s.time);
  const wpmData = snapshots.map(s => s.wpm);
  const rawData = snapshots.map(s => s.rawWpm);

  // Calculate per-second errors (difference from previous snapshot)
  const errorData = snapshots.map((s, i) => {
    if (i === 0) return s.errors;
    return Math.max(0, s.errors - snapshots[i - 1].errors);
  });

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'wpm',
          data: wpmData,
          borderColor: wpmColor,
          backgroundColor: wpmColor + '15',
          borderWidth: 2.5,
          pointRadius: 2,
          pointHoverRadius: 5,
          pointBackgroundColor: wpmColor,
          fill: false,
          tension: 0.3,
          yAxisID: 'y'
        },
        {
          label: 'raw',
          data: rawData,
          borderColor: rawColor,
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false,
          tension: 0.3,
          yAxisID: 'y'
        },
        {
          label: 'errors',
          data: errorData,
          borderColor: 'transparent',
          backgroundColor: errorColor,
          borderWidth: 0,
          pointRadius: errorData.map(e => e > 0 ? 5 : 0),
          pointStyle: 'rectRot',
          pointBackgroundColor: errorColor,
          pointBorderColor: errorColor,
          fill: false,
          showLine: false,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            color: textDim,
            font: { family: "'JetBrains Mono', monospace", size: 10 },
            boxWidth: 10,
            padding: 12,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: bgSurface,
          titleColor: textDim,
          bodyColor: textDim,
          borderColor: wpmColor + '30',
          borderWidth: 1,
          titleFont: { family: "'JetBrains Mono', monospace", size: 11 },
          bodyFont: { family: "'JetBrains Mono', monospace", size: 11 },
          padding: 10,
          cornerRadius: 6
        }
      },
      scales: {
        x: {
          grid: { color: textDim + '12' },
          ticks: {
            color: textDim,
            font: { family: "'JetBrains Mono', monospace", size: 10 },
            maxTicksLimit: 15
          },
          title: {
            display: false
          }
        },
        y: {
          position: 'left',
          beginAtZero: true,
          grid: { color: textDim + '12' },
          ticks: {
            color: textDim,
            font: { family: "'JetBrains Mono', monospace", size: 10 }
          },
          title: {
            display: true,
            text: 'Words per Minute',
            color: textDim,
            font: { family: "'JetBrains Mono', monospace", size: 10 }
          }
        },
        y1: {
          position: 'right',
          beginAtZero: true,
          grid: { drawOnChartArea: false },
          ticks: {
            color: errorColor,
            font: { family: "'JetBrains Mono', monospace", size: 10 },
            stepSize: 1
          },
          title: {
            display: true,
            text: 'Errors',
            color: errorColor,
            font: { family: "'JetBrains Mono', monospace", size: 10 }
          }
        }
      }
    }
  });
}
