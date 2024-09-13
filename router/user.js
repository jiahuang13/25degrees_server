const express = require('express')
const router = express.Router()

//導入用戶路由處理函數模塊
const userHandler = require('../router_handler/user')

//導入驗證數據的中間件
const expressJoi = require('@escook/express-joi')
const { register_login_schema, update_userInfo_schema, verificationCode_schema } = require('../schema/user')

//註冊
router.post('/register', expressJoi(register_login_schema), userHandler.register)
//驗證碼
router.post('/verificationCode', expressJoi(verificationCode_schema), userHandler.verificationCode)
//登入
router.post('/login', expressJoi(register_login_schema), userHandler.login)

// ---------- 後台管理 ---------------
// 查
router.get('/user/all', userHandler.getAllUser)
router.get('/user', userHandler.getOneUser)
// 增(同註冊)
// 刪
router.delete('/user/:id', userHandler.deleteUser)
// 改
router.patch('/user/:id', expressJoi(update_userInfo_schema), userHandler.updateUser)

//後台登入
router.post('/admin/login', userHandler.adminLogin)

//將路由對象共享出去
module.exports = router