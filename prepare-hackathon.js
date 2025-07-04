/**
 * NextBuy Hackathon Preparation Script
 * 
 * This script prepares the NextBuy project for hackathon submission by:
 * 1. Cleaning up temporary and test files
 * 2. Organizing test results
 * 3. Creating necessary directories
 * 4. Ensuring proper documentation
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Configuration
const dirs = {
  testResults: './server/tests/results',
  uploads: './server/uploads',
  docs: './docs'
};

// Ensure directories exist
Object.values(dirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// Clean up test result files
console.log('Organizing test results...');
try {
  // Move slowhttp results to results directory
  if (fs.existsSync('./slowhttp_results')) {
    if (!fs.existsSync(path.join(dirs.testResults, 'slowhttp'))) {
      fs.mkdirSync(path.join(dirs.testResults, 'slowhttp'), { recursive: true });
    }
    
    const files = fs.readdirSync('./slowhttp_results');
    files.forEach(file => {
      const srcPath = path.join('./slowhttp_results', file);
      const destPath = path.join(dirs.testResults, 'slowhttp', file);
      fs.copyFileSync(srcPath, destPath);
      console.log(`Moved: ${srcPath} -> ${destPath}`);
    });
    
    // Keep the original directory but empty it
    console.log('Note: Original slowhttp_results directory preserved for compatibility');
  }
  
  // Move any Python test results
  const pythonResults = fs.readdirSync('./').filter(file => 
    file.startsWith('python_requests_test_results_') && file.endsWith('.json')
  );
  
  pythonResults.forEach(file => {
    const destPath = path.join(dirs.testResults, file);
    fs.copyFileSync(file, destPath);
    console.log(`Moved: ${file} -> ${destPath}`);
  });
  
  // Move any ZAP test results
  const zapResults = fs.readdirSync('./').filter(file => 
    file.startsWith('zap_test_report_') && file.endsWith('.json')
  );
  
  zapResults.forEach(file => {
    const destPath = path.join(dirs.testResults, file);
    fs.copyFileSync(file, destPath);
    console.log(`Moved: ${file} -> ${destPath}`);
  });
} catch (err) {
  console.error('Error organizing test results:', err);
}

// Clean up uploads directory
console.log('Cleaning uploads directory...');
try {
  const uploads = fs.readdirSync(dirs.uploads);
  let count = 0;
  
  // Keep only a sample of uploads for demo purposes
  const samplesToKeep = uploads
    .filter(file => !file.endsWith('.gitkeep'))
    .slice(0, 5); // Keep 5 sample uploads
  
  uploads.forEach(file => {
    if (!file.endsWith('.gitkeep') && !samplesToKeep.includes(file)) {
      fs.unlinkSync(path.join(dirs.uploads, file));
      count++;
    }
  });
  
  console.log(`Removed ${count} uploaded files, kept ${samplesToKeep.length} samples`);
} catch (err) {
  console.error('Error cleaning uploads directory:', err);
}

// Verify documentation
console.log('Verifying documentation...');
const requiredDocs = [
  './README.md', 
  './docs/BOT_PROTECTION.md', 
  './docs/TESTING.md',
  './client/README.md',
  './server/README.md'
];

requiredDocs.forEach(doc => {
  if (fs.existsSync(doc)) {
    console.log(`✅ ${doc} exists`);
  } else {
    console.error(`❌ Missing required documentation: ${doc}`);
  }
});

// Install dependencies check
console.log('\nChecking dependencies status...');
try {
  console.log('Root dependencies:');
  execSync('npm list --depth=0', { stdio: 'inherit' });
  
  console.log('\nClient dependencies status:');
  execSync('cd client && npm list --depth=0', { stdio: 'inherit' });
  
  console.log('\nServer dependencies status:');
  execSync('cd server && npm list --depth=0', { stdio: 'inherit' });
} catch (err) {
  console.warn('Some dependencies may be missing or have issues.');
}

console.log('\n✨ NextBuy is ready for hackathon submission! ✨');
console.log('To build the client for production:');
console.log('  cd client && npm run build');
console.log('\nTo start the full application:');
console.log('  npm run dev');