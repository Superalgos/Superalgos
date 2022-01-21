exports.newGovernanceUtilitiesSigningAccounts = function newGovernanceUtilitiesSigningAccounts() {

    let thisObject = {
        installSigningAccounts: installSigningAccounts
    }

    return thisObject

    function installSigningAccounts(
        userProfile
    ) {
        let secretsFile = {
            secrets: []
        }
        /*
        Get Message to Sign.
        */
        let userProfileHandle = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(userProfile.payload, 'codeName')

        if (userProfileHandle === undefined || userProfileHandle === "") {
            let response = {
                result: 'Error',
                message: 'User Profile codeName config property missing.'
            }
            return response
        }

        let algoTradersPlatformApp = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfile.userApps, 'Algo Traders Platform App')
        let socialTradingDesktopApp = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfile.userApps, 'Social Trading Desktop App')
        let socialTradingMobileApp = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfile.userApps, 'Social Trading Mobile App')
        let socialTradingServerApp = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfile.userApps, 'Social Trading Server App')
        let taskServerApp = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfile.userApps, 'Task Server App')
        let socialTradingBots = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfile.userBots, 'Social Trading Bot')
        let socialPersonas = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfile.socialPersonas, 'Social Persona')
        let p2pNetworkNodes = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfile.p2pNetworkNodes, 'P2P Network Node')

        addSigningAccounts(algoTradersPlatformApp, 'Algo Traders Platform')
        addSigningAccounts(socialTradingDesktopApp, 'Social Trading Desktop App')
        addSigningAccounts(socialTradingMobileApp, 'Social Trading Mobile App')
        addSigningAccounts(socialTradingServerApp, 'Social Trading Server App')
        addSigningAccounts(taskServerApp, 'Task Server App')
        addSigningAccounts(socialTradingBots, 'Social Trading Bot')
        addSigningAccounts(socialPersonas, 'Social Persona')
        addSigningAccounts(p2pNetworkNodes, 'P2P Network Node')
        /*
        Save Signing Accounts Secrets File
        */
        let filePath = global.env.PATH_TO_SECRETS + '/'
        let fileName = "SigningAccountsSecrets.json"

        SA.projects.foundations.utilities.filesAndDirectories.createNewDir(filePath)
        SA.nodeModules.fs.writeFileSync(filePath + '/' + fileName, secretsFile)

        function addSigningAccounts(nodeArray, targetNodeType) {
            if (nodeArray === undefined) return;
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
            /*
            Create a Wallet for the new User Profile and get the Private Key.
            */
            const Web3 = SA.nodeModules.web3
            let web3 = new Web3()
            let account = web3.eth.accounts.create()
            let blockchainAccount = account.address
            let privateKey = account.privateKey
            /*
            Sign the Signing Account with the Wallet Private Key.
            */
            let signature = web3.eth.accounts.sign(userProfileHandle, privateKey)
            /*
            Let's get a cool name for this node. 
            */
            targetNode.name = targetNodeType + " #" + targetNodeTypeCount
            let codeName = targetNodeType.replaceAll(' ', '-') + "-" + targetNodeTypeCount
            let handle = userProfileHandle + '-' + codeName
            /*
            We store at the User Profile the Signed userProfileHandle
            */
            let config = {
                codeName: codeName,
                signature: signature
            }
            /*
            Code Name for the Target Node
            */
            SA.projects.visualScripting.utilities.nodeConfiguration.saveConfigProperty(targetNode, 'codeName', codeName)
            /*
            Create the Signing Account Node
            */
            let signingAccount = {
                type: 'Signing Account',
                name: 'New Signing Account',
                project: 'Governance',
                id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                config: JSON.stringify(config)
            }
            targetNode.signingAccount = signingAccount
            /*
            For Social Entities, we will automatically create a default handle
            */
            if (targetNode.type === "Social Persona" || targetNode.type === "Social Trading Bot") {
                SA.projects.visualScripting.utilities.nodeConfiguration.saveConfigProperty(targetNode, 'handle', handle)
            }
            /*
            Deal with secrets
            */
            let secrets = secretsFile.secrets

            let secret = {
                nodeId: targetNode.id,
                nodeName: targetNode.name,
                nodeType: targetNodeType,
                nodeCodeName: codeName,
                signingAccountNodeId: signingAccount.id,
                blockchainAccount: blockchainAccount,
                privateKey: privateKey,
                userProfileHandle: userProfileHandle,
                userProfileId: userProfile.id
            }

            secrets.push(secret)
        }
    }
}
