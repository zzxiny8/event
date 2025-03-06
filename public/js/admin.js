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
        time: formData.get('time'),
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
          alert('Event information has been submitted!');
          eventForm.reset();
        } else {
          alert('Failed to submit!');
        }
      } catch (err) {
        console.error(err);
        alert('Failed to submit!');
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
            userList.textContent = 'There is no user information!';
            return;
          }
          users.forEach(u => {
            const div = document.createElement('div');
            div.textContent = `姓名: ${u.name}, 素食: ${u.isVegetarian}, 晚饭: ${u.hasDinner}, 过敏: ${u.allergies}`;
            userList.appendChild(div);
          });
        } else {
          alert('Loading failed!');
        }
      } catch (err) {
        console.error(err);
        alert('There is an error in the request!');
      }
    });
  });
  