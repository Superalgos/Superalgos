
function newCompanyLogo() {

    var thisObject = {
        container: undefined,
        draw: draw,
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    thisObject.container = container;

    thisObject.container.frame.width = 150;
    thisObject.container.frame.height = TOP_SPACE_HEIGHT;

    container.frame.position.x = 0;
    container.frame.position.y = 0;

    container.isDraggeable = false;

    let logo; 
    let canDrawLogo = false;

    return thisObject;

    function initialize() {

        logo = new Image();

        logo.onload = onImageLoad;

        function onImageLoad() {
            canDrawLogo = true;
            }

        logo.src = "Images/aa-logo-dark-8.png";
        document.body.append(logo);
    }

    function getContainer(point) {

        let container;

        /* First we check if this point is inside this object UI. */

        if (thisObject.container.frame.isThisPointHere(point, true) === true) {

            return this.container;

        } else {

            /* This point does not belong to this space. */

            return undefined;
        }

    }

    function draw() {

        thisObject.container.frame.draw(false, false);

        if (canDrawLogo === false) { return;}

        let imageHeight = 24;
        let imageWidth = 120;

        let imagePoint = {
            x: 10,
            y: thisObject.container.frame.height / 2 - imageHeight / 2
        };

        imagePoint = thisObject.container.frame.frameThisPoint(imagePoint);

        browserCanvasContext.drawImage(logo, imagePoint.x, imagePoint.y, imageWidth, imageHeight);
    }
}