function newGovernanceFunctionLibraryVotes() {
    let thisObject = {
        calculate: calculate,
        installVotes: installVotes
    }

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

            if (userProfile.tokenSwitch === undefined) { continue }
            if (userProfile.tokenSwitch.votingProgram === undefined) { continue }
            if (userProfile.tokenSwitch.votingProgram.payload === undefined) { continue }

            resetVotes(userProfile.tokenSwitch.votingProgram)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenSwitch === undefined) { continue }
            if (userProfile.tokenSwitch.votingProgram === undefined) { continue }
            if (userProfile.tokenSwitch.votingProgram.payload === undefined) { continue }

            userProfile.tokenSwitch.votingProgram.payload.votes = userProfile.tokenSwitch.votingProgram.payload.tokenPower

            distributeForVotingProgram(userProfile.tokenSwitch.votingProgram)
        }

        function resetVotes(node) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }
            node.payload.votes = 0
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
            If there is a reference parent defined, this means that the voting power is 
            transfered to it and not distributed among children.
            */
            if (
                node.payload.referenceParent !== undefined &&
                node.type !== 'Votes Switch' &&
                node.type !== 'Claim Votes Switch' &&
                node.type !== 'Weight Votes Switch' &&
                node.type !== 'User Profile Votes Switch'
            ) {
                resetVotes(node.payload.referenceParent)
                return
            }
            /*
            If there is no reference parent we will redistribute voting power among children.
            */
            let schemaDocument = getSchemaDocument(node)
            if (schemaDocument === undefined) { return }

            if (schemaDocument.childrenNodesProperties !== undefined) {
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i]

                    if (node.type === 'User Profile' && property.name !== "votingProgram") { continue }

                    switch (property.type) {
                        case 'node': {
                            if (node.type === 'User Profile' && property.name === "votingProgram") {
                                let childNode = node[property.name]
                                resetVotes(childNode)
                            }
                        }
                            break
                        case 'array': {
                            let propertyArray = node[property.name]
                            if (propertyArray !== undefined) {
                                for (let m = 0; m < propertyArray.length; m++) {
                                    let childNode = propertyArray[m]
                                    resetVotes(childNode)
                                }
                            }
                            break
                        }
                    }
                }
            }
        }

        function distributeForVotingProgram(votingProgram) {
            if (votingProgram.payload === undefined) { return }
            let votes = votingProgram.payload.votes
            distributeVotes(votingProgram, votes)
        }

        function distributeVotes(node, votes, switchPercentage) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }
            node.payload.votes = node.payload.votes + votes
            drawVotes(node, node.payload.votes, switchPercentage)
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
            If there is a reference parent defined, this means that the voting power is 
            transfered to it and not distributed among children.
            */
            if (
                node.payload.referenceParent !== undefined &&
                node.type !== 'Votes Switch' &&
                node.type !== 'Claim Votes Switch' &&
                node.type !== 'Weight Votes Switch' &&
                node.type !== 'User Profile Votes Switch'
            ) {
                distributeVotes(node.payload.referenceParent, votes)
                return
            }
            /*
            If there is no reference parent we will redistribute voting power among children.
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

                    if (node.type === 'User Profile' && property.name !== "votingProgram") { continue }

                    switch (property.type) {
                        case 'node': {
                            if (node.type === 'User Profile' && property.name === "votingProgram") {
                                let childNode = node[property.name]
                                if (childNode === undefined) { continue }
                                let percentage = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(childNode.payload, 'percentage')
                                if (percentage !== undefined && isNaN(percentage) !== true) {
                                    totalPercentage = totalPercentage + percentage
                                } else {
                                    totalNodesWithoutPercentage++
                                }
                            }
                        }
                            break
                        case 'array': {
                            let propertyArray = node[property.name]
                            if (propertyArray !== undefined) {
                                for (let m = 0; m < propertyArray.length; m++) {
                                    let childNode = propertyArray[m]
                                    if (childNode === undefined) { continue }
                                    let percentage = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(childNode.payload, 'percentage')
                                    if (percentage !== undefined && isNaN(percentage) !== true) {
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
                    node.payload.uiObject.setErrorMessage('Voting Power Switching Error. Total Percentage of children nodes is grater that 100.')
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

                    if (node.type === 'User Profile' && property.name !== "votingProgram") { continue }

                    switch (property.type) {
                        case 'node': {
                            if (node.type === 'User Profile' && property.name === "votingProgram") {
                                let childNode = node[property.name]
                                if (childNode === undefined) { continue }
                                let percentage = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(childNode.payload, 'percentage')
                                if (percentage === undefined || isNaN(percentage) === true) {
                                    percentage = defaultPercentage
                                }
                                distributeVotes(childNode, votes * percentage / 100, percentage)
                            }
                        }
                            break
                        case 'array': {
                            let propertyArray = node[property.name]
                            if (propertyArray !== undefined) {
                                for (let m = 0; m < propertyArray.length; m++) {
                                    let childNode = propertyArray[m]
                                    if (childNode === undefined) { continue }
                                    let percentage = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(childNode.payload, 'percentage')
                                    if (percentage === undefined || isNaN(percentage) === true) {
                                        percentage = defaultPercentage
                                    }
                                    distributeVotes(childNode, votes * percentage / 100, percentage)
                                }
                            }
                            break
                        }
                    }
                }
            }
        }

        function drawVotes(node, votes, percentage) {
            votes = new Intl.NumberFormat().format(votes) + ' ' + 'Votes'
            if (node.payload !== undefined) {

                if (node.type === 'Voting Program') {
                    node.payload.uiObject.statusAngleOffset = 0
                    node.payload.uiObject.statusAtAngle = false

                    node.payload.uiObject.setStatus("Votes = Tokens Power")

                    if (percentage !== undefined) {
                        node.payload.uiObject.setPercentage(percentage.toFixed(2))
                    }
                    return
                }
                if (
                    node.type === 'Position' ||
                    node.type === 'Position Class' ||
                    node.type === 'Pool' ||
                    node.type === 'Tokens Switch' ||
                    node.type === 'Asset' ||
                    node.type === 'Asset Class' ||
                    node.type === 'Feature' ||
                    node.type === 'Feature Class' ||
                    node.type === 'Position Contribution Claim' ||
                    node.type === 'Asset Contribution Claim' ||
                    node.type === 'Feature Contribution Claim'
                ) {
                    node.payload.uiObject.valueAngleOffset = 0
                    node.payload.uiObject.valueAtAngle = false
                    node.payload.uiObject.percentageAngleOffset = 0
                    node.payload.uiObject.percentageAtAngle = false
                } else {
                    node.payload.uiObject.valueAngleOffset = 180
                    node.payload.uiObject.valueAtAngle = true
                    node.payload.uiObject.percentageAngleOffset = 180
                    node.payload.uiObject.percentageAtAngle = true
                }

                node.payload.uiObject.setValue(votes)

                if (percentage !== undefined) {
                    node.payload.uiObject.setPercentage(percentage.toFixed(2))
                }
            }
        }
    }

    function installVotes(node, rootNodes) {
        if (node.payload === undefined) { return }
        if (node.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage('To install votes you need a Reference Parent')
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
                originNode.name = destinationNode.name + ' ' + destinationNode.type
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
                            let originNodeChild = UI.projects.foundations.functionLibraries.uiObjectsFromNodes.addUIObject(originNode, originNodeChildType)

                            if (
                                destinationNodeChild.type === 'Pool' ||
                                destinationNodeChild.type === 'Asset' ||
                                destinationNodeChild.type === 'Feature' ||
                                destinationNodeChild.type === 'Position'
                            ) {
                                originNodeChild.payload.referenceParent = destinationNodeChild
                            }

                            scanNodeBranch(originNodeChild, destinationNodeChild)
                        }
                            break
                        case 'array': {
                            let propertyArray = destinationNode[property.name]
                            if (propertyArray !== undefined) {
                                for (let m = 0; m < propertyArray.length; m++) {

                                    let destinationNodeChild = propertyArray[m]

                                    let originNodeChildType = getOriginNodeChildType(destinationNodeChild)
                                    let originNodeChild = UI.projects.foundations.functionLibraries.uiObjectsFromNodes.addUIObject(originNode, originNodeChildType)

                                    if (
                                        destinationNodeChild.type === 'Pool' ||
                                        destinationNodeChild.type === 'Asset' ||
                                        destinationNodeChild.type === 'Feature' ||
                                        destinationNodeChild.type === 'Position'
                                    ) {
                                        originNodeChild.payload.referenceParent = destinationNodeChild
                                    }

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
            }
            return originNodeType
        }
    }
}