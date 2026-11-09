# Campus Study Planner (PWA)

A responsive study planner that works in desktop and mobile browsers and can be installed as an app.

## Features
- Dashboard, tasks, subjects, and study schedule
- Add, edit, complete, search, filter, and delete tasks
- Save data in browser LocalStorage
- Responsive desktop and mobile layout
- Installable Progressive Web App (PWA)
- Offline access after the first successful load

## Run locally
A service worker does not work when you open `index.html` directly with `file://`.
Use VS Code Live Server, or run a local server:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Publish online
Upload the contents of this folder to a static web host such as GitHub Pages, Netlify, or Vercel. The site must use HTTPS for PWA installation and offline caching to work on real devices.

## Install on devices
- **Android (Chrome):** Open the published HTTPS website, tap **Install app** (or use the browser menu → Install app / Add to Home screen).
- **iPhone/iPad (Safari):** Open the website, tap **Share**, then **Add to Home Screen**.
- **Desktop (Chrome/Edge):** Open the HTTPS website and click **Install app** or the install icon in the address bar.

## Important data note
Tasks, subjects, and sessions are saved in the browser's LocalStorage. They remain on that browser/device and are not automatically synchronized between devices. Clearing browser data may remove them.

## Desktop application (optional)
The original Electron desktop setup is retained. Install Node.js, then run:

```bash
npm install
npm start
```

Build a Windows package with:

```bash
npm run pack
```

Build the desktop package on the operating system you want to target.
