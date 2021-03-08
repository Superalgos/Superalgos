
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

        thisObject.container.frame.position.x = UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.topRight.x - thisObject.container.frame.width - thisObject.container.frame.width * Math.random() * 8
        thisObject.container.frame.position.y = UI.projects.superalgos.spaces.chartingSpace.viewport.visibleArea.bottomLeft.y - thisObject.container.frame.height - thisObject.container.frame.height * Math.random() * 1.5

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
        currentRecord = pCurrentRecord

        if (currentRecord === undefined) {
            recordSet = new Map()
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

        /* First we execute code if provided. */
        if (panelNode.plotterPanelJavascriptCode !== undefined) {
            try {
                eval(panelNode.plotterPanelJavascriptCode.code)
            } catch (err) {
                if (ERROR_LOG === true) { logger.write('[ERROR] plotCurrentRecordData -> err = ' + err.stack) }
                if (ERROR_LOG === true) { logger.write('[ERROR] plotCurrentRecordData -> plotterPanelJavascriptCode.code = ' + panelNode.plotterPanelJavascriptCode.code) }
            }
        }

        /* Second we go through the panel data. */
        if (panelNode.panelData === undefined) { return }
        for (let i = 0; i < panelNode.panelData.length; i++) {
            let panelData = panelNode.panelData[i]

            let labelText = panelData.name
            let labelPosition = i * 10 + 12
            let valuePosition = i * 10 + 17
            let value = 'No value defined.'

            if (valuePosition > 100) {
                thisObject.container.frame.height = UI_PANEL.HEIGHT.NORMAL * 1.25
            }

            if (valuePosition > 125) {
                thisObject.container.frame.height = UI_PANEL.HEIGHT.NORMAL * 1.50
            }

            if (valuePosition > 150) {
                thisObject.container.frame.height = UI_PANEL.HEIGHT.NORMAL * 1.75
            }

            if (valuePosition > 175) {
                thisObject.container.frame.height = UI_PANEL.HEIGHT.NORMAL * 2.00
            }

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

            if (panelData.config.labelText !== undefined) {
                labelText = panelData.config.labelText
            }

            if (panelData.config.labelPosition !== undefined) {
                labelPosition = panelData.config.labelPosition
            }

            if (panelData.config.valuePosition !== undefined) {
                valuePosition = panelData.config.valuePosition
            }

            let opacity = '1.00'
            let fontSize = 14
            let paletteColor

            if (panelData.textStyle !== undefined) {
                if (panelData.textStyle.config.fontSize !== undefined) { fontSize = panelData.textStyle.config.fontSize }
                if (panelData.textStyle.config.opacity !== undefined) { opacity = panelData.textStyle.config.opacity }
                if (panelData.textStyle.config.paletteColor !== undefined) { paletteColor = eval(panelData.textStyle.config.paletteColor) }
            }

            UI.projects.superalgos.utilities.drawPrint.printLabel(
                labelText,
                X_AXIS_A,
                undefined,
                undefined,
                UI_PANEL.HEIGHT.NORMAL * labelPosition / 100 / heightFactor,
                '0.60',
                undefined,
                undefined,
                'Left',
                thisObject.container,
                thisObject.fitFunction
            )

            UI.projects.superalgos.utilities.drawPrint.printLabel(
                value,
                X_AXIS_A,
                X_AXIS_B,
                undefined,
                UI_PANEL.HEIGHT.NORMAL * valuePosition / 100 / heightFactor,
                opacity,
                fontSize,
                paletteColor,
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
