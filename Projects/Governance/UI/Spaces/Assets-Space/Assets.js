function newGobernanceAssetsSpace() {
    const MODULE_NAME = 'Assets Space'

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

    function finalize() {
        thisObject.container.finalize()
        thisObject.container = undefined
    }

    function initialize() {

    }

    function physics() {
        if (UI.projects.superalgos.spaces.designSpace.workspace === undefined) { return }

        let assets = UI.projects.superalgos.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('Assets')

        /* Weight Calculation Follows */
        for (let i = 0; i < assets.length; i++) {
            let asset = assets[i]
            UI.projects.governance.functionLibraries.weights.calculateWeights(asset)
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
