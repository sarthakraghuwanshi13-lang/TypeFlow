You can reach to the site through: https://sarthakraghuwanshi13-lang.github.io/TypeFlow/
# TypeFlow ⌨️

A modern, minimal typing speed test inspired by Monkeytype — built from scratch with vanilla JavaScript.

![TypeFlow](https://img.shields.io/badge/TypeFlow-Typing%20Speed%20Test-00d4aa?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-ES%20Modules-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)
![CSS3](https://img.shields.io/badge/CSS3-Custom%20Properties-1572B6?style=for-the-badge&logo=css3)

## ✨ Features

- **Real-time typing feedback** — character-by-character highlighting with instant error marking
- **Animated caret** — smooth, blinking cursor that follows your typing
- **Multiple test modes** — Time-based (15s, 30s, 60s) and word-based (10, 25, 50 words)
- **Live stats** — WPM, accuracy, and timer displayed in real-time
- **Performance graph** — WPM over time chart powered by Chart.js
- **Dark & Light themes** — toggle between carefully crafted color schemes
- **Sound effects** — optional keypress and error sounds via Web Audio API
- **Strict mode** — prevents backspacing beyond the current word
- **Result history** — stores past results in localStorage with personal best tracking
- **Keyboard shortcuts** — Tab to restart, Escape to close overlays
- **Responsive design** — works on desktop, tablet, and mobile
- **Zero dependencies** — no npm, no build tools, just open and type

## 🚀 Getting Started

### Option 1: Open Directly
1. Clone or download this repository
2. Open `index.html` in your browser

### Option 2: Live Server
1. Install [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code
2. Right-click `index.html` → "Open with Live Server"

### Option 3: Any HTTP Server
```bash
# Python
python -m http.server 8080

# Node.js
npx serve .
```

## 📂 Project Structure

```
TypeFlow/
├── index.html              # Single-page application entry
├── css/
│   ├── variables.css       # Design tokens & theme definitions
│   ├── base.css            # Reset, typography, layout
│   ├── components.css      # Header, mode selector, settings
│   ├── typing-area.css     # Word display, caret, characters
│   ├── results.css         # Results overlay & stats
│   └── animations.css      # Keyframes & transitions
├── js/
│   ├── app.js              # Main orchestrator
│   ├── engine.js           # Core typing state machine
│   ├── renderer.js         # DOM rendering & caret positioning
│   ├── words.js            # Word list & generators
│   ├── timer.js            # Countdown & stopwatch (rAF-based)
│   ├── stats.js            # WPM, accuracy calculations
│   ├── results.js          # Results screen & Chart.js integration
│   ├── storage.js          # localStorage persistence
│   ├── settings.js         # Settings state management
│   ├── themes.js           # Dark/light theme switching
│   └── sounds.js           # Web Audio API sound effects
├── screenshots/            # Demo screenshots
└── README.md
```

## 🎮 Controls

| Key | Action |
|-----|--------|
| `Tab` | Restart test |
| `Escape` | Close results / settings |
| Start typing | Auto-focus and begin test |

## ⚙️ Settings

- **Sound Effects** — Toggle keypress and error sounds
- **Strict Mode** — Prevents backspacing beyond current word
- **Theme** — Dark (default) or Light

## 🧠 Architecture

The app uses a clean **MVC-inspired modular architecture**:

- **Engine** (`engine.js`) — Pure state management, no DOM access
- **Renderer** (`renderer.js`) — DOM manipulation only, no business logic
- **App** (`app.js`) — Orchestrator that wires engine events to renderer updates

All modules communicate via callbacks and the observer pattern — no global state pollution.

## 🛠 Tech Stack

- **Vanilla JavaScript** (ES Modules)
- **CSS3** (Custom Properties, Flexbox, Grid, Animations)
- **Chart.js** (CDN) — Performance graphing
- **Web Audio API** — Programmatic sound generation
- **Google Fonts** — JetBrains Mono + Inter

## 📊 Metrics Tracked

- **Net WPM** — (correct chars / 5) / minutes
- **Raw WPM** — (total chars / 5) / minutes
- **Accuracy** — correct / total keystrokes × 100
- **Correct / Incorrect characters**
- **WPM over time** — sampled every second for graphing

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Made with ⌨️ and ☕
