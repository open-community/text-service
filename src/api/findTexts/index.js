/* eslint-disable arrow-parens */

import { api, ResourceType } from '@open-community/service-tools';

// ============================================================
// Import modules
import { getParameters } from './parameters';
import { buildSearch } from './search';
import { Text } from '../../models';

// ============================================================
// Route
async function findTexts(req, res) {
    const [queryParameters, errors] = getParameters(req);

    if (errors.length) {
        res.status(400).json(errors);
        return;
    }

    const search = buildSearch(queryParameters);

    const results = await Text.find(search);

    const texts = results.hits.hits.map(({ _id: id, _source: source }) => ({
        id: api.toApiId(ResourceType.TEXT, id),
        ...source,
    }));

    res.json(texts);
}

// ============================================================
// Exports
export default findTexts;
