
function newStrategySpace () {
  const MODULE_NAME = 'Strategy Space'
  let thisObject = {
    sidePanel: undefined,
    strategizerGateway: undefined,
    container: undefined,
    iconCollection: undefined,
    iconByPartType: undefined,
    workspace: undefined,
    physics: physics,
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

  thisObject.iconCollection = new Map()
  thisObject.iconByPartType = new Map()

  return thisObject

  async function initialize () {
    loadIconCollection()
    buildIconByPartTypeMap()

    thisObject.strategizerGateway = newStrategizerGateway()

    thisObject.workspace = newWorkspace()
    thisObject.workspace.initialize()
  }

  function buildIconByPartTypeMap () {
    const relationshipArray = [
      ['Definition', 'text'],
      ['Network', 'network'],
      ['Network Node', 'network-node'],
      ['Social Bots', 'support'],
      ['Telegram Bot', 'paper-plane'],
      ['Announcement', 'promotion'],
      ['Layer Manager', 'layer-manager'],
      ['Layer', 'attractive'],
      ['Task Manager', 'task'],
      ['Task', 'timeline'],
      ['Sensor Bot Instance', 'bot-sensor'],
      ['Indicator', 'bot-indicator'],
      ['Trading Engine', 'trading-engine'],
      ['Process', 'process'],
      ['Backtesting Session', 'session-backtesting'],
      ['Live Trading Session', 'session-live-trading'],
      ['Fordward Testing Session', 'session-forward-testing'],
      ['Paper Trading Session', 'session-paper-trading'],
      ['Personal Data', 'security'],
      ['Exchange Account', 'approve'],
      ['Exchange Account Asset', 'paper-plane'],
      ['Exchange Account Key', 'login'],
      ['Workspace', 'design-tool'],
      ['Trading System', 'analysis'],
      ['Parameters', 'settings'],
      ['Base Asset', 'loading'],
      ['Time Range', 'schedule'],
      ['Time Period', 'time-period'],
      ['Slippage', 'support'],
      ['Fee Structure', 'sitemap'],
      ['Strategy', 'quality'],
      ['Trigger Stage', 'stage-trigger'],
      ['Open Stage', 'stage-open'],
      ['Manage Stage', 'video-player'],
      ['Close Stage', 'stage-close'],
      ['Position Size', 'stage-open-position-size'],
      ['Position Rate', 'stage-open-postion-rate'],
      ['Trigger On Event', 'stage-trigger-trigger-on'],
      ['Trigger Off Event', 'stage-trigger-trigger-off'],
      ['Take Position Event', 'stage-trigger-take-position'],
      ['Initial Definition', 'task'],
      ['Open Execution', 'piggy-bank'],
      ['Close Execution', 'piggy-bank'],
      ['Stop', 'stop'],
      ['Take Profit', 'stage-open-take-profit'],
      ['Phase', 'placeholder'],
      ['Formula', 'pipette'],
      ['Next Phase Event', 'pantone'],
      ['Situation', 'pyramid'],
      ['Condition', 'testing'],
      ['Code', 'html']
    ]

    for (let i = 0; i < relationshipArray.length; i++) {
      let record = relationshipArray[i]
      let icon = thisObject.iconCollection.get(record[1])
      thisObject.iconByPartType.set(record[0], icon)
    }
  }

  function loadIconCollection () {
    const iconsNames = [
      'analysis',
      'analysis-1',
      'approve',
      'attach',
      'attractive',
      'pyramid',
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
      'menu-fix-pinned',
      'menu-fix-unpinned',
      'targeting',
      'task',
      'testing',
      'text',
      'timeline',
      'tools',
      'delete',
      'upload',
      'vector',
      'video-player',
      'menu-mobility-freeze',
      'menu-mobility-unfreeze',
      'menu-tree-minus',
      'menu-tree-plus',
      'menu-backup',
      'menu-share',
      'stop',
      'stage-open',
      'stage-close',
      'stage-trigger',
      'stage-trigger-trigger-on',
      'stage-trigger-trigger-off',
      'stage-trigger-take-position',
      'menu-tensor-fixed-angles',
      'menu-tensor-free-angles',
      'stage-open-position-size',
      'stage-open-take-profit',
      'stage-open-postion-rate',
      'session-live-trading',
      'session-paper-trading',
      'session-backtesting',
      'session-forward-testing',
      'network',
      'network-node',
      'trading-engine',
      'layer-manager',
      'process',
      'bot-indicator',
      'bot-sensor',
      'time-period'
    ]

    for (let i = 0; i < iconsNames.length; i++) {
      let name = iconsNames[i]
      loadImage(name)
    }

    function loadImage (name) {
      const PATH = 'Images/Icons/style-01/'
      let image = new Image()
      image.onload = onImageLoad
      image.fileName = name

      function onImageLoad () {
        image.canDrawIcon = true
      }
      image.src = window.canvasApp.urlPrefix + PATH + name + '.png'
      thisObject.iconCollection.set(name, image)
    }
  }

  function physics () {
    if (visible !== true) { return }
    thisObject.workspace.physics()
  }

  function makeVisible () {
    visible = true
  }

  function makeInvisible () {
    visible = false
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
    if (thisObject.sidePanel !== undefined) {
      thisObject.sidePanel.draw()
    }
  }
}
