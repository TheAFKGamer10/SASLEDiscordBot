const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const configDir = path.join(__dirname, '../config');
const branch = 'Typescript'


// Helper function to recursively read all files in a directory
function readFilesRecursively(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            readFilesRecursively(filePath, fileList);
        } else {
            fileList.push(filePath);
        }
    });
    return fileList;
}

// Read directory and filter out non-user-modified files
const files = readFilesRecursively(configDir);

// Backup user-modified files
files.forEach(filePath => {
    const backupPath = `${filePath}.bak`;
    fs.copyFileSync(filePath, backupPath);
});

// Perform Git operations
execSync(`git stash`, { cwd: configDir });
execSync(`git pull origin ${branch}`, { cwd: configDir });

// Restore backups
files.forEach(filePath => {
    const backupPath = `${filePath}.bak`;
    fs.copyFileSync(backupPath, filePath);
    fs.unlinkSync(backupPath); // Optionally, remove the backup after restoration
});
