
function newDesignSpace () {
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
      'clone',
      'exchange-account-asset',
      'exchange-account-key',
      'user-keys',
      'user-assets',
      'asset',
      'exchange-accounts',
      'user-account',
      'market',
      'exchange-assets',
      'crypto-exchanges',
      'crypto-exchange',
      'exchange-markets',
      'charting-space',
      'time-line-chart',
      'time-frame-scale',
      'time-scale',
      'rate-scale',
      'time-machine',
      'data-product',
      'single-market-data',
      'data-storage',
      'dataset',
      'viewport',
      'bitfinex',
      'binance',
      'kucoin',
      'bittrex',
      'kraken',
      'poloniex',
      'upbit',
      'monero',
      'tether',
      'tron',
      'stellar',
      'qtum',
      'neo',
      'litecoin',
      'ethereum-classic',
      'ethereum',
      'eos',
      'dash',
      'cardano',
      'bitcoin-cash',
      'bitcoin',
      'binance-coin',
      'trend',
      'oscillator',
      'moving-average',
      'histogram',
      'band',
      'volume',
      'candles',
      'bitmex',
      'liquid',
      'hitbtc',
      'us-dollar',
      'distance-to-parent-200',
      'distance-to-parent-150',
      'distance-to-parent-100',
      'distance-to-parent-050',
      'distance-to-parent-025',
      'distance-to-parent-000',
      'angle-to-parent-360',
      'angle-to-parent-180',
      'angle-to-parent-090',
      'angle-to-parent-045',
      'angle-to-parent-000',
      'data-mining',
      'initial-definition',
      'next-phase-event',
      'testing-environment',
      'production-environment',
      'task-manager',
      'session-based-data',
      'session-independent-data',
      'session-reference',
      'dashboard',
      'toggle-auto-scale-manual',
      'toggle-auto-scale-auto-min-max',
      'toggle-auto-scale-auto-max',
      'toggle-auto-scale-auto-min',
      'toggle-panel-off',
      'toggle-auto-time-scale-auto-min',
      'toggle-auto-time-scale-auto-max',
      'toggle-auto-time-scale-auto-min-max',
      'toggle-auto-time-scale-manual',
      'mouse-pointer',
      'mouse-left-click',
      'mouse-right-click',
      'mouse-wheel-up',
      'mouse-wheel-down',
      'mouse-wheel-click',
      'key-alt',
      'key-shift',
      'key-ctrl',
      'hand-drag',
      'key-down',
      'key-left',
      'key-right',
      'key-up',
      'master-script',
      'scripts-library',
      'super-action',
      'super-scripts',
      'template-script',
      'template-structure',
      'template-target'
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
      if (container !== undefined) {
        container.space = 'Design Space'
        return container
      }
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
