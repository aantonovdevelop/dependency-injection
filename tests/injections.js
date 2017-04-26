const assert = require('assert');

const injector = require('../injector');

const config = {
    packagesPath: __dirname + '/../node_modules/',
    types: {
        managers: {
            path: __dirname + '/../app/managers',
            configs: []
        },

        services: {
            path: __dirname + '/../app/services',
            configs: []
        },

        controllers: {
            path: __dirname + '/../app/controllers',
            configs: []
        }
    },
    routers: {
        main: {
            post: function () {}
        }
    }
};

describe('Deploy application', function () {
    it('Should deploy application', function () {
        const instances = injector(config);

        const testManager = instances['managers'].testManager;
        const testControllerNew = instances['controllers'].testControllerNew;

        assert.ok(testManager);
        assert.ok(testManager.upperCaseRecord);

        assert.ok(testControllerNew._testManagerNew);
        assert.ok(testControllerNew._testServiceNew);
        assert.ok(testControllerNew._testService);
        assert.ok(testControllerNew._assert);
    });
});
