const joi = require('joi')

//定義用戶名和密碼的驗證規則
const username = joi.string().alphanum().min(5).max(10).required()
const password = joi.string().pattern(/^[\S]{5,20}$/).required()
const id = joi.number().integer().min(1).required()
const nickname = joi.string()
const email = joi.string().email().required()
const avatar = joi.string().dataUri()

//驗證規則對象：註冊和登錄表單
exports.register_login_schema = {
  body: {
    username, password
  }
}

//驗證規則對象：更新用戶信息
exports.update_userInfo_schema = {
  body: {
    username, email
    //是nickname:nickname, email:email 的簡寫
  },
  params: {
    id
  }
}

//驗證規則對象：重置密碼
exports.update_pwd_schema = {
  body: {
    oldPwd: password,
    //
    newPwd: joi.not(joi.ref('oldPwd')).concat(password)
  }
}

//驗證規則對象：更新頭像
exports.update_avatar_schema = {
  body: {
    avatar
  }
}