#!/usr/bin/env node
const { initialize } = require('./server');

require('yargs') // eslint-disable-line no-unused-expressions
    .usage('$0 start')
    .command('start', 'Display hello message', (yargs) => {
        yargs.options({
            port: {
                default: 3000,
                describe: 'Port of the service',
                type: 'number',
            },

            hostname: {
                default: '0.0.0.0',
                describe: 'Hostname listen by the service',
                type: 'string',
            },
        });
    }, (argv) => {
        initialize(argv);
    })
    .help()
    .argv;
