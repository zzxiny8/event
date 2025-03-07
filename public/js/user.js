document.addEventListener("DOMContentLoaded", async function () {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("eventId");
  const userEmail = localStorage.getItem("userEmail");

  if (!eventId || !userEmail) {
      window.location.href = "/views/user.html"; // Redirect if missing data
      return;
  }

  // 预填充 Email
  document.getElementById("email").value = userEmail;

  // 监听表单提交事件
  document.getElementById("userForm").addEventListener("submit", async function (e) {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();

      if (!name || !email || !eventId) {
          alert("Please fill in all required fields.");
          return;
      }

      try {
          const res = await fetch("/api/submit", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ name, email, phone, eventId })
          });

          const data = await res.json();

          if (res.ok) {
              alert("Submission successful!");
              window.location.href = "/views/user.html";
          } else {
              alert("Submission failed: " + (data.error || "Unknown error"));
          }
      } catch (err) {
          console.error("Submission error:", err);
          alert("Submission failed. Please try again.");
      }
  });
});
