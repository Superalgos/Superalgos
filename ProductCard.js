function newProductCard() {

    var thisObject = {
        container: undefined,
        draw: draw,
        status: 'off',
        devTeam: undefined,
        bot: undefined,
        product: undefined,
        code: undefined,
        onFileLoaded: onFileLoaded, 
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize
    };

    let progressBar = {
        value: 100,
        fillStyle = 'rgba(226, 226, 226, 1)',
        strokeStyle = 'rgba(86, 86, 86, 1)'
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
        this.container.frame.height = 45;

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

    function onFileLoaded(event) {

        if (event.totalValue === event.totalValue) {

            progressBar = {
                value: 100,
                fillStyle = 'rgba((56, 209, 6, 1)',
                strokeStyle = 'rgba(40, 99, 21, 1)'
            };

        } else {

            progressBar = {
                value: event.totalValue * 100 / event.totalValue,
                fillStyle = 'rgba(234, 143, 23, 1)',
                strokeStyle = 'rgba(122, 79, 23, 1)'
            };

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
            y: thisObject.container.frame.height - 35
        };

        labelPoint = thisObject.container.frame.frameThisPoint(labelPoint);

        browserCanvasContext.fillStyle = 'rgba(60, 60, 60, 0.50)';
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y);

        /* bot */

        label = "Bot: " + thisObject.bot.displayName;

        labelPoint = {
            x: 20,
            y: thisObject.container.frame.height - 20
        };

        labelPoint = thisObject.container.frame.frameThisPoint(labelPoint);

        browserCanvasContext.fillStyle = 'rgba(60, 60, 60, 0.50)';
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y);

        /* product */

        label = "Product: " + thisObject.product.displayName;

        labelPoint = {
            x: 20,
            y: thisObject.container.frame.height - 5
        };

        labelPoint = thisObject.container.frame.frameThisPoint(labelPoint);

        browserCanvasContext.fillStyle = 'rgba(60, 60, 60, 0.50)';
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y);

        /* We draw here the progress bar. */

        point1 = {
            x: 0,
            y: thisObject.container.frame.height - 1
        };

        point2 = {
            x: thisObject.container.frame.width * progressBar.value / 100,
            y: thisObject.container.frame.height - 1
        };

        point3 = {
            x: thisObject.container.frame.width * progressBar.value / 100,
            y: thisObject.container.frame.height - 5
        };

        point4 = {
            x: 0,
            y: thisObject.container.frame.height - 5
        };

        /* Now the transformations. */

        point1 = thisObject.container.frame.frameThisPoint(point1);
        point2 = thisObject.container.frame.frameThisPoint(point2);
        point3 = thisObject.container.frame.frameThisPoint(point3);
        point4 = thisObject.container.frame.frameThisPoint(point4);

        browserCanvasContext.beginPath();
        browserCanvasContext.moveTo(point1.x, point1.y);
        browserCanvasContext.moveTo(point2.x, point2.y);
        browserCanvasContext.moveTo(point3.x, point3.y);
        browserCanvasContext.moveTo(point4.x, point4.y);
        browserCanvasContext.closePath();

        browserCanvasContext.fillStyle = progressBar.fillStyle;
        browserCanvasContext.strokeStyle = progressBar.strokeStyle;

        browserCanvasContext.fill();
        browserCanvasContext.lineWidth = 1;
        browserCanvasContext.stroke();

    }
}