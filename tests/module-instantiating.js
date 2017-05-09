"use strict";

const assert = require('assert');
const injector = require('../injector');

const config = {
    types: {
        services: {
            path: './tests/mocks/services'
        },

        managers: {
            path: './tests/mocks/managers',
            configs: [{
                name: 'test-flow-manager',
                deployType: 'flow',
                dependencies: {
                    services: [{
                        name: 'test-service'
                    }]
                }
            }]
        }
    }
};

describe('Instantiation types testing', function () {
    it('Should instantiate flow type', async function () {
        const instances = injector(config);

        const result = await instances['managers'].testFlowManager.someFunction();

        assert.equal(result, 'value');
    });
});