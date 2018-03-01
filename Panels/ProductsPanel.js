


function newProductsPanel() {

    const PRODUCT_STATUS = {
        ON: 'on',
        OFF: 'off'
    };

    var thisObject = {
        container: undefined,
        getOnProducts: getOnProducts,
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
    let products;

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

        /* First thing is to build the products array */

        let devTeams = ecosystem.getTeams();

        for (let i = 0; i < devTeams.length; i++) {

            let devTeam = devTeams[i];

            for (let j = 0; j < devTeam.bots.length; j++) {

                let bot = devTeam.bots[j];

                for (let k = 0; k < bot.products.length; k++) {

                    let product = bot.products[k];

                    /* Now we create Product objects */

                    var product = newProduct();

                    product.devTeam = devTeam;
                    product.bot = bot;
                    product.product = product;

                    product.code = devTeam.codeName + '-' + bot.codeName + '-' + product.codeName;

                    /* Container Stuff */

                    product.container.displacement.parentDisplacement = this.container.displacement;
                    product.container.zoom.parentZoom = this.container.zoom;
                    product.container.frame.parentFrame = this.container.frame;
                    product.container.parentContainer = this.container;

                    /* Initialize it */

                    product.initialize();

                    /* Positioning within this Panel */

                    let position = { 
                        x: 10,
                        y: thisObject.container.frame.height - thisObject.container.frame.getBodyHeight()
                    };
                    product.container.frame.position.x = position.x;
                    product.container.frame.position.y = position.y + lastY;

                    lastY = lastY + product.container.frame.height;

                    /*  We start listening to the products click event, so as to know when one was pressed. */

                    product.container.eventHandler.listenToEvent('onMouseClick', buttonPressed, i);

                    /* We retrieve the locally stored status of the Product */

                    let storedValue = window.localStorage.getItem(product.code);

                    if (storedValue !== null) {

                        product.status = storedValue;

                    } else {

                        product.status = PRODUCT_STATUS.ON;

                    }

                    /* Add to the Product Array */

                    products.push(product);

                }
            }
        }

        isInitialized = true;

    }

    function getOnProducts() {

        /* Returns all products which status is ON */

        let onProducts = [];

        for (let i = 0; i < products.length; i++) {

            if (products[i].status = PRODUCT_STATUS.ON) {

                onProducts.push(products[i]);
            }
        }

        return onProducts;
    }

    function getProductStatus(pProductCode) {

        for (let i = 0; i < products.length; i++) {

            let button = products[i];

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
            productCode: products[index].code,
            status: products[index].status
        }

        thisObject.container.eventHandler.raiseEvent('Product Status Changed', eventData);

        window.localStorage.setItem(products[index].code, products[index].status);

    }

    function draw() {

        if (isInitialized === false) {return;}

        thisObject.container.frame.draw(false, false, true);

        for (let i = 0; i < products.length; i++) {
            products[i].draw();
        }

    }

}