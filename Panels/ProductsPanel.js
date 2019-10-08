function newProductsPanel () {
  let thisObject = {
    name: 'Products Panel',
    fitFunction: undefined,
    container: undefined,
    productCards: [],
    getLoadingProductCards: getLoadingProductCards,
    physics: physics,
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

  let cardsMap = new Map()
  let visibleProductCards = []
  let firstVisibleCard = 1

   /* Needed Variables */

  const CANRD_SEPARATION = 5
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
    thisObject.container.frame.height = UI_PANEL.HEIGHT.LARGE * 1.5 // viewPort.visibleArea.bottomLeft.y - viewPort.visibleArea.topLeft.y // UI_PANEL.HEIGHT.LARGE;

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
        if (bot.type !== 'Indicator') { continue }

        if (bot.products !== undefined) {
          for (let k = 0; k < bot.products.length; k++) {
            let product = bot.products[k]

            addProductCard(devTeam, bot, product)
          }
        }
      }
    }

    thisObject.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)
    isInitialized = true
  }

  function addProductCard (devTeam, bot, product, session) {
    /* Now we create Product objects */
    let productCard = newProductCard()

    productCard.devTeam = devTeam
    productCard.bot = bot
    productCard.product = product
    productCard.fitFunction = thisObject.fitFunction
    productCard.code = exchange + '-' + market.assetB + '/' + market.assetA + '-' + devTeam.codeName + '-' + bot.codeName + '-' + product.codeName

    if (session !== undefined) {
      productCard.code = productCard.code + '-' + session.id
    }
    productCard.session = session

    /* Initialize it */
    productCard.initialize()
    cardsMap.set(productCard.code, productCard)

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
    productCard.container.frame.position.y = position.y + productCard.container.frame.height * thisObject.productCards.length + CANRD_SEPARATION

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

    for (let i = 0; i < thisObject.productCards.length; i++) {
      if (i + 1 >= firstVisibleCard && i + 1 < firstVisibleCard + availableSlots) {
        let productCard = thisObject.productCards[i]

               /* Positioning within thisObject Panel */

        let position = {
          x: 10,
          y: thisObject.container.frame.height - thisObject.container.frame.getBodyHeight()
        }
        productCard.container.frame.position.x = position.x
        productCard.container.frame.position.y = position.y + productCard.container.frame.height * visibleProductCards.length + CANRD_SEPARATION

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

  function physics () {
    if (isInitialized === false) { return }

    /* The overall idea here is that we need to keep syncronized the panel with the layers that are
    defined at the Designer. Users can connect or disconnect any objext resulting in changes in which
    are valid layers and which not at any point in time. So what we do here is trying to keep the panel
    only with the layers that are connected to each Definition structure.*

    /* We will look into the ecosystem to know which Trading Engine bots are defined there. */
    let ecosystem = JSON.parse(window.localStorage.getItem('ecosystem'))
    if (ecosystem === null || ecosystem === undefined) {
      ecosystem = getUserEcosystem()
    }

    /* Then we get an Array of all instances of this bot placed at Definitions on the Workspace. */
    let tradingEngineInstances = canvas.strategySpace.workspace.getAllTradingEngines()

    /* Here we will go through all the instances of trading engines and see their layers, to see
    if we can find a matching layer. */

    for (let n = 0; n < tradingEngineInstances.length; n++) {
      let tradingEngine = tradingEngineInstances[n]
      let code
      try {
        code = JSON.parse(tradingEngine.code)
      } catch (err) {
        // if we can not parse this, then we ignore this trading engine.
      }
      if (code !== undefined) {
        for (let i = 0; i < ecosystem.devTeams.length; i++) {
          let devTeam = ecosystem.devTeams[i]

          for (let j = 0; j < devTeam.bots.length; j++) {
            let bot = devTeam.bots[j]
            if (bot.type !== 'Trading Engine') { continue }

            if (devTeam.codeName === code.team && bot.codeName === code.bot) {
              /* We found an instance of the same Trading Engine we are currently looking at.
              Next thing to do is to see its layers to see if we can match it with the current product. */

              for (let m = 0; m < tradingEngine.processes.length; m++) {
                let process = tradingEngine.processes[m]
                if (process.session !== undefined) {
                  if (process.session.layerManager !== undefined) {
                    let layerManager = process.session.layerManager
                    for (let p = 0; p < layerManager.layers.length; p++) {
                      let layer = layerManager.layers[p]
                      let layerCode
                      try {
                        layerCode = JSON.parse(layer.code)
                      } catch (err) {
                        // if we can not parse this, then we ignore this trading engine.
                      }

                      if (bot.products !== undefined) {
                        for (let k = 0; k < bot.products.length; k++) {
                          let product = bot.products[k]

                          if (product.codeName === layerCode.product) {
                            /* We have a layer that is matching the current product */

                            let cardCode = exchange + '-' + market.assetB + '/' + market.assetA + '-' + devTeam.codeName + '-' + bot.codeName + '-' + product.codeName + '-' + process.session.id

                            if (cardsMap.get(cardCode) === undefined) {
                              addProductCard(devTeam, bot, product, process.session)
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
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
