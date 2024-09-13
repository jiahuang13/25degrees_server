// 導入數據庫模塊
const db = require("../db/index");
// 導入加密的包
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const nodemailer = require('nodemailer');
const client = require('../redis-client');

// 使用 Nodemailer 配置發送郵件
const transporter = nodemailer.createTransport({
  service: 'Gmail',  // 你可以選擇其他郵件服務提供商
  auth: {
    user: 'jiahuang0513@gmail.com',
    pass: 'pcixtmdsxlycelwe',  // 應用專用密碼
  },
});

// 註冊
exports.register = async (req, res) => {
  const userInfo = req.body;
  console.log(typeof req.body);

  // 非空判斷
  if (!userInfo.username || !userInfo.password || !userInfo.email) {
    return res.send({ status: 1, message: "帳號、密碼或電子郵件不能為空" });
  }

  // 簡單的 email 格式驗證
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(userInfo.email)) {
    return res.send({ status: 1, message: "請提供有效的電子郵件地址" });
  }

  try {
    // 檢查電子郵件是否被佔用
    const sqlEmailCheck = "SELECT * FROM user WHERE email=?";
    const [emailResults] = await db.query(sqlEmailCheck, [userInfo.email]);

    if (emailResults.length > 0) {
      return res.send({ status: 1, message: "該郵件地址已被使用" });
    }

    // 檢查用戶名是否被佔用
    const sqlStr = "SELECT * FROM user WHERE username=?";
    const [usernameResults] = await db.query(sqlStr, [userInfo.username]);

    if (usernameResults.length > 0) {
      return res.send({ status: 1, message: '帳號已被佔用，請更換其他帳號' });
    }

    // 發送電子郵件驗證碼
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString(); // 確保是字符串
    await client.setex(userInfo.email, 600, verificationCode, (err, reply) => {
  if (err) {
    console.error('Redis set error:', err);
  } else {
    console.log('Redis set success:', reply);
  }
});
 // 存入 Redis 600秒=10分鐘

    const mailOptions = {
      from: 'jiahuang0513@gmail.com',
      to: userInfo.email,
      subject: '25 degrees 註冊驗證',
      text: `您的驗證碼是：${verificationCode}`,
    };

    // 發送郵件
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error('Error while sending email:', error);
        return res.status(500).json({ success: false, message: '郵件發送失敗', error: error.message });
      }
    });

    // 密碼加密並插入數據庫
    userInfo.password = bcrypt.hashSync(userInfo.password, 10);
    const sql = 'INSERT INTO user SET ?';
    const [insertResults] = await db.query(sql, userInfo);

    if (insertResults.affectedRows !== 1) {
      return res.send({ status: 1, message: '註冊失敗，請稍後再試' });
    }

    res.send({ status: 0, message: "註冊成功，請檢查電子郵件完成驗證" });
  } catch (err) {
    res.send({ status: 1, message: err.message });
  }
};

// 驗證驗證碼
exports.verificationCode = (req, res) => {
  const { email, code } = req.body;

  // 從 Redis 中獲取驗證碼
  client.get(email, (err, storedCode) => {
    if (err) {
      return res.status(500).json({ message: '伺服器錯誤' });
    }
    if (storedCode === null) {
      return res.status(400).json({ message: '驗證碼已過期' });
    }
    if (storedCode !== code) {
      return res.status(400).json({ message: '驗證碼錯誤' });
    }
    res.json({ message: '驗證成功' });
  });
};


// 登入
exports.login = (req, res) => {
  const userInfo = req.body;
  const sqlStr = 'SELECT * FROM user WHERE username=?';
  db.query(sqlStr, [userInfo.username], (err, results) => {
    if (err) return res.send({ status: 1, message: err.message });
    if (results.length !== 1) return res.send({ status: 1, message: '帳號或密碼錯誤' });
    const compareResult = bcrypt.compareSync(userInfo.password, results[0].password);
    if (!compareResult) return res.send({ status: 1, message: '帳號或密碼錯誤' });

    const user = { ...results[0], password: '', avatar: '' };
    const tokenStr = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn });
    res.send({ status: 0, message: '登入成功', token: tokenStr });
  });
};

// 後台登入
exports.adminLogin = (req, res) => {
  const sql = 'SELECT * FROM adminUser WHERE username=?';
  db.query(sql, req.body.username, (err, results) => {
    if (err) return res.send({ status: 1, message: err.message });
    if (results.length !== 1) return res.send({ status: 1, message: '登入失敗' });
    if (req.body.password !== results[0].password) return res.send({ status: 1, message: '帳號或密碼錯誤' });

    const tokenStr = jwt.sign({ username: req.body.username }, config.jwtSecretKey, { expiresIn: config.expiresIn });
    res.send({ status: 0, message: '登入成功', token: tokenStr });
  });
};

// 獲取所有會員
exports.getAllUser = (req, res) => {
  const sql = 'SELECT * FROM user ORDER BY id DESC';
  db.query(sql, (err, results) => {
    if (err) return res.send({ status: 1, message: err.message });
    if (results.length === 0) return res.send({ status: 1, message: '獲取所有會員失敗' });
    res.send({ status: 0, message: '獲取所有會員成功', data: results });
  });
};

// 獲取單筆會員
exports.getOneUser = (req, res) => {
  const sql = 'SELECT * FROM user WHERE id=?';
  const id = req.auth.id;
  db.query(sql, id, (err, results) => {
    if (err) return res.send({ status: 1, message: err.message });
    if (results.length !== 1) return res.send({ status: 1, message: '獲取單筆會員失敗' });
    res.send({ status: 0, message: '獲取單筆會員成功', data: results[0] });
  });
};

// 更新會員
exports.updateUser = (req, res) => {
  const sql = 'UPDATE user SET ? WHERE id=?';
  const id = req.params.id;
  db.query(sql, [req.body, id], (err, results) => {
    if (err) return res.send({ status: 1, message: err.message });
    if (results.affectedRows !== 1) return res.send({ status: 1, message: '更新會員失敗' });
    res.send({ status: 0, message: '更新會員成功' });
  });
};

// 刪除會員
exports.deleteUser = (req, res) => {
  const sql = 'DELETE FROM user WHERE id=?';
  const id = req.params.id;
  db.query(sql, id, (err, results) => {
    if (err) return res.send({ status: 1, message: err.message });
    if (results.affectedRows !== 1) return res.send({ status: 1, message: '刪除會員失敗' });
    res.send({ status: 0, message: '刪除會員成功' });
  });
};
