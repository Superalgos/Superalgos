
function newPriceChart() {

    var trades = [];

    var plotArea = newPlotArea();

    var datetime;
    var datetimeRange;

    var priceChart = {
        setDatetime: setDatetime,
        setDatetimeRange: setDatetimeRange,
        container: undefined,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    priceChart.container = container;

    container.displacement.containerName = "Price Chart";
    container.zoom.containerName = "Price Chart";
    container.frame.containerName = "Price Chart";

    var marketId;
    var exchangeId;
    var marketTrades;

    return priceChart;

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

        plotPriceChart();
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
            priceChart.container.frame.width,
            priceChart.container.frame.height
        );

    }


    function plotPriceChart() {

        if (trades.length > 0) {

            var firstPoint = {
                x: (trades[0].datetime.valueOf() - plotArea.min.x) * plotArea.scale.x,
                y: priceChart.container.frame.height - (trades[0].rate - plotArea.min.y) * plotArea.scale.y
            };

            firstPoint = transformThisPoint(firstPoint, priceChart.container);

            browserCanvasContext.moveTo(firstPoint.x, firstPoint.y);

            for (var i = 0; i < trades.length; i++) {

                var trade = trades[i];

                point = {
                    x: (trade.datetime.valueOf() - plotArea.min.x) * plotArea.scale.x,
                    y: priceChart.container.frame.height - (trade.rate - plotArea.min.y) * plotArea.scale.y
                };

                point = transformThisPoint(point, priceChart.container);
                browserCanvasContext.lineTo(point.x, point.y);

            }

            browserCanvasContext.strokeStyle = 'rgba(30, 30, 200, 0.50)';
            browserCanvasContext.lineWidth = 1;
            browserCanvasContext.stroke();

        }
    }


    function drawBackground() {

        var market = markets.get(marketId);
        var label = market.assetA + " " + market.assetB;

        var fontSize = 50;//+ priceChart.container.zoom.level();

        browserCanvasContext.font = fontSize + 'px verdana';

        /* Now we transform x on the actual coordinate on the canvas. */

        var point = {
            x: priceChart.container.frame.width / 2 - label.length / 2 * fontSize / 2,
            y: priceChart.container.frame.height * 3 / 8
        };

        point = transformThisPoint(point, priceChart.container);

        browserCanvasContext.fillStyle = 'rgba(190, 190, 190, 0.25)';

        browserCanvasContext.fillText(label, point.x, point.y);

    }
}

