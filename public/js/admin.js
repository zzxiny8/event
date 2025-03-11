document.addEventListener('DOMContentLoaded', function () {
  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole');
  if (!userEmail || userRole !== 'admin') {
    window.location.href = 'login.html'; // Redirect to login if not admin
    return;
  }

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
        li.textContent = evt.title;
        
        if (evt.datetime) {
          const d = new Date(evt.datetime);
          li.textContent += ` (${d.toLocaleDateString()} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
        }

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.addEventListener('click', async () => {
          if (confirm(`Delete event "${evt.title}"?`)) {
            await fetch(`/api/events/${evt._id}?adminEmail=` + encodeURIComponent(localStorage.getItem('userEmail')), {
              method: 'DELETE'
            });
            loadEvents();
            loadSubmissions();
          }
        });

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => editEvent(evt));

        li.appendChild(delBtn);
        li.appendChild(editBtn);
        eventsList.appendChild(li);
      });
    }
  } catch (err) {
    console.error('Error loading events:', err);
  }
}

// Function to edit an event (now includes time)
// Function to edit an event (now includes time)
function editEvent(eventObj) {
  const newTitle = prompt("Enter new title:", eventObj.title);
  if (newTitle === null) return;

  const newDesc = prompt("Enter new description:", eventObj.description || "");
  if (newDesc === null) return;

  // 创建 modal 容器
  const modal = document.createElement("div");
  modal.classList.add("modal"); // 使用 CSS 样式

  // 创建输入框
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.value = eventObj.datetime ? eventObj.datetime.split("T")[0] : "";

  const timeInput = document.createElement("input");
  timeInput.type = "time";
  timeInput.value = eventObj.datetime ? new Date(eventObj.datetime).toTimeString().slice(0, 5) : "";

  // 显示输入框让用户选择日期和时间
  const dateLabel = document.createElement("label");
  dateLabel.textContent = "Select Date:";
  
  const timeLabel = document.createElement("label");
  timeLabel.textContent = "Select Time:";

  // 确认按钮
  const confirmButton = document.createElement("button");
  confirmButton.textContent = "Confirm";
  confirmButton.onclick = async () => {
      const newDate = dateInput.value;
      const newTime = timeInput.value;
      if (!newDate || !newTime) {
          alert("Date and Time are required!");
          return;
      }

      try {
          const res = await fetch(`/api/events/${eventObj._id}?adminEmail=` + encodeURIComponent(localStorage.getItem('userEmail')), {
              method: 'PUT',
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                  title: newTitle, 
                  description: newDesc, 
                  date: newDate,
                  time: newTime
              })
          });
          const data = await res.json();

          if (data.error) {
              alert("Update event failed: " + data.error);
          } else {
              alert("Event updated!");
              loadEvents(); // 刷新事件列表
              document.body.removeChild(modal); // **关闭弹窗**
          }
      } catch (err) {
          console.error('Error updating event:', err);
          alert("Error updating event");
      }
  };

  // 关闭按钮
  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.onclick = () => document.body.removeChild(modal); // 关闭弹窗

  // 组装 modal
  modal.appendChild(dateLabel);
  modal.appendChild(dateInput);
  modal.appendChild(timeLabel);
  modal.appendChild(timeInput);
  modal.appendChild(confirmButton);
  modal.appendChild(closeButton);

  // 添加到 body
  document.body.appendChild(modal);
}



// Fetch and display all user submissions
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

        // Delete User Submission button
        const deleteTd = document.createElement('td');
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete User';
        delBtn.addEventListener('click', async () => {
          if (confirm(`Delete user "${sub.name}"?`)) {
            await fetch(`/api/submissions/${sub._id}?adminEmail=` + encodeURIComponent(localStorage.getItem('userEmail')), {
              method: 'DELETE'
            });
            loadSubmissions();
          }
        });
        deleteTd.appendChild(delBtn);

        tr.appendChild(nameTd);
        tr.appendChild(emailTd);
        tr.appendChild(phoneTd);
        tr.appendChild(eventTd);
        tr.appendChild(vegetarianTd);
        tr.appendChild(dinnerTd);
        tr.appendChild(allergiesTd);
        tr.appendChild(avoidMeatTd);
        tr.appendChild(deleteTd);

        tbody.appendChild(tr);
      });
    }
  } catch (err) {
    console.error('Error loading submissions:', err);
  }
}

// Handle new event creation form submission (includes time)
document.getElementById('eventForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const title = document.getElementById('eventTitleInput').value.trim();
  const description = document.getElementById('eventDescInput').value.trim();
  const date = document.getElementById('eventDateInput').value;
  const time = document.getElementById('eventTimeInput').value; // Get time input
  if (!title || !date || !time) {
    alert('All fields are required.');
    return;
  }

   // 合并 `date` 和 `time` 形成 `datetime`
   const datetime = `${date}T${time}:00Z`;

  try {
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title,
        description: description,
        datetime: datetime, // 发送 `datetime`
        adminEmail: localStorage.getItem('userEmail')
      })
    });
    const data = await res.json();
    if (res.ok) {
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
};
