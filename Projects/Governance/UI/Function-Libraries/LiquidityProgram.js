function newGovernanceFunctionLibraryLiquidityProgram() {
    let thisObject = {
        calculate: calculate
    }

    return thisObject

    function calculate(
        pools,
        userProfiles,
        asset
    ) {
        let programPoolTokenReward
        /*
        In order to be able to calculate the share of the Program Pool for each User Profile,
        we need to accumulate all the Liquidity Power that each User Profile at their Program
        node has, because with that Power is that each Program node gets a share of the pool.
         */
        let accumulatedProgramPower = 0

        /* Scan Pools Until finding the Pool for this program*/
        for (let i = 0; i < pools.length; i++) {
            let poolsNode = pools[i]
            programPoolTokenReward = UI.projects.governance.utilities.pools.findPool(poolsNode, "Liquidity-Rewards-" + asset)
            if (programPoolTokenReward !== undefined) { break }
        }
        if (programPoolTokenReward === undefined || programPoolTokenReward === 0) { return }

        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgramBasedOnConfigProperty(userProfile, "Liquidity Program", 'asset', asset)
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }

            resetProgram(program)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgramBasedOnConfigProperty(userProfile, "Liquidity Program", 'asset', asset)
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }

            validateProgram(program, userProfile)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgramBasedOnConfigProperty(userProfile, "Liquidity Program", 'asset', asset)
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }
            if (program.payload.liquidityProgram.isActive === false) { continue }

            distributeProgram(program, userProfile)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgramBasedOnConfigProperty(userProfile, "Liquidity Program", 'asset', asset)
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }
            if (program.payload.liquidityProgram.isActive === false) { continue }

            calculateProgram(program)
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
        }

        function distributeProgram(programNode, userProfile) {
            if (programNode === undefined || programNode.payload === undefined) { return }
            /*
            Here we will convert Liquidity Tokens into Liquidity Power. 
            As per system rules Liquidity Power = userProfile.payload.liquidityTokens
            */
            let programPower = userProfile.payload.liquidityTokens[asset]
            programNode.payload.liquidityProgram.ownPower = programPower

            accumulatedProgramPower = accumulatedProgramPower + programPower
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
            programNode.payload.liquidityProgram.awarded.percentage = programNode.payload.liquidityProgram.ownPower * 100 / accumulatedProgramPower
            programNode.payload.liquidityProgram.awarded.tokens = programPoolTokenReward * programNode.payload.liquidityProgram.awarded.percentage / 100

            drawProgram(programNode)
        }

        function drawProgram(node) {
            if (node.payload !== undefined && node.payload.liquidityProgram.ownPower !== undefined) {

                const ownPowerText = parseFloat(node.payload.liquidityProgram.ownPower.toFixed(2)).toLocaleString('en')
                const percentageText = parseFloat(node.payload.liquidityProgram.awarded.percentage.toFixed(2)).toLocaleString('en')

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