/*

The Splash Screen is to show some 'loading...' controls while the app is being loaded on the background. After the loading is complete the Splash Screens dissapears for good.

*/

function newSplashScreen() {

    var thisObject = {
        container: undefined,
        draw: draw,
        timeMachines: [],
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize
    };


    var container = newContainer();
    container.initialize();
    thisObject.container = container;

    thisObject.container.frame.width = browserCanvas.width;
    thisObject.container.frame.height = browserCanvas.height;

    container.displacement.containerName = "Splash Screen";
    container.frame.containerName = "Splash Screen";

    container.frame.position.x = 0;
    container.frame.position.y = 0;

    container.isDraggeable = false;


    let fadeOutCounter = 0;
    let opacity = 1;

    let logo;
    let canDrawLogo = false;

    return thisObject;

    function initialize() {

        logo = new Image();

        logo.onload = onImageLoad;

        function onImageLoad() {
            canDrawLogo = true;
        }

        logo.src = window.URL_PREFIX + "Images/aa-logo.png";

    }

    function draw() {

        if (splashScreenNeeded === false) {

            stepsInitializationCounter = 100;

            fadeOutCounter++;

            if (fadeOutCounter > 20) {
                return;
            }
            opacity = opacity - 0.05;
        }

        thisObject.container.frame.draw(false, false);

        /* Set the background. */

        browserCanvasContext.beginPath();

        browserCanvasContext.rect(0, 0, thisObject.container.frame.width, thisObject.container.frame.height);
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + opacity + ')';

        browserCanvasContext.closePath();

        browserCanvasContext.fill();

        if (canDrawLogo === false) { return; }

        /* First the AA Logo. */

        let imageHeight = 96;
        let imageWidth = 480;
        let yDisplacement = -50;

        let imagePoint = {
            x: thisObject.container.frame.width * 1 / 2 - imageWidth / 2,
            y: thisObject.container.frame.height * 1 / 2 - imageHeight / 2 + yDisplacement
        };

        imagePoint = thisObject.container.frame.frameThisPoint(imagePoint);

        browserCanvasContext.drawImage(logo, imagePoint.x, imagePoint.y, imageWidth, imageHeight);

        /* Second the % of Advance. */

        let label = '' + Math.trunc(stepsInitializationCounter)  + ' %';
        stepsInitializationCounter = stepsInitializationCounter + 0.1;

        if (stepsInitializationCounter > 99) {

            splashScreenNeeded = false;
            stepsInitializationCounter = 99;
        }


        let fontSize = 10;

        let labelPoint = {
            x: thisObject.container.frame.width / 2 - label.length / 2 * fontSize * FONT_ASPECT_RATIO - 25,
            y: thisObject.container.frame.height / 2 + fontSize / 2 + fontSize * 0.1 + 80 + yDisplacement
        };

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY;
        browserCanvasContext.fillStyle = 'rgba(0, 0, 0,  ' + opacity + ')';
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y);

        let title;
        let titlePoint;

        /* Algo Bots Competitions Sub Title */

        fontSize = 15;

        title = "Trading Bots Competitions Platform"

        titlePoint = {
            x: thisObject.container.frame.width / 2 - title.length / 2 * fontSize * FONT_ASPECT_RATIO - 20,
            y: thisObject.container.frame.height / 2 - fontSize * 2 + 80 + yDisplacement
        };

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY;
        browserCanvasContext.fillStyle = 'rgba(0, 0, 0,  ' + opacity + ')';
        browserCanvasContext.fillText(title, titlePoint.x, titlePoint.y);

        
    }



    function getContainer(point) {

        var container;

        /* First we check if this point is inside this space. */

        if (this.container.frame.isThisPointHere(point) === true) {

            /* Now we see which is the inner most container that has it */

            // add validation of inner most containers here.

            /* The point does not belong to any inner container, so we return the current container. */

            return this.container;

        } else {

            /* This point does not belong to this space. */

            return undefined;
        }

    }

}