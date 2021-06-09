function newGovernanceFeaturesSpace() {          
    const MODULE_NAME = 'Features Space'

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

    function finalize() {
        thisObject.container.finalize()
        thisObject.container = undefined
    }

    function initialize() {

    }

    function physics() {
        if (UI.projects.superalgos.spaces.designSpace.workspace === undefined) { return }
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

    function draw() {

    }
}
