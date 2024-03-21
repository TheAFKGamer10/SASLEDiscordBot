module.exports = async () => {
    const fs = require('fs');
    const path = require('path');
    const bcrypt = require('bcrypt');
    const env = require('dotenv').config();
    const mysql = require(path.join(__dirname, '..', 'src', 'events', 'mysqlhander.js'));

    
    if (env.parsed.MYSQL_CONNECTION_STRING !== '' && env.parsed.MYSQL_CONNECTION_STRING !== null) {
        await mysql('connect').then(async (conresult, error) => {
            if (error) {
                return console.log(error);
            }
            await mysql('select', 'users', `SELECT * FROM users WHERE username = '${process.env.ROOT_USERNAME}'`).then(async (result) => {
                if (!result || result.length === 0) {
                    await mysql('insert', 'users', `('${process.env.ROOT_USERNAME}', '${await bcrypt.hash(process.env.ROOT_PASSWORD, 10)}')`);
                }
            });
            
        });
    } else {
        if (fs.existsSync(path.join(__dirname, 'auth', 'data', 'users.json'))) {
            return;
        }

        fs.writeFileSync(path.join(__dirname, 'auth', 'data', 'users.json'), JSON.stringify({}));
        try {
            const usersData = fs.readFileSync(path.join(__dirname, 'auth', 'data', 'users.json'));
            const users = usersData.length ? JSON.parse(usersData) : {};
            users[process.env.ROOT_USERNAME] = {
                username: process.env.ROOT_USERNAME,
                password: await bcrypt.hash(process.env.ROOT_PASSWORD, 10)
            };
            fs.writeFileSync(path.join(__dirname, 'auth', 'data', 'users.json'), JSON.stringify(users));
        } catch (e) {
            console.error(e);
        }
    }
}