function newProductsPanel () {
  let thisObject = {
    name: 'Layers Panel',
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

    thisObject.container.name = 'Layers @ ' + exchange + ' ' + market.quotedAsset + '/' + market.baseAsset
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

    /* For legacy plotters, we will add product cards based on the old ecosystem file */
    for (let i = 0; i < ecosystem.dataMines.length; i++) {
      let dataMine = ecosystem.dataMines[i]

      for (let j = 0; j < dataMine.bots.length; j++) {
        let bot = dataMine.bots[j]
        if (bot.type !== 'Indicator Bot Instance') { continue }

        if (bot.products !== undefined) {
          for (let k = 0; k < bot.products.length; k++) {
            let product = bot.products[k]

            addProductCard(dataMine, bot, product)
          }
        }
      }
    }

    /* For new plotters defined at the UI, we will add product cards based on what we find at the workspace */
    let workspaceNode = canvas.designerSpace.workspace.workspaceNode
    for (let i = 0; i < workspaceNode.rootNodes.length; i++) {
      let rootNode = workspaceNode.rootNodes[i]
      if (rootNode.type === 'Data Mine') {
        let dataMineNode = rootNode

        let dataMine = {}
        if (dataMineNode.code === undefined) { continue }
        try {
          let code = JSON.parse(dataMineNode.code)
          dataMine.codeName = code.codeName
        } catch (err) {
          continue
        }
        for (let j = 0; j < dataMineNode.indicatorBots.length; j++) {
          let botNode = dataMineNode.indicatorBots[j]

          let bot = {}
          if (botNode.code === undefined) { continue }
          try {
            let code = JSON.parse(botNode.code)
            bot.codeName = code.codeName
          } catch (err) {
            continue
          }

          for (let k = 0; k < botNode.products.length; k++) {
            let productNode = botNode.products[k]

            let product = {}
            if (productNode.code === undefined) { continue }
            try {
              let code = JSON.parse(productNode.code)
              product.codeName = code.codeName
            } catch (err) {
              continue
            }

            if (productNode.payload.referenceParent === undefined) { continue }
            let plotterModuleNode = productNode.payload.referenceParent

            let plotterModule = {}
            if (plotterModuleNode.code === undefined) { continue }
            try {
              let code = JSON.parse(plotterModuleNode.code)
              plotterModule.codeName = code.codeName
              plotterModule.banner = code.banner
            } catch (err) {
              continue
            }

            if (plotterModuleNode.payload.parentNode === undefined) { continue }
            let plotterNode = plotterModuleNode.payload.parentNode

            let plotter = {}
            if (plotterNode.code === undefined) { continue }
            try {
              let code = JSON.parse(plotterNode.code)
              plotter.codeName = code.codeName
            } catch (err) {
              continue
            }

            if (plotterNode.payload.parentNode === undefined) { continue }
            let plotterDataMineNode = plotterNode.payload.parentNode

            let plotterDataMine = {}
            if (plotterDataMineNode.code === undefined) { continue }
            try {
              let code = JSON.parse(plotterDataMineNode.code)
              plotterDataMine.codeName = code.codeName
            } catch (err) {
              continue
            }

            /* Conversion to fit old format */
            product.plotter = plotter
            product.plotter.dataMine = plotterDataMine.codeName
            product.plotter.moduleName = plotterModule.codeName
            product.plotter.banner = plotterModule.banner
            product.plotter.legacy = false
            product.plotter.module = { panels: [] }
            product.displayName = productNode.name
            product.dataSets = []
            product.exchangeList = [{'name': 'Poloniex'}]
            product.node = productNode
            dataMine.displayName = dataMineNode.name
            dataMine.host = {'url': 'localhost'}
            bot.displayName = botNode.name

            for (let m = 0; m < productNode.datasets.length; m++) {
              let dataset = productNode.datasets[m]

              if (dataset.code === undefined) { continue }
              try {
                let code = JSON.parse(dataset.code)
                product.dataSets.push(code)
              } catch (err) {
                continue
              }
            }

            addProductCard(dataMine, bot, product)
          }
        }
      }
    }

    thisObject.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)
    isInitialized = true
  }

  function removeProductCard (code) {
    let productCard = cardsMap.get(code)
    cardsMap.delete(code)
    productCard.turnOff()
    productCard.finalize()
  }

  function addProductCard (dataMine, bot, product, session) {
    /* Now we create Product objects */
    let productCard = newProductCard()

    productCard.dataMine = dataMine
    productCard.bot = bot
    productCard.product = product
    productCard.fitFunction = thisObject.fitFunction
    productCard.code = exchange + '-' + market.quotedAsset + '/' + market.baseAsset + '-' + dataMine.codeName + '-' + bot.codeName + '-' + product.codeName

    if (session !== undefined) {
      productCard.code = productCard.code + '-' + session.id
    }
    productCard.session = session

    /* Initialize it */
    productCard.initialize()
    cardsMap.set(productCard.code, productCard)

    /* Container Stuff */
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

    return productCard
  }

  function onMouseWheel (event) {
    delta = event.wheelDelta
    if (delta > 0) {
      delta = -1
    } else {
      delta = 1
    }

    firstVisibleCard = firstVisibleCard + delta

    calculateVisbleProductCards()
  }

  function calculateVisbleProductCards () {
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

    /*
    The overall idea here is that we need to keep syncronized the panel with the layers that are
    defined at the Designer. Users can connect or disconnect any objext resulting in changes in which
    are valid layers and which not at any point in time. So what we do here is trying to keep the panel
    only with the layers that are connected to each Definition structure.

    To achieve this, first we are going to move all session related cards to a local array. Then we are
    going to check for layers at the designer, and will move back the cards which still have layers well
    defined to where they were.

    If we find new layers we will add them at that point. Finally, the cards that still remain at the
    local array after all the layers at the designer have been processed, are turned off and discarded.
    */

    let localProductCards = []
    moveToLocalProductCards()
    synchronizeLayersAndProductCards()

    /* At this poins all the cards still at the local array need to be removed from the panel. */
    turnOffUnusedProducCards()
    calculateVisbleProductCards()

    function synchronizeLayersAndProductCards () {
        /* We will look into the ecosystem to know which Trading bots are defined there. */
      let ecosystem = JSON.parse(window.localStorage.getItem('ecosystem'))
      if (ecosystem === null || ecosystem === undefined) {
        ecosystem = getUserEcosystem()
      }

        /* Then we get an Array of all instances of this bot placed at Definitions on the Workspace. */
      let tradingBotInstances = canvas.designerSpace.workspace.getAllTradingBotInstances()

        /* Here we will go through all the instances of trading engines and see their layers, to see
        if we can find a matching layer. */

      for (let n = 0; n < tradingBotInstances.length; n++) {
        let tradingBotInstance = tradingBotInstances[n]
        let code
        let instanceBot
        let instanceDataMine

        for (let m = 0; m < tradingBotInstance.processes.length; m++) {
          let process = tradingBotInstance.processes[m]
          try {
            code = JSON.parse(process.payload.referenceParent.payload.parentNode.code)
            instanceBot = code.codeName
            code = JSON.parse(process.payload.referenceParent.payload.parentNode.payload.parentNode.code)
            instanceDataMine = code.codeName
          } catch (err) {
            continue
          }
          for (let i = 0; i < ecosystem.dataMines.length; i++) {
            let dataMine = ecosystem.dataMines[i]

            for (let j = 0; j < dataMine.bots.length; j++) {
              let bot = dataMine.bots[j]
              if (bot.type !== 'Trading Bot Instance') { continue }

              if (dataMine.codeName === instanceDataMine && bot.codeName === instanceBot) {
                  /* We found an instance of the same Trading we are currently looking at.
                  Next thing to do is to see its layers to see if we can match it with the current product. */

                if (process.session !== undefined) {
                  if (process.session.layerManager !== undefined) {
                    let layerManager = process.session.layerManager
                    if (layerManager.payload.floatingObject.isCollapsed !== true) {
                      if (bot.products !== undefined) {
                        for (let k = 0; k < bot.products.length; k++) {
                          let product = bot.products[k]

                          for (let p = 0; p < layerManager.layers.length; p++) {
                            let layer = layerManager.layers[p]
                            let layerCode
                            try {
                              layerCode = JSON.parse(layer.code)
                            } catch (err) {
                              // if we can not parse this, then we ignore this trading engine.
                            }

                            if (product.codeName === layerCode.product) {
                              /* We have a layer that is matching the current product */
                              let cardCode = exchange + '-' + market.quotedAsset + '/' + market.baseAsset + '-' + dataMine.codeName + '-' + bot.codeName + '-' + product.codeName + '-' + process.session.id
                              let cardFound = removeFromLocalProductCards(cardCode)
                              if (cardFound !== true) {
                                productCard = addProductCard(dataMine, bot, product, process.session)
                                onProductCardStatusChanged(productCard)
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

    function moveToLocalProductCards () {
      removeNext()

      function removeNext () {
        for (let i = 0; i < thisObject.productCards.length; i++) {
          let productCard = thisObject.productCards[i]
          if (productCard.session !== undefined) {
            thisObject.productCards.splice(i, 1)
            localProductCards.push(productCard)
            removeNext()
          }
        }
      }
    }

    function removeFromLocalProductCards (code) {
      for (let i = 0; i < localProductCards.length; i++) {
        let productCard = localProductCards[i]
        if (productCard.code === code) {
          thisObject.productCards.push(productCard)
          localProductCards.splice(i, 1)
          return true
        }
      }
    }

    function turnOffUnusedProducCards () {
      for (let i = 0; i < localProductCards.length; i++) {
        let productCard = localProductCards[i]
        removeProductCard(productCard.code)
      }
    }
  }
  function draw () {
    if (isInitialized === false) { return }

    thisObject.container.frame.draw(false, false, false, thisObject.fitFunction)

    for (let i = 0; i < visibleProductCards.length; i++) {
      visibleProductCards[i].draw()
    }

    panelTabButton.draw()
  }
}
