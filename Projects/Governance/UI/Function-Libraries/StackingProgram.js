function newGovernanceFunctionLibraryStackingProgram() {
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
        we need to accumulate all the Stacking Power that each User Profile at their Program
        node has, because with that Power is that each Program node gets a share of the pool.
         */
        let accumulatedProgramPower = 0

        /* Scan Pools Until finding the Mentoship-Program Pool */
        for (let i = 0; i < pools.length; i++) {
            let poolsNode = pools[i]
            programPoolTokenReward = UI.projects.governance.utilities.pools.findPool(poolsNode, "Staking-Rewards")
        }
        if (programPoolTokenReward === undefined || programPoolTokenReward === 0) { return }

        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            if (userProfile.tokenPowerSwitch.stackingProgram === undefined) { continue }
            if (userProfile.tokenPowerSwitch.stackingProgram.payload === undefined) { continue }

            resetProgram(userProfile.tokenPowerSwitch.stackingProgram)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            if (userProfile.tokenPowerSwitch.stackingProgram === undefined) { continue }
            if (userProfile.tokenPowerSwitch.stackingProgram.payload === undefined) { continue }

            validateProgram(userProfile.tokenPowerSwitch.stackingProgram)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            if (userProfile.tokenPowerSwitch.stackingProgram === undefined) { continue }
            if (userProfile.tokenPowerSwitch.stackingProgram.payload === undefined) { continue }
            if (userProfile.tokenPowerSwitch.stackingProgram.payload.stackingProgram.isActive === false) { continue }

            distributeProgram(userProfile.tokenPowerSwitch.stackingProgram)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            if (userProfile.tokenPowerSwitch.stackingProgram === undefined) { continue }
            if (userProfile.tokenPowerSwitch.stackingProgram.payload === undefined) { continue }
            if (userProfile.tokenPowerSwitch.stackingProgram.payload.stackingProgram.isActive === false) { continue }

            calculateProgram(userProfile.tokenPowerSwitch.stackingProgram)
        }

        function resetProgram(node) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }
            node.payload.stackingProgram = {
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
        }

        function validateProgram(node) {
            /*
            This program is not going to run unless the Profile has Tokens, and for 
            that users needs to execute the setup procedure of signing their Github
            username with their private key.
            */
            if (
                node.payload.parentNode.payload.parentNode.payload.blockchainTokens === undefined
            ) {
                node.payload.stackingProgram.isActive = false
                node.payload.parentNode.payload.parentNode.payload.uiObject.setErrorMessage("You need to setup this profile with the Profile Constructor, to access the Token Power of your account at the Blockchain.")
                return
            }
            node.payload.stackingProgram.isActive = true
        }

        function distributeProgram(programNode) {
            if (programNode === undefined || programNode.payload === undefined) { return }
            /*
            Here we will convert Token Power into Stacking Power. 
            As per system rules Stacking Powar = tokensPower
            */
            let programPower = programNode.payload.tokenPower
            programNode.payload.stackingProgram.ownPower = programPower

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
                programNode.payload.uiObject.setErrorMessage("Tokens Awarded Node is needed in order for this Program to get Tokens from the Program Pool.")
                return
            }
            programNode.payload.stackingProgram.awarded.tokens = programNode.payload.stackingProgram.ownPower * totalPowerRewardRatio

            drawProgram(programNode)
        }

        function drawProgram(node) {
            if (node.payload !== undefined) {

                const ownPowerText = parseFloat(node.payload.stackingProgram.ownPower.toFixed(2)).toLocaleString('en')

                node.payload.uiObject.statusAngleOffset = 0
                node.payload.uiObject.statusAtAngle = false

                node.payload.uiObject.setStatus(ownPowerText + ' Staking Power')
            }
            if (node.tokensAwarded !== undefined && node.tokensAwarded.payload !== undefined) {

                const tokensAwardedText = parseFloat(node.payload.stackingProgram.awarded.tokens.toFixed(2)).toLocaleString('en')

                node.tokensAwarded.payload.uiObject.valueAngleOffset = 0
                node.tokensAwarded.payload.uiObject.valueAtAngle = false

                node.tokensAwarded.payload.uiObject.setValue(tokensAwardedText + ' SA Tokens')
            }
        }
    }
}