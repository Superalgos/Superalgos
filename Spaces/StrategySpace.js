
function newStrategySpace () {
  const MODULE_NAME = 'Strategy Space'
  let thisObject = {
    sidePanel: undefined,
    investmentPlanWorkspace: undefined,
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

    thisObject.investmentPlanWorkspace = newInvestmentPlanWorkspace()
    // thisObject.investmentPlanWorkspace.container.connectToParent(thisObject.sidePanel.container, true, true)
    await thisObject.investmentPlanWorkspace.initialize()

    // thisObject.sidePanel.areas.push(thisObject.investmentPlanWorkspace)
  }

  function makeVisible () {
    if (thisObject.investmentPlanWorkspace.isDeployed !== true) {
      thisObject.investmentPlanWorkspace.deploydInvestmentPlan()
    }
    canvas.floatingSpace.makeVisible()
    visible = true
  }

  function makeInvisible () {
    visible = false
  }

  function getContainer (point) {
    let container

    if (thisObject.investmentPlanWorkspace !== undefined) {
      container = thisObject.investmentPlanWorkspace.getContainer(point)
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
