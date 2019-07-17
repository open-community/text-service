// ============================================================
// Import modules
import { Account } from '../models';
import {
    getAccountIdFromApiId,
    checkLogin,
    dbAccountToApi,
} from './helpers';

import {
    ApiErrors,
    buildError,
} from './errors';

// ============================================================
// Functions
async function updateAccount(req, res) {
    const { id: apiId } = req.params;

    const id = getAccountIdFromApiId(apiId);
    const { login } = req.body;

    // Checking errors
    let errors = [];
    if (!id) {
        errors.push(
            buildError(ApiErrors.INVALID_ID, 'id'),
        );
    }

    if (login) {
        errors = [
            ...errors,
            ...checkLogin(login).map(code => buildError(code, 'login')),
        ];
    }
    else {
        errors.push(buildError(ApiErrors.INVALID_REQUEST, null, 'Cannot set login to null'));
    }

    if (errors.length) {
        res.status(400).json(errors);
        return;
    }

    const existingAccount = await Account.findOne({ login });

    if (existingAccount && existingAccount.id !== id) {
        res.status(400)
            .json(
                [buildError(ApiErrors.LOGIN_ALREADY_USED)],
            );

        return;
    }

    // Updating
    const oldAccount = await Account.findOneAndUpdate(
        { id },
        { login },
    );

    if (!oldAccount) {
        res.status(404).send();
        return;
    }

    res.status(200).json(dbAccountToApi(oldAccount));
}

// ============================================================
// Exports
export default updateAccount;
