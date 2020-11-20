
function newMastersPlottersBollingerBandsBollingerBandsBollingerBandsPanel() {

    var thisObject = {
        fitFunction: undefined,
        onRecordChange: onRecordChange,
        container: undefined,
        isVisible: true,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize,
        finalize: finalize
    };

    thisObject.container = newContainer();
    thisObject.container.initialize();
    thisObject.container.frame.containerName = "Bollinger Band";

    let currentBand;
    let upDownButton

    return thisObject;

    function finalize() {
        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.fitFunction = undefined
        thisObject.isVisible = undefined

        currentBand = undefined
        upDownButton.finalize()
        upDownButton = undefined
    }

    function initialize() {

        thisObject.container.frame.width = UI_PANEL.WIDTH.NORMAL;
        thisObject.container.frame.height = UI_PANEL.HEIGHT.NORMAL;

        thisObject.container.frame.position.x = UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.topRight.x - thisObject.container.frame.width * 3;
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


    function onRecordChange(lastCurrentBand) {

        currentBand = lastCurrentBand;

    }


    function draw() {
        if (thisObject.isVisible !== true) { return }
        thisObject.container.frame.draw(false, false, true, thisObject.fitFunction);

        plotCurrentBandInfo();

        upDownButton.draw()
    }


    function plotCurrentBandInfo() {

        if (currentBand === undefined) { return; }
        if (currentBand.innerBand === undefined) { return; }

        const frameBodyHeight = thisObject.container.frame.getBodyHeight();
        const frameTitleHeight = thisObject.container.frame.height - frameBodyHeight;

        const X_AXIS = thisObject.container.frame.width / 2;
        const Y_AXIS = frameTitleHeight + frameBodyHeight / 2;

        var bandPoint1 = {
            x: X_AXIS - currentBand.bodyWidth / 2,
            y: Y_AXIS - currentBand.leftBodyHeight / 2 - currentBand.bottomDelta / 4
        };

        var bandPoint2 = {
            x: X_AXIS - currentBand.bodyWidth / 2,
            y: Y_AXIS + currentBand.leftBodyHeight / 2 - currentBand.topDelta / 4
        };

        var bandPoint3 = {
            x: X_AXIS + currentBand.bodyWidth / 2,
            y: Y_AXIS + currentBand.rightBodyHeight / 2 + currentBand.topDelta / 4
        };

        var bandPoint4 = {
            x: X_AXIS + currentBand.bodyWidth / 2,
            y: Y_AXIS - currentBand.rightBodyHeight / 2 + currentBand.bottomDelta / 4
        };

        /* Extra bounderies due to constrained space */

        const upperLimit = frameTitleHeight + frameBodyHeight * 0.25;
        const downLimit = frameTitleHeight + frameBodyHeight * 0.75;

        if (bandPoint1.y > downLimit) { bandPoint1.y = downLimit; }
        if (bandPoint4.y > downLimit) { bandPoint4.y = downLimit; }

        if (bandPoint2.y < upperLimit) { bandPoint2.y = upperLimit; }
        if (bandPoint3.y < upperLimit) { bandPoint3.y = upperLimit; }

        const leftLimit = thisObject.container.frame.width * 0.40;
        const rightLimit = thisObject.container.frame.width * 0.60;

        if (bandPoint1.x < leftLimit) { bandPoint1.x = leftLimit; }
        if (bandPoint2.x < leftLimit) { bandPoint2.x = leftLimit; }

        if (bandPoint3.x > rightLimit) { bandPoint3.x = rightLimit; }
        if (bandPoint4.x > rightLimit) { bandPoint4.x = rightLimit; }

        bandPoint1 = thisObject.container.frame.frameThisPoint(bandPoint1);
        bandPoint2 = thisObject.container.frame.frameThisPoint(bandPoint2);
        bandPoint3 = thisObject.container.frame.frameThisPoint(bandPoint3);
        bandPoint4 = thisObject.container.frame.frameThisPoint(bandPoint4);

        bandPoint1 = thisObject.fitFunction(bandPoint1)
        bandPoint2 = thisObject.fitFunction(bandPoint2)
        bandPoint3 = thisObject.fitFunction(bandPoint3)
        bandPoint4 = thisObject.fitFunction(bandPoint4)

        browserCanvasContext.beginPath();

        browserCanvasContext.moveTo(bandPoint1.x, bandPoint1.y);
        browserCanvasContext.lineTo(bandPoint2.x, bandPoint2.y);
        browserCanvasContext.lineTo(bandPoint3.x, bandPoint3.y);
        browserCanvasContext.lineTo(bandPoint4.x, bandPoint4.y);

        browserCanvasContext.closePath();

        const OPACITY = '0.1';

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', ' + OPACITY + ')';

        browserCanvasContext.fill();

        browserCanvasContext.beginPath();

        browserCanvasContext.moveTo(bandPoint1.x, bandPoint1.y);
        browserCanvasContext.lineTo(bandPoint4.x, bandPoint4.y);
        browserCanvasContext.moveTo(bandPoint2.x, bandPoint2.y);
        browserCanvasContext.lineTo(bandPoint3.x, bandPoint3.y);

        browserCanvasContext.closePath();

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', 1)';

        browserCanvasContext.lineWidth = 0.2;
        browserCanvasContext.stroke();

        browserCanvasContext.beginPath();

        let y1 = bandPoint1.y + (bandPoint2.y - bandPoint1.y) / 2;
        let y2 = bandPoint4.y - (bandPoint4.y - bandPoint3.y) / 2;

        browserCanvasContext.moveTo(bandPoint1.x, y1);
        browserCanvasContext.lineTo(bandPoint4.x, y2);


        browserCanvasContext.closePath();

        if (y1 > y2) {
            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', 1)';
        } else {
            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', 1)';
        }

        browserCanvasContext.lineWidth = 0.2;
        browserCanvasContext.stroke();

        /* put the labels with the bands values */

        let y;

        if (currentBand.innerBand.direction !== undefined) {
            UI.projects.superalgos.utilities.drawPrint.printLabel('Direction', undefined, undefined, X_AXIS, frameTitleHeight + frameBodyHeight * 0.05, '0.60', undefined, undefined, 'Center', thisObject.container, thisObject.fitFunction);
            UI.projects.superalgos.utilities.drawPrint.printLabel(currentBand.innerBand.direction, undefined, undefined, X_AXIS, frameTitleHeight + frameBodyHeight * 0.10, '1.00', 15, undefined, 'Center', thisObject.container, thisObject.fitFunction);
        }

        UI.projects.superalgos.utilities.drawPrint.printLabel('Moving Average', undefined, undefined, X_AXIS, frameTitleHeight + frameBodyHeight * 0.15, '0.60', undefined, undefined, 'Center', thisObject.container, thisObject.fitFunction);
        UI.projects.superalgos.utilities.drawPrint.printLabel(currentBand.innerBand.movingAverage, undefined, undefined, X_AXIS, frameTitleHeight + frameBodyHeight * 0.20, '1.00', 15, undefined, 'Center', thisObject.container, thisObject.fitFunction, undefined, undefined, 10);

        UI.projects.superalgos.utilities.drawPrint.printLabel('Deviation', undefined, undefined, X_AXIS, frameTitleHeight + frameBodyHeight * 0.85, '0.60', undefined, undefined, 'Center', thisObject.container, thisObject.fitFunction);
        UI.projects.superalgos.utilities.drawPrint.printLabel(currentBand.innerBand.deviation, X_AXIS, frameTitleHeight + frameBodyHeight * 0.80, '1.00', 15, undefined, 'Center', thisObject.container, thisObject.fitFunction, undefined, undefined, 10);

        UI.projects.superalgos.utilities.drawPrint.printLabel('Standard Deviation', undefined, undefined, X_AXIS, frameTitleHeight + frameBodyHeight * 0.95, '0.60', undefined, undefined, 'Center', thisObject.container, thisObject.fitFunction);
        UI.projects.superalgos.utilities.drawPrint.printLabel(currentBand.innerBand.standardDeviation, undefined, undefined, X_AXIS, frameTitleHeight + frameBodyHeight * 0.90, '1.00', 15, undefined, 'Center', thisObject.container, thisObject.fitFunction, undefined, undefined, 10);

    }
}

