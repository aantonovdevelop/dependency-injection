"use strict";

class TestManager {
    async upperCaseRecord() {
        let str = await this.testService.getSomeFromCache();

        return str.toUpperCase();
    }
}

module.exports = () => new TestManager();