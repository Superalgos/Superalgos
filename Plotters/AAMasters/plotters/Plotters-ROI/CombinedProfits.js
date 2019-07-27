function newAAMastersPlottersROICombinedProfits() {

    const MODULE_NAME = "AAArena Plotters ROI Combined Profits";
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
        recalculateScale: recalculateScale, 
        draw: draw,
        payload: []
    };

    /* this is part of the module template */

    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)

    let timeLineCoordinateSystem = newTimeLineCoordinateSystem();       // Needed to be able to plot on the timeline, otherwise not.

    let timePeriod;                     // This will hold the current Time Period the user is at.
    let datetime;                       // This will hold the current Datetime the user is at.

    /* these are module specific variables: */

    let competition;

    let competitorsSequences;

    let updatedFilesEventsReceived = 0;

    let fileStyles = [];

    let offsetChangedEventSubscriptionId
    let filesUpdatedEventSubscriptionId
    let dimmensionsChangedEventSubscriptionId

    return thisObject;

    function finalize() {
        try {

            /* Stop listening to the necesary events. */

            viewPort.eventHandler.stopListening(offsetChangedEventSubscriptionId);
            fileSequence.eventHandler.stopListening(filesUpdatedEventSubscriptionId);
            thisObject.container.eventHandler.stopListening(dimmensionsChangedEventSubscriptionId)

            /* Destroyd References */

            datetime = undefined;
            timePeriod = undefined;

            fileSequence = undefined;

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] finalize -> err = " + err.stack); }
        }
    }

    function initialize(pCompetition, pStorage, pDatetime, pTimePeriod, callBackFunction) {

        try {

            competition = pCompetition;
            competitorsSequences = pStorage.competitorsSequences;

            datetime = pDatetime;
            timePeriod = pTimePeriod;

            recalculate();
            recalculateScale();

            offsetChangedEventSubscriptionId = viewPort.eventHandler.listenToEvent("Offset Changed", onOffsetChanged);

            /* Create the Payload structure */

            for (let k = 0; k < competition.participants.length; k++) {

                let participant = competition.participants[k];

                let payload = {
                    profile: {
                        position: {
                            x: 0,
                            y: 0
                        },
                        visible: false,
                        plot: true
                    }
                }

                thisObject.payload.push(payload);
            }

            for (let k = 0; k < competition.participants.length; k++) {

                    let fileSequence = competitorsSequences[0][k];  // Only the first dataSet is considered for now.

                    filesUpdatedEventSubscriptionId = fileSequence.eventHandler.listenToEvent("Files Updated", onFilesUpdated); // Only the first sequence is supported right now.
              
            }

            /* Here we will choose the colors of each participants path. */

            for (let k = 0; k < competition.participants.length; k++) {

                let red = Math.trunc(Math.random() * 5) * 50;
                let green = Math.trunc(Math.random() * 5) * 50;
                let blue = Math.trunc(Math.random() * 5) * 50;               

                let fillStyle = " " + red + "," + green + "," + blue;

                fileStyles.push(fillStyle);

            }

            dimmensionsChangedEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('Dimmensions Changed', function () {
                recalculateScale()
                recalculate();
            })

            recalculate();
            recalculateScale();

            callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> err = " + err.stack); }

        }
    }

    function getContainer(point) {

        try {

            let container;

            /* First we check if this point is inside this space. */

            if (thisObject.container.frame.isThisPointHere(point) === true) {

                return thisObject.container;

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

            updatedFilesEventsReceived++;

            if (updatedFilesEventsReceived === competition.participants.length) {

                recalculate();
                updatedFilesEventsReceived = 0;
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onFilesUpdated -> err = " + err.stack); }

        }
    }

    function setTimePeriod(pTimePeriod) {

        try {

            timePeriod = pTimePeriod;

            recalculate();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] setTimePeriod -> err = " + err.stack); }

        }
    }

    function setDatetime(newDatetime) {

        try {

            datetime = newDatetime;

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] setDatetime -> err = " + err.stack); }

        }
    }

    function draw() {

        try {
            return; // This plotter is currently disabled.

            if (INTENSIVE_LOG === true) { logger.write("[INFO] setDatetime -> Entering function."); }

            plotStartFinishLines();
            plotChart();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] draw -> err = " + err.stack); }

        }
    }

    function onOffsetChanged() {

        try {

            if (Math.random() * 100 > 95) {

                recalculate()
            };

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onOffsetChanged -> err = " + err.stack); }

        }
    }

    function recalculate() {

        try {

            if (competitorsSequences === undefined) { return; }

            /*
    
            We are going to filter the records depending on the Time Period. We want that for a 1 min time peroid all the records appears on screen,
            but for higher periods, we will filter out some records, so that they do not overlap ever. 
    
            */

            for (let k = 0; k < competition.participants.length; k++) {

                let fileSequence = competitorsSequences[0][k];  // Only the first dataSet is considered for now.

                competition.participants[k].plotElements = [];

                let maxSequence = fileSequence.getFilesLoaded();

                for (let j = 0; j < maxSequence; j++) {

                    let file = fileSequence.getFile(j);

                    /* First the small balls */

                    const ONE_MIN_IN_MILISECONDS = 60 * 1000;
                    let step = timePeriod / ONE_MIN_IN_MILISECONDS;

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

                            messageRelevance: file[i][15],
                            messageTitle: file[i][16],
                            messageBody: file[i][17]
                        };

                        competition.participants[k].plotElements.push(newHistoryRecord);
                        lastRecordPushed = i;
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
                            combinedProfitsB: file[i][14],

                            messageRelevance: file[i][15],
                            messageTitle: file[i][16],
                            messageBody: file[i][17]
                        };

                        competition.participants[k].plotElements.push(newHistoryRecord);

                    }
                }
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculate -> err = " + err.stack); }

        }
    }

    function recalculateScale() {

        try {

            if (competitorsSequences === undefined) { return; } // We need the market file to be loaded to make the calculation.

            if (timeLineCoordinateSystem.maxValue > 0) { return; } // Already calculated.

            let minValue = {
                x: MIN_PLOTABLE_DATE.valueOf(),
                y: 0
            };

            let maxValue = {
                x: MAX_PLOTABLE_DATE.valueOf(),
                y: 200 * 100
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

    function plotStartFinishLines() {

        try {

            let startDatetime = new Date(competition.startDatetime);
            let finishDatetime = new Date(competition.finishDatetime);

            let startPointDown = {
                x: startDatetime.valueOf(),
                y: 0
            };

            let startPointUp = {
                x: startDatetime.valueOf(),
                y: 0
            };

            startPointDown = timeLineCoordinateSystem.transformThisPoint(startPointDown);
            startPointDown = transformThisPoint(startPointDown, thisObject.container);

            startPointUp = timeLineCoordinateSystem.transformThisPoint(startPointUp);
            startPointUp.y = startPointUp.y - thisObject.container.frame.height;
            startPointUp = transformThisPoint(startPointUp, thisObject.container);

            if (startPointUp.x > viewPort.visibleArea.bottomLeft.x && startPointUp.x < viewPort.visibleArea.bottomRight.x) {

                startPointDown = viewPort.fitIntoVisibleArea(startPointDown);
                startPointUp = viewPort.fitIntoVisibleArea(startPointUp);

                browserCanvasContext.beginPath();

                browserCanvasContext.moveTo(startPointDown.x, startPointDown.y);
                browserCanvasContext.lineTo(startPointUp.x, startPointUp.y);

                browserCanvasContext.closePath();

                browserCanvasContext.strokeStyle = 'rgba(100, 10, 10, 0.5)';
                browserCanvasContext.lineWidth = 2;
                browserCanvasContext.stroke();

            }

            /* Here we draw the finish line. */

            let SQUARE_SIDE_REDUCTION_FACTOR = 4;

            if (timePeriod <= _1_HOUR_IN_MILISECONDS) { SQUARE_SIDE_REDUCTION_FACTOR = 2; }
            if (timePeriod <= _10_MINUTES_IN_MILISECONDS) { SQUARE_SIDE_REDUCTION_FACTOR = 1; }
            if (timePeriod < _5_MINUTES_IN_MILISECONDS) { SQUARE_SIDE_REDUCTION_FACTOR = 0.5; }

            const TOTAL_SQUARES_TALL = ONE_DAY_IN_MILISECONDS / timePeriod * (timePeriod / _1_MINUTE_IN_MILISECONDS) / SQUARE_SIDE_REDUCTION_FACTOR;
            const SQUARE_SIDE = thisObject.container.frame.height / TOTAL_SQUARES_TALL;

            let paintThis = true;

            for (i = 0; i < 3; i++) {

                for (j = 0; j < TOTAL_SQUARES_TALL; j++) {

                    let finishPointDown = {
                        x: finishDatetime.valueOf(),
                        y: 0
                    };

                    let finishPointUp = {
                        x: finishDatetime.valueOf(),
                        y: 0
                    };

                    finishPointDown = timeLineCoordinateSystem.transformThisPoint(finishPointDown);

                    finishPointDown.x = finishPointDown.x + SQUARE_SIDE * i;
                    finishPointDown.y = finishPointDown.y - SQUARE_SIDE * j;

                    finishPointDown = transformThisPoint(finishPointDown, thisObject.container);

                    finishPointUp = timeLineCoordinateSystem.transformThisPoint(finishPointUp);

                    finishPointUp.x = finishPointUp.x + SQUARE_SIDE * i + SQUARE_SIDE;
                    finishPointUp.y = finishPointUp.y - SQUARE_SIDE * j - SQUARE_SIDE;

                    finishPointUp = transformThisPoint(finishPointUp, thisObject.container);

                    if (finishPointUp.x < viewPort.visibleArea.bottomLeft.x || finishPointDown.x > viewPort.visibleArea.bottomRight.x) { continue; }

                    finishPointDown = viewPort.fitIntoVisibleArea(finishPointDown);
                    finishPointUp = viewPort.fitIntoVisibleArea(finishPointUp);

                    browserCanvasContext.beginPath();

                    browserCanvasContext.moveTo(finishPointDown.x, finishPointDown.y);
                    browserCanvasContext.lineTo(finishPointUp.x, finishPointDown.y);
                    browserCanvasContext.lineTo(finishPointUp.x, finishPointUp.y);
                    browserCanvasContext.lineTo(finishPointDown.x, finishPointUp.y);

                    browserCanvasContext.closePath();

                    /*
                    browserCanvasContext.strokeStyle = 'rgba(100, 100, 100, 1)';
                    browserCanvasContext.lineWidth = 1;
                    browserCanvasContext.stroke();
                    */

                    if (paintThis === true) {

                        browserCanvasContext.fillStyle = 'rgba(100, 100, 100, ' + (0.6 - i / 5) + ')';
                        browserCanvasContext.fill();

                    }

                    if (paintThis === true) { paintThis = false; } else { paintThis = true; }
                }

                if (paintThis === true) { paintThis = false; } else { paintThis = true; }
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] plotStartFinishLines -> err = " + err.stack); }

        }
    }

    function plotChart() {

        try {

            let userPosition = getUserPosition()
            let userPositionDate = userPosition.point.x

            for (let k = 0; k < competition.participants.length; k++) {

                let point = {
                    x: 0,
                    y: 0
                };

                let upLabel = "";

                let participant = competition.participants[k];
                let plotElements = participant.plotElements;

                if (plotElements !== undefined) {

                    let profileIntervalCounter = 0;
                    let previousPoint;

                    for (let i = 0; i < plotElements.length; i++) {

                        record = plotElements[i];

                        point = {
                            x: record.date,
                            y: record.combinedProfitsB * 100
                        };

                        upLabel = "ROI: " + Math.trunc(record.combinedProfitsB * 10000) / 10000 + " %";

                        point = timeLineCoordinateSystem.transformThisPoint(point);

                        point.y = point.y - thisObject.container.frame.height / 2;

                        point = transformThisPoint(point, thisObject.container);

                        if (point.x < viewPort.visibleArea.bottomLeft.x || point.x > viewPort.visibleArea.bottomRight.x) { continue; }

                        point = viewPort.fitIntoVisibleArea(point);

                        let isCurrentRecord = false;

                        if (userPositionDate >= record.date - timePeriod / 2 && userPositionDate <= record.date + timePeriod / 2 - 1) {
                            isCurrentRecord = true;
                        }
  
                        let opacity = '0.2';

                        let radius = 2;

                        browserCanvasContext.lineWidth = 1;


                        /* Circles */

                        if (thisObject.payload[k].profile.plot === true) {

                            browserCanvasContext.beginPath();

                            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.DARK + ', ' + opacity + ')';

                            if (isCurrentRecord === false) {
                                browserCanvasContext.fillStyle = 'rgba(' + fileStyles[k] + ', ' + opacity + ')';
                            } else {
                                browserCanvasContext.fillStyle = 'rgba(255, 233, 31, ' + opacity + ')';  /* highlight the current record */
                            }

                            browserCanvasContext.arc(point.x, point.y, radius, 0, Math.PI * 2, true);
                            browserCanvasContext.closePath();

                            if (point.x < viewPort.visibleArea.topLeft.x + 50 || point.x > viewPort.visibleArea.bottomRight.x - 50) {/*we leave this history without fill. */ } else {
                                browserCanvasContext.fill();
                            }

                            browserCanvasContext.stroke();

                        }

                        /* Since there is at least some point plotted, then the profile should be visible. */

                        thisObject.payload[k].profile.visible = true;

                        /* Line */

                        if (previousPoint !== undefined && thisObject.payload[k].profile.plot === true) {


                            browserCanvasContext.strokeStyle = 'rgba(' + fileStyles[k] + ', ' + opacity + ')';
                            browserCanvasContext.beginPath();

                            browserCanvasContext.moveTo(previousPoint.x, previousPoint.y);
                            browserCanvasContext.lineTo(point.x, point.y);

                            browserCanvasContext.closePath();

                            browserCanvasContext.stroke();

                        }

                        previousPoint = {
                            x: point.x,
                            y: point.y
                        };

                        /* Image */

                        if (thisObject.payload[k].profile.plot === true) {

                            profileIntervalCounter++;

                            if (profileIntervalCounter === 25) {

                                profileIntervalCounter = 0;

                                if (participant.profilePicture !== undefined) {

                                    let imageId = participant.devTeam + "." + participant.profilePicture;
                                    imageSize = 15;

                                    if (imageId !== undefined) {

                                        let image = document.getElementById(imageId);

                                        if (image !== null) {

                                            let offset = imageSize * 1.5;

                                            if (point.y > viewPort.visibleArea.bottomLeft.y / 2) { offset = - offset; }

                                            /* The line */

                                            browserCanvasContext.lineWidth = 0.3;
                                            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.DARK + ', ' + opacity + ')';
                                            browserCanvasContext.beginPath();

                                            browserCanvasContext.moveTo(point.x, point.y + offset);
                                            browserCanvasContext.lineTo(point.x, point.y);

                                            browserCanvasContext.closePath();

                                            browserCanvasContext.stroke();

                                            /* The Image */

                                            browserCanvasContext.drawImage(image, point.x - imageSize / 2, point.y - imageSize / 2 + offset, imageSize, imageSize);

                                            /* Now the border */

                                            browserCanvasContext.beginPath();

                                            opacity = '0.5';

                                            browserCanvasContext.lineWidth = 1;
                                            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.DARK + ', ' + opacity + ')';

                                            let radius = imageSize / 2 + 2;

                                            browserCanvasContext.arc(point.x, point.y + offset, radius, 0, Math.PI * 2, true);
                                            browserCanvasContext.closePath();

                                            browserCanvasContext.stroke();

                                        }
                                    }
                                }
                            }
                        }
                    }

                    /*

                    We replace the coordinate of the profile point so that whoever has a reference to it, gets the new position.
                    We will use the last point plotted on screen as the profilePoint.

                    */

                    thisObject.payload[k].profile.position.x = point.x;
                    thisObject.payload[k].profile.position.y = point.y;
                    thisObject.payload[k].profile.upLabel = upLabel;

                }
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] plotChart -> err = " + err.stack); }

        }
    }

}

