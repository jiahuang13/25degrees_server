const express = require("express");
const router = express.Router();
const userHandler = require("../router_handler/user");
const expressJoi = require("@escook/express-joi");
const {
  register_schema,
  login_schema,
  update_userInfo_schema,
  vCode_schema,
} = require("../schema/user");

router
  .post("/user/register", expressJoi(register_schema), userHandler.register) //註冊
  .post("/user/vCode", expressJoi(vCode_schema), userHandler.vCode) //驗證碼
  .post("/user/login", expressJoi(login_schema), userHandler.login) //登入

  .get("/user/auth", userHandler.getThisUser) // 取得此會員（req.auth）

  .get("/admin/user/all", userHandler.getAllUser) //取得所有會員
  .get("/admin/user/search", userHandler.searchUser) //搜尋會員
  .get("/admin/user/:id", userHandler.getUserById) // 取得單個會員
  .delete("/admin/user/:id", userHandler.deleteUser) //刪除會員
  .patch("/admin/user", expressJoi(update_userInfo_schema), userHandler.updateUser); // 更新會員

module.exports = router;
