
process.on('uncaughtException', function (err) {
    console.log('[INFO] Run -> uncaughtException -> err.message = ' + err.message);
    return;
});


process.on('unhandledRejection', (reason, p) => {
    console.log('[INFO] Run -> unhandledRejection -> reason = ' + reason);
    console.log('[INFO] Run -> unhandledRejection -> p = ' + JSON.stringify(p));
    return;
});


process.on('exit', function (code) {
    try {
        console.log('[INFO] Run -> process.on.exit -> About to exit -> code = ' + code);
        return;
    }
    catch (err) {
        console.log("[ERROR] Run -> process.on.exit -> Error Logging Error Code.");
        console.log("[ERROR] Run -> process.on.exit -> err.message = " + err.message);
        return;
    }
});

global.STORAGE_PERMISSIONS = {};

readConnectionStringConfigFile();

function readConnectionStringConfigFile(environment, devTeamDataOwner) {

    let filePath;

    try {
        let fs = require('fs');
        filePath = '../' + 'Connection-Strings' + '/' + 'Storage.Permissions.json';
        global.STORAGE_PERMISSIONS = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        startRoot();
    }
    catch (err) {
        console.log("[ERROR] readConnectionStringConfigFile -> err = " + err.message);
        console.log("[HINT] readConnectionStringConfigFile -> You need to have a file at this path -> " + filePath);
        console.log("[HINT] readConnectionStringConfigFile -> The file must have the connection string to the Azure Storage Account. Request the file to an AA Team Member if you dont have it.");
        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
    }
}

function startRoot() {

    const ROOT_DIR = './';
    const ROOT_MODULE = require(ROOT_DIR + 'Root');
    let root = ROOT_MODULE.newRoot();

    root.initialize();
    root.start();

}

