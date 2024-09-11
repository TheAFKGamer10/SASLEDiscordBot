const { execSync } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

const isWindows = os.platform() === 'win32';

const directories = [
  'dist/config',
  'dist/src/server/bot/files',
  'dist/src/server/api/json'
];

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const runCommand = (command) => {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (err) {
    if (isWindows && err.status === 1) {
      console.log(`Command "${command}" completed with minor issues.`);
    } else {
      console.error(`Error during command "${command}":`, err);
      process.exit(1);
    }
  }
};

try {
  if (isWindows) {
    console.log('Copying config files using robocopy...');
    runCommand('robocopy "config" "dist\\config" /E /XF *.ts');
    runCommand('robocopy "src\\server\\bot\\files" "dist\\src\\server\\bot\\files" /E /XF *.ts');
    runCommand('robocopy "src\\server\\api\\json" "dist\\src\\server\\api\\json" /E /XF *.ts');
    runCommand('copyfiles .env .env.example CONTRIBUTORS.md LICENSE package.json package-lock.json dist\\');
  } else {
    console.log('Copying config files using rsync...');
    runCommand('rsync -av --exclude=\'*.ts\' config/ dist/config/');
    runCommand('rsync -av --exclude=\'*.ts\' src/server/bot/files/ dist/src/server/bot/files/');
    runCommand('rsync -av --exclude=\'*.ts\' src/server/api/json/ dist/src/server/api/json/');
    runCommand('copyfiles .env .env.example CONTRIBUTORS.md LICENSE package.json package-lock.json dist/');
  }
  console.log('Configuration files copied successfully.');
} catch (err) {
  console.error('Unexpected error:', err);
  process.exit(1);
}