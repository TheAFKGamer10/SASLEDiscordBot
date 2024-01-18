const { client, EmbedBuilder, env } = require("../importdefaults");

module.exports = async (interaction) => {
    const { commandName, options } = interaction;

    await interaction.deferReply({ ephemeral: true });

    const CurrentUsersNumbers = [];
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    let members = await guild.members.fetch();
    const AllReadyInDepartment = interaction.member.roles.cache.has(process.env.LEO_ROLE_ID);
    const UsersName = interaction.member.user.displayName;
    const department = options.getString('department');

    async function getusers() {
        members.forEach((member) => {
            MembersList = member.displayName;

            if (MembersList.includes(" | ")) {
                const UserDepartID = MembersList.split(' | ')[0];
                const index = UserDepartID.length - 1;

                let num1 = MembersList.charAt(index - 1);
                let num2 = MembersList.charAt(index);

                CurrentUsersNumbers.push(num1 + num2);
            }
        });


        if (CurrentUsersNumbers.length >= 99) {
            const toomanyusersembed = new EmbedBuilder()
                .setTitle("Departments Full")
                .setDescription(`All departments are full. The maximum number of users are in a department. Contact an admin to review the departments.`)
                .setColor(0xFF470F)
                .setTimestamp();
            client.channels.cache.get(process.env.LOG_CHANNEL_ID).send({ embeds: [toomanyusersembed] });
            throw new Error("There are more than 100 users in a department. Cannot add more.");
        }
    }
    await getusers();


    if (AllReadyInDepartment) {
        interaction.editReply({ content: 'You are already in a department!', ephemeral: true }); return;
    }


    var NewDepartID = Math.floor(Math.random().toFixed(2) * 89) + 10;
    function getDepartID() {
        NewDepartID = Math.floor(Math.random().toFixed(2) * 89) + 10;
        if (CurrentUsersNumbers.includes(NewDepartID)) {
            getDepartID();
        }
    }
    getDepartID();

    CurrentDepartment = department.toUpperCase();

    let replyContent = `You have been added to ${process.env[CurrentDepartment + '_DEPARTMENT_NAME']}!`;
    if (process.env.JOIN_WEBSITE !== "") {
        replyContent += `\nFind more information here ${process.env.JOIN_WEBSITE}`;
    }

    interaction.editReply({ content: replyContent, ephemeral: true });
    interaction.member.roles.add(process.env.LEO_ROLE_ID);
    interaction.member.roles.add(process.env.CADET_ROLE_ID);
    interaction.member.roles.add(`${process.env[CurrentDepartment + '_ROLE_ID']}`);
    interaction.member.edit({ nick: `${process.env[CurrentDepartment + '_START_LETTER']}-0${NewDepartID} | ${UsersName}` });
    console.log(`${NewDepartID} has joined ${process.env[CurrentDepartment + '_DEPARTMENT_NAME']}`);

    const embed = new EmbedBuilder()
        .setTitle("Member Joined Department")
        .setDescription(`<@${interaction.member.user.id}> has joined <@&${process.env[CurrentDepartment + '_ROLE_ID']}>.`)
        .setColor(0x0099FF)
        .setTimestamp();
    client.channels.cache.get(process.env.LOG_CHANNEL_ID).send({ embeds: [embed] });

    if (!interaction.member.displayName.includes(" | ")) {
        interaction.member.edit({ nick: `${process.env[CurrentDepartment + '_START_LETTER']}-0${NewDepartID} | ${UsersName}` });
        console.log('Double Checked')
    }
}