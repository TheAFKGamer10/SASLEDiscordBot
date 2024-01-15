require('dotenv').config();
const { REST, Routes } = require('discord.js');
const rules = require("./../rules.config.json");

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

var departmentList = JSON.parse(process.env.ListOfDepartments.split(", "));
const departments = [];
departmentList.forEach(CurrentDepartment => {
  departments.push({
    name: `${process.env[CurrentDepartment + '_DEPARTMENT_NAME']}`,
    value: CurrentDepartment
  });

});

const embedchoices = [{ name: 'Rules Overview', value: 'rulesoverview' }];

Object.keys(rules).forEach(key => {
  if (!key.includes("_") && !key.includes("Overveiw")) {

    let value = key.toLowerCase();
    value = value.replace(/ /g, '');

    embedchoices.push({
      name: key,
      value: value
    });
  }
});


const commands = [
  {
    name: 'embed',
    description: 'Sends an embed message.',
    options: [
      {
        name: 'category',
        description: 'The category of embed you would like to send.',
        type: 3, // https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
        required: true,
        choices: embedchoices
      },
      {
        name: 'rulenumber',
        description: 'The rule number you would like to send.',
        type: 3, // https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
        autocomplete: true,
      },
      {
        name: 'chanel',
        description: 'The channel you would like to send the embed in.',
        type: 7, // https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
      }
    ]
  },
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
        choices: departments
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
