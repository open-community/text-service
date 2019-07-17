// ============================================================
// Import modules
import { Account } from '../models';
import {
    getAccountIdFromApiId,
} from './helpers';
import { buildError, ApiErrors } from './errors';

// ============================================================
// Functions
async function deleteAccount(req, res) {
    const { id: apiId } = req.params;

    const id = getAccountIdFromApiId(apiId);

    if (!id) {
        const errors = buildError(ApiErrors.INVALID_ID, 'id');

        res.status(400).json(errors);
        return;
    }

    await Account.deleteOne({ id });

    res.status(200).send();
}

// ============================================================
// Exports
export default deleteAccount;
