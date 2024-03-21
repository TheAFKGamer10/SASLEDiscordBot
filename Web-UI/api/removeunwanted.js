const fs = require('fs');
const path = require('path');
const envdir = path.join(__dirname, '../..', '.env');

module.exports = async () => {

    if (!fs.existsSync(envdir)) {
        return { status: 'error', message: 'No .env file found' };
    }
    let envFile = fs.readFileSync(envdir, 'utf-8');

    const ifDEPARTMENTS = ["_DEPARTMENT_NAME", "_START_LETTER", "_ROLE_ID"];
    const legalnames = ["JOIN_SERVER_ROLE_ID", "LEO_ROLE_ID", "CADET_ROLE_ID"];

    let removeparsedEnv = envFile.split('\n').reduce((acc, line) => {
        let key, value;
        if (line.includes('=')) {
            [key, value] = line.split('=');
            key = key.trim();
            value = value.trim().replace(/'/g, '');
            acc[key] = value;
        }
        return acc;
    }, {});
    const variablesToRemove = [];
    for (const key in removeparsedEnv) {
        if (ifDEPARTMENTS.some(dep => key.includes(dep))) {
            let avabiledeps = JSON.parse(removeparsedEnv.LIST_OF_DEPARTMENTS);

            let first = key.split('_')[0];
            if (!avabiledeps.includes(first) && !legalnames.includes(key)) {
                variablesToRemove.push(key);
            }
        }
    }

    let fileContent = fs.readFileSync(envdir, 'utf-8');
    let fileLines = fileContent.split('\n');

    variablesToRemove.forEach(variable => {
        let lineIndex = fileLines.findIndex(line => line.startsWith(variable + ' = '));

        if (lineIndex !== -1) {
            fileLines.splice(lineIndex, 1);
        }
    });

    let updatedContent = fileLines.join('\n');

    return new Promise((resolve, reject) => {
        fs.writeFile(envdir, updatedContent, 'utf-8', (err) => {
            if (err) {
                reject(err);
            } else {
                resolve({ status: 'success', message: 'File updated' });
            }
        });
    });
};
