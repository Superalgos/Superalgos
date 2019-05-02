
function newStrategySpace () {
  const MODULE_NAME = 'Strategy Space'
  let thisObject = {
    sidePanel: undefined,
    strategyCollection: undefined,
    container: undefined,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize
  }

  let container = newContainer()
  container.initialize()
  thisObject.container = container

  container.isDraggeable = false

  return thisObject

  async function initialize () {
    thisObject.sidePanel = newSidePanel()
    thisObject.sidePanel.initialize()

    thisObject.strategyCollection = newStrategyCollection()
    thisObject.strategyCollection.container.connectToParent(thisObject.sidePanel.container, true, true)
    await thisObject.strategyCollection.initialize()

    thisObject.sidePanel.areas.push(thisObject.strategyCollection)
  }

  function getContainer (point) {
    let container

    if (thisObject.sidePanel !== undefined) {
      container = thisObject.sidePanel.getContainer(point)
      if (container !== undefined) { return container }
    }
    return
  }

  function draw () {
    thisObject.sidePanel.draw()
  }
}
