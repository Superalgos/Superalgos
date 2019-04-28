function newAAMastersPlottersTradingSimulationTradingSimulation() {

    const MODULE_NAME = "Simulation Plotter";
    const ERROR_LOG = true;
    const INTENSIVE_LOG = false;
    const logger = newWebDebugLog();
    logger.fileName = MODULE_NAME;

    let thisObject = {

        // Main functions and properties.

        initialize: initialize,
        finalize: finalize,
        container: undefined,
        getContainer: getContainer,
        setTimePeriod: setTimePeriod,
        setDatetime: setDatetime,
        draw: draw,
        recalculateScale: recalculateScale,

        /* Events declared outside the plotter. */

        onDailyFileLoaded: onDailyFileLoaded,

        // Secondary functions and properties.

        currentRecord: undefined
    };

    /* this is part of the module template */

    let container = newContainer();     // Do not touch this 3 lines, they are just needed.
    container.initialize();
    thisObject.container = container;

    let timeLineCoordinateSystem = newTimeLineCoordinateSystem();       // Needed to be able to plot on the timeline, otherwise not.

    let timePeriod;                     // This will hold the current Time Period the user is at.
    let datetime;                       // This will hold the current Datetime the user is at.

    let marketFile;                     // This is the current Market File being plotted.
    let fileCursor;                     // This is the current File Cursor being used to retrieve Daily Files.

    let marketFiles;                      // This object will provide the different Market Files at different Time Periods.
    let dailyFiles;                // This object will provide the different File Cursors at different Time Periods.

    /* these are module specific variables: */

    let records = [];                   // Here we keep the records to be ploted every time the Draw() function is called by the AAWebPlatform.

    let smileyHappy;
    let smileySad;
    let strategyImages = [];
    let smileyMonkeyEyes;
    let smileyMonkeyEars;
    let imageStrategy;
    let imageStrategyPhase;
    let imageStopLossPhase;
    let imageBuyOrderPhase;

    let zoomChangedEventSubscriptionId
    let offsetChangedEventSubscriptionId
    let filesUpdatedEventSubscriptionId
    let dragFinishedEventSubscriptionId
    let dimmensionsChangedEventSubscriptionId

    return thisObject;

    function finalize() {
        try {

            /* Stop listening to the necesary events. */

            viewPort.eventHandler.stopListening(zoomChangedEventSubscriptionId);
            viewPort.eventHandler.stopListening(offsetChangedEventSubscriptionId);
            marketFiles.eventHandler.stopListening(filesUpdatedEventSubscriptionId);
            canvas.eventHandler.stopListening(dragFinishedEventSubscriptionId);
            thisObject.container.eventHandler.stopListening(dimmensionsChangedEventSubscriptionId)

            /* icons */

            smileyHappy = undefined;
            smileySad = undefined;
            strategyImages = undefined;
            smileyMonkeyEyes = undefined;
            smileyMonkeyEars = undefined;
            imageStrategy = undefined;
            imageStrategyPhase = undefined;
            imageStopLossPhase = undefined;
            imageBuyOrderPhase = undefined;

            /* Destroy References */

            marketFiles = undefined;
            dailyFiles = undefined;

            datetime = undefined;
            timePeriod = undefined;

            marketFile = undefined;
            fileCursor = undefined;

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] finalize -> err = " + err.stack); }
        }
    }

    function initialize(pStorage, pExchange, pMarket, pDatetime, pTimePeriod, callBackFunction) {

        try {

            /* Store the information received. */

            marketFiles = pStorage.marketFiles[0];
            dailyFiles = pStorage.dailyFiles[0];

            datetime = pDatetime;
            timePeriod = pTimePeriod;

            /* We need a Market File in order to calculate the Y scale, since this scale depends on actual data. */

            marketFile = marketFiles.getFile(ONE_DAY_IN_MILISECONDS);  // This file is the one processed faster. 

            recalculateScale();

            /* Now we set the right files according to current Period. */

            marketFile = marketFiles.getFile(pTimePeriod);
            fileCursor = dailyFiles.getFileCursor(pTimePeriod);

            /* Listen to the necesary events. */

            zoomChangedEventSubscriptionId = viewPort.eventHandler.listenToEvent("Zoom Changed", onZoomChanged);
            offsetChangedEventSubscriptionId = viewPort.eventHandler.listenToEvent("Offset Changed", onOffsetChanged);
            filesUpdatedEventSubscriptionId = marketFiles.eventHandler.listenToEvent("Files Updated", onFilesUpdated);
            dragFinishedEventSubscriptionId = canvas.eventHandler.listenToEvent("Drag Finished", onDragFinished);

            /* Get ready for plotting. */

            recalculate();

            /* Ready for when dimmension changes. */

            dimmensionsChangedEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('Dimmensions Changed', function () {
                recalculateScale()
                recalculate();
            })

            /* Loading a few icons */

            smileyHappy = loadEmoji("Smiley/Emoji Smiley-51.png");
            smileySad = loadEmoji("Smiley/Emoji Smiley-26.png");
            smileyMonkeyEyes = loadEmoji("Smiley/Emoji Smiley-85.png");
            smileyMonkeyEars = loadEmoji("Smiley/Emoji Smiley-86.png");
            imageStrategy = loadEmoji("Places/Emoji Orte-90.png");
            imageStrategyPhase = loadEmoji("Places/Emoji Orte-91.png");
            imageStopLossPhase = loadEmoji("stop.png");
            imageBuyOrderPhase = loadEmoji("Nature/Emoji Natur-67.png");

            for (let i = 1; i < 15; i++) {
                let strategyImage = loadEmoji("Symbols/Emoji Symbols-" + (112 + i) + ".png");
                strategyImages.push(strategyImage);
            }

            function loadEmoji(pPath) {

                let newImage;

                newImage = new Image();
                newImage.onload = onImageLoaded;

                function onImageLoaded() {
                    newImage.isLoaded = true;
                }

                newImage.src = window.canvasApp.urlPrefix + "Images/Emoji/" + pPath;

                return newImage;
            }

            callBackFunction();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> err = " + err.stack); }
        }
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

            if (ERROR_LOG === true) { logger.write("[ERROR] getContainer -> err = " + err.stack); }
        }
    }

    function onFilesUpdated() {

        try {

            let newMarketFile = marketFiles.getFile(timePeriod);

            if (newMarketFile !== undefined) {

                marketFile = newMarketFile;
                recalculate();
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onFilesUpdated -> err = " + err.stack); }
        }
    }

    function setTimePeriod(pTimePeriod) {

        try {

            if (timePeriod !== pTimePeriod) {

                timePeriod = pTimePeriod;

                if (timePeriod >= _1_HOUR_IN_MILISECONDS) {

                    let newMarketFile = marketFiles.getFile(pTimePeriod);

                    if (newMarketFile !== undefined) {

                        marketFile = newMarketFile;
                        recalculate();
                    }

                } else {

                    let newFileCursor = dailyFiles.getFileCursor(pTimePeriod);

                    fileCursor = newFileCursor; // In this case, we explicitly want that if there is no valid cursor, we invalidate the data and show nothing.
                    recalculate();

                }
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] setTimePeriod -> err = " + err.stack); }
        }
    }

    function setDatetime(pDatetime) {

        datetime = pDatetime;

    }

    function onDailyFileLoaded(event) {

        try {

            if (event.currentValue === event.totalValue) {

                /* This happens only when all of the files in the cursor have been loaded. */

                recalculate();

            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onDailyFileLoaded -> err = " + err.stack); }
        }
    }

    function draw() {

        try {

            if (INTENSIVE_LOG === true) { logger.write("[INFO] draw -> Entering function."); }

            this.container.frame.draw();

            plotChart();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] draw -> err = " + err.stack); }
        }
    }

    function recalculate() {

        try {

            if (timePeriod >= _1_HOUR_IN_MILISECONDS) {

                recalculateUsingMarketFiles();

            } else {

                recalculateUsingDailyFiles();

            }

            thisObject.container.eventHandler.raiseEvent("Records Changed", records);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculate -> err = " + err.stack); }
        }
    }

    function recalculateUsingDailyFiles() {

        try {

            if (fileCursor === undefined) {
                records = [];
                return;
            } // We need to wait

            if (fileCursor.files.size === 0) {
                records = [];
                return;
            } // We need to wait until there are files in the cursor

            let daysOnSides = getSideDays(timePeriod);

            let leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, thisObject.container, timeLineCoordinateSystem);
            let rightDate = getDateFromPoint(viewPort.visibleArea.topRight, thisObject.container, timeLineCoordinateSystem);

            let dateDiff = rightDate.valueOf() - leftDate.valueOf();

            let farLeftDate = new Date(leftDate.valueOf() - dateDiff * 1.5);
            let farRightDate = new Date(rightDate.valueOf() + dateDiff * 1.5);

            let currentDate = new Date(farLeftDate.valueOf());

            records = [];

            while (currentDate.valueOf() <= farRightDate.valueOf() + ONE_DAY_IN_MILISECONDS) {

                let stringDate = currentDate.getFullYear() + '-' + pad(currentDate.getMonth() + 1, 2) + '-' + pad(currentDate.getDate(), 2);

                let dailyFile = fileCursor.files.get(stringDate);

                if (dailyFile !== undefined) {

                    for (let i = 0; i < dailyFile.length; i++) {

                        let record = {
                            begin: undefined,
                            end: undefined,
                            type: undefined,
                            rate: undefined,
                            amount: undefined,
                            balanceA: undefined,
                            balanceB: undefined,
                            profit: undefined,
                            lastProfit: undefined,
                            stopLoss: undefined,
                            roundtrips: undefined,
                            hits: undefined,
                            fails: undefined,
                            hitRatio: undefined,
                            ROI: undefined,
                            periods: undefined,
                            days: undefined,
                            anualizedRateOfReturn: undefined,
                            sellRate: undefined,
                            lastProfitPercent: undefined,
                            strategy: undefined,
                            strategyPhase: undefined,
                            buyOrder: undefined,
                            stopLossPhase: undefined,
                            buyOrderPhase: undefined
                        };

                        record.begin = dailyFile[i][0];
                        record.end = dailyFile[i][1];
                        record.type = dailyFile[i][2];
                        record.rate = dailyFile[i][3];
                        record.amount = dailyFile[i][4];
                        record.balanceA = dailyFile[i][5];
                        record.balanceB = dailyFile[i][6];
                        record.profit = dailyFile[i][7];
                        record.lastProfit = dailyFile[i][8];
                        record.stopLoss = dailyFile[i][9];
                        record.roundtrips = dailyFile[i][10];
                        record.hits = dailyFile[i][11];
                        record.fails = dailyFile[i][12];
                        record.hitRatio = dailyFile[i][13];
                        record.ROI = dailyFile[i][14];
                        record.periods = dailyFile[i][15];
                        record.days = dailyFile[i][16];
                        record.anualizedRateOfReturn = dailyFile[i][17];
                        record.sellRate = dailyFile[i][18];
                        record.lastProfitPercent = dailyFile[i][19];
                        record.strategy = dailyFile[i][20];
                        record.strategyPhase = dailyFile[i][21];
                        record.buyOrder = dailyFile[i][22];
                        record.stopLossPhase = dailyFile[i][23];
                        record.buyOrderPhase = dailyFile[i][24];

                        if (record.begin >= farLeftDate.valueOf() && record.end <= farRightDate.valueOf()) {

                            records.push(record);

                            if (datetime.valueOf() >= record.begin && datetime.valueOf() <= record.end) {

                                thisObject.currentRecord = record;
                                thisObject.container.eventHandler.raiseEvent("Current Record Changed", thisObject.currentRecord);

                            }
                        }
                    }
                }

                currentDate = new Date(currentDate.valueOf() + ONE_DAY_IN_MILISECONDS);
            }

            /* Lests check if all the visible screen is going to be covered by records. */

            let lowerEnd = leftDate.valueOf();
            let upperEnd = rightDate.valueOf();

            if (records.length > 0) {

                if (records[0].begin > lowerEnd || records[records.length - 1].end < upperEnd) {

                    setTimeout(recalculate, 2000);

                    //console.log("File missing while calculating records, scheduling a recalculation in 2 seconds.");

                }
            }

            //console.log("Olivia > recalculateUsingDailyFiles > total records generated : " + records.length);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateUsingDailyFiles -> err = " + err.stack); }
        }
    }

    function recalculateUsingMarketFiles() {

        try {

            if (marketFile === undefined) { return; } // Initialization not complete yet.

            let daysOnSides = getSideDays(timePeriod);

            let leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, thisObject.container, timeLineCoordinateSystem);
            let rightDate = getDateFromPoint(viewPort.visibleArea.topRight, thisObject.container, timeLineCoordinateSystem);

            let dateDiff = rightDate.valueOf() - leftDate.valueOf();

            leftDate = new Date(leftDate.valueOf() - dateDiff * 1.5);
            rightDate = new Date(rightDate.valueOf() + dateDiff * 1.5);

            records = [];

            for (let i = 0; i < marketFile.length; i++) {

                let record = {
                    begin: undefined,
                    end: undefined,
                    type: undefined,
                    rate: undefined,
                    amount: undefined,
                    balanceA: undefined,
                    balanceB: undefined,
                    profit: undefined,
                    lastProfit: undefined,
                    stopLoss: undefined,
                    roundtrips: undefined,
                    hits: undefined,
                    fails: undefined,
                    hitRatio: undefined,
                    ROI: undefined,
                    periods: undefined,
                    days: undefined,
                    anualizedRateOfReturn: undefined,
                    sellRate: undefined,
                    lastProfitPercent: undefined,
                    strategy: undefined,
                    strategyPhase: undefined,
                    buyOrder: undefined,
                    stopLossPhase: undefined,
                    buyOrderPhase: undefined
                };

                record.begin = marketFile[i][0];
                record.end = marketFile[i][1];
                record.type = marketFile[i][2];
                record.rate = marketFile[i][3];
                record.amount = marketFile[i][4];
                record.balanceA = marketFile[i][5];
                record.balanceB = marketFile[i][6];
                record.profit = marketFile[i][7];
                record.lastProfit = marketFile[i][8];
                record.stopLoss = marketFile[i][9];
                record.roundtrips = marketFile[i][10];
                record.hits = marketFile[i][11];
                record.fails = marketFile[i][12];
                record.hitRatio = marketFile[i][13];
                record.ROI = marketFile[i][14];
                record.periods = marketFile[i][15];
                record.days = marketFile[i][16];
                record.anualizedRateOfReturn = marketFile[i][17];
                record.sellRate = marketFile[i][18];
                record.lastProfitPercent = marketFile[i][19];
                record.strategy = marketFile[i][20];
                record.strategyPhase = marketFile[i][21];
                record.buyOrder = marketFile[i][22];
                record.stopLossPhase = marketFile[i][23];
                record.buyOrderPhase = marketFile[i][24];

                if (record.begin >= leftDate.valueOf() && record.end <= rightDate.valueOf()) {

                    records.push(record);

                    if (datetime.valueOf() >= record.begin && datetime.valueOf() <= record.end) {

                        thisObject.currentRecord = record;
                        thisObject.container.eventHandler.raiseEvent("Current Record Changed", thisObject.currentRecord);

                    }
                }
            }

            //console.log("Olivia > recalculateUsingMarketFiles > total records generated : " + records.length);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateUsingMarketFiles -> err = " + err.stack); }
        }
    }

    function recalculateScale() {

        try {

            if (timeLineCoordinateSystem.maxValue > 0) { return; } // Already calculated.

            let minValue = {
                x: MIN_PLOTABLE_DATE.valueOf(),
                y: 0
            };

            let maxValue = {
                x: MAX_PLOTABLE_DATE.valueOf(),
                y: nextPorwerOf10(USDT_BTC_HTH) / 4 // TODO: This 4 is temporary
            };

            timeLineCoordinateSystem.initialize(
                minValue,
                maxValue,
                thisObject.container.frame.width,
                thisObject.container.frame.height
            );

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateScale -> err = " + err.stack); }
        }
    }

    function plotChart() {

        try {

            let userPosition = getUserPosition()
            let userPositionDate = userPosition.point.x

            let directionShort;
            let directionLong;

            let record;

            let strategy = {
                begin: undefined,
                end: undefined,
                image: undefined,
                entryPoint: undefined
            }

            let trade = {
                begin: undefined,
                end: undefined,
                image: undefined,
                entryPoint: undefined
            }

            /* Now we calculate and plot the records */

            for (let i = 1; i < records.length; i++) { // We do not start in 0 so as to be able to read the previous record i - 1

                record = records[i];
                directionShort = 0;
                let strategyNumber;
                let strategyPhase = 0;
                let stopLossPhase = 0;
                let buyOrderPhase = 0;

                if (record.strategy !== records[i - 1].strategy) { // When a change in the strategy field is detected, it is time to plot it.
                    strategyNumber = record.strategy;
                }

                if (record.strategyPhase !== records[i - 1].strategyPhase) {
                    strategyPhase = record.strategyPhase;
                }

                if (record.stopLossPhase !== records[i - 1].stopLossPhase) {
                    stopLossPhase = record.stopLossPhase;
                }

                if (record.buyOrderPhase !== records[i - 1].buyOrderPhase) {
                    buyOrderPhase = record.buyOrderPhase;
                }

                if (record.type === 'Buy@BuyOrder') { directionShort = +1; }
                if (record.type === 'Buy@StopLoss') { directionShort = +1; }
                if (record.type === 'Sell') { directionShort = +1; }

                if (strategyPhase > 0) {
                    if (strategyPhase % 2 !== 0) { //Depending if the phase is oddd or even goes above or below.
                        directionLong = 1;
                    } else {
                        directionLong = -1;
                    }
                }

                if (strategyNumber === 0) {
                    directionLong = -1;
                }

                if (strategyNumber > 0) {
                    directionLong = -1;
                }

                let recordPoint1 = {
                    x: record.begin + (record.end - record.begin) / 2,
                    y: record.rate
                };

                let recordPoint2 = {    // Long Stick Head
                    x: record.begin + (record.end - record.begin) / 2,
                    y: 0
                };

                let recordPoint3 = {    // Short Stick Head
                    x: record.end,
                    y: 0
                };

                let recordPoint4 = {
                    x: record.begin,
                    y: record.stopLoss
                };

                let recordPoint5 = {
                    x: record.end,
                    y: record.stopLoss
                };

                if (record.stopLoss === 0) { // Put these points out of range if stopLoss is zero.

                    recordPoint4.x = 0;
                    recordPoint5.x = 0;
                }

                let recordPoint6 = {
                    x: record.begin,
                    y: record.sellRate
                };

                let recordPoint7 = {
                    x: record.end,
                    y: record.sellRate
                };

                if (record.sellRate === 0) { // Put these points out of range if sellRate is zero.

                    recordPoint6.x = 0;
                    recordPoint7.x = 0;
                }

                let recordPoint8 = {
                    x: record.begin,
                    y: record.buyOrder
                };

                let recordPoint9 = {
                    x: record.end,
                    y: record.buyOrder
                };

                if (record.buyOrder === 0) { // Put these points out of range if buyOrder is zero.

                    recordPoint8.x = 0;
                    recordPoint9.x = 0;
                }

                recordPoint1 = timeLineCoordinateSystem.transformThisPoint(recordPoint1);
                recordPoint2 = timeLineCoordinateSystem.transformThisPoint(recordPoint2);
                recordPoint3 = timeLineCoordinateSystem.transformThisPoint(recordPoint3);
                recordPoint4 = timeLineCoordinateSystem.transformThisPoint(recordPoint4);
                recordPoint5 = timeLineCoordinateSystem.transformThisPoint(recordPoint5);
                recordPoint6 = timeLineCoordinateSystem.transformThisPoint(recordPoint6);
                recordPoint7 = timeLineCoordinateSystem.transformThisPoint(recordPoint7);
                recordPoint8 = timeLineCoordinateSystem.transformThisPoint(recordPoint8);
                recordPoint9 = timeLineCoordinateSystem.transformThisPoint(recordPoint9);

                recordPoint1 = transformThisPoint(recordPoint1, thisObject.container);
                recordPoint2 = transformThisPoint(recordPoint2, thisObject.container);
                recordPoint3 = transformThisPoint(recordPoint3, thisObject.container);
                recordPoint4 = transformThisPoint(recordPoint4, thisObject.container);
                recordPoint5 = transformThisPoint(recordPoint5, thisObject.container);
                recordPoint6 = transformThisPoint(recordPoint6, thisObject.container);
                recordPoint7 = transformThisPoint(recordPoint7, thisObject.container);
                recordPoint8 = transformThisPoint(recordPoint8, thisObject.container);
                recordPoint9 = transformThisPoint(recordPoint9, thisObject.container);

                if (recordPoint1.x < viewPort.visibleArea.bottomLeft.x || recordPoint1.x > viewPort.visibleArea.bottomRight.x) {
                    continue;
                }

                recordPoint2.y = recordPoint1.y - 2000 * directionLong;
                recordPoint3.y = recordPoint1.y - 0 * directionShort;

                recordPoint1 = viewPort.fitIntoVisibleArea(recordPoint1);
                recordPoint2 = viewPort.fitIntoVisibleArea(recordPoint2);
                recordPoint3 = viewPort.fitIntoVisibleArea(recordPoint3);
                recordPoint4 = viewPort.fitIntoVisibleArea(recordPoint4);
                recordPoint5 = viewPort.fitIntoVisibleArea(recordPoint5);
                recordPoint6 = viewPort.fitIntoVisibleArea(recordPoint6);
                recordPoint7 = viewPort.fitIntoVisibleArea(recordPoint7);
                recordPoint8 = viewPort.fitIntoVisibleArea(recordPoint8);
                recordPoint9 = viewPort.fitIntoVisibleArea(recordPoint9);

                /* Next we are drawing the sellRate */

                browserCanvasContext.beginPath();

                browserCanvasContext.moveTo(recordPoint6.x, recordPoint6.y);
                browserCanvasContext.lineTo(recordPoint7.x, recordPoint7.y);

                browserCanvasContext.closePath();

                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.MANGANESE_PURPLE + ', 1)';
                browserCanvasContext.lineWidth = 1
                browserCanvasContext.setLineDash([1, 4])

                if (userPositionDate >= record.begin && userPositionDate <= record.end) {
                    browserCanvasContext.lineWidth = 5
                    browserCanvasContext.setLineDash([3, 4])

                    /* highlight the current record */
                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 1)'; // Current record accroding to time
                }

                browserCanvasContext.stroke()
                browserCanvasContext.setLineDash([0, 0])

                let imageSize = 20;
                let imageToDraw;

                /* Next we are drawing the stopLoss floor / ceilling */


                browserCanvasContext.beginPath();


                browserCanvasContext.moveTo(recordPoint4.x, recordPoint4.y);
                browserCanvasContext.lineTo(recordPoint5.x, recordPoint5.y);


                browserCanvasContext.closePath();

                let opacity = 0.8

                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + opacity + '';

                if (userPositionDate >= record.begin && userPositionDate <= record.end) {

                    /* highlight the current record */
                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 1)'; // Current record accroding to time
                }

                browserCanvasContext.lineWidth = 5
                browserCanvasContext.stroke()


                if (imageStopLossPhase.isLoaded === true && stopLossPhase > 0) {
                    browserCanvasContext.drawImage(imageStopLossPhase, recordPoint5.x - imageSize, recordPoint5.y - imageSize * 1.25, imageSize, imageSize);
                    printLabel(stopLossPhase, recordPoint5.x - imageSize / 2, recordPoint5.y - imageSize * 1.5, '0.9', 8);
                }

                /* Next we are drawing the Buy Order */


                browserCanvasContext.beginPath();

                browserCanvasContext.moveTo(recordPoint8.x, recordPoint8.y);
                browserCanvasContext.lineTo(recordPoint9.x, recordPoint9.y);

                browserCanvasContext.closePath();

                opacity = 0.6

                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GREEN + ', ' + opacity + '';

                if (userPositionDate >= record.begin && userPositionDate <= record.end) {

                    /* highlight the current record */
                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 1)'; // Current record accroding to time
                }

                browserCanvasContext.lineWidth = 5
                browserCanvasContext.stroke()

                if (imageBuyOrderPhase.isLoaded === true && buyOrderPhase > 0) {
                    browserCanvasContext.drawImage(imageBuyOrderPhase, recordPoint9.x - imageSize * 2 / 3, recordPoint9.y + imageSize / 4, imageSize, imageSize);
                    printLabel(buyOrderPhase, recordPoint9.x - imageSize * 1 / 3, recordPoint9.y + imageSize * 1.9, '0.9', 8);
                }

                if (
                    record.type !== ''
                ) {

                    /* Next we are drawing the SHORT stick */

                    drawStick(recordPoint3);

                }

                function drawStick(headPoint) {

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(recordPoint1.x, recordPoint1.y);
                    browserCanvasContext.lineTo(headPoint.x, headPoint.y);

                    browserCanvasContext.closePath();

                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.DARK + ', 0.25)';

                    if (userPositionDate >= record.begin && userPositionDate <= record.end) {

                        /* highlight the current record */
                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 1)'; // Current record accroding to time
                    }

                    browserCanvasContext.setLineDash([4, 3])
                    browserCanvasContext.lineWidth = 0.2
                    browserCanvasContext.stroke()
                    browserCanvasContext.setLineDash([0, 0])

                }

                //browserCanvasContext.beginPath();

                let line1;
                let line2;

                drawStrategy();
                drawTrade();

                function drawStrategy() {

                    if (strategyNumber < 15 && strategyNumber > 0) {
                        strategy.image = strategyImages[strategyNumber - 1];
                        strategy.entryPoint = recordPoint2;
                        strategy.begin = record.begin
                        strategy.end = record.end

                        imageToDraw = strategy.image;

                    }

                    if (strategyNumber === 0) {

                        if (strategy.entryPoint !== undefined) {
                            /* Draw the line that represents the duration of closed strategy */

                            browserCanvasContext.beginPath();

                            browserCanvasContext.moveTo(strategy.entryPoint.x + imageSize / 2, strategy.entryPoint.y);
                            browserCanvasContext.lineTo(recordPoint2.x - imageSize / 2, recordPoint2.y);

                            browserCanvasContext.closePath();

                            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.MANGANESE_PURPLE + ', 1)';
                            browserCanvasContext.lineWidth = 1

                            browserCanvasContext.stroke()
                        }

                        imageToDraw = strategy.image;
                    }

                    if (imageToDraw !== undefined) {

                        if (strategyNumber !== undefined) {

                            drawStick(recordPoint2);

                        }

                        if (imageToDraw.isLoaded === true) {
                            browserCanvasContext.drawImage(imageToDraw, recordPoint2.x - imageSize / 2, recordPoint2.y - imageSize / 2, imageSize, imageSize);
                            imageToDraw = undefined;
                        }
                    }

                    if (strategyNumber === 0) {
                        strategy = {
                            begin: undefined,
                            end: undefined,
                            image: undefined,
                            entryPoint: undefined
                        }
                    }
                }

                function drawTrade() {

                    if (record.type === 'Buy@StopLoss' || record.type === 'Buy@BuyOrder') {

                        if (record.type === 'Buy@StopLoss') {

                            line1 = 'STOP';

                        } else {

                            line1 = 'TP';
                        }

                        if (record.lastProfit < 0) {

                            line2 = (record.lastProfitPercent).toFixed(2) + ' %';
                            imageToDraw = smileySad;

                        } else {

                            line2 = (record.lastProfitPercent).toFixed(2) + ' %';
                            imageToDraw = smileyHappy;
                        }

                        if (trade.entryPoint !== undefined) {
                            /* Draw the triangle  that represents the trade. */

                            browserCanvasContext.beginPath();

                            browserCanvasContext.moveTo(trade.entryPoint.x, trade.entryPoint.y);
                            browserCanvasContext.lineTo(recordPoint3.x, recordPoint3.y);
                            browserCanvasContext.lineTo(recordPoint3.x, trade.entryPoint.y);

                            browserCanvasContext.closePath();

                            let opacity = '0.25';

                            if (recordPoint3.y > trade.entryPoint.y) {
                                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', ' + opacity + ')';
                                browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.GREEN + ', ' + opacity + ')';
                            } else {
                                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RED + ', ' + opacity + ')';
                                browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + opacity + ')';
                            }

                            browserCanvasContext.fill();

                            browserCanvasContext.lineWidth = 1;
                            browserCanvasContext.stroke();
                        }

                        if (
                            recordPoint3.x < viewPort.visibleArea.topLeft.x + 250
                            ||
                            recordPoint3.x > viewPort.visibleArea.bottomRight.x - 250
                            ||
                            recordPoint3.y > viewPort.visibleArea.bottomRight.y - 100
                            ||
                            recordPoint3.y < viewPort.visibleArea.topLeft.y + 100
                        ) {
                            // we do not write any text
                        } else {
                            if (line1 !== undefined && trade.entryPoint !== undefined) {

                                printLabel(line1, recordPoint3.x - (recordPoint3.x - trade.entryPoint.x) / 2 - line1.length * FONT_ASPECT_RATIO, recordPoint4.y - 30, '0.50', 12);
                                printLabel(line2, recordPoint3.x - (recordPoint3.x - trade.entryPoint.x) / 2 - line2.length * FONT_ASPECT_RATIO, recordPoint4.y - 15, '0.50', 12);

                            }
                        }

                    }

                    if (record.type === 'Sell') {

                        line1 = '';
                        line2 = '';

                        imageToDraw = smileyHappy;

                        trade.begin = record.begin;
                        trade.end = record.end;
                        trade.entryPoint = recordPoint3;
                    }
                }

                /* Send the current record to the panel */

                if (userPositionDate >= record.begin && userPositionDate <= record.end) {

                    let currentRecord = {
                        innerRecord: record
                    };
                    thisObject.container.eventHandler.raiseEvent("Current Record Changed", currentRecord);
                }

                /* This is how we write the text */

                function printLabel(labelToPrint, x, y, opacity, fontSize) {

                    let labelPoint;

                    browserCanvasContext.font = fontSize + 'px ' + UI_FONT.SECONDARY + ' Saira';

                    let label = '' + labelToPrint;

                    let xOffset = label.length / 2 * fontSize * FONT_ASPECT_RATIO;

                    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK + ', ' + opacity + ')';
                    browserCanvasContext.fillText(label, x, y);

                }


            }


        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] plotChart -> err = " + err.stack); }
        }
    }


    function onZoomChanged(event) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onZoomChanged -> Entering function."); }

            recalculate();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onZoomChanged -> err = " + err.stack); }
        }
    }

    function onOffsetChanged() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onOffsetChanged -> Entering function."); }

            if (Math.random() * 100 > 95) {

                recalculate()
            };

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onOffsetChanged -> err = " + err.stack); }
        }
    }

    function onDragFinished() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onDragFinished -> Entering function."); }

            recalculate();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onDragFinished -> err = " + err.stack); }
        }
    }
}


























