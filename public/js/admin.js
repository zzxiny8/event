// public/js/admin.js
document.addEventListener('DOMContentLoaded', () => {
  const eventForm = document.getElementById('eventForm');
  const loadUsersBtn = document.getElementById('loadUsersBtn');
  const userList = document.getElementById('userList');
  // 新增用于活动管理的元素
  const loadEventsBtn = document.getElementById('loadEventsBtn');
  const eventList = document.getElementById('eventList');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const eventsContainer = document.getElementById('events-container');

  // 用于标识是否处于编辑状态，如果不为 null 表示正在编辑某个活动
  let editingEventId = null;

  // ---------------------------
  // 1. 提交活动信息（新建或编辑）
  // ---------------------------
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
      // 默认是新建活动
      let url = '/api/admin/event';
      let method = 'POST';

      // 如果处于编辑模式，则调用 PUT 接口更新活动
      if (editingEventId) {
        url = `/api/admin/event/${editingEventId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        alert(editingEventId ? 'Event updated!' : 'Event created!');
        eventForm.reset();
        // 退出编辑状态
        editingEventId = null;
        cancelEditBtn.style.display = 'none';
        // 刷新活动列表
        loadEvents();
      } else {
        alert('Failed to submit!');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit!');
    }
  });

  // ---------------------------
  // 2. 加载用户提交信息
  // ---------------------------
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

  // ---------------------------
  // 3. 加载活动列表（供管理员管理）
  // ---------------------------
  loadEventsBtn.addEventListener('click', loadEvents);

  async function loadEvents() {
    try {
      const res = await fetch('/api/admin/events'); // 后端需提供该接口返回所有活动
      if (res.ok) {
        const events = await res.json();
        eventContainer.innerHTML = '';
        if (events.length === 0) {
          eventContainer.textContent = 'No events available.';
          return;
        }

        events.forEach(event => {
          const div = document.createElement('div');
          div.innerHTML = `
            <strong>${event.title}</strong><br/>
            Date: ${event.date} Time: ${event.time}<br/>
            Location: ${event.location}<br/>
            Description: ${event.description}
          `;
          div.style.border = '1px solid #ccc';
          div.style.padding = '10px';
          div.style.margin = '10px 0';

          // 删除按钮
          const delBtn = document.createElement('button');
          delBtn.textContent = 'Delete';
          delBtn.style.marginRight = '10px';
          delBtn.addEventListener('click', () => deleteEvent(event._id));

          // 编辑按钮
          const editBtn = document.createElement('button');
          editBtn.textContent = 'Edit';
          editBtn.addEventListener('click', () => editEvent(event));

          // 添加按钮到活动项中
          div.appendChild(document.createElement('br'));
          div.appendChild(delBtn);
          div.appendChild(editBtn);

          eventContainer.appendChild(div);
        });
      } else {
        alert('Failed to load events!');
      }
    } catch (err) {
      console.error(err);
      alert('Error loading events!');
    }
  }

  // ---------------------------
  // 4. 删除活动
  // ---------------------------
  async function deleteEvent(id) {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/event/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        alert('Event deleted!');
        loadEvents(); // 刷新活动列表
      } else {
        alert('Failed to delete event!');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting event!');
    }
  }

  // ---------------------------
  // 5. 编辑活动（填充表单，切换为编辑模式）
  // ---------------------------
  function editEvent(event) {
    editingEventId = event._id; // 记录正在编辑的活动 ID
    // 将活动数据填入表单中
    eventForm.title.value = event.title;
    eventForm.date.value = event.date;
    eventForm.time.value = event.time;
    eventForm.location.value = event.location;
    eventForm.description.value = event.description;
    // 显示“取消编辑”按钮
    cancelEditBtn.style.display = 'inline';
  }

  // ---------------------------
  // 6. 取消编辑
  // ---------------------------
  cancelEditBtn.addEventListener('click', () => {
    editingEventId = null;
    eventForm.reset();
    cancelEditBtn.style.display = 'none';
  });
});
