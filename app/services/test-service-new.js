"use strict";

class TestServiceNew {
    constructor (options) {
        this._redis = options.redis;
    }

    async getSomeFromCache() {
        return this._redis.get('blahblah');
    }
}

module.exports = TestServiceNew;