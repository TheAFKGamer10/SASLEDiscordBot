require('dotenv').config();
const fs = require('fs');
const execSync = require('child_process').execSync;
function run(command, output = '') {
    output = execSync(command);
    return output.toString();
}

//run('git stash');
//run('git pull origin main');

const envVars = fs.readFileSync('.env', 'utf-8').split('\n').filter(line => line.includes('=') && !line.includes('#')).length;
const exampleVars = fs.readFileSync('.env.example', 'utf-8').split('\n').filter(line => line.includes('=') && !line.includes('#')).length;

if (envVars !== exampleVars) {
    console.log('There are new ENV variables in the .env.example file. Please update your .env file accordingly before starting the bot again.');
    process.exit(1);
}
