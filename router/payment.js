const express = require("express");
const router = express.Router();
const { client } = require("../paypal");
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");
const db = require("../db/index");
const { successRes, errorRes } = require("../utils/response_handler");
const updateStock = require("../updateStock"); // 引入更新庫存模塊

// ---------------- 創建 PayPal 訂單的 API ----------------
router.post("/paypal/create-order", async (req, res) => {
  const { amount } = req.body;

  // 構建 PayPal 訂單創建請求
  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "TWD", // 設定幣種
          value: amount, // 設定訂單金額
        },
      },
    ],
  });

  try {
    // 發送訂單創建請求
    const order = await client().execute(request);

    // 成功響應，返回訂單 ID
    return successRes(res, "PayPal 訂單創建成功", { id: order.result.id });
  } catch (err) {
    console.error("PayPal 訂單創建失敗:", err);

    // 捕獲錯誤並返回標準錯誤響應
    return errorRes(res, "PayPal 訂單創建失敗", err.toString());
  }
});

// ---------------- 捕獲 PayPal 訂單的 API ----------------
router.post("/paypal/verify-order", async (req, res) => {
  const { orderId, paypalId } = req.body;

  // 檢查必要的訂單標識信息
  if (!orderId || !paypalId) {
    return errorRes(res, "缺少必要的訂單標識信息", 400);
  }

  try {
    // 發送 PayPal 捕獲訂單請求
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(paypalId);
    request.requestBody({});
    const orderDetails = await client().execute(request);

    console.log(orderDetails.result.status);

    // 檢查訂單是否捕獲完成
    if (orderDetails && orderDetails.result.status === "COMPLETED") {
      // 1. 更新資料庫訂單狀態
      const paypalSql = "UPDATE orders SET status = ?, paypal_txn_id = ? WHERE id = ?";
      const [paypalResults] = await db.query(paypalSql, ["paid", paypalId, orderId]);
      
      if (paypalResults.affectedRows !== 1) {
        return errorRes(res, "更新訂單狀態失敗", 500);
      }

      // 2. 調用 `updateStock` 函數來更新庫存
      const stockResult = await updateStock(orderId);

      // 根據 `updateStock` 的返回值進行響應處理
      if (stockResult.status !== 200) {
        return errorRes(res, stockResult.message, stockResult.status);
      }

      // 3. 返回成功響應
      return successRes(res, "訂單支付成功，訂單狀態及庫存已更新");
    } else if (!orderDetails) {
      // 捕獲訂單失敗
      return errorRes(res, "驗證訂單失敗", 500);
    } else {
      // 支付未完成
      return errorRes(res, "支付未完成", 400);
    }
  } catch (err) {
    console.error("PayPal 訂單捕獲失敗:", err);

    // 捕獲異常並返回錯誤響應
    return errorRes(res, "訂單捕獲失敗", 500);
  }
});

module.exports = router;
