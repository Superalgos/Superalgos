function newProductCard() {

    const CONSOLE_LOG = false;

    var thisObject = {
        container: undefined,
        draw: draw,
        status: 'off',
        devTeam: undefined,
        bot: undefined,
        product: undefined,
        code: undefined,

        setDatetime: setDatetime,
        setTimePeriod: setTimePeriod,

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
        value: 0,
        animatedValue: 0,
        fillStyle: UNLOADED_FILL_STYLE,
        strokeStyle: UNLOADED_STROKE_STYLE
    };

    let dailyFileProgressBar = {
        value: 0,
        animatedValue: 0,
        fillStyle: UNLOADED_FILL_STYLE,
        strokeStyle: UNLOADED_STROKE_STYLE
    };

    let singleFileProgressBar = {
        value: 0,
        animatedValue: 0,
        fillStyle: UNLOADED_FILL_STYLE,
        strokeStyle: UNLOADED_STROKE_STYLE
    };

    let timePeriod = INITIAL_TIME_PERIOD;
    let datetime = INITIAL_DATE;

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

            if (thisObject.status === PRODUCT_CARD_STATUS.ON) {

                changeStatusTo(PRODUCT_CARD_STATUS.LOADING); 

            }

        } else {

            changeStatusTo(PRODUCT_CARD_STATUS.LOADING);  // This happens the first time the app is run on a new browser.

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

    function setDatetime(pDatetime) {

        /*

        When the datetime changes from one day to another, this forces cursors to potentially load more files, thus we reset this counter and
        get ready to receive events on files loaded.

        */

        let currentDate = Math.trunc(datetime.valueOf() / ONE_DAY_IN_MILISECONDS);
        let newDate = Math.trunc(pDatetime.valueOf() / ONE_DAY_IN_MILISECONDS);

        datetime = pDatetime;

        if (currentDate !== newDate) {

            if (timePeriod <= _1_HOUR_IN_MILISECONDS) {

                dailyFileProgressBar.animatedValue = 0;

                if (CONSOLE_LOG === true) {

                    console.log("ProductCard -> onDayChanged -> dailyFileProgressBar.animatedValue = " + dailyFileProgressBar.animatedValue);

                }
            }
        }
    }

    function setTimePeriod(pTimePeriod) {

        /*

        When the time period below or equal to 1 hour changes, this forces cursors to potentially load more files, thus we reset this counter and
        get ready to receive events on files loaded.

        */

        if (timePeriod !== pTimePeriod) {

            timePeriod = pTimePeriod;

            if (timePeriod <= _1_HOUR_IN_MILISECONDS) {

                dailyFileProgressBar.animatedValue = 0;

                if (CONSOLE_LOG === true) {

                    console.log("ProductCard -> onTimePeriodChanged -> dailyFileProgressBar.animatedValue = " + dailyFileProgressBar.animatedValue);

                }
            }
        }
    }

    function onMarketFileLoaded(event) {

        marketFileProgressBar.value = Math.trunc(event.currentValue * 100 / event.totalValue);
        marketFileProgressBar.fillStyle = LOADING_FILL_STYLE;
        marketFileProgressBar.strokeStyle = LOADING_STROKE_STYLE;

        if (CONSOLE_LOG === true) {

            console.log("ProductCard onMarketFileLoaded Value = " + marketFileProgressBar.value + "% for " + thisObject.code + ". Event = " + JSON.stringify(event));

        }
    }

    function onDailyFileLoaded(event) {

        dailyFileProgressBar.value = Math.trunc(event.currentValue * 100 / event.totalValue);
        dailyFileProgressBar.fillStyle = LOADING_FILL_STYLE;
        dailyFileProgressBar.strokeStyle = LOADING_STROKE_STYLE;

        if (CONSOLE_LOG === true) {

            console.log("ProductCard onDailyFileLoaded Value = " + dailyFileProgressBar.value + "% for " + thisObject.code + ". Event = " + JSON.stringify(event));

        }
    }

    function onSingleFileLoaded(event) {

        singleFileProgressBar.value = Math.trunc(event.currentValue * 100 / event.totalValue);
        singleFileProgressBar.fillStyle = LOADING_FILL_STYLE;
        singleFileProgressBar.strokeStyle = LOADING_STROKE_STYLE;

        if (CONSOLE_LOG === true) {

            console.log("ProductCard onSingleFileLoaded Value = " + singleFileProgressBar.value + "% for " + thisObject.code + ". Event = " + JSON.stringify(event));

        }
    }

    function buttonPressed(event) {

        switch (thisObject.status) {

            case PRODUCT_CARD_STATUS.ON:

                changeStatusTo(PRODUCT_CARD_STATUS.OFF);

                marketFileProgressBar.animatedValue = 0;
                marketFileProgressBar.value = 0;
                marketFileProgressBar.fillStyle = UNLOADED_FILL_STYLE;
                marketFileProgressBar.strokeStyle = UNLOADED_STROKE_STYLE;

                dailyFileProgressBar.animatedValue = 0;
                dailyFileProgressBar.value = 0;
                dailyFileProgressBar.fillStyle = UNLOADED_FILL_STYLE;
                dailyFileProgressBar.strokeStyle = UNLOADED_STROKE_STYLE;

                singleFileProgressBar.animatedValue = 0;
                singleFileProgressBar.value = 0;
                singleFileProgressBar.fillStyle = UNLOADED_FILL_STYLE;
                singleFileProgressBar.strokeStyle = UNLOADED_STROKE_STYLE;

                break;

            case PRODUCT_CARD_STATUS.OFF:

                changeStatusTo(PRODUCT_CARD_STATUS.LOADING);

                break;

        }
    }

    function changeStatusTo(pNewStatus) {

        if (thisObject.status !== pNewStatus) {

            thisObject.status = pNewStatus;

            let eventData = thisObject;

            thisObject.container.eventHandler.raiseEvent('Status Changed', eventData);

            window.localStorage.setItem(thisObject.code, thisObject.status);

        }
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

        let offFillStyle = 'rgba(232, 28, 28, 0.75)';
        let onFillStyle = 'rgba(45, 232, 28, 0.75)';
        let loadingFillStyle = 'rgba(237, 227, 47, 0.75)';

        switch (thisObject.status) {

            case PRODUCT_CARD_STATUS.ON:
                browserCanvasContext.fillStyle = onFillStyle;
                break;

            case PRODUCT_CARD_STATUS.OFF:
                browserCanvasContext.fillStyle = offFillStyle;
                break;

            case PRODUCT_CARD_STATUS.LOADING:
                browserCanvasContext.fillStyle = loadingFillStyle;
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

        /* ------------------- Progress Bars -------------------------- */

        const ANIMATED_INCREMENT = 5;

        let point1;
        let point2;
        let point3;
        let point4;

        /* We draw here the Market Progress Bar. */

        /* Animate */

        if (marketFileProgressBar.animatedValue < marketFileProgressBar.value) {

            marketFileProgressBar.animatedValue = marketFileProgressBar.animatedValue + ANIMATED_INCREMENT;

        }

        if (marketFileProgressBar.animatedValue >= 100) {

            marketFileProgressBar.animatedValue = 100;

            marketFileProgressBar.fillStyle = LOADED_FILL_STYLE;
            marketFileProgressBar.strokeStyle = LOADED_STROKE_STYLE;

            changeStatusTo(PRODUCT_CARD_STATUS.ON);
        }

        point1 = {
            x: 0,
            y: thisObject.container.frame.height - 1
        };

        point2 = {
            x: thisObject.container.frame.width * marketFileProgressBar.animatedValue / 100,
            y: thisObject.container.frame.height - 1
        };

        point3 = {
            x: thisObject.container.frame.width * marketFileProgressBar.animatedValue / 100,
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

        /* Animate */

        if (dailyFileProgressBar.animatedValue < dailyFileProgressBar.value) {

            dailyFileProgressBar.animatedValue = dailyFileProgressBar.animatedValue + ANIMATED_INCREMENT;

        }

        if (dailyFileProgressBar.animatedValue >= 100) {

            dailyFileProgressBar.animatedValue = 100;

            dailyFileProgressBar.fillStyle = LOADED_FILL_STYLE;
            dailyFileProgressBar.strokeStyle = LOADED_STROKE_STYLE;

            changeStatusTo(PRODUCT_CARD_STATUS.ON);
        }

        point1 = {
            x: 0,
            y: thisObject.container.frame.height - 4
        };

        point2 = {
            x: thisObject.container.frame.width * dailyFileProgressBar.animatedValue / 100,
            y: thisObject.container.frame.height - 4
        };

        point3 = {
            x: thisObject.container.frame.width * dailyFileProgressBar.animatedValue / 100,
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

        /* Animate */

        if (singleFileProgressBar.animatedValue < singleFileProgressBar.value) {

            singleFileProgressBar.animatedValue = singleFileProgressBar.animatedValue + ANIMATED_INCREMENT;

        }

        if (singleFileProgressBar.animatedValue >= 100) {

            singleFileProgressBar.animatedValue = 100;

            singleFileProgressBar.fillStyle = LOADED_FILL_STYLE;
            singleFileProgressBar.strokeStyle = LOADED_STROKE_STYLE;

            changeStatusTo(PRODUCT_CARD_STATUS.ON);

        }

        point1 = {
            x: 0,
            y: thisObject.container.frame.height - 7
        };

        point2 = {
            x: thisObject.container.frame.width * singleFileProgressBar.animatedValue / 100,
            y: thisObject.container.frame.height - 7
        };

        point3 = {
            x: thisObject.container.frame.width * singleFileProgressBar.animatedValue / 100,
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