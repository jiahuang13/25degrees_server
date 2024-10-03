const express = require("express");
const router = express.Router();
const paymentHandler = require("../router_handler/payment");


router
  .post("/paypal/create-order", paymentHandler.paypalCreateOrder) // 創建 PayPal 訂單
  .post("/paypal/verify-order", paymentHandler.paypalVerifyOrder); // 捕獲 PayPal 訂單

module.exports = router;
