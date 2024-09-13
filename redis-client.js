const redis = require('redis');

// 創建 Redis 客戶端
const client = redis.createClient({
  host: 'localhost', 
  port: 6379,
});

// 監聽 Redis 客戶端的連接狀態
client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('error', (err) => {
  console.error('Redis error:', err);
});

module.exports = client;
