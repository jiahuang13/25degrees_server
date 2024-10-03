const db = require("../db/index");
const bcrypt = require("bcryptjs");
const { successRes, errorRes } = require("../utils/response_handler");

// -------------------- 用戶信息操作 ---------------------

// 取得用戶信息
exports.getUserInfo = async (req, res) => {
  const sql = "SELECT id, username, email FROM user WHERE id=?";
  const id = req.params.id || req.auth.id;

  try {
    const [results] = await db.query(sql, [id]);
    if (results.length !== 1) {
      return errorRes(res, "取得用戶信息失敗", 404);
    }
    return successRes(res, "取得用戶信息成功", results[0]);
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 更新用戶信息
exports.updateUserInfo = async (req, res) => {
  const sql = "UPDATE user SET ? WHERE id=?";
  try {
    const [results] = await db.query(sql, [req.body, req.auth.id]);
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
    const [results] = await db.query(sql, [req.auth.id]);

    if (results.length !== 1) {
      return errorRes(res, "用戶不存在", 404);
    }

    const compareResult = bcrypt.compareSync(
      req.body.oldPwd,
      results[0].password
    );
    if (!compareResult) {
      return errorRes(res, "舊密碼錯誤");
    }

    const bcryptNewPwd = bcrypt.hashSync(req.body.newPwd);
    const updateSql = "UPDATE user SET password=? WHERE id=?";
    const updateResults = await db.query(updateSql, [
      bcryptNewPwd,
      req.auth.id,
    ]);

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
    const [results] = await db.query(sql, [req.body.avatar, req.auth.id]);
    if (results.affectedRows !== 1) {
      return errorRes(res, "更新頭像失敗");
    }
    return successRes(res, "更新頭像成功");
  } catch (err) {
    return errorRes(res, err.message);
  }
};
