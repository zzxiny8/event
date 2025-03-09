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

      // 新增：把活动的 _id 存到隐藏表单中
      const eventIdInput = document.getElementById("eventId");
      if (eventIdInput) {
        eventIdInput.value = event._id; // 假设后端返回的活动对象里是 _id
      }

      eventListContainer.style.display = "none";
      eventDetailsContainer.style.display = "block";
  }

  // Function to go back to event list
  backButton.addEventListener("click", function () {
      eventDetailsContainer.style.display = "none";
      eventListContainer.style.display = "block";
  });

    // 提交报名表单
    userForm.addEventListener("submit", async function(e) {
        e.preventDefault(); // 阻止默认表单提交(页面刷新)

        // 收集表单数据
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const eventId = document.getElementById("eventId").value;

        // 简单校验
        if (!name) {
            alert("Please enter your name.");
            return;
        }
        if (!eventId) {
            alert("No event selected. Please go back and select an event again.");
            return;
        }

        // 组合请求体
        const formData = { name, email, phone, eventId };

        try {
            const response = await fetch("/api/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const result = await response.json();

            if (response.ok) {
                // 提交成功，给出提示
                alert("Submission successful!");
                // 可以选择回到活动列表
                backButton.click();
            } else {
                // 提交失败
                alert("Submission failed: " + (result.error || result.message));
            }
        } catch (err) {
            console.error("Error submitting user info:", err);
            alert("An error occurred while submitting. Please try again.");
        }
    });

});

// Function to generate random colors for event cards
function getRandomColor() {
  const colors = ["#FF6B6B", "#6B5BFF", "#28A745", "#FFC107", "#17A2B8"];
  return colors[Math.floor(Math.random() * colors.length)];
}
