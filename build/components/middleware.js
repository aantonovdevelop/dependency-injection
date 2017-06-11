"use strict";

const InstancesTable = require('../tables/instances-table');

class Middleware {

    constructor(instTable, options) {
        this.instTable = instTable;
        this.options = options;
    }

    create() {
        const middleware = this.options.component.func ? this.instTable.get(this.options.component.name, this.options.component.type)[this.options.component.func] : this.instTable.get(this.options.component.name, this.options.component.type);

        if (middleware instanceof Function) {
            return middleware;
        } else {
            throw new Error(`Middleware ${this.options.name} should be a function`);
        }
    }

    getName() {
        return this.options.name;
    }

    isCorrectForUrl(url) {
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