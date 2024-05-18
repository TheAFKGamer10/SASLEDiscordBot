const fs = require('fs');
const path = require('path');

function removeUseStrict(directoryPath, isFile) {
    if (isFile) {
        fs.readFile(directoryPath, 'utf8', function(err, data) {
            if (err) {
                return console.log('Unable to read file: ' + err);
            }

            const result = data.replace('"use strict";', '');

            fs.writeFile(directoryPath, result, 'utf8', function(err) {
                if (err) {
                    return console.log('Unable to write file: ' + err);
                }
            });
        });
        return;
    } else {
        fs.readdir(directoryPath, { withFileTypes: true }, function (err, dirents) {
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            }

            dirents.forEach(function (dirent) {
                if (dirent.isDirectory()) {
                    removeUseStrict(path.join(directoryPath, dirent.name), false);
                } else if (dirent.isFile() && path.extname(dirent.name) === '.js') {
                    const filePath = path.join(directoryPath, dirent.name);
                    fs.readFile(filePath, 'utf8', function(err, data) {
                        if (err) {
                            return console.log('Unable to read file: ' + err);
                        }

                        const result = data.replace('"use strict";', '');

                        fs.writeFile(filePath, result, 'utf8', function(err) {
                            if (err) {
                                return console.log('Unable to write file: ' + err);
                            }
                        });
                    });
                }
            });
        });
    }
}

if (process.argv.includes('-f') || process.argv.includes('--file')) {
    const filePath = path.join(__dirname, '..', process.argv[process.argv.length - 1]);
    removeUseStrict(filePath, true);
} else {
    const directoryPath = path.join(__dirname, '..', process.argv[process.argv.length - 1]);
    removeUseStrict(directoryPath, false);
}