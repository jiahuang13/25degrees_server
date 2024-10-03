const express = require("express");
const router = express.Router();
const handler = require("../router_handler/product");

router
  .get("/api/product/search", handler.searchProduct) // 搜尋商品
  .get("/api/product/random", handler.getAllProductRand) // 取得所有商品（隨機排序）
  .get("/api/product/:id", handler.getOneProduct) // 取得單個商品
  .get("/api/product", handler.getAllProduct) // 取得所有商品

  .post("/admin/product", handler.addNewProduct) // 新增商品
  .delete("/admin/product/:id", handler.deleteProduct) // 刪除商品
  .patch("/admin/product", handler.updateProduct); // 更新商品

module.exports = router;
