function newProductCard () {
  const MODULE_NAME = 'Product Card'
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    container: undefined,
    draw: draw,
    status: PRODUCT_CARD_STATUS.OFF,
    devTeam: undefined,
    bot: undefined,
    product: undefined,
    code: undefined,
    fitFunction: undefined,
    turnOff: turnOff,
    turnOn: turnOn,
    setDatetime: setDatetime,
    setTimePeriod: setTimePeriod,
    onMarketFileLoaded: onMarketFileLoaded,
    onDailyFileLoaded: onDailyFileLoaded,
    onSingleFileLoaded: onSingleFileLoaded,
    onFileSequenceLoaded: onFileSequenceLoaded,
    getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
    initialize: initialize
  }

  let LOADING_FILL_STYLE = 'rgba(234, 143, 23, @Opacity)'
  let LOADED_FILL_STYLE = 'rgba(45, 232, 28, @Opacity)'
  let UNLOADED_FILL_STYLE = 'rgba(226, 226, 226, @Opacity)'

  let LOADING_STROKE_STYLE = 'rgba(234, 143, 23, @Opacity)'
  let LOADED_STROKE_STYLE = 'rgba(150, 150, 150, @Opacity)'
  let UNLOADED_STROKE_STYLE = 'rgba(226, 226, 226, @Opacity)'

  let marketFileProgressBar = {
    value: 0,
    animatedValue: 0,
    fillStyle: UNLOADED_FILL_STYLE,
    strokeStyle: UNLOADED_STROKE_STYLE,
    opacity: 0.00
  }

  let dailyFileProgressBar = {
    value: 0,
    animatedValue: 0,
    fillStyle: UNLOADED_FILL_STYLE,
    strokeStyle: UNLOADED_STROKE_STYLE,
    opacity: 0.00
  }

  let singleFileProgressBar = {
    value: 0,
    animatedValue: 0,
    fillStyle: UNLOADED_FILL_STYLE,
    strokeStyle: UNLOADED_STROKE_STYLE,
    opacity: 0.00
  }

  let fileSequenceProgressBar = {
    value: 0,
    animatedValue: 0,
    fillStyle: UNLOADED_FILL_STYLE,
    strokeStyle: UNLOADED_STROKE_STYLE,
    opacity: 0.00
  }

  let timePeriod = INITIAL_TIME_PERIOD
  let datetime = NEW_SESSION_INITIAL_DATE

   /* TODO We are in a transition period in which bots and teams images might be located at different places.
   What we are going to do then is to try to load them from both places and use the variable that finally gets an
   image. */

   /* This is the legacy image storage. */

  let legacyTeamAvatar
  let legacyTeamAvatarLoaded = false

   /* TODO Temporary code */
  let legacyBotAvatar
  let legacyBotAvatarLoaded = false

   /* Now the plotters images */

  let legacyPlotterBanner
  let legacyPlotterBannerLoaded = false

   /* We are transitioning towards this */

  let teamAvatar // stores the avatar image of the team the bot portrayed at this card belongs to.
  let teamAvatarLoaded = false

   /* TODO Temporary code */
  let botAvatar // stores the avatar image of the team the bot portrayed at this card belongs to.
  let botAvatarLoaded = false

   /* Add an Event Handler */

  thisObject.eventHandler = newEventHandler()
  let imagesLoaded = 0

  let lastMouseOver = 0 // This variable is used to animate what happens while we are having a mounse over.

  return thisObject

  function initialize () {
       /* Create this objects continer */
    try {
      thisObject.container = newContainer()
      thisObject.container.initialize(MODULE_NAME + thisObject.code)
      thisObject.container.detectMouseOver = true
      thisObject.container.isDraggeable = false
      thisObject.container.isClickeable = true

       /* Add information that will later be needed. */

      let team = ecosystem.getTeam(thisObject.product.plotter.devTeam)
      let plotter = ecosystem.getPlotter(team, thisObject.product.plotter.codeName)
      let plotterModule = ecosystem.getPlotterModule(plotter, thisObject.product.plotter.moduleName)

      thisObject.product.plotter.profilePicture = plotterModule.profilePicture
      thisObject.product.plotter.module = plotterModule

       /* Lets set the basic dimensions of this thisObject. */

      var position = {
        x: 0,
        y: 0
      }

      thisObject.container.frame.position = position
      thisObject.container.frame.width = UI_PANEL.WIDTH.LARGE - 20
      thisObject.container.frame.height = 100

       /* We retrieve the locally stored status of the Product */

      let storedValue = window.localStorage.getItem(thisObject.code)

      if (storedValue !== null) {
        thisObject.status = storedValue

        if (thisObject.status === PRODUCT_CARD_STATUS.ON) {
          changeStatusTo(PRODUCT_CARD_STATUS.LOADING)
        }
      } else {
           /*

           This happens the first time the app is run on a new browser.

           We will start with all product off, except for the candles chart, since something needs to be shown and allow the user to position themselves
           on the timeline.

           For the time being, we will hard-code the name of the bot we will turn on by default, since we dont see that change in the near future.

           */

        const DEFAULT_ON_PRODUCT = 'Poloniex-BTC/USDT-AAMasters-AAOlivia-Candles'

        if (thisObject.code === DEFAULT_ON_PRODUCT) {
          changeStatusTo(PRODUCT_CARD_STATUS.LOADING)
        } else {
          changeStatusTo(PRODUCT_CARD_STATUS.OFF)
        }
      }

       /* Lets listen to our own events to react when we have a Mouse Click */

      thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)
      thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)

       /* WARNING THIS IS TEMPORARY CODE */

      const LEGACY_TEAM = thisObject.devTeam.codeName
      const REPO = thisObject.bot.repo
      const PROFILE_PIC = thisObject.bot.profilePicture

       /* The plotter banner, comes from the Legacy Location so far, no matter if the Team is at the Teams Modules or not. */

      const PLOTTER_TEAM = thisObject.product.plotter.devTeam
      const PLOTTER_REPO = thisObject.product.plotter.codeName
      const PLOTTER_PROFILE_PIC = thisObject.product.plotter.profilePicture

      legacyPlotterBanner = new Image()
      legacyPlotterBanner.onload = onLegacyPlotterBanner

      function onLegacyPlotterBanner () {
        legacyPlotterBannerLoaded = true
      }

      legacyPlotterBanner.src = window.canvasApp.urlPrefix + 'Images/' + PLOTTER_TEAM + '/' + PLOTTER_REPO + '/' + PLOTTER_PROFILE_PIC

      const TEAM = thisObject.devTeam.codeName.toLowerCase()
      const BOT = thisObject.bot.codeName.toLowerCase()

      if (window.canvasApp.context.teamProfileImages.get(TEAM) === undefined) {
        // This means this Team is a Lecay Team, still not at any Module.

           /*
           Here we will download the images still at the legacy storage.
           */

        legacyTeamAvatar = new Image()

        legacyTeamAvatar.onload = onLegacyImageLoad

        function onLegacyImageLoad () {
          legacyTeamAvatarLoaded = true
        }

        legacyTeamAvatar.src = window.canvasApp.urlPrefix + 'Images/' + LEGACY_TEAM + '/' + LEGACY_TEAM + '.png'

        legacyBotAvatar = new Image()
        legacyBotAvatar.onload = onLegacyImageLoadBot

        function onLegacyImageLoadBot () {
          legacyBotAvatarLoaded = true
          thisObject.bot.avatar = legacyBotAvatar
        }

        legacyBotAvatar.src = window.canvasApp.urlPrefix + 'Images/' + LEGACY_TEAM + '/' + REPO + '/' + PROFILE_PIC
      } else {
           /*
              Here we will download the images of teams uploaded at the Teams Module.
              There might be Product Cards of bots beloging to teams not present currently at the Teams Module, in those cases
              nothing should happen.
          */

        teamAvatar = new Image()

        teamAvatar.onload = onImageLoad

        function onImageLoad () {
          teamAvatarLoaded = true
        }

        teamAvatar.src = window.canvasApp.context.teamProfileImages.get(TEAM)

        botAvatar = new Image()
        botAvatar.onload = onImageLoadBot

        function onImageLoadBot () {
          botAvatarLoaded = true
          thisObject.bot.avatar = botAvatar
        }

        botAvatar.src = window.canvasApp.context.fbProfileImages.get(TEAM + '-' + BOT)
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
    }
  }

  function getContainer (point) {
    var container

       /* First we check if this point is inside this space. */

    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
      return thisObject.container
    } else {
           /* This point does not belong to this space. */

      return undefined
    }
  }

  function setDatetime (pDatetime) {
       /*

       When the datetime changes from one day to another, this forces cursors to potentially load more files, thus we reset this counter and
       get ready to receive events on files loaded.

       */

    let currentDate = Math.trunc(datetime.valueOf() / ONE_DAY_IN_MILISECONDS)
    let newDate = Math.trunc(pDatetime.valueOf() / ONE_DAY_IN_MILISECONDS)

    datetime = pDatetime

    if (currentDate !== newDate) {
      if (timePeriod <= _1_HOUR_IN_MILISECONDS) {
        dailyFileProgressBar.animatedValue = 0
      }
    }
  }

  function setTimePeriod (pTimePeriod) {
       /*

       When the time period below or equal to 1 hour changes, this forces cursors to potentially load more files, thus we reset this counter and
       get ready to receive events on files loaded.

       */

    if (timePeriod !== pTimePeriod) {
      timePeriod = pTimePeriod

      if (timePeriod <= _1_HOUR_IN_MILISECONDS) {
        dailyFileProgressBar.animatedValue = 0
      }
    }
  }

  function onMarketFileLoaded (event) {
    marketFileProgressBar.value = Math.trunc(event.totalValue * 100 / event.totalValue)
    marketFileProgressBar.fillStyle = LOADING_FILL_STYLE
    marketFileProgressBar.strokeStyle = LOADING_STROKE_STYLE

    if (marketFileProgressBar.value > 100) { marketFileProgressBar.value = 100 }
  }

  function onDailyFileLoaded (event) {
    dailyFileProgressBar.value = Math.trunc(event.currentValue * 100 / event.totalValue)
    dailyFileProgressBar.fillStyle = LOADING_FILL_STYLE
    dailyFileProgressBar.strokeStyle = LOADING_STROKE_STYLE

    if (dailyFileProgressBar.value > 100) { dailyFileProgressBar.value = 100 }
  }

  function onSingleFileLoaded (event) {
    singleFileProgressBar.value = Math.trunc(event.currentValue * 100 / event.totalValue)
    singleFileProgressBar.fillStyle = LOADING_FILL_STYLE
    singleFileProgressBar.strokeStyle = LOADING_STROKE_STYLE

    if (singleFileProgressBar.value > 100) { singleFileProgressBar.value = 100 }
  }

  function onFileSequenceLoaded (event) {
    fileSequenceProgressBar.value = Math.trunc(event.currentValue * 100 / event.totalValue)
    fileSequenceProgressBar.fillStyle = LOADING_FILL_STYLE
    fileSequenceProgressBar.strokeStyle = LOADING_STROKE_STYLE

    if (fileSequenceProgressBar.value > 100) { fileSequenceProgressBar.value = 100 }
  }

  function turnOff () {
    if (thisObject.status !== PRODUCT_CARD_STATUS.OFF) {
      resetProgressBars()
      changeStatusTo(PRODUCT_CARD_STATUS.OFF)
    }
  }

  function turnOn () {
    if (thisObject.status === PRODUCT_CARD_STATUS.OFF) {
      changeStatusTo(PRODUCT_CARD_STATUS.LOADING)
    }
  }

  function onMouseClick (event) {
    switch (thisObject.status) {
      case PRODUCT_CARD_STATUS.ON:
        resetProgressBars()
        changeStatusTo(PRODUCT_CARD_STATUS.OFF)
        break
      case PRODUCT_CARD_STATUS.OFF:
        changeStatusTo(PRODUCT_CARD_STATUS.LOADING)
        break
      case PRODUCT_CARD_STATUS.LOADING:
        changeStatusTo(PRODUCT_CARD_STATUS.OFF)
        break
    }
  }

  function resetProgressBars () {
    marketFileProgressBar.animatedValue = 0
    marketFileProgressBar.value = 0
    marketFileProgressBar.fillStyle = UNLOADED_FILL_STYLE
    marketFileProgressBar.strokeStyle = UNLOADED_STROKE_STYLE

    dailyFileProgressBar.animatedValue = 0
    dailyFileProgressBar.value = 0
    dailyFileProgressBar.fillStyle = UNLOADED_FILL_STYLE
    dailyFileProgressBar.strokeStyle = UNLOADED_STROKE_STYLE

    singleFileProgressBar.animatedValue = 0
    singleFileProgressBar.value = 0
    singleFileProgressBar.fillStyle = UNLOADED_FILL_STYLE
    singleFileProgressBar.strokeStyle = UNLOADED_STROKE_STYLE

    fileSequenceProgressBar.animatedValue = 0
    fileSequenceProgressBar.value = 0
    fileSequenceProgressBar.fillStyle = UNLOADED_FILL_STYLE
    fileSequenceProgressBar.strokeStyle = UNLOADED_STROKE_STYLE
  }

  function onMouseOver (event) {
    lastMouseOver = 25
  }

  function changeStatusTo (pNewStatus) {
    if (thisObject.status !== pNewStatus) {
      thisObject.status = pNewStatus
      let eventData = thisObject
      thisObject.container.eventHandler.raiseEvent('Status Changed', eventData)
      window.localStorage.setItem(thisObject.code, thisObject.status)
    }
  }

  function draw () {
    drawProductCard()
  }

  function drawProductCard () {
       /*
       Put images on the card.
       */

    let fitImagePoint = {
      x: 0,
      y: 0
    }

    const devTeamImageSize = 20
    const botImageSize = 20
    const plotterImageSize = {
      width: 180,
      height: 50
    }

    lastMouseOver--  // Animating the mouse onMouseOver

    if (lastMouseOver > 0) {
      /* First the Dev Team Profile Picture. */
      let teamImagePoint = {
        x: 2,
        y: thisObject.container.frame.height / 2 - devTeamImageSize / 2
      }

      teamImagePoint = thisObject.container.frame.frameThisPoint(teamImagePoint)
      fitImagePoint = thisObject.fitFunction(teamImagePoint)
      let teamImage
      if (legacyTeamAvatarLoaded === true) {
        teamImage = legacyTeamAvatar
      }
      if (teamAvatarLoaded === true) {
        teamImage = teamAvatar
      }
      if (teamImage !== undefined && teamImagePoint.y === fitImagePoint.y) {
        if (teamImage.naturalHeight !== 0) {
         /* The image is rounded before being displayed. */
          browserCanvasContext.save()
          browserCanvasContext.beginPath()
          browserCanvasContext.arc(teamImagePoint.x + devTeamImageSize / 2, teamImagePoint.y + devTeamImageSize / 2, devTeamImageSize / 2, 0, Math.PI * 2, true)
          browserCanvasContext.closePath()
          browserCanvasContext.clip()
          browserCanvasContext.drawImage(teamImage, teamImagePoint.x, teamImagePoint.y, devTeamImageSize, devTeamImageSize)
          browserCanvasContext.beginPath()
          browserCanvasContext.arc(teamImagePoint.x, teamImagePoint.y, devTeamImageSize / 2, 0, Math.PI * 2, true)
          browserCanvasContext.clip()
          browserCanvasContext.closePath()
          browserCanvasContext.restore()
        }
      }

      /* Second the Bot's Profile Picture. */
      if (thisObject.bot.profilePicture !== undefined) {
        let botImagePoint = {
          x: thisObject.container.frame.width - botImageSize / 2 - 8,
          y: thisObject.container.frame.height / 2 - botImageSize / 2
        }
        botImagePoint = thisObject.container.frame.frameThisPoint(botImagePoint)
        fitImagePoint = thisObject.fitFunction(botImagePoint)

        let imageId = thisObject.bot.devTeam + '.' + thisObject.bot.profilePicture
        /* TODO Temporary code */
        let botImage
        botImage = thisObject.bot.avatar
        if (botImage !== undefined && botImagePoint.y === fitImagePoint.y) {
          if (botImage.naturalHeight !== 0) {
             /* The image is rounded before being displayed. */
            browserCanvasContext.save()
            browserCanvasContext.beginPath()
            browserCanvasContext.arc(botImagePoint.x + botImageSize / 2, botImagePoint.y + botImageSize / 2, botImageSize / 2, 0, Math.PI * 2, true)
            browserCanvasContext.closePath()
            browserCanvasContext.clip()
            browserCanvasContext.drawImage(botImage, botImagePoint.x, botImagePoint.y, botImageSize, botImageSize)
            browserCanvasContext.beginPath()
            browserCanvasContext.arc(botImagePoint.x, botImagePoint.y, botImageSize / 2, 0, Math.PI * 2, true)
            browserCanvasContext.clip()
            browserCanvasContext.closePath()
            browserCanvasContext.restore()
          }
        }
      }
    }
       /* Third the Plotter's Profile Picture. */
    if (thisObject.product.plotter.profilePicture !== undefined) {
      let plotterImagePoint = {
        x: thisObject.container.frame.width / 2 - plotterImageSize.width / 2,
        y: thisObject.container.frame.height / 2 - plotterImageSize.height / 2
      }
      plotterImagePoint = thisObject.container.frame.frameThisPoint(plotterImagePoint)
      fitImagePoint = {
        x: 0,
        y: plotterImagePoint.y + plotterImageSize.height
      }
      fitImagePoint = thisObject.fitFunction(fitImagePoint)
      let imageId = thisObject.product.plotter.devTeam + '.' + thisObject.product.plotter.codeName + '.' + thisObject.product.plotter.moduleName + '.' + thisObject.product.plotter.profilePicture
      let plotterImage = legacyPlotterBanner
      if (plotterImage !== undefined && plotterImagePoint.y + plotterImageSize.height === fitImagePoint.y) {
        if (plotterImage.naturalHeight !== 0) {
          browserCanvasContext.drawImage(plotterImage, plotterImagePoint.x, plotterImagePoint.y, plotterImageSize.width, plotterImageSize.height)
        }
      }
    }
    drawProductLoadStatus()

    function drawProductLoadStatus () {
      let offFillStyle = 'rgba(' + UI_COLOR.RED + ', 0.20)'
      let onFillStyle = 'rgba(' + UI_COLOR.GREEN + ', 0.20)'
      let loadingFillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 0.40)'

      switch (thisObject.status) {
        case PRODUCT_CARD_STATUS.ON:
          browserCanvasContext.fillStyle = onFillStyle
          break
        case PRODUCT_CARD_STATUS.OFF:
          browserCanvasContext.fillStyle = offFillStyle
          break
        case PRODUCT_CARD_STATUS.LOADING:
          browserCanvasContext.fillStyle = loadingFillStyle
          break
      }

      let centerPoint = {
        x: thisObject.container.frame.width / 2,
        y: thisObject.container.frame.height / 2 - 13
      }

      let point1 = {
        x: centerPoint.x - plotterImageSize.width / 2,
        y: centerPoint.y - plotterImageSize.height / 2 - 7
      }

      let point2 = {
        x: centerPoint.x + plotterImageSize.width / 2,
        y: centerPoint.y - plotterImageSize.height / 2 - 7
      }

      let point3 = {
        x: centerPoint.x + plotterImageSize.width / 2,
        y: centerPoint.y - plotterImageSize.height / 2 + 7
      }

      let point4 = {
        x: centerPoint.x - plotterImageSize.width / 2,
        y: centerPoint.y - plotterImageSize.height / 2 + 7
      }
           /* Now the transformations. */
      point1 = thisObject.container.frame.frameThisPoint(point1)
      point2 = thisObject.container.frame.frameThisPoint(point2)
      point3 = thisObject.container.frame.frameThisPoint(point3)
      point4 = thisObject.container.frame.frameThisPoint(point4)

      point1 = thisObject.fitFunction(point1)
      point2 = thisObject.fitFunction(point2)
      point3 = thisObject.fitFunction(point3)
      point4 = thisObject.fitFunction(point4)

      browserCanvasContext.beginPath()
      browserCanvasContext.moveTo(point1.x, point1.y)
      browserCanvasContext.lineTo(point2.x, point2.y)
      browserCanvasContext.lineTo(point3.x, point3.y)
      browserCanvasContext.lineTo(point4.x, point4.y)
      browserCanvasContext.closePath()
      browserCanvasContext.fill()
      browserCanvasContext.strokeStyle = 'rgba(150, 150, 150, 1)'
      browserCanvasContext.lineWidth = 0.1
      browserCanvasContext.stroke()
    }
       /*
       print the text
       */
    let labelPoint
    let fontSize = 10

    browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
    let label
    if (lastMouseOver > 0) {
   /* devTeam */
      label = thisObject.devTeam.displayName
      if (label.length > 10) { label = label.substring(1, 8) + '...' }

      labelPoint = {
        x: 2 + devTeamImageSize / 2 - label.length / 2 * fontSize * FONT_ASPECT_RATIO,
        y: thisObject.container.frame.height / 2 + devTeamImageSize / 2 + fontSize * FONT_ASPECT_RATIO + 5
      }

      labelPoint = thisObject.container.frame.frameThisPoint(labelPoint)
      labelPoint = thisObject.fitFunction(labelPoint)
      browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
      browserCanvasContext.fillStyle = 'rgba(60, 60, 60, 0.50)'
      browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
   /* bot */
      label = thisObject.bot.displayName
      if (label.length > 10) { label = label.substring(1, 8) + '...' }

      labelPoint = {
        x: thisObject.container.frame.width - 8 - label.length / 2 * fontSize * FONT_ASPECT_RATIO,
        y: thisObject.container.frame.height / 2 + devTeamImageSize / 2 + fontSize * FONT_ASPECT_RATIO + 5
      }

      labelPoint = thisObject.container.frame.frameThisPoint(labelPoint)
      labelPoint = thisObject.fitFunction(labelPoint)

      browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
      browserCanvasContext.fillStyle = 'rgba(60, 60, 60, 0.50)'
      browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
    }
       /* product */
    fontSize = 10
    label = thisObject.product.displayName
    labelPoint = {
      x: 65,
      y: thisObject.container.frame.height / 2 + 15
    }
    labelPoint = {
      x: thisObject.container.frame.width / 2 - label.length / 2 * fontSize * FONT_ASPECT_RATIO,
      y: thisObject.container.frame.height / 2 - devTeamImageSize / 2 - fontSize * FONT_ASPECT_RATIO - 20
    }
    labelPoint = thisObject.container.frame.frameThisPoint(labelPoint)
    labelPoint = thisObject.fitFunction(labelPoint)

    browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
    browserCanvasContext.fillStyle = 'rgba(60, 60, 60, 0.50)'
    browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)

       /* ------------------- Progress Bars -------------------------- */

    const ANIMATED_INCREMENT = 5
    const OPACITY_INCREMENT = 0.05
    const OPACITY_MIN = 0.1

    let point1
    let point2
    let point3
    let point4

       /* We draw here the Market Progress Bar. */

       /* Animate */

    if (marketFileProgressBar.animatedValue < marketFileProgressBar.value) {
      marketFileProgressBar.animatedValue = marketFileProgressBar.animatedValue + ANIMATED_INCREMENT
      marketFileProgressBar.opacity = marketFileProgressBar.opacity + OPACITY_INCREMENT
    }

    if (marketFileProgressBar.animatedValue >= 100) {
      marketFileProgressBar.animatedValue = 100

      marketFileProgressBar.opacity = marketFileProgressBar.opacity - OPACITY_INCREMENT
      if (marketFileProgressBar.opacity < OPACITY_MIN) { marketFileProgressBar.opacity = OPACITY_MIN }

      marketFileProgressBar.fillStyle = LOADED_FILL_STYLE.replace('@Opacity', marketFileProgressBar.opacity.toString())
      marketFileProgressBar.strokeStyle = LOADED_STROKE_STYLE.replace('@Opacity', marketFileProgressBar.opacity.toString())

      changeStatusTo(PRODUCT_CARD_STATUS.ON)
    }

    point1 = {
      x: 0,
      y: thisObject.container.frame.height - 1
    }

    point2 = {
      x: thisObject.container.frame.width * marketFileProgressBar.animatedValue / 100,
      y: thisObject.container.frame.height - 1
    }

    point3 = {
      x: thisObject.container.frame.width * marketFileProgressBar.animatedValue / 100,
      y: thisObject.container.frame.height - 3
    }

    point4 = {
      x: 0,
      y: thisObject.container.frame.height - 3
    }

       /* Now the transformations. */

    point1 = thisObject.container.frame.frameThisPoint(point1)
    point2 = thisObject.container.frame.frameThisPoint(point2)
    point3 = thisObject.container.frame.frameThisPoint(point3)
    point4 = thisObject.container.frame.frameThisPoint(point4)

    point1 = thisObject.fitFunction(point1)
    point2 = thisObject.fitFunction(point2)
    point3 = thisObject.fitFunction(point3)
    point4 = thisObject.fitFunction(point4)

    browserCanvasContext.beginPath()
    browserCanvasContext.moveTo(point1.x, point1.y)
    browserCanvasContext.lineTo(point2.x, point2.y)
    browserCanvasContext.lineTo(point3.x, point3.y)
    browserCanvasContext.lineTo(point4.x, point4.y)
    browserCanvasContext.closePath()

    browserCanvasContext.fillStyle = marketFileProgressBar.fillStyle.replace('@Opacity', marketFileProgressBar.opacity.toString())
    browserCanvasContext.strokeStyle = marketFileProgressBar.strokeStyle.replace('@Opacity', marketFileProgressBar.opacity.toString())

    browserCanvasContext.fill()
    browserCanvasContext.lineWidth = 0.1
    browserCanvasContext.stroke()

       /* We draw here the Daily Progress Bar. */

       /* Animate */

    if (dailyFileProgressBar.animatedValue < dailyFileProgressBar.value) {
      dailyFileProgressBar.animatedValue = dailyFileProgressBar.animatedValue + ANIMATED_INCREMENT
      dailyFileProgressBar.opacity = dailyFileProgressBar.opacity + OPACITY_INCREMENT
    }

    if (dailyFileProgressBar.animatedValue >= 100) {
      dailyFileProgressBar.animatedValue = 100

      dailyFileProgressBar.opacity = dailyFileProgressBar.opacity - OPACITY_INCREMENT
      if (dailyFileProgressBar.opacity < OPACITY_MIN) { dailyFileProgressBar.opacity = OPACITY_MIN }

      dailyFileProgressBar.fillStyle = LOADED_FILL_STYLE.replace('@Opacity', dailyFileProgressBar.opacity.toString())
      dailyFileProgressBar.strokeStyle = LOADED_STROKE_STYLE.replace('@Opacity', dailyFileProgressBar.opacity.toString())

      changeStatusTo(PRODUCT_CARD_STATUS.ON)
    }

    point1 = {
      x: 0,
      y: thisObject.container.frame.height - 4
    }

    point2 = {
      x: thisObject.container.frame.width * dailyFileProgressBar.animatedValue / 100,
      y: thisObject.container.frame.height - 4
    }

    point3 = {
      x: thisObject.container.frame.width * dailyFileProgressBar.animatedValue / 100,
      y: thisObject.container.frame.height - 6
    }

    point4 = {
      x: 0,
      y: thisObject.container.frame.height - 6
    }

       /* Now the transformations. */

    point1 = thisObject.container.frame.frameThisPoint(point1)
    point2 = thisObject.container.frame.frameThisPoint(point2)
    point3 = thisObject.container.frame.frameThisPoint(point3)
    point4 = thisObject.container.frame.frameThisPoint(point4)

    point1 = thisObject.fitFunction(point1)
    point2 = thisObject.fitFunction(point2)
    point3 = thisObject.fitFunction(point3)
    point4 = thisObject.fitFunction(point4)

    browserCanvasContext.beginPath()
    browserCanvasContext.moveTo(point1.x, point1.y)
    browserCanvasContext.lineTo(point2.x, point2.y)
    browserCanvasContext.lineTo(point3.x, point3.y)
    browserCanvasContext.lineTo(point4.x, point4.y)
    browserCanvasContext.closePath()

    browserCanvasContext.fillStyle = dailyFileProgressBar.fillStyle.replace('@Opacity', dailyFileProgressBar.opacity.toString())
    browserCanvasContext.strokeStyle = dailyFileProgressBar.strokeStyle.replace('@Opacity', dailyFileProgressBar.opacity.toString())

    browserCanvasContext.fill()
    browserCanvasContext.lineWidth = 0.1
    browserCanvasContext.stroke()

       /* We draw here the Single File Progress Bar. */

       /* Animate */

    if (singleFileProgressBar.animatedValue < singleFileProgressBar.value) {
      singleFileProgressBar.animatedValue = singleFileProgressBar.animatedValue + ANIMATED_INCREMENT
      singleFileProgressBar.opacity = singleFileProgressBar.opacity + OPACITY_INCREMENT
    }

    if (singleFileProgressBar.animatedValue >= 100) {
      singleFileProgressBar.animatedValue = 100

      singleFileProgressBar.opacity = singleFileProgressBar.opacity - OPACITY_INCREMENT
      if (singleFileProgressBar.opacity < OPACITY_MIN) { singleFileProgressBar.opacity = OPACITY_MIN }

      singleFileProgressBar.fillStyle = LOADED_FILL_STYLE.replace('@Opacity', singleFileProgressBar.opacity.toString())
      singleFileProgressBar.strokeStyle = LOADED_STROKE_STYLE.replace('@Opacity', singleFileProgressBar.opacity.toString())

      changeStatusTo(PRODUCT_CARD_STATUS.ON)
    }

    point1 = {
      x: 0,
      y: thisObject.container.frame.height - 7
    }

    point2 = {
      x: thisObject.container.frame.width * singleFileProgressBar.animatedValue / 100,
      y: thisObject.container.frame.height - 7
    }

    point3 = {
      x: thisObject.container.frame.width * singleFileProgressBar.animatedValue / 100,
      y: thisObject.container.frame.height - 9
    }

    point4 = {
      x: 0,
      y: thisObject.container.frame.height - 9
    }

       /* Now the transformations. */

    point1 = thisObject.container.frame.frameThisPoint(point1)
    point2 = thisObject.container.frame.frameThisPoint(point2)
    point3 = thisObject.container.frame.frameThisPoint(point3)
    point4 = thisObject.container.frame.frameThisPoint(point4)

    point1 = thisObject.fitFunction(point1)
    point2 = thisObject.fitFunction(point2)
    point3 = thisObject.fitFunction(point3)
    point4 = thisObject.fitFunction(point4)

    browserCanvasContext.beginPath()
    browserCanvasContext.moveTo(point1.x, point1.y)
    browserCanvasContext.lineTo(point2.x, point2.y)
    browserCanvasContext.lineTo(point3.x, point3.y)
    browserCanvasContext.lineTo(point4.x, point4.y)
    browserCanvasContext.closePath()

    browserCanvasContext.fillStyle = singleFileProgressBar.fillStyle.replace('@Opacity', singleFileProgressBar.opacity.toString())
    browserCanvasContext.strokeStyle = singleFileProgressBar.strokeStyle.replace('@Opacity', singleFileProgressBar.opacity.toString())

    browserCanvasContext.fill()
    browserCanvasContext.lineWidth = 0.1
    browserCanvasContext.stroke()

       /* We draw here the File Sequence Progress Bar. */

       /* Animate */

    if (fileSequenceProgressBar.animatedValue < fileSequenceProgressBar.value) {
      fileSequenceProgressBar.animatedValue = fileSequenceProgressBar.animatedValue + ANIMATED_INCREMENT
      fileSequenceProgressBar.opacity = fileSequenceProgressBar.opacity + OPACITY_INCREMENT
    }

    if (fileSequenceProgressBar.animatedValue >= 100) {
      fileSequenceProgressBar.animatedValue = 100

      fileSequenceProgressBar.opacity = fileSequenceProgressBar.opacity - OPACITY_INCREMENT
      if (fileSequenceProgressBar.opacity < OPACITY_MIN) { fileSequenceProgressBar.opacity = OPACITY_MIN }

      fileSequenceProgressBar.fillStyle = LOADED_FILL_STYLE.replace('@Opacity', fileSequenceProgressBar.opacity.toString())
      fileSequenceProgressBar.strokeStyle = LOADED_STROKE_STYLE.replace('@Opacity', fileSequenceProgressBar.opacity.toString())

      changeStatusTo(PRODUCT_CARD_STATUS.ON)
    }

    point1 = {
      x: 0,
      y: thisObject.container.frame.height - 10
    }

    point2 = {
      x: thisObject.container.frame.width * fileSequenceProgressBar.animatedValue / 100,
      y: thisObject.container.frame.height - 10
    }

    point3 = {
      x: thisObject.container.frame.width * fileSequenceProgressBar.animatedValue / 100,
      y: thisObject.container.frame.height - 11
    }

    point4 = {
      x: 0,
      y: thisObject.container.frame.height - 11
    }

       /* Now the transformations. */

    point1 = thisObject.container.frame.frameThisPoint(point1)
    point2 = thisObject.container.frame.frameThisPoint(point2)
    point3 = thisObject.container.frame.frameThisPoint(point3)
    point4 = thisObject.container.frame.frameThisPoint(point4)

    point1 = thisObject.fitFunction(point1)
    point2 = thisObject.fitFunction(point2)
    point3 = thisObject.fitFunction(point3)
    point4 = thisObject.fitFunction(point4)

    browserCanvasContext.beginPath()
    browserCanvasContext.moveTo(point1.x, point1.y)
    browserCanvasContext.lineTo(point2.x, point2.y)
    browserCanvasContext.lineTo(point3.x, point3.y)
    browserCanvasContext.lineTo(point4.x, point4.y)
    browserCanvasContext.closePath()

    browserCanvasContext.fillStyle = fileSequenceProgressBar.fillStyle.replace('@Opacity', fileSequenceProgressBar.opacity.toString())
    browserCanvasContext.strokeStyle = fileSequenceProgressBar.strokeStyle.replace('@Opacity', fileSequenceProgressBar.opacity.toString())

    browserCanvasContext.fill()
    browserCanvasContext.lineWidth = 0.1
    browserCanvasContext.stroke()
  }
}

