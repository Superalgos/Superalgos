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
 *   intialize: {(properties: ConnectionProperties) => Promise<void>},
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
        finalize: finalize,
    }

    /** @type Pool */ let pool = undefined;
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
        SA.logger.info('Does the table exist? ' + result.rows[0].exists + ' is a ' + typeof(result.rows[0].exists))
        return result.rows[0].exists == 'True' ? true : false
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