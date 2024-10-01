const db = require("../db/index");
// 統一響應函數
const { successRes, errorRes } = require("../utils/response_handler");

// 獲取所有商品（依 ID 降序排列）
exports.getAllProduct = async (req, res) => {
  const sql = "SELECT * FROM product ORDER BY id DESC";
  try {
    const [results] = await db.query(sql);
    if (results.length === 0) {
      return errorRes(res, "獲取所有商品失敗", 404);
    }
    // 模擬延遲回應，方便前端測試 loading 動畫效果
    setTimeout(() => {
      successRes(res, "獲取所有商品成功", results);
    }, 1000);
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 獲取所有商品（隨機排序）
exports.getAllProductRand = async (req, res) => {
  const sql = "SELECT * FROM product ORDER BY RAND()";
  try {
    const [results] = await db.query(sql);
    if (results.length === 0) {
      return errorRes(res, "隨機獲取所有商品失敗", 404);
    }
    return successRes(res, "隨機獲取所有商品成功", results);
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 獲取單項商品（根據 ID）
exports.getOneProduct = async (req, res) => {
  const sql = "SELECT * FROM product WHERE id = ?";
  const id = req.params.id;

  try {
    const [results] = await db.query(sql, [id]);
    if (results.length !== 1) {
      return errorRes(res, `無法獲取 ID 為 ${id} 的商品`, 404);
    }
    return successRes(res, "獲取單項商品成功", results[0]);
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 新增商品
exports.addNewProduct = async (req, res) => {
  const sql = "INSERT INTO product SET ?";
  try {
    const [results] = await db.query(sql, req.body);
    if (results.affectedRows !== 1) {
      return errorRes(res, "新增商品失敗，請再試一次");
    }
    return successRes(res, "新增商品成功");
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 更新商品（根據 ID）
exports.updateProduct = async (req, res) => {
  const sql = "UPDATE product SET ? WHERE id = ?";
  const id = req.body.id;

  try {
    const [results] = await db.query(sql, [req.body, id]);
    if (results.affectedRows !== 1) {
      return errorRes(res, `無法更新 ID 為 ${id} 的商品`);
    }
    return successRes(res, "更新商品成功");
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 刪除商品（根據 ID）
exports.deleteProduct = async (req, res) => {
  const sql = "DELETE FROM product WHERE id = ?";
  const id = req.params.id;

  try {
    const [results] = await db.query(sql, [id]);
    if (results.affectedRows !== 1) {
      return errorRes(res, `無法刪除 ID 為 ${id} 的商品`);
    }
    return successRes(res, "刪除商品成功");
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 搜尋商品（根據條件：名稱、內容、類別）
exports.searchProduct = async (req, res) => {
  let sql = "SELECT * FROM product WHERE 1=1";
  const params = [];

  // 動態拼接 SQL 語句
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
    const [results] = await db.query(sql, params);
    if (results.length === 0) {
      return successRes(res, "沒有匹配結果", []);
    }
    return successRes(res, `搜尋結果共 ${results.length} 筆`, results);
  } catch (err) {
    return errorRes(res, err.message);
  }
};
