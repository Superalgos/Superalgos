exports.newWeb3Server = function newWeb3Server() {

    const MODULE = "Web3 Server"

    let thisObject = {
        getNetworkClientStatus: getNetworkClientStatus,
        createWalletAccount: createWalletAccount,
        getUserWalletBalance: getUserWalletBalance,
        getLPTokenBalance: getLPTokenBalance,
        getWalletBalances: getWalletBalances,
        signData: signData,
        hashData: hashData,
        recoverAddress: recoverAddress,
        recoverWalletAddress: recoverWalletAddress,
        mnemonicToPrivateKey: mnemonicToPrivateKey,
        payContributors: payContributors,
        initialize: initialize,
        finalize: finalize,
        run: run
    }

    const Web3 = SA.nodeModules.web3
    let web3Map = new Map()
    const ABI = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "unpause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "account", "type": "address" }, { "name": "amount", "type": "uint256" }], "name": "mint", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_value", "type": "uint256" }], "name": "burn", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "paused", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_subtractedValue", "type": "uint256" }], "name": "decreaseApproval", "outputs": [{ "name": "success", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "balance", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "listAddress", "type": "address" }, { "name": "isBlackListed", "type": "bool" }], "name": "blackListAddress", "outputs": [{ "name": "success", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "pause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_addedValue", "type": "uint256" }], "name": "increaseApproval", "outputs": [{ "name": "success", "type": "bool" }], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "name": "_name", "type": "string" }, { "name": "_symbol", "type": "string" }, { "name": "_decimals", "type": "uint256" }, { "name": "_supply", "type": "uint256" }, { "name": "tokenOwner", "type": "address" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Mint", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "burner", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Burn", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Pause", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Unpause", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "previousOwner", "type": "address" }, { "indexed": true, "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "blackListed", "type": "address" }, { "indexed": false, "name": "value", "type": "bool" }], "name": "Blacklist", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }]

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

    async function getUserWalletBalance(chain, walletAddress, contractAddress) {
        let URI = ''
        switch (chain) {
            case 'BSC':
                URI = 'https://bsc-dataseed1.binance.org'
                break
            case 'ETH':
                URI = 'https://rpc.ankr.com/eth'
                break
            case 'GOERLI':
                URI = 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
                break
            case 'ZKS':
                URI = 'https://mainnet.era.zksync.io'
                break
            case 'ZKT':
                URI = 'https://testnet.era.zksync.dev'
                break            
            default:
                return {
                    walletAddress: undefined,
                    balance: undefined,
                    result: 'Fail'
                }
        }
        
        const web3 = new Web3(URI)
        let balance
        const contractInst = new web3.eth.Contract(ABI, contractAddress)

        async function getBalance() {
            balance = await contractInst.methods.balanceOf(walletAddress).call().then(result => web3.utils.fromWei(result, 'ether'))
            return balance
        }

        await getBalance()

        return {
            walletAddress: walletAddress,
            balance: balance,
            result: 'Ok'
        }
    }

    async function getLPTokenBalance(chain, contractAddressSA, contractAddressLP) {
        let tokensLP
        let tokensSA
        let URI = ''
        switch (chain) {
            case 'BSC':
                URI = 'https://bsc-dataseed1.binance.org'        
                break
            case 'ETH':
                URI = 'https://rpc.ankr.com/eth'
                break
            case 'GOERLI':
                URI = 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
                break
            case 'ZKS':
                URI = 'https://mainnet.era.zksync.io'
                break
            case 'ZKT':
                URI = 'https://testnet.era.zksync.dev'
                break   
            default:
                return {
                    tokensLP: undefined,
                    tokensSA: undefined,
                    result: 'Fail'
                }
        }
        
        const web3 = new Web3(URI)
        const contractInstLP = new web3.eth.Contract(ABI, contractAddressLP)
        const contractInstSA = new web3.eth.Contract(ABI, contractAddressSA)

        async function getLPTokenSupply() {
            tokensLP = await contractInstLP.methods.totalSupply().call().then(result => web3.utils.fromWei(result, 'ether'))
            return tokensLP
        }

        async function getSATokenBalance() {
            tokensSA = await contractInstSA.methods.balanceOf(contractAddressLP).call().then(result => web3.utils.fromWei(result, 'ether'))
            return tokensSA
        }

        await getLPTokenSupply()
        await getSATokenBalance()

        return {
            tokensLP: tokensLP,
            tokensSA: tokensSA,
            result: 'Ok'
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

    async function getGasPrice() {
        const axios = SA.nodeModules.axios
        const url = 'https://api.etherscan.io/api?module=gastracker&action=gasoracle'

        try {
            let response = await axios.get(url, {timeout: 5000})
            if (response.data.result.ProposeGasPrice !== undefined) {
                return parseInt(response.data.result.ProposeGasPrice)
            } else {
                return undefined
            }
        } catch(err) {
            SA.logger.error('Gas Price Query Error: ' + err.stack)
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

    async function recoverWalletAddress(signature, account, data) {
        try {
            let ethUtil = require('ethereumjs-util')

            const msgBuffer = ethUtil.toBuffer(ethUtil.fromUtf8(data))
            const msgHash = ethUtil.hashPersonalMessage(msgBuffer) // it adds the prefix
            const signatureBuffer = ethUtil.toBuffer(signature)
            const signatureParams = ethUtil.fromRpcSig(signatureBuffer)
            const publicKey = ethUtil.ecrecover(
            msgHash,
            signatureParams.v,
            signatureParams.r,
            signatureParams.s
            )
            const addressBuffer = ethUtil.publicToAddress(publicKey)
            const address = ethUtil.bufferToHex(addressBuffer)

            // The signature verification is successful if the address found with
            // ecrecover matches the initial account address
            if (address.toLowerCase() === account.toLowerCase()) {
                return {
                    signature: {
                        message: data,
                        messageHash: ethUtil.bufferToHex(msgHash),
                        v: ethUtil.bufferToHex(signatureParams.v),
                        r: ethUtil.bufferToHex(signatureParams.r),
                        s: ethUtil.bufferToHex(signatureParams.s),
                        signature: ethUtil.bufferToHex(signatureBuffer),
                    },
                    codeName: data,
                    //address: address,
                    result: 'Ok'
                }
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

    async function payContributors(contractAddressDict, treasuryAccountDict, contractABIDict, decimalFactorDict, paymentsArray, paymentsBlacklist, paymentsWhitelist, mnemonic) {
        try {
            let response = await mnemonicToPrivateKey(mnemonic)
            let privateKey = response.privateKey
            let errorList = []

            SA.logger.info('----------------------------------------------------------------------------------------------')
            SA.logger.info('PAYING CONTRIBUTORS')
            SA.logger.info('----------------------------------------------------------------------------------------------')

            for (let i = 0; i < paymentsArray.length; i++) {
                let payment = paymentsArray[i]
                let payingTreasuryAccount = treasuryAccountDict[payment['chain']]
                await sendTokens(
                    i + 1,
                    payment.userProfile,
                    payment.chain,
                    payingTreasuryAccount,
                    payment.to,
                    payment.amount
                )
            }

            SA.logger.info('')
            SA.logger.info('Distribution complete.')
            /* Check if errors occurred while sending and provide verbose output */
            if (errorList.length > 0) {
                SA.logger.warn('')
                SA.logger.warn('*** WARNING *** Errors have occurred while sending payments. No confirmation of execution is available for these transactions:')
                for (let e = 0; e < errorList.length; e++) {
                    SA.logger.warn(e + 1 + ') ' + parseFloat(errorList[e].tokenAmount).toLocaleString('en') + ' SA to ' + errorList[e].userProfile + ', Address: ' + errorList[e].toAddress + ' (' + errorList[e].chain + ')')
                }
                SA.logger.warn('')
                SA.logger.warn('Please verify the execution status of payments to these users manually using a blockchain explorer.')
                SA.logger.warn('After confirming no payments have been sent, you may re-issue payments to affected users via the whitelist feature.')
                let errorUsers = errorList.map(elem => elem.userProfile).join()
                SA.logger.warn('')
                SA.logger.warn('Usage example:')
                SA.logger.warn('gov.pay whitelist:' + errorUsers)
                SA.logger.warn('')
                SA.logger.warn('Above command would send payments again to *all* affected users. Modify users contained in whitelist as needed, based on your manual review.')
            } else {
                SA.logger.info('All transactions sent, no errors recorded while sending.')
            }

            async function sendTokens(number, userProfile, chain, fromAddress, toAddress, tokenAmount) {
                let transactionDetails = {
                    'userProfile': userProfile,
                    'chain': chain,
                    'toAddress': toAddress,
                    'tokenAmount': Math.trunc(tokenAmount / decimalFactorDict[chain])
                }
                try {

                    tokenAmount = Math.trunc(tokenAmount / decimalFactorDict[chain])

                    SA.logger.info('')
                    SA.logger.info('---------------------------------------------------------------------------------------------------------------------------------------------------')
                    SA.logger.info(' Payment # ' + number + ' - User Profile: ' + userProfile + ' - SA Tokens Amount: ' + parseFloat(tokenAmount).toLocaleString('en') + ' - Address: ' + toAddress + ' - Blockchain: ' + chain)
                    SA.logger.info('---------------------------------------------------------------------------------------------------------------------------------------------------')
                    SA.logger.info('')

                    if (paymentsBlacklist.includes(userProfile)) {
                        SA.logger.info('User blacklisted for distribution. No need to send a transaction.')
                        return
                    }

                    if (paymentsWhitelist.length > 0 && paymentsWhitelist.includes(userProfile) === false) {
                        SA.logger.info('User not on defined whitelist for distribution. No need to send a transaction.')
                        return
                    }
                    
                    if (tokenAmount === 0) {
                        SA.logger.info('Token amount 0. No need to send a transaction.')
                        return
                    }

                    if (parseFloat(tokenAmount) <= 10000) {
                        SA.logger.info('Filtered out. No need to send a transaction.')
                        return
                    }

                    let URI = ''
                    switch(chain) {
                        case 'BSC':
                            URI = 'https://bsc-dataseed.binance.org/'
                            break
                        case 'ETH':
                            URI = 'https://rpc.ankr.com/eth'
                            break
                        case 'GOERLI':
                            URI = 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
                            break
                        case 'ZKS':
                            URI = 'https://mainnet.era.zksync.io'
                            break
                        case 'ZKT':
                            URI = 'https://testnet.era.zksync.dev'
                            break                                                    
                        default:
                            SA.logger.error('No RPC URI configured for chain ' + chain)
                            return
                    }
                    
                    const Tx = SA.nodeModules.ethereumjsTx.Transaction;
                    const web3 = new Web3(new Web3.providers.HttpProvider(URI))
                    /*
                    Token Amount
                    */

                    tokenAmount = web3.utils.toWei(tokenAmount.toString(), 'ether')
                    var amountBigNumber = web3.utils.toBN(tokenAmount)

                    //const amount = web3.utils.toHex(tokenAmount)
                    if (privateKey === undefined) { privateKey = 'No Privete Key - Just Testing' }
                    privateKey = privateKey.replace('0x', '')
                    const privateKeyBuffer = Buffer.from(privateKey, 'hex')
                    const contractAbiObject = JSON.parse(contractABIDict[chain])
                    const contract = new web3.eth.Contract(contractAbiObject, contractAddressDict[chain], { from: fromAddress })
                    const Common = SA.nodeModules.ethereumjsCommon.default
                    let chainConfig

                    switch(chain) {
                        case 'BSC':
                            chainConfig = Common.forCustomChain(
                                'mainnet',
                                {
                                    name: 'Binance Smart Chain Mainnet',
                                    networkId: 56,
                                    chainId: 56,
                                    url: 'https://bsc-dataseed.binance.org/'
                                },
                                'istanbul',
                            );
                            break
                        case 'ETH':
                            chainConfig = Common.forCustomChain(
                                'mainnet',
                                {
                                    name: 'Ethereum Mainnet',
                                    networkId: 1,
                                    chainId: 1,
                                    url: 'https://rpc.ankr.com/eth'
                                },
                                'istanbul',
                            );
                            break
                        case 'GOERLI':
                            chainConfig = Common.forCustomChain(
                                'mainnet',
                                {
                                    name: 'Ethereum Goerli Testnet',
                                    networkId: 5,
                                    chainId: 5,
                                    url: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
                                },
                                'istanbul',
                            );
                            break
                        case 'ZKS':
                            chainConfig = Common.forCustomChain(
                                'mainnet',
                                {
                                    name: 'zkSync Era Mainnet',
                                    networkId: 324,
                                    chainId: 324,
                                    url: 'https://mainnet.era.zksync.io'
                                },
                                'istanbul',
                            );
                            break
                        case 'ZKT':
                            chainConfig = Common.forCustomChain(
                                'mainnet',
                                {
                                    name: 'zkSync Era Testnet',
                                    networkId: 280,
                                    chainId: 280,
                                    url: 'https://testnet.era.zksync.dev'
                                },
                                'istanbul',
                            );
                            break
                        default:
                            SA.logger.error('No chain configuration present for chain ' + chain)
                            return
                    }                    

                    /* Default Gas Price for all chains but ETH */
                    let gasPrice = 5000000000
                    let gasLimit = 210000

                    if (chain === 'ZKS') {
                        gasPrice = 25000000
                        gasLimit = 500000
                    }

                    /* If executing on ETH, verify if current gas price is within reasonable range and calculate price for transaction */
                    if (chain === 'ETH') {
                        /* Maximum gas price in Gwei we are ready to pay */
                        const gasPriceLimit = 15
                        /* Buffer we accept on top of gasPriceLimit to ensure submitted transactions will execute */
                        const gasPriceBuffer = 1
                        let gasFeeOk = false
                        while (gasFeeOk === false) {
                            let currentGasPrice = await getGasPrice();
                            if (currentGasPrice === undefined) {
                                SA.logger.info("Could not obtain current gas price, retrying in 60 seconds...")
                                await SA.projects.foundations.utilities.asyncFunctions.sleep(60000)
                            } else if (currentGasPrice > gasPriceLimit) {
                                SA.logger.info("Current Gas Price " + currentGasPrice + " Gwei exceeding limit of " + gasPriceLimit + " Gwei. Holding transaction, retrying in 60 seconds...")
                                await SA.projects.foundations.utilities.asyncFunctions.sleep(60000)
                            } else if (currentGasPrice > 0) {
                                SA.logger.info("Current Gas Price " + currentGasPrice +  " Gwei, executing transaction.")
                                /* Adding 2 Gwei safety buffer to ensure executions */
                                gasPrice = currentGasPrice + gasPriceBuffer
                                /* Conversion to Wei */
                                gasPrice = gasPrice * 1000000000
                                gasFeeOk = true
                            }
                        }
                    }
                    
                    const nonce = await web3.eth.getTransactionCount(fromAddress);
                    SA.logger.info('Nonce: ' + nonce)

                    const rawTransaction = {
                        "from": fromAddress,
                        "gasPrice": web3.utils.toHex(gasPrice),
                        "gasLimit": web3.utils.toHex(gasLimit),
                        "to": contractAddressDict[chain], "value": "0x0",
                        "data": contract.methods.transfer(toAddress, amountBigNumber).encodeABI(),
                        "nonce": web3.utils.toHex(nonce)
                    };
                    const transaction = new Tx(rawTransaction, { 'common': chainConfig })
                    transaction.sign(privateKeyBuffer)

                    SA.logger.info('Transaction: ', rawTransaction)

                    let result

                    result = await web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
                        .catch(err => {
                            SA.logger.error('sendSignedTransaction -> err =' + JSON.stringify(err))
                            errorList.push(transactionDetails)
                        })

                    SA.logger.info('Result: ', result)
                } catch (err) {
                    SA.logger.error('web3Server -> sendTokens -> err.stack = ' + err.stack)
                    errorList.push(transactionDetails)
                }
                // We do not want to exceed any limits, so we take a breather in the end of each run.
                await SA.projects.foundations.utilities.asyncFunctions.sleep(15000)
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