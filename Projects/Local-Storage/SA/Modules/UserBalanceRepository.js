/**
 * @typedef {{
 *   id: string,
 *   balance: number,
 *   name: string,
 *   updateAt: Date
 * }} UserItem
 */

exports.newUserBalanceRepository = function newUserBalanceRepository() {
    const thisObject = {
        TABLE_NAME: () => 'user-balances',
        intialize: intialize,
        saveItem: saveItem,
        saveAll: saveAll,
        deleteItem: deleteItem,
        deleteAll: deleteAll,
        findItem: findItem,
        findMany: findMany,
    }

    /**
     * @type {import('../Globals/DbContext').DbContext}
     */
    let thisDbContext = undefined
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
     * @param {import('../Globals/DbContext').DbContext} dbContext
     * @returns {Promise<void>}
     */
    async function intialize(dbContext) {
        thisDbContext = dbContext
        await createTable()
    }

    async function createTable() {
        const columns = Object.keys(structure)
            .map(key => `${structure[key].name} ${structure[key].type} ${structure[key].params.join(' ')}`)
            .join(',')
        const query = `CREATE TABLE [IF NOT EXISTS] ${thisObject.TABLE_NAME()} (${columns});`
        await thisDbContext.execute(query)
    }

    /**
     * @param {UserItem} item
     * @returns {Promise<string>} item ID
     */
    async function saveItem(item) {
        const query = `
        INSERT INTO ${thisObject.TABLE_NAME()}(${structure.id.name}, ${structure.name.name}, ${structure.balance.name}, ${structure.updateAt.name}) 
        VALUES (${item.id}, ${item.name}, ${item.balance}, ${item.updateAt})
        RETURNING ${structure.id.name}`
        return await thisDbContext.execute(query)
    }

    /**
     * @param {UserItem[]} items
     * @returns {Promise<string[]>} list of items IDs
     */
    async function saveAll(items) {
        const values = items.map(item => `(${item.id}, ${item.name}, ${item.balance}, ${item.updateAt})`).join(',')
        const query = `
        INSERT INTO ${thisObject.TABLE_NAME()}(${structure.id.name}, ${structure.name.name}, ${structure.balance.name}, ${structure.updateAt.name}) 
        VALUES ${values}
        RETURNING ${structure.id.name}`
        return await thisDbContext.execute(query)
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
        const query = `DELETE FROM ${thisObject.TABLE_NAME()} WHERE ${where}`
        return await thisDbContext.execute(query)
    }

    /**
     * @returns {Promise<void>}
     */
    async function deleteAll() {
        return await thisDbContext.execute(`TRUNCATE TABLE ${thisObject.TABLE_NAME()}`)
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
        const query = `SELECT ${properties} FROM ${thisObject.TABLE_NAME()} WHERE ${where} LIMIT 1`
        return await thisDbContext.execute(query)
    }

    /**
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
        const where = '' /* needs some consideration */ // `${structure[item.key]} = ${item.value}`
        const query = `SELECT ${properties} FROM ${thisObject.TABLE_NAME()} WHERE ${where}`
        return await thisDbContext.execute(query)
    }

}