exports.newWeb3Server = function newWeb3Server() {

    const MODULE = "Web3 Server"

    let thisObject = {
        getNetworkClientStatus: getNetworkClientStatus,
        createWalletAccount: createWalletAccount,
        getWalletBalances: getWalletBalances,
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
                let web3 = await connectToClient(key, host, port, interface)
                if (web3.error !== undefined) {
                    return web3
                }
                return await returnStatus(web3)
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
        } catch (err) {
            return { error: 'Could not connect to ' + key + '. ' + err.message + '.' }
        }
    }

    async function createWalletAccount(entropy) {
        try {

            let web3 = new Web3()
            let account = web3.eth.accounts.create()

            return {
                address: account.address,
                privateKey: account.privateKey,
                result: 'Ok'
            }

        } catch (err) {
            return { error: 'Could not create the account. ' + err.message }
        }
    }

    async function getWalletBalances(host, port, interface, walletDefinition) {
        let key = 'host (' + host + ') at port (' + port + ') via interface (' + interface + ')'

        try {

            let web3 = web3Map.get(key)

            if (web3 === undefined) {
                /* This means that we never got connected to this client before */
                let web3 = await connectToClient(key, host, port, interface)
                if (web3.error !== undefined) {
                    return web3
                }
                return await returnAccountBalances(web3)
            } else {
                return await returnAccountBalances(web3)
            }

            async function returnAccountBalances(web3) {

                let responseData = {}
                for (let i = 0; i < walletDefinition.walletAccounts.length; i++) {
                    let walletAccount = walletDefinition.walletAccounts[i]

                    if (walletAccount.ethBalance !== undefined) {
                        try {
                            walletAccount.ethBalance.value = await web3.eth.getBalance(walletAccount.config.address)
                        } catch (err) {
                            if (err.message.indexOf('Provided address') >= 0) {
                                walletAccount.error = 'Invalid configured address.'
                            } else {
                                walletAccount.error = err.message
                            }
                        }
                    }

                    for (let j = 0; j < walletAccount.tokenBalances.length; j++) {
                        let tokenBalance = walletAccount.tokenBalances[j]

                        if (tokenBalance.referenceParent === undefined) { continue }  
                        if (tokenBalance.referenceParent.parentNode === undefined) { continue } 
                        if (tokenBalance.referenceParent.smartContracts === undefined) { continue } 

                        if (tokenBalance.referenceParent.config.codeName === undefined) {
                            tokenBalance.error = 'Reference Parent without config.codeName defined.'
                            continue
                        }  

                        if (tokenBalance.referenceParent.smartContracts.config.address === undefined) {
                            tokenBalance.error = 'Reference Parent Smart Contract without config.address defined.'
                            continue
                        } 

                        let tokenContractAddress = tokenBalance.referenceParent.smartContracts.config.address
                         // The minimum ABI to get ERC20 Token balance
                        let minABI = [
                            // balanceOf
                            {
                                "constant": true,
                                "inputs": [{ "name": "_owner", "type": "address" }],
                                "name": "balanceOf",
                                "outputs": [{ "name": "balance", "type": "uint256" }],
                                "type": "function"
                            },
                            // decimals
                            {
                                "constant": true,
                                "inputs": [],
                                "name": "decimals",
                                "outputs": [{ "name": "", "type": "uint8" }],
                                "type": "function"
                            }
                        ];

                        let contract = new web3.eth.Contract(minABI, tokenContractAddress);
                         
                        try { 
                            tokenBalance.value = await contract.methods.balanceOf(walletAccount.config.address).call()
                        } catch (err) {
                            if (err.message.indexOf('Provided address') >= 0) {
                                walletAccount.error = 'Invalid configured address.'
                            } else {
                                walletAccount.error = err.message
                            }
                        }
                    }
                }

                responseData.result = 'Ok'
                responseData.walletDefinition = walletDefinition
                return responseData
            }
        } catch (err) {
            return { error: 'Could not connect to ' + key + '. ' + err.message + '.' }
        }
    }

    async function connectToClient(key, host, port, interface) {
        let web3
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
                return { error: 'Interface parameter must be either ws or http. Received ' + interface }
            }
        }

        return await testConnection()

        async function testConnection() {
            let accounts = await web3.eth.getAccounts()
            if (web3.currentProvider.connected === false) {
                return { error: 'Connection to ' + key + ' could not be established.' }
            } else {
                web3Map.set(key, web3)
                return web3
            }
        }
    }
}