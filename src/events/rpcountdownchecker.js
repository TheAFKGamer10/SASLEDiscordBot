let { client, EmbedBuilder, env, fs } = require('./../importdefaults.js');

module.exports = async function (hasdb) {
    let nextRpData
    setInterval(async () => {
        let currentTime = new Date();
        if (hasdb) {
            try {
                const mysql = require('./mysqlhander.js');
                nextRpData = (await mysql('select', 'rp', `SELECT * FROM rp`))
                for (let i = 0; i < nextRpData.length; i++) {
                    let time = nextRpData[i].timestamp;
                    let currentstring = currentTime.getFullYear() + " " + (currentTime.getMonth() + 1).toString().padStart(2, '0') + " " + currentTime.getDate().toString().padStart(2, '0') + " " + currentTime.getHours().toString().padStart(2, '0') + " " + currentTime.getMinutes().toString().padStart(2, '0');

                    let afterTime = new Date();
                    afterTime.setMinutes(afterTime.getMinutes() - 1);
                    let afterstring = afterTime.getFullYear() + " " + (afterTime.getMonth() + 1).toString().padStart(2, '0') + " " + afterTime.getDate().toString().padStart(2, '0') + " " + afterTime.getHours().toString().padStart(2, '0') + " " + afterTime.getMinutes().toString().padStart(2, '0');


                    if (afterstring.replace(/\s/g, '') > time.replace(/\s/g, '')) {
                        console.log('Deleting old RP data');
                        await mysql('delete', 'rp', `timestamp = '${time}'`);
                    }


                    if (currentstring == time) {
                        let content = `## Roleplay Will Be Happening Soon:\n\nAOP: **${nextRpData[i].aop}**`;
                        let channel = await client.channels.fetch(env.parsed.LOG_CHANNEL_ID);
                        channel.send(content);

                        await mysql('delete', 'rp', `timestamp = '${time}'`);
                        return;
                    }
                }

            } catch (e) {
                console.log(e);
            }
        } else {
            nextRpData = fs.existsSync('./src/files/next-rp.json') ? JSON.parse(fs.readFileSync('./src/files/next-rp.json', 'utf-8')) : {};
            let keys = Object.keys(nextRpData);
            for (let i = 0; i < keys.length; i++) {
                let time = keys[i];
                let currentstring = currentTime.getFullYear() + " " + (currentTime.getMonth() + 1).toString().padStart(2, '0') + " " + currentTime.getDate().toString().padStart(2, '0') + " " + currentTime.getHours().toString().padStart(2, '0') + " " + currentTime.getMinutes().toString().padStart(2, '0');

                let afterTime = new Date();
                afterTime.setMinutes(afterTime.getMinutes() - 1); // 1 minute behind current time
                let afterstring = afterTime.getFullYear() + " " + (afterTime.getMonth() + 1).toString().padStart(2, '0') + " " + afterTime.getDate().toString().padStart(2, '0') + " " + afterTime.getHours().toString().padStart(2, '0') + " " + afterTime.getMinutes().toString().padStart(2, '0');


                if (afterstring.replace(/\s/g, '') > time.replace(/\s/g, '')) {
                    console.log('Deleting old RP data');
                    delete nextRpData[time];
                    fs.writeFileSync('./src/files/next-rp.json', JSON.stringify(nextRpData, null, 4));
                }


                if (currentstring == time) {
                    let content = `## Roleplay Will Be Happening Soon:\n\nAOP: **${nextRpData[time].aop}**`;
                    let channel = await client.channels.fetch(env.parsed.LOG_CHANNEL_ID);
                    channel.send(content);

                    delete nextRpData[time];

                    fs.writeFileSync('./src/files/next-rp.json', JSON.stringify(nextRpData, null, 4));
                    return;
                }
            }
        }
    }, (60 - new Date().getSeconds()) * 1000); // 1 minute
}
