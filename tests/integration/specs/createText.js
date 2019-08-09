/* eslint-env node, mocha */

// ============================================================
// Import packages
import { assert } from 'chai';
import faker from '@open-community/faker';
import Client, { Services } from '@open-community/internal-client';
import * as tools from '@open-community/service-tools';

import { isTextEqual } from '../helpers';
import { getConfig } from '../setup';

// ============================================================
// Tests
describe('Simple situation', () => {
    let client;
    let resources;

    before(() => {
        client = new Client({
            [Services.TEXT]: getConfig('services.text'),
        });

        resources = {
            accounts: {
                A: 'A',
            },

            identities: {
                A: 'A',
            },
        };
    });

    it('create a text', async () => {
        const textToCreate = faker.text.generate({
            authors: [{ account: resources.accounts.A, identity: resources.identities.A }],
            includeId: false,
            owners: [resources.accounts.A],
        });

        // Create text
        const createdText = await client.text.create(textToCreate);
        const { id } = createdText;

        assert.isTrue(tools.api.isValidApiId(id));

        const idParse = tools.api.parseApiId(id);
        assert.equal(
            idParse.type,
            tools.ResourceType.TEXT,
            'ApiId match a text resource',
        );

        assert.isTrue(
            isTextEqual(createdText, { id, ...textToCreate }),
            'Both texts must equal',
        );

        // Get text
        const getText = await client.text.get({ id });
        assert.isTrue(
            isTextEqual(getText, createdText),
            'Created text is equal to fetched text',
        );

        // Find text
        const findedText = await client.text.find({ id });

        assert.isArray(
            findedText,
            'Find must return an array',
        );
        assert.equal(
            findedText.length,
            1,
            'Only one text found',
        );

        assert.isTrue(
            isTextEqual(findedText, createdText[0]),
            'Created text is equal to finded text',
        );

        // Delete text
        await client.text.delete({ id });

        const getDeletedText = await client.text.get({ id });
        assert.isUndefined(getDeletedText);
    });
});
