
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

  function loadIconCollection () {
    const iconsNames = [
      'analysis',
      'analysis-1',
      'approve',
      'attach',
      'attractive',
      'brainstorming',
      'broken-link',
      'chat',
      'chronometer',
      'compass',
      'competition',
      'content',
      'design-tool',
      'grid',
      'headphones',
      'html',
      'image',
      'layout',
      'loading',
      'login',
      'pantone',
      'paper-plane',
      'photo-camera',
      'piggy-bank',
      'pipette',
      'pixel',
      'placeholder',
      'planning',
      'promotion',
      'pyramid',
      'quality',
      'responsive',
      'schedule',
      'search',
      'security',
      'settings',
      'sitemap',
      'startup',
      'support',
      'tap',
      'target',
      'targeting',
      'task',
      'testing',
      'text',
      'timeline',
      'tools',
      'trash',
      'upload',
      'vector',
      'video-player'
    ]
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
