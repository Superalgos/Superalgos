/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema
        .createTable('users', function (table) {
            table.string('id', 36).notNullable().primary();
            table.string('name', 255).notNullable().index();
            table.decimal('balance', 32, 8).notNullable();
            table.timestamp('updated_at').notNullable();
        })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema
        .dropTable("users");
};
