function newGovernanceUtilitiesChains() {
    let thisObject = {
        getSATokenAddress: getSATokenAddress,
        getSATokenDetails: getSATokenDetails
    }

    return thisObject

    function getSATokenAddress(chain) {
        let SATokenAddress = undefined
        const SATokenList = UI.projects.governance.globals.saToken.SA_TOKEN_LIST
        for (let tokenConfig of SATokenList) {
            if (tokenConfig['chain'] === chain) {
                SATokenAddress = tokenConfig['contractAddress']
                break
            }
        }
        return SATokenAddress
    }

    function getSATokenDetails(chain) {
        let SATokenDetails = undefined
        const SATokenList = UI.projects.governance.globals.saToken.SA_TOKEN_LIST
        for (let tokenConfig of SATokenList) {
            if (tokenConfig['chain'] === chain) {
                SATokenDetails = tokenConfig
                break
            }
        }
        return SATokenDetails
    }

}