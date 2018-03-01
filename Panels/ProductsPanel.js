


function newProductsPanel() {

    const PRODUCT_STATUS = {
        ON: 'on',
        OFF: 'off'
    };

    var thisObject = {
        container: undefined,
        getOnProductCards: getOnProductCards,
        getProductStatus: getProductStatus,
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
    let productCards;

    return thisObject;

    function initialize() {

        this.container.frame.width = 200;
        this.container.frame.height = 200;

        var position = {
            x: viewPort.visibleArea.topRight.x - this.container.frame.width,
            y: viewPort.visibleArea.bottomRight.y - this.container.frame.height
        };

        this.container.frame.position = position;

        /* Needed Variables */

        var lastY = 5;

        /* First thing is to build the productCards array */

        let devTeams = ecosystem.getTeams();

        for (let i = 0; i < devTeams.length; i++) {

            let devTeam = devTeams[i];

            for (let j = 0; j < devTeam.bots.length; j++) {

                let bot = devTeam.bots[j];

                for (let k = 0; k < bot.products.length; k++) {

                    let product = bot.products[k];

                    /* Now we create Product objects */

                    let productCard = newProductCard();

                    productCard.devTeam = devTeam;
                    productCard.bot = bot;
                    productCard.product = product;

                    productCard.code = devTeam.codeName + '-' + bot.codeName + '-' + product.codeName;

                    /* Container Stuff */

                    productCard.container.displacement.parentDisplacement = this.container.displacement;
                    productCard.container.zoom.parentZoom = this.container.zoom;
                    productCard.container.frame.parentFrame = this.container.frame;
                    productCard.container.parentContainer = this.container;

                    /* Initialize it */

                    productCard.initialize();

                    /* Positioning within this Panel */

                    let position = { 
                        x: 10,
                        y: thisObject.container.frame.height - thisObject.container.frame.getBodyHeight()
                    };
                    productCard.container.frame.position.x = position.x;
                    productCard.container.frame.position.y = position.y + lastY;

                    lastY = lastY + productCard.container.frame.height;

                    /*  We start listening to the productCard click event, so as to know when one was pressed. */

                    productCard.container.eventHandler.listenToEvent('onMouseClick', buttonPressed, i);

                    /* We retrieve the locally stored status of the Product */

                    let storedValue = window.localStorage.getItem(productCard.code);

                    if (storedValue !== null) {

                        productCard.status = storedValue;

                    } else {

                        productCard.status = PRODUCT_STATUS.ON;

                    }

                    /* Add to the Product Array */

                    productCards.push(productCard);

                }
            }
        }

        isInitialized = true;

    }

    function getOnProductCards() {

        /* Returns all productCards which status is ON */

        let onProducts = [];

        for (let i = 0; i < productCards.length; i++) {

            if (productCards[i].status = PRODUCT_STATUS.ON) {

                onProducts.push(productCards[i]);
            }
        }

        return onProducts;
    }

    function getProductStatus(pProductCode) {

        for (let i = 0; i < productCards.length; i++) {

            let button = productCards[i];

            if (button.code === pProductCode) {

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


            for (var i = 0; i < productCards.length; i++) {

                container = productCards[i].getContainer(point);

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

        switch (productCards[index].status) {

            case PRODUCT_STATUS.ON:
                productCards[index].status = PRODUCT_STATUS.OFF;
                break;

            case PRODUCT_STATUS.OFF:
                productCards[index].status = PRODUCT_STATUS.ON;
                break;

        }

        let eventData = productCards[index];    

        thisObject.container.eventHandler.raiseEvent('Product Card Status Changed', eventData);

        window.localStorage.setItem(productCards[index].code, productCards[index].status);

    }

    function draw() {

        if (isInitialized === false) {return;}

        thisObject.container.frame.draw(false, false, true);

        for (let i = 0; i < productCards.length; i++) {
            productCards[i].draw();
        }

    }

}