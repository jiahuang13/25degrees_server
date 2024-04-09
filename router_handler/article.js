//導入數據庫模塊
const db = require("../db/index");

// 處理函數
// 新增文章
exports.addArticle = (req,res) => {
  // 接收文章對象
  const article = req.body
  console.log(article);
  const sql = 'INSERT INTO article SET ?'
  db.query(sql, article, (err,results) => {
    if(err) {
      return res.send({status:1, message:err.message})
    }
    if(results.affectedRows !== 1) {
      return res.send({status:1, message:'新增失敗，請再試一次'})
    }
    res.send({status:0, message:'新增成功'})
  })
}

// 查詢所有文章
exports.getAllArticle = (req,res) => {
const sql = 'SELECT * FROM article ORDER BY id DESC'
db.query(sql,(err,results) => {
  if(err){
    return res.send({status:1, message:err.message})
  }
  if(results.length === 0){ 
    return res.send({ status:1, message: '獲取所有文章失敗'}) }
  res.send({ status:0, message:'獲取所有文章成功', data:results })
})
}

// 查詢單篇文章
exports.getOneArticle = (req,res) => {
  const sql = 'SELECT * FROM article WHERE id=?'
  const id = req.params.id
  db.query(sql, id, (err,results)=>{
    if(err){
    return res.send({status:1, message:err.message})
    }
    if(results.length !== 1){
    return res.send({status:1, message:'獲取單篇文章失敗'})
    }
    res.send({status:1, message:'獲取單篇文章成功', data:results[0]})
  })
}

// 刪除文章
exports.deleteArticle = (req,res) => {
  const id = req.params.id
  const sql = 'DELETE FROM article WHERE id=?'
  db.query(sql, id, (err,results)=>{
    if(err){
    return res.send({status:1, message:err.message})
    }
    if(results.affectedRows !== 1){
    return res.send({status:1, message:'刪除文章失敗'})
    }
    res.send({status:0, message:'刪除文章成功'})
  })
}

// 更新文章
exports.updateArticle = (req,res) => {
  const sql = 'UPDATE article SET ? WHERE id=?'
  const id = req.params.id
  db.query(sql, [req.body, id], (err,results)=>{
    if(err){
      return res.send({status:1, message:err.message})
      }
      if(results.affectedRows !== 1){
      return res.send({status:1, message:'更新文章失敗'})
      }
      res.send({status:0, message:'更新文章成功'})
  })
}