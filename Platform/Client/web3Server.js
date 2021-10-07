exports.newWeb3Server = function newWeb3Server() {

    const MODULE = "Web3 Server"

    let thisObject = {
        getNetworkClientStatus: getNetworkClientStatus,
        createWalletAccount: createWalletAccount,
        getWalletBalances: getWalletBalances,
        signData: signData,
        hashData: hashData,
        recoverAddress: recoverAddress,
        mnemonicToPrivateKey: mnemonicToPrivateKey,
        payContributors: payContributors,
        initialize: initialize,
        finalize: finalize,
        run: run
    }

    const Web3 = SA.nodeModules.web3
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
            return { error: 'Could not connect to ' + key + '. ' + err.stack + '.' }
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
            return { error: 'Could not create the account. ' + err.stack }
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
            return { error: 'Could not connect to ' + key + '. ' + err.stack + '.' }
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

    async function signData(privateKey, data) {
        try {

            let web3 = new Web3()
            let signature = web3.eth.accounts.sign(data, privateKey)

            return {
                signature: signature,
                result: 'Ok'
            }

        } catch (err) {
            return { error: 'Could not sign the data. ' + err.stack }
        }
    }

    async function hashData(data) {
        try {

            let web3 = new Web3()
            let hash = web3.eth.accounts.hashMessage(data)

            return {
                hash: hash,
                result: 'Ok'
            }

        } catch (err) {
            return { error: 'Could not hash the data. ' + err.stack }
        }
    }

    async function recoverAddress(signature) {
        try {
            let signatureObject = JSON.parse(signature)
            let web3 = new Web3()
            let address = web3.eth.accounts.recover(signatureObject)

            return {
                address: address,
                result: 'Ok'
            }

        } catch (err) {
            return { error: 'Could not recover address. ' + err.stack }
        }
    }

    async function mnemonicToPrivateKey(mnemonic) {
        try {
            const ethers = SA.nodeModules.ethers
            let wallet = ethers.Wallet.fromMnemonic(mnemonic)

            if (wallet.privateKey !== undefined) {
                return {
                    address: wallet.address,
                    privateKey: wallet.privateKey,
                    result: 'Ok'
                }
            } else {
                return {
                    address: undefined,
                    privateKey: undefined,
                    result: 'Fail'
                }
            }

        } catch (err) {
            return { error: 'Could not convert to Private Key. ' + err.stack }
        }
    }

    async function payContributors(contractAddress, contractAbi, paymentsArray, mnemonic) {
        try {
            let response = await mnemonicToPrivateKey(mnemonic)
            let privateKey = response.privateKey

            console.log('----------------------------------------------------------------------------------------------')
            console.log('PAYING CONTRIBUTORS')
            console.log('----------------------------------------------------------------------------------------------')

            for (let i = 0; i < paymentsArray.length; i++) {
                await PL.projects.foundations.utilities.asyncFunctions.sleep(10000)
                let payment = paymentsArray[i]
                await sendTokens(
                    i + 1,
                    payment.userProfile,
                    payment.from,
                    payment.to,
                    payment.amount
                )
            }

            async function sendTokens(number, userProfile, fromAddress, toAddress, tokenAmount) {
                try {
             
                    tokenAmount = Math.trunc(tokenAmount / 1000000000000000000)

                    console.log('')
                    console.log('---------------------------------------------------------------------------------------------------------------------------------------------------')
                    console.log(' Payment # ' + number + ' - User Profile: ' + userProfile + ' - SA Tokens Amount: ' + parseFloat(tokenAmount).toLocaleString('en') + ' - Address: ' + toAddress)
                    console.log('---------------------------------------------------------------------------------------------------------------------------------------------------')
                    console.log('')

                    if (tokenAmount === 0) {
                        console.log('No need to send a transaction in this case.')
                        return
                    }

                    const Tx = SA.nodeModules.ethereumjsTx.Transaction;
                    const web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed.binance.org/'))
                    /*
                    Token Amount
                    */

                    tokenAmount = web3.utils.toWei(tokenAmount.toString(), 'ether')
                    var amountBigNumber = web3.utils.toBN(tokenAmount)

                    //const amount = web3.utils.toHex(tokenAmount)
                    if (privateKey === undefined) { privateKey = 'No Privete Key - Just Testing' }
                    privateKey = privateKey.replace('0x', '')
                    const privateKeyBuffer = Buffer.from(privateKey, 'hex')
                    const contractAbiObject = JSON.parse(contractAbi)
                    const contract = new web3.eth.Contract(contractAbiObject, contractAddress, { from: fromAddress })
                    const Common = SA.nodeModules.ethereumjsCommon.default
                    const BSC_FORK = Common.forCustomChain(
                        'mainnet',
                        {
                            name: 'Binance Smart Chain Mainnet',
                            networkId: 56,
                            chainId: 56,
                            url: 'https://bsc-dataseed.binance.org/'
                        },
                        'istanbul',
                    );

                    const nonce = await web3.eth.getTransactionCount(fromAddress);
                    console.log('Nonce:', nonce)

                    const rawTransaction = {
                        "from": fromAddress,
                        "gasPrice": web3.utils.toHex(5000000000),
                        "gasLimit": web3.utils.toHex(210000),
                        "to": contractAddress, "value": "0x0",
                        "data": contract.methods.transfer(toAddress, amountBigNumber).encodeABI(),
                        "nonce": web3.utils.toHex(nonce)
                    };

                    const transaction = new Tx(rawTransaction, { 'common': BSC_FORK })
                    transaction.sign(privateKeyBuffer)

                    console.log('Transaction:', rawTransaction)
                    const result = await web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
                        .catch(err => {
                            console.log('[ERROR] sendSignedTransaction -> err =' + JSON.stringify(err))
                        })

                    console.log('Result:', result)
                    return result
                } catch (err) {
                    console.log('[ERROR] web3Server -> sendTokens -> err.stack = ' + err.stack)
                }
            }

            return {
                address: wallet.address,
                privateKey: wallet.privateKey,
                result: 'Ok'
            }

        } catch (err) {
            return { error: 'Could not convert to Private Key. ' + err.stack }
        }
    }
}