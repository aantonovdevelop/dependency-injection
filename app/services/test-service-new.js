"use strict";

class TestServiceNew {
    constructor ({redis}) {
        this._redis = redis;
    }

    async getSomeFromCache() {
        return this._redis.get('blahblah');
    }
}

module.exports = TestServiceNew;