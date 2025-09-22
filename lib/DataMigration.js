const fs = require('fs')
const path = require('path')

class DataMigration {
    constructor(storageConfig) {
        this.config = storageConfig
    }

    async migrateToSQLite() {
        if (this.config.dataStorage.type !== 'sqlite') return

        const jsonDataPath = this.config.dataStorage.json.path
        const sqlitePath = this.config.dataStorage.sqlite.path
        
        // Check if SQLite DB exists, if not, check for JSON data to migrate
        const dbExists = fs.existsSync(path.join(sqlitePath, 'superalgos.db'))
        const jsonExists = fs.existsSync(jsonDataPath)
        
        if (!dbExists && jsonExists) {
            console.log('\n📦 First-time SQLite setup detected')
            console.log('   Migrating existing JSON data to SQLite...')
            
            const startTime = Date.now()
            await this.performMigration(jsonDataPath, sqlitePath)
            const duration = ((Date.now() - startTime) / 1000).toFixed(1)
            
            console.log(`✅ Migration completed in ${duration}s`)
            console.log('   Your JSON files are preserved as backup\n')
        }
    }

    async performMigration(jsonPath, sqlitePath) {
        const SQLiteAdapter = require('../Projects/Data-Mining/TS/Function-Libraries/SQLiteFileAdapter')
        const adapter = SQLiteAdapter.newSQLiteFileAdapter(sqlitePath)
        
        // Scan for JSON files and migrate
        const files = this.findJSONFiles(jsonPath)
        let migrated = 0
        
        for (const file of files) {
            try {
                const data = JSON.parse(fs.readFileSync(file, 'utf8'))
                const relativePath = path.relative(jsonPath, file)
                await adapter.writeFile(relativePath, data)
                migrated++
                
                if (migrated % 100 === 0) {
                    process.stdout.write(`   Migrated ${migrated}/${files.length} files...\r`)
                }
            } catch (e) {
                console.warn(`   Warning: Could not migrate ${file}`)
            }
        }
    }

    findJSONFiles(dir) {
        const files = []
        const scan = (currentDir) => {
            const items = fs.readdirSync(currentDir)
            for (const item of items) {
                const fullPath = path.join(currentDir, item)
                if (fs.statSync(fullPath).isDirectory()) {
                    scan(fullPath)
                } else if (item.endsWith('.json')) {
                    files.push(fullPath)
                }
            }
        }
        scan(dir)
        return files
    }
}

module.exports = DataMigration