const {list} = require('../../App-Management/Pm2Management/manager').pm2Manager()
const {spawn} = require('node:child_process')
exports.restartServer = function restartServer() {
    const thisObject = {
        tryRestart: tryRestart
    }

    return thisObject

    /**
     * 
     * @param {number[]} pids 
     * @returns {Promise<void>}
     */
    async function tryRestart(pids) {
        const processName = await matchPid(pids)
        if(processName === undefined) {
            SA.logger.info('No matching process to restart')
            return
        }
        SA.logger.info('Process ' + processName + ' restarting')
        const child = spawn('pm2 restart ' + processName, {
            detached: true,
            stdio: 'ignore'
        })
        child.unref()
    }

    /**
     * 
     * @param {number[]} pids 
     * @returns {Promise<string>}
     */
    async function matchPid(pids) {
        const runningProcesses = await list()
        const matches = runningProcesses.filter( p => pids.indexOf( p.pid ) > -1 )
        if(matches > 0) {
            return matches[0].name
        }
    }
}