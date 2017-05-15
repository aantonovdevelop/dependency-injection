"use strict";

const assert = require('assert');

const Injector = require('../src/injector');

describe('Injector tests', function () {
    it('Should inject rest parameters into constructor', function (done) {
        const constructor = function (dep, pkg) {
            assert.ok(dep.isDepInstance);
            assert.ok(pkg.isPkgInstance);

            done();
        };

        const dependencies = [{name: 'dep', instance: {isDepInstance: true}}];
        const packages = [{name: 'pkg', instance: {isPkgInstance: true}}];

        Injector.constructorRestInjection(constructor, [...dependencies, ...packages]);
    });

    it('Should inject object with parameters into constructor', function (done) {
        const constructor = function ({dep, pkg}) {
            assert.ok(dep.isDepInstance);
            assert.ok(pkg.isPkgInstance);

            done();
        };

        const dependencies = [{name: 'dep', instance: {isDepInstance: true}}];
        const packages = [{name: 'pkg', instance: {isPkgInstance: true}}];

        Injector.constructorObjectInjection(constructor, [...dependencies, ...packages]);
    });

    it('Should inject into this', function () {
        const constructor = function () {
        };

        const dependencies = [{name: 'dep', instance: {isDepInstance: true}}];
        const packages = [{name: 'pkg', instance: {isPkgInstance: true}}];

        const result = Injector.constructorBodyInjection(constructor, [...dependencies, ...packages]);

        assert.ok(result.dep.isDepInstance);
        assert.ok(result.pkg.isPkgInstance);
    });

    it('Should inject into mock', function () {
        const dependencies = [{name: 'dep', instance: {isDepInstance: true}}];
        const packages = [{name: 'pkg', instance: {isPkgInstance: true}}];

        const result = Injector.mockBodyInjection({}, [...dependencies, ...packages]);

        assert.ok(result.dep.isDepInstance);
        assert.ok(result.pkg.isPkgInstance);
    });

    it('Should inject into this of function result', function () {
        const constructor = function () {
            return {};
        };

        const dependencies = [{name: 'dep', instance: {isDepInstance: true}}];
        const packages = [{name: 'pkg', instance: {isPkgInstance: true}}];

        const result = Injector.functionBodyInjection(constructor, [...dependencies, ...packages]);

        assert.ok(result.dep.isDepInstance);
        assert.ok(result.pkg.isPkgInstance);
    });

    it('Should inject into clojure of function result', function () {
        const constructor = function (dep, pkg) {
            return {
                isDepInstance: function () {
                    return dep.isDepInstance;
                },

                isPkgInstance: function () {
                    return pkg.isPkgInstance;
                }
            };
        };

        const dependencies = [{name: 'dep', instance: {isDepInstance: true}}];
        const packages = [{name: 'pkg', instance: {isPkgInstance: true}}];

        const result = Injector.functionClojureRestInjection(constructor, [...dependencies, ...packages]);

        assert.ok(result.isDepInstance());
        assert.ok(result.isPkgInstance());
    });

    it('Should inject object into clojure of function result', function () {
        const constructor = function ({dep, pkg}) {
            return {
                isDepInstance: function () {
                    return dep.isDepInstance;
                },

                isPkgInstance: function () {
                    return pkg.isPkgInstance;
                }
            };
        };

        const dependencies = [{name: 'dep', instance: {isDepInstance: true}}];
        const packages = [{name: 'pkg', instance: {isPkgInstance: true}}];

        const result = Injector.functionClojureObjectInjection(constructor, [...dependencies, ...packages]);

        assert.ok(result.isDepInstance());
        assert.ok(result.isPkgInstance());
    })
});