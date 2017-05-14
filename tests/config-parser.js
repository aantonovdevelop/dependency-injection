"use strict";

const assert = require('assert');

const { ConfigParser } = require('../src/types/blueprint');

describe('ConfigParser', function () {
    it('Should parse raw config', function () {
        const config = {
            types: {
                type_1: {
                    blueprints: [{
                        name: 'type1Component',
                        packages: [{
                            name: 'assert',
                            isNative: true
                        }],
                        dependencies: [{
                            name: 'type2Component',
                            type: 'type_2'
                        }]
                    }]
                },

                type_2: {
                    blueprints: [{
                        name: 'type2Component',
                        dependencies: [{
                            name: 'type3Component',
                            type: 'type_3'
                        }]
                    }]
                },

                type_3: {
                    blueprints: [{
                        name: 'type3Component',
                        packages: [{
                            name: 'assert',
                            isNative: true
                        }]
                    }]
                }
            }
        };

        let result = ConfigParser.parse(config);

        assert.ok(result.blueprintsTable);
        assert.ok(result.instanceTable);

        assert.ok(result.blueprintsTable.get('type1Component', 'type_1'));
        assert.ok(result.blueprintsTable.get('type2Component', 'type_2'));
        assert.ok(result.blueprintsTable.get('type3Component', 'type_3'));
    });
});