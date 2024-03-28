const { client, fs, env } = require("./importdefaults");
const rules = require('./commands/rules');
const join = require("./commands/join");
const emebedRuleFinder = require("./events/emebedRuleFinder");
const forcejoin = require("./commands/force-join");
const ftocomplete = require("./commands/fto-complete");
const ftotrain = require("./commands/fto-train");
const rp = require("./commands/rp");
const rpcountdownchecker = require("./events/rpcountdownchecker");
if (!fs.existsSync('./.env')) {
    console.log('No .env file found. Please create one before starting the bot again.');
    process.exit(126);
}
var hasdb = true;
let mysqlfile;
if (env.parsed.MYSQL_CONNECTION_STRING !== '') {
    mysqlfile = require("./events/mysqlhander");
} else {
    hasdb = false;
    console.log('No database connection found. Some functionality will be disabled.');
}

async function envcheck() {
    requireditems = ['BOT_TOKEN', 'CLIENT_ID', 'GUILD_ID', 'LOG_CHANNEL_ID', 'LEO_ROLE_ID', 'CADET_ROLE_ID', 'LIST_OF_DEPARTMENTS'];
    empty = [];
    depsreq = [];

    JSON.parse(env.parsed.LIST_OF_DEPARTMENTS).forEach(element => {
        depsreq.push(element.toUpperCase() + '_START_LETTER');
        depsreq.push(element.toUpperCase() + '_DEPARTMENT_NAME');
        depsreq.push(element.toUpperCase() + '_ROLE_ID');
        if (env.parsed.MYSQL_CONNECTION_STRING !== '') {
            depsreq.push(element.toUpperCase() + '_PROBIB_ID');
            requireditems.push('JOIN_SERVER_ROLE_ID');
        }
    });

    Object.keys(env.parsed).forEach(element => {
        if (requireditems.includes(element) && env.parsed[element] == '') {
            empty.push(element);
        }
        if (element.includes('_START_LETTER') || element.includes('_DEPARTMENT_NAME') || element.includes('_ROLE_ID') || element.includes('_PROBIB_ID')) {
            if (depsreq.includes(element) && env.parsed[element] == '') {
                empty.push(element);
            }
        }
    });

    if (empty.length !== 0) {
        console.log(`The following ENV items are empty and the bot can not be run without them: \n\x1b[1m${empty.join(', ')}\x1b[0m\nPlease fill them in the .env file before starting the bot again.`);
        process.exit(126);
    }
}
envcheck();

client.on('ready', async () => {
    if (hasdb) {
        mysqlfile('connect');
    }
    if (env.parsed.UPTIME_KUMA_URL !== undefined && env.parsed.UPTIME_KUMA_URL !== '') {
        console.log('This method of uptime kuma is no longer supported. Please use the new method of sending a HTTP(s) request to the bots website insted.');
        setInterval(function () {
            fetch(env.parsed.UPTIME_KUMA_URL, {
                method: 'GET',
            }).then((response) => {
                if (response.status !== 200) {
                    console.log(`Uptime Kuma: Error: ${response.status}`);
                }
            }).catch((error) => {
                console.log(`Uptime Kuma: Error: ${error}`);
            });
        }, env.parsed.UPTIME_KUMA_INTERVAL * 1000);
    }
    rpcountdownchecker(hasdb);

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
            if (commandName === 'fto-train') {
                ftotrain(interaction);
                return;
            }
        } else {
            interaction.reply({ content: 'This command is not available at this time.', ephemeral: true });
        }
    } catch (error) {
        console.log(error);
    }
});


client.login(env.parsed.BOT_TOKEN).catch((error) => {
    console.log(error);
});