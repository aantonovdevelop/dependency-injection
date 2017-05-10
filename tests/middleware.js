"use strict";

const assert = require('assert');

const injector = require('../injector');

const config = {
    types: {
        controllers: {
            configs: [{
                name: 'controller',
                mock: {
                    some: function (req, res) {
                        console.log(req, res);
                    }
                },

                dependencies: {
                    middleware: [{
                        name: 'authorization'
                    }]
                },

                routes: [{
                    router: 'main',
                    type: 'post',
                    url: '/some',
                    method: 'some',
                    middlewares: [{
                        name: 'authorization',
                        func: 'authorization'
                    }]
                }]
            }]
        },

        middleware: {
            configs: [{
                name: 'authorization',
                mock: {
                    authorization: function (req, res, next) {
                        next(req + 1, res + 1);
                    }
                }
            }]
        }
    }
};

describe('Middleware injection', function () {
    it('Should inject middleware into controller', function () {
        let router = {
            post: function () {
                console.dir(arguments);
            }
        };

        const result = injector(config, {main: router});

        assert.ok(result);
    });
});