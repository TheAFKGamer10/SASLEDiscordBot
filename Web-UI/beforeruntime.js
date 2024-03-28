module.exports = async () => {
    const fs = require('fs');
    const path = require('path');
    const bcrypt = require('bcrypt');
    const env = require('dotenv').config();
    const mysql = require(path.join(__dirname, '..', 'src', 'events', 'mysqlhander.js'));


    if (env.parsed.MYSQL_CONNECTION_STRING !== '' && env.parsed.MYSQL_CONNECTION_STRING !== null) {
        await mysql('select', 'users', `SELECT * FROM users WHERE username = '${env.parsed.ROOT_USERNAME}'`).then(async (result) => {
            if (!result || result.length === 0) {
                await mysql('insert', 'users', `('${env.parsed.ROOT_USERNAME}', '${await bcrypt.hash(env.parsed.ROOT_PASSWORD, 10)}')`);
            }
        });
    } else {
        if (fs.existsSync(path.join(__dirname, 'auth', 'data', 'users.json'))) {
            return;
        }

        fs.writeFileSync(path.join(__dirname, 'auth', 'data', 'users.json'), JSON.stringify({}));
        try {
            const usersData = fs.readFileSync(path.join(__dirname, 'auth', 'data', 'users.json'));
            const users = usersData.length ? JSON.parse(usersData) : {};
            users[env.parsed.ROOT_USERNAME] = {
                username: env.parsed.ROOT_USERNAME,
                password: await bcrypt.hash(env.parsed.ROOT_PASSWORD, 10)
            };
            fs.writeFileSync(path.join(__dirname, 'auth', 'data', 'users.json'), JSON.stringify(users));
        } catch (e) {
            console.error(e);
        }
    }
}