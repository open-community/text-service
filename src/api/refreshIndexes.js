// ============================================================
// Import modules
import { Text } from '../models';

// ============================================================
// Functions
async function refreshIndexes(req, res) {
    await Text.refreshIndexes();

    res.status(200).send();
}

// ============================================================
// Exports
export default refreshIndexes;
