/* eslint-env node, mocha */

// ============================================================
// Import packages
import async from 'async';
import { assert } from 'chai';
import _ from 'lodash';
import faker from '@open-community/faker';
import Client, { errors, Services } from '@open-community/internal-client';
import * as tools from '@open-community/service-tools';

import { getConfig, ResourceManager } from '../setup';

// ============================================================
// Tests
describe('findText', () => {
    let client;
    let dataset;
    let resourceManager;

    before(async function before() {
        this.timeout(60000);

        client = new Client({
            [Services.TEXT]: getConfig('services.text'),
        });

        dataset = faker.text.Dataset.create({
            includeId: false,
            authors: 120,
            identities: 100,
            accounts: 50,
            owners: 120,
            texts: 100,
        });

        resourceManager = new ResourceManager(client);

        // Creating texts
        await async.eachLimit(
            dataset.texts,
            20,
            async (text) => {
                const { id } = await client.text.create(
                    text,
                    {
                        store: {
                            refreshIndex: false,
                        },
                    },
                );

                // eslint-disable-next-line no-param-reassign
                text.id = id;
                resourceManager.add(id);
            },
        );

        console.log('refresh started');
        await client.text.refreshIndex();
        console.log('refresh ended');
    });

    after(async () => {
        await resourceManager.clean();
    });

    it('find all texts if no parameters provided', async function it() {
        this.timeout(60000);
        console.log('finding...');
        const texts = await client.text.find();
        console.log('found');

        assert.isAtLeast(
            texts.length,
            dataset.texts.length,
            'return at least the same number of created texts',
        );

        console.log('A');

        const ids = texts.maps(({ id }) => id);

        console.log('B');

        assert.equal(
            texts,
            _.uniq(ids),
            'Return uniq texts',
        );

        console.log('C');

        assert.isEmpty(
            _.difference(dataset.texts, texts),
            'All text in dataset have been fetched',
        );

        console.log('D');
    });
});
