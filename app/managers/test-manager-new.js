"use strict";

class TestManagerNew {
    constructor(options) {
        this._testServiceNew = options.testServiceNew;
        this._redis = options.redis;
    }

    async upperCaseRecord() {
        let str = await this._testServiceNew.getSomeFromCache();

        return str.toUpperCase();
    }

    async directRedisGet() {
        return this._redis.get('blahblah');
    }
}

module.exports = TestManagerNew;