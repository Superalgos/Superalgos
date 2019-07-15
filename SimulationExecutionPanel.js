
function newAAMastersPlottersTradingSimulationSimulationExecutionSimulationExecutionPanel() {


    let thisObject = {
        fitFunction: undefined,
        container: undefined,
        onEventRaised: onEventRaised,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize
    };

    let container = newContainer();
    container.initialize();
    thisObject.container = container;

    container.displacement.containerName = "Trading Execution";
    container.frame.containerName = "Trading Execution";

    let currentRecord;
    let panelTabButton

    return thisObject;

    function initialize() {

        thisObject.container.frame.width = UI_PANEL.WIDTH.NORMAL;
        thisObject.container.frame.height = UI_PANEL.HEIGHT.NORMAL * 2;

        thisObject.container.frame.position.x = viewPort.visibleArea.topLeft.x + thisObject.container.frame.width * 4;
        thisObject.container.frame.position.y = viewPort.visibleArea.topRight.y;

        panelTabButton = newPanelTabButton()
        panelTabButton.parentContainer = thisObject.container
        panelTabButton.container.frame.parentFrame = thisObject.container.frame
        panelTabButton.fitFunction = thisObject.fitFunction
        panelTabButton.initialize()
    }

    function getContainer(point) {

        let container;

        container = panelTabButton.getContainer(point)
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


    function onEventRaised(lastCurrentCandle) {

        currentRecord = lastCurrentCandle;

    }


    function draw() {

        thisObject.container.frame.draw(false, false, true, thisObject.fitFunction);

        plot();

        panelTabButton.draw()

    }


    function plot() {

        if (currentRecord === undefined) { return; }

        const frameBodyHeight = thisObject.container.frame.getBodyHeight();
        const frameTitleHeight = thisObject.container.frame.height - frameBodyHeight;

        const X_AXIS = thisObject.container.frame.width / 2;
        const Y_AXIS = frameTitleHeight + frameBodyHeight / 2;

        record = currentRecord

        point = {
            x: X_AXIS,
            y: Y_AXIS
        };

        point = thisObject.container.frame.frameThisPoint(point);
        point = thisObject.fitFunction(point);

        let isCurrentRecord = true;

        let radius = 2;
        let currentRadius = 10
        let opacity = '1';

        /* Draw a red inverted triangle on exec sell */
        if (record.sellExecRate > 0) {

            opacity = '1';

            let point1 = {
                x: X_AXIS,
                y: Y_AXIS
            };

            let point2 = {
                x: X_AXIS + record.timePeriod / 4,
                y: Y_AXIS
            };

            let point3 = {
                x: X_AXIS - record.timePeriod / 4,
                y: Y_AXIS
            };

            point1 = thisObject.container.frame.frameThisPoint(point1);
            point1 = thisObject.fitFunction(point1);

            point2 = thisObject.container.frame.frameThisPoint(point2);
            point2 = thisObject.fitFunction(point2);

            point3 = thisObject.container.frame.frameThisPoint(point3);
            point3 = thisObject.fitFunction(point3);

            let diff = point2.x - point3.x;
            point2.y = point2.y - diff;
            point3.y = point3.y - diff;

            point2 = viewPort.fitIntoVisibleArea(point2);
            point3 = viewPort.fitIntoVisibleArea(point3);

            browserCanvasContext.beginPath();

            browserCanvasContext.moveTo(point1.x, point1.y);
            browserCanvasContext.lineTo(point2.x, point2.y);
            browserCanvasContext.lineTo(point3.x, point3.y);
            browserCanvasContext.lineTo(point1.x, point1.y);

            browserCanvasContext.closePath();

            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + opacity + ')';

            if (isCurrentRecord === false) {
                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RED + ', ' + opacity + ')';
            } else {
                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + opacity + ')';  /* highlight the current record */
            }

            browserCanvasContext.fill();

            browserCanvasContext.setLineDash([0, 0])
            browserCanvasContext.stroke();

        }

        /* Draw a green triangle on exec buy */
        if (record.buyExecRate > 0) {

            opacity = '1';

            let point1 = {
                x: X_AXIS,
                y: Y_AXIS
            };

            let point2 = {
                x: X_AXIS + record.timePeriod / 4,
                y: Y_AXIS
            };

            let point3 = {
                x: X_AXIS - record.timePeriod / 4,
                y: Y_AXIS
            };

            point1 = thisObject.container.frame.frameThisPoint(point1);
            point1 = thisObject.fitFunction(point1);

            point2 = thisObject.container.frame.frameThisPoint(point2);
            point2 = thisObject.fitFunction(point2);

            point3 = thisObject.container.frame.frameThisPoint(point3);
            point3 = thisObject.fitFunction(point3);

            let diff = point2.x - point3.x;
            point2.y = point2.y + diff;
            point3.y = point3.y + diff;

            point2 = viewPort.fitIntoVisibleArea(point2);
            point3 = viewPort.fitIntoVisibleArea(point3);

            browserCanvasContext.beginPath();

            browserCanvasContext.moveTo(point1.x, point1.y);
            browserCanvasContext.lineTo(point2.x, point2.y);
            browserCanvasContext.lineTo(point3.x, point3.y);
            browserCanvasContext.lineTo(point1.x, point1.y);

            browserCanvasContext.closePath();

            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.GREEN + ', ' + opacity + ')';

            if (isCurrentRecord === false) {
                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', ' + opacity + ')';
            } else {
                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + opacity + ')';  /* highlight the current record */
            }

            browserCanvasContext.fill();

            browserCanvasContext.setLineDash([0, 0])
            browserCanvasContext.stroke();
        }

        /* Draw a red inverted triangle on sell */
        if (record.lastSellRate > 0) {
            opacity = '1';

            let point1 = {
                x: X_AXIS,
                y: Y_AXIS
            };

            let point2 = {
                x: X_AXIS + record.timePeriod / 4,
                y: Y_AXIS
            };

            let point3 = {
                x: X_AXIS - record.timePeriod / 4,
                y: Y_AXIS
            };

            point1 = thisObject.container.frame.frameThisPoint(point1);
            point1 = thisObject.fitFunction(point1);

            point2 = thisObject.container.frame.frameThisPoint(point2);
            point2 = thisObject.fitFunction(point2);

            point3 = thisObject.container.frame.frameThisPoint(point3);
            point3 = thisObject.fitFunction(point3);

            let diff = point2.x - point3.x;
            point2.y = point2.y - diff;
            point3.y = point3.y - diff;

            point2 = viewPort.fitIntoVisibleArea(point2);
            point3 = viewPort.fitIntoVisibleArea(point3);

            browserCanvasContext.beginPath();

            browserCanvasContext.moveTo(point1.x, point1.y);
            browserCanvasContext.lineTo(point2.x, point2.y);
            browserCanvasContext.lineTo(point3.x, point3.y);
            browserCanvasContext.lineTo(point1.x, point1.y);

            browserCanvasContext.closePath();

            if (isCurrentRecord === false) {
                browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + opacity + ')';
            } else {
                browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + opacity + ')';  /* highlight the current record */
            }

            browserCanvasContext.fill();

            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RED + ', ' + opacity + ')';
            browserCanvasContext.setLineDash([0, 0])
            browserCanvasContext.stroke();
        }

        /* Draw a green triangle on buy */
        if (record.lastBuyRate > 0) {

            opacity = '1';

            let point1 = {
                x: X_AXIS,
                y: Y_AXIS
            };

            let point2 = {
                x: X_AXIS + record.timePeriod / 4,
                y: Y_AXIS
            };

            let point3 = {
                x: X_AXIS - record.timePeriod / 4,
                y: Y_AXIS
            };

            point1 = thisObject.container.frame.frameThisPoint(point1);
            point1 = thisObject.fitFunction(point1);

            point2 = thisObject.container.frame.frameThisPoint(point2);
            point2 = thisObject.fitFunction(point2);

            point3 = thisObject.container.frame.frameThisPoint(point3);
            point3 = thisObject.fitFunction(point3);

            let diff = point2.x - point3.x;
            point2.y = point2.y + diff;
            point3.y = point3.y + diff;

            point2 = viewPort.fitIntoVisibleArea(point2);
            point3 = viewPort.fitIntoVisibleArea(point3);

            browserCanvasContext.beginPath();

            browserCanvasContext.moveTo(point1.x, point1.y);
            browserCanvasContext.lineTo(point2.x, point2.y);
            browserCanvasContext.lineTo(point3.x, point3.y);
            browserCanvasContext.lineTo(point1.x, point1.y);

            browserCanvasContext.closePath();

            if (isCurrentRecord === false) {
                browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + opacity + ')';
            } else {
                browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + opacity + ')';  /* highlight the current record */
            }

            browserCanvasContext.fill();

            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', ' + opacity + ')';
            browserCanvasContext.setLineDash([0, 0])
            browserCanvasContext.stroke();
        }

        browserCanvasContext.lineWidth = 0.25;

        /* Outer Circle */

        if (isCurrentRecord === true) {

            browserCanvasContext.beginPath();

            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + opacity + ')';

            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + opacity + ')';  /* highlight the current record */

            browserCanvasContext.arc(point.x, point.y, currentRadius, 0, Math.PI * 2, true);
            browserCanvasContext.closePath();

            if (point.x < viewPort.visibleArea.topLeft.x + 50 || point.x > viewPort.visibleArea.bottomRight.x - 50) {/*we leave this history without fill. */ } else {
                browserCanvasContext.fill();
            }
            browserCanvasContext.setLineDash([0, 0])
            browserCanvasContext.stroke();
        }

        /* Inner Circle */

        browserCanvasContext.beginPath();

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + opacity + ')';

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.GOLDEN_ORANGE + ', ' + opacity + ')';

        browserCanvasContext.arc(point.x, point.y, radius, 0, Math.PI * 2, true);
        browserCanvasContext.closePath();

        if (point.x < viewPort.visibleArea.topLeft.x + 50 || point.x > viewPort.visibleArea.bottomRight.x - 50) {/*we leave this history without fill. */ } else {
            browserCanvasContext.fill();
        }
        browserCanvasContext.setLineDash([0, 0])
        browserCanvasContext.stroke();

        /* put the labels  */

        browserCanvasContext.beginPath();

        let y;
        let recordDate = new Date(currentRecord.datetime)

        printLabel('Market Rate', X_AXIS, frameTitleHeight + frameBodyHeight * 0.05 / 2, '1');
        printLabel(currentRecord.marketRate, X_AXIS, frameTitleHeight + frameBodyHeight * 0.10 / 2, '0.50');

        printLabel('Sell Rate', X_AXIS, frameTitleHeight + frameBodyHeight * 0.15 / 2, '1');
        printLabel(currentRecord.lastSellRate, X_AXIS, frameTitleHeight + frameBodyHeight * 0.20 / 2, '0.50');

        printLabel('Sell Executed Rate', X_AXIS, frameTitleHeight + frameBodyHeight * 0.25 / 2, '1');
        printLabel(currentRecord.sellExecRate, X_AXIS, frameTitleHeight + frameBodyHeight * 0.30 / 2, '0.50');

        printLabel('Buy Rate', X_AXIS, frameTitleHeight + frameBodyHeight * 0.35 / 2, '1');
        printLabel(currentRecord.lastBuyRate, X_AXIS, frameTitleHeight + frameBodyHeight * 0.40 / 2, '0.40');

        printLabel('Buy Executed Rate', X_AXIS, frameTitleHeight + frameBodyHeight * 0.45 / 2, '1');
        printLabel(currentRecord.buyExecRate, X_AXIS, frameTitleHeight + frameBodyHeight * 0.50 / 2, '0.50');

        printLabel('ROI Asset A', X_AXIS, frameTitleHeight + frameBodyHeight * (1 - 0.25 / 2), '1');
        printLabel((currentRecord.combinedProfitsB).toFixed(2) + '%', X_AXIS, frameTitleHeight + frameBodyHeight * (1 - 0.30 / 2), '0.50');

        printLabel('ROI Asset B', X_AXIS, frameTitleHeight + frameBodyHeight * (1 - 0.15 / 2), '1');
        printLabel((currentRecord.combinedProfitsA).toFixed(2) + '%', X_AXIS, frameTitleHeight + frameBodyHeight * (1 - 0.20 / 2), '0.50');

        printLabel('Datetime', X_AXIS, frameTitleHeight + frameBodyHeight * (1 - 0.05 / 2), '1');
        printLabel(recordDate.toUTCString(), X_AXIS, frameTitleHeight + frameBodyHeight * (1 - 0.1 / 2), '0.50');


        function printLabel(labelToPrint, x, y, opacity) {

            let labelPoint;
            let fontSize = 10;

            browserCanvasContext.font = fontSize + 'px ' + UI_FONT.SECONDARY + ' Saira';

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
            labelPoint = thisObject.fitFunction(labelPoint)

            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK + ', ' + opacity + ')';
            browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y);

        }

        browserCanvasContext.closePath();
        browserCanvasContext.fill();

    }


}








