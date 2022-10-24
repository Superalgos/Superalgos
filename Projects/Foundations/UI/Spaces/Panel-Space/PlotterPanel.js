
function newPlotterPanel() {
    const MODULE_NAME = 'Plotter Panel'
    const ERROR_LOG = true
    const logger = newWebDebugLog()


    let thisObject = {
        fitFunction: undefined,
        container: undefined,
        isVisible: true,
        onRecordChange: onRecordChange,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize,
        finalize: finalize
    }

    thisObject.container = newContainer()
    thisObject.container.initialize('Plotter Panel')

    let heightFactor = 1
    let currentRecord
    let upDownButton
    let panelNode
    let recordSet = new Map()
    let configStyle


    return thisObject

    function finalize() {
        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.fitFunction = undefined
        thisObject.isVisible = undefined

        heightFactor = undefined
        currentRecord = undefined
        recordSet = undefined
        upDownButton.finalize()
        upDownButton = undefined
        panelNode = undefined
    }

    function initialize(pPanelNode) {
        panelNode = pPanelNode
        thisObject.container.frame.containerName = panelNode.name

        thisObject.container.frame.width = UI_PANEL.WIDTH.NORMAL
        thisObject.container.frame.height = UI_PANEL.HEIGHT.NORMAL

        thisObject.container.frame.position.x = UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.topRight.x - thisObject.container.frame.width - thisObject.container.frame.width * Math.random() * 8
        thisObject.container.frame.position.y = UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.bottomLeft.y - thisObject.container.frame.height - thisObject.container.frame.height * Math.random() * 1.5

        upDownButton = newUpDownButton()
        upDownButton.parentContainer = thisObject.container
        upDownButton.container.frame.parentFrame = thisObject.container.frame
        upDownButton.fitFunction = thisObject.fitFunction
        upDownButton.initialize()
    }

    function getContainer(point) {
        if (thisObject.isVisible !== true) { return }
        let container

        container = upDownButton.getContainer(point)
        if (container !== undefined) { return container }

        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            let checkPoint = {
                x: point.x,
                y: point.y
            }

            checkPoint = thisObject.fitFunction(checkPoint)

            if (point.x === checkPoint.x && point.y === checkPoint.y) {
                return thisObject.container
            }
        }
    }

    function onRecordChange(pCurrentRecord) {

        if (currentRecord !== undefined && pCurrentRecord !== undefined) {
            /*
            We want to prevent pannels showing the last record which overlap / shadow all the others (think episodes in daily)
            For that reason if we already have a record, we ignore the others.
            */
            return
        }

        currentRecord = pCurrentRecord
        if (currentRecord === undefined) {
            recordSet = new Map()
            currentRecord = undefined
            return
        }

        if (currentRecord.index !== undefined) {
            /*
            There is a situation when we expect to receive many records
            that are part of a set. We will know when when we detect the 
            property index. In that situation we will build the recordset 
            by adding each record to a Map by index.
            */
            recordSet.set(currentRecord.index, currentRecord)
        }
    }

    function draw() {
        if (thisObject.isVisible !== true) { return }

        thisObject.container.frame.draw(false, false, true, thisObject.fitFunction)
        plotCurrentRecordData()
        upDownButton.draw()
    }

    function plotCurrentRecordData() {
        const frameBodyHeight = thisObject.container.frame.getBodyHeight()
        const frameTitleHeight = thisObject.container.frame.height - frameBodyHeight

        const X_AXIS_A = thisObject.container.frame.width * 1 / 8
        const X_AXIS_B = thisObject.container.frame.width * 7 / 8
        const Y_AXIS = frameTitleHeight + frameBodyHeight / 2

        const PANEL_HEIGHT = UI_PANEL.HEIGHT.NORMAL

        if (currentRecord === undefined) { return }
        let record = currentRecord


        /* Second we go through the panel data. */
        if (panelNode.panelData === undefined) { return }
        for (let i = 0; i < panelNode.panelData.length; i++) {
            let panelData = panelNode.panelData[i]

            // These variables are declared for use with the below JavaScript code node (optional)
            let labelText = panelData.name
            let labelPosition = i * 10 + 12
            let valuePosition = i * 10 + 17
            let value = 'No value defined.'
            let valueColor
            let valueY
            let textSize
            let textColor
            let textOpacity
            let textY
            let valueOpacity
            let valueFontSize
            
            
            /**If the Panel Data Javascript Code node is found we run the code found at that location now. */
            if (panelData.panelDataJavascriptCode !== undefined) {
                try {
                    eval(panelData.panelDataJavascriptCode.code)
                } catch (err) {
                    if (ERROR_LOG === true) { logger.write('[ERROR] plotCurrentRecordData -> err = ' + err.stack) }
                    if (ERROR_LOG === true) { logger.write('[ERROR] plotCurrentRecordData -> panelDataJavascriptCode.code = ' + panelData.panelDataJavascriptCode.code) }
                }
            }

            let chartingSpaceNode = UI.projects.workspaces.spaces.designSpace.workspace.getHierarchyHeadByNodeType('Charting Space')
            if (chartingSpaceNode !== undefined) {
                if (chartingSpaceNode.spaceStyle !== undefined) {
                    configStyle = JSON.parse(chartingSpaceNode.spaceStyle.config)
                }
            } else {
                configStyle = undefined
            }


            if (valuePosition > 100) {thisObject.container.frame.height = UI_PANEL.HEIGHT.NORMAL * 1.25}
            
            if (valuePosition > 125) {thisObject.container.frame.height = UI_PANEL.HEIGHT.NORMAL * 1.50}

            if (valuePosition > 150) {thisObject.container.frame.height = UI_PANEL.HEIGHT.NORMAL * 1.75}

            if (valuePosition > 175) {thisObject.container.frame.height = UI_PANEL.HEIGHT.NORMAL * 2.00}

            if (panelData.dataFormula !== undefined) {
                try {
                    value = eval(panelData.dataFormula.code)
                } catch (err) {
                    if (ERROR_LOG === true) { logger.write('[ERROR] plotCurrentRecordData -> err = ' + err.stack) }
                    if (ERROR_LOG === true) { logger.write('[ERROR] plotCurrentRecordData -> dataFormula.code = ' + panelData.dataFormula.code) }
                }
            }

            if (panelData.config.valueDecimals !== undefined) {
                if (value !== undefined) {
                    if (isNaN(value) === false) {
                        value = dynamicDecimals(value, panelData.config.valueDecimals)
                    }
                }
            }

            // This is used to override the text output with desired text
            if (panelData.config.labelText !== undefined) {
                labelText = panelData.config.labelText
            }
            // This is used if the text and value y calculation
            if (panelData.config.labelPosition !== undefined) {
                labelPosition = panelData.config.labelPosition
            }
            // This is used if the text and value y calculation
            if (panelData.config.valuePosition !== undefined) {
                valuePosition = panelData.config.valuePosition
            }


            switch (undefined) {
                case (valueFontSize): {
                    valueFontSize = 14
                } 
                case (textSize): {
                    textSize = 14
                } 
                case (textColor): {
                    if (configStyle === undefined || configStyle.indicatorFrameTextColor === undefined) {
                        textColor = UI_COLOR.DARK
                    } else {
                        textColor = eval(configStyle.indicatorFrameTextColor)
                    }
                } 
                case (valueColor): {
                    valueColor = textColor
                }
                case (valueOpacity): {
                    valueOpacity = '1'
                }
                case (textOpacity): {
                    textOpacity = '1'
                }
                case (textY): {
                    textY = UI_PANEL.HEIGHT.NORMAL * labelPosition / 100 / heightFactor
                } 
                case (valueY): {
                    valueY = UI_PANEL.HEIGHT.NORMAL * valuePosition / 100 / heightFactor
                } 
            }



            if (panelData.textStyle !== undefined) {
                if (panelData.textStyle.config.valueFontSize !== undefined) { valueFontSize = eval(panelData.textStyle.config.valueFontSize) }
                if (panelData.textStyle.config.valueFontSize !== undefined) { textSize = eval(panelData.textStyle.config.valueFontSize) }
                if (panelData.textStyle.config.opacity !== undefined) { textOpacity = eval(panelData.textStyle.config.opacity) }
                if (panelData.textStyle.config.opacity !== undefined) { valueOpacity = eval(panelData.textStyle.config.opacity) }
                if (panelData.textStyle.config.paletteColor !== undefined) { textColor = eval(panelData.textStyle.config.paletteColor) }
                if (panelData.textStyle.config.paletteColor !== undefined) { valueColor = eval(panelData.textStyle.config.paletteColor) }
            }


            UI.projects.foundations.utilities.drawPrint.printLabel(
                labelText,
                X_AXIS_A,
                undefined,
                undefined,
                textY,
                textOpacity,
                textSize,
                textColor,
                'Left',
                thisObject.container,
                thisObject.fitFunction
            )

            UI.projects.foundations.utilities.drawPrint.printLabel(
                value,
                X_AXIS_A,
                X_AXIS_B,
                undefined,
                valueY,
                valueOpacity,
                valueFontSize,
                valueColor,
                'Left Numbers at Right',
                thisObject.container,
                thisObject.fitFunction,
                false,
                true,
                undefined,
                true
            )
        }
    }
}
