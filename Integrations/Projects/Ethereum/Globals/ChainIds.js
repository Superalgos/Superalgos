function newEthereumGlobalsChainIds() {
    thisObject = {
        chainNameById: chainNameById
    }
    return thisObject

    function chainNameById(chainId) {
        switch(chainId) {
            case 1: return 'Ethereum Mainnet'
            case 3: return 'Ethereum Ropsten'
            case 4: return 'Ethereum Rinkeby'
            case 42: return 'Ethereum Kovan'
            case 61: return 'Ethereum Classic Mainnet'
            case 62: return 'Ethereum Classic Morden'
            default: return 'Unknown Network'
        }
    }
}