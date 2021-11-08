function newGovernanceFunctionLibraryProfileConstructor() {
    let thisObject = {
        buildProfile: buildProfile,
        addSigningAccount: addSigningAccount
    }

    return thisObject

    function buildProfile(
        node,
        rootNodes
    ) {
        /*
        Some validations first...
        */
        let githubUsername = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload, 'githubUsername')
        let mnemonic = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload, 'mnemonic')

        if (githubUsername === undefined || githubUsername === "") {
            node.payload.uiObject.setErrorMessage(
                "githubUsername config property missing.",
                UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
            )
            return
        }

        createWallet()

        function createWallet() {
            let params

            /*
            If the user provides a mnemonic then we will get the private key and address from it,
            otherwise, we will create a new private key and address.
            */
            if (mnemonic === undefined || mnemonic === "") {
                params = {
                    method: 'createWalletAccount',
                    entropy: node.id + (new Date()).valueOf()
                }
            } else {
                params = {
                    method: 'mnemonicToPrivateKey',
                    mnemonic: mnemonic
                }
            }

            let url = 'WEB3' // We will access the default Client WEB3 endpoint.

            httpRequest(JSON.stringify(params), url, onResponse)

            function onResponse(err, data) {
                /* Lets check the result of the call through the http interface */
                if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    node.payload.uiObject.setErrorMessage(
                        'Call via HTTP Interface failed.',
                        UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                    )
                    return
                }

                let response = JSON.parse(data)

                /* Lets check the result of the method call */
                if (response.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {

                    if (mnemonic === undefined || mnemonic === "") {
                        node.payload.uiObject.setErrorMessage(
                            'Call to WEB3 Server failed. ' + response.error,
                            UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                        )
                        console.log('Call to WEB3 Server failed. ' + response.error)
                        return
                    } else {
                        node.payload.uiObject.setErrorMessage(
                            'Call to WEB3 Server failed. Most likely the Mnemonic provided is not correct or you need to run node setup because a dependency is missing. ' + response.error,
                            UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                        )
                        console.log('Call to WEB3 Server failed. Most likely the Mnemonic provided is not correct or you need to run node setup because a dependency is missing. ' + response.error)
                        return
                    }
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
                    node.payload.uiObject.setErrorMessage(
                        'Call via HTTP Interface failed.',
                        UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                    )
                    return
                }

                let response = JSON.parse(data)

                /* Lets check the result of the method call */
                if (response.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    node.payload.uiObject.setErrorMessage(
                        'Call to WEB3 Server failed. ' + response.error,
                        UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                    )
                    console.log('Call to WEB3 Server failed. ' + response.error)
                    return
                }
                let userProfile = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(
                    node,
                    'User Profile',
                    UI.projects.foundations.spaces.designSpace.workspace.workspaceNode.rootNodes
                )
                /*
                We store at the User Profile the Signed githubUsername
                */
                UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(userProfile.payload, 'signature', response.signature)
                UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(node.payload, 'address', address)
                UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(node.payload, 'privateKey', privateKey)
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
                if (mnemonic === undefined || mnemonic === "") {
                    node.payload.uiObject.setInfoMessage(
                        "Profile Private Key has been successfully created. User Profile installed as a plugin and saved. Use the Private Key at a crypto wallet and delete this node once done.",
                        UI.projects.governance.globals.designer.SET_INFO_COUNTER_FACTOR
                    )
                } else {
                    node.payload.uiObject.setInfoMessage(
                        "Mnemonic successfully imported. User Profile installed as a plugin and saved. Your external wallet was sucessfully linked to your profile.",
                        UI.projects.governance.globals.designer.SET_INFO_COUNTER_FACTOR
                    )
                }
            }
        }
    }

    function addSigningAccount(
        node,
        rootNodes,
        targetNodeType
    ) {
        let githubUsername = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload, 'githubUsername')
        let mnemonic = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload, 'mnemonic')
        let signingAccounts

        if (githubUsername === undefined || githubUsername === "") {
            node.payload.uiObject.setErrorMessage(
                "githubUsername config property missing.",
                UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
            )
            return
        }

        /*
        Some validations first...
        */
        if (node.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage(
                "The Profile Contstructor needs to reference your User Profile.",
                UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
            )
            return
        }

        if (node.payload.referenceParent.signingAccounts === undefined) {
            signingAccounts = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(
                node.payload.referenceParent,
                'Signing Accounts',
                UI.projects.foundations.spaces.designSpace.workspace.workspaceNode.rootNodes
            )
        } else {
            signingAccounts = node.payload.referenceParent.signingAccounts
        }

        createWallet()

        function createWallet() {
            let params
            /*
            If the user provides a mnemonic then we will get the private key and address from it,
            otherwise, we will create a new private key and address.
            */
            if (mnemonic === undefined || mnemonic === "") {
                params = {
                    method: 'createWalletAccount',
                    entropy: node.id + (new Date()).valueOf()
                }
            } else {
                params = {
                    method: 'mnemonicToPrivateKey',
                    mnemonic: mnemonic
                }
            }

            let url = 'WEB3' // We will access the default Client WEB3 endpoint.

            httpRequest(JSON.stringify(params), url, onResponse)

            function onResponse(err, data) {
                /* Lets check the result of the call through the http interface */
                if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    node.payload.uiObject.setErrorMessage(
                        'Call via HTTP Interface failed.',
                        UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                    )
                    return
                }

                let response = JSON.parse(data)

                /* Lets check the result of the method call */
                if (response.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {

                    if (mnemonic === undefined || mnemonic === "") {
                        node.payload.uiObject.setErrorMessage(
                            'Call to WEB3 Server failed. ' + response.error,
                            UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                        )
                        console.log('Call to WEB3 Server failed. ' + response.error)
                        return
                    } else {
                        node.payload.uiObject.setErrorMessage(
                            'Call to WEB3 Server failed. Most likely the Mnemonic provided is not correct or you need to run node setup because a dependency is missing. ' + response.error,
                            UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                        )
                        console.log('Call to WEB3 Server failed. Most likely the Mnemonic provided is not correct or you need to run node setup because a dependency is missing. ' + response.error)
                        return
                    }
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
                    node.payload.uiObject.setErrorMessage(
                        'Call via HTTP Interface failed.',
                        UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                    )
                    return
                }

                let response = JSON.parse(data)

                /* Lets check the result of the method call */
                if (response.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    node.payload.uiObject.setErrorMessage(
                        'Call to WEB3 Server failed. ' + response.error,
                        UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                    )
                    console.log('Call to WEB3 Server failed. ' + response.error)
                    return
                }

                createSigningAccount(response.signature)
            }

            function createSigningAccount(signature) {

                let signingAccount = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(
                    signingAccounts,
                    'Signing Account',
                    UI.projects.foundations.spaces.designSpace.workspace.workspaceNode.rootNodes
                )
                
                let signingAccountChild = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(
                    signingAccount,
                    targetNodeType,
                    UI.projects.foundations.spaces.designSpace.workspace.workspaceNode.rootNodes
                )
                /*
                Let's get a cool name for this node. 
                */
                let targetNodeTypeCount = 0
                for (let i = 0; i < signingAccounts.signingAccounts.length; i++) {
                    let singningAccount = signingAccounts.signingAccounts[i]
                    if (singningAccount.signingAccountChild.type === targetNodeType) {
                        targetNodeTypeCount++
                    }
                }
                signingAccountChild.name = targetNodeType +" # " + targetNodeTypeCount
                let codeName = targetNodeType.replaceAll(' ', '-') + "-" + targetNodeTypeCount
                /*
                We store at the User Profile the Signed githubUsername
                */
                UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(signingAccountChild.payload, 'codeName', codeName)
                UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(signingAccount.payload, 'signature', signature)

                let secrets = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload, 'secrets', signingAccount.name)
                if (secrets === undefined) {
                    secrets = []
                }

                let secret = {
                    signingAccountChildId: signingAccountChild.id,
                    signingAccountChildName: signingAccountChild.name,
                    signingAccountChildType: targetNodeType,
                    signingAccountChildCodeName: codeName,
                    signingAccountNodeId: signingAccount.id,
                    privateKey: privateKey,
                    userProfileHandle: githubUsername,
                    userProfileId: node.payload.referenceParent.id
                }

                secrets.push(secret)
                
                UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(node.payload, 'secrets', secrets)
                /*
                Show nice message.
                */
                if (mnemonic === undefined || mnemonic === "") {
                    node.payload.uiObject.setInfoMessage(
                        "Signing Account has been successfully created.",
                        UI.projects.governance.globals.designer.SET_INFO_COUNTER_FACTOR
                    )
                } else {
                    node.payload.uiObject.setInfoMessage(
                        "Mnemonic successfully imported. Signing Account has been successfully created.",
                        UI.projects.governance.globals.designer.SET_INFO_COUNTER_FACTOR
                    )
                }
            }
        }
    }
}
