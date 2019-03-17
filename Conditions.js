function newAAMastersPlottersTradingSimulationConditions() {

    const MODULE_NAME = "Conditions Plotter";
    const INFO_LOG = false;
    const ERROR_LOG = true;
    const INTENSIVE_LOG = false;
    const logger = newWebDebugLog();
    logger.fileName = MODULE_NAME;

    let thisObject = {

        // Main functions and properties.

        initialize: initialize,
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

    let conditions = [];
    let headers;

    let smileyHappy;
    let smileySad;
    let smileyGhost;
    let smileyMonkeyEyes;
    let smileyMonkeyEars;
    let imageStrategy;
    let imageStrategyPhase;
    let imageStopLossPhase;
    let imageBuyOrderPhase;

    return thisObject;

    function initialize(pStorage, pExchange, pMarket, pDatetime, pTimePeriod, callBackFunction) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }

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

            viewPort.eventHandler.listenToEvent("Zoom Changed", onZoomChanged);
            viewPort.eventHandler.listenToEvent("Offset Changed", onOffsetChanged);
            marketFiles.eventHandler.listenToEvent("Files Updated", onFilesUpdated);
            canvas.eventHandler.listenToEvent("Drag Finished", onDragFinished);

            /* Get ready for plotting. */

            recalculate();

            /* Loading a few icons */

            smileyHappy = loadEmoji("Smiley/Emoji Smiley-51.png");
            smileySad = loadEmoji("Smiley/Emoji Smiley-26.png");
            smileyGhost = loadEmoji("Objects/Emoji Objects-12.png");
            smileyMonkeyEyes = loadEmoji("Smiley/Emoji Smiley-85.png");
            smileyMonkeyEars = loadEmoji("Smiley/Emoji Smiley-86.png");
            imageStrategy = loadEmoji("Places/Emoji Orte-90.png");
            imageStrategyPhase = loadEmoji("Places/Emoji Orte-91.png");
            imageStopLossPhase = loadEmoji("Objects/Emoji Objects-55.png");
            imageBuyOrderPhase = loadEmoji("Objects/Emoji Objects-114.png");

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

            if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> err.message = " + err.message); }
        }
    }

    function getContainer(point) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] getContainer -> Entering function."); }

            let container;

            /* First we check if this point is inside this space. */

            if (this.container.frame.isThisPointHere(point) === true) {

                return this.container;

            } else {

                /* This point does not belong to this space. */

                return undefined;
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] getContainer -> err.message = " + err.message); }
        }
    }

    function onFilesUpdated() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onFilesUpdated -> Entering function."); }

            let newMarketFile = marketFiles.getFile(timePeriod);

            if (newMarketFile !== undefined) {

                marketFile = newMarketFile;
                recalculate();
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onFilesUpdated -> err.message = " + err.message); }
        }
    }

    function setTimePeriod(pTimePeriod) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] setTimePeriod -> Entering function."); }

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

                    if (newFileCursor !== undefined) {

                        fileCursor = newFileCursor;
                        recalculate();
                    }
                }
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] setTimePeriod -> err.message = " + err.message); }
        }
    }

    function setDatetime(pDatetime) {

        if (INFO_LOG === true) { logger.write("[INFO] setDatetime -> Entering function."); }

        datetime = pDatetime;

    }

    function onDailyFileLoaded(event) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onDailyFileLoaded -> Entering function."); }

            if (event.currentValue === event.totalValue) {

                /* This happens only when all of the files in the cursor have been loaded. */

                recalculate();

            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onDailyFileLoaded -> err.message = " + err.message); }
        }
    }

    function draw() {

        try {

            if (INTENSIVE_LOG === true) { logger.write("[INFO] draw -> Entering function."); }

            this.container.frame.draw();

            plotChart();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] draw -> err.message = " + err.message); }
        }
    }

    function recalculate() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] recalculate -> Entering function."); }

            if (timePeriod >= _1_HOUR_IN_MILISECONDS) {

                recalculateUsingMarketFiles();

            } else {

                recalculateUsingDailyFiles();

            }

            thisObject.container.eventHandler.raiseEvent("Conditions Changed", conditions);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculate -> err.message = " + err.message); }
        }
    }

    function recalculateUsingDailyFiles() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] recalculateUsingDailyFiles -> Entering function."); }

            if (fileCursor === undefined) { return; } // We need to wait

            if (fileCursor.files.size === 0) { return; } // We need to wait until there are files in the cursor

            let daysOnSides = getSideDays(timePeriod);

            let leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, thisObject.container, timeLineCoordinateSystem);
            let rightDate = getDateFromPoint(viewPort.visibleArea.topRight, thisObject.container, timeLineCoordinateSystem);

            let dateDiff = rightDate.valueOf() - leftDate.valueOf();

            let farLeftDate = new Date(leftDate.valueOf() - dateDiff * 1.5);
            let farRightDate = new Date(rightDate.valueOf() + dateDiff * 1.5);

            let currentDate = new Date(farLeftDate.valueOf());

            conditions = [];
            headers = dailyFile[0];
            let lastObjects = dailyFile[1]; // Here we get the values of the last 5 objects

            while (currentDate.valueOf() <= farRightDate.valueOf() + ONE_DAY_IN_MILISECONDS) {

                let stringDate = currentDate.getFullYear() + '-' + pad(currentDate.getMonth() + 1, 2) + '-' + pad(currentDate.getDate(), 2);

                let dailyFile[2] = fileCursor.files.get(stringDate);

                if (dailyFile[2] !== undefined) {

                    for (let i = 0; i < dailyFile[2].length; i++) {

                        let record = {
                            begin: undefined,
                            end: undefined,
                            conditions: undefined
                        };

                        record.begin = dailyFile[2][i][0];
                        record.end = dailyFile[2][i][1];
                        record.strategyNumber = dailyFile[2][i][2];
                        record.strategyPhase = dailyFile[2][i][3];
                        record.stopLossPhase = dailyFile[2][i][4];
                        record.buyOrderPhase = dailyFile[2][i][5];
                        record.conditions = dailyFile[2][i][6];

                        if (record.begin >= farLeftDate.valueOf() && record.end <= farRightDate.valueOf()) {

                            conditions.push(record);

                            if (datetime.valueOf() >= record.begin && datetime.valueOf() <= record.end) {

                                thisObject.currentRecord = record;
                                thisObject.container.eventHandler.raiseEvent("Current Condition Changed", thisObject.currentRecord);

                            }
                        }
                    }
                }

                currentDate = new Date(currentDate.valueOf() + ONE_DAY_IN_MILISECONDS);
            }

            /* Lests check if all the visible screen is going to be covered by conditions. */

            let lowerEnd = leftDate.valueOf();
            let upperEnd = rightDate.valueOf();

            if (conditions.length > 0) {

                if (conditions[0].begin > lowerEnd || conditions[conditions.length - 1].end < upperEnd) {

                    setTimeout(recalculate, 2000);

                    //console.log("File missing while calculating conditions, scheduling a recalculation in 2 seconds.");

                }
            }

            //console.log("Olivia > recalculateUsingDailyFiles > total conditions generated : " + conditions.length);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateUsingDailyFiles -> err.message = " + err.message); }
        }
    }

    function recalculateUsingMarketFiles() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] recalculateUsingMarketFiles -> Entering function."); }

            if (marketFile === undefined) { return; } // Initialization not complete yet.

            let daysOnSides = getSideDays(timePeriod);

            let leftDate = getDateFromPoint(viewPort.visibleArea.topLeft, thisObject.container, timeLineCoordinateSystem);
            let rightDate = getDateFromPoint(viewPort.visibleArea.topRight, thisObject.container, timeLineCoordinateSystem);

            let dateDiff = rightDate.valueOf() - leftDate.valueOf();

            leftDate = new Date(leftDate.valueOf() - dateDiff * 1.5);
            rightDate = new Date(rightDate.valueOf() + dateDiff * 1.5);

            conditions = [];
            headers = marketFile[0];
            let lastObjects = marketFile[1]; // Here we get the values of the last 5 objects

            for (let i = 0; i < marketFile[2].length; i++) {

                let record = {
                    begin: undefined,
                    end: undefined,
                    conditions: undefined
                };

                record.begin = marketFile[2][i][0];
                record.end = marketFile[2][i][1];
                record.strategyNumber = marketFile[2][i][2];
                record.strategyPhase = marketFile[2][i][3];
                record.stopLossPhase = marketFile[2][i][4];
                record.buyOrderPhase = marketFile[2][i][5];
                record.conditions = marketFile[2][i][6];

                if (record.begin >= leftDate.valueOf() && record.end <= rightDate.valueOf()) {

                    conditions.push(record);

                    if (datetime.valueOf() >= record.begin && datetime.valueOf() <= record.end) {

                        thisObject.currentRecord = record;
                        thisObject.container.eventHandler.raiseEvent("Current Condition Changed", thisObject.currentRecord);

                    }
                }
            }

            //console.log("Olivia > recalculateUsingMarketFiles > total conditions generated : " + conditions.length);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateUsingMarketFiles -> err.message = " + err.message); }
        }
    }

    function recalculateScale() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] recalculateScale -> Entering function."); }

            if (marketFile === undefined) { return; } // We need the market file to be loaded to make the calculation.

            if (timeLineCoordinateSystem.maxValue > 0) { return; } // Already calculated.

            let minValue = {
                x: EARLIEST_DATE.valueOf(),
                y: 0
            };

            let maxValue = {
                x: MAX_PLOTABLE_DATE.valueOf(),
                y: nextPorwerOf10(getMaxRate()) / 4 // TODO: This 4 is temporary
            };


            timeLineCoordinateSystem.initialize(
                minValue,
                maxValue,
                thisObject.container.frame.width,
                thisObject.container.frame.height
            );

            function getMaxRate() {

                if (INFO_LOG === true) { logger.write("[INFO] recalculateScale -> getMaxRate -> Entering function."); }

                let maxValue = 0;

                for (let i = 0; i < marketFile.length; i++) {

                    let currentMax = 25000; // TODO Fix this, since when there are not records above 10k the scales is dissincronized with the scale of the candles.  marketFile[i][3];   // 3 = rate.

                    if (maxValue < currentMax) {
                        maxValue = currentMax;
                    }
                }

                return maxValue;

            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateScale -> err.message = " + err.message); }
        }
    }

    function plotChart() {

        try {

            if (INTENSIVE_LOG === true) { logger.write("[INFO] plotChart -> Entering function."); }

            let conditionRecord;

            for (let i = 0; i < conditions.length; i++) { 

                conditionRecord = conditions[i];

                /* Send the current record to the panel */

                if (datetime !== undefined) {
                    let dateValue = datetime.valueOf();
                    if (dateValue >= conditionRecord.begin && dateValue <= conditionRecord.end) {

                        let currentRecord = {
                            conditionsNames: headers,
                            strategyNumber: conditionRecord.strategyNumber,
                            strategyPhase: conditionRecord.strategyPhase,
                            stopLossPhase: conditionRecord.stopLossPhase,
                            buyOrderPhase: conditionRecord.buyOrderPhase,
                            conditionsValues: conditionRecord.conditions
                        };
                        thisObject.container.eventHandler.raiseEvent("Current Condition Record Changed", currentRecord);
                    }
                }
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] plotChart -> err.message = " + err.message); }
        }
    }


    function onZoomChanged(event) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onZoomChanged -> Entering function."); }

            recalculate();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onZoomChanged -> err.message = " + err.message); }
        }
    }

    function onOffsetChanged() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onOffsetChanged -> Entering function."); }

            if (Math.random() * 100 > 95) {

                recalculate()
            };

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onOffsetChanged -> err.message = " + err.message); }
        }
    }

    function onDragFinished() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onDragFinished -> Entering function."); }

            recalculate();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onDragFinished -> err.message = " + err.message); }
        }
    }
}

















