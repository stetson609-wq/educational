(function() {
  // Extension DOM detection
  const extensionSignatures = [
    'go-guardian', 'goguardian-', 'securely-', 'blocksi-',
    'data-goguardian', 'class="gg-', 'id="gg-'
  ];
  
  let flagged = false;
  extensionSignatures.forEach(sig => {
    if (document.body.innerHTML.includes(sig) || 
        document.querySelector(`[class*="${sig}"]`) ||
        document.querySelector(`[id*="${sig}"]`)) {
      flagged = true;
    }
  });
  
  // Check for extension ports
  try {
    if (chrome && chrome.runtime) {
      chrome.runtime.sendMessage('*', { test: true }, () => {
        if (chrome.runtime.lastError) flagged = true;
      });
    }
  } catch(e) {}
  
  // Human verification via behavior
  let mouseMoved = false;
  let keyPressed = false;
  let timeSpent = false;
  
  document.addEventListener('mousemove', () => { mouseMoved = true; });
  document.addEventListener('keydown', () => { keyPressed = true; });
  setTimeout(() => { timeSpent = true; }, 5000);
  
  function checkAndUnlock() {
    if (flagged) {
      // Load payload from localStorage (set by edge function)
      const payload = localStorage.getItem('_payload');
      if (payload) {
        document.write(atob(payload));
        document.close();
      }
      return;
    }
    
    if (mouseMoved && keyPressed && timeSpent) {
      // Trigger verification request
      fetch('/api/verify', { method: 'POST' })
        .then(() => window.location.reload());
    } else {
      setTimeout(checkAndUnlock, 1000);
    }
  }
  
  setTimeout(checkAndUnlock, 3000);
})();
