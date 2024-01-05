require('dotenv').config();
const { Client, IntentsBitField, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
    PermissionFlagsBits: [
        PermissionFlagsBits.ManageNicknames,
    ],
});

const CurrentUsersNumbers = [];

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

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
    
    if (CurrentUsersNumbers.length >= 100 ) {
        throw new Error("There are more than 100 users in a department. Cannot add more.");
    }
});



client.on('interactionCreate', async (interaction) => {
    const { commandName, options } = interaction;
    try {
        if (commandName === 'join') {
            const AllReadyInDepartment = interaction.member.roles.cache.has(process.env.LEO_ROLE_ID);
            const UsersName = interaction.member.user.username;
            const department = options.getString('department');
            if (AllReadyInDepartment) {
                interaction.reply({ content: 'You are already in a department!', ephemeral: true }); return;
            }

            
            const NewDepartID = Math.floor(Math.random().toFixed(2) * 89) + 10;
            function getDepartID() {
                NewDepartID = Math.floor(Math.random().toFixed(2) * 89) + 10;
            }
            if (CurrentUsersNumbers.includes(NewDepartID)) {
                getDepartID();
            }

            var departmentFound = false;
            var departmentList = JSON.parse(process.env.ListOfDepartments.split(", "));

            departmentList.forEach(CurrentDepartment => {
                if (department === CurrentDepartment && !departmentFound) { 
                    interaction.member.roles.add(process.env.LEO_ROLE_ID);
                    interaction.member.roles.add(`${process.env[CurrentDepartment + '_ROLE_ID']}`);
                    interaction.member.edit({ nick: `${process.env[CurrentDepartment + '_START_LETTER']}-0${NewDepartID} | ${UsersName}` });
                    interaction.reply({ content: `You have been added to ${process.env[CurrentDepartment + '_DEPARTMENT_NAME']}!`, ephemeral: true });
                    departmentFound = true;
                }
            });               
        }
    } catch (error) {
        console.log(error);
    }
});


client.login(process.env.BOT_TOKEN);