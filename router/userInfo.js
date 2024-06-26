const express = require('express')
const router = express.Router()
const userInfoHandler = require('../router_handler/userInfo')

//導入驗證數據的中間件
const expressJoi = require('@escook/express-joi')
const { update_userInfo_schema, update_pwd_schema, update_avatar_schema } = require('../schema/user')

//獲取用戶信息的路由
router.get('/userinfo/:id', userInfoHandler.getUserInfo)

//更新用戶信息的路由
router.patch('/userinfo/:id', expressJoi(update_userInfo_schema), userInfoHandler.updateUserInfo)

//重置密碼的路由
router.post('/update/password', expressJoi(update_pwd_schema), userInfoHandler.updatePwd)

//更新頭像的路由
router.post('/update/avatar',expressJoi(update_avatar_schema), userInfoHandler.updateAvatar)

module.exports = router