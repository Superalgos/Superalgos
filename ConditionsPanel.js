
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

    return thisObject;

    function initialize() {

        thisObject.container.frame.width = UI_PANEL.WIDTH.NORMAL;
        thisObject.container.frame.height = UI_PANEL.HEIGHT.NORMAL * 1;

        thisObject.container.frame.position.x = viewPort.visibleArea.topRight.x - thisObject.container.frame.width * 2;
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
        if (currentRecord.conditionsNames === undefined) { return; }

        const frameBodyHeight = thisObject.container.frame.getBodyHeight();
        const frameTitleHeight = thisObject.container.frame.height - frameBodyHeight;

        const X_AXIS = thisObject.container.frame.width / 2;
        const Y_AXIS = frameTitleHeight + frameBodyHeight / 2;

        let y = 0;
        let increment = 0.06;
        let opacity;
        let label;

        browserCanvasContext.beginPath();

        let simulationLogic = currentRecord.conditionsNames;
        let conditionIndex = 2;  // Jump the first 2 items since they are the .begin and the .end of the record.

        for (let j = 0; j < simulationLogic.strategies.length; j++) {

            let strategy = simulationLogic.strategies[j];

            y = y + increment;
            y = y + increment;
            opacity = '1.00';
            label = 'Strategy: ' + strategy.name;
            printLabel(label, X_AXIS, frameTitleHeight + frameBodyHeight * y, opacity, UI_COLOR.DARK);

            y = y + increment;
            opacity = '0.50';
            label = 'Entry Point';
            printLabel(label, X_AXIS, frameTitleHeight + frameBodyHeight * y, opacity, UI_COLOR.DARK);

            for (let k = 0; k < strategy.entryPoint.situations.length; k++) {

                let situation = strategy.entryPoint.situations[k];

                y = y + increment;
                opacity = '0.50';
                label = 'Situation: ' + situation.name;
                printLabel(label, X_AXIS, frameTitleHeight + frameBodyHeight * y, opacity, UI_COLOR.DARK);

                for (let m = 0; m < situation.conditions.length; m++) {

                    let condition = situation.conditions[m];
                    let color;

                    y = y + increment;
                    if (currentRecord.conditionsValues[conditionIndex] === 1) {
                        opacity = '0.50'
                        color = UI_COLOR.PATINATED_TURQUOISE;
                    } else {
                        opacity = '0.50';
                        color = UI_COLOR.RUSTED_RED;
                    }
                    conditionIndex++;
                    label = condition.name;
                    printLabel(label, X_AXIS, frameTitleHeight + frameBodyHeight * y, opacity, color);
                }
            }
        }

        function printLabel(labelToPrint, x, y, opacity, color) {

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

            browserCanvasContext.fillStyle = 'rgba(' + color + ', ' + opacity + ')';
            browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y);

        }

        browserCanvasContext.closePath();
        browserCanvasContext.fill();

    }


}



