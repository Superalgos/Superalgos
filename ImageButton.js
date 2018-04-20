function newImageButton() {

    var thisObject = {
        container: undefined,
        draw: draw,
        status: 'neutral',
        type: undefined,
        getContainer: getContainer,    
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    container.isDraggeable = false;
    container.isZoomeable = false;
    container.isClickeable = true;
    thisObject.container = container;

    let idNeutralImage;
    let idOnImage;
    let idOffImage;
    let idDisabledImage;

    return thisObject;

    function initialize(pX, pY, pWidth, pHeight, pIdNeutralImage, pIdOnImage, pIdOffImage, pIdDisabledImage) {

        idNeutralImage = pIdNeutralImage;
        idOnImage = pIdOnImage;
        idOffImage = pIdOffImage;
        idDisabledImage = pIdDisabledImage;

        /* Lets set the basic dimensions of this thisObject. */

        var position = {
            x: pX,
            y: pY
        };

        thisObject.container.frame.position = position;
        thisObject.container.frame.width = pWidth;
        thisObject.container.frame.height = pHeight;

        /* Now we start listening to the onClick event from the mouse, so that we can allow users operate this thisObject. */

        thisObject.container.eventHandler.listenToEvent('onMouseClick', buttonPressed, undefined);

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

    function buttonPressed(event, extraData) {

        switch (thisObject.status) {

            case 'neutral':
                browserCanvasContext.fillStyle = onFillStyle;
                return;

            case 'on':
                thisObject.status = 'off';
                break;

            case 'off':
                thisObject.status = 'on';
                break;

            case 'disabled':
                return;
        }
    }

    function draw() {

        drawImage();

    }

    function drawImage() {

        let image; 

        let imagePoint = {
            x: 0,
            y: 0
        };

        imagePoint = thisObject.container.frame.frameThisPoint(imagePoint);

        switch (thisObject.status) {

            case 'neutral':
                image = document.getElementById(idNeutralImage);
                break;

            case 'on':
                image = document.getElementById(idOnImage);
                break;

            case 'off':
                image = document.getElementById(idOffImage);
                break;

            case 'disabled':
                image = document.getElementById(idDisabledImage);
                break;

        }
        browserCanvasContext.drawImage(image, imagePoint.x, imagePoint.y, thisObject.container.frame.width, thisObject.container.frame.height);
    }
}