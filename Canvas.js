/*

Whithin this system, the canvas object represents a layer on top of the browser canvas object, and it is the one who should interact with it.

Graphically, the system has 3 spaces:

1) The "Chart Space": It is where the charts are plotted.

2) The "Floating Space": It is where floating elements live. There is a physics engine for this layer that allows these elements to flow.  

3) The "Control Panel": It is where the main controls are. This is a fix panel that sits on top of everything else.

All these spaces are child objects of the Canvas object.

*/

var browserCanvas;                 // This is the canvas object of the browser.
var browserCanvasContext;          // The context of the canvas object.

let stepsInitializationCounter = 0;         // This counter the initialization steps required to be able to turn off the splash screen.
let marketInitializationCounter = 0;        // This counter the initialization of markets required to be able to turn off the splash screen.
let splashScreenNeeded = true;

function newCanvas() {

    /* Mouse event related variables. */

    var containerDragStarted = false;
    var ballDragStarted = false;
    var ballBeingDragged;
    var containerBeingDragged;
    var viewPortBeingDragged = false;

    var dragVector = {
        downX: 0,
        downY: 0,
        upX: 0,
        upY: 0
    };

    /* canvas object */

    var canvas = {
        eventHandler: undefined,
        chartSpace: undefined,
        floatingSpace: undefined,
        animation: undefined,
        initialize: initialize
    };

    canvas.eventHandler = newEventHandler();

    let splashScreen;


    return canvas;

    function initialize() {

        initializeBrowserCanvas();

        addCanvasEvents();

        /* The canvas has one ChartSpace child. Here is where we get it. */

        var chartSpace = newChartSpace();
        chartSpace.initialize();

        this.chartSpace = chartSpace;

        var floatingSpace = newFloatingSpace();
        floatingSpace.initialize();

        this.floatingSpace = floatingSpace;

        splashScreen = newSplashScreen();
        splashScreen.initialize();

        var animation = newAnimation();
        animation.initialize(clearBrowserCanvas);

        this.animation = animation;

        animation.addCallBackFunction("Chart Space", this.chartSpace.draw);
        animation.addCallBackFunction("Floating Space", this.floatingSpace.physicsLoop);
        animation.addCallBackFunction("Splash Screen", splashScreen.draw);
        animation.start();

    }

    function initializeBrowserCanvas() {

        browserCanvas = document.getElementById('canvas');
        browserCanvasContext = browserCanvas.getContext('2d');

        var body = document.getElementById('body');

        browserCanvas.width = window.innerWidth;
        browserCanvas.height = window.innerHeight;
        browserCanvas.style.border = "none";

        viewPort.initialize();
    }

    function clearBrowserCanvas() {

        browserCanvasContext.clearRect(0, 0, browserCanvas.width, browserCanvas.height); 

    }


    function addCanvasEvents() {

        /* Mouse down and up events to control the drag of the canvas. */

        browserCanvas.addEventListener('mousedown', onMouseDown, false);
        browserCanvas.addEventListener('mouseup', onMouseUp, false);
        browserCanvas.addEventListener('mousemove', onMouseMove, false);
        browserCanvas.addEventListener('click', onMouseClick, false);

        /* Mouse wheel events. */

        if (browserCanvas.addEventListener) {
            // IE9, Chrome, Safari, Opera
            browserCanvas.addEventListener("mousewheel", onMouseWheel, false);
            // Firefox
            browserCanvas.addEventListener("DOMMouseScroll", onMouseWheel, false);
        }
        // IE 6/7/8
        else browserCanvas.attachEvent("onmousewheel", onMouseWheel);

    }

    function onMouseDown(event) {

        dragVector.downX = event.pageX;
        dragVector.downY = event.pageY;

        /* We check first if the mouse is over a ball/ */

        ballBeingDragged = isInside(event.pageX, event.pageY);

        if (ballBeingDragged >= 0) {
            ballDragStarted = true;

        } else {

            /* If it is not, then we check if it is over any of the existing containers. */

            var point = {
                x: event.pageX,
                y: event.pageY
            };

            var container = canvas.chartSpace.getContainer(point);

            if (container !== undefined && container.isDraggeable === true) {

                containerBeingDragged = container;
                containerDragStarted = true;
            } else {
                viewPortBeingDragged = true;
            }

        }

    }


    function onMouseClick(event) {

        dragVector.downX = event.pageX;
        dragVector.downY = event.pageY;

        /* We check first if the mouse is over a ball/ */

        var ballBeingClicked = isInside(event.pageX, event.pageY);

        if (ballBeingClicked >= 0) {

            /* Right now we do nothing with this. */

        } else {

            /* If it is not, then we check if it is over any of the existing containers. */

            var point = {
                x: event.pageX,
                y: event.pageY
            };

            var container = canvas.chartSpace.getContainer(point);

            if (container !== undefined && container.isClickeable === true) {

                /* We deliver the event to the container that is waiting for it. */

                container.eventHandler.raiseEvent('onMouseClick', event);

            }

        }

    }



    function onMouseUp(event) {

        if (containerDragStarted || viewPortBeingDragged || ballDragStarted) {

            canvas.eventHandler.raiseEvent("Drag Finished", undefined);

        }

        /* Turn off all the possible things that can be dragged. */

        containerDragStarted = false;
        ballDragStarted = false;
        viewPortBeingDragged = false;

        containerBeingDragged = undefined;

        browserCanvas.style.cursor = "auto";

    }

    function onMouseMove(event) {

        viewPort.mousePosition.x = event.pageX;
        viewPort.mousePosition.y = event.pageY;

        if (containerDragStarted === true || ballDragStarted === true || viewPortBeingDragged === true) {

            if (ballDragStarted === true) {

                if (isInsideBall(ballBeingDragged, event.pageX, event.pageY) === false) {

                    /* This means that the user stop moving the mouse and the ball ball out of the pointer.
                    In this case we cancell the drag operation . */

                    ballDragStarted = false;
                    browserCanvas.style.cursor = "auto";
                    return;
                }

            }

            dragVector.upX = event.pageX;
            dragVector.upY = event.pageY;

            checkDrag();
        }
    }

    function checkDrag() {

        if (containerDragStarted === true || ballDragStarted === true || viewPortBeingDragged === true) {

            browserCanvas.style.cursor = "grabbing";
            canvas.eventHandler.raiseEvent("Dragging", undefined);

            var targetBall = isInside(event.pageX, event.pageY);

            if (ballDragStarted) {

                var ball = balls[ballBeingDragged];

                ball.currentPosition.x = dragVector.upX;
                ball.currentPosition.y = dragVector.upY;

                /* Now we estimate if the drag was towards the Target Point of the ball or not. */

                var distDown = distance(dragVector.downX, dragVector.downY, ball.targetPosition.x, ball.targetPosition.y);
                var distUp = distance(dragVector.upX, dragVector.upY, ball.targetPosition.x, ball.targetPosition.y);

                var mZoomValue;

                if (distDown < distUp) {

                    mZoomValue = 1;
                } else {
                    mZoomValue = -1;
                }

                ball.container.zoom.mZoom(mZoomValue);   // Zoom is applied to ball mass of all balls in the same container.
            }

            if (containerDragStarted || viewPortBeingDragged) {

                /* The parameters received have been captured with zoom applied. We must remove the zoom in order to correctly modify the displacement. */

                
                var downCopy = {
                    x: dragVector.downX,
                    y: dragVector.downY
                };

                var downCopyNoTransf;
                downCopyNoTransf = viewPort.unzoomThisPoint(downCopy);
                //downCopyNoTransf = containerBeingDragged.zoom.unzoomThisPoint(downCopyNoTransf);

                var upCopy = {
                    x: dragVector.upX,
                    y: dragVector.upY
                };

                var upCopyNoTranf;
                upCopyNoTranf = viewPort.unzoomThisPoint(upCopy);
                //upCopyNoTranf = containerBeingDragged.zoom.unzoomThisPoint(upCopyNoTranf);

                /*
                let displaceVector = {
                    x: upCopyNoTranf.x - downCopyNoTransf.x,
                    y: upCopyNoTranf.y - downCopyNoTransf.y
                };
                */

                let displaceVector = {
                    x: dragVector.upX - dragVector.downX,
                    y: dragVector.upY - dragVector.downY
                };


                if (viewPortBeingDragged) {

                    viewPort.displace(displaceVector);

                }


                if (containerBeingDragged !== undefined) {

                    containerBeingDragged.frame.position.x = containerBeingDragged.frame.position.x  + displaceVector.x;
                    containerBeingDragged.frame.position.y = containerBeingDragged.frame.position.y + displaceVector.y;

                }

                



                /*
                if (containerBeingDragged.displacement.displace(diffX, diffY) === true) {

                    updateBallsTargets();  // TODO: this should not be here

                } else
                {
                    // If the displacement can not be performed, then we dont abort the dragging operation, just allow the user to move the mouse in some other direction.
                }
                */



            }

            /* Finally we set the starting point of the new dragVector at this current point. */

            dragVector.downX = dragVector.upX;
            dragVector.downY = dragVector.upY;

        }

    }


    function onMouseWheel(event) {

        // cross-browser wheel delta
        var event = window.event || event; // old IE support
        var delta = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail));

        var ballIndex = isInside(event.pageX, event.pageY);

        if (ballIndex >= 0) {

            /* We need to apply the Radius zoom to the cointainer of the ball where the zoom was made, for that reason, we need the ball. */

            balls[ballIndex].container.zoom.rZoom(delta);   // Zoom is applied to ball radius.

        } else {

            /* We check if the mouse is over any of the existing containers. */

            var point = {
                x: event.pageX,
                y: event.pageY
            };

            /*
            var container = canvas.chartSpace.getContainer(point);

            if (container !== undefined && container.isZoomeable === true) {

                if (container.zoom.xyZoom(delta) === true) {

                    updateBallsTargets();

                }

            } */

            viewPort.applyZoom(delta);
        }

        return false;  // This instructs the browser not to take the event and scroll the page. 
    }



}


