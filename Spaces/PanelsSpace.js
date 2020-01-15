 ﻿/*

The Panel Space y the place wehre all panels live, no matter who create them.

*/

function newPanelsSpace () {
  let thisObject = {
    visible: true,
    container: undefined,
    createNewPanel: createNewPanel,
    destroyPanel: destroyPanel,
    getPanel: getPanel,
    physics: physics,
    draw: draw,
    panels: [],
    getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
    initialize: initialize
  }

  let container = newContainer()
  container.initialize()
  thisObject.container = container
  thisObject.container.isDraggeable = false

  container.frame.containerName = 'Panels Space'

  return thisObject

  function initialize () {

        /* The space does not create any Panels for itself, it just sits and waits others need panels. */

  }

  function createNewPanel (pType, pParameters, pOwner, pSession) {
    let panel

    switch (pType) {

      case 'Layers Panel':
        {
          panel = newProductsPanel()
          panel.fitFunction = canvas.chartSpace.fitFunction
          panel.container.isVisibleFunction = canvas.chartSpace.isThisPointVisible
          break
        }
      case 'Plotter Panel':
        {
          if (pParameters.panelNode.code.isLegacy !== true) {
            panel = newPlotterPanel()
            panel.fitFunction = canvas.chartSpace.fitFunction
            panel.container.isVisibleFunction = canvas.chartSpace.isThisPointVisible
            panel.session = pSession
            panel.initialize(pParameters.panelNode)
          } else {
            panel = getNewPlotterPanel(pParameters.dataMine, pParameters.plotterCodeName, pParameters.moduleCodeName, pParameters.panelNode.code.codeName)
            panel.fitFunction = canvas.chartSpace.fitFunction
            panel.container.isVisibleFunction = canvas.chartSpace.isThisPointVisible
            panel.session = pSession
            panel.initialize()
          }

          break
        }
    }

    panel.owner = pOwner
    thisObject.panels.push(panel)

    panel.handle = Math.floor((Math.random() * 10000000) + 1)

    return panel.handle
  }

  function destroyPanel (pPanelHandle) {
    for (let i = 0; i < thisObject.panels.length; i++) {
      let panel = thisObject.panels[i]

      if (panel.handle === pPanelHandle) {
        if (panel.finalize !== undefined) {
          panel.finalize()
        }

        thisObject.panels.splice(i, 1)  // Delete item from array.
        return
      }
    }
  }

  function getPanel (pPanelHandle) {
    for (let i = 0; i < thisObject.panels.length; i++) {
      let panel = thisObject.panels[i]

      if (panel.handle === pPanelHandle) {
        return panel
      }
    }
  }

  function physics () {
    if (thisObject.visible !== true) { return }

    childrenPhysics()
    positioningPhysics()
  }

  function childrenPhysics () {
    if (thisObject.panels !== undefined) {
      for (let i = 0; i < thisObject.panels.length; i++) {
        let panel = thisObject.panels[i]
        let owner = canvas.chartSpace.inViewport.get(panel.owner)
        if (owner !== undefined) {
          if (panel.physics !== undefined) {
            panel.physics()
          }
        }
      }
    }
  }

  function positioningPhysics () {
    if (thisObject.panels !== undefined) {
      for (let i = 0; i < thisObject.panels.length; i++) {
        let panel = thisObject.panels[i]

        /* setting the speed of the panel */
        let ACCELERATION = 0.1 // This is resting speed.
        if (panel.container.speed === undefined) {
          panel.container.speed = {
            x: 1,
            y: 1
          }
          panel.container.resistance = {
            x: 0,
            y: 0
          }
        }

        /* Trying to move the panel and see if it is possible */
        let centerPoint = {
          x: panel.container.frame.position.x,
          y: panel.container.frame.position.y
        }
        centerPoint.x = centerPoint.x + panel.container.frame.width / 2
        centerPoint.y = centerPoint.y + panel.container.frame.height / 2

        /* Lets see which quadrant the panel is at */
        let verticalLine = (viewPort.visibleArea.topRight.x - viewPort.visibleArea.topLeft.x) / 2 + viewPort.visibleArea.topLeft.x
        let horizontalLine = (viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topRight.y) * 2 / 3 + viewPort.visibleArea.topRight.y

        /* According to the quadrant we push the panels to the sides */
        if (centerPoint.x < verticalLine) {
          panel.container.frame.position.x = panel.container.frame.position.x - panel.container.speed.x
          if (isOverlapping(i, panel.container) === true) {
            panel.container.frame.position.x = panel.container.frame.position.x + panel.container.speed.x * 3
            accelerateOnX()
          } else {
            desAccelerateOnX()
          }
          if (panel.container.frame.position.x < viewPort.visibleArea.topLeft.x) {
            panel.container.frame.position.x = viewPort.visibleArea.topLeft.x
          }
        } else {
          panel.container.frame.position.x = panel.container.frame.position.x + panel.container.speed.x
          if (isOverlapping(i, panel.container) === true) {
            panel.container.frame.position.x = panel.container.frame.position.x - panel.container.speed.x * 3
            accelerateOnX()
          } else {
            desAccelerateOnX()
          }
          if (panel.container.frame.position.x + panel.container.frame.width > viewPort.visibleArea.topRight.x) {
            panel.container.frame.position.x = viewPort.visibleArea.topRight.x - panel.container.frame.width
          }
        }
        if (panel.container.frame.height <= viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topRight.y) {
          if (centerPoint.y < horizontalLine) {
            panel.container.frame.position.y = panel.container.frame.position.y - panel.container.speed.y
            if (isOverlapping(i, panel.container) === true) {
              panel.container.frame.position.y = panel.container.frame.position.y + panel.container.speed.y * 3
              accelerateOnY()
            } else {
              desAccelerateOnY()
            }
            if (panel.container.frame.position.y < viewPort.visibleArea.topLeft.y) {
              panel.container.frame.position.y = viewPort.visibleArea.topLeft.y
            }
          } else {
            panel.container.frame.position.y = panel.container.frame.position.y + panel.container.speed.y
            if (isOverlapping(i, panel.container) === true) {
              panel.container.frame.position.y = panel.container.frame.position.y - panel.container.speed.y * 3
              accelerateOnY()
            } else {
              desAccelerateOnY()
            }
            if (panel.container.frame.position.y + panel.container.frame.height > viewPort.visibleArea.bottomRight.y) {
              panel.container.frame.position.y = viewPort.visibleArea.bottomRight.y - panel.container.frame.height
            }
          }
        }

        function accelerateOnX () {
          panel.container.speed.x = panel.container.speed.x + ACCELERATION
          if (panel.container.speed.x > ACCELERATION * 10) {
            panel.container.speed.x = ACCELERATION * 10
          }
          panel.container.resistance.x = panel.container.resistance.x + 1
        }
        function desAccelerateOnX () {
          if (panel.container.resistance.x < -3) {
            panel.container.resistance.x = 0
            panel.container.speed.x = ACCELERATION * 5
            return
          }
          panel.container.speed.x = panel.container.speed.x - ACCELERATION
          if (panel.container.speed.x < ACCELERATION) {
            panel.container.speed.x = ACCELERATION * 1
          }
          panel.container.resistance.x = panel.container.resistance.x - 1
        }
        function accelerateOnY () {
          if (panel.container.resistance.y > 5) {
            panel.container.resistance.y = 0
            return
          }
          panel.container.speed.y = panel.container.speed.y + ACCELERATION
          if (panel.container.speed.y > ACCELERATION * 10) {
            panel.container.speed.y = ACCELERATION * 5
          }
          panel.container.resistance.y = panel.container.resistance.y + 1
        }
        function desAccelerateOnY () {
          if (panel.container.resistance.y < -3) {
            panel.container.resistance.y = 0
            panel.container.speed.y = ACCELERATION * 10
            return
          }
          panel.container.speed.y = panel.container.speed.y - ACCELERATION
          if (panel.container.speed.y < ACCELERATION) {
            panel.container.speed.y = ACCELERATION * 1
          }
          panel.container.resistance.y = panel.container.resistance.y - 1
        }
      }
    }

    function isOverlapping (currentIndex, currentContainer) {
      let corner1 = {
        x: currentContainer.frame.position.x,
        y: currentContainer.frame.position.y
      }
      let corner2 = {
        x: currentContainer.frame.position.x + currentContainer.frame.width,
        y: currentContainer.frame.position.y
      }
      let corner3 = {
        x: currentContainer.frame.position.x + currentContainer.frame.width,
        y: currentContainer.frame.position.y + currentContainer.frame.height
      }
      let corner4 = {
        x: currentContainer.frame.position.x,
        y: currentContainer.frame.position.y + currentContainer.frame.height
      }

      for (let i = 0; i < currentIndex; i++) {
        let panel = thisObject.panels[i]

        if (isThisPointInsideThisFrame(corner1, panel.container.frame) === true) { return true }
        if (isThisPointInsideThisFrame(corner2, panel.container.frame) === true) { return true }
        if (isThisPointInsideThisFrame(corner3, panel.container.frame) === true) { return true }
        if (isThisPointInsideThisFrame(corner4, panel.container.frame) === true) { return true }
      }

      function isThisPointInsideThisFrame (point, frame) {
        let corner1 = {
          x: frame.position.x,
          y: frame.position.y
        }
        let corner2 = {
          x: frame.position.x + frame.width,
          y: frame.position.y
        }
        let corner3 = {
          x: frame.position.x + frame.width,
          y: frame.position.y + frame.height
        }
        let corner4 = {
          x: frame.position.x,
          y: frame.position.y + frame.height
        }
        if (point.x >= corner1.x && point.y >= corner1.y && point.x <= corner3.x && point.y <= corner3.y) {
          return true
        } else {
          return false
        }
      }
      return false
    }
  }

  function draw () {
    if (thisObject.visible !== true) { return }

    thisObject.container.frame.draw(false, false)

    for (let i = 0; i < thisObject.panels.length; i++) {
      let panel = thisObject.panels[i]
      let owner = canvas.chartSpace.inViewport.get(panel.owner)
      if (owner !== undefined) {
        panel.draw()
      }
    }
  }

  function getContainer (point) {
    if (thisObject.visible !== true) { return }

    let container
      /*
      We search for the container of panels in the oposite direction than we do it for drawing them,
      so panels overlapping others are picked firt although they are drawn last.
      */
    for (let i = thisObject.panels.length - 1; i >= 0; i--) {
      let panel = thisObject.panels[i]
      let owner = canvas.chartSpace.inViewport.get(panel.owner)
      if (owner !== undefined) {
        container = panel.getContainer(point)
      }
      if (container !== undefined) {
        return container
      }
    }
    return thisObject.container
  }
}
