
function newProfileBall() {

    let thisObject = {

        physicsLoop: physicsLoop,
        onMouseOver: onMouseOver, 
        onMouseNotOver: onMouseNotOver,
        drawBackground: drawBackground,
        drawForeground: drawForeground,
        initialize: initialize

    };

    let ballStringMenu = [
        {
            visible: false,
            imagePath: "Images/menu.icon.1.gif",
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 60
        },
        {
            visible: false,
            imagePath: "Images/menu.icon.2.gif",
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: 20 * 1
        },
        {
            visible: false,
            imagePath: "Images/menu.icon.3.gif",
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -20
        },
        {
            visible: false,
            imagePath: "Images/menu.icon.4.gif",
            rawRadius: 8,
            targetRadius: 0,
            currentRadius: 0,
            angle: -60
        }
    ];

    return thisObject;

    function initialize(callBackFunction) {

        for (let i = 0; i < ballStringMenu.length; i++) {

            let menuItem = ballStringMenu[i];

            menuItem.icon = new Image();

            menuItem.icon.onload = onImageLoad;

            function onImageLoad() {
                menuItem.canDrawIcon = true;
            }

            menuItem.icon.src = menuItem.imagePath;

        }

        callBackFunction();

    }

    function physicsLoop() {

        // The menuItems also have a target.

        for (let i = 0; i < ballStringMenu.length; i++) {

            let menuItem = ballStringMenu[i];

            if (Math.abs(menuItem.currentRadius - menuItem.targetRadius) >= 0.5) {

                if (menuItem.currentRadius < menuItem.targetRadius) {
                    menuItem.currentRadius = menuItem.currentRadius + 0.5;
                } else {
                    menuItem.currentRadius = menuItem.currentRadius - 0.5;
                }
            }
        }
    }

    function onMouseOver() {

        for (let i = 0; i < ballStringMenu.length; i++) {

            let menuItem = ballStringMenu[i];

            menuItem.targetRadius = menuItem.rawRadius * 1.5;
        }
    } 

    function onMouseNotOver() {

        for (let i = 0; i < ballStringMenu.length; i++) {

            let menuItem = ballStringMenu[i];

            menuItem.targetRadius = menuItem.rawRadius * 0 - i * 5;
        }
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


        /* StringBall Menu */

        for (let i = 0; i < ballStringMenu.length; i++) {

            let menuItem = ballStringMenu[i];

            if (menuItem.canDrawIcon === true && menuItem.currentRadius > 1) {               

                let position = {
                    x: pFloatingObject.currentPosition.x + pFloatingObject.currentImageSize / 2 * Math.cos(toRadians(menuItem.angle)) - menuItem.currentRadius,
                    y: pFloatingObject.currentPosition.y - pFloatingObject.currentImageSize / 2 * Math.sin(toRadians(menuItem.angle)) - menuItem.currentRadius
                };

                browserCanvasContext.drawImage(menuItem.icon, position.x, position.y, menuItem.currentRadius * 2, menuItem.currentRadius * 2);
            }
        }

        /* Label Text */

        if (pFloatingObject.currentRadius > 6) {

            browserCanvasContext.strokeStyle = pFloatingObject.labelStrokeStyle;

            let labelPoint;
            let fontSize = pFloatingObject.currentFontSize;

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



