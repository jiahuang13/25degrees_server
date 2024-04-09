const express = require('express')
const router = express.Router()

//導入用戶路由處理函數模塊
const articleHandler = require('../router_handler/article')

//導入驗證數據的中間件
// const expressJoi = require('@escook/express-joi')
// const {  } = require('../schema/user')

// 增
router.post('/article', articleHandler.addArticle)
// 查
router.get('/article', articleHandler.getAllArticle)
router.get('/article/:id', articleHandler.getOneArticle)
// 刪
router.delete('/article/:id', articleHandler.deleteArticle)
// 改
router.patch('/article/:id', articleHandler.updateArticle)

//將路由對象共享出去
module.exports = router