// @flow

"use strict";

const Middleware = require('../components/middleware');

class MiddlewareTable {
    table: Map<string, Middleware>;

    constructor() {
        this.table = new Map();
    }

    set(name: string, middleware: Middleware): void {
        if (!name) throw new Error(`Name of middleware is undefined`);

        this.table.set(name, middleware);
    }

    get(name: string): Middleware {
        return ((this.table.get(name): any): Middleware);
    }

    getForUrl(url: string): Array<Middleware> {
        const middleware: Array<Middleware> = [];

        for (const mw: Middleware of this.table.values()) {
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
