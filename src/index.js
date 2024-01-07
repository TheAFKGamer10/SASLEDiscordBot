const { client, EmbedBuilder, env } = require("./importdefaults");
const embed = require('./commands/embed');
const join = require("./commands/join");

const CurrentUsersNumbers = [];

async function getUsersNumbers() {
    console.log("fetching users");
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    let members = await guild.members.fetch();
    members.forEach((member) => {
        MembersList = member.displayName;

        if (MembersList.includes("|")) {
            const UserDepartID = MembersList.split(' | ')[0];
            const index = UserDepartID.length - 1;

            let num1 = MembersList.charAt(index - 1);
            let num2 = MembersList.charAt(index);

            CurrentUsersNumbers.push(num1 + num2);
        }
    });

    console.log(CurrentUsersNumbers);

    if (CurrentUsersNumbers.length >= 100) {
        throw new Error("There are more than 100 users in a department. Cannot add more.");
    }
}

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    await getUsersNumbers();
});



client.on('interactionCreate', async (interaction) => {
    const { commandName, options } = interaction;
    try {
        if (commandName === 'join') {
            join(interaction, CurrentUsersNumbers);
        }
        if (commandName === 'embed') {
            embed(interaction);
        }
    } catch (error) {
        console.log(error);
    }
});


client.login(process.env.BOT_TOKEN);