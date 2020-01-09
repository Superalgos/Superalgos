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

  panelsMap = new Map()
  return thisObject

  function initialize () {

        /* The space does not create any Panels for itself, it just sits and waits others need panels. */

  }

  function createNewPanel (pType, pParameters, pOwner, pSession, pPanelCode) {
    let panel

    switch (pType) {

      case 'Products Panel':
        {
          panel = newProductsPanel()
          panel.fitFunction = canvas.chartSpace.fitIntoVisibleArea
          panel.container.isVisibleFunction = canvas.chartSpace.isThisPointVisible
          break
        }
      case 'Plotter Panel':
        {
          if (pPanelCode !== undefined) {
            panel = newPlotterPanel()
            panel.fitFunction = canvas.chartSpace.fitIntoVisibleArea
            panel.container.isVisibleFunction = canvas.chartSpace.isThisPointVisible
            panel.session = pSession
            panel.initialize(pPanelCode)
          } else {
            panel = getNewPlotterPanel(pParameters.dataMine, pParameters.plotterCodeName, pParameters.moduleCodeName, pParameters.panelCodeName)
            panel.fitFunction = canvas.chartSpace.fitIntoVisibleArea
            panel.container.isVisibleFunction = canvas.chartSpace.isThisPointVisible
            panel.session = pSession
            panel.initialize()
          }

          break
        }
    }

    let panelArray = panelsMap.get(pOwner)
    if (panelArray === undefined) {
      panelArray = []
      panelsMap.set(pOwner, panelArray)
    }

    panelArray.push(panel)

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

  function getPanel (pPanelHandle, pOwner) {
    thisObject.panels = panelsMap.get(pOwner)
    if (thisObject.panels != undefined) {
      for (let i = 0; i < thisObject.panels.length; i++) {
        let panel = thisObject.panels[i]

        if (panel.handle === pPanelHandle) {
          return panel
        }
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
        if (panel.physics !== undefined) {
          panel.physics()
        }
      }
    }
  }

  function positioningPhysics () {
    const INCREMENT = 0.5
    if (thisObject.panels !== undefined) {
      for (let i = 0; i < thisObject.panels.length; i++) {
        let panel = thisObject.panels[i]

        let centerPoint = {
          x: panel.container.frame.position.x,
          y: panel.container.frame.position.y
        }
        centerPoint.x = centerPoint.x + panel.container.frame.width / 2
        centerPoint.y = centerPoint.y + panel.container.frame.height / 2

        /* Lets see which quadrant the panel is at */
        let centerVertical = (viewPort.visibleArea.topRight.x - viewPort.visibleArea.topLeft.x) / 2 + viewPort.visibleArea.topLeft.x
        let centerHorizontal = (viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topRight.y) / 2 + viewPort.visibleArea.topRight.y

        /* According to the quadrant we push the panels to the sides */
        if (centerPoint.x < centerVertical) {
          panel.container.frame.position.x = panel.container.frame.position.x - INCREMENT
          if (isOverlapping(i, panel.container) === true) {
            panel.container.frame.position.x = panel.container.frame.position.x + INCREMENT * 2
          }
          if (panel.container.frame.position.x < viewPort.visibleArea.topLeft.x) {
            panel.container.frame.position.x = viewPort.visibleArea.topLeft.x
          }
        } else {
          panel.container.frame.position.x = panel.container.frame.position.x + INCREMENT
          if (isOverlapping(i, panel.container) === true) {
            panel.container.frame.position.x = panel.container.frame.position.x - INCREMENT * 2
          }
          if (panel.container.frame.position.x + panel.container.frame.width > viewPort.visibleArea.topRight.x) {
            panel.container.frame.position.x = viewPort.visibleArea.topRight.x - panel.container.frame.width
          }
        }
        if (panel.container.frame.height <= viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topRight.y) {
          if (centerPoint.y < centerHorizontal) {
            panel.container.frame.position.y = panel.container.frame.position.y - INCREMENT
            if (isOverlapping(i, panel.container) === true) {
              panel.container.frame.position.y = panel.container.frame.position.y + INCREMENT * 2
            }
            if (panel.container.frame.position.y < viewPort.visibleArea.topLeft.y) {
              panel.container.frame.position.y = viewPort.visibleArea.topLeft.y
            }
          } else {
            panel.container.frame.position.y = panel.container.frame.position.y + INCREMENT
            if (isOverlapping(i, panel.container) === true) {
              panel.container.frame.position.y = panel.container.frame.position.y - INCREMENT * 2
            }
            if (panel.container.frame.position.y + panel.container.frame.height > viewPort.visibleArea.bottomRight.y) {
              panel.container.frame.position.y = viewPort.visibleArea.bottomRight.y - panel.container.frame.height
            }
          }
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

    thisObject.panels = panelsMap.get('Global')
    if (thisObject.panels !== undefined) {
      for (let i = 0; i < thisObject.panels.length; i++) {
        let panel = thisObject.panels[i]
        panel.draw()
      }
    }

    thisObject.panels = panelsMap.get(window.CHART_ON_FOCUS)
    if (thisObject.panels !== undefined) {
      for (let i = 0; i < thisObject.panels.length; i++) {
        let panel = thisObject.panels[i]
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
    if (thisObject.panels !== undefined) {
      for (var i = thisObject.panels.length - 1; i >= 0; i--) {
        container = thisObject.panels[i].getContainer(point)

        if (container !== undefined) {
              /* We found an inner container which has the point. We return it. */

          return container
        }
      }
    }
        /* The point does not belong to any inner container, so we return the current container. */

    return thisObject.container
  }
}
