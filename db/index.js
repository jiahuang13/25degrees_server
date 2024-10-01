const mysql = require("mysql2/promise"); // 改用 mysql2 的 promise 版本

const db = mysql.createPool({
  host: "144.48.241.22",  // 雲端資料庫的連接設定保持不變
  user: "db",
  password: "2HkDNbAsRampAjWs",
  database: "db",
});

module.exports = db;
