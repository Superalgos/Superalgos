function newEthereumFunctionLibraryAccounts() {
    thisObject = {
        createWalletAccount: createWalletAccount
    }

    return thisObject

    function createWalletAccount(node) {

        let walletAccountNode = UI.projects.superalgos.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Wallet Account')

        let params = {
            method: 'createWalletAccount',
            entropy: walletAccountNode.id
        }

        let url = 'WEB3' // we don't need to ask this to any specific superalgos node.

        httpRequest(JSON.stringify(params), url, onResponse)

        function onResponse(err, data) {
            /* Lets check the result of the call through the http interface */
            if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                node.payload.uiObject.setErrorMessage('Call via HTTP Interface failed.')
                walletAccountNode.payload.uiObject.menu.internalClick('Delete UI Object')
                walletAccountNode.payload.uiObject.menu.internalClick('Delete UI Object')
                return
            }

            let response = JSON.parse(data)

            /* Lets check the result of the method call */
            if (response.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                node.payload.uiObject.setErrorMessage('Call to WEB3 Server failed. ' + response.error)
                walletAccountNode.payload.uiObject.menu.internalClick('Delete UI Object')
                walletAccountNode.payload.uiObject.menu.internalClick('Delete UI Object')
                return
            }

            let config = {
                address: response.address,
                privateKey: response.privateKey
            }

            walletAccountNode.config = JSON.stringify(config, null, 4)
            walletAccountNode.name =
                response.address[response.address.length - 4] +
                response.address[response.address.length - 3] +
                response.address[response.address.length - 2] +
                response.address[response.address.length - 1]
        }
    }
}
