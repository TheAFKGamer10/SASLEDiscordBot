require('dotenv').config();
const { REST, Routes } = require('discord.js');

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

var departmentList = JSON.parse(process.env.ListOfDepartments.split(", "));
const choice = [];
departmentList.forEach(CurrentDepartment => {
    choice.push({
        name: `${process.env[CurrentDepartment + '_DEPARTMENT_NAME']}`,
        value: CurrentDepartment
    });

});

const commands = [
  {
    name: 'join',
    description: 'Join a Departmant.',
    options: [
        {
            name: 'department',
            description: 'The department you want to join.',
            type: 3, // https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
            required: true,
            autocomplete: false,
            choices: choice
        }
    ]
  }
];


(async () => {
    try {
      console.log('Registering slash commands...');
  
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID,
          process.env.GUILD_ID
        ),
        { body: commands }
      );
  
      console.log('Slash commands were registered successfully!');
    } catch (error) {
      console.log(`There was an error: ${error}`);
    }
})();
