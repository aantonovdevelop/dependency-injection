"use strict";

const Middleware = require('../components/middleware');

class MiddlewareTable {

    constructor() {
        this.table = new Map();
    }

    set(name, middleware) {
        if (!name) throw new Error(`Name of middleware is undefined`);

        this.table.set(name, middleware);
    }

    get(name) {
        return this.table.get(name);
    }

    getForUrl(url) {
        const middleware = [];

        for (const mw of this.table.values()) {
            mw.isCorrectForUrl(url) ? middleware.push(mw) : null;
        }

        return middleware;
    }

    // $FlowFixMe
    [Symbol.iterator]() {
        return this.table.entries();
    }
}

module.exports = MiddlewareTable;