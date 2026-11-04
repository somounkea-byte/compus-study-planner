/* LocalStorage data helpers. Data stays in this browser/app profile. */
const STORAGE_KEYS = {
  tasks: "campusPlanner.tasks.v1",
  subjects: "campusPlanner.subjects.v1",
  sessions: "campusPlanner.sessions.v1"
};

function readStorage(key, fallback = []) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error("Could not read saved data:", error);
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error("Could not save data:", error);
    alert("Your data could not be saved. Your browser storage may be full.");
    return false;
  }
}

function getTasks() { return readStorage(STORAGE_KEYS.tasks); }
function saveTasks(items) { return writeStorage(STORAGE_KEYS.tasks, items); }
function getSubjects() { return readStorage(STORAGE_KEYS.subjects); }
function saveSubjects(items) { return writeStorage(STORAGE_KEYS.subjects, items); }
function getSessions() { return readStorage(STORAGE_KEYS.sessions); }
function saveSessions(items) { return writeStorage(STORAGE_KEYS.sessions, items); }
