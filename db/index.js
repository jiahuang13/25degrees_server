const mysql = require("mysql");
const util = require("util");

const db = mysql.createPool({
  host: "144.48.241.22",
  user: "db",
  password: "2HkDNbAsRampAjWs",
  database: "db",
});

// 使用 promisify 將 query 方法封裝為 Promise
db.query = util.promisify(db.query);

module.exports = db;
