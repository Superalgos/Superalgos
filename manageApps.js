#!/usr/bin/env node

const path = require('path')
const cwd = path.join(__dirname)
require('./App-Management/AppManagementRoot').runRoot(cwd)