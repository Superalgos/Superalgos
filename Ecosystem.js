
function newEcosystem() {

    let ecosystem = {
        getTeam: getTeam,
        getTeams: getTeams,
        getBot: getBot,
        getProduct: getProduct,
        getLayer: getLayer,
        getLayers: getLayers,
        getExchange: getExchange, 
        initialize: initialize
    }
 
    const ECOSYSTEM = "@ecosystem.json@";

    return ecosystem;


    function initialize() {


    }


    function getTeams() {

        return ECOSYSTEM.devTeams;

    }

    function getTeam(pTeamCodeName) {

        for (let i = 0; i < ECOSYSTEM.devTeams.length; i++) {

            if (ECOSYSTEM.devTeams[i].codeName === pTeamCodeName) {

                return ECOSYSTEM.devTeams[i];
            }
        }
    }

    function getBot(pTeam, pBotCodeName) {

        for (let i = 0; i < pTeam.bots.length; i++) {

            if (pTeam.bots[i].codeName === pBotCodeName) {

                return pTeam.bots[i];
            }
        }
    }

    function getProduct(pBot, pProductCodeName) {

        for (let i = 0; i < pBot.products.length; i++) {

            if (pBot.products[i].codeName === pProductCodeName) {

                return pBot.products[i];
            }
        }
    }

    function getLayer(pProduct, pLayerCodeName) {

        for (let i = 0; i < pProduct.layers.length; i++) {

            if (pProduct.layers[i].codeName === pLayerCodeName) {

                return pProduct.layers[i];
            }
        }
    }

    function getExchange(pProduct, pName) {

        for (let i = 0; i < pProduct.exchangeList.exchange.length; i++) {

            if (pProduct.exchangeList.exchange[i].name === pName) {

                return pProduct.exchangeList.exchange[i];
            }
        }
    }

    function getLayers() {

        let allLayers = [];

        for (let i = 0; i < ECOSYSTEM.devTeams.length; i++) {

            let devTeam = ecosystem.devTeams[i];

            for (let j = 0; j < devTeam.bots.length; j++) {

                let bot = devTeam.bots[j];

                for (let k = 0; k < bot.products.length; k++) {

                    let product = bot.products[k];

                    for (let l = 0; l < product.layers.length; l++) {

                        let layer = product.layers[l];

                        allLayers.push(layer);
                    }
                }
            }
        }

        return allLayers;
    }
}

