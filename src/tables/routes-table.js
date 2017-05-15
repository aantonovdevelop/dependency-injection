// @flow

"use strict";

const Route = require('../components/route');

class RoutesTable {
    table: Map<string, Route>;

    constructor() {
        this.table = new Map();
    }

    set(name: string, route: Route): void {
        if (!name) throw new Error(`Name of route is undefined`);

        this.table.set(route.getName(), route);
    }

    get(name: string): Route {
        return ((this.table.get(name): any): Route);
    }

    // $FlowFixMe
    [Symbol.iterator]() {
        return this.table.values();
    }
}

module.exports = RoutesTable;
