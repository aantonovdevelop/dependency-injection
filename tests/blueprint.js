/* @flow */

"use strict";

const assert = require('assert');

const {Blueprint, BlueprintsTable, Dependency, InstancesTable, Package} = require('../src/types/blueprint');

describe('Blueprints', function () {
    let mainBlueprint: Blueprint,
        depBlueprint: Blueprint,
        blueprintTable: BlueprintsTable = new BlueprintsTable(),
        instancesTable: InstancesTable = new InstancesTable();

    const mainConfig = {
        name: 'main-service',
        type: 'services',
        deployType: 'new',
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
        deployType: 'new',
        dependencies: [],
        constructor: function () {
            this.get = function () {
                return 1;
            }
        }
    };

    it('Should create new blueprint', function () {
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
});