const db = require("./db/index");
const { errorRes, successRes } = require("./utils/response_handler");

// 更新庫存邏輯
async function updateStock(orderId) {
  try {
    // 1. 查詢訂單中所有商品的 `product_id` 和 `count`
    const itemsSql =
      "SELECT product_id, count FROM order_items WHERE order_id = ?";
    const items = await db.query(itemsSql, [orderId]);

    // 2. 檢查是否存在訂單商品
    if (!items || items.length === 0) {
      console.log("訂單中無產品");
      return errorRes(res, "訂單中無產品", 400);
    }

    // 3. 遍歷每個商品並更新庫存
    for (const item of items) {
      const { product_id, count } = item;

      // 更新產品庫存
      const stockUpdateSql =
        "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?";
      const stockResult = await db.query(stockUpdateSql, [
        count,
        product_id,
        count,
      ]);

      // 4. 檢查庫存是否更新成功
      if (stockResult.affectedRows !== 1) {
        console.error(`更新產品庫存失敗，產品ID: ${product_id}`);
        return errorRes(res, `更新產品庫存失敗，產品ID: ${product_id}`, 400);
      }
    }

    // 5. 所有庫存更新成功
    console.log(`訂單 ${orderId} 庫存更新成功`);
    return successRes(res, "庫存更新成功");
  } catch (error) {
    // 捕捉異常並返回錯誤響應
    console.error("更新庫存時發生錯誤:", error.message || error);
    return errorRes(res, error.message);
  }
}

module.exports = updateStock;
