
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

const ROOT_DIR = './';
const ROOT_MODULE = require(ROOT_DIR + 'Root');
let root = ROOT_MODULE.newRoot();

root.initialize();
root.start();
