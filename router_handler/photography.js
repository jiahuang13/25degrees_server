const db = require('../db/index')

exports.getAllAlbum = (req,res) => {
  const sql = 'SELECT * FROM photo_album'
  db.query(sql, (err,results) => {
    if(err){
      return res.send({status:1, message:err.message})
    }
    if(results.length === 0){ 
      return res.send({ status:1, message: '獲取所有相簿失敗'}) }
    res.send({ status: 200, message:'獲取所有相簿成功', data:results })
  })
}

exports.getOneAlbum = (req,res) => {
  const sql = 'SELECT * FROM photo WHERE album_id=?'
  db.query(sql, req.params.id, (err,results) => {
    if(err){
      return res.send({status:1, message:err.message})
      }
      console.log(results);
      if(results.length === 0){
      return res.send({status:1, message:'獲取單一相簿失敗'})
      }
      res.send({status:1, message:'獲取單一相簿成功', data:results})
  })
}

exports.getAllDesign = (req,res) => {
  const sql = 'SELECT * FROM design'
  db.query(sql, (err,results) => {
    if(err){
      return res.send({status:1, message:err.message})
    }
    if(results.length === 0){
      return res.send({status:1, message:"獲取所有設計失敗"})
    }
    res.send({status: 200, message:"獲取所有設計成功", data:results})
  })
}