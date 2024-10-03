// router/index.js
const express = require("express");
const router = express.Router();

// 引入各個路由模組
const userRouter = require("./user");
const addressRouter = require("./address");
const blogRouter = require("./blog");
const productRouter = require("./product");
const photoRouter = require("./photography");
const orderRouter = require("./order");
const paymentRouter = require("./payment");

// 統一註冊路由
router.use(userRouter);
router.use(addressRouter);
router.use(blogRouter);
router.use(productRouter);
router.use(photoRouter);
router.use(orderRouter);
router.use(paymentRouter);

module.exports = router;
