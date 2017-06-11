"use strict";

class InstancesTable {

    constructor() {
        this.table = new Map();
    }

    set(name, type, instance) {
        if (!name) throw new Error(`Name of ${type} instance is undefined`);else if (!type) throw new Error(`Type of ${name} instance is undefined`);else if (!instance) throw new Error(`Instance of ${name} ${type} is undefined`);

        this.table.set(name + type, instance);
    }

    get(name, type) {
        return this.table.get(name + type);
    }

    has(name, type) {
        return this.table.has(name + type);
    }
}

module.exports = InstancesTable;