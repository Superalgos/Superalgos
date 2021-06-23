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
        if (node.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage("You need to reference the node that contains the data to be signed.")
            return
        }
        let data = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(node.payload, 'githubUsername')

        if (data === undefined || data === "") {
            node.payload.referenceParent.payload.uiObject.setErrorMessage("githubUsername config property missing.")
            return
        }

        createNewAccount()

        function createNewAccount() {
            let params = {
                method: 'createWalletAccount',
                entropy: node.id + (new Date()).valueOf()
            }

            let url = 'WEB3' // we don't need to ask this to any specific superalgos node.

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
                    data: data
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
                UI.projects.foundations.utilities.nodeConfig.saveConfigProperty(node.payload.referenceParent.payload, 'signature', response.signature)
                UI.projects.foundations.utilities.nodeConfig.saveConfigProperty(node.payload, 'address', address)
                UI.projects.foundations.utilities.nodeConfig.saveConfigProperty(node.payload, 'privateKey', privateKey)

                node.payload.uiObject.setInfoMessage("Profile Account has been successfully created.")
            }
        }
    }
}
