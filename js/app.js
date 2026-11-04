/* Campus Study Planner - application logic */
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
let tasks = getTasks();
let subjects = getSubjects();
let sessions = getSessions();
let editingTaskId = null;
let editingSubjectId = null;
let toastTimer;

const todayISO = () => {
  const date = new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
const escapeHTML = (value) => String(value).replace(/[&<>"']/g, char => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
}[char]));
const formatDate = (dateString) => {
  if (!dateString) return "No date";
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(undefined, {day:"numeric",month:"short",year:"numeric"});
};
const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function switchView(viewName) {
  $$(".view").forEach(view => view.classList.toggle("active", view.id === `view-${viewName}`));
  $$(".nav-link").forEach(link => link.classList.toggle("active", link.dataset.view === viewName));
  const titles = {dashboard:"Dashboard",tasks:"My Tasks",subjects:"Subjects",schedule:"Study Schedule"};
  $("#pageTitle").textContent = titles[viewName] || "Dashboard";
  $("#sidebar").classList.remove("open");
  if (viewName === "tasks") renderTasks();
  if (viewName === "subjects") renderSubjects();
  if (viewName === "schedule") renderSessions();
}

function openModal(id) { $( `#${id}` ).showModal(); }
function closeModal(id) { $(`#${id}`).close(); }

function renderSubjectOptions() {
  const options = subjects.map(subject => `<option value="${escapeHTML(subject.id)}">${escapeHTML(subject.name)}</option>`).join("");
  $("#taskSubject").innerHTML = `<option value="">Choose subject</option>${options}`;
  $("#sessionSubject").innerHTML = `<option value="">No subject selected</option>${options}`;
  const current = $("#taskSubjectFilter").value || "all";
  $("#taskSubjectFilter").innerHTML = `<option value="all">All subjects</option>${subjects.map(s => `<option value="${escapeHTML(s.id)}">${escapeHTML(s.name)}</option>`).join("")}`;
  $("#taskSubjectFilter").value = subjects.some(s => s.id === current) ? current : "all";
}

function renderDashboard() {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const pending = total - completed;
  const percent = total ? Math.round(completed / total * 100) : 0;
  $("#statTotal").textContent = total;
  $("#statCompleted").textContent = completed;
  $("#statPending").textContent = pending;
  $("#statProgress").textContent = `${percent}%`;
  $("#ringPercent").textContent = `${percent}%`;
  $("#progressRing").style.background = `conic-gradient(var(--blue) ${percent * 3.6}deg, #eaf0fa 0deg)`;
  $("#motivationText").textContent = percent === 100 && total ? "Amazing work! All your tasks are complete." : percent >= 50 ? "Great progress. Keep going!" : "Every completed task is a step forward.";

  const upcoming = tasks.filter(t => !t.completed).sort((a,b) => a.deadline.localeCompare(b.deadline)).slice(0,5);
  const container = $("#upcomingList");
  if (!upcoming.length) {
    container.innerHTML = `<div class="empty-state"><div>✓</div><h3>You're all caught up</h3><p>Add a task when you have something to do.</p></div>`;
    return;
  }
  container.innerHTML = upcoming.map(task => {
    const subject = subjects.find(s => s.id === task.subjectId);
    return `<div class="compact-task"><i class="task-dot"></i><div class="compact-task-main"><strong>${escapeHTML(task.title)}</strong><small>${escapeHTML(subject?.name || "No subject")}</small></div><span class="compact-date">${formatDate(task.deadline)}</span></div>`;
  }).join("");
}

function renderTasks() {
  renderSubjectOptions();
  const search = $("#taskSearch").value.trim().toLowerCase();
  const status = $("#taskStatusFilter").value;
  const subjectId = $("#taskSubjectFilter").value;
  const filtered = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search);
    const matchesStatus = status === "all" || (status === "completed" ? task.completed : !task.completed);
    const matchesSubject = subjectId === "all" || task.subjectId === subjectId;
    return matchesSearch && matchesStatus && matchesSubject;
  }).sort((a,b) => a.deadline.localeCompare(b.deadline));

  $("#tasksTable").innerHTML = filtered.map(task => {
    const subject = subjects.find(s => s.id === task.subjectId);
    const priority = task.priority.toLowerCase();
    return `<tr>
      <td>${escapeHTML(task.title)}</td>
      <td>${escapeHTML(subject?.name || "No subject")}</td>
      <td>${formatDate(task.deadline)}</td>
      <td><span class="priority priority-${priority}">${escapeHTML(task.priority)}</span></td>
      <td><span class="status ${task.completed ? "status-completed" : "status-pending"}">${task.completed ? "Completed" : "Pending"}</span></td>
      <td><div class="row-actions">
        <button class="mini-button" data-action="toggle-task" data-id="${task.id}">${task.completed ? "Undo" : "Done"}</button>
        <button class="mini-button" data-action="edit-task" data-id="${task.id}">Edit</button>
        <button class="mini-button danger" data-action="delete-task" data-id="${task.id}">Delete</button>
      </div></td>
    </tr>`;
  }).join("");
  $("#tasksEmpty").classList.toggle("hidden", filtered.length !== 0);
}

