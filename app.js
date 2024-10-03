const express = require("express");
const app = express();
const joi = require("joi");
const cors = require("cors");
const { verifyAccess } = require("./middlewares/auth");

// 引入自定義的響應函數
const { successRes, errorRes } = require("./utils/response");

// 使用跨域中間件
app.use(cors());

// 配置解析 x-www-form-urlencoded 表單數據的中間件
app.use(express.urlencoded({ extended: false }));

// 配置解析 json 表單數據的中間件
app.use(express.json());

// 在 `res` 中掛載自定義響應函數，方便全局使用
app.use((req, res, next) => {
  res.successRes = (message, data = null) => successRes(res, message, data);
  res.errorRes = (message, statusCode = 500) => errorRes(res, message, statusCode);
  next();
});

// 全局身份驗證與權限檢查中間件
app.use(verifyAccess());
app.use("/admin", verifyAccess(2));

// 引入並使用統一管理的路由模組
const routes = require("./router");
app.use(routes);

// 引入環境變數配置
require("dotenv").config();

// 引入並使用支付路由模組
const paymentRoutes = require("./router/payment");
app.use(paymentRoutes);

// 定時任務執行模組（注意：不需要執行它，只需引入）
require("./schedule"); // 這裡不需要調用，只引入模組即可

// 統一錯誤處理中間件
app.use((err, req, res, next) => {
  // 處理 joi 驗證錯誤
  if (err instanceof joi.ValidationError) {
    return res.errorRes(`驗證失敗: ${err.message}`, 400);
  }

  // 處理身份認證失敗的錯誤
  if (err.name === "UnauthorizedError") {
    return res.errorRes("身份認證失敗，請重新登入", 401);
  }

  // 處理未知錯誤
  console.error("未知錯誤：", err);
  return res.errorRes("伺服器內部錯誤，請聯繫管理員", 500);
});

// 設定伺服器端口
const port = process.env.PORT || 3008;
app.listen(port, () => {
  console.log(`Server is running at port ${port}`);
});
