exports.newGovernanceUtilitiesSigningAccounts = function newGovernanceUtilitiesSigningAccounts() {

    let thisObject = {
        installSigningAccount: installSigningAccount
    }

    return thisObject

    function installSigningAccount(
        userProfile,
        targetNode,
        targetNodeTypeCount,
        response
    ) {
        /*
        Try to load the Secrets file. 
        */
        let filePath = global.env.PATH_TO_SECRETS + '/'
        let fileName = "SigningAccountsSecrets.json"
        let fileContent 
        try {
            fileContent = SA.nodeModules.fs.readFileSync(filePath + '/' + fileName)
        }catch(err) {
            /* If the file does not exist, then we'll get here.*/
        }
        
        let secretsFile
        if (fileContent === undefined) {
            secretsFile = {
                secrets: []
            }
        } else {
            secretsFile = JSON.parse(fileContent)
        }

        /*
        Take care of the naming of the target nodes. 
        */

        /*
        Get Message to Sign.
        */
        let userProfileHandle = SA.projects.visualScripting.utilities.nodeConfiguration.loadConfigProperty(userProfile, 'codeName')

        if (userProfileHandle === undefined || userProfileHandle === "") {
            response = {
                result: 'Error',
                message: 'User Profile codeName config property missing.'
            }
            return response
        }
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
        targetNode.name = targetNode.type + " #" + targetNodeTypeCount
        let codeName = targetNode.type.replaceAll(' ', '-') + "-" + targetNodeTypeCount
        /*
        We store at the Config the Signed userProfileHandle
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
        Deal with secrets
        */
        let secret = {
            nodeId: targetNode.id,
            nodeName: targetNode.name,
            nodeType: targetNode.type,
            nodeCodeName: codeName,
            signingAccountNodeId: signingAccount.id,
            blockchainAccount: blockchainAccount,
            privateKey: privateKey,
            userProfileHandle: userProfileHandle,
            userProfileId: userProfile.id
        }

        secretsFile.secrets.push(secret)
        /*
        Save Signing Accounts Secrets File
        */
        SA.projects.foundations.utilities.filesAndDirectories.createNewDir(filePath)
        SA.nodeModules.fs.writeFileSync(filePath + '/' + fileName, JSON.stringify(secretsFile, undefined, 4))
    }
}
