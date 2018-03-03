
function newViewPort() {

    const CONSOLE_LOG = true;

    let ANIMATION_INCREMENT = 0.25;
    const TOP_MARGIN = 15;
    const BOTTOM_MARGIN = 0;
    const LEFT_MARGIN = 0;
    const RIGHT_MARGIN = 50;

    let viewPort = {
        visibleArea: undefined,
        eventHandler: undefined,
        zoomLevel: INITIAL_ZOOM_LEVEL,   
        mousePosition: undefined,
        applyZoom: applyZoom,
        zoomFontSize: zoomFontSize,
        zoomThisPoint: zoomThisPoint,
        unzoomThisPoint: unzoomThisPoint,
        isThisPointVisible: isThisPointVisible, 
        fitIntoVisibleArea: fitIntoVisibleArea,
        displace: displace,
        displaceTarget: displaceTarget,
        displaceToDatetime: displaceToDatetime,
        animate: animate,
        draw: draw,
        initialize: initialize
    };

    zoomTargetLevel = INITIAL_ZOOM_LEVEL;

    let increment = 0.035;

    var offset = {
        x: 0,
        y: 0
    }; 

    var targetOffset = {
        x: 0,
        y: 0
    };

    let offsetIncrement = {
        x: 0,
        y: 0
    }; 

   viewPort.mousePosition = { 
        x: 0,
        y: 0
    }; 

   viewPort.eventHandler = newEventHandler();

   return viewPort;

   function initialize() {

       viewPort.visibleArea = {
           topLeft: { x: LEFT_MARGIN, y: TOP_MARGIN },
           topRight: { x: browserCanvas.width - RIGHT_MARGIN , y: TOP_MARGIN },
           bottomRight: { x: browserCanvas.width - RIGHT_MARGIN, y: browserCanvas.height - BOTTOM_MARGIN},
           bottomLeft: { x: LEFT_MARGIN, y: browserCanvas.height - BOTTOM_MARGIN}
       };  

   }

   function animate() {

       if (viewPort.zoomLevel < zoomTargetLevel) {
           if (zoomTargetLevel - viewPort.zoomLevel < ANIMATION_INCREMENT) {
               ANIMATION_INCREMENT = Math.abs(zoomTargetLevel - viewPort.zoomLevel);
           }
           viewPort.zoomLevel = viewPort.zoomLevel + ANIMATION_INCREMENT;
           changeZoom(viewPort.zoomLevel - ANIMATION_INCREMENT, viewPort.zoomLevel);
       }

       if (viewPort.zoomLevel > zoomTargetLevel) {
           if (viewPort.zoomLevel - zoomTargetLevel < ANIMATION_INCREMENT) {
               ANIMATION_INCREMENT = Math.abs(zoomTargetLevel - viewPort.zoomLevel);
           } 
           viewPort.zoomLevel = viewPort.zoomLevel - ANIMATION_INCREMENT;
           changeZoom(viewPort.zoomLevel + ANIMATION_INCREMENT, viewPort.zoomLevel);
       }

 /*
       if (offsetIncrement.x !== 0) {

           if (Math.trunc(Math.abs(targetOffset.x - offset.x) * 1000) >= Math.trunc(Math.abs(offsetIncrement.x) * 1000)) {
               offset.x = offset.x + offsetIncrement.x;
           } else {
               offsetIncrement.x = 0;
           }
       }
*/       

       if (offsetIncrement.y !== 0) {

           if (Math.trunc(Math.abs(targetOffset.y - offset.y) * 1000) >= Math.trunc(Math.abs(offsetIncrement.y) * 1000)) {
               offset.y = offset.y + offsetIncrement.y;

               //console.log("offset.y changed to " + offset.y)

           } else {
               offsetIncrement.y = 0;
           }
       }

       
   }

   function displace(displaceVector) {

       offset.x = offset.x + displaceVector.x;
       offset.y = offset.y + displaceVector.y;

       let event = {
           newOffset: offset
       };

       viewPort.eventHandler.raiseEvent("Offset Changed", event);

       //console.log("displace produced new Offset x = " + offset.x + " y = " + offset.y);

   }

   function displaceTarget(displaceVector) {


       targetOffset.x = targetOffset.x + displaceVector.x;
       targetOffset.y = targetOffset.y + displaceVector.y;

       
       offsetIncrement = {
           x: (targetOffset.x - offset.x) / 10,
           y: (targetOffset.y - offset.y) / 10
       };

       //console.log("displaceTarget x = " + targetOffset.x + " y = " + targetOffset.y);

   }

   function displaceToDatetime(datetime, timeLineCoordinateSystem) {


       targetOffset.x = targetOffset.x + displaceVector.x;

       offsetIncrement = {
           x: (targetOffset.x - offset.x) / 10,
           y: (targetOffset.y - offset.y) / 10
       };

       if (CONSOLE_LOG === true) {

           console.log("viewPort -> displaceToDatetime x = " + targetOffset.x + " datetime = " + datetime);

       }
   }

   

    function applyZoom(amount) {

        //console.log("applyZoom amount: " + amount);

        if (amount > 0) {
             

            if (zoomTargetLevel > -5) {
                amount = amount * 2;
            }

            if (zoomTargetLevel > 10) {
                amount = amount * 3;
            }

            if (zoomTargetLevel > 15) {
                amount = amount * 4;
            } 
        }

        if (amount < 0) {

            if (zoomTargetLevel > -4) {
                amount = amount * 2;
            }

            if (zoomTargetLevel > 13) {
                amount = amount * 3;
            }

            if (zoomTargetLevel > 19) {
                amount = amount * 4;
            }
        }

        if (zoomTargetLevel + amount > 1000) {
            return false;
        }

        if (zoomTargetLevel <= -27 && amount < 0) {
            amount = amount / 4;
        }

        if (zoomTargetLevel < -27 && amount > 0) {
            amount = amount / 4;
        }

        if (zoomTargetLevel + amount < -28.25) {
            return false;
        }

        zoomTargetLevel = zoomTargetLevel + amount;

        ANIMATION_INCREMENT = Math.abs(zoomTargetLevel - viewPort.zoomLevel) / 3;

        let event = {
            newLevel: zoomTargetLevel,
            newOffset: offset,
            type: undefined
        };

        if (amount > 0) {
            event.type = "Zoom In";
        } else {
            event.type = "Zoom Out";
        }

        //console.log("Zoom Changed > " + event.newLevel);

        viewPort.eventHandler.raiseEvent("Zoom Changed", event);
        return true;
   }


    function changeZoom(oldLevel, newLevel) {

        let mouseNoZoom = unzoomThisPoint(viewPort.mousePosition, oldLevel);
        let newMouse = zoomThisPoint(mouseNoZoom, newLevel);

        offset.x = offset.x - newMouse.x + viewPort.mousePosition.x;
        offset.y = offset.y - newMouse.y + viewPort.mousePosition.y;

        //console.log("changeZoom produced new Offset x = " + offset.x + " y = " + offset.y);

        targetOffset.x = offset.x
        targetOffset.y = offset.y ;

        offsetIncrement = {
            x: 0,
            y: 0
        };

    }


    function zoomFontSize(baseSize, level) {

        let zoomFactor = increment; // + increment * viewPort.zoomLevel / 100;

        if (level === undefined) {

            baseSize = baseSize * (1 + zoomFactor * viewPort.zoomLevel);

        } else {

            baseSize = baseSize * (1 + zoomFactor * level);

        }

        return baseSize;
    }

    function fitIntoVisibleArea(point) {


        /* Here we check the boundaries of the resulting points, so they dont go out of the visible area. */

        if (point.x > viewPort.visibleArea.bottomRight.x + 1) {
            point.x = viewPort.visibleArea.bottomRight.x + 1;
        }

        if (point.x < viewPort.visibleArea.topLeft.x - 1) {
            point.x = viewPort.visibleArea.topLeft.x - 1;
        }

        if (point.y > viewPort.visibleArea.bottomRight.y + 1) {
            point.y = viewPort.visibleArea.bottomRight.y + 1;
        }

        if (point.y < viewPort.visibleArea.topLeft.y - 1) {
            point.y = viewPort.visibleArea.topLeft.y - 1;
        }

        return point;
    }


    function zoomThisPoint(point, level) {

        let zoomFactor = increment; // + increment * viewPort.zoomLevel / 100;

        if (level === undefined) {

            point.x = point.x * (1 + zoomFactor * viewPort.zoomLevel) + offset.x;
            point.y = point.y * (1 + zoomFactor * viewPort.zoomLevel) + offset.y;

        } else {

            point.x = point.x * (1 + zoomFactor * level) + offset.x;
            point.y = point.y * (1 + zoomFactor * level) + offset.y;

        }

        return point;
    }

    function unzoomThisPoint(pointWithZoom, level) {

        let pointWithoutZoom;
        let zoomFactor = increment; // + increment * viewPort.zoomLevel / 100;

        if (level === undefined) {

            pointWithoutZoom = {
                x: (pointWithZoom.x - offset.x) / (1 + zoomFactor * viewPort.zoomLevel),
                y: (pointWithZoom.y - offset.y) / (1 + zoomFactor * viewPort.zoomLevel)
            };

        } else {

            pointWithoutZoom = {
                x: (pointWithZoom.x - offset.x) / (1 + zoomFactor * level),
                y: (pointWithZoom.y - offset.y) / (1 + zoomFactor * level)
            };

        }
        return pointWithoutZoom;

    }




    function isThisPointVisible(point) {

        if (visibleArea === undefined) {

            getVisibleArea();

        }

        if (point.x < visibleArea.topLeft.x || point.x > visibleArea.bottomRight.x || point.y < visibleArea.topLeft.y || point.y > visibleArea.bottomRight.y) {
            return false;
        } else {
            return true;
        }

    }


    function draw() {
/*
        drawGrid(10);
        drawGrid(1);
        drawGrid(0.1);
*/
    }

    function drawGrid(step) {

        let squareWidth = (viewPort.visibleArea.bottomRight.x - viewPort.visibleArea.bottomLeft.x) / step;
        squareWidth = squareWidth + squareWidth * increment * viewPort.zoomLevel;

        let startingX = offset.x - Math.trunc(offset.x / squareWidth) * squareWidth;
        let startingY = offset.y - Math.trunc(offset.y / squareWidth) * squareWidth;
        let lineWidth = 10 / step + 10 / step * increment * viewPort.zoomLevel;

        if (lineWidth < 0.5) {
            return;
        }

        if (lineWidth > 2) {
            lineWidth = 2;
        }

        browserCanvasContext.beginPath();

        for (var i = startingX; i < viewPort.visibleArea.bottomRight.x; i = i + squareWidth) {

            for (var j = startingY; j < viewPort.visibleArea.bottomRight.y; j = j + squareWidth) {

                let point1 = {
                    x: viewPort.visibleArea.bottomLeft.x,
                    y: j
                };

                let point2 = {
                    x: viewPort.visibleArea.bottomRight.x,
                    y: j
                };

                browserCanvasContext.moveTo(point1.x, point1.y);
                browserCanvasContext.lineTo(point2.x, point2.y);
            }

            let point3 = {
                x: i,
                y: viewPort.visibleArea.topLeft.y
            };

            let point4 = {
                x: i,
                y: viewPort.visibleArea.bottomLeft.y
            };

            browserCanvasContext.moveTo(point3.x, point3.y);
            browserCanvasContext.lineTo(point4.x, point4.y);
        }
        browserCanvasContext.closePath();
        browserCanvasContext.strokeStyle = 'rgba(150, 150, 150, 0.' + Math.trunc(lineWidth + 1) + ')';

        browserCanvasContext.lineWidth = lineWidth;
        
        browserCanvasContext.stroke();
    }

}




