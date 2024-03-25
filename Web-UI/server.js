const express = require('express');
const path = require('path');
const session = require('express-session');
const { exec, spawn } = require('child_process');
const env = require('dotenv').config();
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // const botProcess = spawn('node', ['src/index.js']);
    // botProcess.stdout.on('data', (data) => {
    //     console.log(data.toString());
    // });
});

// Authentication
app.get('/login', (question, answer) => {
    if (question.cookies.userid) {
        return answer.redirect('/admin');
    }
    answer.sendFile(path.join(__dirname, 'auth', 'login.html'));
});
app.post('/process-login', async (question, answer) => {
    let users
    if (env.parsed.MYSQL_CONNECTION_STRING !== '' && env.parsed.MYSQL_CONNECTION_STRING !== null) {
        const mysql = require(path.join(__dirname, '..', 'src', 'events', 'mysqlhander.js'));
        mysql('select', 'users', `SELECT * FROM users WHERE username = '${question.body.username}'`).then(async (result) => {
            users = result;
            if (!users || users.length === 0) {
                return answer.send({ "status": "error", "message": "User Not Found. Please check your username and password." });
            }
            if (await bcrypt.compare(question.body.password, users[0].password)) {
                answer.cookie('userid', question.body.username);
                answer.send({ "status": "OK" });
            } else {
                answer.send({ "status": "error", "message": "Invalid Password. Please check your username and password." });
            }
        });
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
app.get('/checkCookies', async (question, answer) => {
    if (question.cookies[question.query.cookie]) {
        answer.send('true');
    } else {
        answer.send('false');
    }
});
app.all('/auth/data/*', (question, answer) => {
    answer.status(403).send('Forbidden');
});
app.get('/v1/bot/next-rp', async (question, answer) => {
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


// Public Pages
app.get('/', (question, answer) => {
    answer.sendFile(path.join(__dirname, '/index.html'));
});
app.get('/next-rp', (question, answer) => {
    answer.sendFile(path.join(__dirname, 'client/next-rp/nextrp.html'));
});




/* This Must Be At The Bottom */
app.all('/*', (question, answer) => {
    answer.sendFile(path.join(__dirname + question.url));
});