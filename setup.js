const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Setting up project dependencies...');

// Clean up
console.log('Cleaning up...');
const nodeModulesPath = path.join(__dirname, 'node_modules');
const packageLockPath = path.join(__dirname, 'package-lock.json');

if (fs.existsSync(nodeModulesPath)) {
  console.log('Removing node_modules...');
  fs.rmSync(nodeModulesPath, { recursive: true, force: true });
}

if (fs.existsSync(packageLockPath)) {
  console.log('Removing package-lock.json...');
  fs.unlinkSync(packageLockPath);
}

// Install dependencies
console.log('Installing dependencies...');
try {
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  console.log('Dependencies installed successfully!');
  console.log('You can now run: npm start');
} catch (error) {
  console.error('Error installing dependencies:', error);
  process.exit(1);
}
