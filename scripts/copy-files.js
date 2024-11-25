const cpx = require('cpx');
const path = require('path');
const { glob } = require('glob');

const srcDir = path.join(__dirname, '..', 'src', 'client');
const destDir = path.join(__dirname, '..', 'dist', 'src', 'client');

const copyFiles = (srcPattern, dest) => {
    return new Promise((resolve, reject) => {
        glob(srcPattern, { ignore: '**/*.ts' }, (err, files) => {
            if (err) {
                return reject(err);
            }
            Promise.all(files.map(file => {
                return new Promise((res, rej) => {
                    const relativePath = path.relative(srcDir, file);
                    const destPath = path.join(dest, relativePath);
                    cpx.copy(file, path.dirname(destPath), (err) => {
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
        console.log(`Copying files from ${srcDir} to ${destDir}`);
        await copyFiles(`${srcDir}/**/*`, destDir);
        console.log('File copy completed successfully.');
    } catch (err) {
        console.error('Error during file copy:', err);
        process.exit(1);
    }
})();