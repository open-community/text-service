// ============================================================
// Import packages
import { Schema } from 'mongoose';

// ============================================================
// Import modules

import { AccountLockedError } from '../errors';

import {
    NB_PASSWORD_CHECK_BEFORE_LOCK,
    PASSWORD_LOCK_DURATION,
} from '../constants';

import {
    generateAccountId,
    generatePasswordSalt,
    hashPassword,
} from '../helpers';

const LockReasons = {
    PASSWORD_FAILED_ATTEMPTS: 'PASSWORD_FAILED_ATTEMPTS',
    MANUAL: 'MANUAL',
};

// ============================================================
// Schema
const AccountSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },

    login: {
        type: String,
        required: true,
    },

    auth: {
        hash: {
            type: String,
        },

        salt: {
            type: String,
        },

        nbInvalidChecks: {
            type: Number,
            default: 0,
        },

        lastCheckDate: Date,
    },

    lock: {
        date: Date,
        reason: {
            type: ['string'],
            enum: Object.values(LockReasons),
        },
    },

    deletionDate: Date,
    creationDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

// ============================================================
// Methods

/**
 * Indicate if the account is locked or not.
 * @public
 */
AccountSchema.methods.isPasswordCheckLocked = function isPasswordCheckLocked() {
    return this.auth.nbInvalidChecks >= NB_PASSWORD_CHECK_BEFORE_LOCK
           && this.auth.lastCheckDate.getTime() + PASSWORD_LOCK_DURATION > Date.now();
};

/**
 * Indicate if the given password match the account password
 * @public
 */
AccountSchema.methods.arePasswordEqual = async function arePasswordEqual(password) {
    if (this.isPasswordCheckLocked()) {
        throw new AccountLockedError();
    }

    this.auth.lastCheckDate = new Date();

    if (this.auth.nbInvalidChecks >= NB_PASSWORD_CHECK_BEFORE_LOCK) {
        this.auth.nbInvalidChecks = 0;
    }

    let isEqual;
    if (!this.auth.hash) {
        isEqual = false;
    }
    else {
        const hash = await hashPassword(password, this.auth.salt);
        isEqual = hash === this.auth.hash;
    }

    // Updating the attempt number
    this.auth.nbInvalidChecks = isEqual
        ? 0
        : this.auth.nbInvalidChecks + 1;

    await this.save();

    return isEqual;
};

/**
 * Update the account password.
 * The document will not be saved.
 * @param {string} password - New account password.
 * @public
 */
AccountSchema.methods.updatePassword = async function updatePassword(password) {
    const salt = generatePasswordSalt();
    const hash = await hashPassword(password, salt);

    this.auth.hash = hash;
    this.auth.salt = salt;
};

/**
 * Unlock the account by setting the number of invalid attempts to 0.
 * The document will not be saved.
 * @public
 */
AccountSchema.methods.unlock = async function unlock() {
    this.auth.nbInvalidChecks = 0;
};

// ============================================================
// Statisc
/**
 * Create a new account.
 * @public
 */
AccountSchema.statics.createAccount = async function createAccount({
    login,
    password,
}) {
    const account = await this.create({
        id: generateAccountId(),
        login,
        auth: {
            nbInvalidChecks: 0,
        },
    });

    await account.updatePassword(password);

    return account;
};

// ============================================================
// Exports
export default AccountSchema;
