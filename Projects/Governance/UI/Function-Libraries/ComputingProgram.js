function newGovernanceFunctionLibraryComputingProgram() {
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
        we need to accumulate all the Program Power that each User Profile at their Program
        node has, because with that Power is that each Program node gets a share of the pool.
         */
        let accumulatedProgramPower = 0

        /* Scan Pools Until finding the Pool for this program*/
        for (let i = 0; i < pools.length; i++) {
            let poolsNode = pools[i]
            programPoolTokenReward = UI.projects.governance.utilities.pools.findPool(poolsNode, "Computing-Rewards")
            if (programPoolTokenReward !== undefined) { break }
        }
        if (programPoolTokenReward === undefined || programPoolTokenReward === 0) { return }

        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Computing Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }

            resetProgram(program)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Computing Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }

            validateProgram(program, userProfile)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Computing Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }
            if (program.payload.computingProgram.isActive === false) { continue }

            distributeProgram(program, userProfile)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Computing Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }
            if (program.payload.computingProgram.isActive === false) { continue }

            calculateProgram(program)
        }

        function resetProgram(node) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }
            if (node.payload.computingProgram === undefined) {
                node.payload.computingProgram = {
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
                node.payload.computingProgram.count = 0
                node.payload.computingProgram.percentage = 0
                node.payload.computingProgram.outgoingPower = 0
                node.payload.computingProgram.ownPower = 0
                node.payload.computingProgram.incomingPower = 0
                node.payload.computingProgram.awarded = {
                    tokens: 0,
                    percentage: 0
                }
            }
        }

        function validateProgram(node, userProfile) {
            /*
            This program is not going to run unless the Profile has data on executed test cases, and for 
            that users needs to execute the setup procedure of signing their Github
            username with their private key.
            */
            if (
                UI.projects.governance.spaces.userProfileSpace.executedTestCases === undefined
            ) {
                node.payload.computingProgram.isActive = false
                userProfile.payload.uiObject.setErrorMessage(
                    "Waiting for Bitcoin Factory data on executed test cases.",
                    UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                )
                return
            } else {
                userProfile.payload.uiObject.resetErrorMessage()
                node.payload.computingProgram.isActive = true
            }
        }

        function distributeProgram(programNode, userProfile) {
            if (programNode === undefined || programNode.payload === undefined) { return }
            /*
            Here we will convert the executed test case count into program power. 
            */
            let programPower = 0
            if (UI.projects.governance.spaces.userProfileSpace.executedTestCases.has(userProfile.name) === true) {
                programPower = UI.projects.governance.spaces.userProfileSpace.executedTestCases.get(userProfile.name)
            }
            programNode.payload.computingProgram.ownPower = programPower
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
            if (accumulatedProgramPower > 0) {
                programNode.payload.computingProgram.awarded.percentage = programNode.payload.computingProgram.ownPower * 100 / accumulatedProgramPower
            } else {
                programNode.payload.computingProgram.awarded.percentage = 0
            }
            programNode.payload.computingProgram.awarded.tokens = programPoolTokenReward * programNode.payload.computingProgram.awarded.percentage / 100

            drawProgram(programNode)
        }

        function drawProgram(node) {
            if (node.payload !== undefined && node.payload.computingProgram.ownPower !== undefined) {

                const ownPowerText = parseFloat(node.payload.computingProgram.ownPower.toFixed(2)).toLocaleString('en')
                const percentageText = parseFloat(node.payload.computingProgram.awarded.percentage.toFixed(2)).toLocaleString('en')

                node.payload.uiObject.statusAngleOffset = 0
                node.payload.uiObject.statusAtAngle = false

                node.payload.uiObject.setStatus(ownPowerText + ' Executed Test Cases' + ' - ' + percentageText + ' % Pool ', UI.projects.governance.globals.designer.SET_STATUS_COUNTER)
            }
            if (node.tokensAwarded !== undefined && node.tokensAwarded.payload !== undefined) {

                const tokensAwardedText = parseFloat(node.payload.computingProgram.awarded.tokens.toFixed(0)).toLocaleString('en')
                const tokensAwardedBTC = ' ≃ ' + UI.projects.governance.utilities.conversions.estimateSATokensInBTC(node.payload.computingProgram.awarded.tokens | 0) + '  BTC'

                node.tokensAwarded.payload.uiObject.valueAngleOffset = 0
                node.tokensAwarded.payload.uiObject.valueAtAngle = false

                node.tokensAwarded.payload.uiObject.setValue(tokensAwardedText + ' SA Tokens' + tokensAwardedBTC, UI.projects.governance.globals.designer.SET_VALUE_COUNTER)
            }
        }
    }
}

exports.newGovernanceFunctionLibraryComputingProgram = newGovernanceFunctionLibraryComputingProgram