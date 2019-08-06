// ============================================================
// Import packages
import crypto from 'crypto';
import util from 'util';
import base64url from 'base64url';
import { Client } from 'elasticsearch';
import _ from 'lodash';

import cryptoRandomString from 'crypto-random-string';

import { BASE64_REGEXP } from './constants';

// ============================================================
// Module's constants and variables
const pbkdf2 = util.promisify(crypto.pbkdf2);

// ============================================================
// Functions

function checkDates(datesString) {
    const invalidDates = [];

    const dates = datesString.map((dateString) => {
        if (!dateString) {
            return null;
        }

        const date = new Date(dateString);


        if (Number.isNaN(date.getTime())) {
            invalidDates.push(dateString);
            return null;
        }

        return date;
    });

    return [
        dates,
        _.uniq(invalidDates),
    ];
}

function getClient() {
    return new Client({ node: 'http://localhost:9200' });
}

/**
 * Generate a base64 account ID.
 */
function generateAccountId() {
    const string = cryptoRandomString({
        length: 16,
        type: 'url-safe',
    });

    return base64url.encode(string);
}

/**
 * Generate a base64 password salt.
 */
function generatePasswordSalt() {
    const string = cryptoRandomString({
        length: 128,
        type: 'base64',
    });

    return base64url.fromBase64(string);
}

/**
 * Hash the given password with the salt.
 * @param {string} password
 * @param {string} salt
 */
async function hashPassword(password, salt) {
    const buffer = await pbkdf2(
        password,
        salt,
        1000, // iteration_count
        128, // key length
        'sha256', // digest
    );

    return buffer.toString('base64');
}

/**
 * Indicate if the given string is a valid base64 string or not.
 * @param {*} string
 * @returns {boolean}
 */
function isValidBase64(string) {
    return BASE64_REGEXP.test(string);
}

// ============================================================
// Exports
export {
    checkDates,
    getClient,
    generateAccountId,
    generatePasswordSalt,
    hashPassword,
    isValidBase64,
};
