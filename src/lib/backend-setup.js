
#!/usr/bin/env node

/**
 * Helper script to set up the GhostGuard backend
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Create readline interface for user interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask user a question
const question = (query) => new Promise((resolve) => {
  rl.question(query, (answer) => {
    resolve(answer);
  });
});

// Main function
const main = async () => {
  console.log('💫 GhostGuard Backend Setup 💫\n');
  console.log('This script will help you set up the backend server for GhostGuard\'s WhatsApp integration.\n');
  
  // Check for Node.js version
  const nodeVersion = process.version;
  console.log(`Node.js version: ${nodeVersion}`);
  
  const versionNum = parseInt(nodeVersion.substring(1).split('.')[0]);
  if (versionNum < 16) {
    console.error('❌ Error: Node.js version 16 or higher is required.');
    process.exit(1);
  }
  
  // Determine directory path
  const defaultDir = path.join(process.cwd(), 'ghostguard-backend');
  const dirAnswer = await question(`Where do you want to create the backend server? (default: ${defaultDir}) `);
  const backendDir = dirAnswer.trim() || defaultDir;
  
  // Check if directory exists
  if (fs.existsSync(backendDir)) {
    const overwrite = await question('Directory already exists. Overwrite? (y/N) ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('Operation cancelled.');
      rl.close();
      return;
    }
  } else {
    // Create directory
    fs.mkdirSync(backendDir, { recursive: true });
  }
  
  // Create the backend server using the utility script
  try {
    console.log('\nSetting up backend server...');
    const scriptPath = path.join(__dirname, 'utils/create-backend-script.js');
    
    // Copy the script to the target directory
    const targetScriptPath = path.join(backendDir, 'setup-script.js');
    fs.copyFileSync(scriptPath, targetScriptPath);
    
    // Run the script
    execSync(`node ${targetScriptPath}`, { cwd: backendDir, stdio: 'inherit' });
    
    // Clean up
    fs.unlinkSync(targetScriptPath);
    
    console.log('\n✅ Backend setup completed successfully!');
    console.log('\nNext steps:');
    console.log(`1. Navigate to the backend directory: cd ${backendDir}`);
    console.log('2. Install dependencies: npm install');
    console.log('3. Start the server: npm start');
    
    console.log('\nOnce the server is running, the GhostGuard app will automatically connect to it for real-time WhatsApp integration.');
  } catch (error) {
    console.error('❌ Error setting up backend:', error);
  }
  
  rl.close();
};

// Run the main function
main().catch(error => {
  console.error('An error occurred:', error);
  rl.close();
});
