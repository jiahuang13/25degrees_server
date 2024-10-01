const express = require("express");
const router = express.Router();
const orderHandler = require("../router_handler/order");

// items(id, count, price), totalprice
// 創建訂單
router.post("/order/create", orderHandler.createOrder);

router.get("/order/status", orderHandler.getOrderStatusCount);
router.get("/order/:id", orderHandler.getOneOrderById);
router.get("/order", orderHandler.getAllOrdersById);



module.exports = router;
