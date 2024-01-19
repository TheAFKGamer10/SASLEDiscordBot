require('dotenv').config();
const execSync = require('child_process').execSync;
function run(command, output = '') {
    output = execSync(command);
    return output.toString();
}

OldENVLenght = Object.keys(process.env).length;
EmptyENVItmes = [];

run ('git stash');
run ('git pull');

if (OldENVLenght != Object.keys(process.env).length) {
    Object.values(process.env).forEach((value, index) => {
        if (value == '') {
            EmptyENVItmes.push(Object.keys(process.env)[index]);
        }
    });

    console.log(`The following ENV items are empty and the bot can not be run without them: \n\x1b[1m${EmptyENVItmes.join(', ')}\x1b[0m.\nPlease fill them in the .env file.`);
    process.exit(126);
}
