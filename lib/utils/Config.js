var extend, os, pick;

module.exports = Config;

extend = require('extend');
os = require('os');
pick = require('lodash.pick');


function Config()
{
    extend(this, {
        simple: false,
        setup: false,
        reset: false,
        concurrency: os.cpus().length - 1,
        commands: ['npm test'],
        'setup-commands': [],
        versions: ['major', '0.12'],
        'base-image': 'debian:stable'
    });
}

Config.parse = function parse()
{
    return (new Config()).parseJson().parseArgs();
};

Config.prototype.parseArgs = function parseArgs()
{
    var args = require('yargs')
        .usage('Usage: $0 [options]')
        .example('$0 -c 3 -v "major" -v "minor | eq 4"', 'Test again all major versions and minor versions of 4. Run 3 concurrently')
        .option('versions', {
            alias: 'v',
            describe: 'Which versions to run.',
            array: true,
            string: true
        })
        .option('concurrency', {
            alias: 'c',
            describe: 'Number of concurrent tests to run.',
            type: 'number'
        })
        .option('commands', {
            alias: 'x',
            describe: 'The commands to run for test.',
            type: 'array'
        })
        .option('simple', {
            alias: 'q',
            describe: 'Run in simple mode. Runs the tests against all versions with very little output. Exit code is equal to the number of failed tests',
            type: 'boolean',
            default: undefined
        })
        .option('setup', {
            describe: 'Run the setup.',
            type: 'boolean',
            default: undefined
        })
        .option('reset', {
            alias: 'r',
            describe: 'When running setup, remove the previous image instead of re-using it.',
            type: 'version'
        })
        .option('setup-commands', {
            alias: 's',
            describe: 'Extra commands to run during setup.',
            type: 'array'
        })
        .option('base-image', {
            alias: 'b',
            describe: 'Base image to build the testing image from. Should be a debian based image (debian, ubuntu, etc).',
            type: 'string'
        })
        .help('h')
        .alias('h', 'help')
        .epilog('View the full documentation at https://github.com/mrkmg/node-docker-test')
        .argv;

    return extend(this, pick(args, ['base-image', 'simple', 'setup', 'reset', 'name', 'concurrency', 'commands', 'setup-commands', 'versions']))
};

Config.prototype.parseJson = function parseJson()
{
    var packageJson, ndtConfig;

    try
    {
        packageJson = require(process.cwd() + '/package.json');
    }
    catch (e)
    {
        throw new Error('Missing the "package.json" file. Is this a NPM project?');
    }

    try
    {
        ndtConfig = packageJson.config.ndt;
    }
    catch (e)
    {
        ndtConfig = {};
    }

    ndtConfig.name = packageJson.name;

    return extend(this, ndtConfig);
};