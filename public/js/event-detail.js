document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get("eventId");
    const userEmail = localStorage.getItem("userEmail");

    if (!eventId || !userEmail) {
        window.location.href = "user.html";
        return;
    }

    try {
        const res = await fetch(`/api/events/${eventId}`);
        const event = await res.json();

        if (res.ok) {
            document.getElementById("eventTitle").textContent = event.title;
            document.getElementById("eventDescription").textContent = event.description || "No description";
            document.getElementById("eventDate").textContent = event.date ? `Date: ${new Date(event.date).toLocaleDateString()}` : "时间: 未知";
        } else {
            document.body.innerHTML = "<h2>Event not found!</h2>";
        }
    } catch (err) {
        console.error("Error loading event details:", err);
        document.body.innerHTML = "<h2>Loading failed!</h2>";
    }

    document.getElementById("email").value = userEmail;
});

// 处理表单提交
document.getElementById("userForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get("eventId");

    if (!name || !email || !eventId) {
        alert("Please fill in the complete information.");
        return;
    }

    try {
        const res = await fetch("/api/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, phone, eventId })
        });

        if (res.ok) {
            alert("Successful registration!");
            window.location.href = "/views/user.html";
        } else {
            alert("Submission failed!");
        }
    } catch (err) {
        console.error("Submission error!:", err);
        alert("Submission failed!");
    }
});
