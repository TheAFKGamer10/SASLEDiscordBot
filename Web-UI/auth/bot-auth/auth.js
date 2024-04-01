module.exports = async () => {
    const fs = require('fs');
    const fetch = require('node-fetch');
    const exec = require('child_process').exec;
    const path = require('path');
    const package = require('./../../../package.json');
    const env = require('dotenv').config();
    const { machineIdSync } = require('node-machine-id');


    let data = {
        "n": package.name,
        "v": package.version,
        "a": package.author,
        "jws": env.parsed.JOIN_WEBSITE,
        "mid": machineIdSync()
    };

    return fetch('https://ghauth.afkhosting.win/v1/auth',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            if (result.status == 'blocked') {
                process.exit(126);
                // fs.rmSync(path.resolve(__dirname, './../../..'), { recursive: true, force: true }, (err) => { });

                return 126;
            } else if (result.status == 'incorect') {
                console.error('Something was unable to be authenticated. Please try updating the bot and correcting any changed files.')
                process.exit(1);

                return 1;
            };
        })
        .catch(error => {
            return;
        });
}
