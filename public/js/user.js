document.addEventListener('DOMContentLoaded', async function() {
  // Check that user is logged in and is a normal user (not admin)
  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole');
  if (!userEmail || userRole !== 'user') {
    // Not logged in or wrong role, redirect to login
    window.location.href = 'login.html';
    return;
  }
  // Set the email field to the logged-in user's email
  document.getElementById('email').value = userEmail;

  // Fetch events to display event info
  try {
    const res = await fetch('/api/events');
    const events = await res.json();
    if (res.ok && events.length > 0) {
      // Display the latest event (first in the sorted list)
      const event = events[0];
      document.getElementById('eventTitle').textContent = event.title;
      document.getElementById('eventDescription').textContent = event.description || '';
      if (event.date) {
        const dateObj = new Date(event.date);
        document.getElementById('eventDate').textContent = 'Date: ' + dateObj.toLocaleDateString();
      }
      // Store event ID in the form (using dataset) for use on submit
      document.getElementById('userForm').dataset.eventId = event._id;
    } else {
      document.getElementById('eventTitle').textContent = 'No events available.';
      document.getElementById('eventDescription').textContent = '';
      document.getElementById('eventDate').textContent = '';
    }
  } catch (err) {
    console.error('Error fetching events:', err);
    document.getElementById('eventTitle').textContent = 'Error loading event data.';
  }
});

// Handle user info form submission
document.getElementById('userForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const eventId = e.target.dataset.eventId;
  if (!name || !email || !eventId) {
    alert('Please complete all required fields.');
    return;
  }
  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, email: email, phone: phone, eventId: eventId })
    });
    const data = await res.json();
    if (res.ok) {
      alert('Submitted successfully!');
      // Clear the form after successful submission
      document.getElementById('userForm').reset();
      // (Optionally, you could show a confirmation message on the page instead of alert)
    } else {
      alert(data.error || 'Submission failed');
    }
  } catch (err) {
    console.error('Error submitting form:', err);
    alert('Unable to submit. Please try again later.');
  }
});

// Register the service worker for PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(err => {
    console.log('Service Worker registration failed:', err);
  });
}
