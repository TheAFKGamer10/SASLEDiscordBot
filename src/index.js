const { client, fs, env } = require("./importdefaults");
const rules = require('./commands/rules');
const join = require("./commands/join");
const emebedRuleFinder = require("./events/emebedRuleFinder");
const forcejoin = require("./commands/force-join");
const ftocomplete = require("./commands/fto-complete");
const rp = require("./commands/rp");
if (!fs.existsSync('./.env')) {
    console.log('No .env file found. Please create one before starting the bot again.');
    process.exit(126);
}
var hasdb = true;
let mysqlfile;
if (!process.env.MYSQL_CONNECTION_STRING == '') {
    mysqlfile = require("./events/mysqlhander");
} else {
    hasdb = false;
    console.log('No database connection found. Some functionality will be disabled.');
}

async function envcheck() {
    EmptyENVItmes = [];

    Object.values(process.env).forEach((value, index) => {
        if (value == '') {
            EmptyENVItmes.push(Object.keys(process.env)[index]);
        }
    });

    if (EmptyENVItmes.includes('MYSQL_CONNECTION_STRING')) {
        EmptyENVItmes.splice(EmptyENVItmes.indexOf('MYSQL_CONNECTION_STRING'), 1);
    }
    if (EmptyENVItmes.includes('npm_config_noproxy')) {
        EmptyENVItmes.splice(EmptyENVItmes.indexOf('npm_config_noproxy'), 1);
    }

    if (!EmptyENVItmes.length == 0) {
        console.log(`The following ENV items are empty and the bot can not be run without them: \n\x1b[1m${EmptyENVItmes.join(', ')}\x1b[0m\nPlease fill them in the .env file before starting the bot again.`);
        process.exit(126);
    }
}
envcheck();

client.on('ready', async () => {
    if (hasdb) {
        mysqlfile('connect');
    }
    console.log(`Logged in as ${client.user.tag}!`);
});


client.on('interactionCreate', async (interaction) => {
    const { commandName, options } = interaction;
    try {
        if (interaction.isAutocomplete()) {
            if (commandName === 'rules') {
                emebedRuleFinder(interaction);
                return;
            }
        }
        if (commandName === 'join') {
            join(interaction);
            return;
        }
        if (commandName === 'force-join') {
            forcejoin(interaction);
            return;
        }
        if (commandName === 'rules') {
            rules(interaction);
            return;
        }
        if (commandName === 'rp') {
            rp(interaction);
            return;
        }
        if (hasdb) { // If the bot has a database connection
            if (commandName === 'fto-complete') {
                ftocomplete(interaction)
                return;
            }
        } else {
            interaction.reply({ content: 'This command is not available at this time.', ephemeral: true });
        }
    } catch (error) {
        console.log(error);
    }
});


client.login(process.env.BOT_TOKEN);