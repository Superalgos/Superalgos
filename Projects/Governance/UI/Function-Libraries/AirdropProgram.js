function newGovernanceFunctionLibraryAirdropProgram() {
    let thisObject = {
        calculate: calculate
    }

    return thisObject

    function calculate(
        pools,
        userProfiles
    ) {
        let programPoolTokenReward
        /*
        In order to be able to calculate the share of the Program Pool for each User Profile,
        we need to accumulate all the Airdrop Power that each User Profile at their Program
        node has, because with that Power is that each Program node gets a share of the pool.
         */
        let accumulatedProgramPower = 0

        /* Scan Pools Until finding the Pool for this program*/
        for (let i = 0; i < pools.length; i++) {
            let poolsNode = pools[i]
            programPoolTokenReward = UI.projects.governance.utilities.pools.findPool(poolsNode, "Airdrop-Rewards")
            if (programPoolTokenReward !== undefined) { break }
        }
        if (programPoolTokenReward === undefined || programPoolTokenReward === 0) { return }

        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Airdrop Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }

            resetProgram(program)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Airdrop Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }

            validateProgram(program, userProfile)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Airdrop Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }
            if (program.payload.airdropProgram.isActive === false) { continue }

            distributeProgram(program)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Airdrop Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }
            if (program.payload.airdropProgram.isActive === false) { continue }

            calculateProgram(program)
        }

        function resetProgram(node) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }
            if (node.payload.airdropProgram === undefined) {
                node.payload.airdropProgram = {
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
                node.payload.airdropProgram.count = 0
                node.payload.airdropProgram.percentage = 0
                node.payload.airdropProgram.outgoingPower = 0
                node.payload.airdropProgram.ownPower = 0
                node.payload.airdropProgram.incomingPower = 0
                node.payload.airdropProgram.awarded = {
                    tokens: 0,
                    percentage: 0
                }
            }
        }

        function validateProgram(node, userProfile) {
            /*
            This program is not going to run unless the Profile has Tokens, and for 
            that users needs to execute the setup procedure of signing their Airdrop
            username with their private key.
            */
            if (
                userProfile.payload.blockchainTokens === undefined
            ) {
                node.payload.airdropProgram.isActive = false
                userProfile.payload.uiObject.setErrorMessage(
                    "Waiting for blockchain balance. It takes 1 minute to load the balance of each profile, because you are using a free API provided by BSC Scan.",
                    UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                    )
                return
            } else {
                userProfile.payload.uiObject.resetErrorMessage()
            }
            /*
            Next thing to do is to validate if the airdrop user profile has a star at the Superalgos repository. 
            */
            let profileSignature = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(userProfile.payload, 'signature')
            if (
                profileSignature === undefined
            ) {
                node.payload.airdropProgram.isActive = false
                userProfile.payload.uiObject.setErrorMessage(
                    "You need to setup this profile with the Profile Constructor, and produce a signature of your Airdrop Username.",
                    UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                    )
                return
            }

            node.payload.airdropProgram.isActive = true
        }

        function distributeProgram(programNode) {
            if (programNode === undefined || programNode.payload === undefined) { return }
            /*
            Here we will convert Token Power into Airdrop Power. 
            As per system rules Airdrop Power = 1000 SA Tokens.
            */
            let programPower = 1000
            programNode.payload.airdropProgram.ownPower = programPower

            accumulatedProgramPower = accumulatedProgramPower + programPower
        }

        function calculateProgram(programNode) {
            /*
            Here we will calculate which share of the Program Pool this user will get in tokens.
            To do that, we use the ownPower, to see which proportion of the accumulatedProgramPower
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

            if (programNode.tokensAwarded === undefined || programNode.tokensAwarded.payload === undefined) {
                programNode.payload.uiObject.setErrorMessage(
                    "Tokens Awarded Node is needed in order for this Program to get Tokens from the Program Pool.",
                    UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                    )
                return
            }
            programNode.payload.airdropProgram.awarded.tokens = programNode.payload.airdropProgram.ownPower / totalPowerRewardRatio 

            drawProgram(programNode)
        }

        function drawProgram(node) {
            if (node.payload !== undefined) {

                const ownPowerText = parseFloat(node.payload.airdropProgram.ownPower.toFixed(0)).toLocaleString('en')

                node.payload.uiObject.statusAngleOffset = 0
                node.payload.uiObject.statusAtAngle = false

                node.payload.uiObject.setStatus(ownPowerText + ' Airdrop Power', UI.projects.governance.globals.designer.SET_STATUS_COUNTER)
            }
            if (node.tokensAwarded !== undefined && node.tokensAwarded.payload !== undefined) {

                const tokensAwardedText = parseFloat(node.payload.airdropProgram.awarded.tokens.toFixed(0)).toLocaleString('en')
                const tokensAwardedBTC = ' ≃ ' + UI.projects.governance.utilities.conversions.estimateSATokensInBTC(node.payload.airdropProgram.awarded.tokens | 0) + '  BTC'

                node.tokensAwarded.payload.uiObject.valueAngleOffset = 0
                node.tokensAwarded.payload.uiObject.valueAtAngle = false

                node.tokensAwarded.payload.uiObject.setValue(tokensAwardedText + ' SA Tokens' + tokensAwardedBTC, UI.projects.governance.globals.designer.SET_VALUE_COUNTER)

                node.tokensAwarded.payload.uiObject.statusAngleOffset = 0
                node.tokensAwarded.payload.uiObject.statusAtAngle = false

                node.tokensAwarded.payload.uiObject.setStatus('For creating your Superalgos profile!', UI.projects.governance.globals.designer.SET_STATUS_COUNTER)
            }
        }
    }
}