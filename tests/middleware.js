"use strict";

const assert = require('assert');

const describe = require('mocha').describe;
const it = require('mocha').it;

const Middleware = require('../src/components/middleware');
const InstancesTable = require('../src/tables/instances-table');
const MiddlewareTable = require('../src/tables/middleware-table');

describe('Middleware', function () {
    let mw1, mw2, mw3 = null;

    const testurl1 = 'testurl1';
    const testurl2 = 'testurl2';

    it('Should create middleware', function () {

        mw1 = new Middleware(new InstancesTable, {
            name: 'mw1',
            component: {
                type: 'type_1',
                name: 'type1Component',
                func: 'some'
            },
            except: [],
            only: []
        });

        mw2 = new Middleware(new InstancesTable, {
            name: 'mw2',
            component: {
                type: 'type_1',
                name: 'type1Component',
                func: 'some'
            },
            except: [testurl1],
            only: []
        });

        mw3 = new Middleware(new InstancesTable, {
            name: 'mw3',
            component: {
                type: 'type_1',
                name: 'type1Component',
                func: 'some'
            },
            except: [],
            only: [testurl2]
        });

        assert.ok(mw1.isCorrectForUrl(testurl1));
        assert.ok(mw1.isCorrectForUrl(testurl2));
        assert.ok(!mw2.isCorrectForUrl(testurl1));
        assert.ok(mw2.isCorrectForUrl(testurl2));
        assert.ok(mw3.isCorrectForUrl(testurl2));
        assert.ok(!mw3.isCorrectForUrl(testurl1));
    });

    it('Should create MiddlewareTable', function () {
        const middlewareTable = new MiddlewareTable();

        middlewareTable.set(mw1.getName(), mw1);
        middlewareTable.set(mw2.getName(), mw2);
        middlewareTable.set(mw3.getName(), mw3);

        const forTestUrl1 = middlewareTable.getForUrl(testurl1);
        const forTestUrl2 = middlewareTable.getForUrl(testurl2);

        assert.equal(forTestUrl1.length, 1);
        assert.equal(forTestUrl2.length, 3);
    });
});
