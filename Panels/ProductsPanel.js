


function newProductsPanel() {

    const PRODUCT_STATUS = {
        ON: 'on',
        OFF: 'off'
    };

    var thisObject = {
        container: undefined,
        gerOnProducts: gerOnProducts,
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
    let products;

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
        products = [];

        for (var i = 0; i < layers.length; i++) {

            let fullCodeName = layers[i].devTeam.codeName + '-' + layers[i].bot.codeName + '-' + layers[i].product.codeName + '-' + layers[i].layer.codeName;

            /* Products are going to be one at the right of the other. */

            var card = newProduct();
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

            /*  We start listening to the products click event, so as to know when one was pressed. */

            card.container.eventHandler.listenToEvent('onMouseClick', buttonPressed, i);

            let storedValue = window.localStorage.getItem(card.code);

            if (storedValue !== null) {

                card.status = storedValue; 

            } else {

                card.status = PRODUCT_STATUS.ON; 

            }

            products.push(card);

            let eventData = {
                layer: card.code,
                status: card.status
            }

            thisObject.container.eventHandler.raiseEvent('Layer Status Changed', eventData);
        }

        isInitialized = true;

    }

    function gerOnProducts() {

        /* Returns all products which status is ON */

        let onProducts = [];

        for (let i = 0; i < products.length; i++) {

            if (products[i].status = PRODUCT_STATUS.ON) {

                onProducts.push(products[i]);
            }
        }

        return onProducts;
    }


    function getLayerStatus(layerName) {

        for (let i = 0; i < products.length; i++) {

            let button = products[i];

            if (button.code === layerName) {

                return button.status;

            }

        }

        return PRODUCT_STATUS.OFF;
    }

    function getContainer(point) {

        var container;

        /* First we check if this point is inside this space. */

        if (this.container.frame.isThisPointHere(point, true) === true) {

            /* Now we see which is the inner most container that has it */


            for (var i = 0; i < products.length; i++) {

                container = products[i].getContainer(point);

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

        switch (products[index].status) {

            case PRODUCT_STATUS.ON:
                products[index].status = PRODUCT_STATUS.OFF;
                break;

            case PRODUCT_STATUS.OFF:
                products[index].status = PRODUCT_STATUS.ON;
                break;

        }


        let eventData = {
            layer: products[index].code,
            status: products[index].status
        }

        thisObject.container.eventHandler.raiseEvent('Layer Status Changed', eventData);

        window.localStorage.setItem(products[index].code, products[index].status);

    }

    function draw() {

        if (isInitialized === false) {return;}

        thisObject.container.frame.draw(false, false, true);

        for (var i = 0; i < products.length; i++) {
            products[i].draw();
        }

    }

}