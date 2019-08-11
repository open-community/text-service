// ============================================================
// Import packages
import { api, ResourceType } from '@open-community/service-tools';

// ============================================================
// Import modules
import { Text } from '../models';

// ============================================================
// Functions
async function deleteText(req, res) {
    const [parameters, errors] = getParameters(req);

    if (errors.length) {
        res.status(400).json(errors);
        return;
    }

    const id = api.getResourceId(parameters.id);

    await Text.delete(id);

    res.status(200).send();
}


function getParameters(req) {
    const { id } = req.params;

    // Parameter: id
    const errors = api.isValidApiId(id, ResourceType.TEXT)
        ? []
        : [new api.errors.InvalidApiIdError({ apiId: id })];

    return [
        {
            id,
        },
        errors,
    ];
}

// ============================================================
// Exports
export default deleteText;
