/* eslint-env node, mocha */

// ============================================================
// Import packages
import chai from 'chai';
import chaiJestSnapshot from 'chai-jest-snapshot';
import { setupConfig } from './setup';

// ============================================================
// Module's variables and constants
chai.use(chaiJestSnapshot);

before(() => {
    setupConfig();
    chaiJestSnapshot.resetSnapshotRegistry();
});

beforeEach(function beforeEach() {
    chaiJestSnapshot.configureUsingMochaContext(this);
});
