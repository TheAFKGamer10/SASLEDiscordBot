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
    const envVars = fs.readFileSync('.env', 'utf-8').split('\n').filter(line => line.includes('=') && !line.includes('#')).length;
    const exampleVars = fs.readFileSync('.env.example', 'utf-8').split('\n').filter(line => line.includes('=') && !line.includes('#')).length;
    
    if (envVars !== exampleVars) {
        console.log('There are new ENV variables in the .env.example file. Please update your .env file accordingly before starting the bot again.');
        process.exit(1);
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