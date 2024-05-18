import { client, env, fs } from './../importdefaults.js';
import mysql from './mysqlhander.js';

export default async function (hasdb: boolean) {
    let nextRpData;

    const secondtimer = setInterval(async () => {
        if (new Date().getSeconds() == 1) {
            starttimer();
            clearInterval(secondtimer);
        }
    }, (1000)); // 1 second

    function starttimer() {
        setInterval(async () => {
            if (hasdb) {
                try {
                    let nextRpData: any = (await mysql('select', 'rp', `SELECT * FROM rp`));
                    for (let i = 0; i < nextRpData.length; i++) {
                        let currentTime = new Date();

                        let time = nextRpData[i].timestamp;
                        let currentstring = currentTime.getFullYear() + " " + (currentTime.getMonth() + 1).toString().padStart(2, '0') + " " + currentTime.getDate().toString().padStart(2, '0') + " " + currentTime.getHours().toString().padStart(2, '0') + " " + currentTime.getMinutes().toString().padStart(2, '0');

                        let afterTime = new Date();
                        afterTime.setMinutes(afterTime.getMinutes() - 1);
                        let afterstring = afterTime.getFullYear() + " " + (afterTime.getMonth() + 1).toString().padStart(2, '0') + " " + afterTime.getDate().toString().padStart(2, '0') + " " + afterTime.getHours().toString().padStart(2, '0') + " " + afterTime.getMinutes().toString().padStart(2, '0');


                        if (afterstring.replace(/\s/g, '') > time.replace(/\s/g, '')) {
                            console.log('Deleting old RP data.');
                            await mysql('delete', 'rp', `timestamp = '${time}'`);
                        }

                        if (currentstring == time) {
                            if (nextRpData[i].pingatrptime == 1) {
                                let content = `## Roleplay Is Happing Now:\n\nAOP: **${nextRpData[i].aop}**`;
                                if (nextRpData[i].ping == 1) {
                                    content += `\nPing: ||@everyone||`;
                                }
                                if (nextRpData[i].training == 1) {
                                    content += `\nTraining: <@&${env.parsed.CADET_ROLE_ID}> training **will** he happening!`;
                                }
                                await client.login(env.parsed.BOT_TOKEN); // Don't ask my why it needs to login again, but it does, dont touch.
                                const fetchedChannel = await client.channels.fetch(env.parsed.ROLEPLAY_ANOUNCEMENT_CHANNEL_ID);
                                await fetchedChannel.send(content);
                                // client.destroy();
                            }
                            await mysql('delete', 'rp', `timestamp = '${time}'`);
                        }
                    }

                } catch (e) {
                    console.log(e);
                }
            } else {
                nextRpData = fs.existsSync('./src/files/next-rp.json') ? JSON.parse(fs.readFileSync('./src/files/next-rp.json', 'utf-8')) : {};
                let keys = Object.keys(nextRpData);
                for (let i = 0; i < keys.length; i++) {
                    let currentTime = new Date();
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
                        if (nextRpData[time].pingatrptime) {
                            let content = `## Roleplay Is Happing Now:\n\nAOP: **${nextRpData[time].aop}**`;
                            if (nextRpData[time].pingatrptime == 1) {
                                content += `\nPing: ||@everyone||`;
                            }
                            if (nextRpData[time].training == 1) {
                                content += `\nTraining: <@&${env.parsed.CADET_ROLE_ID}> training **will** he happening!`;
                            }

                            await client.login(env.parsed.BOT_TOKEN); // Don't ask my why it needs to login again, but it does, dont touch.
                            const fetchedChannel = await client.channels.fetch(env.parsed.ROLEPLAY_ANOUNCEMENT_CHANNEL_ID);
                            await fetchedChannel.send(content);
                            // client.destroy();

                        }
                        delete nextRpData[time];

                        fs.writeFileSync('./src/files/next-rp.json', JSON.stringify(nextRpData, null, 4));
                    }
                }
            }
        }, (1 * 60 * 1000)); // 1 minute
    }
}
