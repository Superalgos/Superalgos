 ﻿function newProductsPanel () {
   var thisObject = {
     container: undefined,
     getLoadingProductCards: getLoadingProductCards,
     draw: draw,
     getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
     initialize: initialize
   }

    /* Cointainer stuff */

   var container = newContainer()

   container.name = 'Indicators and Algobots Product Panel'
   container.initialize()

   container.isDraggeable = true
   container.isWheelable = true

   container.isClickeable = true

   thisObject.container = container
   thisObject.container.frame.containerName = "Indicators and Algobots's Products"

   /* Lets listen to our own events to react when we have a Mouse Click */

   thisObject.container.eventHandler.listenToEvent('onMouseClick', buttonPressed)

   let isInitialized = false
   let productCards = []

   let visibleProductCards = []
   let firstVisibleCard = 1

    /* Needed Variables */

   let lastY = 5

   /* Animation to hide the pannel */

   let tabStatus = 'visible'
   let visiblePosition = {}
   let hiddenPosition = {}
   let transitionPosition = {}

   return thisObject

   function initialize () {
     thisObject.container.frame.width = UI_PANEL.WIDTH.LARGE
     thisObject.container.frame.height = viewPort.visibleArea.bottomLeft.y - viewPort.visibleArea.topLeft.y // UI_PANEL.HEIGHT.LARGE;

     var position = {
       x: viewPort.visibleArea.topLeft.x,
       y: viewPort.visibleArea.bottomLeft.y - thisObject.container.frame.height
     }

     thisObject.container.frame.position = position

     visiblePosition.x = thisObject.container.frame.position.x
     visiblePosition.y = thisObject.container.frame.position.y

     hiddenPosition.x = thisObject.container.frame.position.x
     hiddenPosition.y = viewPort.visibleArea.bottomRight.y

     transitionPosition.x = visiblePosition.x
     transitionPosition.y = visiblePosition.y

        /* First thing is to build the productCards array */

     let devTeams = ecosystem.getTeams()

     for (let i = 0; i < devTeams.length; i++) {
       let devTeam = devTeams[i]

       for (let j = 0; j < devTeam.bots.length; j++) {
         let bot = devTeam.bots[j]

         if (bot.products !== undefined) {
           for (let k = 0; k < bot.products.length; k++) {
             let product = bot.products[k]

                        /* Now we create Product objects */

             let productCard = newProductCard()

             productCard.devTeam = devTeam
             productCard.bot = bot
             productCard.product = product

             productCard.code = devTeam.codeName + '-' + bot.codeName + '-' + product.codeName

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

             productCards.push(productCard)

                        /* Add to Visible Product Array */

             if (productCard.container.frame.position.y + productCard.container.frame.height < thisObject.container.frame.height) {
               visibleProductCards.push(productCard)
             }

                        /* Listen to Status Changes Events */

             productCard.container.eventHandler.listenToEvent('Status Changed', onProductCardStatusChanged)
             productCard.container.eventHandler.listenToEvent('Mouse Wheel', onMouseWheel)
           }
         }
       }
     }

     thisObject.container.eventHandler.listenToEvent('Mouse Wheel', onMouseWheel)
     isInitialized = true
   }

   function buttonPressed (event) {
     if (tabStatus === 'visible') {
       visiblePosition.x = thisObject.container.frame.position.x
       visiblePosition.y = thisObject.container.frame.position.y

       hiddenPosition.x = thisObject.container.frame.position.x
       hiddenPosition.y = viewPort.visibleArea.bottomRight.y

       transitionPosition.x = visiblePosition.x
       transitionPosition.y = visiblePosition.y

       container.isDraggeable = false
       container.isWheelable = false
       tabStatus = 'going down'
     } else {
       container.isDraggeable = true
       container.isWheelable = true
       tabStatus = 'going up'
     }
   }

   function onMouseWheel (pDelta) {
     if (pDelta > 0) {
       pDelta = -1
     } else {
       pDelta = 1
     }

     firstVisibleCard = firstVisibleCard + pDelta

     let availableSlots = visibleProductCards.length

     if (firstVisibleCard < 1) { firstVisibleCard = 1 }
     if (firstVisibleCard > (productCards.length - availableSlots + 1)) { firstVisibleCard = productCards.length - availableSlots + 1 }

     visibleProductCards = []
     var lastY = 5

     for (let i = 0; i < productCards.length; i++) {
       if (i + 1 >= firstVisibleCard && i + 1 < firstVisibleCard + availableSlots) {
         let productCard = productCards[i]

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
        /* Returns all productCards which status is LOADING */

     let onProducts = []

     for (let i = 0; i < productCards.length; i++) {
       if (productCards[i].status === PRODUCT_CARD_STATUS.LOADING) {
         onProducts.push(productCards[i])
       }
     }

     return onProducts
   }

   function getContainer (point) {
     var container

        /* First we check if thisObject point is inside thisObject space. */

     if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            /* Now we see which is the inner most container that has it */

       for (var i = 0; i < visibleProductCards.length; i++) {
         container = visibleProductCards[i].getContainer(point)

         if (container !== undefined) {
                    /* We found an inner container which has the point. We return it. */

           return container
         }
       }

            /* The point does not belong to any inner container, so we return the current container. */

       return thisObject.container
     } else {
            /* This point does not belong to thisObject space. */

       return undefined
     }
   }

   function draw () {
     if (isInitialized === false) { return }

     if (tabStatus === 'going down') {
       if (transitionPosition.y < hiddenPosition.y) {
         transitionPosition.y = transitionPosition.y + 20
         thisObject.container.frame.position.y = transitionPosition.y
       } else {
         thisObject.container.frame.position.y = hiddenPosition.y
         tabStatus = 'hidden'
       }
     }
     if (tabStatus === 'going up') {
       if (transitionPosition.y > visiblePosition.y) {
         transitionPosition.y = transitionPosition.y - 20
         thisObject.container.frame.position.y = transitionPosition.y
       } else {
         thisObject.container.frame.position.y = visiblePosition.y
         tabStatus = 'visible'
       }
     }

     thisObject.container.frame.draw(false, false, true)

     for (let i = 0; i < visibleProductCards.length; i++) {
       visibleProductCards[i].draw()
     }
   }
 }
