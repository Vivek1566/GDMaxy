#!/usr/bin/env node
const path = require('path');
const fs = require('fs');

console.log('=== Build.js Debug ===');
console.log('__dirname:', __dirname);
console.log('process.cwd():', process.cwd());

const cracoPath = path.resolve(__dirname, 'node_modules', '@craco', 'craco', 'dist', 'bin', 'craco.js');
console.log('cracoPath:', cracoPath);
console.log('craco exists:', fs.existsSync(cracoPath));

if (!fs.existsSync(cracoPath)) {
  console.error('ERROR: craco.js not found at expected path!');
  console.log('Checking alternate paths...');
  
  const alt1 = path.resolve(process.cwd(), 'node_modules', '@craco', 'craco', 'dist', 'bin', 'craco.js');
  console.log('alt1:', alt1, 'exists:', fs.existsSync(alt1));
  
  process.exit(1);
}

console.log('Loading craco from:', cracoPath);
console.log('======================');

require(cracoPath);
