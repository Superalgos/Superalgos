function newDecentralizedExchangesFunctionLibraryDecentralizedExchangesFunctions() {
    let thisObject = {
        createNewWallet: createNewWallet,
        importWalletFromMnemonic: importWalletFromMnemonic,
        importWalletFromPrivateKey: importWalletFromPrivateKey,
        addMissingTokens: addMissingTokens,
        addMissingPairs: addMissingPairs,
        installSwapPair: installSwapPair,
        uninstallSwapPair: uninstallSwapPair
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
                    addAsset(token.symbol, token.contractAddress, newUiObjects, node)
                    totalAdded++
                    currentTokens.set(token.symbol, token.symbol)
                }
            }
            node.payload.uiObject.setInfoMessage(`Added ${totalAdded} tokens.`, 4)

            return newUiObjects
        } catch(err) {
            console.error(err)
            return err
        }
    }

    async function addAsset(symbol, contractAddress, newUiObjects, node) {
        let newAsset = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(node, 'Token')
        newAsset.name = symbol
        newAsset.config = JSON.stringify({codeName: symbol, contractAddress: contractAddress})
        newUiObjects.push(newAsset)
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

    async function installSwapPair(node, rootNodes) {
        let swapPair = node
        let cryptoExchange = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(node, 'Decentralized Exchange', undefined, true, false, true, false)
        if (cryptoExchange === undefined) {
            node.payload.uiObject.setErrorMessage('swapPair must be a descendant of a Decentralized Exchange')
            return
        }
        node.payload.uiObject.setInfoMessage('This swapPair is being installed. This might take a minute or two. Please hold on while we connect all the dots for you. ')

        await installSwapPairProcedure()

        async function installSwapPairProcedure() {
            let dashboardsArray = []

            for (let i = 0; i < rootNodes.length; i++) {
                let rootNode = rootNodes[i]
                if (rootNode.type === 'LAN Network') {
                    await installInNetwork(rootNode)
                }
            }

            for (let i = 0; i < rootNodes.length; i++) {
                let rootNode = rootNodes[i]
                if (rootNode.type === 'Charting Space') {
                    await installInChartingSpace(rootNode)
                }
            }

            node.payload.uiObject.setInfoMessage('swapPair installation is complete.')

            async function installInNetwork(network) {

                for (let j = 0; j < network.lanNetworkNodes.length; j++) {
                    let lanNetworkNode = network.lanNetworkNodes[j]
                    await installInNetworkNode(lanNetworkNode)
                }

                async function installInNetworkNode(lanNetworkNode) {

                    let tradingSessionsCreatedArray = []
                    let portfolioSessionsCreatedArray = []
                    let learningSessionsCreatedArray = []

                    await installDataTasksTasks()
                    await installLearningTasksTasks()
                    await installTradingTasksTasks()
                    await installPortfolioTasksTasks()

                    await installDataMinesData()
                    await installLearningMinesData()
                    await installTradingMineData()
                    await installPortfolioMineData()

                    async function installDataTasksTasks() {
                        /*
                        Here we complete the missing stuff at Data Tasks
                        */
                        let dataTasks = UI.projects.visualScripting.utilities.branches.findInBranch(lanNetworkNode, 'Data Tasks', node, true)
                        if (dataTasks === undefined) {
                            dataTasks = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(lanNetworkNode, 'Data Tasks')
                        }
                        /*
                        We will make ourselves sure that the Project Data Tasks nodes are there.
                        */
                        dataTasks.payload.uiObject.menu.internalClick('Add Missing Project Data Tasks')
                        dataTasks.payload.uiObject.menu.internalClick('Add Missing Project Data Tasks')

                        for (let i = 0; i < dataTasks.projectDataTasks.length; i++) {
                            let projectDataTasks = dataTasks.projectDataTasks[i]
                            projectDataTasks.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_90

                            if (projectDataTasks.project === "Foundations") {
                                installTheRestOfTheBranch(projectDataTasks)
                            }
                        }

                        async function installTheRestOfTheBranch(projectDataTasks) {
                            let exchangeDataTasks = UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(projectDataTasks, 'Exchange Data Tasks', cryptoExchange)
                            exchangeDataTasks.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                            let swapPairDataTask = UI.projects.visualScripting.utilities.nodeChildren.findAndRecreateChildWithReference(exchangeDataTasks, 'Market Data Tasks', swapPair, rootNodes)

                            UI.projects.foundations.utilities.menu.menuClick(swapPairDataTask, 'Add Missing Data Mine Tasks', true)
                            UI.projects.foundations.utilities.menu.menuClickOfNodeArray(swapPairDataTask.dataMineTasks, 'Add All Tasks', true)
                        }
                    }

                    async function installLearningTasksTasks() {
                        /*
                        Here we complete the missing stuff at Learning Tasks
                        */
                        let learningTasks = UI.projects.visualScripting.utilities.branches.findInBranch(lanNetworkNode, 'Learning Tasks', node, true)
                        if (learningTasks === undefined) {
                            learningTasks = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(lanNetworkNode, 'Learning Tasks')
                        }
                        /*
                        We will make ourselves sure that the Project Learning Tasks nodes are there.
                        */
                        learningTasks.payload.uiObject.menu.internalClick('Add Missing Project Learning Tasks')
                        learningTasks.payload.uiObject.menu.internalClick('Add Missing Project Learning Tasks')

                        for (let i = 0; i < learningTasks.projectLearningTasks.length; i++) {
                            let projectLearningTasks = learningTasks.projectLearningTasks[i]
                            projectLearningTasks.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_90

                            if (projectLearningTasks.project === "Foundations") {
                                installTheRestOfTheBranch(projectLearningTasks)
                            }
                        }

                        async function installTheRestOfTheBranch(projectLearningTasks) {
                            let exchangeLearningTasks = UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(projectLearningTasks, 'Exchange Learning Tasks', cryptoExchange)
                            exchangeLearningTasks.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                            let swapPairLearningTask = UI.projects.visualScripting.utilities.nodeChildren.findAndRecreateChildWithReference(exchangeLearningTasks, 'Market Learning Tasks', swapPair, rootNodes)

                            UI.projects.foundations.utilities.menu.menuClick(swapPairLearningTask, 'Add Missing Learning Mine Tasks', true)
                            UI.projects.foundations.utilities.menu.menuClickOfNodeArray(swapPairLearningTask.learningMineTasks, 'Add All Tasks', true)

                            /* This will be needed at the charting space, for creating Dashboards */
                            let backLearningSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(swapPairLearningTask, 'Back Learning Session')
                            let liveLearningSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(swapPairLearningTask, 'Live Learning Session')

                            let allSessionsArray = backLearningSessionsArray
                                .concat(liveLearningSessionsArray)

                            learningSessionsCreatedArray = learningSessionsCreatedArray.concat(allSessionsArray)

                            dashboardsArray.push({ environmentNode: learningTasks, lanNetworkNode: lanNetworkNode, sessionsArray: allSessionsArray })
                        }
                    }

                    async function installTradingTasksTasks() {
                        /*
                        Next we complete the missing stuff at Testing Trading Tasks
                        */
                        await installEnvironment('Testing Trading Tasks')
                        /*
                        Next we complete the missing stuff at Production Trading Tasks
                        */
                        await installEnvironment('Production Trading Tasks')

                        async function installEnvironment(environmentType) {
                            /*
                            Now we install the environment at the current Network Node
                            */
                            let tradingTasks = UI.projects.visualScripting.utilities.branches.findInBranch(lanNetworkNode, environmentType, node, true)
                            if (tradingTasks === undefined) {
                                tradingTasks = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(lanNetworkNode, environmentType)
                            }
                            /*
                             We will make ourselves sure that the Project Trading Tasks nodes are there.
                             */
                            tradingTasks.payload.uiObject.menu.internalClick('Add Missing Project Trading Tasks')
                            tradingTasks.payload.uiObject.menu.internalClick('Add Missing Project Trading Tasks')

                            for (let i = 0; i < tradingTasks.projectTradingTasks.length; i++) {
                                let projectTradingTasks = tradingTasks.projectTradingTasks[i]
                                projectTradingTasks.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_90

                                if (projectTradingTasks.project === "Foundations") {
                                    await installTheRestOfTheBranch(projectTradingTasks)
                                }
                            }

                            async function installTheRestOfTheBranch(projectTradingTasks) {
                                let exchangeTradingTasks = UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(projectTradingTasks, 'Exchange Trading Tasks', cryptoExchange)
                                exchangeTradingTasks.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                                let swapPairTradingTask = UI.projects.visualScripting.utilities.nodeChildren.findAndRecreateChildWithReference(exchangeTradingTasks, 'Market Trading Tasks', swapPair, rootNodes)

                                UI.projects.foundations.utilities.menu.menuClick(swapPairTradingTask, 'Add Missing Trading Mine Tasks', true)
                                UI.projects.foundations.utilities.menu.menuClickOfNodeArray(swapPairTradingTask.tradingMineTasks, 'Add All Tasks', true)

                                /* This will be needed at the charting space, for creating Dashboards */
                                let backtestingSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(swapPairTradingTask, 'Backtesting Session')
                                let liveTradingSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(swapPairTradingTask, 'Live Trading Session')
                                let paperTradingSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(swapPairTradingTask, 'Paper Trading Session')
                                let forwardSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(swapPairTradingTask, 'Forward Testing Session')
                                let allSessionsArray = backtestingSessionsArray
                                    .concat(liveTradingSessionsArray)
                                    .concat(paperTradingSessionsArray)
                                    .concat(forwardSessionsArray)
                                tradingSessionsCreatedArray = tradingSessionsCreatedArray.concat(allSessionsArray)

                                dashboardsArray.push({ environmentNode: tradingTasks, lanNetworkNode: lanNetworkNode, sessionsArray: allSessionsArray })
                            }
                        }
                    }

                    async function installPortfolioTasksTasks() {
                        /*
                        Next we complete the missing stuff at Testing Portfolio Tasks
                        */
                        await installEnvironment('Testing Portfolio Tasks')
                        /*
                        Next we complete the missing stuff at Production Portfolio Tasks
                        */
                        await installEnvironment('Production Portfolio Tasks')

                        async function installEnvironment(environmentType) {
                            /*
                            Now we install the environment at the current Network Node
                            */
                            let portfolioTasks = UI.projects.visualScripting.utilities.branches.findInBranch(lanNetworkNode, environmentType, node, true)
                            if (portfolioTasks === undefined) {
                                portfolioTasks = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(lanNetworkNode, environmentType, undefined, 'Portfolio-Management')
                            }
                            /*
                            We will make ourselves sure that the Project Portfolio Tasks nodes are there.
                            */
                            portfolioTasks.payload.uiObject.menu.internalClick('Add Missing Project Portfolio Tasks')
                            portfolioTasks.payload.uiObject.menu.internalClick('Add Missing Project Portfolio Tasks')

                            for (let i = 0; i < portfolioTasks.projectPortfolioTasks.length; i++) {
                                let projectPortfolioTasks = portfolioTasks.projectPortfolioTasks[i]
                                projectPortfolioTasks.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_90

                                if (projectPortfolioTasks.project === "Foundations" ||
                                    projectPortfolioTasks.project === "Portfolio-Management") {
                                    await installTheRestOfTheBranch(projectPortfolioTasks)
                                }
                            }

                            async function installTheRestOfTheBranch(projectPortfolioTasks) {
                                let exchangePortfolioTasks = UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(projectPortfolioTasks, 'Exchange Portfolio Tasks', cryptoExchange)
                                exchangePortfolioTasks.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                                let swapPairPortfolioTask = UI.projects.visualScripting.utilities.nodeChildren.findAndRecreateChildWithReference(exchangePortfolioTasks, 'Market Portfolio Tasks', swapPair, rootNodes)

                                UI.projects.foundations.utilities.menu.menuClick(swapPairPortfolioTask, 'Add Missing Portfolio Mine Tasks', true)
                                UI.projects.foundations.utilities.menu.menuClickOfNodeArray(swapPairPortfolioTask.portfolioMineTasks, 'Add All Tasks', true)

                                /* This will be needed at the charting space, for creating Dashboards */
                                let backtestingSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(swapPairPortfolioTask, 'Backtesting Portfolio Session')
                                let livePortfolioSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(swapPairPortfolioTask, 'Live Portfolio Session')
                                //let paperPortfolioSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(swapPairPortfolioTask, 'Paper Portfolio Session')
                                //let forwardSessionsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(swapPairPortfolioTask, 'Forward Testing Session')
                                let allSessionsArray = backtestingSessionsArray
                                    .concat(livePortfolioSessionsArray)
                                    /*.concat(paperPortfolioSessionsArray)
                                    .concat(forwardSessionsArray)*/
                                portfolioSessionsCreatedArray = portfolioSessionsCreatedArray.concat(allSessionsArray)

                                dashboardsArray.push({ environmentNode: portfolioTasks, lanNetworkNode: lanNetworkNode, sessionsArray: allSessionsArray })
                            }
                        }
                    }

                    async function installDataMinesData() {
                        /*
                        Here we complete the missing stuff at Data Mines Data
                        */
                        let dataStorage = UI.projects.visualScripting.utilities.branches.findInBranch(lanNetworkNode, 'Data Storage', node, true)
                        if (dataStorage === undefined) {
                            dataStorage = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(lanNetworkNode, 'Data Storage')
                        }
                        let dataMinesData = UI.projects.visualScripting.utilities.branches.findInBranch(dataStorage, 'Data Mines Data', node, true)
                        if (dataMinesData === undefined) {
                            dataMinesData = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(dataStorage, 'Data Mines Data')
                        }
                        dataMinesData.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_90
                        /*
                        We will make ourselves sure that the Project Data Products nodes are there.
                        */
                        dataMinesData.payload.uiObject.menu.internalClick('Add Missing Project Data Products')
                        dataMinesData.payload.uiObject.menu.internalClick('Add Missing Project Data Products')

                        for (let i = 0; i < dataMinesData.projectDataProducts.length; i++) {
                            let projectDataProducts = dataMinesData.projectDataProducts[i]
                            projectDataProducts.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_45

                            if (projectDataProducts.project === "Foundations") {
                                await installTheRestOfTheBranch(projectDataProducts)
                            }
                        }

                        async function installTheRestOfTheBranch(projectDataProducts) {
                            let exchangeDataProducts = UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(projectDataProducts, 'Exchange Data Products', cryptoExchange)
                            exchangeDataProducts.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                            let swapPairDataProducts = UI.projects.visualScripting.utilities.nodeChildren.findAndRecreateChildWithReference(exchangeDataProducts, 'Market Data Products', swapPair, rootNodes)
                            swapPairDataProducts.payload.floatingObject.collapseToggle()

                            UI.projects.foundations.utilities.menu.menuClick(swapPairDataProducts, 'Add All Data Mine Products', true)
                            UI.projects.foundations.utilities.menu.menuClickOfNodeArray(swapPairDataProducts.dataMineProducts, 'Add All Data Products', true)
                        }
                    }

                    async function installLearningMinesData() {
                        /*
                        Here we complete the missing stuff at Data Mines Data
                        */
                        let dataStorage = UI.projects.visualScripting.utilities.branches.findInBranch(lanNetworkNode, 'Data Storage', node, true)
                        if (dataStorage === undefined) {
                            dataStorage = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(lanNetworkNode, 'Data Storage')
                        }
                        let learningMinesData = UI.projects.visualScripting.utilities.branches.findInBranch(dataStorage, 'Learning Mines Data', node, true)
                        if (learningMinesData === undefined) {
                            learningMinesData = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(dataStorage, 'Learning Mines Data')
                        }
                        learningMinesData.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_90
                        /*
                        We will make ourselves sure that the Project Learning Products nodes are there.
                        */
                        learningMinesData.payload.uiObject.menu.internalClick('Add Missing Project Learning Products')
                        learningMinesData.payload.uiObject.menu.internalClick('Add Missing Project Learning Products')

                        for (let i = 0; i < learningMinesData.projectLearningProducts.length; i++) {
                            let projectLearningProducts = learningMinesData.projectLearningProducts[i]
                            projectLearningProducts.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_45

                            if (projectLearningProducts.project === "Foundations") {
                                await installTheRestOfTheBranch(projectLearningProducts)
                            }
                        }

                        async function installTheRestOfTheBranch(projectLearningProducts) {

                            let exchangeLearningProducts = UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(projectLearningProducts, 'Exchange Learning Products', cryptoExchange)
                            exchangeLearningProducts.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                            let swapPairLearningProducts = UI.projects.visualScripting.utilities.nodeChildren.findAndRecreateChildWithReference(exchangeLearningProducts, 'Market Learning Products', swapPair, rootNodes)
                            swapPairLearningProducts.payload.floatingObject.collapseToggle()
                            /*
                            Create the new session references.
                            */
                            for (let i = 0; i < learningSessionsCreatedArray.length; i++) {
                                let session = learningSessionsCreatedArray[i]
                                if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(swapPairLearningProducts, session, true) === true) {
                                    UI.projects.foundations.nodeActionFunctions.dataStorageFunctions.createSessionReference(swapPairLearningProducts, session, 'Learning Session Reference')
                                }
                            }
                            /*
                            Create everything inside the session references.
                            */
                            for (let j = 0; j < swapPairLearningProducts.learningSessionReferences.length; j++) {
                                let sessionReference = swapPairLearningProducts.learningSessionReferences[j]
                                UI.projects.foundations.utilities.menu.menuClick(sessionReference, 'Add All Learning Mine Products', true)
                                UI.projects.foundations.utilities.menu.menuClickOfNodeArray(sessionReference.learningMineProducts, 'Add All Data Products', true)
                                sessionReference.payload.floatingObject.collapseToggle()
                            }
                        }
                    }

                    async function installTradingMineData() {
                        /*
                        Here we complete the missing stuff at Data Mines Data
                        */
                        let dataStorage = UI.projects.visualScripting.utilities.branches.findInBranch(lanNetworkNode, 'Data Storage', node, true)
                        if (dataStorage === undefined) {
                            dataStorage = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(lanNetworkNode, 'Data Storage')
                        }
                        let tradingMinesData = UI.projects.visualScripting.utilities.branches.findInBranch(dataStorage, 'Trading Mines Data', node, true)
                        if (tradingMinesData === undefined) {
                            tradingMinesData = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(dataStorage, 'Trading Mines Data')
                        }
                        tradingMinesData.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_90
                        /*
                        We will make ourselves sure that the Project Trading Products nodes are there.
                        */
                        tradingMinesData.payload.uiObject.menu.internalClick('Add Missing Project Trading Products')
                        tradingMinesData.payload.uiObject.menu.internalClick('Add Missing Project Trading Products')

                        for (let i = 0; i < tradingMinesData.projectTradingProducts.length; i++) {
                            let projectTradingProducts = tradingMinesData.projectTradingProducts[i]
                            projectTradingProducts.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_45

                            if (projectTradingProducts.project === "Foundations") {
                                await installTheRestOfTheBranch(projectTradingProducts)
                            }
                        }

                        async function installTheRestOfTheBranch(projectTradingProducts) {

                            let exchangeTradingProducts = UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(projectTradingProducts, 'Exchange Trading Products', cryptoExchange)
                            exchangeTradingProducts.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                            let swapPairTradingProducts = UI.projects.visualScripting.utilities.nodeChildren.findAndRecreateChildWithReference(exchangeTradingProducts, 'Market Trading Products', swapPair, rootNodes)
                            swapPairTradingProducts.payload.floatingObject.collapseToggle()
                            /*
                            Create the new session references.
                            */
                            for (let i = 0; i < tradingSessionsCreatedArray.length; i++) {
                                let session = tradingSessionsCreatedArray[i]
                                if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(swapPairTradingProducts, session, true) === true) {
                                    UI.projects.foundations.nodeActionFunctions.dataStorageFunctions.createSessionReference(swapPairTradingProducts, session, 'Trading Session Reference')
                                }
                            }
                            /*
                            Create everything inside the session references.
                            */
                            for (let j = 0; j < swapPairTradingProducts.tradingSessionReferences.length; j++) {
                                let sessionReference = swapPairTradingProducts.tradingSessionReferences[j]
                                UI.projects.foundations.utilities.menu.menuClick(sessionReference, 'Add All Trading Mine Products', true)
                                UI.projects.foundations.utilities.menu.menuClickOfNodeArray(sessionReference.tradingMineProducts, 'Add All Data Products', true)
                                sessionReference.payload.floatingObject.collapseToggle()
                            }
                        }
                    }

                    async function installPortfolioMineData() {
                        /*
                        Here we complete the missing stuff at Data Mines Data
                        */
                        let dataStorage = UI.projects.visualScripting.utilities.branches.findInBranch(lanNetworkNode, 'Data Storage', node, true)
                        if (dataStorage === undefined) {
                            dataStorage = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(lanNetworkNode, 'Data Storage')
                        }
                        let portfolioMinesData = UI.projects.visualScripting.utilities.branches.findInBranch(dataStorage, 'Portfolio Mines Data', node, true)
                        if (portfolioMinesData === undefined) {
                            portfolioMinesData = UI.projects.visualScripting.nodeActionFunctions.uiObjectsFromNodes.addUIObject(dataStorage, 'Portfolio Mines Data')
                        }
                        portfolioMinesData.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_90
                        /*
                        We will make ourselves sure that the Project Portfolio Products nodes are there.
                        */
                        portfolioMinesData.payload.uiObject.menu.internalClick('Add UI Object')
                        portfolioMinesData.payload.uiObject.menu.internalClick('Add Missing Project Portfolio Products')

                        for (let i = 0; i < portfolioMinesData.projectPortfolioProducts.length; i++) {
                            let projectPortfolioProducts = portfolioMinesData.projectPortfolioProducts[i]
                            projectPortfolioProducts.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_45

                            if (projectPortfolioProducts.project === "Foundations" ||
                                projectPortfolioProducts.project === "Portfolio-Management") {
                                await installTheRestOfTheBranch(projectPortfolioProducts)
                            }
                        }

                        async function installTheRestOfTheBranch(projectPortfolioProducts) {

                            let exchangePortfolioProducts = UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(projectPortfolioProducts, 'Exchange Portfolio Products', cryptoExchange)
                            exchangePortfolioProducts.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                            let swapPairPortfolioProducts = UI.projects.visualScripting.utilities.nodeChildren.findAndRecreateChildWithReference(exchangePortfolioProducts, 'Market Portfolio Products', swapPair, rootNodes)
                            swapPairPortfolioProducts.payload.floatingObject.collapseToggle()
                            /*
                            Create the new session references.
                            */
                            for (let i = 0; i < portfolioSessionsCreatedArray.length; i++) {
                                let session = portfolioSessionsCreatedArray[i]
                                if (UI.projects.visualScripting.utilities.nodeChildren.isMissingChildrenById(swapPairPortfolioProducts, session, true) === true) {
                                    UI.projects.foundations.nodeActionFunctions.dataStorageFunctions.createSessionReference(swapPairPortfolioProducts, session, 'Portfolio Session Reference')
                                }
                            }
                            /*
                            Create everything inside the session references.
                            */
                            for (let j = 0; j < swapPairPortfolioProducts.portfolioSessionReferences.length; j++) {
                                let sessionReference = swapPairPortfolioProducts.portfolioSessionReferences[j]
                                UI.projects.foundations.utilities.menu.menuClick(sessionReference, 'Add All Portfolio Mine Products', true)
                                UI.projects.foundations.utilities.menu.menuClickOfNodeArray(sessionReference.portfolioMineProducts, 'Add All Data Products', true)
                                sessionReference.payload.floatingObject.collapseToggle()
                            }
                        }
                    }
                }
            }

            async function installInChartingSpace(chartingSpace) {
                /*
                We will make ourselves sure that the Project Data Tasks nodes are there.
                */
                chartingSpace.payload.uiObject.menu.internalClick('Add Missing Project Dashboards')
                chartingSpace.payload.uiObject.menu.internalClick('Add Missing Project Dashboards')

                for (let i = 0; i < chartingSpace.projectDashboards.length; i++) {
                    let projectDashboards = chartingSpace.projectDashboards[i]
                    projectDashboards.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180

                    if (projectDashboards.project === "Foundations") {
                        await installTheRestOfTheBranch(projectDashboards)
                    }
                }

                async function installTheRestOfTheBranch(projectDashboards) {

                    for (let i = 0; i < dashboardsArray.length; i++) {
                        /*
                        If the Dashboard we need is not already there we create a new one.
                        */
                        let arrayItem = dashboardsArray[i]
                        let dashboard = UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(projectDashboards, 'Dashboard', arrayItem.environmentNode)
                        dashboard.name = arrayItem.environmentNode.type + ' ' + arrayItem.lanNetworkNode.name
                        /*
                        We delete all the existing Time Machines related to the swapPair we are currently installing.
                        For that, we make a new array with the existing Time Machines so that the deleting
                        of each node does not affect the processing of the whole set.
                        */
                        let timeMachines = []
                        for (let i = 0; i < dashboard.timeMachines.length; i++) {
                            let timeMachine = dashboard.timeMachines[i]
                            timeMachines.push(timeMachine)
                        }
                        for (let i = 0; i < timeMachines.length; i++) {
                            let timeMachine = timeMachines[i]
                            let session = timeMachine.payload.referenceParent
                            if (session === undefined || session.cleaned === true) {
                                /*
                                This is what usually happens, that the install process make these
                                time machines to lose their reference parent since the install
                                process deletes them.
                                */
                                UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.deleteUIObject(timeMachine, rootNodes)
                                continue
                            }
                            let swapPairTradingTasks = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(session, 'Market Trading Tasks', undefined, true, false, true, false)
                            if (swapPairTradingTasks === undefined) { continue }
                            if (swapPairTradingTasks.payload === undefined) { continue }
                            if (swapPairTradingTasks.payload.referenceParent === undefined) { continue }
                            if (swapPairTradingTasks.payload.referenceParent.id === swapPair.id) {
                                UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.deleteUIObject(timeMachine, rootNodes)
                            }

                            let swapPairPortfolioTasks = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(session, 'Market Portfolio Tasks', undefined, true, false, true, false)
                            if (swapPairPortfolioTasks === undefined) { continue }
                            if (swapPairPortfolioTasks.payload === undefined) { continue }
                            if (swapPairPortfolioTasks.payload.referenceParent === undefined) { continue }
                            if (swapPairPortfolioTasks.payload.referenceParent.id === swapPair.id) {
                                UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.deleteUIObject(timeMachine, rootNodes)
                            }
                        }
                        /*
                        We create a time machine for each session added during the previous processing.
                        */
                        for (let j = 0; j < arrayItem.sessionsArray.length; j++) {
                            let session = arrayItem.sessionsArray[j]
                            let timeMachine = UI.projects.foundations.nodeActionFunctions.chartingSpaceFunctions.createTimeMachine(dashboard, session, node, arrayItem.lanNetworkNode, rootNodes)
                        }
                    }
                }
            }
        }
    }

    async function uninstallSwapPair(node, rootNodes) {

        node.payload.uiObject.setInfoMessage('This DEX swap pair is being uninstalled. Please hold on, it might take a while.')

        await uninstallSwapPairProcedure()

        async function uninstallSwapPairProcedure() {
            let swapPair = node
            for (let i = 0; i < rootNodes.length; i++) {
                let rootNode = rootNodes[i]
                if (rootNode.type === 'Charting Space') {
                    await uninstallInChartingSpace(rootNode)
                }
            }

            node.payload.uiObject.setInfoMessage('DEX swap pair uninstall is complete.')

            async function uninstallInChartingSpace(chartingSpace) {

                /* Delete all time machines which are referencing sessions inside the swapPair being uninstalled. */
                let timeMachines = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(chartingSpace, 'Time Machine')
                for (let i = 0; i < timeMachines.length; i++) {
                    let timeMachine = timeMachines[i]
                    let session = timeMachine.payload.referenceParent
                    if (session === undefined) { continue }

                    if (session.project === 'Foundations') {
                        let swapPairTradingTasks = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(session, 'Market Trading Tasks', undefined, true, false, true, false)
                        if (swapPairTradingTasks === undefined) { continue }
                        if (swapPairTradingTasks.payload === undefined) { continue }
                        if (swapPairTradingTasks.payload.referenceParent === undefined) { continue }
                        if (swapPairTradingTasks.payload.referenceParent.id === swapPair.id) {
                            UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.deleteUIObject(timeMachine, rootNodes)
                        }
                    }

                    if (session.project === 'Portfolio-Management') {
                        let swapPairPortfolioTasks = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(session, 'Market Portfolio Tasks', undefined, true, false, true, false)
                        if (swapPairPortfolioTasks === undefined) { continue }
                        if (swapPairPortfolioTasks.payload === undefined) { continue }
                        if (swapPairPortfolioTasks.payload.referenceParent === undefined) { continue }
                        if (swapPairPortfolioTasks.payload.referenceParent.id === swapPair.id) {
                            UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.deleteUIObject(timeMachine, rootNodes)
                        }
                    }
                }

                /* Delete all Dashboards that does not have time machines inside. */
                let dashboardArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(chartingSpace, 'Dashboard')
                for (let i = 0; i < dashboardArray.length; i++) {
                    let dashboard = dashboardArray[i]
                    if (dashboard.timeMachines.length === 0) {
                        /*
                        If possible, after we delete the dashboards, we will also
                        delete the project reference.
                        */
                        let projectReference = dashboard.payload.parentNode
                        schemaDocument = getSchemaDocument(dashboard)
                        UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.deleteUIObject(dashboard, rootNodes)
                        if (projectReference !== undefined && schemaDocument.propertyNameAtParent !== undefined) {
                            if (projectReference[schemaDocument.propertyNameAtParent] !== undefined) {
                                if (projectReference[schemaDocument.propertyNameAtParent].length === 0) {
                                    UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.deleteUIObject(projectReference, rootNodes)
                                }
                            }
                        }
                    }
                }

                /* Scan Networks for the swapPair being uninstalled to delete it. */
                for (let i = 0; i < rootNodes.length; i++) {
                    let rootNode = rootNodes[i]
                    if (rootNode.type === 'LAN Network') {
                        await uninstallInNetwork(rootNode)
                    }
                }
            }

            async function uninstallInNetwork(network) {

                let swapPairDataTasksArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(network, 'Market Data Tasks')
                let swapPairTradingTasksArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(network, 'Market Trading Tasks')
                let swapPairPortfolioTasksArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(network, 'Market Portfolio Tasks')
                let swapPairLearningTasksArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(network, 'Market Learning Tasks')
                let swapPairDataProductsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(network, 'Market Data Products')
                let swapPairTradingProductsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(network, 'Market Trading Products')
                let swapPairPortfolioProductsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(network, 'Market Portfolio Products')
                let swapPairLearningProductsArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(network, 'Market Learning Products')

                await uninstalSwapPairArray(swapPairDataTasksArray)
                await uninstalSwapPairArray(swapPairTradingTasksArray)
                await uninstalSwapPairArray(swapPairPortfolioTasksArray)
                await uninstalSwapPairArray(swapPairLearningTasksArray)
                await uninstalSwapPairArray(swapPairDataProductsArray)
                await uninstalSwapPairArray(swapPairTradingProductsArray)
                await uninstalSwapPairArray(swapPairPortfolioProductsArray)
                await uninstalSwapPairArray(swapPairLearningProductsArray)
             
                async function uninstalSwapPairArray(swapPairArray) {
                    for (let i = 0; i < swapPairArray.length; i++) {
                        let swapPairReference = swapPairArray[i]
                        if (swapPairReference.payload === undefined) { continue }
                        if (swapPairReference.payload.referenceParent === undefined) { continue }
                        if (swapPairReference.payload.referenceParent.id === swapPair.id) {
                            /*
                            If possible, after we delete the swapPair reference, we will also
                            delete the exchange reference.
                            */
                            let exchangeReference = swapPairReference.payload.parentNode
                            let schemaDocument = getSchemaDocument(swapPairReference)
                            UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.deleteUIObject(swapPairReference, rootNodes)
                            if (exchangeReference !== undefined && schemaDocument.propertyNameAtParent !== undefined) {
                                if (exchangeReference[schemaDocument.propertyNameAtParent].length === 0) {
                                    /*
                                    If possible, after we delete the exchange reference, we will also
                                    delete the project reference.
                                    */
                                    let projectReference = exchangeReference.payload.parentNode
                                    schemaDocument = getSchemaDocument(exchangeReference)
                                    UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.deleteUIObject(exchangeReference, rootNodes)
                                    if (projectReference !== undefined && schemaDocument.propertyNameAtParent !== undefined) {
                                        if (projectReference[schemaDocument.propertyNameAtParent].length === 0) {
                                            UI.projects.visualScripting.nodeActionFunctions.nodeDeleter.deleteUIObject(projectReference, rootNodes)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
