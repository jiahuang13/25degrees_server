const db = require("../db/index");
const { successRes, errorRes } = require("../utils/response");

// 新增文章
exports.addBlog = async (req, res) => {
  const blog = req.body;
  const sql = "INSERT INTO blog SET ?";
  try {
    const [results] = await db.query(sql, [blog]); // 使用解構從返回的數組中取出結果
    if (results.affectedRows !== 1) {
      return errorRes("新增失敗，請再試一次");
    }
    return successRes("新增成功");
  } catch (err) {
    return errorRes(err.message);
  }
};

// 取得所有文章
exports.getAllBlog = async (req, res) => {
  const sql = "SELECT * FROM blog ORDER BY id DESC";
  try {
    const [results] = await db.query(sql);
    if (results.length === 0) {
      return successRes("目前沒有文章", []);
    }
    return successRes("取得所有文章成功", results);
  } catch (err) {
    return errorRes(err.message);
  }
};

// 取得單篇文章
exports.getOneBlog = async (req, res) => {
  const sql = "SELECT * FROM blog WHERE id = ?";
  const id = req.params.id;
  try {
    const [results] = await db.query(sql, [id]);
    if (results.length !== 1) {
      return errorRes("取得單篇文章失敗", 404);
    }
    return successRes("取得單篇文章成功", results[0]);
  } catch (err) {
    return errorRes(err.message);
  }
};

// 刪除文章
exports.deleteBlog = async (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM blog WHERE id=?";
  try {
    const [results] = await db.query(sql, [id]);
    if (results.affectedRows !== 1) {
      return errorRes("刪除文章失敗");
    }
    return successRes("刪除文章成功");
  } catch (err) {
    return errorRes(err.message);
  }
};

// 更新文章
exports.updateBlog = async (req, res) => {
  const sql = "UPDATE blog SET ? WHERE id = ?";
  const id = req.body.id;
  try {
    const [results] = await db.query(sql, [req.body, id]);
    if (results.affectedRows !== 1) {
      return errorRes("更新文章失敗");
    }
    return successRes("更新文章成功");
  } catch (err) {
    return errorRes(err.message);
  }
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
    const [results] = await db.query(sql, params);
    if (results.length < 1) {
      return successRes("沒有匹配結果", []);
    }
    return successRes(`搜尋結果共 ${results.length} 筆`, results);
  } catch (err) {
    return errorRes(err.message);
  }
};

// 取得 3 篇隨機文章（排除自身）
exports.getThreeRandBlog = async (req, res) => {
  const id = req.query.id;
  const sql = `SELECT * FROM blog WHERE id != ? ORDER BY RAND() LIMIT 3`;
  try {
    const [results] = await db.query(sql, [id]);
    if (results.length < 1) {
      return errorRes("取得 3 篇隨機文章失敗", 404);
    }
    return successRes("取得 3 篇隨機文章成功", results);
  } catch (err) {
    return errorRes(err.message);
  }
};
