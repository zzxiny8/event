// public/js/user.js
document.addEventListener('DOMContentLoaded', () => {
const eventsContainer = document.getElementById('events-container');
  
   // 如果需要背景图，请定义图片数组
   const colors = [
    '#a8d989',
    '#89bdd9',
    '#a189d9',
    '#e09ed7',
    '#efc193'
  ];

  // 加载活动列表
  async function loadEvents() {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const events = await res.json();
        eventsContainer.innerHTML = '';
        if (events.length === 0) {
          eventsContainer.textContent = 'There is no event!';
          return;
        }
        events.forEach(evt => {
          // 创建活动卡片
          const card = document.createElement('div');
          card.classList.add('event-card');

          // 随机选择一张背景图（如果有背景图数组）
          if (colors.length > 0) {
            const randomIndex = Math.floor(Math.random() * colors.length);
            card.style.backgroundColor = colors[randomIndex];
          }

          // 设置卡片内部的内容（注意使用反引号构造模板字符串）
          card.innerHTML = `
            <h3>${evt.title}</h3>
            <p>Date: ${evt.date}</p>
            <p>Location: ${evt.location}</p>
          `;

          // 点击卡片后跳转到活动详情页，传入活动的 id 参数
          card.addEventListener('click', () => {
            window.location.href = '/views/event-detail.html?id=' + evt._id;
          });

          // 添加卡片到容器
          eventsContainer.appendChild(card);
        });
      } else {
        eventsContainer.textContent = 'Unable to load the event list!';
      }
    } catch (err) {
      console.error(err);
      eventsContainer.textContent = 'There is an error in the request!';
    }
  }

  // 页面加载时立即加载活动列表
  loadEvents();
});