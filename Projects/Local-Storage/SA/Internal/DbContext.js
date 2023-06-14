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
 *   intialize: {(properties: ConnectionProperties) => void},
 *   getTableContext: {() => import('knex').knex.QueryBuilder},
 *   finalize: {() => void},
 * }} DbContext
 */

/**
 * @returns {DbContext}
 */
exports.newDbContext = function newDbContext() {
    thisObject = {
        intialize: intialize,
        getTableContext: getTableContext,
        finalize: finalize,
    }

    /** @type {import('knex').knex} */ let db = undefined;

    return thisObject

    /**
     * Creates a connection pool to the database.
     * The Pool manages the client connections to allow for
     * multiple concurrent connections to the database.
     * 
     * @param {ConnectionProperties} properties 
     * @returns {void}
     */
    function intialize(properties) {
        if(db !== undefined) {
            db = require('knex')({
                client: 'pg',
                connection: {
                    user: properties.user,
                    host: properties.host,
                    database: properties.database,
                    password: properties.password,
                    port: properties.port,
                }
            })
        }
    }

    /**
     * returns the databse context
     * 
     * @returns {import('knex').knex.QueryBuilder} 
     */
    function getTableContext(table) {
        if (db === undefined) {
            throw new Error("The Database has not been initialized, you query will not be executed")
        }
        return db(table)
    }

    /**
     * Closes the database connection so no more queries can be executed
     * 
     * @returns {void}
     */
    function finalize() {
        db = undefined
    }
}