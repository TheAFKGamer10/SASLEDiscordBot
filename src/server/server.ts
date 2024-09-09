import express, { Request, Response, NextFunction } from "express";
import path from "path";
import session from "express-session";
import { default as rateLimit } from "express-rate-limit";
import * as crypto from "crypto";
import { spawn } from "child_process";
let env = require("dotenv").config();
import cookieParser from "cookie-parser";
import sanitize, { IOptions } from "sanitize-html";
import fs from "fs";

import pkg from "../../package.json";
import writeenv from "./api/writeenv";
import getenv from "./api/getenv";
import bcrypt from "bcrypt";
import beforerun from "./beforeruntime";
import auth from "./auth/auth";
import mysql from "./mysqlhander";
import { client } from "./bot/bot";
import rpcountdownchecker from "./bot/events/rpcountdownchecker";

beforerun();
async function start(): Promise<void> {
    const result = await auth();
    if (typeof result === "number") {
        process.exit(result);
    }
}

interface MySQLUsers {
    id: number;
    username: string;
    password: string;
    permission: number;
    accesskey: string;
}
interface MySQLRP {
    id: number;
    aop: string;
    timestamp: string;
    user: string;
    ping: number | boolean;
    training: number | boolean;
    pingatrptime: number | boolean;
}
/**
 * Checks if a value is not empty.
 * @param {any} value - The value to check.
 * @returns {boolean} Whether the value is not empty.
 */
function notempty(value: any): boolean {
    return value !== "" && value !== null && value !== undefined;
}
/**
 * Sanitizes text to prevent SQL injection and XSS attacks.
 * @param {string} text - The text to sanitize.
 * @param {IOptions} options - Options for the sanitizer.
 * @param {boolean} justtext - Should only **letters and numbers** be allowed?
 * @returns {string} The sanitized text.
 */
export function cleantoSQL(text: string, options?: IOptions | "", justtext?: boolean): string {
    if (!options || typeof options !== "object" || options === null || options === undefined) {
        options = {
            allowedTags: [],
            allowedAttributes: {},
            disallowedTagsMode: "escape",
        };
    }
    if (text === "" || text === null || text === undefined) {
        return "";
    }
    if (justtext) {
        return sanitize(text, options)
            .replace(/[^A-Za-z0-9]/g, "")
            .trim();
    } else {
        return sanitize(text, options).replace(/'/g, "\\'").trim();
    }
}

__dirname = path.join(__dirname, "..", "client");
const app = express();
app.use(cookieParser());
app.use(express.json());
app.disable("x-powered-by");
app.use(express.static(path.join(__dirname, "/public")));
app.use(
    session({
        secret: env.parsed.COOKIE_SECRET || "pOkPUqtcw6qUaZ163FgPzcDPurK1Wr5t",
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 24 * 60 * 60 * 1000 },
    })
);

app.use(
    rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 500, // limit each IP to 100 requests per windowMs
        handler: (question: any, answer: Response<any>) => {
            console.log("Rate limited");
            answer.status(429).send("Too many requests");
        },
    })
);

declare module "express-serve-static-core" {
    interface Request {
        session: {
            userid: string | number;
            role: number | string;
            accesskey: string;
            destroy: () => void;
        };
    }
}

const PORT = env.parsed.WEB_PORT || 3000;

start().then(() => {
    app.listen(PORT, async () => {
        console.log(`Server is running on port ${PORT}`);
        client.on("ready", async () => {
            rpcountdownchecker(env.parsed.MYSQL_CONNECTION_STRING !== "" && env.parsed.MYSQL_CONNECTION_STRING !== null && env.parsed.MYSQL_CONNECTION_STRING !== undefined);

            console.log(`Logged in as ${client.user.tag}!`);
        });
    });
});

