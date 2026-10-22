// Feedback form on the Project Showcase page
// Sends the form to the Node server at POST /api/contact and shows what happened

const form = document.getElementById('feedback-form');

if (form) {
  const status = document.getElementById('fb-status');
  const button = document.getElementById('fb-submit');

  function showStatus(text, kind) {
    status.textContent = text;
    status.className = 'form-status ' + kind;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // quick checks in the browser (the server checks again, this is just to be friendly)
    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      projectType: form.projectType.value,
      message: form.message.value.trim(),
      honeypot: form.honeypot.value
    };
    if (!data.name || !data.email || !data.message) {
      showStatus('Please fill in your name, email and message.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      showStatus('Please enter a valid email address.', 'error');
      return;
    }

    button.disabled = true;
    showStatus('Sending...', 'info');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      // the server answers with JSON, but if it isn't running we may get a plain page back
      let result = {};
      try { result = await response.json(); } catch (e) { /* not JSON */ }

      if (response.ok && result.success) {
        form.reset();
        showStatus('Thank you! Your message has been sent to the team.', 'success');
      } else if (result.error) {
        showStatus(result.error, 'error');
      } else {
        showStatus('The feedback service is not available right now. If you are running the site locally, make sure the Node server is running (see README.txt).', 'error');
      }
    } catch (err) {
      showStatus('Could not reach the server. Please try again later.', 'error');
    } finally {
      button.disabled = false;
    }
  });
}
