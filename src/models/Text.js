// ============================================================
// Import modules
import { getClient } from './client';
import { ELASTICSEARCH_INDEX } from '../constants';

// ============================================================
// Module's constants and variables
const DOCUMENT_TYPE = '@open-community/type/text';

// ============================================================
// Functions

async function deleteText(id, storeParameters = {
    refreshIndex: true,
}) {
    await getClient().delete({
        id,
        type: DOCUMENT_TYPE,
        index: ELASTICSEARCH_INDEX,
        refresh: storeParameters.refreshIndex,
    });
}

/**
 * Elasticsearch search parameters
 * @param {Object} params
 * @public
 */
async function findText(params) {
    const texts = await getClient().search({
        body: params,
        type: DOCUMENT_TYPE,
        index: ELASTICSEARCH_INDEX,
    });

    return texts;
}


/**
 * Return a text.
 * If not text found, return undefined.
 * @param {ID} id
 * @returns {Text}
 * @public
 */
async function get(id) {
    try {
        const { _source: text } = await getClient().get({
            id,
            type: DOCUMENT_TYPE,
            index: ELASTICSEARCH_INDEX,
        });

        return {
            id,
            ...text,
        };
    }
    catch (err) {
        if (err.status === 404) {
            return undefined;
        }
        throw err;
    }
}

/**
 * Create a new text.
 * @param {Text} text
 * @param {Object} storeParameters
 * @returns {Id} ID of the created text
 * @public
 */
async function createText(text, store = {
    refreshIndex: true,
}) {
    const { _id } = await getClient().index({
        body: text,
        index: ELASTICSEARCH_INDEX,
        type: DOCUMENT_TYPE,
        refresh: store.refreshIndex,
    });

    return _id;
}

// ============================================================
// Exports
export {
    createText as create,
    deleteText as delete,
    findText as find,
    get,
};
