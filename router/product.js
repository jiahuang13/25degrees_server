const express = require("express");
const router = express.Router();
const productHandler = require("../router_handler/product");

router
  .get("/api/product/search", productHandler.searchProduct) // 搜尋商品
  .get("/api/product/random", productHandler.getAllProductRand) // 取得所有商品（隨機排序）
  .get("/api/product/:id", productHandler.getOneProduct) // 取得單個商品
  .get("/api/product", productHandler.getAllProduct) // 取得所有商品

  .post("/admin/product", productHandler.addNewProduct) // 新增商品
  .delete("/admin/product/:id", productHandler.deleteProduct) // 刪除商品
  .patch("/admin/product", productHandler.updateProduct); // 更新商品

module.exports = router;
