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
        if (UI.projects.foundations.spaces.designSpace.workspace === undefined) { return }
        let userProfiles = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('User Profile')

        /*
        We will get all the user Profiles tokens from the blockchain, making a call
        every 5 seconds so as not to exceed the rate limit.
        */
        let timer = 0
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            if (userProfile.payload === undefined) { continue }

            if (userProfile.payload.blockchainTokens === undefined) {
                let blockchainAccount = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(userProfile.payload, 'blockchainAccount')
                if (blockchainAccount !== undefined && blockchainAccount !== "") {
                    setTimeout(getBlockchainTokens, timer, userProfile)
                    timer = timer + 5000
                }
            }
        }

        function getBlockchainTokens(userProfile) {
            let blockchainAccount = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(userProfile.payload, 'blockchainAccount')
            const url = "https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=0xfb981ed9a92377ca4d75d924b9ca06df163924fd&address=" + blockchainAccount + "&tag=latest&apikey=YourApiKeyToken"

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (data) {
                console.log(data)
                userProfile.payload.uiObject.setInfoMessage(data)
                userProfile.payload.blockchainTokens = Number(data.result) / 1000000000000000000
            }).catch(function (err) {
                userProfile.payload.uiObject.setErrorMessage(err.message)
            });
        }
    }

    function draw() {

    }
}
