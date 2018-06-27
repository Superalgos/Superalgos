
let browserCanvas;                 // This is the canvas object of the browser.
let browserCanvasContext;          // The context of the canvas object.

let stepsInitializationCounter = 0;         // This counter the initialization steps required to be able to turn off the splash screen.
let marketInitializationCounter = 0;        // This counter the initialization of markets required to be able to turn off the splash screen.
let splashScreenNeeded = true;

function newCanvas() {

    const MODULE_NAME = "Canvas";
    const INFO_LOG = true;
    const ERROR_LOG = true;
    const INTENSIVE_LOG = false;
    const logger = newWebDebugLog();
    logger.fileName = MODULE_NAME;

    /* Mouse event related variables. */

    let containerDragStarted = false;
    let floatingObjectDragStarted = false;
    let floatingObjectBeingDragged;
    let containerBeingDragged;
    let viewPortBeingDragged = false;

    let dragVector = {
        downX: 0,
        downY: 0,
        upX: 0,
        upY: 0
    };

    /* canvas object */

    let thisObject = {
        eventHandler: undefined,
        topSpace: undefined,
        chartSpace: undefined,
        floatingSpace: undefined,
        panelsSpace: undefined,
        bottomSpace: undefined,
        animation: undefined,
        initialize: initialize
    };

    thisObject.eventHandler = newEventHandler();

    let splashScreen;

    return thisObject;

/*
    The canvas object represents a layer on top of the browser canvas object.

    Graphically, thiscanvas object has 4 spaces:

    1. The "Top Space": It is where Team and User information is displayed.
    2. The "Chart Space": It is where the charts are plotted.
    3. The "Floating Space": It is where floating elements live. There is a physics engine for this layer that allows these elements to flow.  
    4. The "Panels Space": It is where panels live. --> This space has yet to be develop, currently pannels are somehow at the Chart Space.
    5. The "Bottom Space": Includes the breakpoint bar and a toolbar.

    All these spaces are child objects of the Canvas object.

    Canvas
    |
    |
    ---> topSpace
    |
    |
    ---> chartSpace
    |
    |
    ---> flaotingSpace
    |
    |
    ---> panelsSpace
    |
    |
    ---> bottomSpace
*/

    function initialize(callBackFunction) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }

            initializeBrowserCanvas();

            addCanvasEvents();

            /* Instantiate all the children spaces of Canvas object */

            thisObject.topSpace = newTopSpace();
            thisObject.topSpace.initialize();

            thisObject.panelsSpace = newPanelsSpace();
            thisObject.panelsSpace.initialize();

            thisObject.floatingSpace = newFloatingSpace();
            thisObject.floatingSpace.initialize();

            thisObject.chartSpace = newChartSpace();
            thisObject.chartSpace.initialize(onCharSpaceInitialized);

            thisObject.bottomSpace = newBottomSpace();
            thisObject.bottomSpace.initialize();

            function onCharSpaceInitialized(err) {

                try {

                    if (INFO_LOG === true) { logger.write("[INFO] initialize -> onCharSpaceInitialized -> Entering function."); }

                    viewPort.raiseEvents(); // These events will impacts on objects just initialized.

                } catch (err) {

                    if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> onCharSpaceInitialized -> err = " + err); }
                    callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
                }
            }

            /* Splash Screen */

            splashScreen = newSplashScreen();
            splashScreen.initialize();

            let animation = newAnimation();
            animation.initialize(onAnimationInitialized);

            function onAnimationInitialized(err) {

                try {

                    if (INFO_LOG === true) { logger.write("[INFO] initialize -> onAnimationInitialized -> Entering function."); }

                    thisObject.animation = animation;

                    /* Here we add all the functions that will be called during the animation cycle. */

                    animation.addCallBackFunction("Chart Space", thisObject.chartSpace.draw, onFunctionAdded);
                    animation.addCallBackFunction("Floating Space", thisObject.floatingSpace.floatingLayer.physicsLoop, onFunctionAdded);
                    animation.addCallBackFunction("Panels Space", thisObject.panelsSpace.draw, onFunctionAdded);
                    animation.addCallBackFunction("Splash Screen", splashScreen.draw, onFunctionAdded);
                    animation.addCallBackFunction("ViewPort Animate", viewPort.animate, onFunctionAdded);
                    animation.addCallBackFunction("ViewPort Draw", viewPort.draw, onFunctionAdded);
                    animation.addCallBackFunction("Bottom Space", thisObject.bottomSpace.draw, onFunctionAdded);
                    animation.addCallBackFunction("Top Space", thisObject.topSpace.draw, onFunctionAdded);
                    animation.start(onStart);

                    function onFunctionAdded(err) {

                        try {

                            if (INFO_LOG === true) { logger.write("[INFO] initialize -> onAnimationInitialized -> onFunctionAdded -> Entering function."); }

                            if (err.result === GLOBAL.DEFAULT_FAIL_RESPONSE.result) {

                                animation.stop();

                                if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> onAnimationInitialized -> onFunctionAdded -> Animation Stopped since a vital funtion could not be added."); }

                                /* Display some Error Page here. */
                            }

                        } catch (err) {

                            if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> onAnimationInitialized -> onFunctionAdded -> err = " + err); }
                            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                    function onStart(err) {

                        try {

                            if (INFO_LOG === true) { logger.write("[INFO] initialize -> onAnimationInitialized -> onStart -> Entering function."); }

                            switch (err.result) {
                                case GLOBAL.DEFAULT_OK_RESPONSE.result: {

                                    if (INFO_LOG === true) { logger.write("[INFO] initialize -> onAnimationInitialized -> onStart ->  Received OK Response."); }
                                    callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE);
                                    return;
                                }

                                case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {

                                    if (INFO_LOG === true) { logger.write("[INFO] initialize -> onAnimationInitialized -> onStart -> Received FAIL Response."); }
                                    callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
                                    return;
                                }

                                default: {

                                    if (INFO_LOG === true) { logger.write("[INFO] initialize -> onAnimationInitialized -> onStart -> Received Unexpected Response."); }
                                    callBackFunction(err);
                                    return;
                                }
                            }

                        } catch (err) {

                            if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> onAnimationInitialized -> onStart -> err = " + err); }
                            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
                        }
                    }

                } catch (err) {

                    if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> onAnimationInitialized -> err = " + err); }
                    callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
                }
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> err = " + err); }
            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
        }
    }

    function initializeBrowserCanvas() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] initializeBrowserCanvas -> Entering function."); }

            browserCanvas = document.getElementById('canvas');
            browserCanvasContext = browserCanvas.getContext('2d');

            let body = document.getElementById('body');

            browserCanvas.width = window.innerWidth;
            browserCanvas.height = window.innerHeight;
            browserCanvas.style.border = "none";

            viewPort.initialize();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] initializeBrowserCanvas -> err = " + err); }

        }
    }

    function addCanvasEvents() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] addCanvasEvents -> Entering function."); }

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

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] addCanvasEvents -> err = " + err); }
        }
    }

    function onMouseDown(event) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onMouseDown -> Entering function."); }

            /*
    
            There are four types of elements that can be dragged.
    
            1. Panels.
            2. Floating Elements (Currently only FloatingObjects).
            3. Charts.
            4. The Viewport.
    
            We eveluate each space in order to see if they are holding the element being dragged, and we fallout at the Viewport.
    
            */

            dragVector.downX = event.pageX;
            dragVector.downY = event.pageY;

            let point = {
                x: event.pageX,
                y: event.pageY
            };

            let container;

            /* We check if the mouse is over an element of the Top Space / */

            container = thisObject.topSpace.getContainer(point);

            if (container !== undefined && container.isDraggeable === true) {

                containerBeingDragged = container;
                containerDragStarted = true;
                return;
            }

            /* We check if the mouse is over an element of the Bottom Space / */

            container = thisObject.bottomSpace.getContainer(point);

            if (container !== undefined && container.isDraggeable === true) {

                containerBeingDragged = container;
                containerDragStarted = true;
                return;
            }

            /* We check if the mouse is over a panel/ */

            container = thisObject.panelsSpace.getContainer(point);

            if (container !== undefined && container.isDraggeable === true) {

                containerBeingDragged = container;
                containerDragStarted = true;
                return;
            }

            /* We check if the mouse is over a floatingObject/ */

            floatingObjectBeingDragged = thisObject.floatingSpace.floatingLayer.isInside(event.pageX, event.pageY);

            if (floatingObjectBeingDragged >= 0) {
                floatingObjectDragStarted = true;
                return;
            }

            /* If it is not, then we check if it is over any of the existing containers at the Chart Space. */

            container = thisObject.chartSpace.getContainer(point);

            if (container !== undefined && container.isDraggeable === true) {

                containerBeingDragged = container;
                containerDragStarted = true;
                return;
            }

            viewPortBeingDragged = true;

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onMouseDown -> err = " + err); }

        }
    }

    function onMouseClick(event) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onMouseClick -> Entering function."); }

            let point = {
                x: event.pageX,
                y: event.pageY
            };

            let container;

            /* We check if the mouse is over an element of the Top Space / */

            container = thisObject.topSpace.getContainer(point);

            if (container !== undefined && container.isClickeable === true) {

                container.eventHandler.raiseEvent('onMouseClick', point);
                return;
            }

            /* We check if the mouse is over an element of the Bottom Space / */

            container = thisObject.bottomSpace.getContainer(point);

            if (container !== undefined && container.isClickeable === true) {

                container.eventHandler.raiseEvent('onMouseClick', point);
                return;
            }

            /* We check if the mouse is over a panel/ */

            container = thisObject.panelsSpace.getContainer(point);

            if (container !== undefined && container.isClickeable === true) {

                container.eventHandler.raiseEvent('onMouseClick', point);
                return;
            }

            /* We check if the mouse is over a floatingObject/ */

            let floatingObjectBeingClicked = thisObject.floatingSpace.floatingLayer.isInside(event.pageX, event.pageY);

            if (floatingObjectBeingClicked >= 0) {

                /* Right now we do nothing with this. */
                return;

            }

            /* If it is not, then we check if it is over any of the existing containers at the Chart Space. */

            container = thisObject.chartSpace.getContainer(point);

            if (container !== undefined && container.isClickeable === true) {

                container.eventHandler.raiseEvent('onMouseClick', point);
                return;
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onMouseClick -> err = " + err); }

        }
    }

    function onMouseUp(event) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onMouseUp -> Entering function."); }

            if (containerDragStarted || viewPortBeingDragged || floatingObjectDragStarted) {

                thisObject.eventHandler.raiseEvent("Drag Finished", undefined);

            }

            /* Turn off all the possible things that can be dragged. */

            containerDragStarted = false;
            floatingObjectDragStarted = false;
            viewPortBeingDragged = false;

            containerBeingDragged = undefined;

            browserCanvas.style.cursor = "auto";

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onMouseUp -> err = " + err); }

        }
    }

    function onMouseMove(event) {

        try {

            if (INTENSIVE_LOG === true) { logger.write("[INFO] onMouseMove -> Entering function."); }

            viewPort.mousePosition.x = event.pageX;
            viewPort.mousePosition.y = event.pageY;

            if (containerDragStarted === true || floatingObjectDragStarted === true || viewPortBeingDragged === true) {

                if (floatingObjectDragStarted === true) {

                    if (thisObject.floatingSpace.floatingLayer.isInsideFloatingObject(floatingObjectBeingDragged, event.pageX, event.pageY) === false) {

                        /* This means that the user stop moving the mouse and the floatingObject floatingObject out of the pointer.
                        In this case we cancell the drag operation . */

                        floatingObjectDragStarted = false;
                        browserCanvas.style.cursor = "auto";
                        return;
                    }

                }

                dragVector.upX = event.pageX;
                dragVector.upY = event.pageY;

                checkDrag();
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onMouseMove -> err = " + err); }

        }
    }

    function onMouseWheel(event) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onMouseWheel -> Entering function."); }

            // cross-browser wheel delta 
            var event = window.event || event; // old IE support
            let delta = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail));

            /* We try first with panels. */

            let panelContainer = canvas.panelsSpace.getContainer({ x: event.pageX, y: event.pageY });

            if (panelContainer !== undefined && panelContainer.isWheelable === true) {

                panelContainer.eventHandler.raiseEvent("Mouse Wheel", event.wheelDelta);
                return false;  // This instructs the browser not to take the event and scroll the page. 
            }

            /* We try second with floating objects. */

            let floatingObjectIndex = canvas.floatingSpace.floatingLayer.isInside(event.pageX, event.pageY);

            if (floatingObjectIndex > 0) {

                canvas.floatingSpace.floatingLayer.changeTargetRepulsion(event.wheelDelta);

            } else {

                viewPort.applyZoom(delta);

            }

            return false;  // This instructs the browser not to take the event and scroll the page. 

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onMouseWheel -> err = " + err); }

        }
    }

    function checkDrag() {

        try {

            if (INTENSIVE_LOG === true) { logger.write("[INFO] checkDrag -> Entering function."); }

            if (containerDragStarted === true || floatingObjectDragStarted === true || viewPortBeingDragged === true) {

                browserCanvas.style.cursor = "grabbing";
                thisObject.eventHandler.raiseEvent("Dragging", undefined);

                let targetFloatingObject = thisObject.floatingSpace.floatingLayer.isInside(event.pageX, event.pageY);

                if (floatingObjectDragStarted) {

                    let floatingObject = thisObject.floatingSpace.floatingLayer.getFloatingObject(undefined, floatingObjectBeingDragged);

                    floatingObject.currentPosition.x = dragVector.upX;
                    floatingObject.currentPosition.y = dragVector.upY;

                }

                if (containerDragStarted || viewPortBeingDragged) {

                    /* The parameters received have been captured with zoom applied. We must remove the zoom in order to correctly modify the displacement. */


                    let downCopy = {
                        x: dragVector.downX,
                        y: dragVector.downY
                    };

                    let downCopyNoTransf;
                    downCopyNoTransf = viewPort.unzoomThisPoint(downCopy);
                    //downCopyNoTransf = containerBeingDragged.zoom.unzoomThisPoint(downCopyNoTransf);

                    let upCopy = {
                        x: dragVector.upX,
                        y: dragVector.upY
                    };

                    let upCopyNoTranf;
                    upCopyNoTranf = viewPort.unzoomThisPoint(upCopy);

                    let displaceVector = {
                        x: dragVector.upX - dragVector.downX,
                        y: dragVector.upY - dragVector.downY
                    };

                    if (viewPortBeingDragged) {

                        viewPort.displace(displaceVector);

                    }

                    if (containerBeingDragged !== undefined) {

                        containerBeingDragged.frame.position.x = containerBeingDragged.frame.position.x + displaceVector.x;
                        containerBeingDragged.frame.position.y = containerBeingDragged.frame.position.y + displaceVector.y;

                    }
                }

                /* Finally we set the starting point of the new dragVector at this current point. */

                dragVector.downX = dragVector.upX;
                dragVector.downY = dragVector.upY;

            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] checkDrag -> err = " + err); }

        }
    }
}