document.addEventListener("DOMContentLoaded", async function () {
    // 1. 确认用户已经登录且邮箱是 @udtrucks.com
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail || !userEmail.endsWith("@udtrucks.com")) {
        window.location.href = "/views/login.html"; // 若未登录，则跳转登录页
        return;
    }

    // 自动填充邮箱到表单中
    const emailInput = document.getElementById("email");
    if (emailInput) {
        emailInput.value = userEmail;
    }

    // 获取导航按钮
    const promotionBtn = document.getElementById("promotionBtn");
    const ourVoiceBtn = document.getElementById("ourVoiceBtn");
    const eventBtn = document.getElementById("eventBtn");
    
    // 获取三个界面
    const promotionContainer = document.getElementById("promotionContainer");
    const ourVoiceContainer = document.getElementById("ourVoiceContainer");
    const eventContainer = document.getElementById("eventContainer");

    // 切换到 Promotion 界面
    promotionBtn.addEventListener("click", function () {
        document.body.classList.add("promotion-page");
        document.body.classList.remove("our-voice-page");
        document.body.classList.remove("event-page");
        promotionContainer.style.display = "block";
        ourVoiceContainer.style.display = "none";
        eventContainer.style.display = "none";

        promotionBtn.classList.add("active");
        ourVoiceBtn.classList.remove("active");
        eventBtn.classList.remove("active");
    });

    // 切换到 Our Voice 界面
    ourVoiceBtn.addEventListener("click", function () {
        document.body.classList.add("our-voice-page");
        document.body.classList.remove("promotion-page");
        document.body.classList.remove("event-page");
        ourVoiceContainer.style.display = "block";
        promotionContainer.style.display = "none";
        eventContainer.style.display = "none";

        ourVoiceBtn.classList.add("active");
        promotionBtn.classList.remove("active");
        eventBtn.classList.remove("active");
    });

    // 切换到 Event 界面
    eventBtn.addEventListener("click", function () {
        document.body.classList.add("event-page");
        document.body.classList.remove("our-voice-page");
        document.body.classList.remove("promotion-page");
        eventContainer.style.display = "block";
        ourVoiceContainer.style.display = "none";
        promotionContainer.style.display = "none";

        eventBtn.classList.add("active");
        ourVoiceBtn.classList.remove("active");
        promotionBtn.classList.remove("active");
    });

    // 默认进入 Promotion
    promotionBtn.click();

    // 下面是原有的 Event 相关代码、fetch 调用、表单提交等逻辑，不变
    // --------------------------------------------------------------
    const eventListContainer = document.getElementById("eventListContainer");
    const eventDetailsContainer = document.getElementById("eventDetailsContainer");
    const eventList = document.getElementById("eventList");
    const backButton = document.getElementById("backButton");
    const userForm = document.getElementById("userForm");

    try {
        const res = await fetch("/api/events");
        const events = await res.json();

        if (res.ok && events.length > 0) {
            eventList.innerHTML = "";
            events.reverse(); 
            events.forEach(event => {
                const eventCard = document.createElement("div");
                const formattedDatetime = new Date(event.datetime).toLocaleString();
                eventCard.classList.add("event-card");
                eventCard.style.backgroundColor = getRandomColor();
                eventCard.innerHTML = `
                    <h2 class="event-title">${event.title}</h2>
                    <p class="event-date">📅 ${formattedDatetime}</p>
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

    function showEventDetails(event) {
        document.getElementById("eventTitle").textContent = event.title;
        document.getElementById("eventDescription").textContent = event.description || "No description available";

        if (event.datetime) {
            const eventDateObj = new Date(event.datetime);
            const formattedDate = eventDateObj.toLocaleDateString();
            const formattedTime = eventDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
            document.getElementById("eventDate").textContent = `📅 Date: ${formattedDate}`;
            document.getElementById("eventTime").textContent = `⏰ Time: ${formattedTime}`;
        } else {
            document.getElementById("eventDate").textContent = "📅 Date: Not provided";
            document.getElementById("eventTime").textContent = "⏰ Time: Not provided";
        }

        document.getElementById("eventId").value = event._id;
        eventListContainer.style.display = "none";
        eventDetailsContainer.style.display = "block";
    }

    backButton.addEventListener("click", function () {
        eventDetailsContainer.style.display = "none";
        eventListContainer.style.display = "block";
    });

    userForm.addEventListener("submit", async function(e) {
        e.preventDefault();
        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const phone = document.getElementById("phone").value.trim();
        const eventId = document.getElementById("eventId").value;
        const vegetarian = document.getElementById("vegetarian").value === "true";
        const dinner = document.getElementById("dinner").value === "true";
        const allergies = document.getElementById("allergies").value.trim();
        const avoidMeat = document.getElementById("avoidMeat").value.trim();

        if (!name) {
            alert("Please enter your name.");
            return;
        }
        if (!eventId) {
            alert("No event selected. Please go back and select an event again.");
            return;
        }

        const formData = { name, email, phone, eventId, vegetarian, dinner, allergies, avoidMeat };

        try {
            const response = await fetch("/api/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const result = await response.json();

            if (response.ok) {
                alert("Submission successful!");
                backButton.click();
            } else {
                alert("Submission failed: " + (result.error || result.message));
            }
        } catch (err) {
            console.error("Error submitting user info:", err);
            alert("An error occurred while submitting. Please try again.");
        }
    });
});

// 颜色函数，保持不变
function getRandomColor() {
    const colors = ["#417D14", "#556EAA", "#F08C00", "#00829B", "#4C4948"];
    return colors[Math.floor(Math.random() * colors.length)];
}
