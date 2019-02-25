
function newAAMastersPlottersTradingSimulationTradingSimulationTradingSimulationPanel () {

    var thisObject = {
        onEventRaised: onEventRaised,
        container: undefined,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    thisObject.container = container;

    container.displacement.containerName = "Simulated Records Panel";
    container.frame.containerName = "Simulated Records Panel";

    let currentRecord;

    return thisObject;

    function initialize() {

        thisObject.container.frame.width = UI_PANEL.WIDTH.NORMAL;
        thisObject.container.frame.height = UI_PANEL.HEIGHT.NORMAL * 1.5;

        thisObject.container.frame.position.x = viewPort.visibleArea.topRight.x - thisObject.container.frame.width * 1;
        thisObject.container.frame.position.y = viewPort.visibleArea.topRight.y;

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


    function onEventRaised(lastCurrentRecord) {

        currentRecord = lastCurrentRecord;

    }


    function draw() {

        this.container.frame.draw(false, false, true);

        plotCurrentRecordInfo();

    }


    function plotCurrentRecordInfo() {

        if (currentRecord === undefined) { return; }
        if (currentRecord.innerRecord === undefined) { return; }

        const frameBodyHeight = thisObject.container.frame.getBodyHeight();
        const frameTitleHeight = thisObject.container.frame.height - frameBodyHeight;

        const X_AXIS = thisObject.container.frame.width / 2;
        const Y_AXIS = frameTitleHeight + frameBodyHeight / 2;

        var recordPoint1 = {
            x: X_AXIS - currentRecord.bodyWidth / 2,
            y: Y_AXIS - currentRecord.leftBodyHeight / 2 - currentRecord.bottomDelta / 4
        };

        var recordPoint2 = {
            x: X_AXIS - currentRecord.bodyWidth / 2,
            y: Y_AXIS + currentRecord.leftBodyHeight / 2 - currentRecord.topDelta / 4
        };

        var recordPoint3 = {
            x: X_AXIS + currentRecord.bodyWidth / 2,
            y: Y_AXIS + currentRecord.rightBodyHeight / 2 + currentRecord.topDelta / 4
        };

        var recordPoint4 = {
            x: X_AXIS + currentRecord.bodyWidth / 2,
            y: Y_AXIS - currentRecord.rightBodyHeight / 2 + currentRecord.bottomDelta / 4
        };



        /* Extra bounderies due to constrained space */

        const upperLimit = frameTitleHeight + frameBodyHeight * 0.15;
        const downLimit = frameTitleHeight + frameBodyHeight * 0.85;

        if (recordPoint1.y > downLimit) { recordPoint1.y = downLimit; }
        if (recordPoint4.y > downLimit) { recordPoint4.y = downLimit; }

        if (recordPoint2.y < upperLimit) { recordPoint2.y = upperLimit; }
        if (recordPoint3.y < upperLimit) { recordPoint3.y = upperLimit; }

        recordPoint1 = thisObject.container.frame.frameThisPoint(recordPoint1);
        recordPoint2 = thisObject.container.frame.frameThisPoint(recordPoint2);
        recordPoint3 = thisObject.container.frame.frameThisPoint(recordPoint3);
        recordPoint4 = thisObject.container.frame.frameThisPoint(recordPoint4);

        browserCanvasContext.beginPath();

        browserCanvasContext.moveTo(recordPoint1.x, recordPoint1.y);
        browserCanvasContext.lineTo(recordPoint2.x, recordPoint2.y);
        browserCanvasContext.lineTo(recordPoint3.x, recordPoint3.y);
        browserCanvasContext.lineTo(recordPoint4.x, recordPoint4.y);

        browserCanvasContext.closePath();

        const OPACITY = '0.1';

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', ' + OPACITY + ')';

        browserCanvasContext.fill();

        browserCanvasContext.beginPath();

        browserCanvasContext.moveTo(recordPoint1.x, recordPoint1.y);
        browserCanvasContext.lineTo(recordPoint4.x, recordPoint4.y);
        browserCanvasContext.moveTo(recordPoint2.x, recordPoint2.y);
        browserCanvasContext.lineTo(recordPoint3.x, recordPoint3.y);

        browserCanvasContext.closePath();

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', 1)';

        browserCanvasContext.lineWidth = 0.2;
        browserCanvasContext.stroke();

        browserCanvasContext.beginPath();

        browserCanvasContext.moveTo(recordPoint1.x, recordPoint1.y + (recordPoint2.y - recordPoint1.y) / 2);
        browserCanvasContext.lineTo(recordPoint4.x, recordPoint4.y - (recordPoint4.y - recordPoint3.y) / 2);


        browserCanvasContext.closePath();

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', 1)';

        browserCanvasContext.lineWidth = 0.2;
        browserCanvasContext.stroke();


        browserCanvasContext.beginPath();

        /* put the labels with the records values */




        let y = 0;
        let increment = 0.03;

        y = y + increment;
        printLabel('Balance A', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel(currentRecord.innerRecord.balanceA, X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50');

        y = y + increment;
        printLabel('Balance B', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel(currentRecord.innerRecord.balanceB, X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50');

        y = y + increment;
        printLabel('Profit', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel(currentRecord.innerRecord.profit, X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50');

        y = y + increment;
        printLabel('Last Profit', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel(currentRecord.innerRecord.lastProfit, X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50');

        y = y + increment;
        printLabel('Last Profit %', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel((currentRecord.innerRecord.lastProfitPercent).toFixed(2) + ' % ', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50');

        y = y + increment;
        printLabel('Stop Loss', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel(currentRecord.innerRecord.stopLoss, X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50');

        y = y + increment;
        printLabel('Roundtrips', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel(currentRecord.innerRecord.roundtrips, X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50');

        y = y + increment;
        printLabel('Hits', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel(currentRecord.innerRecord.hits, X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50');

        y = y + increment;
        printLabel('Fails', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel(currentRecord.innerRecord.fails, X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50');

        y = y + increment;
        printLabel('Hit Ratio', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel((currentRecord.innerRecord.hitRatio * 100).toFixed(2) + ' %', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50');

        y = y + increment;
        printLabel('ROI', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel((currentRecord.innerRecord.ROI * 100).toFixed(2) + ' %', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50');

        y = y + increment;
        printLabel('Periods', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel(currentRecord.innerRecord.periods, X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50');

        y = y + increment;
        printLabel('Days', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel(currentRecord.innerRecord.days, X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50');

        y = y + increment;
        printLabel('Anualized Rate of Return', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel((currentRecord.innerRecord.anualizedRateOfReturn * 100).toFixed(2) + ' %', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50');

        function printLabel(labelToPrint, x, y, opacity) {

            let labelPoint;
            let fontSize = 10;

            browserCanvasContext.font = fontSize + 'px ' + UI_FONT.SECONDARY;

            let label = '' + labelToPrint;
            if (isNaN(label) === false) {
                label = Number(label).toLocaleString();
            }
            let xOffset = label.length / 2 * fontSize * FONT_ASPECT_RATIO;

            labelPoint = {
                x: x - xOffset,
                y: y
            };

            labelPoint = thisObject.container.frame.frameThisPoint(labelPoint);

            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK + ', ' + opacity + ')';
            browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y);

        }

        browserCanvasContext.closePath();
        browserCanvasContext.fill();

    }


}

