const express = require("express");
const router = express.Router();

//導入用戶路由處理函數模塊
const userHandler = require("../router_handler/user");
// const redisClient = require("../redis-client")

//導入驗證數據的中間件
const expressJoi = require("@escook/express-joi");
const {
  register_schema,
  login_schema,
  update_userInfo_schema,
  verificationCode_schema,
} = require("../schema/user");

//註冊
router.post("/register", expressJoi(register_schema), userHandler.register);
//驗證碼
router.post(
  "/verificationCode",
  expressJoi(verificationCode_schema),
  userHandler.verificationCode
);
//登入
router.post("/login", expressJoi(login_schema), userHandler.login);

// ---------- 後台管理 ---------------
// 查
router.get("/user/all", userHandler.getAllUser);
router.get("/user/search", userHandler.searchUser)
router.get("/user/:id", userHandler.getUserById);
router.get("/user", userHandler.getThisUser);

// 刪
router.delete("/user/:id", userHandler.deleteUser);
// 改
router.patch(
  "/user",
  expressJoi(update_userInfo_schema),
  userHandler.updateUser
);

//將路由對象共享出去
module.exports = router;
