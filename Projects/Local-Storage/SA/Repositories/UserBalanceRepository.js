/**
 * @typedef {Object} DbUserBalance
 * @property {string} id
 * @property {string} name
 * @property {number} balance
 * @property {Date} updated_at
 */

/**
 * @typedef {{
 *   id: string,
 *   balance: number,
 *   name: string,
 *   updateAt: Date
 * }} UserItem
 */

/**
 * @param {import('../Internal/DbContext').DbContext} dbContext
 */
exports.newUserBalanceRepository = function newUserBalanceRepository(dbContext) {
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
    const TABLE_NAME = 'user_balances'
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
            type: 'BIGINT',
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
     * 
     * @returns {import('knex').knex.QueryBuilder<DbUserBalance,{}>}
     */
    function _getTableContext() {
        return dbContext.getTableContext(TABLE_NAME)
    }

    /**
     * @returns {Promise<void>}
     */
    async function intialize() {
        return new Promise.resolve()
    }

    /**
     * @param {UserItem} item
     * @returns {Promise<string>} item ID
     */
    async function saveItem(item) {
        return await new Promise(res => {
            const result = _getTableContext().insert({
                    id: item.id,
                    name: item.name,
                    balance: item.balance,
                    updated_at: item.updateAt,
                }).returning('id')
            res(result)
        })
    }

    /**
     * @param {UserItem[]} items
     * @returns {Promise<string[]>} list of items IDs
     */
    async function saveAll(items) {
        const values = items.map(item => `(${item.id}, ${item.name}, ${item.balance}, ${item.updateAt})`).join(',')
        const query = `
        INSERT INTO ${TABLE_NAME}(${structure.id.name}, ${structure.name.name}, ${structure.balance.name}, ${structure.updateAt.name}) 
        VALUES ${values}
        RETURNING ${structure.id.name}`
        return await dbContext.execute(query)
    }

    /**
     * @param {{
     *   key: string,
     *   value: any
     * }} item 
     * @returns {Promise<number>}
     */
    async function deleteItem(item) {
        const where = `${structure[item.key]} = ${item.value}`
        const query = `DELETE FROM ${TABLE_NAME} WHERE ${where}`
        return await dbContext.execute(query)
    }

    /**
     * @returns {Promise<void>}
     */
    async function deleteAll() {
        return await dbContext.execute(`TRUNCATE TABLE ${TABLE_NAME}`)
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
            ? propertiesToReturn.map(key => structure[key].name).join(',')
            : '*'
        const where = `${structure[item.key]} = ${item.value}`
        const query = `SELECT ${properties} FROM ${TABLE_NAME} WHERE ${where} LIMIT 1`
        return await dbContext.execute(query)
    }

    /**
     * NOTE: currenlty returns all items as filters have not been implemented yet
     * @param {{
     *   key: string,
     *   values: []
     * }} items 
     * @returns {Promise<UserItem[]>}
     */
    async function findMany(items) {
        const properties = propertiesToReturn !== undefined && propertiesToReturn.length > 0 
            ? propertiesToReturn.map(key => structure[key].name).join(',')
            : '*'
        const where = '' /* needs some consideration */ // 'WHERE ' + items.map( item => `${structure[item.key]} = ${item.value}`).join(' AND ')
        const query = `SELECT ${properties} FROM ${TABLE_NAME} ${where}`
        return await dbContext.execute(query)
    }

}