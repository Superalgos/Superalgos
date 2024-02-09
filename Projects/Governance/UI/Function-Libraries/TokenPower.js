function newGovernanceFunctionLibraryTokenPower() {
    let thisObject = {
        calculateTokenPower: calculateTokenPower,
        calculateDelegatedPower: calculateDelegatedPower
    }

    const OPAQUE_NODES_TYPES = ['Tokens Mined', 'Signing Account', 'Onboarding Programs', 'Liquidity Programs', 'Bitcoin Factory Programs', 'Forecasts Providers', 'P2P Network Nodes', 'User Storage', 'Social Personas', 'Permissioned P2P Networks', 'Available Signals', 'Available Storage']
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
            node.type === 'Airdrop Program' ||
            node.type === 'Followed Bot Reference' ||
            node.type === 'Task Server App'
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
            node.type === 'Airdrop Program' ||
            node.type === 'Followed Bot Reference' ||
            node.type === 'Task Server App'
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

            We will also check for nodes having absolute amounts of token power configured
            and verify if the total of defined amounts is below the available token power.
            If not, we will reduce the token power to be allocated equally by the share
            of the configured amount exceeding the available amount.

            Token Power remaining after servicing nodes with a configured amount will be
            distributed to nodes with a configured percentage or with no configuration.
            */
            let totalPercentage = 0
            let totalAmount = 0
            let totalNodesWithoutPercentage = 0
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

                switch (property.type) {
                    case 'node': {
                        let childNode = node[property.name]
                        if (childNode === undefined) { continue }
                        if (childNode.type === "Delegation Program" && excludeDelegationProgram === true) { continue }
                        if (OPAQUE_NODES_TYPES.includes(childNode.type)) { continue }

                        let config = UI.projects.governance.utilities.nodeCalculations.getDistributionConfig(childNode, "tokenPower")

                        if (config?.type === "amount" && config?.value >= 0) {
                            totalAmount = totalAmount + config.value
                        } else if (config?.type === "percentage" && config?.value >= 0) {
                            totalPercentage = totalPercentage + config.value
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

                                let config = UI.projects.governance.utilities.nodeCalculations.getDistributionConfig(childNode, "tokenPower")

                                if (config?.type === "amount" && config?.value >= 0) {
                                    totalAmount = totalAmount + config.value
                                } else if (config?.type === "percentage" && config?.value >= 0) {
                                    totalPercentage = totalPercentage + config.value
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
                    'Token Power Switching Error. Total Percentage of children nodes is greater than 100.',
                    UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                )
                return
            }
            let defaultPercentage = 0
            if (totalNodesWithoutPercentage > 0) {
                defaultPercentage = (100 - totalPercentage) / totalNodesWithoutPercentage
            }
            
            /* If configured Token Power amounts exceed the available Token Power, determine the share by which requests need to be reduced.
            Store the Token Power remaining for distribution via percentages after all amount requests have been served in percentagePower. */
            let percentagePower = 0
            let amountShare = 1
            if (totalAmount > tokenPower && totalAmount > 0) {
                amountShare = tokenPower / totalAmount
            } else {
                percentagePower = tokenPower - totalAmount
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

                        let distributionAmount = 0
                        let percentage = 0
                        let config = UI.projects.governance.utilities.nodeCalculations.getDistributionConfig(childNode, "tokenPower")

                        if (config?.type === "amount" && config?.value >= 0) {
                            distributionAmount = config.value * amountShare
                            percentage = "fixed"
                        } else if (config?.type === "percentage" && config?.value >= 0) {
                            distributionAmount = percentagePower * config.value / 100
                            percentage = config.value
                        } else {
                            distributionAmount = percentagePower * defaultPercentage / 100
                            percentage = defaultPercentage
                        }

                        distributeTokenPower(
                            childNode,
                            distributionAmount,
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

                                let distributionAmount = 0
                                let percentage = 0
                                let config = UI.projects.governance.utilities.nodeCalculations.getDistributionConfig(childNode, "tokenPower")
        
                                if (config?.type === "amount" && config?.value >= 0) {
                                    distributionAmount = config.value * amountShare
                                    percentage = "fixed"
                                } else if (config?.type === "percentage" && config?.value >= 0) {
                                    distributionAmount = percentagePower * config.value / 100
                                    percentage = config.value
                                } else {
                                    distributionAmount = percentagePower * defaultPercentage / 100
                                    percentage = defaultPercentage
                                }

                                distributeTokenPower(
                                    childNode,
                                    distributionAmount,
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

            if (node.type === 'Task Server App' || node.type === 'Followed Bot Reference') {
                node.payload.uiObject.setStatus(tokenPowerText, UI.projects.governance.globals.designer.SET_STATUS_COUNTER)
            }

            UI.projects.governance.utilities.nodeCalculations.drawPercentage(node, percentage, 180)
        }
    }    
}

exports.newGovernanceFunctionLibraryTokenPower = newGovernanceFunctionLibraryTokenPower