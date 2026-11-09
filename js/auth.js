/* Local-device account system. Passwords are salted and PBKDF2-hashed. */
(() => {
  const USERS_KEY = "campusPlanner.users.v1";
  const CURRENT_KEY = "campusPlanner.currentUser";
  const $ = (id) => document.getElementById(id);
  const readUsers = () => {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); }
    catch { return []; }
  };
  const writeUsers = (users) => localStorage.setItem(USERS_KEY, JSON.stringify(users));
  const encode = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
  const decode = (value) => Uint8Array.from(atob(value), c => c.charCodeAt(0));
  async function hashPassword(password, salt) {
    if (!crypto.subtle) throw new Error("Secure password storage is not available. Open the app through HTTPS or localhost.");
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({name:"PBKDF2", salt, iterations:210000, hash:"SHA-256"}, key, 256);
    return encode(bits);
  }
  function showMessage(message) { $("authMessage").textContent = message; }
  function showMode(mode) {
    const login = mode === "login";
    $("registerForm").classList.toggle("hidden", login);
    $("loginForm").classList.toggle("hidden", !login);
    $("authTitle").textContent = login ? "Welcome back" : "Create your account";
    $("authEyebrow").textContent = login ? "WELCOME BACK" : "WELCOME TO YOUR STUDY SPACE";
    $("authDescription").textContent = login ? "Log in to continue your study plan." : "Create an account to keep your study plan organized.";
    $("authSwitch").innerHTML = login ? 'New to CampusPlan? <button type="button" id="showRegister">Create account</button>' : 'Already have an account? <button type="button" id="showLogin">Log in</button>';
    showMessage("");
    const toggle = $(login ? "showRegister" : "showLogin");
    toggle.addEventListener("click", () => showMode(login ? "register" : "login"));
  }
  function migrateOldData(userId) {
    const types = ["tasks", "subjects", "sessions"];
    for (const type of types) {
      const oldKey = `campusPlanner.${type}.v1`;
      const newKey = `campusPlanner.user.${userId}.${type}.v1`;
      const oldData = localStorage.getItem(oldKey);
      if (oldData && !localStorage.getItem(newKey)) localStorage.setItem(newKey, oldData);
      localStorage.removeItem(oldKey);
    }
  }
  function enter(user) {
    localStorage.setItem(CURRENT_KEY, user.id);
    $("authScreen").classList.add("hidden");
    $("accountName").textContent = user.fullName;
    $("userAvatar").textContent = user.fullName.trim().charAt(0).toUpperCase();
  }

  const users = readUsers();
  const activeId = localStorage.getItem(CURRENT_KEY);
  const activeUser = users.find(user => user.id === activeId);
  if (activeUser) enter(activeUser);
  else {
    localStorage.removeItem(CURRENT_KEY);
    $("authScreen").classList.remove("hidden");
    showMode(users.length ? "login" : "register");
  }

  $("registerForm").addEventListener("submit", async event => {
    event.preventDefault();
    const fullName = $("registerName").value.trim();
    const password = $("registerPassword").value;
    const confirm = $("registerConfirm").value;
    if (fullName.length < 2) return showMessage("Please enter your full name.");
    if (password.length < 8) return showMessage("Password must be at least 8 characters.");
    if (password !== confirm) return showMessage("The passwords do not match.");
    const allUsers = readUsers();
    if (allUsers.some(user => user.fullName.toLowerCase() === fullName.toLowerCase())) return showMessage("An account with this full name already exists. Please log in.");
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const passwordHash = await hashPassword(password, salt);
      const user = {id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`, fullName, salt:encode(salt), passwordHash, createdAt:new Date().toISOString()};
      const firstAccount = allUsers.length === 0;
      allUsers.push(user);
      writeUsers(allUsers);
      if (firstAccount) migrateOldData(user.id);
      enter(user);
      location.reload();
    } catch (error) { showMessage(error.message || "Could not create your account."); }
  });

  $("loginForm").addEventListener("submit", async event => {
    event.preventDefault();
    const fullName = $("loginName").value.trim();
    const password = $("loginPassword").value;
    const user = readUsers().find(item => item.fullName.toLowerCase() === fullName.toLowerCase());
    if (!user) return showMessage("Account not found. Check your full name or create an account.");
    try {
      const hash = await hashPassword(password, decode(user.salt));
      if (hash !== user.passwordHash) return showMessage("Incorrect password. Please try again.");
      enter(user);
      location.reload();
    } catch (error) { showMessage(error.message || "Could not log in."); }
  });

  $("logoutButton").addEventListener("click", () => {
    localStorage.removeItem(CURRENT_KEY);
    location.reload();
  });
})();
