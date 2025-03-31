// 使用ISO格式日期避免解析歧义
const siteLaunchDate = new Date("2025-02-01T12:00:00");
let now = new Date();

function calculateRunTime() {
    // 更新当前时间（添加250ms补偿）
    now = new Date(now.getTime() + 250);
    
    // 计算总时间差（毫秒）
    const diff = now - siteLaunchDate;
    
    // 计算天数
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    // 计算剩余小时
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const formattedHours = String(hours).padStart(2, '0');
    
    // 计算剩余分钟
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const formattedMinutes = String(minutes).padStart(2, '0');
    
    // 计算剩余秒数
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    const formattedSeconds = String(seconds).padStart(2, '0');
    
    // 更新DOM
    document.getElementById("timeDate").textContent = `lyklbw's blog运行时间:`;
    document.getElementById("times").textContent = `${days}d-${formattedHours}h-${formattedMinutes}m-${formattedSeconds}s`;
}

// 使用函数引用而不是字符串
setInterval(calculateRunTime, 250);