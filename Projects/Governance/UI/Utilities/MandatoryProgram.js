function newFoundationsUtilitiesMandatoryProgram() {
    let thisObject = {
        run: run
    }

    return thisObject

    function run(
        pools,
        userProfiles,
        programPropertyName,
        programName,
        programNodeType,
        programPowerName,
        usersArrayPropertyName,
        userNodeType
    ) {
        /*
        Here we will store the total amount of tokens that is going to be distributed among all participants
        of the Program. This will come from a Pool that is configured wiht a codeName config property
        with the value programName
        */
        let programPoolTokenReward
        /*
        In order to be able to calculate the share of the Program Pool for each User Profile,
        we need to accumulate all the Icomming programPowerName that each User Profile at their Program
        node has, because with that Incoming Power is that each Program node gets a share of 
        the pool.
         */
        let accumulatedIncomingProgramPower = 0

        /* Scan Pools Until finding the Mentoship-Program Pool */
        for (let i = 0; i < pools.length; i++) {
            let poolsNode = pools[i]
            programPoolTokenReward = UI.projects.governance.utilities.pools.findPool(poolsNode, programName)
        }
        if (programPoolTokenReward === undefined || programPoolTokenReward === 0) { return }
        /*
        We will first reset all the program outgoingPower, and then distribute it.
        */
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            if (userProfile.tokenPowerSwitch[programPropertyName] === undefined) { continue }
            if (userProfile.tokenPowerSwitch[programPropertyName].payload === undefined) { continue }

            resetProgram(userProfile.tokenPowerSwitch[programPropertyName])
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            if (userProfile.tokenPowerSwitch[programPropertyName] === undefined) { continue }
            if (userProfile.tokenPowerSwitch[programPropertyName].payload === undefined) { continue }

            validateProgram(userProfile.tokenPowerSwitch[programPropertyName])
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            if (userProfile.tokenPowerSwitch[programPropertyName] === undefined) { continue }
            if (userProfile.tokenPowerSwitch[programPropertyName].payload === undefined) { continue }
            if (userProfile.tokenPowerSwitch[programPropertyName].payload[programPropertyName].isActive === false) { continue }

            distributeProgram(userProfile.tokenPowerSwitch[programPropertyName])
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            if (userProfile.tokenPowerSwitch[programPropertyName] === undefined) { continue }
            if (userProfile.tokenPowerSwitch[programPropertyName].payload === undefined) { continue }
            if (userProfile.tokenPowerSwitch[programPropertyName].payload[programPropertyName].isActive === false) { continue }

            calculateProgram(userProfile.tokenPowerSwitch[programPropertyName])
        }

        function resetProgram(node) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }
            node.payload[programPropertyName] = {
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
            if (
                node.type === 'User Profile' &&
                node.tokenPowerSwitch !== undefined
            ) {
                resetProgram(node.tokenPowerSwitch)
                return
            }
            if (
                node.type === 'Token Power Switch' &&
                node[programPropertyName] !== undefined
            ) {
                resetProgram(node[programPropertyName])
                return
            }
            if (
                node.type === programNodeType &&
                node[usersArrayPropertyName] !== undefined
            ) {
                for (let i = 0; i < node[usersArrayPropertyName].length; i++) {
                    resetProgram(node[usersArrayPropertyName][i])
                }
                return
            }
            if (
                node.type === userNodeType &&
                node.payload.referenceParent !== undefined
            ) {
                resetProgram(node.payload.referenceParent)
                return
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
                node.payload[programPropertyName].isActive = false
                node.payload.parentNode.payload.parentNode.payload.uiObject.setErrorMessage("You need to setup this profile with the Profile Constructor, to access the Token Power of your account at the Blockchain.")
                return
            }
            /*
            As per the system rules, the Program will not give tokens 
            to users that do not have their own user nodes set up, unless it has a big 
            amount of tokens (this last condition is for the edge case where a user it 
            at the top of the program pyramid.)        
            */
            if (
                node.payload.parentNode.payload.parentNode.payload.blockchainTokens < 1000000 &&
                (node[usersArrayPropertyName] === undefined || hasUsersDefined(node[usersArrayPropertyName]) === false)
            ) {
                node.payload[programPropertyName].isActive = false
                node.payload.uiObject.setErrorMessage("In order to enable this program you need to add " + userNodeType + " nodes and reference a User Profile from each one.")
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
            Here we will convert Token Power into programPowerName. 
            As per system rules mentoshipPower = tokensPower
            */
            let mentoshipPower = programNode.payload.tokenPower
            /*
            We will also reseet the count of descendents from here.
            */
            let count = 0
            /*
            The Own Power is the power generated by the same User Profile tokens, not inherited from others.
            */
            programNode.payload[programPropertyName].ownPower = mentoshipPower

            distributeProgramPower(programNode, mentoshipPower, count)
        }

        function distributeProgramPower(
            node,
            mentoshipPower,
            count,
            percentage
        ) {
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
                    The outgoingPower of this node will be accumulating all the mentoshipPower flowing
                    through it, no matter from where it comes. 
                    */
                    node.payload[programPropertyName].outgoingPower = node.payload[programPropertyName].outgoingPower + mentoshipPower
                    /*
                    We need to adjust the balance that holds the accumulationt of all incomingPower of all Program
                    nodes. To do this we will substratct the current incomingPower, bacause it is going to be recalculated
                    inmediatelly after this, and then we will add it again after the recalcualtion.
                    */
                    accumulatedIncomingProgramPower = accumulatedIncomingProgramPower - node.payload[programPropertyName].incomingPower
                    /*
                    At any point in time, the incomingPower will be equal to the total of the outgoingPower minus
                    the ownPower. This is like this because the outgoingPower is the accumulation of all the 
                    power flow that is leaving this node, which includes the ownPower. That means that if we 
                    substract the ownPower, we will have the accumulation of all the incomingPower, which 
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
                            let percentage = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(childNode.payload, 'percentage')
                            if (percentage !== undefined && isNaN(percentage) !== true) {
                                totalPercentage = totalPercentage + percentage
                            } else {
                                totalNodesWithoutPercentage++
                            }
                        }
                        if (totalPercentage > 100) {
                            node.payload.uiObject.setErrorMessage('Program Power Switching Error. Total Percentage of children nodes is grater that 100.')
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
                            let percentage = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(childNode.payload, 'percentage')
                            if (percentage === undefined || isNaN(percentage) === true) {
                                percentage = defaultPercentage
                            }
                            distributeProgramPower(childNode, mentoshipPower * percentage / 100, 0, percentage)
                        }
                    }
                    break
                }
                case userNodeType: {
                    node.payload[programPropertyName].outgoingPower = node.payload.parentNode.payload[programPropertyName].outgoingPower * percentage / 100

                    drawUserNode(node, percentage)
                    if (node.payload.referenceParent !== undefined) {
                        distributeProgramPower(node.payload.referenceParent, mentoshipPower / 10, 0)
                    }
                    break
                }
                case 'User Profile': {
                    if (node.tokenPowerSwitch !== undefined) {
                        distributeProgramPower(node.tokenPowerSwitch, mentoshipPower, 0)
                    }
                    break
                }
                case 'Token Power Switch': {
                    if (node[programPropertyName] !== undefined) {
                        distributeProgramPower(node[programPropertyName], mentoshipPower, 1)
                    }
                    break
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
                programNode.payload.uiObject.setErrorMessage("Tokens Awarded Node is needed in order for this Program to get Tokens from the Program Pool.")
                return
            }
            programNode.payload[programPropertyName].awarded.tokens = programNode.payload[programPropertyName].incomingPower * totalPowerRewardRatio

            drawProgram(programNode)
        }

        function drawUserNode(node, percentage) {
            if (node.payload !== undefined) {

                const outgoingPowerText = new Intl.NumberFormat().format(node.payload[programPropertyName].outgoingPower)

                node.payload.uiObject.valueAngleOffset = 180
                node.payload.uiObject.valueAtAngle = true

                node.payload.uiObject.setValue(outgoingPowerText + ' ' + programPowerName)

                node.payload.uiObject.percentageAngleOffset = 180
                node.payload.uiObject.percentageAtAngle = true

                node.payload.uiObject.setPercentage(percentage)

                node.payload.uiObject.statusAngleOffset = 0
                node.payload.uiObject.statusAtAngle = false

                node.payload.uiObject.setStatus(outgoingPowerText + ' ' + ' Outgoing Power')
            }
        }

        function drawProgram(node) {
            if (node.payload !== undefined) {

                const ownPowerText = new Intl.NumberFormat().format(node.payload[programPropertyName].ownPower)
                const incomingPowerText = new Intl.NumberFormat().format(node.payload[programPropertyName].incomingPower)

                node.payload.uiObject.statusAngleOffset = 0
                node.payload.uiObject.statusAtAngle = false

                node.payload.uiObject.setStatus(ownPowerText + ' Own Power - ' + incomingPowerText + ' Incoming Power')
            }
            if (node.tokensAwarded !== undefined && node.tokensAwarded.payload !== undefined) {

                const tokensAwardedText = new Intl.NumberFormat().format(node.payload[programPropertyName].awarded.tokens)

                node.tokensAwarded.payload.uiObject.statusAngleOffset = 0
                node.tokensAwarded.payload.uiObject.statusAtAngle = false
                node.tokensAwarded.payload.uiObject.valueAngleOffset = 0
                node.tokensAwarded.payload.uiObject.valueAtAngle = false

                node.tokensAwarded.payload.uiObject.setValue(tokensAwardedText + ' SA Tokens')
                node.tokensAwarded.payload.uiObject.setStatus('From ' + node.payload[programPropertyName].count + ' Mentees.')
            }
        }
    }
}