"use strict";

const assert = require('assert');

const ConfigParser = require('../src/parser');

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
                        }],
                        $constructor: function () {}
                    }]
                },

                type_2: {
                    blueprints: [{
                        name: 'type2Component',
                        dependencies: [{
                            name: 'type3Component',
                            type: 'type_3'
                        }],
                        $constructor: function () {}
                    }]
                },

                type_3: {
                    blueprints: [{
                        name: 'type3Component',
                        packages: [{
                            name: 'assert',
                            isNative: true
                        }],
                        $constructor: function () {}
                    }]
                }
            },

            routes: [{
                method: 'post',
                url: '/some/url',
                func: 'type_1.type1Component.somePost'
            }, {
                method: 'get',
                url: '/some/url',
                func: 'type_1.type1Component.someGet'
            }],

            router: {
                get() {},
                post() {}
            }
        };

        let result = ConfigParser.parse(config);

        assert.ok(result.blueprintsTable);
        assert.ok(result.instancesTable);
        assert.ok(result.middlewareTable);
        assert.ok(result.routesTable);

        assert.ok(result.blueprintsTable.get('type1Component', 'type_1'));
        assert.ok(result.blueprintsTable.get('type2Component', 'type_2'));
        assert.ok(result.blueprintsTable.get('type3Component', 'type_3'));

        const fRoute = result.routesTable.get('post_/some/url');
        const sRoute = result.routesTable.get('get_/some/url');

        assert.ok(fRoute);
        assert.ok(sRoute);
    });
});