const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', 
    password: 'Aditya@19', 
    database: 'admission_form'
});

// Export a promise-based pool
const promisePool = pool.promise();

module.exports = promisePool;
