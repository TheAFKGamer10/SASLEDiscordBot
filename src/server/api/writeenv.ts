import fs from 'fs';
import path from 'path';
const envdir = path.join(__dirname, '../..', '.env');

export default async (data: { [x: string]: any; }) => {
    try {
        let fileContent = fs.readFileSync(envdir, 'utf-8');
        let fileLines = fileContent.split('\n');
        Object.keys(data).forEach(element => {
            let lineIndex = fileLines.findIndex(line => line.startsWith(element + ' = '));
            if (lineIndex !== -1) {
                if (/^\d+$/.test(data[element]))
                    fileLines[lineIndex] = element + ' = ' + (data[element] ? data[element] : '');
                else if (data[element].includes('[') && data[element].includes(']')) {
                    fileLines[lineIndex] = element + ' = ' + (data[element] ? data[element].replace(/\s/g, '') : '');
                } else {
                    fileLines[lineIndex] = element + ' = \'' + data[element] + '\'';
                }
            } else {
                if (/^\d+$/.test(data[element]))
                    fileLines.push(element + ' = ' + (data[element] ? data[element] : ''));
                else if (data[element].includes('[') && data[element].includes(']')) {
                    fileLines.push(element + ' = ' + JSON.parse(data[element]));
                } else {
                    fileLines.push(element + ' = \'' + (data[element] ? data[element] : '') + '\'');
                }
            }

            fs.writeFileSync(envdir, fileLines.join('\n'));
        });
    } catch (error) {
        console.error('Error:', error);
    }
}