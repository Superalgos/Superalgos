const fs = require('fs')
const path = require('path')
const StorageInterface = require('./StorageInterface')

class JSONStorage extends StorageInterface {
    constructor(config) {
        super()
        this.basePath = config.path
    }

    async readFile(filePath) {
        const fullPath = path.join(this.basePath, filePath)
        const data = fs.readFileSync(fullPath, 'utf8')
        return JSON.parse(data)
    }

    async writeFile(filePath, data) {
        const fullPath = path.join(this.basePath, filePath)
        const dir = path.dirname(fullPath)
        
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
        }
        
        fs.writeFileSync(fullPath, JSON.stringify(data, null, 2))
    }

    async exists(filePath) {
        const fullPath = path.join(this.basePath, filePath)
        return fs.existsSync(fullPath)
    }

    async deleteFile(filePath) {
        const fullPath = path.join(this.basePath, filePath)
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath)
        }
    }

    async listFiles(dirPath) {
        const fullPath = path.join(this.basePath, dirPath)
        if (!fs.existsSync(fullPath)) return []
        
        return fs.readdirSync(fullPath)
            .filter(f => f.endsWith('.json'))
            .map(f => path.join(dirPath, f))
    }
}

module.exports = JSONStorage