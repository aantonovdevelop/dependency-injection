"use strict";

class TestController {
    constructor() {}

    someFunction(req, res) {
        this.assert.ok(this.testManagerNew.directRedisGet);
        this.assert.ok(this.testManagerNew.upperCaseRecord);
        this.assert.ok(this.testServiceNew.getSomeFromCache);
        this.assert.ok(this.testService.callTest2Service);
    }
}

module.exports = () => {return new TestController()};
