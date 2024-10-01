const db = require("../db/index");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");
const nodemailer = require("nodemailer");
const client = require("../redis-client");
// 統一響應函數
const { successRes, errorRes } = require("../utils/response_handler");

// 配置 Nodemailer 來發送郵件
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "jiahuang0513@gmail.com",
    pass: "pcixtmdsxlycelwe",
  },
});

// ------------------------ 註冊 ----------------------------
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // 檢查信箱是否被使用
    const [emailResults] = await db.query("SELECT * FROM user WHERE email=?", [
      email,
    ]);
    if (emailResults.length > 0) {
      return errorRes(res, "該信箱已被使用", 400);
    }

    // 檢查帳號是否被使用
    const [usernameResults] = await db.query(
      "SELECT * FROM user WHERE username=?",
      [username]
    );
    if (usernameResults.length > 0) {
      return errorRes(res, "該帳號已被使用", 400);
    }

    // 生成驗證碼
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // 儲存驗證碼與用戶資訊到 Redis
    await client.set(
      email,
      JSON.stringify({ username, email, password, verificationCode }),
      { EX: 300 }
    );

    // 設定郵件內容
    const mailOptions = {
      from: "jiahuang0513@gmail.com",
      to: email,
      subject: "25 degrees 註冊驗證",
      text: `您的驗證碼是：${verificationCode}`,
    };

    // 發送郵件
    await transporter.sendMail(mailOptions);

    return successRes(res, "請至信箱獲取驗證碼");
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// -------------------- 驗證驗證碼 ---------------------------
exports.verificationCode = async (req, res) => {
  const { email, verificationCode } = req.body;

  try {
    // 從 Redis 獲取驗證碼及用戶資訊
    const jsonData = await client.get(email);
    if (!jsonData) {
      return errorRes(res, "驗證碼已過期或無效");
    }

    const {
      username,
      password,
      verificationCode: savedCode,
    } = JSON.parse(jsonData);

    // 驗證驗證碼是否正確
    if (savedCode !== verificationCode) {
      return errorRes(res, "驗證碼不正確", 400);
    }

    // 密碼加密後寫入數據庫
    const hashedPassword = bcrypt.hashSync(password, 10);
    const sql = "INSERT INTO user (username, email, password) VALUES (?, ?, ?)";
    const [results] = await db.query(sql, [username, email, hashedPassword]);

    if (results.affectedRows !== 1) {
      return errorRes(res, "註冊失敗，請稍後再試");
    }

    // 註冊成功後刪除 Redis 中的驗證碼
    await client.del(email);
    return successRes(res, "註冊成功，跳轉登入頁面");
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// -------------------- 登入 ---------------------------
exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const sql = "SELECT * FROM user WHERE username = ?";
    const [results] = await db.query(sql, [username]);

    if (results.length !== 1) {
      return errorRes(res, "帳號或密碼錯誤", 404);
    }

    // 驗證密碼是否正確
    const isValid = bcrypt.compareSync(password, results[0].password);
    if (!isValid) {
      return errorRes(res, "帳號或密碼錯誤");
    }

    // 簽發 JWT Token
    const user = { ...results[0], password: "" };
    const tokenStr = jwt.sign(user, config.jwtSecretKey, {
      expiresIn: config.expiresIn,
    });
    return successRes(res, "登入成功", { token: tokenStr });
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 獲取所有會員
exports.getAllUser = async (req, res) => {
  const sql =
    "SELECT id, username, email, role, created_at FROM user ORDER BY id DESC";
  try {
    const [results] = await db.query(sql);
    if (results.length === 0) {
      return errorRes(res, "獲取所有會員失敗", 404);
    }
    return successRes(res, "獲取所有會員成功", results);
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 獲取會員本人
exports.getThisUser = async (req, res) => {
  const sql =
    "SELECT id, username, email, role, created_at FROM user WHERE id = ?";
  const id = req.auth.id;
  try {
    const [results] = await db.query(sql, [id]);
    if (results.length !== 1) {
      return errorRes(res, "獲取會員本人失敗", 404);
    }
    return successRes(res, "獲取會員本人成功", results[0]);
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 獲取會員 透過 id
exports.getUserById = async (req, res) => {
  const sql = "SELECT id, username, email, role FROM user WHERE id=?";
  const id = req.params.id;

  try {
    const results = await db.query(sql, [id]);
    if (results.length !== 1) {
      return errorRes(res, `獲取會員 ${id} 失敗`, 404);
    }
    return successRes(res, `獲取會員 ${id} 成功`, results[0]);
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 更新會員
exports.updateUser = async (req, res) => {
  const { id, username, email, role } = req.body;
  const sql = "UPDATE user SET username = ?, email = ?, role = ? WHERE id = ?";

  try {
    const [results] = await db.query(sql, [username, email, role, id]);
    if (results.affectedRows !== 1) {
      return errorRes(res, `更新會員 ${id} 失敗`);
    }
    return successRes(res, `更新會員 ${id} 成功`);
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 刪除會員
exports.deleteUser = async (req, res) => {
  const sql = "DELETE FROM user WHERE id = ?";
  const id = req.params.id;

  try {
    const [results] = await db.query(sql, [id]);
    if (results.affectedRows !== 1) {
      return errorRes(res, `刪除會員 ${id} 失敗`);
    }
    return successRes(res, `刪除會員 ${id} 成功`);
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 搜尋會員
exports.searchUser = async (req, res) => {
  let sql = "SELECT id, username, email, role, created_at FROM user WHERE 1=1";
  const params = [];

  if (req.query.username) {
    sql += " AND username LIKE ?";
    params.push(`%${req.query.username}%`);
  }
  if (req.query.email) {
    sql += " AND email LIKE ?";
    params.push(`%${req.query.email}%`);
  }
  if (req.query.role) {
    sql += " AND role = ?";
    params.push(req.query.role);
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
