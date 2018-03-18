exports.newDebugLog = function newDebugLog() {

    const MODULE_NAME = "Debug Log";
    const fileSystem = require('fs');

    const currentDate = new Date();
    const dateString = currentDate.getUTCFullYear() + '-' + pad(currentDate.getUTCMonth() + 1, 2) + '-' + pad(currentDate.getUTCDate(), 2) + '-' + pad(currentDate.getUTCHours(), 2) + '-' + pad(currentDate.getUTCMinutes(), 2);
    const randomId = parseInt(Math.random() * 1000000); 

    let fileNumber = 1;
    let messageId = 0;
    let firstCall = true;
    let folderPath;
    let loopCounter;
    let loopIncremented = false;

    let thisObject = {
        bot: undefined,
        fileName: undefined,
        forceLoopSplit: false,          // When set to 'true' this will force that the logs of the current module are split in many different Loop folders.
        write: write
    };

    return thisObject;

    function createFolders() {

        try {

            folderPath = '../Logs';

            createFolderSync(folderPath);

            folderPath = '../Logs/' + thisObject.bot.devTeam;

            createFolderSync(folderPath);

            folderPath = '../Logs/' + thisObject.bot.devTeam + "/" + thisObject.bot.type;

            createFolderSync(folderPath);

            folderPath = '../Logs/' + thisObject.bot.devTeam + "/" + thisObject.bot.type + "/" + thisObject.bot.codeName + "." + thisObject.bot.version.major + "." + thisObject.bot.version.minor;

            createFolderSync(folderPath);

            folderPath = '../Logs/' + thisObject.bot.devTeam + "/" + thisObject.bot.type + "/" + thisObject.bot.codeName + "." + thisObject.bot.version.major + "." + thisObject.bot.version.minor + "/" + thisObject.bot.process;

            createFolderSync(folderPath);

            firstCall = false;

        }
        catch (err) {
            console.log("Error trying to create the folders needed.  Error: " + err.message);
        }
    }

    function createLoopFolder() {

        try {

            var rimraf = require('rimraf');

            let folderToRemove = '../Logs/' + thisObject.bot.devTeam + "/" + thisObject.bot.type + "/" + thisObject.bot.codeName + "." + thisObject.bot.version.major + "." + thisObject.bot.version.minor + "/" + thisObject.bot.process + "/Loop." + (loopCounter + 1).toString();

            /* We remove the folder in case it exister from before, so that all its content is gone. */

            rimraf.sync(folderToRemove);

            /* We create the new one. */

            folderPath = '../Logs/' + thisObject.bot.devTeam + "/" + thisObject.bot.type + "/" + thisObject.bot.codeName + "." + thisObject.bot.version.major + "." + thisObject.bot.version.minor + "/" + thisObject.bot.process + "/Loop." + loopCounter;

            createFolderSync(folderPath);

            /* We also remove old folders according to the configuration value of global.PLATFORM_CONFIG.maxLogLoops. */

            folderToRemove = '../Logs/' + thisObject.bot.devTeam + "/" + thisObject.bot.type + "/" + thisObject.bot.codeName + "." + thisObject.bot.version.major + "." + thisObject.bot.version.minor + "/" + thisObject.bot.process + "/Loop." + (loopCounter - global.PLATFORM_CONFIG.maxLogLoops).toString();

            rimraf.sync(folderToRemove);
        }
        catch (err) {
            console.log("Error trying to create the loop folder needed or deleting old ones.  Error: " + err.message);
        }
    }

    function write(Message) {

        if (firstCall === true) { createFolders(); }

        if (thisObject.bot.loopCounter !== loopCounter) {

            if (thisObject.forceLoopSplit === false) {

                if (loopIncremented === false) {

                    loopIncremented = true;

                    loopCounter = thisObject.bot.loopCounter;
                    createLoopFolder();
                }
            } else {

                loopIncremented = true;

                loopCounter = thisObject.bot.loopCounter;
                createLoopFolder();

            }
        }

        let filePath = getCurrentLogFile(folderPath + "/" + dateString + "---" + randomId + "---", this.fileName);

        let newDate = new Date();
        newDate = newDate.toISOString();

        messageId++;

        try {

            fileSystem.appendFileSync(filePath, '\r\n' + newDate + "   "  + messageId + "   " + Message);

        }
        catch (err) {
            console.log("Error trying to log info into a file. File: " + filePath + " Error:" + err.message);
        }
    }

    function createFolderSync(name) {
        try {
            fileSystem.mkdirSync(  name)
        } catch (err) {
            if (err.code !== 'EEXIST') throw err
        }
    }

    function getCurrentLogFile(relativePath, fileName) {

        let filePath;
        let stats;
        let i;

        try {
            for (i = 1; i < 1000000; i++) {

                filePath =  relativePath + i + "." + fileName + '.log';
                stats = fileSystem.statSync(filePath);
            }
        }
        catch (err) {

            if (i > 1) {

                filePath =  relativePath + (i - 1) + "." + fileName + '.log';

                stats = fileSystem.statSync(filePath);
                const fileSizeInBytes = stats.size;

                if (fileSizeInBytes > 10240000) {

                    filePath =  relativePath + i + "." + fileName + '.log';
                }

                return filePath;

            } else {

                return filePath;

            }

        }

    }

    function pad(str, max) {
        str = str.toString();
        return str.length < max ? pad("0" + str, max) : str;
    }

};

