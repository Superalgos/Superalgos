
function newDesignerSpace () {
  const MODULE_NAME = 'Strategy Space'
  let thisObject = {
    sidePanel: undefined,
    container: undefined,
    iconCollection: undefined,
    iconByUiObjectType: undefined,
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
  thisObject.iconByUiObjectType = new Map()

  return thisObject

  function initialize () {
    loadIconCollection()
    buildIconByUiObjectTypeMap()

    thisObject.workspace = newWorkspace()
    thisObject.workspace.initialize()
  }

  function buildIconByUiObjectTypeMap () {
    const relationshipArray = []

    for (let i = 0; i < relationshipArray.length; i++) {
      let record = relationshipArray[i]
      let icon = thisObject.iconCollection.get(record[1])
      thisObject.iconByUiObjectType.set(record[0], icon)
    }

    /* Take types-icons relationships defined at the schema */
    for (let i = 0; i < APP_SCHEMA_ARRAY.length; i++) {
      let nodeDefinition = APP_SCHEMA_ARRAY[i]
      let iconName = nodeDefinition.icon
      if (iconName !== undefined) {
        let icon = thisObject.iconCollection.get(iconName)
        thisObject.iconByUiObjectType.set(nodeDefinition.type, icon)
      }
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
      'bot-trading',
      'layer-manager',
      'process',
      'bot-indicator',
      'bot-sensor',
      'time-period',
      'data-mine',
      'procedure-loop',
      'calculations-procedure',
      'data-building-procedure',
      'procedure-initialization',
      'process-definition',
      'output-dataset',
      'data-dependency',
      'product-definition',
      'plotter-module',
      'status-dependency',
      'record-property',
      'record-definition',
      'plotter',
      'plotter-panel',
      'dataset-definition',
      'status-report',
      'execution-finished-event',
      'process-dependencies',
      'process-output',
      'social-bot',
      'execution-started-event',
      'shapes',
      'chart-point',
      'style',
      'chart-points',
      'shapes-polygon-vertex',
      'shapes-polygon-border',
      'shapes-polygon-body',
      'chart-point-formula',
      'style-condition',
      'shapes-polygon',
      'data-entry',
      'data-formula',
      'clone'
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
    if (thisObject.workspace !== undefined) {
      thisObject.workspace.draw()
    }
  }
}
