// ============================================================
// Import modules

import {
    checkPassword,
    getAccountIdFromApiId,
} from './helpers';

import {
    ApiErrors,
    buildError,
} from './errors';

import { Account } from '../models';

// ============================================================
// Functions

async function checkAccountPassword(req, res) {
    const { password } = req.body;

    const { id: apiId } = req.params;

    const id = getAccountIdFromApiId(apiId);

    let errors = [];

    if (!id) {
        errors.push(
            buildError(ApiErrors.INVALID_ID, 'id'),
        );
    }

    errors = [
        ...errors,
        ...checkPassword(password).map(code => buildError(code, 'password')),
    ];

    if (errors.length) {
        res.status(400).json(errors);
        return;
    }

    // Checking that the account exists is not already used
    const dbAccount = await Account.findOne({ id });

    // Account exists
    if (!dbAccount) {
        res.status(404).send();
        return;
    }

    // Account lock
    if (dbAccount.isPasswordCheckLocked()) {
        res.status(403).send();
        return;
    }

    const status = await dbAccount.arePasswordEqual(password)
        ? 200
        : 401;

    res.status(status).send();
}

// ============================================================
// exports
export default checkAccountPassword;
