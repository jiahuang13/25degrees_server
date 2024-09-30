const express = require("express");
const router = express.Router();
const { client } = require("../paypal");
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");
const db = require("../db/index");

// 创建订单的 API
router.post("/paypal/create-order", async (req, res) => {
  const { amount } = req.body;
  const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "TWD",
          value: amount, // 您的订单金额
        },
      },
    ],
  });

  try {
    const order = await client().execute(request);
    res.json({ id: order.result.id });
  } catch (err) {
    console.error("Error creating PayPal order:", err);
    res
      .status(500)
      .json({ error: "Something went wrong", details: err.toString() });
  }
});

// 捕获订单的 API
router.post("/paypal/verify-order", async (req, res) => {
  const { orderId, paypalId } = req.body;
  console.log(req.body);

  if (!orderId || !paypalId) {
    return res
      .status(400)
      .json({ success: false, message: "缺少必要的订单标识信息" });
  }

  const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(paypalId);
  request.requestBody({});

  try {
    const orderDetails = await client().execute(request);
    // res.json({ status: "success", orderDetails });
    console.log(orderDetails.result.status);

    if (orderDetails && orderDetails.result.status === "COMPLETED") {
      const updateSql =
        "UPDATE orders SET status = ?, paypal_txn_id = ? WHERE id = ?";
      const updateResults = await db.query(updateSql, [
        "paid",
        paypalId,
        orderId,
      ]);
      if (updateResults.affectedRows !== 1) {
        return res.send({ status: 500, message: "更新訂單狀態失敗" });
      } else {
        return res.send({ status: 200, message: "更新訂單狀態成功" });
      }
    } else if (!orderDetails) {
      res.status(500).json({ success: false, message: "驗證訂單失敗" });
    } else {
      res.status(400).json({ success: false, message: "支付未完成" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Payment capture failed" });
  }
});

module.exports = router;
