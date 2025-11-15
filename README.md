# Timer Web App

A modern timer web application built with Vue.js 3, TypeScript, and Tailwind CSS.

## Features

- ⏱️ **Timer**: Set custom hours, minutes, and seconds with circular progress indicator
- 🎨 **Theme Support**: Light and dark mode
- 🔊 **Sound Options**: Enable/disable sounds and silent mode when tab is inactive
- 📱 **Full Screen**: Toggle fullscreen mode
- 📊 **History**: Track your timer sessions
- 💾 **Backup & Restore**: Export and import your settings and history
- 🔔 **Notifications**: Browser notifications when timer completes
- ➕ **Quick Add**: Add 10s or 30s to timer quickly

## Tech Stack

- Vue.js 3 (Composition API)
- TypeScript
- Vite
- Pinia (State Management)
- Tailwind CSS
- VueUse

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── TimerView.vue      # Timer component
│   └── HistoryView.vue     # History and backup component
├── stores/
│   ├── settings.ts         # Settings store
│   └── history.ts          # History store
├── utils/
│   ├── cn.ts               # Class name utility
│   └── sound.ts            # Sound utilities
├── App.vue                 # Main app component
├── main.ts                 # App entry point
└── style.css               # Global styles
```

## Usage

1. **Timer**: Set hours, minutes, and seconds, then click Start. Use +10s and +30s buttons to quickly add time.
2. **History**: View your timer history at the bottom of the page.
3. **Settings**: Toggle sound, silent mode, theme, and fullscreen from the header.
4. **Backup**: Export your settings and history, or import them from a backup file.

## License

ISC

