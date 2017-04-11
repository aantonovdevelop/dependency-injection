"use strict";

const assert = require('assert');

const config = {
    services: [{
        name: "test-service",
        packages: [{
            name: 'redis',
            mock: {
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
});