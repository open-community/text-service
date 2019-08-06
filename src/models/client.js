// ============================================================
// Import packages
import elasticsearch from 'elasticsearch';

// ============================================================
// Module's constants and variables
/**
 * @type {Elasticsearch.Client}
 */
let client;

// ============================================================
// Functions
async function initialize() {
    client = new elasticsearch.Client({
        host: 'localhost:9200',
        log: 'trace',
    });

    await client.ping({
        requestTimeout: 100,
    });
}



export {
    initialize,
};
