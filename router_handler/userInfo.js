const db = require('../db/index')
const bcrypt = require('bcryptjs')

//獲取用戶信息的處理函數
exports.getUserInfo = (req,res)=>{
  
  //為防止密碼洩漏 排除 password 字段
  const sql = 'SELECT id, username, nickname, email, avatar FROM user WHERE id=?'
  //expressJWT會將token解析出的
  const id = req.params.id | req.auth.id

  db.query(sql, [id], (err,results)=>{
    //執行sql語句的錯誤
    if(err){ return res.send({ status:1, message: err.message }) }
    //
    if(results.length !== 1){ return res.send({ status:1, message:'獲取用戶信息失敗' }) }
    
    res.send({
      status: 200,
      message: '獲取用戶信息成功',
      data: results[0]
    }) 
  })
  }

//更新用戶信息的處理函數
exports.updateUserInfo = (req,res)=>{
    //sql語句
    const sql = 'UPDATE user SET ? WHERE id=?'

    db.query(sql,[req.body, req.auth.id], (err,results)=>{
      if(err){return res.send({ status:1, message: err.message })}
      // console.log(results);
      if(results.affectedRows !== 1){return res.send({ status:1, message:'更新用戶信息失敗' })}
      res.send({
        status: 200, message: '更新用戶信息成功'
      })
    })
  }

//重置密碼的處理函數
exports.updatePwd = (req,res) => {
  //根據id查詢用戶是否存在
  const sql = 'SELECT * FROM user WHERE id=?'
  db.query(sql, [req.auth.id], (err,results)=>{
    if(err){ return res.send({ status:1, message:err.message }) }
    if(results.length !== 1){ return res.send({ status:1, message:'用戶不存在' }) }
    //判斷提交的舊密碼是否正確 調用bcrypt.compareSync(提交的密碼, 數據庫中的密碼) 比對是否相同
    const compareResult = bcrypt.compareSync(req.body.oldPwd, results[0].password)
    if(!compareResult){ return res.send({ status:1, message:'舊密碼錯誤' }) }
    //調用bcrypt.hashSync()對新密碼進行加密(可只傳需加密的明文，第二個參數鹽可省略) 更新到數據庫
    const bcryptNewPwd = bcrypt.hashSync(req.body.newPwd)
    const sql = 'UPDATE user SET password=? WHERE id=?'
    db.query(sql, [bcryptNewPwd, req.auth.id], (err,results)=>{
      if(err){ return res.send({ status:1, message:err.message }) }
      if(results.affectedRows !== 1){ return res.send({ status:1, message:'更新密碼失敗' }) }
      res.send({ status: 200, message:'更新密碼成功' })
    })
  })
}

//更新頭像的處理函數
exports.updateAvatar = (req,res) => {
  const sql = 'UPDATE user SET avatar=? WHERE id=?'
  db.query(sql,[req.body.avatar, req.auth.id], (err,results)=>{
    if(err){ return res.send({ status:1, message:err.message }) }
    if(results.affectedRows !== 1){ return res.send({ status:1, message:'更新頭像失敗' }) }
    res.send({ status: 200, message: '更新頭像成功' })
  })
}