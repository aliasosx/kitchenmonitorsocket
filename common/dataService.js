var mysql = require('mysql');
var conn = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "123",
    database: "atlas"
});

function queryExec(sql, callback) {
    console.log(sql);
    if (sql.substring(0, 6).toUpperCase()) {
        conn.getConnection(function (err, connection) {
            connection.query(sql, function (err, rows) {
                if (err) {
                    callback(err, rows);
                } else {
                    callback(err, rows);
                }
                connection.release();
            });
        });
    }
}
function getCurrentOrder(callback) {
    let sql = "select * from order_trackings";
    queryExec(sql, callback);
}

module.exports = {
    queryExec,
    getCurrentOrder,
}