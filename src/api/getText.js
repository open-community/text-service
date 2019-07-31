// ============================================================
// Import packages
import { api, ResourceType } from '@open-community/service-tools';

// ============================================================
// Import modules
import { Text } from '../models';
import {
    dbTextToApi,
} from './helpers';

// ============================================================
// Functions
async function getText(req, res) {
    const [parameters, errors] = getParameters(req);

    if (errors.length) {
        res.status(400).json(errors);
        return;
    }

    const id = api.getResourceId(parameters.id);

    const dbText = await Text.findOne({ id });

    if (!dbText) {
        res.status(404).send();
        return;
    }

    res.status(200).send(dbTextToApi(dbText));
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
export default getText;
