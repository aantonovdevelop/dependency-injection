"use strict";

class TestManagerNew {
    constructor(options) {
        this._testService = options.testService;
        this._redis = options.redis;
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