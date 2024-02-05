const { client, EmbedBuilder, env, fs } = require("../importdefaults");
const mysql = require('../events/mysqlhander.js');

module.exports = async (interaction) => {
    const { commandName, options } = interaction;

    const aop = options.getString('aop');
    var time = options.getString('time');
    const ping = options.getBoolean('ping') !== null ? options.getBoolean('ping') : true;
    const training = options.getBoolean('training') !== null ? options.getBoolean('training') : true;
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
        output += `\nTraining: <@&${process.env.CADET_ROLE_ID}> training **will** he happening!`;
    }

    interaction.reply({ content: output, allowedMentions: { parse: ["everyone"] } });
}
