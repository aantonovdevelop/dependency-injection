"use strict";

const assert = require('assert');

const { Factory } = require('../src/types/blueprint');

describe('Factory', function () {
    it('Should create instances of described classes', function () {
        const config = {
            types: {
                type_1: {
                    blueprints: [{
                        name: 'type1Component',
                        deployType: 'constructor',
                        injectType: 'rest',
                        packages: [{
                            name: 'assert',
                            isNative: true
                        }],
                        dependencies: [{
                            name: 'type2Component',
                            type: 'type_2'
                        }],
                        constructor: function () {
                            this.isInstanceOf = () => 'type1Component';
                        }
                    }]
                },

                type_2: {
                    blueprints: [{
                        name: 'type2Component',
                        deployType: 'constructor',
                        injectType: 'rest',
                        dependencies: [{
                            name: 'type3Component',
                            type: 'type_3'
                        }],
                        constructor: function () {
                            this.isInstanceOf = () => 'type2Component';
                        }
                    }]
                },

                type_3: {
                    blueprints: [{
                        name: 'type3Component',
                        deployType: 'constructor',
                        injectType: 'rest',
                        packages: [{
                            name: 'assert',
                            isNative: true
                        }],
                        constructor: function (assert) {
                            this.isInstanceOf = () => 'type3Component';
                            this.checkDependencies = () => assert.ok(assert);
                        }
                    }]
                }
            }
        };

        const instances = Factory.create(config);

        assert.ok(instances);

        assert.equal(instances.get('type1Component', 'type_1').isInstanceOf(), 'type1Component');
        assert.equal(instances.get('type2Component', 'type_2').isInstanceOf(), 'type2Component');
        assert.equal(instances.get('type3Component', 'type_3').isInstanceOf(), 'type3Component');

        instances.get('type3Component', 'type_3').checkDependencies();
    });
});