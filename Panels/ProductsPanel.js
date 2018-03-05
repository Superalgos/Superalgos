


function newProductsPanel() {

    var thisObject = {
        container: undefined,
        getLoadingProductCards: getLoadingProductCards,
        draw: draw,
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize
    };

    /* Cointainer stuff */

    var container = newContainer();

    container.name = "Bots Product Panel";
    container.initialize();

    container.isDraggeable = true;
    container.isZoomeable = false;

    thisObject.container = container;
    thisObject.container.frame.containerName = "Bot's Products";

    let isInitialized = false;
    let productCards = [];

    return thisObject;

    function initialize() {

        thisObject.container.frame.width = 300;
        thisObject.container.frame.height = viewPort.visibleArea.bottomRight.y - viewPort.visibleArea.topLeft.y + 15;

        var position = {
            x: viewPort.visibleArea.topLeft.x,
            y: 0
        };

        thisObject.container.frame.position = position;

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

                    /* Initialize it */

                    productCard.initialize();


                    /* Container Stuff */

                    productCard.container.displacement.parentDisplacement = thisObject.container.displacement;
                    productCard.container.zoom.parentZoom = thisObject.container.zoom;
                    productCard.container.frame.parentFrame = thisObject.container.frame;
                    productCard.container.parentContainer = thisObject.container;

                    /* Positioning within thisObject Panel */

                    let position = { 
                        x: 10,
                        y: thisObject.container.frame.height - thisObject.container.frame.getBodyHeight()
                    };
                    productCard.container.frame.position.x = position.x;
                    productCard.container.frame.position.y = position.y + lastY;

                    lastY = lastY + productCard.container.frame.height * 1.25;

                    /* Add to the Product Array */

                    productCards.push(productCard);

                    /* Listen to Status Changes Events */

                    productCard.container.eventHandler.listenToEvent('Status Changed', onProductCardStatusChanged);

                }
            }
        }

        isInitialized = true;

    }

    function onProductCardStatusChanged(pProductCard) {

        thisObject.container.eventHandler.raiseEvent('Product Card Status Changed', pProductCard);

    }

    function getLoadingProductCards() {

        /* Returns all productCards which status is LOADING */

        let onProducts = [];

        for (let i = 0; i < productCards.length; i++) {

            if (productCards[i].status === PRODUCT_CARD_STATUS.LOADING) {

                onProducts.push(productCards[i]);
            }
        }

        return onProducts;
    }

    function getContainer(point) {

        var container;

        /* First we check if thisObject point is inside thisObject space. */

        if (thisObject.container.frame.isThisPointHere(point, true) === true) {

            /* Now we see which is the inner most container that has it */


            for (var i = 0; i < productCards.length; i++) {

                container = productCards[i].getContainer(point);

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


    function draw() {

        if (isInitialized === false) {return;}

        thisObject.container.frame.draw(false, false, true);

        for (let i = 0; i < productCards.length; i++) {
            productCards[i].draw();
        }

    }

}