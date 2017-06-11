"use strict";

const Route = require('../components/route');

class RoutesTable {

    constructor() {
        this.table = new Map();
    }

    set(name, route) {
        if (!name) throw new Error(`Name of route is undefined`);

        this.table.set(route.getName(), route);
    }

    get(name) {
        return this.table.get(name);
    }

    // $FlowFixMe
    [Symbol.iterator]() {
        return this.table.values();
    }
}

module.exports = RoutesTable;