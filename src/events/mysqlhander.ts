// SQL Help by: https://www.w3schools.com/nodejs/nodejs_mysql.asp
// Table Types: https://www.w3schools.com/mysql/mysql_datatypes.asp

export default async (thingtodo: string, table: string, sqlstring: any) => {
    try {
        const env = require('dotenv').config();
        const mysql = require('mysql2');
        var mysqlconnection = mysql.createConnection(env.parsed.MYSQL_CONNECTION_STRING);

        async function connect() {
            return new Promise((resolve, reject) => {
                mysqlconnection.connect(function (err: any) {
                    if (err) reject(err);
                    resolve('Connected to database.');
                });
            });
        }

        async function close() {
            return new Promise((resolve, reject) => {
                mysqlconnection.end(function (err: any) {
                    if (err) reject(err);
                    resolve('Closed connection to database.');
                });
            });
        }

        if (thingtodo == 'connect') {
            return new Promise((resolve, reject) => {
                connect().then((result) => {
                    mysqlconnection.query('CREATE TABLE IF NOT EXISTS cadettrainings (id INT AUTO_INCREMENT PRIMARY KEY, passed BOOL, cadet_username VARCHAR(64), cadet_id BIGINT, fto_username VARCHAR(64), fto_id BIGINT, timestamp TEXT)', function (err: any, result: any) {
                        if (err) reject(err);
                        mysqlconnection.query('CREATE TABLE IF NOT EXISTS departmentjoins (id INT AUTO_INCREMENT PRIMARY KEY, forced BOOL, cadet_username VARCHAR(64), cadet_id BIGINT, department VARCHAR(64), admin_forced_username VARCHAR(64), admin_forced_id BIGINT, timestamp TEXT)', function (err: any, result: any) {
                            if (err) reject(err);
                            mysqlconnection.query('CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(64), password VARCHAR(64), permission TINYTEXT, accesskey TINYTEXT)', function (err: any, result: any) {
                                if (err) reject(err);
                                mysqlconnection.query('CREATE TABLE IF NOT EXISTS rp (id INT AUTO_INCREMENT PRIMARY KEY, aop VARCHAR(64), timestamp TEXT, ping BOOL, training BOOL, pingatrptime BOOL)', function (err: any, result: any) {
                                    if (err) reject(err);
                                    mysqlconnection.query('CREATE TABLE IF NOT EXISTS pastrp (id INT AUTO_INCREMENT PRIMARY KEY, aop VARCHAR(64), timestamp TEXT, ping BOOL, training BOOL, pingatrptime BOOL)', function (err: any, result: any) {
                                        if (err) reject(err);
                                        close().then(() => {
                                            resolve('Tables created. Connection closed.');
                                        }).catch((error) => {
                                            reject(error);
                                        });
                                    });
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
                    valuestemplate = '(username, password, permission, accesskey)';
                }
                if (table == 'rp') {
                    valuestemplate = '(aop, timestamp, ping, training, pingatrptime)';
                }
                if (table == 'pastrp') {
                    valuestemplate = '(aop, timestamp, ping, training, pingatrptime)';
                }

                mysqlconnection.query(`INSERT INTO ${table} ${valuestemplate} VALUES ${sqlstring}`, function (err: any, result: any) {
                    if (err) throw err;
                    return result;
                });
                close().catch((error) => { console.log(error); });
            }).catch((error) => {
                console.log(error);
            });
        }
        if (thingtodo == 'select') {
            return new Promise((resolve, reject) => {
                mysqlconnection.connect(function (err: any) {
                    if (err) reject(err);
                    mysqlconnection.query(sqlstring, function (err: any, result: unknown, fields: any) {
                        if (err) reject(err);
                        close().then(() => {
                            resolve(result);
                        }).catch((error) => {
                            reject(error);
                        }); 
                    });
                });
            });
        }
        if (thingtodo == 'update') {
            return new Promise((resolve, reject) => {
                mysqlconnection.connect(function (err: any) {
                    if (err) reject(err);
                    mysqlconnection.query(sqlstring, function (err: any, result: unknown, fields: any) {
                        if (err) reject(err);
                        close().then(() => {
                            resolve(result);
                        }).catch((error) => {
                            reject(error);
                        }); 
                    });
                });
            });
        }
        if (thingtodo == 'delete') {
            connect().then((result) => {
                mysqlconnection.query(`DELETE FROM ${table} WHERE ${sqlstring}`, function (err: any, result: any) {
                    if (err) throw err;
                    close().then(() => {
                        return result;
                    }).catch((error) => {
                        console.log(error);
                    });
                });
            }).catch((error) => {
                console.log(error);
            });
        }

    } catch (error) {
        console.log(error);
    }
};

