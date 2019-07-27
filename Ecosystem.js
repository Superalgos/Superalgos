
function newEcosystem() {

    let thisObject = {
        getHost: getHost,
        getCompetition: getCompetition,
        getTeam: getTeam,
        getTeams: getTeams,
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

    function getPlotter(pTeam, pPlotterCodeName) {

        for (let i = 0; i < pTeam.plotters.length; i++) {

            if (pTeam.plotters[i].codeName === pPlotterCodeName) {

                return pTeam.plotters[i];
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
