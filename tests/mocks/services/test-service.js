"use strict";

class TestService {
    getValue() {
        return Promise.resolve('value');
    }
}

module.exports = TestService;