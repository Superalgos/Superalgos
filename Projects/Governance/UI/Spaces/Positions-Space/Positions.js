function newGovernancePositionsSpace() {
    const MODULE_NAME = 'Positions Space'

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

    let lastTryToReconnectDatetime

    return thisObject

    function finalize() {
        thisObject.container.finalize()
        thisObject.container = undefined
    }

    function initialize() {

    }

    function physics() {
        if (UI.projects.superalgos.spaces.designSpace.workspace === undefined) { return }

        let positions = UI.projects.superalgos.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('Positions')

        /* Weight Calculation Follows */
        for (let i = 0; i < positions.length; i++) {
            let position = positions[i]
            UI.projects.governance.functionLibraries.weights.calculateWeights(position)
        }
    }

    function getContainer(point) {

        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            thisObject.container.space = MODULE_NAME
            return thisObject.container
        } else {
            return undefined
        }
    }

    function draw() {

    }
}
