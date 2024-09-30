const express = require('express')
const router = express.Router()

//導入用戶路由處理函數模塊
const blogHandler = require('../router_handler/blog')

//導入驗證數據的中間件
// const expressJoi = require('@escook/express-joi')
// const {  } = require('../schema/user')

// 增
router.post('/blog', blogHandler.addBlog)
// 查
router.get('/blog/threeRand', blogHandler.getThreeRandBlog)
router.get('/blog/search', blogHandler.searchBlog)
router.get('/blog/:id', blogHandler.getOneBlog)
router.get('/blog', blogHandler.getAllBlog)
// 刪
router.delete('/blog/:id', blogHandler.deleteBlog)
// 改
router.patch('/blog/:id', blogHandler.updateBlog)

//將路由對象共享出去
module.exports = router