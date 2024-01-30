const { client, EmbedBuilder, env, fs } = require("../importdefaults");
const mysql = require('../events/mysqlhander.js');

module.exports = async (interaction) => {
    const { commandName, options } = interaction;

    const aop = options.getString('aop');
    var time = options.getString('time');
    const ping = options.getBoolean('ping');
    const training = options.getBoolean('training');

    var output = `## Roleplay Will Be Happening Soon:\n\nAOP: **${aop}**\nTime: **<t:${time}:f>**`;

    if (ping) {
        output += `\nPing: ||@everyone||`;
    }
    if (training) {
        output += `\nTraining: <@&${process.env.CADET_ROLE_ID}> training **will** he happening!`;
    }

    interaction.Reply({ content: output, allowedMentions: { parse: ["everyone"] } });
}
