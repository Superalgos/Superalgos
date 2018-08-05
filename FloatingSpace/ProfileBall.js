
function newProfileBall() {

    var thisObject = {

        drawBackground: drawBackground,
        drawForeground: drawForeground,
        initialize: initialize

    };

    return thisObject;

    function initialize(callBackFunction) {

        callBackFunction();

    }

    function drawBackground(pFloatingObject) {

        let point = {
            x: pFloatingObject.payload.profile.position.x,
            y: pFloatingObject.payload.profile.position.y
        };

        point = viewPort.fitIntoVisibleArea(point);

        if (pFloatingObject.currentRadius > 1) {

            /* Target Line */

            browserCanvasContext.beginPath();
            browserCanvasContext.moveTo(pFloatingObject.currentPosition.x, pFloatingObject.currentPosition.y);
            browserCanvasContext.lineTo(point.x, point.y);
            browserCanvasContext.strokeStyle = 'rgba(204, 204, 204, 0.5)';
            browserCanvasContext.setLineDash([4, 2]);
            browserCanvasContext.lineWidth = 1;
            browserCanvasContext.stroke();
            browserCanvasContext.setLineDash([0, 0]);

        }

        if (pFloatingObject.currentRadius > 0.5) {

            /* Target Spot */

            var radius = 1;

            browserCanvasContext.beginPath();
            browserCanvasContext.arc(point.x, point.y, radius, 0, Math.PI * 2, true);
            browserCanvasContext.closePath();
            browserCanvasContext.fillStyle = 'rgba(30, 30, 30, 1)';
            browserCanvasContext.fill();

        }
    }

    function drawForeground(pFloatingObject) {

        if (pFloatingObject.currentRadius > 5) {

            /* Contourn */

            browserCanvasContext.beginPath();
            browserCanvasContext.arc(pFloatingObject.currentPosition.x, pFloatingObject.currentPosition.y, pFloatingObject.currentRadius, 0, Math.PI * 2, true);
            browserCanvasContext.closePath();
            browserCanvasContext.strokeStyle = 'rgba(30, 30, 30, 0.75)';
            browserCanvasContext.lineWidth = 1;
            browserCanvasContext.stroke();

        }

        if (pFloatingObject.currentRadius > 0.5) {

            /* Main FloatingObject */

            var alphaA;

            if (pFloatingObject.currentRadius < 3) {
                alphaA = 1;
            } else {
                alphaA = 0.75;
            }

            alphaA = 0.75;

            browserCanvasContext.beginPath();
            browserCanvasContext.arc(pFloatingObject.currentPosition.x, pFloatingObject.currentPosition.y, pFloatingObject.currentRadius, 0, Math.PI * 2, true);
            browserCanvasContext.closePath();

            browserCanvasContext.fillStyle = pFloatingObject.fillStyle;

            browserCanvasContext.fill();

        }

        /* Image */

        if (pFloatingObject.payload.profile.imageId !== undefined) {

            let image = document.getElementById(pFloatingObject.payload.profile.imageId);

            if (image !== null) {

                browserCanvasContext.drawImage(image, pFloatingObject.currentPosition.x - pFloatingObject.currentImageSize / 2, pFloatingObject.currentPosition.y - pFloatingObject.currentImageSize / 2, pFloatingObject.currentImageSize, pFloatingObject.currentImageSize);

            }
        }

        /* Label Text */

        if (pFloatingObject.currentRadius > 6) {

            browserCanvasContext.strokeStyle = pFloatingObject.labelStrokeStyle;

            let labelPoint;
            let fontSize = 10;

            browserCanvasContext.font = fontSize + 'px ' + UI_FONT.SECONDARY;

            let label;

            label = pFloatingObject.payload.profile.upLabel;

            if (label !== undefined) {

                labelPoint = {
                    x: pFloatingObject.currentPosition.x - label.length / 2 * fontSize * FONT_ASPECT_RATIO,
                    y: pFloatingObject.currentPosition.y - pFloatingObject.currentImageSize / 2 - fontSize * FONT_ASPECT_RATIO - 10
                };

                browserCanvasContext.font = fontSize + 'px ' + UI_FONT.SECONDARY;
                browserCanvasContext.fillStyle = pFloatingObject.labelStrokeStyle;
                browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y);

            }

            label = pFloatingObject.payload.profile.downLabel;

            if (label !== undefined) {

                labelPoint = {
                    x: pFloatingObject.currentPosition.x - label.length / 2 * fontSize * FONT_ASPECT_RATIO,
                    y: pFloatingObject.currentPosition.y + pFloatingObject.currentImageSize / 2 + fontSize * FONT_ASPECT_RATIO + 15
                };

                browserCanvasContext.font = fontSize + 'px ' + UI_FONT.SECONDARY;
                browserCanvasContext.fillStyle = pFloatingObject.labelStrokeStyle;
                browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y);

            }
        }
    }
}



