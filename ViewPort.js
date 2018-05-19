
function newViewPort() {

    const CONSOLE_LOG = true;

    let ANIMATION_INCREMENT = 0.25;
    const TOP_MARGIN = 15;
    const BOTTOM_MARGIN = 0;
    const LEFT_MARGIN = 50;
    const RIGHT_MARGIN = 50;

    let thisObject = {
        visibleArea: undefined,
        eventHandler: undefined,
        zoomTargetLevel:undefined,
        zoomLevel: undefined,   
        mousePosition: undefined,
        newZoomLevel: newZoomLevel,
        applyZoom: applyZoom,
        zoomFontSize: zoomFontSize,
        zoomThisPoint: zoomThisPoint,
        unzoomThisPoint: unzoomThisPoint,
        isThisPointVisible: isThisPointVisible, 
        fitIntoVisibleArea: fitIntoVisibleArea,
        displace: displace,
        displaceTarget: displaceTarget,
        animate: animate,
        draw: draw,
        raiseEvents: raiseEvents, 
        initialize: initialize
    };

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

   thisObject.mousePosition = { 
        x: 0,
        y: 0
    }; 

   thisObject.eventHandler = newEventHandler();

   return thisObject;

   function initialize() {

       thisObject.visibleArea = {
           topLeft: { x: LEFT_MARGIN, y: TOP_MARGIN },
           topRight: { x: browserCanvas.width - RIGHT_MARGIN , y: TOP_MARGIN },
           bottomRight: { x: browserCanvas.width - RIGHT_MARGIN, y: browserCanvas.height - BOTTOM_MARGIN},
           bottomLeft: { x: LEFT_MARGIN, y: browserCanvas.height - BOTTOM_MARGIN}
       };  
   }

   function raiseEvents() {

       let event = {
           newOffset: offset
       };

       thisObject.eventHandler.raiseEvent("Offset Changed", event);

   }

   function animate() {

       if (thisObject.zoomLevel < thisObject.zoomTargetLevel) {
           if (thisObject.zoomTargetLevel - thisObject.zoomLevel < ANIMATION_INCREMENT) {
               ANIMATION_INCREMENT = Math.abs(thisObject.zoomTargetLevel - thisObject.zoomLevel);
           }
           thisObject.zoomLevel = thisObject.zoomLevel + ANIMATION_INCREMENT;
           changeZoom(thisObject.zoomLevel - ANIMATION_INCREMENT, thisObject.zoomLevel);
       }

       if (thisObject.zoomLevel > thisObject.zoomTargetLevel) {
           if (thisObject.zoomLevel - thisObject.zoomTargetLevel < ANIMATION_INCREMENT) {
               ANIMATION_INCREMENT = Math.abs(thisObject.zoomTargetLevel - thisObject.zoomLevel);
           } 
           thisObject.zoomLevel = thisObject.zoomLevel - ANIMATION_INCREMENT;
           changeZoom(thisObject.zoomLevel + ANIMATION_INCREMENT, thisObject.zoomLevel);
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

       thisObject.eventHandler.raiseEvent("Offset Changed", event);

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

   function newZoomLevel(level) {

       thisObject.zoomTargetLevel = level;
       thisObject.zoomLevel = level;

       ANIMATION_INCREMENT = Math.abs(thisObject.zoomTargetLevel - thisObject.zoomLevel) / 3;

       let event = {
           newLevel: thisObject.zoomTargetLevel,
           newOffset: offset,
           type: undefined
       };

       thisObject.eventHandler.raiseEvent("Zoom Changed", event);

       return true;
   }

    function applyZoom(amount) {

        //console.log("applyZoom amount: " + amount);

        if (amount > 0) {
             

            if (thisObject.zoomTargetLevel > -5) {
                amount = amount * 2;
            }

            if (thisObject.zoomTargetLevel > 10) {
                amount = amount * 3;
            }

            if (thisObject.zoomTargetLevel > 15) {
                amount = amount * 4;
            } 
        }

        if (amount < 0) {

            if (thisObject.zoomTargetLevel > -4) {
                amount = amount * 2;
            }

            if (thisObject.zoomTargetLevel > 13) {
                amount = amount * 3;
            }

            if (thisObject.zoomTargetLevel > 19) {
                amount = amount * 4;
            }
        }

        if (thisObject.zoomTargetLevel + amount > 1000) {
            return false;
        }

        if (thisObject.zoomTargetLevel <= -27 && amount < 0) {
            amount = amount / 4;
        }

        if (thisObject.zoomTargetLevel < -27 && amount > 0) {
            amount = amount / 4;
        }

        if (thisObject.zoomTargetLevel + amount < -28.25) {
            return false;
        }

        thisObject.zoomTargetLevel = thisObject.zoomTargetLevel + amount;

        ANIMATION_INCREMENT = Math.abs(thisObject.zoomTargetLevel - thisObject.zoomLevel) / 3;

        let event = {
            newLevel: thisObject.zoomTargetLevel,
            newOffset: offset,
            type: undefined
        };

        if (amount > 0) {
            event.type = "Zoom In";
        } else {
            event.type = "Zoom Out";
        }

        thisObject.eventHandler.raiseEvent("Zoom Changed", event);

        return true;
   }


    function changeZoom(oldLevel, newLevel) {

        let mouseNoZoom = unzoomThisPoint(thisObject.mousePosition, oldLevel);
        let newMouse = zoomThisPoint(mouseNoZoom, newLevel);

        offset.x = offset.x - newMouse.x + thisObject.mousePosition.x;
        offset.y = offset.y - newMouse.y + thisObject.mousePosition.y;

        targetOffset.x = offset.x
        targetOffset.y = offset.y ;

        offsetIncrement = {
            x: 0,
            y: 0
        };

    }


    function zoomFontSize(baseSize, level) {

        let zoomFactor = increment; // + increment * thisObject.zoomLevel / 100;

        if (level === undefined) {

            baseSize = baseSize * (1 + zoomFactor * thisObject.zoomLevel);

        } else {

            baseSize = baseSize * (1 + zoomFactor * level);

        }

        return baseSize;
    }

    function fitIntoVisibleArea(point) {


        /* Here we check the boundaries of the resulting points, so they dont go out of the visible area. */

        if (point.x > thisObject.visibleArea.bottomRight.x + 1) {
            point.x = thisObject.visibleArea.bottomRight.x + 1;
        }

        if (point.x < thisObject.visibleArea.topLeft.x - 1) {
            point.x = thisObject.visibleArea.topLeft.x - 1;
        }

        if (point.y > thisObject.visibleArea.bottomRight.y + 1) {
            point.y = thisObject.visibleArea.bottomRight.y + 1;
        }

        if (point.y < thisObject.visibleArea.topLeft.y - 1) {
            point.y = thisObject.visibleArea.topLeft.y - 1;
        }

        return point;
    }


    function zoomThisPoint(point, level) {

        let zoomFactor = increment; // + increment * thisObject.zoomLevel / 100;

        if (level === undefined) {

            point.x = point.x * (1 + zoomFactor * thisObject.zoomLevel) + offset.x;
            point.y = point.y * (1 + zoomFactor * thisObject.zoomLevel) + offset.y;

        } else {

            point.x = point.x * (1 + zoomFactor * level) + offset.x;
            point.y = point.y * (1 + zoomFactor * level) + offset.y;

        }

        return point;
    }

    function unzoomThisPoint(pointWithZoom, level) {

        let pointWithoutZoom;
        let zoomFactor = increment; // + increment * thisObject.zoomLevel / 100;

        if (level === undefined) {

            pointWithoutZoom = {
                x: (pointWithZoom.x - offset.x) / (1 + zoomFactor * thisObject.zoomLevel),
                y: (pointWithZoom.y - offset.y) / (1 + zoomFactor * thisObject.zoomLevel)
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

        let squareWidth = (thisObject.visibleArea.bottomRight.x - thisObject.visibleArea.bottomLeft.x) / step;
        squareWidth = squareWidth + squareWidth * increment * thisObject.zoomLevel;

        let startingX = offset.x - Math.trunc(offset.x / squareWidth) * squareWidth;
        let startingY = offset.y - Math.trunc(offset.y / squareWidth) * squareWidth;
        let lineWidth = 10 / step + 10 / step * increment * thisObject.zoomLevel;

        if (lineWidth < 0.5) {
            return;
        }

        if (lineWidth > 2) {
            lineWidth = 2;
        }

        browserCanvasContext.beginPath();

        for (var i = startingX; i < thisObject.visibleArea.bottomRight.x; i = i + squareWidth) {

            for (var j = startingY; j < thisObject.visibleArea.bottomRight.y; j = j + squareWidth) {

                let point1 = {
                    x: thisObject.visibleArea.bottomLeft.x,
                    y: j
                };

                let point2 = {
                    x: thisObject.visibleArea.bottomRight.x,
                    y: j
                };

                browserCanvasContext.moveTo(point1.x, point1.y);
                browserCanvasContext.lineTo(point2.x, point2.y);
            }

            let point3 = {
                x: i,
                y: thisObject.visibleArea.topLeft.y
            };

            let point4 = {
                x: i,
                y: thisObject.visibleArea.bottomLeft.y
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




