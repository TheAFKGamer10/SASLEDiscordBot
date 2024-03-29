require('dotenv').config();
const { REST, Routes } = require('discord.js');
const rules = require("./../config/rules.config.json");

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
    name: 'rules',
    description: 'Sends the catogory of rule selected.',
    options: [
      {
        name: 'category',
        description: 'The category of rule you would like to send.',
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
        description: 'The channel you would like to send the rule in.',
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
  },
  {
    name: 'force-join',
    description: 'Make a user join a department.',
    options: [
      {
        name: 'department',
        description: 'The department you want them to join.',
        type: 3, // https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
        required: true,
        choices: departments
      },
      {
        name: 'user',
        description: 'The user being forced inot a department.',
        type: 6, // https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
        required: true,
      }
    ]
  },
  {
    name: 'fto-complete',
    description: 'Let\'s FTO easely mark a cadet as complete or not.',
    options: [
      {
        name: 'cadet',
        description: 'The cadet you want to mark.',
        type: 6, // https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
        required: true,
      },
      {
        name: 'passed',
        description: 'Did the Cadet pass training?',
        type: 5, // https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
        required: true,
      }
    ]
  },
  {
    name: 'fto-train',
    description: 'Starts the training process for a cadet.',
    options: [
      {
        name: 'cadet',
        description: 'The cadet you want to train.',
        type: 6, // https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
        required: true,
      }
    ]
  },
  {
    name: 'rp',
    description: 'Let\'s you ping (or not) for Roleplay.',
    options: [
      {
        name: 'aop',
        description: 'The area of current Roleplay',
        type: 3, // https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
        required: true,
      },
      {
        name: 'time',
        description: 'The time of current Roleplay',
        type: 3, // https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
        required: true,
      },
      {
        name: 'ping',
        description: 'Would you like to ping everyone? Default: Yes',
        type: 5, // https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
      },
      {
        name: 'training',
        description: 'Is training avabile? Default: Yes',
        type: 5, // https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-option-type
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
