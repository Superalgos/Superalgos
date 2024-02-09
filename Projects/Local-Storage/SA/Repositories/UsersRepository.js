/**
 * Reference for the table columns
 * 
 * @typedef {Object} DbUser
 * @property {string} id
 * @property {string} name
 * @property {number} balance
 * @property {Date} updated_at
 */

/**
 * @typedef {Object} UserItem
 * @property {string} id
 * @property {string} name
 * @property {number} balance
 * @property {Date} updatedAt
 */

/**
 * @param {import('../Internal/DbContext').DbContext} dbContext
 * @returns {import('../Globals/Persistence').PersistenceModel}
 */
exports.newUsersRepository = function newUsersRepository(dbContext) {
    const thisObject = {
        initialize: intialize,
        saveItem: saveItem,
        saveAll: saveAll,
        deleteItem: deleteItem,
        deleteAll: deleteAll,
        findItem: findItem,
        findMany: findMany,
    }

    /*
     * These fields are here to server as mapping references for the incoming objects
     * if there is a change to the structure a migration file will need to be created
     */
    const TABLE_NAME = 'users'
    const structure = {
        id: {
            name: 'id',
            type: 'VARCHAR (36)',
            params: ['PRIMARY KEY']
        },
        name: {
            name: 'name',
            type: 'VARCHAR (255)',
            params: ['NOT NULL']
        },
        balance: {
            name: 'balance',
            type: 'DECIMAL(32,8)',
            params: ['NOT NULL']
        },
        updateAt: {
            name: 'updated_at',
            type: 'TIMESTAMP',
            params: ['NOT NULL']
        }
    }

    return thisObject

    /**
     * @returns {import('knex').knex.QueryBuilder} knex query builder
     */
    function _getTableContext() {
        return dbContext.getTableContext(TABLE_NAME)
    }

    /**
     * @returns {Promise<void>}
     */
    async function intialize() {
        return await Promise.resolve()
    }

    /**
     * @param {UserItem} item
     * @returns {Promise<string>} item ID
     */
    async function saveItem(item) {
        return await await _getTableContext()
            .insert({
                id: item.id,
                name: item.name,
                balance: item.balance,
                updated_at: new Date(),
            })
            .onConflict('id')
            .merge()
            .returning('id')
    }

    /**
     * @param {UserItem[]} items
     * @returns {Promise<string[]>} list of items IDs
     */
    async function saveAll(items) {
        const now = new Date()
        return await _getTableContext()
            .insert(items.map(item => ({
                id: item.id,
                name: item.name,
                balance: item.balance,
                updated_at: now,
            })))
            .onConflict('id')
            .merge()
            .returning('id')
    }

    /**
     * @param {{
     *   key: string,
     *   value: any
     * }} item 
     * @returns {Promise<number>}
     */
    async function deleteItem(item) {
        return await _getTableContext()
            .where(structure[item.key], item.value)
            .del()
    }

    /**
     * @returns {Promise<void>}
     */
    async function deleteAll() {
        return _getTableContext().del()
    }

    /**
     * @param {{
     *   key: string,
     *   value: any
     * }} item 
     * @param {string[]} propertiesToReturn
     * @returns {Promise<UserItem>}
     */
    async function findItem(item, propertiesToReturn) {
        const properties = propertiesToReturn !== undefined && propertiesToReturn.length > 0 
            ? propertiesToReturn.map(key => structure[key].name).join(', ')
            : '*'
        const results = await _getTableContext()
            .where(structure[item.key].name, item.value)
            .limit(1)
            .returning(properties)
        return _responseMapper(results[0], propertiesToReturn)
    }
    
    /**
     * NOTE: currently returns all items as filters have not been implemented yet
     * @param {{
     *   key: string,
     *   values: []
     * }} items 
     * @param {string[]} propertiesToReturn
     * @returns {Promise<UserItem[]>}
     */
    async function findMany(items, propertiesToReturn) {
       const properties = propertiesToReturn !== undefined && propertiesToReturn.length > 0 
       ? propertiesToReturn.map(key => structure[key].name).join(',')
       : '*'
       const where = '' /* needs some consideration */ // 'WHERE ' + items.map( item => `${structure[item.key]} = ${item.value}`).join(' AND ')
       const query = `SELECT ${properties} FROM ${TABLE_NAME} ${where}`
       const results = await dbContext.execute(query)
       return results.map(result => _responseMapper(result, propertiesToReturn))
    }
    
    /**
     * 
     * @param {DbUser} responseItem 
     * @param {string[]|undefined} propertiesToReturn 
     * @returns {UserItem}
     */
    function _responseMapper(responseItem, propertiesToReturn) {
        return properties == '*' || propertiesToReturn === undefined ? {
            id: responseItem.id,
            name: responseItem.name,
            balance: Number(responseItem.balance),
            updatedAt: Date.parse(responseItem.updated_at)
        } : propertiesToReturn.reduce((accumulator,key) => {
            if(key == 'balance') {
                accumulator[key] = Number(responseItem[structure[key]])
            }
            else if(key == 'updateAt') {
                accumulator[key] = Date.parse(responseItem[structure[key]])
            }
            else {
                accumulator[key] = responseItem[structure[key]]
            }
            return accumulator
        }, {})
    }
}