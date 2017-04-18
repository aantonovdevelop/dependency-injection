"use strict";

const assert = require('assert');

const config = {
    packagesPath: `${__dirname}/../node_modules/`,
    services: [{
        name: 'test-service',
        packages: [{
            name: 'redis',
            mock: {
                isMock: true,
                get: function () {
                    return Promise.resolve('value');
                }
            }
        }]
    }, {
        name: 'test-service-new',
        deployType: 'new',
        packages: [{
            name: 'then-redis',
            instanceName: 'redis',
            mock: {
                isMock: true,
                get: function () {
                    return Promise.resolve('value');
                }
            }
        }]
    }]
};

const injector = require('../injector');

describe("TestService", function () {
    it('Should init service', async function () {
        let testService = injector(config).instantiatedServices.testService;

        let result = await testService.getSomeFromCache();

        assert.equal(result, 'value');
    });

    it('Should get TestServiceNew', async function () {
        let testServiceNew = injector(config).instantiatedServices.testServiceNew;

        let result = await testServiceNew.getSomeFromCache();

        assert.equal(result, 'value');
    });
});