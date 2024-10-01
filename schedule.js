const schedule = require("node-schedule");
const db = require("./db/index");

// 定義一個定時任務，檢查所有 `pending` 狀態的訂單
const orderStatusCheck = schedule.scheduleJob("*/5 * * * *", async () => {
  try {
    // 取得當前時間前 2 小時的時間戳
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    // 更新 `pending` 狀態且創建時間超過 2 小時的訂單為 `failed`
    const sql = `
      UPDATE orders 
      SET status = 'cancelled' 
      WHERE status = 'pending' AND created_at < ?`;

    const results = await db.query(sql, [twoHoursAgo]);

    if (results.affectedRows > 0) {
      console.log(`Marked ${results.affectedRows} orders as cancelled.`);
    }
  } catch (err) {
    console.error("Failed to update order status:", err);
  }
});

module.exports = orderStatusCheck;
