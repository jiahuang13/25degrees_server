const express = require("express");
const app = express();
const joi = require("joi");

//導入並配置跨域中間件
const cors = require("cors");
app.use(cors());

//配置解析 x-www-form-urlencoded 表單數據的中間件
app.use(express.urlencoded({ extended: false }));

//配置解析 json 表單數據的中間件
app.use(express.json());

//一定要在路由之前配置解析token的中間件 expressJWT().unless({path:})可配置白名單 不需
const { expressjwt: jwt } = require("express-jwt");
const config = require("./config");

const whitelist = [
  /^\/product\/([^\/]*)$/,
  /product/,
  /^\/blog\/([^\/]*)$/,
  /blog/,
  /login/,
  /register/,
  /verificationCode/,
  /^\/admin\/login$/,
  /album/,
  /^\/album\/([^\/]*)$/,
  /design/,
  /^\/design\/([^\/]*)$/,
];
app.use(
  jwt({ secret: config.jwtSecretKey, algorithms: ["HS256"] }).unless({
    path: whitelist,
  })
);

//導入路由
const userRouter = require("./router/user");
app.use(userRouter);

const userInfoRouter = require("./router/userInfo");
app.use(userInfoRouter);

const addressRouter = require("./router/address");
app.use(addressRouter);

const blogRouter = require("./router/blog");
app.use(blogRouter);

const productRouter = require("./router/product");
app.use(productRouter);

const photoRouter = require("./router/photography");
app.use(photoRouter);

require("dotenv").config();
// paypal支付
const paymentRoutes = require("./router/payment");
app.use(paymentRoutes);

const orderRoutes = require("./router/order");
app.use(orderRoutes);

// 定時任務
const orderStatusCheck = require("./schedule");
orderStatusCheck;

//定義錯誤錯誤級別中間件
app.use((err, req, res, next) => {
  //驗證失敗導致的錯誤
  if (err instanceof joi.ValidationError) {
    return res.send({
      status: 1,
      message: err.message,
    });
  }
  //身份認證失敗的錯誤
  if (err.name === "UnauthorizedError") {
    return res.status(401).json({
      status: 401,
      message: "身份認證失敗",
    });
  } else {
    console.log(err);

    return res.send({
      status: 1,
      message: "未知錯誤，請聯絡管理員",
      err: err.message,
    });
  }
});

const port = process.env.PORT || 3008;

app.listen(port, () => {
  console.log(`server is running at port ${port}`);
});