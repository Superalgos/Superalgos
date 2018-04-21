
function newBall() {

    var ball = {

        initializeTargetPosition: initializeTargetPosition,
        initializeMass: initializeMass,
        initializeRadius: initializeRadius,

        currentPosition: 0,                     // Current x,y position of the ball at the ball's layer, where there is no displacement or zoom. This position is always changing towards the target position.
        currentSpeed: 0,                        // This is the current speed of the ball.
        currentRadius: 0,                       // This is the current radius of the ball, including its zoom applied.
        currentMass: 0,                         // This is the current mass of the ball, including its zoom applied.

        friction: 0,                            // This is a factor that will ultimatelly desacelerate the ball.

        rawPosition: 0,                         // This is the position on the canvas layer, withous displacement or zoom.
        rawMass: 0,                             // This is the mass value without zoom.             
        rawRadius: 0,                           // This is the radius of this ball without zoom.

        targetPosition: 0,                      // This is the position of the ball at the canvas plane. This position has the displacement and zoom applied.
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
        updatePosition: updatePosition,         // Function to update the target position when either the displacement changed or the zoom level changed.

        linkedObject: undefined,                // This is a reference to the object that this ball is representing.
        linkedObjectType: "",                   // Since there might be balls for different types of objects, here we store the type of object we are linking to. 

        container: undefined                    // This is a pointer to the object where the ball belongs to.
    };

    return ball;

    function initializeTargetPosition() {

        /* The initialization is based on the rawPosition that must be set before calling this function. */

        var targetPosition = {
            x: this.rawPosition.x,
            y: this.rawPosition.y
        };

        targetPosition = this.container.frame.frameThisPoint(targetPosition);
        targetPosition = this.container.displacement.displaceThisPoint(targetPosition);

        this.targetPosition = targetPosition;

        // We dont need this now> smallBalls.push ([targetPosition.x, targetPosition.y, 3, 'rgba(30, 130, 30, 0.85)']);

    }

    function initializeMass(suggestedValue) {

        var mass = suggestedValue;
        if (mass < 0.1) {
            mass = 0.1;
        }

        this.rawMass = mass;
        this.currentMass = mass;

    }

    function initializeRadius(suggestedValue) {

        var radius = suggestedValue;
        if (radius < 2) {
            radius = 2;
        }

        this.rawRadius = radius;
        this.targetRadius = radius;
        this.currentRadius = radius / 3;

    }

    function radomizeCurrentPosition(arroundPoint) {

        var position = {
            x: Math.floor((Math.random() * (200) - 100)) + arroundPoint.x,
            y: Math.floor((Math.random() * (200) - 100)) + arroundPoint.y
        };

        this.currentPosition = position;
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

        this.currentSpeed = velocity;
    }

    function updateMass() {

        //this.currentMass = this.rawMass + this.rawMass * this.container.zoom.incrementM * this.container.zoom.levelM;

    }

    function updateRadius() {

        //this.targetRadius = this.rawRadius + this.rawRadius * this.container.zoom.incrementR * this.container.zoom.levelR;

    }

    function updatePosition() {

        var point = {
            x: this.rawPosition.x,
            y: this.rawPosition.y
        };

        /* Frame the point */

        point = this.container.frame.frameThisPoint(point);

        /* Second we apply the displacement. */

        point = this.container.displacement.displaceThisPoint(point);

        this.targetPosition.x = point.x;
        this.targetPosition.y = point.y;

    }

    function drawBallBackgrond() {

        if (this.currentRadius > 1) {

            /* Target Line */

            browserCanvasContext.beginPath();
            browserCanvasContext.moveTo(this.currentPosition.x, this.currentPosition.y);
            browserCanvasContext.lineTo(this.targetPosition.x, this.targetPosition.y);
            browserCanvasContext.strokeStyle = 'rgba(204, 204, 204, 0.5)';
            browserCanvasContext.setLineDash([4, 2]);
            browserCanvasContext.lineWidth = 1;
            browserCanvasContext.stroke();
            browserCanvasContext.setLineDash([0, 0]);

        }

        if (this.currentRadius > 0.5) {

            /* Target Spot */

            var radius = 1;

            browserCanvasContext.beginPath();
            browserCanvasContext.arc(this.targetPosition.x, this.targetPosition.y, radius, 0, Math.PI * 2, true);
            browserCanvasContext.closePath();
            browserCanvasContext.fillStyle = 'rgba(30, 30, 30, 1)';
            browserCanvasContext.fill();

        }
    }

    function drawBallForeground() {

        if (this.currentRadius > 5) {

            /* Contourn */

            browserCanvasContext.beginPath();
            browserCanvasContext.arc(this.currentPosition.x, this.currentPosition.y, this.currentRadius, 0, Math.PI * 2, true);
            browserCanvasContext.closePath();
            browserCanvasContext.strokeStyle = 'rgba(30, 30, 30, 0.75)';
            browserCanvasContext.lineWidth = 1;
            browserCanvasContext.stroke();

        }

        if (this.currentRadius > 0.5) {

            /* Main Ball */

            var alphaA;

            if (this.currentRadius < 3) {
                alphaA = 1;
            } else {
                alphaA = 0.75;
            }

            alphaA = 0.75;

            browserCanvasContext.beginPath();
            browserCanvasContext.arc(this.currentPosition.x, this.currentPosition.y, this.currentRadius, 0, Math.PI * 2, true);
            browserCanvasContext.closePath();

            browserCanvasContext.fillStyle = this.fillStyle;

            browserCanvasContext.fill();

        }

        /* Label First Text */

        if (this.currentRadius > 6) {

            browserCanvasContext.strokeStyle = this.labelStrokeStyle;

            var xOffset = 0;

            if (this.labelFirstText >= 10) {
                xOffset = this.currentRadius / 10;
            }

            browserCanvasContext.font = (this.currentRadius / 4).toFixed(0) + 'px verdana';

            try {
                browserCanvasContext.fillText(this.labelFirstText.toFixed(0), this.currentPosition.x - 2 - xOffset, this.currentPosition.y + 2);
            } catch (err) {
                browserCanvasContext.fillText(this.labelFirstText, this.currentPosition.x - 2 - xOffset, this.currentPosition.y + 2);
            }

        }

        /* Label Second Text */

        if (this.currentRadius > 10) {

            browserCanvasContext.strokeStyle = this.labelStrokeStyle;

            var xOffset = 0;


            xOffset = this.currentRadius / 2;


            browserCanvasContext.font = (this.currentRadius / 6).toFixed(0) + 'px verdana';

            try {
                browserCanvasContext.fillText(this.labelSecondText.toFixed(8), this.currentPosition.x - xOffset, this.currentPosition.y + xOffset);
            } catch (err) {
                browserCanvasContext.fillText(this.labelSecondText, this.currentPosition.x - xOffset, this.currentPosition.y + xOffset);
            }
        }
    }

}



