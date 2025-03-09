document.addEventListener('DOMContentLoaded', function() {
  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole');
  if (!userEmail || userRole !== 'admin') {
    // If not logged in as admin, redirect to login
    window.location.href = 'login.html';
    return;
  }
  // Load events and submissions data when page is ready
  loadEvents();
  loadSubmissions();
});

// Fetch and display the list of events
async function loadEvents() {
  try {
    const res = await fetch('/api/events');
    const events = await res.json();
    if (res.ok) {
      const eventsList = document.getElementById('eventsList');
      eventsList.innerHTML = '';
      events.forEach(evt => {
        const li = document.createElement('li');
        // Show event title and date (if available)
        li.textContent = evt.title;
        if (evt.date) {
          const d = new Date(evt.date);
          li.textContent += ' (' + d.toLocaleDateString() + ')';
        }
        // Create a delete button for each event
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', async () => {
          if (confirm(`Delete event "${evt.title}"?`)) {
            // Send DELETE request to remove event
            await fetch(`/api/events/${evt._id}?adminEmail=` + encodeURIComponent(localStorage.getItem('userEmail')), {
              method: 'DELETE'
            });
            // Reload events and submissions lists after deletion
            loadEvents();
            loadSubmissions();
          }
        });
        li.appendChild(delBtn);
        eventsList.appendChild(li);
      });
    }
  } catch (err) {
    console.error('Error loading events:', err);
  }
}

// Fetch and display all user submissions in the table
async function loadSubmissions() {
  try {
    const res = await fetch('/api/submissions?adminEmail=' + encodeURIComponent(localStorage.getItem('userEmail')));
    const submissions = await res.json();
    if (res.ok) {
      const tbody = document.getElementById('submissionsBody');
      tbody.innerHTML = '';
      submissions.forEach(sub => {
        const tr = document.createElement('tr');
        const nameTd = document.createElement('td');
        nameTd.textContent = sub.name;
        const emailTd = document.createElement('td');
        emailTd.textContent = sub.email;
        const phoneTd = document.createElement('td');
        phoneTd.textContent = sub.phone || '';
        const eventTd = document.createElement('td');
        eventTd.textContent = sub.event ? sub.event.title : '';
        const vegetarianTd = document.createElement("td");
        vegetarianTd.textContent = sub.vegetarian ? "Yes" : "No";
        const dinnerTd = document.createElement("td");
        dinnerTd.textContent = sub.dinner ? "Yes" : "No";
        const allergiesTd = document.createElement("td");
        allergiesTd.textContent = sub.allergies || "";
        const avoidMeatTd = document.createElement("td");
        avoidMeatTd.textContent = sub.avoidMeat || "";

        tr.appendChild(nameTd);
        tr.appendChild(emailTd);
        tr.appendChild(phoneTd);
        tr.appendChild(eventTd);
        tr.appendChild(vegetarianTd);
        tr.appendChild(dinnerTd);
        tr.appendChild(allergiesTd);
        tr.appendChild(avoidMeatTd);
        
        tbody.appendChild(tr);
      });
    }
  } catch (err) {
    console.error('Error loading submissions:', err);
  }
}

// Handle new event creation form submission
document.getElementById('eventForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const title = document.getElementById('eventTitleInput').value.trim();
  const description = document.getElementById('eventDescInput').value.trim();
  const date = document.getElementById('eventDateInput').value;  // date string (YYYY-MM-DD from input[type=date])
  if (!title) {
    alert('Event title is required');
    return;
  }
  try {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title: title, 
        description: description, 
        date: date, 
        adminEmail: localStorage.getItem('userEmail') 
      })
    });
    const data = await res.json();
    if (res.ok) {
      // Clear the form and reload events list on success
      document.getElementById('eventForm').reset();
      loadEvents();
    } else {
      alert(data.error || 'Failed to create event');
    }
  } catch (err) {
    console.error('Error creating event:', err);
    alert('Unable to create event. Please try again later.');
  }
});

// Register the service worker for PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(err => {
    console.log('Service Worker registration failed:', err);
  });
}
