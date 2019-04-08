
exports.newBlobStorage = function newBlobStorage(BOT, logger) {

    let FULL_LOG = false;
    let ERROR_LOG = true;
    let LOG_FILE_CONTENT = false;

    let bot = BOT;
    const ROOT_DIR = './';

    const MODULE_NAME = "Blob Storage";

    let storage;

    let AZURE_STORAGE = require('./AzureBlobStorage')
    let MINIO_STORAGE = require('./MinioBlobStorage')

    switch (process.env.STORAGE_PROVIDER) {
        case 'Azure': {
            storage = AZURE_STORAGE.newAzureBlobBlobStorage(bot, logger);
            break;
        }
        case 'Minio': {
            storage = MINIO_STORAGE.newMinioBlobBlobStorage(bot, logger);
            break;
        }
        default: {
            if (ERROR_LOG === true && logger !== undefined) {
                logger.write(MODULE_NAME, "[ERROR] initialize -> Storage Provider not supported -> process.env.STORAGE_PROVIDER = " + process.env.STORAGE_PROVIDER);
            }
            return;
        }
    }

    return storage;

};