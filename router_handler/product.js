//導入數據庫模塊
const db = require("../db/index");

// 獲取所有商品
exports.getAllProduct = (req,res) => {
  const sql = 'SELECT * FROM product ORDER BY id DESC'
  db.query(sql, (err,results) => {
    if(err){
      return res.send({status:1, message:err.message})
    }
    if(results.length === 0){ 
      return res.send({ status:1, message: '獲取所有商品失敗'}) }
    res.send({ status: 200, message:'獲取所有商品成功', data:results })
  })
}

// 獲取單項商品
exports.getOneProduct = (req,res) => {
  const sql = 'SELECT * FROM product WHERE id=?'
  const id = req.params.id
  db.query(sql, id, (err,results) => {
    if(err){
      return res.send({status:1, message:err.message})
      }
      if(results.length !== 1){
      return res.send({status:1, message:'獲取單項商品失敗'})
      }
      res.send({status:1, message:'獲取單項商品成功', data:results[0]})
  })
}

// 新增商品
exports.addNewProduct = (req,res) => {
  const sql = 'INSERT INTO product SET ?'
  db.query(sql, req.body, (err, results) => {
    if(err){
      return res.send({status:1, message:err.message})
    }
    if(results.affectedRows !== 1) {
      return res.send({status:1, message:'新增商品失敗，請再試一次'})
    }
    res.send({status: 200, message:'新增商品成功'})
  })
}

// 更新商品
exports.updateProduct = (req,res) => {
  const sql = 'UPDATE product SET ? WHERE id=?'
  const id = req.params.id
  db.query(sql, [req.body, id], (err,results) => {
    if(err){
      return res.send({status:1, message:err.message})
      }
      if(results.affectedRows !== 1){
      return res.send({status:1, message:'更新商品失敗'})
      }
      res.send({status: 200, message:'更新商品成功'})
  })
}

// 刪除商品
exports.deleteProduct = (req,res) => {
  const sql = 'DELETE FROM product WHERE id=?'
  const id = req.params.id
  db.query(sql, id, (err,results) => {
    if(err){
      return res.send({status:1, message:err.message})
      }
      if(results.affectedRows !== 1){
      return res.send({status:1, message:'刪除商品失敗'})
      }
      res.send({status: 200, message:'刪除商品成功'})
  })
}