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

    if (thisObject.panels !== undefined) {
      for (let i = 0; i < thisObject.panels.length; i++) {
        let panel = thisObject.panels[i]
        if (panel.physics !== undefined) {
          panel.physics()
        }
      }
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
