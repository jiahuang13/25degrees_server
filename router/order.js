const express = require("express");
const router = express.Router();
const orderHandler = require("../router_handler/order");

// items(id, count, price), totalprice
// 創建訂單
router.post("/createOrder", orderHandler.createOrder);

router.get("/getAllOrdersById", orderHandler.getAllOrdersById);
router.get("/getOneOrderById/:id", orderHandler.getOneOrderById);

module.exports = router;
