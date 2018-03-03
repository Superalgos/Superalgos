
function newOrderBookChart() {

    /*

    This particular chart, plots information valid at a certain point in time. That menas that first it needs to get that information, and it also
    has to discard information that is not valid anymore. There is one issue: some graphics elements are displayed and animated, like balls, that
    means that every time this chart request new info, it can not destroy all the current orders it is based on, since, if they are still valid
    for the next period of time, recreating them would men producing a glinch on the visualization. So that means that every time that the time period
    changes, it needs not only to incorporate new orders, but also it needs to eliminate the ones that are out of scope.

    */

    var datetime;

    var orderBookChart = {
        setDatetime: setDatetime,
        isInitialized: false,
        container: undefined,
        timeLineCoordinateSystem: undefined,
        draw: draw,
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize
    };



    /*

    Here we will define the two arrays that will contain mostly the points to be plotted on the chart.
    These arrays contains an array that have the following structure:

    0. Rate
    1. Amount A                 This is the SUM of Amounts A that belongs to this point in the chart.
    2. The SUM of Amount A      This is the cumulative SUM of SUMs of Amounts A, begining from the smaller rate and going up.
    3. A Label Ball object

    */

    var orderBookAsksChartPoints = [];
    var orderBookBidsChartPoints = [];

    var ballsOrdersQueue = [];               // This is the queue of balls waiting for the order to be added to the array to be displayed.
    var orderBallsReleaseTimer;

    var container = newContainer();
    container.initialize();
    orderBookChart.container = container;

    container.displacement.containerName = "Order Book Chart";
    container.zoom.containerName = "Order Book Chart";
    container.frame.containerName = "Order Book Chart";

    var orderBookSnapShot = newOrderBookSnapShot();

    return orderBookChart;


    function initialize() {

        orderBookSnapShot.initialize();

        orderBookSnapShot.eventHandler.listenToEvent('Order Added', onOrderAdded, undefined);
        orderBookSnapShot.eventHandler.listenToEvent('Order Removed', onOrderRemoved, undefined);

        orderBookSnapShot.setDatetime(datetime);

        orderBallsReleaseTimer = setInterval(onReleaseOneMoreBall, 100);
        // clearTimeout(orderBallsReleaseTimer);   Use this to cancel the timer. 



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

    /*

    FUNCTIONS RELATED TO "HANDLING EVENTS"

    */

    function onOrderAdded() {

    }


    function onOrderRemoved() {

    }



    function onOrderBookChanged() {

        /* 

        Fresh data about the order book has just arrived. We need to take it an put it in the right way so that
        this chart can show what it is supposed to show. 

        */

        /* Since the range of the data might change, we must calculate the timeLineCoordinateSystem everytime new data arrives. */

        var timeLineCoordinateSystem = newTimeLineCoordinateSystem();
        orderBookChart.timeLineCoordinateSystem = timeLineCoordinateSystem;

        orderBookChart.timeLineCoordinateSystem.initialize(
            orderBookChart.orderBook.server.orderBookStatistics.resultSet["row 1"].MIN_Rate,
            orderBookChart.orderBook.server.orderBookStatistics.resultSet["row 2"].MAX_Rate,
            orderBookChart.container.frame.width
        );

        /* Balls are being created, before they enter into the floating space. */

        transformRecivedOrdersIntoOrderBalls();

        orderBookChart.isInitialized = true;
    }


    function setDatetime(newDatetime) {

        datetime = newDatetime;
        orderBookChart.orderBookSnapShot.setDatetime(datetime);

    }


    function onReleaseOneMoreBall() {

        /*

        Orders that are queued to be displayed, are released, one by one every time this function is executed.
        With released, we mean that are pushed to an array of balls that are currently rendered at the Floating Space.

        */

        if (ballsOrdersQueue.length > 0) {

            /* We take the first order in the queue and push it to the balls array. */

            var ball = ballsOrdersQueue.shift();

            balls.push(ball);

            orderBookChart.addOrder(ball.linkedObject);  // We add the order linked to this ball to the order book.

            updateBallsTargets(); // This will recalculate the target for the new ball added.
        }

    }


    /*

    FUNCTIONS RELATED TO "PLOTTING THE CHART"

    */

    function drawOrderBookChart() {

        /*

        This function is responsible for plotting the chart onto the browser canvas. It assumes that there exists 2 arrays, containing
        the points already calculated to be plotted. Those calculations happens when a new order is added to the chart, in this function
        we just plot whatever is already calculated.

        */

        /* The first part of this function will plot BIDs, the second one will plot the ASKs. */

        if (orderBookBidsChartPoints.length > 0) {

            /* We calculate the first points of the chart. These are not points representing orders, but the lower part of the hill plotted. */

            var maxBasePoint = {
                x: (orderBookBidsChartPoints[orderBookBidsChartPoints.length - 1][0] - orderBookChart.timeLineCoordinateSystem.min.x) * orderBookChart.timeLineCoordinateSystem.timeLineCoordinateSystem.x,  // We take the first Order Rate on the array for this.
                y: orderBookChart.container.frame.height * 5 / 7
            };

            var minBasePoint = {
                x: (orderBookBidsChartPoints[0][0] - orderBookChart.timeLineCoordinateSystem.min.x) * orderBookChart.timeLineCoordinateSystem.x,  // We take the first Order Rate on the array for this.
                y: orderBookChart.container.frame.height * 5 / 7
            };

            /* We make the point relative to the current frame */

            maxBasePoint = orderBookChart.container.frame.frameThisPoint(maxBasePoint);
            minBasePoint = orderBookChart.container.frame.frameThisPoint(minBasePoint);

            /* We add the possible displacement */

            maxBasePoint = orderBookChart.container.displacement.displaceThisPoint(maxBasePoint);
            minBasePoint = orderBookChart.container.displacement.displaceThisPoint(minBasePoint);

            /* We apply the zoom factor. */

            minBasePoint = orderBookChart.container.zoom.zoomThisPoint(minBasePoint);
            maxBasePoint = orderBookChart.container.zoom.zoomThisPoint(maxBasePoint);

            /* Lets start the drawing. */

            browserCanvasContext.beginPath();
            browserCanvasContext.moveTo(minBasePoint.x, minBasePoint.y);

            var sumY = 0;

            for (var i = 0; i < orderBookBidsChartPoints.length; i++) {

                sumY = sumY + orderBookBidsChartPoints[i][1];

                var point = {
                    x: (orderBookBidsChartPoints[i][0] - orderBookChart.timeLineCoordinateSystem.min.x) * orderBookChart.timeLineCoordinateSystem.timeLineCoordinateSystem.x,
                    y: orderBookChart.container.frame.height * 5 / 7 - sumY
                };

                var rawPosition = {
                    x: point.x,
                    y: point.y
                };

                /* Frame the point */

                point = orderBookChart.container.frame.frameThisPoint(point);

                /* First we apply the displacement. */

                point = orderBookChart.container.displacement.displaceThisPoint(point);

                /* We apply the zoom factor. */

                point = orderBookChart.container.zoom.zoomThisPoint(point);

                browserCanvasContext.lineTo(point.x, point.y);



            }

            browserCanvasContext.lineTo(maxBasePoint.x, maxBasePoint.y);
            browserCanvasContext.lineTo(minBasePoint.x, minBasePoint.y);
            browserCanvasContext.closePath();
            browserCanvasContext.fillStyle = 'rgba(130, 180, 30, 0.9)';
            browserCanvasContext.fill();
            browserCanvasContext.strokeStyle = 'rgba(30, 230, 30, 0.9)';
            browserCanvasContext.lineWidth = 1;
            browserCanvasContext.stroke();

            browserCanvasContext.closePath();


        }

        /* Ok, Now it is the turn of the ASKs, following is the code that plots them on the chart. */


        if (orderBookAsksChartPoints.length > 0) {

            /* We calculate the first point of the chart */

            var maxBasePoint = {
                x: (orderBookAsksChartPoints[orderBookAsksChartPoints.length - 1][0] - orderBookChart.timeLineCoordinateSystem.min.x) * orderBookChart.timeLineCoordinateSystem.timeLineCoordinateSystem.x,  // We take the first Order Rate on the array for this.
                y: orderBookChart.container.frame.height * 5 / 7
            };

            var minBasePoint = {
                x: (orderBookAsksChartPoints[0][0] - orderBookChart.timeLineCoordinateSystem.min.x) * orderBookChart.timeLineCoordinateSystem.timeLineCoordinateSystem.x,  // We take the first Order Rate on the array for this.
                y: orderBookChart.container.frame.height * 5 / 7
            };

            /* We make the point relative to the current frame */

            maxBasePoint = orderBookChart.container.frame.frameThisPoint(maxBasePoint);
            minBasePoint = orderBookChart.container.frame.frameThisPoint(minBasePoint);

            /* We add the possible displacement */

            maxBasePoint = orderBookChart.container.displacement.displaceThisPoint(maxBasePoint);
            minBasePoint = orderBookChart.container.displacement.displaceThisPoint(minBasePoint);

            /* We apply the zoom factor. */

            minBasePoint = orderBookChart.container.zoom.zoomThisPoint(minBasePoint);
            maxBasePoint = orderBookChart.container.zoom.zoomThisPoint(maxBasePoint);

            /* Lets start the drawing. */

            browserCanvasContext.beginPath();
            browserCanvasContext.moveTo(minBasePoint.x, minBasePoint.y);

            var sumY = 0;

            for (var i = 0; i < orderBookAsksChartPoints.length; i++) {

                sumY = sumY + orderBookAsksChartPoints[i][1];

                var point = {
                    x: (orderBookAsksChartPoints[i][0] - orderBookChart.timeLineCoordinateSystem.min.x) * orderBookChart.timeLineCoordinateSystem.timeLineCoordinateSystem.x,
                    y: orderBookChart.container.frame.height * 5 / 7 - sumY
                };

                /* Frame the point */

                point = orderBookChart.container.frame.frameThisPoint(point);

                /* We add the possible displacement */

                point = orderBookChart.container.displacement.displaceThisPoint(point);

                /* We apply the zoom factor. */

                point = orderBookChart.container.zoom.zoomThisPoint(point);

                browserCanvasContext.lineTo(point.x, point.y);

            }

            browserCanvasContext.lineTo(maxBasePoint.x, maxBasePoint.y);
            browserCanvasContext.lineTo(minBasePoint.x, minBasePoint.y);
            browserCanvasContext.closePath();
            browserCanvasContext.fillStyle = 'rgba(180, 130, 30, 0.75)';
            browserCanvasContext.fill();
            browserCanvasContext.strokeStyle = 'rgba(230, 30, 30, 0.75)';
            browserCanvasContext.lineWidth = 1;
            browserCanvasContext.stroke();

            browserCanvasContext.closePath();
        }

    }


    function drawXAxis() {

        var step = (orderBookChart.timeLineCoordinateSystem.max.x - orderBookChart.timeLineCoordinateSystem.min.x) / 20;

        var decimals;

        /* Lets identify how many decimals are needed to be displayed. To do that we will chekck when is the first time that two consecutives points in the timeLineCoordinateSystem are different. */

        for (var j = 0; j < 10; j++) {

            var diff = (orderBookChart.timeLineCoordinateSystem.min.x + step * 2).toFixed(j) - (orderBookChart.timeLineCoordinateSystem.min.x + step * 1).toFixed(j);

            if (diff !== 0 && decimals === undefined) {
                decimals = j;
            }
        }

        for (var i = 1; i < 20; i++) {

            var point = {
                x: orderBookChart.timeLineCoordinateSystem.min.x + step * i,
                y: orderBookChart.container.frame.height * 6 / 7
            };


            browserCanvasContext.strokeStyle = 'rgba(10, 103, 201, 1)';

            var fontSize = 10;// + orderBookChart.container.zoom.level();

            browserCanvasContext.font = fontSize + 'px verdana';

            /* Se the label */

            var label = point.x.toFixed(decimals);

            /* Now we transform x on the actual coordinate on the canvas. */

            point.x = (point.x - orderBookChart.timeLineCoordinateSystem.min.x) * orderBookChart.timeLineCoordinateSystem.scale.x;  // Now x represent a coordinate on the canvas.

            point = orderBookChart.container.frame.frameThisPoint(point);
            point = orderBookChart.container.displacement.displaceThisPoint(point);
            point = orderBookChart.container.zoom.zoomThisPoint(point);

            browserCanvasContext.fillText(label, point.x, point.y);

        }
    }


    function calculateOrdersSum(pointsArray) {

        /* In this chart we represent the cummulative sum of all orders. That means that every time a new order arrives, we need to recalculate this. */

        var sum = 0;

        for (var i = 0; i < pointsArray.length; i++) {

            sum = sum + pointsArray[i][1];
            pointsArray[i][2] = sum;

        }
    }


    /*

   FUNCTIONS RELATED TO "NEW ORDERS"

   */

    function removeOrder(order) {
        /*

        Here we will remove the order from the chart to be ploted. The chart has 2 parts: bids and asks, so we need to know which part to remove it from.

        */

        if (order.type === 'Bid') {

            removeOrderFromPointArray(order, orderBookBidsChartPoints);
            calculateOrdersSum(orderBookBidsChartPoints);                   // We sum all the amounts into the 3rd column of the array.

        } else {

            removeOrderFromPointArray(order, orderBookAsksChartPoints);
            calculateOrdersSum(orderBookAsksChartPoints);                   // We sum all the amounts into the 3rd column of the array.

        }
    }


    function removeOrderFromPointArray(order, pointsArray) {

        /* To remove an order, we simply scan the array received and when we find the same order rate, we substract the amount, and thats it. */

        for (var i = 0; i < pointsArray.length; i++) {

            if (pointsArray[i][0] === order.rate) { // We find the item in the pointArray where the rate is the same as the orders rate. 

                pointsArray[i][1] = pointsArray[i][1] - order.amountA;

                if (pointsArray[i][1] === 0) {      // If we reach zero, then there is no reason to keep this element in the array.

                    pointsArray.splice(i, 1);       // This means remove this item from the array.

                }

            }

        }

    }


    function addOrder(order) {

        /*

        This is the first function executed when a new order arrives. Here we still don't know if it is an ASK or BID. From here on we
        do all the things needed to incorporate this new order to the chart.

        */


        var pointIndex;

        if (order.type === 'Bid') {

            pointIndex = addNewBidOrder(order);                              // We add the new order to the array, if necesary. 
            calculateOrdersSum(orderBookBidsChartPoints);                      // We sum all the amounts into the 3rd column of the array.

            //if (pointIndex >= 0) {                                             // < 0 means that the amount of the order was summed into an existing item of the array.

            //    var ball;

            //    ball = addNewLabelBall(pointIndex, order.type, order.rate, 'rgba(30, 130, 30, 0.65)');         // We add a new ball.
            //    orderBookBidsChartPoints[pointIndex][3] = ball;
            //    updateLabelBallsLData(orderBookBidsChartPoints);                   // We update the labels of the balls we the new values, resulting of the sum calculation.
            //}

        } else {

            pointIndex = addNewAskOrder(order);
            calculateOrdersSum(orderBookAsksChartPoints);                       // We sum all the amounts into the 3rd column of the array.

            //if (pointIndex >= 0) {                                              // < 0 means that the amount of the order was summed into an existing item of the array.

            //    var ball;

            //     ball = addNewLabelBall(pointIndex, order.type, order.rate, 'rgba(130, 30, 30, 0.65)');         // We add a new ball.
            //     orderBookAsksChartPoints[pointIndex][3] = ball;
            //    updateLabelBallsLData(orderBookAsksChartPoints);      
            //}
        }


    }


    function addNewBidOrder(order) {

        /*

        Everytime a new order arrives, we need to add it to the array that contains all the chart points for this type of order.
        To add it, we need to follow certain rules, that are defined by this type of chart. This is what this function does for BID orders.

        */

        if (orderBookBidsChartPoints.length === 0) {

            orderBookBidsChartPoints.push([order.rate, order.amountA, 0, undefined]); // There it goes the first element of the order book.
            return 0;

        } else {

            for (var i = 0; i < orderBookBidsChartPoints.length; i++) {

                try {
                    if (order.rate < orderBookBidsChartPoints[i][0] && order.rate > orderBookBidsChartPoints[i + 1][0]) {

                        orderBookBidsChartPoints.splice(i + 1, 0, [order.rate, order.amountA, 0, undefined]);
                        return i + 1;
                    }
                } catch (err) {
                    // It is fine if that does not work. It might be because the index i+1 does not exist. 
                }

                if (order.rate === orderBookBidsChartPoints[i][0]) {

                    /* Orders with the exact same rate that previous orders on the order book, are added to the same item of the arrray. */

                    orderBookBidsChartPoints[i][1] = orderBookBidsChartPoints[i][1] + order.rate;

                    return -1;  // This means that no new item was added.

                } else {

                    if (order.rate > orderBookBidsChartPoints[i][0] && i === 0) {

                        orderBookBidsChartPoints.splice(i, 0, [order.rate, order.amountA, 0, undefined]);
                        return i;

                    } else {

                        if (order.rate < orderBookBidsChartPoints[i][0] && i === orderBookBidsChartPoints.length - 1) {

                            orderBookBidsChartPoints.push([order.rate, order.amountA, 0, undefined]);
                            return orderBookBidsChartPoints.length - 1;
                        }
                    }
                }
            }
        }
    }


    function addNewAskOrder(order) {

        /*

        Everytime a new order arrives, we need to add it to the array that contains all the chart points for this type of order.
        To add it, we need to follow certain rules, that are defined by this type of chart. This is what this function does for ASK orders.

        */

        if (orderBookAsksChartPoints.length === 0) {

            orderBookAsksChartPoints.push([order.rate, order.amountA, 0, undefined]); // There it goes the first element of the order book.
            return 0;

        } else {

            for (var i = 0; i < orderBookAsksChartPoints.length; i++) {

                try {
                    if (order.rate > orderBookAsksChartPoints[i][0] && order.rate < orderBookAsksChartPoints[i + 1][0]) {

                        orderBookAsksChartPoints.splice(i + 1, 0, [order.rate, order.amountA, 0, undefined]);
                        return i + 1;
                    }
                } catch (err) {
                    // It is fine if that does not work. It might be because the index i+1 does not exist. 
                }


                if (order.rate === orderBookAsksChartPoints[i][0]) {

                    /* Orders with the exact same rate that previous orders on the order book, are added to the same item of the arrray. */

                    orderBookAsksChartPoints[i][1] = orderBookAsksChartPoints[i][1] + order.rate;
                    return -1;

                } else {

                    if (order.rate < orderBookAsksChartPoints[i][0]) {

                        orderBookAsksChartPoints.splice(i, 0, [order.rate, order.amountA, 0, undefined]);
                        return i;

                    } else {

                        if (order.rate > orderBookAsksChartPoints[i][0] && i === orderBookAsksChartPoints.length - 1) {

                            orderBookAsksChartPoints.push([order.rate, order.amountA, 0, undefined]);
                            return orderBookAsksChartPoints.length - 1;
                        }
                    }
                }
            }
        }
    }


    /*

 FUNCTIONS RELATED TO "THE ANIMATION"

 */

    function draw() {

        /* This function is meant to be executed to draw the whole chart, for instance, as part of some animation loop. */

        this.container.frame.draw();

        if (orderBookChart.isInitialized === true) {

            drawOrderBookChart();

            drawXAxis();
        }

    }

    /*

    FUNCTIONS RELATED TO "ORDER BALLS"

    */

    function transformRecivedOrdersIntoOrderBalls() {

        /*

        Every new order we receive, we automatically transform it into a new ball. That doesnt mean that the ball is going to be
        displayed right away, but anyway we have it ready for that.

        */

        var totalRows = Object.keys(orderBookChart.orderBook.server.orderBookData.resultSet).length;

        for (var i = 1; i <= totalRows; i++) {

            var row = orderBookChart.orderBook.server.orderBookData.resultSet["row " + i];

            /* We move the information from the result set to an order object, and use that from now on. */

            var order = newOrder(undefined, row.Type, row.Rate, row.AmountA, row.AmountB, undefined, undefined);

            /* Position of the ball without displacement or zoon. */

            var rawPosition = {
                x: (order.rate - orderBookChart.timeLineCoordinateSystem.min.x) * orderBookChart.timeLineCoordinateSystem.scale.x,
                y: orderBookChart.container.frame.height * 5 / 7
            };


            var ball = newBall();

            ball.container = orderBookChart.container;


            ball.radomizeCurrentSpeed();

            ball.friction = .995;

            ball.rawPosition = rawPosition;

            ball.initializeMass(order.amountA * 5);
            ball.initializeRadius(order.amountA * 3);
            ball.initializeTargetPosition();

            ball.radomizeCurrentPosition(ball.targetPosition);

            ball.linkedObject = order;
            ball.linkedObjectType = "order";

            if (order.type === 'Bid') {
                ball.fillStyle = 'rgba(102, 204, 0, 0.75)';
            } else {
                ball.fillStyle = 'rgba(222, 105, 42, 0.75)';
            }

            if (order.type === 'Bid') {
                ball.labelStrokeStyle = 'rgba(255, 255, 255, 1)';
            } else {
                ball.labelStrokeStyle = 'rgba(255, 255, 255, 1)';
            }

            ball.labelFirstText = order.amountA;
            ball.labelSecondText = order.rate;



            ballsOrdersQueue.push(ball);
        }
    }

    /*

    FUNCTIONS RELATED TO "LABEL BALLS"

    */

    function addNewLabelBall(id, type, rate, fillStyle) {

        /* This function is used to create new balls, representing labels of each point on the chart. */

        var rawPosition = {
            x: (rate - orderBookChart.timeLineCoordinateSystem.min.x) * orderBookChart.timeLineCoordinateSystem.scale.x,
            y: orderBookChart.container.frame.height * 5 / 7
        };

        var ball = newBall();

        ball.container = orderBookChart.container;

        ball.radomizeCurrentPosition(rawPosition);
        ball.radomizeCurrentSpeed();

        ball.friction = .995;

        ball.rawPosition = rawPosition;

        ball.initializeMass(15);
        ball.initializeRadius(3);
        ball.initializeTargetPosition();


        ball.fillStyle = fillStyle;
        ball.labelStrokeStyle = 'rgba(255, 255, 255, 1)';

        ball.labelFirstText = 0; //.toFixed(4);
        ball.labelSecondText = rate.toFixed(8);


        balls.push(ball);

        return ball;
    }


    function updateLabelBallsLData(pointsArray) {

        /* When a new order arrives to the chart, all labels of balls representing points in the chart must be updated. */

        var ball;
        var sum;

        for (var i = 0; i < pointsArray.length; i++) {

            /* We update the balls label. */

            ball = pointsArray[i][3];
            sum = pointsArray[i][2];

            ball.labelFirstText = sum.toFixed(2);

            /* We update the balls raw position. */

            var rawPositionY = orderBookChart.container.frame.height * 5 / 7 - sum;

            ball.rawPosition.y = rawPositionY;
        }
    }


}

