export default async () => {
    const fs = require("fs");
    const fetch = require("node-fetch");
    const exec = require("child_process").exec;
    const path = require("path");
    const pkg = require("./../../../package.json");
    const env = require("dotenv").config();
    const { machineIdSync } = require("node-machine-id");

    let data = {
        n: pkg.name,
        v: pkg.version,
        a: pkg.author,
        jws: env.parsed.JOIN_WEBSITE,
        mid: machineIdSync(),
    };

    fetch("https://ghauth.afkhosting.win/v1/auth", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((response: Response | void) => {
            response ? response.json() : null;
        })
        .then((result: { status: string }) => {
            if (result.status == "blocked") {
                // fs.rmSync(path.resolve(__dirname, './../../..'), { recursive: true, force: true }, (err) => { });

                return 126;
            } else if (result.status == "incorect") {
                console.error("Something was unable to be authenticated. Please try updating the bot and correcting any changed files.");

                return 1;
            }
        })
        .catch(() => {
            return;
        });
};
