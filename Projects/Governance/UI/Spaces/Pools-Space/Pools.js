function newGovernancePoolsSpace() {
    const MODULE_NAME = 'Pool Space'

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
    thisObject.container.isDraggeable = false

    return thisObject

    function initialize() {

    }

    function finalize() {
        thisObject.container.finalize()
        thisObject.container = undefined
    }

    function getContainer(point) {

        return undefined // since this space does not draw anything we return here

        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            thisObject.container.space = MODULE_NAME
            return thisObject.container
        } else {
            return undefined
        }
    }

    function physics() {
        if (UI.projects.superalgos.spaces.designSpace.workspace === undefined) { return }

        UI.projects.governance.functionLibraries.distributionProcess.calculate()
    }

    function draw() {

    }
}
