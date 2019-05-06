exports.config = {
    capabilities: {
        'browserName': 'phantomjs',
        'phantomjs.binary.path':'./node_modules/phantomjs/bin/phantomjs',
        'phantomjs.ghostdriver.cli.args': ['--loglevel=DEBUG']
    },
    baseUrl: 'http://localhost:8101',
    specs: [
        './tests/e2e-tests/**/*.tests.js'
    ],
    jasmineNodeOpts: {
        isVerbose: true,
    }
};
