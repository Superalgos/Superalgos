
function newMastersPlottersCandlesVolumesCandlesCandlePanel() {

    let thisObject = {
        fitFunction: undefined,
        container: undefined,
        isVisible: true,
        onRecordChange: onRecordChange,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize,
        finalize: finalize
    };

    thisObject.container = newContainer();
    thisObject.container.initialize();
    thisObject.container.frame.containerName = "Candle";

    let currentCandle;
    let upDownButton

    return thisObject;

    function finalize() {
        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.fitFunction = undefined
        thisObject.isVisible = undefined

        currentCandle = undefined
        upDownButton.finalize()
        upDownButton = undefined
    }

    function initialize() {

        thisObject.container.frame.width = UI_PANEL.WIDTH.NORMAL;
        thisObject.container.frame.height = UI_PANEL.HEIGHT.NORMAL;

        thisObject.container.frame.position.x = UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.topRight.x - thisObject.container.frame.width * 2;
        thisObject.container.frame.position.y = UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.bottomLeft.y - thisObject.container.frame.height;

        upDownButton = newUpDownButton()
        upDownButton.parentContainer = thisObject.container
        upDownButton.container.frame.parentFrame = thisObject.container.frame
        upDownButton.fitFunction = thisObject.fitFunction
        upDownButton.initialize()
    }

    function getContainer(point) {
        if (thisObject.isVisible !== true) { return }
        let container;

        container = upDownButton.getContainer(point)
        if (container !== undefined) { return container }

        if (thisObject.container.frame.isThisPointHere(point, true) === true) {

            let checkPoint = {
                x: point.x,
                y: point.y
            }

            checkPoint = thisObject.fitFunction(checkPoint)

            if (point.x === checkPoint.x && point.y === checkPoint.y) {
                return thisObject.container;
            }
        }
    }


    function onRecordChange(lastCurrentCandle) {

        currentCandle = lastCurrentCandle;

    }


    function draw() {
        if (thisObject.isVisible !== true) { return }
        thisObject.container.frame.draw(false, false, true, thisObject.fitFunction);

        plotCurrentCandleInfo();

        upDownButton.draw()

    }


    function plotCurrentCandleInfo() {

        if (currentCandle === undefined) { return; }
        if (currentCandle.innerCandle === undefined) { return; }

        const frameBodyHeight = thisObject.container.frame.getBodyHeight();
        const frameTitleHeight = thisObject.container.frame.height - frameBodyHeight;

        const X_AXIS = thisObject.container.frame.width / 2;
        const Y_AXIS = frameTitleHeight + frameBodyHeight / 2;

        let candlePoint1 = {
            x: X_AXIS - currentCandle.bodyWidth / 2,
            y: Y_AXIS - currentCandle.bodyHeight / 2
        };

        let candlePoint2 = {
            x: X_AXIS + currentCandle.bodyWidth / 2,
            y: Y_AXIS - currentCandle.bodyHeight / 2
        };

        let candlePoint3 = {
            x: X_AXIS + currentCandle.bodyWidth / 2,
            y: Y_AXIS + currentCandle.bodyHeight / 2
        };

        let candlePoint4 = {
            x: X_AXIS - currentCandle.bodyWidth / 2,
            y: Y_AXIS + currentCandle.bodyHeight / 2
        };


        let stickPoint1 = {
            x: X_AXIS - currentCandle.stickWidth / 2,
            y: candlePoint1.y - currentCandle.stickStart
        };

        let stickPoint2 = {
            x: X_AXIS + currentCandle.stickWidth / 2,
            y: candlePoint1.y - currentCandle.stickStart
        };

        let stickPoint3 = {
            x: X_AXIS + currentCandle.stickWidth / 2,
            y: candlePoint1.y - currentCandle.stickStart + currentCandle.stickHeight
        };

        let stickPoint4 = {
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

        const leftLimit = thisObject.container.frame.width * 0.42;
        const rightLimit = thisObject.container.frame.width * 0.58;

        if (candlePoint1.x < leftLimit) {

            candlePoint1.x = leftLimit;
            candlePoint4.x = leftLimit;

        }

        if (stickPoint1.x < leftLimit) {

            stickPoint1.x = leftLimit;
            stickPoint4.x = leftLimit;

        }

        if (candlePoint4.x < leftLimit) {

            candlePoint4.x = leftLimit;
            candlePoint1.x = leftLimit;

        }

        if (stickPoint4.x < leftLimit) {

            stickPoint4.x = leftLimit;
            stickPoint1.x = leftLimit;

        }

        if (candlePoint2.x > rightLimit) {

            candlePoint2.x = rightLimit;
            candlePoint3.x = rightLimit;

        }

        if (stickPoint2.x > rightLimit) {

            stickPoint2.x = rightLimit;
            stickPoint3.x = rightLimit;

        }

        if (candlePoint3.x > rightLimit) {

            candlePoint3.x = rightLimit;
            candlePoint2.x = rightLimit;

        }

        if (stickPoint3.x > rightLimit) {

            stickPoint3.x = rightLimit;
            stickPoint2.x = rightLimit;

        }


        candlePoint1 = thisObject.container.frame.frameThisPoint(candlePoint1);
        candlePoint2 = thisObject.container.frame.frameThisPoint(candlePoint2);
        candlePoint3 = thisObject.container.frame.frameThisPoint(candlePoint3);
        candlePoint4 = thisObject.container.frame.frameThisPoint(candlePoint4);

        candlePoint1 = thisObject.fitFunction(candlePoint1)
        candlePoint2 = thisObject.fitFunction(candlePoint2)
        candlePoint3 = thisObject.fitFunction(candlePoint3)
        candlePoint4 = thisObject.fitFunction(candlePoint4)

        stickPoint1 = thisObject.container.frame.frameThisPoint(stickPoint1);
        stickPoint2 = thisObject.container.frame.frameThisPoint(stickPoint2);
        stickPoint3 = thisObject.container.frame.frameThisPoint(stickPoint3);
        stickPoint4 = thisObject.container.frame.frameThisPoint(stickPoint4);

        stickPoint1 = thisObject.fitFunction(stickPoint1)
        stickPoint2 = thisObject.fitFunction(stickPoint2)
        stickPoint3 = thisObject.fitFunction(stickPoint3)
        stickPoint4 = thisObject.fitFunction(stickPoint4)

        browserCanvasContext.beginPath();

        browserCanvasContext.moveTo(stickPoint1.x, stickPoint1.y);
        browserCanvasContext.lineTo(stickPoint2.x, stickPoint2.y);
        browserCanvasContext.lineTo(stickPoint3.x, stickPoint3.y);
        browserCanvasContext.lineTo(stickPoint4.x, stickPoint4.y);

        browserCanvasContext.closePath();
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK + ', 1)';
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

        if (currentCandle.innerCandle.direction === 'up') { browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', ' + OPACITY + ')'; }
        if (currentCandle.innerCandle.direction === 'down') { browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RED + ', ' + OPACITY + ')'; }
        if (currentCandle.innerCandle.direction === 'side') { browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.DARK + ', ' + OPACITY + ')'; }

        if (currentCandle.innerCandle.direction === 'up') { browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.GREEN + ', ' + OPACITY + ')'; }
        if (currentCandle.innerCandle.direction === 'down') { browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + OPACITY + ')'; }
        if (currentCandle.innerCandle.direction === 'side') { browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK + ', ' + OPACITY + ')'; }

        browserCanvasContext.fill();

        browserCanvasContext.lineWidth = 1;
        browserCanvasContext.stroke();

        /* put the labels with the candles values */

        let y;

        UI.projects.superalgos.utilities.drawPrint.printLabel('Max', undefined, undefined, X_AXIS, frameTitleHeight + frameBodyHeight * 0.05, '0.60', undefined, undefined, 'Center', thisObject.container, thisObject.fitFunction);
        UI.projects.superalgos.utilities.drawPrint.printLabel(currentCandle.innerCandle.max, undefined, undefined, X_AXIS, frameTitleHeight + frameBodyHeight * 0.10, '1.00', 15, undefined, 'Center', thisObject.container, thisObject.fitFunction);

        UI.projects.superalgos.utilities.drawPrint.printLabel('Min', undefined, undefined, X_AXIS, frameTitleHeight + frameBodyHeight * 0.95, '0.60', undefined, undefined, 'Center', thisObject.container, thisObject.fitFunction);
        UI.projects.superalgos.utilities.drawPrint.printLabel(currentCandle.innerCandle.min, undefined, undefined, X_AXIS, frameTitleHeight + frameBodyHeight * 0.90, '1.00', 15, undefined, 'Center', thisObject.container, thisObject.fitFunction);

        y = Y_AXIS - currentCandle.bodyHeight / 2;

        if (y < frameTitleHeight + frameBodyHeight * 0.15) { y = frameTitleHeight + frameBodyHeight * 0.15; }
        if (y > frameTitleHeight + frameBodyHeight * 0.80) { y = frameTitleHeight + frameBodyHeight * 0.80; }

        UI.projects.superalgos.utilities.drawPrint.printLabel('Open', undefined, undefined, X_AXIS * 2 / 5, y, '0.60', undefined, undefined, 'Center', thisObject.container, thisObject.fitFunction);
        UI.projects.superalgos.utilities.drawPrint.printLabel(currentCandle.innerCandle.open, undefined, undefined, X_AXIS * 2 / 5, y + frameBodyHeight * 0.05, '1.00', 15, undefined, 'Center', thisObject.container, thisObject.fitFunction);

        y = Y_AXIS + currentCandle.bodyHeight / 2;

        if (y < frameTitleHeight + frameBodyHeight * 0.15) { y = frameTitleHeight + frameBodyHeight * 0.15; }
        if (y > frameTitleHeight + frameBodyHeight * 0.80) { y = frameTitleHeight + frameBodyHeight * 0.80; }

        UI.projects.superalgos.utilities.drawPrint.printLabel('Close', undefined, undefined, X_AXIS * 7 / 5, y, '0.60', undefined, undefined, 'Center', thisObject.container, thisObject.fitFunction);
        UI.projects.superalgos.utilities.drawPrint.printLabel(currentCandle.innerCandle.close, undefined, undefined, X_AXIS * 7 / 5, y + frameBodyHeight * 0.05, '1.00', 15, undefined, 'Center', thisObject.container, thisObject.fitFunction);

    }
}


