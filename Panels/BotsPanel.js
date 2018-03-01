


function newBotsPanel() {

    const CARD_STATES = {
        ON: 'on',
        OFF: 'off'
    };

    var thisObject = {
        container: undefined,
        cards: undefined,
        getLayerStatus: getLayerStatus,
        draw: draw,
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    container.isDraggeable = true;
    container.isZoomeable = false;
    thisObject.container = container;
    thisObject.container.frame.containerName = "Chart Layers Panel";

    let isInitialized = false;
    let cards;

    let layers = [];

    return thisObject;

    function initialize() {

        this.container.frame.width = 200;
        this.container.frame.height = 200;

        var position = {
            x: viewPort.visibleArea.topRight.x - this.container.frame.width,
            y: viewPort.visibleArea.bottomRight.y - this.container.frame.height
        };

        this.container.frame.position = position;

        /* First thing is to build the layers array */

        let devTeams = ecosystem.getTeams();

        for (let i = 0; i < devTeams.length; i++) {

            let devTeam = devTeams[i];

            for (let j = 0; j < devTeam.bots.length; j++) {

                let bot = devTeam.bots[j];

                for (let k = 0; k < bot.products.length; k++) {

                    let product = bot.products[k];

                    for (let l = 0; l < product.layers.length; l++) {

                        let layer = product.layers[l];

                        let panelLayer = {
                            devTeam: devTeam,
                            bot: bot,
                            product: product,
                            layer: layer
                        };

                        layers.push(panelLayer);
                    }
                }
            }
        }

        var cardPosition;

        var lastY = 5;
        cards = [];

        for (var i = 0; i < layers.length; i++) {

            let fullCodeName = layers[i].devTeam.codeName + '-' + layers[i].bot.codeName + '-' + layers[i].product.codeName + '-' + layers[i].layer.codeName;

            /* Buttons are going to be one at the right of the other. */

            var card = newBotCard();
            card.devTeam = layers[i].devTeam.displayName;
            card.bot = layers[i].bot.displayName;
            card.product = layers[i].product.displayName;
            card.layer = layers[i].layer.displayName;
            card.code = fullCodeName;

            card.container.displacement.parentDisplacement = this.container.displacement;
            card.container.zoom.parentZoom = this.container.zoom;
            card.container.frame.parentFrame = this.container.frame;

            card.container.parentContainer = this.container;

            card.initialize();

            cardPosition = {  // The first card 
                x: 10,
                y: thisObject.container.frame.height - thisObject.container.frame.getBodyHeight()
            };
            card.container.frame.position.x = cardPosition.x;
            card.container.frame.position.y = cardPosition.y + lastY;

            lastY = lastY + card.container.frame.height;

            /*  We start listening to the cards click event, so as to know when one was pressed. */

            card.container.eventHandler.listenToEvent('onMouseClick', buttonPressed, i);

            let storedValue = window.localStorage.getItem(card.code);

            if (storedValue !== null) {

                card.status = storedValue; 

            } else {

                card.status = CARD_STATES.ON; 

            }

            cards.push(card);

            let eventData = {
                layer: card.code,
                status: card.status
            }

            thisObject.container.eventHandler.raiseEvent('Layer Status Changed', eventData);
        }

        thisObject.cards = cards;

        isInitialized = true;

    }

    function getLayerStatus(layerName) {

        for (let i = 0; i < cards.length; i++) {

            let button = cards[i];

            if (button.code === layerName) {

                return button.status;

            }

        }

        return CARD_STATES.OFF;
    }

    function getContainer(point) {

        var container;

        /* First we check if this point is inside this space. */

        if (this.container.frame.isThisPointHere(point, true) === true) {

            /* Now we see which is the inner most container that has it */


            for (var i = 0; i < this.cards.length; i++) {

                container = this.cards[i].getContainer(point);

                if (container !== undefined) {

                    /* We found an inner container which has the point. We return it. */

                    return container;
                }
            }

            /* The point does not belong to any inner container, so we return the current container. */

            return this.container;

        } else {

            /* This point does not belong to this space. */

            return undefined;
        }

    }

    function buttonPressed(event, index) {

        switch (thisObject.cards[index].status) {

            case CARD_STATES.ON:
                thisObject.cards[index].status = CARD_STATES.OFF;
                break;

            case CARD_STATES.OFF:
                thisObject.cards[index].status = CARD_STATES.ON;
                break;

        }


        let eventData = {
            layer: thisObject.cards[index].code,
            status: thisObject.cards[index].status
        }

        thisObject.container.eventHandler.raiseEvent('Layer Status Changed', eventData);

        window.localStorage.setItem(thisObject.cards[index].code, thisObject.cards[index].status);

    }

    function draw() {

        if (isInitialized === false) {return;}

        thisObject.container.frame.draw(false, false, true);

        for (var i = 0; i < thisObject.cards.length; i++) {
            thisObject.cards[i].draw();
        }

    }

}