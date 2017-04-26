"use strict";

class TestControllerNew {
    constructor(options) {
        this._testManagerNew = options.testManagerNew;
        this._testServiceNew = options.testServiceNew;
        this._testService = options.testService;
        this._assert = options.assert;
    }

    someFunction(req, res) {
        this._assert.ok(this._testManagerNew.directRedisGet);
        this._assert.ok(this._testManagerNew.upperCaseRecord);
        this._assert.ok(this._testServiceNew.getSomeFromCache);
        this._assert.ok(this._testService.callTest2Service);
    }
}

module.exports = TestControllerNew;
