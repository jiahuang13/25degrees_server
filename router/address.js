const express = require("express");
const router = express.Router();
const addressHandler = require("../router_handler/address");

//導入驗證數據的中間件
const expressJoi = require("@escook/express-joi");
const {
  address_schema,
} = require("../schema/user");


// ----------- 地址 ---------------
//新增
router.post(
  "/addAddress",
  expressJoi(address_schema),
  addressHandler.addAddress
);
//取得
router.get("/address/all", addressHandler.getAddressList);
router.get("/address/default", addressHandler.getDefaultAddress);
router.get("/address/:id", addressHandler.getAddressOne);
//更新
router.patch(
  "/address/:id",
  expressJoi(address_schema),
  addressHandler.updateAddress
);

module.exports = router;