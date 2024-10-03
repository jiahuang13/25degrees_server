const express = require("express");
const router = express.Router();
const handler = require("../router_handler/address");
const joi = require("@escook/express-joi");
const { address } = require("../schema/user");

router
  .get("/address/all", handler.getAddressList) // 取得某會員所有地址
  .get("/address/default", handler.getDefaultAddress) // 取得某會員預設地址
  .get("/address/:id", handler.getAddressOne) // 取得某會員單個地址
  .post("/address/add", joi(address), handler.addAddress) // 新增地址
  .patch("/address/:id", joi(address), handler.updateAddress); // 更新地址
// 刪除地址(待補)

module.exports = router;
