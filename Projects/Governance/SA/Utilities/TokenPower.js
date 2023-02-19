exports.newGovernanceUtilitiesTokenPower = function newGovernanceUtilitiesTokenPower() {

    let thisObject = {
        getTaskServerAppTokenPower: getTaskServerAppTokenPower
    }

    return thisObject

    function getTaskServerAppTokenPower(userProfile, blockchainAccount) {
        /*
         Determine the Token Power allocated to a Task Server App which is behind a defined Blockchain Account.
        */
        let signingAccounts = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfile, 'Signing Account')
        if (signingAccounts === undefined || signingAccounts.length === 0) { return }

        for (let j = 0; j < signingAccounts.length; j++) {
            let signingAccount = signingAccounts[j]
            let networkClient = signingAccount.parentNode
            if (networkClient.blockchainAccount === blockchainAccount) {
                let tokenPowerAllocation = networkClient.payload.tokenPower
                return tokenPowerAllocation
            }
        }
    }
}