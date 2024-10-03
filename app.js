const express = require("express");
const app = express();
const joi = require("joi");
const cors = require("cors");
const { verifyAccess } = require("./middlewares/auth");

app.use(cors()); //導入並配置跨域中間件

app.use(express.urlencoded({ extended: false })); //配置解析 x-www-form-urlencoded 表單數據的中間件

app.use(express.json()); //配置解析 json 表單數據的中間件

// 為所有路由應用身份驗證與權限檢查（可選默認權限級別）
app.use(verifyAccess()); // 應用 `verifyAccess` 並設置默認權限為 `0`
app.use("/admin", verifyAccess(2)); // 需要管理員級別的訪問權限

//導入路由
const userRouter = require("./router/user");
app.use(userRouter);
const addressRouter = require("./router/address");
app.use(addressRouter);
const blogRouter = require("./router/blog");
app.use(blogRouter);
const productRouter = require("./router/product");
app.use(productRouter);
const photoRouter = require("./router/photography");
app.use(photoRouter);
const orderRoutes = require("./router/order");
app.use(orderRoutes);

require("dotenv").config();
const paymentRoutes = require("./router/payment");
app.use(paymentRoutes);


const orderStatusCheck = require("./schedule"); // 定時任務
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
      err: err.message,
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
