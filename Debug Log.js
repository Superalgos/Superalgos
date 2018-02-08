


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

    debugLog = {
        bot: undefined,
        fileName: undefined,
        write: write
    };



    return debugLog;


    function createFolders() {

        try {

            folderPath = debugLog.bot.devTeam;

            createFolderSync(folderPath);

            folderPath = debugLog.bot.devTeam + "/" + debugLog.bot.type;

            createFolderSync(folderPath);

            folderPath = debugLog.bot.devTeam + "/" + debugLog.bot.type + "/" + debugLog.bot.name;

            createFolderSync(folderPath);

            folderPath = debugLog.bot.devTeam + "/" + debugLog.bot.type + "/" + debugLog.bot.name + "/" + debugLog.bot.version;

            createFolderSync(folderPath);

            folderPath = debugLog.bot.devTeam + "/" + debugLog.bot.type + "/" + debugLog.bot.name + "/" + debugLog.bot.version + "/" + debugLog.bot.process;

            createFolderSync(folderPath);

            firstCall = false;

        }
        catch (err) {
            console.log("Error trying to create the folders needed.  Error: " + err);
        }


    }


    function write(Message) {

        if (firstCall === true) {

            createFolders();

        }

        let filePath = getCurrentLogFile(folderPath + "/" + dateString + "---" + randomId + "---", this.fileName);

        let newDate = new Date();
        newDate = newDate.toISOString();

        messageId++;

        try {

            fileSystem.appendFileSync(filePath, '\r\n' + newDate + "   "  + messageId + "   " + Message);

        }
        catch (err) {
            console.log("Error trying to log info into a file. File: " + filePath + " Error:" + err);
        }
    }


    function createFolderSync(name) {
        try {
            fileSystem.mkdirSync( '../logs/' + name)
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

                filePath = '../logs/' + relativePath + i + "." + fileName + '.log';
                stats = fileSystem.statSync(filePath);
            }
        }
        catch (err) {

            if (i > 1) {

                filePath = '../logs/' + relativePath + (i - 1) + "." + fileName + '.log';

                stats = fileSystem.statSync(filePath);
                const fileSizeInBytes = stats.size;

                if (fileSizeInBytes > 10240000) {

                    filePath = '../logs/' + relativePath + i + "." + fileName + '.log';
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

