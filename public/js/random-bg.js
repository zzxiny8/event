// 等待页面加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 定义包含五张背景图路径的数组
    const imageUrls = [
      '/images/bg1.jpg',
      '/images/bg2.jpg',
      '/images/bg3.jpg',
      '/images/bg4.jpg',
      '/images/bg5.jpg'
    ];
  
    // 随机生成一个索引，范围为 0 到 imageUrls.length - 1
    const randomIndex = Math.floor(Math.random() * imageUrls.length);
  
    // 获取页面中 id 为 "card" 的元素
    const card = document.getElementById('card');
  
    // 为 card 元素设置随机背景图片
    card.style.backgroundImage = `url('${imageUrls[randomIndex]}')`;
  
    // 可选：为卡片添加点击事件，点击后跳转到活动详情页面（这里示例传递一个活动ID参数）
    card.addEventListener('click', function() {
      window.location.href = 'event_detail.html?id=活动ID';
    });
  });
  