//導入數據庫模塊
const db = require("../db/index");

// 獲取所有商品
exports.getAllProduct = (req, res) => {
  const sql = "SELECT * FROM product ORDER BY id DESC";
  db.query(sql, (err, results) => {
    if (err) {
      return res.send({ status: 1, message: err.message });
    }
    if (results.length === 0) {
      return res.send({ status: 1, message: "獲取所有商品失敗" });
    }
    setTimeout(() => {
      res.send({ status: 200, message: "獲取所有商品成功", data: results });
    }, 1000);
  });
};

// 獲取所有商品 隨機
exports.getAllProductRand = (req, res) => {
  const sql = "SELECT * FROM product ORDER BY RAND()";
  db.query(sql, (err, results) => {
    if (err) {
      return res.send({ status: 1, message: err.message });
    }
    if (results.length === 0) {
      return res.send({ status: 1, message: "隨機獲取所有商品失敗" });
    }
    res.send({ status: 200, message: "隨機獲取所有商品成功", data: results });
  });
};

// 獲取單項商品
exports.getOneProduct = (req, res) => {
  const sql = "SELECT * FROM product WHERE id=?";
  const id = req.params.id;
  db.query(sql, id, (err, results) => {
    if (err) {
      return res.send({ status: 1, message: err.message });
    }
    if (results.length !== 1) {
      return res.send({ status: 1, message: "獲取單項商品失敗" });
    }
    res.send({ status: 1, message: "獲取單項商品成功", data: results[0] });
  });
};

// 新增商品
exports.addNewProduct = (req, res) => {
  const sql = "INSERT INTO product SET ?";
  db.query(sql, req.body, (err, results) => {
    if (err) {
      return res.send({ status: 1, message: err.message });
    }
    if (results.affectedRows !== 1) {
      return res.send({ status: 1, message: "新增商品失敗，請再試一次" });
    }
    res.send({ status: 200, message: "新增商品成功" });
  });
};

// 更新商品
exports.updateProduct = (req, res) => {
  // console.log(req.body);

  const sql = "UPDATE product SET ? WHERE id=?";
  const id = req.body.id;
  db.query(sql, [req.body, id], (err, results) => {
    if (err) {
      return res.send({ status: 1, message: err.message });
    }
    if (results.affectedRows !== 1) {
      return res.send({ status: 1, message: "更新商品失敗" });
    }
    res.send({ status: 200, message: "更新商品成功" });
  });
};

// 刪除商品
exports.deleteProduct = (req, res) => {
  const sql = "DELETE FROM product WHERE id=?";
  const id = req.params.id;
  db.query(sql, id, (err, results) => {
    if (err) {
      return res.send({ status: 1, message: err.message });
    }
    if (results.affectedRows !== 1) {
      return res.send({ status: 1, message: "刪除商品失敗" });
    }
    res.send({ status: 200, message: "刪除商品成功" });
  });
};

// 搜尋商品
exports.searchProduct = async (req, res) => {
  let sql = "SELECT * FROM product WHERE 1=1";
  const params = [];

  if (req.query.name) {
    sql += " AND name LIKE ?";
    params.push(`%${req.query.name}%`);
  }
  if (req.query.content) {
    sql += " AND content LIKE ?";
    params.push(`%${req.query.content}%`);
  }
  if (req.query.category) {
    sql += " AND category = ?";
    params.push(req.query.category);
  }
  try {
    const results = await db.query(sql, params);
    if (results.length < 1) {
      return res.status(200).json({ message: "沒有匹配結果", data: [] });
    } else {
      // console.log(results);
      return res
        .status(200)
        .json({ message: `搜尋結果共${results.length}筆`, data: results });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: err.message });
  }
};
