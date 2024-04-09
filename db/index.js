const mysql = require('mysql')

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root1234',
  database: '25degrees'
})

module.exports = db