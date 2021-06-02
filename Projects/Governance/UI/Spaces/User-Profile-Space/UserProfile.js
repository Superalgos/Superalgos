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
        if (UI.projects.superalgos.spaces.designSpace.workspace === undefined) {return}

        let userProfiles = UI.projects.superalgos.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('User Profile')
 
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            userProfilePhysics(userProfile)
        }
    }

    function userProfilePhysics(userProfile) {
        let tokens =  UI.projects.superalgos.utilities.nodeConfig.loadPropertyFromNodeConfig(userProfile.payload, 'tokens') 
        tokens = new Intl.NumberFormat().format(tokens) + ' ' + 'SA'
        if ( userProfile.payload !== undefined) {
            userProfile.payload.uiObject.valueAtAngle =  false
            userProfile.payload.uiObject.setValue(tokens)
        }        
    }

    function draw() {

    }
}
