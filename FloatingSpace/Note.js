 ﻿
function newNote () {
  const MODULE_NAME = 'Note'

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

  return thisObject

  function initialize () {
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

  }

  function onMouseOver () {

  }

  function onMouseNotOver () {

  }

  function onMouseClick (event) {
    pPoint = event.point
    pFloatingObject = event.parent
  }

  function drawBackground (pFloatingObject) {
    let point = {
      x: pFloatingObject.payload.notes[pFloatingObject.payloadNoteIndex].position.x,
      y: pFloatingObject.payload.notes[pFloatingObject.payloadNoteIndex].position.y
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
    const BUBBLE_CORNERS_RADIUS = 5
    const TITLE_BAR_HEIGHT = 14

    const BUBBLE_WIDTH = BUBBLE_CORNERS_RADIUS + pFloatingObject.container.frame.radius * 4
    const BUBBLE_HEIGHT = BUBBLE_CORNERS_RADIUS + pFloatingObject.container.frame.radius * 2

    let borderPoint1
    let borderPoint2
    let borderPoint3
    let borderPoint4

    let intialDisplace = {
      x: pFloatingObject.container.frame.position.x - BUBBLE_WIDTH / 2,
      y: pFloatingObject.container.frame.position.y - BUBBLE_HEIGHT / 2
    }

    if (pFloatingObject.container.frame.radius > 5) {
            /* Rounded Background */

      borderPoint1 = {
        x: intialDisplace.x + BUBBLE_CORNERS_RADIUS,
        y: intialDisplace.y + BUBBLE_CORNERS_RADIUS
      }

      borderPoint2 = {
        x: intialDisplace.x + BUBBLE_WIDTH - BUBBLE_CORNERS_RADIUS,
        y: intialDisplace.y + BUBBLE_CORNERS_RADIUS
      }

      borderPoint3 = {
        x: intialDisplace.x + BUBBLE_WIDTH - BUBBLE_CORNERS_RADIUS,
        y: intialDisplace.y + BUBBLE_HEIGHT - BUBBLE_CORNERS_RADIUS
      }

      borderPoint4 = {
        x: intialDisplace.x + BUBBLE_CORNERS_RADIUS,
        y: intialDisplace.y + +BUBBLE_HEIGHT - BUBBLE_CORNERS_RADIUS
      }

      titleBarPoint1 = {
        x: intialDisplace.x + 0,
        y: intialDisplace.y + TITLE_BAR_HEIGHT
      }

      titleBarPoint2 = {
        x: intialDisplace.x + BUBBLE_WIDTH,
        y: intialDisplace.y + TITLE_BAR_HEIGHT
      }

            /* We paint the panel background first */

      browserCanvasContext.fillStyle = 'rgba(255, 249, 196, 0.75)'
      browserCanvasContext.beginPath()

      browserCanvasContext.arc(borderPoint1.x, borderPoint1.y, BUBBLE_CORNERS_RADIUS, 1.0 * Math.PI, 1.5 * Math.PI)
      browserCanvasContext.lineTo(borderPoint2.x, borderPoint2.y - BUBBLE_CORNERS_RADIUS)
      browserCanvasContext.arc(borderPoint2.x, borderPoint2.y, BUBBLE_CORNERS_RADIUS, 1.5 * Math.PI, 2.0 * Math.PI)
      browserCanvasContext.lineTo(borderPoint3.x + BUBBLE_CORNERS_RADIUS, borderPoint3.y)
      browserCanvasContext.arc(borderPoint3.x, borderPoint3.y, BUBBLE_CORNERS_RADIUS, 0 * Math.PI, 0.5 * Math.PI)
      browserCanvasContext.lineTo(borderPoint4.x, borderPoint4.y + BUBBLE_CORNERS_RADIUS)
      browserCanvasContext.arc(borderPoint4.x, borderPoint4.y, BUBBLE_CORNERS_RADIUS, 0.5 * Math.PI, 1.0 * Math.PI)
      browserCanvasContext.lineTo(borderPoint1.x - BUBBLE_CORNERS_RADIUS, borderPoint1.y)

      browserCanvasContext.closePath()

      browserCanvasContext.fill()

      browserCanvasContext.lineWidth = 0.1
      browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.DARK + ', 0.75)'
      browserCanvasContext.stroke()

            /* We paint the title bar now */

      browserCanvasContext.fillStyle = 'rgba(244, 224, 44, 0.75)'
      browserCanvasContext.beginPath()

      browserCanvasContext.moveTo(titleBarPoint1.x, titleBarPoint1.y)
      browserCanvasContext.lineTo(borderPoint1.x - BUBBLE_CORNERS_RADIUS, borderPoint1.y)
      browserCanvasContext.arc(borderPoint1.x, borderPoint1.y, BUBBLE_CORNERS_RADIUS, 1.0 * Math.PI, 1.5 * Math.PI)
      browserCanvasContext.lineTo(borderPoint2.x, borderPoint2.y - BUBBLE_CORNERS_RADIUS)
      browserCanvasContext.arc(borderPoint2.x, borderPoint2.y, BUBBLE_CORNERS_RADIUS, 1.5 * Math.PI, 2.0 * Math.PI)
      browserCanvasContext.lineTo(titleBarPoint2.x, titleBarPoint2.y)

      browserCanvasContext.closePath()
      browserCanvasContext.fill()

      browserCanvasContext.lineWidth = 0.1
      browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', 0.75)'
      browserCanvasContext.stroke()
    }

    if (pFloatingObject.container.frame.radius > 0.5) {
            /* Image */

      let imagePosition = {
        x: pFloatingObject.container.frame.position.x,
        y: pFloatingObject.container.frame.position.y + BUBBLE_HEIGHT / 2
      }

      if (pFloatingObject.payloadImageId !== undefined) {
        let image = document.getElementById(pFloatingObject.payloadImageId)

        if (image !== null) {
          browserCanvasContext.drawImage(image, imagePosition.x - pFloatingObject.currentImageSize / 2, imagePosition.y - pFloatingObject.currentImageSize / 2, pFloatingObject.currentImageSize, pFloatingObject.currentImageSize)
        }
      }

            /* Image Contourn */

      browserCanvasContext.beginPath()
      browserCanvasContext.arc(imagePosition.x, imagePosition.y, pFloatingObject.currentImageSize / 2, 0, Math.PI * 2, true)
      browserCanvasContext.closePath()
      browserCanvasContext.strokeStyle = 'rgba(30, 30, 30, 0.25)'
      browserCanvasContext.lineWidth = 1
      browserCanvasContext.stroke()

            /* Labels */

      if (pFloatingObject.container.frame.radius > 6) {
        browserCanvasContext.strokeStyle = pFloatingObject.labelStrokeStyle

        const SIZE_PERCENTAGE = Math.trunc(pFloatingObject.container.frame.radius / pFloatingObject.targetRadius * 100) / 100
        let ALPHA

        if (pFloatingObject.targetRadius > 0) {
          ALPHA = 0.5 - (1 - SIZE_PERCENTAGE) * 5
        } else {
 // Object is dying...

          ALPHA = Math.trunc((0.5 - (100 - pFloatingObject.container.frame.radius / 100)) * 100) / 100

          if (ALPHA < 0) { ALPHA = 0 }
        }

        let labelPoint
        let fontSize = 10

        let label

                /* print the title */

        label = pFloatingObject.payload.notes[pFloatingObject.payloadNoteIndex].title

        if (label !== undefined) {
          if (SIZE_PERCENTAGE > 0.9) {
            browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY

            let xOffset = label.length / 2 * fontSize * FONT_ASPECT_RATIO
            let yOffset = (TITLE_BAR_HEIGHT - fontSize) / 2 + 2

            labelPoint = {
              x: intialDisplace.x + BUBBLE_WIDTH / 2 - xOffset,
              y: intialDisplace.y + TITLE_BAR_HEIGHT - yOffset
            }

            browserCanvasContext.fillStyle = 'rgba(30, 30, 30, ' + ALPHA + ')'
            browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
          }
        }

                /* Message Body */

        label = pFloatingObject.payload.notes[pFloatingObject.payloadNoteIndex].body

        if (label !== undefined) {
          const WORDS_PER_ROW = 5
          const TOTAL_ROWS = 5

          if (SIZE_PERCENTAGE > 0.9) {
            let rawLabelArray = label.split(' ')
            let labelArray = []

                        /* Lets check when words are to long we add an empty space to the same line so as to roll all other words forward. */

            for (let i = 0; i < rawLabelArray.length; i++) {
              let word = rawLabelArray[i]

              labelArray.push(word)

              if (word.length > 8) {
                labelArray.push('')
              }

              if (word.length > 10) {
                labelArray.push('')
              }
            }

                        /* Calculate each ROW */

            let labelRows = []

            for (let i = 0; i < TOTAL_ROWS; i++) {
              let labelRow = ''

              for (let j = 0; j < WORDS_PER_ROW; j++) {
                let newWord = labelArray[j + i * WORDS_PER_ROW]

                if (newWord !== undefined && newWord !== '') {
                  labelRow = labelRow + ' ' + newWord
                }
              }

              if (labelRow !== '') {
                labelRows.push(labelRow)
              }
            }

                        /* Now we plot each row. */

            for (let i = 0; i < labelRows.length; i++) {
              let labelRow = labelRows[i]

              let startingPosition = {
                x: pFloatingObject.container.frame.position.x,
                y: pFloatingObject.container.frame.position.y - labelRows.length / 2 * (fontSize * FONT_ASPECT_RATIO + 10)
              }

              labelPoint = {
                x: startingPosition.x - labelRow.length / 2 * fontSize * FONT_ASPECT_RATIO,
                y: startingPosition.y + (i + 1) * (fontSize * FONT_ASPECT_RATIO + 10)
              }

              browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
              browserCanvasContext.fillStyle = 'rgba(60, 60, 60, ' + ALPHA + ')'
              browserCanvasContext.fillText(labelRow, labelPoint.x, labelPoint.y)
            }
          }
        }
      }
    }
  }
}
