// 引入數據庫模塊
const db = require("../db/index");
// 引入統一響應函數
const { successRes, errorRes } = require("../utils/response");

// 取得所有相簿
exports.getAllAlbum = async (req, res) => {
  const sql = "SELECT * FROM photo_album";

  try {
    const [results] = await db.query(sql);
    if (results.length === 0) {
      return errorRes("無法取得所有相簿，資料為空", 404);
    }
    return successRes("取得所有相簿成功", results);
  } catch (err) {
    console.error(err);
    return errorRes(err.message);
  }
};

// 取得單一相簿
exports.getOneAlbum = async (req, res) => {
  const sql = "SELECT * FROM photo WHERE album_id=?";
  const albumId = req.params.id;

  try {
    const [results] = await db.query(sql, [albumId]);
    if (results.length === 0) {
      return errorRes(`無法取得相簿 ID: ${albumId}`, 404);
    }
    return successRes("取得單一相簿成功", results);
  } catch (err) {
    console.error(err);
    return errorRes(err.message);
  }
};

// 取得所有設計
exports.getAllDesign = async (req, res) => {
  const sql = "SELECT * FROM design";

  try {
    const [results] = await db.query(sql);
    if (results.length === 0) {
      return errorRes("無法取得所有設計，資料為空", 404);
    }
    return successRes("取得所有設計成功", results);
  } catch (err) {
    console.error(err);
    return errorRes(err.message);
  }
};
