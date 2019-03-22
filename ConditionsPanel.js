
function newAAMastersPlottersTradingSimulationConditionsConditionsPanel() {

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

    container.displacement.containerName = "Conditions Panel";
    container.frame.containerName = "Conditions Panel";

    let currentRecord;
    let panelTabButton

    return thisObject;

    function initialize() {

        thisObject.container.frame.width = UI_PANEL.WIDTH.NORMAL * 2;
        thisObject.container.frame.height = viewPort.visibleArea.bottomLeft.y - viewPort.visibleArea.topLeft.y;

        thisObject.container.frame.position.x = viewPort.visibleArea.topRight.x - UI_PANEL.WIDTH.NORMAL * 3;
        thisObject.container.frame.position.y = viewPort.visibleArea.topRight.y;

        panelTabButton = newPanelTabButton()
        panelTabButton.parentContainer = thisObject.container
        panelTabButton.container.frame.parentFrame = thisObject.container.frame
        panelTabButton.initialize()
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
        if (currentRecord.conditionsNames === undefined) { return; }

        const frameBodyHeight = thisObject.container.frame.getBodyHeight();
        const frameTitleHeight = thisObject.container.frame.height - frameBodyHeight;

        const X_AXIS = thisObject.container.frame.width * 1 / 10;
        const Y_AXIS = frameTitleHeight + frameBodyHeight / 2;

        let y = 0;
        let increment = 0.02;
        let opacity;
        let label;
        let indent = 5;
        let showLabel;

        browserCanvasContext.beginPath();

        let simulationLogic = currentRecord.conditionsNames;
        let conditionIndex = 0;

        for (let j = 0; j < simulationLogic.strategies.length; j++) {

            let strategy = simulationLogic.strategies[j];

            showLabel = true;

            if (currentRecord.strategyNumber > 0 && currentRecord.strategyNumber - 1 !== j) { showLabel = false; }

            if (showLabel) { y = y + increment; }
            opacity = '1.00';
            label = 'Strategy: ' + strategy.name;
            printLabel(label, X_AXIS, frameTitleHeight + frameBodyHeight * y, opacity, UI_COLOR.DARK);

            if (showLabel) { y = y + increment; }
            opacity = '0.50';
            label = 'Entry Points';
            printLabel(label, X_AXIS + indent * 1, frameTitleHeight + frameBodyHeight * y, opacity, UI_COLOR.DARK);

            for (let k = 0; k < strategy.entryPoint.situations.length; k++) {

                let situation = strategy.entryPoint.situations[k];
                processSituation(situation);
            }

            if (showLabel) { y = y + increment; }
            opacity = '0.50';
            label = 'Exit Points';
            printLabel(label, X_AXIS + indent * 1, frameTitleHeight + frameBodyHeight * y, opacity, UI_COLOR.DARK);

            for (let k = 0; k < strategy.exitPoint.situations.length; k++) {

                let situation = strategy.exitPoint.situations[k];
                processSituation(situation);
            }

            if (currentRecord.strategyNumber - 1 !== j) { showLabel = false; }

            if (showLabel) { y = y + increment; }
            opacity = '0.50';
            label = 'Sell Points';
            printLabel(label, X_AXIS + indent * 1, frameTitleHeight + frameBodyHeight * y, opacity, UI_COLOR.DARK);

            for (let k = 0; k < strategy.sellPoint.situations.length; k++) {

                let situation = strategy.sellPoint.situations[k];
                processSituation(situation);
            }

            if (showLabel) { y = y + increment; }
            opacity = '0.50';
            label = 'Stop Loss Management';
            printLabel(label, X_AXIS + indent * 1, frameTitleHeight + frameBodyHeight * y, opacity, UI_COLOR.DARK);

            for (let p = 0; p < strategy.stopLoss.phases.length; p++) {

                let phase = strategy.stopLoss.phases[p];

                if (showLabel) { y = y + increment; }
                opacity = '0.50';
                label = 'Phase: ' + phase.name;
                printLabel(label, X_AXIS + indent * 1, frameTitleHeight + frameBodyHeight * y, opacity, UI_COLOR.DARK);

                for (let k = 0; k < phase.situations.length; k++) {

                    let situation = phase.situations[k];
                    processSituation(situation);
                }
            }

            if (showLabel) { y = y + increment; }
            opacity = '0.50';
            label = 'Buy Order Management';
            printLabel(label, X_AXIS + indent * 1, frameTitleHeight + frameBodyHeight * y, opacity, UI_COLOR.DARK);

            for (let p = 0; p < strategy.buyOrder.phases.length; p++) {

                let phase = strategy.buyOrder.phases[p];

                if (showLabel) { y = y + increment; }
                opacity = '0.50';
                label = 'Phase: ' + phase.name;
                printLabel(label, X_AXIS + indent * 1, frameTitleHeight + frameBodyHeight * y, opacity, UI_COLOR.DARK);

                for (let k = 0; k < phase.situations.length; k++) {

                    let situation = phase.situations[k];
                    processSituation(situation);
                }
            }
        }

        function processSituation(situation) {

            if (showLabel) { y = y + increment; }
            opacity = '0.50';
            label = 'Situation: ' + situation.name;
            printLabel(label, X_AXIS + indent * 2, frameTitleHeight + frameBodyHeight * y, opacity, UI_COLOR.DARK);

            for (let m = 0; m < situation.conditions.length; m++) {

                let condition = situation.conditions[m];
                let color;

                if (showLabel) { y = y + increment; }
                if (currentRecord.conditionsValues[conditionIndex] === 1) {
                    opacity = '0.50'
                    color = UI_COLOR.PATINATED_TURQUOISE;
                } else {
                    opacity = '0.50';
                    color = UI_COLOR.RUSTED_RED;
                }
                conditionIndex++;
                label = condition.name;
                printLabel(label, X_AXIS + indent * 3, frameTitleHeight + frameBodyHeight * y, opacity, color);
            }
        }

        function printLabel(labelToPrint, x, y, opacity, color) {

            if (showLabel === false) { return; }

            let labelPoint;
            let fontSize = 10;

            browserCanvasContext.font = fontSize + 'px ' + UI_FONT.SECONDARY + ' Saira';

            let label = '' + labelToPrint;
            if (isNaN(label) === false) {
                label = Number(label).toLocaleString();
            }
            let xOffset = label.length / 2 * fontSize * FONT_ASPECT_RATIO;

            labelPoint = {
                x: x,
                y: y
            };

            labelPoint = thisObject.container.frame.frameThisPoint(labelPoint);

            browserCanvasContext.fillStyle = 'rgba(' + color + ', ' + opacity + ')';
            browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y);

        }

        browserCanvasContext.closePath();
        browserCanvasContext.fill();

    }


}