app.use((question: Request, answer: Response, next: NextFunction) => {
    if (question.url.includes("/logout")) {
        answer.clearCookie(pkg.name + "-userid");
        answer.clearCookie(pkg.name + "-role");
        answer.clearCookie(pkg.name + "-accesskey");
        return next();
    }
    try {
        if (notempty(question.cookies[pkg.name + "-userid"]) && notempty(question.cookies[pkg.name + "-role"]) && notempty(question.cookies[pkg.name + "-accesskey"])) {
            let useridparts = question.cookies[pkg.name + "-userid"].split(":");
            const decipher = crypto.createDecipheriv("aes-256-cbc", crypto.createHash("sha256").update(env.parsed.COOKIE_SECRET).digest(), Buffer.from(useridparts.shift() || "", "hex"));
            let decrypteduserid = decipher.update(useridparts.join(":"), "hex", "utf8") + decipher.final("utf8");

            let roleparts = question.cookies[pkg.name + "-role"].split(":");
            const roledecipher = crypto.createDecipheriv("aes-256-cbc", crypto.createHash("sha256").update(env.parsed.COOKIE_SECRET).digest(), Buffer.from(roleparts.shift() || "", "hex"));
            let decryptedrole = roledecipher.update(roleparts.join(":"), "hex", "utf8") + roledecipher.final("utf8");

            let accesskeyparts = question.cookies[pkg.name + "-accesskey"].split(":");
            const accesskeydecipher = crypto.createDecipheriv("aes-256-cbc", crypto.createHash("sha256").update(env.parsed.COOKIE_SECRET).digest(), Buffer.from(accesskeyparts.shift() || "", "hex"));
            let decryptedaccesskey = accesskeydecipher.update(accesskeyparts.join(":"), "hex", "utf8") + accesskeydecipher.final("utf8");

            question.session.userid = decrypteduserid;
            question.session.role = decryptedrole;
            question.session.accesskey = decryptedaccesskey;
        }
    } catch (e) {
        console.log(e);
        answer.clearCookie(pkg.name + "-userid");
        answer.clearCookie(pkg.name + "-role");
        answer.clearCookie(pkg.name + "-accesskey");
        answer.redirect(`/logout?next=/login&reason=restricted`);
    }
    next();
});

// Authentication
app.get("/login", (question: Request, answer: Response) => {
    answer.sendFile(path.join(__dirname, "auth", "login.html"));
});
app.post("/v1/process-login", async (question: Request, answer: Response) => {
    if (env.parsed.MYSQL_CONNECTION_STRING !== "" && env.parsed.MYSQL_CONNECTION_STRING !== null && env.parsed.MYSQL_CONNECTION_STRING !== undefined) {
        try {
            mysql("select", "users", `SELECT * FROM users WHERE username = '${cleantoSQL(question.body.username)}'`).then(async (result: any) => {
                let users = (result as MySQLUsers[]) || [];
                if (!users || users.length === 0) {
                    return answer.send({ status: "error", message: "User Not Found. Please check your username and password." });
                }
                if (await bcrypt.compare(cleantoSQL(question.body.password), users[0].password.toString() ?? "")) {
                    let iv = crypto.randomBytes(16);
                    const cipher = crypto.createCipheriv("aes-256-cbc", crypto.createHash("sha256").update(env.parsed.COOKIE_SECRET).digest(), iv);
                    let encrypteduserid = iv.toString("hex") + ":" + cipher.update(`${cleantoSQL(users[0].id.toString())}-${cleantoSQL(users[0].username)}`, "utf8", "hex") + cipher.final("hex");
    
                    iv = crypto.randomBytes(16);
                    const cipherrole = crypto.createCipheriv("aes-256-cbc", crypto.createHash("sha256").update(env.parsed.COOKIE_SECRET).digest(), iv);
                    let encryptedrole = iv.toString("hex") + ":" + cipherrole.update(`${users[0].permission}`, "utf8", "hex") + cipherrole.final("hex");
    
                    iv = crypto.randomBytes(16);
                    const cipheraccesskey = crypto.createCipheriv("aes-256-cbc", crypto.createHash("sha256").update(env.parsed.COOKIE_SECRET).digest(), iv);
                    let encryptedaccesskey = iv.toString("hex") + ":" + cipheraccesskey.update(`${users[0].accesskey}`, "utf8", "hex") + cipheraccesskey.final("hex");
    
                    answer.cookie(pkg.name + "-userid", encrypteduserid);
                    answer.cookie(pkg.name + "-role", encryptedrole);
                    answer.cookie(pkg.name + "-accesskey", encryptedaccesskey);
                    answer.send({ status: "OK" });
                    return;
                } else {
                    answer.send({ status: "error", message: "Invalid Password. Please check your username and password." });
                }
            });
        } catch (e) {
            console.log(e);
            answer.send({ status: "error", message: "An error occurred. Please try again later." });
        }
    } else {
        let existingData = fs.readFileSync(path.join(__dirname, "auth", "data", "users.json"), "utf-8");
        let parsedData = JSON.parse(existingData);
        const user = parsedData[question.body.username];
        if (!user) {
            return answer.send({ status: "error", message: "User Not Found. Please check your username and password." });
        }
        try {
            if (await bcrypt.compare(cleantoSQL(question.body.password), user.password.toString() ?? "")) {
                let iv = crypto.randomBytes(16);
                const cipher = crypto.createCipheriv("aes-256-cbc", crypto.createHash("sha256").update(env.parsed.COOKIE_SECRET).digest(), iv);
                let encrypteduserid = iv.toString("hex") + ":" + cipher.update(user.username, "utf8", "hex") + cipher.final("hex");

                iv = crypto.randomBytes(16);
                const cipherrole = crypto.createCipheriv("aes-256-cbc", crypto.createHash("sha256").update(env.parsed.COOKIE_SECRET).digest(), iv);
                let encryptedrole = iv.toString("hex") + ":" + cipherrole.update(`${user.permissions}`, "utf8", "hex") + cipherrole.final("hex");

                iv = crypto.randomBytes(16);
                const cipheraccesskey = crypto.createCipheriv("aes-256-cbc", crypto.createHash("sha256").update(env.parsed.COOKIE_SECRET).digest(), iv);
                let encryptedaccesskey = iv.toString("hex") + ":" + cipheraccesskey.update(`${user.accesskey}`, "utf8", "hex") + cipheraccesskey.final("hex");

                answer.cookie(pkg.name + "-userid", encrypteduserid);
                answer.cookie(pkg.name + "-role", encryptedrole);
                answer.cookie(pkg.name + "-accesskey", encryptedaccesskey);
                answer.send({ status: "OK" });
                return;
            } else {
                answer.send({ status: "error", message: "Invalid Password. Please check your username and password." });
            }
        } catch (e) {
            console.log(e);
            answer.send({ status: "error", message: "An error occurred. Please try again later." });
        }
    }
});
app.get("/logout", (question: Request, answer: Response) => {
    question.session.destroy();
    answer.clearCookie(pkg.name + "-userid");
    answer.clearCookie(pkg.name + "-role");
    answer.clearCookie(pkg.name + "-accesskey");
    if (question.query.next == "/login") {
        let returnurl = `/login`;
        if (question.query.afterlogin) {
            returnurl += `?next=${question.query.afterlogin}`;
        }
        if (question.query.reason) {
            returnurl += `${question.query.afterlogin ? `&` : `?`}reason=${question.query.reason}`;
        }

        return answer.redirect(returnurl);
    } else if (question.query.next) {
        return answer.redirect(`${question.query.next}`);
    } else {
        answer.redirect("/");
    }
});
app.get("/account", (question: Request, answer: Response) => {
    if (!question.session.userid) {
        return answer.redirect(`/logout?next=/login&afterlogin=${question.url}&reason=restricted`);
    }
    answer.sendFile(path.join(__dirname, "account", "account.html"));
});

