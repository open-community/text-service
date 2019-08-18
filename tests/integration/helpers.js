// ============================================================
// Import packages
import _ from 'lodash';

// ============================================================
// Functions
/**
 *
 * @param {Text} textA
 * @param {Text} textB
 */
function isTextEqual(textA, textB) {
    return _.isEqual(textA, textB);
}

/**
 * @param {Iterator} iterator
 * @returns {Array}
 */
async function loadAll(iterator) {
    const list = [];
    for await (const item of iterator) {
        list.push(item);
    }

    return list;
}

// ============================================================
// Exports
export {
    isTextEqual,
    loadAll,
};
