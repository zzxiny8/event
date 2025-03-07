document.addEventListener("DOMContentLoaded", async function () {
  // Ensure user is logged in
  const userEmail = localStorage.getItem("userEmail");
  if (!userEmail || !userEmail.endsWith("@udtrucks.com")) {
      window.location.href = "/views/login.html"; // Redirect to login if not authenticated
      return;
  }

  document.getElementById("email").value = userEmail; // Autofill user email

  const eventListContainer = document.getElementById("eventListContainer");
  const eventDetailsContainer = document.getElementById("eventDetailsContainer");
  const eventList = document.getElementById("eventList");
  const backButton = document.getElementById("backButton");

  // Fetch events and display them as clickable cards
  try {
      const res = await fetch("/api/events");
      const events = await res.json();

      if (res.ok && events.length > 0) {
          eventList.innerHTML = ""; // Clear existing content

          events.forEach(event => {
              const eventCard = document.createElement("div");
              eventCard.classList.add("event-card");
              eventCard.style.backgroundColor = getRandomColor(); // Assign a random color

              eventCard.innerHTML = `
                  <h2 class="event-title">${event.title}</h2>
                  <p class="event-date">${event.date ? `📅 ${new Date(event.date).toLocaleDateString()}` : "📅 No date available"}</p>
              `;

              eventCard.addEventListener("click", () => showEventDetails(event));

              eventList.appendChild(eventCard);
          });
      } else {
          eventList.innerHTML = "<p class='no-events'>No events available.</p>";
      }
  } catch (err) {
      console.error("Error fetching events:", err);
      eventList.innerHTML = "<p class='error'>Error loading events. Please try again later.</p>";
  }

  // Function to show event details
  function showEventDetails(event) {
      document.getElementById("eventTitle").textContent = event.title;
      document.getElementById("eventDescription").textContent = event.description || "No description available";
      document.getElementById("eventDate").textContent = event.date ? `📅 Date: ${new Date(event.date).toLocaleDateString()}` : "📅 Date: Not provided";

      eventListContainer.style.display = "none";
      eventDetailsContainer.style.display = "block";
  }

  // Function to go back to event list
  backButton.addEventListener("click", function () {
      eventDetailsContainer.style.display = "none";
      eventListContainer.style.display = "block";
  });
});

// Function to generate random colors for event cards
function getRandomColor() {
  const colors = ["#FF6B6B", "#6B5BFF", "#28A745", "#FFC107", "#17A2B8"];
  return colors[Math.floor(Math.random() * colors.length)];
}
