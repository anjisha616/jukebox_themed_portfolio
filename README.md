# 🎵 Anjisha's Jukebox Portfolio

A 1950s Wurlitzer-style interactive jukebox portfolio website built with pure HTML, CSS, and JavaScript.

## ✨ Features

- **Authentic Jukebox Design** — Wurlitzer 1015-inspired aesthetic with chrome accents, neon lighting, and bubble tubes
- **Interactive Turntable** — Spinning vinyl record with tonearm animation
- **Sound Effects** — All sounds synthesized with Web Audio API (no external files needed)
- **Background Music** — Procedurally generated 1950s-style swing music
- **GitHub Integration** — Live repo data, contribution heatmap, and project stats
- **Keyboard Navigation** — Letter + Number combos (A1, B2, etc.), arrow keys, and Escape
- **Responsive Design** — Desktop, tablet, and mobile layouts
- **Easter Eggs** — Konami code, theme switcher, and more
- **Accessibility** — ARIA labels, screen reader support, high contrast mode, skip links

## 🎸 Sections

| Code | Section | Description |
|------|---------|-------------|
| A1 | About Me | Bio, photo, social links |
| A2 | Skills | Technical & soft skills with progress bars |
| A3 | Experience | Timeline of current activities |
| A4 | Certifications | Coming soon placeholder |
| B1 | Projects | GitHub repos + Figma projects grid |
| B2 | Proof of Work | GitHub stats & contribution heatmap |
| B3 | Contact | Links + contact form |
| B4 | ??? | Easter egg section |
| C-H | Projects | Individual GitHub project details |

## 🚀 Getting Started

1. Clone the repository
2. Open `index.html` in a browser (or use a local server)
3. Click/tap to insert the coin and start exploring!

```bash
# Simple local server options:
python3 -m http.server 8000
# or
npx serve .
```

## 🛠 Tech Stack

- **HTML5** — Semantic markup with ARIA attributes
- **CSS3** — Custom properties, Grid, Flexbox, keyframe animations
- **JavaScript (ES6+)** — Modules pattern, Web Audio API, Fetch API
- **No frameworks or libraries** — 100% vanilla

## 📂 File Structure

```
/
├── index.html               # Main HTML document
├── styles/
│   ├── main.css             # Reset, typography, utilities
│   ├── jukebox.css          # All jukebox component styles
│   ├── animations.css       # CSS keyframe animations
│   └── responsive.css       # Breakpoints & mobile styles
├── scripts/
│   ├── app.js               # Main controller & navigation
│   ├── audio.js             # Web Audio API sound manager
│   ├── github-api.js        # GitHub API integration
│   └── animations.js        # JS animation controllers
├── assets/
│   ├── sounds/              # (Optional) external sound files
│   ├── music/               # (Optional) background music
│   └── images/              # Project thumbnails etc.
└── README.md
```

## ⌨️ Keyboard Shortcuts

| Key(s) | Action |
|--------|--------|
| `A` + `1` | Open About Me |
| `B` + `1` | Open Projects |
| `←` `→` | Browse vinyl carousel |
| `Enter` | Select current record |
| `Escape` | Return to welcome screen |
| `↑↑↓↓←→←→BA` | Konami code Easter egg |

## 🎨 Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Jukebox Body | Deep Red | `#8B0000` |
| Chrome/Gold | Gold | `#FFD700` |
| Neon Accent 1 | Turquoise | `#00FFFF` |
| Neon Accent 2 | Hot Pink | `#FF1493` |
| Background | Dark Wood | `#2C1810` |

## 👤 Author

**Anjisha Pun**  
UI/UX Designer & Frontend Developer  
📍 Butwal, Nepal

- [GitHub](https://github.com/anjisha616)
- [LinkedIn](https://www.linkedin.com/in/anjisha-pun-aaa1a6349/)
- [Email](mailto:punangisha@gmail.com)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
