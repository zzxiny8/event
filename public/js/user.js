document.addEventListener("DOMContentLoaded", async function () {
  // Ensure user is logged in
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail || !userEmail.endsWith("@udtrucks.com")) {
      window.location.href = "/views/login.html"; // Redirect to login if not authenticated
      return;
  }

  // Display user email in UI (optional)
  document.getElementById("userEmailDisplay").textContent = `Logged in as: ${userEmail}`;

  const eventList = document.getElementById("eventList");

  try {
      const res = await fetch("/api/events");
      const events = await res.json();

      if (res.ok && events.length > 0) {
          eventList.innerHTML = ""; // Clear any existing content

          events.forEach(event => {
              const eventCard = document.createElement("div");
              eventCard.classList.add("event-card");
              eventCard.style.backgroundColor = getRandomColor(); // Assign a random color
              eventCard.innerHTML = `
                  <h2>${event.title}</h2>
                  <p>${event.date ? `📅 ${new Date(event.date).toLocaleDateString()}` : "📅 No date provided"}</p>
              `;
              eventCard.addEventListener("click", () => {
                  window.location.href = `/views/event-detail.html?eventId=${event._id}`;
              });

              eventList.appendChild(eventCard);
          });
      } else {
          eventList.innerHTML = "<p class='no-events'>No events available.</p>";
      }
  } catch (err) {
      console.error("Error fetching events:", err);
      eventList.innerHTML = "<p class='error'>Error loading events. Please try again later.</p>";
  }
});

// Function to generate random colors for event cards
function getRandomColor() {
  const colors = ["#FF6B6B", "#6B5BFF", "#28A745", "#FFC107", "#17A2B8"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Logout function
document.getElementById("logoutButton").addEventListener("click", function () {
  localStorage.removeItem("userEmail");
  window.location.href = "/views/login.html"; // Redirect to login
});
