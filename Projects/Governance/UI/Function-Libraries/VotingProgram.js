function newGovernanceFunctionLibraryVotingProgram() {
    let thisObject = {
        calculate: calculate,
        installMissingVotes: installMissingVotes
    }
    const MAX_GENERATIONS = 3

    return thisObject

    function calculate(
        pools,
        features,
        assets,
        positions,
        userProfiles
    ) {

        /* Reset Votes at Pools */
        for (let i = 0; i < pools.length; i++) {
            let poolsNode = pools[i]
            resetVotes(poolsNode)
        }

        /* Reset Votes at Features */
        for (let i = 0; i < features.length; i++) {
            let featuresNode = features[i]
            resetVotes(featuresNode)
        }

        /* Reset Votes at Assets */
        for (let i = 0; i < assets.length; i++) {
            let assetsNode = assets[i]
            resetVotes(assetsNode)
        }

        /* Reset Votes at Features */
        for (let i = 0; i < positions.length; i++) {
            let positionsNode = positions[i]
            resetVotes(positionsNode)
        }
        /*
        We will first reset all the voting power, and then distribute it.
        */
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Voting Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }

            resetVotes(program)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Voting Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }

            distributeProgram(program, userProfile)
        }

        /* Bonus Calculation is here */
        UI.projects.governance.utilities.bonusProgram.run(
            pools,
            userProfiles,
            "votingProgram",
            "Voting-Bonus",
            "Voting Program"
        )

        function resetVotes(node) {
            resetNode(node, 0)

            function resetNode(node, generation) {

                if (generation >= MAX_GENERATIONS) {
                    return
                }
                if (node === undefined) { return }
                if (node.payload === undefined) { return }
                if (node.payload.votingProgram === undefined) {
                    node.payload.votingProgram = {
                        votes: 0,
                        ownPower: 0,
                        incomingPower: 0,
                        usedPower: 0
                    }
                } else {
                    node.payload.votingProgram.votes = 0
                    node.payload.votingProgram.ownPower = 0
                    node.payload.votingProgram.incomingPower = 0
                    node.payload.votingProgram.usedPower = 0

                }

                /*
                When we reach certain node types, we will halt the distribution, because these are targets for 
                voting power.
                */
                if (
                    node.type === 'Position' ||
                    node.type === 'Asset' ||
                    node.type === 'Feature' ||
                    node.type === 'Pool' ||
                    node.type === 'Position Contribution Claim' ||
                    node.type === 'Asset Contribution Claim' ||
                    node.type === 'Feature Contribution Claim'
                ) { return }
                /*
                For Votes to Profiles there is a special treatment that needs to be done
                so that votes can flow from Profiles to the Program without being affected
                by Percentages.
                */
                switch (node.type) {
                    case 'User Profile Vote': {
                        if (node.payload.referenceParent !== undefined) {
                            resetNode(node.payload.referenceParent, generation + 1)
                            return
                        }
                        break
                    }
                    case 'User Profile': {
                        let program = UI.projects.governance.utilities.validations.onlyOneProgram(node, 'Voting Program')
                        if (program === undefined) { return }
                        if (program.payload === undefined) { return }
                        resetNode(program, generation)
                        return
                    }
                }
                /*
                If there is a reference parent defined, this means that the voting power is 
                transferred to it and not distributed among children.
                */
                if (
                    node.payload.referenceParent !== undefined &&
                    node.type !== 'Votes Switch' &&
                    node.type !== 'Claim Votes Switch' &&
                    node.type !== 'Weight Votes Switch'
                ) {
                    resetNode(node.payload.referenceParent, generation)
                    return
                }
                /*
                Here we are inside the Voting Program, so we will crawl all it's children.
                */
                let schemaDocument = getSchemaDocument(node)
                if (schemaDocument === undefined) { return }

                if (schemaDocument.childrenNodesProperties !== undefined) {
                    for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                        let property = schemaDocument.childrenNodesProperties[i]

                        if (node.type === 'User Profile' && property.name !== "votingProgram") { continue }

                        switch (property.type) {
                            case 'node': {
                                let childNode = node[property.name]
                                if (childNode === undefined) { continue }
                                if (childNode.type === 'Tokens Bonus') { continue }
                                resetNode(childNode, generation)

                            }
                                break
                            case 'array': {
                                let propertyArray = node[property.name]
                                if (propertyArray !== undefined) {
                                    for (let m = 0; m < propertyArray.length; m++) {
                                        let childNode = propertyArray[m]
                                        if (childNode.type === 'Tokens Bonus') { continue }
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

        function distributeProgram(programNode, userProfile) {
            if (programNode.payload === undefined) { return }
            /*
            Transform Token Power into Votes
            */
            let votes = programNode.payload.tokenPower + userProfile.payload.reputation
            /*
            Set this initial votes as own power
            */
            programNode.payload.votingProgram.ownPower = votes
            distributeProgramPower(programNode, programNode, votes, undefined, 0, userProfile)

            function distributeProgramPower(
                currentProgramNode,
                node,
                votes,
                percentage,
                generation,
                userProfile
            ) {
                if (generation >= MAX_GENERATIONS) {
                    return
                }
                if (node === undefined) { return }
                if (node.payload === undefined) { return }
                if (node.payload.votingProgram === undefined) { return }

                node.payload.votingProgram.votes = node.payload.votingProgram.votes + votes

                if (node.type === 'Voting Program') {
                    node.payload.votingProgram.incomingPower = node.payload.votingProgram.votes - node.payload.votingProgram.ownPower
                }
                drawVotes(node, node.payload.votingProgram.votes, percentage, userProfile)
                /*
                When we reach certain node types, we will halt the distribution, because these are targets for 
                voting power.
                */
                if (
                    node.type === 'Position' ||
                    node.type === 'Asset' ||
                    node.type === 'Feature' ||
                    node.type === 'Pool' ||
                    node.type === 'Position Class' ||
                    node.type === 'Asset Class' ||
                    node.type === 'Feature Class' ||
                    node.type === 'Pool Class' ||
                    node.type === 'Position Contribution Claim' ||
                    node.type === 'Asset Contribution Claim' ||
                    node.type === 'Feature Contribution Claim'
                ) { return }
                /*
                For Votes to Profiles there is a special treatment that needs to be done
                so that votes can flow from Profiles to the Program without being affected
                by Percentages.
                */
                switch (node.type) {
                    case 'User Profile Vote': {
                        if (node.payload.referenceParent !== undefined) {
                            currentProgramNode.payload.votingProgram.usedPower = currentProgramNode.payload.votingProgram.usedPower + votes
                            distributeProgramPower(
                                currentProgramNode,
                                node.payload.referenceParent,
                                votes / 10,
                                undefined,
                                generation + 1,
                                node.payload.referenceParent
                            )
                        }
                        return
                    }
                    case 'User Profile': {
                        let program = UI.projects.governance.utilities.validations.onlyOneProgram(node, 'Voting Program')
                        if (program === undefined) { return }
                        if (program.payload === undefined) { return }
                        distributeProgramPower(
                            currentProgramNode,
                            program,
                            votes,
                            undefined,
                            generation,
                            userProfile
                        )
                        return
                    }
                }
                /*
                If there is a reference parent defined, this means that the voting power is 
                transferred to it and not distributed among children.
                */
                if (
                    node.payload.referenceParent !== undefined &&
                    node.type !== 'Votes Switch' &&
                    node.type !== 'Claim Votes Switch' &&
                    node.type !== 'Weight Votes Switch'
                ) {
                    currentProgramNode.payload.votingProgram.usedPower = currentProgramNode.payload.votingProgram.usedPower + votes
                    /*
                    Here we will validate that users can not vote for their own claims. 
                    */
                    let votedUserProfile = UI.projects.visualScripting.utilities.hierarchy.getHiriarchyHead(node.payload.referenceParent)

                    if (votedUserProfile === undefined || userProfile === undefined) { return }
                    if (votedUserProfile.id === userProfile.id) {
                        node.payload.uiObject.setErrorMessage('Voting your own claims is not allowed.')
                        return
                    }

                    /*
                    Setup the sign of the votes.
                    */
                    let sign = 1
                    let negative = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload, 'negative')
                    if (negative === true) {
                        sign = - 1
                    }

                    distributeProgramPower(
                        currentProgramNode,
                        node.payload.referenceParent,
                        votes * sign,
                        undefined,
                        generation,
                        userProfile
                    )
                    return
                }
                /*
                Here we are inside the Voting Program, so we will crawl all it's children.
                */
                let schemaDocument = getSchemaDocument(node)
                if (schemaDocument === undefined) { return }

                if (schemaDocument.childrenNodesProperties !== undefined) {
                    /*
                    Before distributing the voting power, we will calculate how the power 
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
                                if (childNode.type === 'Tokens Bonus') { continue }
                                let percentage = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(childNode.payload, 'percentage')
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
                                        if (childNode.type === 'Tokens Bonus') { continue }
                                        let percentage = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(childNode.payload, 'percentage')
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
                            'Voting Power Switching Error. Total Percentage of children nodes is grater that 100.',
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
                                if (childNode.type === 'Tokens Bonus') { continue }
                                let percentage = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(childNode.payload, 'percentage')
                                if (percentage === undefined || isNaN(percentage)  || percentage < 0 === true) {
                                    percentage = defaultPercentage
                                }
                                distributeProgramPower(
                                    currentProgramNode,
                                    childNode,
                                    votes * percentage / 100,
                                    percentage,
                                    generation,
                                    userProfile
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
                                        let percentage = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(childNode.payload, 'percentage')
                                        if (percentage === undefined || isNaN(percentage)  || percentage < 0 === true) {
                                            percentage = defaultPercentage
                                        }
                                        distributeProgramPower(
                                            currentProgramNode,
                                            childNode,
                                            votes * percentage / 100,
                                            percentage,
                                            generation,
                                            userProfile
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

        function drawVotes(node, votes, percentage, userProfile) {

            if (votes === undefined) { return }
            if (isNaN(votes) === true) { return }
            if (node.payload === undefined) { return }
            if (node.type === 'User Profile') {
                return
            }
            if (node.type === 'Voting Program') {
                drawProgram(node, userProfile)

                if (percentage !== undefined) {
                    node.payload.uiObject.setPercentage(percentage.toFixed(2),
                        UI.projects.governance.globals.designer.SET_PERCENTAGE_COUNTER
                    )
                }
                return
            }
            if (node.type === 'User Profile Vote') {
                drawUserNode(node, votes, percentage)
                return
            }
            if (
                node.type === 'Position' ||
                node.type === 'Position Class' ||
                node.type === 'Pool' ||
                node.type === 'Pool Class' ||
                node.type === 'Tokens Switch' ||
                node.type === 'Asset' ||
                node.type === 'Asset Class' ||
                node.type === 'Feature' ||
                node.type === 'Feature Class' ||
                node.type === 'Position Contribution Claim' ||
                node.type === 'Asset Contribution Claim' ||
                node.type === 'Feature Contribution Claim'
            ) {
                return
            }

            node.payload.uiObject.valueAngleOffset = 180
            node.payload.uiObject.valueAtAngle = true
            node.payload.uiObject.percentageAngleOffset = 180
            node.payload.uiObject.percentageAtAngle = true

            let voteType = 'Voting Power'

            if (
                node.type.indexOf('Weight') >= 0 ||
                node.type.indexOf('Pool') >= 0 ||
                node.type.indexOf('Feature') >= 0 ||
                node.type.indexOf('Asset') >= 0
            ) {
                voteType = 'Weight Power'
            }

            if (node.type.indexOf('Claim') >= 0) {
                voteType = 'Claim Support Power'
            }

            const votesText = parseFloat(votes.toFixed(0)).toLocaleString('en') + ' ' + voteType

            node.payload.uiObject.setValue(votesText, UI.projects.governance.globals.designer.SET_VALUE_COUNTER)

            if (percentage !== undefined) {
                node.payload.uiObject.percentageAngleOffset = 180
                node.payload.uiObject.percentageAtAngle = true
                node.payload.uiObject.setPercentage(percentage.toFixed(2),
                    UI.projects.governance.globals.designer.SET_PERCENTAGE_COUNTER
                )
            }


            function drawUserNode(node, votes, percentage) {
                if (node.payload !== undefined) {

                    const outgoingPowerText = parseFloat(votes.toFixed(0)).toLocaleString('en')

                    node.payload.uiObject.valueAngleOffset = 180
                    node.payload.uiObject.valueAtAngle = true

                    node.payload.uiObject.setValue(outgoingPowerText + ' Voting Power', UI.projects.governance.globals.designer.SET_VALUE_COUNTER)

                    node.payload.uiObject.percentageAngleOffset = 180
                    node.payload.uiObject.percentageAtAngle = true

                    node.payload.uiObject.setPercentage(percentage,
                        UI.projects.governance.globals.designer.SET_PERCENTAGE_COUNTER
                    )

                    if (node.payload.referenceParent !== undefined) {
                        node.payload.uiObject.statusAngleOffset = 0
                        node.payload.uiObject.statusAtAngle = true

                        node.payload.uiObject.setStatus(outgoingPowerText + ' ' + ' Outgoing Power', UI.projects.governance.globals.designer.SET_STATUS_COUNTER)
                    }
                }
            }

            function drawProgram(node, userProfile) {
                if (node.payload === undefined) { return }
                if (node.payload.votingProgram === undefined) { return }
                if (node.payload.votingProgram.ownPower === undefined) { return }
                if (node.payload.votingProgram.incomingPower === undefined) { return }
                if (userProfile.payload.reputation === undefined) { return }

                const ownPowerText = parseFloat((node.payload.votingProgram.ownPower - userProfile.payload.reputation).toFixed(0)).toLocaleString('en')
                const incomingPowerText = parseFloat(node.payload.votingProgram.incomingPower.toFixed(0)).toLocaleString('en')
                const reputationPowerText = parseFloat(userProfile.payload.reputation.toFixed(0)).toLocaleString('en')

                node.payload.uiObject.statusAngleOffset = 0
                node.payload.uiObject.statusAtAngle = false

                node.payload.uiObject.setStatus(ownPowerText + ' Own Power' + ' + ' + incomingPowerText + ' Incoming Voting Power' + ' + ' + reputationPowerText + ' Reputation Power', UI.projects.governance.globals.designer.SET_STATUS_COUNTER)
            }
        }
    }

    function installMissingVotes(node, rootNodes) {
        if (node.payload === undefined) { return }
        if (node.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage(
                'To install votes you need a Reference Parent',
                UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
            )
            return
        }
        scanNodeBranch(node, node.payload.referenceParent)

        function scanNodeBranch(originNode, destinationNode) {
            if (
                destinationNode.type === 'Pool' ||
                destinationNode.type === 'Asset' ||
                destinationNode.type === 'Feature' ||
                destinationNode.type === 'Position'
            ) {
                originNode.name = destinationNode.name + ' ' + destinationNode.type + ' ' + ' Vote'
            } else {
                originNode.name = destinationNode.name
            }

            let schemaDocument = getSchemaDocument(destinationNode)
            if (schemaDocument === undefined) { return }

            if (schemaDocument.childrenNodesProperties !== undefined) {
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i]

                    switch (property.type) {
                        case 'node': {

                            let destinationNodeChild = destinationNode[property.name]

                            let originNodeChildType = getOriginNodeChildType(destinationNodeChild)
                            let originNodeChild = UI.projects.visualScripting.utilities.nodeChildren.findChildReferencingThisNode(originNode, destinationNodeChild)

                            if (originNodeChild === undefined) {
                                originNodeChild = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(originNode, originNodeChildType)
                            }
                            UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(originNodeChild, destinationNodeChild)
                            scanNodeBranch(originNodeChild, destinationNodeChild)
                        }
                            break
                        case 'array': {
                            let propertyArray = destinationNode[property.name]
                            if (propertyArray !== undefined) {
                                for (let m = 0; m < propertyArray.length; m++) {

                                    let destinationNodeChild = propertyArray[m]

                                    let originNodeChildType = getOriginNodeChildType(destinationNodeChild)
                                    let originNodeChild = UI.projects.visualScripting.utilities.nodeChildren.findChildReferencingThisNode(originNode, destinationNodeChild)

                                    if (originNodeChild === undefined) {
                                        originNodeChild = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(originNode, originNodeChildType)
                                    }
                                    UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(originNodeChild, destinationNodeChild)
                                    scanNodeBranch(originNodeChild, destinationNodeChild)
                                }
                            }
                            break
                        }
                    }
                }
            }
        }

        function getOriginNodeChildType(destinationNode) {
            let originNodeType

            switch (destinationNode.type) {
                case 'Pool Class': {
                    originNodeType = 'Weight Votes Switch'
                    break
                }
                case 'Asset Class': {
                    originNodeType = 'Weight Votes Switch'
                    break
                }
                case 'Feature Class': {
                    originNodeType = 'Weight Votes Switch'
                    break
                }
                case 'Position Class': {
                    originNodeType = 'Weight Votes Switch'
                    break
                }
                case 'Pool': {
                    originNodeType = 'Pool Weight Vote'
                    break
                }
                case 'Asset': {
                    originNodeType = 'Asset Weight Vote'
                    break
                }
                case 'Feature': {
                    originNodeType = 'Feature Weight Vote'
                    break
                }
                case 'Position': {
                    originNodeType = 'Position Weight Vote'
                    break
                }
                case 'Asset Claims Folder': {
                    originNodeType = 'Claim Votes Switch'
                    break
                }
                case 'Asset Contribution Claim': {
                    originNodeType = 'Asset Claim Vote'
                    break
                }
                case 'Feature Claims Folder': {
                    originNodeType = 'Claim Votes Switch'
                    break
                }
                case 'Feature Contribution Claim': {
                    originNodeType = 'Feature Claim Vote'
                    break
                }
                case 'Position Claims Folder': {
                    originNodeType = 'Claim Votes Switch'
                    break
                }
                case 'Position Contribution Claim': {
                    originNodeType = 'Position Claim Vote'
                    break
                }
            }
            return originNodeType
        }
    }
}