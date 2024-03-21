const path = require('path');
const envdir = path.join(__dirname, '../..', '.env');
const fs = require('fs');
const remove = require('./removeunwanted');

module.exports = async () =>{
    if (!fs.existsSync(envdir)) {
        return { status: 'error', message: 'No .env file found' };
    }
    
    await remove().then(() => {});

    envFile = fs.readFileSync(envdir, 'utf-8');
    const parsedEnv = envFile.split('\n').reduce((acc, line) => {
        let key, value;
        if (line.includes('=')) {
            [key, value] = line.split('=');
            key = key.trim();
            value = value.trim().replace(/'/g, '');
            if (value.includes('[') && value.includes(']')) {
                value = JSON.parse(value).toString().replace(/,/g, ', ');
            }
        } else {
            return acc;
        }
        acc[key] = value;
        return acc;
    }, {});
    return parsedEnv;
};

