function newGovernanceFunctionLibraryTokenPower() {
    let thisObject = {
        calculateTokenPower: calculateTokenPower,
        calculateDelegatedPower: calculateDelegatedPower
    }

    const OPAQUE_NODES_TYPES = ['Tokens Mined', 'Signing Accounts', 'Onboarding Programs', 'Liquidity Programs']
    return thisObject

    function calculateTokenPower(
        userProfiles
    ) {
        /*
        We will first reset all the token and delegated power, and then distribute the token power to each Program.
        */
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            resetPower(userProfile)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            distributeProfileTokenPower(userProfile)
        }
    }

    function calculateDelegatedPower(
        userProfiles
    ) {
        /*
        We will distribute the original Blockachain Power + the Delegated Power to each Program.
        */
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            distributeProfileDelegatedPower(userProfile)
        }
    }

    function resetPower(node) {
        if (node === undefined) { return }
        if (node.payload === undefined) { return }
        node.payload.tokenPower = 0
        /*
        When we reach certain node types, we will halt the distribution, because these are targets for 
        token power.
        */
        if (
            node.type === 'Referral Program' ||
            node.type === 'Mentorship Program' ||
            node.type === 'Support Program' ||
            node.type === 'Influencer Program' ||
            node.type === 'Voting Program' ||
            node.type === 'Claims Program' ||
            node.type === 'Staking Program' ||
            node.type === 'Delegation Program' ||
            node.type === 'Github Program' ||
            node.type === 'Airdrop Program'
        ) { return }
        /*
        We will reset token power of children.
        */
        let schemaDocument = getSchemaDocument(node)
        if (schemaDocument === undefined) { return }

        if (schemaDocument.childrenNodesProperties !== undefined) {
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

                switch (property.type) {
                    case 'node': {
                        let childNode = node[property.name]
                        resetPower(childNode)
                    }
                        break
                    case 'array': {
                        let propertyArray = node[property.name]
                        if (propertyArray !== undefined) {
                            for (let m = 0; m < propertyArray.length; m++) {
                                let childNode = propertyArray[m]
                                resetPower(childNode)
                            }
                        }
                        break
                    }
                }
            }
        }
    }

    function distributeProfileTokenPower(userProfile) {
        if (userProfile.payload === undefined) { return }
        if (userProfile.payload.blockchainTokens === undefined) { return }
        /*
        The tokenPower is coming from blockchainTokens.
        */
        let tokenPower = userProfile.payload.blockchainTokens
        /*
        Before we start we will do some validations:
        */
        if (userProfile.tokenPowerSwitch === undefined) {
            userProfile.payload.uiObject.setErrorMessage(
                "You need to have a Token Power Switch child node.",
                UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
            )
            return
        }
        distributeTokenPower(
            userProfile,
            tokenPower,
            undefined,
            false
        )
    }

    function distributeProfileDelegatedPower(userProfile) {
        if (userProfile.payload === undefined) { return }
        if (userProfile.payload.blockchainTokens === undefined) { return }
        if (userProfile.payload.delegationProgram === undefined) { return }
        /*
        The Delegated Power is already accumulated at userProfile.payload.tokenPower
        */
        let tokenPower = userProfile.payload.delegationProgram.programPower
        /*
        Before we start we will do some validations:
        */
        if (userProfile.tokenPowerSwitch === undefined) {
            userProfile.payload.uiObject.setErrorMessage(
                "You need to have a Token Power Switch child node.",
                UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
            )
            return
        }
        distributeTokenPower(
            userProfile,
            tokenPower,
            undefined,
            true
        )
    }

    function distributeTokenPower(
        node,
        tokenPower,
        switchPercentage,
        excludeDelegationProgram
    ) {

        if (node === undefined) { return }
        if (node.payload === undefined) { return }
        node.payload.tokenPower = node.payload.tokenPower + tokenPower
        drawTokenPower(node, node.payload.tokenPower, switchPercentage)
        /*
        When we reach certain node types, we will halt the distribution, 
        because these are targets for token power.
        */
        if (
            node.type === 'Referral Program' ||
            node.type === 'Mentorship Program' ||
            node.type === 'Support Program' ||
            node.type === 'Influencer Program' ||
            node.type === 'Voting Program' ||
            node.type === 'Claims Program' ||
            node.type === 'Staking Program' ||
            node.type === 'Delegation Program' ||
            node.type === 'Github Program' ||
            node.type === 'Airdrop Program'
        ) { return }
        /*
        We will redistribute token power among children.
        */
        let schemaDocument = getSchemaDocument(node)
        if (schemaDocument === undefined) { return }

        if (schemaDocument.childrenNodesProperties !== undefined) {
            /*
            Before distributing the token power, we will calculate how the power 
            is going to be switched between all nodes. The first pass is about
            scanning all sibling nodes to see which ones have a percentage defined
            at their config, and check that all percentages don't add more than 100.
            */
            let totalPercentage = 0
            let totalNodesWithoutPercentage = 0
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

                switch (property.type) {
                    case 'node': {
                        let childNode = node[property.name]
                        if (childNode === undefined) { continue }
                        if (childNode.type === "Delegation Program" && excludeDelegationProgram === true) { continue }
                        if (OPAQUE_NODES_TYPES.includes(childNode.type)) { continue }

                        let percentage = getPercentage(childNode)

                        if (percentage !== undefined && isNaN(percentage) !== true && percentage >= 0) {
                            totalPercentage = totalPercentage + percentage
                        } else {
                            totalNodesWithoutPercentage++
                        }
                    }
                        break
                    case 'array': {
                        let propertyArray = node[property.name]
                        if (propertyArray !== undefined) {
                            for (let m = 0; m < propertyArray.length; m++) {
                                let childNode = propertyArray[m]
                                if (childNode === undefined) { continue }
                                if (childNode.type === "Delegation Program" && excludeDelegationProgram === true) { continue }
                                if (OPAQUE_NODES_TYPES.includes(childNode.type)) { continue }

                                let percentage = getPercentage(childNode)
                                if (percentage !== undefined && isNaN(percentage) !== true && percentage >= 0) {
                                    totalPercentage = totalPercentage + percentage
                                } else {
                                    totalNodesWithoutPercentage++
                                }
                            }
                        }
                        break
                    }
                }
            }
            if (totalPercentage > 100) {
                node.payload.uiObject.setErrorMessage(
                    'Token Power Switching Error. Total Percentage of children nodes is grater that 100.',
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
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

                switch (property.type) {
                    case 'node': {
                        let childNode = node[property.name]
                        if (childNode === undefined) { continue }
                        if (childNode.type === "Delegation Program" && excludeDelegationProgram === true) { continue }
                        if (OPAQUE_NODES_TYPES.includes(childNode.type)) { continue }

                        let percentage = getPercentage(childNode)
                        if (percentage === undefined || isNaN(percentage)  || percentage < 0 === true) {
                            percentage = defaultPercentage
                        }
                        distributeTokenPower(
                            childNode,
                            tokenPower * percentage / 100,
                            percentage,
                            excludeDelegationProgram
                        )
                    }
                        break
                    case 'array': {
                        let propertyArray = node[property.name]
                        if (propertyArray !== undefined) {
                            for (let m = 0; m < propertyArray.length; m++) {
                                let childNode = propertyArray[m]
                                if (childNode === undefined) { continue }
                                if (childNode.type === "Delegation Program" && excludeDelegationProgram === true) { continue }
                                if (OPAQUE_NODES_TYPES.includes(childNode.type)) { continue }

                                let percentage = getPercentage(childNode)
                                if (percentage === undefined || isNaN(percentage)  || percentage < 0 === true) {
                                    percentage = defaultPercentage
                                }
                                distributeTokenPower(
                                    childNode,
                                    tokenPower * percentage / 100,
                                    percentage,
                                    excludeDelegationProgram
                                )
                            }
                        }
                        break
                    }
                }
            }
        }
    }

    function getPercentage(node) {
        return UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload, 'percentage')
    }

    function drawTokenPower(node, tokenPower, percentage) {
        if (node.payload !== undefined) {
            if (node.type === 'User Profile') {

                let incomingPower = node.payload.tokenPower - node.payload.blockchainTokens
                const ownPowerText = parseFloat(node.payload.blockchainTokens.toFixed(0)).toLocaleString('en') + ' ' + 'Blockchain Power'
                const incomingPowerText = parseFloat(incomingPower.toFixed(0)).toLocaleString('en') + ' ' + 'Incoming Delegated Power'

                node.payload.uiObject.valueAngleOffset = 0
                node.payload.uiObject.valueAtAngle = false
                node.payload.uiObject.setStatus(ownPowerText + ' + ' + incomingPowerText, UI.projects.governance.globals.designer.SET_STATUS_COUNTER)

                return
            }

            const tokenPowerText = parseFloat(tokenPower.toFixed(0)).toLocaleString('en') + ' ' + 'Token Power'

            node.payload.uiObject.valueAngleOffset = 180
            node.payload.uiObject.valueAtAngle = true

            node.payload.uiObject.setValue(tokenPowerText, UI.projects.governance.globals.designer.SET_VALUE_COUNTER)

            if (percentage !== undefined) {
                node.payload.uiObject.percentageAngleOffset = 180
                node.payload.uiObject.percentageAtAngle = true
                node.payload.uiObject.setPercentage(percentage.toFixed(2),
                    UI.projects.governance.globals.designer.SET_PERCENTAGE_COUNTER
                )
            }
        }
    }
}