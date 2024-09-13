const mysql = require('mysql')

const db = mysql.createPool({
  host: 'localhost',
  user: 'db',
  password: '2HkDNbAsRampAjWs',
  database: 'db'
})

module.exports = db