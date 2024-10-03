const joi = require("joi");

//定義用戶名和密碼的驗證規則
const username = joi.string().alphanum().min(5).max(20).required();
const password = joi
  .string()
  .pattern(/^[\S]{5,20}$/)
  .required();
const id = joi.number().integer().min(1).required();
const nickname = joi.string();
const email = joi.string().email().required();
const avatar = joi.string().dataUri();
const vCode = joi.string().length(6).pattern(/^\d+$/).required();
// const user_id = joi.number().integer().min(1).required();
const phone = joi
  .string()
  .pattern(/^09\d{8}$/)
  .required();
const address = joi.string().min(5).max(255).required();
const recipient_name = joi.string().max(255).required();
const is_default = joi.number().valid(0, 1).required();
const city = joi.string().min(6).max(10).required();
const address_detail = joi.string().min(2).max(255).required();
const role = joi.number().integer().min(0).required();

//驗證規則對象：註冊表單
exports.register = {
  body: {
    username,
    password,
    email,
  },
};

// 登入表單
exports.login = {
  body: {
    username,
    password,
  },
};

// 驗證碼
exports.vCode = {
  body: {
    email,
    vCode,
  },
};

// 信箱
exports.email = {
  body: {
    email,
  },
};

exports.newPassword = {
  body: {
    email,
    password,
  },
};

//驗證規則對象：更新用戶信息
exports.update_userInfo = {
  body: {
    id,
    username,
    email,
    role,
    //是nickname:nickname, email:email 的簡寫
  },
};

//驗證規則對象：重置密碼
exports.update_pwd = {
  body: {
    oldPwd: password,
    //
    newPwd: joi.not(joi.ref("oldPwd")).concat(password),
  },
};

//驗證規則對象：更新頭像
exports.update_avatar = {
  body: {
    avatar,
  },
};

// 新增地址
exports.address = {
  body: {
    // user_id,
    recipient_name,
    phone,
    address,
    is_default,
    city,
    detail: address_detail,
  },
};
