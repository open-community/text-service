// ============================================================
// Import modules

import {
    checkLogin,
    checkPassword,
    dbAccountToApi,
} from './helpers';

import { ApiErrors, buildError } from './errors';

import { Account } from '../models';

// ============================================================
// Functions

async function createAccount(req, res) {
    const { login, password } = req.body;

    const errors = [
        ...checkLogin(login).map(code => buildError(code, 'login')),
        ...checkPassword(password).map(code => buildError(code, 'password')),
    ];

    if (errors.length) {
        res.status(400).json(errors);
        return;
    }

    // Checking that the login is not already used
    const nbAccounts = await Account.countDocuments({
        login,
        deletionDate: null,
    });

    if (nbAccounts > 0) {
        const apiErrors = [
            buildError(ApiErrors.LOGIN_ALREADY_USED, 'login'),
        ];

        res.status(400).json(apiErrors);
        return;
    }

    const account = await Account.createAccount({
        login,
        password,
    });

    await account.save();

    res.status(200).json(dbAccountToApi(account));
}

// ============================================================
// exports
export default createAccount;
