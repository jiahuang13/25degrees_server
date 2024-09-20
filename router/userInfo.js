const express = require("express");
const router = express.Router();
const userInfoHandler = require("../router_handler/userInfo");

//導入驗證數據的中間件
const expressJoi = require("@escook/express-joi");
const {
  update_userInfo_schema,
  update_pwd_schema,
  update_avatar_schema,
  address_schema,
} = require("../schema/user");

//獲取用戶信息的路由
router.get("/userinfo/:id", userInfoHandler.getUserInfo);

//更新用戶信息的路由
router.patch(
  "/userinfo/:id",
  expressJoi(update_userInfo_schema),
  userInfoHandler.updateUserInfo
);

//重置密碼的路由
router.post(
  "/update/password",
  expressJoi(update_pwd_schema),
  userInfoHandler.updatePwd
);

//更新頭像的路由
router.post(
  "/update/avatar",
  expressJoi(update_avatar_schema),
  userInfoHandler.updateAvatar
);

// ----------- 地址 ---------------
//新增
router.post(
  "/addAddress",
  expressJoi(address_schema),
  userInfoHandler.addAddress
);
//獲取
router.get("/addressList", userInfoHandler.getAddressList);
router.get("/address/:id", userInfoHandler.getAddressOne);
router.get("/addressDefault", userInfoHandler.getDefaultAddress);
//更新
router.patch(
  "/address/:id",
  expressJoi(address_schema),
  userInfoHandler.updateAddress
);

module.exports = router;
