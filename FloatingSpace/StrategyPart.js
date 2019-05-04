
function newStrategyPart () {
  let thisObject = {
    type: undefined,
    physicsLoop: physicsLoop,
    onMouseOver: onMouseOver,
    onMouseClick: onMouseClick,
    onMouseNotOver: onMouseNotOver,
    drawBackground: drawBackground,
    drawForeground: drawForeground,
    initialize: initialize

  }

  let ballStringMenu = []

  let floatingLayer
  let isMouseOver = false
  let image
  let imagePath

  return thisObject

  function initialize (pFloatingLayer, pType) {
    floatingLayer = pFloatingLayer

    switch (pType) {
      case 'Strategy': {
        break
      }
      case 'Strategy Entry': {
        break
      }
      case 'Strategy Exit': {
        break
      }
      case 'Trade Entry': {
        break
      }
      case 'Trade Exit': {
        break
      }
      case 'Stop': {
        break
      }
      case 'Take Profit': {
        break
      }
      case 'Phase': {
        break
      }
      case 'Situation': {
        break
      }
      case 'Condition': {
        imagePath = 'Images/icons/style-01/brainstorming.png'
        ballStringMenu = [
          {
            visible: false,
            imagePathOn: 'Images/icons/style-01/html.png',
            imagePathOff: 'Images/icons/style-01/target.png',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 60
          },
          {
            visible: false,
            imagePathOn: 'Images/icons/style-01/settings.png',
            imagePathOff: 'Images/icons/style-01/target.png',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20 * 1
          },
          {
            visible: false,
            imagePathOn: 'Images/icons/style-01/tools.png',
            imagePathOff: 'Images/icons/style-01/target.png',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20
          },
          {
            visible: false,
            imagePathOn: 'Images/icons/style-01/trash.png',
            imagePathOff: 'Images/icons/style-01/target.png',
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -60
          }]
        break
      }
      default: {
        if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> Part Type not Recognized -> type = ' + pType) }
      }
    }

/* Load Part Image */

    if (imagePath !== undefined) {
      image = new Image()
      image.onload = onImageLoad

      function onImageLoad () {
        image.canDrawIcon = true
      }
      image.src = window.canvasApp.urlPrefix + imagePath
    }

/* Load Menu Images */

    for (let i = 0; i < ballStringMenu.length; i++) {
      let menuItem = ballStringMenu[i]
      menuItem.iconOn = new Image()
      menuItem.iconOn.onload = onImageLoad

      function onImageLoad () {
        menuItem.iconOff = new Image()
        menuItem.iconOff.onload = onImageLoad

        function onImageLoad () {
          menuItem.canDrawIcon = true
        }
        menuItem.iconOff.src = window.canvasApp.urlPrefix + menuItem.imagePathOff
      }
      menuItem.iconOn.src = window.canvasApp.urlPrefix + menuItem.imagePathOn
      menuItem.icon = menuItem.iconOn // The default value is ON.
    }
  }

  function physicsLoop () {
        // The menuItems also have a target.

    for (let i = 0; i < ballStringMenu.length; i++) {
      let menuItem = ballStringMenu[i]

      if (Math.abs(menuItem.currentRadius - menuItem.targetRadius) >= 0.5) {
        if (menuItem.currentRadius < menuItem.targetRadius) {
          menuItem.currentRadius = menuItem.currentRadius + 0.5
        } else {
          menuItem.currentRadius = menuItem.currentRadius - 0.5
        }
      }
    }
  }

  function onMouseOver () {
    for (let i = 0; i < ballStringMenu.length; i++) {
      let menuItem = ballStringMenu[i]

      menuItem.targetRadius = menuItem.rawRadius * 1.5
    }

    isMouseOver = true
  }

  function onMouseNotOver () {
    for (let i = 0; i < ballStringMenu.length; i++) {
      let menuItem = ballStringMenu[i]

      menuItem.targetRadius = menuItem.rawRadius * 0 - i * 5
    }

    isMouseOver = false
  }

  function onMouseClick (pPoint, pFloatingObject) {
        /* What we need to do here is to check which menu item was clicked, if any. */

    let menuItemIndex

    for (let i = 0; i < ballStringMenu.length; i++) {
      let menuItem = ballStringMenu[i]

      if (menuItem.canDrawIcon === true && menuItem.currentRadius > 1) {
        let position = {
          x: pFloatingObject.currentPosition.x + pFloatingObject.currentRadius * 3 / 4 * Math.cos(toRadians(menuItem.angle)),
          y: pFloatingObject.currentPosition.y - pFloatingObject.currentRadius * 3 / 4 * Math.sin(toRadians(menuItem.angle))
        }

        browserCanvasContext.drawImage(menuItem.icon, position.x, position.y, menuItem.currentRadius * 2, menuItem.currentRadius * 2)

        let distance = Math.sqrt(Math.pow(position.x - pPoint.x, 2) + Math.pow(position.y - pPoint.y, 2))

        if (distance < menuItem.currentRadius) {
          menuItemIndex = i
        }
      }
    }

    if (menuItemIndex !== undefined) {
      switch (menuItemIndex) {

        case 0: {
 // This menu item is to turn ON / OFF the plotting of this bot.

          if (pFloatingObject.payload.profile.plot === true) {
            pFloatingObject.payload.profile.plot = false

            let menuItem = ballStringMenu[0]
            menuItem.icon = menuItem.iconOff
          } else {
            pFloatingObject.payload.profile.plot = true

            let menuItem = ballStringMenu[0]
            menuItem.icon = menuItem.iconOn
          }

          break
        }

        case 1: {
 // This menu item is to turn ON the Debug Log pannel for the bot.

          break
        }
      }
    }
  }

  function drawBackground (pFloatingObject) {
    if (pFloatingObject.payload.parentNode === undefined) { return }

    /* Here we do the trick of recalculation the position of the anchor by setting it to the position of its parent */
    let parentFloatingObject = floatingLayer.getFloatingObject(pFloatingObject.payload.parentNode.handle)

    pFloatingObject.payload.profile.position.x = parentFloatingObject.currentPosition.x
    pFloatingObject.payload.profile.position.y = parentFloatingObject.currentPosition.y

   /* Here I continue painting the background */

    let point = {
      x: pFloatingObject.payload.profile.position.x,
      y: pFloatingObject.payload.profile.position.y
    }

    if (pFloatingObject.currentRadius > 1) {
            /* Target Line */

      browserCanvasContext.beginPath()
      browserCanvasContext.moveTo(pFloatingObject.currentPosition.x, pFloatingObject.currentPosition.y)
      browserCanvasContext.lineTo(point.x, point.y)
      browserCanvasContext.strokeStyle = 'rgba(204, 204, 204, 0.5)'
      browserCanvasContext.setLineDash([1, 4])
      browserCanvasContext.lineWidth = 1
      browserCanvasContext.stroke()
      browserCanvasContext.setLineDash([0, 0])
    }

    if (pFloatingObject.currentRadius > 0.5) {
            /* Target Spot */

      var radius = 1

      browserCanvasContext.beginPath()
      browserCanvasContext.arc(point.x, point.y, radius, 0, Math.PI * 2, true)
      browserCanvasContext.closePath()
      browserCanvasContext.fillStyle = 'rgba(30, 30, 30, 1)'
      browserCanvasContext.fill()
    }
  }

  function drawForeground (pFloatingObject) {
    let position = {
      x: pFloatingObject.currentPosition.x,
      y: pFloatingObject.currentPosition.y
    }

    let radius = pFloatingObject.currentRadius

    if (radius > 5) {
            /* Contourn */
/*
      browserCanvasContext.beginPath()
      browserCanvasContext.arc(position.x, position.y, radius, 0, Math.PI * 2, true)
      browserCanvasContext.closePath()
      browserCanvasContext.strokeStyle = 'rgba(30, 30, 30, 0.75)'
      browserCanvasContext.lineWidth = 1
      browserCanvasContext.stroke()
      */
    }

    if (radius > 0.5 && image === undefined) {
            /* Main FloatingObject */

      browserCanvasContext.beginPath()
      browserCanvasContext.arc(position.x, position.y, radius * 2 / 3, 0, Math.PI * 2, true)
      browserCanvasContext.closePath()

      browserCanvasContext.fillStyle = pFloatingObject.fillStyle

      browserCanvasContext.fill()

      browserCanvasContext.beginPath()
      browserCanvasContext.arc(position.x, position.y, radius * 1 / 3, 0, Math.PI * 2, true)
      browserCanvasContext.closePath()

      browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.BLACK + ', 1)'

      browserCanvasContext.fill()
    }

        /* Image */

    if (image !== undefined) {
      if (image.canDrawIcon === true) {
        browserCanvasContext.drawImage(image, position.x - pFloatingObject.currentImageSize / 2, position.y - pFloatingObject.currentImageSize / 2, pFloatingObject.currentImageSize, pFloatingObject.currentImageSize)
      }
    }

        /* StringBall Menu */

    for (let i = 0; i < ballStringMenu.length; i++) {
      let menuItem = ballStringMenu[i]

      if (menuItem.canDrawIcon === true && menuItem.currentRadius > 1) {
        let menuPosition = {
          x: position.x + radius * 3 / 4 * Math.cos(toRadians(menuItem.angle)),
          y: position.y - radius * 3 / 4 * Math.sin(toRadians(menuItem.angle)) }

        browserCanvasContext.drawImage(menuItem.icon, menuPosition.x - menuItem.currentRadius, menuPosition.y - menuItem.currentRadius, menuItem.currentRadius * 2, menuItem.currentRadius * 2)
      }
    }

        /* Label Text */

    if (radius > 6) {
      browserCanvasContext.strokeStyle = pFloatingObject.labelStrokeStyle

      let labelPoint
      let fontSize = pFloatingObject.currentFontSize

      browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY

      let label

      label = pFloatingObject.payload.profile.upLabel

      if (label !== undefined) {
        labelPoint = {
          x: position.x - label.length / 2 * fontSize * FONT_ASPECT_RATIO,
          y: position.y - radius - fontSize * FONT_ASPECT_RATIO - 10
        }

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
        browserCanvasContext.fillStyle = pFloatingObject.labelStrokeStyle
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
      }

      label = pFloatingObject.payload.profile.downLabel

      if (label !== undefined && isMouseOver === true) {
        labelPoint = {
          x: position.x - label.length / 2 * fontSize * FONT_ASPECT_RATIO,
          y: position.y + radius + fontSize * FONT_ASPECT_RATIO + 15
        }

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
        browserCanvasContext.fillStyle = pFloatingObject.labelStrokeStyle
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
      }
    }
  }
}
