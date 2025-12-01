#!/usr/bin/env node
const path = require('path');
const cracoPath = path.resolve(__dirname, 'node_modules', '@craco', 'craco', 'dist', 'bin', 'craco.js');
require(cracoPath);
