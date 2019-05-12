
function newStrategySpace () {
  const MODULE_NAME = 'Strategy Space'
  let thisObject = {
    sidePanel: undefined,
    workplace: undefined,
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

    thisObject.workplace = newWorkspace()
    // thisObject.workplace.container.connectToParent(thisObject.sidePanel.container, true, true)
    thisObject.workplace.initialize()
    await thisObject.workplace.loadFromStrategyzer()

    // thisObject.sidePanel.areas.push(thisObject.workplace)
  }

  function makeVisible () {
    if (thisObject.workplace.isDeployed !== true) {
      thisObject.workplace.deploydTradingSystem()
    }
    canvas.floatingSpace.makeVisible()
    visible = true
  }

  function makeInvisible () {
    visible = false
  }

  function getContainer (point) {
    let container

    if (thisObject.workplace !== undefined) {
      container = thisObject.workplace.getContainer(point)
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
