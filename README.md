# Campus Study Planner (PWA)

A responsive study planner that works in desktop and mobile browsers and can be installed as an app.

## Features
- Account registration and login using full name and password
- Separate tasks, subjects, and study sessions for each local account
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

## Account and data note
Accounts are stored locally on the device. Passwords are stored as salted PBKDF2 hashes, not plain text. Each account has its own tasks, subjects, and study sessions in LocalStorage. This is a local-device account feature, not an online account service: accounts and planner data do not sync between devices or users, and clearing browser/app data may remove them. For real multi-device accounts, online backups, or administrator account management, connect the app to a secure backend with a database and server-side authentication.

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
