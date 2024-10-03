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
    const vCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 儲存驗證碼與用戶資訊到 Redis
    await client.set(
      email,
      JSON.stringify({ username, email, password, vCode }),
      { EX: 300 }
    );

    // 設定郵件內容
    const mailOptions = {
      from: "jiahuang0513@gmail.com",
      to: email,
      subject: "25 degrees 註冊驗證",
      text: `您的驗證碼是：${vCode}`,
    };

    // 發送郵件
    await transporter.sendMail(mailOptions);

    return successRes(res, "請至信箱取得驗證碼");
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// -------------------- 驗證驗證碼 ---------------------------
exports.vCodeRegister = async (req, res) => {
  const { email, vCode } = req.body;

  try {
    // 從 Redis 取得驗證碼及用戶資訊
    const jsonData = await client.get(email);
    if (!jsonData) {
      return errorRes(res, "驗證碼已過期或無效，請重新註冊");
    }

    const { username, password, vCode: savedCode } = JSON.parse(jsonData);

    // 驗證驗證碼是否正確
    if (savedCode !== vCode) {
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
    const user = { ...results[0], password: "", email: "", created_at: "" }; // 取 id, username, role 生成 token
    const tokenStr = jwt.sign(user, config.jwtSecretKey, {
      expiresIn: config.expiresIn,
    });
    return successRes(res, "登入成功", { token: tokenStr });
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// -------------------- 請求重置密碼 ---------------------------
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // 檢查用戶是否存在
    const [results] = await db.query("SELECT * FROM user WHERE email = ?", [
      email,
    ]);
    if (results.length === 0) {
      return errorRes(res, "該信箱未註冊", 404);
    }

    // 生成重置驗證碼
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    // 儲存驗證碼到 Redis，有效期 5 分鐘
    await client.set(email, resetCode, { EX: 3000 });

    // 發送郵件通知
    const mailOptions = {
      from: "jiahuang0513@gmail.com",
      to: email,
      subject: "25 degrees 密碼重置",
      text: `您的密碼重置驗證碼是：${resetCode}，請在 5 分鐘內使用`,
    };

    await transporter.sendMail(mailOptions);
    return successRes(res, "驗證碼已發送到您的信箱");
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// -------------------- 驗證重置驗證碼 ---------------------------
exports.vCodeForgotPwd = async (req, res) => {
  const { email, vCode } = req.body;

  try {
    // 取得 Redis 中儲存的重置驗證碼
    const savedCode = await client.get(email);

    if (!savedCode) {
      return errorRes(res, "驗證碼已過期或無效，請重新請求重置密碼", 400);
    }

    // 驗證碼是否正確
    if (savedCode !== vCode) {
      return errorRes(res, "驗證碼不正確", 400);
    }

    // 驗證通過後，設置 Redis 中的標記來允許重置密碼
    await client.set(`reset_allowed_${email}`, 1, { EX: 3000 }); // 允許 5 分鐘內重設密碼

    return successRes(res, "驗證碼正確，請設置新密碼");
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 設置新密碼
exports.resetPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 檢查是否已通過驗證
    const resetAllowed = await client.get(`reset_allowed_${email}`);
    if (!resetAllowed) {
      return errorRes(res, "無效或已過期的請求，請重新進行驗證", 400);
    }

    // 將新密碼加密後更新到數據庫
    const hashedPassword = bcrypt.hashSync(password, 10);
    const sql = "UPDATE user SET password = ? WHERE email = ?";
    const [results] = await db.query(sql, [hashedPassword, email]);

    if (results.affectedRows !== 1) {
      return errorRes(res, "重置密碼失敗，請稍後再試");
    }

    // 重設密碼成功後刪除 Redis 中的標記
    await client.del(`reset_allowed_${email}`);

    return successRes(res, "密碼重設成功，請重新登入");
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 取得所有會員
exports.getAllUser = async (req, res) => {
  const sql =
    "SELECT id, username, email, role, created_at FROM user ORDER BY id DESC";
  try {
    const [results] = await db.query(sql);
    if (results.length === 0) {
      return errorRes(res, "取得所有會員失敗", 404);
    }
    return successRes(res, "取得所有會員成功", results);
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 取得會員本人
exports.getThisUser = async (req, res) => {
  const sql =
    "SELECT id, username, email, role, created_at FROM user WHERE id = ?";
  const id = req.auth.id;
  try {
    const [results] = await db.query(sql, [id]);
    if (results.length !== 1) {
      return errorRes(res, "取得會員本人失敗", 404);
    }
    return successRes(res, "取得會員本人成功", results[0]);
  } catch (err) {
    return errorRes(res, err.message);
  }
};

// 取得會員 透過 id
exports.getUserById = async (req, res) => {
  const sql = "SELECT id, username, email, role FROM user WHERE id=?";
  const id = req.params.id;

  try {
    const [results] = await db.query(sql, [id]);
    if (results.length !== 1) {
      return errorRes(res, `取得會員 ${id} 失敗`, 404);
    }
    return successRes(res, `取得會員 ${id} 成功`, results[0]);
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
