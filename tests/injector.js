"use strict";

const assert = require('assert');

const {Injector} = require('../src/types/blueprint');

describe('Injector tests', function () {
    it('Should inject rest parameters into constructor', function (done) {
        const constructor = function (dep, pkg) {
            assert.ok(dep.isDepInstance);
            assert.ok(pkg.isPkgInstance);

            done();
        };

        const dependencies = [{name: 'dep', instance: {isDepInstance: true}}];
        const packages = [{name: 'pkg', instance: {isPkgInstance: true}}];

        Injector.constructorRestInjection(constructor, dependencies, packages);
    });

    it('Should inject object with parameters into constructor', function (done) {
        const constructor = function ({dep, pkg}) {
            assert.ok(dep.isDepInstance);
            assert.ok(pkg.isPkgInstance);

            done();
        };

        const dependencies = [{name: 'dep', instance: {isDepInstance: true}}];
        const packages = [{name: 'pkg', instance: {isPkgInstance: true}}];

        Injector.constructorObjectInjection(constructor, dependencies, packages);
    });

    it('Should inject into this', function () {
        const constructor = function () {
        };

        const dependencies = [{name: 'dep', instance: {isDepInstance: true}}];
        const packages = [{name: 'pkg', instance: {isPkgInstance: true}}];

        const result = Injector.bodyInjection(constructor, dependencies, packages);

        assert.ok(result.dep.isDepInstance);
        assert.ok(result.pkg.isPkgInstance);
    });
});