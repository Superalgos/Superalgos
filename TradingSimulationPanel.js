
function newAAMastersPlottersTradingSimulationTradingSimulationTradingSimulationPanel() {

    let thisObject = {
        fitFunction: undefined,
        onEventRaised: onEventRaised,
        container: undefined,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize,
        finalize: finalize
    };

    let container = newContainer();
    container.initialize();
    thisObject.container = container;

    container.displacement.containerName = "Simulation";
    container.frame.containerName = "Simulation";

    let currentRecord;
    let panelTabButton


    return thisObject;

    function initialize() {

        thisObject.container.frame.width = UI_PANEL.WIDTH.NORMAL;
        thisObject.container.frame.height = UI_PANEL.HEIGHT.NORMAL * 2;

        thisObject.container.frame.position.x = viewPort.visibleArea.topRight.x - thisObject.container.frame.width * 1;
        thisObject.container.frame.position.y = viewPort.visibleArea.topRight.y;

        panelTabButton = newPanelTabButton()
        panelTabButton.parentContainer = thisObject.container
        panelTabButton.container.frame.parentFrame = thisObject.container.frame
        panelTabButton.fitFunction = thisObject.fitFunction
        panelTabButton.initialize()

    }

    function finalize() {

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


    function onEventRaised(lastCurrentRecord) {

        currentRecord = lastCurrentRecord;

    }


    function draw() {

        thisObject.container.frame.draw(false, false, true, thisObject.fitFunction);

        plotCurrentRecordInfo();

        panelTabButton.draw()
    }


    function plotCurrentRecordInfo() {

        if (currentRecord === undefined) { return; }
        if (currentRecord.innerRecord === undefined) { return; }

        const frameBodyHeight = thisObject.container.frame.getBodyHeight();
        const frameTitleHeight = thisObject.container.frame.height - frameBodyHeight;

        const X_AXIS = thisObject.container.frame.width / 2;
        const Y_AXIS = frameTitleHeight + frameBodyHeight / 2;


        /* put the labels with the records values */

        browserCanvasContext.beginPath();

        let y = 0;
        let increment = 0.027;

        y = y + increment;
        y = y + increment;
        printLabel('Current Trade', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.60', 12);

        y = y + increment;
        printLabel('Size', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.60');
        y = y + increment;
        printLabel(currentRecord.innerRecord.positionSize, X_AXIS, frameTitleHeight + frameBodyHeight * y, '1.00', 14);

        y = y + increment;
        printLabel('Rate', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.60');
        y = y + increment;
        printLabel(currentRecord.innerRecord.sellRate, X_AXIS, frameTitleHeight + frameBodyHeight * y, '1.00', 14);

        y = y + increment;
        printLabel('Stop', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.60');
        y = y + increment;
        printLabel(currentRecord.innerRecord.stopLoss, X_AXIS, frameTitleHeight + frameBodyHeight * y, '1.00', 14);

        y = y + increment;
        printLabel('Take Profit', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.60');
        y = y + increment;
        printLabel(currentRecord.innerRecord.takeProfit, X_AXIS, frameTitleHeight + frameBodyHeight * y, '1.00', 14);


        y = y + increment;
        y = y + increment;
        printLabel('Latest Trade', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.60', 12);

        y = y + increment;
        printLabel('Profit / Loss', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.60');
        y = y + increment;
        printLabel(currentRecord.innerRecord.lastTradeProfitLoss, X_AXIS, frameTitleHeight + frameBodyHeight * y, '1.00', 14);

        y = y + increment;
        printLabel('ROI', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.60');
        y = y + increment;
        printLabel((currentRecord.innerRecord.lastTradeROI).toFixed(2) + ' % ', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1.00', 14);


        y = y + increment;
        y = y + increment;
        printLabel('Totals Accumulated', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.60', 12);

        y = y + increment;
        printLabel('Profit / Loss', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.60');
        y = y + increment;
        printLabel(currentRecord.innerRecord.profit, X_AXIS, frameTitleHeight + frameBodyHeight * y, '1.00', 14);

        y = y + increment;
        printLabel('Trades', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.60');
        y = y + increment;
        printLabel(currentRecord.innerRecord.roundtrips, X_AXIS, frameTitleHeight + frameBodyHeight * y, '1.00', 14);

        y = y + increment;
        printLabel('Hits', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.60');
        y = y + increment;
        printLabel(currentRecord.innerRecord.hits, X_AXIS, frameTitleHeight + frameBodyHeight * y, '1.00', 14);

        y = y + increment;
        printLabel('Fails', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.60');
        y = y + increment;
        printLabel(currentRecord.innerRecord.fails, X_AXIS, frameTitleHeight + frameBodyHeight * y, '1.00', 14);

        y = y + increment;
        printLabel('Hit Ratio', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.60');
        y = y + increment;
        printLabel((currentRecord.innerRecord.hitRatio * 100).toFixed(2) + ' %', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1.00', 14);

        y = y + increment;
        printLabel('ROI', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.60');
        y = y + increment;
        printLabel((currentRecord.innerRecord.ROI * 100).toFixed(2) + ' %', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1.00', 14);

        y = y + increment;
        printLabel('Periods', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.60');
        y = y + increment;
        printLabel(currentRecord.innerRecord.periods, X_AXIS, frameTitleHeight + frameBodyHeight * y, '1.00', 14);

        y = y + increment;
        printLabel('Days', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.60');
        y = y + increment;
        printLabel(currentRecord.innerRecord.days, X_AXIS, frameTitleHeight + frameBodyHeight * y, '1.00', 14);

        y = y + increment;
        printLabel('Anualized Rate of Return', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.60');
        y = y + increment;
        printLabel((currentRecord.innerRecord.anualizedRateOfReturn * 100).toFixed(2) + ' %', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1.00', 14);

        function printLabel(labelToPrint, x, y, opacity, fontSize) {

            let labelPoint;
            if (fontSize === undefined) { fontSize = 10 };

            browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY;

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

        /* Parameters */
        let params
        let paramsArray = []

        params = {}
        params.VALUE = currentRecord.innerRecord.balanceA;
        params.INIT_VALUE = currentRecord.innerRecord.initialBalanceA
        params.MIN_VALUE = currentRecord.innerRecord.minimunBalanceA
        params.MAX_VALUE = currentRecord.innerRecord.maximunBalanceA
        params.ASSET_LABEL = 'Asset A'
        params.ASSET_NAME = DEFAULT_MARKET.assetB + ' '
        params.LEFT_OFFSET = 100

        paramsArray.push(params)

        params = {}
        params.VALUE = currentRecord.innerRecord.balanceB;
        params.MIN_VALUE = currentRecord.innerRecord.minimunBalanceB
        params.INIT_VALUE = currentRecord.innerRecord.initialBalanceB
        params.MAX_VALUE = currentRecord.innerRecord.maximunBalanceB
        params.ASSET_LABEL = 'Asset B'
        params.ASSET_NAME = DEFAULT_MARKET.assetA + ' '
        params.LEFT_OFFSET = 220

        paramsArray.push(params)

        canvas.cockpitSpace.assetBalances.setParamsArray(paramsArray)
    }
}





















