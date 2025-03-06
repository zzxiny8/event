// public/js/user.js
document.addEventListener('DOMContentLoaded', () => {
    const eventList = document.getElementById('eventList');
    const userForm = document.getElementById('userForm');
  
   // 如果需要背景图，请定义图片数组
   const imageUrls = [
    './images/bg1.jpg',
    './images/bg2.jpg',
    './images/bg3.jpg'
  ];

  // 加载活动列表
  async function loadEvents() {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const events = await res.json();
        eventsContainer.innerHTML = '';
        if (events.length === 0) {
          eventsContainer.textContent = '目前没有活动。';
          return;
        }
        events.forEach(evt => {
          // 创建活动卡片
          const card = document.createElement('div');
          card.classList.add('event-card');

          // 随机选择一张背景图（如果有背景图数组）
          if (imageUrls.length > 0) {
            const randomIndex = Math.floor(Math.random() * imageUrls.length);
            card.style.backgroundImage = `url('${imageUrls[randomIndex]}')`;
          }

          // 设置卡片内部的内容（注意使用反引号构造模板字符串）
          card.innerHTML = `
            <h3>${evt.title}</h3>
            <p>Date: ${evt.date}</p>
            <p>Location: ${evt.location}</p>
            <p>Description: ${evt.description}</p>
          `;

          // 点击卡片后跳转到活动详情页，传入活动的 id 参数
          card.addEventListener('click', () => {
            window.location.href = 'event_detail.html?id=' + evt._id;
          });

          // 添加卡片到容器
          eventsContainer.appendChild(card);
        });
      } else {
        eventsContainer.textContent = '无法加载活动列表。';
      }
    } catch (err) {
      console.error(err);
      eventsContainer.textContent = '请求出错。';
    }
  }

  // 页面加载时立即加载活动列表
  loadEvents();
});