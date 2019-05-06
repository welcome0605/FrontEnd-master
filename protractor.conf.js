
var SpecReporter = require('jasmine-spec-reporter').SpecReporter;

let CIRCLECI_TEST_DIR = process.env.CIRCLECI_TEST_DIR; 
exports.config = {
    allScriptsTimeout: 50000,
    directConnect: true,
    baseUrl: 'http://localhost:8000/',
    capabilities: {
        'browserName': 'chrome'
        // 'browserName': 'phantomjs',
        // 'phantomjs.binary.path': require('phantomjs').path
    },
    chromeOnly: true,
    framework: 'jasmine',
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 50000,
        print: function() {}
    },
    specs: ['./e2e/**/*.e2e-spec.ts'],
    baseUrl: 'http://localhost:8000',
    useAllAngular2AppRoots: true,
    beforeLaunch: function() {
 
        require('ts-node').register({
            project: 'e2e'
        }); 
        
    },
    onPrepare: function() {
        var reporters = require('jasmine-reporters');
        jasmine.getEnv().addReporter(new SpecReporter());
        jasmine.getEnv().addReporter(new reporters.JUnitXmlReporter(CIRCLECI_TEST_DIR + '/test-results.xml', true, true));
    }
}