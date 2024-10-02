const db = require("../db/index");
const { successRes, errorRes } = require("../utils/response_handler");

// 取得所有地址
exports.getAddressList = async (req, res) => {
  const sql = "SELECT * FROM addresses WHERE user_id=?";
  try {
    const [results] = await db.query(sql, [req.auth.id]);
    if (results.length === 0) {
      return successRes(res, "目前沒有地址", []);
    }
    return successRes(res, "取得所有地址成功", results);
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 依據 ID 取得單一地址
exports.getAddressOne = async (req, res) => {
  const sql = "SELECT * FROM addresses WHERE id=?";
  try {
    const [results] = await db.query(sql, [req.params.id]);
    if (results.length !== 1) {
      return errorRes(res, "取得地址失敗", 404);
    }
    return successRes(res, "取得地址成功", results[0]);
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 取得預設地址
exports.getDefaultAddress = async (req, res) => {
  const sql = "SELECT * FROM addresses WHERE user_id =? AND is_default = 1";
  try {
    const [results] = await db.query(sql, [req.auth.id]);
    if (results.length === 0) {
      return successRes(res, "目前沒有預設地址", []);
    }
    return successRes(res, "取得預設地址成功", results[0]);
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 更新地址
exports.updateAddress = async (req, res) => {
  const { id } = req.params;
  const data = req.body;

  try {
    if (data.is_default === 1) {
      const resetSql = "UPDATE addresses SET is_default = 0 WHERE user_id = ?";
      await db.query(resetSql, [req.auth.id]);
    }

    const updateSql = "UPDATE addresses SET ? WHERE id = ?";
    const [updateResults] = await db.query(updateSql, [data, id]);

    if (updateResults.affectedRows !== 1) {
      return errorRes(res, "更新地址失敗");
    }
    return successRes(res, "更新地址成功");
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 新增地址
exports.addAddress = async (req, res) => {
  const data = { ...req.body, user_id: req.auth.id };

  try {
    if (data.is_default === 1) {
      const resetSql = "UPDATE addresses SET is_default = 0 WHERE user_id = ?";
      await db.query(resetSql, [req.auth.id]);
    }

    const insertSql = "INSERT INTO addresses SET ?";
    const [insertResults] = await db.query(insertSql, [data]);

    if (insertResults.affectedRows !== 1) {
      return errorRes(res, "新增地址失敗");
    }
    return successRes(res, "新增地址成功");
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 刪除地址
exports.deleteAddress = async (req, res) => {
  const { id } = req.params;

  try {
    if (data.is_default === 1) {
      const resetSql = "UPDATE addresses SET is_default = 0 WHERE user_id = ?";
      await db.query(resetSql, [req.auth.id]);
    }

    const updateSql = "UPDATE addresses SET ? WHERE id = ?";
    const [updateResults] = await db.query(updateSql, [data, id]);

    if (updateResults.affectedRows !== 1) {
      return errorRes(res, "更新地址失敗");
    }
    return successRes(res, "更新地址成功");
  } catch (err) {
    return errorRes(res, err.message);
  }
};
