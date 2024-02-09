exports.newDecentralizedExchangesModulesWallets = function () {
    let thisObject = {
        ethers: undefined,
        createWallet: createWallet,
        importWalletFromMnemonic: importWalletFromMnemonic,
        importWalletFromPrivateKey: importWalletFromPrivateKey,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    async function finalize() {}

    async function initialize() {
        const ethers = SA.nodeModules.ethers
        thisObject.ethers = ethers
    }

    async function createWallet() {
        try {
            let wallet = await thisObject.ethers.Wallet.createRandom()
            return wallet
        } catch(err) {
            SA.logger.error(err)
            return err
        }
    }

    async function importWalletFromMnemonic(mnemonic) {
        try {
            let wallet = await thisObject.ethers.Wallet.fromMnemonic(mnemonic)
            return wallet
        } catch(err) {
            SA.logger.error(err)
            return err
        }
    }

    async function importWalletFromPrivateKey(privateKey) {
        try {
            let wallet = new thisObject.ethers.Wallet(privateKey)
            return wallet
        } catch(err) {
            SA.logger.error(err)
            return err
        }
    }
}
