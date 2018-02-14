
function newSpreadChart() {

    var trades = [];
    var sells = [];
    var buys = [];

    var plotArea = newPlotArea();

    var datetime;
    var datetimeRange;

    var spreadChart = {
        setDatetime: setDatetime,
        setDatetimeRange: setDatetimeRange,
        container: undefined,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    spreadChart.container = container;

    container.displacement.containerName = "Spread Chart";
    container.zoom.containerName = "Spread Chart";
    container.frame.containerName = "Spread Chart";

    var marketId;
    var exchangeId;
    var marketTrades;

    return spreadChart;

    function initialize(exchange, market, trades) {

        marketId = market;
        exchangeId = exchange;
        marketTrades = trades;

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


    function setDatetime(newDatetime) {

        datetime = newDatetime;

    }



    function setDatetimeRange(newDatetimeRange) {

        datetimeRange = newDatetimeRange;

        trades = [];

        marketTrades.getTradesByDateRange(datetimeRange, onTradesReady);

        function onTradesReady(tradesReceived) {

            trades = tradesReceived;

            recalculateScale();
            splitTrades();
        }
    }



    function draw() {

        this.container.frame.draw();

        drawBackground();

        plotSpreadChart();
    }



    function recalculateScale() {

        var minValue = {
            x: 10000000000000,
            y: 10000000000000
        };

        var maxValue = {
            x: 0,
            y: 0
        };

        for (var i = 0; i < trades.length; i++) {

            var trade = trades[i];

            var datetime = trade.datetime.valueOf();

            if (minValue.x > datetime) {
                minValue.x = datetime;
            }

            if (maxValue.x < datetime) {
                maxValue.x = datetime;
            }

            var rate = trade.rate;

            if (minValue.y > rate) {
                minValue.y = rate;
            }

            if (maxValue.y < rate) {
                maxValue.y = rate;
            }

        }

        plotArea.initialize(
            minValue,
            maxValue,
            spreadChart.container.frame.width,
            spreadChart.container.frame.height
        );

    }



    function splitTrades() {

        for (let i = 0; i < trades.length; i++) {

            let trade = trades[i];

            if (trade.type === "sell") {
                sells.push(trade);
            } else {
                buys.push(trade);
            }
        }

    }

    function plotSpreadChart() {

        if (sells.length > 0) {

            let point;

            let firstPoint = {
                x: (sells[0].datetime.valueOf() - plotArea.min.x) * plotArea.scale.x,
                y: spreadChart.container.frame.height - (sells[0].rate - plotArea.min.y) * plotArea.scale.y
            };

            firstPoint = transformThisPoint(firstPoint, spreadChart.container);

            let seconddPoint = {
                x: (sells[0].datetime.valueOf() - plotArea.min.x) * plotArea.scale.x,
                y: spreadChart.container.frame.height
            };

            seconddPoint = transformThisPoint(seconddPoint, spreadChart.container);


            browserCanvasContext.beginPath();

            browserCanvasContext.moveTo(seconddPoint.x, seconddPoint.y);
            browserCanvasContext.lineTo(firstPoint.x, firstPoint.y);

            let thirdPoint;

            for (let i = 0; i < sells.length; i++) {

                let sell = sells[i];

                point = {
                    x: (sell.datetime.valueOf() - plotArea.min.x) * plotArea.scale.x,
                    y: spreadChart.container.frame.height - (sell.rate - plotArea.min.y) * plotArea.scale.y
                };

                thirdPoint = {
                    x: point.x,
                    y: spreadChart.container.frame.height
                };

                point = transformThisPoint(point, spreadChart.container);
                browserCanvasContext.lineTo(point.x, point.y);

            }

            thirdPoint = transformThisPoint(thirdPoint, spreadChart.container);
            browserCanvasContext.lineTo(thirdPoint.x, thirdPoint.y);

            browserCanvasContext.closePath();

            browserCanvasContext.strokeStyle = 'rgba(117, 27, 5, 0.70)';
            browserCanvasContext.lineWidth = 1;
            browserCanvasContext.stroke();

            browserCanvasContext.fillStyle = 'rgba(230, 67, 34, 0.70)';
            browserCanvasContext.fill();

        }

        if (buys.length > 0) {

            let firstPoint = {
                x: (buys[0].datetime.valueOf() - plotArea.min.x) * plotArea.scale.x,
                y: spreadChart.container.frame.height - (buys[0].rate - plotArea.min.y) * plotArea.scale.y
            };

            firstPoint = transformThisPoint(firstPoint, spreadChart.container);

            let seconddPoint = {
                x: (buys[0].datetime.valueOf() - plotArea.min.x) * plotArea.scale.x,
                y: 0
            };

            seconddPoint = transformThisPoint(seconddPoint, spreadChart.container);



            browserCanvasContext.beginPath();

            browserCanvasContext.moveTo(seconddPoint.x, seconddPoint.y);
            browserCanvasContext.lineTo(firstPoint.x, firstPoint.y);

            let thirdPoint;

            for (let i = 0; i < buys.length; i++) {

                let buy = buys[i];

                point = {
                    x: (buy.datetime.valueOf() - plotArea.min.x) * plotArea.scale.x,
                    y: spreadChart.container.frame.height - (buy.rate - plotArea.min.y) * plotArea.scale.y
                };

                thirdPoint = {
                    x: spreadChart.container.frame.width,
                    y: 0
                };

                point = transformThisPoint(point, spreadChart.container);
                browserCanvasContext.lineTo(point.x, point.y);

            }

            thirdPoint = transformThisPoint(thirdPoint, spreadChart.container);
            browserCanvasContext.lineTo(thirdPoint.x, thirdPoint.y);
            browserCanvasContext.closePath();

            browserCanvasContext.strokeStyle = 'rgba(4, 74, 117, 0.70)';
            browserCanvasContext.lineWidth = 1;
            browserCanvasContext.stroke();

            browserCanvasContext.fillStyle = 'rgba(34, 174, 230, 0.70)';
            browserCanvasContext.fill();

        }
    }


    function drawBackground() {

        var market = markets.get(marketId);
        var label = market.assetA + " " + market.assetB;

        var fontSize = 50;//+ spreadChart.container.zoom.level();

        browserCanvasContext.font = fontSize + 'px verdana';

        /* Now we transform x on the actual coordinate on the canvas. */

        var point = {
            x: spreadChart.container.frame.width / 2 - label.length / 2 * fontSize / 2,
            y: spreadChart.container.frame.height * 3 / 8
        };

        point = transformThisPoint(point, spreadChart.container);

        browserCanvasContext.fillStyle = 'rgba(190, 190, 190, 0.25)';

        browserCanvasContext.fillText(label, point.x, point.y);

    }
}

