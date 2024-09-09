import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { env } from "./bot/importdefaults";
import mysql from "./mysqlhander";

export default async () => {
    // Mandatory checks
    if (!fs.existsSync("./.env")) {
        console.log("No .env file found. Please create one before starting the bot again.");
        process.exit(126);
    }
    var hasdb = true;
    if (env.parsed.MYSQL_CONNECTION_STRING == "" || env.parsed.MYSQL_CONNECTION_STRING == undefined || env.parsed.MYSQL_CONNECTION_STRING == null) {
        hasdb = false;
        console.log("No database connection found. Some functionality will be disabled.");
    }
    
    const flags = process.argv.slice(2);
    
    async function envcheck() {
        let requireditems = ["BOT_TOKEN", "CLIENT_ID", "GUILD_ID", "LOG_CHANNEL_ID", "LEO_ROLE_ID", "CADET_ROLE_ID", "LIST_OF_DEPARTMENTS"];
        let empty: string[] = [];
        let depsreq: string[] = [];
    
        JSON.parse(env.parsed.LIST_OF_DEPARTMENTS).forEach((element: string) => {
            depsreq.push(element.toUpperCase() + "_START_LETTER");
            depsreq.push(element.toUpperCase() + "_DEPARTMENT_NAME");
            depsreq.push(element.toUpperCase() + "_ROLE_ID");
            if (env.parsed.MYSQL_CONNECTION_STRING !== "") {
                depsreq.push(element.toUpperCase() + "_PROBIB_ID");
                requireditems.push("JOIN_SERVER_ROLE_ID");
            }
        });
    
        Object.keys(env.parsed).forEach((element) => {
            if (requireditems.includes(element) && env.parsed[element] == "") {
                empty.push(element);
            }
            if (element.includes("_START_LETTER") || element.includes("_DEPARTMENT_NAME") || element.includes("_ROLE_ID") || element.includes("_PROBIB_ID")) {
                if (depsreq.includes(element) && env.parsed[element] == "") {
                    empty.push(element);
                }
            }
        });
    
        if (empty.length !== 0) {
            console.log(`The following ENV items are empty and the bot can not be run without them: \n\x1b[1m${empty.join(", ")}\x1b[0m\nPlease fill them in the .env file before starting the bot again.`);
            process.exit(126);
        }
    }
    if (!flags.includes("--petro")) {
        envcheck();
    } // Petro is used in pterodactyl and they can not check for values that are not there yet.
    

    if (env.parsed.MYSQL_CONNECTION_STRING !== "" && env.parsed.MYSQL_CONNECTION_STRING !== null && env.parsed.MYSQL_CONNECTION_STRING !== undefined) {
        if (!/^mysql:\/\/[^:@]+:[^:@]+@[^:@]+:\d+\/[^:@]+$/.test(env.parsed.MYSQL_CONNECTION_STRING)) {
            console.error("Invalid MySQL connection string. Please check your .env file.");
            process.exit(1);
        }
        mysql("connect", "", "").then(async () => {
            await mysql("select", "users", `SELECT * FROM users WHERE username = '${env.parsed.ROOT_USERNAME}'`).then(async (result: any) => {
                if (!result || result.length === 0) {
                    await mysql("insert", "users", `('${env.parsed.ROOT_USERNAME}', '${await bcrypt.hash(env.parsed.ROOT_PASSWORD, 10)}', '0', '${crypto.randomBytes(16).toString("hex")}')`);
                }
            });
        });
    } else {
        if (!fs.existsSync(path.join(__dirname, "auth", "data"))) {
            fs.mkdirSync(path.join(__dirname, "auth", "data"));
        }
        if (!fs.existsSync(path.join(__dirname, "auth", "data", "users.json"))) {
            fs.writeFileSync(path.join(__dirname, "auth", "data", "users.json"), JSON.stringify({}));
        }
        try {
            const usersData = fs.readFileSync(path.join(__dirname, "auth", "data", "users.json")).toString(); // Convert the buffer to a string
            const users = usersData.length ? JSON.parse(usersData) : {};
            if (!users.hasOwnProperty(env.parsed.ROOT_USERNAME)) {
                users[env.parsed.ROOT_USERNAME] = {
                    password: await bcrypt.hash(env.parsed.ROOT_PASSWORD, 10),
                    permission: "0",
                    accesskey: crypto.randomBytes(16).toString("hex"),
                };
                fs.writeFileSync(path.join(__dirname, "auth", "data", "users.json"), JSON.stringify(users));
            }
        } catch (e) {
            console.error(e);
        }
    }
};
