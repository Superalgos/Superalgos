function newGovernanceUtilitiesDecendentProgram() {
    /*
    This Utility Module is intended to be used by all programs that have the 
    concept of Descendants, and when the program requires to compute recursively
    all descendants.
    */
    let thisObject = {
        run: run
    }
    const MAX_GENERATIONS = 3

    return thisObject

    function run(
        pools,
        userProfiles,
        programPropertyName,
        programCodeName,
        programNodeType,
        programPowerName,
        usersArrayPropertyName,
        userNodeType
    ) {
        /*
        Here we will store the total amount of tokens that is going to be distributed among all participants
        of the Program. This will come from a Pool that is configured with a codeName config property
        with the value programCodeName
        */
        let programPoolTokenReward
        /*
        In order to be able to calculate the share of the Program Pool for each User Profile,
        we need to accumulate all the Incoming programPowerName that each User Profile at their Program
        node has, because with that Incoming Power is that each Program node gets a share of 
        the pool.
         */
        let accumulatedIncomingProgramPower = 0

        /* Scan Pools Until finding the Pool for this program*/
        for (let i = 0; i < pools.length; i++) {
            let poolsNode = pools[i]
            programPoolTokenReward = UI.projects.governance.utilities.pools.findPool(poolsNode, programCodeName)
            if (programPoolTokenReward !== undefined) { break }
        }
        if (programPoolTokenReward === undefined || programPoolTokenReward === 0) { return }
        /*
        We will first reset all the program outgoingPower, and then distribute it.
        */
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
            resetNode(node, 0)

            function resetNode(node, generation) {

                if (generation >= MAX_GENERATIONS) {
                    return
                }

                if (node === undefined) { return }
                if (node.payload === undefined) { return }
                if (node.payload[programPropertyName] === undefined) {
                    node.payload[programPropertyName] = {
                        count: 0,
                        percentage: 0,
                        outgoingPower: 0,
                        ownPower: 0,
                        incomingPower: 0,
                        usedPower: 0,
                        awarded: {
                            tokens: 0,
                            percentage: 0
                        }
                    }
                } else {
                    node.payload[programPropertyName].count = 0
                    node.payload[programPropertyName].percentage = 0
                    node.payload[programPropertyName].outgoingPower = 0
                    node.payload[programPropertyName].ownPower = 0
                    node.payload[programPropertyName].incomingPower = 0
                    node.payload[programPropertyName].usedPower = 0
                    node.payload[programPropertyName].awarded = {
                        tokens: 0,
                        percentage: 0
                    }
                }
                if (
                    node.type === 'User Profile' &&
                    node.tokenPowerSwitch !== undefined
                ) {
                    resetNode(node.tokenPowerSwitch, generation)
                    return
                }
                if (
                    node.type === 'Token Power Switch' &&
                    node[programPropertyName] !== undefined
                ) {
                    resetNode(node[programPropertyName], generation)
                    return
                }
                if (
                    node.type === programNodeType &&
                    node[usersArrayPropertyName] !== undefined
                ) {
                    for (let i = 0; i < node[usersArrayPropertyName].length; i++) {
                        resetNode(node[usersArrayPropertyName][i], generation)
                    }
                    return
                }
                if (
                    node.type === userNodeType &&
                    node.payload.referenceParent !== undefined
                ) {
                    resetNode(node.payload.referenceParent, generation + 1)
                    return
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
            /*
            As per the system rules, the Program will not give tokens 
            to users that do not have their own user nodes set up, unless it has a big 
            amount of tokens (this last condition is for the edge case where a user it 
            at the top of the program pyramid.)        
            */
            if (
                userProfile.payload.blockchainTokens < 1000000 &&
                (node[usersArrayPropertyName] === undefined || hasUsersDefined(node[usersArrayPropertyName]) === false)
            ) {
                node.payload[programPropertyName].isActive = false
                node.payload.uiObject.setErrorMessage(
                    "In order to enable this program you need to add " + userNodeType + " nodes and reference a User Profile from each one.",
                    UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                    )
            } else {
                node.payload[programPropertyName].isActive = true
            }
            function hasUsersDefined(usersArray) {
                if (usersArray === undefined) { return false }
                for (let i = 0; i < usersArray.length; i++) {
                    let user = usersArray[i]
                    if (user.payload.referenceParent !== undefined) { return true }
                }
                return false
            }
        }

        function distributeProgram(programNode) {

            if (programNode === undefined || programNode.payload === undefined) { return }
            /*
            Here we will convert Token Power into programPower. 
            As per system rules programPower = tokensPower
            */
            let programPower = programNode.payload.tokenPower
            /*
            We will also reset the count of descendents from here.
            */
            let count = 0
            /*
            The Own Power is the power generated by the same User Profile tokens, not inherited from others.
            */
            programNode.payload[programPropertyName].ownPower = programPower

            distributeProgramPower(programNode, programNode, programPower, count, undefined, 0)

            function distributeProgramPower(
                currentProgramNode,
                node,
                programPower,
                count,
                percentage,
                generation
            ) {
                if (generation >= MAX_GENERATIONS) {
                    return
                }
                if (node === undefined) { return }
                if (node.payload === undefined) { return }
                if (node.payload[programPropertyName] === undefined) { return }

                switch (node.type) {
                    case programNodeType: {
                        /*
                        This is the point where we increase to our local count of descendents whatever it comes
                        at the count parameters. If we are processing the User Profile of this Program
                        then we will add zero, otherwise, 1.
                        */
                        node.payload[programPropertyName].count = node.payload[programPropertyName].count + count
                        /*
                        The outgoingPower of this node will be accumulating all the programPower flowing
                        through it, no matter from where it comes. 
                        */
                        node.payload[programPropertyName].outgoingPower = node.payload[programPropertyName].outgoingPower + programPower
                        /*
                        We need to adjust the balance that holds the accumulation of all incomingPower of all Program
                        nodes. To do this we will subtract the current incomingPower, because it is going to be recalculated
                        immediately after this, and then we will add it again after the recalculation.
                        */
                        accumulatedIncomingProgramPower = accumulatedIncomingProgramPower - node.payload[programPropertyName].incomingPower
                        /*
                        At any point in time, the incomingPower will be equal to the total of the outgoingPower minus
                        the ownPower. This is like this because the outgoingPower is the accumulation of all the 
                        power flow that is leaving this node, which includes the ownPower. That means that if we 
                        subtract the ownPower, we will have the accumulation of all the incomingPower, which
                        means all the power coming from other User Profiles referencing this one.
                        */
                        node.payload[programPropertyName].incomingPower = node.payload[programPropertyName].outgoingPower - node.payload[programPropertyName].ownPower
                        /*
                        Now that we have the incomingPower calculated again, we can add it again to the balance of all the incomingPower
                        of all Program nodes.
                        */
                        accumulatedIncomingProgramPower = accumulatedIncomingProgramPower + node.payload[programPropertyName].incomingPower

                        if (node[usersArrayPropertyName] !== undefined) {
                            /*
                            Before distributing the program power, we will calculate how the power 
                            is going to be switched between all nodes. The first pass is about
                            scanning all sibling nodes to see which ones have a percentage defined
                            at their config, and check that all percentages don't add more than 100.
                            */
                            let totalPercentage = 0
                            let totalNodesWithoutPercentage = 0
                            for (let i = 0; i < node[usersArrayPropertyName].length; i++) {
                                let childNode = node[usersArrayPropertyName][i]
                                let percentage = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(childNode.payload, 'percentage')
                                if (percentage !== undefined && isNaN(percentage) !== true && percentage >= 0) {
                                    totalPercentage = totalPercentage + percentage
                                } else {
                                    totalNodesWithoutPercentage++
                                }
                            }
                            if (totalPercentage > 100) {
                                node.payload.uiObject.setErrorMessage(
                                    'Program Power Switching Error. Total Percentage of children nodes is grater that 100.',
                                    UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                                    )
                                return
                            }
                            let defaultPercentage = 0
                            if (totalNodesWithoutPercentage > 0) {
                                defaultPercentage = (100 - totalPercentage) / totalNodesWithoutPercentage
                            }
                            /*
                            Here we do the actual distribution.
                            */
                            for (let i = 0; i < node[usersArrayPropertyName].length; i++) {
                                let childNode = node[usersArrayPropertyName][i]
                                let percentage = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(childNode.payload, 'percentage')
                                if (percentage === undefined || isNaN(percentage)  || percentage < 0 === true) {
                                    percentage = defaultPercentage
                                }
                                distributeProgramPower(
                                    currentProgramNode, 
                                    childNode, 
                                    programPower * percentage / 100, 
                                    0, 
                                    percentage, 
                                    generation
                                    )
                            }
                        }
                        return
                    }
                    case userNodeType: {
                        let previousOutgoing = node.payload[programPropertyName].outgoingPower
                        node.payload[programPropertyName].outgoingPower = node.payload.parentNode.payload[programPropertyName].outgoingPower * percentage / 100

                        drawUserNode(node, percentage)
                        if (node.payload.referenceParent !== undefined) {
                            /*
                            We want to accumulate the usedPower, but to keep the right balance, everytime we add to it the outgoingPower
                            we need to subtract the previous one, since this might be executed at every user profile and also recursively.
                            */
                            currentProgramNode.payload[programPropertyName].usedPower = currentProgramNode.payload[programPropertyName].usedPower - previousOutgoing
                            currentProgramNode.payload[programPropertyName].usedPower = currentProgramNode.payload[programPropertyName].usedPower + node.payload[programPropertyName].outgoingPower

                            distributeProgramPower(
                                currentProgramNode, 
                                node.payload.referenceParent, 
                                programPower / 10, 
                                0, 
                                undefined,
                                generation + 1
                                )
                        }
                        return
                    }
                    case 'User Profile': {
                        let program = UI.projects.governance.utilities.validations.onlyOneProgram(node, programNodeType)
                        if (program === undefined) { return }
                        if (program.payload === undefined) { return }
                        if (program.payload[programPropertyName].isActive === false) { return }

                        distributeProgramPower(
                            program, 
                            program, 
                            programPower, 
                            0, 
                            undefined,
                            generation)
                        return
                    }
                }
            }
        }

        function calculateProgram(programNode) {
            /*
            Here we will calculate which share of the Program Pool this user will get in tokens.
            To do that, we use the incomingPower, to see which proportion of the accumulatedIncomingProgramPower
            represents.
            */
            if (programNode.payload === undefined) { return }
            /*
            If the accumulatedIncomingProgramPower is not grater the amount of tokens at the Program Pool, then
            this user will get the exact amount of tokens from the pool as incomingPower he has. 

            If the accumulatedIncomingProgramPower is  grater the amount of tokens at the Program Pool, then
            the amount ot tokens to be received is a proportional to the share of incomingPower in accumulatedIncomingProgramPower.
            */
            let totalPowerRewardRatio = accumulatedIncomingProgramPower / programPoolTokenReward
            if (totalPowerRewardRatio < 1) { totalPowerRewardRatio = 1 }

            if (programNode.tokensAwarded === undefined || programNode.tokensAwarded.payload === undefined) {
                programNode.payload.uiObject.setErrorMessage(
                    "Tokens Awarded Node is needed in order for this Program to get Tokens from the Program Pool.",
                    UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                    )
                return
            }
            programNode.payload[programPropertyName].awarded.tokens = programNode.payload[programPropertyName].incomingPower / totalPowerRewardRatio

            drawProgram(programNode)
        }

        function drawUserNode(node, percentage) {
            if (node.payload !== undefined) {

                const outgoingPowerText = parseFloat(node.payload[programPropertyName].outgoingPower.toFixed(0)).toLocaleString('en')

                node.payload.uiObject.valueAngleOffset = 180
                node.payload.uiObject.valueAtAngle = true

                node.payload.uiObject.setValue(outgoingPowerText + ' ' + programPowerName, UI.projects.governance.globals.designer.SET_VALUE_COUNTER)

                node.payload.uiObject.percentageAngleOffset = 180
                node.payload.uiObject.percentageAtAngle = true

                node.payload.uiObject.setPercentage(percentage,
                    UI.projects.governance.globals.designer.SET_PERCENTAGE_COUNTER
                    )

                node.payload.uiObject.statusAngleOffset = 0
                node.payload.uiObject.statusAtAngle = true

                node.payload.uiObject.setStatus(outgoingPowerText + ' ' + ' Outgoing Power', UI.projects.governance.globals.designer.SET_STATUS_COUNTER)
            }
        }

        function drawProgram(node) {
            if (node.payload !== undefined) {

                const ownPowerText = parseFloat(node.payload[programPropertyName].ownPower.toFixed(0)).toLocaleString('en')
                const incomingPowerText = parseFloat(node.payload[programPropertyName].incomingPower.toFixed(0)).toLocaleString('en')

                node.payload.uiObject.statusAngleOffset = 0
                node.payload.uiObject.statusAtAngle = false

                node.payload.uiObject.setStatus(ownPowerText + ' Own Power' + ' + ' + incomingPowerText + ' Incoming ' + programPowerName, UI.projects.governance.globals.designer.SET_STATUS_COUNTER)
            }
            if (node.tokensAwarded !== undefined && node.tokensAwarded.payload !== undefined) {

                const tokensAwardedText = parseFloat(node.payload[programPropertyName].awarded.tokens.toFixed(0)).toLocaleString('en')
                const tokensAwardedBTC = ' ≃ ' + UI.projects.governance.utilities.conversions.estimateSATokensInBTC(node.payload[programPropertyName].awarded.tokens | 0) + '  BTC'

                node.tokensAwarded.payload.uiObject.statusAngleOffset = 0
                node.tokensAwarded.payload.uiObject.statusAtAngle = true
                node.tokensAwarded.payload.uiObject.valueAngleOffset = 0
                node.tokensAwarded.payload.uiObject.valueAtAngle = true

                node.tokensAwarded.payload.uiObject.setValue(tokensAwardedText + ' SA Tokens' + tokensAwardedBTC, UI.projects.governance.globals.designer.SET_VALUE_COUNTER)
                node.tokensAwarded.payload.uiObject.setStatus('From ' + node.payload[programPropertyName].count + ' Descendants.', UI.projects.governance.globals.designer.SET_STATUS_COUNTER)
            }
        }
    }
}