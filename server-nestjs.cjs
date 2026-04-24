// Custom server script to handle ES module vs CommonJS conflict
// This script temporarily removes type: module for NestJS startup

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Store original type setting
const originalType = packageJson.type;

// Temporarily remove type: module for NestJS
if (originalType === 'module') {
  delete packageJson.type;
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  console.log('Temporarily removed "type": "module" for NestJS startup...');
}

// Start NestJS server
const nestProcess = spawn('npm', ['run', 'start:prod'], {
  stdio: 'inherit',
  shell: true
});

// Handle process exit
nestProcess.on('close', (code) => {
  // Restore original type setting
  if (originalType === 'module') {
    const restoredPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    restoredPackageJson.type = originalType;
    fs.writeFileSync(packageJsonPath, JSON.stringify(restoredPackageJson, null, 2));
    console.log('Restored "type": "module" setting.');
  }
  
  process.exit(code);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  nestProcess.kill('SIGINT');
});
