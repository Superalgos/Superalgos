
function newCandlesPlottersCandlesVolumesVolumesVolumePanel() {

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
    thisObject.container.frame.containerName = "Volume";

    let currentVolume;
    let upDownButton

    return thisObject;

    function finalize() {
        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.fitFunction = undefined
        thisObject.isVisible = undefined

        currentVolume = undefined
        upDownButton.finalize()
        upDownButton = undefined
    }

    function initialize() {

        thisObject.container.frame.width = UI_PANEL.WIDTH.NORMAL;
        thisObject.container.frame.height = UI_PANEL.HEIGHT.NORMAL;

        thisObject.container.frame.position.x = UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.topRight.x - thisObject.container.frame.width;
        thisObject.container.frame.position.y = UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.bottomLeft.y - thisObject.container.frame.height;

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


    function onRecordChange(lastCurrentVolume) {

        currentVolume = lastCurrentVolume;

    }


    function draw() {
        if (thisObject.isVisible !== true) { return }
        thisObject.container.frame.draw(false, false, true, thisObject.fitFunction);

        plotCurrentVolumeInfo();

        upDownButton.draw()
    }

    function plotCurrentVolumeInfo() {

        if (currentVolume === undefined) { return; }
        if (currentVolume.innerVolumeBar === undefined) { return; }

        const frameBodyHeight = thisObject.container.frame.getBodyHeight();
        const frameTitleHeight = thisObject.container.frame.height - frameBodyHeight;

        const X_AXIS = thisObject.container.frame.width / 2;
        const Y_AXIS_BUY = frameTitleHeight + frameBodyHeight * 0.85;
        const Y_AXIS_SELL = frameTitleHeight + frameBodyHeight * 0.15;

        let buyVolumePoint1 = {
            x: X_AXIS - currentVolume.buyInfo.baseWidth / 2,
            y: Y_AXIS_BUY
        };

        let buyVolumePoint2 = {
            x: X_AXIS - currentVolume.buyInfo.topWidth / 2,
            y: Y_AXIS_BUY + currentVolume.buyInfo.height
        };

        let buyVolumePoint3 = {
            x: X_AXIS + currentVolume.buyInfo.topWidth / 2,
            y: Y_AXIS_BUY + currentVolume.buyInfo.height
        };

        let buyVolumePoint4 = {
            x: X_AXIS + currentVolume.buyInfo.baseWidth / 2,
            y: Y_AXIS_BUY
        };

        /* Extra boundaries due to constrained space */

        const upperLimit = frameTitleHeight + frameBodyHeight * 0.15;
        const downLimit = frameTitleHeight + frameBodyHeight * 0.85;

        const leftLimit = thisObject.container.frame.width * 0.40;
        const rightLimit = thisObject.container.frame.width * 0.60;

        if (buyVolumePoint1.y < downLimit) { buyVolumePoint1.y = downLimit; }
        if (buyVolumePoint4.y < downLimit) { buyVolumePoint4.y = downLimit; }

        if (buyVolumePoint2.y < upperLimit) { buyVolumePoint2.y = upperLimit; }
        if (buyVolumePoint3.y < upperLimit) { buyVolumePoint3.y = upperLimit; }

        if (buyVolumePoint1.x < leftLimit) { buyVolumePoint1.x = leftLimit; }
        if (buyVolumePoint2.x < leftLimit) { buyVolumePoint2.x = leftLimit; }

        if (buyVolumePoint3.x > rightLimit) { buyVolumePoint3.x = rightLimit; }
        if (buyVolumePoint4.x > rightLimit) { buyVolumePoint4.x = rightLimit; }



        buyVolumePoint1 = thisObject.container.frame.fitIntoFrame(buyVolumePoint1);
        buyVolumePoint2 = thisObject.container.frame.fitIntoFrame(buyVolumePoint2);
        buyVolumePoint3 = thisObject.container.frame.fitIntoFrame(buyVolumePoint3);
        buyVolumePoint4 = thisObject.container.frame.fitIntoFrame(buyVolumePoint4);

        buyVolumePoint1 = thisObject.container.frame.frameThisPoint(buyVolumePoint1);
        buyVolumePoint2 = thisObject.container.frame.frameThisPoint(buyVolumePoint2);
        buyVolumePoint3 = thisObject.container.frame.frameThisPoint(buyVolumePoint3);
        buyVolumePoint4 = thisObject.container.frame.frameThisPoint(buyVolumePoint4);

        buyVolumePoint1 = thisObject.fitFunction(buyVolumePoint1)
        buyVolumePoint2 = thisObject.fitFunction(buyVolumePoint2)
        buyVolumePoint3 = thisObject.fitFunction(buyVolumePoint3)
        buyVolumePoint4 = thisObject.fitFunction(buyVolumePoint4)

        let sellVolumePoint1 = {
            x: X_AXIS - currentVolume.buyInfo.baseWidth / 2,
            y: Y_AXIS_SELL
        };

        let sellVolumePoint2 = {
            x: X_AXIS - currentVolume.buyInfo.topWidth / 2,
            y: Y_AXIS_SELL + currentVolume.sellInfo.height
        };

        let sellVolumePoint3 = {
            x: X_AXIS + currentVolume.buyInfo.topWidth / 2,
            y: Y_AXIS_SELL + currentVolume.sellInfo.height
        };

        let sellVolumePoint4 = {
            x: X_AXIS + currentVolume.buyInfo.baseWidth / 2,
            y: Y_AXIS_SELL
        };

        if (sellVolumePoint1.y < upperLimit) { sellVolumePoint1.y = upperLimit; }
        if (sellVolumePoint4.y < upperLimit) { sellVolumePoint4.y = upperLimit; }

        if (sellVolumePoint2.y > downLimit) { sellVolumePoint2.y = downLimit; }
        if (sellVolumePoint3.y > downLimit) { sellVolumePoint3.y = downLimit; }

        if (sellVolumePoint1.x < leftLimit) { sellVolumePoint1.x = leftLimit; }
        if (sellVolumePoint2.x < leftLimit) { sellVolumePoint2.x = leftLimit; }

        if (sellVolumePoint3.x > rightLimit) { sellVolumePoint3.x = rightLimit; }
        if (sellVolumePoint4.x > rightLimit) { sellVolumePoint4.x = rightLimit; }

        sellVolumePoint1 = thisObject.container.frame.fitIntoFrame(sellVolumePoint1);
        sellVolumePoint2 = thisObject.container.frame.fitIntoFrame(sellVolumePoint2);
        sellVolumePoint3 = thisObject.container.frame.fitIntoFrame(sellVolumePoint3);
        sellVolumePoint4 = thisObject.container.frame.fitIntoFrame(sellVolumePoint4);

        sellVolumePoint1 = thisObject.container.frame.frameThisPoint(sellVolumePoint1);
        sellVolumePoint2 = thisObject.container.frame.frameThisPoint(sellVolumePoint2);
        sellVolumePoint3 = thisObject.container.frame.frameThisPoint(sellVolumePoint3);
        sellVolumePoint4 = thisObject.container.frame.frameThisPoint(sellVolumePoint4);

        sellVolumePoint1 = thisObject.fitFunction(sellVolumePoint1)
        sellVolumePoint2 = thisObject.fitFunction(sellVolumePoint2)
        sellVolumePoint3 = thisObject.fitFunction(sellVolumePoint3)
        sellVolumePoint4 = thisObject.fitFunction(sellVolumePoint4)



        const OPACITY = '0.40';

        browserCanvasContext.beginPath();

        browserCanvasContext.moveTo(buyVolumePoint1.x, buyVolumePoint1.y);
        browserCanvasContext.lineTo(buyVolumePoint2.x, buyVolumePoint2.y);
        browserCanvasContext.lineTo(buyVolumePoint3.x, buyVolumePoint3.y);
        browserCanvasContext.lineTo(buyVolumePoint4.x, buyVolumePoint4.y);

        browserCanvasContext.closePath();

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', ' + OPACITY + ')';
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.GREEN + ', ' + OPACITY + ')';

        browserCanvasContext.fill();

        browserCanvasContext.lineWidth = 1;
        browserCanvasContext.stroke();


        browserCanvasContext.beginPath();

        browserCanvasContext.moveTo(sellVolumePoint1.x, sellVolumePoint1.y);
        browserCanvasContext.lineTo(sellVolumePoint2.x, sellVolumePoint2.y);
        browserCanvasContext.lineTo(sellVolumePoint3.x, sellVolumePoint3.y);
        browserCanvasContext.lineTo(sellVolumePoint4.x, sellVolumePoint4.y);

        browserCanvasContext.closePath();

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RED + ', ' + OPACITY + ')';
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + OPACITY + ')';

        browserCanvasContext.fill();

        browserCanvasContext.lineWidth = 1;
        browserCanvasContext.stroke();

        /* put the labels with the volumes values */

        UI.projects.foundations.utilities.drawPrint.printLabel('Buy Volume', undefined, undefined, X_AXIS, frameTitleHeight + frameBodyHeight * 0.95, '0.60', undefined, undefined, 'Center', thisObject.container, thisObject.fitFunction);
        UI.projects.foundations.utilities.drawPrint.printLabel(currentVolume.innerVolumeBar.amountBuy, undefined, undefined, X_AXIS, frameTitleHeight + frameBodyHeight * 0.90, '1.00', 15, undefined, 'Center', thisObject.container, thisObject.fitFunction);

        UI.projects.foundations.utilities.drawPrint.printLabel('Sell Volume', undefined, undefined, X_AXIS, frameTitleHeight + frameBodyHeight * 0.05, '0.60', undefined, undefined, 'Center', thisObject.container, thisObject.fitFunction);
        UI.projects.foundations.utilities.drawPrint.printLabel(currentVolume.innerVolumeBar.amountSell, undefined, undefined, X_AXIS, frameTitleHeight + frameBodyHeight * 0.10, '1.00', 15, undefined, 'Center', thisObject.container, thisObject.fitFunction);

    }


}

