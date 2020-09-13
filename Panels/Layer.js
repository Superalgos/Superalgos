function newLayer() {
    const MODULE_NAME = 'Layer'
    const ERROR_LOG = true
    const logger = newWebDebugLog()
    logger.fileName = MODULE_NAME

    let thisObject = {
        container: undefined,
        status: LAYER_STATUS.OFF,
        fitFunction: undefined,
        payload: undefined,
        definition: undefined,
        panels: undefined,
        baseAsset: undefined,
        quotedAsset: undefined,
        market: undefined,
        exchange: undefined,
        bot: undefined,
        productDefinition: undefined,
        dataMine: undefined,
        plotterModule: undefined,
        exchangeIcon: undefined,
        plotterTypeIcon: undefined,
        baseAssetIcon: undefined,
        quotedAssetIcon: undefined,
        networkNode: undefined,
        checkStatusAtShutDown: checkStatusAtShutDown,
        physics: physics,
        draw: draw,
        turnOff: turnOff,
        turnOn: turnOn,
        setDatetime: setDatetime,
        setTimeFrame: setTimeFrame,
        onMarketFileLoaded: onMarketFileLoaded,
        onDailyFileLoaded: onDailyFileLoaded,
        onSingleFileLoaded: onSingleFileLoaded,
        onFileSequenceLoaded: onFileSequenceLoaded,
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize,
        finalize: finalize
    }

    let LOADING_FILL_STYLE = 'rgba(234, 143, 23, @Opacity)'
    let LOADED_FILL_STYLE = 'rgba(45, 232, 28, @Opacity)'
    let UNLOADED_FILL_STYLE = 'rgba(226, 226, 226, @Opacity)'

    let LOADING_STROKE_STYLE = 'rgba(234, 143, 23, @Opacity)'
    let LOADED_STROKE_STYLE = 'rgba(45, 232, 28, @Opacity)'
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

    let timeFrame = INITIAL_TIME_PERIOD
    let datetime = NEW_SESSION_INITIAL_DATE

    /* Add an Event Handler */

    thisObject.eventHandler = newEventHandler()
    let imagesLoaded = 0
    let onMouseClickEventSuscriptionId
    let panelsVisibleButton

    return thisObject

    function finalize() {
        thisObject.container.eventHandler.stopListening(onMouseClickEventSuscriptionId)

        thisObject.container.finalize()
        thisObject.eventHandler.finalize()
        thisObject.container = undefined
        thisObject.eventHandler = undefined
        thisObject.status = undefined
        thisObject.fitFunction = undefined
        thisObject.payload = undefined
        thisObject.definition = undefined
        thisObject.panels = undefined

        timeFrame = undefined
        datetime = undefined

        LOADING_FILL_STYLE = undefined
        LOADED_FILL_STYLE = undefined
        UNLOADED_FILL_STYLE = undefined

        LOADING_STROKE_STYLE = undefined
        LOADED_STROKE_STYLE = undefined
        UNLOADED_STROKE_STYLE = undefined

        marketFileProgressBar = undefined
        dailyFileProgressBar = undefined
        singleFileProgressBar = undefined
        fileSequenceProgressBar = undefined

        panelsVisibleButton = undefined

        thisObject.baseAsset = undefined
        thisObject.quotedAsset = undefined
        thisObject.market = undefined
        thisObject.exchange = undefined
        thisObject.plotterModule = undefined
        thisObject.exchangeIcon = undefined
        thisObject.plotterTypeIcon = undefined
        thisObject.baseAssetIcon = undefined
        thisObject.quotedAssetIcon = undefined
        thisObject.networkNode = undefined
        thisObject.bot = undefined
        thisObject.productDefinition = undefined
        thisObject.dataMine = undefined
    }

    function initialize(callBackFunction) {
        /* Create this objects continer */
        try {
            thisObject.container = newContainer()
            thisObject.container.initialize(MODULE_NAME + ' ' + thisObject.payload.node.id)
            thisObject.container.isDraggeable = false
            thisObject.container.isClickeable = true

            /* Lets set the basic dimensions of this thisObject. */
            let position = {
                x: 0,
                y: 0
            }

            thisObject.container.frame.position = position
            thisObject.container.frame.width = UI_PANEL.WIDTH.NORMAL
            thisObject.container.frame.height = 70

            let functionLibraryProtocolNode = newProtocolNode()
            let lightingPath =
                '->Layer->' +
                'Data Product->' +
                'Data Product Folder->Data Product Folder->Data Product Folder->Data Product Folder->Data Product Folder->' +
                'Bot Products->Data Mine Products->' +
                'Single Market Data->Exchange Data Products->' +
                'Session Reference->Session Independent Data->Session Based Data->Exchange Sessions->Session Based Data->Data Storage->Network Node->' +
                'Data Storage->Network Node->' +
                'Backtesting Session->Paper Trading Session->Fordward Testing Session->Live Trading Session->' +
                'Trading System Reference->Trading Engine Reference->Trading System->Trading Engine->' +
                'Market->Market Base Asset->Asset->' +
                'Market Quoted Asset->Asset->' +
                'Exchange Markets->Crypto Exchange->' +
                'Product Definition->' +
                'Product Definition Folder->Product Definition Folder->Product Definition Folder->Product Definition Folder->Product Definition Folder->' +
                'Sensor Bot->Indicator Bot->Trading Bot->' +
                'Data Mine->Trading Mine->' +
                'Dataset Definition->' +
                'Record Definition->Record Property->Formula->' +
                'Data Building Procedure->Procedure Loop->Javascript Code->Procedure Initialization->Javascript Code->' +
                'Calculations Procedure->Procedure Loop->Javascript Code->Procedure Initialization->Javascript Code->' +
                'Plotter Module->Plotter->' +
                'Shapes->' +
                'Chart Points->Point->Point Formula->' +
                'Polygon->Polygon Condition->Polygon Body->Style->Style Condition->Style->' +
                'Polygon Border->Style->Style Condition->Style->' +
                'Polygon Vertex->Point->' +
                'Image->Image Condition->Image Position->Point->' +
                'Text->Text Condition->Text Position->Point->Text Formula->Text Style->' +
                'Plotter Panel->Javascript Code->Panel Data->Data Formula->' +
                'Nodes Highlights->Nodes Values->Nodes Errors->Nodes Warnings->Nodes Infos->Nodes Status->Nodes Progress->Nodes Running->Nodes Announcements->Record Values->'
            thisObject.definition = functionLibraryProtocolNode.getProtocolNode(thisObject.payload.node, false, true, true, false, false, lightingPath)

            /* Without this I can not continue, because I can not even show error. */
            if (thisObject.payload === undefined) {
                console.log(MODULE_NAME + ' ' + 'thisObject.payload === undefined')
                return
            }
            if (thisObject.payload.uiObject === undefined) {
                console.log(MODULE_NAME + ' ' + 'thisObject.payload.uiObject === undefined')
                return
            }
            if (thisObject.payload.node === undefined) {
                console.log(MODULE_NAME + ' ' + 'thisObject.payload.node === undefined')
                return
            }

            /* Here we validate that we have all the needed information */
            if (findNodeInNodeMesh(thisObject.definition, 'Data Product') === undefined) {
                thisObject.payload.uiObject.setErrorMessage('Data Product not Found')
                return
            }
            if (findNodeInNodeMesh(thisObject.definition, 'Market') === undefined) {
                thisObject.payload.uiObject.setErrorMessage('Market not Found')
                return
            }

            thisObject.productDefinition = findNodeInNodeMesh(thisObject.definition, 'Product Definition')
            if (thisObject.productDefinition === undefined) {
                thisObject.payload.uiObject.setErrorMessage('Product Definition not Found')
                return
            }

            thisObject.bot = findNodeInNodeMesh(thisObject.definition, 'Sensor Bot')
            if (thisObject.bot === undefined) {
                thisObject.bot = findNodeInNodeMesh(thisObject.definition, 'Indicator Bot')
            }
            if (thisObject.bot === undefined) {
                thisObject.bot = findNodeInNodeMesh(thisObject.definition, 'Trading Bot')
            }
            if (thisObject.bot === undefined) {
                thisObject.payload.uiObject.setErrorMessage('Bot not Found')
                return
            }

            thisObject.dataMine = findNodeInNodeMesh(thisObject.definition, 'Data Mine')
            if (thisObject.dataMine === undefined) {
                thisObject.dataMine = findNodeInNodeMesh(thisObject.definition, 'Trading Mine')
                if (thisObject.dataMine === undefined) {
                    thisObject.payload.uiObject.setErrorMessage('Data Mine or Trading Mine not Found')
                    return
                }
            }

            thisObject.exchange = findNodeInNodeMesh(thisObject.definition, 'Crypto Exchange')
            if (thisObject.exchange === undefined) {
                thisObject.payload.uiObject.setErrorMessage('Crypto Exchange not Found')
                return
            }

            thisObject.baseAsset = findNodeInNodeMesh(thisObject.definition, 'Market Base Asset')
            if (thisObject.baseAsset !== undefined) {
                thisObject.baseAsset = thisObject.baseAsset.referenceParent
            }
            if (thisObject.baseAsset === undefined) {
                thisObject.payload.uiObject.setErrorMessage('Market Base Asset not Found')
                return
            }

            thisObject.quotedAsset = findNodeInNodeMesh(thisObject.definition, 'Market Quoted Asset')
            if (thisObject.quotedAsset !== undefined) {
                thisObject.quotedAsset = thisObject.quotedAsset.referenceParent
            }
            if (thisObject.quotedAsset === undefined) {
                thisObject.payload.uiObject.setErrorMessage('Market Quoted Asset not Found')
                return
            }

            thisObject.plotterModule = findNodeInNodeMesh(thisObject.definition, 'Plotter Module')
            if (thisObject.plotterModule === undefined) {
                thisObject.payload.uiObject.setErrorMessage('Market Quoted Asset not Found')
                return
            }

            thisObject.networkNode = findNodeInNodeMesh(thisObject.definition, 'Network Node')
            if (thisObject.networkNode === undefined) {
                thisObject.payload.uiObject.setErrorMessage('Network Node not Found')
                return
            }

            /* Lets listen to our own events to react when we have a Mouse Click */
            onMouseClickEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)

            /* Get ready to draw this layer */
            thisObject.market = thisObject.baseAsset.config.codeName + '/' + thisObject.quotedAsset.config.codeName

            thisObject.exchangeIcon = getIcon(thisObject.exchange)

            if (thisObject.plotterModule.config.icon !== undefined) {
                thisObject.plotterTypeIcon = canvas.designSpace.iconCollection.get(thisObject.plotterModule.config.icon)
            }

            thisObject.baseAssetIcon = getIcon(thisObject.baseAsset)
            thisObject.quotedAssetIcon = getIcon(thisObject.quotedAsset)

            function getIcon(node) {
                let nodeDefinition = getNodeDefinition(node)
                let iconName
                if (nodeDefinition.alternativeIcons !== undefined) {
                    for (let i = 0; i < nodeDefinition.alternativeIcons.length; i++) {
                        alternativeIcon = nodeDefinition.alternativeIcons[i]
                        if (alternativeIcon.codeName === node.config.codeName) {
                            iconName = alternativeIcon.iconName
                        }
                    }
                }
                if (iconName !== undefined) {
                    icon = canvas.designSpace.iconCollection.get(iconName)
                } else {
                    icon = canvas.designSpace.iconCollection.get(nodeDefinition.icon)
                }
                return icon
            }

            callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
        }
    }

    function checkStatusAtShutDown() {
        /* Mechanism to recover a layer that was left loading the last time the browser was shut dowm. */
        let storedValue = loadPropertyFromNodeConfig(thisObject.payload, 'status')
        if (storedValue !== undefined) {
            if (storedValue === LAYER_STATUS.LOADING) {
                resetProgressBars()
                changeStatusTo(LAYER_STATUS.LOADING)
            }
        }
    }

    function getContainer(point) {
        if (panelsVisibleButton !== undefined) {
            let container = panelsVisibleButton.getContainer(point)
            if (container !== undefined) {
                return container
            }
        }
        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            return thisObject.container
        }
    }

    function setDatetime(pDatetime) {
        /*
        When the datetime changes from one day to another, this forces cursors to potentially load more files, thus we reset this counter and
        get ready to receive events on files loaded.
        */
        let currentDate = Math.trunc(datetime.valueOf() / ONE_DAY_IN_MILISECONDS)
        let newDate = Math.trunc(pDatetime.valueOf() / ONE_DAY_IN_MILISECONDS)

        datetime = pDatetime

        if (currentDate !== newDate) {
            if (timeFrame <= _1_HOUR_IN_MILISECONDS) {
                dailyFileProgressBar.animatedValue = 0
            }
        }
    }

    function setTimeFrame(pTimeFrame) {
        /*
        When the time period below or equal to 1 hour changes, this forces cursors to potentially load more files, thus we reset this counter and
        get ready to receive events on files loaded.
        */
        if (timeFrame !== pTimeFrame) {
            timeFrame = pTimeFrame

            if (timeFrame <= _1_HOUR_IN_MILISECONDS) {
                dailyFileProgressBar.animatedValue = 0
            }
        }
    }

    function onMarketFileLoaded(event) {
        if (event.totalValue === 0) {
            marketFileProgressBar.value = 100
            return
        }
        marketFileProgressBar.value = Math.trunc((event.currentValue + event.filesNotLoaded) * 100 / event.totalValue)
        marketFileProgressBar.fillStyle = LOADING_FILL_STYLE
        marketFileProgressBar.strokeStyle = LOADING_STROKE_STYLE

        if (marketFileProgressBar.value > 100) { marketFileProgressBar.value = 100 }
    }

    function onDailyFileLoaded(event) {
        if (event.totalValue === 0) {
            dailyFileProgressBar.value = 100
            return
        }
        dailyFileProgressBar.value = Math.trunc(event.currentValue * 100 / event.totalValue)
        dailyFileProgressBar.fillStyle = LOADING_FILL_STYLE
        dailyFileProgressBar.strokeStyle = LOADING_STROKE_STYLE

        if (dailyFileProgressBar.value > 100) { dailyFileProgressBar.value = 100 }
    }

    function onSingleFileLoaded(event) {
        if (event.totalValue === 0) {
            singleFileProgressBar.value = 100
            return
        }
        singleFileProgressBar.value = Math.trunc(event.currentValue * 100 / event.totalValue)
        singleFileProgressBar.fillStyle = LOADING_FILL_STYLE
        singleFileProgressBar.strokeStyle = LOADING_STROKE_STYLE

        if (singleFileProgressBar.value > 100) { singleFileProgressBar.value = 100 }
    }

    function onFileSequenceLoaded(event) {
        if (event.totalValue === 0) {
            fileSequenceProgressBar.value = 100
            return
        }
        fileSequenceProgressBar.value = Math.trunc(event.currentValue * 100 / event.totalValue)
        fileSequenceProgressBar.fillStyle = LOADING_FILL_STYLE
        fileSequenceProgressBar.strokeStyle = LOADING_STROKE_STYLE

        if (fileSequenceProgressBar.value > 100) { fileSequenceProgressBar.value = 100 }
    }

    function turnOff() {
        if (thisObject.status !== LAYER_STATUS.OFF) {
            resetProgressBars()
            changeStatusTo(LAYER_STATUS.OFF)
        }
    }

    function turnOn() {
        if (thisObject.status === LAYER_STATUS.OFF) {
            resetProgressBars()
            changeStatusTo(LAYER_STATUS.LOADING)
        }
    }

    function onMouseClick(event) {
        switch (thisObject.status) {
            case LAYER_STATUS.ON:
                resetProgressBars()
                changeStatusTo(LAYER_STATUS.OFF)
                break
            case LAYER_STATUS.OFF:
                resetProgressBars()
                changeStatusTo(LAYER_STATUS.LOADING)
                break
            case LAYER_STATUS.LOADING:
                changeStatusTo(LAYER_STATUS.OFF)
                break
        }
    }

    function resetProgressBars() {
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

    function physics() {
        statusPhysics()
        childrenPhysics()
    }

    function childrenPhysics() {
        /* Panels Visible Button Setup */
        if (thisObject.status === LAYER_STATUS.ON) {
            if (panelsVisibleButton === undefined) {
                if (thisObject.panels !== undefined) {
                    if (thisObject.panels.length > 0) {
                        panelsVisibleButton = newPanelsVisibleButton()

                        let storedValue = loadPropertyFromNodeConfig(thisObject.payload, 'showPanels')
                        if (storedValue !== undefined) {
                            if (storedValue === true || storedValue === false) {
                                panelsVisibleButton.showPanels = storedValue
                            }
                        }

                        panelsVisibleButton.initialize(thisObject.panels)
                        panelsVisibleButton.container.connectToParent(thisObject.container)
                    }
                }
            } else {
                savePropertyAtNodeConfig(thisObject.payload, 'showPanels', panelsVisibleButton.showPanels)
            }
        }
    }

    function statusPhysics() {
        /* We retrieve the stored status at the config. */
        try {
            let storedValue = loadPropertyFromNodeConfig(thisObject.payload, 'status')

            if (storedValue !== undefined) {
                if (storedValue !== thisObject.status) {
                    if (storedValue === LAYER_STATUS.ON) {
                        resetProgressBars()
                        changeStatusTo(LAYER_STATUS.LOADING)
                    }
                    if (storedValue === LAYER_STATUS.OFF) {
                        resetProgressBars()
                        changeStatusTo(LAYER_STATUS.OFF)
                    }
                }
            } else {
                resetProgressBars()
                changeStatusTo(LAYER_STATUS.OFF)
            }
        } catch (err) {
            // we ignore errors here since most likely they will be parsing errors.
        }

        /* Check when the loading finishes */
        if (
            thisObject.status === LAYER_STATUS.LOADING &&
            marketFileProgressBar.value === 100 &&
            dailyFileProgressBar.value === 100
        ) {
            changeStatusTo(LAYER_STATUS.ON)
        }
    }

    function changeStatusTo(newStatus) {
        if (thisObject.status !== newStatus) {
            thisObject.status = newStatus

            if (thisObject.status === LAYER_STATUS.OFF) {
                if (panelsVisibleButton !== undefined) {
                    panelsVisibleButton.finalize()
                    panelsVisibleButton = undefined
                }
            }

            savePropertyAtNodeConfig(thisObject.payload, 'status', thisObject.status)
            let eventData = thisObject
            thisObject.container.eventHandler.raiseEvent('Status Changed', eventData)
        }
    }

    function draw() {
        drawLayer()
        if (panelsVisibleButton !== undefined) {
            panelsVisibleButton.draw()
        }
    }

    function drawLayer() {
        drawLayerDisplay()
    }

    function drawProgressBar(progressBar, lineWidth, offsetY) {
        const ANIMATED_INCREMENT = 5
        const OPACITY_INCREMENT = 0.01
        const OPACITY_MIN = 1

        let point1
        let point2
        let horizontalMargin = 12

        if (progressBar.value === 0) {
            return
        }

        /* Animate */
        if (progressBar.animatedValue < progressBar.value) {
            progressBar.animatedValue = progressBar.animatedValue + ANIMATED_INCREMENT
            progressBar.opacity = progressBar.opacity + OPACITY_INCREMENT
        }

        if (progressBar.animatedValue >= 100) {
            progressBar.animatedValue = 100

            progressBar.opacity = progressBar.opacity - OPACITY_INCREMENT
            if (progressBar.opacity < OPACITY_MIN) { progressBar.opacity = OPACITY_MIN }

            progressBar.strokeStyle = LOADED_STROKE_STYLE.replace('@Opacity', progressBar.opacity.toString())
        }

        point1 = {
            x: 0 + horizontalMargin,
            y: thisObject.container.frame.height + offsetY
        }

        point2 = {
            x: (thisObject.container.frame.width - horizontalMargin * 2) * progressBar.animatedValue / 100 + horizontalMargin,
            y: thisObject.container.frame.height + offsetY
        }

        /* Now the transformations. */
        point1 = thisObject.container.frame.frameThisPoint(point1)
        point2 = thisObject.container.frame.frameThisPoint(point2)

        point1 = thisObject.fitFunction(point1)
        point2 = thisObject.fitFunction(point2)

        browserCanvasContext.beginPath()
        browserCanvasContext.moveTo(point1.x, point1.y)
        browserCanvasContext.lineTo(point2.x, point2.y)

        browserCanvasContext.closePath()

        browserCanvasContext.strokeStyle = progressBar.strokeStyle.replace('@Opacity', progressBar.opacity.toString())

        browserCanvasContext.setLineDash([2, 4])
        browserCanvasContext.lineWidth = lineWidth
        browserCanvasContext.stroke()
    }

    function drawLayerDisplay() {
        let label1 = thisObject.payload.node.name
        let label2 = thisObject.exchange.name.substring(0, 15) + ' - ' + thisObject.market
        let label3 = thisObject.status.toUpperCase()

        if (label1 !== undefined) {
            label1 = label1.substring(0, 30)
        }

        let backgroundColor = UI_COLOR.BLACK

        const RED_LINE_HIGHT = 4
        const OPACITY = 0.75

        let params = {
            cornerRadius: 0,
            lineWidth: 1,
            container: thisObject.container,
            borderColor: UI_COLOR.RUSTED_RED,
            castShadow: false,
            backgroundColor: backgroundColor,
            opacity: OPACITY
        }

        roundedCornersBackground(params)

        let parentLabel1FontSize = loadPropertyFromNodeConfig(thisObject.payload.parentNode.payload, 'label1FontSize')
        let parentLabel2FontSize = loadPropertyFromNodeConfig(thisObject.payload.parentNode.payload, 'label2FontSize')
        let parentLabel3FontSize = loadPropertyFromNodeConfig(thisObject.payload.parentNode.payload, 'label3FontSize')

        let label1FontSize = loadPropertyFromNodeConfig(thisObject.payload, 'label1FontSize')
        let label2FontSize = loadPropertyFromNodeConfig(thisObject.payload, 'label2FontSize')
        let label3FontSize = loadPropertyFromNodeConfig(thisObject.payload, 'label3FontSize')

        if (parentLabel1FontSize !== undefined) {
            label1FontSize = parentLabel1FontSize
        }
        if (parentLabel2FontSize !== undefined) {
            label2FontSize = parentLabel2FontSize
        }
        if (parentLabel3FontSize !== undefined) {
            label3FontSize = parentLabel3FontSize
        }

        if (label1FontSize === undefined) {
            if (label1.length > 20) {
                label1FontSize = 12
            } else {
                label1FontSize = 15
            }
        }

        if (label2FontSize === undefined) {
            label2FontSize = 10
        }

        if (label3FontSize === undefined) {
            label3FontSize = 9
        }

        drawLabel(label1, 1 / 2, 5.2 / 10, -5, 0, label1FontSize, thisObject.container)
        drawLabel(label2, 1 / 2, 8.2 / 10, -5, 0, label2FontSize, thisObject.container)
        drawLabel(label3, 1 / 2, 9.5 / 10, -5, 0, label3FontSize, thisObject.container)

        drawProgressBar(marketFileProgressBar, 2, -45 + 18)
        drawProgressBar(dailyFileProgressBar, 2, -46 + 18)
        drawProgressBar(singleFileProgressBar, 2, -47 + 18)
        drawProgressBar(fileSequenceProgressBar, 2, -48 + 18)

        drawIcon(thisObject.exchangeIcon, 1 / 8, 2 / 10, 0, 0, 14, thisObject.container)
        drawIcon(thisObject.plotterTypeIcon, 7 / 8, 2 / 10, 0, 0, 14, thisObject.container)
        drawIcon(thisObject.baseAssetIcon, 3.4 / 8, 2 / 10, 0, 0, 14, thisObject.container)
        drawIcon(thisObject.quotedAssetIcon, 4.6 / 8, 2 / 10, 0, 0, 14, thisObject.container)
    }
}

