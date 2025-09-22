const JSONStorage = require('./JSONStorage')
const SQLiteStorage = require('./SQLiteStorage')

class StorageFactory {
    static create(config) {
        switch (config.dataStorage.type) {
            case 'sqlite':
                return new SQLiteStorage(config.dataStorage.sqlite)
            case 'json':
            default:
                return new JSONStorage(config.dataStorage.json)
        }
    }
}

module.exports = StorageFactory