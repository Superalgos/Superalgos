
function newAAMastersPlottersCandlesVolumesCandlesCandlePanel() {

    var currentCandlePanel = {
        onEventRaised: onEventRaised,
        container: undefined,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    currentCandlePanel.container = container;

    container.displacement.containerName = "Current Candle Panel";
    container.frame.containerName = "Current Candle Panel";

    let currentCandle;

    return currentCandlePanel;

    function initialize() {

        currentCandlePanel.container.frame.width = 250;
        currentCandlePanel.container.frame.height = 300;

        currentCandlePanel.container.frame.position.x = viewPort.visibleArea.topRight.x - currentCandlePanel.container.frame.width * 2;
        currentCandlePanel.container.frame.position.y = viewPort.visibleArea.bottomLeft.y - currentCandlePanel.container.frame.height;

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


    function onEventRaised(lastCurrentCandle) {

        currentCandle = lastCurrentCandle;

    }


    function draw() {

        this.container.frame.draw(false, false, true);

        plotCurrentCandleInfo();

    }


    function plotCurrentCandleInfo() {

        if (currentCandle === undefined) { return; }
        if (currentCandle.innerCandle === undefined) { return; }

        const frameBodyHeight = currentCandlePanel.container.frame.getBodyHeight();
        const frameTitleHeight = currentCandlePanel.container.frame.height - frameBodyHeight;

        const X_AXIS = currentCandlePanel.container.frame.width / 2;
        const Y_AXIS = frameTitleHeight + frameBodyHeight / 2;
 
        var candlePoint1 = {
            x: X_AXIS - currentCandle.bodyWidth / 2,
            y: Y_AXIS - currentCandle.bodyHeight / 2 
        };

        var candlePoint2 = {
            x: X_AXIS + currentCandle.bodyWidth / 2,
            y: Y_AXIS - currentCandle.bodyHeight / 2
        };

        var candlePoint3 = {
            x: X_AXIS + currentCandle.bodyWidth / 2,
            y: Y_AXIS + currentCandle.bodyHeight / 2
        };

        var candlePoint4 = {
            x: X_AXIS - currentCandle.bodyWidth / 2,
            y: Y_AXIS + currentCandle.bodyHeight / 2 
        };


        var stickPoint1 = {
            x: X_AXIS - currentCandle.stickWidth / 2,
            y: candlePoint1.y - currentCandle.stickStart
        };

        var stickPoint2 = {
            x: X_AXIS + currentCandle.stickWidth / 2,
            y: candlePoint1.y - currentCandle.stickStart
        };

        var stickPoint3 = {
            x: X_AXIS + currentCandle.stickWidth / 2,
            y: candlePoint1.y - currentCandle.stickStart + currentCandle.stickHeight 
        };

        var stickPoint4 = {
            x: X_AXIS - currentCandle.stickWidth / 2,
            y: candlePoint1.y - currentCandle.stickStart + currentCandle.stickHeight 
        };


        /* Extra bounderies due to constrained space */

        const upperLimit = frameTitleHeight + frameBodyHeight * 0.15;
        const downLimit = frameTitleHeight + frameBodyHeight * 0.85;

        if (candlePoint1.y < upperLimit) {

            candlePoint1.y = upperLimit;
            candlePoint2.y = upperLimit;

        }

        if (stickPoint1.y < upperLimit) {

            stickPoint1.y = upperLimit;
            stickPoint2.y = upperLimit;

        }

        if (candlePoint3.y < upperLimit) {

            candlePoint3.y = upperLimit;
            candlePoint4.y = upperLimit;

        }

        if (stickPoint3.y < upperLimit) {

            stickPoint3.y = upperLimit;
            stickPoint4.y = upperLimit;

        }

        if (candlePoint1.y > downLimit) {

            candlePoint1.y = downLimit;
            candlePoint2.y = downLimit;

        }

        if (stickPoint1.y > downLimit) {

            stickPoint1.y = downLimit;
            stickPoint2.y = downLimit;

        }

        if (candlePoint3.y > downLimit) {

            candlePoint3.y = downLimit;
            candlePoint4.y = downLimit;

        }

        if (stickPoint3.y > downLimit) {

            stickPoint3.y = downLimit;
            stickPoint4.y = downLimit;

        }


        candlePoint1 = currentCandlePanel.container.frame.frameThisPoint(candlePoint1);
        candlePoint2 = currentCandlePanel.container.frame.frameThisPoint(candlePoint2);
        candlePoint3 = currentCandlePanel.container.frame.frameThisPoint(candlePoint3);
        candlePoint4 = currentCandlePanel.container.frame.frameThisPoint(candlePoint4);

        stickPoint1 = currentCandlePanel.container.frame.frameThisPoint(stickPoint1);
        stickPoint2 = currentCandlePanel.container.frame.frameThisPoint(stickPoint2);
        stickPoint3 = currentCandlePanel.container.frame.frameThisPoint(stickPoint3);
        stickPoint4 = currentCandlePanel.container.frame.frameThisPoint(stickPoint4);



        browserCanvasContext.beginPath();

        browserCanvasContext.moveTo(stickPoint1.x, stickPoint1.y);
        browserCanvasContext.lineTo(stickPoint2.x, stickPoint2.y);
        browserCanvasContext.lineTo(stickPoint3.x, stickPoint3.y);
        browserCanvasContext.lineTo(stickPoint4.x, stickPoint4.y);

        browserCanvasContext.closePath();
        browserCanvasContext.fillStyle = 'rgba(54, 54, 54, 1)';
        browserCanvasContext.fill();

        browserCanvasContext.lineWidth = 1;
        browserCanvasContext.stroke();

        browserCanvasContext.beginPath();

        browserCanvasContext.moveTo(candlePoint1.x, candlePoint1.y);
        browserCanvasContext.lineTo(candlePoint2.x, candlePoint2.y);
        browserCanvasContext.lineTo(candlePoint3.x, candlePoint3.y);
        browserCanvasContext.lineTo(candlePoint4.x, candlePoint4.y);

        browserCanvasContext.closePath();

        const OPACITY = '1';

        if (currentCandle.innerCandle.direction === 'up') { browserCanvasContext.strokeStyle = 'rgba(27, 105, 7, ' + OPACITY + ')'; }
        if (currentCandle.innerCandle.direction === 'down') { browserCanvasContext.strokeStyle = 'rgba(130, 9, 9, ' + OPACITY + ')'; }
        if (currentCandle.innerCandle.direction === 'side') { browserCanvasContext.strokeStyle = 'rgba(27, 7, 105, ' + OPACITY + ')'; }

        if (currentCandle.innerCandle.direction === 'up') { browserCanvasContext.fillStyle = 'rgba(64, 217, 26, ' + OPACITY + ')'; }
        if (currentCandle.innerCandle.direction === 'down') { browserCanvasContext.fillStyle = 'rgba(219, 18, 18, ' + OPACITY + ')'; }
        if (currentCandle.innerCandle.direction === 'side') { browserCanvasContext.fillStyle = 'rgba(64, 26, 217, ' + OPACITY + ')'; }

        browserCanvasContext.fill();

        browserCanvasContext.lineWidth = 1;
        browserCanvasContext.stroke();


        browserCanvasContext.beginPath();

        /* put the labels with the candles values */

        


        let y;

        printLabel('High', X_AXIS, frameTitleHeight + frameBodyHeight * 0.05, '1');
        printLabel(currentCandle.innerCandle.max, X_AXIS, frameTitleHeight + frameBodyHeight * 0.10, '0.50');

        printLabel('Low', X_AXIS, frameTitleHeight + frameBodyHeight * 0.95, '1');
        printLabel(currentCandle.innerCandle.min, X_AXIS, frameTitleHeight + frameBodyHeight * 0.90, '0.50');


        y = Y_AXIS - currentCandle.bodyHeight / 2;

        if (y < frameTitleHeight + frameBodyHeight * 0.15) { y = frameTitleHeight + frameBodyHeight * 0.15; }
        if (y > frameTitleHeight + frameBodyHeight * 0.80) { y = frameTitleHeight + frameBodyHeight * 0.80; }

        printLabel('Open', X_AXIS * 1 / 2, y  , '1');
        printLabel(currentCandle.innerCandle.open, X_AXIS * 1 / 2, y + frameBodyHeight * 0.05, '0.50');

        y = Y_AXIS + currentCandle.bodyHeight / 2;

        if (y < frameTitleHeight + frameBodyHeight * 0.15) { y = frameTitleHeight + frameBodyHeight * 0.15; }
        if (y > frameTitleHeight + frameBodyHeight * 0.80) { y = frameTitleHeight + frameBodyHeight * 0.80; }

        printLabel('Close', X_AXIS * 3 / 2, y , '1');
        printLabel(currentCandle.innerCandle.close, X_AXIS * 3 / 2, y  + frameBodyHeight * 0.05, '0.50');

       

        function printLabel(labelToPrint, x, y, opacity) {

            let labelPoint;
            let fontSize = 10;

            browserCanvasContext.font = fontSize + 'px Courier New';

            let label = '' + labelToPrint;

            let xOffset = label.length / 2 * fontSize * FONT_ASPECT_RATIO;

            labelPoint = {
                x: x - xOffset,
                y: y
            };

            labelPoint = currentCandlePanel.container.frame.frameThisPoint(labelPoint);

            browserCanvasContext.fillStyle = 'rgba(60, 60, 60, ' + opacity + ')';
            browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y);

        }

        browserCanvasContext.closePath();
        browserCanvasContext.fill();

    }


}

