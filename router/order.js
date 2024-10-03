const express = require("express");
const router = express.Router();
const orderHandler = require("../router_handler/order");

router
  .post("/order/create", orderHandler.createOrder) // 創建訂單（自定義）
  .get("/order/status", orderHandler.getOrderStatusCount) // 取得訂單各狀態的數量
  .get("/order/:id", orderHandler.getOneOrderById) // 取得單個訂單
  .get("/order", orderHandler.getAllOrdersById); // 取得某會員所有訂單

module.exports = router;
