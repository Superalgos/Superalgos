
function newOrderBookDephChart() {

    /*

    This object represents the Depth chart and is able to mainain the information needed to plot it and to draw it on the canvas. 

    */

    var timeLineCoordinateSystem = newTimeLineCoordinateSystem();

    var orderBookDephChart = {
        addOrder: addOrder,
        removeOrder: removeOrder,
        container: undefined,
        draw: draw,
        getContainer: getContainer,     
        initialize: initialize
    };

    var aggBidOrders = newAggregatedOrdersArray();
    var aggAskOrders = newAggregatedOrdersArray();

    var container = newContainer();
    container.initialize();
    orderBookDephChart.container = container;

    container.displacement.containerName = "Order Book Depth Chart";
    container.zoom.containerName = "Order Book Depth Chart";
    container.frame.containerName = "Order Book Depth Chart";

    var bidPoints = [];
    var askPoints = [];

    var marketId;

    return orderBookDephChart;


    function initialize(market) {

        marketId = market;

        aggBidOrders.initialize();
        aggAskOrders.initialize();

        aggBidOrders.setSortOrder('descending'); 
        aggAskOrders.setSortOrder('ascending');

        aggBidOrders.eventHandler.listenToEvent('Array Changed', onBidArrayChanged, undefined);
        aggAskOrders.eventHandler.listenToEvent('Array Changed', onAskArrayChanged, undefined);

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

    function addOrder(order) {

        if (order.type === 'Bid') {

            aggBidOrders.addOrder(order);

        } else {

            aggAskOrders.addOrder(order);

        }
    }

    function removeOrder(order) {

        if (order.type === 'Bid') {

            aggBidOrders.removeOrder(order);

        } else {

            aggAskOrders.removeOrder(order);

        }
    }

    function onBidArrayChanged(array) {

        /* In order to avoid glinches while plotting the information of the array, we use a copy of the original that is constantly manipulated. */

        newArray = array.slice();
        bidPoints = newArray;

        recalculateScale();

    }

    function onAskArrayChanged(array) {

        /* In order to avoid glinches while plotting the information of the array, we use a copy of the original that is constantly manipulated. */

        newArray = array.slice();
        askPoints = newArray;

        recalculateScale();

    }


    function draw() {

        if (bidPoints.length > 0 || askPoints.length > 0) {  


            drawAxis();

            drawBackground();

            plotChart();

            
        }

    }


    function drawBackground() {

        var market = markets.get(marketId);
        var label = market.assetA + " " + market.assetB;

        var fontSize = 50;//+ orderBookDephChart.container.zoom.level();

        browserCanvasContext.font = fontSize + 'px verdana';

        /* Now we transform x on the actual coordinate on the canvas. */

        var point = {
            x: orderBookDephChart.container.frame.width / 2 - (label.length / 2) * fontSize / 2,
            y: orderBookDephChart.container.frame.height * 3 / 8
        };

        point = transformThisPoint(point, orderBookDephChart.container);

        browserCanvasContext.fillStyle = 'rgba(190, 190, 190, 0.25)';

        browserCanvasContext.fillText(label, point.x, point.y);

    }

    function plotChart() {

        /*

        This function is responsible for plotting the chart onto the browser canvas. 

        */

        /* The first part of this function will plot BIDs, the second one will plot the ASKs. */

        if (bidPoints.length > 0) {

            /* We calculate the first points of the chart. These are not points representing orders, but the lower part of the hill plotted. */

            var maxBasePoint = {
                x: 0 , 
                y: orderBookDephChart.container.frame.height * 5 / 7
            };

            var minBasePoint = {
                x: (bidPoints[0].rate - timeLineCoordinateSystem.min.x) * timeLineCoordinateSystem.scale.x,  // We take the first Order Rate on the array for this.
                y: orderBookDephChart.container.frame.height * 5 / 7
            };

            maxBasePoint = transformThisPoint(maxBasePoint, orderBookDephChart.container);
            minBasePoint = transformThisPoint(minBasePoint, orderBookDephChart.container);

            /* Lets start the drawing. */

            browserCanvasContext.beginPath();
            browserCanvasContext.moveTo(minBasePoint.x, minBasePoint.y);

            var progressiveSum = 0;

            var point = minBasePoint;

            for (var i = 0; i < bidPoints.length; i++) {

                if (bidPoints[i].rate >= timeLineCoordinateSystem.min.x && bidPoints[i].rate <= timeLineCoordinateSystem.max.x) {

                    progressiveSum = progressiveSum + bidPoints[i].amountSum;

                    point = {
                        x: (bidPoints[i].rate - timeLineCoordinateSystem.min.x) * timeLineCoordinateSystem.scale.x,
                        y: orderBookDephChart.container.frame.height * 5 / 7 - progressiveSum * timeLineCoordinateSystem.scale.y
                    };

                    var rawPosition = {
                        x: point.x,
                        y: point.y
                    };

                    point = transformThisPoint(point, orderBookDephChart.container);

                    browserCanvasContext.lineTo(point.x, point.y);

                }
            }

            browserCanvasContext.lineTo(maxBasePoint.x, point.y);
            browserCanvasContext.lineTo(maxBasePoint.x, maxBasePoint.y);
            browserCanvasContext.lineTo(minBasePoint.x, minBasePoint.y);
            browserCanvasContext.closePath();
            browserCanvasContext.fillStyle = 'rgba(130, 180, 30, 0.50)';
            browserCanvasContext.fill();
            browserCanvasContext.strokeStyle = 'rgba(50, 130, 30, 0.50)';
            browserCanvasContext.lineWidth = 2;
            browserCanvasContext.stroke();

            browserCanvasContext.closePath();

        }

        /* Ok, Now it is the turn of the ASKs, following is the code that plots them on the chart. */


        if (askPoints.length > 0) {

            /* We calculate the first point of the chart */

            var maxBasePoint = {
                x: (timeLineCoordinateSystem.max.x - timeLineCoordinateSystem.min.x) * timeLineCoordinateSystem.scale.x, 
                y: orderBookDephChart.container.frame.height * 5 / 7
            };

            var minBasePoint = {
                x: (askPoints[0].rate - timeLineCoordinateSystem.min.x) * timeLineCoordinateSystem.scale.x,  // We take the first Order Rate on the array for this.
                y: orderBookDephChart.container.frame.height * 5 / 7
            };

            maxBasePoint = transformThisPoint(maxBasePoint, orderBookDephChart.container);
            minBasePoint = transformThisPoint(minBasePoint, orderBookDephChart.container);

            /* Lets start the drawing. */

            browserCanvasContext.beginPath();
            browserCanvasContext.moveTo(minBasePoint.x, minBasePoint.y);

            var progressiveSum = 0;
            var point = minBasePoint;

            for (var i = 0; i < askPoints.length; i++) {

                if (askPoints[i].rate >= timeLineCoordinateSystem.min.x && askPoints[i].rate <= timeLineCoordinateSystem.max.x) {

                    progressiveSum = progressiveSum + askPoints[i].amountSum;

                    point = {
                        x: (askPoints[i].rate - timeLineCoordinateSystem.min.x) * timeLineCoordinateSystem.scale.x,
                        y: orderBookDephChart.container.frame.height * 5 / 7 - progressiveSum * timeLineCoordinateSystem.scale.y
                    };

                    point = transformThisPoint(point, orderBookDephChart.container);

                    browserCanvasContext.lineTo(point.x, point.y);

                }

            }

            browserCanvasContext.lineTo(maxBasePoint.x, point.y);
            browserCanvasContext.lineTo(maxBasePoint.x, maxBasePoint.y);
            browserCanvasContext.lineTo(minBasePoint.x, minBasePoint.y);
            browserCanvasContext.closePath();
            browserCanvasContext.fillStyle = 'rgba(180, 130, 30, 0.50)';
            browserCanvasContext.fill();
            browserCanvasContext.strokeStyle = 'rgba(130, 50, 30, 0.50)';
            browserCanvasContext.lineWidth = 2;
            browserCanvasContext.stroke();

            browserCanvasContext.closePath();
        }

    }


    function drawAxis() {

        var step = (timeLineCoordinateSystem.max.x - timeLineCoordinateSystem.min.x) / 10;

        var decimals;

        /* Lets identify how many decimals are needed to be displayed. To do that we will chekck when is the first time that two consecutives points in the timeLineCoordinateSystem are different. */

        for (var j = 0; j < 10; j++) {

            var diff = (timeLineCoordinateSystem.min.x + step * 2).toFixed(j) - (timeLineCoordinateSystem.min.x + step * 1).toFixed(j);

            if (diff !== 0 && decimals === undefined) {
                decimals = j;
            }
        }

        for (var i = 1; i < 10 ; i++) {

            var point = {
                x: timeLineCoordinateSystem.min.x + step * i,
                y: orderBookDephChart.container.frame.height * 6 / 7
            };


            browserCanvasContext.fillStyle = 'rgba(10, 10, 10, 1)';

            fontSize = 8;

            browserCanvasContext.font = fontSize + 'px verdana';

            /* Se the label */

            var label = point.x.toFixed(decimals);

            /* Now we transform x on the actual coordinate on the canvas. */

            point.x = (point.x - timeLineCoordinateSystem.min.x) * timeLineCoordinateSystem.scale.x;  // Now x represent a coordinate on the canvas.

            point = orderBookDephChart.container.frame.frameThisPoint(point);
            point = orderBookDephChart.container.displacement.displaceThisPoint(point);
            point = orderBookDephChart.container.zoom.zoomThisPoint(point);

            browserCanvasContext.fillText(label, point.x, point.y);

        }
    }


    function recalculateScale() {

        /* Since the range of the data might change, we must calculate the timeLineCoordinateSystem everytime new data arrives. */

        var minBidRate = bidPoints[bidPoints.length - 1];
        var maxBidRate = bidPoints[0];

        var minValue = {
            x: 1,
            y: 1
        };

        var maxValue = {
            x: 1,
            y: 1
        };

        if (bidPoints.length > 0) {

            /* X AXIS:

            We calculate the min value on x on the plot in this way:

            1. We calculate the sum of all orders.
            2. Then we find which orders are included in the 75% of the total sum.
            3. The last order included will contain the minimun rate we need for the chart.

            Regarding the maximun, we just take ask orders that mirrors the bids orders only.

            */

            var sum = 0;

            for (var i = 0; i < bidPoints.length; i++) {

                    sum = sum + bidPoints[i].amountSum;

            }


            target = sum * 0.75;
            sum = 0;
            lastOrder = bidPoints[0];

            for (var i = 0; i < bidPoints.length; i++) {

                sum = sum + bidPoints[i].amountSum;

                if (sum < target) {
                    lastOrder = bidPoints[i];
                }

            }

            var minBidRate = lastOrder.rate;
            var maxBidRate = bidPoints[0].rate;

            minValue.x = minBidRate;
            maxValue.x = maxBidRate + (maxBidRate - minBidRate);

            /* Y AXIS:

            Now that we know which orders are included on the plot, we must see which is the highest value of
            all of them. The highest value can be either at an ask, or at a bid order side of the chart.

            */

            var selectedItem = bidPoints[0];
            var currentMax = 0;
            var sum = 0;

            for (var i = 0; i < bidPoints.length; i++) {

                if (bidPoints[i].rate >= minValue.x && bidPoints[i].rate <= maxValue.x) {

                    sum = sum + bidPoints[i].amountSum;

                }

            }

            currentMax = sum;
            var sum = 0;

            for (var i = 0; i < askPoints.length; i++) {

                if (askPoints[i].rate >= minValue.x && askPoints[i].rate <= maxValue.x) {

                    sum = sum + askPoints[i].amountSum;

                }

            }

            if (currentMax < sum) {

                currentMax = sum;

            }

            minValue.y = 0;
            maxValue.y = currentMax;

        } 

        timeLineCoordinateSystem.initialize(
            minValue,
            maxValue,
            orderBookDephChart.container.frame.width,
            orderBookDephChart.container.frame.height - orderBookDephChart.container.frame.height * 5 / 7
        );


    }

}

