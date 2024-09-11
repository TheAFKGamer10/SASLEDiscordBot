const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

const isWindows = os.platform() === 'win32';
const srcDir = path.join(__dirname, '..', 'src', 'client');
const destDir = path.join(__dirname, '..', 'dist', 'src', 'client');

const runCommand = (command) => {
    try {
        execSync(command, { stdio: 'inherit' });
    } catch (err) {
        if (isWindows && ([1, 2, 3].includes(err.status))) {
            console.log(`Command "${command}" completed with minor issues.`);
        } else {
            console.error(`Error during command "${command}":`, err);
            process.exit(1);
        }
    }
};

try {
    if (isWindows) {
        console.log(`Running robocopy from ${srcDir} to ${destDir}`);
        runCommand(`robocopy "${srcDir}" "${destDir}" /E /XF *.ts`);
    } else {
        console.log(`Running rsync from ${srcDir} to ${destDir}`);
        runCommand(`rsync -av --exclude='*.ts' "${srcDir}/" "${destDir}/"`);
    }
    console.log('File copy completed successfully.');
} catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
}