const express = require("express");
const router = express.Router();

//導入用戶路由處理函數模塊
const productHandler = require("../router_handler/product");

// 查
router.get("/product/search", productHandler.searchProduct);
router.get("/productRand", productHandler.getAllProductRand);
router.get("/product/:id", productHandler.getOneProduct);
router.get("/product", productHandler.getAllProduct);
// 增
router.post("/product", productHandler.addNewProduct);
// 刪
router.delete("/product/:id", productHandler.deleteProduct);
// 改
router.patch("/product", productHandler.updateProduct);

//將路由對象共享出去
module.exports = router;
