const mysql = require('mysql')

const db = mysql.createPool({
  host: '144.48.241.22',
  user: 'db',
  password: '2HkDNbAsRampAjWs',
  database: 'db'
})

module.exports = db