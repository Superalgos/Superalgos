#!/usr/bin/env node

const path = require('path')
const boxen = require('boxen')

/** 
 * @typedef {{
 *   name: string,
 *   hostPlatform: string,
 *   hostDesktop: string,
 *   portWssPlatform: number,
 *   portWssDesktop: number,
 *   portWssNetwork: number,
 *   portWssDashboard: number,
 *   portHttpPlatform: number,
 *   portHttpNetwork: number,
 *   portHttpDesktop: number,
 *   storeData: string,
 *   storeLogs: string,
 *   storeWorkspaces: string,
 * }} Profile
 * 
 * @type {{
 *   cwd: string,
 *   stdBoxedMessage: (string) => string,
 *   pm2m: {
 *     connect: () => Promise<void>,
 *     disconnect: () => Promise<void>,
 *     list: () => Promise<[]>,
 *     describe: (string) => Promise<{}>,
 *     start: ({}) => Promise<void>,
 *     startMany: ([]) => Promise<void>,
 *     restart: (string) => Promise<void>,
 *     restartMany: ([]) => Promise<void>,
 *     stop: (string) => Promise<void>,
 *     stopMany: ([]) => Promise<void>,
 *     kill: (string) => Promise<void>,
 *     killMany: ([]) => Promise<void>,
 *   },
 *   getProfile: (string) => Profile
 * }}
 */
global.SAM = {
    cwd: path.join(__dirname),
    stdBoxedMessage: stdBoxedMessage,
    pm2m: require('./App-Management/Pm2Management/manager').pm2Manager(),
    getProfile: require('./Profile-Scripts/index').getProfile
}

/**
 * @param {string} message 
 * @returns {string}
 */
function stdBoxedMessage(message) {
    return boxen(message, {
        borderColor: 'yellow',
        title: 'Welcome to Superalgos Ecosystem App Management',
        titleAlignment: 'center',
        padding: 1,
        margin: 1
    })
}

require('./App-Management/AppManagementRoot').runRoot()