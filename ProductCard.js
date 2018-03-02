function newProductCard() {

    const CONSOLE_LOG = true;

    var thisObject = {
        container: undefined,
        draw: draw,
        status: 'off',
        devTeam: undefined,
        bot: undefined,
        product: undefined,
        code: undefined,
        onMarketFileLoaded: onMarketFileLoaded, 
        onDailyFileLoaded: onDailyFileLoaded, 
        onSingleFileLoaded: onSingleFileLoaded, 
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize
    };

    let LOADING_FILL_STYLE = 'rgba(234, 143, 23, 0.5)';
    let LOADED_FILL_STYLE = 'rgba(45, 232, 28, 0.5)';
    let UNLOADED_FILL_STYLE = 'rgba(226, 226, 226, 0.5)';

    let LOADING_STROKE_STYLE = 'rgba(234, 143, 23, 0.5)';
    let LOADED_STROKE_STYLE = 'rgba(150, 150, 150, 0.5)';
    let UNLOADED_STROKE_STYLE = 'rgba(226, 226, 226, 0.5)';

    let marketFileProgressBar = {
        value: 100,
        fillStyle: UNLOADED_FILL_STYLE,
        strokeStyle: UNLOADED_STROKE_STYLE
    };

    let dailyFileProgressBar = {
        value: 100,
        fillStyle: UNLOADED_FILL_STYLE,
        strokeStyle: UNLOADED_STROKE_STYLE
    };

    let singleFileProgressBar = {
        value: 100,
        fillStyle: UNLOADED_FILL_STYLE,
        strokeStyle: UNLOADED_STROKE_STYLE
    };

    return thisObject;

    function initialize() {

        /* Create this objects continer */

        var container = newContainer();
        container.name = "Product Card " + thisObject.code;
        container.initialize();
        container.isDraggeable = false;
        container.isZoomeable = false;
        container.isClickeable = true;
        thisObject.container = container;

        /* Lets set the basic dimensions of this thisObject. */

        var position = {
            x: 0,
            y: 0
        };

        this.container.frame.position = position;
        this.container.frame.width = 280;
        this.container.frame.height = 60;

        /* We retrieve the locally stored status of the Product */

        let storedValue = window.localStorage.getItem(thisObject.code);

        if (storedValue !== null) {

            thisObject.status = storedValue;

        } else {

            thisObject.status = PRODUCT_CARD_STATUS.ON;

            /* Save the value for future use */

            window.localStorage.setItem(thisObject.code, thisObject.status);

        }

        /* Lets listen to our own events to react when we have a Mouse Click */

        thisObject.container.eventHandler.listenToEvent('onMouseClick', buttonPressed);

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

    function onMarketFileLoaded(event) {

        if (event.currentValue === event.totalValue) {

            marketFileProgressBar = {
                value: 100,
                fillStyle: LOADED_FILL_STYLE,
                strokeStyle: LOADED_STROKE_STYLE
            };

        } else {

            marketFileProgressBar = {
                value: Math.trunc(event.currentValue * 100 / event.totalValue),
                fillStyle: LOADING_FILL_STYLE,
                strokeStyle: LOADING_STROKE_STYLE
            };

        }

        if (CONSOLE_LOG === true) {

            console.log("ProductCard onMarketFileLoaded Value = " + marketFileProgressBar.value + "% for " + thisObject.code);

        }
    }

    function onDailyFileLoaded(event) {

        if (event.currentValue === event.totalValue) {

            dailyFileProgressBar = {
                value: 100,
                fillStyle: LOADED_FILL_STYLE,
                strokeStyle: LOADED_STROKE_STYLE
            };

        } else {

            dailyFileProgressBar = {
                value: Math.trunc(event.currentValue * 100 / event.totalValue),
                fillStyle: LOADING_FILL_STYLE,
                strokeStyle: LOADING_STROKE_STYLE
            };

        }

        if (CONSOLE_LOG === true) {

            console.log("ProductCard onDailyFileLoaded Value = " + dailyFileProgressBar.value + "% for " + thisObject.code);

        }
    }

    function onSingleFileLoaded(event) {

        if (event.currentValue === event.totalValue) {

            singleFileProgressBar = {
                value: 100,
                fillStyle: LOADED_FILL_STYLE,
                strokeStyle: LOADED_STROKE_STYLE
            };

        } else {

            singleFileProgressBar = {
                value: Math.trunc(event.currentValue * 100 / event.totalValue),
                fillStyle: LOADING_FILL_STYLE,
                strokeStyle: LOADING_STROKE_STYLE
            };

        }

        if (CONSOLE_LOG === true) {

            console.log("ProductCard onSingleFileLoaded Value = " + singleFileProgressBar.value + "% for " + thisObject.code);

        }
    }

    function buttonPressed(event) {

        switch (thisObject.status) {

            case PRODUCT_CARD_STATUS.ON:
                thisObject.status = PRODUCT_CARD_STATUS.OFF;
                break;

            case PRODUCT_CARD_STATUS.OFF:
                thisObject.status = PRODUCT_CARD_STATUS.ON;
                break;

        }

        let eventData = thisObject;

        thisObject.container.eventHandler.raiseEvent('Status Changed', eventData);

        window.localStorage.setItem(thisObject.code, thisObject.status);

    }

    function draw() {

        drawProductCard();

    }

    function drawProductCard() {

        centerPoint = {
            x: 7,
            y: 7
        };

        /* Now the transformations. */

        centerPoint = thisObject.container.frame.frameThisPoint(centerPoint);

        /* Lets start the drawing. */

        browserCanvasContext.beginPath();
        browserCanvasContext.arc(centerPoint.x, centerPoint.y, 3, 0, 2 * Math.PI);
        browserCanvasContext.closePath();

        let offFillStyle = 'rgba(232, 28, 28, 1)';
        let onFillStyle = 'rgba(45, 232, 28, 1)';

        switch (thisObject.status) {

            case PRODUCT_CARD_STATUS.ON:
                browserCanvasContext.fillStyle = onFillStyle;
                break;

            case PRODUCT_CARD_STATUS.OFF:
                browserCanvasContext.fillStyle = offFillStyle;
                break;

        }

        browserCanvasContext.fill();

        browserCanvasContext.strokeStyle = 'rgba(150, 150, 150, 1)';
        browserCanvasContext.lineWidth = 1;
        browserCanvasContext.stroke();

        browserCanvasContext.closePath();

        /* print the text */

        let labelPoint;
        let fontSize = 10;

        browserCanvasContext.font = fontSize + 'px Courier New';

        let label;

        let xOffset;
        let yOffset;

        /* devTeam */

        label = "Dev Team: " + thisObject.devTeam.displayName;

        xOffset = 0;
        yOffset = 0;

        labelPoint = {
            x: 20,
            y: thisObject.container.frame.height - 45
        };

        labelPoint = thisObject.container.frame.frameThisPoint(labelPoint);

        browserCanvasContext.fillStyle = 'rgba(60, 60, 60, 0.50)';
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y);

        /* bot */

        label = "Bot: " + thisObject.bot.displayName;

        labelPoint = {
            x: 20,
            y: thisObject.container.frame.height - 30
        };

        labelPoint = thisObject.container.frame.frameThisPoint(labelPoint);

        browserCanvasContext.fillStyle = 'rgba(60, 60, 60, 0.50)';
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y);

        /* product */

        label = "Product: " + thisObject.product.displayName;

        labelPoint = {
            x: 20,
            y: thisObject.container.frame.height - 15
        };

        labelPoint = thisObject.container.frame.frameThisPoint(labelPoint);

        browserCanvasContext.fillStyle = 'rgba(60, 60, 60, 0.50)';
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y);

        let point1;
        let point2;
        let point3;
        let point4;

        /* We draw here the Market Progress Bar. */

        point1 = {
            x: 0,
            y: thisObject.container.frame.height - 1
        };

        point2 = {
            x: thisObject.container.frame.width * marketFileProgressBar.value / 100,
            y: thisObject.container.frame.height - 1
        };

        point3 = {
            x: thisObject.container.frame.width * marketFileProgressBar.value / 100,
            y: thisObject.container.frame.height - 3
        };

        point4 = {
            x: 0,
            y: thisObject.container.frame.height - 3
        };

        /* Now the transformations. */

        point1 = thisObject.container.frame.frameThisPoint(point1);
        point2 = thisObject.container.frame.frameThisPoint(point2);
        point3 = thisObject.container.frame.frameThisPoint(point3);
        point4 = thisObject.container.frame.frameThisPoint(point4);

        browserCanvasContext.beginPath();
        browserCanvasContext.moveTo(point1.x, point1.y);
        browserCanvasContext.lineTo(point2.x, point2.y);
        browserCanvasContext.lineTo(point3.x, point3.y);
        browserCanvasContext.lineTo(point4.x, point4.y);
        browserCanvasContext.closePath();

        browserCanvasContext.fillStyle = marketFileProgressBar.fillStyle;
        browserCanvasContext.strokeStyle = marketFileProgressBar.strokeStyle;

        browserCanvasContext.fill();
        browserCanvasContext.lineWidth = 0.1;
        browserCanvasContext.stroke();

        /* We draw here the Daily Progress Bar. */

        point1 = {
            x: 0,
            y: thisObject.container.frame.height - 4
        };

        point2 = {
            x: thisObject.container.frame.width * dailyFileProgressBar.value / 100,
            y: thisObject.container.frame.height - 4
        };

        point3 = {
            x: thisObject.container.frame.width * dailyFileProgressBar.value / 100,
            y: thisObject.container.frame.height - 6
        };

        point4 = {
            x: 0,
            y: thisObject.container.frame.height - 6
        };

        /* Now the transformations. */

        point1 = thisObject.container.frame.frameThisPoint(point1);
        point2 = thisObject.container.frame.frameThisPoint(point2);
        point3 = thisObject.container.frame.frameThisPoint(point3);
        point4 = thisObject.container.frame.frameThisPoint(point4);

        browserCanvasContext.beginPath();
        browserCanvasContext.moveTo(point1.x, point1.y);
        browserCanvasContext.lineTo(point2.x, point2.y);
        browserCanvasContext.lineTo(point3.x, point3.y);
        browserCanvasContext.lineTo(point4.x, point4.y);
        browserCanvasContext.closePath();

        browserCanvasContext.fillStyle = dailyFileProgressBar.fillStyle;
        browserCanvasContext.strokeStyle = dailyFileProgressBar.strokeStyle;

        browserCanvasContext.fill();
        browserCanvasContext.lineWidth = 0.1;
        browserCanvasContext.stroke();

        /* We draw here the Single File Progress Bar. */

        point1 = {
            x: 0,
            y: thisObject.container.frame.height - 7
        };

        point2 = {
            x: thisObject.container.frame.width * singleFileProgressBar.value / 100,
            y: thisObject.container.frame.height - 7
        };

        point3 = {
            x: thisObject.container.frame.width * singleFileProgressBar.value / 100,
            y: thisObject.container.frame.height - 9
        };

        point4 = {
            x: 0,
            y: thisObject.container.frame.height - 9
        };

        /* Now the transformations. */

        point1 = thisObject.container.frame.frameThisPoint(point1);
        point2 = thisObject.container.frame.frameThisPoint(point2);
        point3 = thisObject.container.frame.frameThisPoint(point3);
        point4 = thisObject.container.frame.frameThisPoint(point4);

        browserCanvasContext.beginPath();
        browserCanvasContext.moveTo(point1.x, point1.y);
        browserCanvasContext.lineTo(point2.x, point2.y);
        browserCanvasContext.lineTo(point3.x, point3.y);
        browserCanvasContext.lineTo(point4.x, point4.y);
        browserCanvasContext.closePath();

        browserCanvasContext.fillStyle = singleFileProgressBar.fillStyle;
        browserCanvasContext.strokeStyle = singleFileProgressBar.strokeStyle;

        browserCanvasContext.fill();
        browserCanvasContext.lineWidth = 0.1;
        browserCanvasContext.stroke();
    }
}