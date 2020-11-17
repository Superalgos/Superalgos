exports.newWeb3Server = function newWeb3Server() {

    const MODULE = "Web3 Server"

    let thisObject = {
        getNetworkClientStatus: getNetworkClientStatus,
        initialize: initialize,
        finalize: finalize,
        run: run
    }

    const Web3 = require('web3');
    let web3Map = new Map()

    return thisObject

    function finalize() {
        web3Map = undefined
    }

    function initialize() {

    }

    function run() {

    }

    async function getNetworkClientStatus(host, port, interface) {
        let key = 'host (' + host + ') at port (' + port + ') via interface (' + interface + ')'

        try {

            let web3 = web3Map.get(key)

            if (web3 === undefined) {
                /* This means that we never got connected to this client before */
                switch (interface) {
                    case 'ws': {
                        web3 = new Web3('ws://' + host + ':' + port + '');
                        break
                    }
                    case 'http': {
                        web3 = new Web3('http://' + host + ':' + port + '');
                        break
                    }
                    default: {
                        return { error: 'Interface parameter must be eithre ws or http. Received ' + interface }
                    }
                }

                return await testConnection()

                async function testConnection() {
                    let accounts = await web3.eth.getAccounts()
                    if (web3.currentProvider.connected === false) {
                        return { error: 'Connection to ' + key + ' could not be established.' }
                    } else {
                        return await returnStatus(web3)
                    }
                }
            } else {
                return await returnStatus(web3)
            }

            async function returnStatus(web3) {

                let status = {}
                status.isSyncing = await web3.eth.isSyncing()
                status.chainId = await web3.eth.getChainId()
                status.currentBlockNumber = await web3.eth.getBlockNumber()
                status.result = 'Ok'
                return status
            }
        } catch(err) {
            return { error: 'Could not connect to ' + key }
        }
    }
}