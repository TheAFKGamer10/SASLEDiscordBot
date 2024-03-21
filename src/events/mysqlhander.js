// SQL Help by: https://www.w3schools.com/nodejs/nodejs_mysql.asp

module.exports = async (thingtodo, table, sqlstring) => {
    try {
        const mysql = require('mysql2');
        var mysqlconnection = mysql.createConnection(process.env.MYSQL_CONNECTION_STRING);

        async function connect() {
            return new Promise((resolve, reject) => {
                mysqlconnection.connect(function (err) {
                    if (err) reject(err);
                    resolve('Connected to database.');
                });
            });
        }

        async function close() {
            return new Promise((resolve, reject) => {
                mysqlconnection.end(function (err) {
                    if (err) reject(err);
                    resolve('Closed connection to database.');
                });
            });
        }

        if (thingtodo == 'connect') {
            return new Promise((resolve, reject) => {
                connect().then((result) => {
                    mysqlconnection.query('CREATE TABLE IF NOT EXISTS cadettrainings (id INT AUTO_INCREMENT PRIMARY KEY, passed BOOL, cadet_username VARCHAR(64), cadet_id BIGINT, fto_username VARCHAR(64), fto_id BIGINT, timestamp TEXT)', function (err, result) {
                        if (err) reject(err);
                        mysqlconnection.query('CREATE TABLE IF NOT EXISTS departmentjoins (id INT AUTO_INCREMENT PRIMARY KEY, forced BOOL, cadet_username VARCHAR(64), cadet_id BIGINT, department VARCHAR(64), admin_forced_username VARCHAR(64), admin_forced_id BIGINT, timestamp TEXT)', function (err, result) {
                            if (err) reject(err);
                            mysqlconnection.query('CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(64), password VARCHAR(64))', function (err, result) {
                                if (err) reject(err);
                                close().then(() => {
                                    resolve('Tables created. Connection closed.');
                                }).catch((error) => {
                                    reject(error);
                                });
                            });
                        });
                    });
                }).catch((error) => {
                    reject(error);
                });
            });
        }
        if (thingtodo == 'insert') {
            connect().then((result) => {
                let valuestemplate = '';
                if (table == 'cadettrainings') {
                    valuestemplate = '(passed, cadet_username, cadet_id, fto_username, fto_id, timestamp)';
                }
                if (table == 'departmentjoins') {
                    valuestemplate = '(forced, cadet_username, cadet_id, department, admin_forced_username, admin_forced_id, timestamp)';
                }
                if (table == 'users') {
                    valuestemplate = '(username, password)';
                }
    
                mysqlconnection.query(`INSERT INTO ${table} ${valuestemplate} VALUES ${sqlstring}`, function (err, result) {
                    if (err) throw err;
                    return result;
                });
                close().catch((error) => {console.log(error);});
            }).catch((error) => {
                console.log(error);
            });
        }
        if (thingtodo == 'select') {
            return new Promise((resolve, reject) => {
                mysqlconnection.connect(function (err) {
                    if (err) reject(err);
                    mysqlconnection.query(sqlstring, function (err, result, fields) {
                        if (err) reject(err);
                        resolve(result);
                    });
                });
            });
        }

    } catch (error) {
        console.log(error);
    }
};

