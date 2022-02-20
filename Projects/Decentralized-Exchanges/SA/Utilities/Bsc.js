exports.newDecentralizedExchangesUtilitiesBsc = function () {
    let thisObject = {
        getTokens: getTokens,
        getTokenAbi: getTokenAbi
    }

    return thisObject

    async function getTokens() {
        const fs = require('fs')
        const path = require('path')
        let jsonData = JSON.parse(fs.readFileSync(path.resolve(__dirname, './Schemas/Bsc.json')))
        let tokenList = jsonData.tokens
        return tokenList
    }

    async function getTokenAbi(contractAddress) {
        let defaultAbi = [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function balanceOf(address) view returns (uint)"
        ]
        let tokenList = getTokens()
        let abi = tokenList.filter(item => {
            if (item.contractAddress === contractAddress) {
                if ('abi' in item) {
                    return item.abi
                } else {
                    return 'undefined'
                }
            }
        })
        if (abi === 'undefined') {
            abi = defaultAbi
        }
        return abi
    }
}
