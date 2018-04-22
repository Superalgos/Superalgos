
function newBall() {

    var thisObject = {

        input: undefined,                       // This object contains information needed to draw the ball, but also referenced from outside, so as to have control of the basics of the ball.
        physicsEnabled: false,

        initializeMass: initializeMass,
        initializeRadius: initializeRadius,

        imageId: undefined,

        currentPosition: 0,                     // Current x,y position of the ball at the ball's layer, where there is no displacement or zoom. This position is always changing towards the target position.
        currentSpeed: 0,                        // This is the current speed of the ball.
        currentRadius: 0,                       // This is the current radius of the ball, including its zoom applied.
        currentMass: 0,                         // This is the current mass of the ball, including its zoom applied.

        friction: 0,                            // This is a factor that will ultimatelly desacelerate the ball.

        rawMass: 0,                             // This is the mass value without zoom.             
        rawRadius: 0,                           // This is the radius of this ball without zoom.

        targetRadius: 0,                        // This is the target radius of the ball with zoom applied. It should be animated until reaching this value.

        fillStyle: '',

        labelStrokeStyle: '',
        labelFirstText: '',
        labelSecondText: '',

        radomizeCurrentPosition: radomizeCurrentPosition,
        radomizeCurrentSpeed: radomizeCurrentSpeed,

        drawBackground: drawBallBackgrond,      // Function to draw the ball elements on the canvas layer.
        drawForeground: drawBallForeground,     // Function to draw the ball elements on the balls layer.

        updateMass: updateMass,                 // Function to update the mass when the zoom level changed.
        updateRadius: updateRadius,             // Function to update the radius when the zoom level changed.

        linkedObject: undefined,                // This is a reference to the object that this ball is representing.
        linkedObjectType: "",                   // Since there might be balls for different types of objects, here we store the type of object we are linking to. 

        container: undefined                    // This is a pointer to the object where the ball belongs to.
    };

    return thisObject;


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

    function drawBallBackgrond() {

        if (thisObject.input.visible === false) { return; }
        if (thisObject.input.visible === true && thisObject.physicsEnabled === false) {

            /* The first time that the ball becomes visible, we need to do thisObject. */

            radomizeCurrentPosition(thisObject.input.position);
            radomizeCurrentSpeed();

            thisObject.physicsEnabled = true;
        }

        if (thisObject.currentRadius > 1) {

            /* Target Line */

            browserCanvasContext.beginPath();
            browserCanvasContext.moveTo(thisObject.currentPosition.x, thisObject.currentPosition.y);
            browserCanvasContext.lineTo(thisObject.input.position.x, thisObject.input.position.y);
            browserCanvasContext.strokeStyle = 'rgba(204, 204, 204, 0.5)';
            browserCanvasContext.setLineDash([4, 2]);
            browserCanvasContext.lineWidth = 1;
            browserCanvasContext.stroke();
            browserCanvasContext.setLineDash([0, 0]);

        }

        if (thisObject.currentRadius > 0.5) {

            /* Target Spot */

            var radius = 1;

            browserCanvasContext.beginPath();
            browserCanvasContext.arc(thisObject.input.position.x, thisObject.input.position.y, radius, 0, Math.PI * 2, true);
            browserCanvasContext.closePath();
            browserCanvasContext.fillStyle = 'rgba(30, 30, 30, 1)';
            browserCanvasContext.fill();

        }
    }

    function drawBallForeground() {

        if (thisObject.input.visible === false) { return; }

        if (thisObject.currentRadius > 5) {

            /* Contourn */

            browserCanvasContext.beginPath();
            browserCanvasContext.arc(thisObject.currentPosition.x, thisObject.currentPosition.y, thisObject.currentRadius, 0, Math.PI * 2, true);
            browserCanvasContext.closePath();
            browserCanvasContext.strokeStyle = 'rgba(30, 30, 30, 0.75)';
            browserCanvasContext.lineWidth = 1;
            browserCanvasContext.stroke();

        }

        if (thisObject.currentRadius > 0.5) {

            /* Main Ball */

            var alphaA;

            if (thisObject.currentRadius < 3) {
                alphaA = 1;
            } else {
                alphaA = 0.75;
            }

            alphaA = 0.75;

            browserCanvasContext.beginPath();
            browserCanvasContext.arc(thisObject.currentPosition.x, thisObject.currentPosition.y, thisObject.currentRadius, 0, Math.PI * 2, true);
            browserCanvasContext.closePath();

            browserCanvasContext.fillStyle = thisObject.fillStyle;

            browserCanvasContext.fill();

        }

        /* Image */

        if (thisObject.input.imageId !== undefined) {

            let image = document.getElementById(thisObject.input.imageId);
            let imageSize = 50;

            if (image !== null) {

                browserCanvasContext.drawImage(image, thisObject.currentPosition.x - imageSize / 2, thisObject.currentPosition.y - imageSize / 2, imageSize, imageSize);

            }
        }

        /* Label First Text */

        if (thisObject.currentRadius > 6) {

            browserCanvasContext.strokeStyle = thisObject.labelStrokeStyle;

            var xOffset = 0;

            if (thisObject.labelFirstText >= 10) {
                xOffset = thisObject.currentRadius / 10;
            }

            browserCanvasContext.font = (thisObject.currentRadius / 4).toFixed(0) + 'px verdana';

            try {
                browserCanvasContext.fillText(thisObject.labelFirstText.toFixed(0), thisObject.currentPosition.x - 2 - xOffset, thisObject.currentPosition.y + 2);
            } catch (err) {
                browserCanvasContext.fillText(thisObject.labelFirstText, thisObject.currentPosition.x - 2 - xOffset, thisObject.currentPosition.y + 2);
            }

        }

        /* Label Second Text */

        if (thisObject.currentRadius > 10) {

            browserCanvasContext.strokeStyle = thisObject.labelStrokeStyle;

            var xOffset = 0;


            xOffset = thisObject.currentRadius / 2;


            browserCanvasContext.font = (thisObject.currentRadius / 6).toFixed(0) + 'px verdana';

            try {
                browserCanvasContext.fillText(thisObject.labelSecondText.toFixed(8), thisObject.currentPosition.x - xOffset, thisObject.currentPosition.y + xOffset);
            } catch (err) {
                browserCanvasContext.fillText(thisObject.labelSecondText, thisObject.currentPosition.x - xOffset, thisObject.currentPosition.y + xOffset);
            }
        }
    }

}



