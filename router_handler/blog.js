const db = require("../db/index");
const { successRes, errorRes } = require("../utils/response_handler");

// 新增文章
exports.addBlog = async (req, res) => {
  const blog = req.body;
  const sql = "INSERT INTO blog SET ?";
  try {
    const [results] = await db.query(sql, [blog]); // 使用解構從返回的數組中取出結果
    if (results.affectedRows !== 1) {
      return errorRes(res, "新增失敗，請再試一次");
    }
    return successRes(res, "新增成功");
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 獲取所有文章
exports.getAllBlog = async (req, res) => {
  const sql = "SELECT * FROM blog ORDER BY id DESC";
  try {
    const [results] = await db.query(sql);
    if (results.length === 0) {
      return successRes(res, "目前沒有文章", []);
    }
    return successRes(res, "獲取所有文章成功", results);
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 獲取單篇文章
exports.getOneBlog = async (req, res) => {
  const sql = "SELECT * FROM blog WHERE id = ?";
  const id = req.params.id;
  try {
    const [results] = await db.query(sql, [id]);
    if (results.length !== 1) {
      return errorRes(res, "獲取單篇文章失敗", 404);
    }
    return successRes(res, "獲取單篇文章成功", results[0]);
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 刪除文章
exports.deleteBlog = async (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM blog WHERE id=?";
  try {
    const [results] = await db.query(sql, [id]);
    if (results.affectedRows !== 1) {
      return errorRes(res, "刪除文章失敗");
    }
    return successRes(res, "刪除文章成功");
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 更新文章
exports.updateBlog = async (req, res) => {
  const sql = "UPDATE blog SET ? WHERE id = ?";
  const id = req.body.id;
  try {
    const [results] = await db.query(sql, [req.body, id]);
    if (results.affectedRows !== 1) {
      return errorRes(res, "更新文章失敗");
    }
    return successRes(res, "更新文章成功");
  } catch (err) {
    return errorRes(res, err.message);
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
      return errorRes(res, "沒有匹配結果", 404);
    }
    return successRes(res, `搜尋結果共 ${results.length} 筆`, results);
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 獲取 3 篇隨機文章（排除自身）
exports.getThreeRandBlog = async (req, res) => {
  const id = req.query.id;
  const sql = `SELECT * FROM blog WHERE id != ? ORDER BY RAND() LIMIT 3`;
  try {
    const [results] = await db.query(sql, [id]);
    if (results.length < 1) {
      return errorRes(res, "獲取 3 篇隨機文章失敗", 404);
    }
    return successRes(res, "獲取 3 篇隨機文章成功", results);
  } catch (err) {
    return errorRes(res, err.message);
  }
};
