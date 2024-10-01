//導入數據庫模塊
const db = require("../db/index");

// 新增文章
exports.addBlog = (req, res) => {
  // 接收文章對象
  const blog = req.body;
  console.log(blog);
  const sql = "INSERT INTO blog SET ?";
  db.query(sql, blog, (err, results) => {
    if (err) {
      return res.send({ status: 1, message: err.message });
    }
    if (results.affectedRows !== 1) {
      return res.send({ status: 1, message: "新增失敗，請再試一次" });
    }
    res.send({ status: 200, message: "新增成功" });
  });
};

// 查詢所有文章
exports.getAllBlog = (req, res) => {
  const sql = "SELECT * FROM blog ORDER BY id DESC";
  db.query(sql, (err, results) => {
    if (err) {
      return res.send({ status: 1, message: err.message });
    }
    if (results.length === 0) {
      return res.send({ status: 1, message: "獲取所有文章失敗" });
    }
    res.send({ status: 200, message: "獲取所有文章成功", data: results });
  });
};

// 查詢單篇文章
exports.getOneBlog = (req, res) => {
  const sql = "SELECT * FROM blog WHERE id = ?";
  const id = req.params.id;
  db.query(sql, id, (err, results) => {
    if (err) {
      return res.send({ status: 1, message: err.message });
    }
    if (results.length !== 1) {
      return res.send({ status: 1, message: "獲取單篇文章失敗" });
    }
    res.send({ status: 1, message: "獲取單篇文章成功", data: results[0] });
  });
};

// 刪除文章
exports.deleteBlog = (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM blog WHERE id=?";
  db.query(sql, id, (err, results) => {
    if (err) {
      return res.send({ status: 1, message: err.message });
    }
    if (results.affectedRows !== 1) {
      return res.send({ status: 1, message: "刪除文章失敗" });
    }
    res.send({ status: 200, message: "刪除文章成功" });
  });
};

// 更新文章
exports.updateBlog = (req, res) => {
  const sql = "UPDATE blog SET ? WHERE id = ?";
  const id = req.body.id;
  db.query(sql, [req.body, id], (err, results) => {
    if (err) {
      return res.send({ status: 1, message: err.message });
    }
    if (results.affectedRows !== 1) {
      return res.send({ status: 1, message: "更新文章失敗" });
    }
    res.send({ status: 200, message: "更新文章成功" });
  });
};

// 搜尋文章
exports.searchBlog = async (req, res) => {
  let sql = "SELECT * FROM blog WHERE 1=1";
  const params = [];

  if (req.query.title) {
    sql += " AND title LIKE ?";
    params.push(`%${req.query.title}%`);
  }
  if (req.query.content) {
    sql += " AND content LIKE ?";
    params.push(`%${req.query.content}%`);
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

// 獲取 3 篇隨機文章（排除自身）
exports.getThreeRandBlog = (req, res) => {
  const id = req.query.id;
  const sql = `SELECT * FROM blog WHERE id != ? ORDER BY RAND() LIMIT 3`;
  db.query(sql, [id], (err, results) => {
    if (err) {
      return res.send({ status: 1, message: err.message });
    }
    if (results.length < 1) {
      return res.send({ status: 1, message: "獲取3篇隨機文章失敗" });
    }
    res.send({ status: 200, message: "獲取3篇隨機文章成功", data: results });
  });
};
