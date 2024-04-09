const express = require('express')
const router = express.Router()

//導入用戶路由處理函數模塊
const productHandler = require('../router_handler/product')

// 查
router.get('/product', productHandler.getAllProduct)
router.get('/product/:id', productHandler.getOneProduct)
// 增
router.post('/product', productHandler.addNewProduct)
// 刪
router.delete('/product/:id', productHandler.deleteProduct)
// 改
router.patch('/product/:id', productHandler.updateProduct)

//將路由對象共享出去
module.exports = router