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
     * @returns {Promise<void>}
     */
    async function intialize() {
        await migrate()
    }

    async function migrate() {

        if(!await dbContext.doesTableExist(TABLE_NAME)) {
            SA.logger.info('Will now create the table')
            return await dbContext.createTable(TABLE_NAME, structure)
        }
        SA.logger.info('Table already exists will now check column matches')
        if(!await dbContext.doColumnsMatch(TABLE_NAME, structure)) {
            SA.logger.info('Table structure has changed and needs migrating')
            process.exit(0)
        }
        SA.logger.info('Table structure is unchanged, nothing to do')
        process.exit(0)
    }

    /**
     * @param {UserItem} item
     * @returns {Promise<string>} item ID
     */
    async function saveItem(item) {
        const query = `
        INSERT INTO ${TABLE_NAME}(${structure.id.name}, ${structure.name.name}, ${structure.balance.name}, ${structure.updateAt.name}) 
        VALUES (${item.id}, ${item.name}, ${item.balance}, ${item.updateAt})
        RETURNING ${structure.id.name}`
        return await dbContext.execute(query)
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