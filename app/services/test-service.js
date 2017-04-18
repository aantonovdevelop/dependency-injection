"use strict";

class TestService {
    async getSomeFromCache() {
       return this.redis.get('blahblah');
    }

    async callTest2Service() {
        return this.testService2.isTestService2();
    }
}

module.exports = () => new TestService();