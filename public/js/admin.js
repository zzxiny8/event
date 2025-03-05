// public/js/admin.js
document.addEventListener('DOMContentLoaded', () => {
    const eventForm = document.getElementById('eventForm');
    const loadUsersBtn = document.getElementById('loadUsersBtn');
    const userList = document.getElementById('userList');
  
    // 提交活动信息
    eventForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(eventForm);
      const data = {
        title: formData.get('title'),
        date: formData.get('date'),
        location: formData.get('location'),
        description: formData.get('description'),
      };
      try {
        const res = await fetch('/api/admin/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        if (res.ok) {
          alert('活动信息已提交！');
          eventForm.reset();
        } else {
          alert('提交失败！');
        }
      } catch (err) {
        console.error(err);
        alert('提交出错！');
      }
    });
  
    // 加载用户提交信息
    loadUsersBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/admin/users'); // 向 /api/admin/users 发 GET 请求
        if (res.ok) {
          const users = await res.json();
          userList.innerHTML = '';
          if (users.length === 0) {
            userList.textContent = '暂时没有用户提交信息';
            return;
          }
          users.forEach(u => {
            const div = document.createElement('div');
            div.textContent = `姓名: ${u.name}, 素食: ${u.isVegetarian}, 晚饭: ${u.hasDinner}, 过敏: ${u.allergies}`;
            userList.appendChild(div);
          });
        } else {
          alert('加载失败！');
        }
      } catch (err) {
        console.error(err);
        alert('请求出错！');
      }
    });
  });
  