/*

The Splash Screen is to show some 'loading...' controls while the app is being loaded on the background. After the loading is complete the Splash Screens dissapears for good.

*/

function newSplashScreen() {

    var splashScreen = {
        container: undefined,
        draw: draw,
        timeMachines: [],
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize
    };


    var container = newContainer();
    container.initialize();
    splashScreen.container = container;

    splashScreen.container.frame.width = browserCanvas.width;
    splashScreen.container.frame.height = browserCanvas.height;

    container.displacement.containerName = "Splash Screen";
    container.zoom.containerName = "Splash Screen";
    container.frame.containerName = "Splash Screen";

    container.frame.position.x = 0;
    container.frame.position.y = 0;

    container.isZoomeable = false;
    container.isDraggeable = false;


    let fadeOutCounter = 0;
    let opacity = 1;

    return splashScreen;

    function initialize() {



    }

    function draw() {

        splashScreenNeeded = false;

        if (splashScreenNeeded === false) {

            stepsInitializationCounter = 100;

            fadeOutCounter++;

            if (fadeOutCounter > 20) {
                return;
            }

            opacity = opacity - 0.05;

        }

        splashScreen.container.frame.draw(false, false);

        let label = '' + Math.trunc(stepsInitializationCounter)  + ' %';
        stepsInitializationCounter = stepsInitializationCounter + 0.2;

        if (stepsInitializationCounter > 99) {

            splashScreenNeeded = false;
            stepsInitializationCounter = 99;
        }

        let fontSize = 50;

        let labelPoint = {
            x: splashScreen.container.frame.width / 2 - label.length / 2 * fontSize * FONT_ASPECT_RATIO  -30,
            y: splashScreen.container.frame.height / 2 + fontSize / 2 + fontSize * 0.1
        };

        browserCanvasContext.beginPath();

        browserCanvasContext.rect(0, 0, splashScreen.container.frame.width, splashScreen.container.frame.height);
        browserCanvasContext.fillStyle = 'rgba(255, 255, 255, ' + opacity + ')';

        browserCanvasContext.closePath();

        browserCanvasContext.fill();

        browserCanvasContext.font = fontSize + 'px Courier New';
        browserCanvasContext.fillStyle = 'rgba(200, 200, 200,  ' + opacity + ')';
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y);

        let title;
        let titlePoint;
        fontSize = 100;
        
        title = "Advanced"

        titlePoint = {
            x: splashScreen.container.frame.width / 2 - title.length / 2 * fontSize * FONT_ASPECT_RATIO - 230,
            y: splashScreen.container.frame.height / 2 - fontSize * 2 + 50
        };

        browserCanvasContext.font = fontSize + 'px Verdana';
        browserCanvasContext.fillStyle = 'rgba(0, 0, 0,  ' + opacity + ')';
        browserCanvasContext.fillText(title, titlePoint.x, titlePoint.y);

        title = "A"

        browserCanvasContext.fillStyle = 'rgba(255, 0, 0,  ' + opacity + ')';
        browserCanvasContext.fillText(title, titlePoint.x, titlePoint.y);

        title = "Algos"

        titlePoint = {
            x: splashScreen.container.frame.width / 2 - title.length / 2 * fontSize * FONT_ASPECT_RATIO + 230,
            y: splashScreen.container.frame.height / 2 - fontSize * 2 + 50
        };

        browserCanvasContext.font = fontSize + 'px Verdana';
        browserCanvasContext.fillStyle = 'rgba(0, 0, 0,  ' + opacity + ')';
        browserCanvasContext.fillText(title, titlePoint.x, titlePoint.y);

        title = "A"

        browserCanvasContext.fillStyle = 'rgba(255, 0, 0,  ' + opacity + ')';
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