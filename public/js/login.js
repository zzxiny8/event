// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    if (!email) return;
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      });
      const data = await res.json();
      if (res.ok) {
        // Save email and role to local storage
        localStorage.setItem('userEmail', data.email);
        localStorage.setItem('userRole', data.role);
        // Redirect based on role
        if (data.role === 'admin') {
          window.location.href = 'admin.html';
        } else {
          window.location.href = 'user.html';
        }
      } else {
        alert(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Error during login:', err);
      alert('Unable to login. Please try again later.');
    }
  });
  
  // Register the service worker for PWA (if supported)
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => {
      console.log('Service Worker registration failed:', err);
    });
  }
  