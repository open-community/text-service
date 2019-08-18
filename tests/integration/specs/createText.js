/* eslint-env node, mocha */

// ============================================================
// Import packages
import { assert } from 'chai';
import faker from '@open-community/faker';
import Client, { errors, Services } from '@open-community/internal-client';
import * as tools from '@open-community/service-tools';

import { getConfig, ResourceManager } from '../setup';
import { loadAll } from '../helpers';

// ============================================================
// Tests
describe('Simple situation', () => {
    let client;
    let resources;
    let resourceManager;

    before(() => {
        client = new Client({
            [Services.TEXT]: getConfig('services.text'),
        });

        resourceManager = new ResourceManager(client);

        resources = {
            accounts: {
                A: 'A',
            },

            identities: {
                A: 'A',
            },
        };
    });

    after(async () => {
        await resourceManager.clean();
    });

    it('create a text', async () => {
        const textToCreate = faker.text.generate({
            authors: [{ account: resources.accounts.A, identity: resources.identities.A }],
            includeId: false,
            owners: [resources.accounts.A],
        });

        // Create text
        const { id } = await client.text.create(textToCreate);
        resourceManager.add(id);

        assert.isTrue(
            tools.api.isValidApiId(id),
            'receive a valid API ID',
        );

        const idParse = tools.api.parseApiId(id);
        assert.equal(
            idParse.type,
            tools.ResourceType.TEXT,
            'apiId match a text resource',
        );

        // Get text
        const getText = await client.text.get(id);
        assert.deepEqual(
            getText,
            { id, ...textToCreate },
            'Created text is equal to fetched text',
        );

        let findedTextIterator;
        // Find text
        try {
            findedTextIterator = client.text.find({ id });
        }
        catch (err) {
            console.log('findedTextIterator =====');
            console.error(err);
            throw err;
        }
        
        let findedText;
        try {
            findedText = await loadAll(findedTextIterator);
        }
        catch (err) {
            console.log('findedText =====');
            console.error(err);
            throw err;
        }

        assert.isArray(
            findedText,
            'Find must return an array',
        );

        assert.equal(
            findedText.length,
            1,
            'Only one text found',
        );

        assert.deepEqual(
            findedText[0],
            { id, ...textToCreate },
            'Created text is equal to finded text',
        );

        // Delete text
        await client.text.delete(id);

        const getDeletedText = await client.text.get(id);
        assert.isUndefined(getDeletedText);
    });

    describe('throw an error if invalid data', () => {
        const assertCreateError = async (text, message) => {
            let error;

            try {
                await client.text.create(text);
            }
            catch (err) {
                error = err;
            }

            assert.instanceOf(error, errors.http.ClientError, message);
        };

        it('throw an error if invalid author\'s account', async () => {
            const textToCreate = faker.text.generate({
                authors: [{ account: resources.accounts.A, identity: resources.identities.A }],
                includeId: false,
                owners: [resources.accounts.A],
            });

            textToCreate.authors[0].account = `x${textToCreate.authors[0].account}`;

            await assertCreateError(textToCreate);
        });

        it('throw an error if invalid author\'s identity', async () => {
            const textToCreate = faker.text.generate({
                authors: [{ account: resources.accounts.A, identity: resources.identities.A }],
                includeId: false,
                owners: [resources.accounts.A],
            });

            textToCreate.authors[0].identity = `x${textToCreate.authors[0].identity}`;

            await assertCreateError(textToCreate);
        });

        it('throw an error if invalid owner', async () => {
            const textToCreate = faker.text.generate({
                authors: [{ account: resources.accounts.A, identity: resources.identities.A }],
                includeId: false,
                owners: [resources.accounts.A],
            });

            textToCreate.owners[0] = `x${textToCreate.owners[0]}`;

            await assertCreateError(textToCreate);
        });
    });
});
