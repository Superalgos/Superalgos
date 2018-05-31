


function newTimeControlPanel() {

    let PLAY_STEP = 0; 

    let thisObject = {
        container: undefined,
        buttons: undefined,
        setDatetime: setDatetime, 
        datetimeDisplay: undefined,
        stepDisplay: undefined,
        draw: draw,
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize
    };

    let container = newContainer();
    container.initialize();
    container.isDraggeable = true;
    thisObject.container = container;
    thisObject.container.frame.containerName = "Time Control Panel";

    let playingLoop;                    // Controls the generation of events that allows to play continuosly the market. 

    return thisObject;     




    function initialize() {

        thisObject.container.frame.width = 200;
        thisObject.container.frame.height = 85;

        let position = {
            x: (viewPort.visibleArea.topRight.x - viewPort.visibleArea.topLeft.x) / 2 - thisObject.container.frame.width / 2,
            y: viewPort.visibleArea.bottomLeft.y - thisObject.container.frame.height
        };

        thisObject.container.frame.position = position;

        let buttonPosition;

        let buttonNames = ['Fast Backwards', 'Play Backwards', 'Step Backwards', 'Pause', 'Step Forward', 'Play Forward', 'Fast Forward'];
        let lastX = 0;
        let buttons = [];

        for (let i = 0; i < buttonNames.length; i++) {

            /* Buttons are going to be one at the right of the other. */

            let button = newButton();
            button.type = buttonNames[i];

            button.container.displacement.parentDisplacement = thisObject.container.displacement;
            button.container.frame.parentFrame = thisObject.container.frame;

            button.container.parentContainer = thisObject.container;

            button.initialize();

            buttonPosition = {  // The first button 
                x: thisObject.container.frame.width / 2 - (buttonNames.length * button.container.frame.width) / 2,
                y: thisObject.container.frame.height * 7 / 10
            };
            button.container.frame.position.x = buttonPosition.x + lastX;
            button.container.frame.position.y = buttonPosition.y;

            lastX = lastX + button.container.frame.width;

            /*  We start listening to the buttons click event, so as to know when one was pressed. */

            button.container.eventHandler.listenToEvent('onMouseClick', buttonPressed, i);

            if (buttonNames[i] === 'Pause') {
                button.status = 'on';  // We turn on by default the PAUSE button.
            }

            buttons.push(button);

        }



        thisObject.buttons = buttons;

        let datetime = INITIAL_DATE;

        let datetimeDisplay = {
            currentDatetime: datetime,
            addTime: addTime,
            draw: drawTimeDisplay
        };

        thisObject.buttons = buttons;
        thisObject.datetimeDisplay = datetimeDisplay;


        viewPort.eventHandler.listenToEvent("Zoom Changed", onZoomChanged);
        PLAY_STEP = INITIAL_TIME_PERIOD;

    }


    function getContainer(point) {

        let container;

        /* First we check if thisObject point is inside thisObject space. */

        if (thisObject.container.frame.isThisPointHere(point, true) === true) {

            /* Now we see which is the inner most container that has it */


            for (let i = 0; i < thisObject.buttons.length; i++) {

                container = thisObject.buttons[i].getContainer(point);

                if (container !== undefined) {

                    /* We found an inner container which has the point. We return it. */

                    return container;
                }
            }

            /* The point does not belong to any inner container, so we return the current container. */

            return thisObject.container;

        } else {

            /* This point does not belong to thisObject space. */

            return undefined;
        }

    }


    function onZoomChanged(event) {

        PLAY_STEP = recalculatePeriod(event.newLevel);

    }


    function setDatetime(newDatetime) {

        thisObject.datetimeDisplay.currentDatetime = newDatetime;

    }



    function addTime(seconds) {

        let newDate = thisObject.datetimeDisplay.currentDatetime;

        newDate.setSeconds(newDate.getSeconds() + seconds);
        thisObject.datetimeDisplay.currentDatetime = newDate;

    }

    function buttonPressed(event, buttonPressedIndex) {

        clearInterval(playingLoop);

        /* When any of the buttons are pressed, the control panel must turn off the resto of the buttons. */

        for (let i = 0; i < thisObject.buttons.length; i++) {

            if (i !== buttonPressedIndex) {

                let button = thisObject.buttons[i];

                button.status = 'off';

            }

        }

        /* Now we actualy do something depending on which button was pressed. */

        switch (thisObject.buttons[buttonPressedIndex].type) {

            case "Fast Backwards":

                //pressFastBackwards();
                break;

            case "Play Backwards":

                //pressPlayBackwards();
                break;

            case "Step Backwards":

                //pressStepBackwards();
                break;

            case "Pause":

                //pressPause();
                cloudVM.onBotStopPressed();
                break;

            case "Step Forward":

                //pressStepForward();
                break;

            case "Play Forward":

                let UI_COMMANDS = {
                    beginDatetime: thisObject.datetimeDisplay.currentDatetime,
                    endDatetime: undefined,
                    timePeriod: PLAY_STEP,
                    startMode: window.CURRENT_START_MODE,
                    eventHandler: thisObject.container.eventHandler
                };

                cloudVM.onBotPlayPressed(UI_COMMANDS);
                //pressPlayForward();
                break;

            case "Fast Forward":

                //pressFastForward();
                break;

            default:


        }

    }

    function pressFastBackwards() {

        clearInterval(playingLoop);
        playingLoop = setInterval(pressStepBackwards, 100);

    }

    function pressPlayBackwards() {

        clearInterval(playingLoop);
        playingLoop = setInterval(pressStepBackwards, 1000);

    }

    function pressStepBackwards() {

        thisObject.datetimeDisplay.addTime(-1 * PLAY_STEP / 1000);

        let newDatetime = thisObject.datetimeDisplay.currentDatetime;

        thisObject.container.eventHandler.raiseEvent('Datetime Changed', newDatetime);

    }

    function pressPause() {
        clearInterval(playingLoop);
    }

    function pressStepForward() {

        thisObject.datetimeDisplay.addTime(PLAY_STEP / 1000);

        let newDatetime = thisObject.datetimeDisplay.currentDatetime;

        thisObject.container.eventHandler.raiseEvent('Datetime Changed', newDatetime);

    }

    function pressPlayForward() {

        clearInterval(playingLoop);
        playingLoop = setInterval(pressStepForward, 1000);
        
    }

    function pressFastForward() {

        playingLoop = setInterval(pressStepForward, 100);

    }



    function draw() {

        thisObject.container.frame.draw(false, false, true);

        for (let i = 0; i < thisObject.buttons.length; i++) {
            thisObject.buttons[i].draw();
        }

        thisObject.datetimeDisplay.draw();

    }




    function drawTimeDisplay() {

        let fontSize = 10;

        let label = thisObject.datetimeDisplay.currentDatetime.toUTCString();
        let labelArray = label.split(" ");

        label = labelArray[0] + " " + labelArray[1] + " " + labelArray[2] + " " + labelArray[3];

        /* Now we transform x on the actual coordinate on the canvas. */

        let labelPoint = {
            x: thisObject.container.frame.width / 2 - label.length / 2 * fontSize * FONT_ASPECT_RATIO,
            y: thisObject.container.frame.height * 3.4 / 10
        };

        labelPoint = thisObject.container.frame.frameThisPoint(labelPoint);

        browserCanvasContext.font = fontSize + 'px Courier New';
        browserCanvasContext.fillStyle = 'rgba(60, 60, 60, 0.50)';
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y);

        /* The time */

        label = labelArray[4] + " " + labelArray[5];

        /* Now we transform x on the actual coordinate on the canvas. */

        labelPoint = {
            x: thisObject.container.frame.width / 2 - label.length / 2 * fontSize * FONT_ASPECT_RATIO,
            y: thisObject.container.frame.height * 5.0 / 10
        };

        labelPoint = thisObject.container.frame.frameThisPoint(labelPoint);

        browserCanvasContext.font = fontSize + 'px Courier New';
        browserCanvasContext.fillStyle = 'rgba(60, 60, 60, 0.50)';
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y);

        label = PLAY_STEP / _1_MINUTE_IN_MILISECONDS + ' min';

        /* Now we transform x on the actual coordinate on the canvas. */

        labelPoint = {
            x: thisObject.container.frame.width / 2 - label.length / 2 * fontSize * FONT_ASPECT_RATIO,
            y: thisObject.container.frame.height * 6.5 / 10
        };

        labelPoint = thisObject.container.frame.frameThisPoint(labelPoint);

        browserCanvasContext.font = fontSize + 'px Courier New';
        browserCanvasContext.fillStyle = 'rgba(60, 60, 60, 0.50)';
        browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y);

    }





}