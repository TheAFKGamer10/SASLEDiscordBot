const { client, env } = require("./importdefaults");
const embed = require('./commands/embed');
const join = require("./commands/join");
const emebedRuleFinder = require("./events/emebedRuleFinder");
const forcejoin = require("./commands/force-join");

function envcheck() {
    EmptyENVItmes = [];

    Object.values(process.env).forEach((value, index) => {
        if (value == '') {
            EmptyENVItmes.push(Object.keys(process.env)[index]);
        }
    });

    EmptyENVItmes.splice(EmptyENVItmes.indexOf('npm_config_noproxy'), 1);   

    if (!EmptyENVItmes.length == 0) {
        console.log(`The following ENV items are empty and the bot can not be run without them: \n\x1b[1m${EmptyENVItmes.join(', ')}\x1b[0m\nPlease fill them in the .env file.`);
        process.exit(126);
    }
}
envcheck();

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


client.on('interactionCreate', async (interaction) => {
    const { commandName, options } = interaction;
    try {
        if (interaction.isAutocomplete()) {
            if (commandName === 'embed') {
                emebedRuleFinder(interaction);
                return;
            }
        }
        if (commandName === 'join') {
            join(interaction);
        }
        if (commandName === 'force-join') {
            forcejoin(interaction);
        }
        if (commandName === 'embed') {
            embed(interaction);
        }
    } catch (error) {
        console.log(error);
    }
});


client.login(process.env.BOT_TOKEN);