


function newChartLayersPanel() {

    const BUTTONS_STATES = {
        ON: 'on',
        INVISIBLE: 'invisible',
        OFF: 'off'
    };

    const LAYER_NAMES = {
        OLIVIA_CANDLES: 'Olivia Candlesticks',
        OLIVIA_VOLUMES: 'Olivia Volumes',
        TOM_CANDLE_STAIRS: 'Tom Candle-Stairs',
        TOM_VOLUME_STAIRS: 'Tom Volume-Stairs',
        MARIAM_TRADE_HISTORY: 'Mariam Trades History',
        MARIAM_TRADES_DETAILS: 'Mariam Trades Details',
        ATH: 'All-time Highs and Lows',
        HIGH_LOWS: 'High and Lows',
        FORECAST: 'Forecast',
        ORDER_BOOKS: 'Order Books',
        CANDLE_STAIRS: 'Candle Stairs',
        VOLUME_STAIRS: 'Volume Stairs',
        BUY_SELL_BALANCE: 'Buy Sell Balance',
        LINEAR_REGRESION_CURVE: 'Linear Regression Curve'
    };

    var chartLayersPanel = {
        container: undefined,
        buttons: undefined,
        getLayerStatus: getLayerStatus,
        layerNames: LAYER_NAMES,
        draw: draw,
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    container.isDraggeable = true;
    container.isZoomeable = false;
    chartLayersPanel.container = container;
    chartLayersPanel.container.frame.containerName = "Chart Layers Panel";

    let isInitialized = false;
    let buttons;

    return chartLayersPanel;




    function initialize() {

        this.container.frame.width = 200;
        this.container.frame.height = 200;

        var position = {
            x: viewPort.visibleArea.topRight.x - this.container.frame.width,
            y: viewPort.visibleArea.bottomRight.y - this.container.frame.height
        };

        this.container.frame.position = position;

        var buttonPosition;

        var buttonNames = [
            LAYER_NAMES.OLIVIA_CANDLES,
            LAYER_NAMES.OLIVIA_VOLUMES,
            LAYER_NAMES.TOM_CANDLE_STAIRS,
            LAYER_NAMES.MARIAM_TRADES_DETAILS,
            LAYER_NAMES.MARIAM_TRADE_HISTORY,
            LAYER_NAMES.MARIAM_TRADE_HISTORY,
            LAYER_NAMES.ATH,
            LAYER_NAMES.HIGH_LOWS,
            LAYER_NAMES.FORECAST,
            LAYER_NAMES.ORDER_BOOKS,
            LAYER_NAMES.CANDLE_STAIRS,
            LAYER_NAMES.VOLUME_STAIRS,
            LAYER_NAMES.BUY_SELL_BALANCE,
            LAYER_NAMES.LINEAR_REGRESION_CURVE
        ];
        var lastY = 5;
        buttons = [];

        for (var i = 0; i < buttonNames.length; i++) {

            /* Buttons are going to be one at the right of the other. */

            var textButton = newTextButton();
            textButton.type = buttonNames[i];

            textButton.container.displacement.parentDisplacement = this.container.displacement;
            textButton.container.zoom.parentZoom = this.container.zoom;
            textButton.container.frame.parentFrame = this.container.frame;

            textButton.container.parentContainer = this.container;

            textButton.initialize();

            buttonPosition = {  // The first textButton 
                x: 10,
                y: chartLayersPanel.container.frame.height - chartLayersPanel.container.frame.getBodyHeight()
            };
            textButton.container.frame.position.x = buttonPosition.x;
            textButton.container.frame.position.y = buttonPosition.y + lastY;

            lastY = lastY + textButton.container.frame.height;

            /*  We start listening to the buttons click event, so as to know when one was pressed. */

            textButton.container.eventHandler.listenToEvent('onMouseClick', buttonPressed, i);

            let storedValue = window.localStorage.getItem(textButton.type);

            if (storedValue !== null) {

                textButton.status = storedValue; 

            } else {

                textButton.status = BUTTONS_STATES.ON; 

            }

            buttons.push(textButton);

            let eventData = {
                layer: textButton.type,
                status: textButton.status
            }

            chartLayersPanel.container.eventHandler.raiseEvent('Layer Status Changed', eventData);
        }

        chartLayersPanel.buttons = buttons;

        isInitialized = true;

    }


    function getLayerStatus(layerName) {

        for (let i = 0; i < buttons.length; i++) {

            let button = buttons[i];

            if (button.type === layerName) {

                return button.status;

            }

        }

        return BUTTONS_STATES.OFF;
    }


    function getContainer(point) {



        var container;

        /* First we check if this point is inside this space. */

        if (this.container.frame.isThisPointHere(point, true) === true) {

            /* Now we see which is the inner most container that has it */


            for (var i = 0; i < this.buttons.length; i++) {

                container = this.buttons[i].getContainer(point);

                if (container !== undefined) {

                    /* We found an inner container which has the point. We return it. */

                    return container;
                }
            }

            /* The point does not belong to any inner container, so we return the current container. */

            return this.container;

        } else {

            /* This point does not belong to this space. */

            return undefined;
        }

    }




    function buttonPressed(event, buttonPressedIndex) {

        switch (chartLayersPanel.buttons[buttonPressedIndex].status) {

            case BUTTONS_STATES.ON:
                chartLayersPanel.buttons[buttonPressedIndex].status = BUTTONS_STATES.INVISIBLE;
                break;

            case BUTTONS_STATES.INVISIBLE:
                chartLayersPanel.buttons[buttonPressedIndex].status = BUTTONS_STATES.OFF;
                break;

            case BUTTONS_STATES.OFF:
                chartLayersPanel.buttons[buttonPressedIndex].status = BUTTONS_STATES.ON;
                break;

        }


        let eventData = {
            layer: chartLayersPanel.buttons[buttonPressedIndex].type,
            status: chartLayersPanel.buttons[buttonPressedIndex].status
        }

        chartLayersPanel.container.eventHandler.raiseEvent('Layer Status Changed', eventData);

        window.localStorage.setItem(chartLayersPanel.buttons[buttonPressedIndex].type, chartLayersPanel.buttons[buttonPressedIndex].status);

    }



    function draw() {

        if (isInitialized === false) {return;}

        chartLayersPanel.container.frame.draw(false, false, true);

        for (var i = 0; i < chartLayersPanel.buttons.length; i++) {
            chartLayersPanel.buttons[i].draw();
        }

    }





}