function newDecentralizedExchangesFunctionLibraryDecentralizedExchangesFunctions() {
    let thisObject = {
        createNewWallet: createNewWallet,
        importWalletFromMnemonic: importWalletFromMnemonic,
        importWalletFromPrivateKey: importWalletFromPrivateKey,
        addMissingTokens: addMissingTokens,
        addMissingPairs:addMissingPairs
    }

    return thisObject

    async function createNewWallet(node) {
        try {
            let endpoint = "DEX/CreateNewWallet"
            let body = JSON.stringify({})
            let response = await httpRequestAsync(body, endpoint)
            let wallet = JSON.parse(response.message)
            UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(node.payload,'address', wallet.address)
            UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(node.payload,'mnemonic', wallet.mnemonic)
            UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(node.payload,'privateKey', wallet.privateKey)
            UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(node.payload,'publicKey', wallet.publicKey)
            node.payload.uiObject.setInfoMessage(`wallet address ${wallet.address} created successfully.`, 4)
            return response
        } catch(err) {
            console.error(err)
            return err
        }
    }

    async function importWalletFromMnemonic (node) {
        try {
            let endpoint = "DEX/ImportWalletFromMnemonic"
            let mnemonic = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload, 'mnemonic')
            let body = JSON.stringify({
                mnemonic: mnemonic
            })
            let response = await httpRequestAsync(body, endpoint)
            let wallet = JSON.parse(response.message)
            UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(node.payload,'address', wallet.address)
            UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(node.payload,'privateKey', undefined)
            UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(node.payload,'publicKey', undefined)
            node.payload.uiObject.setInfoMessage(`wallet address ${wallet.address} imported successfully.`, 4)
            return response
        } catch(err) {
            console.error(err)
            return err
        }
    }

    async function importWalletFromPrivateKey (node) {
        try {
            let endpoint = "DEX/ImportWalletFromPrivateKey"
            let privateKey = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload, 'privateKey')
            let body = JSON.stringify({
                privateKey: privateKey
            })
            let response = await httpRequestAsync(body, endpoint)
            let wallet = JSON.parse(response.message)
            UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(node.payload,'address', wallet.address)
            UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(node.payload,'mnemonic', undefined)
            UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(node.payload,'publicKey', wallet.publicKey)
            node.payload.uiObject.setInfoMessage(`wallet address ${wallet.address} imported successfully.`, 4)
            return response
        } catch(err) {
            console.error(err)
            return err
        }
    }

    async function addMissingTokens(node) {
        try {
            if (node.payload.parentNode === undefined) { return }
        
            let currentTokens = new Map()
            for (let j = 0; j < node.token.length; j++) {
                let asset = node.token[j]
                let contractAddress = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(asset.payload, 'contractAddress')
                currentTokens.set(contractAddress, asset)
            }
            
            let network = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload.parentNode.payload.parentNode.payload, 'network')

            let newUiObjects = []
            let params = {
                network: network
            }

            let response = await httpRequestAsync(JSON.stringify(params), 'DEX/GetTokens')

            if (response.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                node.payload.uiObject.setErrorMessage('Failed to load token list.')
                return
            }

            let tokens = JSON.parse(response.message)

            let totalAdded = 0
            for (let i = 0; i < tokens.length; i++) {
                let token = tokens[i]

                if (currentTokens.get(token.symbol) === undefined) {
                    addAsset(token.symbol, token.contractAddress)
                    totalAdded++
                    currentTokens.set(token.symbol, token.symbol)
                }

                function addAsset(symbol, contractAddress) {
                    let newAsset = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(node, 'Token')
                    newAsset.name = symbol
                    newAsset.config = JSON.stringify({codeName: symbol, contractAddress: contractAddress})
                    newUiObjects.push(newAsset)
                }
            }
            node.payload.uiObject.setInfoMessage(`Added ${totalAdded} tokens.`, 4)

            return newUiObjects
        } catch(err) {
            console.error(err)
            return err
        }
    }

    async function addMissingPairs(node) {
        if (node.payload.parentNode === undefined) { return }

        let currentTokens = node.payload.parentNode.tokens.token
        
        let currentPairs = new Map()
        let swapPairs = node
        for (let i = 0; i < swapPairs.pair.length; i++) {
            let asset = swapPairs.pair[i]
            let codeName = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(asset.payload, 'codeName')
            currentPairs.set(codeName, asset)
        }

        let pairs = []
        for (let i = 0; i < currentTokens.length; i++) {
            for (let j = i+1; j < currentTokens.length; j++) {
                let tokenIn = currentTokens[i]
                let tokenOut = currentTokens[j]
                let codeNameIn = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(tokenIn.payload, 'codeName')
                let codeNameOut = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(tokenOut.payload, 'codeName')
                let symbol = `${codeNameIn}/${codeNameOut}`
                pairs.push({
                    symbol: symbol,
                    tokenIn: tokenIn,
                    tokenOut: tokenOut
                })
            }
        }
        
        let newUiObjects = []

        for (let i = 0; i < pairs.length; i++) {
            let pair = pairs[i]
            let tokenIn = pair.tokenIn
            let tokenOut = pair.tokenOut

            if (currentPairs.get(pair.symbol) === undefined) {
                let newPair = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(node, 'Swap Pair')
                newPair.name = pair.symbol
                newPair.config = '{ \n\"codeName\": \"' + pair.symbol + '\"\n}'
                newPair.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                newPair.payload.floatingObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_100X
                newPair.payload.floatingObject.arrangementStyle = ARRANGEMENT_STYLE.CONCAVE
                newPair.tokenIn.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_45
                newPair.tokenOut.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_45
                newPair.tokenIn.payload.floatingObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_100X
                newPair.tokenOut.payload.floatingObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_100X
                newPair.tokenIn.payload.floatingObject.arrangementStyle = ARRANGEMENT_STYLE.CONCAVE
                newPair.tokenOut.payload.floatingObject.arrangementStyle = ARRANGEMENT_STYLE.CONCAVE
                UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(newPair.tokenIn, tokenIn)
                UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(newPair.tokenOut, tokenOut)

                currentPairs.set(pair.symbol, newPair)
                newUiObjects.push(newPair)
            }
        }

        return newUiObjects
    }
}
