/* @flow */

"use strict";

const assert = require('assert');

const {Blueprint, BlueprintsTable, Dependency, InstancesTable, Package} = require('../src/types/blueprint');

describe('Blueprints', function () {
    let mainBlueprint: Blueprint,
        depBlueprint: Blueprint,
        blueprintTable: BlueprintsTable = new BlueprintsTable(),
        instancesTable: InstancesTable = new InstancesTable();

    it('Should create new blueprint', function () {
        const mainConfig = {
            name: 'main-service',
            type: 'services',
            deployType: 'constructor',
            injectType: 'rest',
            dependencies: [new Dependency(blueprintTable, {name: 'dep-service', type: 'services'})],
            packages: [new Package({name: 'assert', isNative: true})],
            constructor: class {
                constructor(dep, assert) {
                    this.dep = dep;
                    this.assert = assert;
                }
                func () {
                    this.assert.ok(true);

                    return this.dep.get() + 1;
                }
            }
        };

        const depConfig = {
            name: 'dep-service',
            type: 'services',
            deployType: 'constructor',
            injectType: 'body',
            dependencies: [],
            constructor: function () {
                this.get = function () {
                    return 1;
                }
            }
        };

        mainBlueprint = new Blueprint(instancesTable, mainConfig);
        depBlueprint = new Blueprint(instancesTable, depConfig);

        blueprintTable.set(mainConfig.name, mainConfig.type, mainBlueprint);
        blueprintTable.set(depConfig.name, depConfig.type, depBlueprint);

        assert.ok(mainBlueprint);
        assert.ok(depBlueprint);
    });

    it('Should create class instance', function () {
        const mainService = mainBlueprint.create();

        assert.equal(mainService.func(), 2);
    });

    it('Should create instance with dependencies from mock', function () {
        const mainConfig = {
            name: 'main-service',
            type: 'services',
            dependencies: [new Dependency(blueprintTable, {name: 'dep-service', type: 'services'})],
            packages: [new Package({name: 'assert', isNative: true})],
            mock: {
                func: function () {
                    this.assert.ok(true);

                    return this.depService.get() + 1;
                }
            }
        };

        const depConfig = {
            name: 'dep-service',
            type: 'services',
            deployType: 'constructor',
            injectType: 'body',
            dependencies: [],
            constructor: function () {
                this.get = function () {
                    return 1;
                }
            }
        };

        instancesTable = new InstancesTable();

        mainBlueprint = new Blueprint(instancesTable, mainConfig);
        depBlueprint = new Blueprint(instancesTable, depConfig);

        blueprintTable.set(mainConfig.name, mainConfig.type, mainBlueprint);
        blueprintTable.set(depConfig.name, depConfig.type, depBlueprint);

        assert.ok(mainBlueprint);
        assert.ok(depBlueprint);

        const mainService = mainBlueprint.create();

        assert.equal(mainService.func(), 2);
    });
});