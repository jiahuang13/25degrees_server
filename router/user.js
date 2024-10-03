const express = require("express");
const router = express.Router();
const handler = require("../router_handler/user");
const joi = require("@escook/express-joi");
const {
  register,
  login,
  update_userInfo,
  vCode,
  email,
  newPassword
} = require("../schema/user");

router
  .post("/api/register", joi(register), handler.register) //註冊
  .post("/api/v-code/register", joi(vCode), handler.vCodeRegister) //驗證碼（註冊）
  .post("/api/v-code/forgot-password", joi(vCode), handler.vCodeForgotPwd) //驗證碼（忘記密碼）
  .post("/api/login", joi(login), handler.login) //登入
  .post("/api/forgot-password", joi(email), handler.forgotPassword) //忘記密碼
  .post("/api/reset-password", joi(newPassword), handler.resetPassword) //重置密碼

  .get("/user/auth", handler.getThisUser) // 取得此會員（req.auth）

  .get("/admin/user/all", handler.getAllUser) //取得所有會員
  .get("/admin/user/search", handler.searchUser) //搜尋會員
  .get("/admin/user/:id", handler.getUserById) // 取得單個會員
  .delete("/admin/user/:id", handler.deleteUser) //刪除會員
  .patch("/admin/user", joi(update_userInfo), handler.updateUser); // 更新會員

module.exports = router;
