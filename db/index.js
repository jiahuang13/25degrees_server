const mysql = require('mysql')

const db = mysql.createPool({
  host: '54.206.42.24',
  user: 'root',
  password: 'root1234',
  database: '25degrees'
})

module.exports = db