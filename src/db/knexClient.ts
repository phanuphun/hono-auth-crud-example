import knex from 'knex';
import 'dotenv/config';

const knexConn = knex({
    client: process.env.DB_DRIVER,
    connection: {
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT!,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
});


export default knexConn;
