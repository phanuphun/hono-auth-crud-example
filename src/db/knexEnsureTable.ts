import knexConn from './knexClient.js';

export async function ensureUserTableExists() {
    const exists = await knexConn.schema.hasTable('users');
    if (!exists) {
        await knexConn.schema.createTable('users', (table) => {
            table.increments('index');
            table.uuid('id').unique();
            table.string('username').notNullable().unique();
            table.string('passwordHash').notNullable();
            table.string('avatar').notNullable();
            table.string('firstName').notNullable();
            table.string('lastName').notNullable();
            table.enum('role', ['SystemAdmin', 'ProjectAdmin', 'Customer'])
                .notNullable()
                .defaultTo('Customer');
            table.dateTime('LatestPasswordChanged').defaultTo(knexConn.fn.now());
            table.dateTime('lastLoginAt').defaultTo(knexConn.fn.now());
            table.dateTime('createdAt').defaultTo(knexConn.fn.now());
            table.dateTime('updatedAt').defaultTo(knexConn.fn.now());
        });

        console.log('User table created');
    }
}



