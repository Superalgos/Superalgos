function newGovernanceUserProfileSpace() {
    const MODULE_NAME = 'User Profile Space'

    let thisObject = {
        githubStars: undefined,
        githubWatchers: undefined,
        githubForks: undefined,
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

    let waitingForResponses = 0
    let timer = 0

    thisObject.githubStars = new Map()
    thisObject.githubWatchers = new Map()
    thisObject.githubForks = new Map()

    return thisObject

    function initialize() {
        /*
        Here we will get a list of all github usernames who have a star or fork and are watching the
        Superalgos Repository. This will later be used to know which user profiles are participating
        at the Github Program. 
        */

        /*
        If the workspace is not related to governance, then we exit the Intialize Function
        */
        let resultsArary = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('User Profile')
        if (resultsArary.length === 0) { return }

        /* Find the Username and Password */
        try {
            let apisNode = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadByNodeType('APIs')
            if (apisNode === undefined) {
                UI.projects.education.spaces.docsSpace.navigateTo('Foundations', 'Topic', 'App Error - Github Credentials Missing', 'Anchor Github Credentials Missing')
                UI.projects.education.spaces.docsSpace.sidePanelTab.open()
                return
            }
            if (apisNode.githubAPI === undefined) {
                UI.projects.education.spaces.docsSpace.navigateTo('Foundations', 'Topic', 'App Error - Github Credentials Missing', 'Anchor Github Credentials Missing')
                UI.projects.education.spaces.docsSpace.sidePanelTab.open()
                return
            }

            let config = JSON.parse(apisNode.githubAPI.config)
            if (config.username === undefined || config.username === "") {
                UI.projects.education.spaces.docsSpace.navigateTo('Foundations', 'Topic', 'App Error - Github Credentials Missing', 'Anchor Github Credentials Missing')
                UI.projects.education.spaces.docsSpace.sidePanelTab.open()
                return
            }
            if (config.token === undefined || config.token === "") {
                UI.projects.education.spaces.docsSpace.navigateTo('Foundations', 'Topic', 'App Error - Github Credentials Missing', 'Anchor Github Credentials Missing')
                UI.projects.education.spaces.docsSpace.sidePanelTab.open()
                return
            }



            requestStars()

            function requestStars() {
                httpRequest(
                    undefined,
                    'Gov/getGithubStars/' +
                    'Superalgos' + '/' +
                    config.username + '/' +
                    config.token
                    , onGithubStarsResponse)
            }

            function requestWatchers() {
                httpRequest(
                    undefined,
                    'Gov/getGithubWatchers/' +
                    'Superalgos' + '/' +
                    config.username + '/' +
                    config.token
                    , onGithubWatchersResponse)
            }

            function requestForks() {
                httpRequest(
                    undefined,
                    'Gov/getGithubForks/' +
                    'Superalgos' + '/' +
                    config.username + '/' +
                    config.token
                    , onGithubForksResponse)
            }

            function onGithubStarsResponse(err, githubData) {
                //console.log(githubData)
                /* Lets check the result of the call through the http interface */
                let githubStarsArray = JSON.parse(githubData)

                for (let i = 0; i < githubStarsArray.length; i++) {
                    let githubUsername = githubStarsArray[i]
                    thisObject.githubStars.set(githubUsername, 1)
                }

                requestWatchers()
            }

            function onGithubWatchersResponse(err, githubData) {
                //console.log(githubData)
                /* Lets check the result of the call through the http interface */
                let githubWatchersArray = JSON.parse(githubData)

                for (let i = 0; i < githubWatchersArray.length; i++) {
                    let githubUsername = githubWatchersArray[i]
                    thisObject.githubWatchers.set(githubUsername, 1)
                }

                requestForks()
            }

            function onGithubForksResponse(err, githubData) {
                //console.log(githubData)
                /* Lets check the result of the call through the http interface */
                let githubForksArray = JSON.parse(githubData)

                for (let i = 0; i < githubForksArray.length; i++) {
                    let githubUsername = githubForksArray[i]
                    thisObject.githubForks.set(githubUsername, 1)
                }
            }

        } catch (err) {
            console.log(err.stack)
        }
    }

    function finalize() {
        thisObject.githubStars = undefined

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
        /*
        Here we will run the distribution process, that in turn will run all the programs.
        */
        UI.projects.governance.functionLibraries.distributionProcess.calculate()
        /*
        Load the user profiles with Token Power.
        */
        let userProfiles = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('User Profile')
        if (waitingForResponses !== 0) { return }
        /*
        We will get all the user Profiles tokens from the blockchain, making a call
        every 5 seconds so as not to exceed the rate limit.
        */
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            if (userProfile.payload === undefined) { continue }

            if (userProfile.payload.blockchainTokens === undefined) {
                getBlockchainAccount(userProfile)
            }
        }


        function getBlockchainAccount(userProfile) {
            let signature = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(userProfile.payload, 'signature')
            if (signature === undefined || signature === "") { return }

            let request = {
                url: 'WEB3',
                params: {
                    method: "recoverAddress",
                    signature: JSON.stringify(signature)
                }
            }

            httpRequest(JSON.stringify(request.params), request.url, onResponse)

            function onResponse(err, data) {
                /* Lets check the result of the call through the http interface */
                if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    userProfile.payload.uiObject.setErrorMessage('Call via HTTP Interface failed.')
                    return
                }

                let response = JSON.parse(data)

                /* Lets check the result of the method call */
                if (response.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    userProfile.payload.uiObject.setErrorMessage('Call to WEB3 Server failed. ' + response.error)
                    console.log('Call to WEB3 Server failed. ' + response.error)
                    return
                }

                let blockchainAccount = response.address
                userProfile.payload.blockchainAccount = blockchainAccount
                if (
                    blockchainAccount !== undefined &&
                    blockchainAccount !== "" &&
                    userProfile.payload.blockchainTokens === undefined
                ) {
                    waitingForResponses++
                    userProfile.payload.blockchainTokens = 0 // We need to set this value here so that the next call to BSCSCAN is not done more than once.
                    setTimeout(getBlockchainTokens, timer, userProfile, blockchainAccount)
                    timer = timer + 6000
                }
            }
        }

        function getBlockchainTokens(userProfile, blockchainAccount) {
            console.log('blockchainAccount ', blockchainAccount)
            const url = "https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=0xfb981ed9a92377ca4d75d924b9ca06df163924fd&address=" + blockchainAccount + "&tag=latest&apikey=YourApiKeyToken"

            fetch(url).then(function (response) {
                return response.json();
            }).then(function (data) {
                console.log(data)
                userProfile.payload.uiObject.setInfoMessage(data)
                userProfile.payload.blockchainTokens = Number(data.result) / 1000000000000000000
                waitingForResponses--
            }).catch(function (err) {
                const message = err.message + ' - ' + 'Can not access BSC SCAN servers.'
                console.log(message)
                userProfile.payload.uiObject.setErrorMessage(message, 1000)
                waitingForResponses--
            });
        }
    }

    function draw() {

    }
}
