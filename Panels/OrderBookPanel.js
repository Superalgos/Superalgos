
function newOrderBookPanel() {

    var orderBookPanel = {
        onCurrentOrderBookChanged: onCurrentOrderBookChanged,
        container: undefined,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    orderBookPanel.container = container;

    container.displacement.containerName = "Order Book Panel";
    container.frame.containerName = "Order Book Panel";

    let currentOrderBook;
    let server;

    var timeLineCoordinateSystem = newTimeLineCoordinateSystem();

    return orderBookPanel;

    function initialize() {

        orderBookPanel.container.frame.width = 400;
        orderBookPanel.container.frame.height = 300;

        orderBookPanel.container.frame.position.x = 0;
        orderBookPanel.container.frame.position.y = viewPort.visibleArea.bottomLeft.y - orderBookPanel.container.frame.height;

        server = newFileServer();
        server.initialize();



    }



    function getContainer(point) {

        var container;

        /* First we check if this point is inside this space. */

        if (this.container.frame.isThisPointHere(point, true) === true) {

            return this.container;

        } else {

            /* This point does not belong to this space. */

            return undefined;
        }

    }



    function onZoomChanged(event) {




    }

    function onDragFinished() {




    }


    function getOrderBook() {

        server.getOrderBook(exchangeId, marketId, onFileReady);

        function onFileReady(file) {

            currentOrderBook = file;
            recalculateScale();

            viewPort.eventHandler.listenToEvent("Zoom Changed", onZoomChanged);
            canvas.eventHandler.listenToEvent("Drag Finished", onDragFinished);

        }

    }



    function onCurrentOrderBookChanged(orderBooksMap) {

        currentOrderBook = [[], []];

        for (let key of orderBooksMap.keys()) {

            let orderBookPosition = orderBooksMap.get(key);

            let position = [orderBookPosition.rate, (orderBookPosition.open + orderBookPosition.close) / 2];

            if (orderBookPosition.type === 'bid') {

                currentOrderBook[1].push(position);

            }

            if (orderBookPosition.type === 'ask') {

                currentOrderBook[0].push(position);

            }

        }

        recalculateScale();

    }


    function draw() {

        return; // Do not show for now, under construction.

        this.container.frame.draw(false, false, true);

        plotCurrentOrderBook();

    }



    function recalculateScale() {

        let bidPoints = currentOrderBook[1];
        let askPoints = currentOrderBook[0];
        let position;

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

                position = {
                    rate: bidPoints[i][0],
                    amount: bidPoints[i][1]
                };

                sum = sum + position.amount;

            }


            target = sum * 0.75;
            sum = 0;
            lastOrder = bidPoints[0];

            for (var i = 0; i < bidPoints.length; i++) {

                position = {
                    rate: bidPoints[i][0],
                    amount: bidPoints[i][1]
                };

                sum = sum + position.amount;

                if (sum < target) {
                    lastOrder = position;
                }

            }

            position = {
                rate: bidPoints[0][0],
                amount: bidPoints[0][1]
            };

            var minBidRate = lastOrder.rate;
            var maxBidRate = position.rate;

            minValue.x = minBidRate;
            maxValue.x = maxBidRate + (maxBidRate - minBidRate);

            /* Y AXIS:

            Now that we know which orders are included on the plot, we must see which is the highest value of
            all of them. The highest value can be either at an ask, or at a bid order side of the chart.

            */



            var selectedItem = position;
            var currentMax = 0;
            var sum = 0;

            for (var i = 0; i < bidPoints.length; i++) {

                position = {
                    rate: bidPoints[i][0],
                    amount: bidPoints[i][1]
                };

                if (position.rate >= minValue.x && position.rate <= maxValue.x) {

                    sum = sum + position.amount;

                }

            }

            currentMax = sum;
            var sum = 0;

            for (var i = 0; i < askPoints.length; i++) {

                position = {
                    rate: askPoints[i][0],
                    amount: askPoints[i][1]
                };

                if (position.rate >= minValue.x && position.rate <= maxValue.x) {

                    sum = sum + position.amount;

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
            orderBookPanel.container.frame.width,
            orderBookPanel.container.frame.height - orderBookPanel.container.frame.height * 5 / 7
        );
    }



    function plotCurrentOrderBook() {

        if (currentOrderBook === undefined) { return; }

        let bidPoints = currentOrderBook[1];
        let askPoints = currentOrderBook[0];

        let position;

        /* The first part of this function will plot BIDs, the second one will plot the ASKs. */

        if (bidPoints.length > 0) {

            /* We calculate the first points of the chart. These are not points representing positions on the order book, but the lower part of the hill plotted. */

            position = {
                rate: bidPoints[0][0],
                amount: bidPoints[0][1]
            };

            var maxBasePoint = {
                x: 0,
                y: orderBookPanel.container.frame.height * 5 / 7
            };

            var minBasePoint = {
                x: (position.rate - timeLineCoordinateSystem.min.x) * timeLineCoordinateSystem.scale.x,  // We take the first Order Rate on the array for this.
                y: orderBookPanel.container.frame.height * 5 / 7
            };

            maxBasePoint = orderBookPanel.container.frame.frameThisPoint(maxBasePoint);
            minBasePoint = orderBookPanel.container.frame.frameThisPoint(minBasePoint);

            /* Lets start the drawing. */

            browserCanvasContext.beginPath();
            browserCanvasContext.moveTo(minBasePoint.x, minBasePoint.y);

            var progressiveSum = 0;

            var point = minBasePoint;

            for (var i = 0; i < bidPoints.length; i++) {

                position = {
                    rate: bidPoints[i][0],
                    amount: bidPoints[i][1]
                };

                if (position.rate >= timeLineCoordinateSystem.min.x && position.rate <= timeLineCoordinateSystem.max.x) {

                    progressiveSum = progressiveSum + position.amount;

                    point = {
                        x: (position.rate - timeLineCoordinateSystem.min.x) * timeLineCoordinateSystem.scale.x,
                        y: orderBookPanel.container.frame.height * 5 / 7 - progressiveSum * timeLineCoordinateSystem.scale.y
                    };

                    point = orderBookPanel.container.frame.frameThisPoint(point);

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


        if (askPoints.length > 0) {

            position = {
                rate: askPoints[0][0],
                amount: askPoints[0][1]
            };

            /* We calculate the first point of the chart */

            var maxBasePoint = {
                x: (timeLineCoordinateSystem.max.x - timeLineCoordinateSystem.min.x) * timeLineCoordinateSystem.scale.x,
                y: orderBookPanel.container.frame.height * 5 / 7
            };

            var minBasePoint = {
                x: (position.rate - timeLineCoordinateSystem.min.x) * timeLineCoordinateSystem.scale.x,  // We take the first Order Rate on the array for this.
                y: orderBookPanel.container.frame.height * 5 / 7
            };

            maxBasePoint = orderBookPanel.container.frame.frameThisPoint(maxBasePoint);
            minBasePoint = orderBookPanel.container.frame.frameThisPoint(minBasePoint);

            /* Lets start the drawing. */

            browserCanvasContext.beginPath();
            browserCanvasContext.moveTo(minBasePoint.x, minBasePoint.y);

            var progressiveSum = 0;
            var point = minBasePoint;

            for (var i = 0; i < askPoints.length; i++) {

                position = {
                    rate: askPoints[i][0],
                    amount: askPoints[i][1]
                };

                if (position.rate >= timeLineCoordinateSystem.min.x && position.rate <= timeLineCoordinateSystem.max.x) {

                    progressiveSum = progressiveSum + position.amount;

                    point = {
                        x: (position.rate - timeLineCoordinateSystem.min.x) * timeLineCoordinateSystem.scale.x,
                        y: orderBookPanel.container.frame.height * 5 / 7 - progressiveSum * timeLineCoordinateSystem.scale.y
                    };

                    point = orderBookPanel.container.frame.frameThisPoint(point);

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


}

