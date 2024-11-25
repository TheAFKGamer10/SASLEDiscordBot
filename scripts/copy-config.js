const cpx = require('cpx');
const { glob } = require('glob');
const path = require('path');
const fs = require('fs');

const copyFiles = (srcPattern, dest, options = {}) => {
    return new Promise((resolve, reject) => {
        glob(srcPattern, { ignore: '**/*.ts' }, (err, files) => {
            if (err) {
                return reject(err);
            }
            Promise.all(files.map(file => {
                return new Promise((res, rej) => {
                    let relativePath = path.relative(path.dirname(srcPattern), file);
                    if (options.flatten) {
                        relativePath = path.basename(file);
                    }
                    const destPath = path.join(dest, relativePath);
                    const destDir = path.dirname(destPath);
                    cpx.copy(file, destDir, (err) => {
                        if (err) {
                            return rej(err);
                        }
                        res();
                    });
                });
            }))
                .then(resolve)
                .catch(reject);
        });
    });
};

(async () => {
    try {

        const copyTasks = [
            copyFiles('config/*.json', 'dist/config'),
            copyFiles('config/fto-complete/*.json', 'dist/config/fto-complete'),
            copyFiles('src/server/api/json/*.json', 'dist/src/server/api/json')
        ];

        const rootFiles = [
            '.env', 
            '.env.example', 
            'CONTRIBUTORS.md', 
            'LICENSE', 
            'package.json', 
            'package-lock.json'
        ];
        
        rootFiles.forEach(file => {
            copyTasks.push(copyFiles(file, 'dist/', { flatten: true }));
        });

        await Promise.all(copyTasks);

        console.log('Configuration files copied successfully.');
    } catch (err) {
        console.error('Error during file copy:', err);
        process.exit(1);
    }
})();