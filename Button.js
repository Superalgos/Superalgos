function newButton() {

    var button = {
        container: undefined,
        press: press,
        draw: draw,
        offFillStyle: 'rgba(150, 150, 250, 1)',
        onFillStyle: 'rgba(250, 150, 150, 1)',
        status: 'off', 
        type: undefined,
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    container.isDraggeable = false;
    container.isZoomeable = false;
    container.isClickeable = true;
    button.container = container;

    const REDUCTION_FACTOR = 3;

    return button;

    function initialize() {

        /* Lets set the basic dimensions of this button. */

        var position = {
            x: 0,
            y: 0
        };

        this.container.frame.position = position;
        this.container.frame.width = 50 / REDUCTION_FACTOR;
        this.container.frame.height = 50 / REDUCTION_FACTOR;

        /* Now we start listening to the onClick event from the mouse, so that we can allow users operate this button. */

        this.container.eventHandler.listenToEvent('onMouseClick', press, undefined);

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

    function press(event, extraData) {

        button.status = 'on';

    }

    function draw() {

        switch (this.type) {

            case "Fast Backwards":

                drawFastBackwards();
                break;

            case "Play Backwards":

                drawPlayBackwards();
                break;

            case "Step Backwards":

                drawStepBackwards();
                break;

            case "Pause":

                drawPause();
                break;

            case "Step Forward":

                drawStepForward();
                break;

            case "Play Forward":

                drawPlayForward();
                break;

            case "Fast Forward":

                drawFastForward();
                break;

            default:


        }

    }


    function drawFastBackwards() {

        point1 = {
            x: 40 / REDUCTION_FACTOR,
            y: 10 / REDUCTION_FACTOR
        };

        point2 = {
            x: 25 / REDUCTION_FACTOR,
            y: 25 / REDUCTION_FACTOR
        };

        point3 = {
            x: 40 / REDUCTION_FACTOR,
            y: 40 / REDUCTION_FACTOR
        };





        point5 = {
            x: 25 / REDUCTION_FACTOR,
            y: 10 / REDUCTION_FACTOR
        };

        point6 = {
            x: 10 / REDUCTION_FACTOR,
            y: 25 / REDUCTION_FACTOR
        };

        point7 = {
            x: 25 / REDUCTION_FACTOR,
            y: 40 / REDUCTION_FACTOR
        };



        /* Now the transformations. */

        point1 = button.container.frame.frameThisPoint(point1);
        point2 = button.container.frame.frameThisPoint(point2);
        point3 = button.container.frame.frameThisPoint(point3);

        point5 = button.container.frame.frameThisPoint(point5);
        point6 = button.container.frame.frameThisPoint(point6);
        point7 = button.container.frame.frameThisPoint(point7);

        point1 = button.container.displacement.displaceThisPoint(point1);
        point2 = button.container.displacement.displaceThisPoint(point2);
        point3 = button.container.displacement.displaceThisPoint(point3);

        point5 = button.container.displacement.displaceThisPoint(point5);
        point6 = button.container.displacement.displaceThisPoint(point6);
        point7 = button.container.displacement.displaceThisPoint(point7);

        point1 = button.container.zoom.zoomThisPoint(point1);
        point2 = button.container.zoom.zoomThisPoint(point2);
        point3 = button.container.zoom.zoomThisPoint(point3);

        point5 = button.container.zoom.zoomThisPoint(point5);
        point6 = button.container.zoom.zoomThisPoint(point6);
        point7 = button.container.zoom.zoomThisPoint(point7);


        /* Lets start the drawing. */

        browserCanvasContext.beginPath();
        browserCanvasContext.moveTo(point1.x, point1.y);
        browserCanvasContext.lineTo(point2.x, point2.y);
        browserCanvasContext.lineTo(point3.x, point3.y);
        browserCanvasContext.lineTo(point1.x, point1.y);

        browserCanvasContext.moveTo(point5.x, point5.y);
        browserCanvasContext.lineTo(point6.x, point6.y);
        browserCanvasContext.lineTo(point7.x, point7.y);
        browserCanvasContext.lineTo(point5.x, point5.y);
        browserCanvasContext.closePath();

        if (button.status === "on") {
            browserCanvasContext.fillStyle = button.onFillStyle;
        } else {
            browserCanvasContext.fillStyle = button.offFillStyle;
        }
        browserCanvasContext.fill();

        browserCanvasContext.strokeStyle = 'rgba(150, 150, 150, 0.5)';
        browserCanvasContext.lineWidth = 1;
        browserCanvasContext.stroke();

        browserCanvasContext.closePath();

    }

    function drawPlayBackwards() {

        point1 = {
            x: 40 / REDUCTION_FACTOR,
            y: 10 / REDUCTION_FACTOR
        };

        point2 = {
            x: 10 / REDUCTION_FACTOR,
            y: 25 / REDUCTION_FACTOR
        };

        point3 = {
            x: 40 / REDUCTION_FACTOR,
            y: 40 / REDUCTION_FACTOR
        };


        /* Now the transformations. */

        point1 = button.container.frame.frameThisPoint(point1);
        point2 = button.container.frame.frameThisPoint(point2);
        point3 = button.container.frame.frameThisPoint(point3);

        point1 = button.container.displacement.displaceThisPoint(point1);
        point2 = button.container.displacement.displaceThisPoint(point2);
        point3 = button.container.displacement.displaceThisPoint(point3);

        point1 = button.container.zoom.zoomThisPoint(point1);
        point2 = button.container.zoom.zoomThisPoint(point2);
        point3 = button.container.zoom.zoomThisPoint(point3);

        /* Lets start the drawing. */

        browserCanvasContext.beginPath();
        browserCanvasContext.moveTo(point1.x, point1.y);
        browserCanvasContext.lineTo(point2.x, point2.y);
        browserCanvasContext.lineTo(point3.x, point3.y);
        browserCanvasContext.lineTo(point1.x, point1.y);

        browserCanvasContext.closePath();

        if (button.status === "on") {
            browserCanvasContext.fillStyle = button.onFillStyle;
        } else {
            browserCanvasContext.fillStyle = button.offFillStyle;
        }
        browserCanvasContext.fill();

        browserCanvasContext.strokeStyle = 'rgba(150, 150, 150, 0.5)';
        browserCanvasContext.lineWidth = 1;
        browserCanvasContext.stroke();

        browserCanvasContext.closePath();

    }

    function drawStepBackwards() {

        point1 = {
            x: 40 / REDUCTION_FACTOR,
            y: 10 / REDUCTION_FACTOR
        };

        point2 = {
            x: 20 / REDUCTION_FACTOR,
            y: 25 / REDUCTION_FACTOR
        };

        point3 = {
            x: 40 / REDUCTION_FACTOR,
            y: 40 / REDUCTION_FACTOR
        };





        point5 = {
            x: 10 / REDUCTION_FACTOR,
            y: 10 / REDUCTION_FACTOR
        };

        point6 = {
            x: 20 / REDUCTION_FACTOR,
            y: 10 / REDUCTION_FACTOR
        };

        point7 = {
            x: 20 / REDUCTION_FACTOR,
            y: 40 / REDUCTION_FACTOR
        };

        point8 = {
            x: 10 / REDUCTION_FACTOR,
            y: 40 / REDUCTION_FACTOR
        };

        /* Now the transformations. */

        point1 = button.container.frame.frameThisPoint(point1);
        point2 = button.container.frame.frameThisPoint(point2);
        point3 = button.container.frame.frameThisPoint(point3);

        point5 = button.container.frame.frameThisPoint(point5);
        point6 = button.container.frame.frameThisPoint(point6);
        point7 = button.container.frame.frameThisPoint(point7);
        point8 = button.container.frame.frameThisPoint(point8);

        point1 = button.container.displacement.displaceThisPoint(point1);
        point2 = button.container.displacement.displaceThisPoint(point2);
        point3 = button.container.displacement.displaceThisPoint(point3);

        point5 = button.container.displacement.displaceThisPoint(point5);
        point6 = button.container.displacement.displaceThisPoint(point6);
        point7 = button.container.displacement.displaceThisPoint(point7);
        point8 = button.container.displacement.displaceThisPoint(point8);

        point1 = button.container.zoom.zoomThisPoint(point1);
        point2 = button.container.zoom.zoomThisPoint(point2);
        point3 = button.container.zoom.zoomThisPoint(point3);

        point5 = button.container.zoom.zoomThisPoint(point5);
        point6 = button.container.zoom.zoomThisPoint(point6);
        point7 = button.container.zoom.zoomThisPoint(point7);
        point8 = button.container.zoom.zoomThisPoint(point8);


        /* Lets start the drawing. */

        browserCanvasContext.beginPath();
        browserCanvasContext.moveTo(point1.x, point1.y);
        browserCanvasContext.lineTo(point2.x, point2.y);
        browserCanvasContext.lineTo(point3.x, point3.y);

        browserCanvasContext.lineTo(point1.x, point1.y);

        browserCanvasContext.moveTo(point5.x, point5.y);
        browserCanvasContext.lineTo(point6.x, point6.y);
        browserCanvasContext.lineTo(point7.x, point7.y);
        browserCanvasContext.lineTo(point8.x, point8.y);
        browserCanvasContext.lineTo(point5.x, point5.y);
        browserCanvasContext.closePath();

        if (button.status === "on") {
            browserCanvasContext.fillStyle = button.onFillStyle;
        } else {
            browserCanvasContext.fillStyle = button.offFillStyle;
        }
        browserCanvasContext.fill();

        browserCanvasContext.strokeStyle = 'rgba(150, 150, 150, 0.5)';
        browserCanvasContext.lineWidth = 1;
        browserCanvasContext.stroke();

        browserCanvasContext.closePath();

    }

    function drawPause() {

        point1 = {
            x: 10 / REDUCTION_FACTOR,
            y: 10 / REDUCTION_FACTOR
        };

        point2 = {
            x: 20 / REDUCTION_FACTOR,
            y: 10 / REDUCTION_FACTOR
        };

        point3 = {
            x: 20 / REDUCTION_FACTOR,
            y: 40 / REDUCTION_FACTOR
        };

        point4 = {
            x: 10 / REDUCTION_FACTOR,
            y: 40 / REDUCTION_FACTOR
        };

        point5 = {
            x: 30 / REDUCTION_FACTOR,
            y: 10 / REDUCTION_FACTOR
        };

        point6 = {
            x: 40 / REDUCTION_FACTOR,
            y: 10 / REDUCTION_FACTOR
        };

        point7 = {
            x: 40 / REDUCTION_FACTOR,
            y: 40 / REDUCTION_FACTOR
        };

        point8 = {
            x: 30 / REDUCTION_FACTOR,
            y: 40 / REDUCTION_FACTOR
        };

        /* Now the transformations. */

        point1 = button.container.frame.frameThisPoint(point1);
        point2 = button.container.frame.frameThisPoint(point2);
        point3 = button.container.frame.frameThisPoint(point3);
        point4 = button.container.frame.frameThisPoint(point4);
        point5 = button.container.frame.frameThisPoint(point5);
        point6 = button.container.frame.frameThisPoint(point6);
        point7 = button.container.frame.frameThisPoint(point7);
        point8 = button.container.frame.frameThisPoint(point8);

        point1 = button.container.displacement.displaceThisPoint(point1);
        point2 = button.container.displacement.displaceThisPoint(point2);
        point3 = button.container.displacement.displaceThisPoint(point3);
        point4 = button.container.displacement.displaceThisPoint(point4);
        point5 = button.container.displacement.displaceThisPoint(point5);
        point6 = button.container.displacement.displaceThisPoint(point6);
        point7 = button.container.displacement.displaceThisPoint(point7);
        point8 = button.container.displacement.displaceThisPoint(point8);

        point1 = button.container.zoom.zoomThisPoint(point1);
        point2 = button.container.zoom.zoomThisPoint(point2);
        point3 = button.container.zoom.zoomThisPoint(point3);
        point4 = button.container.zoom.zoomThisPoint(point4);
        point5 = button.container.zoom.zoomThisPoint(point5);
        point6 = button.container.zoom.zoomThisPoint(point6);
        point7 = button.container.zoom.zoomThisPoint(point7);
        point8 = button.container.zoom.zoomThisPoint(point8);


        /* Lets start the drawing. */

        browserCanvasContext.beginPath();
        browserCanvasContext.moveTo(point1.x, point1.y);
        browserCanvasContext.lineTo(point2.x, point2.y);
        browserCanvasContext.lineTo(point3.x, point3.y);
        browserCanvasContext.lineTo(point4.x, point4.y);
        browserCanvasContext.lineTo(point1.x, point1.y);

        browserCanvasContext.moveTo(point5.x, point5.y);
        browserCanvasContext.lineTo(point6.x, point6.y);
        browserCanvasContext.lineTo(point7.x, point7.y);
        browserCanvasContext.lineTo(point8.x, point8.y);
        browserCanvasContext.lineTo(point5.x, point5.y);
        browserCanvasContext.closePath();

        if (button.status === "on") {
            browserCanvasContext.fillStyle = button.onFillStyle;
        } else {
            browserCanvasContext.fillStyle = button.offFillStyle;
        }
        browserCanvasContext.fill();

        browserCanvasContext.strokeStyle = 'rgba(150, 150, 150, 0.5)';
        browserCanvasContext.lineWidth = 1;
        browserCanvasContext.stroke();

        browserCanvasContext.closePath();

    }

    function drawStepForward() {

        point1 = {
            x: 10 / REDUCTION_FACTOR,
            y: 10 / REDUCTION_FACTOR
        };

        point2 = {
            x: 30 / REDUCTION_FACTOR,
            y: 25 / REDUCTION_FACTOR
        };

        point3 = {
            x: 10 / REDUCTION_FACTOR,
            y: 40 / REDUCTION_FACTOR
        };





        point5 = {
            x: 30 / REDUCTION_FACTOR,
            y: 10 / REDUCTION_FACTOR
        };

        point6 = {
            x: 40 / REDUCTION_FACTOR,
            y: 10 / REDUCTION_FACTOR
        };

        point7 = {
            x: 40 / REDUCTION_FACTOR,
            y: 40 / REDUCTION_FACTOR
        };

        point8 = {
            x: 30 / REDUCTION_FACTOR,
            y: 40 / REDUCTION_FACTOR
        };

        /* Now the transformations. */

        point1 = button.container.frame.frameThisPoint(point1);
        point2 = button.container.frame.frameThisPoint(point2);
        point3 = button.container.frame.frameThisPoint(point3);

        point5 = button.container.frame.frameThisPoint(point5);
        point6 = button.container.frame.frameThisPoint(point6);
        point7 = button.container.frame.frameThisPoint(point7);
        point8 = button.container.frame.frameThisPoint(point8);

        point1 = button.container.displacement.displaceThisPoint(point1);
        point2 = button.container.displacement.displaceThisPoint(point2);
        point3 = button.container.displacement.displaceThisPoint(point3);

        point5 = button.container.displacement.displaceThisPoint(point5);
        point6 = button.container.displacement.displaceThisPoint(point6);
        point7 = button.container.displacement.displaceThisPoint(point7);
        point8 = button.container.displacement.displaceThisPoint(point8);

        point1 = button.container.zoom.zoomThisPoint(point1);
        point2 = button.container.zoom.zoomThisPoint(point2);
        point3 = button.container.zoom.zoomThisPoint(point3);

        point5 = button.container.zoom.zoomThisPoint(point5);
        point6 = button.container.zoom.zoomThisPoint(point6);
        point7 = button.container.zoom.zoomThisPoint(point7);
        point8 = button.container.zoom.zoomThisPoint(point8);


        /* Lets start the drawing. */

        browserCanvasContext.beginPath();
        browserCanvasContext.moveTo(point1.x, point1.y);
        browserCanvasContext.lineTo(point2.x, point2.y);
        browserCanvasContext.lineTo(point3.x, point3.y);

        browserCanvasContext.lineTo(point1.x, point1.y);

        browserCanvasContext.moveTo(point5.x, point5.y);
        browserCanvasContext.lineTo(point6.x, point6.y);
        browserCanvasContext.lineTo(point7.x, point7.y);
        browserCanvasContext.lineTo(point8.x, point8.y);
        browserCanvasContext.lineTo(point5.x, point5.y);
        browserCanvasContext.closePath();

        if (button.status === "on") {
            browserCanvasContext.fillStyle = button.onFillStyle;
        } else {
            browserCanvasContext.fillStyle = button.offFillStyle;
        }
        browserCanvasContext.fill();

        browserCanvasContext.strokeStyle = 'rgba(150, 150, 150, 0.5)';
        browserCanvasContext.lineWidth = 1;
        browserCanvasContext.stroke();

        browserCanvasContext.closePath();

    }

    function drawPlayForward() {

        point1 = {
            x: 10 / REDUCTION_FACTOR,
            y: 10 / REDUCTION_FACTOR
        };

        point2 = {
            x: 40 / REDUCTION_FACTOR,
            y: 25 / REDUCTION_FACTOR
        };

        point3 = {
            x: 10 / REDUCTION_FACTOR,
            y: 40 / REDUCTION_FACTOR
        };


        /* Now the transformations. */

        point1 = button.container.frame.frameThisPoint(point1);
        point2 = button.container.frame.frameThisPoint(point2);
        point3 = button.container.frame.frameThisPoint(point3);

        point1 = button.container.displacement.displaceThisPoint(point1);
        point2 = button.container.displacement.displaceThisPoint(point2);
        point3 = button.container.displacement.displaceThisPoint(point3);

        point1 = button.container.zoom.zoomThisPoint(point1);
        point2 = button.container.zoom.zoomThisPoint(point2);
        point3 = button.container.zoom.zoomThisPoint(point3);

        /* Lets start the drawing. */

        browserCanvasContext.beginPath();
        browserCanvasContext.moveTo(point1.x, point1.y);
        browserCanvasContext.lineTo(point2.x, point2.y);
        browserCanvasContext.lineTo(point3.x, point3.y);
        browserCanvasContext.lineTo(point1.x, point1.y);

        browserCanvasContext.closePath();

        if (button.status === "on") {
            browserCanvasContext.fillStyle = button.onFillStyle;
        } else {
            browserCanvasContext.fillStyle = button.offFillStyle;
        }
        browserCanvasContext.fill();

        browserCanvasContext.strokeStyle = 'rgba(150, 150, 150, 0.5)';
        browserCanvasContext.lineWidth = 1;
        browserCanvasContext.stroke();

        browserCanvasContext.closePath();

    }


    function drawFastForward() {

        point1 = {
            x: 10 / REDUCTION_FACTOR,
            y: 10 / REDUCTION_FACTOR
        };

        point2 = {
            x: 25 / REDUCTION_FACTOR,
            y: 25 / REDUCTION_FACTOR
        };

        point3 = {
            x: 10 / REDUCTION_FACTOR,
            y: 40 / REDUCTION_FACTOR
        };





        point5 = {
            x: 25 / REDUCTION_FACTOR,
            y: 10 / REDUCTION_FACTOR
        };

        point6 = {
            x: 40 / REDUCTION_FACTOR,
            y: 25 / REDUCTION_FACTOR
        };

        point7 = {
            x: 25 / REDUCTION_FACTOR,
            y: 40 / REDUCTION_FACTOR
        };



        /* Now the transformations. */

        point1 = button.container.frame.frameThisPoint(point1);
        point2 = button.container.frame.frameThisPoint(point2);
        point3 = button.container.frame.frameThisPoint(point3);

        point5 = button.container.frame.frameThisPoint(point5);
        point6 = button.container.frame.frameThisPoint(point6);
        point7 = button.container.frame.frameThisPoint(point7);

        point1 = button.container.displacement.displaceThisPoint(point1);
        point2 = button.container.displacement.displaceThisPoint(point2);
        point3 = button.container.displacement.displaceThisPoint(point3);

        point5 = button.container.displacement.displaceThisPoint(point5);
        point6 = button.container.displacement.displaceThisPoint(point6);
        point7 = button.container.displacement.displaceThisPoint(point7);

        point1 = button.container.zoom.zoomThisPoint(point1);
        point2 = button.container.zoom.zoomThisPoint(point2);
        point3 = button.container.zoom.zoomThisPoint(point3);

        point5 = button.container.zoom.zoomThisPoint(point5);
        point6 = button.container.zoom.zoomThisPoint(point6);
        point7 = button.container.zoom.zoomThisPoint(point7);


        /* Lets start the drawing. */

        browserCanvasContext.beginPath();
        browserCanvasContext.moveTo(point1.x, point1.y);
        browserCanvasContext.lineTo(point2.x, point2.y);
        browserCanvasContext.lineTo(point3.x, point3.y);
        browserCanvasContext.lineTo(point1.x, point1.y);

        browserCanvasContext.moveTo(point5.x, point5.y);
        browserCanvasContext.lineTo(point6.x, point6.y);
        browserCanvasContext.lineTo(point7.x, point7.y);
        browserCanvasContext.lineTo(point5.x, point5.y);
        browserCanvasContext.closePath();

        if (button.status === "on") {
            browserCanvasContext.fillStyle = button.onFillStyle;
        } else {
            browserCanvasContext.fillStyle = button.offFillStyle;
        }
        
        browserCanvasContext.fill();

        browserCanvasContext.strokeStyle = 'rgba(150, 150, 150, 0.5)';
        browserCanvasContext.lineWidth = 1;
        browserCanvasContext.stroke();

        browserCanvasContext.closePath();

    }





 

}