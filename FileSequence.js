
function newFileSequence() {

    let thisObject = {
        getFile: getFile,
        getExpectedFiles: getExpectedFiles,
        getFilesLoaded: getFilesLoaded,
        initialize: initialize
    }

    let filesLoaded = 0;

    let fileCloud;

    let files = new Map;

    let maxSequence;

    return thisObject;

    function initialize(pDevTeam, pBot, pProduct, pSet, pExchange, pMarket, callBackFunction) {

        let exchange = ecosystem.getExchange(pProduct, pExchange);

        if (exchange === undefined) {

            throw "Exchange not supoorted by this pProduct of the ecosystem! - pDevTeam.codeName = " + pDevTeam.codeName + ", pBot.codeName = " + pBot.codeName + ", pProduct.codeName = " + pProduct.codeName + ", pExchange = " + pExchange;

        }

        fileCloud = newFileCloud();
        fileCloud.initialize(pBot);

        /* First we will get the sequence max number */

        fileCloud.getFile(pDevTeam, pBot, pSet, exchange, pMarket, undefined, undefined, "Sequence", onSequenceFileReceived);

        function onSequenceFileReceived(file) {

            maxSequence = Number(file);

            /* Now we will get the sequence of files */

            for (let i = 0; i <= maxSequence; i++) {

                fileCloud.getFile(pDevTeam, pBot, pSet, exchange, pMarket, undefined, undefined, i, onFileReceived);

                function onFileReceived(file) {

                    files.set(i, file);

                    filesLoaded++;

                    callBackFunction(); // Note that the callback is called for every file loaded.

                }
            }
        }
    }

    function getFile(pSequence) {

        return files.get(pSequence);

    }

    function getExpectedFiles() {

        return maxSequence + 1;

    }

    function getFilesLoaded() {

        return filesLoaded;

    }

}