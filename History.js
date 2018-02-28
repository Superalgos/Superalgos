function newAAMastersAAMariamTradingHistory() {

    let thisObject = {

        // Main functions and properties.

        initialize: initialize,
        container: undefined,
        getContainer: getContainer,
        setTimePeriod: setTimePeriod,
        setDatetime: setDatetime,
        draw: draw,

        // Secondary functions and properties.

        currentCandle: undefined,
        onLayerStatusChanged: onLayerStatusChanged
    };

    /* this is part of the module template */

    let container = newContainer();     // Do not touch this 3 lines, they are just needed.
    container.initialize();
    thisObject.container = container;

    let layerStatus = 'off';            // Since the moduleis a layer, it must handle the different possible layer status.

    let plotArea = newPlotArea();       // Needed to be able to plot on the timeline, otherwise not.

    let timePeriod;                     // This will hold the current Time Period the user is at.
    let datetime;                       // This will hold the current Datetime the user is at.

    /* these are module specific variables: */

    let file;                           // Here we keep the history records to be ploted every time the Draw() function is called by the AAWebPlatform.
    let history = [];                   // This is where the history records are stored before plotting.

    return thisObject;

    function initialize(pExchange, pMarket, pDatetime, pTimePeriod, pLayerStatus, callBackFunction) {

        datetime = pDatetime;
        timePeriod = pTimePeriod;

        let File = newFile();
        File.initialize("AAMasters", "AAMariam", "Trading History", "Trading History", pExchange, pMarket, onFileReady)

        function onFileReady() {

            file = File.getFile();
            recalculate();
            recalculateScale();
            callBackFunction();

        }
    }

    function getContainer(point) {

        if (layerStatus !== 'on') { return; }

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

    }

    function setDatetime(newDatetime) {

        datetime = newDatetime;

    }

    function draw() {

        if (layerStatus !== 'on') { return; }

        plotChart();

    }

    function recalculate() {    

        for (let i = 0; i < file.length; i++) {

            let newHistoryRecord = {

                date: Math.trunc(file[i][0] / 60000) * 60000 + 30000,
                rate: file[i][1],                    
                newPositions: file[i][2],
                newTrades: file[i][3],
                movedPositions: file[i][4]
            };

            history.push(newHistoryRecord);
        }

        thisObject.container.eventHandler.raiseEvent("History Changed", history);
    }

    function recalculateScale() {

        if (file === undefined) { return; } // We need the market file to be loaded to make the calculation.

        if (plotArea.maxValue > 0) { return; } // Already calculated.

        let minValue = {
            x: EARLIEST_DATE.valueOf(),
            y: 0
        };

        let maxValue = {
            x: MAX_PLOTABLE_DATE.valueOf(),
            y: nextPorwerOf10(getMaxRate())
        };


        plotArea.initialize(
            minValue,
            maxValue,
            thisObject.container.frame.width,
            thisObject.container.frame.height
        );

        function getMaxRate() {

            let maxValue = 0;

            for (let i = 0; i < file.length; i++) {

                let currentMax = file[i][1];   // 1 = rates.

                if (maxValue < currentMax) {
                    maxValue = currentMax;
                }
            }

            return maxValue;

        }

    }

    function plotChart() {

        for (let i = 0; i < history.length; i++) {

            record = history[i];

            let point = {
                x: record.date,
                y: record.rate
            };

            point = plotArea.inverseTransform(point, thisObject.container.frame.height);

            point = transformThisPoint(point, thisObject.container);

            if (point.x < viewPort.visibleArea.bottomLeft.x || point.x > viewPort.visibleArea.bottomRight.x) {
                continue;
            }

            point = viewPort.fitIntoVisibleArea(point);

            let isCurrentRecord = false;

            if (datetime !== undefined) {

                let dateValue = datetime.valueOf();

                if (dateValue >= record.date - 30000  && dateValue + 30000 - 1 <= record.date) {

                    /* highlight the current record */

                    browserCanvasContext.fillStyle = 'rgba(255, 233, 31, 1)'; // Current record accroding to time
                    isCurrentRecord = true;

                } 
            } 

            let radiusFactor = 3;

            let radius1 = record.newPositions * radiusFactor;
            let radius2 = radius1 + record.movedPositions * radiusFactor;
            let radius3 = radius2 + record.newTrades * radiusFactor;

            browserCanvasContext.beginPath();

            if (isCurrentRecord === false) {

                browserCanvasContext.strokeStyle = 'rgba(27, 105, 7, 1)';
                browserCanvasContext.fillStyle = 'rgba(64, 217, 26, 1)';

            }

            browserCanvasContext.arc(point.x, point.y, radius3, 0, Math.PI * 2, true);

            //browserCanvasContext.closePath();
            //browserCanvasContext.beginPath();

            if (isCurrentRecord === false) {

                browserCanvasContext.strokeStyle = 'rgba(105, 27, 7, 1)';
                browserCanvasContext.fillStyle = 'rgba(217, 64, 26, 1)';

            }

            browserCanvasContext.arc(point.x, point.y, radius2, 0, Math.PI * 2, true);

            //browserCanvasContext.closePath();
            //browserCanvasContext.beginPath();

            if (isCurrentRecord === false) {

                browserCanvasContext.strokeStyle = 'rgba(27, 7, 105, 1)';
                browserCanvasContext.fillStyle = 'rgba(64, 26, 217, 1)';

            }

            browserCanvasContext.arc(point.x, point.y, radius1, 0, Math.PI * 2, true);

            browserCanvasContext.closePath();

            if (
                point.x < viewPort.visibleArea.topLeft.x + 50
                ||
                point.x > viewPort.visibleArea.bottomRight.x - 50
            ) {
                // we leave this history without fill.
            } else {
                browserCanvasContext.fill();
            }

            browserCanvasContext.lineWidth = 1;
            browserCanvasContext.stroke();


        }

    }

    function onLayerStatusChanged(eventData) {

        if (eventData.layer === 'Mariam Trades History') {
            layerStatus = eventData.status;
        }

    }

    function onZoomChanged(event) {

    }

    function onDragFinished() {

    }
}

