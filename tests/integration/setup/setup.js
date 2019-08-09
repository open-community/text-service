// ============================================================
// Import packages
import dotenv from 'dotenv';
import _ from 'lodash';

dotenv.config();

// ============================================================
//  Module's constants and variables
let configuration;

// ============================================================
// Functions
/**
 * Setup the configuration
 * @public
 */
function setupConfig() {
    if (configuration) {
        throw new Error('Configuration already defined');
    }

    configuration = {
        services: {
            text: process.env.TEXT_SERVICE || 'http://localhost:3000',
        },
    };
}

/**
 * Return the configuration, or part of it
 * @param {string} [path] - Path of the configuration information to return
 * @returns {*}
 * @public
 */
function getConfig(path) {
    if (path) {
        console.log('configuration', configuration);
        console.log('path:', path);
        console.log('result', _.at(configuration, path));
        return _.cloneDeep(_.at(configuration, path)[0]);
    }

    return _.cloneDeep(configuration);
}

// ============================================================
//
exports.getConfig = getConfig;
exports.setupConfig = setupConfig;
