
function newFrame() {

    const PANEL_CORNERS_RADIOUS = 10;
    const TITLE_BAR_HEIGHT = 14; // this must be grater than radius

    var frame = {
        containerName: "",                  // This is for debugging purposes only.
        parentFrame: undefined,             // Here we store the parent cointainer zoom object. 
        width: browserCanvas.width,
        height: browserCanvas.height,
        position: undefined,
        getBodyHeight: getBodyHeight,
        draw: draw,
        container: undefined,
        frameThisPoint: frameThisPoint,     // This function changes the actual frame coordinate system to the screen coordinate system.
        unframeThisPoint: unframeThisPoint,
        fitIntoFrame: fitIntoFrame,
        isThisPointHere: isThisPointHere,   // This function return true is the point received as parameter lives within this frame. 
        isInViewPort: isInViewPort,
        canYouMoveHere: canYouMoveHere,
        canYouZoomHere: canYouZoomHere,
        initialize: initialize
    };

    return frame;

    function initialize() {

        var position = {
            x: 0,
            y: 0
        };

        this.position = position;
    }


    function getBodyHeight() {

        return frame.height - TITLE_BAR_HEIGHT;

    }

    function isInViewPort() {

        point1 = {
            x: 0,
            y: 0
        };

        point3 = {
            x: frame.width,
            y: frame.height
        };


        /* Now the transformations. */

        point1 = transformThisPoint(point1, frame.container);
        point3 = transformThisPoint(point3, frame.container);

        if (point1.x < viewPort.visibleArea.topRight.x && point1.y < viewPort.visibleArea.bottomRight.y && point3.x > viewPort.visibleArea.bottomLeft.x && point3.y > viewPort.visibleArea.topLeft.y ) {

            return true;
        } else {
            return false;
        }

    }

    function fitIntoFrame(point) {


        /* Here we check the boundaries of the resulting points, so they dont go out of the visible area. */

        if (point.x > frame.width) {
            point.x = frame.width;
        }

        if (point.x < 0) {
            point.x = 0;
        }

        if (point.y > frame.height) {
            point.y = frame.height;
        }

        if (point.y < 0) {
            point.y = 0;
        }

        return point;
    }



    function frameThisPoint(point) {

        if (this.parentFrame !== undefined) {

            point = this.parentFrame.frameThisPoint(point);

        }

        point.x = point.x + frame.position.x;
        point.y = point.y + frame.position.y;

        return point;
    }

    function unframeThisPoint(point) {

        if (this.parentFrame !== undefined) {

            point = this.parentFrame.unframeThisPoint(point);

        }

        point.x = point.x - this.position.x;
        point.y = point.y - this.position.y;

        return point;
    }

    function canYouMoveHere(tempDisplacement) {

        /*

        The current frame has a position and a displacement. We need to check that none of the boundaries points of the frame fall outside of its container frame.
        First we apply the theoreticall displacement.

        */

        point1 = {
            x: this.position.x,
            y: this.position.y
        };

        point2 = {
            x: this.position.x + this.width,
            y: this.position.y
        };

        point3 = {
            x: this.position.x + this.width,
            y: this.position.y + this.height
        };

        point4 = {
            x: this.position.x,
            y: this.position.y + this.height
        };

        /* Now the transformations. */

        if (this.parentFrame !== undefined) {   // If there is not a parent then there is no point to check bounderies.

            point1 = this.parentFrame.frameThisPoint(point1);
            point2 = this.parentFrame.frameThisPoint(point2);
            point3 = this.parentFrame.frameThisPoint(point3);
            point4 = this.parentFrame.frameThisPoint(point4);

            /* We apply the temporary displacement. */

            point1 = tempDisplacement.displaceThisPoint(point1);
            point2 = tempDisplacement.displaceThisPoint(point2);
            point3 = tempDisplacement.displaceThisPoint(point3);
            point4 = tempDisplacement.displaceThisPoint(point4);

            /* We add the actual displacement. */

            point1 = this.container.displacement.displaceThisPoint(point1);
            point2 = this.container.displacement.displaceThisPoint(point2);
            point3 = this.container.displacement.displaceThisPoint(point3);
            point4 = this.container.displacement.displaceThisPoint(point4);

            if (this.parentFrame.isThisPointHere(point1) === false) {
                return false;
            }

            if (this.parentFrame.isThisPointHere(point2) === false) {
                return false;
            }

            if (this.parentFrame.isThisPointHere(point3) === false) {
                return false;
            }

            if (this.parentFrame.isThisPointHere(point4) === false) {
                return false;
            }

        }

        return true;
    }

    function canYouZoomHere(tempZoom) {

        point1 = {
            x: this.position.x,
            y: this.position.y
        };

        point2 = {
            x: this.position.x + this.width,
            y: this.position.y
        };

        point3 = {
            x: this.position.x + this.width,
            y: this.position.y + this.height
        };

        point4 = {
            x: this.position.x,
            y: this.position.y + this.height
        };

        /* Now the transformations. */

        if (this.parentFrame !== undefined) {  // If there is not a parent then there is no point to check bounderies.

            point1 = this.parentFrame.frameThisPoint(point1);
            point2 = this.parentFrame.frameThisPoint(point2);
            point3 = this.parentFrame.frameThisPoint(point3);
            point4 = this.parentFrame.frameThisPoint(point4);

            /* We add the actual displacement. */

            point1 = this.container.displacement.displaceThisPoint(point1);
            point2 = this.container.displacement.displaceThisPoint(point2);
            point3 = this.container.displacement.displaceThisPoint(point3);
            point4 = this.container.displacement.displaceThisPoint(point4);

            /* We temp zoom. */

            point1 = tempZoom.zoomThisPoint(point1);
            point2 = tempZoom.zoomThisPoint(point2);
            point3 = tempZoom.zoomThisPoint(point3);
            point4 = tempZoom.zoomThisPoint(point4);

            if (this.parentFrame.isThisPointHere(point1) === false) {
                return false;
            }

            if (this.parentFrame.isThisPointHere(point2) === false) {
                return false;
            }

            if (this.parentFrame.isThisPointHere(point3) === false) {
                return false;
            }

            if (this.parentFrame.isThisPointHere(point4) === false) {
                return false;
            }

        }

        return true;
    }


    function isThisPointHere(point, outsideViewPort) {  // The second parameter is usefull when you want to check a point that you already know is outside the viewport.

        /* We need not to modify the point received, so me make a copy of it. */

        var checkPoint = {
            x: point.x,
            y: point.y
        };

        /* The point received is on the screen coordinates system, which already has zoom and displacement applied. We need to remove the zoom and displacement
        in order to have the point on the containers coordinate system and be able to compare it with its dimmensions. */

        if (outsideViewPort === true) {

            checkPoint = this.container.displacement.undisplaceThisPoint(checkPoint);
            checkPoint = this.container.frame.unframeThisPoint(checkPoint);

        } else {
            checkPoint = unTransformThisPoint(checkPoint, frame.container);
        }

        /* Now we check if the resulting point is whin the current Frame. */

        if (checkPoint.x < 0 || checkPoint.y < 0 || checkPoint.x > frame.width || checkPoint.y > frame.height) {

            /* The point received is not in this frame */

            return false;

        } else {

            /* The point is within this frame. */

            return true;

        }

    }

    function draw(drawGrid, drawBorders, drawBackground) {


        if (drawBorders === true) {
            borders();
        }

        if (drawGrid === true) {
            grid();
        }

        if (drawBackground === true) {
            background();
        }
    }

    function background() {



        borderPoint1 = {
            x: PANEL_CORNERS_RADIOUS,
            y: PANEL_CORNERS_RADIOUS
        };

        borderPoint2 = {
            x: frame.width - PANEL_CORNERS_RADIOUS,
            y: PANEL_CORNERS_RADIOUS
        };

        borderPoint3 = {
            x: frame.width - PANEL_CORNERS_RADIOUS,
            y: frame.height - PANEL_CORNERS_RADIOUS
        };

        borderPoint4 = {
            x: PANEL_CORNERS_RADIOUS,
            y: frame.height - PANEL_CORNERS_RADIOUS
        };

        titleBarPoint1 = {
            x: 0,
            y: TITLE_BAR_HEIGHT
        };

        titleBarPoint2 = {
            x: frame.width,
            y: TITLE_BAR_HEIGHT
        };


        /* Now the transformations. */

        borderPoint1 = frameThisPoint(borderPoint1);
        borderPoint2 = frameThisPoint(borderPoint2);
        borderPoint3 = frameThisPoint(borderPoint3);
        borderPoint4 = frameThisPoint(borderPoint4);

        titleBarPoint1 = frameThisPoint(titleBarPoint1);
        titleBarPoint2 = frameThisPoint(titleBarPoint2);

        /* We paint the panel background first */

        browserCanvasContext.fillStyle = 'rgba(255, 255, 255, 0.75)';
        browserCanvasContext.beginPath();

        browserCanvasContext.arc(borderPoint1.x, borderPoint1.y, PANEL_CORNERS_RADIOUS, 1.0 * Math.PI, 1.5 * Math.PI);
        browserCanvasContext.lineTo(borderPoint2.x, borderPoint2.y - PANEL_CORNERS_RADIOUS);
        browserCanvasContext.arc(borderPoint2.x, borderPoint2.y, PANEL_CORNERS_RADIOUS, 1.5 * Math.PI, 2.0 * Math.PI);
        browserCanvasContext.lineTo(borderPoint3.x + PANEL_CORNERS_RADIOUS, borderPoint3.y);
        browserCanvasContext.arc(borderPoint3.x, borderPoint3.y, PANEL_CORNERS_RADIOUS, 0 * Math.PI, 0.5 * Math.PI);
        browserCanvasContext.lineTo(borderPoint4.x, borderPoint4.y + PANEL_CORNERS_RADIOUS);
        browserCanvasContext.arc(borderPoint4.x, borderPoint4.y, PANEL_CORNERS_RADIOUS, 0.5 * Math.PI, 1.0 * Math.PI);
        browserCanvasContext.lineTo(borderPoint1.x - PANEL_CORNERS_RADIOUS, borderPoint1.y);

        browserCanvasContext.closePath();

        browserCanvasContext.fill();

        browserCanvasContext.lineWidth = 0.1;
        browserCanvasContext.strokeStyle = 'rgba(54, 54, 54, 0.75)';
        browserCanvasContext.stroke();

 

        /* We paint the title bar now */

        browserCanvasContext.fillStyle = 'rgba(37, 107, 219, 0.75)';
        browserCanvasContext.beginPath();

        browserCanvasContext.moveTo(titleBarPoint1.x, titleBarPoint1.y);
        browserCanvasContext.lineTo(borderPoint1.x - PANEL_CORNERS_RADIOUS, borderPoint1.y);
        browserCanvasContext.arc(borderPoint1.x, borderPoint1.y, PANEL_CORNERS_RADIOUS, 1.0 * Math.PI, 1.5 * Math.PI);
        browserCanvasContext.lineTo(borderPoint2.x, borderPoint2.y - PANEL_CORNERS_RADIOUS);
        browserCanvasContext.arc(borderPoint2.x, borderPoint2.y, PANEL_CORNERS_RADIOUS, 1.5 * Math.PI, 2.0 * Math.PI);
        browserCanvasContext.lineTo(titleBarPoint2.x, titleBarPoint2.y);

        browserCanvasContext.closePath();
        browserCanvasContext.fill();

        browserCanvasContext.lineWidth = 0.1;
        browserCanvasContext.strokeStyle = 'rgba(12, 64, 148, 0.75)';
        browserCanvasContext.stroke();

        /* print the title */

        let labelPoint;
        let fontSize = 10;

        browserCanvasContext.font = fontSize + 'px Courier New';

        let label = frame.containerName;

        let xOffset = label.length / 2 * fontSize * FONT_ASPECT_RATIO;
        let yOffset = (TITLE_BAR_HEIGHT - fontSize) / 2 + 2;

        labelPoint = {
            x: frame.width / 2 - xOffset,
            y: TITLE_BAR_HEIGHT - yOffset
        };

        labelPoint = frame.frameThisPoint(labelPoint);

        browserCanvasContext.fillStyle = 'rgba(240, 240, 240, 1)';
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y);
    }


    function borders() {


        /* Lest get the important points of the drawing so as to apply the needed transformations. */

        point1 = {
            x: 0,
            y: 0
        };

        point2 = {
            x: frame.width,
            y: 0
        };

        point3 = {
            x: frame.width,
            y: frame.height
        };

        point4 = {
            x: 0,
            y: frame.height
        };

        /* Now the transformations. */

        point1 = transformThisPoint(point1, frame.container);
        point2 = transformThisPoint(point2, frame.container);
        point3 = transformThisPoint(point3, frame.container);
        point4 = transformThisPoint(point4, frame.container);

        /* Lets start the drawing. */

        browserCanvasContext.beginPath();
        browserCanvasContext.moveTo(point1.x, point1.y);
        browserCanvasContext.lineTo(point2.x, point2.y);
        browserCanvasContext.lineTo(point3.x, point3.y);
        browserCanvasContext.lineTo(point4.x, point4.y);
        browserCanvasContext.lineTo(point1.x, point1.y);
        browserCanvasContext.closePath();


        browserCanvasContext.strokeStyle = 'rgba(150, 150, 150, 1)';
        browserCanvasContext.lineWidth = 1;
        browserCanvasContext.stroke();

        browserCanvasContext.closePath();

        

    }



    function grid(smallLines) {

        if (smallLines === true) {

            /* Small Lines */

            var step = frame.width / 100;

            browserCanvasContext.beginPath();

            for (var i = 0; i < frame.width; i = i + step) {

                for (var j = 0; j < frame.height; j = j + step) {

                    let point1 = {
                        x: 0,
                        y: j
                    };

                    let point2 = {
                        x: frame.width,
                        y: j
                    };

                    point1 = transformThisPoint(point1, frame.container);
                    point2 = transformThisPoint(point2, frame.container);

                    browserCanvasContext.moveTo(point1.x, point1.y);
                    browserCanvasContext.lineTo(point2.x, point2.y);
                }

                let point3 = {
                    x: frame.width,
                    y: frame.height
                };

                let point4 = {
                    x: 0,
                    y: frame.height
                };

                point3 = transformThisPoint(point3, frame.container);
                point4 = transformThisPoint(point4, frame.container);

                browserCanvasContext.moveTo(point3.x, point3.y);
                browserCanvasContext.lineTo(point4.x, point4.y);
            }
            browserCanvasContext.closePath();
            browserCanvasContext.strokeStyle = 'rgba(150, 150, 150, 0.1)';
            browserCanvasContext.lineWidth = 1;
            browserCanvasContext.stroke();
        }


        /* Main Lines */

        var step = frame.width / 20;

        browserCanvasContext.beginPath();

        for (var i = 0; i < frame.width; i = i + step) {

            for (var j = 0; j < frame.height; j = j + step) {

                let point1 = {
                    x: 0,
                    y: j
                };

                let point2 = {
                    x: frame.width,
                    y: j
                };

                point1 = transformThisPoint(point1, frame.container);
                point2 = transformThisPoint(point2, frame.container);

                browserCanvasContext.moveTo(point1.x, point1.y);
                browserCanvasContext.lineTo(point2.x, point2.y);
            }

            let point3 = {
                x: i,
                y: 0
            };

            let point4 = {
                x: i,
                y: frame.height
            };

            point3 = transformThisPoint(point3, frame.container);
            point4 = transformThisPoint(point4, frame.container);

            browserCanvasContext.moveTo(point3.x, point3.y);
            browserCanvasContext.lineTo(point4.x, point4.y);
        }
        browserCanvasContext.closePath();
        browserCanvasContext.strokeStyle = 'rgba(100, 100, 100, 0.2)';
        browserCanvasContext.lineWidth = 1;
        browserCanvasContext.stroke();
    }
}