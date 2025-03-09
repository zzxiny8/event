document.addEventListener("DOMContentLoaded", async function () {
    // 1. 确认用户已经登录且邮箱是 @udtrucks.com
    const userEmail = localStorage.getItem("userEmail");
    if (!userEmail || !userEmail.endsWith("@udtrucks.com")) {
      window.location.href = "/views/login.html"; // 若未登录，则跳转登录页
      return;
    }
  
    // 自动填充邮箱到表单中（email输入框设置为 disabled）
    document.getElementById("email").value = userEmail;
  
    // 获取页面元素引用
    const eventListContainer = document.getElementById("eventListContainer");
    const eventDetailsContainer = document.getElementById("eventDetailsContainer");
    const eventList = document.getElementById("eventList");
    const backButton = document.getElementById("backButton");
    const userForm = document.getElementById("userForm"); // 表单
  
    // 2. 获取所有活动并显示为可点击卡片
    try {
      const res = await fetch("/api/events");
      const events = await res.json();
  
      if (res.ok && events.length > 0) {
        eventList.innerHTML = ""; // 清空原有活动列表
  
        events.forEach(event => {
          const eventCard = document.createElement("div");
          eventCard.classList.add("event-card");
          eventCard.style.backgroundColor = getRandomColor(); // 随机背景色
  
          // 填充活动标题和日期
          eventCard.innerHTML = `
            <h2 class="event-title">${event.title}</h2>
            <p class="event-date">${event.date ? `📅 ${new Date(event.date).toLocaleDateString()}` : "📅 No date available"}</p>
          `;
  
          // 点击卡片，显示详情
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
  
    // 显示单个活动详情
    function showEventDetails(event) {
      document.getElementById("eventTitle").textContent = event.title;
      document.getElementById("eventDescription").textContent = event.description || "No description available";
      document.getElementById("eventDate").textContent = event.date
        ? `📅 Date: ${new Date(event.date).toLocaleDateString()}`
        : "📅 Date: Not provided";
  
      // 将活动的 _id 存到隐藏字段，以便提交报名
      const eventIdInput = document.getElementById("eventId");
      if (eventIdInput) {
        eventIdInput.value = event._id; // 后端应返回event._id
      }
  
      // 切换视图
      eventListContainer.style.display = "none";
      eventDetailsContainer.style.display = "block";
    }
  
    // 点击“Back”按钮返回活动列表
    backButton.addEventListener("click", function () {
      eventDetailsContainer.style.display = "none";
      eventListContainer.style.display = "block";
    });
  
    // 3. 提交报名表单事件
    userForm.addEventListener("submit", async function(e) {
      e.preventDefault(); // 阻止默认表单提交(刷新)
  
      // 从表单中收集数据
      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const eventId = document.getElementById("eventId").value;
  
      // 是否素食 / 是否吃晚饭
      const vegetarianValue = document.getElementById("vegetarian").value;
      const dinnerValue = document.getElementById("dinner").value;
      const vegetarian = (vegetarianValue === "true");
      const dinner = (dinnerValue === "true");
  
      // 过敏 / 不吃的肉
      const allergies = document.getElementById("allergies").value.trim();
      const avoidMeat = document.getElementById("avoidMeat").value.trim();
  
      // 简单校验
      if (!name) {
        alert("Please enter your name.");
        return;
      }
      if (!eventId) {
        alert("No event selected. Please go back and select an event again.");
        return;
      }
  
      // 组装要发送的对象
      const formData = {
        name,
        email,
        phone,
        eventId,
        vegetarian,
        dinner,
        allergies,
        avoidMeat
      };
  
      try {
        // 发起POST请求到后端
        const response = await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        });
        const result = await response.json();
  
        if (response.ok) {
          // 提交成功
          alert("Submission successful!");
          // 返回活动列表
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
  
  // 随机背景色函数，用于活动卡片
  function getRandomColor() {
    const colors = ["#FF6B6B", "#6B5BFF", "#28A745", "#FFC107", "#17A2B8"];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  