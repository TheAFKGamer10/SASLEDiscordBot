// SQL Help by: https://www.w3schools.com/nodejs/nodejs_mysql.asp

module.exports = async (thingtodo, table, sqlstring) => {
    try {
        const mysql = require('mysql2');
        var mysqlconnection = mysql.createConnection(process.env.MYSQL_CONNECTION_STRING);

        if (thingtodo == 'connect') {
            mysqlconnection.connect(function (err) {
                if (err) throw err;
                console.log('Connected to database.');
            });
            mysqlconnection.query('CREATE TABLE IF NOT EXISTS cadettrainings (id INT AUTO_INCREMENT PRIMARY KEY, passed BOOL, cadet_username VARCHAR(64), cadet_id BIGINT, fto_username VARCHAR(64), fto_id BIGINT, timestamp TEXT)', function (err, result) {
                if (err) throw err;
            });
            mysqlconnection.query('CREATE TABLE IF NOT EXISTS departmentjoins (id INT AUTO_INCREMENT PRIMARY KEY, forced BOOL, cadet_username VARCHAR(64), cadet_id BIGINT, department VARCHAR(64), admin_forced_username VARCHAR(64), admin_forced_id BIGINT, timestamp TEXT)', function (err, result) {
                if (err) throw err;
            });
        }

        if (thingtodo == 'insert') {
            let valuestemplate = '';
            if (table == 'cadettrainings') {
                valuestemplate = '(passed, cadet_username, cadet_id, fto_username, fto_id, timestamp)';
            }
            if (table == 'departmentjoins') {
                valuestemplate = '(forced, cadet_username, cadet_id, department, admin_forced_username, admin_forced_id, timestamp)';
            }

            mysqlconnection.query(`INSERT INTO ${table} ${valuestemplate} VALUES ${sqlstring}`, function (err, result) {
                if (err) throw err;
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

