/* @flow */

"use strict";

interface TestService {
    getValue(key: string) : Promise<string>
}

class TestFlowManager {
    _testService: TestService;

    someFunction() {
        return this._testService.getValue();
    }
}

module.exports = TestFlowManager;