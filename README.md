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

## Deployment to Cloudflare Pages

### Prerequisites

- A Cloudflare account (free tier works)
- Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)

### Step-by-Step Deployment

1. **Build Configuration**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/` (leave empty or set to root)

2. **Deploy via Cloudflare Dashboard**
   - Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to **Pages** in the sidebar
   - Click **Create a project**
   - Select **Connect to Git**
   - Choose your Git provider and authorize Cloudflare
   - Select your repository
   - Configure build settings:
     - **Framework preset**: Vite or Vue
     - **Build command**: `npm run build`
     - **Build output directory**: `dist`
   - Click **Save and Deploy**

3. **Automatic Deployments**
   - Cloudflare Pages automatically deploys on every push to your main branch
   - Preview deployments are created for pull requests

### Custom Domain Setup (Optional)

1. **Add Custom Domain**
   - In your Cloudflare Pages project, go to **Custom domains**
   - Click **Set up a custom domain**
   - Enter your domain name (e.g., `timer.yourdomain.com`)

2. **DNS Configuration**
   - If your domain is managed by Cloudflare:
     - Cloudflare will automatically configure DNS records
   - If your domain is managed elsewhere:
     - Add a CNAME record pointing to your Cloudflare Pages URL
     - Or add an A record with Cloudflare's IP addresses

3. **SSL/TLS**
   - Cloudflare automatically provisions SSL certificates
   - HTTPS is enabled by default
   - Wait a few minutes for certificate provisioning

4. **Domain Verification**
   - Follow the verification steps in the Cloudflare dashboard
   - Once verified, your site will be accessible via your custom domain

### Build Settings Summary

```
Build command: npm run build
Build output directory: dist
Node version: 18.x or higher (auto-detected)
```

### Troubleshooting

- **Build fails**: Check that all dependencies are in `package.json` and not in `devDependencies` if needed at build time
- **404 errors on routes**: Ensure your `vite.config.ts` handles SPA routing correctly (Cloudflare Pages should serve `index.html` for all routes)
- **Custom domain not working**: Verify DNS records are correct and wait for DNS propagation (can take up to 48 hours)

## License

ISC

