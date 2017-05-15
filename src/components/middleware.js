// @flow

"use strict";

const InstancesTable = require('../tables/instances-table');

class Middleware implements IComponent {
    options: TMiddleware;
    instTable: InstancesTable;

    constructor(instTable: InstancesTable, options: TMiddleware) {
        this.instTable = instTable;
        this.options = options;
    }

    create(): Function {
        const middleware: Object | Function = (this.options.component.func)
            ? this.instTable.get(this.options.component.name, this.options.component.type)[this.options.component.func]
            : this.instTable.get(this.options.component.name, this.options.component.type);

        if (middleware instanceof Function) {
            return middleware;
        } else {
            throw new Error(`Middleware ${this.options.name} should be a function`);
        }
    }

    getName() {
        return this.options.name;
    }

    isCorrectForUrl(url: string): boolean {
        if (this.options.only && this.options.only.length) {
            // $FlowFixMe url should be an Object
            return this.options.only.includes(url);
        } else {
            // $FlowFixMe url should be an Object
            return !(this.options.except || []).includes(url);
        }
    }
}

module.exports = Middleware;
