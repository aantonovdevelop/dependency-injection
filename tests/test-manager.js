"use strict";

const assert = require('assert');
const injector = require('../injector');

const config = {
    packagesPath: `${__dirname}/../node_modules/`,
    managers: [{
        name: 'test-manager',
        services: [{
            name: 'test-service',
            mock: {
                async getSomeFromCache() {
                    return "lololo";
                }
            }
        }]
    }, {
        name: 'test-manager-new',
        deployType: 'new',
        services: [{
            name: 'test-service',
            mock: {
                async getSomeFromCache() {
                    return "lololo";
                }
            }
        }],
        packages: [{
            name: 'then-redis',
            mock: {
                instanceName: 'redis',
                async get() {
                    return Promise.resolve('value');
                }
            }
        }]
    }]
};

describe('TestManager', function () {
    let instances = injector(config);

    it('Should init manager', async function () {
        let testManager = instances.instantiatedManagers.testManager;

        let result = await testManager.upperCaseRecord();

        assert.equal(result, 'LOLOLO');

    });

    it('Should init manager with new keyword', async function () {
        let testManagerNew = instances.instantiatedManagers.testManagerNew;

        let result = await testManagerNew.upperCaseRecord();

        assert.equal(result, 'LOLOLO');

        result = await testManagerNew.directRedisGet();

        assert.equal(result, 'value');
    });
});