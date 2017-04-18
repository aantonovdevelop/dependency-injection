"use strict";

class TestManagerNew {
    constructor(testService, redis) {
        this._testService = testService;
        this._redis = redis;
    }

    async upperCaseRecord() {
        let str = await this._testService.getSomeFromCache();

        return str.toUpperCase();
    }

    async directRedisGet() {
        return this._redis.get('blahblah');
    }
}

module.exports = TestManagerNew;