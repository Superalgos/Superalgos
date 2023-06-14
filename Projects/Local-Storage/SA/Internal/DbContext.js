/* 
 * This is not added to the SA.nodeModules object as 
 * we don't want it being used anywhere else in the system 
 */
const { Pool, QueryResult } = require('pg')

/**
 * @typedef {{
 *   database: string
 *   host: string,
 *   password: string,
 *   port: number
 *   user: string,
 * }} ConnectionProperties
 */

/**
 * @typedef {{
 *   [key: string]: {
 *     name: string,
 *     type: string,
 *     params: string[],
 *   }
 * }} DatabaseStructure
 */

/**
 * @typedef {{
 *   column_name: string,
 *   data_type: string,
 *   character_maximum_length?: number,
 *   is_nullable: "YES"|"NO"
 * }} DatabaseColumRow 
 */

/**
 * @typedef {{
 *   intialize: {(properties: ConnectionProperties) => Promise<void>},
 *   doColumnsMatch: {(tableName: string, structure: DatabaseStructure) => Promise<boolean>}
 *   createTable: {(tableName: string, structure: DatabaseStructure) => Promise<QueryResult<any>>},
 *   doesTableExist: {(tableName: string) => Promise<boolean>},
 *   execute: {(query: string) => Promise<any>},
 *   finalize: {() => Promise<void>},
 * }} DbContext
 */

/**
 * @returns {DbContext}
 */
exports.newDbContext = function newDbContext() {
    thisObject = {
        intialize: intialize,
        execute: execute,
        doesTableExist: doesTableExist,
        createTable: createTable,
        doColumnsMatch: doColumnsMatch,
        finalize: finalize,
    }

    /** @type Pool */ let pool = undefined;

    const columnTypes = {
        'character varying': 'VARCHAR',
        'bigint': 'BIGINT',
        'timestamp without time zone': 'TIMESTAMP',
    }

    return thisObject

    /**
     * Creates a connection pool to the database.
     * The Pool manages the client connections to allow for
     * multiple concurrent connections to the database.
     * 
     * @param {ConnectionProperties} properties 
     * @returns {Promise<void>}
     */
    async function intialize(properties) {
        pool = new Pool({
            user: properties.user,
            host: properties.host,
            database: properties.database,
            password: properties.password,
            port: properties.port,
        })
    }

    /**
     * Executes the given query returning the result object
     * 
     * @param {string} query
     * @returns {Promise<QueryResult<any>>} 
     */
    async function execute(query) {
        if (pool === undefined) {
            throw new Error("The Database has not been initialized, you query will not be executed")
        }
        return await pool.query(query)
    }


    /**
     * Runs a query to check if the table already exists, return true or false
     * 
     * @param {string} tableName 
     * @returns {Promise<boolean>}
     */
    async function doesTableExist(tableName) {
        const query = `SELECT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = '${tableName}');`
        const result = await execute(query)
        // SA.logger.debug('Does the table exist? ' + result.rows[0].exists + ' is a ' + typeof(result.rows[0].exists))
        return result.rows[0].exists
    }

    /**
     * 
     * @param {string} tableName 
     * @param {DatabaseStructure} structure 
     * @returns {Promise<QueryResult<any>>}
     */
    async function createTable(tableName, structure) {
        const columns = Object.keys(structure)
            .map(key => `${structure[key].name} ${structure[key].type} ${structure[key].params.join(' ')}`)
            .join(', ')
        const query = `CREATE TABLE ${tableName} (${columns});`
        SA.logger.info(query)
        return await execute(query)
    }

    /**
     * 
     * @param {string} tableName 
     * @param {DatabaseStructure} structure 
     * @returns {Promise<boolean>}
     */
    async function doColumnsMatch(tableName, structure) {
        const query = `SELECT column_name, data_type, character_maximum_length, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${tableName}';`
        /** @type DatabaseColumRow[] */
        const rows = (await execute(query)).rows
        const structureKeys = Object.keys(structure)
        if(structureKeys.length != rows.length) {
            SA.logger.info(`Structure column count (${structureKeys.length}) and database column count (${rows.length}) do not match`)
            return false
        }
        const required = structureKeys.map(col => ({
            name: structure[col].name, 
            type: structure[col].type, 
            params: structure[col].params
        }))
        const structureMatch = rows.filter(row => required.findIndex(x => x.name === row.column_name) > -1).length
        if(structureMatch === -1) {
            SA.logger.info('Structure column not found in database')
            return
        }
        for(let i = 0; i < rows.length; i++) {
            const match = required.findIndex(col => col.name == rows[i].column_name)
            if(match === -1) {
                SA.logger.info(`Database column (${rows[i].column_name}) not found in new structure`)
                return false
            }
            // checking the column type is a match
            if(required[match].type.indexOf(columnTypes[rows[i].data_type]) === -1) {
                SA.logger.info(`Structure column type (${required[match].type}) not found in database`)
                return false
            }
            // checking that if it is a VARCHAR then the character count matches
            if(columnTypes[rows[i].data_type] === 'VARCHAR' && required[match].type.indexOf(rows[i].character_maximum_length) === -1) {
                SA.logger.info(`Structure column (${required[match].type}) length does not match in database`)
                return false
            }
            // checking column nullability
            if(rows[i].is_nullable === "YES" && !(required[match].params.indexOf('NOT NULL') > -1 || required[match].params.indexOf('PRIMARY KEY') > -1)) {
                SA.logger.info('Structure nullable type does not match in database')
                return false
            }
        }
        return true
    }

    /**
     * Closes the database connection so no more queries can be executed
     * 
     * @returns {Promise<void>}
     */
    async function finalize() {
        await pool.end().then(() => {
            pool = undefined
        })
    }
}