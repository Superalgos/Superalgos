class StorageInterface {
    async readFile(filePath) {
        throw new Error('readFile must be implemented')
    }

    async writeFile(filePath, data) {
        throw new Error('writeFile must be implemented')
    }

    async exists(filePath) {
        throw new Error('exists must be implemented')
    }

    async deleteFile(filePath) {
        throw new Error('deleteFile must be implemented')
    }

    async listFiles(dirPath) {
        throw new Error('listFiles must be implemented')
    }
}

module.exports = StorageInterface