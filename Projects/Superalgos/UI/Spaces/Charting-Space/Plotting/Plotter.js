function newPlotter() {
    const MODULE_NAME = 'Plotter'
    const ERROR_LOG = true
    const logger = newWebDebugLog()


    let thisObject = {
        currentRecord: undefined,
        container: undefined,
        fitFunction: undefined,
        onDailyFileLoaded: onDailyFileLoaded,
        initialize: initialize,
        finalize: finalize,
        getContainer: getContainer,
        setTimeFrame: setTimeFrame,
        setDatetime: setDatetime,
        setCoordinateSystem: setCoordinateSystem,
        physics: physics,
        draw: draw
    }

    let container = newContainer()
    container.initialize()
    thisObject.container = container

    let coordinateSystem
    let slotHeight = (UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.bottomRight.y - UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.topLeft.y) / 10  // This is the amount of slots available
    let mustRecalculateDataPoints = false
    let atMousePositionFillStyles = new Map()
    let atMousePositionStrokeStyles = new Map()

    let timeFrame                                                      // This will hold the current Time Frame the user is at.
    let datetime                                                        // This will hold the current Datetime the user is at.

    let marketFile                                                      // This is the current Market File being plotted.
    let fileCursor                                                      // This is the current File Cursor being used to retrieve Daily Files.

    let marketFiles                                                     // This object will provide the different Market Files at different Time Periods.
    let dailyFiles                                                      // This object will provide the different File Cursors at different Time Periods.

    let productDefinition                                               // Here we store a snapshot of the product definition which references this plotter.

    let records = []                                                    // We will have the information to be plotted here.
    let userPositionDate
    let minUserPositionRate
    let maxUserPositionRate

    let onMouseOverEventSuscriptionId
    let zoomChangedEventSubscriptionId
    let offsetChangedEventSubscriptionId
    let dragFinishedEventSubscriptionId
    let dimmensionsChangedEventSubscriptionId
    let marketFilesUpdatedEventSubscriptionId
    let dailyFilesUpdatedEventSubscriptionId
    let onDisplaceEventSubscriptionId
    let scaleChangedEventSubscriptionId

    let logged = false
    return thisObject

    function finalize() {
        try {
            /* Stop listening to the necesary events. */
            thisObject.container.eventHandler.stopListening(onMouseOverEventSuscriptionId)
            UI.projects.superalgos.spaces.chartingSpace.viewport.eventHandler.stopListening(zoomChangedEventSubscriptionId)
            UI.projects.superalgos.spaces.chartingSpace.viewport.eventHandler.stopListening(offsetChangedEventSubscriptionId)
            canvas.eventHandler.stopListening(dragFinishedEventSubscriptionId)
            thisObject.container.eventHandler.stopListening(dimmensionsChangedEventSubscriptionId)
            marketFiles.eventHandler.stopListening(marketFilesUpdatedEventSubscriptionId)
            dailyFiles.eventHandler.stopListening(dailyFilesUpdatedEventSubscriptionId)
            thisObject.container.eventHandler.stopListening(onDisplaceEventSubscriptionId)
            thisObject.fitFunction = undefined

            /* Clear References */
            marketFiles = undefined
            dailyFiles = undefined

            datetime = undefined
            timeFrame = undefined

            marketFile = undefined
            fileCursor = undefined

            finalizeCoordinateSystem()
            coordinateSystem = undefined
            slotHeight = undefined
            mustRecalculateDataPoints = undefined
            atMousePositionFillStyles = undefined
            atMousePositionStrokeStyles = undefined
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err.stack.stack) }
        }
    }

    function initialize(pStorage, pDatetime, pTimeFrame, pCoordinateSystem, callBackFunction, pProductDefinition) {
        try {

            /* Store the information received. */
            marketFiles = pStorage.marketFiles[0]
            dailyFiles = pStorage.dailyFiles[0]

            datetime = pDatetime
            timeFrame = pTimeFrame
            coordinateSystem = pCoordinateSystem
            initializeCoordinateSystem()

            productDefinition = pProductDefinition

            /* We need a Market File in order to calculate the Y scale, since this scale depends on actual data. */
            marketFile = marketFiles.getFile(ONE_DAY_IN_MILISECONDS)  // This file is the one processed faster.

            /* Now we set the right files according to current Period. */
            marketFile = marketFiles.getFile(pTimeFrame)
            fileCursor = dailyFiles.getFileCursor(pTimeFrame)

            /* Listen to the necesary events. */
            zoomChangedEventSubscriptionId = UI.projects.superalgos.spaces.chartingSpace.viewport.eventHandler.listenToEvent('Zoom Changed', onViewportZoomChanged)
            offsetChangedEventSubscriptionId = UI.projects.superalgos.spaces.chartingSpace.viewport.eventHandler.listenToEvent('Position Changed', onViewportPositionChanged)
            dragFinishedEventSubscriptionId = canvas.eventHandler.listenToEvent('Drag Finished', onDragFinished)
            marketFilesUpdatedEventSubscriptionId = marketFiles.eventHandler.listenToEvent('Files Updated', onMarketFilesUpdated)
            dailyFilesUpdatedEventSubscriptionId = dailyFiles.eventHandler.listenToEvent('Files Updated', onDailyFilesUpdated)
            onDisplaceEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onDisplace', onDisplace)
            onMouseOverEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)

            /* Get ready for plotting. */
            recalculate()
            dimmensionsChangedEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('Dimmensions Changed', function () {
                recalculate()
            })

            callBackFunction()
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
        }
    }

    function initializeCoordinateSystem() {
        scaleChangedEventSubscriptionId = coordinateSystem.eventHandler.listenToEvent('Scale Changed', onScaleChanged)
    }

    function finalizeCoordinateSystem() {
        coordinateSystem.eventHandler.stopListening(scaleChangedEventSubscriptionId)
    }

    function onScaleChanged() {
        mustRecalculateDataPoints = true
        recalculate()
    }

    function onMouseOver(event) {
        let userPosition = UI.projects.superalgos.utilities.dateRateTransformations.getDateFromPointAtBrowserCanvas(event, thisObject.container, coordinateSystem)
        userPositionDate = userPosition.valueOf()
        let rateRange = 10
        if (productDefinition.referenceParent.config.rateRange !== undefined) {
            rateRange = productDefinition.referenceParent.config.rateRange
        }

        let minPositionPoint = {
            x: event.x,
            y: event.y + rateRange
        }
        minUserPositionRate = UI.projects.superalgos.utilities.dateRateTransformations.getRateFromPointAtBrowserCanvas(minPositionPoint, thisObject.container, coordinateSystem)

        let maxPositionPoint = {
            x: event.x,
            y: event.y - rateRange
        }
        maxUserPositionRate = UI.projects.superalgos.utilities.dateRateTransformations.getRateFromPointAtBrowserCanvas(maxPositionPoint, thisObject.container, coordinateSystem)
    }

    function onMarketFilesUpdated() {
        try {
            let newMarketFile = marketFiles.getFile(timeFrame)
            if (newMarketFile !== undefined) {
                marketFile = newMarketFile
                mustRecalculateDataPoints = true
                recalculate()
            }
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] onMarketFilesUpdated -> err = ' + err.stack.stack) }
        }
    }

    function onDailyFilesUpdated() {
        try {
            let newFileCursor = dailyFiles.getFileCursor(timeFrame)
            if (newFileCursor !== undefined) {
                fileCursor = newFileCursor
                mustRecalculateDataPoints = true
                recalculate()
            }
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] onDailyFilesUpdated -> err = ' + err.stack.stack) }
        }
    }

    function getContainer(point) {
        try {
            let container
            /* First we check if this point is inside this space. */
            if (thisObject.container.frame.isThisPointHere(point) === true) {
                return thisObject.container
            } else {
                /* This point does not belong to this space. */
                return undefined
            }
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] getContainer -> err = ' + err.stack) }
        }
    }

    function setTimeFrame(pTimeFrame) {
        try {
            if (timeFrame !== pTimeFrame) {
                timeFrame = pTimeFrame
                mustRecalculateDataPoints = true
                if (timeFrame >= _1_HOUR_IN_MILISECONDS) {
                    marketFile = marketFiles.getFile(pTimeFrame)
                } else {
                    fileCursor = dailyFiles.getFileCursor(pTimeFrame)
                }
                recalculate()
            }
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] setTimeFrame -> err = ' + err.stack) }
        }
    }

    function setDatetime(pDatetime) {
        datetime = pDatetime
    }

    function setCoordinateSystem(pCoordinateSystem) {
        finalizeCoordinateSystem()
        coordinateSystem = pCoordinateSystem
        initializeCoordinateSystem()
    }

    function onDailyFileLoaded(event) {
        try {
            if (event.currentValue === event.totalValue) {
                /* This happens only when all of the files in the cursor have been loaded. */
                recalculate()
            }
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] onDailyFileLoaded -> err = ' + err.stack) }
        }
    }

    function draw() {

        thisObject.container.frame.draw()
        plot()

    }

    function physics() {
        for (let i = 0; i < records.length; i++) {
            let record = records[i]

            if (checkOutOfScreen(i, record) !== true) { continue }

            if (productDefinition.referenceParent.shapes === undefined) { continue }
            if (productDefinition.referenceParent.shapes.chartPoints === undefined) { continue }

            dataPointsCalculation(record)
        }
    }

    function recalculate() {
        try {
            if (timeFrame >= _1_HOUR_IN_MILISECONDS) {
                recalculateUsingMarketFiles()
            } else {
                recalculateUsingDailyFiles()
            }
            thisObject.container.eventHandler.raiseEvent('CandleStairs Changed', records)  // --> Check This
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] recalculate -> err = ' + err.stack) }
        }
    }

    function jsonifyDataFile(dataFile, recordDefinition, farLeftDate, farRightDate) {
        /*
            This function has as an input the raw data on files and creates with it an array of JSON objects
            with not calculated properties for later being consumed by Formulas
        */

        let jsonifiedArray = []
        let previous

        for (let i = 0; i < dataFile.length; i++) {
            let record = {}
            for (let j = 0; j < recordDefinition.properties.length; j++) {
                let property = recordDefinition.properties[j]
                if (property.config.isCalculated !== true) {
                    record[property.config.codeName] = dataFile[i][j]
                }
            }

            if (productDefinition.config.nodePathType === 'array') {
                /*
                When we have an array configuration, we know that the last field of the record
                contains the array index, which is needed to correctly plot this data. Since 
                this index is not part of the product definition, we will restore its value in 
                this way:
                */
                record.index = dataFile[i][recordDefinition.properties.length]
            }

            if (record.begin === undefined || record.end === undefined) {
                console.log('Could not find the property begin or end which are needed for the plotter to work. productDefinition.config.codeName = ' + productDefinition.config.codeName)
                continue
            }

            if (record.end <= farLeftDate.valueOf()) { continue }
            if (record.begin >= farRightDate.valueOf()) { continue }

            if (record.end < coordinateSystem.min.x) { continue }
            if (record.begin > coordinateSystem.max.x) { continue }

            record.previous = previous
            jsonifiedArray.push(record)
            previous = record
        }

        return jsonifiedArray
    }

    function calculationsProcedure(jsonArray, recordDefinition, calculationsProcedure, timeFrame) {
        /*
            This function has as an input an array of JSON objects, and it adds calculated properties to
            complete the set of properties that will be available.
        */

        let system = { // These are the available system variables to be used in User Code and Formulas
            timeFrame: timeFrame,
            ONE_DAY_IN_MILISECONDS: ONE_DAY_IN_MILISECONDS
        }
        let variable = {} // This is the structure where the user will define its own variables that will be shared across different config blocks and formulas.
        let results = []

        /* This is Initialization Code */
        if (calculationsProcedure.initialization !== undefined) {
            if (calculationsProcedure.initialization.procedureJavascriptCode !== undefined) {
                try {
                    eval(calculationsProcedure.initialization.procedureJavascriptCode.code)
                } catch (err) {
                    logger.write('[ERROR] calculationsProcedure -> initialization -> Error executing User Code. Error = ' + err.stack.stack)
                    logger.write('[ERROR] calculationsProcedure -> initialization -> Error executing User Code. Code = ' + calculationsProcedure.initialization.procedureJavascriptCode.code)
                    throw ('Error Executing User Code.')
                }
            }
        }

        /* This is Initialization Code */
        if (calculationsProcedure.loop !== undefined) {
            if (calculationsProcedure.loop.procedureJavascriptCode !== undefined) {
                for (let index = 0; index < jsonArray.length; index++) {
                    let product = jsonArray[index]

                    /* This is Loop Code */
                    try {
                        eval(calculationsProcedure.loop.procedureJavascriptCode.code)
                    } catch (err) {
                        logger.write('[ERROR] calculationsProcedure -> loop -> Error executing User Code. Error = ' + err.stack.stack)
                        logger.write('[ERROR] calculationsProcedure -> loop -> Error executing User Code. product = ' + JSON.stringify(product))
                        logger.write('[ERROR] calculationsProcedure -> loop -> Error executing User Code. Code = ' + calculationsProcedure.loop.procedureJavascriptCode.code)
                        throw ('Error Executing User Code.')
                    }

                    /* For each calculated property we apply its formula */
                    for (let j = 0; j < recordDefinition.properties.length; j++) {
                        let property = recordDefinition.properties[j]
                        if (property.config.isCalculated === true) {
                            if (property.recordFormula !== undefined) {
                                if (property.recordFormula.code !== undefined) {
                                    try {
                                        let newValue = eval(property.recordFormula.code)
                                        let currentRecord = product
                                        currentRecord[property.config.codeName] = newValue
                                    } catch (err) {
                                        logger.write('[ERROR] calculationsProcedure -> loop -> formula -> Error executing User Code. Error = ' + err.stack.stack)
                                        logger.write('[ERROR] calculationsProcedure -> loop -> formula -> Error executing User Code. product = ' + JSON.stringify(product))
                                        logger.write('[ERROR] calculationsProcedure -> loop -> formula -> Error executing User Code. Code = ' + property.recordFormula.code)
                                        throw ('Error Executing User Code.')
                                    }
                                }
                            }
                        }
                    }

                    /* Adding the new element to the resulting array */
                    results.push(product)
                }
            }
        }
        return results
    }

    function recalculateUsingDailyFiles() {
        try {
            if (fileCursor === undefined) {
                records = []
                return
            }    // We need to wait until there is a fileCursor available or maybe this indicator does not produce data for the current Time Frame
            if (fileCursor.files.size === 0) { return } // We need to wait until there are files in the cursor

            let daysOnSides = getSideDays(timeFrame)

            let leftDate = UI.projects.superalgos.utilities.dateRateTransformations.getDateFromPointAtBrowserCanvas(UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.topLeft, thisObject.container, coordinateSystem)
            let rightDate = UI.projects.superalgos.utilities.dateRateTransformations.getDateFromPointAtBrowserCanvas(UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.topRight, thisObject.container, coordinateSystem)

            let dateDiff = rightDate.valueOf() - leftDate.valueOf()

            let farLeftDate = new Date(leftDate.valueOf() - dateDiff * 1.5)
            let farRightDate = new Date(rightDate.valueOf() + dateDiff * 1.5)

            let currentDate = new Date(farLeftDate.valueOf())

            records = []

            while (currentDate.valueOf() <= farRightDate.valueOf() + ONE_DAY_IN_MILISECONDS) {
                let stringDate = currentDate.getUTCFullYear() + '-' + pad(currentDate.getUTCMonth() + 1, 2) + '-' + pad(currentDate.getUTCDate(), 2)

                let dailyFile = fileCursor.files.get(stringDate)

                if (dailyFile !== undefined) {
                    /* Transform the current file content into an array of JSON objects */
                    let jsonData = jsonifyDataFile(dailyFile, productDefinition.record, farLeftDate, farRightDate)

                    /* Add the calculated properties */
                    if (productDefinition.calculations !== undefined) {
                        let calculationsResult = calculationsProcedure(jsonData, productDefinition.record, productDefinition.calculations, timeFrame)
                        records.push(...calculationsResult) // This adds records to the current array.
                    } else {
                        records.push(...jsonData)// This adds records to the current array.
                    }
                }

                currentDate = new Date(currentDate.valueOf() + ONE_DAY_IN_MILISECONDS)
            }

        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] recalculateUsingDailyFiles -> err = ' + err.stack) }
        }
    }

    function recalculateUsingMarketFiles() {
        try {
            if (marketFile === undefined) {
                records = []
                return
            }    // Initialization not complete yet or this indicator does not produce data for the current time frame

            let daysOnSides = getSideDays(timeFrame)

            let leftDate = UI.projects.superalgos.utilities.dateRateTransformations.getDateFromPointAtBrowserCanvas(UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.topLeft, thisObject.container, coordinateSystem)
            let rightDate = UI.projects.superalgos.utilities.dateRateTransformations.getDateFromPointAtBrowserCanvas(UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.topRight, thisObject.container, coordinateSystem)

            let dateDiff = rightDate.valueOf() - leftDate.valueOf()

            leftDate = new Date(leftDate.valueOf() - dateDiff * 1.5)
            rightDate = new Date(rightDate.valueOf() + dateDiff * 1.5)

            for (let i = 0; i < records.length; i++) {
                let record = records[i]
                record.fillStyle = undefined
                record.strokeStyle = undefined
                record.dataPoints = undefined
                record.previous = undefined
                records[i] = {}
            }
            records = []

            /* Transform the current file content into an array of JSON objects */
            let jsonData = jsonifyDataFile(marketFile, productDefinition.record, leftDate, rightDate)

            /* Add the calculated properties */
            if (productDefinition.calculations !== undefined) {
                let calculationsResult = calculationsProcedure(jsonData, productDefinition.record, productDefinition.calculations, timeFrame)
                records.push(...calculationsResult) // This adds records to the current array.
            } else {
                records.push(...jsonData)// This adds records to the current array.
            }
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] recalculateUsingMarketFiles -> err = ' + err.stack) }
        }
    }

    function plot() {
        try {
            /* Clean the pannel at places where there is no record. */
            thisObject.container.eventHandler.raiseEvent('Current Record Changed', undefined)

            for (let i = 0; i < records.length; i++) {
                let record = records[i]

                if (checkOutOfScreen(i, record) !== true) { continue }

                let atMousePosition = false
                checkAtMousePosition()

                /* If there is code we execute it now. */
                if (productDefinition.referenceParent.plotterModuleJavascriptCode !== undefined) {
                    eval(productDefinition.referenceParent.plotterModuleJavascriptCode.code)
                }

                if (productDefinition.referenceParent.shapes === undefined) { continue }
                if (productDefinition.referenceParent.shapes.chartPoints === undefined) { continue }

                plotPolygons()
                plotImages()
                plotTexts()

                function checkAtMousePosition() {

                    if (userPositionDate >= record.begin && userPositionDate <= record.end) {
                        if (productDefinition.referenceParent.config.useRateAtMousePosition === true) {
                            let ratePropertyName = "rate"
                            if (productDefinition.referenceParent.config.ratePropertyName !== undefined) {
                                ratePropertyName = productDefinition.referenceParent.config.ratePropertyName
                            }
                            if (record[ratePropertyName] === undefined) {
                                currentRecordChanged()
                            } else {
                                if (productDefinition.referenceParent.config.rateInArrayAtIndex !== undefined) {
                                    /*
                                    If this property is present, it means for us that the rate is not comming as 
                                    a property of the record object, but instead, the record object contains an 
                                    array at the property ratePropertyName, and inside that array there are other 
                                    arrays from where we need to find the rate at some of its records at the index
                                    position determined by rateInArrayIndex
                                    */
                                    let rateArray = record[ratePropertyName]
                                    let rateInRange = false
                                    for (let i = 0; i < rateArray.length; i++) {
                                        let rateArrayItem = rateArray[i]
                                        /* 
                                        Here we will take the rate for this array item and we will apply the offset
                                        rules defined at the Plotter Module Config for this kind of sitiations.
                                        */
                                        let rate = rateArrayItem[productDefinition.referenceParent.config.rateInArrayAtIndex]
                                        let point = {
                                            x: 0,
                                            y: rate
                                        }
                                        point = coordinateSystem.transformThisPoint(point)
                                        point = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(point, container)
                                        point.y =
                                            point.y -
                                            productDefinition.referenceParent.config.rateOffsetBasedOnArrayIndex * i -
                                            productDefinition.referenceParent.config.rateOffset
                                        rate = UI.projects.superalgos.utilities.dateRateTransformations.getRateFromPointAtBrowserCanvas(point, thisObject.container, coordinateSystem)

                                        /*
                                        We will try to find at which record is the mouse pointer close enough.
                                        */
                                        if (rate >= minUserPositionRate && rate <= maxUserPositionRate) {
                                            /* 
                                            We store the index found here so as to enable whoever receives this 
                                            record to know which record the user is pointing at.
                                            */
                                            DEBUG.variable1 = 'i: ' + i
                                            record.rateIndex = i
                                            currentRecordChanged()
                                            rateInRange = true
                                            break
                                        }
                                    }
                                    if (rateInRange === false) {
                                        /*
                                        If the User is not pointing to a rate in particular we are still going
                                        to raise the event but without a rateindex property
                                        */
                                        record.rateIndex = undefined
                                        currentRecordChanged()
                                    }
                                } else {
                                    /* 
                                    Current Record depends that the mouse pointer is within a range close enought to the rate 
                                    */
                                    if (record[ratePropertyName] >= minUserPositionRate && record[ratePropertyName] <= maxUserPositionRate) {
                                        currentRecordChanged()
                                    }
                                }
                            }
                        } else {
                            /* Current Record depends only on begin and end. */
                            currentRecordChanged()
                        }

                        function currentRecordChanged() {
                            atMousePosition = true
                            thisObject.container.eventHandler.raiseEvent('Current Record Changed', record)
                        }
                    }
                }

                function plotPolygons() {
                    /* Here we are going to plot all the polygons. */
                    for (let j = 0; j < productDefinition.referenceParent.shapes.polygons.length; j++) {
                        let polygon = productDefinition.referenceParent.shapes.polygons[j]
                        /* We will check if we need to plot this Polygon or not. */
                        if (polygon.polygonCondition !== undefined) {
                            let mustPlot = eval(polygon.polygonCondition.code)
                            if (mustPlot !== true) { continue }
                        }

                        let calculatedStyle

                        /* Finding out the fill style */
                        let fillStyle = { // default values
                            opacity: 1,
                            paletteColor: UI_COLOR.BLACK
                        }
                        if (polygon.polygonBody !== undefined) {
                            if (record.fillStyle === undefined) {
                                record.fillStyle = new Map()
                            }
                            calculatedStyle = record.fillStyle.get(polygon.id)
                            if (calculatedStyle !== undefined) {
                                /* We use the already calculated style */
                                fillStyle = calculatedStyle
                            } else {
                                /* Get the default style if exists */
                                if (polygon.polygonBody.style !== undefined) {
                                    if (polygon.polygonBody.style.config !== undefined) {
                                        if (polygon.polygonBody.style.config.default !== undefined) {
                                            let bodyStyle = polygon.polygonBody.style.config.default
                                            if (bodyStyle.opacity !== undefined) { fillStyle.opacity = bodyStyle.opacity }
                                            if (bodyStyle.paletteColor !== undefined) { fillStyle.paletteColor = eval(bodyStyle.paletteColor) }
                                        }
                                    }
                                }
                                /* Apply conditional styles */
                                if (polygon.polygonBody.styleConditions !== undefined) {
                                    for (let k = 0; k < polygon.polygonBody.styleConditions.length; k++) {
                                        let condition = polygon.polygonBody.styleConditions[k]
                                        let value = eval(condition.code)
                                        if (value === true) {
                                            if (condition.style !== undefined) {
                                                let bodyStyle = condition.style.config
                                                if (bodyStyle.opacity !== undefined) { fillStyle.opacity = bodyStyle.opacity }
                                                if (bodyStyle.paletteColor !== undefined) { fillStyle.paletteColor = eval(bodyStyle.paletteColor) }
                                            }
                                        }
                                    }
                                }
                                /* Get the atMousePosition style if exists */
                                if (polygon.polygonBody.style !== undefined) {
                                    if (polygon.polygonBody.style.config.atMousePosition !== undefined) {
                                        let atMousePositionStyleDefinition = polygon.polygonBody.style.config.atMousePosition
                                        let atMousePositionStyle = {}
                                        if (atMousePositionStyleDefinition.opacity !== undefined) { atMousePositionStyle.opacity = atMousePositionStyleDefinition.opacity }
                                        if (atMousePositionStyleDefinition.paletteColor !== undefined) { atMousePositionStyle.paletteColor = eval(atMousePositionStyleDefinition.paletteColor) }
                                        atMousePositionFillStyles.set(polygon.id, atMousePositionStyle)
                                    }
                                }

                                record.fillStyle.set(polygon.id, fillStyle)
                            }
                        }

                        /* Finding out the stroke style */
                        let strokeStyle = { // default values
                            opacity: 1,
                            paletteColor: UI_COLOR.BLACK,
                            lineWidth: 1,
                            lineDash: [0, 0]
                        }
                        if (polygon.polygonBorder !== undefined) {
                            if (record.strokeStyle === undefined) {
                                record.strokeStyle = new Map()
                            }
                            calculatedStyle = record.strokeStyle.get(polygon.id)
                            if (calculatedStyle !== undefined) {
                                /* We use the already calculated style */
                                strokeStyle = calculatedStyle
                            } else {
                                /* Get the default style if exists */
                                if (polygon.polygonBorder.style !== undefined) {
                                    if (polygon.polygonBorder.style.config !== undefined) {
                                        if (polygon.polygonBorder.style.config.default !== undefined) {
                                            let borderStyle = polygon.polygonBorder.style.config.default
                                            if (borderStyle.opacity !== undefined) { strokeStyle.opacity = borderStyle.opacity }
                                            if (borderStyle.paletteColor !== undefined) { strokeStyle.paletteColor = eval(borderStyle.paletteColor) }
                                            if (borderStyle.lineWidth !== undefined) { strokeStyle.lineWidth = borderStyle.lineWidth }
                                            if (borderStyle.lineDash !== undefined) { strokeStyle.lineDash = borderStyle.lineDash }
                                        }
                                    }
                                }
                                /* Apply conditional styles */
                                if (polygon.polygonBorder.styleConditions !== undefined) {
                                    for (let k = 0; k < polygon.polygonBorder.styleConditions.length; k++) {
                                        let condition = polygon.polygonBorder.styleConditions[k]
                                        let value = eval(condition.code)
                                        if (value === true) {
                                            if (condition.style !== undefined) {
                                                let borderStyle = condition.style.config
                                                if (borderStyle.opacity !== undefined) { strokeStyle.opacity = borderStyle.opacity }
                                                if (borderStyle.paletteColor !== undefined) { strokeStyle.paletteColor = eval(borderStyle.paletteColor) }
                                                if (borderStyle.lineWidth !== undefined) { strokeStyle.lineWidth = borderStyle.lineWidth }
                                                if (borderStyle.lineDash !== undefined) { strokeStyle.lineDash = borderStyle.lineDash }
                                            }
                                        }
                                    }
                                }
                                /* Get the atMousePosition style if exists */
                                if (polygon.polygonBorder.style !== undefined) {
                                    if (polygon.polygonBorder.style.config.atMousePosition !== undefined) {
                                        let atMousePositionStyleDefinition = polygon.polygonBorder.style.config.atMousePosition
                                        let atMousePositionStyle = {}
                                        if (atMousePositionStyleDefinition.opacity !== undefined) { atMousePositionStyle.opacity = atMousePositionStyleDefinition.opacity }
                                        if (atMousePositionStyleDefinition.paletteColor !== undefined) { atMousePositionStyle.paletteColor = eval(atMousePositionStyleDefinition.paletteColor) }
                                        if (atMousePositionStyleDefinition.lineWidth !== undefined) { atMousePositionStyle.lineWidth = atMousePositionStyleDefinition.lineWidth }
                                        if (atMousePositionStyleDefinition.lineDash !== undefined) { atMousePositionStyle.lineDash = atMousePositionStyleDefinition.lineDash }
                                        atMousePositionStrokeStyles.set(polygon.id, atMousePositionStyle)
                                    }
                                }

                                record.strokeStyle.set(polygon.id, strokeStyle)
                            }
                        }

                        /* Draw the Polygon */
                        browserCanvasContext.beginPath()
                        for (let k = 0; k < polygon.polygonVertexes.length; k++) {
                            let polygonVertex = polygon.polygonVertexes[k]
                            if (polygonVertex.referenceParent !== undefined) {
                                let dataPointObject = record.dataPoints.get(polygonVertex.referenceParent.id)
                                if (dataPointObject === undefined) {
                                    polygonVertex.payload.uiObject.setErrorMessage('Vertex not referencing any Point')
                                    console.log('[WARN] You have a Polygon Vertex not referencing any Point.')
                                    continue
                                }

                                let dataPoint = {
                                    x: dataPointObject.x,
                                    y: dataPointObject.y
                                }
                                /* We make sure the points do not fall outside the viewport visible area. This step allways need to be done.  */
                                dataPoint = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoVisibleArea(dataPoint)
                                dataPoint = thisObject.fitFunction(dataPoint)

                                if (k === 0) {
                                    browserCanvasContext.moveTo(dataPoint.x, dataPoint.y)
                                } else {
                                    browserCanvasContext.lineTo(dataPoint.x, dataPoint.y)
                                }
                            }
                        }
                        browserCanvasContext.closePath()

                        /* Apply the fill style to the canvas object */
                        if (polygon.polygonBody !== undefined) {
                            /* Replace the fill style if we are at mouse position */
                            if (atMousePosition === true) {
                                let atMousePositionFillStyle = atMousePositionFillStyles.get(polygon.id)
                                if (atMousePositionFillStyle !== undefined) {
                                    fillStyle = atMousePositionFillStyle
                                }
                            }

                            browserCanvasContext.fillStyle = 'rgba(' + fillStyle.paletteColor + ', ' + fillStyle.opacity + ')'
                            browserCanvasContext.fill()
                        }

                        /* Apply the stroke style to the canvas object */
                        if (polygon.polygonBorder !== undefined) {
                            /* Replace the stroke style if we are at mouse position */
                            if (atMousePosition === true) {
                                let atMousePositionStrokeStyle = atMousePositionStrokeStyles.get(polygon.id)
                                if (atMousePositionStrokeStyle !== undefined) {
                                    strokeStyle = atMousePositionStrokeStyle
                                }
                            }

                            browserCanvasContext.lineWidth = strokeStyle.lineWidth
                            browserCanvasContext.setLineDash(strokeStyle.lineDash)
                            browserCanvasContext.strokeStyle = 'rgba(' + strokeStyle.paletteColor + ', ' + strokeStyle.opacity + ')'
                            browserCanvasContext.stroke()
                            browserCanvasContext.setLineDash([]) // Resets Line Dash
                        }
                    }
                }

                function plotImages() {
                    /* Here we are going to plot images. */
                    for (let j = 0; j < productDefinition.referenceParent.shapes.images.length; j++) {
                        let image = productDefinition.referenceParent.shapes.images[j]
                        if (image.imagePosition === undefined) { continue }
                        if (image.imagePosition.referenceParent === undefined) { continue }
                        if (image.imageCondition !== undefined) {
                            let mustPlot = eval(image.imageCondition.code)
                            if (mustPlot !== true) { continue }
                        }
                        let imageName = ''
                        let imageSize = 0
                        let offsetX = 0
                        let offsetY = 0
                        let imagePosition = { x: 0, y: 0 }
                        if (image.config.codeName !== undefined) { imageName = image.config.codeName }
                        if (image.config.size !== undefined) { imageSize = image.config.size }
                        if (image.imagePosition.config.offsetX !== undefined) { offsetX = image.imagePosition.config.offsetX }
                        if (image.imagePosition.config.offsetY !== undefined) { offsetY = image.imagePosition.config.offsetY }
                        let dataPointObject = record.dataPoints.get(image.imagePosition.referenceParent.id)
                        if (dataPointObject === undefined) { continue }
                        let dataPoint = {
                            x: dataPointObject.x,
                            y: dataPointObject.y
                        }
                        dataPoint = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoVisibleArea(dataPoint)

                        imagePosition.x = dataPoint.x - imageSize / 2 + offsetX
                        imagePosition.y = dataPoint.y - imageSize / 2 - offsetY

                        imagePosition = thisObject.fitFunction(imagePosition, true)

                        let imageToDraw = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName('Superalgos', imageName)
                        if (imageToDraw !== undefined) {
                            if (imageToDraw.canDrawIcon === true) {
                                browserCanvasContext.drawImage(imageToDraw, imagePosition.x, imagePosition.y, imageSize, imageSize)
                            }
                        } else {
                            console.log('Can not plot image named ' + imageName + ' of product ' + productDefinition.name + ' because it does not exist.')
                        }
                    }
                }

                function plotTexts() {
                    /* Here we are going to plot texts. */
                    for (let j = 0; j < productDefinition.referenceParent.shapes.texts.length; j++) {
                        let text = productDefinition.referenceParent.shapes.texts[j]
                        if (text.textPosition === undefined) { continue }
                        if (text.textPosition.referenceParent === undefined) { continue }
                        if (text.textCondition !== undefined) {
                            let mustPlot = eval(text.textCondition.code)
                            if (mustPlot !== true) { continue }
                        }
                        if (text.textFormula === undefined) { continue }
                        if (text.textStyle === undefined) { continue }
                        let value = eval(text.textFormula.code)
                        let fontSize = 0
                        let opacity = 0
                        let paletteColor = UI_COLOR.GREY
                        let offsetX = 0
                        let offsetY = 0
                        let textPosition = { x: 0, y: 0 }
                        if (text.textStyle.config.fontSize !== undefined) { fontSize = text.textStyle.config.fontSize }
                        if (text.textStyle.config.opacity !== undefined) { opacity = text.textStyle.config.opacity }
                        if (text.textStyle.config.paletteColor !== undefined) { paletteColor = eval(text.textStyle.config.paletteColor) }
                        if (text.textPosition.config.offsetX !== undefined) { offsetX = text.textPosition.config.offsetX }
                        if (text.textPosition.config.offsetY !== undefined) { offsetY = text.textPosition.config.offsetY }
                        let dataPointObject = record.dataPoints.get(text.textPosition.referenceParent.id)
                        if (dataPointObject === undefined) { continue }
                        let dataPoint = {
                            x: dataPointObject.x,
                            y: dataPointObject.y
                        }
                        dataPoint = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoVisibleArea(dataPoint)

                        textPosition.x = dataPoint.x + offsetX
                        textPosition.y = dataPoint.y - offsetY

                        textPosition = thisObject.fitFunction(textPosition)

                        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY
                        browserCanvasContext.fillStyle = 'rgba(' + paletteColor + ', ' + opacity + ')'
                        browserCanvasContext.fillText(value, textPosition.x, textPosition.y)
                    }
                }
            }

            logged = false
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] plot -> err = ' + err.stack) }
        }
    }

    function checkOutOfScreen(i, record) {
        /*
        In the formulas to create plotters, we allos users to reference the previous record.
        To enable that we need to link all records to the previous one in this way.
        */
        if (i == 0) {
            record.previous = {} // this way it wont be undefined
        } else {
            record.previous = records[i - 1]
        }

        let beginPoint = {
            x: record.begin,
            y: 0
        }

        let endPoint = {
            x: record.end,
            y: 0
        }

        beginPoint = coordinateSystem.transformThisPoint(beginPoint)
        endPoint = coordinateSystem.transformThisPoint(endPoint)

        beginPoint = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(beginPoint, thisObject.container)
        endPoint = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(endPoint, thisObject.container)

        beginPoint = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoVisibleArea(beginPoint)
        endPoint = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoVisibleArea(endPoint)

        beginPoint = thisObject.fitFunction(beginPoint)
        endPoint = thisObject.fitFunction(endPoint)

        if (endPoint.x < UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.bottomLeft.x || beginPoint.x > UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.bottomRight.x) {
            return false
        } else {
            return true
        }
    }

    function dataPointsCalculation(record) {
        if (record.dataPoints !== undefined && mustRecalculateDataPoints === false) {
            /* We use the datapoints already calculated. */
            dataPoints = record.dataPoints
        } else {
            if (logged === false) {
                logged = true
            }
            let dataPoints = new Map()
            /* It seems we need to calculate the data points this time. */
            for (let k = 0; k < productDefinition.referenceParent.shapes.chartPoints.length; k++) {
                let chartPoints = productDefinition.referenceParent.shapes.chartPoints[k]
                for (let j = 0; j < chartPoints.points.length; j++) {
                    let point = chartPoints.points[j]
                    if (point.pointFormula !== undefined) {
                        let x = 0
                        let y = 0
                        try {
                            eval(point.pointFormula.code)
                        } catch (err) {
                            continue
                        }
                        let rawPoint = {
                            x: x,
                            y: y
                        }

                        /*
                        The information we store in files is independent from the charing system and its coordinate systems.
                        That means that the first thing we allways need to do is to trasform these points to the coordinate system of the timeline.
                        */
                        let dataPoint
                        dataPoint = coordinateSystem.transformThisPoint(rawPoint)
                        dataPoint = UI.projects.superalgos.utilities.coordinateTransformations.transformThisPoint(dataPoint, thisObject.container)
                        let testPoint = {
                            x: dataPoint.x,
                            y: dataPoint.y
                        }
                        dataPoint = UI.projects.superalgos.spaces.chartingSpace.viewport.fitIntoVisibleArea(dataPoint)
                        dataPoint = thisObject.fitFunction(dataPoint)

                        if (testPoint.x === dataPoint.x) {
                            /* 
                            Contributing to Auto-Scale: A point will contribute to the y coordinate only if the x coordinate is plotted in the screen.
                            It can happen that objects that span through a long period of time could have its begin point inside the visible 
                            viewport but not its end point. In those cases, the end point should not be reported. 
                            */

                            if (rawPoint.y > 0 && rawPoint.y !== undefined && isNaN(rawPoint.y) === false) {
                                coordinateSystem.reportYValue(rawPoint.y)
                            }
                        }
                        /* Store the data point at the local map */
                        dataPoint.rawPoint = rawPoint
                        dataPoints.set(point.id, dataPoint)
                    }
                }
            }

            /* Remember this datapoints, so that we do not need to calculate them again. */
            record.dataPoints = dataPoints
        }
    }

    function onViewportZoomChanged(event) {
        try {
            mustRecalculateDataPoints = true
            recalculate()
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] onViewportZoomChanged -> err = ' + err.stack) }
        }
    }

    function onDragFinished() {
        if (UI.projects.superalgos.spaces.chartingSpace.visible === true) {
            recalculate()
        }
    }

    function onDisplace(event) {
        recalculateAll(event)
    }

    function onViewportPositionChanged(event) {
        recalculateAll(event)
    }

    function recalculateAll(event) {
        mustRecalculateDataPoints = true
        if (event !== undefined) {
            if (event.recalculate === true) {
                recalculate()
                return
            }
        }
        if (Math.random() * 100 > 95) {
            recalculate()
        }
    }
}
