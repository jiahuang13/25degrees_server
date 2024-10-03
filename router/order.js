const express = require("express");
const router = express.Router();
const handler = require("../router_handler/order");

router
  .post("/order/create", handler.createOrder) // 創建訂單（自定義）
  .get("/order/status", handler.getOrderStatusCount) // 取得訂單各狀態的數量
  .get("/order/:id", handler.getOneOrderById) // 取得單個訂單
  .get("/order", handler.getAllOrdersById); // 取得某會員所有訂單

module.exports = router;
