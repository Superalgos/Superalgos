function newGovernanceFunctionLibraryProfileConstructor() {
    let thisObject = {
        buildProfile: buildProfile,
        installSecrets: installSecrets
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
                Delete the mnemonic from the Profile Constructor config.
                */
                node.config = "{}"
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

    function installSecrets(
        node,
        rootNodes
    ) {
        let secretsFile = {
            secrets: []
        }
        let userProfile = node.payload.referenceParent
        /*
        Get Message to Sign.
        */
        let userProfileHandle = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(userProfile.payload, 'codeName')

        if (userProfileHandle === undefined || userProfileHandle === "") {
            node.payload.uiObject.setErrorMessage(
                "User Profile codeName config property missing.",
                UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
            )
            return
        }
        /*
        Checking the reference to the User Profile...
        */
        if (node.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage(
                "The Profile Contstructor needs to reference your User Profile.",
                UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
            )
            return
        }
        /*
        Delete Signing Accounts with all its children, it it exists.
        */
        if (userProfile.signingAccounts !== undefined) {
            let rootNodes = UI.projects.foundations.spaces.designSpace.workspace.workspaceNode.rootNodes
            UI.projects.visualScripting.functionLibraries.nodeDeleter.deleteUIObject(userProfile.signingAccounts, rootNodes)
        }
        /*
        Create Signing Accounts.
        */
        let signingAccounts = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(
            userProfile,
            'Signing Accounts',
            UI.projects.foundations.spaces.designSpace.workspace.workspaceNode.rootNodes
        )

        let algoTradersPlatform = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(userProfile.userApps, 'Algo Traders Platform')
        let socialTradingDesktopApp = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(userProfile.userApps, 'Social Trading Desktop App')
        let socialTradingMobileApp = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(userProfile.userApps, 'Social Trading Mobile App')
        let socialTradingServerApp = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(userProfile.userApps, 'Social Trading Server App')
        let socialTradingBots = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(userProfile.userBots, 'Social Trading Bot')
        let socialPersonas = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(userProfile.socialPersonas, 'Social Persona')
        let p2pNetworkNodes = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(userProfile.p2pNetworkNodes, 'P2P Network Node')

        addSigningAccounts(algoTradersPlatform, 'Algo Traders Platform')
        addSigningAccounts(socialTradingDesktopApp, 'Social Trading Desktop App')
        addSigningAccounts(socialTradingMobileApp, 'Social Trading Mobile App')
        addSigningAccounts(socialTradingServerApp, 'Social Trading Server App')
        addSigningAccounts(socialTradingBots, 'Social Trading Bot')
        addSigningAccounts(socialPersonas, 'Social Persona')
        addSigningAccounts(p2pNetworkNodes, 'P2P Network Node')

        function addSigningAccounts(nodeArray, targetNodeType) {
            for (let i = 0; i < nodeArray.length; i++) {
                let currentNode = nodeArray[i]
                addSigningAccount(currentNode, targetNodeType, i + 1)
            }
        }

        function addSigningAccount(
            targetNode,
            targetNodeType,
            targetNodeTypeCount
        ) {
            let params = {
                method: 'createWalletAccount',
                entropy: node.id + (new Date()).valueOf()
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
                    node.payload.uiObject.setErrorMessage(
                        'Call to WEB3 Server failed. ' + response.error,
                        UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                    )
                    console.log('Call to WEB3 Server failed. ' + response.error)
                    return
                }
                signSigningAccountData(response.privateKey)
            }

            function signSigningAccountData(privateKey) {

                let request = {
                    url: 'WEB3',
                    params: {
                        method: "signData",
                        privateKey: privateKey,
                        data: userProfileHandle
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

                    signingAccount.payload.floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_180

                    UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(signingAccount, targetNode)
                    /*
                    Let's get a cool name for this node. 
                    */
                    targetNode.name = targetNodeType + " #" + targetNodeTypeCount
                    let codeName = targetNodeType.replaceAll(' ', '-') + "-" + targetNodeTypeCount
                    /*
                    We store at the User Profile the Signed userProfileHandle
                    */
                    UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(targetNode.payload, 'codeName', codeName)
                    UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(signingAccount.payload, 'codeName', codeName)
                    UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(signingAccount.payload, 'signature', signature)

                    let secrets = secretsFile.secrets

                    let secret = {
                        nodeId: targetNode.id,
                        nodeName: targetNode.name,
                        nodeType: targetNodeType,
                        nodeCodeName: codeName,
                        signingAccountNodeId: signingAccount.id,
                        privateKey: privateKey,
                        userProfileHandle: userProfileHandle,
                        userProfileId: userProfile.id
                    }

                    secrets.push(secret)
                    /*
                    Save Secrets File
                    */
                    httpRequest(JSON.stringify(secretsFile, undefined, 4), 'Secrets/Save-Secrets-File', onResponse)
                    function onResponse(err, data) {
                        /* Lets check the result of the call through the http interface */
                        data = JSON.parse(data)
                        if (err.result != GLOBAL.DEFAULT_OK_RESPONSE.result || data.result != GLOBAL.DEFAULT_OK_RESPONSE.result) {
                            node.payload.uiObject.setErrorMessage(
                                "Secrets file could not be created.",
                                UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                            )
                        } else {
                            /*
                            Show nice message.
                            */
                            node.payload.uiObject.setInfoMessage(
                                "Secrets file have been sucessfully created.",
                                UI.projects.governance.globals.designer.SET_INFO_COUNTER_FACTOR
                            )
                        }
                    }
                }
            }
        }
    }
}
