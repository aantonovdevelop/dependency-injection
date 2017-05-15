// @flow

"use strict";

class InstancesTable {
    table: Map<string, Object>;

    constructor() {
        this.table = new Map();
    }

    set(name: string, type: string, instance: Object | Function): void {
        if (!name) throw new Error(`Name of ${type} instance is undefined`);
        else if (!type) throw new Error(`Type of ${name} instance is undefined`);
        else if (!instance) throw new Error(`Instance of ${name} ${type} is undefined`);

        this.table.set(name + type, instance);
    }

    get(name: string, type: string): Object {
        return ((this.table.get(name + type): any): Object);
    }

    has(name: string, type: string): boolean {
        return this.table.has(name + type);
    }
}

module.exports = InstancesTable;
