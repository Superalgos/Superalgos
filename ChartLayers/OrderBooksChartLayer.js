
function newOrderBooksChartLayer() {


    var orderBooks = [];
    let timePeriod = INITIAL_TIME_PERIOD;

    var plotArea = newPlotArea();

    var datetime = INITIAL_DATE;

    var orderBooksChartLayer = {
        onLayerStatusChanged: onLayerStatusChanged,
        setTimePeriod: setTimePeriod,
        setDatetime: setDatetime,
        container: undefined,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    orderBooksChartLayer.container = container;

    container.displacement.containerName = "Order Books Chart Layer";
    container.zoom.containerName = "Order Books Chart Layer";
    container.frame.containerName = "Order Books Chart Layer";

    let marketId;
    let exchangeId;
    let marketIndex;

    let orderBookFilesCursor;
  
    let amountScale;

    let maxAmount = 0;

    const TIME_FOR_RESOLUTION_CHANGE = 10;
    const MAX_RESOLUTION = 1;
    const MIN_RESOLUTION = 10;

    let resolution = MIN_RESOLUTION;
    let timeWithoutZoomOrPane = 0;

    const RECALCULATE_COUNTER_MAX_VALUE = 100;

    let recalculateCounter = 0;

    let layerStatus = 'off';

    return orderBooksChartLayer;


    function initialize(exchange, market, index, botsPanel) {

        marketId = market;
        exchangeId = exchange;
        marketIndex = index;

        orderBookFilesCursor = newOrderBookFilesCursor();
        orderBookFilesCursor.initialize(exchangeId, marketId);

        recalculateScale();

        viewPort.eventHandler.listenToEvent("Zoom Changed", onZoomChanged);
        canvas.eventHandler.listenToEvent("Drag Finished", onDragFinished);
        canvas.eventHandler.listenToEvent("Dragging", onDragging);

        layerStatus = botsPanel.getLayerStatus(botsPanel.layerNames.ORDER_BOOKS);
    }



    function getContainer(point) {

        var container;

        /* First we check if this point is inside this space. */

        if (this.container.frame.isThisPointHere(point) === true) {

            return this.container;

        } else {

            /* This point does not belong to this space. */

            return undefined;
        }

    }

    function onLayerStatusChanged(eventData) {

        if (eventData.layer === 'Order Books') {
            layerStatus = eventData.status;
        }

        if (layerStatus !== 'on') { return; }

        if (timePeriod <= _1_HOUR_IN_MILISECONDS) {

            orderBookFilesCursor.setDatetime(datetime);

        }

    }



    function onZoomChanged(event) {

        if (timePeriod <= _1_HOUR_IN_MILISECONDS) {

            timeWithoutZoomOrPane = 0;
            resolution++;

            if (resolution > MIN_RESOLUTION) {
                resolution = MIN_RESOLUTION;
            }

            recalculateCounter = recalculateCounter + RECALCULATE_COUNTER_MAX_VALUE / 10;

        }

        /* Defining when the file cursor is updated */

        if (layerStatus === 'off') { return; }

        if (timePeriod <= _1_HOUR_IN_MILISECONDS) {

            orderBookFilesCursor.setDatetime(datetime);

        }


    }

    function onDragFinished() {

        if (timePeriod <= _1_HOUR_IN_MILISECONDS) {

            recalculateOrderBooks();
            recalculateCounter = 0;

        }

        /* Defining when the file cursor is updated */

        if (layerStatus === 'off') { return; }

        if (timePeriod <= _1_HOUR_IN_MILISECONDS) {

            orderBookFilesCursor.setDatetime(datetime);

        }
    }

    function onDragging() {

        recalculateCounter = 0;

    }

    function setTimePeriod(period) {

        timePeriod = period;

    }

    function setDatetime(newDatetime) {
        datetime = newDatetime;
    }




    function draw() {

        if (layerStatus !== 'on') { return; }

        if (timePeriod <= _1_HOUR_IN_MILISECONDS) {

            timeWithoutZoomOrPane++;

            if (timeWithoutZoomOrPane > TIME_FOR_RESOLUTION_CHANGE) {
                resolution--;
                timeWithoutZoomOrPane = 0;
                if (resolution < MAX_RESOLUTION) {
                    resolution = MAX_RESOLUTION;
                }

                //recalculateOrderBooks();
            }

            this.container.frame.draw();

            recalculateCounter++;

            if (recalculateCounter > RECALCULATE_COUNTER_MAX_VALUE) {
                recalculateOrderBooks();
                recalculateCounter = 0;
            }

            plotOrderBooksChart();

        }
    }





    function recalculateOrderBooks() {

        if (layerStatus === 'off') { return; }

        /* get the bounderies */

        let rateAtTop = getRateFromPoint(viewPort.visibleArea.topLeft, orderBooksChartLayer.container, plotArea); 
        let rateAtBottom = getRateFromPoint(viewPort.visibleArea.bottomLeft, orderBooksChartLayer.container, plotArea); 

        let maxPossibleRate = rateAtTop + (rateAtTop - rateAtBottom);
        let minPossibleRate = rateAtBottom - (rateAtTop - rateAtBottom);

        let timeAtLeft = getMilisecondsFromPoint(viewPort.visibleArea.topLeft, orderBooksChartLayer.container, plotArea);
        let timeAtRight = getMilisecondsFromPoint(viewPort.visibleArea.bottomRight, orderBooksChartLayer.container, plotArea);

        let maxPossibleTime = timeAtRight + (timeAtRight - timeAtLeft);
        let minPossibleTime = timeAtLeft - (timeAtRight - timeAtLeft);

        /* continue with the files */

        let minutesOnSides = 1440 * 5;

        let leftDateTime;
        let rightDateTime;

        leftDateTime = new Date(datetime.getTime());

        leftDateTime.setMinutes(leftDateTime.getMinutes() - minutesOnSides);

        let absoluteLeft = Math.trunc(leftDateTime.valueOf() / timePeriod) * timePeriod;
        leftDateTime = new Date(absoluteLeft);

        rightDateTime = new Date(leftDateTime.getTime());

        rightDateTime.setMinutes(rightDateTime.getMinutes() + minutesOnSides * 2 ); 

        let currentDate = new Date(leftDateTime.getTime());

        orderBooks = [];

        /* Lets calculate the current datetime with minutes precision */

        let currentDatetime = new Date(datetime.getTime());

        let currentMoment = Math.trunc(currentDatetime.valueOf() / _1_MINUTE_IN_MILISECONDS) * _1_MINUTE_IN_MILISECONDS;


        /* Lets calculate the precision */

        let presicion = calculatePresicion(marketIndex.maxRate());

        function calculatePresicion(number) {

            for (let i = -10; i <= 10; i++) {
                if (number < Math.pow(10, i)) {
                    return Math.pow(10, i - 3);
                }
            }
        }

        let orderBook = new Map();

        const fileTimePeriod = 60 * 1000;
        const recordsPerCandle = timePeriod / fileTimePeriod * resolution;
        let currentRecord = 0;

        while (currentDate.getTime() < rightDateTime.getTime()) {

            currentRecord++;

            let stringDate = currentDate.getFullYear() + '-' + pad(currentDate.getMonth() + 1, 2) + '-' + pad(currentDate.getDate(), 2) + '-' + pad(currentDate.getHours(), 2) + '-' + pad(currentDate.getMinutes(), 2);

            let orderBookFile = orderBookFilesCursor.orderBookFiles.get(stringDate);

            if (orderBookFile !== undefined) {

                if (orderBookFile.length > 0) {

                    let condensedMap;

                    condensedMap = condenceArray(orderBookFile[0], currentDate.valueOf());

                    for (let key of condensedMap.keys()) {

                        aggregate('ask', [key, condensedMap.get(key)]);

                    }

                    condensedMap = condenceArray(orderBookFile[1], currentDate.valueOf());

                    for (let key of condensedMap.keys()) {

                        aggregate('bid', [key, condensedMap.get(key)]);

                    }

                    function aggregate(type, fileRecord) {

                        let rate = fileRecord[0];

                        if (rate >= plotArea.max.y) { return; }
                        if (rate <= plotArea.min.y) { return; }

                        let amount = fileRecord[1];

                        if (type === 'bid' && amount > maxAmount) { maxAmount = amount; } 

                        let orderBookPosition = orderBook.get(type + rate) || newResistance();

                        if (orderBookPosition.type === undefined) {

                            orderBookPosition.type = type;
                            orderBookPosition.rate = rate;
                            
                            orderBookPosition.open = amount;
                            orderBookPosition.close = amount;
                            orderBookPosition.min = amount;
                            orderBookPosition.max = amount;

                            orderBookPosition.begin = currentDate.valueOf();
                            orderBookPosition.end = currentDate.valueOf() + fileTimePeriod; 

                        } else {

                            if (amount < orderBookPosition.min) { orderBookPosition.min = amount; }
                            if (amount > orderBookPosition.max) { orderBookPosition.max = amount; }

                            orderBookPosition.end = currentDate.valueOf() + fileTimePeriod;
                            orderBookPosition.close = amount;

                        }

                        orderBook.set(type + rate, orderBookPosition);

                    }
                }
            }

            currentDate.setMinutes(currentDate.getMinutes() + 1);

            if (currentRecord === recordsPerCandle) {

                orderBooks.push(orderBook);

                /* Lets see now if this order book is the one corresponding to the current moment in time */

                let fisrtPosition = orderBook.values().next().value;

                if (fisrtPosition !== undefined) {

                    if (currentMoment >= fisrtPosition.begin && currentMoment < fisrtPosition.end) {

                        orderBooksChartLayer.container.eventHandler.raiseEvent("Current Order Book Changed", orderBook);

                    }

                }

                /* Reset map and counter */

                orderBook = new Map();

                currentRecord = 0;

            }
        }

        /* Now the amount scale */

        amountScale = presicion / maxAmount * 10;

        function condenceArray(arrayToCondence, currentDatetime) {

            let condencedMap = new Map();

            let condenseFactor = getCondenseFactor(timePeriod);

            for (var i = 0; i < arrayToCondence.length; i++) {

                let fileRate = arrayToCondence[i][0];

                let rate = Math.round(fileRate / presicion / condenseFactor) * presicion * condenseFactor;

                let amount = arrayToCondence[i][1];

                let storedAmount = condencedMap.get(rate) || 0;

                amount = amount + storedAmount;

                if (rate < maxPossibleRate && rate > minPossibleRate && currentDatetime > minPossibleTime && currentDatetime < maxPossibleTime ) {

                    condencedMap.set(rate, amount);

                }
            }

            return condencedMap;

        }

    }





    function recalculateScale() {

        var minValue = {
            x: EARLIEST_DATE.valueOf(),
            y: 0
        };

        var maxValue = {
            x: MAX_PLOTABLE_DATE.valueOf(),
            y: nextPorwerOf10(marketIndex.maxRate())
        };

        plotArea.initialize(
            minValue,
            maxValue,
            orderBooksChartLayer.container.frame.width,
            orderBooksChartLayer.container.frame.height
        );

    }




    function plotOrderBooksChart() {

        let transparencyLevel = getTransparenceFactor(timePeriod); 

        /* Now we calculate and plot the orderBooks */

        for (let i = 0; i < orderBooks.length; i++) {

            let orderBooksMap = orderBooks[i];

            for (let key of orderBooksMap.keys()) {

                let orderBookPosition = orderBooksMap.get(key);

                let resistancePoint1 = {
                    x: orderBookPosition.begin - (orderBookPosition.end - orderBookPosition.begin) * 2,
                    y: orderBookPosition.rate
                };

                let resistancePoint2 = {
                    x: orderBookPosition.end + (orderBookPosition.end - orderBookPosition.begin) * 2,
                    y: orderBookPosition.rate
                };

                let resistancePoint3 = {
                    x: orderBookPosition.end,
                    y: orderBookPosition.rate + orderBookPosition.close * amountScale 
                };

                let resistancePoint4 = {
                    x: orderBookPosition.begin,
                    y: orderBookPosition.rate + orderBookPosition.open * amountScale 
                };

                let resistancePoint5 = {
                    x: orderBookPosition.end,
                    y: orderBookPosition.rate - orderBookPosition.close * amountScale 
                };

                let resistancePoint6 = {
                    x: orderBookPosition.begin,
                    y: orderBookPosition.rate - orderBookPosition.open * amountScale 
                };


                resistancePoint1 = plotArea.inverseTransform(resistancePoint1, orderBooksChartLayer.container.frame.height);
                resistancePoint2 = plotArea.inverseTransform(resistancePoint2, orderBooksChartLayer.container.frame.height);
                resistancePoint3 = plotArea.inverseTransform(resistancePoint3, orderBooksChartLayer.container.frame.height);
                resistancePoint4 = plotArea.inverseTransform(resistancePoint4, orderBooksChartLayer.container.frame.height);
                resistancePoint5 = plotArea.inverseTransform(resistancePoint5, orderBooksChartLayer.container.frame.height);
                resistancePoint6 = plotArea.inverseTransform(resistancePoint6, orderBooksChartLayer.container.frame.height);

                resistancePoint1 = transformThisPoint(resistancePoint1, orderBooksChartLayer.container);
                resistancePoint2 = transformThisPoint(resistancePoint2, orderBooksChartLayer.container);
                resistancePoint3 = transformThisPoint(resistancePoint3, orderBooksChartLayer.container);
                resistancePoint4 = transformThisPoint(resistancePoint4, orderBooksChartLayer.container);
                resistancePoint5 = transformThisPoint(resistancePoint5, orderBooksChartLayer.container);
                resistancePoint6 = transformThisPoint(resistancePoint6, orderBooksChartLayer.container);

                if (resistancePoint2.x < viewPort.visibleArea.bottomLeft.x || resistancePoint1.x > viewPort.visibleArea.bottomRight.x) {
                    continue;
                }

                
                if (resistancePoint6.y < viewPort.visibleArea.topLeft.y || resistancePoint4.y > viewPort.visibleArea.bottomRight.y) {
                    continue;
                }
             


                resistancePoint1 = viewPort.fitIntoVisibleArea(resistancePoint1);
                resistancePoint2 = viewPort.fitIntoVisibleArea(resistancePoint2);
                resistancePoint3 = viewPort.fitIntoVisibleArea(resistancePoint3);
                resistancePoint4 = viewPort.fitIntoVisibleArea(resistancePoint4);
                resistancePoint5 = viewPort.fitIntoVisibleArea(resistancePoint5);
                resistancePoint6 = viewPort.fitIntoVisibleArea(resistancePoint6);


                browserCanvasContext.beginPath();

                browserCanvasContext.moveTo(resistancePoint1.x, resistancePoint1.y);
                browserCanvasContext.lineTo(resistancePoint2.x, resistancePoint2.y);
                browserCanvasContext.lineTo(resistancePoint3.x, resistancePoint3.y);
                //browserCanvasContext.lineTo(resistancePoint6.x, resistancePoint6.y);
                browserCanvasContext.lineTo(resistancePoint4.x, resistancePoint4.y);

                browserCanvasContext.closePath();

                if (orderBookPosition.type === 'bid') {

                    browserCanvasContext.fillStyle = 'rgba(61, 135, 235, ' + transparencyLevel + ')';
                    browserCanvasContext.strokeStyle = 'rgba(51, 112, 211, 0.20)';

                } 

                if (orderBookPosition.type === 'ask') {

                    browserCanvasContext.fillStyle = 'rgba(60, 233, 252, ' + transparencyLevel + ')';
                    browserCanvasContext.strokeStyle = 'rgba(8, 86, 94, ' + transparencyLevel + ')';

                }

                if (datetime !== undefined) {

                    let dateValue = datetime.valueOf();

                    if (dateValue >= orderBookPosition.begin && dateValue < orderBookPosition.end) {

                        browserCanvasContext.fillStyle = 'rgba(255, 233, 31, ' + transparencyLevel + ')'; // Current orderBookPosition accroding to time

                    } 
                } 


                if (
                    resistancePoint1.x < viewPort.visibleArea.topLeft.x + 50
                    ||
                    resistancePoint1.x > viewPort.visibleArea.bottomRight.x - 50
                ) {
                    // we leave this orderBooks without fill.
                } else {
                    browserCanvasContext.fill();
                }

                browserCanvasContext.lineWidth = 1;
                browserCanvasContext.stroke();

                browserCanvasContext.beginPath();

                browserCanvasContext.moveTo(resistancePoint1.x, resistancePoint1.y);
                browserCanvasContext.lineTo(resistancePoint2.x, resistancePoint2.y);
                browserCanvasContext.lineTo(resistancePoint5.x, resistancePoint5.y);
                browserCanvasContext.lineTo(resistancePoint6.x, resistancePoint6.y);

                browserCanvasContext.closePath();

                if (
                    resistancePoint1.x < viewPort.visibleArea.topLeft.x + 50
                    ||
                    resistancePoint1.x > viewPort.visibleArea.bottomRight.x - 50
                ) {
                    // we leave this orderBooks without fill.
                } else {
                    browserCanvasContext.fill();
                }

                browserCanvasContext.stroke();

            }
        }
    }


}

