const pm2 = require('pm2')

exports.pm2Manager = function pm2Manager() {
    const thisObject = {
        connect: connect,
        disconnect: disconnect,
        list: list,
        describe: describe,
        start: start,
        startMany: startMany,
        restart: restart,
        restartMany: restartMany,
        stop: stop,
        stopMany: stopMany,
        kill: kill,
        killMany: killMany
    }

    return thisObject

    /**
     * @returns {Promise<void>}
     */
     function connect() {
        return new Promise((res,rej) => pm2.connect((err) => {
            if(err) { rej(err) } 
            else { res() }
        }))
    }

    function disconnect() {
        pm2.disconnect()
    }

    /**
     * @returns {Promise<{
     *   pid: number,
     *   name: string,
     *   args: string[]
     * }[]>}
     */ 
    function list() {
        return new Promise((res, rej) => pm2.list((err, list) => {
            if(err) { rej(err) }
            else { res(list.map(p => ({pid: p.pid, name: p.name, args: p.pm2_env.args}))) }
        }))    
    }    

    /**
     * @param {string} name
     * @returns {Promise<{
     *   pid: number,
     *   name: string,
     *   args: string[]
     * }>}
     */ 
    function describe(name) {
        return new Promise((res, rej) => pm2.describe(name, (err, details) => {
            if(err) { rej(err) }
            else { res(details.map(p => ({pid: p.pid, name: p.name, args: p.pm2_env.args}))[0]) }
        }))    
    }    

    /**
     * @typedef {{
     *   name: string,
     *   script: string,
     *   cwd: string,
     *   args?: string[],
     *   env?: { [key: string]: string; },
     *   log_file?: string
     * }} Process
     */

    /**
     * @param {Process} process 
     * @returns {Promise<void>}
     */
    function start(process) {
        return new Promise((res,rej) => pm2.start(process, (err) => {
            if(err) { rej(err) }
            else ( res() )
        }))
    }

    /**
     * @typedef {{
     *   script: string,
     *   name: string,
     *   args: string[],
     *   cwd: string,
     *   log_file: string
     * }} Process
     * @param {Process[]} processes 
     * @returns {Promise<void>}
     */
    function startMany(processes) {
        return Promise.all(processes.map(start))
    }

    /**
     * @param {string} name 
     * @returns {Promise<void>}
     */
    function restart(name) {
        return new Promise((res,rej) => pm2.restart(name, (err) => {
            if(err) { rej(err) }
            else ( res() )
        }))
    }

    /**
     * @param {string[]} names
     * @returns {Promise<void>}
     */
    function restartMany(names) {
        return Promise.all(names.map(restart))
    }
    
    /**
     * 
     * @param {string} name 
     * @returns {Promise<void>}
     */
    function stop(name) {
        return new Promise((res,rej) => pm2.stop(name, (err) => {
            if(err) { rej(err) }
            else ( res() )
        }))
    }

    /**
     * @param {string[]} names
     * @returns {Promise<void>}
     */
    function stopMany(names) {
        return Promise.all(names.map(stop))
    }
    
    /**
     * 
     * @param {string} name 
     * @returns {Promise<void>}
     */
    function kill(name) {
        return new Promise((res,rej) => pm2.delete(name, (err) => {
            if(err) { rej(err) }
            else ( res() )
        }))
    }

    /**
     * @param {string[]} names
     * @returns {Promise<void>}
     */
    function killMany(names) {
        return Promise.all(names.map(kill))
    }
}