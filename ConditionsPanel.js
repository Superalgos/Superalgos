
function newAAMastersPlottersTradingSimulationConditionsConditionsPanel() {

    var thisObject = {
        fitFunction: undefined,
        onEventRaised: onEventRaised,
        container: undefined,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    thisObject.container = container;

    container.displacement.containerName = "Conditions";
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


    function onEventRaised(lastCurrentRecord) {

        currentRecord = lastCurrentRecord;

    }


    function draw() {


        plotCurrentRecordInfo();


    }


    function plotCurrentRecordInfo() {

        if (currentRecord === undefined) { return; }
        if (currentRecord.conditionsNames === undefined) { return; }
        if (canvas.strategySpace.workspace === undefined) { return; }

        browserCanvasContext.beginPath();

        let simulationLogic = currentRecord.conditionsNames;
        let conditionIndex = 0;

        for (let j = 0; j < simulationLogic.strategies.length; j++) {

            let strategy = simulationLogic.strategies[j];

            if (currentRecord.strategyNumber - 1 === j) {
                canvas.strategySpace.workspace.tradingSystem.strategies[j].payload.uiObject.isExecuting = true
            } else {
                canvas.strategySpace.workspace.tradingSystem.strategies[j].payload.uiObject.isExecuting = false
            }

            for (let k = 0; k < strategy.entryPoint.situations.length; k++) {

                let situation = strategy.entryPoint.situations[k];
                processSituation(situation, canvas.strategySpace.workspace.tradingSystem.strategies[j].entryPoint.situations[k]);
            }

            for (let k = 0; k < strategy.exitPoint.situations.length; k++) {

                let situation = strategy.exitPoint.situations[k];
                processSituation(situation, canvas.strategySpace.workspace.tradingSystem.strategies[j].exitPoint.situations[k]);
            }

            for (let k = 0; k < strategy.sellPoint.situations.length; k++) {

                let situation = strategy.sellPoint.situations[k];
                processSituation(situation, canvas.strategySpace.workspace.tradingSystem.strategies[j].sellPoint.situations[k]);
            }

            for (let p = 0; p < strategy.stopLoss.phases.length; p++) {

                if (currentRecord.strategyNumber - 1 === j && currentRecord.stopLossPhase - 1 === p) {
                    canvas.strategySpace.workspace.tradingSystem.strategies[j].stopLoss.phases[p].payload.uiObject.isExecuting = true
                } else {
                    canvas.strategySpace.workspace.tradingSystem.strategies[j].stopLoss.phases[p].payload.uiObject.isExecuting = false
                }

                let phase = strategy.stopLoss.phases[p];

                for (let k = 0; k < phase.situations.length; k++) {

                    let situation = phase.situations[k];
                    processSituation(situation, canvas.strategySpace.workspace.tradingSystem.strategies[j].stopLoss.phases[p].situations[k]);
                }
            }

            for (let p = 0; p < strategy.buyOrder.phases.length; p++) {

                if (currentRecord.strategyNumber - 1 === j && currentRecord.buyOrderPhase - 1 === p) {
                    canvas.strategySpace.workspace.tradingSystem.strategies[j].buyOrder.phases[p].payload.uiObject.isExecuting = true
                } else {
                    canvas.strategySpace.workspace.tradingSystem.strategies[j].buyOrder.phases[p].payload.uiObject.isExecuting = false
                }

                let phase = strategy.buyOrder.phases[p];

                for (let k = 0; k < phase.situations.length; k++) {

                    let situation = phase.situations[k];
                    processSituation(situation, canvas.strategySpace.workspace.tradingSystem.strategies[j].buyOrder.phases[p].situations[k]);
                }
            }
        }

        function processSituation(situation, node) {

            let highlightSituation = true

            for (let m = 0; m < situation.conditions.length; m++) {
                if (currentRecord.conditionsValues[conditionIndex] === 1) {
                    node.conditions[m].payload.uiObject.highlight()
                } else {
                    node.conditions[m].payload.uiObject.unHighlight()
                    highlightSituation = false
                }
                conditionIndex++;
            }

            if (highlightSituation === true) {
                node.payload.uiObject.highlight()
            } else {
                node.payload.uiObject.unHighlight()
            }
        }


        browserCanvasContext.closePath();
        browserCanvasContext.fill();

    }


}











