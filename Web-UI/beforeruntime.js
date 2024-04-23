module.exports = async () => {
    const fs = require('fs');
    const path = require('path');
    const bcrypt = require('bcrypt');
    const crypto = require('crypto');
    const env = require('dotenv').config();
    const mysql = require(path.join(__dirname, '..', 'src', 'events', 'mysqlhander.js'));


    if (env.parsed.MYSQL_CONNECTION_STRING !== '' && env.parsed.MYSQL_CONNECTION_STRING !== null && env.parsed.MYSQL_CONNECTION_STRING !== undefined) {
        if (!/^mysql:\/\/[^:@]+:[^:@]+@[^:@]+:\d+\/[^:@]+$/.test(env.parsed.MYSQL_CONNECTION_STRING)) {
            console.error('Invalid MySQL connection string. Please check your .env file.');
            process.exit(1);
        }
        mysql('connect').then(async (result) => {
            await mysql('select', 'users', `SELECT * FROM users WHERE username = '${env.parsed.ROOT_USERNAME}'`).then(async (result) => {
                if (!result || result.length === 0) {
                    await mysql('insert', 'users', `('${env.parsed.ROOT_USERNAME}', '${await bcrypt.hash(env.parsed.ROOT_PASSWORD, 10)}', '0', '${crypto.randomBytes(16).toString('hex')}')`);
                }
            });
        });
    } else {
        if (!fs.existsSync(path.join(__dirname, 'auth', 'data'))) {
            fs.mkdirSync(path.join(__dirname, 'auth', 'data'));
        }
        if (!fs.existsSync(path.join(__dirname, 'auth', 'data', 'users.json'))) {
            fs.writeFileSync(path.join(__dirname, 'auth', 'data', 'users.json'), JSON.stringify({}));
        }
        try {
            const usersData = await fs.readFileSync(path.join(__dirname, 'auth', 'data', 'users.json'));
            const users = usersData.length ? JSON.parse(usersData) : {};
            if (!users.hasOwnProperty(env.parsed.ROOT_USERNAME)) {
                users[env.parsed.ROOT_USERNAME] = {
                    password: await bcrypt.hash(env.parsed.ROOT_PASSWORD, 10),
                    permission: '0',
                    accesskey: crypto.randomBytes(16).toString('hex')
                };
                fs.writeFileSync(path.join(__dirname, 'auth', 'data', 'users.json'), JSON.stringify(users));
            }
        } catch (e) {
            console.error(e);
        }
    }
}