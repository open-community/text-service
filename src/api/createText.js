// ============================================================
// Import packages
import {
    api,
    ResourceType,
} from '@open-community/service-tools';

import _ from 'lodash';

// ============================================================
// Import modules

import { Text } from '../models';

// ============================================================
// Functions

async function createText(req, res) {
    const [parameters, errors] = getParameters(req);

    if (errors.length) {
        res.status(400).json(errors);
        return;
    }

    const id = await Text.createText(parameters);

    res.json({
        id: api.toApiId(ResourceType.TEXT, id),
    });
}

/**
 *
 * @param {Request} req
 * @returns {[Object, ApiErrors[]]}
 */
function getParameters(req) {
    // ==============================
    // property: owners
    const owners = (req.body.owners || []).reduce(({ value, errors }, owner, index) => {
        if (!api.isValidApiId(owner, ResourceType.ACCOUNT)) {
            const error = new api.errors.InvalidApiIdError({
                apiId: owner,
                message: `owners[${index}]: Not an account ID`,
            });
            errors.push(error);
        }
        else {
            value.push(owner);
        }

        return { value, errors };
    }, { value: [], errors: [] });

    // ==============================
    // property: authors
    const listAuthors = (req.body.authors || []).reduce(({ value, errors }, author, index) => {
        let valid = true;

        if (!api.isValidApiId(author.account, ResourceType.ACCOUNT)) {
            valid = false;
            const error = new api.errors.InvalidApiIdError({
                apiId: author.account,
                message: `authors[${index}].account: Not an account ID`,
            });
            errors.push(error);
        }

        if (!api.isValidApiId(author.identity, ResourceType.IDENTITY)) {
            valid = false;

            const error = new api.errors.InvalidApiIdError({
                apiId: author.account,
                message: `authors[${index}].identity: Not an identity ID`,
            });
            errors.push(error);
        }

        if (valid) {
            value.push(author);
        }

        return { value, errors };
    }, { value: [], errors: [] });

    const authors = {
        value: _.uniqWith(
            listAuthors.value,
            (a, b) => a.account === b.account && a.identity === b.identity,
        ),
        errors: listAuthors.errors,
    };

    // ==============================
    // property: context
    const contexts = (req.body.contexts || []).reduce(({ value, errors }, context, index) => {
        if (!api.isValidApiId(context)) {
            const error = new api.errors.InvalidApiIdError({
                apiId: context,
                message: `contexts[${index}]: Not a valid API ID`,
            });
            errors.push(error);
        }
        else {
            value.push(context);
        }

        return { value, errors };
    }, { value: [], errors: [] });

    return [
        {
            text: req.body.text,
            title: req.body.title,
            formatting: req.body.formatting,
            owners: owners.value,
            authors: authors.value,
            contexts: contexts.value,
        },
        [
            ...authors.errors,
            ...contexts.errors,
            ...owners.errors,
        ],
    ];
}

// ============================================================
// exports
export default createText;