function resetTaskForm() {
  $("#taskForm").reset();
  editingTaskId = null;
  $("#taskModalTitle").textContent = "Create a task";
  $("#taskForm button[type=submit]").textContent = "Save task";
}

function editTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;
  editingTaskId = id;
  $("#taskModalTitle").textContent = "Edit task";
  $("#taskTitle").value = task.title;
  $("#taskSubject").value = task.subjectId || "";
  $("#taskDeadline").value = task.deadline;
  $("#taskPriority").value = task.priority;
  $("#taskForm button[type=submit]").textContent = "Update task";
  openModal("taskModal");
}

function renderSubjects() {
  const grid = $("#subjectsGrid");
  if (!subjects.length) {
    grid.innerHTML = "";
    $("#subjectsEmpty").classList.remove("hidden");
    return;
  }
  $("#subjectsEmpty").classList.add("hidden");
  const icons = {blue:"▤",purple:"✦",green:"✓",orange:"◷",pink:"♡"};
  grid.innerHTML = subjects.map(subject => {
    const count = tasks.filter(t => t.subjectId === subject.id).length;
    return `<article class="subject-card">
      <div class="subject-top"><span class="subject-symbol ${subject.color}">${icons[subject.color] || "▤"}</span>
      <div class="subject-card-actions"><button class="mini-button" data-action="edit-subject" data-id="${subject.id}">Edit</button><button class="mini-button danger" data-action="delete-subject" data-id="${subject.id}">Delete</button></div></div>
      <h3>${escapeHTML(subject.name)}</h3><p>${escapeHTML(subject.description || "No description")}</p>
      <div class="subject-meta"><span>${count} ${count === 1 ? "task" : "tasks"}</span><span>${escapeHTML(subject.color)} theme</span></div>
    </article>`;
  }).join("");
}

function renderSessions() {
  const list = $("#scheduleList");
  const sorted = [...sessions].sort((a,b) => (a.date + a.start).localeCompare(b.date + b.start));
  if (!sorted.length) {
    list.innerHTML = "";
    $("#scheduleEmpty").classList.remove("hidden");
    return;
  }
  $("#scheduleEmpty").classList.add("hidden");
  list.innerHTML = sorted.map(session => {
    const subject = subjects.find(s => s.id === session.subjectId);
    const date = new Date(`${session.date}T00:00:00`);
    return `<div class="session-item"><div class="session-date"><strong>${date.getDate()}</strong><span>${date.toLocaleDateString(undefined,{month:"short"})}</span></div>
      <div class="session-info"><h4>${escapeHTML(session.title)}</h4><p>${escapeHTML(subject?.name || "General study")} · ${formatDate(session.date)}</p></div>
      <span class="session-time">${escapeHTML(session.start)} – ${escapeHTML(session.end)}</span>
      <button class="mini-button danger" data-action="delete-session" data-id="${session.id}">Delete</button></div>`;
  }).join("");
}

function refreshAll() {
  renderSubjectOptions();
  renderDashboard();
  renderTasks();
  renderSubjects();
  renderSessions();
}

