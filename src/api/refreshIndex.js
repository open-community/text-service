// ============================================================
// Import modules
import { Text } from '../models';

// ============================================================
// Functions
async function refreshIndex(req, res) {
    await Text.refreshIndex();
    res.status(200).send();
}

// ============================================================
// Exports
export default refreshIndex;
