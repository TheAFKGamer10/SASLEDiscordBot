const { client } = require("./importdefaults");
const embed = require('./commands/embed');
const join = require("./commands/join");
const emebedRuleFinder = require("./events/emebedRuleFinder");

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
        if (commandName === 'embed') {
            embed(interaction);
        }
    } catch (error) {
        console.log(error);
    }
});


client.login(process.env.BOT_TOKEN);