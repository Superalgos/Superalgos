function newAAMastersPlottersTradingHistory() {

    let thisObject = {

        // Main functions and properties.

        initialize: initialize,
        container: undefined,
        getContainer: getContainer,
        setTimePeriod: setTimePeriod,
        setDatetime: setDatetime,
        draw: draw,
        profile: {
            position: {
                x: 0,
                y: 0,
            },
            visible: false
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

    let files = [];                           // Here we keep the history records to be ploted every time the Draw() function is called by the AAWebPlatform.
    let plotElements = [];                    // This is where the elements to be plotted are stored before plotting.

    return thisObject;

    function initialize(pStorage, pExchange, pMarket, pDatetime, pTimePeriod, callBackFunction) {

        datetime = pDatetime;
        timePeriod = pTimePeriod;

        let maxSequence = pStorage.fileSequence.getExpectedFiles();

        for (let i = 0; i < maxSequence; i++) {

            files.push(pStorage.fileSequence.getFile(i));

        }

        recalculate();
        recalculateScale();
        callBackFunction();

    }

    function getContainer(point) {

        let container;

        /* First we check if this point is inside this space. */

        if (this.container.frame.isThisPointHere(point) === true) {

            return this.container;

        } else {

            /* This point does not belong to this space. */

            return undefined;
        }

    }

    function setTimePeriod(pTimePeriod) {

        timePeriod = pTimePeriod;

        recalculate();

    }

    function setDatetime(newDatetime) {

        datetime = newDatetime;

    }

    function draw() {

        plotChart();

    }

    function recalculate() {    

        if (files === undefined) { return; }

        /*

        We are going to filter the records depending on the Time Period. We want that for a 1 min time peroid all the records appears on screen,
        but for higher periods, we will filter out some records, so that they do not overlap ever. 

        */

        plotElements = [];

        for (let j = 0; j < files.length; j++) {

            let file = files[j];

            let history = [];

            let oneMin = 60000;
            let step = timePeriod / oneMin;

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
                    combinedProfitsB: file[i][14]
                };

                history.push(newHistoryRecord);
            }

            plotElements.push(history);
        }

        thisObject.container.eventHandler.raiseEvent("History Changed", history);

    }

    function recalculateScale() {

        if (files === undefined) { return; } // We need the market file to be loaded to make the calculation.

        if (timeLineCoordinateSystem.maxValue > 0) { return; } // Already calculated.

        let minValue = {
            x: EARLIEST_DATE.valueOf(),
            y: 0
        };

        let maxValue = {
            x: MAX_PLOTABLE_DATE.valueOf(),
            y: nextPorwerOf10(getMaxRate())
        };


        timeLineCoordinateSystem.initialize(
            minValue,
            maxValue,
            thisObject.container.frame.width,
            thisObject.container.frame.height
        );

        function getMaxRate() {

            let maxValue = 0;

            for (let j = 0; j < files.length; j++) {

                let file = files[j];

                for (let i = 0; i < file.length; i++) {

                    let currentMax = file[i][1] + file[i][2];   // 1 = rates.

                    if (maxValue < currentMax) {
                        maxValue = currentMax;
                    }
                }
            }

            return maxValue;

        }
    }

    function plotChart() {

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

                if (point.x < viewPort.visibleArea.bottomLeft.x || point.x > viewPort.visibleArea.bottomRight.x) { continue;}

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

                    opacity = '1';

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

                    browserCanvasContext.strokeStyle = 'rgba(130, 9, 9, ' + opacity + ')';
                    browserCanvasContext.stroke();

                }

                /* Draw a green triangle on exec buy */

                if (record.buyExecRate > 0) {

                    opacity = '1';

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

                    browserCanvasContext.strokeStyle = 'rgba(27, 105, 7, ' + opacity + ')';
                    browserCanvasContext.stroke();

                }

                /* Draw a red inverted triangle on sell */

                if (record.lastSellRate > 0) {

                    opacity = '1';

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
                        browserCanvasContext.fillStyle = 'rgba(219, 18, 18, ' + opacity + ')';
                    } else {
                        browserCanvasContext.fillStyle = 'rgba(255, 233, 31, ' + opacity + ')';  /* highlight the current record */
                    }

                    browserCanvasContext.fill();

                    browserCanvasContext.strokeStyle = 'rgba(130, 9, 9, ' + opacity + ')';
                    browserCanvasContext.stroke();

                }

                /* Draw a green triangle on buy */

                if (record.lastBuyRate > 0) {

                    opacity = '1';

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
                        browserCanvasContext.fillStyle = 'rgba(64, 217, 26, ' + opacity + ')';
                    } else {
                        browserCanvasContext.fillStyle = 'rgba(255, 233, 31, ' + opacity + ')';  /* highlight the current record */
                    }

                    browserCanvasContext.fill();

                    browserCanvasContext.strokeStyle = 'rgba(27, 105, 7, ' + opacity + ')';
                    browserCanvasContext.stroke();

                }


                /* Since there is at least some point plotted, then the profile should be visible. */

                thisObject.profile.visible = true;
            }

        }

        /*

        We replace the coordinate of the profile point so that whoever has a reference to it, gets the new position.
        We will use the last point plotted on screen as the profilePoint.

        */

        thisObject.profile.position.x = point.x;
        thisObject.profile.position.y = point.y;
    }

}

