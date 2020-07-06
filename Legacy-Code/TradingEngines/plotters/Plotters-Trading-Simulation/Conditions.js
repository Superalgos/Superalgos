function newTradingEnginesPlottersTradingSimulationConditions() {

    const MODULE_NAME = "Conditions Plotter";
    const INFO_LOG = false;
    const ERROR_LOG = true;
    const INTENSIVE_LOG = false;
    const logger = newWebDebugLog();
    logger.fileName = MODULE_NAME;

    let thisObject = {

        // Main functions and properties.

        initialize: initialize,
        finalize: finalize,
        container: undefined,
        getContainer: getContainer,
        setTimeFrame: setTimeFrame,
        setDatetime: setDatetime,
        draw: draw,

        /* Events declared outside the plotter. */

        onDailyFileLoaded: onDailyFileLoaded,

        // Secondary functions and properties.

        record: undefined
    };

    /* this is part of the module template */

    let container = newContainer();     // Do not touch this 3 lines, they are just needed.
    container.initialize();
    thisObject.container = container;

    let coordinateSystem

    let timeFrame;                     // This will hold the current Time Frame the user is at.
    let datetime;                       // This will hold the current Datetime the user is at.

    let marketFile;                     // This is the current Market File being plotted.
    let fileCursor;                     // This is the current File Cursor being used to retrieve Daily Files.

    let marketFiles;                      // This object will provide the different Market Files at different Time Frames.
    let dailyFiles;                // This object will provide the different File Cursors at different Time Frames.

    /* these are module specific variables: */

    let conditions = [];
    let headers;

    let noDefinitionOnFocusErrorDisplayed = false

    let onMouseOverEventSuscriptionId
    let zoomChangedEventSubscriptionId
    let offsetChangedEventSubscriptionId
    let dragFinishedEventSubscriptionId
    let dimmensionsChangedEventSubscriptionId
    let marketFilesUpdatedEventSubscriptionId
    let dailyFilesUpdatedEventSubscriptionId
    let scaleChangedEventSubscriptionId

    let userPositionDate
    return thisObject;

    function finalize() {
        try {

            if (INFO_LOG === true) { logger.write("[INFO] finalize -> Entering function."); }

            /* Stop listening to the necesary events. */

            thisObject.container.eventHandler.stopListening(onMouseOverEventSuscriptionId)
            canvas.chartingSpace.viewport.eventHandler.stopListening(zoomChangedEventSubscriptionId);
            canvas.chartingSpace.viewport.eventHandler.stopListening(offsetChangedEventSubscriptionId);
            canvas.eventHandler.stopListening(dragFinishedEventSubscriptionId);
            thisObject.container.eventHandler.stopListening(dimmensionsChangedEventSubscriptionId)
            marketFiles.eventHandler.stopListening(marketFilesUpdatedEventSubscriptionId);
            dailyFiles.eventHandler.stopListening(dailyFilesUpdatedEventSubscriptionId);

            /* Destroyd References */

            marketFiles = undefined;
            dailyFiles = undefined;

            datetime = undefined;
            timeFrame = undefined;

            marketFile = undefined;
            fileCursor = undefined;

            finalizeCoordinateSystem()
            coordinateSystem = undefined
        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] finalize -> err = " + err.stack); }
        }
    }

    function initialize(pStorage, pDatetime, pTimeFrame, pCoordinateSystem, callBackFunction) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }

            /* Store the information received. */

            marketFiles = pStorage.marketFiles[0];
            dailyFiles = pStorage.dailyFiles[0];

            datetime = pDatetime;
            timeFrame = pTimeFrame;
            coordinateSystem = pCoordinateSystem
            initializeCoordinateSystem()

            /* We need a Market File in order to calculate the Y scale, since this scale depends on actual data. */

            marketFile = marketFiles.getFile(ONE_DAY_IN_MILISECONDS);  // This file is the one processed faster. 

            /* Now we set the right files according to current Period. */

            marketFile = marketFiles.getFile(pTimeFrame);
            fileCursor = dailyFiles.getFileCursor(pTimeFrame);

            /* Listen to the necesary events. */

            zoomChangedEventSubscriptionId = canvas.chartingSpace.viewport.eventHandler.listenToEvent("Zoom Changed", onViewportZoomChanged);
            offsetChangedEventSubscriptionId = canvas.chartingSpace.viewport.eventHandler.listenToEvent("Position Changed", onViewportPositionChanged);
            dragFinishedEventSubscriptionId = canvas.eventHandler.listenToEvent("Drag Finished", onDragFinished);
            marketFilesUpdatedEventSubscriptionId = marketFiles.eventHandler.listenToEvent("Files Updated", onMarketFilesUpdated);
            dailyFilesUpdatedEventSubscriptionId = dailyFiles.eventHandler.listenToEvent("Files Updated", onDailyFilesUpdated);
            onMouseOverEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)

            /* Get ready for plotting. */

            recalculate();

            /* Ready for when dimmension changes. */

            dimmensionsChangedEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('Dimmensions Changed', function () {
                recalculate();
            })

            callBackFunction();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> err = " + err.stack); }
        }
    }

    function initializeCoordinateSystem() {
        scaleChangedEventSubscriptionId = coordinateSystem.eventHandler.listenToEvent('Scale Changed', onScaleChanged)
    }

    function finalizeCoordinateSystem() {
        coordinateSystem.eventHandler.stopListening(scaleChangedEventSubscriptionId)
    }

    function onScaleChanged() {
        recalculate();
    }

    function onMouseOver(event) {
        let userPosition = getDateFromPointAtBrowserCanvas(event, thisObject.container, coordinateSystem)
        userPositionDate = userPosition.valueOf()
    }

    function getContainer(point) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] getContainer -> Entering function."); }

            let container;

            /* First we check if this point is inside this space. */

            if (this.container.frame.isThisPointHere(point) === true) {

                return this.container;

            } else {

                /* This point does not belong to this space. */

                return undefined;
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] getContainer -> err = " + err.stack); }
        }
    }

    function onMarketFilesUpdated() {
        try {
            let newMarketFile = marketFiles.getFile(timeFrame);
            if (newMarketFile !== undefined) {
                marketFile = newMarketFile;
                recalculate();
            }
        } catch (err) {
            if (ERROR_LOG === true) { logger.write("[ERROR] onMarketFilesUpdated -> err = " + err.stack); }
        }
    }

    function onDailyFilesUpdated() {
        try {
            let newFileCursor = dailyFiles.getFileCursor(timeFrame);
            if (newFileCursor !== undefined) {
                fileCursor = newFileCursor;
                recalculate();
            }
        } catch (err) {
            if (ERROR_LOG === true) { logger.write("[ERROR] onDailyFilesUpdated -> err = " + err.stack); }
        }
    }

    function setTimeFrame(pTimeFrame) {

        try {

            if (timeFrame !== pTimeFrame) {

                timeFrame = pTimeFrame;

                if (timeFrame >= _1_HOUR_IN_MILISECONDS) {

                    marketFile = marketFiles.getFile(pTimeFrame);

                    recalculate();

                } else {

                    let newFileCursor = dailyFiles.getFileCursor(pTimeFrame);

                    fileCursor = newFileCursor; // In this case, we explicitly want that if there is no valid cursor, we invalidate the data and show nothing.
                    recalculate();

                }
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] setTimeFrame -> err = " + err.stack); }
        }
    }

    function setDatetime(pDatetime) {

        if (INFO_LOG === true) { logger.write("[INFO] setDatetime -> Entering function."); }

        datetime = pDatetime;

    }

    function setCoordinateSystem(pCoordinateSystem) {
        finalizeCoordinateSystem()
        coordinateSystem = pCoordinateSystem
        initializeCoordinateSystem()
    }

    function onDailyFileLoaded(event) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onDailyFileLoaded -> Entering function."); }

            if (event.currentValue === event.totalValue) {

                /* This happens only when all of the files in the cursor have been loaded. */

                recalculate();

            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onDailyFileLoaded -> err = " + err.stack); }
        }
    }

    function draw() {

        try {

            if (INTENSIVE_LOG === true) { logger.write("[INFO] draw -> Entering function."); }

            this.container.frame.draw();

            plotChart();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] draw -> err = " + err.stack); }
        }
    }

    function recalculate() {

        try {

            conditions = []

            if (timeFrame >= _1_HOUR_IN_MILISECONDS) {

                recalculateUsingMarketFiles();

            } else {

                recalculateUsingDailyFiles();

            }

            thisObject.container.eventHandler.raiseEvent("Conditions Changed", conditions);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculate -> err = " + err.stack); }
        }
    }

    function recalculateUsingDailyFiles() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] recalculateUsingDailyFiles -> Entering function."); }

            if (fileCursor === undefined) {
                conditions = [];
                return;
            } // We need to wait

            if (fileCursor.files.size === 0) {
                conditions = [];
                return;
            } // We need to wait until there are files in the cursor

            let daysOnSides = getSideDays(timeFrame);

            let leftDate = getDateFromPointAtBrowserCanvas(canvas.chartingSpace.viewport.visibleArea.topLeft, thisObject.container, coordinateSystem);
            let rightDate = getDateFromPointAtBrowserCanvas(canvas.chartingSpace.viewport.visibleArea.topRight, thisObject.container, coordinateSystem);

            let dateDiff = rightDate.valueOf() - leftDate.valueOf();

            let farLeftDate = new Date(leftDate.valueOf() - dateDiff * 1.5);
            let farRightDate = new Date(rightDate.valueOf() + dateDiff * 1.5);

            let currentDate = new Date(farLeftDate.valueOf());

            conditions = [];



            while (currentDate.valueOf() <= farRightDate.valueOf() + ONE_DAY_IN_MILISECONDS) {

                let stringDate = currentDate.getFullYear() + '-' + pad(currentDate.getMonth() + 1, 2) + '-' + pad(currentDate.getDate(), 2);

                let dailyFile = fileCursor.files.get(stringDate);

                if (dailyFile !== undefined) {

                    headers = dailyFile[0];

                    for (let i = 0; i < dailyFile[1].length; i++) {

                        let record = {
                            begin: undefined,
                            end: undefined,
                            conditions: undefined
                        };

                        record.begin = dailyFile[1][i][0];
                        record.end = dailyFile[1][i][1];
                        record.strategyIndex = dailyFile[1][i][2];
                        record.variable_current_position_stopLoss_phase = dailyFile[1][i][3];
                        record.variable_current_position_takeProfit_phase = dailyFile[1][i][4];
                        record.conditions = dailyFile[1][i][5];
                        record.formulaErrors = dailyFile[1][i][6];
                        record.formulaValues = dailyFile[1][i][7];

                        if (
                            (record.begin >= farLeftDate.valueOf() && record.end <= farRightDate.valueOf()) &&
                            (record.begin >= coordinateSystem.min.x && record.end <= coordinateSystem.max.x)
                        ) {

                            conditions.push(record);

                            if (datetime.valueOf() >= record.begin && datetime.valueOf() <= record.end) {

                                thisObject.record = record;
                                thisObject.container.eventHandler.raiseEvent("Current Condition Changed", thisObject.record);

                            }
                        }
                    }
                }

                currentDate = new Date(currentDate.valueOf() + ONE_DAY_IN_MILISECONDS);
            }

            /* Lests check if all the visible screen is going to be covered by conditions. */

            let lowerEnd = leftDate.valueOf();
            let upperEnd = rightDate.valueOf();

            setTimeout(recalculate, 2000);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateUsingDailyFiles -> err = " + err.stack); }
        }
    }

    function recalculateUsingMarketFiles() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] recalculateUsingMarketFiles -> Entering function."); }

            if (marketFile === undefined) { return; } // Initialization not complete yet.

            let daysOnSides = getSideDays(timeFrame);

            let leftDate = getDateFromPointAtBrowserCanvas(canvas.chartingSpace.viewport.visibleArea.topLeft, thisObject.container, coordinateSystem);
            let rightDate = getDateFromPointAtBrowserCanvas(canvas.chartingSpace.viewport.visibleArea.topRight, thisObject.container, coordinateSystem);

            let dateDiff = rightDate.valueOf() - leftDate.valueOf();

            leftDate = new Date(leftDate.valueOf() - dateDiff * 1.5);
            rightDate = new Date(rightDate.valueOf() + dateDiff * 1.5);

            conditions = [];
            headers = marketFile[0];

            for (let i = 0; i < marketFile[1].length; i++) {

                let record = {
                    begin: undefined,
                    end: undefined,
                    conditions: undefined
                };

                record.begin = marketFile[1][i][0];
                record.end = marketFile[1][i][1];
                record.strategyIndex = marketFile[1][i][2];
                record.variable_current_position_stopLoss_phase = marketFile[1][i][3];
                record.variable_current_position_takeProfit_phase = marketFile[1][i][4];
                record.conditions = marketFile[1][i][5];
                record.formulaErrors = marketFile[1][i][6];
                record.formulaValues = marketFile[1][i][7];

                if (
                    (record.begin >= leftDate.valueOf() && record.end <= rightDate.valueOf()) &&
                    (record.begin >= coordinateSystem.min.x && record.end <= coordinateSystem.max.x)
                ) {

                    conditions.push(record);

                    if (datetime.valueOf() >= record.begin && datetime.valueOf() <= record.end) {

                        thisObject.record = record;
                        thisObject.container.eventHandler.raiseEvent("Current Condition Changed", thisObject.record);

                    }
                }
            }

            //console.log("Olivia > recalculateUsingMarketFiles > total conditions generated : " + conditions.length);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] recalculateUsingMarketFiles -> err = " + err.stack); }
        }
    }

    function plotChart() {

        try {

            thisObject.container.eventHandler.raiseEvent("Current Condition Record Changed", undefined);

            let conditionRecord;

            for (let i = 0; i < conditions.length; i++) {

                conditionRecord = conditions[i];

                /* Send the current record to the panel */

                if (userPositionDate >= conditionRecord.begin && userPositionDate <= conditionRecord.end) {

                    let record = {
                        conditionsNames: headers,
                        strategyIndex: conditionRecord.strategyIndex,
                        variable_current_position_stopLoss_phase: conditionRecord.variable_current_position_stopLoss_phase,
                        variable_current_position_takeProfit_phase: conditionRecord.variable_current_position_takeProfit_phase,
                        conditionsValues: conditionRecord.conditions,
                        formulaErrors: conditionRecord.formulaErrors,
                        formulaValues: conditionRecord.formulaValues
                    };

                    sendRecordInfoToDesignerSpace(record)
                }
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] plotChart -> err = " + err.stack); }
        }
    }

    function sendRecordInfoToDesignerSpace(record) {

        if (record === undefined) { return; }
        if (record.conditionsNames === undefined) { return; }
        if (canvas.designSpace.workspace === undefined) { return; }

        /* We will get now the designer trading system */
        let designerTradingSystem
        let fileTradingSystem = record.conditionsNames;

        for (let i = 0; i < canvas.designSpace.workspace.workspaceNode.rootNodes.length; i++) {
            let rootNode = canvas.designSpace.workspace.workspaceNode.rootNodes[i]
            if (rootNode.type === 'Trading System') {
                if (rootNode.id === fileTradingSystem.id) {
                    designerTradingSystem = rootNode
                }
            }
        }

        if (designerTradingSystem === undefined) { return; }

        try {

            browserCanvasContext.beginPath();


            let conditionIndex = 0;
            let formulaErrorsIndex = 0;
            let formulaValuesIndex = 0;

            designerTradingSystem.payload.uiObject.setErrorMessage(fileTradingSystem.error)

            if (fileTradingSystem.parameters !== undefined) {
                designerTradingSystem.parameters.payload.uiObject.setErrorMessage(fileTradingSystem.parameters.error)
                if (fileTradingSystem.parameters.baseAsset !== undefined) {
                    designerTradingSystem.parameters.baseAsset.payload.uiObject.setErrorMessage(fileTradingSystem.parameters.baseAsset.error)
                }
                if (fileTradingSystem.parameters.timeRange !== undefined) {
                    designerTradingSystem.parameters.timeRange.payload.uiObject.setErrorMessage(fileTradingSystem.parameters.timeRange.error)
                }
                if (fileTradingSystem.parameters.slippage !== undefined) {
                    designerTradingSystem.parameters.slippage.payload.uiObject.setErrorMessage(fileTradingSystem.parameters.slippage.error)
                }
                if (fileTradingSystem.parameters.feeStructure !== undefined) {
                    designerTradingSystem.parameters.feeStructure.payload.uiObject.setErrorMessage(fileTradingSystem.parameters.feeStructure.error)
                }
            }

            for (let j = 0; j < fileTradingSystem.strategies.length; j++) {

                let strategy = fileTradingSystem.strategies[j];
                designerTradingSystem.strategies[j].payload.uiObject.setErrorMessage(strategy.error)

                if (record.strategyIndex === j) {
                    designerTradingSystem.strategies[j].payload.uiObject.isExecuting = true
                } else {
                    designerTradingSystem.strategies[j].payload.uiObject.isExecuting = false
                }

                let triggerStage = strategy.triggerStage

                if (triggerStage !== undefined) {
                    designerTradingSystem.strategies[j].triggerStage.payload.uiObject.setErrorMessage(triggerStage.error)

                    if (triggerStage.triggerOn !== undefined) {
                        designerTradingSystem.strategies[j].triggerStage.triggerOn.payload.uiObject.setErrorMessage(triggerStage.triggerOn.error)

                        for (let k = 0; k < triggerStage.triggerOn.situations.length; k++) {

                            let situation = triggerStage.triggerOn.situations[k];
                            designerTradingSystem.strategies[j].triggerStage.triggerOn.situations[k].payload.uiObject.setErrorMessage(triggerStage.triggerOn.situations[k].error)
                            processSituation(situation, designerTradingSystem.strategies[j].triggerStage.triggerOn.situations[k]);
                        }

                        for (let k = 0; k < triggerStage.triggerOn.announcements.length; k++) {

                            let announcement = triggerStage.triggerOn.announcements[k];
                            designerTradingSystem.strategies[j].triggerStage.triggerOn.announcements[k].payload.uiObject.setErrorMessage(announcement.error)
                            if (announcement.formula !== undefined) {
                                designerTradingSystem.strategies[j].triggerStage.triggerOn.announcements[k].formula.payload.uiObject.setErrorMessage(announcement.formula.error)
                            } 
                        }
                    }

                    if (triggerStage.triggerOff !== undefined) {

                        for (let k = 0; k < triggerStage.triggerOff.situations.length; k++) {

                            let situation = triggerStage.triggerOff.situations[k];
                            designerTradingSystem.strategies[j].triggerStage.triggerOff.situations[k].payload.uiObject.setErrorMessage(triggerStage.triggerOff.situations[k].error)
                            processSituation(situation, designerTradingSystem.strategies[j].triggerStage.triggerOff.situations[k]);
                        }

                        for (let k = 0; k < triggerStage.triggerOff.announcements.length; k++) {

                            let announcement = triggerStage.triggerOff.announcements[k];
                            designerTradingSystem.strategies[j].triggerStage.triggerOff.announcements[k].payload.uiObject.setErrorMessage(announcement.error)
                            if (announcement.formula !== undefined) {
                                designerTradingSystem.strategies[j].triggerStage.triggerOff.announcements[k].formula.payload.uiObject.setErrorMessage(announcement.formula.error)
                            }
                        }
                    }

                    if (triggerStage.takePosition !== undefined) {

                        for (let k = 0; k < triggerStage.takePosition.situations.length; k++) {

                            let situation = triggerStage.takePosition.situations[k];
                            designerTradingSystem.strategies[j].triggerStage.takePosition.situations[k].payload.uiObject.setErrorMessage(triggerStage.takePosition.situations[k].error)
                            processSituation(situation, designerTradingSystem.strategies[j].triggerStage.takePosition.situations[k]);
                        }

                        for (let k = 0; k < triggerStage.takePosition.announcements.length; k++) {

                            let announcement = triggerStage.takePosition.announcements[k];
                            designerTradingSystem.strategies[j].triggerStage.takePosition.announcements[k].payload.uiObject.setErrorMessage(announcement.error)
                            if (announcement.formula !== undefined) {
                                designerTradingSystem.strategies[j].triggerStage.takePosition.announcements[k].formula.payload.uiObject.setErrorMessage(announcement.formula.error)
                            }
                        }
                    }
                }

                let openStage = strategy.openStage

                if (openStage !== undefined) {
                    designerTradingSystem.strategies[j].openStage.payload.uiObject.setErrorMessage(openStage.error)

                    let initialDefinition = openStage.initialDefinition

                    if (initialDefinition !== undefined) {
                        designerTradingSystem.strategies[j].openStage.initialDefinition.payload.uiObject.setErrorMessage(openStage.initialDefinition.error)

                        if (initialDefinition.stopLoss !== undefined) {
                            designerTradingSystem.strategies[j].openStage.initialDefinition.stopLoss.payload.uiObject.setErrorMessage(openStage.initialDefinition.stopLoss.error)

                            for (let p = 0; p < initialDefinition.stopLoss.phases.length; p++) {

                                if (record.strategyIndex === j && record.variable_current_position_stopLoss_phase === p) {
                                    designerTradingSystem.strategies[j].openStage.initialDefinition.stopLoss.phases[p].payload.uiObject.isExecuting = true
                                } else {
                                    designerTradingSystem.strategies[j].openStage.initialDefinition.stopLoss.phases[p].payload.uiObject.isExecuting = false
                                }

                                let phase = initialDefinition.stopLoss.phases[p];
                                designerTradingSystem.strategies[j].openStage.initialDefinition.stopLoss.phases[p].payload.uiObject.setErrorMessage(openStage.initialDefinition.stopLoss.phases[p].error)

                                if (phase.formula !== undefined) {
                                    designerTradingSystem.strategies[j].openStage.initialDefinition.stopLoss.phases[p].formula.payload.uiObject.setErrorMessage(openStage.initialDefinition.stopLoss.phases[p].formula.error)

                                    if (record.formulaErrors[formulaErrorsIndex] !== "") {
                                        if (record.strategyIndex === j && record.variable_current_position_stopLoss_phase === p) {
                                            designerTradingSystem.strategies[j].openStage.initialDefinition.stopLoss.phases[p].formula.payload.uiObject.setErrorMessage(record.formulaErrors[formulaErrorsIndex])
                                        }
                                    }
                                    formulaErrorsIndex++

                                    if (record.strategyIndex === j && record.variable_current_position_stopLoss_phase === p) {
                                        designerTradingSystem.strategies[j].openStage.initialDefinition.stopLoss.phases[p].formula.payload.uiObject.setValue(record.formulaValues[formulaValuesIndex])
                                    }
                                    formulaValuesIndex++
                                }

                                for (let k = 0; k < phase.announcements.length; k++) {

                                    let announcement = phase.announcements[k];
                                    designerTradingSystem.strategies[j].openStage.initialDefinition.stopLoss.phases[p].announcements[k].payload.uiObject.setErrorMessage(announcement.error)
                                    if (announcement.formula !== undefined) {
                                        designerTradingSystem.strategies[j].openStage.initialDefinition.stopLoss.phases[p].announcements[k].formula.payload.uiObject.setErrorMessage(announcement.formula.error)
                                    }
                                }

                                let nextPhaseEvent = phase.nextPhaseEvent;
                                if (nextPhaseEvent !== undefined) {
                                    designerTradingSystem.strategies[j].openStage.initialDefinition.stopLoss.phases[p].nextPhaseEvent.payload.uiObject.setErrorMessage(openStage.initialDefinition.stopLoss.phases[p].nextPhaseEvent.error)

                                    for (let k = 0; k < nextPhaseEvent.situations.length; k++) {

                                        let situation = nextPhaseEvent.situations[k];

                                        processSituation(situation, designerTradingSystem.strategies[j].openStage.initialDefinition.stopLoss.phases[p].nextPhaseEvent.situations[k]);
                                    }

                                    for (let k = 0; k < nextPhaseEvent.announcements.length; k++) {

                                        let announcement = nextPhaseEvent.announcements[k];
                                        designerTradingSystem.strategies[j].openStage.initialDefinition.stopLoss.phases[p].nextPhaseEvent.announcements[k].payload.uiObject.setErrorMessage(announcement.error)
                                        if (announcement.formula !== undefined) {
                                            designerTradingSystem.strategies[j].openStage.initialDefinition.stopLoss.phases[p].nextPhaseEvent.announcements[k].formula.payload.uiObject.setErrorMessage(announcement.formula.error)
                                        }
                                    }
                                }

                                for (let n = 0; n < phase.moveToPhaseEvents.length; n++) {
                                    let moveToPhaseEvent = phase.moveToPhaseEvents[n];
                                    if (moveToPhaseEvent !== undefined) {
                                        designerTradingSystem.strategies[j].openStage.initialDefinition.stopLoss.phases[p].moveToPhaseEvents[n].payload.uiObject.setErrorMessage(openStage.initialDefinition.stopLoss.phases[p].moveToPhaseEvents[n].error)

                                        for (let k = 0; k < moveToPhaseEvent.situations.length; k++) {

                                            let situation = moveToPhaseEvent.situations[k];

                                            processSituation(situation, designerTradingSystem.strategies[j].openStage.initialDefinition.stopLoss.phases[p].moveToPhaseEvents[n].situations[k]);
                                        }

                                        for (let k = 0; k < moveToPhaseEvent.announcements.length; k++) {

                                            let announcement = moveToPhaseEvent.announcements[k];
                                            designerTradingSystem.strategies[j].openStage.initialDefinition.stopLoss.phases[p].moveToPhaseEvents[n].announcements[k].payload.uiObject.setErrorMessage(announcement.error)
                                            if (announcement.formula !== undefined) {
                                                designerTradingSystem.strategies[j].openStage.initialDefinition.stopLoss.phases[p].moveToPhaseEvents[n].announcements[k].formula.payload.uiObject.setErrorMessage(announcement.formula.error)
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        if (initialDefinition.takeProfit !== undefined) {
                            designerTradingSystem.strategies[j].openStage.initialDefinition.takeProfit.payload.uiObject.setErrorMessage(openStage.initialDefinition.takeProfit.error)

                            for (let p = 0; p < initialDefinition.takeProfit.phases.length; p++) {

                                if (record.strategyIndex === j && record.variable_current_position_takeProfit_phase === p) {
                                    designerTradingSystem.strategies[j].openStage.initialDefinition.takeProfit.phases[p].payload.uiObject.isExecuting = true
                                } else {
                                    designerTradingSystem.strategies[j].openStage.initialDefinition.takeProfit.phases[p].payload.uiObject.isExecuting = false
                                }

                                let phase = initialDefinition.takeProfit.phases[p];
                                designerTradingSystem.strategies[j].openStage.initialDefinition.takeProfit.phases[p].payload.uiObject.setErrorMessage(openStage.initialDefinition.takeProfit.phases[p].error)

                                if (phase.formula !== undefined) {
                                    designerTradingSystem.strategies[j].openStage.initialDefinition.takeProfit.phases[p].formula.payload.uiObject.setErrorMessage(openStage.initialDefinition.takeProfit.phases[p].formula.error)

                                    if (record.formulaErrors[formulaErrorsIndex] !== "") {
                                        if (record.strategyIndex === j && record.variable_current_position_takeProfit_phase === p) {
                                            designerTradingSystem.strategies[j].openStage.initialDefinition.takeProfit.phases[p].formula.payload.uiObject.setErrorMessage(record.formulaErrors[formulaErrorsIndex])
                                        }
                                    }
                                    formulaErrorsIndex++

                                    if (record.strategyIndex === j && record.variable_current_position_takeProfit_phase === p) {
                                        designerTradingSystem.strategies[j].openStage.initialDefinition.takeProfit.phases[p].formula.payload.uiObject.setValue(record.formulaValues[formulaValuesIndex])
                                    }
                                    formulaValuesIndex++
                                }

                                for (let k = 0; k < phase.announcements.length; k++) {

                                    let announcement = phase.announcements[k];
                                    designerTradingSystem.strategies[j].openStage.initialDefinition.takeProfit.phases[p].announcements[k].payload.uiObject.setErrorMessage(announcement.error)
                                    if (announcement.formula !== undefined) {
                                        designerTradingSystem.strategies[j].openStage.initialDefinition.takeProfit.phases[p].announcements[k].formula.payload.uiObject.setErrorMessage(announcement.formula.error)
                                    }
                                }

                                let nextPhaseEvent = phase.nextPhaseEvent;
                                if (nextPhaseEvent !== undefined) {
                                    designerTradingSystem.strategies[j].openStage.initialDefinition.takeProfit.phases[p].nextPhaseEvent.payload.uiObject.setErrorMessage(openStage.initialDefinition.takeProfit.phases[p].nextPhaseEvent.error)

                                    for (let k = 0; k < nextPhaseEvent.situations.length; k++) {

                                        let situation = nextPhaseEvent.situations[k];

                                        processSituation(situation, designerTradingSystem.strategies[j].openStage.initialDefinition.takeProfit.phases[p].nextPhaseEvent.situations[k]);
                                    }

                                    for (let k = 0; k < nextPhaseEvent.announcements.length; k++) {

                                        let announcement = nextPhaseEvent.announcements[k];
                                        designerTradingSystem.strategies[j].openStage.initialDefinition.takeProfit.phases[p].nextPhaseEvent.announcements[k].payload.uiObject.setErrorMessage(announcement.error)
                                        if (announcement.formula !== undefined) {
                                            designerTradingSystem.strategies[j].openStage.initialDefinition.takeProfit.phases[p].nextPhaseEvent.announcements[k].formula.payload.uiObject.setErrorMessage(announcement.formula.error)
                                        }
                                    }
                                }

                                for (let n = 0; n < phase.moveToPhaseEvents.length; n++) {
                                    let moveToPhaseEvent = phase.moveToPhaseEvents[n];
                                    if (moveToPhaseEvent !== undefined) {
                                        designerTradingSystem.strategies[j].openStage.initialDefinition.takeProfit.phases[p].moveToPhaseEvents[n].payload.uiObject.setErrorMessage(openStage.initialDefinition.takeProfit.phases[p].moveToPhaseEvent[n].error)

                                        for (let k = 0; k < moveToPhaseEvent.situations.length; k++) {

                                            let situation = moveToPhaseEvent.situations[k];

                                            processSituation(situation, designerTradingSystem.strategies[j].openStage.initialDefinition.takeProfit.phases[p].moveToPhaseEvents[n].situations[k]);
                                        }

                                        for (let k = 0; k < moveToPhaseEvent.announcements.length; k++) {

                                            let announcement = moveToPhaseEvent.announcements[k];
                                            designerTradingSystem.strategies[j].openStage.initialDefinition.takeProfit.phases[p].moveToPhaseEvents[n].announcements[k].payload.uiObject.setErrorMessage(announcement.error)
                                            if (announcement.formula !== undefined) {
                                                designerTradingSystem.strategies[j].openStage.initialDefinition.takeProfit.phases[p].moveToPhaseEvents[n].announcements[k].formula.payload.uiObject.setErrorMessage(announcement.formula.error)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    let openExecution = openStage.openExecution

                    if (openExecution !== undefined) {
                        designerTradingSystem.strategies[j].openStage.openExecution.payload.uiObject.setErrorMessage(openStage.openExecution.error)
                    }
                }

                let manageStage = strategy.manageStage

                if (manageStage !== undefined) {
                    designerTradingSystem.strategies[j].manageStage.payload.uiObject.setErrorMessage(manageStage.error)

                    if (manageStage.stopLoss !== undefined) {
                        designerTradingSystem.strategies[j].manageStage.stopLoss.payload.uiObject.setErrorMessage(manageStage.stopLoss.error)

                        for (let p = 0; p < manageStage.stopLoss.phases.length; p++) {

                            if (record.strategyIndex === j && record.variable_current_position_stopLoss_phase - 1 === p) {
                                designerTradingSystem.strategies[j].manageStage.stopLoss.phases[p].payload.uiObject.isExecuting = true
                            } else {
                                designerTradingSystem.strategies[j].manageStage.stopLoss.phases[p].payload.uiObject.isExecuting = false
                            }

                            let phase = manageStage.stopLoss.phases[p];
                            designerTradingSystem.strategies[j].manageStage.stopLoss.phases[p].payload.uiObject.setErrorMessage(manageStage.stopLoss.phases[p].error)

                            if (phase.formula !== undefined) {
                                designerTradingSystem.strategies[j].manageStage.stopLoss.phases[p].formula.payload.uiObject.setErrorMessage(manageStage.stopLoss.phases[p].formula.error)

                                if (record.formulaErrors[formulaErrorsIndex] !== "") {
                                    if (record.strategyIndex === j && record.variable_current_position_stopLoss_phase - 1 === p) {
                                        designerTradingSystem.strategies[j].manageStage.stopLoss.phases[p].formula.payload.uiObject.setErrorMessage(record.formulaErrors[formulaErrorsIndex])
                                    }
                                }
                                formulaErrorsIndex++
                                if (record.strategyIndex === j && record.variable_current_position_stopLoss_phase - 1 === p) {
                                    designerTradingSystem.strategies[j].manageStage.stopLoss.phases[p].formula.payload.uiObject.setValue(record.formulaValues[formulaValuesIndex])
                                }
                                formulaValuesIndex++
                            }

                            for (let k = 0; k < phase.announcements.length; k++) {

                                let announcement = phase.announcements[k];
                                designerTradingSystem.strategies[j].manageStage.stopLoss.phases[p].announcements[k].payload.uiObject.setErrorMessage(announcement.error)
                                if (announcement.formula !== undefined) {
                                    designerTradingSystem.strategies[j].manageStage.stopLoss.phases[p].announcements[k].formula.payload.uiObject.setErrorMessage(announcement.formula.error)
                                }
                            }

                            let nextPhaseEvent = phase.nextPhaseEvent;
                            if (nextPhaseEvent !== undefined) {
                                designerTradingSystem.strategies[j].manageStage.stopLoss.phases[p].nextPhaseEvent.payload.uiObject.setErrorMessage(manageStage.stopLoss.phases[p].nextPhaseEvent.error)

                                for (let k = 0; k < nextPhaseEvent.situations.length; k++) {

                                    let situation = nextPhaseEvent.situations[k];

                                    processSituation(situation, designerTradingSystem.strategies[j].manageStage.stopLoss.phases[p].nextPhaseEvent.situations[k]);
                                }

                                for (let k = 0; k < nextPhaseEvent.announcements.length; k++) {

                                    let announcement = nextPhaseEvent.announcements[k];
                                    designerTradingSystem.strategies[j].manageStage.stopLoss.phases[p].nextPhaseEvent.announcements[k].payload.uiObject.setErrorMessage(announcement.error)
                                    if (announcement.formula !== undefined) {
                                        designerTradingSystem.strategies[j].manageStage.stopLoss.phases[p].nextPhaseEvent.announcements[k].formula.payload.uiObject.setErrorMessage(announcement.formula.error)
                                    }
                                }
                            }

                            for (let n = 0; n < phase.moveToPhaseEvents.length; n++) {
                                let moveToPhaseEvent = phase.moveToPhaseEvents[n];
                                if (moveToPhaseEvent !== undefined) {
                                    designerTradingSystem.strategies[j].manageStage.stopLoss.phases[p].moveToPhaseEvent[n].payload.uiObject.setErrorMessage(manageStage.stopLoss.phases[p].moveToPhaseEvent[n].error)

                                    for (let k = 0; k < moveToPhaseEvent.situations.length; k++) {

                                        let situation = moveToPhaseEvent.situations[k];

                                        processSituation(situation, designerTradingSystem.strategies[j].manageStage.stopLoss.phases[p].moveToPhaseEvent[n].situations[k]);
                                    }

                                    for (let k = 0; k < moveToPhaseEvent.announcements.length; k++) {

                                        let announcement = moveToPhaseEvent.announcements[k];
                                        designerTradingSystem.strategies[j].manageStage.stopLoss.phases[p].moveToPhaseEvent[n].announcements[k].payload.uiObject.setErrorMessage(announcement.error)
                                        if (announcement.formula !== undefined) {
                                            designerTradingSystem.strategies[j].manageStage.stopLoss.phases[p].moveToPhaseEvent[n].announcements[k].formula.payload.uiObject.setErrorMessage(announcement.formula.error)
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (manageStage.takeProfit !== undefined) {
                        designerTradingSystem.strategies[j].manageStage.takeProfit.payload.uiObject.setErrorMessage(manageStage.takeProfit.error)

                        for (let p = 0; p < manageStage.takeProfit.phases.length; p++) {

                            if (record.strategyIndex === j && record.variable_current_position_takeProfit_phase - 1 === p) {
                                designerTradingSystem.strategies[j].manageStage.takeProfit.phases[p].payload.uiObject.isExecuting = true
                            } else {
                                designerTradingSystem.strategies[j].manageStage.takeProfit.phases[p].payload.uiObject.isExecuting = false
                            }

                            let phase = manageStage.takeProfit.phases[p];
                            designerTradingSystem.strategies[j].manageStage.takeProfit.phases[p].payload.uiObject.setErrorMessage(manageStage.takeProfit.phases[p].error)

                            if (phase.formula !== undefined) {
                                designerTradingSystem.strategies[j].manageStage.takeProfit.phases[p].formula.payload.uiObject.setErrorMessage(manageStage.takeProfit.phases[p].formula.error)

                                if (record.formulaErrors[formulaErrorsIndex] !== "") {
                                    if (record.strategyIndex === j && record.variable_current_position_takeProfit_phase - 1 === p) {
                                        designerTradingSystem.strategies[j].manageStage.takeProfit.phases[p].formula.payload.uiObject.setErrorMessage(record.formulaErrors[formulaErrorsIndex])
                                    }
                                }
                                formulaErrorsIndex++

                                if (record.strategyIndex === j && record.variable_current_position_takeProfit_phase - 1 === p) {
                                    designerTradingSystem.strategies[j].manageStage.takeProfit.phases[p].formula.payload.uiObject.setValue(record.formulaValues[formulaValuesIndex])
                                }
                                formulaValuesIndex++
                            }

                            for (let k = 0; k < phase.announcements.length; k++) {

                                let announcement = phase.announcements[k];
                                designerTradingSystem.strategies[j].manageStage.takeProfit.phases[p].announcements[k].payload.uiObject.setErrorMessage(announcement.error)
                                if (announcement.formula !== undefined) {
                                    designerTradingSystem.strategies[j].manageStage.takeProfit.phases[p].announcements[k].formula.payload.uiObject.setErrorMessage(announcement.formula.error)
                                }
                            }

                            let nextPhaseEvent = phase.nextPhaseEvent;
                            if (nextPhaseEvent !== undefined) {
                                designerTradingSystem.strategies[j].manageStage.takeProfit.phases[p].nextPhaseEvent.payload.uiObject.setErrorMessage(manageStage.takeProfit.phases[p].nextPhaseEvent.error)

                                for (let k = 0; k < nextPhaseEvent.situations.length; k++) {

                                    let situation = nextPhaseEvent.situations[k];

                                    processSituation(situation, designerTradingSystem.strategies[j].manageStage.takeProfit.phases[p].nextPhaseEvent.situations[k]);
                                }

                                for (let k = 0; k < nextPhaseEvent.announcements.length; k++) {

                                    let announcement = nextPhaseEvent.announcements[k];
                                    designerTradingSystem.strategies[j].manageStage.takeProfit.phases[p].nextPhaseEvent.announcements[k].payload.uiObject.setErrorMessage(announcement.error)
                                    if (announcement.formula !== undefined) {
                                        designerTradingSystem.strategies[j].manageStage.takeProfit.phases[p].nextPhaseEvent.announcements[k].formula.payload.uiObject.setErrorMessage(announcement.formula.error)
                                    }
                                }
                            }
                            for (let n = 0; n < phase.moveToPhaseEvents.length; n++) {
                                let moveToPhaseEvent = phase.moveToPhaseEvents[n];
                                if (moveToPhaseEvent !== undefined) {
                                    designerTradingSystem.strategies[j].manageStage.takeProfit.phases[p].moveToPhaseEvents[n].payload.uiObject.setErrorMessage(manageStage.takeProfit.phases[p].moveToPhaseEvents[n].error)

                                    for (let k = 0; k < moveToPhaseEvent.situations.length; k++) {

                                        let situation = moveToPhaseEvent.situations[k];

                                        processSituation(situation, designerTradingSystem.strategies[j].manageStage.takeProfit.phases[p].moveToPhaseEvents[n].situations[k]);
                                    }

                                    for (let k = 0; k < moveToPhaseEvent.announcements.length; k++) {

                                        let announcement = moveToPhaseEvent.announcements[k];
                                        designerTradingSystem.strategies[j].manageStage.takeProfit.phases[p].moveToPhaseEvents[n].announcements[k].payload.uiObject.setErrorMessage(announcement.error)
                                        if (announcement.formula !== undefined) {
                                            designerTradingSystem.strategies[j].manageStage.takeProfit.phases[p].moveToPhaseEvents[n].announcements[k].formula.payload.uiObject.setErrorMessage(announcement.formula.error)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }


                let closeStage = strategy.closeStage

                if (closeStage !== undefined) {
                    designerTradingSystem.strategies[j].closeStage.payload.uiObject.setErrorMessage(closeStage.error)

                    let closeExecution = closeStage.closeExecution

                    if (closeExecution !== undefined) {
                        designerTradingSystem.strategies[j].closeStage.closeExecution.payload.uiObject.setErrorMessage(closeStage.closeExecution.error)
                    }
                }
            }

            function processSituation(situation, node) {

                node.payload.uiObject.setErrorMessage(situation.error)

                let highlightSituation = true

                for (let m = 0; m < situation.conditions.length; m++) {

                    let condition = node.conditions[m]
                    if (condition !== undefined) {
                        condition.payload.uiObject.setErrorMessage(situation.conditions[m].error)

                        if (situation.conditions[m].javascriptCode !== undefined) {
                            if (condition.javascriptCode !== undefined) {
                                condition.javascriptCode.payload.uiObject.setErrorMessage(situation.conditions[m].javascriptCode.error)
                            }
                        }

                        if (record.conditionsValues[conditionIndex] === 1) {
                            condition.payload.uiObject.highlight()
                        } else {
                            highlightSituation = false
                        }
                        conditionIndex++;
                    }
                }

                if (highlightSituation === true) {
                    node.payload.uiObject.highlight()
                }
            }


            browserCanvasContext.closePath();
            browserCanvasContext.fill();

        } catch (err) {
            if (ERROR_LOG === true) { logger.write("[ERROR] sendRecordInfoToDesignerSpace -> err = " + err.stack); }
        }
    }



    function onViewportZoomChanged(event) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onViewportZoomChanged -> Entering function."); }

            recalculate();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onViewportZoomChanged -> err = " + err.stack); }
        }
    }

    function onViewportPositionChanged(event) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onViewportPositionChanged -> Entering function."); }

            if (event !== undefined) {
                if (event.recalculate === true) {
                    recalculate()
                    return
                }
            }
            if (Math.random() * 100 > 95) {
                recalculate()
            };

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onViewportPositionChanged -> err = " + err.stack); }
        }
    }

    function onDragFinished() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onDragFinished -> Entering function."); }

            recalculate();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onDragFinished -> err = " + err.stack); }
        }
    }
}






















