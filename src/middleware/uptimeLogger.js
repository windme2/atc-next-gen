module.exports = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const uptime = process.uptime();
  
  // แปลงเวลาเป็น วินาที, นาที, ชั่วโมง
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);
  
  const uptimeFormatted = `${hours}h ${minutes}m ${seconds}s`;
  
  console.log(`⏱️ [UptimeLogger] ${req.method} ${req.originalUrl}`);
  console.log(`📊 Server Uptime: ${uptimeFormatted} (${uptime.toFixed(2)}s)`);
  console.log(`🕐 Timestamp: ${timestamp}`);
  console.log('─'.repeat(60));
  
  next();
};