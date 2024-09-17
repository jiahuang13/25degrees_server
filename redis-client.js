const { createClient } = require("redis");

// 創建 Redis 客戶端
const client = createClient({
  socket: {
    host: "144.48.241.22",
    port: 6379,
    connectTimeout: 5000, // 設定連接超時為 5000 毫秒（5 秒）
    keepAlive: 5000, // 設定保持活動的時間
    timeout: 10000, // 設定總超時時間 10 秒
  },
});

// 連接到 Redis
client.connect()
  .then(() => {
    console.log("Connected to Redis");
  })
  .catch((err) => {
    console.error("Redis connection error:", err);
  });


// 導出 Redis 客戶端和回調函數
module.exports = client;
