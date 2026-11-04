# Campus Study Planner

A small study planner built with HTML, CSS, and JavaScript. The same interface runs in a web browser and as a Windows/macOS/Linux desktop window using Electron.

## Features

- Dashboard with task statistics and completion progress
- Create, edit, complete, undo, delete, search, and filter tasks
- Add, edit, and delete subjects
- Create and delete study sessions
- Upcoming task list
- Responsive blue-and-white design
- LocalStorage persistence

## Requirements

- A modern web browser for the website
- Node.js and npm for the Electron desktop version

## Run as a website

Open `index.html` in a browser, or use the VS Code Live Server extension.

## Run as a desktop application

Open a terminal in this project folder and run:

```bash
npm install
npm start
```

## Build a Windows desktop package

```bash
npm install
npm run pack
```

The packaged application will be placed in the `release` folder. Packaging should be performed on the operating system you want to target.

## Data storage

The app uses browser LocalStorage. Website data and desktop-app data are stored separately. They do not sync between devices or browser profiles. Export/import and cloud sync are not included in this first version.

## Project structure

```text
campus-study-planner/
├── index.html
├── package.json
├── README.md
├── css/
│   └── style.css
├── js/
│   ├── storage.js
│   └── app.js
├── desktop/
│   └── main.js
└── assets/
    └── images/
```