// Navigation
$$(".nav-link").forEach(link => link.addEventListener("click", () => switchView(link.dataset.view)));
$$("[data-go]").forEach(button => button.addEventListener("click", () => switchView(button.dataset.go)));
$("#mobileMenu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));

// Modal controls
$("#openTaskModal").addEventListener("click", () => {
  if (!subjects.length) { showToast("Please add a subject first."); switchView("subjects"); return; }
  resetTaskForm(); renderSubjectOptions(); $("#taskDeadline").value = todayISO(); openModal("taskModal");
});
$("#openSubjectModal").addEventListener("click", () => {
  editingSubjectId = null; $("#subjectForm").reset(); $("#subjectModalTitle").textContent = "Add a subject"; openModal("subjectModal");
});
$("#openSessionModal").addEventListener("click", () => {
  $("#sessionForm").reset(); $("#sessionDate").value = todayISO(); renderSubjectOptions(); openModal("sessionModal");
});
$$("[data-close]").forEach(button => button.addEventListener("click", () => closeModal(button.dataset.close)));
["taskModal","subjectModal","sessionModal"].forEach(id => {
  $(`#${id}`).addEventListener("click", event => { if (event.target === event.currentTarget) closeModal(id); });
});

// Save task
$("#taskForm").addEventListener("submit", event => {
  event.preventDefault();
  const title = $("#taskTitle").value.trim();
  const subjectId = $("#taskSubject").value;
  const deadline = $("#taskDeadline").value;
  if (!title || !subjectId || !deadline) return;
  if (editingTaskId) {
    tasks = tasks.map(t => t.id === editingTaskId ? {...t,title,subjectId,deadline,priority:$("#taskPriority").value} : t);
    showToast("Task updated.");
  } else {
    tasks.push({id:makeId(),title,subjectId,deadline,priority:$("#taskPriority").value,completed:false,createdAt:new Date().toISOString()});
    showToast("Task added.");
  }
  saveTasks(tasks); closeModal("taskModal"); resetTaskForm(); refreshAll();
});

// Save subject
$("#subjectForm").addEventListener("submit", event => {
  event.preventDefault();
  const name = $("#subjectName").value.trim();
  if (!name) return;
  const data = {name,description:$("#subjectDescription").value.trim(),color:$("#subjectColor").value};
  const duplicate = subjects.some(s => s.name.toLowerCase() === name.toLowerCase() && s.id !== editingSubjectId);
  if (duplicate) { showToast("That subject already exists."); return; }
  if (editingSubjectId) {
    subjects = subjects.map(s => s.id === editingSubjectId ? {...s,...data} : s);
    showToast("Subject updated.");
  } else {
    subjects.push({id:makeId(),...data});
    showToast("Subject added.");
  }
  saveSubjects(subjects); closeModal("subjectModal"); refreshAll();
});

// Save study session
$("#sessionForm").addEventListener("submit", event => {
  event.preventDefault();
  const title = $("#sessionTitle").value.trim(), date = $("#sessionDate").value;
  const start = $("#sessionStart").value, end = $("#sessionEnd").value;
  if (!title || !date || !start || !end) return;
  if (end <= start) { showToast("End time must be after start time."); return; }
  sessions.push({id:makeId(),title,date,start,end,subjectId:$("#sessionSubject").value});
  saveSessions(sessions); closeModal("sessionModal"); renderSessions(); showToast("Study session added.");
});

// Table actions and subject/session actions
document.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const {action,id} = button.dataset;
  if (action === "toggle-task") {
    tasks = tasks.map(t => t.id === id ? {...t,completed:!t.completed} : t);
    saveTasks(tasks); refreshAll(); showToast("Task status updated.");
  }
  if (action === "edit-task") editTask(id);
  if (action === "delete-task" && confirm("Delete this task?")) {
    tasks = tasks.filter(t => t.id !== id); saveTasks(tasks); refreshAll(); showToast("Task deleted.");
  }
  if (action === "edit-subject") {
    const subject = subjects.find(s => s.id === id); if (!subject) return;
    editingSubjectId = id; $("#subjectModalTitle").textContent = "Edit subject";
    $("#subjectName").value = subject.name; $("#subjectDescription").value = subject.description || ""; $("#subjectColor").value = subject.color;
    openModal("subjectModal");
  }
  if (action === "delete-subject") {
    const used = tasks.some(t => t.subjectId === id) || sessions.some(s => s.subjectId === id);
    if (used) { showToast("This subject is linked to tasks or sessions. Remove those first."); return; }
    if (confirm("Delete this subject?")) { subjects = subjects.filter(s => s.id !== id); saveSubjects(subjects); refreshAll(); showToast("Subject deleted."); }
  }
  if (action === "delete-session" && confirm("Delete this study session?")) {
    sessions = sessions.filter(s => s.id !== id); saveSessions(sessions); renderSessions(); showToast("Session deleted.");
  }
});

$("#taskSearch").addEventListener("input", renderTasks);
$("#taskStatusFilter").addEventListener("change", renderTasks);
$("#taskSubjectFilter").addEventListener("change", renderTasks);

function initialize() {
  $("#headerDate").textContent = new Date().toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
  $("#todayLabel").textContent = new Date().toLocaleDateString(undefined,{weekday:"long",month:"long",day:"numeric"}).toUpperCase();
  // Helpful starter subjects so the first task can be created immediately.
  if (!subjects.length) {
    subjects = [
      {id:makeId(),name:"Web Development",description:"HTML, CSS and JavaScript",color:"blue"},
      {id:makeId(),name:"Database",description:"SQL and database concepts",color:"purple"},
      {id:makeId(),name:"English",description:"Reading, writing and speaking",color:"green"}
    ];
    saveSubjects(subjects);
  }
  refreshAll();
}
initialize();