// API
app.all("/api/*", (question: Request, answer: Response) => {
    return answer.status(401).send("Unauthorized");
});
app.use("/v1/", (question: Request, answer: Response, next: NextFunction) => {
    env = require("dotenv").config();
    next();
});
app.get("/v1/stat", (question: Request, answer: Response) => {
    answer.send({
        status: "OK",
        version: pkg.version,
        name: pkg.name,
    });
});
app.get("/v1/pageload", (question: Request, answer: Response) => {
    if (!question.session.userid) {
        return answer.send({ status: "OK" });
    }

    if (!question.cookies[pkg.name + "-userid"] || !question.cookies[pkg.name + "-role"] || !question.cookies[pkg.name + "-accesskey"] || question.cookies[pkg.name + "-userid"] == undefined || question.cookies[pkg.name + "-role"] == undefined || question.cookies[pkg.name + "-accesskey"] == undefined) {
        return answer.send({ redirect: `/logout?next=/login&afterlogin=${question.query.l}&reason=restricted` });
    }

    if (env.parsed.MYSQL_CONNECTION_STRING !== "" && env.parsed.MYSQL_CONNECTION_STRING !== null && env.parsed.MYSQL_CONNECTION_STRING !== undefined) {
        mysql("select", "users", `SELECT accesskey FROM users WHERE id = '${cleantoSQL(question.session.userid.toString().split("-")[0], "", true)}'`)
            .then(async (result: unknown) => {
                const accessKeyResult = result as { accesskey: string }[] | [];
                if (accessKeyResult.length === 0 || accessKeyResult[0].accesskey != question.session.accesskey) {
                    return answer.send({ redirect: `/logout?next=/login&afterlogin=${question.query.l}&reason=restricted` });
                }
                return answer.send({ status: "OK" });
            })
            .catch(() => {
                return answer.send({ redirect: `/logout?next=/login&afterlogin=${question.query.l}&reason=restricted` });
            });
    } else {
        let existingData = fs.readFileSync(path.join(__dirname, "auth", "data", "users.json"), "utf-8");
        let parsedData = JSON.parse(existingData);
        const user = parsedData[question.session.userid];
        if (!user || user.accesskey !== question.session.accesskey) {
            return answer.send({ redirect: `/logout?next=/login&afterlogin=${question.query.l}&reason=restricted` });
        }
        return answer.send({ status: "OK" });
    }
});
app.get("/v1/config/get", async (question: Request, answer: Response) => {
    if (!question.session.role || Number(question.session.role) > 1) {
        return answer.status(401).send("Unauthorized");
    }
    let result: { [key: string]: string } = await getenv();
    if (Number(question.session.role) > 0) {
        const envhints = require("./api/json/envhints.json");
        Object.keys(envhints).forEach((key) => {
            if (envhints[key].AdminOnly) {
                delete result[key];
            }
        });
    }
    answer.send(result);
});
app.get("/v1/config/envhints", async (question: Request, answer: Response) => {
    if (!question.session.role) {
        return answer.status(401).send("Unauthorized");
    }
    answer.send(require("./api/json/envhints.json"));
});
app.get("/v1/users/perms", async (question: Request, answer: Response) => {
    if (!question.session.role) {
        return answer.status(401).send("Unauthorized");
    }
    answer.send(require("./api/json/userRoles.json"));
});
app.post("/v1/config/submit", async (question: Request, answer: Response) => {
    if (!question.session.role || Number(question.session.role) > 1) {
        return answer.status(401).send("Unauthorized");
    }
    await writeenv(question.body);
    const pushcmds = spawn("node", [path.join(__dirname, "..", "src", "regester-commands.js")]);
    pushcmds.stderr.on("data", (data: { toString: () => any }) => {
        console.error(data.toString());
    });
    pushcmds.on("exit", (code: number) => {
        if (code !== 0) {
            console.log(`Bot process exited with code ${code}`);
        }
    });
    answer.send({ status: "OK" });
});
app.get("/v1/checkCookies", async (question: Request, answer: Response) => {
    let cookie = question.query.cookie;
    let perm = question.query.perm;
    let result: { perm?: boolean; cookie?: boolean } = {}; // Add type annotation to specify that result is an object with a cookie property of type boolean

    if (cookie !== "" && cookie !== null && cookie !== undefined) {
        result.cookie = !!question.cookies[pkg.name + "-" + cookie];
    }

    if (perm !== "" && perm !== null && perm !== undefined) {
        result.perm = perm >= question.session.role;
    }

    answer.json(result);
});
app.get("/v1/bot/rp", async (question: Request, answer: Response) => {
    if (env.parsed.MYSQL_CONNECTION_STRING !== "" && env.parsed.MYSQL_CONNECTION_STRING !== null && env.parsed.MYSQL_CONNECTION_STRING !== undefined) {
        let nextRpData = (await mysql("select", "rp", `SELECT * FROM rp ORDER BY timestamp ASC LIMIT 1;`)) as MySQLRP[] | [];
        if (nextRpData.length === 0) {
            return answer.send({ status: "warning", message: "No RP Scheduled" });
        }

        answer.send({
            aop: nextRpData[0].aop,
            time: nextRpData[0].timestamp,
            training: nextRpData[0].training,
            servertimeoffset: new Date().getTimezoneOffset(),
        });
    } else {
        try {
            let nextRpData = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "src", "files", "next-rp.json"), "utf-8"));
            let keys = Object.keys(nextRpData);
            if (keys.length === 0) {
                return answer.send({ status: "warning", message: "No RP Scheduled" });
            }

            answer.send({
                aop: nextRpData[keys[0]].aop,
                time: Object.keys(nextRpData)[0],
                training: nextRpData[keys[0]].training,
                servertimeoffset: new Date().getTimezoneOffset(),
            });
        } catch (e) {
            console.log(e);
            answer.send({ status: "error", message: "An error occurred. Please try again later." });
        }
    }
});
app.get("/v1/bot/logs/get", async (question: Request, answer: Response) => {
    if (!question.session.role || Number(question.session.role) > 1) {
        return answer.status(401).send("Unauthorized");
    }
    if (env.parsed.MYSQL_CONNECTION_STRING == "" || env.parsed.MYSQL_CONNECTION_STRING == null) {
        return answer.send({ status: "error", message: `MySQL Connection String is not set. Please set it in the .env file or <a href='/admin/env'>in the panel</a>.` });
    }
    let limit = question.query.limit || 10;
    let cadettrainings = await mysql("select", "cadettrainings", `SELECT * FROM cadettrainings ORDER BY id DESC LIMIT ${limit};`);
    let departmentjoins = await mysql("select", "departmentjoins", `SELECT * FROM departmentjoins ORDER BY id DESC LIMIT ${limit};`);
    let pastrp = await mysql("select", "pastrp", `SELECT * FROM pastrp ORDER BY id DESC LIMIT ${limit};`);
    let result = {
        cadettrainings: cadettrainings,
        departmentjoins: departmentjoins,
        pastrp: pastrp,
    };
    answer.send(result);
});
app.post("/v1/bot/rp/create", async (question: Request, answer: Response) => {
    if (!question.session.role || Number(question.session.role) > 2) {
        return answer.status(401).send("Unauthorized");
    }
    let time = question.body.timestamp;
    let timestamp = 1707170000;
    let timeParts = time.split(":").map(Number);
    let addTimeInSeconds = 0;

    if (time.includes(":")) {
        if (timeParts.length === 3) {
            let [days, hours, minutes] = timeParts;
            addTimeInSeconds = days * 86400 + hours * 3600 + minutes * 60;
        } else if (timeParts.length === 2) {
            let [hours, minutes] = timeParts;
            addTimeInSeconds = hours * 3600 + minutes * 60;
        } else if (timeParts.length === 1 && timeParts !== null && timeParts !== "") {
            addTimeInSeconds = timeParts * 60;
        }
        timestamp = Math.floor(Date.now() / 1000) + addTimeInSeconds;
    } else if (time > 1000000000) {
        timestamp = time;
    } else {
        timestamp = Math.floor(Date.now() / 1000) + time * 60;
    }

    const rpTime = new Date(timestamp * 1000);
    const newDate = rpTime.getFullYear() + " " + (rpTime.getMonth() + 1).toString().padStart(2, "0") + " " + rpTime.getDate().toString().padStart(2, "0") + " " + rpTime.getHours().toString().padStart(2, "0") + " " + rpTime.getMinutes().toString().padStart(2, "0");

    let aop = question.body.aop;
    let ping = question.body.ping;
    let training = question.body.training;
    let pingatrptime = question.body.pingatrptime;
    if (env.parsed.MYSQL_CONNECTION_STRING !== "" && env.parsed.MYSQL_CONNECTION_STRING !== null && env.parsed.MYSQL_CONNECTION_STRING !== undefined) {
        let result = await mysql("insert", "rp", `('${aop}', '${newDate}', ${ping}, ${training}, ${pingatrptime})`);
        let pastrpresult = await mysql("insert", "pastrp", `('${aop}', '${newDate}', '${question.session.userid}', ${ping}, ${training}, ${pingatrptime})`);
    } else {
        const fs = require("fs");
        const existingData = fs.readFileSync(path.join(__dirname, "..", "src", "files", "next-rp.json"));
        const newData = { [rpTime.getFullYear() + " " + (rpTime.getMonth() + 1).toString().padStart(2, "0") + " " + rpTime.getDate().toString().padStart(2, "0") + " " + rpTime.getHours().toString().padStart(2, "0") + " " + rpTime.getMinutes().toString().padStart(2, "0")]: { aop, ping, training, pingatrptime } };
        const mergedData = { ...JSON.parse(existingData), ...newData };
        fs.writeFileSync(path.join(__dirname, "..", "src", "files", "next-rp.json"), JSON.stringify(mergedData, null, 4));
    }

    var output = `## Roleplay Will Be Happening Soon:\n\nAOP: **${aop}**\nTime: **<t:${timestamp}:f>**`;

    if (ping) {
        output += `\nPing: ||@everyone||`;
    }
    if (training) {
        output += `\nTraining: <@&${env.parsed.CADET_ROLE_ID}> training **will** he happening!`;
    }
    try {
        await client.login(env.parsed.BOT_TOKEN); // Don't ask my why it needs to login again, but it does, dont touch.
        const fetchedChannel = await client.channels.fetch(env.parsed.ROLEPLAY_ANOUNCEMENT_CHANNEL_ID);
        await fetchedChannel.send(output);
        // client.destroy();
    } catch (error) {
        console.log(error);
        answer.send({ status: "error", message: "An error occurred while sending the message. Please check the console for more information." });
        return;
    }

    answer.send({ status: "OK" });
});
app.get("/v1/users/get", async (question: Request, answer: Response) => {
    if (!question.session.role || Number(question.session.role) > 1) {
        return answer.status(401).send("Unauthorized");
    }
    const userRoles = require("./api/json/userRoles.json");
    if (env.parsed.MYSQL_CONNECTION_STRING !== "" && env.parsed.MYSQL_CONNECTION_STRING !== null && env.parsed.MYSQL_CONNECTION_STRING !== undefined) {
        if (question.query.id !== "" && question.query.id !== null && question.query.id !== undefined) {
            let users = (await mysql("select", "users", `SELECT * FROM users WHERE id = '${question.query.id}'`)) as MySQLUsers[] | [];
            if (users.length === 0) {
                return answer.send({ status: "error", message: "User not found" });
            }
            return answer.send({
                id: users[0].id,
                username: users[0].username,
                permission: users[0].permission !== undefined && userRoles.hasOwnProperty(users[0].permission) ? userRoles[users[0].permission] : "Unknown", // Checks if user.permission is not undefined and is a key in userRoles
            });
        } else {
            let users = (await mysql("select", "users", `SELECT * FROM users`)) as MySQLUsers[] | [];
            answer.send(
                users.map((user: MySQLUsers) => {
                    return {
                        id: user.id,
                        username: user.username,
                        permission: user.permission !== undefined && userRoles.hasOwnProperty(user.permission) ? userRoles[user.permission] : "Unknown", // Checks if user.permission is not undefined and is a key in userRoles
                    };
                })
            );
        }
    } else {
        let existingData = fs.readFileSync(path.join(__dirname, "auth", "data", "users.json"), "utf-8");
        let parsedData = JSON.parse(existingData);
        const result: { username: string; permission: string; id?: number }[] = [];
        if (question.query.id !== "" && question.query.id !== null && question.query.id !== undefined) {
            let users_name = Object.keys(parsedData)[Number(question.query.id) - 1];
            if (!parsedData[users_name]) {
                return answer.send([{ status: "error", message: "User not found" }]);
            }
            result.push({ username: users_name, permission: userRoles[parsedData[users_name].permission] || "Unknown" });
            return answer.send(result);
        } else {
            let count = 1;
            Object.keys(parsedData).forEach((key) => {
                result.push({ id: count++, username: key, permission: userRoles[parsedData[key].permission] || "Unknown" });
            });
            answer.send(result);
        }
    }
});
app.get("/v1/account", async (question: Request, answer: Response) => {
    if (!question.session.role) {
        return answer.status(401).send("Unauthorized");
    }
    if (env.parsed.MYSQL_CONNECTION_STRING !== "" && env.parsed.MYSQL_CONNECTION_STRING !== null && env.parsed.MYSQL_CONNECTION_STRING !== undefined) {
        let users: { id?: number; username?: string; password?: string; permission?: number; accesskey?: string }[] = (await mysql("select", "users", `SELECT * FROM users WHERE username = '${question.session.userid}'`)) as MySQLUsers[] | [];
        if (users.length === 0) {
            return answer.send({ status: "error", message: "User not found" });
        }
        users = users.map((user) => {
            return {
                username: user.username,
                password: "",
            };
        });
        answer.send(users[0]);
    } else {
        let existingData = fs.readFileSync(path.join(__dirname, "auth", "data", "users.json"), "utf-8");
        let parsedData = JSON.parse(existingData);
        if (!parsedData[question.session.userid]) {
            return answer.send({ status: "error", message: "User not found" });
        }
        return answer.send({ username: question.session.userid, password: "" });
    }
});
app.post("/v1/users/create", async (question: Request, answer: Response) => {
    if (!question.session.role || Number(question.session.role) > 0) {
        return answer.status(401).send("Unauthorized");
    }
    const userRoles = require("./api/json/userRoles.json");
    question.body.permission = Object.keys(userRoles).find((key) => userRoles[key] === question.body.permission) || 99;

    if (env.parsed.MYSQL_CONNECTION_STRING !== "" && env.parsed.MYSQL_CONNECTION_STRING !== null && env.parsed.MYSQL_CONNECTION_STRING !== undefined) {
        let alreadyExists = (await mysql("select", "users", `SELECT * FROM users WHERE username = '${question.body.username}'`)) as MySQLUsers[] | [];
        if (alreadyExists.length > 0) {
            return answer.send({ status: "error", message: "User already exists" });
        }
        let result = await mysql("insert", "users", `('${question.body.username}', '${await bcrypt.hash(question.body.password, 10)}', ${question.body.permission}, '${crypto.randomBytes(16).toString("hex")}')`);
    } else {
        let existingData = fs.readFileSync(path.join(__dirname, "auth", "data", "users.json"), "utf-8");
        let users = JSON.parse(existingData);

        if (users[question.body.username]) {
            return answer.send({ status: "error", message: "User already exists" });
        }

        users[question.body.username] = {
            password: await bcrypt.hash(question.body.password, 10),
            permission: question.body.permission,
            accesskey: crypto.randomBytes(16).toString("hex"),
        };

        fs.writeFileSync(path.join(__dirname, "auth", "data", "users.json"), JSON.stringify(users, null, 4));
    }
    answer.send({ status: "OK" });
});
app.post("/v1/account/edit", async (question: Request, answer: Response) => {
    if (!question.session.role) {
        return answer.status(401).send("Unauthorized");
    }
    const data = question.body;

    if (env.parsed.MYSQL_CONNECTION_STRING !== "" && env.parsed.MYSQL_CONNECTION_STRING !== null && env.parsed.MYSQL_CONNECTION_STRING !== undefined) {
        let usernameExists = (await mysql("select", "users", `SELECT * FROM users WHERE username = '${data.username}'`)) as MySQLUsers[] | [];
        if (usernameExists.length > 0) {
            return answer.send({ status: "error", error: "Username already exists" });
        }
        let result = await mysql("update", "users", `UPDATE users SET username = '${data.username}', accesskey = '${crypto.randomBytes(16).toString("hex")}' WHERE username = '${question.session.userid}'`);
        if (data.password !== "" && data.password !== null && data.password !== undefined) {
            result = await mysql("update", "users", `UPDATE users SET password = '${await bcrypt.hash(data.password, 10)}' WHERE username = '${data.username}'`);
        }
    } else {
        let existingData = fs.readFileSync(path.join(__dirname, "auth", "data", "users.json"), "utf-8");
        let users = JSON.parse(existingData);

        if (data.username !== question.session.userid && users[data.username]) {
            return answer.send({ status: "error", error: "Username already exists" });
        }

        if (data.username !== question.session.userid) {
            users[data.username] = users[question.session.userid];
            delete users[question.session.userid];
        }
        if (data.password !== "" && data.password !== null && data.password !== undefined) {
            users[data.username].password = await bcrypt.hash(data.password, 10);
        }
        users[data.username].accesskey = crypto.randomBytes(16).toString("hex");

        fs.writeFileSync(path.join(__dirname, "auth", "data", "users.json"), JSON.stringify(users, null, 4));
    }

    answer.send({ status: "OK" });
});
app.post("/v1/users/edit", async (question: Request, answer: Response) => {
    if (!question.session.role || Number(question.session.role) > 0) {
        return answer.status(401).send("Unauthorized");
    }
    if (env.parsed.MYSQL_CONNECTION_STRING !== "" && env.parsed.MYSQL_CONNECTION_STRING !== null && env.parsed.MYSQL_CONNECTION_STRING !== undefined) {
        let usernameExists = (await mysql("select", "users", `SELECT * FROM users WHERE username = '${question.body.username}'`)) as MySQLUsers[] | [];
        if (usernameExists.length > 0 && usernameExists[0].id != question.body.id) {
            return answer.send({ status: "error", message: "Username already exists" });
        }
        let result = await mysql("update", "users", `UPDATE users SET permission = ${question.body.permission}, username = '${question.body.username}', accesskey = '${crypto.randomBytes(16).toString("hex")}' WHERE id = ${question.body.id}`);
        if (question.body.password !== "" && question.body.password !== null && question.body.password !== undefined) {
            result = await mysql("update", "users", `UPDATE users SET password = '${await bcrypt.hash(question.body.password, 10)}' WHERE id = '${question.body.id}'`);
        }
    } else {
        let users = JSON.parse(fs.readFileSync(path.join(__dirname, "auth", "data", "users.json"), "utf-8"));
        let keys = Object.keys(users);

        if (keys.indexOf(question.body.username) != -1 && keys.indexOf(question.body.username) + 1 != question.body.id) {
            return answer.send({ status: "error", message: "Username already exists" });
        }

        if (keys.indexOf(question.body.username) == -1) {
            users[question.body.username] = users[keys[question.body.id - 1]];
            delete users[keys[question.body.id - 1]];
        }
        if (question.body.password !== "" && question.body.password !== null && question.body.password !== undefined) {
            users[question.body.username].password = await bcrypt.hash(question.body.password, 10);
        }
        users[question.body.username].accesskey = crypto.randomBytes(16).toString("hex");
        users[question.body.username].permission = question.body.permission;

        fs.writeFileSync(path.join(__dirname, "auth", "data", "users.json"), JSON.stringify(users, null, 4));
    }
    answer.send({ status: "OK" });
});
app.delete("/v1/users/delete", async (question: Request, answer: Response) => {
    if (!question.session.role || Number(question.session.role) > 0) {
        return answer.status(401).send("Unauthorized");
    }

    if (Number(question.query.id) == 1) {
        return answer.send({ status: "error", message: "You cannot delete the first user" });
    }

    if (env.parsed.MYSQL_CONNECTION_STRING !== "" && env.parsed.MYSQL_CONNECTION_STRING !== null && env.parsed.MYSQL_CONNECTION_STRING !== undefined) {
        let result = await mysql("delete", "users", `id = ${question.query.id}`);
    } else {
        let users = JSON.parse(fs.readFileSync(path.join(__dirname, "auth", "data", "users.json"), "utf-8"));
        let keys = Object.keys(users);
        delete users[keys[Number(question.query.id) - 1]];
        fs.writeFileSync(path.join(__dirname, "auth", "data", "users.json"), JSON.stringify(users, null, 4));
    }
    answer.send({ status: "OK" });
});

