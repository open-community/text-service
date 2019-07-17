// ============================================================
// Import packages
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

// ============================================================
// Import modules
import declareRoutes from './api';

// ============================================================
// Functions

function initialize({
    port,
    host,
    env,
}) {
    dotenv.config(env);
    const app = express();

    app.use(bodyParser.json());

    declareRoutes(app);

    mongoose.connect(
        process.env.DB_CONNECTION,
        { useNewUrlParser: true },
    );

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
