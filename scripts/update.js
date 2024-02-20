require('dotenv').config();
const fs = require('fs');
const execSync = require('child_process').execSync;
var oldVersion = require('../package.json').version;
function run(command, output = '') {
    output = execSync(command);
    return output.toString();
}

run('git stash');
run('git pull origin main');
run('npm install');

var newVersion = require('../package.json').version;
if (oldVersion !== newVersion) {
    console.log('There are new ENV variables in the .env.example file. Please update your .env file accordingly before starting the bot again.');
}
console.log('Version updated from ' + oldVersion + ' to ' + newVersion);