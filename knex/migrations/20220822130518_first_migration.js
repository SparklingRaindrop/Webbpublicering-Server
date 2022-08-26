/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function up(knex) {
    const userTable = knex.schema.hasTable('User').then(function(exists) {
        if (!exists) {
            return knex.schema.createTable('User', function(table) {
                table.string('id').primary();
                table.string('name').notNullable();
                table.integer('current_room_id').notNullable();
                table.foreign('current_room_id').references('Room.id');
            })
        }
    });

    const roomTable = knex.schema.hasTable('Room')
        .then(function(exists) {
            if (!exists) {
                return knex.schema.createTable('Room', function(table) {
                    table.increments('id').primary();
                    table.string('name').notNullable().unique();
                    table.string('password');
                })
            }
        });

    const  messageTable = knex.schema.hasTable('Message').then(function(exists) {
        if (!exists) {
            return knex.schema.createTable('Message', function(table) {
                table.increments('id').primary();
                table.text('content').notNullable();
                table.string('sender').notNullable();
                table.string('sender_name').notNullable();
                table.string('receiver');
                table.integer('room_id');
                table.timestamp('timestamp').defaultTo(knex.fn.now());
                table.foreign('room_id').references('Room.id').onDelete('CASCADE');
            })
        }
    });

    return Promise
        .all([userTable, roomTable, messageTable])
        .then(() => {
            return knex('Room')
            .whereNotExists(() => {
                knex('Room').where({
                    id: 1,
                    name: 'lobby'
                });
            })
            .insert({
                    name: 'lobby'
                });
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('User'),
        knex.schema.dropTable('Room'),
        knex.schema.dropTable('Message')
    ]);
};
