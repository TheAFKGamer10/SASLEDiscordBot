const express = require('express');
const path = require('path');
const session = require('express-session');
const { spawn } = require('child_process');
let env = require('dotenv').config();
const cookieParser = require('cookie-parser');
const package = require('../package.json');
const writeenv = require('./api/writeenv');
const getenv = require('./api/getenv');
const bcrypt = require('bcrypt');
const beforerun = require('./beforeruntime');
beforerun();


const app = express();
app.use(cookieParser());
app.use(express.json());
app.disable('x-powered-by');
app.use(express.static(path.join(__dirname, '/public')));
app.use(session({
    secret: env.parsed.COOKIE_SECRET || 'pOkPUqtcw6qUaZ163FgPzcDPurK1Wr5t',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));
const PORT = 3000;
app.use('/v1/', (req, res, next) => {
    env = require('dotenv').config();
    next();
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    const botProcess = spawn('node', ['src/index.js']);
    botProcess.stdout.on('data', (data) => {
        console.log(data.toString());
    });
    botProcess.stderr.on('data', (data) => {
        console.error(data.toString());
    });
    botProcess.on('exit', (code) => {
        console.log(`Bot process exited with code ${code}`);
    });
});

// Authentication
app.get('/login', (question, answer) => {
    if (question.cookies.userid) {
        return answer.redirect('/admin');
    }
    answer.sendFile(path.join(__dirname, 'auth', 'login.html'));
});
app.post('/v1/process-login', async (question, answer) => {
    let users
    if (env.parsed.MYSQL_CONNECTION_STRING !== '' && env.parsed.MYSQL_CONNECTION_STRING !== null) {
        try {
            const mysql = require(path.join(__dirname, '..', 'src', 'events', 'mysqlhander.js'));
            mysql('select', 'users', `SELECT * FROM users WHERE username = '${question.body.username}'`).then(async (result) => {
                users = result;
                if (!users || users.length === 0) {
                    return answer.send({ "status": "error", "message": "User Not Found. Please check your username and password." });
                }
                if (users.length > 0) {
                    for (let user of users) {
                        if (await bcrypt.compare(question.body.password, user.password)) {
                            answer.cookie('userid', question.body.username);
                            answer.send({ "status": "OK" });
                            return;
                        }
                    }
                }
                answer.send({ "status": "error", "message": "Invalid Password. Please check your username and password." });
            });
        }
        catch (e) {
            console.log(e);
        }
    } else {
        const users = require('./auth/data/users.json');
        const user = users[question.body.username];
        if (!user) {
            return answer.send({ "status": "error", "message": "User Not Found. Please check your username and password." });
        }
        try {
            if (await bcrypt.compare(question.body.password, user.password)) {
                answer.cookie('userid', question.body.username);
                answer.send({ "status": "OK" });
            } else {
                answer.send({ "status": "error", "message": "Invalid Password. Please check your username and password." });
            }
        } catch (e) {
            console.log(e);
        }
    }
});
app.get('/logout', (question, answer) => {
    question.session.destroy();
    answer.clearCookie('userid');
    answer.redirect('/');
});



// API
app.all('/api/*', (question, answer) => {
    return answer.status(401).send('Unauthorized');
});
app.get('/v1/stat', (question, answer) => {
    res = {
        "status": "ok",
        "version": package.version
    };
    answer.send(res);
});
app.get('/v1/config/get', async (question, answer) => {
    if (!question.cookies.userid) {
        return answer.status(401).send('Unauthorized');
    }
    answer.send(await getenv());
});
app.get('/v1/config/envhints', async (question, answer) => {
    answer.send(require('./api/json/envhints.json'));
});
app.post('/v1/config/submit', (question, answer) => {
    if (!question.cookies.userid) {
        return answer.status(401).send('Unauthorized');
    }
    writeenv(question.body);
    answer.send({ "status": "ok" });
});
app.post('/v1/config/removeVariable', async (req, res) => {
    if (!req.cookies.userid) {
        return res.status(401).send('Unauthorized');
    }

    const fs = require('fs');
    let key = req.body.key;
    let envdir = path.join(__dirname, '..', '.env');
    let fileContent = fs.readFileSync(envdir, 'utf-8');
    let fileLines = fileContent.split('\n');
    let lineIndex = fileLines.findIndex(line => line.startsWith(key + ' = '));

    if (lineIndex === -1) {
        return res.status(400).send('Variable not found');
    }

    fileLines.splice(lineIndex, 1);
    let updatedContent = fileLines.join('\n');

    fs.writeFile(envdir, updatedContent, 'utf-8', async (err) => {
        if (err) {
            return res.status(500).send('Error removing variable');
        }
        res.send({ "status": "ok" });
    });
});
app.get('/v1/checkCookies', async (question, answer) => {
    if (question.cookies[question.query.cookie]) {
        answer.send('true');
    } else {
        answer.send('false');
    }
});
app.get('/v1/bot/rp', async (question, answer) => {
    if (env.parsed.MYSQL_CONNECTION_STRING !== '' && env.parsed.MYSQL_CONNECTION_STRING !== null) {
        const mysql = require(path.join(__dirname, '..', 'src', 'events', 'mysqlhander.js'));
        let nextRpData = (await mysql('select', 'rp', `SELECT * FROM rp`));
        let keys = Object.keys(nextRpData);
        if (keys.length === 0) { return answer.send({ "status": "warning", "message": "No RP Scheduled" }) }
        result = {
            "aop": nextRpData[keys[0]].aop,
            "time": nextRpData[keys[0]].timestamp,
            "training": nextRpData[keys[0]].training,
            "servertimeoffset": new Date().getTimezoneOffset()
        }
        answer.send(result);
    } else {
        let nextRpData = require('../src/files/next-rp.json');
        let keys = Object.keys(nextRpData);
        if (keys.length === 0) { return answer.send({ "status": "warning", "message": "No RP Scheduled" }) }
        result = {
            "aop": nextRpData[keys[0]].aop,
            "time": Object.keys(nextRpData)[0],
            "training": nextRpData[keys[0]].training,
            "servertimeoffset": new Date().getTimezoneOffset()
        }
        answer.send(result);
    }
});
app.get('/v1/bot/logs/get', async (question, answer) => {
    if (!question.cookies.userid) {
        return answer.status(401).send('Unauthorized');
    }
    if (env.parsed.MYSQL_CONNECTION_STRING == '' || env.parsed.MYSQL_CONNECTION_STRING == null) {
        return answer.send({ "status": "error", "message": `MySQL Connection String is not set. Please set it in the .env file or <a href='${question.query.URL}/admin/env'>in the panel</a>.` });
    }
    let limit = question.query.limit || 10;
    const mysql = require(path.join(__dirname, '..', 'src', 'events', 'mysqlhander.js'));
    let cadettrainings = (await mysql('select', 'cadettrainings', `SELECT * FROM cadettrainings ORDER BY id DESC LIMIT ${limit};`));
    let departmentjoins = (await mysql('select', 'departmentjoins', `SELECT * FROM departmentjoins ORDER BY id DESC LIMIT ${limit};`));
    let result = {
        "cadettrainings": cadettrainings,
        "departmentjoins": departmentjoins
    }
    answer.send(result);
});
app.get('/v1/bot/rp/create/fields', async (question, answer) => {
    answer.send(require('./api/json/CreateFields.json'));
});
app.post('/v1/bot/rp/create', async (question, answer) => {
    if (!question.cookies.userid) {
        return answer.status(401).send('Unauthorized');
    }
    let time = question.body.timestamp;
    let timestamp = 1707170000;
    let timeParts = time.split(':').map(Number);
    let addTimeInSeconds = 0;

    if (time.includes(':')) {
        if (timeParts.length === 3) {
            let [days, hours, minutes] = timeParts;
            addTimeInSeconds = days * 86400 + hours * 3600 + minutes * 60;
        } else if (timeParts.length === 2) {
            let [hours, minutes] = timeParts;
            addTimeInSeconds = hours * 3600 + minutes * 60;
        } else if (timeParts.length === 1 && timeParts !== null && timeParts !== '') {
            addTimeInSeconds = timeParts * 60;
        }
        timestamp = Math.floor(Date.now() / 1000) + addTimeInSeconds;
    } else if (time > 1000000000) {
        timestamp = time;
    } else {
        timestamp = Math.floor(Date.now() / 1000) + (time * 60);
    }

    const rpTime = new Date(timestamp * 1000);
    const newDate = rpTime.getFullYear() + " " + (rpTime.getMonth() + 1).toString().padStart(2, '0') + " " + rpTime.getDate().toString().padStart(2, '0') + " " + rpTime.getHours().toString().padStart(2, '0') + " " + rpTime.getMinutes().toString().padStart(2, '0');


    let aop = question.body.aop;
    let ping = question.body.ping;
    let training = question.body.training;
    let pingatrptime = question.body.pingatrptime;
    if (env.parsed.MYSQL_CONNECTION_STRING !== '' && env.parsed.MYSQL_CONNECTION_STRING !== null) {
        const mysql = require(path.join(__dirname, '..', 'src', 'events', 'mysqlhander.js'));
        let result = (await mysql('insert', 'rp', `('${aop}', '${newDate}', ${ping}, ${training}, ${pingatrptime})`));
    } else {
        const fs = require('fs');
        const existingData = fs.readFileSync(path.join(__dirname, '..', 'src', 'files', 'next-rp.json'));
        const newData = { [rpTime.getFullYear() + " " + (rpTime.getMonth() + 1).toString().padStart(2, '0') + " " + rpTime.getDate().toString().padStart(2, '0') + " " + rpTime.getHours().toString().padStart(2, '0') + " " + rpTime.getMinutes().toString().padStart(2, '0')]: { aop, ping, training, pingatrptime } };
        const mergedData = { ...JSON.parse(existingData), ...newData };
        fs.writeFileSync(path.join(__dirname, '..', 'src', 'files', 'next-rp.json'), JSON.stringify(mergedData, null, 4));
    }

    if (ping) {
        const { client } = require("../src/importdefaults");
        var output = `## Roleplay Will Be Happening Soon:\n\nAOP: **${aop}**\nTime: **<t:${timestamp}:f>**\nPing: ||@everyone||`;

        if (training) {
            output += `\nTraining: <@&${env.parsed.CADET_ROLE_ID}> training **will** he happening!`;
        }
        try {
            await client.login(env.parsed.BOT_TOKEN); // Don't ask my why it needs to login again, but it does, dont touch.
            const fetchedChannel = await client.channels.fetch(env.parsed.LOG_CHANNEL_ID);
            await fetchedChannel.send(output);
            client.destroy();
        } catch (error) {
            console.log(error);
        }
    }
    answer.send({ "status": "ok" });
});



// Admin
app.get('/admin', (question, answer) => {
    if (!question.cookies.userid) {
        question.session.destroy();
        answer.clearCookie('userid');
        return answer.redirect(`/login?next=${question.url}`);
    }
    answer.sendFile(path.join(__dirname, 'admin', 'admin.html'));
});
app.get('/admin/env', (question, answer) => {
    if (!question.cookies.userid) {
        question.session.destroy();
        answer.clearCookie('userid');
        return answer.redirect(`/login?next=${question.url}`);
    }
    answer.sendFile(path.join(__dirname, 'admin/config-env', 'configenv.html'));
});
app.get('/admin/logs', (question, answer) => {
    if (!question.cookies.userid) {
        question.session.destroy();
        answer.clearCookie('userid');
        return answer.redirect(`/login?next=${question.url}`);
    }
    answer.sendFile(path.join(__dirname, 'admin/logs', 'logs.html'));
});




// Public Pages
app.get('/', (question, answer) => {
    answer.sendFile(path.join(__dirname, '/index.html'));
});
app.get('/next-rp', (question, answer) => {
    answer.sendFile(path.join(__dirname, 'client/next-rp/nextrp.html'));
});
app.get('/next-rp/create', (question, answer) => {
    if (!question.cookies.userid) {
        question.session.destroy();
        answer.clearCookie('userid');
        return answer.redirect(`/login?next=${question.url}`);
    }
    answer.sendFile(path.join(__dirname, 'client/next-rp/create/create.html'));
});


// Restricted Pages
app.all('/auth/data/*', (question, answer) => {
    answer.status(403).send('Forbidden');
});
app.all('/templates/*', (question, answer) => {
    answer.status(403).send('Forbidden');
});


/* This Must Be At The Bottom */
app.get('/*', (question, answer) => {
    answer.sendFile(path.join(__dirname + question.url));
});