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

        let userProfiles = UI.projects.superalgos.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('User Profile')

        /*
        We will first reset all the voting power, and then distribute it.
        */
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            userProfileReset(userProfile)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            userProfileDistribute(userProfile)
        }
    }

    function userProfileReset(userProfile) {
        resetVotingPower(userProfile)
    }

    function userProfileDistribute(userProfile) {
        let votingPower = UI.projects.superalgos.utilities.nodeConfig.loadPropertyFromNodeConfig(userProfile.payload, 'tokens')
        distributeVotingPower(userProfile, votingPower)
    }

    function resetVotingPower(node) {
        if (node.payload === undefined) { return }
        node.payload.votingPower = 0
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
            node.type === 'Ranking Position' ||
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

    function distributeVotingPower(node, votingPower) {
        if (node.payload === undefined) { return }
        node.payload.votingPower = node.payload.votingPower + votingPower
        drawVotingPower(node, node.payload.votingPower)
        /*
        If there is a reference parent defined, this means that the voting power is 
        transfered to it and not distributed among children.
        */
        if (node.payload.referenceParent !== undefined) {
            distributeVotingPower(node.payload.referenceParent, votingPower)
            return
        }
        /*
        When we reach certain node types, we will halt the distribution, because thse are targets for 
        voting power.
        */
        if (
            node.type === 'Ranking Position' ||
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
                            distributeVotingPower(childNode, votingPower)
                        }
                    }
                        break
                    case 'array': {
                        let propertyArray = node[property.name]
                        if (propertyArray !== undefined) {
                            for (let m = 0; m < propertyArray.length; m++) {
                                let childNode = propertyArray[m]
                                distributeVotingPower(childNode, votingPower / propertyArray.length)
                            }
                        }
                        break
                    }
                }
            }
        }
    }

    function drawVotingPower(node, votingPower) {
        votingPower = new Intl.NumberFormat().format(votingPower) + ' ' + 'SA'
        if (node.payload !== undefined) {
            node.payload.uiObject.valueAtAngle = false
            node.payload.uiObject.setValue(votingPower)
        }
    }

    function draw() {

    }
}
