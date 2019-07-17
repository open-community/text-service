// ============================================================
// Import modules
import { Account } from '../models';
import {
    getAccountIdFromApiId,
    checkPassword,
} from './helpers';

import {
    ApiErrors,
    buildError,
} from './errors';

// ============================================================
// Functions
async function updatePassword(req, res) {
    const { id: apiId } = req.params;

    const id = getAccountIdFromApiId(apiId);
    const { password } = req.body;

    // Checking errors
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

    const account = await Account.findOne({ id });

    if (!account) {
        res.status(404).send();
        return;
    }

    await account.updatePassword(password);
    await account.save();

    res.status(200).send();
}

// ============================================================
// Exports
export default updatePassword;
