const db = require("../db/index");
const bcrypt = require("bcryptjs");
// 統一響應函數
const {
  successRes,
  errorRes,
} = require("../utils/response_handler");

// -------------------- 用戶信息操作 ---------------------

// 獲取用戶信息
exports.getUserInfo = async (req, res) => {
  const sql = "SELECT id, username, nickname, email, avatar FROM user WHERE id=?";
  const id = req.params.id || req.auth.id;

  try {
    const results = await db.query(sql, [id]);
    if (results.length !== 1) {
      return errorRes(res, "獲取用戶信息失敗", 404);
    }
    return successRes(res, "獲取用戶信息成功", results[0]);
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 更新用戶信息
exports.updateUserInfo = async (req, res) => {
  const sql = "UPDATE user SET ? WHERE id=?";
  try {
    const results = await db.query(sql, [req.body, req.auth.id]);
    if (results.affectedRows !== 1) {
      return errorRes(res, "更新用戶信息失敗");
    }
    return successRes(res, "更新用戶信息成功");
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 重置密碼
exports.updatePwd = async (req, res) => {
  try {
    const sql = "SELECT * FROM user WHERE id=?";
    const results = await db.query(sql, [req.auth.id]);

    if (results.length !== 1) {
      return errorRes(res, "用戶不存在", 404);
    }

    const compareResult = bcrypt.compareSync(req.body.oldPwd, results[0].password);
    if (!compareResult) {
      return errorRes(res, "舊密碼錯誤");
    }

    const bcryptNewPwd = bcrypt.hashSync(req.body.newPwd);
    const updateSql = "UPDATE user SET password=? WHERE id=?";
    const updateResults = await db.query(updateSql, [bcryptNewPwd, req.auth.id]);

    if (updateResults.affectedRows !== 1) {
      return errorRes(res, "更新密碼失敗");
    }
    return successRes(res, "更新密碼成功");
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 更新用戶頭像
exports.updateAvatar = async (req, res) => {
  const sql = "UPDATE user SET avatar=? WHERE id=?";
  try {
    const results = await db.query(sql, [req.body.avatar, req.auth.id]);
    if (results.affectedRows !== 1) {
      return errorRes(res, "更新頭像失敗");
    }
    return successRes(res, "更新頭像成功");
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// -------------------- 地址操作 -------------------------

// 獲取所有地址
exports.getAddressList = async (req, res) => {
  const sql = "SELECT * FROM addresses WHERE user_id=?";
  try {
    const results = await db.query(sql, [req.auth.id]);
    if (results.length === 0) {
      return errorRes(res, "獲取所有地址失敗", 404);
    }
    return successRes(res, "獲取所有地址成功", results);
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 依據 ID 獲取單一地址
exports.getAddressOne = async (req, res) => {
  const sql = "SELECT * FROM addresses WHERE id=?";
  try {
    const results = await db.query(sql, [req.params.id]);
    if (results.length !== 1) {
      return errorRes(res, "獲取地址失敗", 404);
    }
    return successRes(res, "獲取地址成功", results[0]);
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 獲取預設地址
exports.getDefaultAddress = async (req, res) => {
  const sql = "SELECT * FROM addresses WHERE user_id =? AND is_default = 1";
  try {
    const results = await db.query(sql, [req.auth.id]);
    if (results.length !== 1) {
      return errorRes(res, "獲取預設地址失敗", 404);
    }
    return successRes(res, "獲取預設地址成功", results[0]);
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
    const updateResults = await db.query(updateSql, [data, id]);

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
    const insertResults = await db.query(insertSql, [data]);

    if (insertResults.affectedRows !== 1) {
      return errorRes(res, "新增地址失敗");
    }
    return successRes(res, "新增地址成功");
  } catch (err) {
    return errorRes(res, err.message);
  }
};