// Admin
app.use("/admin", (question: Request, answer: Response, next: NextFunction) => {
    if (!question.session.userid || Number(question.session.role) > 1) {
        return answer.redirect(`/logout?next=/login&afterlogin=${question.originalUrl}`);
    } else {
        next();
    }
});
app.get("/admin", (question: Request, answer: Response) => {
    answer.sendFile(path.join(__dirname, "admin", "admin.html"));
});
app.get("/admin/users", (question: Request, answer: Response) => {
    answer.sendFile(path.join(__dirname, "admin/users", "users.html"));
});
app.get("/admin/users/create", (question: Request, answer: Response) => {
    if (!question.session.userid || Number(question.session.role) > 0) {
        return answer.redirect(`/logout?next=/login&afterlogin=${question.originalUrl}`);
    }
    answer.sendFile(path.join(__dirname, "admin/users/create", "create.html"));
});
app.get("/admin/users/edit", (question: Request, answer: Response) => {
    if (!question.session.userid || Number(question.session.role) > 0) {
        return answer.redirect(`/logout?next=/login&afterlogin=${question.originalUrl}`);
    }
    answer.sendFile(path.join(__dirname, "admin/users/edit", "edit.html"));
});
app.get("/admin/env", (question: Request, answer: Response) => {
    answer.sendFile(path.join(__dirname, "admin/config-env", "configenv.html"));
});
app.get("/admin/logs", (question: Request, answer: Response) => {
    answer.sendFile(path.join(__dirname, "admin/logs", "logs.html"));
});

// Public Pages
app.get("/", (question: Request, answer: Response) => {
    answer.sendFile(path.join(__dirname, "/index.html"));
});
app.get("/next-rp", (question: Request, answer: Response) => {
    answer.sendFile(path.join(__dirname, "next-rp/nextrp.html"));
});
app.get("/next-rp/create", (question: Request, answer: Response) => {
    if (!question.session.role || Number(question.session.role) > 2) {
        return answer.redirect(`/logout?next=/login&afterlogin=${question.originalUrl}`);
    }
    answer.sendFile(path.join(__dirname, "next-rp/create/create.html"));
});

// Static Files
app.get("/favicon.png", (question: Request, answer: Response) => {
    answer.sendFile(path.join(__dirname, "public", "img", "RPLogoShort.png"));
});
/* This Must Be At The Bottom */
app.get("/*", (question: Request, answer: Response) => {
    const filePath = path.join(__dirname + question.url);
    if (fs.existsSync(filePath)) {
        answer.sendFile(filePath);
    } else {
        answer.status(404).send("File not found");
    }
});
