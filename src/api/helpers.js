import base64url from 'base64url';
import { isValidBase64 } from '../helpers';
import {
    MIN_LOGIN_SIZE,
    MIN_PASSWORD_SIZE,
    MAX_LOGIN_SIZE,
    MAX_PASSWORD_SIZE,
    LOGIN_VALIDATION_REGEXP,
} from '../constants';

import { ApiErrors } from './errors';

// ============================================================
// Module's constants and variables
const API_ID_REGEXP = /^([a-zA-Z0-9-_:]+):([a-zA-Z0-9-_]+)$/;
const ACCOUNT_TYPE_CODE = 'account';
const IDENTITY_TYPE_CODE = 'identity';
const TEXT_TYPE_CODE = 'text';

// ============================================================
// Functions

/**
 * Filter a list of string and return all elements that are not valid Api ID
 * @param {string[]} list
 * @returns {Array.<id: string[], invalidApiId: string[]>}
 * @private
 */
function getInvalidApiIdList(list) {
    return list.filter(apiID => !isValidApiId(apiID));
}

/**
 * Filter a list of string and return all elements that are not valid Account ID
 * @param {string[]} list
 * @returns {Array.<id: string[], invalidApiId: string[]>}
 * @private
 */
function getInvalidAccountIdList(list) {
    return list.filter(apiID => !getAccountIdFromApiId(apiID));
}

/**
 * Filter a list of string and return all elements that are not valid Identity ID
 * @param {string[]} list
 * @returns {Array.<id: string[], invalidApiId: string[]>}
 * @private
 */
function getInvalidIdentityIdList(list) {
    return list.filter(apiID => !getIdentityIdFromApiId(apiID));
}

/**
 * Filter a list of string and return all elements that are not valid Identity ID
 * @param {string[]} list
 * @returns {Array.<id: string[], invalidApiId: string[]>}
 * @private
 */
function getInvalidTextIdList(list) {
    return list.filter(apiID => !getTextIdFromApiId(apiID));
}

/**
 *
 * @param {Account} account
 * @returns {Object}
 */
function dbAccountToApi({
    id,
    login,
    creationDate,
    deletionDate,
}) {
    return {
        id: toApiId(id),
        login,
        creationDate,
        deletionDate,
    };
}

/**
 * Return the real account ID from an API ID.
 * @returns {string}
 */
function getAccountIdFromApiId(id) {
    const info = parsePublicId(id);

    if (!info) {
        return null;
    }

    if (info.type !== ACCOUNT_TYPE_CODE) {
        return null;
    }

    if (!isValidBase64(info.id)) {
        return null;
    }

    return info.id;
}

function isValidApiId(id) {
    const info = parsePublicId(id);

    if (!info) {
        return false;
    }

    if (!info.type) {
        return false;
    }

    if (!isValidBase64(info.id)) {
        return false;
    }

    return info.id;
}

/**
 * Return the real account ID from an API ID.
 * @returns {string}
 */
function getIdentityIdFromApiId(id) {
    const info = parsePublicId(id);

    if (!info) {
        return null;
    }

    if (info.type !== IDENTITY_TYPE_CODE) {
        return null;
    }

    if (!isValidBase64(info.id)) {
        return null;
    }

    return info.id;
}

/**
 * Return the real account ID from an API ID.
 * @returns {string}
 */
function getTextIdFromApiId(id) {
    const info = parsePublicId(id);

    if (!info) {
        return null;
    }

    if (info.type !== TEXT_TYPE_CODE) {
        return null;
    }

    if (!isValidBase64(info.id)) {
        return null;
    }

    return info.id;
}

/**
 * Parse a public ID and return it's type and real id
 * @param {string} apiId
 * @returns {{type: string, id: string}}
 * @public
 */
function parsePublicId(apiId) {
    const decoded = base64url.decode(apiId);

    const match = decoded.match(API_ID_REGEXP);

    if (!match) {
        return null;
    }

    return {
        type: match[1],
        id: match[2],
    };
}

/**
 * Transform an account ID to it's API equivalent
 * @param {string} id
 * @public
 */
function toApiId(id) {
    return base64url.encode(`${ACCOUNT_TYPE_CODE}:${id}`);
}

// ============================================================
// Exports
export {
    dbAccountToApi,
    getAccountIdFromApiId,
    getInvalidAccountIdList,
    getInvalidIdentityIdList,
    getInvalidTextIdList,
    getTextIdFromApiId,
    getInvalidApiIdList,
    toApiId,
};
