//導入數據庫模塊
const db = require("../db/index");
//導入加密的包
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')

//在這裡定義和用戶相關的路由處理函數 供 /router/user.js使用
exports.register = (req, res) => {
  const userInfo = req.body;
  console.log(userInfo);
  //非空判斷前端已完成，但建議後端還是要做一次
  // if (!userInfo.username || !userInfo.password) {
  //   return res.send({ status: 1, message: "帳號或密碼不能為空" });
  // }
  //定義sql語句，檢測用戶名是否被佔用 (佔位符若只有一個，數組可省略[])
  const sqlStr = "SELECT * FROM user WHERE username=?";
  db.query(sqlStr, [userInfo.username], (err, results) => {
    //執行sql語句失敗
    if (err) {
      return res.send({ status: 1, message: err.message });
    }
    //判斷用戶名是否被佔用
    else if(results.length > 0){
      return res.send({ status: 1, message: '帳號已被佔用，請更換其他帳號' });
      }
    else {
      //調用bcrypt.hashSync()對密碼進行加密
      userInfo.password = bcrypt.hashSync(userInfo.password,10)
      //定義插入新用戶的sql語句
      const sql = 'INSERT INTO user SET ?'
      //執行sql語句
      db.query(sql, userInfo, (err,results)=>{
        if(err){
          return res.send({status:1, message:err.message})
        }
        else if(results.affectedRows !== 1){
          return res.send({ status:1, message:'註冊失敗，請稍後再試'})
        }
        else {
          res.send({ status:0, message:"註冊成功"});
        }
      })
      }
  });
};

exports.login = (req, res) => {
  const userInfo = req.body
  // console.log(userInfo);
  const sqlStr = 'SELECT * FROM user WHERE username=?'
  db.query(sqlStr, [userInfo.username], (err, results) => {
    //執行sql失敗
    if (err) return res.send({ status:1, message: err.message})
    // 無返回數據亦失敗
    if(results.length !== 1){ return res.send({ status:1, message: '登入失敗'}) }
    //調用bcrypt.compareSync(用戶提交的密碼, 數據庫中的密碼) 比對密碼是否相同
    const compareResult = bcrypt.compareSync(userInfo.password, results[0].password)
    if(!compareResult){ return res.send({status:1, message:'帳號或密碼錯誤'}) }
    
    //在服務器生成token字符串 首先剔除密碼頭像等隱私信息（此為es6高級語法）
    const user = {...results[0], password:'', avatar:''}
    //對用戶信息加密 生成token jwt.sign(加密對象,密鑰,配置對象有效期)
    const tokenStr = jwt.sign(user, config.jwtSecretKey, {expiresIn: config.expiresIn})
    //將結果響應給客戶端
    res.send({ status:0, message: '登入成功', token: tokenStr }) 
  })
};

// -------------- 後台 ----------------
// 後台註冊
// exports.adminRegister = (req,res) => {
//   const sql = 'SELECT * FROM adminUser'
// }
// 後台登入
exports.adminLogin = (req,res) => {
  console.log(req.body);
  const sql = 'SELECT * FROM adminUser WHERE username=?'
  db.query(sql, req.body.username, (err,results) => {
    if(err){ return res.send({ status:1, message:err.message })}
    if(results.length !== 1){ return res.send({ status:1, message:'登入失敗' })}
    if(req.body.password !== results[0].password){return res.send({ status:1, message:'帳號或密碼錯誤' })}
    
    const tokenStr = jwt.sign({username: req.body.username}, config.jwtSecretKey, {expiresIn: config.expiresIn})
    res.send({ status:0, message:'登入成功', token: tokenStr})
  })
}

// 獲取所有會員
exports.getAllUser = (req,res) => {
  const sql = 'SELECT * FROM user ORDER BY id DESC'
  db.query(sql, (err,results) => {
    if(err){
      return res.send({status:1, message:err.message})
    }
    if(results.length === 0){ 
      return res.send({ status:1, message: '獲取所有會員失敗'}) }
    res.send({ status:0, message:'獲取所有會員成功', data:results })
  })
}

// 獲取單筆會員
exports.getOneUser = (req,res) => {
  const sql = 'SELECT * FROM user WHERE id=?'
  const id = req.auth.id
  db.query(sql, id, (err,results) => {
    if(err){
      return res.send({status:1, message:err.message})
      }
      if(results.length !== 1){
        console.log(results);
      return res.send({status:1, message:'獲取單筆會員失敗'})
      }
      res.send({status:1, message:'獲取單筆會員成功', data:results[0]})
  })
}

// 更新會員
exports.updateUser = (req,res) => {
  const sql = 'UPDATE user SET ? WHERE id=?'
  const id = req.params.id
  db.query(sql, [req.body, id], (err,results) => {
    if(err){
      return res.send({status:1, message:err.message})
      }
      if(results.affectedRows !== 1){
      return res.send({status:1, message:'更新會員失敗'})
      }
      res.send({status:0, message:'更新會員成功'})
  })
}

// 刪除會員
exports.deleteUser = (req,res) => {
  const sql = 'DELETE FROM user WHERE id=?'
  const id = req.params.id
  db.query(sql, id, (err,results) => {
    if(err){
      return res.send({status:1, message:err.message})
      }
      if(results.affectedRows !== 1){
      return res.send({status:1, message:'刪除會員失敗'})
      }
      res.send({status:0, message:'刪除會員成功'})
  })
}