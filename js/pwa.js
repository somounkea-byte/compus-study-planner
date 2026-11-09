// PWA install support. Service workers require HTTPS or localhost.
let installPrompt = null;
const installButton = document.getElementById('installButton');

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;
}

if (isStandalone()) {
  installButton.textContent = '✓ Installed';
  installButton.disabled = true;
  installButton.title = 'Campus Study Planner is installed';
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});

installButton.addEventListener('click', async () => {
  if (installPrompt) {
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installButton.hidden = true;
    return;
  }

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (isIOS) {
    alert('To install: tap the Share button in Safari, then choose “Add to Home Screen”.');
  } else if (isStandalone()) {
    alert('Campus Study Planner is already installed.');
  } else {
    alert('To install: open this website in Chrome or Edge, then use the Install icon in the address bar or the browser menu.');
  }
});

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(error => {
      console.error('Service worker registration failed:', error);
    });
  });
}
