// public/js/user.js
document.addEventListener('DOMContentLoaded', () => {
    const eventList = document.getElementById('eventList');
    const userForm = document.getElementById('userForm');
  
    // 1. 加载活动列表
    async function loadEvents() {
      try {
        const res = await fetch('/api/events'); // 向 /api/events 发 GET 请求
        if (res.ok) {
          const events = await res.json();
          eventList.innerHTML = '';
          if (events.length === 0) {
            eventList.textContent = '目前没有活动。';
            return;
          }
          events.forEach(evt => {
            const div = document.createElement('div');
            const eventDate = new Date(evt.date);
            div.innerHTML = `
              <h3>${evt.title}</h3>
              <p>Date: ${eventDate.toLocaleString()}</p>
              <p>Location: ${evt.location}</p>
              <p>Description: ${evt.description}</p>
            `;
            eventList.appendChild(div);
          });
        } else {
          eventList.textContent = '无法加载活动列表。';
        }
      } catch (err) {
        console.error(err);
        eventList.textContent = '请求出错。';
      }
    }
  
    // 2. 提交用户信息
    userForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(userForm);
      const data = {
        // 如果没有登录流程拿到真实邮箱，这里示例写死
        email: 'test@udtrucks.com', 
        name: formData.get('name'),
        isVegetarian: formData.get('isVegetarian') ? true : false,
        hasDinner: formData.get('hasDinner') ? true : false,
        allergies: formData.get('allergies'),
      };
      try {
        const res = await fetch('/api/user/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          alert('信息已提交！');
          userForm.reset();
        } else {
          alert('提交失败！');
        }
      } catch (err) {
        console.error(err);
        alert('提交出错！');
      }
    });
  
    // 页面加载时立即加载活动列表
    loadEvents();
  });
  