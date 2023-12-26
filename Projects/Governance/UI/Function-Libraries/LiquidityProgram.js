function newGovernanceFunctionLibraryLiquidityProgram() {
    let thisObject = {
        calculate: calculate
    }

    let liquidityProgramBalanceList = []
    return thisObject

    function calculate(
        pools,
        userProfiles
    ) {
        let programPoolTokenReward
        /*
        In order to be able to calculate the share of the Program Pool for each User Profile,
        we need to accumulate all the Liquidity Power that each User Profile at their Program
        node has, because with that Power is that each Program node gets a share of the pool.
         */

        let accumulatedSATokens = 0
        let asset = ''
        let exchange = ''
        let chain = ''
        let configPropertyObject = {}
        let configFallbackObject = {}
        let assetExchange = ''
        let loadCompleted = true


        if (liquidityProgramBalanceList.length === 0) {
            initializeLiquidityPools()
        } 

        for (let liqProgram of liquidityProgramBalanceList) {
            asset = liqProgram['pairedAsset']
            exchange = liqProgram['exchange']
            chain = liqProgram['chain']

            configPropertyObject = {
                "asset": asset,
                "exchange": exchange
            }
            /* For backwards compatibility, treat empty exchange configurations as PANCAKE */
            configFallbackObject = {
                "asset": asset,
                "exchange": null
            }
            assetExchange = asset + "-" + exchange

            /* Scan Pools Until finding the Pool for this program*/
            for (let i = 0; i < pools.length; i++) {
                let poolsNode = pools[i]
                programPoolTokenReward = UI.projects.governance.utilities.pools.findPool(poolsNode, "Liquidity-Rewards")
                if (programPoolTokenReward !== undefined) { break }
            }
            if (programPoolTokenReward === undefined || programPoolTokenReward === 0) { continue }

            for (let i = 0; i < userProfiles.length; i++) {
                let userProfile = userProfiles[i]

                if (userProfile.tokenPowerSwitch === undefined) { continue }
                //let program = UI.projects.governance.utilities.validations.onlyOneProgramBasedOnConfigProperty(userProfile, "Liquidity Program", 'asset', asset)
                let program = UI.projects.governance.utilities.validations.onlyOneProgramBasedOnMultipleConfigProperties(userProfile, "Liquidity Program", configPropertyObject)
                /* If no result is found, take undefined exchanges as PANCAKE for backwards compatibility */
                if (program === undefined && exchange === "PANCAKE")
                {
                    program = UI.projects.governance.utilities.validations.onlyOneProgramBasedOnMultipleConfigProperties(userProfile, "Liquidity Program", configFallbackObject) 
                }
                if (program === undefined) { continue }
                if (program.payload === undefined) { continue }

                resetProgram(program)
            }
            for (let i = 0; i < userProfiles.length; i++) {
                let userProfile = userProfiles[i]

                if (userProfile.tokenPowerSwitch === undefined) { continue }
                //let program = UI.projects.governance.utilities.validations.onlyOneProgramBasedOnConfigProperty(userProfile, "Liquidity Program", 'asset', asset)
                let program = UI.projects.governance.utilities.validations.onlyOneProgramBasedOnMultipleConfigProperties(userProfile, "Liquidity Program", configPropertyObject)
                if (program === undefined && exchange === "PANCAKE")
                {
                    program = UI.projects.governance.utilities.validations.onlyOneProgramBasedOnMultipleConfigProperties(userProfile, "Liquidity Program", configFallbackObject) 
                }
                if (program === undefined) { continue }
                if (program.payload === undefined) { continue }

                validateProgram(program, userProfile)
            }
            for (let i = 0; i < userProfiles.length; i++) {
                let userProfile = userProfiles[i]

                if (userProfile.tokenPowerSwitch === undefined) { continue }
                //let program = UI.projects.governance.utilities.validations.onlyOneProgramBasedOnConfigProperty(userProfile, "Liquidity Program", 'asset', asset)
                let program = UI.projects.governance.utilities.validations.onlyOneProgramBasedOnMultipleConfigProperties(userProfile, "Liquidity Program", configPropertyObject)
                if (program === undefined && exchange === "PANCAKE")
                {
                    program = UI.projects.governance.utilities.validations.onlyOneProgramBasedOnMultipleConfigProperties(userProfile, "Liquidity Program", configFallbackObject) 
                }
                if (program === undefined) { continue }
                if (program.payload === undefined) { continue }
                if (program.payload.liquidityProgram.isActive === false) { continue }
                if (loadCompleted === false) {continue}

                distributeProgram(program, userProfile, assetExchange)
            }
        }


        /* Calculation loop only after accumulation of SA Token balances across all chain-asset-exchange combinations */
        for (let liqProgram of liquidityProgramBalanceList) {
            asset = liqProgram['pairedAsset']
            exchange = liqProgram['exchange']

            configPropertyObject = {
                "asset": asset,
                "exchange": exchange
            }
            /* For backwards compatibility, treat empty exchange configurations as PANCAKE */
            configFallbackObject = {
                "asset": asset,
                "exchange": null
            }

            for (let i = 0; i < pools.length; i++) {
                let poolsNode = pools[i]
                programPoolTokenReward = UI.projects.governance.utilities.pools.findPool(poolsNode, "Liquidity-Rewards")
                if (programPoolTokenReward !== undefined)  { break }
            }
            if (programPoolTokenReward === undefined || programPoolTokenReward === 0) { continue }

            for (let i = 0; i < userProfiles.length; i++) {
                let userProfile = userProfiles[i]

                if (userProfile.tokenPowerSwitch === undefined) { continue }
                //let program = UI.projects.governance.utilities.validations.onlyOneProgramBasedOnConfigProperty(userProfile, "Liquidity Program", 'asset', asset)
                let program = UI.projects.governance.utilities.validations.onlyOneProgramBasedOnMultipleConfigProperties(userProfile, "Liquidity Program", configPropertyObject)
                if (program === undefined && exchange === "PANCAKE")
                {
                    program = UI.projects.governance.utilities.validations.onlyOneProgramBasedOnMultipleConfigProperties(userProfile, "Liquidity Program", configFallbackObject) 
                }
                if (program === undefined) { continue }
                if (program.payload === undefined) { continue }
                if (program.payload.liquidityProgram.isActive === false) { continue }
                if (loadCompleted === false) {continue}
                calculateProgram(program)
            }

        }


        function initializeLiquidityPools() {
            let liquidityProgramList = UI.projects.governance.globals.saToken.SA_TOKEN_LIQUIDITY_POOL_LIST
            for (let liqProgram of liquidityProgramList) {
                let localObject = {}
                for (let key in liqProgram) {
                    if (key === "chain" || key === "exchange" || key === "pairedAsset" || key === 'contractAddress') {
                        localObject[key] = liqProgram[key]
                    }
                }
                localObject.LPTokenBalance = undefined
                localObject.SATokenBalance = undefined
                liquidityProgramBalanceList.push(localObject)
            }
            getLiquidityPoolBalances()
        }

        function getLiquidityPoolBalances() {
            let callCounter = 0
            for (let liqProgram of liquidityProgramBalanceList) {
                let contractAddressSA = UI.projects.governance.utilities.chains.getSATokenAddress(liqProgram.chain)
                let request = {
                    url: 'WEB3',
                    params: {
                        method: 'getLPTokenBalance',
                        chain: liqProgram.chain,
                        contractAddressSA: contractAddressSA,
                        contractAddressLP: liqProgram.contractAddress
                    }
                }
                /* Delaying calls not to hit RPC's max request rate */
                setTimeout(() => { httpRequest(JSON.stringify(request.params), request.url, onResponse) }, callCounter * 1000)
    
                function onResponse(err, data) {
                    if (err.result === GLOBAL.DEFAULT_FAIL_RESPONSE) {
                        console.log((new Date()).toISOString(), '[WARN] Error fetching Liquidity Pool information on ', liqProgram.chain , ' exchange ', liqProgram.exchange, ' asset ', liqProgram.pairedAsset)
                    } else {
                        let commandResponse = JSON.parse(data)
                        if (commandResponse.result !== "Ok") {
                            console.log((new Date()).toISOString(), '[WARN] Error fetching Liquidity Pool information on ', liqProgram.chain , ' exchange ', liqProgram.exchange, ' asset ', liqProgram.pairedAsset)
                            return
                        }
                        liqProgram['LPTokenBalance'] = commandResponse.tokensLP
                        liqProgram['SATokenBalance'] = commandResponse.tokensSA
                        console.log((new Date()).toISOString(), '[INFO]', liqProgram.chain, 'Liquidity on', liqProgram.exchange, 'for asset', liqProgram.pairedAsset, 'is ', Number(commandResponse.tokensLP), 'LP Tokens and ', Number(commandResponse.tokensSA), 'SA Tokens')
                    }
                }
            callCounter++
            }
        }

        function resetProgram(node) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }
            if (node.payload.liquidityProgram === undefined) {
                node.payload.liquidityProgram = {
                    count: 0,
                    percentage: 0,
                    outgoingPower: 0,
                    ownPower: 0,
                    incomingPower: 0,
                    awarded: {
                        tokens: 0,
                        percentage: 0
                    }
                }
            } else {
                node.payload.liquidityProgram.count = 0
                node.payload.liquidityProgram.percentage = 0
                node.payload.liquidityProgram.outgoingPower = 0
                node.payload.liquidityProgram.ownPower = 0
                node.payload.liquidityProgram.incomingPower = 0
                node.payload.liquidityProgram.awarded = {
                    tokens: 0,
                    percentage: 0
                }
            }
        }

        function validateProgram(node, userProfile) {
            /*
            This program is not going to run unless the Profile has Liquidity Tokens, and for 
            that users needs to execute the setup procedure of signing their Github
            username with their private key.
            */
            if (
                userProfile.payload.liquidityTokens === undefined
            ) {
                node.payload.liquidityProgram.isActive = false
                userProfile.payload.uiObject.setErrorMessage(
                    "Waiting for liquidity balance. It takes 1 minute to load the liquidity provided by each profile, because you are using a free API provided by BSC Scan.",
                    UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                )
                return
            } else {
                userProfile.payload.uiObject.resetErrorMessage()
                node.payload.liquidityProgram.isActive = true
            }
            loadCompleted = true
            for (let liqProgram of liquidityProgramBalanceList) {
                if (liqProgram['LPTokenBalance'] === undefined || liqProgram['SATokenBalance'] === undefined) {
                    loadCompleted = false
                    console.log("LP Balances for", liqProgram['chain'], liqProgram['exchange'], liqProgram['pairedAsset'], "not yet loaded.")
                    return
                }
            }
        }

        function distributeProgram(programNode, userProfile, assetExchange) {
            if (programNode === undefined || programNode.payload === undefined) { return }
            /*
            Here we will convert Liquidity Tokens into Liquidity Power. 
            As per system rules Liquidity Power = userProfile.payload.liquidityTokens
            */
            let programPower = userProfile.payload.liquidityTokens[assetExchange]
            //programNode.payload.liquidityProgram.ownPower = programPower

            let totalLPTokens = undefined
            let totalSATokens = undefined
            let programSATokens = undefined
            for (let liqProgram of liquidityProgramBalanceList) {
                if (liqProgram['chain'] === chain && liqProgram['pairedAsset'] === asset && liqProgram['exchange'] === exchange) {
                    totalLPTokens = liqProgram['LPTokenBalance']
                    totalSATokens = liqProgram['SATokenBalance']
                    break
                }
            }

            if (totalLPTokens !== undefined && totalSATokens !== undefined && totalLPTokens > 0) {
                programSATokens = totalSATokens / totalLPTokens * programPower
                //console.log("Calculated SA Tokens for", userProfile.name, asset, exchange, ":", programSATokens, "Tokens")
                programNode.payload.liquidityProgram.ownPower = programSATokens
                accumulatedSATokens = accumulatedSATokens + programSATokens
            }          
        }

        function calculateProgram(programNode) {

            if (programNode.payload === undefined) { return }
            if (programNode.tokensAwarded === undefined || programNode.tokensAwarded.payload === undefined) {
                programNode.payload.uiObject.setErrorMessage(
                    "Tokens Awarded Node is needed in order for this Program to get Tokens from the Program Pool.",
                    UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                )
                return
            }
            /*
            Here we will calculate which share of the Program Pool this user will get in tokens.
            To do that, we use the ownPower, to see which proportion of the accumulatedProgramPower
            represents.
            */
            programNode.payload.liquidityProgram.awarded.percentage = programNode.payload.liquidityProgram.ownPower * 100 / accumulatedSATokens
            programNode.payload.liquidityProgram.awarded.tokens = programPoolTokenReward * programNode.payload.liquidityProgram.awarded.percentage / 100

            drawProgram(programNode)
        }

        function drawProgram(node) {
            if (node.payload !== undefined && node.payload.liquidityProgram.ownPower !== undefined) {

                const ownPowerText = parseFloat(node.payload.liquidityProgram.ownPower.toFixed(0)).toLocaleString('en')
                const percentageText = parseFloat(node.payload.liquidityProgram.awarded.percentage.toFixed(2)).toLocaleString('en')
                
                //const ownPowerText = parseFloat(node.payload.liquidityProgram.ownPower.toFixed(2)).toLocaleString('en')
                //const percentageText = parseFloat(node.payload.liquidityProgram.awarded.percentage.toFixed(2)).toLocaleString('en')

                node.payload.uiObject.statusAngleOffset = 0
                node.payload.uiObject.statusAtAngle = false

                node.payload.uiObject.setStatus(ownPowerText + ' Liquidity Power' + ' - ' + percentageText + ' % Pool ', UI.projects.governance.globals.designer.SET_STATUS_COUNTER)
            }
            if (node.tokensAwarded !== undefined && node.tokensAwarded.payload !== undefined) {

                const tokensAwardedText = parseFloat(node.payload.liquidityProgram.awarded.tokens.toFixed(0)).toLocaleString('en')
                const tokensAwardedBTC = ' ≃ ' + UI.projects.governance.utilities.conversions.estimateSATokensInBTC(node.payload.liquidityProgram.awarded.tokens | 0) + '  BTC'
                
                node.tokensAwarded.payload.uiObject.valueAngleOffset = 0
                node.tokensAwarded.payload.uiObject.valueAtAngle = false

                node.tokensAwarded.payload.uiObject.setValue(tokensAwardedText + ' SA Tokens' + tokensAwardedBTC, UI.projects.governance.globals.designer.SET_VALUE_COUNTER)
            }
        }
    }
}

exports.newGovernanceFunctionLibraryLiquidityProgram = newGovernanceFunctionLibraryLiquidityProgram