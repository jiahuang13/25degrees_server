// 導入數據庫模塊
const db = require("../db/index");
// 導入加密的包
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");
const nodemailer = require("nodemailer");
const client = require("../redis-client");

// 使用 Nodemailer 配置發送郵件
const transporter = nodemailer.createTransport({
  service: "Gmail", // 你可以選擇其他郵件服務提供商
  auth: {
    user: "jiahuang0513@gmail.com",
    pass: "pcixtmdsxlycelwe", // 應用專用密碼
  },
});

// ------------------------ 註冊 ----------------------------
exports.register = async (req, res) => {
  const userInfo = req.body;

  try {
    // 檢查電子郵件是否被佔用
    const emailResults = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM user WHERE email=?",
        [userInfo.email],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });

    if (emailResults.length > 0) {
      return res.send({ status: 1, message: "該信箱已被使用" });
    }

    // 檢查帳號是否被佔用
    const usernameResults = await new Promise((resolve, reject) => {
      db.query(
        "SELECT * FROM user WHERE username=?",
        [userInfo.username],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });

    if (usernameResults.length > 0) {
      return res.send({ status: 1, message: "該帳號已被使用" });
    }

    // 生成驗證碼，並將用戶資訊及驗證碼存入 redis，設定 5 分鐘失效
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString(); // 確保是字符串

    await client.set(
      userInfo.email,
      JSON.stringify({ userInfo, verificationCode }),
      { EX: 3000 }
    );
    console.log("Redis 中設置成功");

    // 電郵之內容設定與發送
    const mailOptions = {
      from: "jiahuang0513@gmail.com",
      to: userInfo.email,
      subject: "25 degrees 註冊驗證",
      text: `您的驗證碼是：${verificationCode}`,
    };

    // 使用 async/await 發送郵件
    const info = await new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("郵件發送失敗:", error);
          return reject(error);
        }
        resolve(info);
      });
    });

    // 所有操作完成後發送響應
    return res.send({ status: 200, message: "請至信箱獲取驗證碼" });
  } catch (err) {
    console.error("伺服器錯誤:", err);
    return res
      .status(500)
      .send({ status: 1, message: "伺服器錯誤，請稍後再試" });
  }
};

// -------------------- 驗證驗證碼 ---------------------------
exports.verificationCode = async (req, res) => {
  const { email, verificationCode } = req.body;
  // console.log(req.body, email, verificationCode);

  try {
    // 使用 await 從 Redis 中獲取驗證碼，從 json 轉字符串
    const jsonData = await client.get(email);
    const data = JSON.parse(jsonData);
    // console.log(data);

    const userInfo = data.userInfo;
    console.log("userinfo", userInfo);

    if (!data) {
      // 如果 Redis 中沒有該 email 的 data
      return res.send({ status: 1, message: "驗證碼已過期或無效" });
    }

    // 比較 Redis 中的驗證碼和用戶提交的驗證碼
    if (data.verificationCode === verificationCode) {
      console.log("驗證碼符合");
      // 若驗證碼符合，密碼加密並插入數據庫
      userInfo.password = bcrypt.hashSync(userInfo.password, 10);
      const sqlPwd = "INSERT INTO user SET ?";
      db.query(sqlPwd, userInfo, async (err, results) => {
        if (err) {
          return res.send({ status: 1, message: err.message });
        }
        // console.log(results);
        if (results.affectedRows !== 1) {
          return res.send({ status: 1, message: "註冊失敗，請稍後再試" });
        } else {
          // 刪除驗證碼，避免重複使用
          await client.del(email);

          return res.send({
            status: 200,
            message: "註冊成功，跳轉登入頁面",
          });
        }
      });
    } else {
      return res.send({ status: 1, message: "驗證碼不正確" });
    }
  } catch (err) {
    // 捕捉 Redis 操作錯誤
    console.error("Redis error:", err);
    return res.send({ status: 1, message: "驗證碼已過期或無效" });
  }
};

// 登入
exports.login = (req, res) => {
  const userInfo = req.body;
  const sqlStr = "SELECT * FROM user WHERE username=?";
  db.query(sqlStr, [userInfo.username], (err, results) => {
    if (err) return res.send({ status: 1, message: err.message });
    if (results.length !== 1)
      return res.send({ status: 1, message: "帳號或密碼錯誤" });
    const compareResult = bcrypt.compareSync(
      userInfo.password,
      results[0].password
    );
    if (!compareResult)
      return res.send({ status: 1, message: "帳號或密碼錯誤" });

    const user = { ...results[0], password: "", avatar: "" };
    const tokenStr = jwt.sign(user, config.jwtSecretKey, {
      expiresIn: config.expiresIn,
    });
    res.send({ status: 200, message: "登入成功", token: tokenStr });
  });
};

// 後台登入
exports.adminLogin = (req, res) => {
  const sql = "SELECT * FROM adminUser WHERE username=?";
  db.query(sql, req.body.username, (err, results) => {
    if (err) return res.send({ status: 1, message: err.message });
    if (results.length !== 1)
      return res.send({ status: 1, message: "登入失敗" });
    if (req.body.password !== results[0].password)
      return res.send({ status: 1, message: "帳號或密碼錯誤" });

    const tokenStr = jwt.sign(
      { username: req.body.username },
      config.jwtSecretKey,
      { expiresIn: config.expiresIn }
    );
    res.send({ status: 200, message: "登入成功", token: tokenStr });
  });
};

// 獲取所有會員
exports.getAllUser = (req, res) => {
  const sql = "SELECT * FROM user ORDER BY id DESC";
  db.query(sql, (err, results) => {
    if (err) return res.send({ status: 1, message: err.message });
    if (results.length === 0)
      return res.send({ status: 1, message: "獲取所有會員失敗" });
    res.send({ status: 200, message: "獲取所有會員成功", data: results });
  });
};

// 獲取單筆會員
exports.getOneUser = (req, res) => {
  const sql = "SELECT * FROM user WHERE id=?";
  const id = req.auth.id;
  db.query(sql, id, (err, results) => {
    if (err) return res.send({ status: 1, message: err.message });
    if (results.length !== 1)
      return res.send({ status: 1, message: "獲取單筆會員失敗" });
    res.send({ status: 200, message: "獲取單筆會員成功", data: results[0] });
  });
};

// 更新會員
exports.updateUser = (req, res) => {
  const sql = "UPDATE user SET ? WHERE id=?";
  const id = req.params.id;
  db.query(sql, [req.body, id], (err, results) => {
    if (err) return res.send({ status: 1, message: err.message });
    if (results.affectedRows !== 1)
      return res.send({ status: 1, message: "更新會員失敗" });
    res.send({ status: 200, message: "更新會員成功" });
  });
};

// 刪除會員
exports.deleteUser = (req, res) => {
  const sql = "DELETE FROM user WHERE id=?";
  const id = req.params.id;
  db.query(sql, id, (err, results) => {
    if (err) return res.send({ status: 1, message: err.message });
    if (results.affectedRows !== 1)
      return res.send({ status: 1, message: "刪除會員失敗" });
    res.send({ status: 200, message: "刪除會員成功" });
  });
};
