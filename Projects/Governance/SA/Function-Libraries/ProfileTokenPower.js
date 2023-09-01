exports.newGovernanceFunctionLibraryProfileTokenPower = function newGovernanceFunctionLibraryProfileTokenPower() {
    
    /* The purpose of this function is to make information about Token Power available on SA level, different to UI where Governance is primarily handled.
    This allows e.g. for Token Power-driven access control to Network Services, such as Trading Signals.
    This part of the code *duplicates* Governance functionality which is also available on UI level. If fundamental changes are made to Token Power or
    Delegations logic, such changes must be executed in code snippets of both UI and SA level. */
    
    let thisObject = {
        calculateTokenPower: calculateTokenPower,
        outboundDelegatedPower: outboundDelegatedPower,
        calculateDelegatedPower: calculateDelegatedPower
    }

    const OPAQUE_NODES_TYPES = ['Tokens Mined', 'Signing Account', 'Onboarding Programs', 'Liquidity Programs', 'Bitcoin Factory Programs', 'Forecasts Providers', 'P2P Network Nodes', 'User Storage', 'Social Personas', 'Permissioned P2P Networks', 'Available Signals', 'Available Storage']
    const MAX_GENERATIONS = 3
    return thisObject

    function calculateTokenPower(
        userProfiles
    ) {
        /*
        We will first reset all the token and delegated power, and then distribute the token power to each Program.
        */
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i][1]
            resetPower(userProfile)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i][1]
            distributeProfileTokenPower(userProfile)
        }
        /* Handle outbound delegations of token power to other users */
        outboundDelegatedPower(userProfiles)
        /* Recalculate token power with incoming token power delegations */
        calculateDelegatedPower(userProfiles)
        return userProfiles
    }

    function calculateDelegatedPower(
        userProfiles
    ) {
        /*
        We will distribute the original Blockachain Power + the Delegated Power to each Program.
        */
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i][1]
            distributeProfileDelegatedPower(userProfile)
        }
    }

    function resetPower(node) {
        if (node === undefined) { return }
        if (node.payload === undefined) { node.payload = {} }
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

    function getSchemaDocument(node) {
        if (node.project === undefined || node.type === undefined) { return }
        let schemaDocument = SA.projects.foundations.globals.schemas.APP_SCHEMA_MAP.get(node.project + '-' + node.type)
        return schemaDocument
    }

    function distributeProfileTokenPower(userProfile) {
        if (userProfile.payload === undefined) { return }
        if (userProfile.balance === undefined) { return }
        /*
        The tokenPower is coming from blockchainTokens.
        */
        let tokenPower = userProfile.balance
        /*
        Before we start we will do some validations:
        */
        if (userProfile.tokenPowerSwitch === undefined) {
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
        if (userProfile.balance === undefined) { return }
        if (userProfile.payload.delegationProgram === undefined) { return }
        /*
        The Delegated Power is already accumulated at userProfile.payload.tokenPower
        */
        let tokenPower = userProfile.payload.delegationProgram.programPower
        /*
        Before we start we will do some validations:
        */
        if (userProfile.tokenPowerSwitch === undefined) {
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

                        let config = getTokenPowerRequest(childNode)

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

                                let config = getTokenPowerRequest(childNode)

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
                        let config = getTokenPowerRequest(childNode)

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
                                let config = getTokenPowerRequest(childNode)
        
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

    function outboundDelegatedPower(userProfiles) {
        /*
        This function is the SA equivalent to UI.projects.governance.functionLibraries.delegationProgram.calculate()
        We will first reset all the delegate power, and then distribute it.
        */
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i][1]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = SA.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Delegation Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }

            resetProgram(program)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i][1]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = SA.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Delegation Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }

            program.payload.delegationProgram.programPower = program.payload.tokenPower

            distributeProgram(program)
        }

        /* Different to UI, we are not calculating Bonuses on SA level */

        function resetProgram(node) {
            resetNode(node, 0)

            function resetNode(node, generation) {

                if (generation >= MAX_GENERATIONS) {
                    return
                }
                if (node === undefined) { return }
                if (node.payload === undefined) { node.payload = {} }
                if (node.payload.delegationProgram === undefined) {
                    node.payload.delegationProgram = {
                        programPower: 0,
                        ownPower: 0,
                        usedPower: 0
                    }
                } else {
                    node.payload.delegationProgram.programPower = 0
                    node.payload.delegationProgram.ownPower = 0
                    node.payload.delegationProgram.usedPower = 0
                }

                if (node.type === 'User Profile') {
                    return
                }
                if (node.referenceParent !== undefined) {
                    resetNode(node.referenceParent, generation + 1)
                    return
                }
                let schemaDocument = getSchemaDocument(node)
                if (schemaDocument === undefined) { return }

                if (schemaDocument.childrenNodesProperties !== undefined) {
                    for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                        let property = schemaDocument.childrenNodesProperties[i]

                        switch (property.type) {
                            case 'node': {
                                let childNode = node[property.name]
                                resetNode(childNode, generation)
                            }
                                break
                            case 'array': {
                                let propertyArray = node[property.name]
                                if (propertyArray !== undefined) {
                                    for (let m = 0; m < propertyArray.length; m++) {
                                        let childNode = propertyArray[m]
                                        resetNode(childNode, generation)
                                    }
                                }
                                break
                            }
                        }
                    }
                }
            }
        }

        function distributeProgram(programNode) {
            if (programNode.payload === undefined) { return }

            /*
            Here we will convert Token Power into programPower. 
            As per system rules programPower = tokensPower
            */
            let programPower = programNode.payload.tokenPower
            /*
            The Own Power is the power generated by the same User Profile tokens, not inherited from others.
            */
            programNode.payload.delegationProgram.ownPower = programPower
            distributeProgramPower(programNode, programNode, programPower, undefined, 0)

            function distributeProgramPower(
                currentProgramNode,
                node,
                programPower,
                percentage,
                generation
            ) {
                if (generation >= MAX_GENERATIONS) {
                    return
                }
                if (node === undefined) { return }
                // if (node.payload === undefined) { return }
                // if (node.payload.delegationProgram === undefined) { return }

                node.payload.delegationProgram.programPower = node.payload.delegationProgram.programPower + programPower
               /* drawPower(node, node.payload.delegationProgram.programPower, percentage) */
                /*
                When we reach certain node types, we will halt the distribution, because these are targets for 
                delegate power.
                */
                if (
                    node.type === 'User Profile'
                ) {
                    return
                }
                /*
                If there is a reference parent defined, this means that the delegate power is 
                transferred to it and not distributed among children.
                */
                if (
                    node.referenceParent !== undefined &&
                    node.type === 'User Delegate'
                ) {
                    currentProgramNode.payload.delegationProgram.usedPower = currentProgramNode.payload.delegationProgram.usedPower + programPower
                    distributeProgramPower(
                        currentProgramNode, 
                        node.referenceParent, 
                        programPower / 10,
                        undefined,
                        generation + 1
                        )
                    return
                }
                /*
                If there is no reference parent we will redistribute delegate power among children.
                */
                let schemaDocument = getSchemaDocument(node)
                if (schemaDocument === undefined) { return }

                if (schemaDocument.childrenNodesProperties !== undefined) {
                    /*
                    Before distributing the delegate power, we will calculate how the power 
                    is going to be switched between all nodes. The first pass is about
                    scanning all sibling nodes to see which ones have a percentage defined
                    at their config, and check that all percentages don't add more than 100.
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
                                if (childNode.type === 'Tokens Bonus') { continue }

                                let config = getTokenPowerRequest(childNode)

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
                                        if (childNode.type === 'Tokens Bonus') { continue }
                                        
                                        let config = getTokenPowerRequest(childNode)

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
                    if (totalAmount > programPower && totalAmount > 0) {
                        amountShare = programPower / totalAmount
                    } else {
                        percentagePower = programPower - totalAmount
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
                                if (childNode.type === 'Tokens Bonus') { continue }
                                let distributionAmount = 0
                                let percentage = 0
                                let config = getTokenPowerRequest(childNode)   
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
                                distributeProgramPower(
                                    currentProgramNode, 
                                    childNode, 
                                    distributionAmount, 
                                    percentage,
                                    generation
                                    )
                            }
                                break
                            case 'array': {
                                let propertyArray = node[property.name]
                                if (propertyArray !== undefined) {
                                    for (let m = 0; m < propertyArray.length; m++) {
                                        let childNode = propertyArray[m]
                                        if (childNode === undefined) { continue }
                                        if (childNode.type === 'Tokens Bonus') { continue }
                                        let distributionAmount = 0
                                        let percentage = 0
                                        let config = getTokenPowerRequest(childNode)
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
                                        distributeProgramPower(
                                            currentProgramNode, 
                                            childNode, 
                                            distributionAmount, 
                                            percentage,
                                            generation
                                            )
                                    }
                                }
                                break
                            }
                        }
                    }
                }
            }
        }
    }
    
    function getTokenPowerRequest(node) {
        if (node.config === undefined) { return }
        let result = {}
        let config = node.config
        let amount = config.amount
        let percentage = config.percentage

        if (percentage !== undefined && amount !== undefined) { return }

        /* Node configuration requests an absolute amount of token power */
        if (amount !== undefined) {
            result.type = "amount"
            /* We do not allow amounts smaller than 0 */
            if (!isFinite(amount) || amount < 0) { return }
            /* Check if the node already has token power and reduce the result accordingly */
            if (node.payload.tokenPower !== undefined && isFinite(node.payload.tokenPower)) {
                let neededTokenPower = amount - node.payload.tokenPower
                if (neededTokenPower < 0) { neededTokenPower = 0}
                result.value = neededTokenPower
            } else {
                result.value = amount
            }           
        /* Node configuration requests a percentage of available token power */
        } else if (percentage !== undefined) {
            result.type = "percentage"
            /* We do not allow percentages smaller than 0 */
            if (!isFinite(percentage) || percentage < 0) { return }
            result.value = percentage
        } else {
            return
        }
        return result
    }
}
