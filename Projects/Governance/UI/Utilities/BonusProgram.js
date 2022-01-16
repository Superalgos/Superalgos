function newGovernanceUtilitiesBonusProgram() {
    let thisObject = {
        run: run
    }

    return thisObject

    function run(
        pools,
        userProfiles,
        programPropertyName,
        programCodeName,
        programNodeType
    ) {
        let programPoolTokenReward
        /*
        In order to be able to calculate the share of the Program Pool for each User Profile,
        we need to accumulate all the Bonus Power that each User Profile at their Program
        node has, because with that Power is that each Program node gets a share of the pool.
         */
        let accumulatedProgramPower = 0

        /* Scan Pools Until finding the Pool for this program*/
        for (let i = 0; i < pools.length; i++) {
            let poolsNode = pools[i]
            programPoolTokenReward = UI.projects.governance.utilities.pools.findPool(poolsNode, programCodeName)
            if (programPoolTokenReward !== undefined) { break }
        }
        if (programPoolTokenReward === undefined || programPoolTokenReward === 0) { return }

        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, programNodeType)
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }

            resetProgram(program)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, programNodeType)
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }

            validateProgram(program, userProfile)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, programNodeType)
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }
            if (program.payload[programPropertyName].isActive === false) { continue }

            distributeProgram(program)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, programNodeType)
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }
            if (program.payload[programPropertyName].isActive === false) { continue }

            calculateProgram(program)
        }

        function resetProgram(node) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }
            if (node.payload[programPropertyName] === undefined) {
                node.payload[programPropertyName] = {
                    bonusPower: 0,
                    bonus: {
                        tokens: 0,
                        percentage: 0
                    }
                }
            } else {
                node.payload[programPropertyName].bonusPower = 0
                node.payload[programPropertyName].bonus = {
                    tokens: 0,
                    percentage: 0
                }
            }
        }

        function validateProgram(node, userProfile) {
            /*
            This program is not going to run unless the Profile has Tokens, and for 
            that users needs to execute the setup procedure of signing their Github
            username with their private key.
            */
            if (
                userProfile.payload.blockchainTokens === undefined
            ) {
                node.payload[programPropertyName].isActive = false
                userProfile.payload.uiObject.setErrorMessage(
                    "Waiting for blockchain balance. It takes 1 minute to load the balance of each profile, because you are using a free API provided by BSC Scan.",
                    UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                    )
                return
            } else {
                userProfile.payload.uiObject.resetErrorMessage()
            }
        }

        function distributeProgram(programNode) {
            if (programNode === undefined || programNode.payload === undefined) { return }
            /*
            To get into the Bonus Sub-Program we will use the usedPower previously calculated by the Program.
            That means that only token power effectively used at the program (not just directed to it) will
            be used to compute Bonuses.
            */
            programNode.payload[programPropertyName].bonusPower = programNode.payload[programPropertyName].usedPower | 0
            accumulatedProgramPower = accumulatedProgramPower + programNode.payload[programPropertyName].bonusPower
        }

        function calculateProgram(programNode) {
            /*
            Here we will calculate which share of the Program Pool this user will get in tokens.
            To do that, we use the bonusPower, to see which proportion of the accumulatedProgramPower
            represents.
            */
            if (programNode.payload === undefined) { return }
            /*
            If the accumulatedProgramPower is not grater the amount of tokens at the Program Pool, then
            this user will get the exact amount of tokens from the pool as incomingPower he has. 
    
            If the accumulatedProgramPower is  grater the amount of tokens at the Program Pool, then
            the amount ot tokens to be received is a proportional to the share of incomingPower in accumulatedProgramPower.
            */
            let totalPowerRewardRatio = accumulatedProgramPower / programPoolTokenReward
            if (totalPowerRewardRatio < 1) { totalPowerRewardRatio = 1 }

            if (programNode.tokensBonus === undefined || programNode.tokensBonus.payload === undefined) {
                programNode.payload.uiObject.setErrorMessage(
                    "Tokens Bonus Node is needed in order for this Program to get Tokens from the Bonus Program Pool.",
                    UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                    )
                return
            }
            programNode.payload[programPropertyName].bonus.tokens = programNode.payload[programPropertyName].bonusPower / totalPowerRewardRatio

            drawProgram(programNode)
        }

        function drawProgram(node) {
            if (node.tokensBonus !== undefined && node.tokensBonus.payload !== undefined) {

                const tokensBonusText = parseFloat(node.payload[programPropertyName].bonus.tokens.toFixed(0)).toLocaleString('en')
                const tokensAwardedBTC = ' ≃ ' + UI.projects.governance.utilities.conversions.estimateSATokensInBTC(node.payload[programPropertyName].bonus.tokens | 0) + '  BTC'

                node.tokensBonus.payload.uiObject.valueAngleOffset = 0
                node.tokensBonus.payload.uiObject.valueAtAngle = true

                node.tokensBonus.payload.uiObject.setValue(tokensBonusText + ' SA Tokens' + tokensAwardedBTC, UI.projects.governance.globals.designer.SET_VALUE_COUNTER)
            }
        }
    }
}