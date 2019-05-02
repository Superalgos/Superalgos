
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
    thisObject.strategyCollection = newStrategyCollection()
    await thisObject.strategyCollection.initialize()

    thisObject.sidePanel = newSidePanel()
    thisObject.sidePanel.initialize()
    thisObject.sidePanel.areas.push(thisObject.strategyCollection)
  }

  function getContainer (point) {
    let container

    container = thisObject.strategyCollection.getContainer(point)
    if (container !== undefined) { return container }

    container = thisObject.sidePanel.getContainer(point)
    if (container !== undefined) { return container }

    return
  }

  function draw () {
    thisObject.sidePanel.draw()
  }
}
