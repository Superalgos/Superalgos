
function newFloatingObject() {

    var thisObject = {

        eventHandler: undefined,

        payload: undefined,                     // This is a reference to an object controlled by a Plotter. The plotter can change its internal value and we will see them from here.
        type: undefined,                        // Currently there are two types of Floating Objects: Profile Balls, and Notes.

        physicsEnabled: false,

        initializeMass: initializeMass,
        initializeRadius: initializeRadius,
        initializeImageSize: initializeImageSize,

        imageId: undefined,

        currentPosition: 0,                     // Current x,y position of the floating object at the floating object's layer, where there is no displacement or zoom. This position is always changing towards the target position.
        currentSpeed: 0,                        // This is the current speed of the floating object.
        currentRadius: 0,                       // This is the current radius of the floating object, including its zoom applied.
        currentMass: 0,                         // This is the current mass of the floating object, including its zoom applied.

        friction: 0,                            // This is a factor that will ultimatelly desacelerate the floating object.

        rawMass: 0,                             // This is the mass value without zoom.             
        rawRadius: 0,                           // This is the radius of this floating object without zoom.

        targetRadius: 0,                        // This is the target radius of the floating object with zoom applied. It should be animated until reaching this value.

        fillStyle: '',

        labelStrokeStyle: '',

        radomizeCurrentPosition: radomizeCurrentPosition,
        radomizeCurrentSpeed: radomizeCurrentSpeed,

        drawBackground: drawBackground,
        drawForeground: drawForeground,

        updateMass: updateMass,                 // Function to update the mass when the zoom level changed.
        updateRadius: updateRadius,             // Function to update the radius when the zoom level changed.

        linkedObject: undefined,                // This is a reference to the object that this floating object is representing.
        linkedObjectType: "",                   // Since there might be floating objects for different types of objects, here we store the type of object we are linking to. 

        container: undefined,                    // This is a pointer to the object where the floating object belongs to.
        initialize: initialize

    };

    let underlayingObject;

    thisObject.eventHandler = newEventHandler();

    return thisObject;

    function initialize(pType, callBackFunction) {

        switch (pType) {

            case "Profile Ball": {

                underlayingObject = newProfileBall();
                underlayingObject.initialize(onInitialized);

                function onInitialized(err) {


                }

                break;
            }
            case "Note": {

                underlayingObject = newNote();
                underlayingObject.initialize(onInitialized);

                function onInitialized(err) {


                }
                break;
            }
            default: {

                break;
            }
        }

        thisObject.type = pType;

        thisObject.eventHandler.listenToEvent("onMouseOver", onMouseOver);
        canvas.eventHandler.listenToEvent("onMouseNotOver", onMouseNotOver);

        callBackFunction();
    }

    function onMouseOver() {

        thisObject.targetRadius = thisObject.rawRadius * 2;
        thisObject.targetImageSize = thisObject.rawImageSize * 2;
    }

    function onMouseNotOver() {

        thisObject.targetRadius = thisObject.rawRadius * 1;
        thisObject.targetImageSize = thisObject.rawImageSize * 1;
    }

    function drawBackground() {

        underlayingObject.drawBackground(thisObject);

    }

    function drawForeground() {

        underlayingObject.drawForeground(thisObject);

    }

    function initializeMass(suggestedValue) {

        var mass = suggestedValue;
        if (mass < 0.1) {
            mass = 0.1;
        }

        thisObject.rawMass = mass;
        thisObject.currentMass = mass;

    }

    function initializeRadius(suggestedValue) {

        var radius = suggestedValue;
        if (radius < 2) {
            radius = 2;
        }

        thisObject.rawRadius = radius;
        thisObject.targetRadius = radius;
        thisObject.currentRadius = radius / 3;

    }

    function initializeImageSize(suggestedValue) {

        var size = suggestedValue;
        if (size < 2) {
            size = 2;
        }

        thisObject.rawImageSize = size;
        thisObject.targetImageSize = size;
        thisObject.currentImageSize = size / 3;

    }

    function radomizeCurrentPosition(arroundPoint) {

        var position = {
            x: Math.floor((Math.random() * (200) - 100)) + arroundPoint.x,
            y: Math.floor((Math.random() * (200) - 100)) + arroundPoint.y
        };

        thisObject.currentPosition = position;
    }

    function radomizeCurrentSpeed() {

        var initialXDirection;
        var randomX = Math.floor((Math.random() * 10) + 1);
        if (randomX > 5) {
            initialXDirection = 1;
        } else {
            initialXDirection = - 1;
        }

        var initialYDirection;
        var randomY = Math.floor((Math.random() * 10) + 1);
        if (randomY > 5) {
            initialYDirection = 1;
        } else {
            initialYDirection = - 1;
        }

        var velocity = {
            x: initialXDirection * Math.floor((Math.random() * 300) + 1) / 100,
            y: initialYDirection * Math.floor((Math.random() * 300) + 1) / 100
        };

        thisObject.currentSpeed = velocity;
    }

    function updateMass() {

        //thisObject.currentMass = thisObject.rawMass + thisObject.rawMass * thisObject.container.zoom.incrementM * thisObject.container.zoom.levelM;

    }

    function updateRadius() {

        //thisObject.targetRadius = thisObject.rawRadius + thisObject.rawRadius * thisObject.container.zoom.incrementR * thisObject.container.zoom.levelR;

    }
}



