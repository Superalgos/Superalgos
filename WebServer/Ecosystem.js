
function newEcosystem() {

    let thisObject = {
        getHost: getHost,
        getCompetition: getCompetition,
        getDataMine: getDataMine,
        getDataMines: getDataMines,
        getBot: getBot,
        getProduct: getProduct,
        getDataSet: getDataSet,
        getExchange: getExchange,
        getPlotter: getPlotter,
        getPlotterModule: getPlotterModule,
        getStoragePermissions: getStoragePermissions,
        setEvent: setEvent,
        initialize: initialize
    }

    let ECOSYSTEM = JSON.parse(window.localStorage.getItem('ecosystem'));
    if (ECOSYSTEM === null || ECOSYSTEM === undefined) {
        ECOSYSTEM = getUserEcosystem()
    }

    return thisObject;

    function initialize() {

    }

    function setEvent(input) {
        ECOSYSTEM.hosts = input;
    }

    function getStoragePermissions() {

        return ECOSYSTEM.STORAGE_PERMISSIONS;

    }

    function getHost(pHostCodeName) {

        for (let i = 0; i < ECOSYSTEM.hosts.length; i++) {

            if (ECOSYSTEM.hosts[i].codeName === pHostCodeName) {

                return ECOSYSTEM.hosts[i];
            }
        }
    }

    function getCompetition(pHost, pCompetitionCodeName) {

        for (let i = 0; i < pHost.competitions.length; i++) {

            if (pHost.competitions[i].codeName === pCompetitionCodeName) {

                return pHost.competitions[i];
            }
        }
    }

    function getDataMines() {

        return ECOSYSTEM.dataMines;

    }

    function getDataMine(pDataMineCodeName) {

        for (let i = 0; i < ECOSYSTEM.dataMines.length; i++) {

            if (ECOSYSTEM.dataMines[i].codeName === pDataMineCodeName) {

                return ECOSYSTEM.dataMines[i];
            }
        }
    }

    function getBot(pDataMine, pBotCodeName) {

        for (let i = 0; i < pDataMine.bots.length; i++) {

            if (pDataMine.bots[i].codeName === pBotCodeName) {

                return pDataMine.bots[i];
            }
        }
    }

    function getPlotter(pDataMine, pPlotterCodeName) {

        for (let i = 0; i < pDataMine.plotters.length; i++) {

            if (pDataMine.plotters[i].codeName === pPlotterCodeName) {

                return pDataMine.plotters[i];
            }
        }
    }

    function getPlotterModule(pPlotter, pModuleCodeName) {

        for (let i = 0; i < pPlotter.modules.length; i++) {

            if (pPlotter.modules[i].codeName === pModuleCodeName) {

                return pPlotter.modules[i];
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

    function getDataSet(pProduct, pSetCodeName) {

        for (let i = 0; i < pProduct.dataSets.length; i++) {

            if (pProduct.dataSets[i].codeName === pSetCodeName) {

                return pProduct.dataSets[i];
            }
        }
    }

    function getExchange(pProduct, pName) {

        for (let i = 0; i < pProduct.exchangeList.length; i++) {

            if (pProduct.exchangeList[i].name === pName) {

                return pProduct.exchangeList[i];
            }
        }
    }



    return false;
}
