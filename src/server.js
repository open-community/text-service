// ============================================================
// Import packages
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

// ============================================================
// Import modules
import declareRoutes from './api';
import { client } from './models';

// ============================================================
// Functions

async function initialize({
    port,
    host,
    env,
}) {
    dotenv.config(env);
    const app = express();

    app.use(express.json()); // for parsing application/json
    app.use(bodyParser.json());

    declareRoutes(app);

    await client.initialize({
        host: 'localhost:9200',
        log: 'trace',
    });

    app.listen(
        port,
        host,
        () => console.log(`Service started on port ${port}!`),
    );
}

// ============================================================
// Exports
export {
    initialize,
};
