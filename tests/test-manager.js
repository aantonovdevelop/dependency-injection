"use strict";

const assert = require('assert');
const injector = require('../injector');

const config = {
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
    }]
};

describe('TestManager', function () {
    it('Should init manager', async function () {
        let testManager = injector(config).instantiatedManagers.testManager;

        let result = await testManager.upperCaseRecord();

        assert.equal(result, 'LOLOLO');
    });
});