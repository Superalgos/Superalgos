
function newAAMastersPlottersTradingSimulationTradingSimulationTradingSimulationPanel() {

    let thisObject = {
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

    container.displacement.containerName = "Simulated Records Panel";
    container.frame.containerName = "Simulated Records Panel";

    let currentRecord;
    let panelTabButton
    let controlHandler

    return thisObject;

    function initialize() {

        thisObject.container.frame.width = UI_PANEL.WIDTH.NORMAL;
        thisObject.container.frame.height = UI_PANEL.HEIGHT.NORMAL * 2;

        thisObject.container.frame.position.x = viewPort.visibleArea.topRight.x - thisObject.container.frame.width * 1;
        thisObject.container.frame.position.y = viewPort.visibleArea.topRight.y;

        panelTabButton = newPanelTabButton()
        panelTabButton.parentContainer = thisObject.container
        panelTabButton.container.frame.parentFrame = thisObject.container.frame
        panelTabButton.initialize()

        controlHandler = canvas.bottomSpace.createNewControl('Over The Line', drawAssetBalanceUI, 'Global')

    }

    function finalize() {

        canvas.bottomSpace.destroyControl(controlHandler)
        controlHandler = undefined

    }

    function getContainer(point) {

        var container;

        container = panelTabButton.getContainer(point)
        if (container !== undefined) { return container }

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
        let increment = 0.025;

        y = y + increment;
        printLabel('Profit', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel(currentRecord.innerRecord.profit, X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50', 16);

        y = y + increment;
        printLabel('Last Profit', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel(currentRecord.innerRecord.lastProfit, X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50', 16);

        y = y + increment;
        printLabel('Last Profit %', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel((currentRecord.innerRecord.lastProfitPercent).toFixed(2) + ' % ', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50', 16);

        y = y + increment;
        printLabel('Rate', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel(currentRecord.innerRecord.sellRate, X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50', 16);

        y = y + increment;
        printLabel('Stop', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel(currentRecord.innerRecord.stopLoss, X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50', 16);

        y = y + increment;
        printLabel('Take Profit', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel(currentRecord.innerRecord.buyOrder, X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50', 16);

        y = y + increment;
        printLabel('Trades', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel(currentRecord.innerRecord.roundtrips, X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50', 16);

        y = y + increment;
        printLabel('Hits', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel(currentRecord.innerRecord.hits, X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50', 16);

        y = y + increment;
        printLabel('Fails', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel(currentRecord.innerRecord.fails, X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50', 16);

        y = y + increment;
        printLabel('Hit Ratio', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel((currentRecord.innerRecord.hitRatio * 100).toFixed(2) + ' %', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50', 16);

        y = y + increment;
        printLabel('ROI', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel((currentRecord.innerRecord.ROI * 100).toFixed(2) + ' %', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50', 16);

        y = y + increment;
        printLabel('Periods', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel(currentRecord.innerRecord.periods, X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50', 16);

        y = y + increment;
        printLabel('Days', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel(currentRecord.innerRecord.days, X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50', 16);

        y = y + increment;
        printLabel('Anualized Rate of Return', X_AXIS, frameTitleHeight + frameBodyHeight * y, '1');
        y = y + increment;
        printLabel((currentRecord.innerRecord.anualizedRateOfReturn * 100).toFixed(2) + ' %', X_AXIS, frameTitleHeight + frameBodyHeight * y, '0.50', 16);

        function printLabel(labelToPrint, x, y, opacity, fontSize) {

            let labelPoint;
            if (fontSize === undefined) { fontSize = 10 };

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
        params.INIT_VALUE = 1
        params.MIN_VALUE = 0.5
        params.MAX_VALUE = 2
        params.ASSET_LABEL = 'Asset A'
        params.ASSET_NAME = DEFAULT_MARKET.assetB + ' '
        params.LEFT_OFFSET = 100

        paramsArray.push(params)

        params = {}
        params.VALUE = currentRecord.innerRecord.balanceB;
        params.MIN_VALUE = 0
        params.INIT_VALUE = currentRecord.innerRecord.rate * currentRecord.innerRecord.sellAmount;
        params.MAX_VALUE = params.INIT_VALUE * 2;
        params.ASSET_LABEL = 'Asset B'
        params.ASSET_NAME = DEFAULT_MARKET.assetA + ' '
        params.LEFT_OFFSET = 220

        paramsArray.push(params)

        let control = canvas.bottomSpace.getControl(controlHandler, 'Global')
        control.paramsArray = paramsArray

    }

    function drawAssetBalanceUI(paramsArray) {

        drawAssetCircle(paramsArray[0])
        drawAssetCircle(paramsArray[1])

        let fontSize
        let label
        let xOffset
        let yOffset

        const OPACITY = 1;

        /* We put the params.VALUE in the middle */

        fontSize = 15;

        browserCanvasContext.font = "bold  " + fontSize + 'px ' + UI_FONT.PRIMARY

        label = 'ASSET BALANCES'


        xOffset = label.length / 2 * fontSize * FONT_ASPECT_RATIO;
        yOffset = -40

        labelPoint = {
            x: viewPort.visibleArea.bottomLeft.x - xOffset + (paramsArray[1].LEFT_OFFSET - paramsArray[0].LEFT_OFFSET) / 2 + paramsArray[0].LEFT_OFFSET - 20,
            y: viewPort.visibleArea.bottomLeft.y - yOffset
        };

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + OPACITY + ')';
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y);
    }

    function drawAssetCircle(params) {

        /* We draw the circle container */

        const RED_LINE_HIGHT = 5;
        const RADIOUS = 50;
        const OPACITY = 1;

        let centerPoint = {
            x: viewPort.visibleArea.bottomLeft.x + params.LEFT_OFFSET,
            y: viewPort.visibleArea.bottomLeft.y
        }

        browserCanvasContext.beginPath();
        browserCanvasContext.arc(centerPoint.x, centerPoint.y, RADIOUS + RED_LINE_HIGHT, 0.9 * Math.PI, 2.1 * Math.PI)
        browserCanvasContext.closePath();

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + OPACITY + ')'
        browserCanvasContext.fill()

        browserCanvasContext.beginPath();
        browserCanvasContext.arc(centerPoint.x, centerPoint.y, RADIOUS, 0.0 * Math.PI, 2.0 * Math.PI)
        browserCanvasContext.closePath();

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK + ', ' + OPACITY + ')'
        browserCanvasContext.fill()


        /* We draw the circle bar */

        const DEFAULT_THICKNESS = 2;
        const VALUE_THICKNESS = 8;
        const VALUE_BG_THICKNESS = 1;
        const BAR_RADIOUS = RADIOUS * 0.85;

        let BAR_START_ANGLE = 0.9 * Math.PI;
        let BAR_END_ANGLE = 2.1 * Math.PI;
        let CURRENT_VALUE_ANGLE = params.VALUE * (BAR_END_ANGLE - BAR_START_ANGLE) / params.MAX_VALUE + BAR_START_ANGLE
        let MIN_VALUE_ANGLE = params.MIN_VALUE * (BAR_END_ANGLE - BAR_START_ANGLE) / params.MAX_VALUE + BAR_START_ANGLE
        let INIT_VALUE_ANGLE = params.INIT_VALUE * (BAR_END_ANGLE - BAR_START_ANGLE) / params.MAX_VALUE + BAR_START_ANGLE
        let PROFIT_VALUE_ANGLE = CURRENT_VALUE_ANGLE

        if (CURRENT_VALUE_ANGLE > INIT_VALUE_ANGLE) { CURRENT_VALUE_ANGLE = INIT_VALUE_ANGLE }

        if (params.VALUE > 0) {

            browserCanvasContext.setLineDash([0, 0])

            browserCanvasContext.beginPath();
            browserCanvasContext.arc(centerPoint.x, centerPoint.y, BAR_RADIOUS, BAR_START_ANGLE, MIN_VALUE_ANGLE)

            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + OPACITY + ')'
            browserCanvasContext.lineWidth = VALUE_BG_THICKNESS
            browserCanvasContext.stroke()
            browserCanvasContext.closePath();

            browserCanvasContext.beginPath();
            browserCanvasContext.arc(centerPoint.x, centerPoint.y, BAR_RADIOUS, MIN_VALUE_ANGLE, CURRENT_VALUE_ANGLE)

            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + OPACITY + ')'
            browserCanvasContext.lineWidth = VALUE_BG_THICKNESS
            browserCanvasContext.stroke()
            browserCanvasContext.closePath();

            browserCanvasContext.beginPath();
            browserCanvasContext.arc(centerPoint.x, centerPoint.y, BAR_RADIOUS, CURRENT_VALUE_ANGLE, INIT_VALUE_ANGLE)

            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RED + ', ' + OPACITY + ')'
            browserCanvasContext.lineWidth = VALUE_BG_THICKNESS
            browserCanvasContext.stroke()
            browserCanvasContext.closePath();

            if (PROFIT_VALUE_ANGLE > INIT_VALUE_ANGLE) {

                browserCanvasContext.beginPath();
                browserCanvasContext.arc(centerPoint.x, centerPoint.y, BAR_RADIOUS, INIT_VALUE_ANGLE, PROFIT_VALUE_ANGLE)

                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GREEN + ', ' + OPACITY + ')'
                browserCanvasContext.lineWidth = VALUE_BG_THICKNESS
                browserCanvasContext.stroke()
                browserCanvasContext.closePath();
            }

            browserCanvasContext.setLineDash([2, 3])

            browserCanvasContext.beginPath();
            browserCanvasContext.arc(centerPoint.x, centerPoint.y, BAR_RADIOUS, BAR_START_ANGLE, MIN_VALUE_ANGLE)

            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + OPACITY + ')'
            browserCanvasContext.lineWidth = VALUE_THICKNESS
            browserCanvasContext.stroke()
            browserCanvasContext.closePath();

            browserCanvasContext.beginPath();
            browserCanvasContext.arc(centerPoint.x, centerPoint.y, BAR_RADIOUS, MIN_VALUE_ANGLE, CURRENT_VALUE_ANGLE)

            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + OPACITY + ')'
            browserCanvasContext.lineWidth = VALUE_THICKNESS
            browserCanvasContext.stroke()
            browserCanvasContext.closePath();

            browserCanvasContext.beginPath();
            browserCanvasContext.arc(centerPoint.x, centerPoint.y, BAR_RADIOUS, CURRENT_VALUE_ANGLE, INIT_VALUE_ANGLE)

            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RED + ', ' + OPACITY + ')'
            browserCanvasContext.lineWidth = VALUE_THICKNESS
            browserCanvasContext.stroke()
            browserCanvasContext.closePath();

            if (PROFIT_VALUE_ANGLE > INIT_VALUE_ANGLE) {

                browserCanvasContext.beginPath();
                browserCanvasContext.arc(centerPoint.x, centerPoint.y, BAR_RADIOUS, INIT_VALUE_ANGLE, PROFIT_VALUE_ANGLE)

                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GREEN + ', ' + OPACITY + ')'
                browserCanvasContext.lineWidth = VALUE_THICKNESS
                browserCanvasContext.stroke()
                browserCanvasContext.closePath();
            }
        }

        /* Common Variables */

        let fontSize
        let label
        let xOffset
        let yOffset

        /* We put the params.VALUE in the middle */

        fontSize = 22;

        browserCanvasContext.font = "bold  " + fontSize + 'px ' + UI_FONT.PRIMARY

        label = params.VALUE;
        if (isNaN(label) === false) {
            label = Number(label);
            if (label === 0) { label = label.toFixed(2) } else { label = label.toLocaleString() }
        }

        label = label.substring(0, 5);


        xOffset = label.length / 2 * fontSize * FONT_ASPECT_RATIO + 7;

        labelPoint = {
            x: centerPoint.x - xOffset,
            y: centerPoint.y
        };

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + OPACITY + ')';
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y);

        /* We put the top label */

        fontSize = 12;

        browserCanvasContext.font = "bold  " + fontSize + 'px ' + UI_FONT.PRIMARY

        label = params.ASSET_LABEL;

        xOffset = label.length / 2 * fontSize * FONT_ASPECT_RATIO + 3;
        yOffset = 22

        labelPoint = {
            x: centerPoint.x - xOffset,
            y: centerPoint.y - yOffset
        };

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + OPACITY + ')';
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y);

        /* We put the bottom label */

        fontSize = 12;

        browserCanvasContext.font = "bold  " + fontSize + 'px ' + UI_FONT.PRIMARY

        label = params.ASSET_NAME;

        xOffset = label.length / 2 * fontSize * FONT_ASPECT_RATIO + 3;
        yOffset = - 15

        labelPoint = {
            x: centerPoint.x - xOffset,
            y: centerPoint.y - yOffset
        };

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + OPACITY + ')';
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y);

    }
}

















