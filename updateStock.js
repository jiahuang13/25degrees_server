const db = require("./db/index"); // 確保這裡是 `mysql2` 的模組

// 更新庫存邏輯
async function updateStock(orderId) {
  try {
    // 1. 查詢訂單中所有商品的 `product_id` 和 `count`
    const sql = "SELECT product_id, count FROM order_items WHERE order_id = ?";
    const [items] = await db.query(sql, [orderId]);

    // 2. 檢查是否存在訂單商品
    if (!items || items.length === 0) {
      console.log("訂單中無產品");
      return { status: 404, message: "訂單中無產品" };
    }

    // 3. 遍歷每個商品並更新庫存
    for (const item of items) {
      const { product_id, count } = item;

      // 更新產品庫存
      const stockUpdateSql = "UPDATE product SET stock = stock - ? WHERE id = ? AND stock >= ?";
      const [stockResult] = await db.query(stockUpdateSql, [count, product_id, count]);

      // 4. 檢查庫存是否更新成功
      if (stockResult.affectedRows !== 1) {
        console.error(`更新產品庫存失敗，產品ID: ${product_id}`);
        return { status: 400, message: `更新產品庫存失敗，產品ID: ${product_id}` };
      }
    }

    // 5. 所有庫存更新成功
    console.log(`訂單 ${orderId} 庫存更新成功`);
    return { status: 200, message: "庫存更新成功" };
  } catch (error) {
    // 捕捉異常並返回錯誤結果
    console.error("更新庫存時發生錯誤:", error.message || error);
    return { status: 500, message: error.message || "更新庫存失敗" };
  }
}

module.exports = updateStock;
