"use strict";

class TestControllerNew {
    constructor(testManagerNew, testServiceNew, testService, assert) {
        this._testManagerNew = testManagerNew;
        this._testServiceNew = testServiceNew;
        this._testService = testService;
        this._assert = assert;
    }

    someFunction(req, res) {
        this._assert.ok(this._testManagerNew.directRedisGet);
        this._assert.ok(this._testManagerNew.upperCaseRecord);
        this._assert.ok(this._testServiceNew.getSomeFromCache);
        this._assert.ok(this._testService.callTest2Service);
    }
}

module.exports = TestControllerNew;
