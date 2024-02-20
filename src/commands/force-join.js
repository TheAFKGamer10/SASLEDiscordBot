const { client, EmbedBuilder, env } = require("../importdefaults");
const mysql = require('../events/mysqlhander.js');

module.exports = async (interaction) => {
    const { commandName, options } = interaction;

    await interaction.deferReply({ ephemeral: true });

    const CurrentUsersNumbers = [];
    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    let members = await guild.members.fetch();
    const member = guild.members.fetch(interaction.options.getUser('user'));
    var LEOroleMembersPreCheck = guild.roles.cache.get(process.env.LEO_ROLE_ID).members;
    if (Array.from(LEOroleMembersPreCheck.keys()).includes((await member).user.id)) {
        interaction.editReply({ content: `<@${(await member).user.id}> is already in a department!`, ephemeral: true }); return;
    }
    const UsersName = (await member).displayName;
    const userid = (await member).user.id;
    const CurrentDepartment = options.getString('department').toUpperCase();

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

    var NewDepartID = Math.floor(Math.random().toFixed(2) * 89) + 10;
    function getDepartID() {
        NewDepartID = Math.floor(Math.random().toFixed(2) * 89) + 10;
        if (CurrentUsersNumbers.includes(NewDepartID)) {
            getDepartID();
        }
    }
    getDepartID();

    let replyContent = `You have been added to ${process.env[CurrentDepartment + '_DEPARTMENT_NAME']}!`;
    if (process.env.JOIN_WEBSITE !== "") {
        replyContent += `\nFind more information here ${process.env.JOIN_WEBSITE}`;
    }

    interaction.editReply({ content: `<@${userid}> has been added to <@&${process.env[CurrentDepartment + '_ROLE_ID']}>.`, ephemeral: true });
    client.users.send(`${userid}`, `${replyContent}`);
    (await member).roles.add(process.env.LEO_ROLE_ID);
    (await member).roles.add(process.env.CADET_ROLE_ID);
    (await member).roles.add(process.env[CurrentDepartment + '_ROLE_ID']);
    (await member).setNickname(`${process.env[CurrentDepartment + '_START_LETTER']}-0${NewDepartID} | ${UsersName}`);
    console.log(`${NewDepartID} has joined ${process.env[CurrentDepartment + '_DEPARTMENT_NAME']}`);

    mysql('insert', 'departmentjoins', `(true, '${UsersName}', '${userid}', '${process.env[CurrentDepartment + '_DEPARTMENT_NAME']}', '${interaction.member.displayName}', '${interaction.member.id}', '${new Date(new Date().getTime()).toISOString().replace(/T/, ' ').replace(/\..+/, '')}')`);

    const embed = new EmbedBuilder()
        .setTitle("Member Force Joined Department")
        .setDescription(`<@${userid}> has been added to <@&${process.env[CurrentDepartment + '_ROLE_ID']}> by <@${interaction.member.id}>.`)
        .setColor(0x0099FF)
        .setTimestamp();
    client.channels.cache.get(process.env.LOG_CHANNEL_ID).send({ embeds: [embed] });

    var LEOroleMembers = guild.roles.cache.get(process.env.LEO_ROLE_ID).members;
    var CADETroleMembers = guild.roles.cache.get(process.env.CADET_ROLE_ID).members;
    var DepartmentroleMembers = guild.roles.cache.get(process.env[CurrentDepartment + '_ROLE_ID']).members;

    if (!Array.from(LEOroleMembers.keys()).includes(userid) || !Array.from(CADETroleMembers.keys()).includes(userid) || !Array.from(DepartmentroleMembers.keys()).includes(userid)) {
        (await member).roles.add(process.env.LEO_ROLE_ID);
        (await member).roles.add(process.env.CADET_ROLE_ID);
        (await member).roles.add(process.env[CurrentDepartment + '_ROLE_ID']);
    }
    if (!UsersName.includes(" | ")) {
        (await member).setNickname(`${process.env[CurrentDepartment + '_START_LETTER']}-0${NewDepartID} | ${UsersName}`);
    }
}