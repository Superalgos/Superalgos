
function newCompetitionStorage(pName) {

    const CONSOLE_LOG = false;

    /*

    This object will initialize children objects that will end up loading the data of each participant on the competition.

    At the same time it will raise an event for each underlaying file being loaded, so that the UI can reflect the progress to the end user. 

    */

    let thisObject = {

        files: new Map(),

        eventHandler: undefined,
        initialize: initialize

    }

    thisObject.eventHandler = newEventHandler();

    /* We name the event Handler to easy debugging. */

    thisObject.eventHandler.name = "Storage-" + pName;

    return thisObject;

    function initialize(pHost, pCompetition, callBackFunction) {

        if (CONSOLE_LOG === true) {

            console.log("Competition storage initialize for " + pHost.codeName + "-" + pCompetition.codeName);

        }

        let dataSetsToLoad = 0;
        let dataSetsLoaded = 0;

        for (let i = 0; i < pCompetition.participants.length; i++) {

            let devTeam = ecosystem.getTeam(pCompetition.participants[i].devTeam);
            let bot = ecosystem.getBot(devTeam, pCompetition.participants[i].bot)
            let product = ecosystem.getProduct(bot, "Live Trading History");

            for (let i = 0; i < product.dataSets.length; i++) {

                let thisSet = product.dataSets[i];

                switch (thisSet.type) {

                    case 'Single File': {

                        let file = newFile();
                        file.initialize(devTeam, bot, product, thisSet, undefined, undefined, onSingleFileReady);
                        thisObject.files.set(pCompetition.participants[i].devTeam + "-" + pCompetition.participants[i].bot, file);
                        dataSetsToLoad++;

                        if (CONSOLE_LOG === true) {

                            console.log("Competition storage initialize Single File for " + devTeam.codeName + "-" + bot.codeName + "-" + product.codeName);

                        }
                    }
                        break;

                }

                function onSingleFileReady() {

                    if (CONSOLE_LOG === true) {

                        console.log("Competition storage initialize onSingleFileReady for " + devTeam.codeName + "-" + bot.codeName + "-" + product.codeName);

                    }

                    let event = {
                        totalValue: 1,
                        currentValue: 1
                    }

                    thisObject.eventHandler.raiseEvent('Single File Loaded', event);

                    if (event.currentValue === event.totalValue) {

                        dataSetsLoaded++;
                        checkInitializeComplete();
                    }
                }

                function checkInitializeComplete() {

                    if (CONSOLE_LOG === true) {

                        console.log("Competition storage initialize checkInitializeComplete for " + devTeam.codeName + "-" + bot.codeName + "-" + product.codeName);

                    }

                    if (dataSetsLoaded === dataSetsToLoad) {
                        callBackFunction();
                    }
                }
            }
        }
    }
}

