function newVideoRecorder () {
  let thisObject = {
    recordCanvas: recordCanvas
  }
  let lastAction
  return thisObject

  function recordCanvas () {
    {
      const DISTANCE_BETWEEN_ICONS = 60
      const ICON_SIZES = 50

      let mousePointerIcon = canvas.designSpace.iconCollection.get('mouse-pointer')
      let draggingIcon = canvas.designSpace.iconCollection.get('hand-drag')

      let leftClickIcon = canvas.designSpace.iconCollection.get('mouse-left-click')
      let rightClickIcon = canvas.designSpace.iconCollection.get('mouse-right-click')
      let wheelClickIcon = canvas.designSpace.iconCollection.get('mouse-wheel-click')

      let imagePosition
      let buttonPressedIcon

      if (canvas.mouse.action === 'key down' && lastAction === 'dragging') {
        canvas.mouse.action = 'dragging'
      }
      switch (canvas.mouse.action) {
        case 'moving': {
          pointerIcon = mousePointerIcon
          break
        }
        case 'dragging': {
          pointerIcon = draggingIcon
          break
        }
        case 'wheel': {
          if (canvas.mouse.event.delta > 0) {
            pointerIcon = canvas.designSpace.iconCollection.get('mouse-wheel-up')
          } else {
            pointerIcon = canvas.designSpace.iconCollection.get('mouse-wheel-down')
          }

          break
        }
        case 'key down': {
          pointerIcon = mousePointerIcon
          break
        }
        case 'key up': {
          pointerIcon = mousePointerIcon
          break
        }
      }

      lastAction = canvas.mouse.action

      imagePosition = {
        x: canvas.mouse.position.x,
        y: canvas.mouse.position.y
      }
      drawMousePointer(pointerIcon, imagePosition, ICON_SIZES)

      switch (canvas.mouse.event.buttons) {
        case 0: {
          buttonPressedIcon = undefined
          break
        }
        case 1: {
          buttonPressedIcon = leftClickIcon
          break
        }
        case 2: {
          buttonPressedIcon = rightClickIcon
          break
        }
        case 3: {
          buttonPressedIcon = undefined
          break
        }
        case 4: {
          buttonPressedIcon = wheelClickIcon
          break
        }
      }

      imagePosition = {
        x: canvas.mouse.position.x + DISTANCE_BETWEEN_ICONS,
        y: canvas.mouse.position.y
      }
      drawMousePointer(buttonPressedIcon, imagePosition, ICON_SIZES)

      if (canvas.mouse.event.shiftKey === true) {
        let icon = canvas.designSpace.iconCollection.get('key-shift')
        imagePosition = {
          x: canvas.mouse.position.x - DISTANCE_BETWEEN_ICONS,
          y: canvas.mouse.position.y - DISTANCE_BETWEEN_ICONS
        }
        drawMousePointer(icon, imagePosition, ICON_SIZES)
      }

      if (canvas.mouse.event.ctrlKey === true || canvas.mouse.event.metaKey === true) {
        let icon = canvas.designSpace.iconCollection.get('key-ctrl')
        imagePosition = {
          x: canvas.mouse.position.x - DISTANCE_BETWEEN_ICONS,
          y: canvas.mouse.position.y + DISTANCE_BETWEEN_ICONS
        }
        drawMousePointer(icon, imagePosition, ICON_SIZES)
      }

      if (canvas.mouse.event.altKey === true) {
        let icon = canvas.designSpace.iconCollection.get('key-alt')
        imagePosition = {
          x: canvas.mouse.position.x - DISTANCE_BETWEEN_ICONS,
          y: canvas.mouse.position.y - 0
        }
        drawMousePointer(icon, imagePosition, ICON_SIZES)
      }

      if (canvas.mouse.event.code === 'ArrowUp') {
        let icon = canvas.designSpace.iconCollection.get('key-up')
        imagePosition = {
          x: canvas.mouse.position.x - 0,
          y: canvas.mouse.position.y + DISTANCE_BETWEEN_ICONS
        }
        drawMousePointer(icon, imagePosition, ICON_SIZES)
      }

      if (canvas.mouse.event.code === 'ArrowDown') {
        let icon = canvas.designSpace.iconCollection.get('key-down')
        imagePosition = {
          x: canvas.mouse.position.x - 0,
          y: canvas.mouse.position.y + DISTANCE_BETWEEN_ICONS * 2
        }
        drawMousePointer(icon, imagePosition, ICON_SIZES)
      }

      if (canvas.mouse.event.code === 'ArrowLeft') {
        let icon = canvas.designSpace.iconCollection.get('key-left')
        imagePosition = {
          x: canvas.mouse.position.x - DISTANCE_BETWEEN_ICONS,
          y: canvas.mouse.position.y + DISTANCE_BETWEEN_ICONS * 2
        }
        drawMousePointer(icon, imagePosition, ICON_SIZES)
      }

      if (canvas.mouse.event.code === 'ArrowRight') {
        let icon = canvas.designSpace.iconCollection.get('key-right')
        imagePosition = {
          x: canvas.mouse.position.x + DISTANCE_BETWEEN_ICONS,
          y: canvas.mouse.position.y + DISTANCE_BETWEEN_ICONS * 2
        }
        drawMousePointer(icon, imagePosition, ICON_SIZES)
      }

      function drawMousePointer (icon, imagePosition, imageSize) {
        if (icon !== undefined) {
          if (icon.canDrawIcon === true) {
            browserCanvasContext.drawImage(
              icon, imagePosition.x,
              imagePosition.y,
              imageSize,
              imageSize)
          }
        }
      }
      mediaRecorder.capture(browserCanvas)
    }
  }
}
