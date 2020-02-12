function newAAMastersPlottersTradingSimulationSimulationExecution() {

    const MODULE_NAME = "Simulation Execution Plotter";
    const INTENSIVE_LOG = false;
    const ERROR_LOG = true;
    const logger = newWebDebugLog();
    logger.fileName = MODULE_NAME;

    let thisObject = {

        // Main functions and properties.

        initialize: initialize,
        finalize: finalize,
        container: undefined,
        fitFunction: undefined,
        getContainer: getContainer,
        setTimeFrame: setTimeFrame,
        setDatetime: setDatetime,
        setCoordinateSystem: setCoordinateSystem,
        draw: draw
    };

    /* this is part of the module template */

    let container = newContainer();             // Do not touch this 3 lines, they are just needed.
    container.initialize();
    thisObject.container = container;

    let coordinateSystem

    let timeFrame;                             // This will hold the current Time Frame the user is at.
    let datetime;                               // This will hold the current Datetime the user is at.

    /* these are module specific variables: */

    let fileSequence;
    let plotElements = [];                      // This is where the elements to be plotted are stored before plotting.
    let plotLines = [];                         // Here we store the lines of open positions.

    let previousNotesSetKey;

    let onMouseOverEventSuscriptionId
    let offsetChangedEventSubscriptionId
    let filesUpdatedEventSubscriptionId
    let dimmensionsChangedEventSubscriptionId
    let scaleChangedEventSubscriptionId

    let userPositionDate
    return thisObject;

    function finalize() {
        try {

            /* Stop listening to the necesary events. */
            thisObject.container.eventHandler.stopListening(onMouseOverEventSuscriptionId)
            canvas.chartSpace.viewport.eventHandler.stopListening(offsetChangedEventSubscriptionId);
            fileSequence.eventHandler.stopListening(filesUpdatedEventSubscriptionId);
            thisObject.container.eventHandler.stopListening(dimmensionsChangedEventSubscriptionId)

            /* Destroyd References */

            datetime = undefined;
            timeFrame = undefined;

            fileSequence = undefined;
            plotElements = undefined;
            plotLines = undefined;

            thisObject.fitFunction = undefined

            finalizeCoordinateSystem()
            coordinateSystem = undefined
        } catch (err) {
            if (ERROR_LOG === true) { logger.write("[ERROR] ' + MODULE_NAME + ' -> finalize -> err = " + err.stack.stack); }
        }
    }

    function initialize(pStorage, pDatetime, pTimeFrame, pCoordinateSystem, callBackFunction) {

        try {

            datetime = pDatetime;
            timeFrame = pTimeFrame;
            coordinateSystem = pCoordinateSystem
            initializeCoordinateSystem()

            fileSequence = pStorage.fileSequences[0];

            recalculate();

            filesUpdatedEventSubscriptionId = fileSequence.eventHandler.listenToEvent("Files Updated", onFilesUpdated); // Only the first sequence is supported right now.
            offsetChangedEventSubscriptionId = canvas.chartSpace.viewport.eventHandler.listenToEvent("Position Changed", onViewportPositionChanged);
            onMouseOverEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)

            /* Ready for when dimmension changes. */

            dimmensionsChangedEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('Dimmensions Changed', function () {
                recalculate();
            })
            callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE);

        } catch (err) {
            if (ERROR_LOG === true) { logger.write("[ERROR] ' + MODULE_NAME + ' -> initialize -> err = " + err.stack); }
            callBackFunction(GLOBAL.CUSTOM_FAIL_RESPONSE);
        }
    }

    function initializeCoordinateSystem() {
        scaleChangedEventSubscriptionId = coordinateSystem.eventHandler.listenToEvent('Scale Changed', onScaleChanged)
    }

    function finalizeCoordinateSystem() {
        coordinateSystem.eventHandler.stopListening(scaleChangedEventSubscriptionId)
    }

    function onScaleChanged() {
        recalculate();
    }

    function onMouseOver(event) {
        let userPosition = getDateFromPointAtBrowserCanvas(event, thisObject.container, coordinateSystem)
        userPositionDate = userPosition.valueOf()
    }

    function getContainer(point) {
        try {
            let container;
            /* First we check if this point is inside this space. */
            if (this.container.frame.isThisPointHere(point) === true) {
                return this.container;
            } else {
                /* This point does not belong to this space. */
                return undefined;
            }
        } catch (err) {
            if (ERROR_LOG === true) { logger.write("[ERROR] ' + MODULE_NAME + ' -> initialize -> err = " + err.stack); }
        }
    }

    function onFilesUpdated() {
        recalculate();
    }

    function setTimeFrame(pTimeFrame) {
        timeFrame = pTimeFrame;
        recalculate();
    }

    function setDatetime(pDatetime) {
        datetime = pDatetime;
    }

    function setCoordinateSystem(pCoordinateSystem) {
        finalizeCoordinateSystem()
        coordinateSystem = pCoordinateSystem
        initializeCoordinateSystem()
    }

    function onViewportPositionChanged() {
        if (Math.random() * 100 > 95) {
            recalculate()
        }
    }

    function recalculate() {
        try {
            if (fileSequence === undefined) { return; }
            /*
    
            We are going to filter the records depending on the Time Frame. We want that for a 1 min time peroid all the records appears on screen,
            but for higher periods, we will filter out some records, so that they do not overlap ever. 
    
            */
            plotElements = [];
            plotLines = [];

            let lastSellRate;
            let lastSellDate;
            let sellExecRate;

            let lastBuyRate;
            let lastBuyDate;
            let buyExecRate;

            let maxSequence = fileSequence.getFilesLoaded();

            for (let j = 0; j < maxSequence; j++) {

                let file = fileSequence.getFile(j);

                let history = [];
                let lines = [];

                /* First the small balls */

                const ONE_MIN_IN_MILISECONDS = 60 * 1000;
                let step = timeFrame / ONE_MIN_IN_MILISECONDS;
                step = 1; // For now we dont discard records depending on the zoom level.

                let i = 0;
                let lastRecordPushed = 0;

                for (i = 0; i < file.length; i = i + step) {

                    let newHistoryRecord = {

                        date: Math.trunc(file[i][0] / 60000) * 60000 + 30000,
                        buyAvgRate: file[i][1],
                        sellAvgRate: file[i][2],

                        lastSellRate: file[i][3],
                        sellExecRate: file[i][4],
                        lastBuyRate: file[i][5],
                        buyExecRate: file[i][6],

                        marketRate: file[i][7],
                        newPositions: file[i][8],
                        newTrades: file[i][9],
                        movedPositions: file[i][10],
                        profitsAssetA: file[i][11],
                        profitsAssetB: file[i][12],
                        combinedProfitsA: file[i][13],
                        combinedProfitsB: file[i][14],
                        datetime: file[i][0]
                    };

                    /* Finally we add this History Record to the Array */

                    history.push(newHistoryRecord);
                    lastRecordPushed = i;

                    /* Here we build the lines. */

                    //if (timeFrame <= 1 * 60 * 1000) {

                    if (newHistoryRecord.lastSellRate > 0) {
                        lastSellRate = newHistoryRecord.lastSellRate;
                        lastSellDate = newHistoryRecord.date;
                    }

                    if (newHistoryRecord.sellExecRate > 0) {
                        let newLine = {
                            type: "sell",
                            x1: lastSellDate,
                            y1: lastSellRate,
                            x2: newHistoryRecord.date,
                            y2: newHistoryRecord.sellExecRate
                        };
                        lines.push(newLine);
                    }

                    if (newHistoryRecord.lastBuyRate > 0) {
                        lastBuyRate = newHistoryRecord.lastBuyRate;
                        lastBuyDate = newHistoryRecord.date;
                    }

                    if (newHistoryRecord.buyExecRate > 0) {
                        let newLine = {
                            type: "buy",
                            x1: lastBuyDate,
                            y1: lastBuyRate,
                            x2: newHistoryRecord.date,
                            y2: newHistoryRecord.buyExecRate
                        };
                        lines.push(newLine);
                    }
                    //}
                }

                /* We allways want to put the last record of the file on the filterd dataset, so as to allways show the latest advance of the bot. */

                i = file.length - 1;

                if (lastRecordPushed !== i) {

                    let newHistoryRecord = {

                        date: Math.trunc(file[i][0] / 60000) * 60000 + 30000,
                        buyAvgRate: file[i][1],
                        sellAvgRate: file[i][2],

                        lastSellRate: file[i][3],
                        sellExecRate: file[i][4],
                        lastBuyRate: file[i][5],
                        buyExecRate: file[i][6],

                        marketRate: file[i][7],
                        newPositions: file[i][8],
                        newTrades: file[i][9],
                        movedPositions: file[i][10],
                        profitsAssetA: file[i][11],
                        profitsAssetB: file[i][12],
                        combinedProfitsA: file[i][13],
                        combinedProfitsB: file[i][14]
                    };

                    history.push(newHistoryRecord);

                }


                for (let i = 0; i < file.length; i++) {

                    let newHistoryRecord = {

                        date: Math.trunc(file[i][0] / 60000) * 60000 + 30000,
                        buyAvgRate: file[i][1],
                        sellAvgRate: file[i][2],

                        lastSellRate: file[i][3],
                        sellExecRate: file[i][4],
                        lastBuyRate: file[i][5],
                        buyExecRate: file[i][6],

                        marketRate: file[i][7],
                        newPositions: file[i][8],
                        newTrades: file[i][9],
                        movedPositions: file[i][10],
                        profitsAssetA: file[i][11],
                        profitsAssetB: file[i][12],
                        combinedProfitsA: file[i][13],
                        combinedProfitsB: file[i][14]
                    };

                }
                plotElements.push(history);
                plotLines.push(lines);
            }

            thisObject.container.eventHandler.raiseEvent("History Changed", history);

        } catch (err) {
            if (ERROR_LOG === true) { logger.write("[ERROR] ' + MODULE_NAME + ' -> recalculate -> err = " + err.stack); }
        }
    }

    function draw() {
        plotChart();
    }

    function plotChart() {
        try {

            let currentRecord

            let point = {
                x: 0,
                y: 0
            };

            let history;

            for (let j = 0; j < plotElements.length; j++) {

                let history = plotElements[j];

                for (let i = 0; i < history.length; i++) {

                    record = history[i];
                    currentRecord = record

                    let timestamp = record.date // Math.trunc(record.date / timeFrame) * timeFrame + timeFrame / 2;

                    point = {
                        x: timestamp,
                        y: record.marketRate
                    };

                    point = coordinateSystem.transformThisPoint(point);
                    point = transformThisPoint(point, thisObject.container);

                    if (point.x < canvas.chartSpace.viewport.visibleArea.bottomLeft.x || point.x > canvas.chartSpace.viewport.visibleArea.bottomRight.x) { continue; }

                    point = canvas.chartSpace.viewport.fitIntoVisibleArea(point);
                    point = thisObject.fitFunction(point);

                    let isCurrentRecord = false;

                    if (userPositionDate >= record.date - 30000 && userPositionDate <= record.date + 30000 - 1) {
                        isCurrentRecord = true;
                    }

                    let opacity = '1';
                    let currentRadius = 10

                    /* Draw a red inverted triangle on exec sell */
                    if (record.sellExecRate > 0) {

                        opacity = '1';

                        let normalSize = 5
                        let extraSize = 0
                        if (isCurrentRecord) { extraSize = 5 }

                        let point1 = {
                            x: record.date,
                            y: record.sellExecRate
                        };

                        let point2 = {
                            x: record.date + timeFrame / 7 * (normalSize + extraSize),
                            y: record.sellExecRate
                        };

                        let point3 = {
                            x: record.date - timeFrame / 7 * (normalSize + extraSize),
                            y: record.sellExecRate
                        };

                        point1 = coordinateSystem.transformThisPoint(point1);
                        point1 = transformThisPoint(point1, thisObject.container);
                        point1 = canvas.chartSpace.viewport.fitIntoVisibleArea(point1);
                        point1 = thisObject.fitFunction(point1);

                        point2 = coordinateSystem.transformThisPoint(point2);
                        point2 = transformThisPoint(point2, thisObject.container);
                        point2 = canvas.chartSpace.viewport.fitIntoVisibleArea(point2);
                        point2 = thisObject.fitFunction(point2);

                        point3 = coordinateSystem.transformThisPoint(point3);
                        point3 = transformThisPoint(point3, thisObject.container);
                        point3 = canvas.chartSpace.viewport.fitIntoVisibleArea(point3);
                        point3 = thisObject.fitFunction(point3);

                        let diff = point2.x - point3.x;
                        point2.y = point2.y - diff;
                        point3.y = point3.y - diff;

                        currentRecord.timeFrame = diff

                        point2 = canvas.chartSpace.viewport.fitIntoVisibleArea(point2);
                        point3 = canvas.chartSpace.viewport.fitIntoVisibleArea(point3);
                        point2 = thisObject.fitFunction(point2);
                        point3 = thisObject.fitFunction(point3);

                        browserCanvasContext.beginPath();

                        browserCanvasContext.moveTo(point1.x, point1.y);
                        browserCanvasContext.lineTo(point2.x, point2.y);
                        browserCanvasContext.lineTo(point3.x, point3.y);
                        browserCanvasContext.lineTo(point1.x, point1.y);

                        browserCanvasContext.closePath();

                        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + opacity + ')';

                        if (isCurrentRecord === false) {
                            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RED + ', ' + opacity + ')';
                        } else {
                            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + opacity + ')';  /* highlight the current record */
                        }

                        browserCanvasContext.fill();

                        browserCanvasContext.setLineDash([0, 0])
                        browserCanvasContext.lineWidth = 0.25;
                        browserCanvasContext.stroke();

                    }

                    /* Draw a green triangle on exec buy */
                    if (record.buyExecRate > 0) {

                        opacity = '1';

                        let normalSize = 5
                        let extraSize = 0
                        if (isCurrentRecord) { extraSize = 5 }

                        let point1 = {
                            x: record.date,
                            y: record.buyExecRate
                        };

                        let point2 = {
                            x: record.date + timeFrame / 7 * (normalSize + extraSize),
                            y: record.buyExecRate
                        };

                        let point3 = {
                            x: record.date - timeFrame / 7 * (normalSize + extraSize),
                            y: record.buyExecRate
                        };

                        point1 = coordinateSystem.transformThisPoint(point1);
                        point1 = transformThisPoint(point1, thisObject.container);
                        point1 = canvas.chartSpace.viewport.fitIntoVisibleArea(point1);
                        point1 = thisObject.fitFunction(point1);

                        point2 = coordinateSystem.transformThisPoint(point2);
                        point2 = transformThisPoint(point2, thisObject.container);
                        point2 = canvas.chartSpace.viewport.fitIntoVisibleArea(point2);
                        point2 = thisObject.fitFunction(point2);

                        point3 = coordinateSystem.transformThisPoint(point3);
                        point3 = transformThisPoint(point3, thisObject.container);
                        point3 = canvas.chartSpace.viewport.fitIntoVisibleArea(point3);
                        point3 = thisObject.fitFunction(point3);

                        let diff = point2.x - point3.x;
                        point2.y = point2.y + diff;
                        point3.y = point3.y + diff;

                        currentRecord.timeFrame = diff

                        point2 = canvas.chartSpace.viewport.fitIntoVisibleArea(point2);
                        point3 = canvas.chartSpace.viewport.fitIntoVisibleArea(point3);
                        point2 = thisObject.fitFunction(point2);
                        point3 = thisObject.fitFunction(point3);

                        browserCanvasContext.beginPath();

                        browserCanvasContext.moveTo(point1.x, point1.y);
                        browserCanvasContext.lineTo(point2.x, point2.y);
                        browserCanvasContext.lineTo(point3.x, point3.y);
                        browserCanvasContext.lineTo(point1.x, point1.y);

                        browserCanvasContext.closePath();

                        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.GREEN + ', ' + opacity + ')';

                        if (isCurrentRecord === false) {
                            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', ' + opacity + ')';
                        } else {
                            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + opacity + ')';  /* highlight the current record */
                        }

                        browserCanvasContext.fill();

                        browserCanvasContext.setLineDash([0, 0])
                        browserCanvasContext.lineWidth = 0.25;
                        browserCanvasContext.stroke();
                    }

                    /* Draw a red inverted triangle on sell */
                    if (record.lastSellRate > 0) {
                        opacity = '1';

                        let normalSize = 5
                        let extraSize = 0
                        if (isCurrentRecord) { extraSize = 5 }

                        let point1 = {
                            x: record.date,
                            y: record.lastSellRate
                        };

                        let point2 = {
                            x: record.date + timeFrame / 7 * (normalSize + extraSize),
                            y: record.lastSellRate
                        };

                        let point3 = {
                            x: record.date - timeFrame / 7 * (normalSize + extraSize),
                            y: record.lastSellRate
                        };

                        point1 = coordinateSystem.transformThisPoint(point1);
                        point1 = transformThisPoint(point1, thisObject.container);
                        point1 = canvas.chartSpace.viewport.fitIntoVisibleArea(point1);
                        point1 = thisObject.fitFunction(point1);

                        point2 = coordinateSystem.transformThisPoint(point2);
                        point2 = transformThisPoint(point2, thisObject.container);
                        point2 = canvas.chartSpace.viewport.fitIntoVisibleArea(point2);
                        point2 = thisObject.fitFunction(point2);

                        point3 = coordinateSystem.transformThisPoint(point3);
                        point3 = transformThisPoint(point3, thisObject.container);
                        point3 = canvas.chartSpace.viewport.fitIntoVisibleArea(point3);
                        point3 = thisObject.fitFunction(point3);

                        let diff = point2.x - point3.x;
                        point2.y = point2.y - diff;
                        point3.y = point3.y - diff;

                        currentRecord.timeFrame = diff

                        point2 = canvas.chartSpace.viewport.fitIntoVisibleArea(point2);
                        point3 = canvas.chartSpace.viewport.fitIntoVisibleArea(point3);
                        point2 = thisObject.fitFunction(point2);
                        point3 = thisObject.fitFunction(point3);

                        browserCanvasContext.beginPath();

                        browserCanvasContext.moveTo(point1.x, point1.y);
                        browserCanvasContext.lineTo(point2.x, point2.y);
                        browserCanvasContext.lineTo(point3.x, point3.y);
                        browserCanvasContext.lineTo(point1.x, point1.y);

                        browserCanvasContext.closePath();

                        if (isCurrentRecord === false) {
                            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + opacity + ')';
                        } else {
                            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + opacity + ')';  /* highlight the current record */
                        }

                        browserCanvasContext.fill();

                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RED + ', ' + opacity + ')';

                        browserCanvasContext.setLineDash([0, 0])
                        browserCanvasContext.lineWidth = 0.25;
                        browserCanvasContext.stroke();
                    }

                    /* Draw a green triangle on buy */
                    if (record.lastBuyRate > 0) {

                        opacity = '1';

                        let normalSize = 5
                        let extraSize = 0
                        if (isCurrentRecord) { extraSize = 5 }

                        let point1 = {
                            x: record.date,
                            y: record.lastBuyRate
                        };

                        let point2 = {
                            x: record.date + timeFrame / 7 * (normalSize + extraSize),
                            y: record.lastBuyRate
                        };

                        let point3 = {
                            x: record.date - timeFrame / 7 * (normalSize + extraSize),
                            y: record.lastBuyRate
                        };

                        point1 = coordinateSystem.transformThisPoint(point1);
                        point1 = transformThisPoint(point1, thisObject.container);
                        point1 = canvas.chartSpace.viewport.fitIntoVisibleArea(point1);
                        point1 = thisObject.fitFunction(point1);

                        point2 = coordinateSystem.transformThisPoint(point2);
                        point2 = transformThisPoint(point2, thisObject.container);
                        point2 = canvas.chartSpace.viewport.fitIntoVisibleArea(point2);
                        point2 = thisObject.fitFunction(point2);

                        point3 = coordinateSystem.transformThisPoint(point3);
                        point3 = transformThisPoint(point3, thisObject.container);
                        point3 = canvas.chartSpace.viewport.fitIntoVisibleArea(point3);
                        point3 = thisObject.fitFunction(point3);

                        let diff = point2.x - point3.x;
                        point2.y = point2.y + diff;
                        point3.y = point3.y + diff;

                        currentRecord.timeFrame = diff

                        point2 = canvas.chartSpace.viewport.fitIntoVisibleArea(point2);
                        point3 = canvas.chartSpace.viewport.fitIntoVisibleArea(point3);
                        point2 = thisObject.fitFunction(point2);
                        point3 = thisObject.fitFunction(point3);

                        browserCanvasContext.beginPath();

                        browserCanvasContext.moveTo(point1.x, point1.y);
                        browserCanvasContext.lineTo(point2.x, point2.y);
                        browserCanvasContext.lineTo(point3.x, point3.y);
                        browserCanvasContext.lineTo(point1.x, point1.y);

                        browserCanvasContext.closePath();

                        if (isCurrentRecord === false) {
                            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + opacity + ')';
                        } else {
                            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + opacity + ')';  /* highlight the current record */
                        }

                        browserCanvasContext.fill();

                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', ' + opacity + ')';

                        browserCanvasContext.setLineDash([0, 0])
                        browserCanvasContext.lineWidth = 0.25;
                        browserCanvasContext.stroke();
                    }

                    /* Send the current record to the panel */

                    if (userPositionDate >= record.date - 30000 && userPositionDate < record.date + 30000) {
                        thisObject.container.eventHandler.raiseEvent("Current Record Changed", currentRecord);
                    }

                    /* Circles */

                    let radius = 2;
                    currentRadius = 10

                    /* Outer Circle */

                    if (isCurrentRecord === true) {

                        browserCanvasContext.beginPath();

                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + opacity + ')';

                        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + opacity + ')';  /* highlight the current record */

                        browserCanvasContext.arc(point.x, point.y, currentRadius, 0, Math.PI * 2, true);
                        browserCanvasContext.closePath();

                        if (point.x < canvas.chartSpace.viewport.visibleArea.topLeft.x + 50 || point.x > canvas.chartSpace.viewport.visibleArea.bottomRight.x - 50) {/*we leave this history without fill. */ } else {
                            browserCanvasContext.fill();
                        }

                        browserCanvasContext.setLineDash([0, 0])
                        browserCanvasContext.lineWidth = 0.25;
                        browserCanvasContext.stroke();
                    }

                    /* Inner Circle */

                    browserCanvasContext.beginPath();

                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + opacity + ')';

                    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.GOLDEN_ORANGE + ', ' + opacity + ')';

                    browserCanvasContext.arc(point.x, point.y, radius, 0, Math.PI * 2, true);
                    browserCanvasContext.closePath();

                    if (point.x < canvas.chartSpace.viewport.visibleArea.topLeft.x + 50 || point.x > canvas.chartSpace.viewport.visibleArea.bottomRight.x - 50) {/*we leave this history without fill. */ } else {
                        browserCanvasContext.fill();
                    }

                    browserCanvasContext.setLineDash([0, 0])
                    browserCanvasContext.lineWidth = 0.25;
                    browserCanvasContext.stroke();

                }

                /* Draw the lines connecting plot elements. */
                let lines = plotLines[j];

                for (let i = 0; i < lines.length; i++) {

                    let line = lines[i];

                    opacity = '1';

                    let point1 = {
                        x: line.x1,
                        y: line.y1
                    };

                    let point2 = {
                        x: line.x2,
                        y: line.y2
                    };

                    point1 = coordinateSystem.transformThisPoint(point1);
                    point1 = transformThisPoint(point1, thisObject.container);
                    point1 = canvas.chartSpace.viewport.fitIntoVisibleArea(point1);
                    point1 = thisObject.fitFunction(point1);

                    point2 = coordinateSystem.transformThisPoint(point2);
                    point2 = transformThisPoint(point2, thisObject.container);
                    point2 = canvas.chartSpace.viewport.fitIntoVisibleArea(point2);
                    point2 = thisObject.fitFunction(point2);

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(point1.x, point1.y);
                    browserCanvasContext.lineTo(point2.x, point2.y);

                    browserCanvasContext.closePath();

                    if (line.type === "sell") {
                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RED + ', ' + opacity + ')';
                    } else {
                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', ' + opacity + ')';
                    }

                    browserCanvasContext.setLineDash([4, 1])
                    browserCanvasContext.lineWidth = 0.25;
                    browserCanvasContext.stroke();
                }


            }
        } catch (err) {
            if (ERROR_LOG === true) { logger.write("[ERROR] ' + MODULE_NAME + ' -> plotChart -> err = " + err.stack); }
        }
    }
}









