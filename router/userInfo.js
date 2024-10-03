const express = require("express");
const router = express.Router();
const userInfoHandler = require("../router_handler/userInfo");

//導入驗證數據的中間件
const joi = require("@escook/express-joi");
const {
  update_userInfo,
  update_pwd,
  update_avatar,
} = require("../schema/user");

//取得用戶信息的路由
router.get("/userinfo/:id", userInfoHandler.getUserInfo);

//更新用戶信息的路由
router.patch(
  "/userinfo/:id",
  joi(update_userInfo),
  userInfoHandler.updateUserInfo
);

//重置密碼的路由
router.post("/update/password", joi(update_pwd), userInfoHandler.updatePwd);

//更新頭像的路由
router.post("/update/avatar", joi(update_avatar), userInfoHandler.updateAvatar);

module.exports = router;
