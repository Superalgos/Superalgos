function newGovernanceUserProfileSpace() {
    const MODULE_NAME = 'User Profile Space'

    let thisObject = {
        container: undefined,
        physics: physics,
        draw: draw,
        getContainer: getContainer,
        finalize: finalize,
        initialize: initialize
    }

    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)

    return thisObject

    function initialize() {

    }

    function finalize() {
        thisObject.container.finalize()
        thisObject.container = undefined
    }

    function getContainer(point) {

        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            thisObject.container.space = MODULE_NAME
            return thisObject.container
        } else {
            return undefined
        }
    }

    function physics() {
        if (UI.projects.superalgos.spaces.designSpace.workspace === undefined) { return }

        let pools = UI.projects.superalgos.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('Pools')
        /* Reset Votes at Pools */
        for (let i = 0; i < pools.length; i++) {
            let poolsNode = pools[i]
            resetVotes(poolsNode)
        }

        let features = UI.projects.superalgos.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('Features')
        /* Reset Votes at Features */
        for (let i = 0; i < features.length; i++) {
            let feature = features[i]
            resetVotes(feature)
        }

        let assets = UI.projects.superalgos.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('Assets')
        /* Reset Votes at Features */
        for (let i = 0; i < assets.length; i++) {
            let asset = assets[i]
            resetVotes(asset)
        }

        let positions = UI.projects.superalgos.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('Positions')
        /* Reset Votes at Features */
        for (let i = 0; i < positions.length; i++) {
            let position = positions[i]
            resetVotes(position)
        }

        let userProfiles = UI.projects.superalgos.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('User Profile')
        /*
        We will first reset all the voting power, and then distribute it.
        */
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            resetVotes(userProfile)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            distributeVotes(userProfile)
        }
    }

    function resetVotes(userProfile) {
        resetVotingPower(userProfile)
    }

    function distributeVotes(userProfile) {
        let votes = UI.projects.superalgos.utilities.nodeConfig.loadPropertyFromNodeConfig(userProfile.payload, 'tokens')
        distributeVotingPower(userProfile, votes)
    }

    function resetVotingPower(node) {
        if (node === undefined) { return }
        if (node.payload === undefined) { return }
        node.payload.votes = 0
        /*
        If there is a reference parent defined, this means that the voting power is 
        transfered to it and not distributed among children.
        */
        if (node.payload.referenceParent !== undefined) {
            resetVotingPower(node.payload.referenceParent)
            return
        }
        /*
        When we reach certain node types, we will halt the distribution, because thse are targets for 
        voting power.
        */
        if (
            node.type === 'Position' ||
            node.type === 'Asset' ||
            node.type === 'Feature'
        ) { return }
        /*
        If there is no reference parent we will redistribute voting power among children.
        */
        let schemaDocument = getSchemaDocument(node)
        if (schemaDocument === undefined) { return }

        if (schemaDocument.childrenNodesProperties !== undefined) {
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

                if (node.type === 'User Profile' && property.name !== "votesDistribution") { continue }

                switch (property.type) {
                    case 'node': {
                        if (node.type === 'User Profile' && property.name === "votesDistribution") {
                            let childNode = node[property.name]
                            resetVotingPower(childNode)
                        }
                    }
                        break
                    case 'array': {
                        let propertyArray = node[property.name]
                        if (propertyArray !== undefined) {
                            for (let m = 0; m < propertyArray.length; m++) {
                                let childNode = propertyArray[m]
                                resetVotingPower(childNode)
                            }
                        }
                        break
                    }
                }
            }
        }
    }

    function distributeVotingPower(node, votes, switchPercentage) {
        if (node === undefined) { return }
        if (node.payload === undefined) { return }
        node.payload.votes = node.payload.votes + votes
        drawVotingPower(node, node.payload.votes, switchPercentage)
        /*
        When we reach certain node types, we will halt the distribution, because thse are targets for 
        voting power.
        */
        if (
            node.type === 'Position' ||
            node.type === 'Asset' ||
            node.type === 'Feature' ||
            node.type === 'Pool' 
        ) { return }
        /*
        If there is a reference parent defined, this means that the voting power is 
        transfered to it and not distributed among children.
        */
        if (node.payload.referenceParent !== undefined) {
            distributeVotingPower(node.payload.referenceParent, votes)
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

                if (node.type === 'User Profile' && property.name !== "votesDistribution") { continue }

                switch (property.type) {
                    case 'node': {
                        if (node.type === 'User Profile' && property.name === "votesDistribution") {
                            let childNode = node[property.name]
                            let percentage = UI.projects.superalgos.utilities.nodeConfig.loadPropertyFromNodeConfig(childNode.payload, 'percentage')
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
                                let percentage = UI.projects.superalgos.utilities.nodeConfig.loadPropertyFromNodeConfig(childNode.payload, 'percentage')
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

                if (node.type === 'User Profile' && property.name !== "votesDistribution") { continue }

                switch (property.type) {
                    case 'node': {
                        if (node.type === 'User Profile' && property.name === "votesDistribution") {
                            let childNode = node[property.name]
                            let percentage = UI.projects.superalgos.utilities.nodeConfig.loadPropertyFromNodeConfig(childNode.payload, 'percentage')
                            if (percentage === undefined || isNaN(percentage) === true) {
                                percentage = defaultPercentage
                            }
                            distributeVotingPower(childNode, votes * percentage / 100, percentage)
                        }
                    }
                        break
                    case 'array': {
                        let propertyArray = node[property.name]
                        if (propertyArray !== undefined) {
                            for (let m = 0; m < propertyArray.length; m++) {
                                let childNode = propertyArray[m]
                                let percentage = UI.projects.superalgos.utilities.nodeConfig.loadPropertyFromNodeConfig(childNode.payload, 'percentage')
                                if (percentage === undefined || isNaN(percentage) === true) {
                                    percentage = defaultPercentage
                                }
                                distributeVotingPower(childNode, votes * percentage / 100, percentage)
                            }
                        }
                        break
                    }
                }
            }
        }
    }

    function drawVotingPower(node, votes, percentage) {
        votes = new Intl.NumberFormat().format(votes) + ' ' + 'Votes'
        if (node.payload !== undefined) {
            if (node.type === 'User Profile') {
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
            } else {
                node.payload.uiObject.valueAngleOffset = 180
                node.payload.uiObject.valueAtAngle = true
            }

            node.payload.uiObject.setValue(votes)

            if (percentage !== undefined) {
                node.payload.uiObject.setPercentage(percentage.toFixed(2))
            }
        }
    }

    function draw() {

    }
}
