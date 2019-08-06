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

// ============================================================
// Exports
export {
    isTextEqual,
};
