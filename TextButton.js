function newTextButton() {

    var textButton = {
        container: undefined,
        draw: draw,
        status: 'off',
        type: undefined,
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    container.isDraggeable = false;
    container.isZoomeable = false;
    container.isClickeable = true;
    textButton.container = container;

    return textButton;

    function initialize() {

        /* Lets set the basic dimensions of this textButton. */

        var position = {
            x: 0,
            y: 0
        };

        this.container.frame.position = position;
        this.container.frame.width = 180;
        this.container.frame.height = 14;

        /* Now we start listening to the onClick event from the mouse, so that we can allow users operate this textButton. */


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



    function draw() {

        drawIcon();
       
    }


    function drawIcon() {

        centerPoint = {
            x: 7,
            y: 7
        };

        /* Now the transformations. */

        centerPoint = textButton.container.frame.frameThisPoint(centerPoint);
 
        /* Lets start the drawing. */

        browserCanvasContext.beginPath();
        browserCanvasContext.arc(centerPoint.x, centerPoint.y, 3, 0, 2 * Math.PI);
        browserCanvasContext.closePath();

        let offFillStyle = 'rgba(232, 28, 28, 1)';
        let onFillStyle = 'rgba(45, 232, 28, 1)';
        let invisibleFillStyle = 'rgba(247, 244, 27, 1)';

        switch (textButton.status) {

            case 'on':
                browserCanvasContext.fillStyle = onFillStyle;
                break;

            case 'invisible':
                browserCanvasContext.fillStyle = invisibleFillStyle;
                break;

            case 'off':
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

        let label = textButton.type;

        let xOffset = 0;
        let yOffset = 0;

        labelPoint = {
            x: 20,
            y: textButton.container.frame.height - 5
        };

        labelPoint = textButton.container.frame.frameThisPoint(labelPoint);

        browserCanvasContext.fillStyle = 'rgba(60, 60, 60, 0.50)';
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y);


    }



}