function newEthereumWalletSpace() {
    const MODULE_NAME = 'Wallet Space'
 
    let thisObject = {
        container: undefined,
        physics: physics,
        draw: draw, 
        getContainer: getContainer,
        finalize: finalize,
        initialize: initialize
    }

    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)

    return thisObject

    function finalize() {

        thisObject.container.finalize()
        thisObject.container = undefined
    }

    function initialize() {

    }

    function physics() {

    }

    function getContainer(point) {

        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            thisObject.container.space = MODULE_NAME
            return thisObject.container
        } else {
            return undefined
        }
    }

    function draw() {
 
    }
 }
