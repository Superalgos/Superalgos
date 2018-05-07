function newAAMastersPlottersTradingHistory() {

    const MODULE_NAME = "AAMasters Plotters Trading History";
    const INFO_LOG = true;
    const INTENSIVE_LOG = false;
    const ERROR_LOG = true;
    const logger = newDebugLog();
    logger.fileName = MODULE_NAME;

    let thisObject = {

        // Main functions and properties.

        initialize: initialize,
        container: undefined,
        getContainer: getContainer,
        setTimePeriod: setTimePeriod,
        setDatetime: setDatetime,
        draw: draw,
        payload: {
            profile: {
                position: {
                    x: 0,
                    y: 0
                },
                visible: false
            },
            notes: []
        }
    };

    /* this is part of the module template */

    let container = newContainer();     // Do not touch this 3 lines, they are just needed.
    container.initialize();
    thisObject.container = container;

    let timeLineCoordinateSystem = newTimeLineCoordinateSystem();       // Needed to be able to plot on the timeline, otherwise not.

    let timePeriod;                     // This will hold the current Time Period the user is at.
    let datetime;                       // This will hold the current Datetime the user is at.

    /* these are module specific variables: */

    let fileSequence;                           
    let plotElements = [];                    // This is where the elements to be plotted are stored before plotting.
    let plotLines = [];                       // Here we store the lines of open positions.
    let notes = [];                         // Here we store the notes with messages from the bot.

    let notesChangedEventRaised = true;     // This controls when to raise the event that notes changed.

    return thisObject;

    function initialize(pStorage, pExchange, pMarket, pDatetime, pTimePeriod, callBackFunction) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }

            datetime = pDatetime;
            timePeriod = pTimePeriod;

            fileSequence = pStorage.fileSequence[0];

            recalculate(callBackFunction);
            recalculateScale(callBackFunction);

            callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> err = " + err); }
            callBackFunction(GLOBAL.CUSTOM_FAIL_RESPONSE);
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

            if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> err = " + err); }
        }
    }

    function setTimePeriod(pTimePeriod) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] setTimePeriod -> Entering function."); }

            timePeriod = pTimePeriod;

            recalculate();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] setTimePeriod -> err = " + err); }
        }
    }

    function setDatetime(newDatetime) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] setDatetime -> Entering function."); }

            datetime = newDatetime;

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] setTimePeriod -> err = " + err); }
        }
    }

    function recalculate(callBackFunction) {    

        try {

            if (INFO_LOG === true) { logger.write("[INFO] recalculate -> Entering function."); }

            if (fileSequence === undefined) { return; }

            /*
    
            We are going to filter the records depending on the Time Period. We want that for a 1 min time peroid all the records appears on screen,
            but for higher periods, we will filter out some records, so that they do not overlap ever. 
    
            */

            plotElements = [];
            plotLines = [];
            notes = [];

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

                let oneMin = 60000;
                let step = timePeriod / oneMin;

                /* First the small balls */

                for (let i = 0; i < file.length; i = i + step) {

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

                        messageRelevance: file[i][15],
                        messageTitle: file[i][16],
                        messageBody: file[i][17]
                    };

                    history.push(newHistoryRecord);

                    if (timePeriod <= 1 * 60 * 1000) {

                        /* Here we build the lines. */

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
                    }
                }

                /* Second we process the text */

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
                        combinedProfitsB: file[i][14],

                        messageRelevance: file[i][15],
                        messageTitle: file[i][16],
                        messageBody: file[i][17]
                    };

                    if (newHistoryRecord.messageTitle !== "" && newHistoryRecord.messageBody !== "") {

                        if (newHistoryRecord.messageRelevance >= 0 && newHistoryRecord.messageRelevance <= 10) {

                            let relevanceTimePeriod = (dailyFilePeriods[10 - newHistoryRecord.messageRelevance][0]);

                            if (timePeriod <= relevanceTimePeriod) {

                                let note = {
                                    title: newHistoryRecord.messageTitle,
                                    body: newHistoryRecord.messageBody,
                                    date: newHistoryRecord.date,
                                    rate: newHistoryRecord.marketRate,
                                    position: {
                                        x: 0,
                                        y: 0
                                    },
                                    visible: false
                                };

                                notes.push(note);
                            }
                        }
                    }
                }

                plotElements.push(history);
                plotLines.push(lines);

                notesChangedEventRaised = false;
            }

            thisObject.container.eventHandler.raiseEvent("History Changed", history);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculate -> err = " + err); }
            callBackFunction(GLOBAL.CUSTOM_FAIL_RESPONSE);
        }
    }

    function recalculateScale(callBackFunction) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] recalculateScale -> Entering function."); }

            if (fileSequence === undefined) { return; } // We need the market file to be loaded to make the calculation.

            if (timeLineCoordinateSystem.maxValue > 0) { return; } // Already calculated.

            let minValue = {
                x: EARLIEST_DATE.valueOf(),
                y: 0
            };

            let maxValue = {
                x: MAX_PLOTABLE_DATE.valueOf(),
                y: nextPorwerOf10(USDT_BTC_HTH)
            };


            timeLineCoordinateSystem.initialize(
                minValue,
                maxValue,
                thisObject.container.frame.width,
                thisObject.container.frame.height
            );

            function getMaxRate() {

                try {

                    if (INFO_LOG === true) { logger.write("[INFO] recalculateScale -> getMaxRate > Entering function."); }

                    let maxValue = 0;

                    let maxSequence = fileSequence.getFilesLoaded();

                    for (let j = 0; j < maxSequence; j++) {

                        let file = fileSequence.getFile(j);

                        for (let i = 0; i < file.length; i++) {

                            let currentMax = file[i][1] + file[i][2];   // 1 = rates.

                            if (maxValue < currentMax) {
                                maxValue = currentMax;
                            }
                        }
                    }

                    return maxValue;

                } catch (err) {

                    if (ERROR_LOG === true) { logger.write("[ERROR] recalculateScale -> getMaxRate -> err = " + err); }
                    callBackFunction(GLOBAL.CUSTOM_FAIL_RESPONSE);
                }
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateScale -> err = " + err); }
            callBackFunction(GLOBAL.CUSTOM_FAIL_RESPONSE);
        }
    }

    function draw() {

        try {

            if (INTENSIVE_LOG === true) { logger.write("[INFO] draw -> Entering function."); }

            plotChart();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] draw -> err = " + err); }
        }
    }

    function plotChart() {

        try {

            if (INTENSIVE_LOG === true) { logger.write("[INFO] plotChart -> Entering function."); }

            let point;
            let history;

            for (let j = 0; j < plotElements.length; j++) {

                let history = plotElements[j];

                for (let i = 0; i < history.length; i++) {

                    record = history[i];

                    point = {
                        x: record.date,
                        y: record.marketRate
                    };

                    point = timeLineCoordinateSystem.transformThisPoint(point);
                    point = transformThisPoint(point, thisObject.container);

                    if (point.x < viewPort.visibleArea.bottomLeft.x || point.x > viewPort.visibleArea.bottomRight.x) { continue; }

                    point = viewPort.fitIntoVisibleArea(point);

                    let isCurrentRecord = false;

                    if (datetime !== undefined) {
                        let dateValue = datetime.valueOf();
                        if (dateValue >= record.date - timePeriod / 2 && dateValue <= record.date + timePeriod / 2 - 1) {
                            isCurrentRecord = true;
                        }
                    }

                    let radius = 3;

                    let opacity = '0.2';

                    browserCanvasContext.lineWidth = 1;

                    /* Outer Circle */

                    browserCanvasContext.beginPath();

                    browserCanvasContext.strokeStyle = 'rgba(27, 105, 7, ' + opacity + ')';

                    if (isCurrentRecord === false) {
                        browserCanvasContext.fillStyle = 'rgba(64, 217, 26, ' + opacity + ')';
                    } else {
                        browserCanvasContext.fillStyle = 'rgba(255, 233, 31, ' + opacity + ')';  /* highlight the current record */
                    }

                    browserCanvasContext.arc(point.x, point.y, radius, 0, Math.PI * 2, true);
                    browserCanvasContext.closePath();

                    if (point.x < viewPort.visibleArea.topLeft.x + 50 || point.x > viewPort.visibleArea.bottomRight.x - 50) {/*we leave this history without fill. */ } else {
                        browserCanvasContext.fill();
                    }

                    browserCanvasContext.stroke();

                    /* Draw a red inverted triangle on exec sell */

                    if (record.sellExecRate > 0) {

                        opacity = '0.3';

                        let point1 = {
                            x: record.date,
                            y: record.sellExecRate
                        };

                        let point2 = {
                            x: record.date + timePeriod / 7 * 2,
                            y: record.sellExecRate
                        };

                        let point3 = {
                            x: record.date - timePeriod / 7 * 2,
                            y: record.sellExecRate
                        };

                        point1 = timeLineCoordinateSystem.transformThisPoint(point1);
                        point1 = transformThisPoint(point1, thisObject.container);
                        point1 = viewPort.fitIntoVisibleArea(point1);

                        point2 = timeLineCoordinateSystem.transformThisPoint(point2);
                        point2 = transformThisPoint(point2, thisObject.container);
                        point2 = viewPort.fitIntoVisibleArea(point2);

                        point3 = timeLineCoordinateSystem.transformThisPoint(point3);
                        point3 = transformThisPoint(point3, thisObject.container);
                        point3 = viewPort.fitIntoVisibleArea(point3);

                        let diff = point2.x - point3.x;
                        point2.y = point2.y - diff;
                        point3.y = point3.y - diff;

                        point2 = viewPort.fitIntoVisibleArea(point2);
                        point3 = viewPort.fitIntoVisibleArea(point3);

                        browserCanvasContext.beginPath();

                        browserCanvasContext.moveTo(point1.x, point1.y);
                        browserCanvasContext.lineTo(point2.x, point2.y);
                        browserCanvasContext.lineTo(point3.x, point3.y);
                        browserCanvasContext.lineTo(point1.x, point1.y);

                        browserCanvasContext.closePath();

                        if (isCurrentRecord === false) {
                            browserCanvasContext.fillStyle = 'rgba(219, 18, 18, ' + opacity + ')';
                        } else {
                            browserCanvasContext.fillStyle = 'rgba(255, 233, 31, ' + opacity + ')';  /* highlight the current record */
                        }

                        browserCanvasContext.fill();

                        browserCanvasContext.strokeStyle = 'rgba(130, 9, 9, ' + opacity + ')';
                        browserCanvasContext.stroke();

                    }

                    /* Draw a green triangle on exec buy */

                    if (record.buyExecRate > 0) {

                        opacity = '0.3';

                        let point1 = {
                            x: record.date,
                            y: record.buyExecRate
                        };

                        let point2 = {
                            x: record.date + timePeriod / 7 * 2,
                            y: record.buyExecRate
                        };

                        let point3 = {
                            x: record.date - timePeriod / 7 * 2,
                            y: record.buyExecRate
                        };

                        point1 = timeLineCoordinateSystem.transformThisPoint(point1);
                        point1 = transformThisPoint(point1, thisObject.container);
                        point1 = viewPort.fitIntoVisibleArea(point1);

                        point2 = timeLineCoordinateSystem.transformThisPoint(point2);
                        point2 = transformThisPoint(point2, thisObject.container);
                        point2 = viewPort.fitIntoVisibleArea(point2);

                        point3 = timeLineCoordinateSystem.transformThisPoint(point3);
                        point3 = transformThisPoint(point3, thisObject.container);
                        point3 = viewPort.fitIntoVisibleArea(point3);

                        let diff = point2.x - point3.x;
                        point2.y = point2.y + diff;
                        point3.y = point3.y + diff;

                        point2 = viewPort.fitIntoVisibleArea(point2);
                        point3 = viewPort.fitIntoVisibleArea(point3);

                        browserCanvasContext.beginPath();

                        browserCanvasContext.moveTo(point1.x, point1.y);
                        browserCanvasContext.lineTo(point2.x, point2.y);
                        browserCanvasContext.lineTo(point3.x, point3.y);
                        browserCanvasContext.lineTo(point1.x, point1.y);

                        browserCanvasContext.closePath();

                        if (isCurrentRecord === false) {
                            browserCanvasContext.fillStyle = 'rgba(64, 217, 26, ' + opacity + ')';
                        } else {
                            browserCanvasContext.fillStyle = 'rgba(255, 233, 31, ' + opacity + ')';  /* highlight the current record */
                        }

                        browserCanvasContext.fill();

                        browserCanvasContext.strokeStyle = 'rgba(27, 105, 7, ' + opacity + ')';
                        browserCanvasContext.stroke();

                    }

                    /* Draw a red inverted triangle on sell */

                    if (record.lastSellRate > 0) {

                        opacity = '0.3';

                        let point1 = {
                            x: record.date,
                            y: record.lastSellRate
                        };

                        let point2 = {
                            x: record.date + timePeriod / 7 * 2,
                            y: record.lastSellRate
                        };

                        let point3 = {
                            x: record.date - timePeriod / 7 * 2,
                            y: record.lastSellRate
                        };

                        point1 = timeLineCoordinateSystem.transformThisPoint(point1);
                        point1 = transformThisPoint(point1, thisObject.container);
                        point1 = viewPort.fitIntoVisibleArea(point1);

                        point2 = timeLineCoordinateSystem.transformThisPoint(point2);
                        point2 = transformThisPoint(point2, thisObject.container);
                        point2 = viewPort.fitIntoVisibleArea(point2);

                        point3 = timeLineCoordinateSystem.transformThisPoint(point3);
                        point3 = transformThisPoint(point3, thisObject.container);
                        point3 = viewPort.fitIntoVisibleArea(point3);

                        let diff = point2.x - point3.x;
                        point2.y = point2.y - diff;
                        point3.y = point3.y - diff;

                        point2 = viewPort.fitIntoVisibleArea(point2);
                        point3 = viewPort.fitIntoVisibleArea(point3);

                        browserCanvasContext.beginPath();

                        browserCanvasContext.moveTo(point1.x, point1.y);
                        browserCanvasContext.lineTo(point2.x, point2.y);
                        browserCanvasContext.lineTo(point3.x, point3.y);
                        browserCanvasContext.lineTo(point1.x, point1.y);

                        browserCanvasContext.closePath();

                        if (isCurrentRecord === false) {
                            browserCanvasContext.fillStyle = 'rgba(255, 255, 255, ' + opacity + ')';
                        } else {
                            browserCanvasContext.fillStyle = 'rgba(255, 233, 31, ' + opacity + ')';  /* highlight the current record */
                        }

                        browserCanvasContext.fill();

                        browserCanvasContext.strokeStyle = 'rgba(130, 9, 9, ' + opacity + ')';
                        browserCanvasContext.stroke();

                    }

                    /* Draw a green triangle on buy */

                    if (record.lastBuyRate > 0) {

                        opacity = '0.3';

                        let point1 = {
                            x: record.date,
                            y: record.lastBuyRate
                        };

                        let point2 = {
                            x: record.date + timePeriod / 7 * 2,
                            y: record.lastBuyRate
                        };

                        let point3 = {
                            x: record.date - timePeriod / 7 * 2,
                            y: record.lastBuyRate
                        };

                        point1 = timeLineCoordinateSystem.transformThisPoint(point1);
                        point1 = transformThisPoint(point1, thisObject.container);
                        point1 = viewPort.fitIntoVisibleArea(point1);

                        point2 = timeLineCoordinateSystem.transformThisPoint(point2);
                        point2 = transformThisPoint(point2, thisObject.container);
                        point2 = viewPort.fitIntoVisibleArea(point2);

                        point3 = timeLineCoordinateSystem.transformThisPoint(point3);
                        point3 = transformThisPoint(point3, thisObject.container);
                        point3 = viewPort.fitIntoVisibleArea(point3);

                        let diff = point2.x - point3.x;
                        point2.y = point2.y + diff;
                        point3.y = point3.y + diff;

                        point2 = viewPort.fitIntoVisibleArea(point2);
                        point3 = viewPort.fitIntoVisibleArea(point3);

                        browserCanvasContext.beginPath();

                        browserCanvasContext.moveTo(point1.x, point1.y);
                        browserCanvasContext.lineTo(point2.x, point2.y);
                        browserCanvasContext.lineTo(point3.x, point3.y);
                        browserCanvasContext.lineTo(point1.x, point1.y);

                        browserCanvasContext.closePath();

                        if (isCurrentRecord === false) {
                            browserCanvasContext.fillStyle = 'rgba(255, 255, 255, ' + opacity + ')';
                        } else {
                            browserCanvasContext.fillStyle = 'rgba(255, 233, 31, ' + opacity + ')';  /* highlight the current record */
                        }

                        browserCanvasContext.fill();

                        browserCanvasContext.strokeStyle = 'rgba(27, 105, 7, ' + opacity + ')';
                        browserCanvasContext.stroke();

                    }


                    /* Since there is at least some point plotted, then the profile should be visible. */

                    thisObject.payload.profile.visible = true;
                }

                /* Draw the lines connecting plot elements. */

                let lines = plotLines[j];

                for (let i = 0; i < lines.length; i++) {

                    let line = lines[i];

                    opacity = '0.2';

                    let point1 = {
                        x: line.x1,
                        y: line.y1
                    };

                    let point2 = {
                        x: line.x2,
                        y: line.y2
                    };

                    point1 = timeLineCoordinateSystem.transformThisPoint(point1);
                    point1 = transformThisPoint(point1, thisObject.container);
                    point1 = viewPort.fitIntoVisibleArea(point1);

                    point2 = timeLineCoordinateSystem.transformThisPoint(point2);
                    point2 = transformThisPoint(point2, thisObject.container);
                    point2 = viewPort.fitIntoVisibleArea(point2);

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(point1.x, point1.y);
                    browserCanvasContext.lineTo(point2.x, point2.y);

                    browserCanvasContext.closePath();

                    if (line.type === "sell") {

                        browserCanvasContext.strokeStyle = 'rgba(130, 9, 9, ' + opacity + ')';

                    } else {

                        browserCanvasContext.strokeStyle = 'rgba(27, 105, 7, ' + opacity + ')';

                    }

                    browserCanvasContext.stroke();

                }

                /* Now we calculate the anchor position of notes. */


                for (let i = 0; i < notes.length; i++) {

                    let note = notes[i];

                    opacity = '0.2';

                    note.position = {
                        x: note.date,
                        y: note.rate
                    };

                    note.position = timeLineCoordinateSystem.transformThisPoint(note.position);
                    note.position = transformThisPoint(note.position, thisObject.container);

                    if (note.position.x < (viewPort.visibleArea.bottomRight.x) * (-1) || note.position.x > (viewPort.visibleArea.bottomRight.x) * (2)) {
                        note.visible = false;
                    } else {
                        note.visible = true;
                    }

                }

                if (notesChangedEventRaised === false) {

                    thisObject.container.eventHandler.raiseEvent("Notes Changed", notes);
                    thisObject.payload.notes = notes;

                    notesChangedEventRaised = true;
                }

            }

            /*
    
            We replace the coordinate of the profile point so that whoever has a reference to it, gets the new position.
            We will use the last point plotted on screen as the profilePoint.
    
            */

            thisObject.payload.profile.position.x = point.x;
            thisObject.payload.profile.position.y = point.y;

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] plotChart -> err = " + err); }
        }
    }
}

