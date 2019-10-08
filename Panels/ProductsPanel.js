function newProductsPanel () {
  let thisObject = {
    name: 'Products Panel',
    fitFunction: undefined,
    container: undefined,
    productCards: [],
    getLoadingProductCards: getLoadingProductCards,
    draw: draw,
    getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
    initialize: initialize
  }

   /* Cointainer stuff */

  let container = newContainer()

  container.initialize()

  container.isDraggeable = true
  container.isWheelable = true

  thisObject.container = container

  let isInitialized = false

  let visibleProductCards = []
  let firstVisibleCard = 1

   /* Needed Variables */

  let lastY = 5
  let panelTabButton

  let exchange
  let market

  return thisObject

  function initialize (pExchange, pMarket) {
    exchange = pExchange
    market = pMarket

    thisObject.container.name = 'Layers @ ' + exchange + ' ' + market.assetB + '/' + market.assetA
    thisObject.container.frame.containerName = thisObject.container.name
    thisObject.container.frame.width = UI_PANEL.WIDTH.LARGE
    thisObject.container.frame.height = UI_PANEL.HEIGHT.LARGE * 2 // viewPort.visibleArea.bottomLeft.y - viewPort.visibleArea.topLeft.y // UI_PANEL.HEIGHT.LARGE;

    let position = {
      x: viewPort.visibleArea.topLeft.x,
      y: viewPort.visibleArea.topLeft.y// viewPort.visibleArea.bottomLeft.y - thisObject.container.frame.height
    }

    thisObject.container.frame.position = position

    panelTabButton = newPanelTabButton()
    panelTabButton.parentContainer = thisObject.container
    panelTabButton.container.frame.parentFrame = thisObject.container.frame
    panelTabButton.fitFunction = thisObject.fitFunction
    panelTabButton.initialize()

       /* First thing is to build the thisObject.productCards array */

    let ecosystem = JSON.parse(window.localStorage.getItem('ecosystem'))
    if (ecosystem === null || ecosystem === undefined) {
      ecosystem = getUserEcosystem()
    }

    for (let i = 0; i < ecosystem.devTeams.length; i++) {
      let devTeam = ecosystem.devTeams[i]

      for (let j = 0; j < devTeam.bots.length; j++) {
        let bot = devTeam.bots[j]
        if (bot.type !== 'Indicator' && (bot.cloneId === undefined || bot.cloneId === null)) { continue }

        if (bot.products !== undefined) {
          for (let k = 0; k < bot.products.length; k++) {
            let product = bot.products[k]
                       /* Now we create Product objects */

            let productCard = newProductCard()

            productCard.devTeam = devTeam
            productCard.bot = bot
            productCard.product = product
            productCard.fitFunction = thisObject.fitFunction
            productCard.code = exchange + '-' + market.assetB + '/' + market.assetA + '-' + devTeam.codeName + '-' + bot.codeName + '-' + product.codeName

                       /* Initialize it */

            productCard.initialize()

                       /* Container Stuff */

            productCard.container.displacement.parentDisplacement = thisObject.container.displacement
            productCard.container.frame.parentFrame = thisObject.container.frame
            productCard.container.parentContainer = thisObject.container
            productCard.container.isWheelable = true

                       /* Positioning within thisObject Panel */

            let position = {
              x: 10,
              y: thisObject.container.frame.height - thisObject.container.frame.getBodyHeight()
            }

            productCard.container.frame.position.x = position.x
            productCard.container.frame.position.y = position.y + lastY

            lastY = lastY + productCard.container.frame.height

                       /* Add to the Product Array */

            thisObject.productCards.push(productCard)

                       /* Add to Visible Product Array */

            if (productCard.container.frame.position.y + productCard.container.frame.height < thisObject.container.frame.height) {
              visibleProductCards.push(productCard)
            }

                       /* Listen to Status Changes Events */

            productCard.container.eventHandler.listenToEvent('Status Changed', onProductCardStatusChanged)
            productCard.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)
          }
        }
      }
    }

    thisObject.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)
    isInitialized = true
  }

  function onMouseWheel (event) {
    delta = event.wheelDelta
    if (delta > 0) {
      delta = -1
    } else {
      delta = 1
    }

    firstVisibleCard = firstVisibleCard + delta

    let availableSlots = visibleProductCards.length

    if (firstVisibleCard < 1) { firstVisibleCard = 1 }
    if (firstVisibleCard > (thisObject.productCards.length - availableSlots + 1)) { firstVisibleCard = thisObject.productCards.length - availableSlots + 1 }

    visibleProductCards = []
    let lastY = 5

    for (let i = 0; i < thisObject.productCards.length; i++) {
      if (i + 1 >= firstVisibleCard && i + 1 < firstVisibleCard + availableSlots) {
        let productCard = thisObject.productCards[i]

               /* Positioning within thisObject Panel */

        let position = {
          x: 10,
          y: thisObject.container.frame.height - thisObject.container.frame.getBodyHeight()
        }
        productCard.container.frame.position.x = position.x
        productCard.container.frame.position.y = position.y + lastY

        lastY = lastY + productCard.container.frame.height

               /* Add to Visible Product Array */

        visibleProductCards.push(productCard)
      }
    }
  }

  function onProductCardStatusChanged (pProductCard) {
    thisObject.container.eventHandler.raiseEvent('Product Card Status Changed', pProductCard)
  }

  function getLoadingProductCards () {
       /* Returns all thisObject.productCards which status is LOADING */

    let onProducts = []

    for (let i = 0; i < thisObject.productCards.length; i++) {
      if (thisObject.productCards[i].status === PRODUCT_CARD_STATUS.LOADING) {
        onProducts.push(thisObject.productCards[i])
      }
    }

    return onProducts
  }

  function getContainer (point) {
    let container

    container = panelTabButton.getContainer(point)
    if (container !== undefined) { return container }

       /* First we check if thisObject point is inside thisObject space. */

    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
           /* Now we see which is the inner most container that has it */

      for (let i = 0; i < visibleProductCards.length; i++) {
        container = visibleProductCards[i].getContainer(point)

        if (container !== undefined) {
          let checkPoint = {
            x: point.x,
            y: point.y
          }

          checkPoint = thisObject.fitFunction(checkPoint)

          if (point.x === checkPoint.x && point.y === checkPoint.y) {
            return container
          }
        }
      }

           /* The point does not belong to any inner container, so we return the current container. */

      let checkPoint = {
        x: point.x,
        y: point.y
      }

      checkPoint = thisObject.fitFunction(checkPoint)

      if (point.x === checkPoint.x && point.y === checkPoint.y) {
        return thisObject.container
      }
    }
  }

  function draw () {
    if (isInitialized === false) { return }

    thisObject.container.frame.draw(false, false, true, thisObject.fitFunction)

    for (let i = 0; i < visibleProductCards.length; i++) {
      visibleProductCards[i].draw()
    }

    panelTabButton.draw()
  }
}
