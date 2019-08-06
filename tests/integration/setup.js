// ============================================================
// Import packages
import _ from 'lodash';

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
            text: process.env.TEXT_SERVICE,
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
        return _.cloneDeep(_.at(configuration, path));
    }

    return _.cloneDeep(configuration);
}

// ============================================================
//
export {
    getConfig,
    setupConfig,
};
