// ============================================================
// Import modules
import { Account } from '../models';
import {
    getAccountIdFromApiId,
    dbAccountToApi,
} from './helpers';

// ============================================================
// Errors

const API_ERRORS = {
    INVALID_ID: 'Invalid ID',
};

// ============================================================
// Functions
async function getAccount(req, res) {
    const { id: apiId } = req.params;

    const id = getAccountIdFromApiId(apiId);

    if (!id) {
        const errors = {
            code: 'INVALID_ID',
            error: API_ERRORS.INVALID_ID,
        };

        res.status(400).json(errors);
        return;
    }

    const dbAccount = await Account.findOne({ id });

    if (!dbAccount) {
        res.status(404).send();
        return;
    }

    res.status(200).send(dbAccountToApi(dbAccount));
}

// ============================================================
// Exports
export default getAccount;
