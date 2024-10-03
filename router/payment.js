const express = require("express");
const router = express.Router();
const handler = require("../router_handler/payment");


router
  .post("/paypal/create-order", handler.paypalCreateOrder) // 創建 PayPal 訂單
  .post("/paypal/verify-order", handler.paypalVerifyOrder); // 捕獲 PayPal 訂單

module.exports = router;
