function newWebFS() {

    const MODULE_NAME = "Web FS";
    const INFO_LOG = false;
    const ERROR_LOG = true;
    const logger = newDebugLog();
    logger.fileName = MODULE_NAME;

    /*

    This is the module emulates the NodeJS 'fs'. 

    */

    var thisObject = {
        readFileSync: readFileSync,
        appendFileSync: appendFileSync,
        mkdirSync: mkdirSync,
        statSync: statSync,
        readdir: readdir,
        readdirSync: readdirSync,
        readFile: readFile
    };


    return thisObject;

    function readFileSync(pPath, pEncoding) {

        switch (pPath) {

            case 'this.config.json': {

                /* This is AAWeb Config File. */

                return JSON.stringify(ecosystem.getAACloudConfig());

                break;
            }
        }
    }

    function appendFileSync(pPath, pText) {

        /* We will ignore this since we can not and dont want to really write something on disk while we are at the browser. */
    }

    function readdir(pPath, callBackFunction) {

        /* We will return an empty array of files. */
        callBackFunction([]);
    }

    function readdirSync(pPath, callBackFunction) {


    }

    function mkdirSync(pPath) {

        /* Again we do nothing. */
    }

    function readFile(pPath) {

        /* Again we do nothing. */
    }

    function statSync(pPath) {

        let stats
        stats.size = 0;
        return stats
    }
}