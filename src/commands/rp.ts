import { env, fs } from "../importdefaults";
import mysql from '../events/mysqlhander.js';
import path from 'path';

export default async (interaction: { deferReply?: any; reply?: any; member?: any; editReply?: any; commandName?: any; options?: any; }) => {
    const { commandName, options } = interaction;

    const aop = options.getString('aop');
    let time = options.getString('time');
    const ping = options.getBoolean('ping') ?? true;
    const training = options.getBoolean('training') ?? true;
    const pingatrptime = options.getBoolean('pingatrptime') ?? true;
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

    var output = `## Roleplay Will Be Happening Soon:\n\nAOP: **${aop}**\nTime: **<t:${timestamp}:f>**`;

    if (ping) {
        output += `\nPing: ||@everyone||`;
    }
    if (training) {
        output += `\nTraining: <@&${env.parsed.CADET_ROLE_ID}> training **will** he happening!`;
    }

    const rpTime = new Date(timestamp * 1000);
    if (env.parsed.MYSQL_CONNECTION_STRING !== '' && env.parsed.MYSQL_CONNECTION_STRING !== null && env.parsed.MYSQL_CONNECTION_STRING !== undefined) {
        const newData = rpTime.getFullYear() + " " + (rpTime.getMonth() + 1).toString().padStart(2, '0') + " " + rpTime.getDate().toString().padStart(2, '0') + " " + rpTime.getHours().toString().padStart(2, '0') + " " + rpTime.getMinutes().toString().padStart(2, '0');
        await mysql('insert', 'rp', `('${aop}', '${newData}', ${ping}, ${training}, ${pingatrptime})`);
        await mysql('insert', 'pastrp', `('${aop}', '${newData}', '${interaction.member.user.displayName}', ${ping}, ${training}, ${pingatrptime})`);
    } else {
        const existingData = fs.readFileSync(path.join(__dirname, '..', 'files', 'next-rp.json'), 'utf-8');
        const newData = { [rpTime.getFullYear() + " " + (rpTime.getMonth() + 1).toString().padStart(2, '0') + " " + rpTime.getDate().toString().padStart(2, '0') + " " + rpTime.getHours().toString().padStart(2, '0') + " " + rpTime.getMinutes().toString().padStart(2, '0')]: { aop, ping, training, pingatrptime } };
        const mergedData = { ...JSON.parse(existingData), ...newData };
        fs.writeFileSync(path.join(__dirname, '..', 'files', 'next-rp.json'), JSON.stringify(mergedData, null, 4));
    }

    interaction.reply({ content: output, allowedMentions: { parse: ["everyone"] } });
}
