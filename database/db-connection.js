const mysql = require('mysql2/promise')

const connection = mysql.createPool({
    host: 'mysql', // Replace with your MySQL host
    user: 'root', // Replace with your MySQL username
    password: 'your_mysql_password', // Replace with your MySQL password
    database: 'user_api', // Replace with your database name
})

module.exports = connection
