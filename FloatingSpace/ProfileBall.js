
function newProfileBall () {
  const MODULE_NAME = 'Profile Ball'

  let thisObject = {
    container: undefined,
    physics: physics,
    drawBackground: drawBackground,
    drawMiddleground: drawMiddleground,
    drawForeground: drawForeground,
    drawOnFocus: drawOnFocus,
    getContainer: getContainer,
    initialize: initialize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME, 'Circle')
  thisObject.container.isClickeable = false
  thisObject.container.isDraggeable = false
  thisObject.container.frame.radius = 0
  thisObject.container.frame.position.x = 0
  thisObject.container.frame.position.y = 0

  let ballStringMenu = [
    {
      visible: false,
      iconPathOn: 'Images/menu.icon.on.1.gif',
      iconPathOff: 'Images/menu.icon.off.1.gif',
      rawRadius: 8,
      targetRadius: 0,
      currentRadius: 0,
      angle: 60
    }/*,
        {
            visible: false,
            iconPathOn: "Images/menu.icon.on.2.gif",
            iconPathOff: "Images/menu.icon.off.2.gif",
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20 * 1
        },
        {
            visible: false,
            iconPathOn: "Images/menu.icon.on.3.gif",
            iconPathOff: "Images/menu.icon.off.3.gif",
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20
        },
        {
            visible: false,
            iconPathOn: "Images/menu.icon.on.4.gif",
            iconPathOff: "Images/menu.icon.off.4.gif",
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -60
        } */
  ]

  return thisObject

  function initialize () {
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
        menuItem.iconOff.src = window.canvasApp.urlPrefix + menuItem.iconPathOff
      }
      menuItem.iconOn.src = window.canvasApp.urlPrefix + menuItem.iconPathOn
      menuItem.icon = menuItem.iconOn // The default value is ON.
    }

    thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
    thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)
    thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)
  }

  function getContainer (point) {
    let container

    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      return thisObject.container
    } else {
      return undefined
    }
  }

  function physics () {
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
  }

  function onMouseNotOver () {
    for (let i = 0; i < ballStringMenu.length; i++) {
      let menuItem = ballStringMenu[i]

      menuItem.targetRadius = menuItem.rawRadius * 0 - i * 5
    }
  }

  function onMouseClick (event) {
        /* What we need to do here is to check which menu item was clicked, if any. */

    pPoint = event.point
    pFloatingObject = event.parent

    let menuItemIndex

    for (let i = 0; i < ballStringMenu.length; i++) {
      let menuItem = ballStringMenu[i]

      if (menuItem.canDrawIcon === true && menuItem.currentRadius > 1) {
        let position = {
          x: pFloatingObject.container.frame.position.x + pFloatingObject.currentImageSize / 2 * Math.cos(toRadians(menuItem.angle)),
          y: pFloatingObject.container.frame.position.y - pFloatingObject.currentImageSize / 2 * Math.sin(toRadians(menuItem.angle))
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
    let point = {
      x: pFloatingObject.payload.targetPosition.x,
      y: pFloatingObject.payload.targetPosition.y
    }

    point = viewPort.fitIntoVisibleArea(point)

    if (pFloatingObject.container.frame.radius > 1) {
            /* Target Line */

      browserCanvasContext.beginPath()
      browserCanvasContext.moveTo(pFloatingObject.container.frame.position.x, pFloatingObject.container.frame.position.y)
      browserCanvasContext.lineTo(point.x, point.y)
      browserCanvasContext.strokeStyle = 'rgba(204, 204, 204, 0.5)'
      browserCanvasContext.setLineDash([4, 2])
      browserCanvasContext.lineWidth = 1
      browserCanvasContext.stroke()
      browserCanvasContext.setLineDash([0, 0])
    }

    if (pFloatingObject.container.frame.radius > 0.5) {
            /* Target Spot */

      var radius = 1

      browserCanvasContext.beginPath()
      browserCanvasContext.arc(point.x, point.y, radius, 0, Math.PI * 2, true)
      browserCanvasContext.closePath()
      browserCanvasContext.fillStyle = 'rgba(30, 30, 30, 1)'
      browserCanvasContext.fill()
    }
  }

  function drawOnFocus () {

  }

  function drawMiddleground () {

  }

  function drawForeground (pFloatingObject) {
    if (pFloatingObject.container.frame.radius > 5) {
            /* Contourn */

      browserCanvasContext.beginPath()
      browserCanvasContext.arc(pFloatingObject.container.frame.position.x, pFloatingObject.container.frame.position.y, pFloatingObject.container.frame.radius, 0, Math.PI * 2, true)
      browserCanvasContext.closePath()
      browserCanvasContext.strokeStyle = 'rgba(30, 30, 30, 0.75)'
      browserCanvasContext.lineWidth = 1
      browserCanvasContext.stroke()
    }

    if (pFloatingObject.container.frame.radius > 0.5) {
            /* Main FloatingObject */

      var alphaA

      if (pFloatingObject.container.frame.radius < 3) {
        alphaA = 1
      } else {
        alphaA = 0.75
      }

      alphaA = 0.75

      browserCanvasContext.beginPath()
      browserCanvasContext.arc(pFloatingObject.container.frame.position.x, pFloatingObject.container.frame.position.y, pFloatingObject.container.frame.radius, 0, Math.PI * 2, true)
      browserCanvasContext.closePath()

      browserCanvasContext.fillStyle = pFloatingObject.fillStyle

      browserCanvasContext.fill()
    }

        /* Image */

    if (pFloatingObject.payload.profile.imageId !== undefined) {
      let image = pFloatingObject.payload.profile.botAvatar

      if (image !== null && image !== undefined) {
        browserCanvasContext.save()
        browserCanvasContext.beginPath()
        browserCanvasContext.arc(pFloatingObject.container.frame.position.x, pFloatingObject.container.frame.position.y, pFloatingObject.currentImageSize / 2, 0, Math.PI * 2, true)
        browserCanvasContext.closePath()
        browserCanvasContext.clip()
        browserCanvasContext.drawImage(image, pFloatingObject.container.frame.position.x - pFloatingObject.currentImageSize / 2, pFloatingObject.container.frame.position.y - pFloatingObject.currentImageSize / 2, pFloatingObject.currentImageSize, pFloatingObject.currentImageSize)
        browserCanvasContext.beginPath()
        browserCanvasContext.arc(pFloatingObject.container.frame.position.x - pFloatingObject.currentImageSize / 2, pFloatingObject.container.frame.position.y - pFloatingObject.currentImageSize / 2, pFloatingObject.currentImageSize / 2, 0, Math.PI * 2, true)
        browserCanvasContext.clip()
        browserCanvasContext.closePath()
        browserCanvasContext.restore()
      }
    }

        /* StringBall Menu */

    for (let i = 0; i < ballStringMenu.length; i++) {
      let menuItem = ballStringMenu[i]

      if (menuItem.canDrawIcon === true && menuItem.currentRadius > 1) {
        let position = {
          x: pFloatingObject.container.frame.position.x + pFloatingObject.currentImageSize / 2 * Math.cos(toRadians(menuItem.angle)),
          y: pFloatingObject.container.frame.position.y - pFloatingObject.currentImageSize / 2 * Math.sin(toRadians(menuItem.angle))
        }

        browserCanvasContext.drawImage(menuItem.icon, position.x - menuItem.currentRadius, position.y - menuItem.currentRadius, menuItem.currentRadius * 2, menuItem.currentRadius * 2)
      }
    }

        /* Label Text */

    if (pFloatingObject.container.frame.radius > 6) {
      browserCanvasContext.strokeStyle = pFloatingObject.labelStrokeStyle

      let labelPoint
      let fontSize = pFloatingObject.currentFontSize

      browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY

      let label

      label = pFloatingObject.payload.profile.subTitle

      if (label !== undefined) {
        labelPoint = {
          x: pFloatingObject.container.frame.position.x - label.length / 2 * fontSize * FONT_ASPECT_RATIO,
          y: pFloatingObject.container.frame.position.y - pFloatingObject.currentImageSize / 2 - fontSize * FONT_ASPECT_RATIO - 10
        }

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
        browserCanvasContext.fillStyle = pFloatingObject.labelStrokeStyle
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
      }

      label = pFloatingObject.payload.profile.title

      if (label !== undefined) {
        labelPoint = {
          x: pFloatingObject.container.frame.position.x - label.length / 2 * fontSize * FONT_ASPECT_RATIO,
          y: pFloatingObject.container.frame.position.y + pFloatingObject.currentImageSize / 2 + fontSize * FONT_ASPECT_RATIO + 15
        }

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
        browserCanvasContext.fillStyle = pFloatingObject.labelStrokeStyle
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
      }
    }
  }
}
