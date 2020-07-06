
function newTradingEnginesPlottersTradingSimulationSimulationExecutionSimulationExecutionPanel() {


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

    let container = newContainer();
    container.initialize();
    thisObject.container = container;

    container.frame.containerName = "Trading Execution";

    let record;
    let upDownButton

    return thisObject;

    function finalize() {
        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.fitFunction = undefined
        thisObject.isVisible = undefined

        record = undefined
        upDownButton.finalize()
        upDownButton = undefined
    }

    function initialize() {

        thisObject.container.frame.width = UI_PANEL.WIDTH.NORMAL;
        thisObject.container.frame.height = UI_PANEL.HEIGHT.NORMAL * 2.5;

        thisObject.container.frame.position.x = canvas.chartingSpace.viewport.visibleArea.topLeft.x + thisObject.container.frame.width * 4;
        thisObject.container.frame.position.y = canvas.chartingSpace.viewport.visibleArea.topRight.y;

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

        record = lastCurrentCandle;

    }


    function draw() {
        if (thisObject.isVisible !== true) { return }
        thisObject.container.frame.draw(false, false, true, thisObject.fitFunction);

        plot();

        upDownButton.draw()

    }


    function plot() {

        if (record === undefined) { return; }

        const frameBodyHeight = thisObject.container.frame.getBodyHeight();
        const frameTitleHeight = thisObject.container.frame.height - frameBodyHeight;

        const X_AXIS = thisObject.container.frame.width / 2;
        const Y_AXIS = frameTitleHeight + frameBodyHeight / 2;

        record = record

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
                x: X_AXIS + record.timeFrame / 4,
                y: Y_AXIS
            };

            let point3 = {
                x: X_AXIS - record.timeFrame / 4,
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

            point2 = canvas.chartingSpace.viewport.fitIntoVisibleArea(point2);
            point3 = canvas.chartingSpace.viewport.fitIntoVisibleArea(point3);

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
                x: X_AXIS + record.timeFrame / 4,
                y: Y_AXIS
            };

            let point3 = {
                x: X_AXIS - record.timeFrame / 4,
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

            point2 = canvas.chartingSpace.viewport.fitIntoVisibleArea(point2);
            point3 = canvas.chartingSpace.viewport.fitIntoVisibleArea(point3);

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
                x: X_AXIS + record.timeFrame / 4,
                y: Y_AXIS
            };

            let point3 = {
                x: X_AXIS - record.timeFrame / 4,
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

            point2 = canvas.chartingSpace.viewport.fitIntoVisibleArea(point2);
            point3 = canvas.chartingSpace.viewport.fitIntoVisibleArea(point3);

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
                x: X_AXIS + record.timeFrame / 4,
                y: Y_AXIS
            };

            let point3 = {
                x: X_AXIS - record.timeFrame / 4,
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

            point2 = canvas.chartingSpace.viewport.fitIntoVisibleArea(point2);
            point3 = canvas.chartingSpace.viewport.fitIntoVisibleArea(point3);

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

            if (point.x < canvas.chartingSpace.viewport.visibleArea.topLeft.x + 50 || point.x > canvas.chartingSpace.viewport.visibleArea.bottomRight.x - 50) {/*we leave this history without fill. */ } else {
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

        if (point.x < canvas.chartingSpace.viewport.visibleArea.topLeft.x + 50 || point.x > canvas.chartingSpace.viewport.visibleArea.bottomRight.x - 50) {/*we leave this history without fill. */ } else {
            browserCanvasContext.fill();
        }
        browserCanvasContext.setLineDash([0, 0])
        browserCanvasContext.stroke();

        /* put the labels  */

        browserCanvasContext.beginPath();

        let y;
        let recordDate = new Date(record.datetime)

        printLabel('Market Rate', X_AXIS, frameTitleHeight + frameBodyHeight * 0.05 / 2, '1');
        printLabel(record.marketRate, X_AXIS, frameTitleHeight + frameBodyHeight * 0.10 / 2, '0.50');

        printLabel('Sell Rate', X_AXIS, frameTitleHeight + frameBodyHeight * 0.15 / 2, '1');
        printLabel(record.lastSellRate, X_AXIS, frameTitleHeight + frameBodyHeight * 0.20 / 2, '0.50');

        printLabel('Sell Executed Rate', X_AXIS, frameTitleHeight + frameBodyHeight * 0.25 / 2, '1');
        printLabel(record.sellExecRate, X_AXIS, frameTitleHeight + frameBodyHeight * 0.30 / 2, '0.50');

        printLabel('Buy Rate', X_AXIS, frameTitleHeight + frameBodyHeight * 0.35 / 2, '1');
        printLabel(record.lastBuyRate, X_AXIS, frameTitleHeight + frameBodyHeight * 0.40 / 2, '0.40');

        printLabel('Buy Executed Rate', X_AXIS, frameTitleHeight + frameBodyHeight * 0.45 / 2, '1');
        printLabel(record.buyExecRate, X_AXIS, frameTitleHeight + frameBodyHeight * 0.50 / 2, '0.50');

        printLabel('ROI Asset A', X_AXIS, frameTitleHeight + frameBodyHeight * (1 - 0.25 / 2), '1');
        printLabel((record.combinedProfitsB).toFixed(2) + '%', X_AXIS, frameTitleHeight + frameBodyHeight * (1 - 0.30 / 2), '0.50');

        printLabel('ROI Asset B', X_AXIS, frameTitleHeight + frameBodyHeight * (1 - 0.15 / 2), '1');
        printLabel((record.combinedProfitsA).toFixed(2) + '%', X_AXIS, frameTitleHeight + frameBodyHeight * (1 - 0.20 / 2), '0.50');

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








