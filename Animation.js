/*

Essentially, what the animation object does, is to call several functions in order to draw the content of each frame.
To do that, it has an array of functions that need to be called, and it just goes one by one through them. His parent object
is responsible for providing more functions to call, or removing functions from its list when they are not longer needed.

*/

function newAnimation() {

    var animationLoopHandle;          // This is the handle to the animation loop. With this handle we can cancel the loop, for instance.
    var callBackFunctions = new Map();
    var clearCanvasFunction;

    var animation = {
        start: start,
        stop: stop,
        addCallBackFunction: addCallBackFunction,
        removeCallBackFunction: removeCallBackFunction,
        initialize: initialize
    };

    return animation;

    function initialize(callBackFunction) {

        /* We store the function to be called each time we need to draw a new animation frame. */

        clearCanvasFunction = callBackFunction;
    }


    function start() {

        animationLoop();  // Inside this function the animation process is started, and at the same time it creates a loop.

    }

    function stop() {

        window.cancelAnimationFrame(animationLoopHandle);

    }

    function addCallBackFunction(key, callBackFunction) {

        callBackFunctions.set(key, callBackFunction);
    }

    function removeCallBackFunction(key, callBackFunction) {

        callBackFunctions.delete(key);
    }

    function animationLoop() {

        /* First thing is to clear the actual canvas */

        clearCanvasFunction();

        /* We loop through the callback functions collections and execute them all. */

        callBackFunctions.forEach(function (callBackFunction) {

            callBackFunction();

        });

        /* We also draw this array of circles, that is used for debugging purposes. */

        drawSmallBall();

        /* We request the next frame to be drawn, and stablishing a loop */

        animationLoopHandle = window.requestAnimationFrame(animationLoop);

        /* We animate the zoom of the viewPort */

        viewPort.animate();
        viewPort.draw();

    }
}







