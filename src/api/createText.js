import {
    getInvalidApiIdList,
    getResourceId,
    ResourceType,
} from '@open-community/service-tools';

import {
    ApiErrors,
} from './errors';

// ============================================================
// Import modules
import { getInvalidAccountIdList } from './helpers';

import { Account } from '../models';

// ============================================================
// Functions

async function createText(req, res) {
    const [
        {
            text,
            owners,
        }
        errors,
    ] = getParameters(req);

    if (errors.length) {
        res.status(400).json(errors);
    }


}

/**
 * @param req
 */
function getParameters(req) {
    const {
        owners,
        text,
    } = req.body;

    // Parameter: text
    const textErrors = checkValidText(text);

    // Parameter: owners
    
    const ownersError = getInvalidApiIdList(owners, ResourceType.ACCOUNT);

    return [
        {
            text,
        },
        [
            ...textErrors,
        ],
    ];
}

// ============================================================
// Helpers

/**
 *
 * @param {string} text
 * @returns {boolean}
 */
function checkValidText(text) {
    const errors = [];

    // Ensuring that there is no formatting characters in the text
    if (text.match(/[\n]+/)) {
        errors.push(ApiErrors.INVALID_CHARACTER);
    }

    return errors;
}

// ============================================================
// exports
export default createText;
