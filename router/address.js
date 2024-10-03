const express = require("express");
const router = express.Router();
const addressHandler = require("../router_handler/address");
const expressJoi = require("@escook/express-joi");
const { address_schema } = require("../schema/user");

router
  .get("/address/all", addressHandler.getAddressList) // 取得某會員所有地址
  .get("/address/default", addressHandler.getDefaultAddress) // 取得某會員預設地址
  .get("/address/:id", addressHandler.getAddressOne) // 取得某會員單個地址
  .post("/address/add", expressJoi(address_schema), addressHandler.addAddress) // 新增地址
  .patch(
    "/address/:id",
    expressJoi(address_schema),
    addressHandler.updateAddress
  ); // 更新地址
// 刪除地址(待補)

module.exports = router;
