
function newNote() {

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
            x: pFloatingObject.payload.notes[pFloatingObject.payloadNoteIndex].position.x,
            y: pFloatingObject.payload.notes[pFloatingObject.payloadNoteIndex].position.y
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

        const BUBBLE_CORNERS_RADIOUS = 5;
        const TITLE_BAR_HEIGHT = 14;

        const BUBBLE_WIDTH = BUBBLE_CORNERS_RADIOUS + pFloatingObject.currentRadius * 4;
        const BUBBLE_HEIGHT = BUBBLE_CORNERS_RADIOUS + pFloatingObject.currentRadius * 2;

        let borderPoint1;
        let borderPoint2;
        let borderPoint3;
        let borderPoint4;

        let intialDisplace = {
            x: pFloatingObject.currentPosition.x - BUBBLE_WIDTH / 2,
            y: pFloatingObject.currentPosition.y - BUBBLE_HEIGHT / 2
        }

        if (pFloatingObject.currentRadius > 5) {

            /* Rounded Background */

            borderPoint1 = {
                x: intialDisplace.x + BUBBLE_CORNERS_RADIOUS,
                y: intialDisplace.y + BUBBLE_CORNERS_RADIOUS
            };

            borderPoint2 = {
                x: intialDisplace.x + BUBBLE_WIDTH - BUBBLE_CORNERS_RADIOUS,
                y: intialDisplace.y + BUBBLE_CORNERS_RADIOUS
            };

            borderPoint3 = {
                x: intialDisplace.x + BUBBLE_WIDTH - BUBBLE_CORNERS_RADIOUS,
                y: intialDisplace.y + BUBBLE_HEIGHT - BUBBLE_CORNERS_RADIOUS
            };

            borderPoint4 = {
                x: intialDisplace.x + BUBBLE_CORNERS_RADIOUS,
                y: intialDisplace.y + + BUBBLE_HEIGHT - BUBBLE_CORNERS_RADIOUS
            };

            titleBarPoint1 = {
                x: intialDisplace.x + 0,
                y: intialDisplace.y + TITLE_BAR_HEIGHT
            };

            titleBarPoint2 = {
                x: intialDisplace.x + BUBBLE_WIDTH,
                y: intialDisplace.y + TITLE_BAR_HEIGHT
            };

            /* We paint the panel background first */

            browserCanvasContext.fillStyle = 'rgba(255, 249, 196, 0.75)';
            browserCanvasContext.beginPath();

            browserCanvasContext.arc(borderPoint1.x, borderPoint1.y, BUBBLE_CORNERS_RADIOUS, 1.0 * Math.PI, 1.5 * Math.PI);
            browserCanvasContext.lineTo(borderPoint2.x, borderPoint2.y - BUBBLE_CORNERS_RADIOUS);
            browserCanvasContext.arc(borderPoint2.x, borderPoint2.y, BUBBLE_CORNERS_RADIOUS, 1.5 * Math.PI, 2.0 * Math.PI);
            browserCanvasContext.lineTo(borderPoint3.x + BUBBLE_CORNERS_RADIOUS, borderPoint3.y);
            browserCanvasContext.arc(borderPoint3.x, borderPoint3.y, BUBBLE_CORNERS_RADIOUS, 0 * Math.PI, 0.5 * Math.PI);
            browserCanvasContext.lineTo(borderPoint4.x, borderPoint4.y + BUBBLE_CORNERS_RADIOUS);
            browserCanvasContext.arc(borderPoint4.x, borderPoint4.y, BUBBLE_CORNERS_RADIOUS, 0.5 * Math.PI, 1.0 * Math.PI);
            browserCanvasContext.lineTo(borderPoint1.x - BUBBLE_CORNERS_RADIOUS, borderPoint1.y);

            browserCanvasContext.closePath();

            browserCanvasContext.fill();

            browserCanvasContext.lineWidth = 0.1;
            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.DARK + ', 0.75)';
            browserCanvasContext.stroke();

            /* We paint the title bar now */

            browserCanvasContext.fillStyle = 'rgba(244, 224, 44, 0.75)';
            browserCanvasContext.beginPath();

            browserCanvasContext.moveTo(titleBarPoint1.x, titleBarPoint1.y);
            browserCanvasContext.lineTo(borderPoint1.x - BUBBLE_CORNERS_RADIOUS, borderPoint1.y);
            browserCanvasContext.arc(borderPoint1.x, borderPoint1.y, BUBBLE_CORNERS_RADIOUS, 1.0 * Math.PI, 1.5 * Math.PI);
            browserCanvasContext.lineTo(borderPoint2.x, borderPoint2.y - BUBBLE_CORNERS_RADIOUS);
            browserCanvasContext.arc(borderPoint2.x, borderPoint2.y, BUBBLE_CORNERS_RADIOUS, 1.5 * Math.PI, 2.0 * Math.PI);
            browserCanvasContext.lineTo(titleBarPoint2.x, titleBarPoint2.y);

            browserCanvasContext.closePath();
            browserCanvasContext.fill();

            browserCanvasContext.lineWidth = 0.1;
            browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', 0.75)';
            browserCanvasContext.stroke();

        }

        if (pFloatingObject.currentRadius > 0.5) {

            /* Image */

            let imagePosition = {
                x: pFloatingObject.currentPosition.x,
                y: pFloatingObject.currentPosition.y + BUBBLE_HEIGHT / 2
            };

            if (pFloatingObject.payloadImageId !== undefined) {

                let image = document.getElementById(pFloatingObject.payloadImageId);

                if (image !== null) {

                    browserCanvasContext.drawImage(image, imagePosition.x - pFloatingObject.currentImageSize / 2, imagePosition.y - pFloatingObject.currentImageSize / 2, pFloatingObject.currentImageSize, pFloatingObject.currentImageSize);

                }
            }

            /* Image Contourn */

            browserCanvasContext.beginPath();
            browserCanvasContext.arc(imagePosition.x, imagePosition.y, pFloatingObject.currentImageSize / 2, 0, Math.PI * 2, true);
            browserCanvasContext.closePath();
            browserCanvasContext.strokeStyle = 'rgba(30, 30, 30, 0.25)';
            browserCanvasContext.lineWidth = 1;
            browserCanvasContext.stroke();

            /* Labels */

            if (pFloatingObject.currentRadius > 6) {

                browserCanvasContext.strokeStyle = pFloatingObject.labelStrokeStyle;

                const SIZE_PERCENTAGE = Math.trunc(pFloatingObject.currentRadius / pFloatingObject.targetRadius * 100) / 100;
                let ALPHA;

                if (pFloatingObject.targetRadius > 0) {

                    ALPHA = 0.5 - (1 - SIZE_PERCENTAGE) * 5;

                } else { // Object is dying...

                    ALPHA = Math.trunc((0.5 - (100 - pFloatingObject.currentRadius / 100) ) * 100) / 100;

                    if (ALPHA < 0) { ALPHA = 0}

                }
                
                let labelPoint;
                let fontSize = 10;

                let label;

                /* print the title */

                label = pFloatingObject.payload.notes[pFloatingObject.payloadNoteIndex].title;

                if (label !== undefined) {

                    if (SIZE_PERCENTAGE > 0.9) {

                        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.SECONDARY;

                        let xOffset = label.length / 2 * fontSize * FONT_ASPECT_RATIO;
                        let yOffset = (TITLE_BAR_HEIGHT - fontSize) / 2 + 2;

                        labelPoint = {
                            x: intialDisplace.x + BUBBLE_WIDTH / 2 - xOffset,
                            y: intialDisplace.y + TITLE_BAR_HEIGHT - yOffset
                        };

                        browserCanvasContext.fillStyle = 'rgba(30, 30, 30, ' + ALPHA + ')'
                        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y); 

                    }
                }

                /* Message Body */

                label = pFloatingObject.payload.notes[pFloatingObject.payloadNoteIndex].body;

                if (label !== undefined) {

                    const WORDS_PER_ROW = 5;
                    const TOTAL_ROWS = 5;

                    if (SIZE_PERCENTAGE > 0.9) {

                        let rawLabelArray = label.split(" ");
                        let labelArray = [];

                        /* Lets check when words are to long we add an empty space to the same line so as to roll all other words forward. */

                        for (let i = 0; i < rawLabelArray.length; i++) {

                            let word = rawLabelArray[i];

                            labelArray.push(word);

                            if (word.length > 8) {
                                labelArray.push("");
                            }

                            if (word.length > 10) {
                                labelArray.push("");
                            }
                        }

                        /* Calculate each ROW */

                        let labelRows = [];

                        for (let i = 0; i < TOTAL_ROWS; i++) {

                            let labelRow = "";

                            for (let j = 0; j < WORDS_PER_ROW; j++) {

                                let newWord = labelArray[j + i * WORDS_PER_ROW];

                                if (newWord !== undefined && newWord !== "") {

                                    labelRow = labelRow + " " + newWord;
                                }
                            }

                            if (labelRow !== "") {

                                labelRows.push(labelRow);

                            }

                        }

                        /* Now we plot each row. */

                        for (let i = 0; i < labelRows.length; i++) {

                            let labelRow = labelRows[i];

                            let startingPosition = {
                                x: pFloatingObject.currentPosition.x,
                                y: pFloatingObject.currentPosition.y - labelRows.length / 2 * (fontSize * FONT_ASPECT_RATIO + 10)
                            };

                            labelPoint = {
                                x: startingPosition.x - labelRow.length / 2 * fontSize * FONT_ASPECT_RATIO,
                                y: startingPosition.y + (i + 1) * (fontSize * FONT_ASPECT_RATIO + 10)
                            };

                            browserCanvasContext.font = fontSize + 'px ' + UI_FONT.SECONDARY;
                            browserCanvasContext.fillStyle = 'rgba(60, 60, 60, ' + ALPHA + ')'
                            browserCanvasContext.fillText(labelRow, labelPoint.x, labelPoint.y);

                        }
                    }
                }
            }
        }
    }
}
