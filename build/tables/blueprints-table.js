"use strict";

const Blueprint = require('../blueprint');

class BlueprintsTable {

    constructor() {
        this.table = new Map();
    }

    set(name, type, blueprint) {
        if (!name) throw new Error(`Name of ${type} blueprint is undefined`);else if (!type) throw new Error(`Type of ${name} blueprint is undefined`);else if (!blueprint) throw new Error(`Blueprint of ${name} ${type} is undefined`);

        this.table.set(name + type, blueprint);
    }

    get(name, type) {
        return this.table.get(name + type);
    }

    // $FlowFixMe
    [Symbol.iterator]() {
        return this.table.values();
    }
}

module.exports = BlueprintsTable;