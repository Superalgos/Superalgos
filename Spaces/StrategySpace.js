
function newStrategySpace () {
  const MODULE_NAME = 'Strategy Space'
  let thisObject = {
    sidePanel: undefined,
    tradingSystemWorkspace: undefined,
    container: undefined,
    draw: draw,
    getContainer: getContainer,
    makeVisible: makeVisible,
    makeInvisible: makeInvisible,
    initialize: initialize
  }

  let container = newContainer()
  container.initialize()
  thisObject.container = container

  container.isDraggeable = false

  return thisObject

  async function initialize () {
    // thisObject.sidePanel = newSidePanel()
    // thisObject.sidePanel.initialize()

    thisObject.tradingSystemWorkspace = newTradingSystemWorkspace()
    // thisObject.tradingSystemWorkspace.container.connectToParent(thisObject.sidePanel.container, true, true)
    await thisObject.tradingSystemWorkspace.initialize()

    // thisObject.sidePanel.areas.push(thisObject.tradingSystemWorkspace)
  }

  function makeVisible () {
    if (thisObject.tradingSystemWorkspace.isDeployed !== true) {
      thisObject.tradingSystemWorkspace.deploydTradingSystem()
    }
    canvas.floatingSpace.makeVisible()
    visible = true
  }

  function makeInvisible () {
    visible = false
  }

  function getContainer (point) {
    let container

    if (thisObject.tradingSystemWorkspace !== undefined) {
      container = thisObject.tradingSystemWorkspace.getContainer(point)
      if (container !== undefined) { return container }
    }

    if (thisObject.sidePanel !== undefined) {
      container = thisObject.sidePanel.getContainer(point)
      if (container !== undefined) { return container }
    }

    return
  }

  function draw () {
    if (thisObject.sidePanel !== undefined) {
      thisObject.sidePanel.draw()
    }
  }
}
