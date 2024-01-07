const { client, EmbedBuilder, env } = require("../importdefaults");

module.exports = async (interaction, CurrentUsersNumbers) => {
    const { commandName, options } = interaction;

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
            departmentFound = true;
            interaction.reply({ content: `You have been added to ${process.env[CurrentDepartment + '_DEPARTMENT_NAME']}!`, ephemeral: true });
            interaction.member.roles.add(process.env.LEO_ROLE_ID);
            interaction.member.roles.add(process.env.CADET_ROLE_ID);
            interaction.member.roles.add(`${process.env[CurrentDepartment + '_ROLE_ID']}`);
            interaction.member.edit({ nick: `${process.env[CurrentDepartment + '_START_LETTER']}-0${NewDepartID} | ${UsersName}` });
            console.log(`${NewDepartID} has joined ${process.env[CurrentDepartment + '_DEPARTMENT_NAME']}`);

            const embed = new EmbedBuilder()
                .setTitle(`${UsersName} has joined ${process.env[CurrentDepartment + '_DEPARTMENT_NAME']}`)
                .setColor(0x0099FF)
                .setTimestamp();
            client.channels.cache.get(process.env.LOG_CHANNEL_ID).send({ embeds: [embed] });
        }
    });
}