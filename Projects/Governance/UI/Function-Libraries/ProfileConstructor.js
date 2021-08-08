function newGovernanceFunctionLibraryProfileConstructor() {
    let thisObject = {
        buildProfile: buildProfile
    }

    return thisObject

    function buildProfile(
        node,
        rootNodes
    ) {
        /*
        Some validations first...
        */
        let githubUsername = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(node.payload, 'githubUsername')

        if (githubUsername === undefined || githubUsername === "") {
            node.payload.uiObject.setErrorMessage("githubUsername config property missing.")
            return
        }

        let userProfile = UI.projects.foundations.functionLibraries.uiObjectsFromNodes.addUIObject(
            node,
            'User Profile',
            UI.projects.foundations.spaces.designSpace.workspace.workspaceNode.rootNodes
            )

        createNewAccount()

        function createNewAccount() {
            let params = {
                method: 'createWalletAccount',
                entropy: node.id + (new Date()).valueOf()
            }

            let url = 'WEB3' // We will access the default Client WEB3 endpoint.

            httpRequest(JSON.stringify(params), url, onResponse)

            function onResponse(err, data) {
                /* Lets check the result of the call through the http interface */
                if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    node.payload.uiObject.setErrorMessage('Call via HTTP Interface failed.')
                    walletAccountNode.payload.uiObject.menu.internalClick('Delete UI Object')
                    return
                }

                let response = JSON.parse(data)

                /* Lets check the result of the method call */
                if (response.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    node.payload.uiObject.setErrorMessage('Call to WEB3 Server failed. ' + response.error)
                    return
                }

                signUserProfileData(response.address, response.privateKey)
            }
        }

        function signUserProfileData(address, privateKey) {

            let request = {
                url: 'WEB3',
                params: {
                    method: "signData",
                    privateKey: privateKey,
                    data: githubUsername
                }
            }

            httpRequest(JSON.stringify(request.params), request.url, onResponse)

            function onResponse(err, data) {
                /* Lets check the result of the call through the http interface */
                if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    node.payload.uiObject.setErrorMessage('Call via HTTP Interface failed.')
                    return
                }

                let response = JSON.parse(data)

                /* Lets check the result of the method call */
                if (response.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    node.payload.uiObject.setErrorMessage('Call to WEB3 Server failed. ' + response.error)
                    console.log('Call to WEB3 Server failed. ' + response.error)
                    return
                }
                /*
                We store at the User Profile the Signed githubUsername
                */
                UI.projects.foundations.utilities.nodeConfig.saveConfigProperty(userProfile.payload, 'signature', response.signature)
                UI.projects.foundations.utilities.nodeConfig.saveConfigProperty(node.payload, 'address', address)
                UI.projects.foundations.utilities.nodeConfig.saveConfigProperty(node.payload, 'privateKey', privateKey)
                /*
                We set the name of the User Profile as the githubUsername
                */
                userProfile.name = githubUsername
                /*
                We also Install the User Profile as a Plugin, which in turns saves it.
                */
                userProfile.payload.uiObject.menu.internalClick('Install as Plugin')
                userProfile.payload.uiObject.menu.internalClick('Install as Plugin')
                /*
                Show nice message.
                */
                node.payload.uiObject.setInfoMessage("Profile Private Key has been successfully created. User Profile installed as a plugin and saved. Use the Private Key at a crypto wallet and delete this node once done.", 10000)
            }
        }
    }
}
